import logging

from fastapi import APIRouter, HTTPException, Request, Response, status

from auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserPublic,
)
from auth.security import (
    cookie_max_age_seconds,
    cookie_name,
    cookie_samesite,
    cookie_secure,
    create_access_token,
    frontend_urls,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    reset_token_expires_at,
    verify_password,
)
from auth.store import (
    create_password_reset,
    create_user,
    find_user_by_email,
    find_valid_reset,
    mark_reset_used,
    update_user_password,
    user_public_from_doc,
)
from utils.email import send_password_reset_email

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    password_hash = hash_password(payload.password)

    try:
        doc = create_user(username=payload.username.strip(), email=payload.email, password_hash=password_hash)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e

    return user_public_from_doc(doc)


@router.post("/login", response_model=UserPublic)
def login(payload: LoginRequest, response: Response):
    user = find_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user_id=str(user["_id"]), remember_me=payload.remember_me)

    response.set_cookie(
        key=cookie_name(),
        value=token,
        httponly=True,
        secure=cookie_secure(),
        samesite=cookie_samesite(),
        max_age=cookie_max_age_seconds(remember_me=payload.remember_me),
        path="/",
    )

    return user_public_from_doc(user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=cookie_name(), path="/")
    return {"ok": True}


@router.get("/me", response_model=UserPublic)
def get_current_user(request: Request):
    """Get current authenticated user."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    # Always return a generic response so we don't reveal whether an email is registered.
    generic_response = {"message": "If that email exists, a password reset link has been sent."}

    user = find_user_by_email(payload.email)
    if not user:
        # Server-side only: the response stays generic, but this makes "no such user" visible in logs.
        logger.warning("Password reset requested for unregistered email: %s", payload.email.strip().lower())
        return generic_response

    token = generate_reset_token()
    create_password_reset(
        user_id=str(user["_id"]),
        token_hash=hash_reset_token(token),
        expires_at=reset_token_expires_at(),
    )

    reset_links = [f"{base}/reset-password?token={token}" for base in frontend_urls()]

    try:
        send_password_reset_email(user["email"], reset_links)
    except Exception:
        logger.exception("Failed to send password reset email to %s", user["email"])

    return generic_response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    token_hash = hash_reset_token(payload.token)
    record = find_valid_reset(token_hash)
    if not record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")

    update_user_password(record["user_id"], hash_password(payload.new_password))
    mark_reset_used(token_hash)

    return {"message": "Password updated successfully"}

import hashlib
import os
import secrets
import socket
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext


# NOTE:
# - bcrypt can be problematic on some Windows setups depending on package versions.
# - bcrypt also has a 72-byte password limit.
# pbkdf2_sha256 is reliable cross-platform and avoids the bcrypt length limit.
_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class AuthConfigError(RuntimeError):
    pass


def _jwt_secret() -> str:
    secret = os.getenv("AUTH_JWT_SECRET")
    if not secret:
        raise AuthConfigError("AUTH_JWT_SECRET is not set")
    return secret


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _pwd_context.verify(password, password_hash)


def _token_expire_minutes(remember_me: bool = False) -> int:
    if remember_me:
        return int(os.getenv("AUTH_REMEMBER_ME_EXPIRE_MINUTES", "43200"))  # 30 days
    return int(os.getenv("AUTH_TOKEN_EXPIRE_MINUTES", "60"))


def create_access_token(*, user_id: str, remember_me: bool = False) -> str:
    minutes = _token_expire_minutes(remember_me)
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=minutes)).timestamp()),
    }

    return jwt.encode(payload, _jwt_secret(), algorithm="HS256")


def decode_access_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, _jwt_secret(), algorithms=["HS256"])


def cookie_name() -> str:
    return os.getenv("AUTH_COOKIE_NAME", "session")


def cookie_secure() -> bool:
    return os.getenv("COOKIE_SECURE", "false").strip().lower() in {"1", "true", "yes"}


def cookie_samesite() -> str:
    value = os.getenv("COOKIE_SAMESITE", "lax").strip().lower()
    if value not in {"lax", "strict", "none"}:
        return "lax"
    return value


def cookie_max_age_seconds(remember_me: bool = False) -> Optional[int]:
    """
    Seconds until the cookie expires, or None for a browser-session cookie
    (cleared when the browser closes) — used when "remember me" is off.
    The JWT itself always carries its own expiry as a hard server-side cap.
    """
    if not remember_me:
        return None
    minutes = _token_expire_minutes(remember_me=True)
    return max(60, minutes * 60)


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _lan_ip() -> Optional[str]:
    """This machine's current LAN IP (it changes with DHCP, so it's detected rather than configured)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("10.255.255.255", 1))  # UDP connect sends nothing; it just picks the outgoing interface
            ip = sock.getsockname()[0]
        return None if ip.startswith("127.") else ip
    except OSError:
        return None


def frontend_urls() -> list[str]:
    """
    Frontend base URLs for links sent in emails: localhost, this machine's auto-detected LAN IP
    (so the link survives DHCP changes), then anything in FRONTEND_URL (comma-separated, e.g. a public https URL).
    """
    urls = ["http://localhost:5173"]
    lan_ip = _lan_ip()
    if lan_ip:
        urls.append(f"http://{lan_ip}:5173")
    for url in os.getenv("FRONTEND_URL", "").split(","):
        url = url.strip().rstrip("/")
        if url and url not in urls:
            urls.append(url)
    return urls


def reset_token_expires_at() -> datetime:
    minutes = int(os.getenv("PASSWORD_RESET_EXPIRE_MINUTES", "30"))
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)

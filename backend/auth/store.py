from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

from utils.db import get_db


def users_collection() -> Collection:
    return get_db()["users"]


def password_resets_collection() -> Collection:
    return get_db()["password_resets"]


def ensure_indexes() -> None:
    col = users_collection()
    col.create_index("email", unique=True)
    col.create_index("username", unique=True)

    resets = password_resets_collection()
    resets.create_index("token_hash", unique=True)
    resets.create_index("expires_at", expireAfterSeconds=0)


def user_public_from_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "email": doc["email"],
    }


def create_user(*, username: str, email: str, password_hash: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    doc = {
        "username": username,
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "created_at": now,
    }

    try:
        res = users_collection().insert_one(doc)
    except DuplicateKeyError as e:
        raise ValueError("User already exists") from e

    doc["_id"] = res.inserted_id
    return doc


def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return users_collection().find_one({"email": email.lower().strip()})


def find_user_public_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None

    doc = users_collection().find_one({"_id": oid}, {"password_hash": 0})
    if not doc:
        return None
    return user_public_from_doc(doc)


def update_user_password(user_id: str, password_hash: str) -> None:
    users_collection().update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"password_hash": password_hash}}
    )


def create_password_reset(*, user_id: str, token_hash: str, expires_at: datetime) -> None:
    # Invalidate any previous outstanding reset tokens for this user.
    password_resets_collection().delete_many({"user_id": user_id})
    password_resets_collection().insert_one(
        {
            "user_id": user_id,
            "token_hash": token_hash,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.now(timezone.utc),
        }
    )


def find_valid_reset(token_hash: str) -> Optional[Dict[str, Any]]:
    return password_resets_collection().find_one(
        {
            "token_hash": token_hash,
            "used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        }
    )


def mark_reset_used(token_hash: str) -> None:
    password_resets_collection().update_one(
        {"token_hash": token_hash}, {"$set": {"used": True}}
    )

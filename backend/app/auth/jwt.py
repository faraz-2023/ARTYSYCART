"""
JWT token creation and verification utilities.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = settings.JWT_ALGORITHM


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(subject: str | Any, extra_claims: dict | None = None) -> str:
    """
    Creates a short-lived JWT access token.

    :param subject: Usually the user's UUID as a string.
    :param extra_claims: Optional additional payload claims.
    """
    expire = _now_utc() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict = {
        "sub": str(subject),
        "exp": expire,
        "iat": _now_utc(),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str | Any) -> str:
    """Creates a long-lived JWT refresh token."""
    expire = _now_utc() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict = {
        "sub": str(subject),
        "exp": expire,
        "iat": _now_utc(),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decodes and validates a JWT token.
    Raises ``JWTError`` if the token is invalid or expired.
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])


def verify_token_type(payload: dict, expected_type: str) -> bool:
    return payload.get("type") == expected_type

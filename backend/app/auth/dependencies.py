"""
FastAPI security dependencies for protected routes.
"""
import uuid
import httpx
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import decode_token, verify_token_type
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User, UserRole
from app.services.user import user_service
from app.services.base import BaseService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user_id(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    """
    Validates the access token and returns the subject (user UUID).
    Supports both the project's JWTs and Supabase access tokens.
    If the token is a Supabase JWT, looks up or auto-creates a local user mapped
    to the Supabase user id and returns the local user's UUID.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # First, try the project's own JWT validation (fast-path)
    try:
        payload = decode_token(token)
        if not verify_token_type(payload, "access"):
            raise credentials_exception
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        return uuid.UUID(user_id_str)
    except Exception:
        # Fall through to attempt Supabase-based validation
        pass

    # If SUPABASE_URL is not configured we cannot validate Supabase tokens
    if not settings.SUPABASE_URL:
        raise credentials_exception

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"},
            )
        if resp.status_code != 200:
            raise credentials_exception
        user_json = resp.json()
        supabase_id = user_json.get("id")
        if not supabase_id:
            raise credentials_exception

        # Look up a local user with this supabase_id
        result_user = await user_service.get_by_supabase_id(db, supabase_id)
        if result_user:
            return result_user.id

        # Auto-create a local user record mapped to the Supabase identity
        # Use available metadata where possible; set a random hashed_password since
        # authentication is managed by Supabase.
        metadata = user_json.get("user_metadata") or {}
        email = user_json.get("email") or f"{supabase_id}@supabase"
        username = (metadata.get("username") or email.split("@")[0]).lower()
        full_name = metadata.get("full_name") or username
        profile_image = metadata.get("profile_image") or None

        # Make sure username/email uniqueness is handled; append short token if conflicts
        base_username = username
        counter = 0
        while await user_service.username_exists(db, username):
            counter += 1
            username = f"{base_username}{counter}"

        # Similarly for email collisions (unlikely), append +supabase id slice
        base_email = email
        counter = 0
        while await user_service.email_exists(db, email):
            counter += 1
            email = f"{base_email}+{supabase_id[:6]}"

        new_user_data = {
            "email": email,
            "username": username,
            "full_name": full_name,
            "hashed_password": secrets.token_hex(32),
            "is_verified": True,
            "profile_image": profile_image,
            "supabase_id": supabase_id,
        }
        new_user = await user_service.create(db, new_user_data)
        return new_user.id
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception


async def get_current_user(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Returns the full User object for the authenticated request."""
    from app.services.user import user_service  # local import to avoid circular deps

    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )
    return user


def require_roles(*roles: UserRole):
    """
    Dependency factory for role-based access control.

    Usage::

        @router.get("/admin-only")
        async def admin_only(user: User = Depends(require_roles(UserRole.admin))):
            ...
    """
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return current_user
    return _check

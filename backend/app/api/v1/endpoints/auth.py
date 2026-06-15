"""
Authentication endpoints:
  POST /auth/register
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout
  GET  /auth/me
"""
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)
from app.auth.password import verify_password
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
)
from app.schemas.base import MessageResponse
from app.schemas.user import UserCreate, UserRead
from app.services.user import user_service
from app.utils.exceptions import ConflictException, UnauthorizedException

router = APIRouter()


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    # Uniqueness checks
    if await user_service.email_exists(db, payload.email):
        raise ConflictException("An account with this email already exists.")
    if await user_service.username_exists(db, payload.username):
        raise ConflictException("This username is already taken.")

    user = await user_service.create_user(db, payload.model_dump())

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra_claims={"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
    )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email and password",
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await user_service.get_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra_claims={"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
    )


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------
@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Obtain a new access token using a refresh token",
)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
    )
    try:
        decoded = decode_token(payload.refresh_token)
        if not verify_token_type(decoded, "refresh"):
            raise credentials_exception
        user_id: str | None = decoded.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    import uuid
    user = await user_service.get_by_id(db, uuid.UUID(user_id))
    if not user or not user.is_active:
        raise credentials_exception

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra_claims={"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
    )


# ---------------------------------------------------------------------------
# Logout  (stateless JWT — client just discards tokens)
# ---------------------------------------------------------------------------
@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Invalidate the current session (client-side)",
)
async def logout(_: User = Depends(get_current_user)) -> MessageResponse:
    # With stateless JWTs the server has nothing to invalidate.
    # Production improvement: add the jti to a Redis denylist here.
    return MessageResponse(message="Logged out successfully.")


# ---------------------------------------------------------------------------
# Me
# ---------------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserRead,
    summary="Return the authenticated user's profile",
)
async def me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


# ---------------------------------------------------------------------------
# Forgot password (stub — email delivery added in a future iteration)
# ---------------------------------------------------------------------------
@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset link",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    # Always return 200 to avoid user-enumeration attacks
    user = await user_service.get_by_email(db, payload.email)
    if user:
        # TODO: generate a signed reset token and dispatch an email
        pass
    return MessageResponse(message="If that email exists, a reset link has been sent.")

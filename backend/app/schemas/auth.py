"""
Auth-specific Pydantic schemas.
"""
from pydantic import EmailStr, Field

from app.schemas.base import AppBaseModel


class LoginRequest(AppBaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(AppBaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(AppBaseModel):
    refresh_token: str


class ForgotPasswordRequest(AppBaseModel):
    email: EmailStr


class ResetPasswordRequest(AppBaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

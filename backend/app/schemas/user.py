"""
User Pydantic schemas — request / response contracts.
"""
import uuid
from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.models.user import UserRole
from app.schemas.base import AppBaseModel


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------
class UserBase(AppBaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=150)


# ---------------------------------------------------------------------------
# Create (registration input)
# ---------------------------------------------------------------------------
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.buyer

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, hyphens, and underscores.")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        return v


# ---------------------------------------------------------------------------
# Read (API response — never exposes hashed_password)
# ---------------------------------------------------------------------------
class UserRead(AppBaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    profile_image: str | None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Update (partial, all fields optional)
# ---------------------------------------------------------------------------
class UserUpdate(AppBaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    profile_image: str | None = None

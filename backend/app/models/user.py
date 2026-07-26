"""
User model — core entity for buyers, sellers, and admins.
"""
import enum
import uuid

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    buyer = "buyer"
    seller = "seller"
    admin = "admin"


class User(BaseModel):
    __tablename__ = "users"

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # ------------------------------------------------------------------
    # Role & status
    # ------------------------------------------------------------------
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), default=UserRole.buyer, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ------------------------------------------------------------------
    # Profile
    # ------------------------------------------------------------------
    profile_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Supabase user id (if user registered via Supabase)
    supabase_id: Mapped[str | None] = mapped_column(String(128), unique=True, index=True, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email} role={self.role}>"

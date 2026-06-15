"""
UserService — handles all user-related database operations.
"""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password import hash_password
from app.models.user import User
from app.services.base import BaseService


class UserService(BaseService[User]):
    model = User

    # ------------------------------------------------------------------
    # Lookups
    # ------------------------------------------------------------------
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(
            select(User).where(User.username == username.lower())
        )
        return result.scalar_one_or_none()

    async def email_exists(self, db: AsyncSession, email: str) -> bool:
        return await self.get_by_email(db, email) is not None

    async def username_exists(self, db: AsyncSession, username: str) -> bool:
        return await self.get_by_username(db, username) is not None

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------
    async def create_user(self, db: AsyncSession, data: dict[str, Any]) -> User:
        """Hashes the plain-text password before persisting."""
        plain_password = data.pop("password")
        data["hashed_password"] = hash_password(plain_password)
        data["email"] = data["email"].lower()
        data["username"] = data["username"].lower()
        return await self.create(db, data)

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------
    async def set_active(self, db: AsyncSession, user: User, *, active: bool) -> User:
        return await self.update(db, user, {"is_active": active})

    async def set_verified(self, db: AsyncSession, user: User) -> User:
        return await self.update(db, user, {"is_verified": True})


user_service = UserService()

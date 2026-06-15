"""
Generic CRUD base service.
Feature services extend this to avoid boilerplate.
"""
from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

ModelT = TypeVar("ModelT", bound=BaseModel)


class BaseService(Generic[ModelT]):
    """
    Provides generic async CRUD operations.

    Usage::

        class UserService(BaseService[User]):
            model = User

        user_service = UserService()
        user = await user_service.get_by_id(db, some_uuid)
    """

    model: type[ModelT]

    async def get_by_id(self, db: AsyncSession, id: UUID) -> ModelT | None:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, *, offset: int = 0, limit: int = 20) -> list[ModelT]:
        result = await db.execute(select(self.model).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: dict[str, Any]) -> ModelT:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, db_obj: ModelT, obj_in: dict[str, Any]
    ) -> ModelT:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, db_obj: ModelT) -> None:
        await db.delete(db_obj)
        await db.flush()

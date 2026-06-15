"""
Shared Pydantic schema utilities.
"""
import uuid
from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class AppBaseModel(BaseModel):
    """
    Base Pydantic model with shared configuration.
    All request / response schemas should inherit from this.
    """

    model_config = ConfigDict(
        from_attributes=True,      # allows .model_validate(orm_obj)
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class TimestampSchema(AppBaseModel):
    """Adds audit timestamps for read schemas."""

    created_at: datetime
    updated_at: datetime


class IDSchema(AppBaseModel):
    """Adds UUID id for read schemas."""

    id: uuid.UUID


class PaginatedResponse(AppBaseModel, Generic[T]):
    """Generic paginated list response."""

    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class MessageResponse(AppBaseModel):
    """Generic success message."""

    message: str

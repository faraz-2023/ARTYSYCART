"""
Pagination helpers for list endpoints.
"""
import math
from dataclasses import dataclass
from typing import TypeVar

from fastapi import Query
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.base import PaginatedResponse

T = TypeVar("T")


@dataclass
class PaginationParams:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def pagination_params(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
) -> PaginationParams:
    """FastAPI dependency that parses page/page_size query params."""
    return PaginationParams(page=page, page_size=page_size)


async def paginate(
    db: AsyncSession,
    query: Select,
    params: PaginationParams,
    response_schema,
) -> PaginatedResponse:
    """
    Executes a paginated query and wraps results in a PaginatedResponse.

    Usage::

        return await paginate(db, select(Product), params, ProductRead)
    """
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    # Paginated results
    result = await db.execute(
        query.offset(params.offset).limit(params.page_size)
    )
    items = result.scalars().all()

    pages = math.ceil(total / params.page_size) if params.page_size else 0

    return PaginatedResponse(
        items=[response_schema.model_validate(item) for item in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
        pages=pages,
    )

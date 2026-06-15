"""
Health check endpoint — used by load balancers and uptime monitors.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.base import AppBaseModel

router = APIRouter()


class HealthResponse(AppBaseModel):
    status: str
    database: str
    version: str = "1.0.0"


@router.get("", response_model=HealthResponse, summary="Health check")
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    Returns 200 when the service and database are reachable.
    Returns 503 if the database connection fails.
    """
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "unreachable"

    return HealthResponse(status="ok", database=db_status)

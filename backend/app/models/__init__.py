"""
Import all models here so Alembic's env.py discovers them via metadata.
"""
from app.models.base import BaseModel  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401

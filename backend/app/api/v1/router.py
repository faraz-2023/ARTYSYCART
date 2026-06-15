"""
v1 API root router — all feature routers registered here.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import health, auth

api_router = APIRouter()

# Health / meta
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Future feature routers:
# from app.api.v1.endpoints import users, products, orders
# api_router.include_router(users.router, prefix="/users", tags=["users"])

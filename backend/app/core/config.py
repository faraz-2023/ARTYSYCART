"""
Application configuration loaded from environment variables via pydantic-settings.
"""
from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # App
    # ------------------------------------------------------------------
    APP_NAME: str = "Artysy"
    APP_ENV: str = "development"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS_ORIGINS: str = "http://localhost:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        # Stored raw; parsed in property below
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # ------------------------------------------------------------------
    # Supabase
    # ------------------------------------------------------------------
    SUPABASE_URL: AnyHttpUrl | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None

    # ------------------------------------------------------------------
    # Server
    # ------------------------------------------------------------------
    HOST: str = "0.0.0.0"
    PORT: int = 8000


@lru_cache
def get_settings() -> Settings:
    """Returns a cached singleton Settings instance."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()

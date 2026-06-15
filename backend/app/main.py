"""
Artysy — FastAPI application entry point.
"""
import logging
import logging.config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.logging import LoggingMiddleware
from app.utils.exceptions import AppException, app_exception_handler

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("artysy")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="Marketplace for handmade goods by independent artists and crafters.",
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ------------------------------------------------------------------
    # Other middleware
    # ------------------------------------------------------------------
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(LoggingMiddleware)

    # ------------------------------------------------------------------
    # Exception handlers
    # ------------------------------------------------------------------
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]

    # ------------------------------------------------------------------
    # Routers
    # ------------------------------------------------------------------
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # ------------------------------------------------------------------
    # Startup / shutdown events
    # ------------------------------------------------------------------
    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("🚀  %s API starting up [env=%s]", settings.APP_NAME, settings.APP_ENV)

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        logger.info("🛑  %s API shutting down", settings.APP_NAME)

    return app


app = create_app()

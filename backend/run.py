"""
Development server entry point.
Production: use  `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
"""
import uvicorn

from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )

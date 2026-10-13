from fastapi import APIRouter

from app.api.v1.routes import dashboard, health, session
from app.core.config import Settings


def build_api_router(settings: Settings) -> APIRouter:
    api_router = APIRouter(prefix="/api/v1")
    api_router.include_router(health.router)
    if settings.mock_auth_enabled:
        api_router.include_router(session.router)
    if settings.mock_data_enabled:
        api_router.include_router(dashboard.router)
    return api_router

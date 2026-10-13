from datetime import timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.router import build_api_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import REQUEST_ID_HEADER, RequestContextMiddleware
from app.schemas.errors import ErrorResponse
from app.services.mock_sessions import MockSessionStore


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="FNOS Automation Engine API",
        version=__version__,
        responses={"default": {"model": ErrorResponse}},
    )
    register_exception_handlers(app)

    if settings.cors_allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_allowed_origins,
            # Cookies cross origins only for the local mock session (D-24).
            allow_credentials=settings.mock_auth_enabled,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
            allow_headers=["Content-Type", "Authorization", REQUEST_ID_HEADER],
            expose_headers=[REQUEST_ID_HEADER],
        )
    # Added last so it is outermost: every response, including CORS and errors, gets a request ID.
    app.add_middleware(RequestContextMiddleware)

    if settings.mock_auth_enabled:
        app.state.mock_session_store = MockSessionStore(
            ttl=timedelta(minutes=settings.mock_session_ttl_minutes)
        )
    app.include_router(build_api_router(settings))
    return app


app = create_app()

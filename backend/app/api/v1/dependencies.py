"""Shared request dependencies for the v1 API."""

from typing import Annotated

from fastapi import Cookie, Depends, Request, Response, status

from app.core.errors import AppError
from app.services.mock_sessions import MockSession, MockSessionStore

SESSION_COOKIE = "fnos_mock_session"
COOKIE_PATH = "/api/v1"


def get_session_store(request: Request) -> MockSessionStore:
    store = getattr(request.app.state, "mock_session_store", None)
    if not isinstance(store, MockSessionStore):  # pragma: no cover - wiring error
        raise TypeError("Mock session store is not configured on app.state.")
    return store


StoreDep = Annotated[MockSessionStore, Depends(get_session_store)]
SessionCookie = Annotated[
    str | None,
    Cookie(
        alias=SESSION_COOKIE,
        description="HttpOnly session cookie set by POST /api/v1/session; sent by the browser.",
    ),
]


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path=COOKIE_PATH, httponly=True, samesite="lax")


def _clear_cookie_header() -> dict[str, str]:
    response = Response()
    clear_session_cookie(response)
    return {"set-cookie": response.headers["set-cookie"]}


def require_session(store: StoreDep, session_id: SessionCookie = None) -> MockSession:
    """Server-side check for every protected endpoint: 401 unless the session cookie is valid."""
    session = store.get(session_id) if session_id else None
    if session is None:
        raise AppError(
            status.HTTP_401_UNAUTHORIZED,
            "not_authenticated",
            "You are not signed in or your session has expired.",
            # Remove a stale or unknown cookie so the browser stops sending it.
            headers=_clear_cookie_header() if session_id else None,
        )
    return session


SessionDep = Annotated[MockSession, Depends(require_session)]

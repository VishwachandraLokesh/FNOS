"""DEVELOPMENT-ONLY mock session endpoints. Mounted only when ``FNOS_MOCK_AUTH_ENABLED`` is true,
which settings refuse outside the local and test environments."""

import logging

from fastapi import APIRouter, Response, status

from app.api.v1.dependencies import (
    COOKIE_PATH,
    SESSION_COOKIE,
    SessionCookie,
    SessionDep,
    StoreDep,
    clear_session_cookie,
)
from app.schemas.errors import ErrorResponse
from app.schemas.session import MockSignInRequest, SessionResponse, SessionUser
from app.services.mock_sessions import MockSession

__all__ = ["SESSION_COOKIE", "router"]

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/session", tags=["session (mock, development only)"])


def _to_response(session: MockSession) -> SessionResponse:
    return SessionResponse(
        mode="mock", user=SessionUser(email=session.email), expires_at=session.expires_at
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Mock sign-in: start a development session for any well-formed email",
    responses={status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
)
def create_session(body: MockSignInRequest, response: Response, store: StoreDep) -> SessionResponse:
    session_id, session = store.create(body.email)
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        max_age=int(store.ttl.total_seconds()),
        path=COOKIE_PATH,
        httponly=True,
        samesite="lax",
        # Local development runs over plain http; mock auth is refused in other environments.
        secure=False,
    )
    logger.info("mock session started")
    return _to_response(session)


@router.get(
    "",
    summary="Current mock session",
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
)
def read_session(session: SessionDep) -> SessionResponse:
    return _to_response(session)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, summary="Sign out (safe to repeat)")
def delete_session(response: Response, store: StoreDep, session_id: SessionCookie = None) -> None:
    if session_id:
        store.delete(session_id)
    clear_session_cookie(response)
    logger.info("mock session ended")

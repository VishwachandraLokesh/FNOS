"""DEVELOPMENT-ONLY in-memory sessions for the mock sign-in.

Sessions are random opaque IDs held in process memory: they survive browser refreshes but not a
server restart, and are not shared between processes. Nothing here verifies identity.
"""

import secrets
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

Clock = Callable[[], datetime]


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass(frozen=True)
class MockSession:
    email: str
    expires_at: datetime


class MockSessionStore:
    def __init__(self, ttl: timedelta, clock: Clock = utc_now) -> None:
        self._ttl = ttl
        self._clock = clock
        self._sessions: dict[str, MockSession] = {}

    @property
    def ttl(self) -> timedelta:
        return self._ttl

    def create(self, email: str) -> tuple[str, MockSession]:
        self._purge_expired()
        session_id = secrets.token_urlsafe(32)
        session = MockSession(email=email, expires_at=self._clock() + self._ttl)
        self._sessions[session_id] = session
        return session_id, session

    def get(self, session_id: str) -> MockSession | None:
        """Returns the session, or ``None`` if it is unknown or has expired."""
        session = self._sessions.get(session_id)
        if session is None:
            return None
        if session.expires_at <= self._clock():
            del self._sessions[session_id]
            return None
        return session

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def _purge_expired(self) -> None:
        now = self._clock()
        expired = [sid for sid, session in self._sessions.items() if session.expires_at <= now]
        for session_id in expired:
            del self._sessions[session_id]

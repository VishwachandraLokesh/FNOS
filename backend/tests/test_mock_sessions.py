from datetime import UTC, datetime, timedelta

from app.services.mock_sessions import MockSessionStore

START = datetime(2026, 10, 12, 9, 0, tzinfo=UTC)


def test_create_and_get_until_expiry() -> None:
    now = [START]
    store = MockSessionStore(ttl=timedelta(minutes=10), clock=lambda: now[0])

    session_id, session = store.create("name@company.com")

    assert session.expires_at == START + timedelta(minutes=10)
    assert store.get(session_id) == session
    now[0] = START + timedelta(minutes=10)
    assert store.get(session_id) is None


def test_delete_is_idempotent() -> None:
    store = MockSessionStore(ttl=timedelta(minutes=10))
    session_id, _ = store.create("name@company.com")

    store.delete(session_id)
    store.delete(session_id)

    assert store.get(session_id) is None


def test_creating_a_session_purges_expired_ones() -> None:
    now = [START]
    store = MockSessionStore(ttl=timedelta(minutes=10), clock=lambda: now[0])
    old_id, _ = store.create("old@company.com")

    now[0] = START + timedelta(hours=1)
    store.create("new@company.com")

    # Inspects internal state to prove expired sessions do not accumulate in memory.
    assert old_id not in store._sessions

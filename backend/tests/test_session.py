import logging
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.v1.routes.session import SESSION_COOKIE
from app.core.config import Settings
from app.main import create_app
from app.services.mock_sessions import MockSessionStore
from tests.conftest import FRONTEND_ORIGIN

SESSION_URL = "/api/v1/session"
START = datetime(2026, 10, 12, 9, 0, tzinfo=UTC)
TTL = timedelta(minutes=30)


class FakeClock:
    def __init__(self) -> None:
        self.now = START

    def __call__(self) -> datetime:
        return self.now


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def mock_app(clock: FakeClock) -> FastAPI:
    app = create_app(
        Settings(environment="test", cors_allowed_origins=[FRONTEND_ORIGIN], mock_auth_enabled=True)
    )
    app.state.mock_session_store = MockSessionStore(ttl=TTL, clock=clock)
    return app


@pytest.fixture
def mock_client(mock_app: FastAPI) -> Iterator[TestClient]:
    with TestClient(mock_app, raise_server_exceptions=False) as test_client:
        yield test_client


def sign_in(client: TestClient, email: str = "Name@Company.com ") -> str:
    response = client.post(SESSION_URL, json={"email": email})
    assert response.status_code == 201
    session_id = client.cookies.get(SESSION_COOKIE)
    assert session_id
    return session_id


# --- sign-in -----------------------------------------------------------------------------------


def test_sign_in_returns_mock_session_and_sets_httponly_cookie(mock_client: TestClient) -> None:
    response = mock_client.post(SESSION_URL, json={"email": "  Name@Company.COM "})

    assert response.status_code == 201
    assert response.json() == {
        "mode": "mock",
        "user": {"email": "name@company.com"},
        "expires_at": "2026-10-12T09:30:00Z",
    }
    cookie = response.headers["set-cookie"]
    assert cookie.startswith(f"{SESSION_COOKIE}=")
    assert "HttpOnly" in cookie
    assert "SameSite=lax" in cookie
    assert "Path=/api/v1" in cookie
    assert "Max-Age=1800" in cookie
    assert "Secure" not in cookie
    session_id = mock_client.cookies.get(SESSION_COOKIE)
    assert session_id
    assert session_id not in response.text


def test_each_sign_in_gets_a_new_session_id(mock_client: TestClient) -> None:
    first = sign_in(mock_client)
    second = sign_in(mock_client)

    assert first != second


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"email": ""},
        {"email": "not-an-email"},
        {"email": "name@company"},
        {"email": "two words@company.com"},
        {"email": 42},
        {"email": f"{'a' * 250}@company.com"},
    ],
)
def test_sign_in_rejects_invalid_input_without_echoing_it(
    mock_client: TestClient, body: dict[str, object]
) -> None:
    response = mock_client.post(SESSION_URL, json=body)

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["field"] == "body.email"
    assert not error["details"][0]["message"].startswith("Value error")
    assert "not-an-email" not in response.text
    assert SESSION_COOKIE not in response.headers.get("set-cookie", "")


def test_sign_in_rejects_non_json_body(mock_client: TestClient) -> None:
    response = mock_client.post(
        SESSION_URL, content="email=name@company.com", headers={"Content-Type": "text/plain"}
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


# --- session lookup ----------------------------------------------------------------------------


def test_session_lookup_returns_the_signed_in_user(mock_client: TestClient) -> None:
    sign_in(mock_client)

    response = mock_client.get(SESSION_URL)

    assert response.status_code == 200
    assert response.json()["user"] == {"email": "name@company.com"}
    assert response.json()["mode"] == "mock"


def test_session_lookup_without_cookie_is_unauthenticated(mock_client: TestClient) -> None:
    response = mock_client.get(SESSION_URL)

    assert response.status_code == 401
    assert response.json()["error"] == {
        "code": "not_authenticated",
        "message": "You are not signed in or your session has expired.",
        "request_id": response.headers["X-Request-ID"],
    }
    assert "set-cookie" not in response.headers


def test_unknown_session_cookie_is_unauthenticated_and_cleared(mock_client: TestClient) -> None:
    mock_client.cookies.set(SESSION_COOKIE, "forged-or-stale", path="/api/v1")

    response = mock_client.get(SESSION_URL)

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"
    assert 'fnos_mock_session=""' in response.headers["set-cookie"]
    assert "Max-Age=0" in response.headers["set-cookie"]


def test_session_expires_after_ttl(mock_client: TestClient, clock: FakeClock) -> None:
    sign_in(mock_client)

    clock.now = START + TTL - timedelta(seconds=1)
    assert mock_client.get(SESSION_URL).status_code == 200

    clock.now = START + TTL
    response = mock_client.get(SESSION_URL)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"


# --- sign-out ----------------------------------------------------------------------------------


def test_sign_out_ends_the_session_and_clears_the_cookie(mock_client: TestClient) -> None:
    session_id = sign_in(mock_client)

    response = mock_client.delete(SESSION_URL)

    assert response.status_code == 204
    assert response.content == b""
    assert "Max-Age=0" in response.headers["set-cookie"]
    assert mock_client.get(SESSION_URL).status_code == 401
    # The old ID is dead on the server even if a client kept a copy.
    mock_client.cookies.set(SESSION_COOKIE, session_id, path="/api/v1")
    assert mock_client.get(SESSION_URL).status_code == 401


def test_sign_out_without_a_session_is_harmless(mock_client: TestClient) -> None:
    assert mock_client.delete(SESSION_URL).status_code == 204


# --- development-only safeguards ---------------------------------------------------------------


def test_session_endpoints_do_not_exist_when_mock_auth_is_disabled(client: TestClient) -> None:
    assert client.post(SESSION_URL, json={"email": "name@company.com"}).status_code == 404
    assert client.get(SESSION_URL).status_code == 404
    assert client.delete(SESSION_URL).status_code == 404


@pytest.mark.parametrize("environment", ["dev", "uat", "prod"])
def test_mock_auth_cannot_be_enabled_outside_local_and_test(environment: str) -> None:
    with pytest.raises(ValidationError, match="local development only"):
        Settings(environment=environment, mock_auth_enabled=True)  # type: ignore[arg-type]


def test_mock_auth_is_off_by_default() -> None:
    assert Settings().mock_auth_enabled is False


def test_cors_allows_credentials_only_with_mock_auth(
    mock_client: TestClient, client: TestClient
) -> None:
    preflight = {"Origin": FRONTEND_ORIGIN, "Access-Control-Request-Method": "POST"}

    with_mock = mock_client.options(SESSION_URL, headers=preflight)
    assert with_mock.headers["access-control-allow-credentials"] == "true"
    assert with_mock.headers["access-control-allow-origin"] == FRONTEND_ORIGIN

    without_mock = client.options("/api/v1/health", headers=preflight)
    assert "access-control-allow-credentials" not in without_mock.headers


def test_logs_do_not_contain_email_or_session_id(
    mock_client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO):
        session_id = sign_in(mock_client, "secret.person@company.com")
        mock_client.get(SESSION_URL)
        mock_client.delete(SESSION_URL)

    app_logs = " ".join(str(vars(r)) for r in caplog.records if r.name.startswith("app"))
    assert "mock session started" in app_logs
    assert "mock session ended" in app_logs
    assert "secret.person" not in app_logs
    assert session_id not in app_logs

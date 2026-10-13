import logging

import pytest
from fastapi.testclient import TestClient

from tests.conftest import FRONTEND_ORIGIN


def test_generates_request_id_when_none_supplied(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert len(response.headers["X-Request-ID"]) == 32


def test_reuses_safe_caller_request_id(client: TestClient) -> None:
    response = client.get("/api/v1/health", headers={"X-Request-ID": "abc-123.def_4"})

    assert response.headers["X-Request-ID"] == "abc-123.def_4"


@pytest.mark.parametrize("unsafe_id", ["has space", "x" * 65, "<script>"])
def test_replaces_unsafe_caller_request_id(client: TestClient, unsafe_id: str) -> None:
    response = client.get("/api/v1/health", headers={"X-Request-ID": unsafe_id})

    assert response.headers["X-Request-ID"] != unsafe_id


def test_logs_one_line_per_request_without_query_string(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO, logger="app.request"):
        response = client.get("/api/v1/health", params={"token": "secret-value"})

    records = [record for record in caplog.records if record.message == "request completed"]
    assert len(records) == 1
    record = records[0]
    assert record.__dict__["path"] == "/api/v1/health"
    assert record.__dict__["status_code"] == 200
    assert record.__dict__["request_id"] == response.headers["X-Request-ID"]
    app_records = [r for r in caplog.records if r.name.startswith("app")]
    assert all("secret-value" not in str(vars(r)) for r in app_records)


def test_cors_allows_configured_origin(client: TestClient) -> None:
    response = client.get("/api/v1/health", headers={"Origin": FRONTEND_ORIGIN})

    assert response.headers["access-control-allow-origin"] == FRONTEND_ORIGIN
    assert "X-Request-ID" in response.headers["access-control-expose-headers"]


def test_cors_preflight_allows_configured_origin(client: TestClient) -> None:
    response = client.options(
        "/api/v1/health",
        headers={"Origin": FRONTEND_ORIGIN, "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == FRONTEND_ORIGIN


def test_cors_rejects_unconfigured_origin(client: TestClient) -> None:
    response = client.get("/api/v1/health", headers={"Origin": "http://evil.example"})

    assert "access-control-allow-origin" not in response.headers

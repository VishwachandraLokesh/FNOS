import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import AppError


def test_unknown_route_returns_error_envelope(client: TestClient) -> None:
    response = client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    error = response.json()["error"]
    assert error["code"] == "not_found"
    assert error["message"] == "Not Found"
    assert error["request_id"] == response.headers["X-Request-ID"]


def test_wrong_method_returns_405_envelope(client: TestClient) -> None:
    response = client.post("/api/v1/health")

    assert response.status_code == 405
    assert response.json()["error"]["code"] == "method_not_allowed"


def test_app_error_is_returned_with_its_status_and_code(app: FastAPI, client: TestClient) -> None:
    def conflict() -> None:
        raise AppError(409, "report_locked", "The report is locked.")

    app.add_api_route("/api/v1/_test/conflict", conflict)

    response = client.get("/api/v1/_test/conflict")

    assert response.status_code == 409
    assert response.json()["error"] == {
        "code": "report_locked",
        "message": "The report is locked.",
        "request_id": response.headers["X-Request-ID"],
    }


def test_validation_error_lists_fields_without_echoing_input(
    app: FastAPI, client: TestClient
) -> None:
    def items(limit: int) -> dict[str, int]:
        return {"limit": limit}

    app.add_api_route("/api/v1/_test/items", items)

    response = client.get("/api/v1/_test/items", params={"limit": "not-a-number"})

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["field"] == "query.limit"
    assert "not-a-number" not in response.text


def test_unhandled_exception_returns_generic_500_and_is_logged(
    app: FastAPI, client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    def explode() -> None:
        raise RuntimeError("internal detail that must not leak")

    app.add_api_route("/api/v1/_test/explode", explode)

    with caplog.at_level(logging.ERROR, logger="app.request"):
        response = client.get("/api/v1/_test/explode")

    assert response.status_code == 500
    error = response.json()["error"]
    assert error["code"] == "internal_error"
    assert error["request_id"] == response.headers["X-Request-ID"]
    assert "internal detail" not in response.text
    logged = [record for record in caplog.records if record.message == "unhandled exception"]
    assert len(logged) == 1
    assert logged[0].exc_info is not None

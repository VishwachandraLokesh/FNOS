from fastapi.testclient import TestClient

from app import __version__


def test_health_returns_ok_payload(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "fnos-api", "version": __version__}


def test_health_is_only_served_under_versioned_prefix(client: TestClient) -> None:
    assert client.get("/health").status_code == 404

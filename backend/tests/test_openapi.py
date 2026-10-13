from scripts.export_openapi import OPENAPI_PATH, build_openapi, render


def test_committed_openapi_contract_is_up_to_date() -> None:
    assert OPENAPI_PATH.read_text(encoding="utf-8") == render(build_openapi()), (
        "backend/openapi.json is stale: run `.venv/bin/python -m scripts.export_openapi`"
    )


def test_contract_documents_the_mock_session_endpoints() -> None:
    paths = build_openapi()["paths"]

    assert set(paths["/api/v1/session"]) == {"post", "get", "delete"}
    assert "401" in paths["/api/v1/session"]["get"]["responses"]
    assert "422" in paths["/api/v1/session"]["post"]["responses"]
    assert "/api/v1/health" in paths


def test_contract_documents_the_mock_dashboard_endpoints() -> None:
    paths = build_openapi()["paths"]

    for path in ("kpis", "filter-options", "recent-reports"):
        operation = paths[f"/api/v1/dashboard/{path}"]["get"]
        assert {"200", "401", "422", "503"} <= set(operation["responses"])

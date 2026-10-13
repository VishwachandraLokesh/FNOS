from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app
from app.schemas.dashboard import FilterOptionsResponse, KpiTabResponse, RecentReportsResponse
from tests.conftest import FRONTEND_ORIGIN

KPIS = "/api/v1/dashboard/kpis"
FILTERS = "/api/v1/dashboard/filter-options"
REPORTS = "/api/v1/dashboard/recent-reports"
ALL_ENDPOINTS = [f"{KPIS}?tab=cmi", FILTERS, REPORTS]


def _client(*, mock_data_enabled: bool = True) -> TestClient:
    settings = Settings(
        environment="test",
        cors_allowed_origins=[FRONTEND_ORIGIN],
        mock_auth_enabled=True,
        mock_data_enabled=mock_data_enabled,
    )
    return TestClient(create_app(settings), raise_server_exceptions=False)


@pytest.fixture
def anonymous() -> Iterator[TestClient]:
    with _client() as client:
        yield client


@pytest.fixture
def signed_in() -> Iterator[TestClient]:
    with _client() as client:
        assert client.post("/api/v1/session", json={"email": "name@company.com"}).status_code == 201
        yield client


# --- session requirement -----------------------------------------------------------------------


@pytest.mark.parametrize("url", [*ALL_ENDPOINTS, f"{KPIS}?tab=not-a-tab", f"{REPORTS}?limit=0"])
def test_endpoints_require_a_session_before_validating_input(
    anonymous: TestClient, url: str
) -> None:
    response = anonymous.get(url)

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"


def test_endpoints_reject_a_session_that_has_ended(signed_in: TestClient) -> None:
    signed_in.delete("/api/v1/session")

    for url in ALL_ENDPOINTS:
        assert signed_in.get(url).status_code == 401


# --- KPI cards ---------------------------------------------------------------------------------


@pytest.mark.parametrize("tab", ["cmi", "finance", "brand_category"])
def test_kpis_return_the_five_mockup_kpis_for_each_tab(signed_in: TestClient, tab: str) -> None:
    response = signed_in.get(KPIS, params={"tab": tab})

    assert response.status_code == 200
    body = KpiTabResponse.model_validate(response.json())
    assert body.data_source == "mock"
    assert body.tab == tab
    assert [card.id for card in body.cards] == [
        "rsv",
        "market_share",
        "volume",
        "weighted_distribution",
        "hh_penetration",
    ]


def test_cmi_values_match_the_dashboard_mockup(signed_in: TestClient) -> None:
    cards = signed_in.get(KPIS, params={"tab": "cmi"}).json()["cards"]

    assert cards[0] == {
        "id": "rsv",
        "label": "RSV",
        "value": 6_700_000_000,
        "unit": "usd",
        "change": 4.5,
        "change_unit": "percent",
    }
    assert [(c["value"], c["change"], c["unit"], c["change_unit"]) for c in cards[1:]] == [
        (23.4, 0.5, "percent", "percentage_points"),
        (477.2, 2.6, "kilotonnes", "percent"),
        (88.3, 2.2, "percent", "percentage_points"),
        (41.2, 0.7, "percent", "percentage_points"),
    ]


def test_switching_tabs_changes_the_values(signed_in: TestClient) -> None:
    values = {
        tab: [c["value"] for c in signed_in.get(KPIS, params={"tab": tab}).json()["cards"]]
        for tab in ("cmi", "finance", "brand_category")
    }

    assert len({tuple(v) for v in values.values()}) == 3
    changes = [
        c["change"] for c in signed_in.get(KPIS, params={"tab": "brand_category"}).json()["cards"]
    ]
    assert any(change < 0 for change in changes)


@pytest.mark.parametrize("params", [{}, {"tab": "CMI"}, {"tab": "sales"}])
def test_kpis_reject_a_missing_or_unknown_tab(
    signed_in: TestClient, params: dict[str, str]
) -> None:
    response = signed_in.get(KPIS, params=params)

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["field"] == "query.tab"


# --- filter options ----------------------------------------------------------------------------


def test_filter_options_list_regions_with_their_markets_and_templates(
    signed_in: TestClient,
) -> None:
    response = signed_in.get(FILTERS)

    assert response.status_code == 200
    body = FilterOptionsResponse.model_validate(response.json())
    assert body.data_source == "mock"
    assert [(r.id, r.label) for r in body.regions] == [("europe", "Europe")]
    assert [(m.id, m.label) for m in body.regions[0].markets] == [
        ("uk", "UK"),
        ("france", "France"),
        ("germany", "Germany"),
    ]
    assert [(t.id, t.label) for t in body.templates] == [
        ("fnos_executive_deck", "FNOS Executive Deck")
    ]


# --- recent reports ----------------------------------------------------------------------------


def test_recent_reports_match_the_mockup_newest_first(signed_in: TestClient) -> None:
    response = signed_in.get(REPORTS)

    assert response.status_code == 200
    body = RecentReportsResponse.model_validate(response.json())
    assert body.data_source == "mock"
    assert [(r.id, r.status, r.updated_on) for r in body.reports] == [
        ("FNOS_26_Q3", "draft", date(2026, 7, 1)),
        ("FNOS_26_Q2", "published", date(2026, 6, 28)),
        ("FNOS_26_Q1", "published", date(2026, 4, 4)),
    ]
    first = response.json()["reports"][0]
    assert first == {
        "id": "FNOS_26_Q3",
        "name": "FNOS_26_Q3",
        "status": "draft",
        "brand": "Dolmio",
        "template": {"id": "fnos_executive_deck", "label": "FNOS Executive Deck"},
        "view": "Total Europe Cluster",
        "updated_on": "2026-07-01",
    }


def test_recent_reports_limit(signed_in: TestClient) -> None:
    reports = signed_in.get(REPORTS, params={"limit": 2}).json()["reports"]

    assert [r["id"] for r in reports] == ["FNOS_26_Q3", "FNOS_26_Q2"]


@pytest.mark.parametrize("limit", ["0", "51", "abc"])
def test_recent_reports_reject_invalid_limit(signed_in: TestClient, limit: str) -> None:
    response = signed_in.get(REPORTS, params={"limit": limit})

    assert response.status_code == 422
    assert response.json()["error"]["details"][0]["field"] == "query.limit"


# --- mock scenarios: empty and error states ----------------------------------------------------


def test_empty_scenario_returns_no_records(signed_in: TestClient) -> None:
    kpis = signed_in.get(KPIS, params={"tab": "cmi", "mock_scenario": "empty"}).json()
    filters = signed_in.get(FILTERS, params={"mock_scenario": "empty"}).json()
    reports = signed_in.get(REPORTS, params={"mock_scenario": "empty"}).json()

    assert kpis == {"data_source": "mock", "tab": "cmi", "cards": []}
    assert filters == {"data_source": "mock", "regions": [], "templates": []}
    assert reports == {"data_source": "mock", "reports": []}


@pytest.mark.parametrize("url", ALL_ENDPOINTS)
def test_error_scenario_returns_a_503_error_envelope(signed_in: TestClient, url: str) -> None:
    separator = "&" if "?" in url else "?"
    response = signed_in.get(f"{url}{separator}mock_scenario=error")

    assert response.status_code == 503
    assert response.json()["error"] == {
        "code": "mock_failure",
        "message": "Simulated failure for testing (mock_scenario=error).",
        "request_id": response.headers["X-Request-ID"],
    }


def test_unknown_scenario_is_rejected(signed_in: TestClient) -> None:
    response = signed_in.get(FILTERS, params={"mock_scenario": "slow"})

    assert response.status_code == 422
    assert response.json()["error"]["details"][0]["field"] == "query.mock_scenario"


# --- development-only safeguards ---------------------------------------------------------------


def test_dashboard_endpoints_do_not_exist_when_mock_data_is_disabled() -> None:
    with _client(mock_data_enabled=False) as client:
        client.post("/api/v1/session", json={"email": "name@company.com"})
        for url in ALL_ENDPOINTS:
            assert client.get(url).status_code == 404


def test_mock_data_is_off_by_default() -> None:
    assert Settings().mock_data_enabled is False


def test_mock_data_requires_mock_auth() -> None:
    with pytest.raises(ValidationError, match="requires FNOS_MOCK_AUTH_ENABLED"):
        Settings(environment="local", mock_data_enabled=True)


@pytest.mark.parametrize("environment", ["dev", "uat", "prod"])
def test_mock_data_cannot_be_enabled_outside_local_and_test(environment: str) -> None:
    with pytest.raises(ValidationError, match="local development only"):
        Settings(environment=environment, mock_auth_enabled=True, mock_data_enabled=True)  # type: ignore[arg-type]

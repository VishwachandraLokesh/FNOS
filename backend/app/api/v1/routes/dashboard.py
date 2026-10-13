"""DEVELOPMENT-ONLY mock Dashboard endpoints. Mounted only when ``FNOS_MOCK_DATA_ENABLED`` is
true (local/test only); every endpoint requires a valid mock session."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.v1.dependencies import require_session
from app.schemas.dashboard import (
    FilterOptionsResponse,
    KpiTab,
    KpiTabResponse,
    MockScenario,
    RecentReportsResponse,
)
from app.schemas.errors import ErrorResponse
from app.services import mock_dashboard

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard (mock data, development only)"],
    dependencies=[Depends(require_session)],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)

ScenarioQuery = Annotated[
    MockScenario,
    Query(
        alias="mock_scenario",
        description='Development aid: "empty" returns no records, "error" returns 503 '
        "mock_failure. Defaults to normal data.",
    ),
]


@router.get("/kpis", summary="KPI cards for one Dashboard tab")
def read_kpis(tab: KpiTab, scenario: ScenarioQuery = "normal") -> KpiTabResponse:
    return mock_dashboard.get_kpis(tab, scenario)


@router.get("/filter-options", summary="Region, Market and Presentation Template options")
def read_filter_options(scenario: ScenarioQuery = "normal") -> FilterOptionsResponse:
    return mock_dashboard.get_filter_options(scenario)


@router.get("/recent-reports", summary="Most recently updated reports")
def read_recent_reports(
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    scenario: ScenarioQuery = "normal",
) -> RecentReportsResponse:
    return mock_dashboard.get_recent_reports(limit, scenario)

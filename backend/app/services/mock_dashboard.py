"""DEVELOPMENT-ONLY fictional Dashboard data.

Sources: the CMI KPI values, filter selections and the three recent reports are copied from the
Dashboard mockup (`assets/ui-mockups/main_page.png`). France and Germany come from the design
deck's brand-market list ("Suzi Wan FR", "RTH D"). The Finance and Brand Category values are
placeholders so tab switching can be demonstrated; which KPIs those tabs really show is an open
business question. Nothing here is calculated or comes from business data.
"""

from datetime import date
from typing import Final

from fastapi import status

from app.core.errors import AppError
from app.schemas.dashboard import (
    ChangeUnit,
    FilterOptionsResponse,
    KpiCard,
    KpiId,
    KpiTab,
    KpiTabResponse,
    MockScenario,
    Option,
    RecentReport,
    RecentReportsResponse,
    RegionOption,
    ValueUnit,
)

_EXECUTIVE_DECK: Final = Option(id="fnos_executive_deck", label="FNOS Executive Deck")


# (id, label, unit, change unit) in display order: the five KPIs named in the mockup.
_KPI_DEFINITIONS: Final[tuple[tuple[KpiId, str, ValueUnit, ChangeUnit], ...]] = (
    ("rsv", "RSV", "usd", "percent"),
    ("market_share", "Market Share", "percent", "percentage_points"),
    ("volume", "Volume", "kilotonnes", "percent"),
    ("weighted_distribution", "Weighted Distribution", "percent", "percentage_points"),
    ("hh_penetration", "HH Penetration", "percent", "percentage_points"),
)

# (value, change) per KPI, in the order above.
_KPI_VALUES: Final[dict[KpiTab, tuple[tuple[float, float], ...]]] = {
    # Values shown on the CMI tab of the mockup.
    "cmi": ((6_700_000_000, 4.5), (23.4, 0.5), (477.2, 2.6), (88.3, 2.2), (41.2, 0.7)),
    # Placeholders (not from any source), including falls so negative changes can be tested.
    "finance": ((2_100_000_000, 3.1), (19.8, 0.3), (152.6, 1.4), (84.9, 1.1), (37.5, 0.4)),
    "brand_category": ((900_000_000, -1.2), (12.6, -0.2), (61.3, -0.8), (79.4, 0.6), (28.9, -0.3)),
}


def _cards(tab: KpiTab) -> list[KpiCard]:
    return [
        KpiCard(id=kpi_id, label=label, value=value, unit=unit, change=change,
                change_unit=change_unit)
        for (kpi_id, label, unit, change_unit), (value, change)
        in zip(_KPI_DEFINITIONS, _KPI_VALUES[tab], strict=True)
    ]  # fmt: skip


_FILTER_OPTIONS: Final = FilterOptionsResponse(
    data_source="mock",
    regions=[
        RegionOption(
            id="europe",
            label="Europe",
            markets=[
                Option(id="uk", label="UK"),
                Option(id="france", label="France"),
                Option(id="germany", label="Germany"),
            ],
        )
    ],
    templates=[_EXECUTIVE_DECK],
)

_RECENT_REPORTS: Final = [
    RecentReport(id="FNOS_26_Q3", name="FNOS_26_Q3", status="draft", brand="Dolmio",
                 template=_EXECUTIVE_DECK, view="Total Europe Cluster",
                 updated_on=date(2026, 7, 1)),
    RecentReport(id="FNOS_26_Q2", name="FNOS_26_Q2", status="published", brand="Dolmio",
                 template=_EXECUTIVE_DECK, view="Total Europe Cluster",
                 updated_on=date(2026, 6, 28)),
    RecentReport(id="FNOS_26_Q1", name="FNOS_26_Q1", status="published", brand="Dolmio",
                 template=_EXECUTIVE_DECK, view="Total Europe Cluster",
                 updated_on=date(2026, 4, 4)),
]  # fmt: skip


def _raise_if_error(scenario: MockScenario) -> None:
    if scenario == "error":
        raise AppError(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "mock_failure",
            "Simulated failure for testing (mock_scenario=error).",
        )


def get_kpis(tab: KpiTab, scenario: MockScenario) -> KpiTabResponse:
    _raise_if_error(scenario)
    cards = [] if scenario == "empty" else _cards(tab)
    return KpiTabResponse(data_source="mock", tab=tab, cards=cards)


def get_filter_options(scenario: MockScenario) -> FilterOptionsResponse:
    _raise_if_error(scenario)
    if scenario == "empty":
        return FilterOptionsResponse(data_source="mock", regions=[], templates=[])
    return _FILTER_OPTIONS


def get_recent_reports(limit: int, scenario: MockScenario) -> RecentReportsResponse:
    _raise_if_error(scenario)
    reports = [] if scenario == "empty" else _RECENT_REPORTS[:limit]
    return RecentReportsResponse(data_source="mock", reports=reports)

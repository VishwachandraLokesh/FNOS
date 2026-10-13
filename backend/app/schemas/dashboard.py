"""Dashboard response models. Fields follow `assets/ui-mockups/main_page.png` and the W1-W5 plan;
numbers are display values only (no formulas or calculations are implied)."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

DataSource = Literal["mock"]
KpiTab = Literal["cmi", "finance", "brand_category"]
KpiId = Literal["rsv", "market_share", "volume", "weighted_distribution", "hh_penetration"]
ValueUnit = Literal["usd", "percent", "kilotonnes"]
ChangeUnit = Literal["percent", "percentage_points"]
ReportStatus = Literal["draft", "published"]
MockScenario = Literal["normal", "empty", "error"]

_DATA_SOURCE_DESCRIPTION = (
    'Always "mock": fictional development data, never business information. Show it as mock.'
)


class KpiCard(BaseModel):
    id: KpiId
    label: str = Field(examples=["RSV"])
    value: float = Field(
        description='Raw number in `unit` (e.g. 6700000000 with unit "usd" for $6.7 B). '
        "The UI formats it."
    )
    unit: ValueUnit
    change: float = Field(description="Signed change in `change_unit` (negative means a fall).")
    change_unit: ChangeUnit


class KpiTabResponse(BaseModel):
    data_source: DataSource = Field(description=_DATA_SOURCE_DESCRIPTION)
    tab: KpiTab
    cards: list[KpiCard] = Field(description="Display order. May be empty.")


class Option(BaseModel):
    id: str = Field(description="Stable identifier to send back to the API.")
    label: str = Field(description="Text to display.")


class RegionOption(Option):
    markets: list[Option] = Field(description="The only markets valid for this region.")


class FilterOptionsResponse(BaseModel):
    data_source: DataSource = Field(description=_DATA_SOURCE_DESCRIPTION)
    regions: list[RegionOption]
    templates: list[Option] = Field(description="Presentation templates; valid for every market.")


class RecentReport(BaseModel):
    id: str = Field(examples=["FNOS_26_Q3"])
    name: str
    status: ReportStatus
    brand: str
    template: Option
    view: str = Field(examples=["Total Europe Cluster"])
    updated_on: date


class RecentReportsResponse(BaseModel):
    data_source: DataSource = Field(description=_DATA_SOURCE_DESCRIPTION)
    reports: list[RecentReport] = Field(description="Most recently updated first. May be empty.")

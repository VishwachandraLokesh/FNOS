"""Application settings, loaded from environment variables (prefix ``FNOS_``) or ``.env``."""

from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import urlsplit

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

# The only environments where development-only mock sign-in and mock data may be switched on.
MOCK_AUTH_ENVIRONMENTS = frozenset({"local", "test"})


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FNOS_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["local", "test", "dev", "uat", "prod"] = "local"
    log_level: LogLevel = "INFO"
    # Comma-separated list of exact origins, e.g. "http://localhost:5173". Empty disables CORS.
    cors_allowed_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    # DEVELOPMENT ONLY: enables the mock session endpoints. Refused outside local/test.
    mock_auth_enabled: bool = False
    mock_session_ttl_minutes: int = Field(default=480, ge=1, le=1440)
    # DEVELOPMENT ONLY: enables the mock Dashboard endpoints (fictional values). Requires mock auth.
    mock_data_enabled: bool = False

    @field_validator("log_level", mode="before")
    @classmethod
    def _normalise_log_level(cls, value: object) -> object:
        return value.upper() if isinstance(value, str) else value

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("cors_allowed_origins")
    @classmethod
    def _validate_origins(cls, origins: list[str]) -> list[str]:
        for origin in origins:
            parts = urlsplit(origin)
            is_bare_origin = (
                parts.scheme in {"http", "https"}
                and bool(parts.hostname)
                and parts.path == ""
                and not parts.query
                and not parts.fragment
            )
            if not is_bare_origin:
                raise ValueError(
                    f"Invalid CORS origin {origin!r}: use scheme://host[:port] "
                    "with no path or wildcard"
                )
        return origins

    @model_validator(mode="after")
    def _restrict_mock_auth(self) -> "Settings":
        if self.mock_auth_enabled and self.environment not in MOCK_AUTH_ENVIRONMENTS:
            raise ValueError(
                "FNOS_MOCK_AUTH_ENABLED is for local development only and cannot be enabled "
                f"when FNOS_ENVIRONMENT is {self.environment!r}"
            )
        if self.mock_data_enabled and not self.mock_auth_enabled:
            # Mock data is served only to mock sessions, so it cannot exist without mock auth
            # (which in turn is limited to local/test above).
            raise ValueError("FNOS_MOCK_DATA_ENABLED requires FNOS_MOCK_AUTH_ENABLED")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()

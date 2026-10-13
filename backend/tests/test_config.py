import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_defaults_are_safe() -> None:
    settings = Settings()

    assert settings.environment == "local"
    assert settings.log_level == "INFO"
    assert settings.cors_allowed_origins == []


def test_reads_prefixed_environment_variables(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FNOS_LOG_LEVEL", "debug")
    monkeypatch.setenv("FNOS_CORS_ALLOWED_ORIGINS", "http://localhost:5173, http://127.0.0.1:5173")

    settings = Settings()

    assert settings.log_level == "DEBUG"
    assert settings.cors_allowed_origins == ["http://localhost:5173", "http://127.0.0.1:5173"]


@pytest.mark.parametrize(
    "origin", ["*", "localhost:5173", "http://localhost:5173/", "ftp://example.com"]
)
def test_rejects_invalid_cors_origins(origin: str) -> None:
    with pytest.raises(ValidationError, match="Invalid CORS origin"):
        Settings(cors_allowed_origins=[origin])


def test_rejects_unknown_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FNOS_ENVIRONMENT", "staging-ish")

    with pytest.raises(ValidationError):
        Settings()

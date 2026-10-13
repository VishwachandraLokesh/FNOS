from app import __version__
from app.schemas.health import HealthResponse

SERVICE_NAME = "fnos-api"


def get_health() -> HealthResponse:
    """Liveness only: the process is up and serving requests. No dependency checks yet."""
    return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)

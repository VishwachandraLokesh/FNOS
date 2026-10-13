"""Write the API contract to ``backend/openapi.json``.

The contract is generated from the code with the development mock endpoints enabled, so it
documents everything the frontend can call locally. Run from ``backend/``:

    .venv/bin/python -m scripts.export_openapi

``tests/test_openapi.py`` fails when the committed file is out of date.
"""

import json
from pathlib import Path
from typing import Any

from app.core.config import Settings
from app.main import create_app

OPENAPI_PATH = Path(__file__).resolve().parent.parent / "openapi.json"


def build_openapi() -> dict[str, Any]:
    settings = Settings(
        environment="local", mock_auth_enabled=True, mock_data_enabled=True, cors_allowed_origins=[]
    )
    return create_app(settings).openapi()


def render(schema: dict[str, Any]) -> str:
    return json.dumps(schema, indent=2, sort_keys=True) + "\n"


def main() -> None:
    OPENAPI_PATH.write_text(render(build_openapi()), encoding="utf-8")
    print(f"Wrote {OPENAPI_PATH}")  # noqa: T201 - command-line output


if __name__ == "__main__":
    main()

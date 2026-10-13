"""Structured JSON logging.

Log only operational metadata (method, path, status, duration, request ID). Never log request
bodies, query strings, headers, tokens or personal data.
"""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import override

# ``color_message`` is uvicorn's ANSI-coloured duplicate of ``message``.
_EXCLUDED_RECORD_ATTRS = frozenset(vars(logging.makeLogRecord({}))) | {"message", "color_message"}


class JsonFormatter(logging.Formatter):
    @override
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Fields passed via ``extra={...}``.
        for key, value in vars(record).items():
            if key not in _EXCLUDED_RECORD_ATTRS:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level)
    # The request log in ``app.core.middleware`` replaces uvicorn's access log.
    logging.getLogger("uvicorn.access").disabled = True
    for name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True

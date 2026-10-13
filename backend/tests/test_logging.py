import json
import logging

from app.core.logging import JsonFormatter


def test_json_formatter_emits_structured_fields() -> None:
    record = logging.makeLogRecord(
        {"name": "app.test", "levelname": "INFO", "msg": "hello %s", "args": ("world",)}
    )
    record.request_id = "req-1"
    record.color_message = "\x1b[36mhello\x1b[0m"

    payload = json.loads(JsonFormatter().format(record))

    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.test"
    assert payload["message"] == "hello world"
    assert payload["request_id"] == "req-1"
    assert payload["timestamp"].endswith("+00:00")
    assert "exception" not in payload
    assert "color_message" not in payload

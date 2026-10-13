"""Application exceptions and the handlers that map errors to ``ErrorResponse``.

Unhandled exceptions are handled by ``RequestContextMiddleware`` so that the 500 response
still carries the request ID.
"""

from collections.abc import Mapping
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.request_context import request_id_var
from app.schemas.errors import ErrorBody, ErrorResponse, FieldErrorDetail


class AppError(Exception):
    """Raise from services for expected failures; ``message`` is shown to the client."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        headers: Mapping[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.headers = headers


def error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[FieldErrorDetail] | None = None,
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(
        error=ErrorBody(
            code=code, message=message, request_id=request_id_var.get(), details=details
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(exclude_none=True),
        headers=headers,
    )


def _code_for_status(status_code: int) -> str:
    try:
        phrase = HTTPStatus(status_code).phrase
    except ValueError:
        return "http_error"
    return phrase.lower().replace(" ", "_").replace("-", "_")


async def _handle_app_error(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, AppError):  # pragma: no cover - guaranteed by registration
        raise exc
    return error_response(exc.status_code, exc.code, exc.message, headers=exc.headers)


async def _handle_http_exception(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, StarletteHTTPException):  # pragma: no cover
        raise exc
    message = exc.detail if isinstance(exc.detail, str) else HTTPStatus(exc.status_code).phrase
    return error_response(
        exc.status_code, _code_for_status(exc.status_code), message, headers=exc.headers
    )


async def _handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, RequestValidationError):  # pragma: no cover
        raise exc
    # Submitted values are deliberately not echoed back.
    details = [
        FieldErrorDetail(
            field=".".join(str(part) for part in error.get("loc", ())),
            message=str(error.get("msg", "Invalid value")).removeprefix("Value error, "),
        )
        for error in exc.errors()
    ]
    return error_response(422, "validation_error", "The request is invalid.", details=details)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(StarletteHTTPException, _handle_http_exception)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)

from pydantic import BaseModel


class FieldErrorDetail(BaseModel):
    field: str
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: list[FieldErrorDetail] | None = None


class ErrorResponse(BaseModel):
    """Envelope for every non-2xx API response."""

    error: ErrorBody

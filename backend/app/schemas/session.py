import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Same pragmatic format check as the frontend (features/auth/emailValidation.ts).
_EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$")


class MockSignInRequest(BaseModel):
    email: str = Field(max_length=254, examples=["name@company.com"])

    @field_validator("email", mode="before")
    @classmethod
    def _normalise(cls, value: object) -> object:
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def _check_format(cls, value: str) -> str:
        if not _EMAIL_PATTERN.fullmatch(value):
            raise ValueError("must be a valid email address")
        return value


class SessionUser(BaseModel):
    """Only what the user typed. No names, roles or other identity claims are invented."""

    email: str


class SessionResponse(BaseModel):
    mode: Literal["mock"] = Field(
        description='Always "mock": the session is a local development stand-in, not real '
        "authentication."
    )
    user: SessionUser
    expires_at: datetime

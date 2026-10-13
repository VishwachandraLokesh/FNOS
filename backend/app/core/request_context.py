from contextvars import ContextVar

# Set per request by ``RequestContextMiddleware``; read by error handlers and logging.
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)

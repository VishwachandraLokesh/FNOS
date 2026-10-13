import { isRecord } from '../validation';

export type ApiErrorKind =
  /** The server answered with a non-2xx status. */
  | 'http'
  /** No response: offline, DNS, CORS rejection or connection reset. */
  | 'network'
  | 'timeout'
  /** Cancelled by the caller (e.g. component unmounted). Not shown to users. */
  | 'aborted'
  /** The response body was not the expected shape. */
  | 'invalid_response';

interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  cause?: unknown;
}

/** The only error type the API client throws. */
export class ApiError extends Error {
  override name = 'ApiError';
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  /** Machine-readable code from the backend error envelope, when present. */
  readonly code: string | undefined;
  /** Backend request ID, for support and log correlation. */
  readonly requestId: string | undefined;

  constructor({ kind, message, status, code, requestId, cause }: ApiErrorInit) {
    super(message, { cause });
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

interface ErrorEnvelope {
  code: string;
  message: string;
  requestId: string | undefined;
}

/** Reads the backend's `{ "error": { code, message, request_id } }` envelope, if present. */
export function parseErrorEnvelope(body: unknown): ErrorEnvelope | undefined {
  if (!isRecord(body) || !isRecord(body.error)) {
    return undefined;
  }
  const { code, message, request_id: requestId } = body.error;
  if (typeof code !== 'string' || typeof message !== 'string') {
    return undefined;
  }
  return { code, message, requestId: typeof requestId === 'string' ? requestId : undefined };
}

/** A short, user-facing description. Never includes response bodies or stack traces. */
export function describeApiError(error: ApiError): string {
  switch (error.kind) {
    case 'timeout':
      return 'The server took too long to respond.';
    case 'network':
      return 'The server could not be reached.';
    case 'aborted':
      return 'The request was cancelled.';
    case 'invalid_response':
      return 'The server returned an unexpected response.';
    case 'http':
      return error.message;
  }
}

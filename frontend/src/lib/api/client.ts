import { ApiError, parseErrorEnvelope } from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<T> {
  method?: HttpMethod;
  /** Serialised as JSON. */
  body?: unknown;
  signal?: AbortSignal;
  /**
   * Set to "include" only for requests that need cookies (the session endpoints). Omitted means
   * the browser default ("same-origin"), so cookies are not sent to the API by other requests.
   */
  credentials?: 'include';
  /** Validates the decoded JSON and returns it typed. Throw if the shape is wrong. */
  parse: (data: unknown) => T;
}

export interface ApiClient {
  /** `path` is relative to the base URL and must start with "/". Throws only `ApiError`. */
  request<T>(path: string, options: RequestOptions<T>): Promise<T>;
}

export interface ApiClientOptions {
  baseUrl: string;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}

const REQUEST_ID_HEADER = 'X-Request-ID';

export function createApiClient({
  baseUrl,
  timeoutMs,
  fetchFn = globalThis.fetch.bind(globalThis),
}: ApiClientOptions): ApiClient {
  async function request<T>(
    path: string,
    { method = 'GET', body, signal, credentials, parse }: RequestOptions<T>,
  ): Promise<T> {
    if (!path.startsWith('/')) {
      throw new Error(`API path must start with "/": ${path}`);
    }

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const abortFromCaller = () => {
      controller.abort();
    };
    if (signal?.aborted) {
      controller.abort();
    }
    signal?.addEventListener('abort', abortFromCaller, { once: true });

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      let response: Response;
      try {
        response = await fetchFn(`${baseUrl}${path}`, {
          method,
          headers,
          body: body === undefined ? null : JSON.stringify(body),
          signal: controller.signal,
          ...(credentials ? { credentials } : {}),
        });
      } catch (cause) {
        throw transportError(cause, timedOut);
      }

      const requestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
      const data = await readJson(response, () => timedOut);

      if (!response.ok) {
        const envelope = parseErrorEnvelope(data);
        throw new ApiError({
          kind: 'http',
          status: response.status,
          message: envelope?.message ?? `Request failed with status ${String(response.status)}.`,
          ...(envelope ? { code: envelope.code } : {}),
          ...withRequestId(envelope?.requestId ?? requestId),
        });
      }

      try {
        return parse(data);
      } catch (cause) {
        throw new ApiError({
          kind: 'invalid_response',
          status: response.status,
          message: `Unexpected response shape from ${path}.`,
          cause,
          ...withRequestId(requestId),
        });
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  return { request };
}

function transportError(cause: unknown, timedOut: boolean): ApiError {
  if (timedOut) {
    return new ApiError({ kind: 'timeout', message: 'The request timed out.', cause });
  }
  if (cause instanceof DOMException && cause.name === 'AbortError') {
    return new ApiError({ kind: 'aborted', message: 'The request was cancelled.', cause });
  }
  return new ApiError({ kind: 'network', message: 'The server could not be reached.', cause });
}

/** Returns parsed JSON, `undefined` for an empty body, or throws for a malformed body. */
async function readJson(response: Response, hasTimedOut: () => boolean): Promise<unknown> {
  let text: string;
  try {
    text = await response.text();
  } catch (cause) {
    throw transportError(cause, hasTimedOut());
  }
  if (text === '') {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    // A non-JSON error body (e.g. from a proxy) still reports the HTTP failure.
    if (!response.ok) {
      return undefined;
    }
    throw new ApiError({
      kind: 'invalid_response',
      status: response.status,
      message: 'The response was not valid JSON.',
      cause,
    });
  }
}

function withRequestId(requestId: string | undefined): { requestId?: string } {
  return requestId === undefined ? {} : { requestId };
}

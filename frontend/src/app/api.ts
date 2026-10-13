/**
 * RTK Query API for server data (D-30). Features add endpoints with `api.injectEndpoints`.
 *
 * The base query reuses the shared `ApiClient` (base URL, timeout, error envelope, response
 * validation) and turns its errors into plain serialisable objects. A 401 from any endpoint ends
 * the client-side session, so callers never show it as an ordinary loading error.
 */
import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

import { sessionExpired } from '../features/auth/sessionSlice';
import type { ApiClient } from '../lib/api/client';
import { ApiError, describeApiError, type ApiErrorKind } from '../lib/api/errors';
import { isRecord } from '../lib/validation';

export interface ApiRequest {
  /** Relative to the API base URL, starting with "/". */
  path: string;
  /** Validates the response body; the endpoint's result type must match its return type. */
  parse: (data: unknown) => unknown;
  /** "include" only for endpoints that need the session cookie. */
  credentials?: 'include';
}

/** Serialisable error stored in the RTK Query cache. */
export interface ApiQueryError {
  kind: ApiErrorKind;
  status: number | null;
  code: string | null;
  /** User-facing text; never contains response bodies or stack traces. */
  message: string;
  requestId: string | null;
}

export function isUnauthorized(error: unknown): boolean {
  return isRecord(error) && error.status === 401;
}

function hasApiClient(extra: unknown): extra is { apiClient: ApiClient } {
  return (
    isRecord(extra) && isRecord(extra.apiClient) && typeof extra.apiClient.request === 'function'
  );
}

function toQueryError(error: unknown): ApiQueryError {
  if (!(error instanceof ApiError)) {
    console.error('Unexpected error in API request', error);
    return {
      kind: 'invalid_response',
      status: null,
      code: null,
      message: 'Something went wrong. Please try again.',
      requestId: null,
    };
  }
  return {
    kind: error.kind,
    status: error.status ?? null,
    code: error.code ?? null,
    message: describeApiError(error),
    requestId: error.requestId ?? null,
  };
}

const apiClientBaseQuery: BaseQueryFn<ApiRequest, unknown, ApiQueryError> = async (
  { path, parse, credentials },
  { extra, signal, dispatch },
) => {
  if (!hasApiClient(extra)) {
    throw new Error('The store must provide { apiClient } as the thunk extra argument.');
  }
  try {
    const data = await extra.apiClient.request(path, {
      parse,
      signal,
      ...(credentials ? { credentials } : {}),
    });
    return { data };
  } catch (error) {
    const queryError = toQueryError(error);
    if (queryError.status === 401) {
      dispatch(sessionExpired());
    }
    return { error: queryError };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: apiClientBaseQuery,
  endpoints: () => ({}),
});

/**
 * Calls to the backend session endpoints (docs/API.md, D-24). Only these requests send cookies.
 * The session ID lives in an HttpOnly cookie that JavaScript never sees.
 */
import type { ApiClient } from '../../lib/api/client';
import { ApiError } from '../../lib/api/errors';
import { isRecord } from '../../lib/validation';

/** Safe, serialisable session details for display. No identifiers or tokens. */
export interface SessionInfo {
  mode: 'mock';
  email: string;
  /** ISO 8601 timestamp from the server. */
  expiresAt: string;
}

const SESSION_PATH = '/session';

export function parseSession(data: unknown): SessionInfo {
  if (
    isRecord(data) &&
    data.mode === 'mock' &&
    isRecord(data.user) &&
    typeof data.user.email === 'string' &&
    typeof data.expires_at === 'string' &&
    !Number.isNaN(Date.parse(data.expires_at))
  ) {
    return { mode: 'mock', email: data.user.email, expiresAt: data.expires_at };
  }
  throw new Error('Session response does not match the expected shape.');
}

export function createSession(client: ApiClient, email: string): Promise<SessionInfo> {
  return client.request(SESSION_PATH, {
    method: 'POST',
    body: { email },
    credentials: 'include',
    parse: parseSession,
  });
}

/** Returns the current session, or `null` when the server says there is none (401). */
export async function fetchSession(client: ApiClient): Promise<SessionInfo | null> {
  try {
    return await client.request(SESSION_PATH, { credentials: 'include', parse: parseSession });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function deleteSession(client: ApiClient): Promise<void> {
  await client.request(SESSION_PATH, {
    method: 'DELETE',
    credentials: 'include',
    parse: () => undefined,
  });
}

/** User-facing explanation for a failed session request. */
export function describeSessionError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Something went wrong. Please try again.';
  }
  switch (error.kind) {
    case 'network':
    case 'timeout':
      return 'The FNOS API could not be reached. Check that it is running and try again.';
    case 'http':
      if (error.status === 404) {
        return 'Mock sign-in is not enabled on the API (FNOS_MOCK_AUTH_ENABLED).';
      }
      if (error.status === 422) {
        return 'Enter a valid email address, for example name@company.com.';
      }
      return error.message;
    case 'aborted':
    case 'invalid_response':
      return 'The FNOS API returned an unexpected response. Please try again.';
  }
}

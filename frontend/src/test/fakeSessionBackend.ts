import type { ApiClient, RequestOptions } from '../lib/api/client';
import { ApiError } from '../lib/api/errors';
import { isRecord } from '../lib/validation';

export interface RecordedCall {
  method: string;
  path: string;
  credentials: 'include' | undefined;
}

export const networkError = () =>
  new ApiError({ kind: 'network', message: 'The server could not be reached.' });

const notAuthenticated = () =>
  new ApiError({
    kind: 'http',
    status: 401,
    code: 'not_authenticated',
    message: 'You are not signed in or your session has expired.',
  });

/**
 * In-memory stand-in for the backend session endpoints (docs/API.md) behind the ApiClient
 * interface. Responses still go through the caller's real `parse` validators.
 */
export function createFakeSessionBackend({ expiresAt = '2026-10-12T17:00:00Z' } = {}) {
  let sessionEmail: string | null = null;
  let failures: ApiError[] = [];
  let gate: Promise<void> | null = null;
  const calls: RecordedCall[] = [];

  const sessionBody = (email: string) => ({ mode: 'mock', user: { email }, expires_at: expiresAt });

  function respond(path: string, method: string, body: unknown): unknown {
    if (path === '/health') {
      return { status: 'ok', service: 'fnos-api', version: '0.1.0' };
    }
    if (path !== '/session') {
      throw new ApiError({ kind: 'http', status: 404, code: 'not_found', message: 'Not Found' });
    }
    switch (method) {
      case 'POST': {
        const email = isRecord(body) && typeof body.email === 'string' ? body.email : '';
        sessionEmail = email.trim().toLowerCase();
        return sessionBody(sessionEmail);
      }
      case 'GET':
        if (sessionEmail === null) {
          throw notAuthenticated();
        }
        return sessionBody(sessionEmail);
      case 'DELETE':
        sessionEmail = null;
        return undefined;
      default:
        throw new ApiError({ kind: 'http', status: 405, message: 'Method Not Allowed' });
    }
  }

  const client: ApiClient = {
    async request<T>(path: string, options: RequestOptions<T>): Promise<T> {
      const method = options.method ?? 'GET';
      calls.push({ method, path, credentials: options.credentials });
      if (gate) {
        await gate;
      }
      const failure = failures.shift();
      if (failure) {
        throw failure;
      }
      return options.parse(respond(path, method, options.body));
    },
  };

  return {
    client,
    calls,
    sessionCalls: () => calls.filter((call) => call.path === '/session'),
    /** Server-side session already exists (e.g. before a page refresh). */
    signInAs(email: string) {
      sessionEmail = email;
    },
    /** Server forgets the session: expiry or backend restart. */
    dropSession() {
      sessionEmail = null;
    },
    /** The next requests fail with these errors, in order. */
    failNext(...errors: ApiError[]) {
      failures = [...failures, ...errors];
    },
    /** Holds every response until the returned function is called. */
    pause(): () => void {
      let release: () => void = () => undefined;
      gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      return () => {
        gate = null;
        release();
      };
    },
  };
}

export type FakeSessionBackend = ReturnType<typeof createFakeSessionBackend>;

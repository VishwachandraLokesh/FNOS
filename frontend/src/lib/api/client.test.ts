import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from './client';
import { ApiError } from './errors';

const BASE_URL = 'http://api.test/api/v1';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function identity(data: unknown): unknown {
  return data;
}

/** A fetch that never settles until its signal aborts, like a hung server. */
function hangingFetch(): typeof fetch {
  return (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    });
}

async function captureError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      return error;
    }
    throw error;
  }
  throw new Error('Expected the request to fail.');
}

afterEach(() => {
  vi.useRealTimers();
});

describe('createApiClient', () => {
  it('requests base URL + path and returns the parsed body', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ value: 1 }));
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const result = await client.request('/things', {
      parse: (data) => {
        if (typeof data === 'object' && data !== null && 'value' in data) {
          return data.value;
        }
        throw new Error('bad shape');
      },
    });

    expect(result).toBe(1);
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe(`${BASE_URL}/things`);
    expect(init?.method).toBe('GET');
    expect(init?.headers).toEqual({ Accept: 'application/json' });
  });

  it('sends a JSON body with a content type', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const result = await client.request('/things', {
      method: 'POST',
      body: { name: 'x' },
      parse: identity,
    });

    expect(result).toBeUndefined();
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"name":"x"}');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('maps the backend error envelope to an http ApiError', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(
          { error: { code: 'not_found', message: 'Not Found', request_id: 'req-123' } },
          { status: 404 },
        ),
      );
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const error = await captureError(client.request('/missing', { parse: identity }));

    expect(error).toMatchObject({
      kind: 'http',
      status: 404,
      code: 'not_found',
      message: 'Not Found',
      requestId: 'req-123',
    });
  });

  it('reports non-JSON error bodies with a generic message and the header request ID', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('<html>Bad gateway</html>', {
        status: 502,
        headers: { 'X-Request-ID': 'req-502' },
      }),
    );
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const error = await captureError(client.request('/things', { parse: identity }));

    expect(error).toMatchObject({
      kind: 'http',
      status: 502,
      code: undefined,
      message: 'Request failed with status 502.',
      requestId: 'req-502',
    });
  });

  it('reports a network failure', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const error = await captureError(client.request('/things', { parse: identity }));

    expect(error.kind).toBe('network');
  });

  it('aborts and reports a timeout when the server does not answer in time', async () => {
    vi.useFakeTimers();
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn: hangingFetch() });

    const pending = captureError(client.request('/slow', { parse: identity }));
    await vi.advanceTimersByTimeAsync(1000);

    expect((await pending).kind).toBe('timeout');
  });

  it('reports cancellation by the caller as aborted', async () => {
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn: hangingFetch() });
    const controller = new AbortController();

    const pending = captureError(
      client.request('/slow', { parse: identity, signal: controller.signal }),
    );
    controller.abort();

    expect((await pending).kind).toBe('aborted');
  });

  it('rejects a malformed JSON success body', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response('{not json'));
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const error = await captureError(client.request('/things', { parse: identity }));

    expect(error.kind).toBe('invalid_response');
  });

  it('rejects a body that fails validation', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ unexpected: true }));
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn });

    const error = await captureError(
      client.request('/things', {
        parse: () => {
          throw new Error('bad shape');
        },
      }),
    );

    expect(error.kind).toBe('invalid_response');
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('refuses paths that do not start with a slash', async () => {
    const client = createApiClient({ baseUrl: BASE_URL, timeoutMs: 1000, fetchFn: vi.fn() });

    await expect(client.request('things', { parse: identity })).rejects.toThrow(
      'must start with "/"',
    );
  });
});

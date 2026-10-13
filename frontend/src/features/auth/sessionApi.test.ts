import { describe, expect, it } from 'vitest';

import { ApiError } from '../../lib/api/errors';
import { createFakeSessionBackend, networkError } from '../../test/fakeSessionBackend';
import { describeSessionError, fetchSession, parseSession } from './sessionApi';

describe('parseSession', () => {
  it('maps the backend session body to display data', () => {
    expect(
      parseSession({
        mode: 'mock',
        user: { email: 'name@company.com' },
        expires_at: '2026-10-12T17:00:00Z',
      }),
    ).toEqual({ mode: 'mock', email: 'name@company.com', expiresAt: '2026-10-12T17:00:00Z' });
  });

  it.each([
    null,
    { mode: 'real', user: { email: 'a@b.com' }, expires_at: '2026-10-12T17:00:00Z' },
    { mode: 'mock', user: {}, expires_at: '2026-10-12T17:00:00Z' },
    { mode: 'mock', user: { email: 'a@b.com' }, expires_at: 'not a date' },
  ])('rejects %j', (body) => {
    expect(() => parseSession(body)).toThrow();
  });
});

describe('fetchSession', () => {
  it('returns null only for a 401', async () => {
    const backend = createFakeSessionBackend();
    await expect(fetchSession(backend.client)).resolves.toBeNull();

    backend.failNext(networkError());
    await expect(fetchSession(backend.client)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('describeSessionError', () => {
  it.each([
    [networkError(), /could not be reached/],
    [new ApiError({ kind: 'timeout', message: 't' }), /could not be reached/],
    [new ApiError({ kind: 'http', status: 404, message: 'Not Found' }), /not enabled/],
    [new ApiError({ kind: 'http', status: 500, message: 'Server message.' }), /Server message/],
    [new Error('boom'), /Something went wrong/],
  ])('describes %s', (error, expected) => {
    expect(describeSessionError(error)).toMatch(expected);
  });
});

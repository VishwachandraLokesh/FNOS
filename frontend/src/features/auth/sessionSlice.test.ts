import { describe, expect, it } from 'vitest';

import { createAppStore } from '../../app/store';
import { ApiError } from '../../lib/api/errors';
import { createFakeSessionBackend, networkError } from '../../test/fakeSessionBackend';
import { endSession, restoreSession, startSession } from './sessionSlice';

function setup({ sessionEnabled = true } = {}) {
  const backend = createFakeSessionBackend();
  const store = createAppStore({ apiClient: backend.client, sessionEnabled });
  const session = () => store.getState().session;
  return { backend, store, session };
}

describe('session slice', () => {
  it('starts idle and restores an existing server session with credentials', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    expect(session().status).toBe('idle');

    const pending = store.dispatch(restoreSession());
    expect(session().status).toBe('checking');
    await pending;

    expect(session()).toMatchObject({
      status: 'authenticated',
      session: { mode: 'mock', email: 'name@company.com', expiresAt: '2026-10-12T17:00:00Z' },
      pending: null,
      checkError: null,
      signOutError: null,
    });
    expect(backend.sessionCalls()).toEqual([
      { method: 'GET', path: '/session', credentials: 'include' },
    ]);
  });

  it('treats a 401 as signed out', async () => {
    const { store, session } = setup();

    await store.dispatch(restoreSession());

    expect(session()).toMatchObject({ status: 'unauthenticated', session: null, endReason: null });
  });

  it('distinguishes an unreachable API from a 401 and recovers on retry', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    backend.failNext(networkError());

    await store.dispatch(restoreSession());
    expect(session().status).toBe('unavailable');
    expect(session().checkError).toMatch(/could not be reached/);

    await store.dispatch(restoreSession());
    expect(session().status).toBe('authenticated');
    expect(session().checkError).toBeNull();
  });

  it('allows only one session request at a time', async () => {
    const { backend, store, session } = setup();
    const release = backend.pause();

    const first = store.dispatch(restoreSession());
    const duplicate = store.dispatch(restoreSession());
    const signIn = store.dispatch(startSession({ email: 'name@company.com' }));
    release();
    await Promise.all([first, duplicate, signIn]);

    expect(backend.sessionCalls()).toHaveLength(1);
    const signInResult = await signIn;
    expect(startSession.rejected.match(signInResult) && signInResult.meta.condition).toBe(true);
    expect(session().status).toBe('unauthenticated');
  });

  it('signs in and ignores a second sign-in while the first is in flight', async () => {
    const { backend, store, session } = setup();
    await store.dispatch(restoreSession());
    const release = backend.pause();

    const first = store.dispatch(startSession({ email: 'name@company.com' }));
    const second = store.dispatch(startSession({ email: 'name@company.com' }));
    expect(session().pending).toBe('sign-in');
    release();
    await Promise.all([first, second]);

    expect(backend.sessionCalls().filter((call) => call.method === 'POST')).toHaveLength(1);
    expect(session()).toMatchObject({ status: 'authenticated', pending: null });
  });

  it('keeps the user signed out when sign-in is rejected', async () => {
    const { backend, store, session } = setup();
    await store.dispatch(restoreSession());
    backend.failNext(
      new ApiError({ kind: 'http', status: 422, code: 'validation_error', message: 'invalid' }),
    );

    const result = await store.dispatch(startSession({ email: 'name@company.com' }));

    expect(result.payload).toBe('Enter a valid email address, for example name@company.com.');
    expect(session()).toMatchObject({ status: 'unauthenticated', pending: null });
  });

  it('marks the session expired when a re-check returns 401', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    await store.dispatch(restoreSession());

    backend.dropSession();
    const recheck = store.dispatch(restoreSession());
    expect(session().status).toBe('authenticated'); // no loading flash during a re-check
    await recheck;

    expect(session()).toMatchObject({
      status: 'unauthenticated',
      session: null,
      endReason: 'expired',
    });
  });

  it('marks the session unverified, keeping display data, when a re-check cannot reach the API', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    await store.dispatch(restoreSession());
    backend.failNext(networkError());

    await store.dispatch(restoreSession());

    expect(session().status).toBe('unavailable');
    expect(session().session?.email).toBe('name@company.com');
    expect(session().checkError).toMatch(/could not be reached/);

    // The server is the authority: a later 401 ends the session as expired...
    backend.dropSession();
    await store.dispatch(restoreSession());
    expect(session()).toMatchObject({
      status: 'unauthenticated',
      session: null,
      endReason: 'expired',
    });
  });

  it('returns to authenticated when a retry after an unverified re-check succeeds', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    await store.dispatch(restoreSession());
    backend.failNext(networkError());
    await store.dispatch(restoreSession());

    await store.dispatch(restoreSession());

    expect(session()).toMatchObject({ status: 'authenticated', checkError: null });
  });

  it('signs out, and keeps the session with an error if sign-out fails', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    await store.dispatch(restoreSession());

    backend.failNext(networkError());
    await store.dispatch(endSession());
    expect(session()).toMatchObject({ status: 'authenticated', checkError: null });
    expect(session().signOutError).toMatch(/could not be reached/);

    await store.dispatch(endSession());
    expect(session()).toMatchObject({
      status: 'unauthenticated',
      session: null,
      endReason: 'signed-out',
      signOutError: null,
    });
    expect(backend.sessionCalls().filter((call) => call.method === 'DELETE')).toEqual([
      { method: 'DELETE', path: '/session', credentials: 'include' },
      { method: 'DELETE', path: '/session', credentials: 'include' },
    ]);
  });

  it('does not sign out when nobody is signed in', async () => {
    const { backend, store } = setup();
    await store.dispatch(restoreSession());

    await store.dispatch(endSession());

    expect(backend.sessionCalls().filter((call) => call.method === 'DELETE')).toHaveLength(0);
  });

  it('fails closed when sessions are disabled (production builds)', async () => {
    const { backend, store, session } = setup({ sessionEnabled: false });

    expect(session().status).toBe('unauthenticated');
    await store.dispatch(restoreSession());
    await store.dispatch(startSession({ email: 'name@company.com' }));

    expect(backend.calls).toHaveLength(0);
    expect(session().status).toBe('unauthenticated');
  });

  it('holds only serialisable display data, never identifiers or tokens', async () => {
    const { backend, store, session } = setup();
    backend.signInAs('name@company.com');
    await store.dispatch(restoreSession());

    const state = session();
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    expect(Object.keys(state.session ?? {}).sort()).toEqual(['email', 'expiresAt', 'mode']);
    expect(JSON.stringify(state)).not.toMatch(/cookie|token|fnos_mock_session/i);
  });
});

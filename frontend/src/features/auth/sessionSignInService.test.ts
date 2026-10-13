import { describe, expect, it } from 'vitest';

import { createAppStore } from '../../app/store';
import { createFakeSessionBackend, networkError } from '../../test/fakeSessionBackend';
import { createSessionSignInService } from './sessionSignInService';
import { restoreSession } from './sessionSlice';

async function setup() {
  const backend = createFakeSessionBackend();
  const store = createAppStore({ apiClient: backend.client, sessionEnabled: true });
  await store.dispatch(restoreSession());
  return { backend, store, service: createSessionSignInService(store.dispatch) };
}

describe('createSessionSignInService', () => {
  it('is labelled as a development-only mock', async () => {
    const { service } = await setup();

    expect(service.isMock).toBe(true);
    expect(service.methodLabel).toMatch(/mock.*development only/i);
  });

  it('reports a successful sign-in', async () => {
    const { service, store } = await setup();

    await expect(service.signIn({ email: 'name@company.com' })).resolves.toEqual({
      status: 'signed-in',
    });
    expect(store.getState().session.status).toBe('authenticated');
  });

  it('turns API failures into a rejected outcome with a message', async () => {
    const { service, backend } = await setup();
    backend.failNext(networkError());

    const outcome = await service.signIn({ email: 'name@company.com' });

    expect(outcome.status).toBe('rejected');
    expect(outcome).toHaveProperty('message', expect.stringMatching(/could not be reached/));
  });

  it('rejects a sign-in while another session request is running', async () => {
    const { service, backend } = await setup();
    const release = backend.pause();

    const first = service.signIn({ email: 'name@company.com' });
    const second = await service.signIn({ email: 'name@company.com' });
    release();

    expect(second).toEqual({
      status: 'rejected',
      message: 'Please wait for the current request to finish.',
    });
    await expect(first).resolves.toEqual({ status: 'signed-in' });
  });
});

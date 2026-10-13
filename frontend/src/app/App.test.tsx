import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSessionSignInService } from '../features/auth/sessionSignInService';
import { unavailableSignInService } from '../features/auth/signIn';
import { ApiError } from '../lib/api/errors';
import {
  createFakeSessionBackend,
  networkError,
  type FakeSessionBackend,
} from '../test/fakeSessionBackend';
import { App } from './App';
import { routes } from './routes';
import { createAppStore } from './store';

function renderApp(
  path: string,
  { backend = createFakeSessionBackend(), sessionEnabled = true } = {},
) {
  const store = createAppStore({ apiClient: backend.client, sessionEnabled });
  const signInService = sessionEnabled
    ? createSessionSignInService(store.dispatch)
    : unavailableSignInService;
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <App store={store} apiClient={backend.client} signInService={signInService} router={router} />,
  );
  return { backend, store, router };
}

async function signInThroughForm(email = 'name@company.com') {
  await userEvent.type(await screen.findByRole('textbox', { name: 'Email address' }), email);
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

const getCalls = (backend: FakeSessionBackend) =>
  backend.sessionCalls().filter((call) => call.method === 'GET');

afterEach(() => {
  vi.useRealTimers();
});

describe('routing and session', () => {
  it('redirects the root to Login, showing the session check first', async () => {
    const { router } = renderApp('/');

    expect(screen.getByRole('status')).toHaveTextContent('Checking your session…');
    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    expect(
      screen.getByText('Mock sign-in via the local FNOS API (development only)'),
    ).toBeVisible();
  });

  it('shows Login as a full page with its own branded header, outside the shared layout', async () => {
    renderApp('/login');

    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    const banner = screen.getByRole('banner');
    expect(within(banner).getByRole('img', { name: 'Mars Food & Nutrition' })).toBeVisible();
    expect(banner).not.toHaveTextContent('FNOS Automation Engine');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('img', { name: 'FNOS Automation Engine' }),
    );
    // The fruit and shapes are decoration only; the two brand images are the only named images.
    expect(screen.getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual([
      'Mars Food & Nutrition',
      'FNOS Automation Engine',
    ]);
    expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveValue('');
  });

  it('signs in through the API and shows the Dashboard with the mock session indicator', async () => {
    const { backend, router } = renderApp('/login');

    await signInThroughForm(' Name@Company.com ');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/dashboard');
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Mock session');
    expect(banner).toHaveTextContent('name@company.com');
    expect(backend.sessionCalls()).toContainEqual({
      method: 'POST',
      path: '/session',
      credentials: 'include',
    });
  });

  it('shows the server reason when sign-in is rejected and stays on Login', async () => {
    const backend = createFakeSessionBackend();
    const { router } = renderApp('/login', { backend });
    backend.failNext(
      new ApiError({ kind: 'http', status: 422, code: 'validation_error', message: 'invalid' }),
    );

    await signInThroughForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a valid email address');
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByText('Mock session')).not.toBeInTheDocument();
  });

  it('reports an unreachable API on sign-in without treating it as a wrong email', async () => {
    const backend = createFakeSessionBackend();
    renderApp('/login', { backend });
    await screen.findByRole('textbox', { name: 'Email address' });
    backend.failNext(networkError());

    await signInThroughForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be reached');
  });

  it('restores the session after a refresh without asking to sign in again', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');

    renderApp('/dashboard', { backend });

    expect(screen.getByRole('status')).toHaveTextContent('Checking your session…');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(getCalls(backend)).toHaveLength(1);
  });

  it('sends a signed-out user from a protected page to Login, then back after sign-in', async () => {
    const { router } = renderApp('/workspace/FNOS_26_Q3');

    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');

    await signInThroughForm();

    expect(await screen.findByText('Requested report: FNOS_26_Q3')).toBeVisible();
    expect(router.state.location.pathname).toBe('/workspace/FNOS_26_Q3');
  });

  it('redirects a signed-in user away from Login', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    const { router } = renderApp('/login', { backend });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('shows a retryable error, not the Login screen, when the API is down on load', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    backend.failNext(networkError());
    const { router } = renderApp('/dashboard', { backend });

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be reached');
    expect(router.state.location.pathname).toBe('/dashboard');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  it('treats an unknown session after a backend restart as signed out', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    backend.dropSession(); // API restarted: in-memory sessions are gone
    const { router } = renderApp('/dashboard', { backend });

    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('re-checks at expiry and returns to Login with an explanation', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const backend = createFakeSessionBackend({ expiresAt: new Date(Date.now()).toISOString() });
    backend.signInAs('name@company.com');
    const { router } = renderApp('/dashboard', { backend });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();

    backend.dropSession();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Your session has expired');
    expect(router.state.location.pathname).toBe('/login');
    expect(getCalls(backend)).toHaveLength(2);
  });

  it('blocks protected content when a re-check cannot reach the API, then recovers', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const backend = createFakeSessionBackend({ expiresAt: new Date(Date.now()).toISOString() });
    backend.signInAs('name@company.com');
    const { router } = renderApp('/dashboard', { backend });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();

    backend.failNext(networkError());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be reached');
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('name@company.com');
    expect(banner).toHaveTextContent('Session not verified');
    expect(router.state.location.pathname).toBe('/dashboard');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(screen.queryByText('Session not verified')).not.toBeInTheDocument();
  });

  it('signs out from the header, returns to Login and keeps protected pages locked', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    const { router } = renderApp('/workspace/FNOS_26_Q3', { backend });
    await screen.findByText('Requested report: FNOS_26_Q3');

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toBeNull(); // no return to the page signed out from
    expect(screen.queryByText('Mock session')).not.toBeInTheDocument();

    await act(async () => {
      await router.navigate('/dashboard');
    });
    expect(router.state.location.pathname).toBe('/login');
  });

  it('stays signed in and explains when sign-out fails', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    const { router } = renderApp('/dashboard', { backend });
    await screen.findByRole('heading', { name: 'Dashboard' });
    backend.failNext(networkError());

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be reached');
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('makes one session check during rapid navigation and lands on the last route', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    const release = backend.pause();
    const { router } = renderApp('/dashboard', { backend });

    await act(async () => {
      await router.navigate('/workspace/A');
      await router.navigate('/dashboard');
      await router.navigate('/workspace/B');
    });
    release();

    expect(await screen.findByText('Requested report: B')).toBeVisible();
    expect(getCalls(backend)).toHaveLength(1);
  });

  it('sends a single sign-in request when the form is submitted repeatedly', async () => {
    const backend = createFakeSessionBackend();
    renderApp('/login', { backend });
    const email = await screen.findByRole('textbox', { name: 'Email address' });
    await userEvent.type(email, 'name@company.com');
    const release = backend.pause();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await userEvent.click(screen.getByRole('button', { name: 'Signing in…' }));
    await userEvent.type(email, '{Enter}');
    release();

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(backend.sessionCalls().filter((call) => call.method === 'POST')).toHaveLength(1);
  });

  it('fails closed when sessions are disabled (production builds)', async () => {
    const backend = createFakeSessionBackend();
    backend.signInAs('name@company.com');
    const { router } = renderApp('/dashboard', { backend, sessionEnabled: false });

    expect(await screen.findByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    await signInThroughForm();
    expect(await screen.findByRole('alert')).toHaveTextContent('Sign-in is not available yet');
    expect(backend.calls).toHaveLength(0);
  });

  it('keeps the system status page public at /system-status', async () => {
    renderApp('/system-status');

    expect(await screen.findByText('Connected to fnos-api version 0.1.0.')).toBeInTheDocument();
  });

  it.each(['/no-such-page', '/workspace'])('renders the not-found page for %s', (path) => {
    renderApp(path);

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';
import type { SignInOutcome, SignInService } from './signIn';

function createService(isMock = false) {
  const signIn = vi.fn<SignInService['signIn']>();
  const service: SignInService = { methodLabel: 'Test sign-in', isMock, signIn };
  return { service, signIn };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderForm(service: SignInService, onSignedIn = vi.fn()) {
  render(<LoginForm service={service} onSignedIn={onSignedIn} />);
  return {
    onSignedIn,
    email: screen.getByRole('textbox', { name: 'Email address' }),
    submit: screen.getByRole('button', { name: 'Sign in' }),
  };
}

describe('LoginForm', () => {
  it('shows the sign-in method and labels the mock clearly', () => {
    const { service } = createService(true);
    renderForm(service);

    expect(screen.getByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    expect(screen.getByText('Test sign-in')).toBeVisible();
    expect(screen.getByText('Mock')).toBeVisible();
  });

  it('does not show the mock label for a non-mock service', () => {
    const { service } = createService(false);
    renderForm(service);

    expect(screen.queryByText('Mock')).not.toBeInTheDocument();
  });

  it('blocks an empty submission, shows the error and focuses the field', async () => {
    const { service, signIn } = createService();
    const { email, submit } = renderForm(service);

    await userEvent.click(submit);

    expect(signIn).not.toHaveBeenCalled();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter your email address.');
    expect(email).toHaveFocus();
  });

  it('rejects a malformed email and clears the error once corrected', async () => {
    const { service, signIn } = createService();
    const { email, submit } = renderForm(service);

    await userEvent.type(email, 'kianna.carder');
    await userEvent.click(submit);
    expect(email).toHaveAccessibleDescription(
      'Enter a valid email address, for example name@company.com.',
    );
    expect(signIn).not.toHaveBeenCalled();

    await userEvent.type(email, '@company.com');
    expect(email).not.toHaveAttribute('aria-invalid');
  });

  it('submits the trimmed email, shows a busy state and prevents double submission', async () => {
    const { service, signIn } = createService();
    const pending = deferred<SignInOutcome>();
    signIn.mockReturnValue(pending.promise);
    const { email, submit, onSignedIn } = renderForm(service);

    await userEvent.type(email, '  name@company.com ');
    await userEvent.click(submit);

    expect(signIn).toHaveBeenCalledWith({ email: 'name@company.com' });
    const busy = screen.getByRole('button', { name: 'Signing in…' });
    expect(busy).toHaveAttribute('aria-busy', 'true');
    expect(email).toHaveAttribute('readonly');

    await userEvent.click(busy);
    expect(signIn).toHaveBeenCalledTimes(1);

    pending.resolve({ status: 'signed-in' });
    await vi.waitFor(() => {
      expect(onSignedIn).toHaveBeenCalledTimes(1);
    });
  });

  it('shows the reason when sign-in is rejected and allows another attempt', async () => {
    const { service, signIn } = createService();
    signIn.mockResolvedValue({ status: 'rejected', message: 'Account not recognised.' });
    const { email, submit, onSignedIn } = renderForm(service);

    await userEvent.type(email, 'name@company.com');
    await userEvent.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Account not recognised.');
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toHaveAttribute('aria-busy');
    expect(email).not.toHaveAttribute('readonly');
  });

  it('shows a generic message when sign-in fails unexpectedly', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { service, signIn } = createService();
    signIn.mockRejectedValue(new Error('network detail'));
    const { email, submit } = renderForm(service);

    await userEvent.type(email, 'name@company.com');
    await userEvent.click(submit);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Sign-in failed unexpectedly. Please try again.');
    expect(alert).not.toHaveTextContent('network detail');
    expect(consoleError).toHaveBeenCalled();
  });

  it('is fully usable from the keyboard', async () => {
    const { service, signIn } = createService();
    signIn.mockResolvedValue({ status: 'signed-in' });
    const { email, submit, onSignedIn } = renderForm(service);

    await userEvent.tab();
    expect(email).toHaveFocus();
    await userEvent.tab();
    expect(submit).toHaveFocus();

    await userEvent.tab({ shift: true });
    await userEvent.keyboard('name@company.com{Enter}');

    await vi.waitFor(() => {
      expect(onSignedIn).toHaveBeenCalledTimes(1);
    });
  });
});

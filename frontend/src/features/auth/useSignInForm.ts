import { useState, type SubmitEvent } from 'react';

import { validateEmail } from './emailValidation';
import type { SignInOutcome, SignInRequest } from './signIn';

type SubmitState =
  { status: 'idle' } | { status: 'submitting' } | { status: 'failed'; message: string };

const UNEXPECTED_ERROR = 'Sign-in failed unexpectedly. Please try again.';

/** Form state and submission rules for the Login form, independent of how sign-in works. */
export function useSignInForm(
  signIn: (request: SignInRequest) => Promise<SignInOutcome>,
  onSignedIn: () => void,
  /** Called when submission is blocked by a validation error, e.g. to focus the field. */
  onInvalid: () => void,
) {
  const [email, setEmail] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  // Errors appear after the first submit attempt, then update as the user corrects the value.
  const emailError = attempted ? validateEmail(email) : undefined;
  const submitting = submitState.status === 'submitting';

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  async function submit() {
    if (submitting) {
      return;
    }
    setAttempted(true);
    if (validateEmail(email) !== undefined) {
      onInvalid();
      return;
    }

    setSubmitState({ status: 'submitting' });
    let outcome: SignInOutcome;
    try {
      outcome = await signIn({ email: email.trim() });
    } catch (error) {
      console.error('Sign-in failed unexpectedly', error);
      setSubmitState({ status: 'failed', message: UNEXPECTED_ERROR });
      return;
    }
    if (outcome.status === 'rejected') {
      setSubmitState({ status: 'failed', message: outcome.message });
      return;
    }
    setSubmitState({ status: 'idle' });
    onSignedIn();
  }

  return {
    email,
    setEmail,
    emailError,
    submitting,
    submitError: submitState.status === 'failed' ? submitState.message : undefined,
    handleSubmit,
  };
}

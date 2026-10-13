import { useRef } from 'react';

import { Button } from '../../components/Button';
import { ChevronRightIcon } from '../../components/ChevronRightIcon';
import { InlineAlert } from '../../components/InlineAlert';
import { TextField } from '../../components/TextField';
import styles from './LoginForm.module.css';
import type { SignInService } from './signIn';
import { useSignInForm } from './useSignInForm';

interface LoginFormProps {
  service: SignInService;
  onSignedIn: () => void;
}

export function LoginForm({ service, onSignedIn }: LoginFormProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const form = useSignInForm(
    (request) => service.signIn(request),
    onSignedIn,
    () => emailRef.current?.focus(),
  );

  return (
    <form
      className={styles.form}
      noValidate
      aria-labelledby="login-heading"
      onSubmit={form.handleSubmit}
    >
      <h1 id="login-heading" className={styles.heading}>
        Welcome back!
      </h1>

      <p className={styles.method}>
        <UserIcon />
        <span>{service.methodLabel}</span>
        {service.isMock && <span className={styles.mockTag}>Mock</span>}
      </p>

      <TextField
        ref={emailRef}
        className={styles.email}
        label="Email address"
        hideLabel
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        placeholder="name@company.com"
        required
        value={form.email}
        readOnly={form.submitting}
        error={form.emailError}
        onChange={(event) => {
          form.setEmail(event.target.value);
        }}
      />

      {form.submitError && <InlineAlert>{form.submitError}</InlineAlert>}

      <Button type="submit" fullWidth loading={form.submitting} loadingLabel="Signing in…">
        Sign in
        <ChevronRightIcon />
      </Button>
    </form>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.5c1.3-2 3.2-3 5.5-3s4.2 1 5.5 3" />
    </svg>
  );
}

import { Navigate, useLocation } from 'react-router';

import { useAppSelector } from '../../app/hooks';
import marsLogo from '../../assets/brand/mars-food-nutrition-logo.svg';
import wordmark from '../../assets/brand/fnos-automation-engine-wordmark.svg';
import grapes from '../../assets/login/grapes.png';
import { InlineAlert } from '../../components/InlineAlert';
import { LoginBackdrop } from './LoginBackdrop';
import styles from './LoginPage.module.css';
import { LoginForm } from './LoginForm';
import { SessionStatusMessage } from './SessionStatusMessage';
import { selectSession } from './sessionSlice';
import { useSignInService } from './SignInServiceContext';

interface LoginPageProps {
  /** Where to go after sign-in when the user did not arrive from a protected page. */
  redirectTo: string;
}

export function LoginPage({ redirectTo }: LoginPageProps) {
  const service = useSignInService();
  const { status, endReason } = useAppSelector(selectSession);
  const location = useLocation();

  // The only navigation after sign-in: it happens when the session state becomes authenticated,
  // so a slow response or a double submission cannot trigger a second redirect.
  if (status === 'authenticated') {
    return <Navigate to={returnPath(location.state) ?? redirectTo} replace />;
  }

  return (
    <div className={styles.page}>
      <LoginBackdrop />
      <header className={styles.header}>
        <img src={marsLogo} alt="Mars Food & Nutrition" width={105} height={32} />
      </header>
      <main className={styles.main}>
        <div className={styles.wordmark}>
          <img src={wordmark} alt="FNOS Automation Engine" width={346} height={122} />
          <img className={styles.grapes} src={grapes} alt="" aria-hidden="true" />
        </div>
        <div className={styles.card}>
          {status === 'idle' || status === 'checking' ? (
            <SessionStatusMessage>Checking your session…</SessionStatusMessage>
          ) : (
            <div className={styles.stack}>
              {endReason === 'expired' && (
                <InlineAlert>Your session has expired. Please sign in again.</InlineAlert>
              )}
              <LoginForm service={service} onSignedIn={noop} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function noop() {
  // Navigation is driven by the session state (see above).
}

/** Accepts only an in-app path saved by RequireSession, never an external URL. */
function returnPath(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return undefined;
  }
  const { from } = state;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : undefined;
}

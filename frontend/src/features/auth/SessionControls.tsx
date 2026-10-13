import { useNavigate } from 'react-router';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import styles from './SessionControls.module.css';
import { endSession, selectSession } from './sessionSlice';

interface SessionControlsProps {
  loginPath: string;
}

/** Signed-in user, mock indicator and sign-out, shown in the app header. */
export function SessionControls({ loginPath }: SessionControlsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, session, pending, signOutError } = useAppSelector(selectSession);

  if (session === null) {
    return null;
  }
  const verified = status === 'authenticated';

  async function handleSignOut() {
    const result = await dispatch(endSession());
    if (endSession.fulfilled.match(result)) {
      void navigate(loginPath, { replace: true });
    }
  }

  return (
    <div className={styles.controls}>
      {/* `mode` is always "mock" today; real sessions will add other modes (D-24). */}
      <span className={styles.mockTag} title="Development-only mock session; not real sign-in">
        Mock session
      </span>
      <span className={styles.email}>{session.email}</span>
      {!verified && <span className={styles.unverified}>Session not verified</span>}
      {signOutError && (
        <span role="alert" className={styles.error}>
          {signOutError}
        </span>
      )}
      <Button
        variant="secondary"
        loading={pending === 'sign-out'}
        loadingLabel="Signing out…"
        onClick={() => {
          void handleSignOut();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

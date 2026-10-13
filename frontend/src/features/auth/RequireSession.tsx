import { Navigate, Outlet, useLocation } from 'react-router';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { InlineAlert } from '../../components/InlineAlert';
import styles from './RequireSession.module.css';
import { restoreSession, selectSession } from './sessionSlice';
import { SessionStatusMessage } from './SessionStatusMessage';

interface RequireSessionProps {
  loginPath: string;
}

/**
 * Route guard for signed-in pages. This only controls navigation: the backend must still
 * authorise every protected request.
 */
export function RequireSession({ loginPath }: RequireSessionProps) {
  const dispatch = useAppDispatch();
  const { status, checkError, endReason, pending } = useAppSelector(selectSession);
  const location = useLocation();

  switch (status) {
    case 'idle':
    case 'checking':
      return <SessionStatusMessage>Checking your session…</SessionStatusMessage>;
    case 'unavailable':
      return (
        <div role="group" aria-label="Session check failed" className={styles.unavailable}>
          <InlineAlert>{checkError ?? 'The session could not be checked.'}</InlineAlert>
          <Button
            loading={pending === 'restore'}
            loadingLabel="Retrying…"
            onClick={() => {
              void dispatch(restoreSession());
            }}
          >
            Retry
          </Button>
        </div>
      );
    case 'unauthenticated':
      return (
        <Navigate
          to={loginPath}
          replace
          state={
            endReason === 'signed-out' ? undefined : { from: location.pathname + location.search }
          }
        />
      );
    case 'authenticated':
      return <Outlet />;
  }
}

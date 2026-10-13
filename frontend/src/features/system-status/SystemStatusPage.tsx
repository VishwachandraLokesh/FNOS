import { Button } from '../../components/Button';
import { describeApiError } from '../../lib/api/errors';
import styles from './SystemStatusPage.module.css';
import { useHealthStatus } from './useHealthStatus';

/** Temporary landing page confirming the frontend runs and can reach the API. */
export function SystemStatusPage() {
  const { state, retry } = useHealthStatus();

  return (
    <section className={styles.page} aria-labelledby="system-status-heading">
      <h1 id="system-status-heading" className={styles.heading}>
        Development foundation
      </h1>
      <p className={styles.lead}>The FNOS frontend is running.</p>

      <div className={styles.card}>
        <h2 className={styles.cardHeading}>API status</h2>
        {state.status === 'loading' && (
          <p role="status" className={styles.muted}>
            Checking the API…
          </p>
        )}
        {state.status === 'success' && (
          <p role="status" className={styles.ok}>
            Connected to {state.health.service} version {state.health.version}.
          </p>
        )}
        {state.status === 'error' && (
          <div role="alert" className={styles.errorBlock}>
            <p className={styles.error}>{describeApiError(state.error)}</p>
            {state.error.requestId && (
              <p className={styles.muted}>Reference: {state.error.requestId}</p>
            )}
            <Button onClick={retry}>Retry</Button>
          </div>
        )}
      </div>
    </section>
  );
}

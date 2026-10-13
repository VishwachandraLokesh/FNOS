import type { ReactNode } from 'react';

import styles from './SessionStatusMessage.module.css';

/** Polite, non-animated loading message for session checks. */
export function SessionStatusMessage({ children }: { children: ReactNode }) {
  return (
    <p role="status" className={styles.message}>
      {children}
    </p>
  );
}

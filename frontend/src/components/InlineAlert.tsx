import type { ReactNode } from 'react';

import styles from './InlineAlert.module.css';

interface InlineAlertProps {
  children: ReactNode;
}

/** Error message announced immediately to screen readers (`role="alert"`). */
export function InlineAlert({ children }: InlineAlertProps) {
  return (
    <div role="alert" className={styles.alert}>
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';

import styles from './PlaceholderPage.module.css';

interface PlaceholderPageProps {
  title: string;
  children: ReactNode;
}

/** Temporary page for a route whose feature is not built yet. */
export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <section className={styles.page} aria-labelledby="placeholder-heading">
      <h1 id="placeholder-heading" className={styles.heading}>
        {title}
      </h1>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

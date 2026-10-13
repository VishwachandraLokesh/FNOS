import { Outlet } from 'react-router';

import { SessionControls } from '../features/auth/SessionControls';
import { paths } from './paths';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.productName}>FNOS Automation Engine</span>
        <SessionControls loginPath={paths.login} />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

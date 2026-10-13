import { Navigate, type RouteObject } from 'react-router';

import { LoginPage } from '../features/auth/LoginPage';
import { RequireSession } from '../features/auth/RequireSession';
import { DashboardPlaceholderPage } from '../features/dashboard/DashboardPlaceholderPage';
import { SystemStatusPage } from '../features/system-status/SystemStatusPage';
import { WorkspacePlaceholderPage } from '../features/workspace/WorkspacePlaceholderPage';
import { NotFoundPage } from './NotFoundPage';
import { paths } from './paths';
import { RootLayout } from './RootLayout';
import { RouteErrorPage } from './RouteErrorPage';

// RequireSession only controls navigation; it is never a substitute for backend authorisation.
// Login is a full-page screen with its own header (D-30); every other route uses the shared layout.
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: paths.login, element: <LoginPage redirectTo={paths.dashboard} /> },
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Navigate to={paths.login} replace /> },
          {
            element: <RequireSession loginPath={paths.login} />,
            children: [
              { path: paths.dashboard, element: <DashboardPlaceholderPage /> },
              { path: '/workspace/:reportId', element: <WorkspacePlaceholderPage /> },
            ],
          },
          { path: paths.systemStatus, element: <SystemStatusPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

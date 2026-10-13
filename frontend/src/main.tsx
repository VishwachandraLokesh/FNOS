import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App } from './app/App';
import { ConfigErrorScreen } from './app/ConfigErrorScreen';
import { routes } from './app/routes';
import { createAppStore } from './app/store';
import { ConfigError, loadConfig } from './config/env';
import { createSessionSignInService } from './features/auth/sessionSignInService';
import { unavailableSignInService } from './features/auth/signIn';
import { createApiClient } from './lib/api/client';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Root element #root not found in index.html.');
}
const root = createRoot(container);

try {
  const config = loadConfig();
  const apiClient = createApiClient({ baseUrl: config.apiBaseUrl, timeoutMs: config.apiTimeoutMs });
  // Mock sessions exist only in the Vite dev server. Production builds fail closed: no session
  // requests are made and sign-in is unavailable until real Entra ID sign-in exists (D-22, D-24).
  const sessionEnabled = import.meta.env.DEV;
  const store = createAppStore({ apiClient, sessionEnabled });
  const signInService = sessionEnabled
    ? createSessionSignInService(store.dispatch)
    : unavailableSignInService;
  root.render(
    <StrictMode>
      <App
        store={store}
        apiClient={apiClient}
        signInService={signInService}
        router={createBrowserRouter(routes)}
      />
    </StrictMode>,
  );
} catch (error) {
  if (!(error instanceof ConfigError)) {
    throw error;
  }
  console.error(error);
  root.render(<ConfigErrorScreen message={error.message} />);
}

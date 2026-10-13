import { Provider } from 'react-redux';
import { RouterProvider, type createBrowserRouter } from 'react-router';

import { SessionBootstrap } from '../features/auth/SessionBootstrap';

import { SignInServiceContext } from '../features/auth/SignInServiceContext';
import type { SignInService } from '../features/auth/signIn';
import { ApiClientContext } from '../lib/api/ApiClientContext';
import type { ApiClient } from '../lib/api/client';
import type { AppStore } from './store';

type AppRouter = ReturnType<typeof createBrowserRouter>;

interface AppProps {
  store: AppStore;
  apiClient: ApiClient;
  signInService: SignInService;
  router: AppRouter;
}

export function App({ store, apiClient, signInService, router }: AppProps) {
  return (
    <Provider store={store}>
      <ApiClientContext value={apiClient}>
        <SignInServiceContext value={signInService}>
          <SessionBootstrap />
          <RouterProvider router={router} />
        </SignInServiceContext>
      </ApiClientContext>
    </Provider>
  );
}

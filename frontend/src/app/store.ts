import { configureStore } from '@reduxjs/toolkit';

import { createInitialSessionState, sessionReducer } from '../features/auth/sessionSlice';
import type { ApiClient } from '../lib/api/client';
import { api } from './api';

/** Dependencies available to thunks as `extra`. */
export interface ThunkExtra {
  apiClient: ApiClient;
}

interface AppStoreOptions {
  apiClient: ApiClient;
  /** False in production builds: session requests are never made and every route stays locked. */
  sessionEnabled: boolean;
}

export function createAppStore({ apiClient, sessionEnabled }: AppStoreOptions) {
  return configureStore({
    reducer: { session: sessionReducer, [api.reducerPath]: api.reducer },
    preloadedState: { session: createInitialSessionState(sessionEnabled) },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: { apiClient } satisfies ThunkExtra },
      }).concat(api.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

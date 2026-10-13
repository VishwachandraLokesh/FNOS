import type { AppDispatch } from '../../app/store';
import type { SignInService } from './signIn';
import { startSession } from './sessionSlice';

/**
 * DEVELOPMENT-ONLY sign-in through the backend mock session API (D-24). Used by the Vite dev
 * server; production builds use `unavailableSignInService` instead.
 */
export function createSessionSignInService(dispatch: AppDispatch): SignInService {
  return {
    methodLabel: 'Mock sign-in via the local FNOS API (development only)',
    isMock: true,
    async signIn({ email }) {
      const result = await dispatch(startSession({ email }));
      if (startSession.fulfilled.match(result)) {
        return { status: 'signed-in' };
      }
      if (result.meta.condition) {
        return { status: 'rejected', message: 'Please wait for the current request to finish.' };
      }
      return { status: 'rejected', message: result.payload ?? 'Sign-in failed. Please try again.' };
    },
  };
}

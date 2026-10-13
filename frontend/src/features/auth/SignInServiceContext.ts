import { createContext, use } from 'react';

import type { SignInService } from './signIn';

export const SignInServiceContext = createContext<SignInService | null>(null);

export function useSignInService(): SignInService {
  const service = use(SignInServiceContext);
  if (service === null) {
    throw new Error('useSignInService must be used inside <SignInServiceContext value={...}>.');
  }
  return service;
}

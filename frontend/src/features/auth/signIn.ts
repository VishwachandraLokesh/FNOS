/**
 * Boundary between the Login UI and whatever performs sign-in.
 *
 * The UI depends only on this interface. Real Entra ID sign-in and the backend session contract
 * are not implemented yet; until they are, `main.tsx` supplies the development-only mock in
 * `./mock/` or the "unavailable" service below. Nothing here issues tokens or grants access.
 */

export interface SignInRequest {
  email: string;
}

export type SignInOutcome = { status: 'signed-in' } | { status: 'rejected'; message: string };

export interface SignInService {
  /** Describes how sign-in happens, shown on the Login screen. */
  readonly methodLabel: string;
  /** True for the development mock, so the UI can label it clearly. */
  readonly isMock: boolean;
  /** Resolves with the outcome. Rejects only for unexpected failures. */
  signIn(request: SignInRequest): Promise<SignInOutcome>;
}

/** Used in production builds until a real sign-in implementation exists. */
export const unavailableSignInService: SignInService = {
  methodLabel: 'Sign-in is not available in this build',
  isMock: false,
  signIn: () =>
    Promise.resolve({
      status: 'rejected',
      message: 'Sign-in is not available yet. Contact the FNOS team.',
    }),
};

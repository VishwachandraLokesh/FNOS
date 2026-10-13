/**
 * Client-side view of the backend session (the server is the source of truth).
 *
 * Holds only safe display data and request status. The session ID stays in an HttpOnly cookie
 * and never enters JavaScript, Redux or browser storage. At most one session request runs at a
 * time; thunks dispatched while another is in flight are skipped (`condition`).
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { ThunkExtra } from '../../app/store';
import {
  createSession,
  deleteSession,
  describeSessionError,
  fetchSession,
  type SessionInfo,
} from './sessionApi';

export type SessionStatus =
  /** Not checked yet. */
  | 'idle'
  /** First check in progress. */
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  /**
   * The server could not be asked (API unreachable or broken), so the session is unverified.
   * Any previous `session` display data is kept, but this is never treated as signed in.
   */
  | 'unavailable';

export interface SessionState {
  /** False in production builds until real sign-in exists: nothing can authenticate. */
  enabled: boolean;
  status: SessionStatus;
  /** Display data from the last server confirmation. Only `authenticated` means it is valid now. */
  session: SessionInfo | null;
  pending: 'restore' | 'sign-in' | 'sign-out' | null;
  /** Why the session could not be checked (shown with `unavailable`). */
  checkError: string | null;
  /** Why the last sign-out failed (shown in the header). */
  signOutError: string | null;
  /** Why the last session ended, so the Login screen can explain it. */
  endReason: 'signed-out' | 'expired' | null;
  /** Changes on every completed check; lets the expiry timer reschedule. */
  lastCheckId: string | null;
}

export function createInitialSessionState(enabled: boolean): SessionState {
  return {
    enabled,
    status: enabled ? 'idle' : 'unauthenticated',
    session: null,
    pending: null,
    checkError: null,
    signOutError: null,
    endReason: null,
    lastCheckId: null,
  };
}

const createSessionThunk = createAsyncThunk.withTypes<{
  state: { session: SessionState };
  extra: ThunkExtra;
  rejectValue: string;
}>();

const canStartRequest = ({ session }: { session: SessionState }) =>
  session.enabled && session.pending === null;

/** GET /session: on start-up, on retry and when the session should have expired. */
export const restoreSession = createSessionThunk(
  'session/restore',
  async (_: undefined, { extra, rejectWithValue }) => {
    try {
      return await fetchSession(extra.apiClient);
    } catch (error) {
      return rejectWithValue(describeSessionError(error));
    }
  },
  { condition: (_, { getState }) => canStartRequest(getState()) },
);

/** POST /session (mock sign-in). */
export const startSession = createSessionThunk(
  'session/start',
  async ({ email }: { email: string }, { extra, rejectWithValue }) => {
    try {
      return await createSession(extra.apiClient, email);
    } catch (error) {
      return rejectWithValue(describeSessionError(error));
    }
  },
  { condition: (_, { getState }) => canStartRequest(getState()) },
);

/** DELETE /session. */
export const endSession = createSessionThunk(
  'session/end',
  async (_: undefined, { extra, rejectWithValue }) => {
    try {
      await deleteSession(extra.apiClient);
      return undefined;
    } catch (error) {
      return rejectWithValue(describeSessionError(error));
    }
  },
  {
    condition: (_, { getState }) =>
      canStartRequest(getState()) && getState().session.session !== null,
  },
);

const sessionSlice = createSlice({
  name: 'session',
  initialState: createInitialSessionState(true),
  reducers: {
    /** A protected request returned 401: the server no longer accepts the session. */
    sessionExpired(state) {
      if (state.session === null) {
        return;
      }
      state.status = 'unauthenticated';
      state.session = null;
      state.endReason = 'expired';
      state.checkError = null;
      state.signOutError = null;
    },
  },
  selectors: {
    selectSession: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.pending = 'restore';
        // A re-check while signed in keeps the UI as it is until the answer arrives.
        if (state.status !== 'authenticated') {
          state.status = 'checking';
        }
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.pending = null;
        state.checkError = null;
        state.lastCheckId = action.meta.requestId;
        if (action.payload) {
          state.status = 'authenticated';
          state.session = action.payload;
          state.endReason = null;
        } else {
          state.endReason = state.session === null ? null : 'expired';
          state.status = 'unauthenticated';
          state.session = null;
          state.signOutError = null;
        }
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.pending = null;
        state.lastCheckId = action.meta.requestId;
        // The server could not confirm the session: never assume it is still valid. Keep the
        // display data so the user can see who was signed in while retrying.
        state.status = 'unavailable';
        state.checkError = action.payload ?? 'The session could not be checked.';
      })
      .addCase(startSession.pending, (state) => {
        state.pending = 'sign-in';
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.pending = null;
        state.status = 'authenticated';
        state.session = action.payload;
        state.endReason = null;
        state.checkError = null;
        state.signOutError = null;
      })
      .addCase(startSession.rejected, (state) => {
        state.pending = null;
      })
      .addCase(endSession.pending, (state) => {
        state.pending = 'sign-out';
        state.signOutError = null;
      })
      .addCase(endSession.fulfilled, (state) => {
        state.pending = null;
        state.status = 'unauthenticated';
        state.session = null;
        state.endReason = 'signed-out';
        state.checkError = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.pending = null;
        state.signOutError = action.payload ?? 'Sign-out failed. Please try again.';
      });
  },
});

export const sessionReducer = sessionSlice.reducer;
export const { sessionExpired } = sessionSlice.actions;
export const { selectSession } = sessionSlice.selectors;

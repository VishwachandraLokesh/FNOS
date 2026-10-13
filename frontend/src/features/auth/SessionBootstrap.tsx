import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { restoreSession, selectSession } from './sessionSlice';

const MIN_RECHECK_MS = 30_000;
const MAX_TIMER_MS = 2_147_483_647;

/**
 * Restores the session on start-up and re-checks it with the server when it should have expired.
 * Renders nothing. Duplicate dispatches (e.g. React StrictMode) are skipped by the thunk.
 */
export function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const { status, session, lastCheckId } = useAppSelector(selectSession);
  const expiresAt = status === 'authenticated' ? session?.expiresAt : undefined;

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(restoreSession());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (expiresAt === undefined) {
      return;
    }
    // Ask the server shortly after the expiry time; never sooner than MIN_RECHECK_MS so a skewed
    // client clock cannot cause a request loop.
    const delay = Math.min(
      Math.max(Date.parse(expiresAt) - Date.now() + 1000, MIN_RECHECK_MS),
      MAX_TIMER_MS,
    );
    const timer = setTimeout(() => {
      void dispatch(restoreSession());
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, expiresAt, lastCheckId]);

  return null;
}

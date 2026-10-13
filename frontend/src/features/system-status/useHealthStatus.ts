import { useCallback, useEffect, useState } from 'react';

import { useApiClient } from '../../lib/api/ApiClientContext';
import { ApiError } from '../../lib/api/errors';
import { fetchHealthStatus, type HealthStatus } from './api';

export type HealthState =
  | { status: 'loading' }
  | { status: 'success'; health: HealthStatus }
  | { status: 'error'; error: ApiError };

export function useHealthStatus(): { state: HealthState; retry: () => void } {
  const client = useApiClient();
  const [state, setState] = useState<HealthState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchHealthStatus(client, controller.signal).then(
      (health) => {
        setState({ status: 'success', health });
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({ status: 'error', error: toApiError(error) });
      },
    );
    return () => {
      controller.abort();
    };
  }, [client, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  return { state, retry };
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  // The client only throws ApiError; anything else is a programming error worth surfacing.
  console.error('Unexpected error while checking API health', error);
  return new ApiError({ kind: 'invalid_response', message: 'Unexpected error.', cause: error });
}

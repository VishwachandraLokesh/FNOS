import { vi } from 'vitest';

import type { ApiClient, RequestOptions } from '../lib/api/client';

/**
 * An ApiClient backed by a mock: queue raw responses with `mockResolvedValueOnce` or errors with
 * `mockRejectedValueOnce`. Responses still go through the caller's real `parse` validator.
 */
export function createFakeApiClient() {
  const request = vi.fn<(path: string) => Promise<unknown>>();
  const client: ApiClient = {
    request: async <T>(path: string, options: RequestOptions<T>): Promise<T> =>
      options.parse(await request(path)),
  };
  return { client, request };
}

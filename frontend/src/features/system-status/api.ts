import type { ApiClient } from '../../lib/api/client';
import { isRecord } from '../../lib/validation';

/** Response of `GET /api/v1/health` (backend `HealthResponse`). */
export interface HealthStatus {
  status: 'ok';
  service: string;
  version: string;
}

export function parseHealthStatus(data: unknown): HealthStatus {
  if (
    isRecord(data) &&
    data.status === 'ok' &&
    typeof data.service === 'string' &&
    typeof data.version === 'string'
  ) {
    return { status: 'ok', service: data.service, version: data.version };
  }
  throw new Error('Health response does not match the expected shape.');
}

export function fetchHealthStatus(client: ApiClient, signal: AbortSignal): Promise<HealthStatus> {
  return client.request('/health', { signal, parse: parseHealthStatus });
}

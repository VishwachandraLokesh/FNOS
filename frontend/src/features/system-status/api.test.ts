import { describe, expect, it } from 'vitest';

import { parseHealthStatus } from './api';

describe('parseHealthStatus', () => {
  it('accepts the backend health payload', () => {
    expect(parseHealthStatus({ status: 'ok', service: 'fnos-api', version: '0.1.0' })).toEqual({
      status: 'ok',
      service: 'fnos-api',
      version: '0.1.0',
    });
  });

  it.each([
    null,
    'ok',
    [],
    { status: 'down', service: 'fnos-api', version: '0.1.0' },
    { status: 'ok', service: 'fnos-api' },
    { status: 'ok', service: 1, version: '0.1.0' },
  ])('rejects %j', (payload) => {
    expect(() => parseHealthStatus(payload)).toThrow();
  });
});

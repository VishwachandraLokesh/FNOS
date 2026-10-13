import { describe, expect, it } from 'vitest';

import { ConfigError, parseConfig } from './env';

describe('parseConfig', () => {
  it('accepts a valid base URL and timeout', () => {
    expect(
      parseConfig({
        VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
        VITE_API_TIMEOUT_MS: '5000',
      }),
    ).toEqual({ apiBaseUrl: 'http://localhost:8000/api/v1', apiTimeoutMs: 5000 });
  });

  it('removes trailing slashes and defaults the timeout', () => {
    expect(parseConfig({ VITE_API_BASE_URL: ' https://api.example.com/api/v1/ ' })).toEqual({
      apiBaseUrl: 'https://api.example.com/api/v1',
      apiTimeoutMs: 15_000,
    });
  });

  it.each([
    [undefined, /is required/],
    ['', /is required/],
    ['not a url', /not a valid URL/],
    ['ftp://example.com', /http or https/],
    ['http://user:pass@example.com', /credentials/],
    ['http://example.com/api?x=1', /query/],
  ])('rejects base URL %j', (value, message) => {
    expect(() => parseConfig({ VITE_API_BASE_URL: value })).toThrow(message);
  });

  it.each(['abc', '0', '999', '120001', '1500.5'])('rejects timeout %j', (value) => {
    expect(() =>
      parseConfig({ VITE_API_BASE_URL: 'http://localhost:8000', VITE_API_TIMEOUT_MS: value }),
    ).toThrow(ConfigError);
  });

  it('reports every problem at once', () => {
    expect(() => parseConfig({ VITE_API_TIMEOUT_MS: 'abc' })).toThrow(
      /VITE_API_BASE_URL is required[\s\S]*VITE_API_TIMEOUT_MS must be/,
    );
  });
});

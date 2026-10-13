/**
 * Frontend runtime configuration, read from Vite `VITE_*` variables and validated at startup.
 * These values are public (compiled into the bundle): never use them for secrets.
 */

export interface AppConfig {
  /** API base URL including the version prefix, without a trailing slash. */
  readonly apiBaseUrl: string;
  readonly apiTimeoutMs: number;
}

export class ConfigError extends Error {
  override name = 'ConfigError';
}

const DEFAULT_API_TIMEOUT_MS = 15_000;
const MIN_API_TIMEOUT_MS = 1_000;
const MAX_API_TIMEOUT_MS = 120_000;

type RawEnv = Readonly<Record<string, string | undefined>>;

export function parseConfig(raw: RawEnv): AppConfig {
  const problems: string[] = [];
  const apiBaseUrl = parseApiBaseUrl(raw.VITE_API_BASE_URL, problems);
  const apiTimeoutMs = parseApiTimeout(raw.VITE_API_TIMEOUT_MS, problems);

  if (apiBaseUrl === undefined || problems.length > 0) {
    throw new ConfigError(`Invalid frontend configuration:\n- ${problems.join('\n- ')}`);
  }
  return { apiBaseUrl, apiTimeoutMs };
}

export function loadConfig(): AppConfig {
  return parseConfig({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_TIMEOUT_MS: import.meta.env.VITE_API_TIMEOUT_MS,
  });
}

function parseApiBaseUrl(value: string | undefined, problems: string[]): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    problems.push('VITE_API_BASE_URL is required (see frontend/.env.example).');
    return undefined;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    problems.push(`VITE_API_BASE_URL is not a valid URL: "${trimmed}".`);
    return undefined;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    problems.push('VITE_API_BASE_URL must use http or https.');
    return undefined;
  }
  if (url.search || url.hash || url.username || url.password) {
    problems.push('VITE_API_BASE_URL must not contain credentials, a query or a fragment.');
    return undefined;
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

function parseApiTimeout(value: string | undefined, problems: string[]): number {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_API_TIMEOUT_MS;
  }
  const timeout = Number(trimmed);
  if (!Number.isInteger(timeout) || timeout < MIN_API_TIMEOUT_MS || timeout > MAX_API_TIMEOUT_MS) {
    problems.push(
      `VITE_API_TIMEOUT_MS must be a whole number between ${String(MIN_API_TIMEOUT_MS)} and ${String(MAX_API_TIMEOUT_MS)}.`,
    );
    return DEFAULT_API_TIMEOUT_MS;
  }
  return timeout;
}

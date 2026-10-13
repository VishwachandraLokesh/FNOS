/** Application URLs. Build links from these instead of repeating string literals. */
export const paths = {
  login: '/login',
  dashboard: '/dashboard',
  workspace: (reportId: string) => `/workspace/${encodeURIComponent(reportId)}`,
  systemStatus: '/system-status',
} as const;

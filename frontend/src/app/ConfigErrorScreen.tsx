interface ConfigErrorScreenProps {
  message: string;
}

/** Rendered instead of the app when the frontend environment configuration is invalid. */
export function ConfigErrorScreen({ message }: ConfigErrorScreenProps) {
  return (
    <main style={{ padding: 'var(--space-8)' }}>
      <h1>Configuration error</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{message}</pre>
    </main>
  );
}

import { useEffect } from 'react';
import { useRouteError } from 'react-router';

/** Shown when rendering a route throws. Details go to the console, not the screen. */
export function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    console.error('Unhandled route error', error);
  }, [error]);

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>Reload the page to try again.</p>
    </main>
  );
}

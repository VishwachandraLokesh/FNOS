import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ApiClientContext } from '../../lib/api/ApiClientContext';
import type { ApiClient } from '../../lib/api/client';
import { ApiError } from '../../lib/api/errors';
import { createFakeApiClient } from '../../test/fakeApiClient';
import { SystemStatusPage } from './SystemStatusPage';

function renderPage(client: ApiClient) {
  return render(
    <ApiClientContext value={client}>
      <SystemStatusPage />
    </ApiClientContext>,
  );
}

describe('SystemStatusPage', () => {
  it('shows a loading state, then the connected API version', async () => {
    const { client, request } = createFakeApiClient();
    request.mockResolvedValueOnce({ status: 'ok', service: 'fnos-api', version: '0.1.0' });

    renderPage(client);

    expect(screen.getByRole('status')).toHaveTextContent('Checking the API');
    expect(await screen.findByText('Connected to fnos-api version 0.1.0.')).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith('/health');
  });

  it('shows an error with the request reference and recovers on retry', async () => {
    const { client, request } = createFakeApiClient();
    request
      .mockRejectedValueOnce(
        new ApiError({ kind: 'network', message: 'offline', requestId: 'req-9' }),
      )
      .mockResolvedValueOnce({ status: 'ok', service: 'fnos-api', version: '0.1.0' });

    renderPage(client);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The server could not be reached.');
    expect(alert).toHaveTextContent('Reference: req-9');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Connected to fnos-api version 0.1.0.')).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
  });
});

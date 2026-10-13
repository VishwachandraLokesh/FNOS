import { useParams } from 'react-router';

import { PlaceholderPage } from '../../components/PlaceholderPage';

export function WorkspacePlaceholderPage() {
  const { reportId } = useParams();

  return (
    <PlaceholderPage title="PowerPoint Workspace">
      <p>The PowerPoint Workspace is not built yet. It is planned for milestone M2.</p>
      {reportId && <p>Requested report: {reportId}</p>}
    </PlaceholderPage>
  );
}

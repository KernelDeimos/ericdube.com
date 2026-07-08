import { useLoaderData } from 'react-router';
import Container from '~/components/Container';
import { getRecentPublishes } from '~/nexus/store.server';

export async function loader() {
  return { publishes: getRecentPublishes() };
}

export function meta() {
  return [{ title: 'Nexus — EricDubé.com' }];
}

export default function Nexus() {
  const { publishes } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nexus feed</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Snapshots published here by claude-nexus over the local bridge.
      </p>
      {publishes.length === 0 && (
        <p style={{ color: '#94a3b8' }}>Nothing published yet.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {publishes.map((entry) => (
          <li key={entry.id} style={{
            border: '2px solid #ffffff5d',
            borderRadius: '0.75rem',
            padding: '1rem',
            backgroundColor: 'rgba(34, 49, 58, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>{entry.source} → {entry.key} ({entry.type})</span>
              <span>{new Date(entry.receivedAt).toLocaleString()}</span>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {JSON.stringify(entry.items, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </Container>
  );
}

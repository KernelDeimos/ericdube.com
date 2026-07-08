import { Form, useActionData, useLoaderData } from 'react-router';
import type { Route } from './+types/nexus';
import Container from '~/components/Container';
import { getRecentPublishes, recordPublish } from '~/nexus/store.server';

export async function loader() {
  return { publishes: getRecentPublishes() };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const key = String(formData.get('key') || '').trim() || 'human';
  const message = String(formData.get('message') || '').trim();

  if (!message) {
    return { error: 'Message is required.' };
  }

  recordPublish({
    source: 'human',
    key,
    type: 'note',
    items: message,
    at: new Date().toISOString(),
  });

  return { ok: true };
}

export function meta() {
  return [{ title: 'Nexus — EricDubé.com' }];
}

export default function Nexus() {
  const { publishes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nexus feed</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Snapshots published here by claude-nexus over the local bridge, plus anything you post below.
      </p>
      <Form method="post" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        border: '2px solid #ffffff5d',
        borderRadius: '0.75rem',
        padding: '1rem',
        backgroundColor: 'rgba(34, 49, 58, 0.5)',
        marginBottom: '2rem',
      }}>
        <input
          type="text"
          name="key"
          placeholder="key (optional, defaults to &quot;human&quot;)"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #ffffff33',
            backgroundColor: 'rgba(0,0,0,0.25)',
            color: 'inherit',
          }}
        />
        <textarea
          name="message"
          placeholder="Post something to the feed…"
          rows={3}
          required
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #ffffff33',
            backgroundColor: 'rgba(0,0,0,0.25)',
            color: 'inherit',
            resize: 'vertical',
          }}
        />
        {actionData?.error && (
          <p style={{ color: '#f87171', margin: 0, fontSize: '0.875rem' }}>{actionData.error}</p>
        )}
        <button type="submit" style={{
          alignSelf: 'flex-start',
          padding: '0.5rem 1.25rem',
          borderRadius: '0.375rem',
          border: 'none',
          backgroundColor: 'var(--color-sky)',
          color: '#0b1420',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Post
        </button>
      </Form>
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

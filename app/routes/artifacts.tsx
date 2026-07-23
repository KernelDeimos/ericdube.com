import { useLoaderData } from 'react-router';
import Container from '~/components/Container';
import { type AiInfo, designationLabel } from '~/lib/ai';
import { listArtifacts } from '~/lib/nexus';

type Artifact = {
  title: string;
  slug: string;
  kind: string | null;
  description: string | null;
  accent: string | null;
  publishedAt: string | null;
  ai: AiInfo | null;
};

export async function loader() {
  // Artifacts now come from the local claude-nexus node (previously Sanity).
  const artifacts: Artifact[] = (await listArtifacts()).map((a) => ({
    title: a.title,
    slug: a.slug,
    kind: a.kind,
    description: a.description,
    accent: a.accent,
    publishedAt: a.publishedAt,
    ai: a.ai,
  }));
  return { artifacts };
}

export function meta() {
  return [
    { title: 'Artifacts — EricDubé.com' },
    {
      name: 'description',
      content:
        'Self-contained interactive pages — dashboards, maps, and visualizations — each a single HTML document.',
    },
  ];
}

const gridStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '1.5rem',
} as const;

function ArtifactCard({ a }: { a: Artifact }) {
  const accent = a.accent || '#89b4fa';
  const aiLabel = designationLabel(a.ai?.designation);
  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-CA') : null;
  return (
    <li>
      <a
        href={`/artifacts/${a.slug}`}
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          height: '100%',
        }}
      >
        <div style={{ height: '6px', background: accent }} />
        <div style={{ padding: '1.1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {a.kind && (
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: accent,
                  fontWeight: 700,
                }}
              >
                {a.kind}
              </span>
            )}
            {aiLabel && (
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '999px',
                  padding: '1px 8px',
                }}
              >
                {aiLabel}
              </span>
            )}
          </div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{a.title}</h3>
          {a.description && (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {a.description}
            </p>
          )}
          <span
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: '0.9rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: accent, fontWeight: 600 }}>
              Open artifact →
            </span>
            {date && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{date}</span>}
          </span>
        </div>
      </a>
    </li>
  );
}

export default function Artifacts() {
  const { artifacts } = useLoaderData<typeof loader>();
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Artifacts</h1>
      <p style={{ color: '#94a3b8', maxWidth: '62ch', marginBottom: '2rem', lineHeight: 1.6 }}>
        Self-contained interactive pages — each is a single HTML document with everything inline (no
        external scripts, styles, or fonts). Built with Claude Code; opens full-screen.
      </p>
      {artifacts.length === 0 ? (
        <p style={{ color: '#64748b' }}>No artifacts yet.</p>
      ) : (
        <ul style={gridStyle}>
          {artifacts.map((a) => (
            <ArtifactCard key={a.slug} a={a} />
          ))}
        </ul>
      )}
    </Container>
  );
}

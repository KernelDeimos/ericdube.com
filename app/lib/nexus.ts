// Server-side client for the local claude-nexus node — the source of truth for
// Artifacts (they used to live in the Sanity MCP). The node runs on the SAME
// server; NEXUS_URL points at it and NEXUS_TOKEN (configured on the server)
// authenticates. Never import this into client code: it would leak the token.

const NEXUS_URL = (process.env.NEXUS_URL ?? 'http://127.0.0.1:42067').replace(/\/$/, '');
const NEXUS_TOKEN = process.env.NEXUS_TOKEN ?? '';

export type NexusArtifact = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  kind: string | null;
  accent: string | null;
  ai: { designation: string | null; score: number | null } | null;
  publishedAt: string | null;
  url: string;
};

function headers(): Record<string, string> {
  const h: Record<string, string> = { accept: 'application/json' };
  if (NEXUS_TOKEN) h['x-nexus-token'] = NEXUS_TOKEN;
  return h;
}

async function nexusFetch(path: string): Promise<Response> {
  const res = await fetch(`${NEXUS_URL}${path}`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`nexus ${path} -> ${res.status} ${res.statusText}`);
  }
  return res;
}

// Metadata for the artifacts index, newest published first. Each artifact needs
// a stable URL id: prefer its slug, but fall back to the id so the page still
// works against a nexus node whose build predates slugs (otherwise a version
// skew would silently show "No artifacts yet." even though the node has them).
// The single-artifact route resolves either form.
export async function listArtifacts(): Promise<NexusArtifact[]> {
  const { artifacts } = (await (await nexusFetch('/api/artifacts')).json()) as {
    artifacts: NexusArtifact[];
  };
  return (artifacts ?? [])
    .map((a) => ({ ...a, slug: a.slug || a.id }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

// One artifact's self-contained HTML, addressed by slug. Returns null on 404 so
// the route can throw a clean 404 response.
export async function getArtifactHtml(slug: string): Promise<string | null> {
  const res = await fetch(`${NEXUS_URL}/api/artifacts/${encodeURIComponent(slug)}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`nexus artifact "${slug}" -> ${res.status}`);
  const doc = (await res.json()) as { html?: string | null };
  return doc.html ?? null;
}

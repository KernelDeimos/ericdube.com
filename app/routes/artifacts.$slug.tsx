import { getArtifactHtml } from '~/lib/nexus';

// Resource route (no default export): serves the artifact's self-contained HTML
// document verbatim at /artifacts/<slug>, exactly as authored. The document is
// now sourced from the local claude-nexus node (previously Sanity), addressed by
// slug. Mirrors the standalone public/demos/*.html pattern.
export async function loader({ params }: { params: { slug: string } }) {
  const html = await getArtifactHtml(params.slug);

  if (!html) {
    throw new Response('Artifact not found', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

import { getArtifact } from '~/lib/nexus';

// Resource route (no default export): serves the artifact's self-contained HTML
// document verbatim at /artifacts/<slug>, exactly as authored. The document is
// now sourced from the local claude-nexus node (previously Sanity), addressed by
// slug. Mirrors the standalone public/demos/*.html pattern.
export async function loader({ params }: { params: { slug: string } }) {
  const artifact = await getArtifact(params.slug);

  if (!artifact) {
    throw new Response('Artifact not found', { status: 404 });
  }

  // An unlisted artifact is share-by-link: it stays reachable, but a crawler
  // that finds the URL must not put it in an index, and a shared cache must not
  // hand it to anyone else. Without this, "unlisted" leaks via search the first
  // time someone posts the link somewhere public.
  const unlisted = artifact.visibility === 'unlisted';

  return new Response(artifact.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': unlisted ? 'private, max-age=300' : 'public, max-age=300',
      ...(unlisted ? { 'X-Robots-Tag': 'noindex, nofollow, noarchive' } : {}),
    },
  });
}

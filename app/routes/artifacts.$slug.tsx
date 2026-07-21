import { client } from '~/sanity/client';

// Resource route (no default export): serves the artifact's self-contained HTML
// document verbatim at /artifacts/<slug>, exactly as authored. Content-managed in
// Sanity (the `artifact` type). Mirrors the standalone public/demos/*.html pattern.
export async function loader({ params }: { params: { slug: string } }) {
  const doc = await client.fetch<{ html?: string | null } | null>(
    `*[_type == "artifact" && slug.current == $slug][0]{ "html": html.code }`,
    { slug: params.slug }
  );

  if (!doc?.html) {
    throw new Response('Artifact not found', { status: 404 });
  }

  return new Response(doc.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

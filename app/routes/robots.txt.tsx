// robots.txt computed per request, never a maintained file — so the Sitemap
// line always points at the host the visitor actually reached (each brand's own
// domain), not a hardcoded one.

import { requestOrigin } from '~/lib/website';

export async function loader({ request }: { request: Request }) {
  const origin = requestOrigin(request);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

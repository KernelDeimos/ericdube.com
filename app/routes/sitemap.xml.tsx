// A sitemap computed per request, never a maintained file. It reflects the
// brand the host resolves to: only the tabs that brand offers, and — for the
// content tabs it offers — the live detail pages pulled from Sanity. So each
// brand advertises exactly its own live URLs, and adding a post or a brand needs
// no redeploy.

import {
  resolveWebsite,
  requestOrigin,
  enabledTabs,
  TAB_META,
  type SiteTab,
} from '~/lib/website';
import { client } from '~/sanity/client';

/** Absolute, trailing-slashed URL for a path under this origin — the same
 *  canonical form the root loader's redirect enforces. */
function loc(origin: string, path: string): string {
  if (path === '/') return `${origin}/`;
  return origin + (path.endsWith('/') ? path : `${path}/`);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  const origin = requestOrigin(request);
  const tabs = enabledTabs(website);
  const has = (tab: SiteTab) => tabs.includes(tab);

  const entries: { url: string; lastmod?: string }[] = [];

  // The static pages this brand offers (home plus whatever it curated).
  for (const tab of tabs) {
    entries.push({ url: loc(origin, TAB_META[tab].path) });
  }

  // Content detail pages, gated on the brand offering that section — a brand
  // that hides Articles must not advertise its posts here. A CMS hiccup drops
  // the detail pages rather than failing the whole sitemap.
  if (has('articles')) {
    try {
      const articles = await client.fetch<{ slug: string; publishedAt: string | null }[]>(
        `*[_type == "article" && defined(slug.current)]{ "slug": slug.current, publishedAt }`
      );
      for (const a of articles) {
        entries.push({ url: loc(origin, `/articles/${a.slug}`), lastmod: a.publishedAt ?? undefined });
      }
    } catch {
      /* leave article URLs out this render */
    }
  }

  if (has('weird-food')) {
    try {
      const foods = await client.fetch<{ slug: string; foundAt: string | null }[]>(
        `*[_type == "weirdFood" && defined(slug.current)]{ "slug": slug.current, foundAt }`
      );
      for (const f of foods) {
        entries.push({ url: loc(origin, `/weird-food/${f.slug}`), lastmod: f.foundAt ?? undefined });
      }
    } catch {
      /* leave weird-food URLs out this render */
    }
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (e) =>
          `  <url><loc>${xmlEscape(e.url)}</loc>` +
          (e.lastmod ? `<lastmod>${xmlEscape(e.lastmod)}</lastmod>` : '') +
          `</url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// One place that builds a page's <head> SEO: title, description, canonical
// link, Open Graph and Twitter cards. Every route calls seoMeta() so the tags
// stay consistent and no page has to hand-assemble the same dozen descriptors.
//
// meta() runs without a request, so the absolute origin is published by the
// root loader and read back off the `root` match here. og:url and the canonical
// link use the trailing-slash form the root loader's redirect enforces, so all
// three agree on the one canonical URL.

import { siteTitleFrom, type SiteMetaMatch } from './website';

/** The absolute origin (protocol + host) this request arrived on, as put on the
 *  root loader's data. '' before the root loader has run (e.g. error states). */
export function originFrom(matches: readonly SiteMetaMatch[] | undefined): string {
  const root = matches?.find((match) => match?.id === 'root');
  const data = root?.data as { origin?: string } | undefined;
  return data?.origin ?? '';
}

/** Trailing-slash canonical form of a path; home stays '/'. Matches the
 *  redirect in the root loader so canonical/og:url never disagree with it. */
export function canonicalPath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/** The page's absolute canonical URL, or null when no origin is known. */
export function canonicalUrl(
  matches: readonly SiteMetaMatch[] | undefined,
  pathname: string
): string | null {
  const origin = originFrom(matches);
  return origin ? origin + canonicalPath(pathname) : null;
}

type SeoInput = {
  matches: readonly SiteMetaMatch[] | undefined;
  location: { pathname: string };
  title: string;
  description?: string | null;
  type?: 'website' | 'article';
  /** An absolute image URL (Sanity CDN URLs already are). Omitted when absent —
   *  an og:image pointing at nothing is worse than none. */
  image?: string | null;
};

/** The full SEO head for a page. Description and image are only emitted when
 *  present, matching the site's rule that an empty meta is worse than no meta. */
export function seoMeta({
  matches,
  location,
  title,
  description,
  type = 'website',
  image,
}: SeoInput) {
  const siteName = siteTitleFrom(matches);
  const url = canonicalUrl(matches, location.pathname);
  const desc = description?.trim() || null;

  const tags: Record<string, unknown>[] = [{ title }];
  if (desc) tags.push({ name: 'description', content: desc });
  if (url) tags.push({ tagName: 'link', rel: 'canonical', href: url });

  // Open Graph
  tags.push({ property: 'og:title', content: title });
  if (desc) tags.push({ property: 'og:description', content: desc });
  tags.push({ property: 'og:type', content: type });
  tags.push({ property: 'og:site_name', content: siteName });
  if (url) tags.push({ property: 'og:url', content: url });
  if (image) tags.push({ property: 'og:image', content: image });

  // Twitter cards — plain meta tags, no API key. A card with an image is the
  // large variant; without one it falls back to the compact summary.
  tags.push({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
  tags.push({ name: 'twitter:title', content: title });
  if (desc) tags.push({ name: 'twitter:description', content: desc });
  if (image) tags.push({ name: 'twitter:image', content: image });

  return tags;
}

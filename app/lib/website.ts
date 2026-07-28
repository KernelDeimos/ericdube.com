// Whitelabel resolution: the request's Host header selects which `website`
// document drives branding, navigation and content. One instance serves every
// brand, so adding a brand is a Sanity document rather than a deploy.

import { client } from '~/sanity/client';

export type SiteTab =
  | 'home'
  | 'services'
  | 'articles'
  | 'demos'
  | 'artifacts'
  | 'musings'
  | 'weird-food';

export type Website = {
  _id: string | null;
  name: string;
  domains: string[] | null;
  isDefault: boolean | null;
  siteTitle: string;
  tagline: string | null;
  logo: { asset: object; alt: string | null } | null;
  accentPrimary: string | null;
  accentSecondary: string | null;
  backgroundColor: string | null;
  bannerAnimation: string | null;
  tabs: SiteTab[] | null;
  serviceIds: string[] | null;
  contactEmail: string | null;
  schedulingUrl: string | null;
  seoDescription: string | null;
};

/** Label and path for every tab, so navigation renders from config alone. */
export const TAB_META: Record<SiteTab, { label: string; path: string }> = {
  home: { label: 'Home', path: '/' },
  services: { label: 'Services', path: '/services' },
  articles: { label: 'Articles', path: '/articles' },
  demos: { label: 'Demos', path: '/demos' },
  artifacts: { label: 'Artifacts', path: '/artifacts' },
  musings: { label: 'Musings', path: '/musings' },
  'weird-food': { label: 'Weird Food', path: '/weird-food' },
};

const ALL_TABS = Object.keys(TAB_META) as SiteTab[];

/**
 * The header links shown when a brand has not curated its own list. This is the
 * nav as it stood before whitelabelling, deliberately excluding Musings: that
 * route has always been reachable but unlinked, and listing it now would be a
 * visible change to the existing site rather than a new capability.
 */
const DEFAULT_NAV_TABS: SiteTab[] = [
  'home',
  'services',
  'articles',
  'demos',
  'artifacts',
  'weird-food',
];

/**
 * Used when no `website` document matches and none is marked default —
 * including the case where the list is empty because none have been authored
 * yet. Without this the site would 500 the moment this code shipped, so the
 * un-whitelabelled behaviour stays the fallback rather than an error.
 */
const BUILT_IN_DEFAULT: Website = {
  _id: null,
  name: 'Built-in default',
  domains: null,
  isDefault: true,
  siteTitle: 'EricDubé.com',
  tagline: null,
  logo: null,
  accentPrimary: null,
  accentSecondary: null,
  backgroundColor: null,
  bannerAnimation: 'random',
  tabs: null, // null means "every tab", matching pre-whitelabel behaviour
  serviceIds: null,
  contactEmail: null,
  schedulingUrl: null,
  seoDescription: null,
};

/**
 * "WWW.Example.COM:443" and "example.com" should match the same brand, but a
 * dev host keeps its port because localhost:5173 and localhost:3333 are
 * genuinely different sites.
 */
function normalizeHost(host: string): string[] {
  const lower = host.trim().toLowerCase();
  const withoutWww = lower.replace(/^www\./, '');
  const withoutPort = withoutWww.replace(/:\d+$/, '');
  // Ordered most specific first; a domain list may legitimately pin a port.
  return [...new Set([lower, withoutWww, withoutPort])];
}

const WEBSITE_PROJECTION = `{
  _id,
  name,
  domains,
  isDefault,
  siteTitle,
  tagline,
  logo { asset, alt },
  accentPrimary,
  accentSecondary,
  backgroundColor,
  bannerAnimation,
  tabs,
  "serviceIds": services[]->_id,
  contactEmail,
  schedulingUrl,
  seoDescription
}`;

/**
 * The hostname the visitor actually typed. Behind a reverse proxy the `host`
 * header is the internal upstream (localhost:3102), not the brand's domain, so
 * every brand would resolve to the default. `x-forwarded-host` carries the
 * original and wins where present; it may hold a comma-separated chain, and
 * only the first entry is the client-facing one.
 *
 * This mirrors how React Router itself picks a host for its action-origin
 * check, so whitelabel resolution and CSRF agree on what the site is called.
 */
function requestHost(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-host');
  const first = forwarded?.split(',')[0]?.trim();
  return first || request.headers.get('host') || '';
}

export async function resolveWebsite(request: Request): Promise<Website> {
  const candidates = normalizeHost(requestHost(request));

  let websites: Website[] = [];
  try {
    websites = await client.fetch<Website[]>(`*[_type == "website"] ${WEBSITE_PROJECTION}`);
  } catch {
    // A CMS hiccup should degrade to the plain site, not take every brand down.
    return BUILT_IN_DEFAULT;
  }

  const matched = websites.find((site) =>
    (site.domains ?? []).some((domain) => {
      const normalized = normalizeHost(domain);
      return normalized.some((d) => candidates.includes(d));
    })
  );
  if (matched) return matched;

  return websites.find((site) => site.isDefault) ?? BUILT_IN_DEFAULT;
}

function curatedTabs(website: Website): SiteTab[] | null {
  const tabs = website.tabs?.filter((tab): tab is SiteTab => tab in TAB_META);
  return tabs && tabs.length > 0 ? tabs : null;
}

/**
 * Which routes this brand may serve. A brand that has not curated a list keeps
 * every route reachable — "unlinked but visitable" stays possible, and only an
 * explicit curation makes a section 404.
 */
export function enabledTabs(website: Website): SiteTab[] {
  return curatedTabs(website) ?? ALL_TABS;
}

/** Which links the header shows — not the same set as what is reachable. */
export function navTabs(website: Website): SiteTab[] {
  return curatedTabs(website) ?? DEFAULT_NAV_TABS;
}

export function isTabEnabled(website: Website, tab: SiteTab): boolean {
  return enabledTabs(website).includes(tab);
}

/**
 * Guard for a route belonging to a tab this brand does not offer. A section
 * left out of the nav must not merely be unlinked — it has to be unreachable,
 * or a client's site still serves someone else's content to anyone who guesses
 * the URL.
 */
export function requireTab(website: Website, tab: SiteTab): void {
  if (!isTabEnabled(website, tab)) {
    throw new Response('Not found', { status: 404 });
  }
}

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

/**
 * The colour fields were plain hex strings before the Studio gained a colour
 * picker, which stores an object instead. Both shapes are accepted so a
 * document authored under the old schema keeps rendering rather than losing its
 * branding the moment the picker ships.
 */
export type ColorValue = string | { hex?: string | null } | null;

/** Narrow either colour shape to something a CSS custom property can take. */
export function colorHex(value: ColorValue): string | null {
  if (!value) return null;
  const hex = typeof value === 'string' ? value : value.hex;
  if (!hex) return null;
  // Interpolated straight into a <style> block, so anything that is not
  // unambiguously a hex colour is dropped rather than escaped.
  return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex.trim())
    ? hex.trim()
    : null;
}

/**
 * Whether text on this background needs to be dark. The site is built dark
 * first, but a brand is free to pick a pale background, and the chrome — nav
 * links, the wordmark veil — has to follow or it becomes invisible against it.
 * Relative luminance per WCAG, thresholded where the contrast of the light and
 * dark foregrounds crosses over.
 */
export function isLightBackground(hex: string): boolean {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3 || raw.length === 4
      ? raw
          .slice(0, 3)
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.slice(0, 6);
  if (full.length !== 6) return false;

  const channel = (pair: string) => {
    const v = parseInt(pair, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(full.slice(0, 2)) +
    0.7152 * channel(full.slice(2, 4)) +
    0.0722 * channel(full.slice(4, 6));
  return luminance > 0.4;
}

export type Website = {
  _id: string | null;
  name: string;
  domains: string[] | null;
  isDefault: boolean | null;
  siteTitle: string;
  tagline: string | null;
  logo: { asset: object; alt: string | null } | null;
  accentPrimary: ColorValue;
  accentSecondary: ColorValue;
  backgroundColor: ColorValue;
  bannerAnimation: string | null;
  bannerUrl: string | null;
  bannerHtml: string | null;
  bannerHeight: number | null;
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
  bannerUrl: null,
  bannerHtml: null,
  bannerHeight: null,
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
  bannerUrl,
  bannerHtml,
  bannerHeight,
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

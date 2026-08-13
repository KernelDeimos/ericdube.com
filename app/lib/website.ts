// Whitelabel resolution: the request's Host header selects which `website`
// document drives branding, navigation and content. One instance serves every
// brand, so adding a brand is a Sanity document rather than a deploy.

import { client } from '~/sanity/client';

export type SiteTab =
  | 'home'
  | 'about'
  | 'ai-workflow'
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

/**
 * Every theme token that has to change on a pale background, as one block.
 *
 * The counterpart dark values live in app.css. Both sets must stay in step: a
 * token defined there and forgotten here silently keeps its dark value on a
 * light brand, which is a contrast bug rather than an obvious break.
 */
export const LIGHT_THEME_TOKENS = [
  '--site-foreground: #0f172a;',
  '--site-foreground-muted: #475569;',
  '--site-foreground-subtle: #64748b;',
  // Veil colours flip with the theme; their strength stays a brand's to set, so
  // both variants scale from the same custom property (see app.css).
  '--site-wordmark-veil: rgb(255 255 255 / calc(0.55 * var(--site-veil-strength)));',
  '--site-nav-veil: rgb(15 23 42 / calc(0.06 * var(--site-veil-strength)));',
  '--site-surface: rgba(15, 23, 42, 0.04);',
  '--site-surface-strong: rgba(15, 23, 42, 0.08);',
  '--site-surface-subtle: rgba(15, 23, 42, 0.05);',
  '--site-border: rgba(15, 23, 42, 0.18);',
  '--site-border-subtle: rgba(15, 23, 42, 0.1);',
  '--site-card-border: rgba(15, 23, 42, 0.15);',
  '--site-input-bg: #ffffff;',
  '--site-on-accent: #0f172a;',
  '--site-danger: #dc2626;',
  '--site-danger-text: #b91c1c;',
  '--site-info: #1d4ed8;',
  // Sky is too faint on a pale background; the step number and title take the
  // dark foreground instead so they stay legible and still match each other.
  '--site-step-title: #0f172a;',
].join(' ');

/** The built-in title, used before any brand is resolved. */
export const DEFAULT_SITE_TITLE = 'EricDubé.com';

/**
 * The brand's name for use in a route's page title.
 *
 * `meta` runs without loader data of its own, so the brand is read off the
 * layout match every page shares. Routes rendered outside that layout — the
 * full-bleed demo and artifact pages — have no brand to read and fall back to
 * the built-in title.
 */
export type SiteMetaMatch = { id?: string; data?: unknown } | undefined;

export function siteTitleFrom(matches: readonly SiteMetaMatch[] | undefined) {
  const layout = matches?.find((match) => match?.id === 'routes/_layout');
  const data = layout?.data as { website?: { siteTitle?: string | null } } | undefined;
  return data?.website?.siteTitle || DEFAULT_SITE_TITLE;
}

/**
 * Per-brand CSS adjustments, grouped by the part of the site they touch. Every
 * field is optional; a brand that sets nothing keeps the built-in look. Mirrors
 * the `appearance` object in the Studio schema, and is turned into CSS custom
 * properties by appearanceTokens.
 */
export type Appearance = {
  header?: {
    wordmarkRadius?: number | null;
    wordmarkCorners?: string[] | null;
    wordmarkPadding?: number | null;
    navRadius?: number | null;
    navCorners?: string[] | null;
    navPadding?: number | null;
    navGap?: number | null;
  } | null;
  cards?: {
    radius?: number | null;
    padding?: number | null;
    borderWidth?: number | null;
    borderColor?: ColorValue;
    background?: ColorValue;
  } | null;
} | null;

export type Website = {
  _id: string | null;
  name: string;
  domains: string[] | null;
  isDefault: boolean | null;
  siteTitle: string;
  tagline: string | null;
  logo: { asset: object; alt: string | null } | null;
  showTitleWithLogo: boolean | null;
  favicon: { asset: object } | null;
  socialHeading: string | null;
  socialLinks: { label: string; url: string }[] | null;
  accentPrimary: ColorValue;
  accentSecondary: ColorValue;
  backgroundColor: ColorValue;
  bannerAnimation: string | null;
  bannerUrl: string | null;
  bannerHtml: string | null;
  bannerHeight: number | null;
  headerBlur: number | null;
  headerVeilStrength: number | null;
  navBackground: ColorValue;
  navForeground: string | null;
  appearance: Appearance;
  homePage: unknown[] | null;
  tags: string[] | null;
  aboutPageId: string | null;
  servicesPageId: string | null;
  tabs: SiteTab[] | null;
  serviceIds: string[] | null;
  contactEmail: string | null;
  schedulingUrl: string | null;
  seoDescription: string | null;
  /**
   * The brand's Google tag (gtag.js) measurement ID, e.g. "G-XXXXXXXXXX". When
   * set, this brand — and only this brand — renders the Google tag on every
   * page. Left empty, the brand runs no analytics, so the tag is opt-in per
   * brand rather than a hardcoded check for one of them.
   */
  googleTagId: string | null;
};

/**
 * The subset of a brand that is safe to hand to the browser.
 *
 * A loader's return value is serialised into the page, so anything the layout
 * returns is readable in the HTML of every route. The full document carries the
 * brand's contact address, its enquiry tags and its whole home page — none of
 * which the chrome renders. The address in particular was deliberately kept out
 * of client code once already; sending the whole document undid that and put it
 * on every page for a scraper to lift.
 */
export type PublicWebsite = Pick<
  Website,
  | 'siteTitle'
  | 'tagline'
  | 'logo'
  | 'showTitleWithLogo'
  | 'appearance'
  | 'favicon'
  | 'accentPrimary'
  | 'accentSecondary'
  | 'backgroundColor'
  | 'bannerAnimation'
  | 'bannerUrl'
  | 'bannerHtml'
  | 'bannerHeight'
  | 'headerBlur'
  | 'headerVeilStrength'
  | 'navBackground'
  | 'navForeground'
>;

export function publicWebsite(website: Website): PublicWebsite {
  return {
    siteTitle: website.siteTitle,
    tagline: website.tagline,
    logo: website.logo,
    showTitleWithLogo: website.showTitleWithLogo,
    appearance: website.appearance,
    favicon: website.favicon,
    accentPrimary: website.accentPrimary,
    accentSecondary: website.accentSecondary,
    backgroundColor: website.backgroundColor,
    bannerAnimation: website.bannerAnimation,
    bannerUrl: website.bannerUrl,
    bannerHtml: website.bannerHtml,
    bannerHeight: website.bannerHeight,
    headerBlur: website.headerBlur,
    headerVeilStrength: website.headerVeilStrength,
    navBackground: website.navBackground,
    navForeground: website.navForeground,
  };
}

/**
 * The header's blur and veil strength as CSS declarations, or '' for a brand
 * that has set neither.
 *
 * Both are clamped rather than trusted. They come from a CMS field and are
 * interpolated into a `<style>` block, so a non-number or a wild value has to be
 * impossible here rather than merely unlikely — the same reason colorHex refuses
 * anything that is not a hex colour. The upper bounds are the point at which the
 * setting stops being a setting: past ~80px of blur the banner is a smear, and a
 * veil at 3x is opaque enough to be a solid bar.
 */
export function headerTokens(website: {
  headerBlur?: number | null;
  headerVeilStrength?: number | null;
}): string {
  const clamp = (value: unknown, min: number, max: number): number | null =>
    typeof value === 'number' && Number.isFinite(value)
      ? Math.min(Math.max(value, min), max)
      : null;

  const blur = clamp(website.headerBlur, 0, 80);
  const veil = clamp(website.headerVeilStrength, 0, 3);

  return [
    blur === null ? '' : `--site-header-blur: ${blur}px;`,
    veil === null ? '' : `--site-veil-strength: ${veil};`,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The two foreground pairs the navbar can take, matching the site's dark and
 * light themes so nav text sits in the same palette as the rest of the chrome.
 */
const NAV_FOREGROUND = {
  light: '--site-nav-foreground: #e2e8f0; --site-nav-foreground-muted: #94a3b8;',
  dark: '--site-nav-foreground: #0f172a; --site-nav-foreground-muted: #475569;',
} as const;

/**
 * The navbar's own background and text colour, as CSS declarations, or '' when
 * a brand has set neither.
 *
 * A brand can give the nav a solid background distinct from the header tint — a
 * darker bar over a busy or pale banner — and choose whether its links read as
 * light or dark, or are picked automatically for contrast. 'auto' reads the
 * luminance of whatever the text actually sits on: the nav background when one
 * is set, otherwise the brand background. A brand that sets neither field keeps
 * the themed foreground it already had, so this is additive rather than a change
 * to the existing nav.
 */
export function navTokens(website: {
  navBackground?: ColorValue;
  navForeground?: string | null;
  backgroundColor?: ColorValue;
}): string {
  const background = colorHex(website.navBackground ?? null);
  const mode = website.navForeground;

  let foreground: 'light' | 'dark' | null = null;
  if (mode === 'light' || mode === 'dark') {
    foreground = mode;
  } else if (mode === 'auto') {
    // Contrast against the bar's own colour where it has one; otherwise the
    // page behind it. With neither known, the dark theme is the site's default.
    const reference = background ?? colorHex(website.backgroundColor ?? null);
    foreground = reference && isLightBackground(reference) ? 'dark' : 'light';
  }

  return [
    background ? `--site-nav-veil: ${background};` : '',
    foreground ? NAV_FOREGROUND[foreground] : '',
  ]
    .filter(Boolean)
    .join(' ');
}

// CSS border-radius takes its four values in this order.
const RADIUS_CORNERS = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const;

/** A clamped pixel length, or null for anything that is not a finite number. */
function lengthPx(value: unknown, max = 500): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${Math.min(Math.max(value, 0), max)}px`
    : null;
}

/**
 * A border-radius shorthand from a radius and the corners it applies to. An
 * empty or absent corner list rounds all four; otherwise the listed corners get
 * the radius and the rest get 0 — the mechanism behind rounding just the
 * wordmark's bottom-right corner.
 */
function borderRadiusValue(radius: unknown, corners: string[] | null | undefined): string | null {
  const r = lengthPx(radius, 200);
  if (!r) return null;
  const set = corners && corners.length ? new Set(corners) : null;
  return RADIUS_CORNERS.map((corner) => (!set || set.has(corner) ? r : '0')).join(' ');
}

/**
 * The brand's Appearance adjustments as CSS custom-property declarations, or ''
 * for a brand that has set none. Same shape as headerTokens/navTokens: values
 * come from a CMS field and are interpolated into a `<style>` block, so every
 * one is clamped or run through colorHex rather than trusted, and an unset field
 * emits nothing so the component's built-in default stands.
 */
export function appearanceTokens(appearance: Appearance): string {
  const header = appearance?.header;
  const cards = appearance?.cards;

  // [custom property, resolved value]. A null value drops the declaration, so
  // an unset field leaves the component's built-in default in place.
  const declarations: [string, string | null][] = [
    ['--site-wordmark-radius', borderRadiusValue(header?.wordmarkRadius, header?.wordmarkCorners)],
    ['--site-wordmark-padding', lengthPx(header?.wordmarkPadding)],
    ['--site-nav-radius', borderRadiusValue(header?.navRadius, header?.navCorners)],
    ['--site-nav-padding', lengthPx(header?.navPadding)],
    ['--site-nav-gap', lengthPx(header?.navGap)],
    ['--site-card-radius', lengthPx(cards?.radius, 200)],
    ['--site-card-padding', lengthPx(cards?.padding)],
    ['--site-card-border-width', lengthPx(cards?.borderWidth, 12)],
    ['--site-card-border-color', colorHex(cards?.borderColor ?? null)],
    ['--site-card-bg', colorHex(cards?.background ?? null)],
  ];

  return declarations
    .filter(([, value]) => value)
    .map(([property, value]) => `${property}: ${value};`)
    .join(' ');
}

/** Label and path for every tab, so navigation renders from config alone. */
export const TAB_META: Record<SiteTab, { label: string; path: string }> = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About', path: '/about' },
  'ai-workflow': { label: 'AI Workflow', path: '/ai-workflow' },
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
  showTitleWithLogo: null,
  favicon: null,
  socialHeading: null,
  socialLinks: null,
  accentPrimary: null,
  accentSecondary: null,
  backgroundColor: null,
  bannerAnimation: 'random',
  bannerUrl: null,
  bannerHtml: null,
  bannerHeight: null,
  headerBlur: null,
  headerVeilStrength: null,
  navBackground: null,
  navForeground: null,
  appearance: null,
  homePage: null,
  tags: null,
  aboutPageId: null,
  servicesPageId: null,
  tabs: null, // null means "every tab", matching pre-whitelabel behaviour
  serviceIds: null,
  contactEmail: null,
  schedulingUrl: null,
  seoDescription: null,
  googleTagId: null,
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
  showTitleWithLogo,
  favicon { asset },
  socialHeading,
  socialLinks[] { label, url },
  accentPrimary,
  accentSecondary,
  backgroundColor,
  bannerAnimation,
  bannerUrl,
  bannerHtml,
  bannerHeight,
  headerBlur,
  headerVeilStrength,
  navBackground,
  navForeground,
  appearance,
  homePage[]{...},
  tags,
  tabs,
  "serviceIds": services[]->_id,
  "aboutPageId": aboutPage->_id,
  "servicesPageId": servicesPage->_id,
  contactEmail,
  schedulingUrl,
  seoDescription,
  googleTagId
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
  // Local override: `WEBSITE_DOMAIN=coherentconstructs.com npm run dev` resolves
  // that brand without spoofing a Host header. Deliberately ignored in
  // production — a stray env var must never pin every visitor to one brand, the
  // whole point of whitelabelling being that the host picks the brand, not the
  // server. Read inside the function and behind a typeof guard so it never runs
  // (or references `process`) in the browser bundle this module is part of.
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    const override = process.env.WEBSITE_DOMAIN?.trim();
    if (override) return override;
  }

  const forwarded = request.headers.get('x-forwarded-host');
  const first = forwarded?.split(',')[0]?.trim();
  return first || request.headers.get('host') || '';
}

/**
 * The brand a request resolves to, out of a set of rows: the one whose domains
 * match the host, else the one marked default, else null. Shared by
 * resolveWebsite and resolveGoogleTagId so host resolution can never differ
 * between the chrome and the analytics tag — the tag must follow exactly the
 * brand the page does.
 */
function pickForHost<T extends { domains: string[] | null; isDefault: boolean | null }>(
  rows: T[],
  request: Request
): T | null {
  const candidates = normalizeHost(requestHost(request));
  const matched = rows.find((site) =>
    (site.domains ?? []).some((domain) =>
      normalizeHost(domain).some((d) => candidates.includes(d))
    )
  );
  return matched ?? rows.find((site) => site.isDefault) ?? null;
}

export async function resolveWebsite(request: Request): Promise<Website> {
  let websites: Website[] = [];
  try {
    websites = await client.fetch<Website[]>(`*[_type == "website"] ${WEBSITE_PROJECTION}`);
  } catch {
    // A CMS hiccup should degrade to the plain site, not take every brand down.
    return BUILT_IN_DEFAULT;
  }

  return pickForHost(websites, request) ?? BUILT_IN_DEFAULT;
}

/**
 * A Google tag ID sanitised for interpolation into the gtag snippet. The value
 * is a CMS field dropped into a `<script>` src and a JS string literal, so —
 * like colorHex — anything that is not unambiguously a Google tag ID (a G-, GT-,
 * AW-, DC- or UA- prefix followed by alphanumerics) is refused rather than
 * escaped, so no CMS string can break out of the snippet. GTM- container IDs
 * are deliberately excluded: they need the container snippet, not gtag.js.
 */
export function sanitizeGoogleTagId(value: string | null | undefined): string | null {
  if (!value) return null;
  const id = value.trim();
  return /^(G|GT|AW|DC|UA)-[A-Z0-9]+$/i.test(id) ? id : null;
}

/**
 * The Google tag measurement ID for the brand this request resolves to, or null.
 *
 * Its own narrow query rather than resolveWebsite(): the root loader runs on
 * every route — including the full-bleed pages outside the branded layout — and
 * needs only this one field, so it must not pull a brand's whole document on
 * every request. Host resolution is shared with resolveWebsite via pickForHost,
 * so the tag lands on exactly the brand's pages and no others.
 */
export async function resolveGoogleTagId(request: Request): Promise<string | null> {
  type TagRow = { domains: string[] | null; isDefault: boolean | null; googleTagId: string | null };
  let rows: TagRow[] = [];
  try {
    rows = await client.fetch<TagRow[]>(
      `*[_type == "website"]{ domains, isDefault, googleTagId }`
    );
  } catch {
    // Analytics is never worth failing a page render over.
    return null;
  }
  return sanitizeGoogleTagId(pickForHost(rows, request)?.googleTagId);
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

/**
 * Which tab a URL belongs to, matching on the first path segment so detail
 * pages are gated with their section — /articles/some-post belongs to
 * `articles`. Returns null for anything outside the tab system, which is left
 * alone rather than blocked.
 */
export function tabForPath(pathname: string): SiteTab | null {
  const segment = pathname.split('/')[1] ?? '';
  if (segment === '') return 'home';
  const entry = Object.entries(TAB_META).find(([, meta]) => meta.path === `/${segment}`);
  return entry ? (entry[0] as SiteTab) : null;
}

/**
 * Enforce the brand's tab list for a request, centrally.
 *
 * This deliberately lives in the layout rather than in each route. Gating
 * per-route means every new route has to remember to opt in, and eight of ten
 * had not — so a brand that had switched a section off was still serving it to
 * anyone who typed the URL. A guarantee that each route must remember to honour
 * is not a guarantee.
 */
export function requireTabForRequest(website: Website, request: Request): void {
  const tab = tabForPath(new URL(request.url).pathname);
  if (tab) requireTab(website, tab);
}

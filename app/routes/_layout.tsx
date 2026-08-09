import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Outlet, NavLink, useLocation, useLoaderData } from 'react-router';
import RandomCanvasAnimation from '~/components/RandomCanvasAnimation';
import { LUA_ANIMATIONS, LUA_ANIMATIONS_BY_NAME } from '~/components/lua-animations';
import Container, { CONTAINER_MAX_WIDTH } from '~/components/Container';
import { urlFor } from '~/sanity/image';
import {
  resolveWebsite,
  navTabs,
  TAB_META,
  colorHex,
  isLightBackground,
  requireTabForRequest,
  publicWebsite,
  LIGHT_THEME_TOKENS,
  headerTokens,
  navTokens,
  appearanceTokens,
} from '~/lib/website';
import StaticBanner from '~/components/StaticBanner';

/**
 * The edge blur and the header's clear middle.
 *
 * The blurred layer covers the whole banner and is masked away across a window
 * exactly as wide as the header's container, so the middle of the banner stays
 * crisp behind the wordmark and nav. That put the mask's edge in precisely the
 * same place as the edge of the nav's own blurred box, and two independent
 * antialiasing decisions on one boundary leave a hairline of unblurred banner
 * between them — the 1px seam.
 *
 * The fix is to stop them sharing a boundary: the mask window is a couple of
 * pixels narrower than the container, so the edge blur runs on under the
 * wordmark and nav rather than stopping alongside them. In the vertical gap
 * between those two boxes the bleed is visible in principle, but the edge of a
 * blurred region is a soft transition anyway, so two pixels of it reads as
 * nothing. A gradient ramp instead of a hard stop was the other option and it
 * only trades a hard seam for a soft one.
 */
const MASK_BLEED_PX = 2;
const MASK_EDGE = `calc(50% - ${CONTAINER_MAX_WIDTH / 2 - MASK_BLEED_PX}px)`;
const MASK_FAR_EDGE = `calc(50% + ${CONTAINER_MAX_WIDTH / 2 - MASK_BLEED_PX}px)`;
const EDGE_BLUR_MASK =
  `linear-gradient(to right, black ${MASK_EDGE}, transparent ${MASK_EDGE},` +
  ` transparent ${MASK_FAR_EDGE}, black ${MASK_FAR_EDGE})`;

/**
 * The three blurs are one brand setting, scaled. Their 20/8/12 split is a
 * relationship between the layers rather than three independent choices: the
 * edges hide the most, the nav sits over text and hides less, the wordmark least
 * of all. A brand dials --site-header-blur and the relationship holds.
 */
const EDGE_BLUR = 'blur(var(--site-header-blur))';
const WORDMARK_BLUR = 'blur(calc(var(--site-header-blur) * 0.4))';
const NAV_BLUR = 'blur(calc(var(--site-header-blur) * 0.6))';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  // Every page under this layout is gated here, so a section a brand has
  // switched off is unreachable rather than merely unlinked — without each
  // route having to remember to check.
  requireTabForRequest(website, request);
  // Only what the chrome renders — see publicWebsite.
  return { website: publicWebsite(website), tabs: navTabs(website) };
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  // Nav-specific foreground tokens: they default to the theme foreground, but a
  // brand that gives the nav its own background can flip just the nav's text
  // without touching the rest of the chrome. The old hardcoded #fff made the
  // active link invisible on a pale background.
  color: isActive ? 'var(--site-nav-foreground)' : 'var(--site-nav-foreground-muted)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
});

export default function SiteLayout() {
  const { website, tabs } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  // Advance one animation per navigation, so clicking through the tabs
  // round-robins the banner. The starting point is randomised per page load so
  // a fresh visit doesn't always open on the same one.
  const [step, setStep] = useState(() => Math.floor(Math.random() * LUA_ANIMATIONS.length));
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setStep((s) => s + 1);
  }, [pathname]);

  // A brand runs one of the built-in animations, its own static site, or no
  // banner at all.
  const isStatic = website.bannerAnimation === 'static';
  const staticHtml = isStatic ? website.bannerHtml : null;
  const staticUrl = isStatic ? website.bannerUrl : null;

  const pinned =
    website.bannerAnimation && website.bannerAnimation !== 'random'
      ? LUA_ANIMATIONS_BY_NAME[website.bannerAnimation]
      : undefined;
  const animation = pinned ?? LUA_ANIMATIONS[step % LUA_ANIMATIONS.length];

  // A brand set to "static" that has supplied nothing gets no banner rather
  // than silently falling back to one of my animations under its own name.
  const showBanner =
    website.bannerAnimation !== 'none' && (!isStatic || Boolean(staticHtml || staticUrl));

  // Brand colours ride on the same custom properties the pages already use, so
  // per-brand theming needs no changes in the components themselves.
  const accentPrimary = colorHex(website.accentPrimary);
  const accentSecondary = colorHex(website.accentSecondary);
  const background = colorHex(website.backgroundColor);

  // A brand that picks a pale background gets the whole chrome inverted, not
  // just the backdrop — otherwise its nav and wordmark vanish into it.
  const light = background ? isLightBackground(background) : false;
  const themeVars = [
    accentPrimary ? `--color-mustard: ${accentPrimary};` : '',
    accentSecondary ? `--color-teal: ${accentSecondary};` : '',
    background ? `--site-background: ${background};` : '',
    light ? LIGHT_THEME_TOKENS : '',
    // After the light block, which also names the veil tokens: a brand's header
    // settings have to win over the theme's defaults, not the other way round.
    headerTokens(website),
    // Likewise after the light block, so an explicit nav background and its
    // resolved foreground override the themed nav tokens.
    navTokens(website),
    // The brand's per-area CSS adjustments — corners, padding, borders, card
    // colours. Last, so nothing above silently overrides a deliberate override.
    appearanceTokens(website.appearance),
  ]
    .filter(Boolean)
    .join(' ');

  // React hoists this into <head>. Without it every brand serves the default
  // /favicon.ico, which is the site owner's — the one piece of another brand's
  // identity that survives even a fully themed page.
  const faviconUrl = website.favicon?.asset
    ? urlFor(website.favicon).width(64).height(64).fit('max').url()
    : null;

  return (
    <>
      {faviconUrl && <link rel="icon" href={faviconUrl} />}
      {themeVars && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${themeVars} }${
              background
                ? ` html, body { background-color: ${background}; color-scheme: ${
                    light ? 'light' : 'dark'
                  }; }`
                : ''
            }`,
          }}
        />
      )}
      <div
        className="brand-header"
        style={{
          position: 'relative',
          // Always a column so the nav can be pinned to the bottom of the
          // header. Without a custom banner height this changes nothing — the
          // header is only as tall as its contents, so bottom is where the nav
          // already sat.
          display: 'flex',
          flexDirection: 'column',
          // The banner is otherwise only as tall as the wordmark and nav, which
          // crops most static banners to a sliver of their artwork. The height
          // is carried as a custom property rather than min-height directly so
          // .brand-header can cap it on phones (see app.css) — the desktop value
          // strands the nav below a short mobile banner.
          ...(showBanner && website.bannerHeight
            ? ({ '--site-banner-height': `${website.bannerHeight}px` } as CSSProperties)
            : null),
        }}
      >
        {showBanner && (
          <>
            {isStatic ? (
              <StaticBanner
                html={staticHtml}
                url={staticUrl}
                title={`${website.siteTitle} banner`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            ) : (
              <RandomCanvasAnimation
                script={animation}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            )}
            <div style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: EDGE_BLUR,
              WebkitBackdropFilter: EDGE_BLUR,
              maskImage: EDGE_BLUR_MASK,
              WebkitMaskImage: EDGE_BLUR_MASK,
            }} />
          </>
        )}
        <Container
          style={{
            position: 'relative',
            padding: '0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            // Explicit, because Container centres itself with `margin: 0 auto`
            // and an auto cross-axis margin cancels a flex item's stretch —
            // without this the header collapses to the width of the nav text.
            width: '100%',
          }}
        >
          {/* Wordmark rides the top of the header, nav the bottom, whatever
              height the brand's banner asks for. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <div style={{
              backdropFilter: WORDMARK_BLUR,
              WebkitBackdropFilter: WORDMARK_BLUR,
              backgroundColor: 'var(--site-wordmark-veil)',
              padding: 'var(--site-wordmark-padding, 0.5rem 2rem)',
              borderRadius: 'var(--site-wordmark-radius, 0)',
            }}>
              {website.logo ? (
                website.showTitleWithLogo ? (
                  // Both: the logo leads, decorative (alt=""), and the title
                  // stays the page's one h1 beneath it — so the mark and the
                  // name read together without duplicating the name to a
                  // screen reader.
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <img
                      src={urlFor(website.logo).height(96).fit('max').url()}
                      alt=""
                      style={{ maxHeight: '96px', display: 'block' }}
                    />
                    <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 2rem)', margin: 0 }}>
                      {website.siteTitle}
                    </h1>
                  </div>
                ) : (
                  <img
                    src={urlFor(website.logo).height(96).fit('max').url()}
                    alt={website.logo.alt ?? website.siteTitle}
                    style={{ maxHeight: '96px', display: 'block' }}
                  />
                )
              ) : (
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', margin: 0 }}>
                  {website.siteTitle}
                </h1>
              )}
            </div>
            <nav style={{
              alignSelf: 'stretch',
              backdropFilter: NAV_BLUR,
              WebkitBackdropFilter: NAV_BLUR,
              backgroundColor: 'var(--site-nav-veil)',
              padding: 'var(--site-nav-padding, 0.5rem 2rem)',
              borderRadius: 'var(--site-nav-radius, 0)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--site-nav-gap, 2rem)',
            }}>
              {tabs.map((tab) => (
                <NavLink
                  key={tab}
                  to={TAB_META[tab].path}
                  end={TAB_META[tab].path === '/'}
                  style={navLinkStyle}
                >
                  {TAB_META[tab].label}
                </NavLink>
              ))}
            </nav>
          </div>
        </Container>
      </div>
      <Outlet />
    </>
  );
}

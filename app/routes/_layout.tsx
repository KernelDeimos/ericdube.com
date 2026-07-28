import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useLoaderData } from 'react-router';
import RandomCanvasAnimation from '~/components/RandomCanvasAnimation';
import { LUA_ANIMATIONS, LUA_ANIMATIONS_BY_NAME } from '~/components/lua-animations';
import Container from '~/components/Container';
import { urlFor } from '~/sanity/image';
import { resolveWebsite, navTabs, TAB_META, colorHex, isLightBackground } from '~/lib/website';
import StaticBanner from '~/components/StaticBanner';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  return { website, tabs: navTabs(website) };
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  // Both sides of this come from the theme: on a pale brand background the old
  // hardcoded #fff made the active link invisible.
  color: isActive ? 'var(--site-foreground)' : 'var(--site-foreground-muted)',
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
    light ? '--site-foreground: #0f172a;' : '',
    light ? '--site-foreground-muted: #475569;' : '',
    light ? '--site-wordmark-veil: rgba(255, 255, 255, 0.55);' : '',
    light ? '--site-nav-veil: rgba(15, 23, 42, 0.06);' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
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
        style={{
          position: 'relative',
          // The banner is otherwise only as tall as the wordmark and nav, which
          // crops most static banners to a sliver of their artwork.
          ...(showBanner && website.bannerHeight
            ? { minHeight: `${website.bannerHeight}px`, display: 'flex', flexDirection: 'column' }
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
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              maskImage: 'linear-gradient(to right, black calc(50% - 600px), transparent calc(50% - 600px), transparent calc(50% + 600px), black calc(50% + 600px))',
              WebkitMaskImage: 'linear-gradient(to right, black calc(50% - 600px), transparent calc(50% - 600px), transparent calc(50% + 600px), black calc(50% + 600px))',
            }} />
          </>
        )}
        <Container style={{ position: 'relative', padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'var(--site-wordmark-veil)',
              padding: '0.5rem 2rem',
            }}>
              {website.logo ? (
                <img
                  src={urlFor(website.logo).height(96).fit('max').url()}
                  alt={website.logo.alt ?? website.siteTitle}
                  style={{ maxHeight: '96px', display: 'block' }}
                />
              ) : (
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', margin: 0 }}>
                  {website.siteTitle}
                </h1>
              )}
            </div>
            <nav style={{
              alignSelf: 'stretch',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'var(--site-nav-veil)',
              padding: '0.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
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

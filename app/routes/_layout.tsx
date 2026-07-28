import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useLoaderData } from 'react-router';
import RandomCanvasAnimation from '~/components/RandomCanvasAnimation';
import { LUA_ANIMATIONS, LUA_ANIMATIONS_BY_NAME } from '~/components/lua-animations';
import Container from '~/components/Container';
import { urlFor } from '~/sanity/image';
import { resolveWebsite, navTabs, TAB_META } from '~/lib/website';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  return { website, tabs: navTabs(website) };
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? '#fff' : '#94a3b8',
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

  // A brand can pin one animation, or opt out of the banner entirely.
  const pinned = website.bannerAnimation && website.bannerAnimation !== 'random'
    ? LUA_ANIMATIONS_BY_NAME[website.bannerAnimation]
    : undefined;
  const animation = pinned ?? LUA_ANIMATIONS[step % LUA_ANIMATIONS.length];
  const showBanner = website.bannerAnimation !== 'none';

  // Brand colours ride on the same custom properties the pages already use, so
  // per-brand theming needs no changes in the components themselves.
  const themeVars = [
    website.accentPrimary ? `--color-mustard: ${website.accentPrimary};` : '',
    website.accentSecondary ? `--color-teal: ${website.accentSecondary};` : '',
    website.backgroundColor
      ? `--site-background: ${website.backgroundColor};`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {themeVars && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${themeVars} }${
              website.backgroundColor
                ? ` html, body { background-color: ${website.backgroundColor}; }`
                : ''
            }`,
          }}
        />
      )}
      <div style={{ position: 'relative' }}>
        {showBanner && (
          <>
            <RandomCanvasAnimation
              script={animation}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
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
              backgroundColor: 'rgba(0,0,0,0.45)',
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
              backgroundColor: 'rgba(255,255,255,0.08)',
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

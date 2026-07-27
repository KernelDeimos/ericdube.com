import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import RandomCanvasAnimation from '~/components/RandomCanvasAnimation';
import { LUA_ANIMATIONS } from '~/components/lua-animations';
import Container from '~/components/Container';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? '#fff' : '#94a3b8',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
});

export default function SiteLayout() {
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

  const animation = LUA_ANIMATIONS[step % LUA_ANIMATIONS.length];

  return (
    <>
      <div style={{ position: 'relative' }}>
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
        <Container style={{ position: 'relative', padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.45)',
              padding: '0.5rem 2rem',
            }}>
              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', margin: 0 }}>EricDubé.com</h1>
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
              <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
              <NavLink to="/services" style={navLinkStyle}>Services</NavLink>
              <NavLink to="/articles" style={navLinkStyle}>Articles</NavLink>
              <NavLink to="/demos" style={navLinkStyle}>Demos</NavLink>
              <NavLink to="/artifacts" style={navLinkStyle}>Artifacts</NavLink>
              <NavLink to="/weird-food" style={navLinkStyle}>Weird Food</NavLink>
            </nav>
          </div>
        </Container>
      </div>
      <Outlet />
    </>
  );
}

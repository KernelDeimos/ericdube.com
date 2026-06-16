import { Outlet, NavLink } from 'react-router';
import ParticleSimulator from '~/components/ParticleSimulator';
import Container from '~/components/Container';
import { particleRulesets } from '~/data/particleRulesets';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? '#fff' : '#94a3b8',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
});

export default function SiteLayout() {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <ParticleSimulator
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          rulesets={particleRulesets}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to right, black calc(50% - 600px), transparent calc(50% - 600px), transparent calc(50% + 600px), black calc(50% + 600px))',
          WebkitMaskImage: 'linear-gradient(to right, black calc(50% - 600px), transparent calc(50% - 600px), transparent calc(50% + 600px), black calc(50% + 600px))',
        }} />
        <Container style={{ position: 'relative' }}>
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
              <NavLink to="/articles" style={navLinkStyle}>Articles</NavLink>
            </nav>
          </div>
        </Container>
      </div>
      <Outlet />
    </>
  );
}

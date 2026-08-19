import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab } from '~/lib/website';
import { PRODUCT_NAME } from '~/lib/product';
import styles from './prehend-layout.module.css';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  // One gate for the whole section: every /prehend/* route is reachable only on
  // a brand whose curated tabs include 'prehend'.
  requireTab(website, 'prehend');
  return null;
}

const SUBNAV = [
  { to: '/prehend', label: 'Overview', end: true },
  { to: '/prehend/how-it-works', label: 'How it works', end: false },
  { to: '/prehend/developers', label: 'Developers', end: false },
  { to: '/prehend/docs', label: 'Docs', end: false },
  { to: '/prehend/pricing', label: 'Pricing', end: false },
  { to: '/prehend/security', label: 'Security', end: false },
];

export default function PrehendLayout() {
  const { pathname } = useLocation();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  // On mobile the pills scroll horizontally; keep the current section's pill in
  // view when the route changes so you can always see where you are.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  return (
    <>
      <div className={styles.bar}>
        <Container style={{ padding: 0 }}>
          <div className={styles.inner}>
            <NavLink to="/prehend" end className={styles.label}>
              {PRODUCT_NAME}
            </NavLink>
            <nav className={styles.links} aria-label={`${PRODUCT_NAME} sections`}>
              {SUBNAV.map((l) => {
                const active =
                  l.end ? pathname === l.to : pathname === l.to || pathname.startsWith(`${l.to}/`);
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    ref={active ? activeRef : undefined}
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                  >
                    {l.label}
                  </NavLink>
                );
              })}
            </nav>
            <NavLink to="/prehend/pricing" className={styles.cta}>
              Try {PRODUCT_NAME}
            </NavLink>
          </div>
        </Container>
      </div>
      <Outlet />
    </>
  );
}

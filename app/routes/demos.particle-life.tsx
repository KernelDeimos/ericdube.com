import ParticleSimulator from '~/components/ParticleSimulator';
import { particleRulesets } from '~/data/particleRulesets';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';

// Full-bleed, so it renders outside the site layout and misses the tab check
// that gates everything under it. Without this a brand that has switched Demos
// off still serves this page to anyone with the URL.
export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  requireTab(website, 'demos');
  return null;
}

export function meta({
  matches,
  location,
}: {
  matches: readonly SiteMetaMatch[];
  location: { pathname: string };
}) {
  return seoMeta({
    matches,
    location,
    title: 'Particle Life — EricDubé.com',
    description:
      'Four species of particle, a random matrix of attraction and repulsion rules, and the emergent structures that fall out of it.',
  });
}

export default function ParticleLifeDemo() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111' }}>
      <ParticleSimulator
        className=""
        style={{ width: '100%', height: '100%' }}
        rulesets={particleRulesets}
      />
    </div>
  );
}

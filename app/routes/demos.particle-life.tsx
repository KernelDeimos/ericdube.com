import ParticleSimulator from '~/components/ParticleSimulator';
import { particleRulesets } from '~/data/particleRulesets';

export function meta() {
  return [
    { title: 'Particle Life — EricDubé.com' },
    {
      name: 'description',
      content:
        'Four species of particle, a random matrix of attraction and repulsion rules, and the emergent structures that fall out of it.',
    },
  ];
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

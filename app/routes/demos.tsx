import Container from '~/components/Container';

type Demo = {
  title: string;
  file: string;
  blurb: string;
  accent: string;
};

const demos: Demo[] = [
  {
    title: 'Murmuration',
    file: '/demos/murmuration.html',
    blurb: 'A flock of boids — separation, alignment, cohesion — as a shifting ribbon of colour.',
    accent: '#57a1e5',
  },
  {
    title: 'Strange',
    file: '/demos/strange.html',
    blurb: 'The Lorenz attractor: a rotating, time-coloured trail of a chaotic system.',
    accent: '#c084fc',
  },
  {
    title: 'Sprout',
    file: '/demos/sprout.html',
    blurb: 'L-systems grown with turtle graphics — fractal plant, dragon curve, Koch, Sierpinski.',
    accent: '#4ade80',
  },
  {
    title: 'Vitalis',
    file: '/demos/vitalis.html',
    blurb: "Conway's Game of Life with a pattern library — Gosper gun, acorn, gliders — age-coloured.",
    accent: '#22d3ee',
  },
];

export function meta() {
  return [
    { title: 'Demos — EricDubé.com' },
    {
      name: 'description',
      content: 'Interactive generative demos that run real Python in your browser via Pyodide.',
    },
  ];
}

export default function Demos() {
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Demos</h1>
      <p style={{ color: '#94a3b8', maxWidth: '60ch', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Small generative toys, each running <strong>real Python in your browser</strong>. The
        simulation is CPython compiled to WebAssembly (via{' '}
        <a href="https://pyodide.org" style={{ color: '#cbd5e1' }}>Pyodide</a>); a thin canvas layer
        just paints what the Python computes each frame. First load fetches Pyodide, so give it a
        moment.
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {demos.map((d) => (
          <li key={d.file}>
            <a
              href={d.file}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                height: '100%',
              }}
            >
              <div style={{ height: '6px', background: d.accent }} />
              <div style={{ padding: '1.1rem 1.25rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{d.title}</h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {d.blurb}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.9rem',
                    fontSize: '0.8rem',
                    color: d.accent,
                    fontWeight: 600,
                  }}
                >
                  Launch demo →
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}

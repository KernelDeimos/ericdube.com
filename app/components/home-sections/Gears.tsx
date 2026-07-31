import styles from './Gears.module.css';

/**
 * Two meshing cogs as a decorative, self-contained SVG. Pure CSS animation, so
 * it runs without JavaScript and survives hydration untouched, and it draws its
 * colours from the brand accents rather than fixed values so it reads correctly
 * on any brand's background.
 *
 * The tooth counts are the gear ratio: the smaller cog turns as much faster as
 * it has fewer teeth, in the opposite direction, so the pair reads as actually
 * driving each other rather than two shapes spinning independently.
 */

/** One cog centred on the origin: a filled cog outline with the hub punched out. */
function gearPath(teeth: number, rOuter: number, rInner: number, rHub: number): string {
  const step = (Math.PI * 2) / teeth;
  const point = (r: number, angle: number) =>
    `${(Math.cos(angle) * r).toFixed(2)} ${(Math.sin(angle) * r).toFixed(2)}`;

  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    // A tooth on the first half of each step, a valley on the second — the flat
    // top and squared sides that make a cog read as a cog.
    d += `${i === 0 ? 'M' : 'L'} ${point(rInner, a)} `;
    d += `L ${point(rOuter, a + step * 0.15)} `;
    d += `L ${point(rOuter, a + step * 0.35)} `;
    d += `L ${point(rInner, a + step * 0.5)} `;
  }
  d += 'Z ';

  // The hub, punched by the even-odd fill rule so the background shows through.
  const hub = rHub.toFixed(2);
  d += `M ${(-rHub).toFixed(2)} 0 a ${hub} ${hub} 0 1 0 ${(rHub * 2).toFixed(2)} 0 `;
  d += `a ${hub} ${hub} 0 1 0 ${(-rHub * 2).toFixed(2)} 0 Z`;
  return d;
}

type Cog = {
  teeth: number;
  radius: number;
  cx: number;
  cy: number;
  /** Seconds per full turn — in proportion to teeth so the mesh is consistent. */
  seconds: number;
  reverse?: boolean;
  color: string;
};

const COGS: Cog[] = [
  { teeth: 12, radius: 27, cx: 38, cy: 42, seconds: 12, color: 'var(--color-teal)' },
  { teeth: 8, radius: 18, cx: 70, cy: 63, seconds: 8, reverse: true, color: 'var(--color-mustard)' },
];

export default function Gears() {
  return (
    <svg className={styles.gears} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {COGS.map((cog) => (
        // Outer group positions the cog; the inner group carries the rotation,
        // because a CSS transform on an element replaces its `transform`
        // attribute — translating and rotating on one node would drop the
        // translate the moment the animation takes hold.
        <g key={`${cog.cx}-${cog.cy}`} transform={`translate(${cog.cx} ${cog.cy})`}>
          <g
            className={styles.gear}
            style={{
              color: cog.color,
              animationDuration: `${cog.seconds}s`,
              animationDirection: cog.reverse ? 'reverse' : 'normal',
            }}
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d={gearPath(cog.teeth, cog.radius, cog.radius * 0.8, cog.radius * 0.32)}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

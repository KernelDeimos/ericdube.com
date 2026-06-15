import { useEffect, useRef } from 'react';

function hexToRgb(hex) {
  hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => r+r+g+g+b+b);
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

const COLOUR_MAP = {
  blue:   '#4488ff',
  green:  '#44ff88',
  red:    '#ff4444',
  yellow: '#ffee00',
};

function applyRules(p, particles, canvas) {
  let fx = 0, fy = 0;

  for (const other of particles) {
    if (other === p) continue;
    for (const rule of p.rules) {
      if (other.tag !== rule.tag) continue;
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 0 || d > 120) continue;
      const F = rule.force / d;
      fx += F * dx;
      fy += F * dy;
    }
  }

  p.vx = (p.vx + fx) * 0.5;
  p.vy = (p.vy + fy) * 0.5;
  p.x += p.vx;
  p.y += p.vy;

  if (p.x <= 0 || p.x >= canvas.width)  p.vx = -p.vx;
  if (p.y <= 0 || p.y >= canvas.height) p.vy = -p.vy;

  const wrap = (v, min, max) => {
    const sz = max - min;
    if (v < min) return v + sz;
    if (v > max) return v - sz;
    return v;
  };
  p.x = wrap(p.x, -canvas.width,  2 * canvas.width);
  p.y = wrap(p.y, -canvas.height, 2 * canvas.height);
}

function paintParticle(p, ctx) {
  const rgb = hexToRgb(COLOUR_MAP[p.colour]);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
  ctx.fill();
}

function createParticles(canvas, colour, ruleDefs) {
  return Array.from({ length: 200 }, () => ({
    x:      Math.random() * canvas.width,
    y:      Math.random() * canvas.height,
    vx:     0,
    vy:     0,
    tag:    colour,
    colour,
    size:   20,
    rules:  ruleDefs.map(([tag, force]) => ({ tag, force })),
  }));
}

function buildParticles(canvas) {
  const r = () => Math.random() - 0.5;
  return [
    ...createParticles(canvas, 'yellow', [['red', r()], ['yellow', r()], ['green', r()]]),
    ...createParticles(canvas, 'red',    [['green', r()], ['yellow', r()], ['red', r()]]),
    ...createParticles(canvas, 'green',  [['yellow', r()], ['red', r()], ['blue', r()]]),
    ...createParticles(canvas, 'blue',   [['yellow', r()], ['red', r()], ['green', r()], ['red', r()]]),
  ];
}

export default function ParticleSimulator({ className, style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (!entry.contentRect) continue;
        canvas.width  = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    observer.observe(canvas);

    const paint = () => {
      for (const p of particles) applyRules(p, particles, canvas);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) paintParticle(p, ctx);
      animId = requestAnimationFrame(paint);
    };
    paint();

    const timer = setTimeout(() => {
      particles = buildParticles(canvas);
    }, 200);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}

import type { ReactNode, CSSProperties } from 'react';

/**
 * Exported because the header's edge-blur mask has to line up with this exact
 * width. It was written out as `calc(50% - 600px)` in the layout, which is the
 * same number stated twice in two files — and a mask that silently stops
 * agreeing with the container is a hairline seam nobody can attribute.
 */
export const CONTAINER_MAX_WIDTH = 1200;

export default function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      maxWidth: `${CONTAINER_MAX_WIDTH}px`,
      margin: '0 auto',
      padding: '0 2rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

import type { ReactNode, CSSProperties } from 'react';

export default function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

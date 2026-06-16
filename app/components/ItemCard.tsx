import { useState } from 'react';
import { urlFor } from '~/sanity/image';

type ItemCardProps = {
  title: string;
  url: string;
  publishedAt: string | null;
  excerpt: string | null;
  tags: string[] | null;
  coverImage: { asset: object; alt: string } | null;
};

export default function ItemCard({ title, url, publishedAt, excerpt, tags, coverImage }: ItemCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={url}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'flex-start',
        border: '2px solid black',
        borderRadius: '0.75rem',
        padding: '1rem',
        backgroundColor: hovered ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
      }}
    >
      {coverImage && (
        <img
          src={urlFor(coverImage).width(240).height(140).fit('crop').url()}
          alt={coverImage.alt}
          width={240}
          height={140}
          style={{ borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0 }}
        />
      )}
      <div style={{
      }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.375rem' }}>{title}</h2>
        {publishedAt && (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>
            {new Date(publishedAt).toLocaleDateString('en-CA', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
        {excerpt && (
          <p style={{ margin: '0 0 0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>{excerpt}</p>
        )}
        {tags && tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(68,136,255,0.15)',
                color: '#4488ff',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

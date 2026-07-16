import { urlFor } from '~/sanity/image';
import { type AiInfo, designationLabel, scoreColor } from '~/lib/ai';
import styles from './ItemCard.module.css';

type ItemCardProps = {
  title: string;
  url: string;
  accentColor?: string;
  publishedAt: string | null;
  excerpt: string | null;
  tags: string[] | null;
  coverImage: { asset: object; alt: string } | null;
  ai?: AiInfo | null;
};

const badgeStyle = {
  fontSize: '0.75rem',
  padding: '0.2rem 0.6rem',
  borderRadius: '999px',
  whiteSpace: 'nowrap' as const,
};

export default function ItemCard({ title, url, accentColor = 'black', publishedAt, excerpt, tags, coverImage, ai }: ItemCardProps) {
  const designation = ai?.designation && ai.designation !== 'unspecified' ? designationLabel(ai.designation) : null;
  const score = typeof ai?.score === 'number' ? ai.score : null;
  const hasFooter = designation != null || score != null || (tags != null && tags.length > 0);
  return (
    <a href={url} className={styles.card}>
      {coverImage && (
        <img
          src={urlFor(coverImage).width(240).height(140).fit('crop').url()}
          alt={coverImage.alt}
          width={240}
          height={140}
          style={{ borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0 }}
        />
      )}
      <div>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.375rem', color: accentColor }}>{title}</h2>
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
        {hasFooter && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {designation && (
              <span style={{ ...badgeStyle, backgroundColor: 'rgba(192,132,252,0.15)', color: '#c084fc', fontWeight: 600 }}>
                {designation}
              </span>
            )}
            {score != null && (
              <span style={{ ...badgeStyle, backgroundColor: 'rgba(255,255,255,0.06)', color: scoreColor(score), fontWeight: 600 }}>
                ZeroGPT {Math.round(score)}% AI
              </span>
            )}
            {tags?.map((tag) => (
              <span key={tag} style={{ ...badgeStyle, backgroundColor: 'rgba(68,136,255,0.15)', color: '#4488ff' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

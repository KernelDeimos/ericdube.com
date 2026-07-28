import { urlFor } from '~/sanity/image';
import styles from './WeirdFoodCard.module.css';

type WeirdFoodCardProps = {
  name: string;
  url: string;
  foodType: string | null;
  weirdnessRating: number | null;
  tags: string[] | null;
  photo: { asset: object; alt: string } | null;
};

export default function WeirdFoodCard({ name, url, foodType, weirdnessRating, tags, photo }: WeirdFoodCardProps) {
  return (
    <a href={url} className={styles.card}>
      <div className={styles.photoWrap}>
        {photo && (
          <img
            src={urlFor(photo).width(400).height(400).fit('crop').url()}
            alt={photo.alt}
            width={400}
            height={400}
            className={styles.photo}
          />
        )}
        {weirdnessRating != null && (
          <span className={styles.rating}>{weirdnessRating}/10</span>
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{name}</h2>
        {foodType && <p className={styles.foodType}>{foodType}</p>}
        {tags && tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(68,136,255,0.15)',
                color: 'var(--site-info)',
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

import styles from './MusingCard.module.css';

type Musing = {
  _id: string;
  body: string;
  publishedAt: string | null;
  tags: string[] | null;
};

export default function MusingCard({ body, publishedAt, tags }: Musing) {
  return (
    <div className={styles.card}>
      <p className={styles.body}>{body}</p>
      {publishedAt && (
        <p className={styles.meta}>
          {new Date(publishedAt).toLocaleDateString('en-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      )}
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

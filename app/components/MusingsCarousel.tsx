import styles from './MusingsCarousel.module.css';

type Musing = {
  _id: string;
  body: string;
  publishedAt: string | null;
  tags: string[] | null;
};

export default function MusingsCarousel({ musings }: { musings: Musing[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Musings</h2>
      <div className={styles.track}>
        {musings.map((musing) => (
          <div key={musing._id} className={styles.card}>
            <p className={styles.body}>{musing.body}</p>
            {musing.publishedAt && (
              <p className={styles.meta}>
                {new Date(musing.publishedAt).toLocaleDateString('en-CA', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            )}
            {musing.tags && musing.tags.length > 0 && (
              <div className={styles.tags}>
                {musing.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

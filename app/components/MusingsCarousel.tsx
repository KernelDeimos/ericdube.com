import { useState, useEffect } from 'react';
import styles from './MusingsCarousel.module.css';

const LANDSCAPES = [
  '/landscapes/anton-sobotyak-w7eoMwnZRZI.jpg',
  '/landscapes/claudio-testa--SO3JtE3gZo.jpg',
  '/landscapes/jeremy-cai-ucYWe5mzTMU.jpg',
  '/landscapes/lionel-abrial-gUPIPcGCg28.jpg',
  '/landscapes/nick-van-den-berg-tpyh8Eu7LgQ.jpg',
  '/landscapes/sean-robertson-YF9FxZpoTcs.jpg',
  '/landscapes/sergei-gussev-Y-rrgKyNArs.jpg',
  '/landscapes/tahamie-farooqui-XEnIkZ1GBNI.jpg',
];

type Musing = {
  _id: string;
  body: string;
  publishedAt: string | null;
  tags: string[] | null;
};

const FLIP_INTERVAL = 20000;

function bodyFontSize(body: string): string {
  const len = body.length;
  if (len < 80)  return '1.55rem';
  if (len < 180) return '1.25rem';
  if (len < 320) return '1.05rem';
  return '0.95rem';
}

export default function MusingsCarousel({ musings }: { musings: Musing[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (musings.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % musings.length), FLIP_INTERVAL);
    return () => clearInterval(id);
  }, [musings.length]);

  if (musings.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Musings</h2>
        <a href="/musings" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.stage}>
        {musings.map((musing, i) => (
          <div key={musing._id} className={`${styles.slide} ${i === active ? styles.active : ''}`}>
            <img
              className={styles.bg}
              src={LANDSCAPES[i % LANDSCAPES.length]}
              alt=""
              aria-hidden
            />
            <div className={styles.content}>
              <p className={styles.body} style={{ fontSize: bodyFontSize(musing.body) }}>{musing.body}</p>
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
          </div>
        ))}
      </div>

      {musings.length > 1 && (
        <div className={styles.dots}>
          {musings.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.activeDot : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to musing ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

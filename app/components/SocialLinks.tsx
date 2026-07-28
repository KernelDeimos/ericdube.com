import styles from './SocialLinks.module.css';

export type SocialLink = { label: string; url: string };

/**
 * Where a brand can be found elsewhere. These used to be a hardcoded list of
 * one person's profiles, which meant any other brand rendering this section
 * advertised someone else's accounts. A brand with no links of its own shows
 * nothing rather than borrowing.
 */
export default function SocialLinks({
  links,
  heading = 'Find me',
}: {
  links: SocialLink[];
  heading?: string | null;
}) {
  if (links.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading || 'Find me'}</h2>
      <ul className={styles.list}>
        {links.map(({ label, url }) => (
          <li key={`${label}-${url}`}>
            <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

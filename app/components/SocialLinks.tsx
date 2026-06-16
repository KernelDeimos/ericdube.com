import styles from './SocialLinks.module.css';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/ericdube' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/ericdube' },
  { label: 'X / Twitter', href: 'https://x.com/ericdube' },
  { label: 'Email', href: 'mailto:eric.alex.dube@gmail.com' },
];

export default function SocialLinks() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Find me</h2>
      <ul className={styles.list}>
        {LINKS.map(({ label, href }) => (
          <li key={label}>
            <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

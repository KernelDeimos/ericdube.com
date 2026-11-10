import styles from './GitHubProjects.module.css';
import { urlFor } from '~/sanity/image';

type Project = {
  _id: string;
  name: string;
  description: string;
  url: string;
  image: { asset: object; alt: string } | null;
};

// "Big" projects get a prominent, double-width card in a 2-up row above the rest.
// Matched by host so it's stable regardless of project ordering or Studio edits.
// (Eric #3348 — promote erguil.com + concord.coherentconstructs.com.)
const BIG_HOSTS = new Set(['erguil.com', 'concord.coherentconstructs.com']);

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function ProjectCard({ project, big = false }: { project: Project; big?: boolean }) {
  return (
    <a
      className={`${styles.card}${big ? ` ${styles.cardBig}` : ''}`}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {project.image && (
        <img
          className={styles.cardImage}
          src={urlFor(project.image)
            .width(big ? 1040 : 520)
            .height(big ? 420 : 280)
            .fit('crop')
            .url()}
          alt={project.image.alt ?? project.name}
        />
      )}
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{project.name}</p>
        <p className={styles.cardDesc}>{project.description}</p>
      </div>
    </a>
  );
}

export default function GitHubProjects({ projects }: { projects: Project[] }) {
  const big = projects.filter((p) => BIG_HOSTS.has(hostOf(p.url)));
  const small = projects.filter((p) => !BIG_HOSTS.has(hostOf(p.url)));

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Projects</h2>
      {big.length > 0 && (
        <div className={styles.bigGrid}>
          {big.map((project) => (
            <ProjectCard key={project._id} project={project} big />
          ))}
        </div>
      )}
      <div className={styles.grid}>
        {small.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </section>
  );
}

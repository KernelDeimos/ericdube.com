import styles from './GitHubProjects.module.css';

type Project = {
  _id: string;
  name: string;
  description: string;
  url: string;
};

export default function GitHubProjects({ projects }: { projects: Project[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Projects</h2>
      <div className={styles.grid}>
        {projects.map((project) => (
          <a
            key={project._id}
            className={styles.card}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className={styles.cardName}>{project.name}</p>
            <p className={styles.cardDesc}>{project.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

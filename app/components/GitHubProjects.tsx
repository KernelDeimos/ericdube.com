import styles from './GitHubProjects.module.css';
import { urlFor } from '~/sanity/image';

type Project = {
  _id: string;
  name: string;
  description: string;
  url: string;
  image: { asset: object; alt: string } | null;
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
            {project.image && (
              <img
                className={styles.cardImage}
                src={urlFor(project.image).width(520).height(280).fit('crop').url()}
                alt={project.image.alt ?? project.name}
              />
            )}
            <div className={styles.cardBody}>
              <p className={styles.cardName}>{project.name}</p>
              <p className={styles.cardDesc}>{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

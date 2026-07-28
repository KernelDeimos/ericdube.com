import { useLoaderData } from 'react-router';
import type { Route } from './+types/home';
import Container from '../components/Container';
import { client } from '~/sanity/client';
import { resolveWebsite, requireTab, siteTitleFrom } from '~/lib/website';
import {
  HomeSections,
  needsPortfolioData,
  type HomeSection,
  type PortfolioData,
} from '../components/home-sections';
import styles from '../components/home-sections/sections.module.css';

type Project = {
  _id: string;
  name: string;
  description: string;
  url: string;
  image: { asset: object; alt: string } | null;
};

type Musing = {
  _id: string;
  body: string;
  publishedAt: string | null;
  tags: string[] | null;
};

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  requireTab(website, 'home');

  const sections = (website.homePage ?? []) as HomeSection[];

  // The projects and musings are one brand's personal content. They are fetched
  // only when that brand has actually asked for them, so no other brand can end
  // up rendering them by accident.
  let portfolio: PortfolioData | null = null;
  if (needsPortfolioData(sections)) {
    const [projects, musings] = await Promise.all([
      client.fetch<Project[]>(
        `*[_type == "project"] | order(order asc, name asc) {
          _id,
          name,
          description,
          url,
          image { asset, alt }
        }`
      ),
      client.fetch<Musing[]>(
        `*[_type == "musing"] | order(publishedAt desc) {
          _id,
          body,
          publishedAt,
          tags
        }`
      ),
    ]);
    portfolio = {
      projects,
      musings,
      socialLinks: website.socialLinks ?? [],
      socialHeading: website.socialHeading,
    };
  }

  return { sections, portfolio, tagline: website.tagline };
}

export function meta({ matches }: Route.MetaArgs) {
  const site = siteTitleFrom(matches);
  return [{ title: site }, { name: 'description', content: `Welcome to ${site}` }];
}

export default function Home() {
  const { sections, portfolio, tagline } = useLoaderData<typeof loader>();

  // A brand that has authored nothing gets its own name and tagline and
  // nothing else. Bare is the correct default here: the alternative is showing
  // it someone else's content, which is worse than showing it little.
  if (sections.length === 0) {
    return (
      <Container>
        <div className={styles.minimal}>
          {tagline && <p className={styles.minimalTagline}>{tagline}</p>}
        </div>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '1rem' }}>
      <HomeSections sections={sections} portfolio={portfolio} />
    </Container>
  );
}

import { useLoaderData } from 'react-router';
import type { Route } from './+types/home';
import Container from '../components/Container';
import SocialLinks from '../components/SocialLinks';
import GitHubProjects from '../components/GitHubProjects';
import MusingsCarousel from '../components/MusingsCarousel';
import { client } from '~/sanity/client';

const GITHUB_PROJECTS = [
  {
    name: 'com-ericdube-2026',
    description: 'Personal site built with React Router and Sanity.',
    url: 'https://github.com/ericdube/com-ericdube-2026',
  },
];

type Musing = {
  _id: string;
  body: string;
  publishedAt: string | null;
  tags: string[] | null;
};

export async function loader() {
  const musings: Musing[] = await client.fetch(
    `*[_type == "musing"] | order(publishedAt desc) {
      _id,
      body,
      publishedAt,
      tags
    }`
  );
  return { musings };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'EricDubé.com' },
    { name: 'description', content: 'Welcome to EricDubé.com' },
  ];
}

export default function Home() {
  const { musings } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <SocialLinks />
      <GitHubProjects projects={GITHUB_PROJECTS} />
      <MusingsCarousel musings={musings} />
    </Container>
  );
}

import { useLoaderData } from 'react-router';
import type { Route } from './+types/home';
import Container from '../components/Container';
import SocialLinks from '../components/SocialLinks';
import GitHubProjects from '../components/GitHubProjects';
import MusingsCarousel from '../components/MusingsCarousel';
import { client } from '~/sanity/client';

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

export async function loader() {
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
  return { projects, musings };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'EricDubé.com' },
    { name: 'description', content: 'Welcome to EricDubé.com' },
  ];
}

export default function Home() {
  const { projects, musings } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <SocialLinks />
      <GitHubProjects projects={projects} />
      <MusingsCarousel musings={musings} />
    </Container>
  );
}

import { useLoaderData } from 'react-router';
import { client } from '~/sanity/client';
import Container from '~/components/Container';
import MusingCard from '~/components/MusingCard';

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

export function meta() {
  return [{ title: 'Musings — EricDubé.com' }];
}

export default function Musings() {
  const { musings } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Musings</h1>
      {musings.length === 0 && (
        <p style={{ color: '#94a3b8' }}>No musings yet.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {musings.map((musing) => (
          <li key={musing._id}>
            <MusingCard {...musing} />
          </li>
        ))}
      </ul>
    </Container>
  );
}

import { useLoaderData } from 'react-router';
import { client } from '~/sanity/client';
import Container from '~/components/Container';
import WeirdFoodCard from '~/components/WeirdFoodCard';
import { siteTitleFrom, type SiteMetaMatch } from '~/lib/website';

type WeirdFood = {
  name: string;
  slug: string;
  foodType: string | null;
  weirdnessRating: number | null;
  tags: string[] | null;
  photo: { asset: object; alt: string } | null;
};

export async function loader() {
  const weirdFoods: WeirdFood[] = await client.fetch(
    `*[_type == "weirdFood"] | order(foundAt desc) {
      name,
      "slug": slug.current,
      foodType,
      weirdnessRating,
      tags,
      photo { asset, alt }
    }`
  );
  return { weirdFoods };
}

export function meta({ matches }: { matches: readonly SiteMetaMatch[] }) {
  return [{ title: `Weird-Looking Food — ${siteTitleFrom(matches)}` }];
}

export default function WeirdFoodList() {
  const { weirdFoods } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Weird-Looking Food</h1>
      {weirdFoods.length === 0 && (
        <p style={{ color: '#94a3b8' }}>No weird-looking food yet. Keep eating suspiciously.</p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.5rem',
      }}>
        {weirdFoods.map((food) => (
          <WeirdFoodCard key={food.slug} {...food} url={`/weird-food/${food.slug}`} />
        ))}
      </div>
    </Container>
  );
}

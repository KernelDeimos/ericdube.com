import { useLoaderData, data } from 'react-router';
import type { Route } from './+types/weird-food.$slug';
import { client } from '~/sanity/client';
import { urlFor } from '~/sanity/image';
import Container from '~/components/Container';
import styles from './weird-food.$slug.module.css';

type WeirdFood = {
  name: string;
  foodType: string | null;
  weirdnessRating: number | null;
  notes: string | null;
  foundAt: string | null;
  tags: string[] | null;
  photo: { asset: object; alt: string } | null;
};

export async function loader({ params }: Route.LoaderArgs) {
  const weirdFood: WeirdFood | null = await client.fetch(
    `*[_type == "weirdFood" && slug.current == $slug][0] {
      name,
      foodType,
      weirdnessRating,
      notes,
      foundAt,
      tags,
      photo { asset, alt }
    }`,
    { slug: params.slug }
  );

  if (!weirdFood) throw data(null, { status: 404 });
  return { weirdFood };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Not found' }];
  return [{ title: `${data.weirdFood.name} — EricDubé.com` }];
}

export default function WeirdFoodDetail() {
  const { weirdFood } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      {weirdFood.photo && (
        <img
          src={urlFor(weirdFood.photo).width(740).height(560).fit('crop').url()}
          alt={weirdFood.photo.alt}
          style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '2rem' }}
        />
      )}
      <h1 className={styles.name} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', margin: '0 0 0.75rem' }}>
        {weirdFood.name}
      </h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1rem' }}>
        {weirdFood.foodType && <span>{weirdFood.foodType}</span>}
        {weirdFood.weirdnessRating != null && (
          <span className={styles.rating}>{weirdFood.weirdnessRating}/10 weird</span>
        )}
        {weirdFood.foundAt && (
          <span>
            {new Date(weirdFood.foundAt).toLocaleDateString('en-CA', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        )}
      </div>
      {weirdFood.tags && weirdFood.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {weirdFood.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(68,136,255,0.15)',
              color: '#4488ff',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {weirdFood.notes && (
        <p style={{ lineHeight: 1.8, color: '#cbd5e1' }}>{weirdFood.notes}</p>
      )}
    </Container>
  );
}

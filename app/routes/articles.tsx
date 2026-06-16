import { useLoaderData } from 'react-router';
import { client } from '~/sanity/client';
import Container from '~/components/Container';
import ItemCard from '~/components/ItemCard';

type Article = {
  title: string;
  slug: string;
  publishedAt: string | null;
  excerpt: string | null;
  tags: string[] | null;
  coverImage: { asset: object; alt: string } | null;
};

export async function loader() {
  const articles: Article[] = await client.fetch(
    `*[_type == "article"] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      tags,
      coverImage { asset, alt }
    }`
  );
  return { articles };
}

export function meta() {
  return [{ title: 'Articles — EricDubé.com' }];
}

export default function Articles() {
  const { articles } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Articles</h1>
      {articles.length === 0 && (
        <p style={{ color: '#94a3b8' }}>No articles yet.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {articles.map((article) => (
          <li key={article.slug}>
            <ItemCard {...article} url={`/articles/${article.slug}`} />
          </li>
        ))}
      </ul>
    </Container>
  );
}

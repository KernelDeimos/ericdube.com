import { useLoaderData } from 'react-router';
import { client } from '~/sanity/client';
import { urlFor } from '~/sanity/image';
import Container from '~/components/Container';

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
            <a
              href={`/articles/${article.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
            >
              {article.coverImage && (
                <img
                  src={urlFor(article.coverImage).width(240).height(140).fit('crop').url()}
                  alt={article.coverImage.alt}
                  width={240}
                  height={140}
                  style={{ borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.375rem' }}>{article.title}</h2>
                {article.publishedAt && (
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>
                    {new Date(article.publishedAt).toLocaleDateString('en-CA', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                )}
                {article.excerpt && (
                  <p style={{ margin: '0 0 0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>{article.excerpt}</p>
                )}
                {article.tags && article.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {article.tags.map((tag) => (
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
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}

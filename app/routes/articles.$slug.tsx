import { useLoaderData, data } from 'react-router';
import type { Route } from './+types/articles.$slug';
import { PortableText } from '@portabletext/react';
import { client } from '~/sanity/client';
import { urlFor } from '~/sanity/image';
import Container from '~/components/Container';

type Article = {
  title: string;
  publishedAt: string | null;
  excerpt: string | null;
  tags: string[] | null;
  coverImage: { asset: object; alt: string } | null;
  body: any[];
};

const portableTextComponents = {
  types: {
    code: ({ value }: { value: { code: string; language?: string; filename?: string } }) => (
      <pre style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.375rem', padding: '1rem', overflowX: 'auto' }}>
        {value.filename && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{value.filename}</div>
        )}
        <code style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{value.code}</code>
      </pre>
    ),
    demoBlock: ({ value }: { value: { url: string; title?: string; height?: number } }) => (
      <iframe
        src={value.url}
        title={value.title ?? 'Demo'}
        height={value.height ?? 500}
        style={{ width: '100%', border: 'none', borderRadius: '0.375rem' }}
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    ),
    image: ({ value }: { value: { asset: object; alt: string; caption?: string } }) => (
      <figure style={{ margin: '1.5rem 0' }}>
        <img
          src={urlFor(value).width(900).url()}
          alt={value.alt}
          style={{ width: '100%', borderRadius: '0.375rem' }}
        />
        {value.caption && (
          <figcaption style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export async function loader({ params }: Route.LoaderArgs) {
  const article: Article | null = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      title,
      publishedAt,
      excerpt,
      tags,
      coverImage { asset, alt },
      body
    }`,
    { slug: params.slug }
  );

  if (!article) throw data(null, { status: 404 });
  return { article };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Not found' }];
  return [
    { title: `${data.article.title} — EricDubé.com` },
    ...(data.article.excerpt ? [{ name: 'description', content: data.article.excerpt }] : []),
  ];
}

export default function ArticleDetail() {
  const { article } = useLoaderData<typeof loader>();

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      {article.coverImage && (
        <img
          src={urlFor(article.coverImage).width(740).height(360).fit('crop').url()}
          alt={article.coverImage.alt}
          style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '2rem' }}
        />
      )}
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', margin: '0 0 0.75rem' }}>{article.title}</h1>
      {article.publishedAt && (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1rem' }}>
          {new Date(article.publishedAt).toLocaleDateString('en-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
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
      <div style={{ lineHeight: 1.8, color: '#cbd5e1' }}>
        <PortableText value={article.body} components={portableTextComponents} />
      </div>
    </Container>
  );
}

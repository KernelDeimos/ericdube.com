import { useLoaderData, data } from 'react-router';
import type { Route } from './+types/articles.$slug';
import { PortableText } from '@portabletext/react';
import { client } from '~/sanity/client';
import { urlFor } from '~/sanity/image';
import Container from '~/components/Container';
import styles from './articles.$slug.module.css';

type AiInfo = {
  designation: string | null;
  score: number | null;
  flaggedSentences: string[] | null;
};

type Article = {
  title: string;
  publishedAt: string | null;
  excerpt: string | null;
  tags: string[] | null;
  coverImage: { asset: object; alt: string } | null;
  body: any[];
  ai: AiInfo | null;
};

const HIGHLIGHT_MARK = 'aiHighlight';

const DESIGNATION_LABELS: Record<string, string> = {
  unspecified: 'Unspecified',
  'human-written': 'Human-written',
  'ai-generated': 'AI-generated',
  mixed: 'Mixed',
};

function scoreColor(score: number): string {
  if (score < 20) return '#4ade80'; // green
  if (score < 50) return '#e0b341'; // mustard
  return '#f87171'; // red
}

// Inject an `aiHighlight` decorator onto the runs of text that ZeroGPT flagged.
// Works at the block level so a flagged sentence spanning several spans (e.g.
// across a bold word) is still highlighted, and existing marks are preserved.
function annotateFlagged(body: any[], flagged: string[] | null | undefined): any[] {
  if (!Array.isArray(body) || !flagged || flagged.length === 0) return body;
  const sentences = flagged.map((s) => s?.trim()).filter(Boolean) as string[];
  if (sentences.length === 0) return body;

  return body.map((block) => {
    if (block?._type !== 'block' || !Array.isArray(block.children)) return block;
    if (!block.children.every((c: any) => c?._type === 'span')) return block;

    const fullText: string = block.children.map((c: any) => c.text ?? '').join('');
    if (!fullText) return block;

    // Mark every character covered by a flagged sentence.
    const mask = new Array(fullText.length).fill(false);
    let anyFlagged = false;
    for (const sentence of sentences) {
      let from = 0;
      for (;;) {
        const idx = fullText.indexOf(sentence, from);
        if (idx === -1) break;
        for (let i = idx; i < idx + sentence.length; i++) mask[i] = true;
        anyFlagged = true;
        from = idx + sentence.length;
      }
    }
    if (!anyFlagged) return block;

    // Split each span at highlight boundaries, adding the decorator to flagged runs.
    const newChildren: any[] = [];
    let offset = 0;
    let key = 0;
    for (const child of block.children) {
      const text: string = child.text ?? '';
      if (!text) {
        newChildren.push(child);
        continue;
      }
      let runStart = 0;
      let runFlag = mask[offset];
      for (let i = 1; i <= text.length; i++) {
        const flagHere = i < text.length ? mask[offset + i] : !runFlag; // force final flush
        if (flagHere !== runFlag) {
          const marks = Array.isArray(child.marks) ? [...child.marks] : [];
          if (runFlag) marks.push(HIGHLIGHT_MARK);
          newChildren.push({
            ...child,
            _key: `${child._key ?? 'span'}__${key++}`,
            text: text.slice(runStart, i),
            marks,
          });
          runStart = i;
          runFlag = flagHere;
        }
      }
      offset += text.length;
    }
    return { ...block, children: newChildren };
  });
}

const portableTextComponents = {
  marks: {
    aiHighlight: ({ children }: { children?: React.ReactNode }) => (
      <mark className={styles.aiMark} title="Flagged by ZeroGPT as likely AI-generated">
        {children}
      </mark>
    ),
  },
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
      <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
        <img
          src={urlFor(value).width(900).fit('max').url()}
          alt={value.alt}
          style={{ maxWidth: '100%', minWidth: '200px', width: 'auto', height: 'auto', borderRadius: '0.375rem', margin: '0 auto' }}
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
      body,
      ai { designation, score, flaggedSentences }
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

function AiPanel({ ai }: { ai: AiInfo }) {
  const score = typeof ai.score === 'number' ? ai.score : null;
  const flaggedCount = ai.flaggedSentences?.length ?? 0;
  const designation = ai.designation ? DESIGNATION_LABELS[ai.designation] ?? ai.designation : null;

  return (
    <aside
      style={{
        border: '1px solid rgba(192,132,252,0.35)',
        background: 'rgba(192,132,252,0.06)',
        borderRadius: '0.5rem',
        padding: '1rem 1.25rem',
        margin: '0 0 2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700 }}>
          AI involvement
        </span>
        {designation && (
          <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
            Designation: <strong>{designation}</strong>
          </span>
        )}
      </div>
      {score != null && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
            <span>ZeroGPT rating</span>
            <span style={{ color: scoreColor(score), fontWeight: 700 }}>{Math.round(score)}% likely AI</span>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, score))}%`, height: '100%', background: scoreColor(score) }} />
          </div>
        </div>
      )}
      {flaggedCount > 0 && (
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.75rem 0 0', lineHeight: 1.5 }}>
          <mark className={styles.aiMark}>Highlighted</mark> sentences below ({flaggedCount}) were flagged by
          ZeroGPT as likely AI-generated.
        </p>
      )}
      <p
        style={{
          fontSize: '0.72rem',
          color: '#8b8ba0',
          lineHeight: 1.5,
          margin: '0.85rem 0 0',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(192,132,252,0.2)',
        }}
      >
        My articles have mixed AI-involvement. My website is connected to an MCP server and sometimes
        I'll have Claude Code start out an article for me and edit it later. For this reason I'm using{' '}
        <a href="https://www.zerogpt.com" style={{ color: '#a78bce' }}>ZeroGPT</a> to highlight
        sentences likely generated by AI and provide an overall rating of AI involvement for each
        article.
      </p>
    </aside>
  );
}

export default function ArticleDetail() {
  const { article } = useLoaderData<typeof loader>();
  const body = annotateFlagged(article.body, article.ai?.flaggedSentences);

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      {article.coverImage && (
        <img
          src={urlFor(article.coverImage).width(740).height(360).fit('crop').url()}
          alt={article.coverImage.alt}
          style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '2rem' }}
        />
      )}
      <h1 className={styles.articleTitle} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', margin: '0 0 0.75rem' }}>{article.title}</h1>
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
      {article.ai && <AiPanel ai={article.ai} />}
      <div className={styles.body} style={{ lineHeight: 1.8, color: '#cbd5e1' }}>
        <PortableText value={body} components={portableTextComponents} />
      </div>
    </Container>
  );
}

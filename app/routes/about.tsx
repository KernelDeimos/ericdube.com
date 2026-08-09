import { useLoaderData } from 'react-router';
import { PortableText } from '@portabletext/react';
import { client } from '~/sanity/client';
import { urlFor } from '~/sanity/image';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, siteTitleFrom, type SiteMetaMatch } from '~/lib/website';
import styles from './about.module.css';

type Highlight = { label: string; detail: string };

type AboutPage = {
  heading: string;
  intro: string | null;
  portrait: { asset: object; alt: string | null } | null;
  // Portable-text blocks; typed loosely like the article body, which feeds the
  // same PortableText renderer.
  body: any[] | null;
  highlights: Highlight[] | null;
  ctaHeading: string | null;
  ctaBody: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  seoDescription: string | null;
};

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  // A brand that does not offer About must 404 here, not just omit the tab.
  requireTab(website, 'about');

  // Scoped to the brand's own document. A brand with no About page of its own
  // has nothing to show here — 404 rather than borrow another brand's story.
  const page = await client.fetch<AboutPage | null>(
    `*[_type == "aboutPage" && _id == $pageId][0] {
      heading,
      intro,
      portrait { asset, alt },
      body,
      highlights[] { label, detail },
      ctaHeading,
      ctaBody,
      ctaLabel,
      ctaUrl,
      seoDescription
    }`,
    { pageId: website.aboutPageId ?? '' }
  );

  if (!page) throw new Response('Not found', { status: 404 });
  return { page };
}

export function meta({
  data,
  matches,
}: {
  data: Awaited<ReturnType<typeof loader>> | undefined;
  matches: readonly SiteMetaMatch[];
}) {
  const heading = data?.page?.heading || 'About';
  const description = data?.page?.seoDescription || data?.page?.intro;
  return [
    { title: `${heading} — ${siteTitleFrom(matches)}` },
    ...(description ? [{ name: 'description', content: description }] : []),
  ];
}

export default function About() {
  const { page } = useLoaderData<typeof loader>();
  const external = page.ctaUrl?.startsWith('http');

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        {page.portrait && (
          <img
            className={styles.portrait}
            src={urlFor(page.portrait).width(320).height(320).fit('crop').url()}
            alt={page.portrait.alt ?? page.heading}
          />
        )}
        <div className={styles.headerText}>
          <h1 className={styles.heading}>{page.heading}</h1>
          {page.intro && <p className={styles.intro}>{page.intro}</p>}
        </div>
      </header>

      <div className={styles.layout}>
        {page.body && page.body.length > 0 && (
          <div className={styles.body}>
            <PortableText value={page.body} />
          </div>
        )}

        {page.highlights && page.highlights.length > 0 && (
          <aside className={styles.highlights}>
            <dl>
              {page.highlights.map((item) => (
                <div key={`${item.label}-${item.detail}`} className={styles.highlight}>
                  <dt className={styles.highlightLabel}>{item.label}</dt>
                  <dd className={styles.highlightDetail}>{item.detail}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>

      {page.ctaHeading && (
        <section className={styles.cta}>
          <h2 className={styles.ctaHeading}>{page.ctaHeading}</h2>
          {page.ctaBody && <p className={styles.ctaBody}>{page.ctaBody}</p>}
          {page.ctaLabel && page.ctaUrl && (
            <a
              className={styles.ctaLink}
              href={page.ctaUrl}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {page.ctaLabel}
            </a>
          )}
        </section>
      )}
    </Container>
  );
}

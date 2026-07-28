import { PortableText } from '@portabletext/react';
import { Link } from 'react-router';
import { urlFor } from '~/sanity/image';
import SocialLinks from '../SocialLinks';
import GitHubProjects from '../GitHubProjects';
import MusingsCarousel from '../MusingsCarousel';
import styles from './sections.module.css';

/**
 * Registry of the sections a brand can stack to build its own landing page.
 *
 * Every section draws from the theme custom properties rather than fixed
 * colours, so a light brand and a dark brand both get readable output from the
 * same section with no per-brand code. The one rule when adding a section: no
 * hardcoded colours.
 */

export type SanityImage = { asset: object; alt?: string | null };

type HeroSection = {
  _type: 'heroSection';
  _key: string;
  heading: string;
  subheading?: string | null;
  image?: SanityImage | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

type FeatureGridSection = {
  _type: 'featureGridSection';
  _key: string;
  heading?: string | null;
  features?: { _key: string; title: string; body?: string | null; icon?: SanityImage | null }[] | null;
};

type StatsSection = {
  _type: 'statsSection';
  _key: string;
  heading?: string | null;
  stats?: { _key: string; value: string; label?: string | null }[] | null;
};

type TestimonialSection = {
  _type: 'testimonialSection';
  _key: string;
  quote: string;
  attribution?: string | null;
  role?: string | null;
  avatar?: SanityImage | null;
};

type LogoCloudSection = {
  _type: 'logoCloudSection';
  _key: string;
  heading?: string | null;
  logos?: (SanityImage & { _key: string; url?: string | null })[] | null;
};

type CtaBandSection = {
  _type: 'ctaBandSection';
  _key: string;
  heading: string;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

type FaqSection = {
  _type: 'faqSection';
  _key: string;
  heading?: string | null;
  faqs?: { _key: string; question: string; answer: string }[] | null;
};

type RichTextSection = { _type: 'richTextSection'; _key: string; body?: unknown };

type PortfolioSection = {
  _type: 'portfolioSection';
  _key: string;
  showSocialLinks?: boolean | null;
  showProjects?: boolean | null;
  showMusings?: boolean | null;
};

export type HomeSection =
  | HeroSection
  | FeatureGridSection
  | StatsSection
  | TestimonialSection
  | LogoCloudSection
  | CtaBandSection
  | FaqSection
  | RichTextSection
  | PortfolioSection;

/** Data only the portfolio section needs, fetched only when one is present. */
export type PortfolioData = {
  projects: Parameters<typeof GitHubProjects>[0]['projects'];
  musings: Parameters<typeof MusingsCarousel>[0]['musings'];
};

/**
 * A section link may point at this site or off it. Internal paths go through
 * the router; anything else is treated as external and cannot be a javascript:
 * or data: URL, since these come from content.
 */
function SectionLink({ to, children }: { to: string; children: React.ReactNode }) {
  if (to.startsWith('/')) {
    return (
      <Link to={to} className={styles.button}>
        {children}
      </Link>
    );
  }
  if (!/^https?:\/\//i.test(to)) return null;
  return (
    <a href={to} className={styles.button} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}

function Hero({ section }: { section: HeroSection }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h2 className={styles.heroHeading}>{section.heading}</h2>
        {section.subheading && <p className={styles.lead}>{section.subheading}</p>}
        {section.ctaLabel && section.ctaUrl && (
          <SectionLink to={section.ctaUrl}>{section.ctaLabel}</SectionLink>
        )}
      </div>
      {section.image?.asset && (
        <img
          className={styles.heroImage}
          src={urlFor(section.image).width(720).fit('max').url()}
          alt={section.image.alt ?? ''}
        />
      )}
    </section>
  );
}

function FeatureGrid({ section }: { section: FeatureGridSection }) {
  const features = section.features ?? [];
  if (features.length === 0) return null;
  return (
    <section className={styles.section}>
      {section.heading && <h2 className={styles.heading}>{section.heading}</h2>}
      <div className={styles.grid}>
        {features.map((feature) => (
          <article key={feature._key} className={styles.card}>
            {feature.icon?.asset && (
              <img
                className={styles.icon}
                src={urlFor(feature.icon).width(96).fit('max').url()}
                alt={feature.icon.alt ?? ''}
              />
            )}
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            {feature.body && <p className={styles.cardBody}>{feature.body}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function Stats({ section }: { section: StatsSection }) {
  const stats = section.stats ?? [];
  if (stats.length === 0) return null;
  return (
    <section className={styles.section}>
      {section.heading && <h2 className={styles.heading}>{section.heading}</h2>}
      <dl className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat._key} className={styles.stat}>
            <dt className={styles.statValue}>{stat.value}</dt>
            {stat.label && <dd className={styles.statLabel}>{stat.label}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}

function Testimonial({ section }: { section: TestimonialSection }) {
  return (
    <section className={styles.section}>
      <figure className={styles.testimonial}>
        <blockquote className={styles.quote}>{section.quote}</blockquote>
        {(section.attribution || section.avatar?.asset) && (
          <figcaption className={styles.attribution}>
            {section.avatar?.asset && (
              <img
                className={styles.avatar}
                src={urlFor(section.avatar).width(96).height(96).fit('crop').url()}
                alt={section.avatar.alt ?? ''}
              />
            )}
            <span>
              {section.attribution}
              {section.role && <span className={styles.role}>{section.role}</span>}
            </span>
          </figcaption>
        )}
      </figure>
    </section>
  );
}

function LogoCloud({ section }: { section: LogoCloudSection }) {
  const logos = section.logos ?? [];
  if (logos.length === 0) return null;
  return (
    <section className={styles.section}>
      {section.heading && <h2 className={styles.heading}>{section.heading}</h2>}
      <ul className={styles.logos}>
        {logos.map((logo) => {
          const img = (
            <img
              className={styles.logo}
              src={urlFor(logo).height(64).fit('max').url()}
              alt={logo.alt ?? ''}
            />
          );
          return (
            <li key={logo._key}>
              {logo.url && /^https?:\/\//i.test(logo.url) ? (
                <a href={logo.url} target="_blank" rel="noreferrer noopener">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CtaBand({ section }: { section: CtaBandSection }) {
  return (
    <section className={styles.ctaBand}>
      <h2 className={styles.heading}>{section.heading}</h2>
      {section.body && <p className={styles.lead}>{section.body}</p>}
      {section.ctaLabel && section.ctaUrl && (
        <SectionLink to={section.ctaUrl}>{section.ctaLabel}</SectionLink>
      )}
    </section>
  );
}

function Faq({ section }: { section: FaqSection }) {
  const faqs = section.faqs ?? [];
  if (faqs.length === 0) return null;
  return (
    <section className={styles.section}>
      {section.heading && <h2 className={styles.heading}>{section.heading}</h2>}
      <div className={styles.faqs}>
        {faqs.map((faq) => (
          <details key={faq._key} className={styles.faq}>
            <summary className={styles.faqQuestion}>{faq.question}</summary>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function RichText({ section }: { section: RichTextSection }) {
  if (!section.body) return null;
  return (
    <section className={styles.section}>
      <div className={styles.richText}>
        <PortableText value={section.body as never} />
      </div>
    </section>
  );
}

function Portfolio({
  section,
  data,
}: {
  section: PortfolioSection;
  data: PortfolioData | null;
}) {
  if (!data) return null;
  return (
    <>
      {section.showSocialLinks !== false && <SocialLinks />}
      {section.showProjects !== false && <GitHubProjects projects={data.projects} />}
      {section.showMusings !== false && <MusingsCarousel musings={data.musings} />}
    </>
  );
}

export function HomeSections({
  sections,
  portfolio,
}: {
  sections: HomeSection[];
  portfolio: PortfolioData | null;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case 'heroSection':
            return <Hero key={section._key} section={section} />;
          case 'featureGridSection':
            return <FeatureGrid key={section._key} section={section} />;
          case 'statsSection':
            return <Stats key={section._key} section={section} />;
          case 'testimonialSection':
            return <Testimonial key={section._key} section={section} />;
          case 'logoCloudSection':
            return <LogoCloud key={section._key} section={section} />;
          case 'ctaBandSection':
            return <CtaBand key={section._key} section={section} />;
          case 'faqSection':
            return <Faq key={section._key} section={section} />;
          case 'richTextSection':
            return <RichText key={section._key} section={section} />;
          case 'portfolioSection':
            return <Portfolio key={section._key} section={section} data={portfolio} />;
          default:
            // An unknown _type means content authored against a newer schema
            // than this deploy. Skip it rather than crash the whole page.
            return null;
        }
      })}
    </>
  );
}

/** True when the brand's page needs the projects and musings queries at all. */
export function needsPortfolioData(sections: HomeSection[]): boolean {
  return sections.some((section) => section._type === 'portfolioSection');
}

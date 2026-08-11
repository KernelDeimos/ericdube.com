import type { CSSProperties } from 'react';
import { type PricingOption, pricingOptionsFor } from '~/lib/pricing';
import styles from './ServiceCard.module.css';

export type Service = {
  _id: string;
  title: string;
  slug: string | null;
  tagline: string | null;
  description: string;
  deliverables: string[] | null;
  idealFor: string[] | null;
  technologies: string[] | null;
  pricing: PricingOption[] | null;
  /** 'inherit' | 'prices' | 'consultation' — per-service override of the page switch. */
  pricingDisplay: string | null;
  ctaLabel: string | null;
  ctaTarget: string | null;
  ctaUrl: string | null;
  turnaround: string | null;
  accentColor: string | null;
  featured: boolean | null;
};

/**
 * Resolve where this card's button points. 'form' scrolls to the contact form
 * with the service preselected; 'scheduling' uses the page's booking link, and
 * falls back to the form when no link is configured.
 */
function ctaHref(service: Service, schedulingUrl: string | null): string | null {
  if (!service.ctaLabel) return null;
  const target = service.ctaTarget || 'form';
  if (target === 'url') return service.ctaUrl || null;
  if (target === 'scheduling' && schedulingUrl) return schedulingUrl;
  return `?service=${encodeURIComponent(service.slug || service._id)}#contact`;
}

export default function ServiceCard({
  service,
  showPrices,
  schedulingUrl,
}: {
  service: Service;
  /** Page-level master switch, used when the service says 'inherit'. */
  showPrices: boolean;
  schedulingUrl: string | null;
}) {
  const accent = service.accentColor || 'var(--color-teal)';
  const display = service.pricingDisplay || 'inherit';

  // 'consultation' drops the price block entirely — this card sells a
  // conversation, not a number.
  const consultationOnly = display === 'consultation';
  const resolvedShowPrices = display === 'prices' ? true : display === 'inherit' && showPrices;

  // Keep the authored options alongside the formatted ones so per-option
  // fine print (minimum, note) can still be rendered.
  const authored = service.pricing ?? [];
  const prices = consultationOnly ? [] : pricingOptionsFor(service.pricing, resolvedShowPrices);

  const href = ctaHref(service, schedulingUrl);
  const external = href?.startsWith('http');

  return (
    <article
      className={`${styles.card} ${service.featured ? styles.featured : ''}`}
      style={{ '--accent': accent } as CSSProperties}
    >
      <header>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{service.title}</h2>
          {service.featured && <span className={styles.featuredTag}>Featured</span>}
        </div>
        {service.tagline && <p className={styles.tagline}>{service.tagline}</p>}
      </header>

      <p className={styles.description}>{service.description}</p>

      {service.deliverables && service.deliverables.length > 0 && (
        <ul className={styles.deliverables}>
          {service.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {((service.idealFor?.length ?? 0) > 0 || (service.technologies?.length ?? 0) > 0) && (
        <div className={styles.badges}>
          {service.idealFor?.map((tag) => (
            <span key={tag} className={styles.badge}>
              {tag}
            </span>
          ))}
          {service.technologies?.map((tech) => (
            <span key={tech} className={`${styles.badge} ${styles.techBadge}`}>
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className={styles.pricing}>
        {prices.map((price, i) => {
          const option = authored[i];
          const meta = [option?.minimum, option?.note].filter(Boolean).join(' · ');
          return (
            <div
              key={`${price.label}-${i}`}
              className={`${styles.priceRow} ${option?.featured ? styles.priceRowFeatured : ''}`}
            >
              <span className={styles.priceLabel}>{price.label}</span>
              <span className={price.isQuote ? styles.priceQuote : styles.priceValue}>
                {price.price}
              </span>
              {meta && <p className={styles.priceMeta}>{meta}</p>}
            </div>
          );
        })}
        {consultationOnly && (
          <p className={styles.consultation}>Scoped and quoted after a short conversation.</p>
        )}
        {service.turnaround && (
          <p className={styles.turnaround}>Typical turnaround: {service.turnaround}</p>
        )}
        {href && (
          <a
            className={styles.cta}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {service.ctaLabel}
          </a>
        )}
      </div>
    </article>
  );
}

import { useLoaderData, useActionData } from 'react-router';
import { client } from '~/sanity/client';
import Container from '~/components/Container';
import ServiceCard, { type Service } from '~/components/ServiceCard';
import ContactForm, { type ContactFormResult } from '~/components/ContactForm';
import { submitEnquiry, contactMailto } from '~/lib/enquiries';
import styles from './services.module.css';

type ProcessStep = { title: string; description: string | null };
type Faq = { question: string; answer: string };

type ServicesPage = {
  heading: string | null;
  intro: string | null;
  availabilityStatus: string | null;
  availabilityNote: string | null;
  showPrices: boolean | null;
  pricingHeading: string | null;
  pricingPhilosophy: string | null;
  process: ProcessStep[] | null;
  faqs: Faq[] | null;
  ctaHeading: string | null;
  ctaBody: string | null;
  schedulingUrl: string | null;
  seoDescription: string | null;
} | null;

const AVAILABILITY: Record<string, { label: string; color: string }> = {
  available: { label: 'Available for work', color: 'var(--color-teal)' },
  limited: { label: 'Limited availability', color: 'var(--color-mustard)' },
  booked: { label: 'Booked — taking enquiries', color: 'var(--color-sky)' },
  closed: { label: 'Not taking work right now', color: '#94a3b8' },
};

// Sensible copy for anything the CMS has not filled in yet, so the page is
// never blank and never half-rendered.
const FALLBACK = {
  heading: 'Freelance development',
  intro:
    'I build and ship web applications — full products, focused features, and the unglamorous work of making an existing codebase behave. Tell me what you need and I will tell you honestly whether I am the right person for it.',
  ctaHeading: 'Have something in mind?',
  ctaBody:
    'Send over a short description of the problem, roughly when you need it, and any budget you have in mind. I answer every enquiry, even the ones I have to turn down.',
};

export async function loader() {
  const [page, services] = await Promise.all([
    client.fetch<ServicesPage>(
      `*[_type == "servicesPage"] | order(_updatedAt desc)[0] {
        heading,
        intro,
        availabilityStatus,
        availabilityNote,
        showPrices,
        pricingHeading,
        pricingPhilosophy,
        process[] { title, description },
        faqs[] { question, answer },
        ctaHeading,
        ctaBody,
        schedulingUrl,
        seoDescription
      }`
    ),
    client.fetch<Service[]>(
      `*[_type == "service" && available != false] | order(featured desc, order asc, title asc) {
        _id,
        title,
        "slug": slug.current,
        tagline,
        description,
        deliverables,
        idealFor,
        "technologies": technologies[]->name,
        pricing[] {
          model, label, amount, amountMax, currency, unit, minimum, note, featured
        },
        pricingDisplay,
        ctaLabel,
        ctaTarget,
        ctaUrl,
        turnaround,
        accentColor,
        featured
      }`
    ),
  ]);

  return { page, services };
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();

  // Honeypot: bots fill in every field they find, people never see this one.
  // Answer as if it worked so the sender does not learn to retry.
  if (str(form.get('website'))) return { ok: true } satisfies ContactFormResult;

  const name = str(form.get('name'));
  const email = str(form.get('email'));
  const message = str(form.get('message'));

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Please tell me your name.';
  if (!email) errors.email = 'I need an email address to reply to.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'That does not look like an email address.';
  if (!message) errors.message = 'A sentence or two about the work is plenty.';
  else if (message.length > 5000)
    errors.message = 'That is over 5000 characters — trim it and send the rest by email.';

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, formError: null, mailto: null } satisfies ContactFormResult;
  }

  const result = await submitEnquiry({
    name,
    email,
    company: str(form.get('company')) || null,
    serviceId: str(form.get('service')) || null,
    budget: str(form.get('budget')) || null,
    timeline: str(form.get('timeline')) || null,
    message,
  });

  if (result.ok) return { ok: true } satisfies ContactFormResult;

  return {
    ok: false,
    errors: {},
    formError:
      result.reason === 'unconfigured'
        ? 'The contact form is not wired up to a mailbox yet.'
        : 'Something went wrong sending that.',
    mailto: contactMailto(),
  } satisfies ContactFormResult;
}

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> | undefined }) {
  const heading = data?.page?.heading || FALLBACK.heading;
  return [
    { title: `${heading} — EricDubé.com` },
    {
      name: 'description',
      content: data?.page?.seoDescription || data?.page?.intro || FALLBACK.intro,
    },
  ];
}

export default function Services() {
  const { page, services } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();

  const heading = page?.heading || FALLBACK.heading;
  const intro = page?.intro || FALLBACK.intro;
  const showPrices = page?.showPrices === true;
  const availability = page?.availabilityStatus
    ? AVAILABILITY[page.availabilityStatus]
    : undefined;
  const schedulingUrl = page?.schedulingUrl ?? null;

  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <h1 className={styles.heading}>{heading}</h1>
        {availability && (
          <p className={styles.availability} style={{ color: availability.color }}>
            <span className={styles.dot} style={{ backgroundColor: availability.color }} />
            {availability.label}
            {page?.availabilityNote && (
              <span className={styles.availabilityNote}>— {page.availabilityNote}</span>
            )}
          </p>
        )}
        <p className={styles.intro}>{intro}</p>
      </header>

      {page?.pricingPhilosophy && (
        <section className={styles.philosophy}>
          <h2 className={styles.philosophyHeading}>{page.pricingHeading || 'How I charge'}</h2>
          <p className={styles.philosophyBody}>{page.pricingPhilosophy}</p>
          {!showPrices && (
            <p className={styles.philosophyNote}>
              Every engagement is quoted individually — get in touch and I will put numbers to it.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="what-i-do">
        <h2 id="what-i-do" className={styles.sectionHeading}>
          What I do
        </h2>
        {services.length === 0 ? (
          <p className={styles.empty}>
            Services are being written up. In the meantime,{' '}
            <a className={styles.link} href="#contact">
              send me a message
            </a>{' '}
            describing what you need.
          </p>
        ) : (
          <div className={styles.grid}>
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                showPrices={showPrices}
                schedulingUrl={schedulingUrl}
              />
            ))}
          </div>
        )}
      </section>

      {page?.process && page.process.length > 0 && (
        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className={styles.sectionHeading}>
            How it works
          </h2>
          <ol className={styles.process}>
            {page.process.map((step, i) => (
              <li key={step.title} className={styles.processStep}>
                <span className={styles.processNumber}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  {step.description && (
                    <p className={styles.processBody}>{step.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {page?.faqs && page.faqs.length > 0 && (
        <section aria-labelledby="faq">
          <h2 id="faq" className={styles.sectionHeading}>
            Questions
          </h2>
          <div className={styles.faqs}>
            {page.faqs.map((faq) => (
              <details key={faq.question} className={styles.faq}>
                <summary className={styles.faqQuestion}>{faq.question}</summary>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className={styles.cta} id="contact">
        <h2 className={styles.ctaHeading}>{page?.ctaHeading || FALLBACK.ctaHeading}</h2>
        <p className={styles.ctaBody}>{page?.ctaBody || FALLBACK.ctaBody}</p>
        {schedulingUrl && (
          <p className={styles.ctaScheduling}>
            Prefer to talk it through?{' '}
            <a
              className={styles.ctaSchedulingLink}
              href={schedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a call
            </a>
            .
          </p>
        )}
        <ContactForm
          services={services.map((s) => ({ _id: s._id, title: s.title, slug: s.slug }))}
          result={result}
        />
      </section>
    </Container>
  );
}

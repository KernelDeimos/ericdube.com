import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT } from '~/lib/product';
import styles from './pricing.module.css';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  requireTab(website, 'prehend');
  return null;
}

export function meta({
  matches,
  location,
}: {
  matches: readonly SiteMetaMatch[];
  location: { pathname: string };
}) {
  return seoMeta({
    matches,
    location,
    title: `${PRODUCT_NAME} pricing — BYOK or fully managed`,
    description:
      `Start free. Bring your own model key and pay your provider directly with no markup, or let ` +
      `${PRODUCT_NAME} run the model under a usage cap you set. Per developer, per month.`,
  });
}

// Prices are deliberate placeholders — Eric hasn't set them. Rendered as
// "$XX" so nobody mistakes them for real numbers.
const TIERS = [
  {
    name: 'Free',
    tag: null as string | null,
    note: 'For a single developer trying it on real code.',
    amount: '$0',
    free: true,
    unit: null as string | null,
    sub: 'one developer',
    ctaLabel: 'Start free',
    ctaStyle: 'ghost' as const,
    features: [
      'A monthly allowance of reviewed chunks',
      'The full conversational review experience',
      'Comprehension coverage on your own repos',
      'CLI and terminal workflow',
    ],
  },
  {
    name: 'BYOK',
    tag: 'Best for cost & privacy',
    note: 'You bring the model key. Your code never routes through us on its way to the model.',
    amount: '$XX',
    free: false,
    unit: '/ developer / mo',
    sub: '+ you pay your provider directly',
    ctaLabel: 'Start with your key',
    ctaStyle: 'primary' as const,
    features: [
      'Bring your own model provider & key',
      'No markup — you pay the provider at cost',
      'Code isn’t retained to train anything',
      'Security audits & architecture warnings',
      'Team comprehension coverage',
    ],
  },
  {
    name: 'Managed',
    tag: null,
    note: 'We run the model for you. One bill, one login, a cap you control.',
    amount: '$YY',
    free: false,
    unit: '/ developer / mo',
    sub: 'model usage included, up to your cap',
    ctaLabel: 'Go managed',
    ctaStyle: 'ghost' as const,
    features: [
      'We call the model — no keys to manage',
      'A monthly usage cap you set, so spend is predictable',
      'One invoice for the whole team',
      'Everything in BYOK',
      'Priority support',
    ],
  },
];

const COMPARE = [
  {
    row: 'Who pays for the model',
    byok: 'You — billed by your provider, at cost, no markup.',
    managed: 'We do — folded into one predictable monthly price.',
  },
  {
    row: 'Where your code goes',
    byok: 'Straight to your provider on your key. We never see the model traffic.',
    managed: 'Through us to the model, under the access controls on our security page.',
  },
  {
    row: 'Cost predictability',
    byok: 'Varies with your provider usage; you hold the meter.',
    managed: 'Flat per-seat price plus a cap you set — no surprise bills.',
  },
  {
    row: 'When you hit the cap',
    byok: 'No cap from us — your provider’s limits apply.',
    managed: 'Reviews pause (or you raise the cap). Spend never runs away.',
  },
];

const FAQ = [
  {
    q: 'What happens if a managed team hits its usage cap?',
    a: 'The cap is a feature, not a trap: reviews pause until the next cycle, or an admin raises it in a click. You will never get a surprise invoice — that predictability is the whole point of the managed plan.',
  },
  {
    q: 'Can I switch between BYOK and managed later?',
    a: 'Yes. Move your team from managed to your own key (or back) whenever it makes sense. Add or rotate a provider key without losing your review history or comprehension coverage.',
  },
  {
    q: 'On BYOK, do you mark up the model cost?',
    a: 'No. On BYOK you pay your model provider directly at their price — we never touch that bill. Our per-developer subscription covers the review product itself.',
  },
  {
    q: 'Is my code stored or used for training?',
    a: 'Your code is reviewed, not retained, and never used to train models. The full data flow for each plan is on the security page.',
  },
];

export default function Pricing() {
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4.5rem' }}>
      <div className={styles.page}>
        {/* ---- Hero ---- */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            <span className={styles.brand}>{PRODUCT_PARENT}</span>
            <span className={styles.sep}>/</span>
            <span>{PRODUCT_NAME}</span>
            <span className={styles.sep}>/</span>
            <span>Pricing</span>
          </p>
          <h1>Priced per developer. Cheaper than the bug it catches.</h1>
          <p className={styles.lede}>
            Start free on real code. When it earns a place in your workflow, pick who holds the model
            key — you, or us.
          </p>
          <p className={styles.anchor}>
            A seat costs less than two hours of a developer’s time — and it reviews every hour.
          </p>
          <div>
            <span className={styles.placeholderNote}>
              Prices shown ($XX / $YY) are placeholders — not final.
            </span>
          </div>
        </header>

        {/* ---- Tiers ---- */}
        <section className={styles.tiers}>
          {TIERS.map((t) => (
            <article
              key={t.name}
              className={`${styles.tier} ${t.tag === 'Best for cost & privacy' ? styles.tierFeatured : ''}`}
            >
              {t.tag && <span className={styles.tierTag}>{t.tag}</span>}
              <h3 className={styles.tierName}>{t.name}</h3>
              <p className={styles.tierNote}>{t.note}</p>
              <div className={styles.price}>
                <span className={`${styles.priceAmt} ${t.free ? styles.priceAmtFree : ''}`}>
                  {t.amount}
                </span>
                {t.unit && <span className={styles.priceUnit}>{t.unit}</span>}
              </div>
              <p className={styles.priceSub}>{t.sub ?? ' '}</p>
              <Link
                className={`${styles.tierCta} ${t.ctaStyle === 'primary' ? styles.ctaPrimary : styles.ctaGhost}`}
                to="/prehend/developers"
              >
                {t.ctaLabel}
              </Link>
              <ul className={styles.featureList}>
                {t.features.map((f) => (
                  <li key={f}>
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* ---- Enterprise strip ---- */}
        <section className={styles.enterprise}>
          <div className={styles.enterpriseText}>
            <h3>Enterprise & self-host</h3>
            <p>
              Run {PRODUCT_NAME} inside your own network, with SSO, audit logs, custom retention, and
              a review of the deployment with our team. For orgs that need the code to never leave the
              building.
            </p>
          </div>
          <Link className={styles.enterpriseCta} to="/prehend/developers">
            Talk to us →
          </Link>
        </section>

        {/* ---- Compare ---- */}
        <section>
          <p className={styles.kicker}>BYOK vs. Managed</p>
          <h2>Same review. You just choose who runs the model.</h2>
          <div className={styles.compareWrap}>
            <table className={styles.compare}>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">BYOK</th>
                  <th scope="col">Managed</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((c) => (
                  <tr key={c.row}>
                    <th className={styles.rowHead} scope="row">
                      {c.row}
                    </th>
                    <td>{c.byok}</td>
                    <td>{c.managed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section>
          <p className={styles.kicker}>Questions</p>
          <h2>The fine print, up front.</h2>
          <div className={styles.faq}>
            {FAQ.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary>{f.q}</summary>
                <p className={styles.faqAnswer}>
                  {f.a}{' '}
                  {f.q.startsWith('Is my code') && <Link to="/prehend/security">See the data flow →</Link>}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ---- Final CTA ---- */}
        <section className={styles.finalCta}>
          <h2>Try it on your next commit — free.</h2>
          <div className={styles.finalCtaBtns}>
            <Link className={`${styles.tierCta} ${styles.ctaPrimary}`} to="/prehend/developers">
              Start free
            </Link>
            <Link className={`${styles.tierCta} ${styles.ctaGhost}`} to="/prehend/how-it-works">
              See how it works
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

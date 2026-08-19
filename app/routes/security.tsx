import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT } from '~/lib/product';
import styles from './security.module.css';

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
    title: `${PRODUCT_NAME} security — your code is reviewed, not retained`,
    description:
      `How ${PRODUCT_NAME} handles your code: bring your own key and we never see the model traffic, ` +
      `or run managed under a cap you set. Nothing is used to train models. Encryption, SSO, audit logs, self-host.`,
  });
}

const BADGES = [
  { label: 'Encryption in transit & at rest', pending: false },
  { label: 'SSO / SAML', pending: false },
  { label: 'Audit logs', pending: false },
  { label: 'Self-host available', pending: false },
  { label: 'GDPR-aligned', pending: false },
  { label: 'SOC 2', pending: true, note: 'in progress' },
];

const STORED = [
  'Your account, team, and settings',
  'Review threads and comprehension coverage (so history persists) — deletable on request',
  'Operational metadata: timestamps, chunk counts, audit-log entries',
];

const EPHEMERAL = [
  'Source code sent for a review — processed, then dropped, never used to train',
  'On BYOK, the model traffic itself — it never touches our servers',
  'Your model provider key — held encrypted, usable only by your team',
];

const DETAILS = [
  {
    h: 'Access controls',
    body: (
      <>
        Least-privilege access, SSO/SAML with enforced roles, and an audit log of who did what. Your
        code is scoped to your team — no cross-tenant access, ever.
      </>
    ),
  },
  {
    h: 'Sub-processors',
    body: (
      <>
        On managed plans we route model calls through a named model provider under a data-processing
        agreement. The current list is published and versioned — on BYOK there is no model
        sub-processor, because the traffic is yours.
      </>
    ),
  },
  {
    h: 'Encryption',
    body: <>TLS in transit and encryption at rest for everything we store, keys included.</>,
  },
  {
    h: 'Responsible disclosure',
    body: (
      <>
        Found something? Our security reviewers want to hear from you. Report it to{' '}
        <code>security@coherentconstructs.com</code> and we’ll work the fix with you before any
        public detail.
      </>
    ),
  },
];

export default function Security() {
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
            <span>Security</span>
          </p>
          <h1>Your code is reviewed, not retained.</h1>
          <p className={styles.lede}>
            {PRODUCT_NAME} reads a chunk, talks it through, and lets go. Nothing you send is used to
            train a model — and on your own key, your code never routes through us at all.
          </p>
          <ul className={styles.badges}>
            {BADGES.map((b) => (
              <li
                key={b.label}
                className={`${styles.badge} ${b.pending ? styles.badgePending : ''}`}
              >
                <span className={styles.badgeDot} aria-hidden="true" />
                {b.label}
                {b.note && <span className={styles.badgeNote}>· {b.note}</span>}
              </li>
            ))}
          </ul>
        </header>

        <hr className={styles.rule} />

        {/* ---- Data flow ---- */}
        <section className={styles.section}>
          <p className={styles.kicker}>Where your code goes</p>
          <h2>Two data paths. You pick who’s on it.</h2>
          <p className={styles.p}>
            The review is identical either way — what differs is whether your code passes through us
            on its way to the model.
          </p>
          <div className={styles.flows}>
            <div className={styles.flow}>
              <div className={styles.flowName}>
                BYOK <span className={styles.flowTag}>your key</span>
              </div>
              <ul className={styles.hops}>
                <li className={styles.hop}>Your code</li>
                <li className={styles.hopArrow} aria-hidden="true">
                  →
                </li>
                <li className={styles.hop}>Your model provider</li>
              </ul>
              <p>
                {PRODUCT_NAME} calls your provider with your key from your machine or your runner. We
                never see the model traffic, and there’s no markup — you pay the provider directly.
              </p>
            </div>
            <div className={styles.flow}>
              <div className={styles.flowName}>
                Managed <span className={styles.flowTag}>we run it</span>
              </div>
              <ul className={styles.hops}>
                <li className={styles.hop}>Your code</li>
                <li className={styles.hopArrow} aria-hidden="true">
                  →
                </li>
                <li className={`${styles.hop} ${styles.hopUs}`}>{PRODUCT_PARENT}</li>
                <li className={styles.hopArrow} aria-hidden="true">
                  →
                </li>
                <li className={styles.hop}>Model provider</li>
              </ul>
              <p>
                We call the model for you under the usage cap you set, over an encrypted channel, and
                drop the code after the review. Convenient, one bill — and still never used for
                training.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Stored vs ephemeral ---- */}
        <section className={styles.section}>
          <p className={styles.kicker}>What we keep, what we don’t</p>
          <h2>Most of your code is gone the moment the review ends.</h2>
          <div className={styles.storeGrid}>
            <div className={styles.storeCol}>
              <p className={styles.storeHead}>Stored (so the product works)</p>
              <ul className={styles.storeList}>
                {STORED.map((s) => (
                  <li key={s}>
                    <span className={styles.markKeep} aria-hidden="true">
                      ●
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.storeCol}>
              <p className={styles.storeHead}>Ephemeral (dropped after review)</p>
              <ul className={styles.storeList}>
                {EPHEMERAL.map((s) => (
                  <li key={s}>
                    <span className={styles.markGone} aria-hidden="true">
                      ○
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---- Retention callout ---- */}
        <section className={styles.callout}>
          <h2>Never used to train a model.</h2>
          <p>
            Not yours, not anyone’s. The code you send for review is used to review it and nothing
            else — we don’t train on it, and we don’t sell or share it. Delete your review history any
            time, and self-host if you’d rather it never leave your network.
          </p>
        </section>

        {/* ---- Controls / sub-processors / disclosure ---- */}
        <section className={styles.section}>
          <p className={styles.kicker}>The details</p>
          <h2>Controls a security reviewer will actually ask about.</h2>
          <div className={styles.detailGrid}>
            {DETAILS.map((d) => (
              <article key={d.h} className={styles.detail}>
                <h3>{d.h}</h3>
                <p>{d.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---- Final CTA ---- */}
        <section className={styles.finalCta}>
          <h2>Review the code. Keep the code.</h2>
          <p>
            Start on your own key and see the data path for yourself — nothing leaves for our servers.
          </p>
          <div className={styles.finalCtaBtns}>
            <Link className={styles.btnPrimary} to="/prehend/developers">
              Start with your key
            </Link>
            <Link className={styles.btnGhost} to="/prehend/pricing">
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT, PRODUCT_CLI } from '~/lib/product';
import styles from './developers.module.css';

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
    title: `${PRODUCT_NAME} for developers — it teaches, it doesn't nag`,
    description:
      `One chunk at a time, no comment-spam. ${PRODUCT_NAME} runs in your terminal and on your ` +
      `pull requests, on your own model key if you want, and leaves you actually understanding the change.`,
  });
}

const QUICKSTART = `# install
npm i -g ${PRODUCT_CLI}          # or: brew install ${PRODUCT_CLI}

# authenticate on the managed plan…
${PRODUCT_CLI} login

# …or bring your own key — your provider, your bill
export ${PRODUCT_CLI.toUpperCase()}_MODEL_KEY=sk-...

# review what you're about to commit, one chunk at a time
${PRODUCT_CLI} review --staged

# open the conversation on a single chunk
${PRODUCT_CLI} explain payments/charge.ts:40-72

# how much of this codebase does a human actually understand?
${PRODUCT_CLI} cover`;

const REASONS = [
  {
    h: 'No comment wall',
    p: 'It reviews one chunk at a time and talks it through, instead of carpet-bombing your PR with forty inline nits. Less noise means you actually read the review.',
  },
  {
    h: 'It teaches, it doesn’t scold',
    p: 'The output isn’t a verdict, it’s a question. You leave each chunk understanding the change — which is worth more than a green check you didn’t read.',
  },
  {
    h: 'Your keys, your data',
    p: 'Bring your own model key and your code never touches our servers on its way to the model. Nothing is retained to train anything.',
  },
  {
    h: 'Meets you where you work',
    p: 'Runs in your terminal and on your pull requests. Language-agnostic — if a model can read it, it can review it.',
  },
];

export default function Developers() {
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
            <span>Developers</span>
          </p>
          <h1>
            It respects your time. It just won't let you ship what you{' '}
            <span className={styles.em}>don't understand</span>.
          </h1>
          <p className={styles.lede}>
            One chunk at a time, no comment-spam, no nagging. {PRODUCT_NAME} teaches instead of
            scolds — and it runs on your own key if you want it to.
          </p>
          <div className={styles.cta}>
            <Link className={styles.btnPrimary} to="/prehend/pricing">
              Install free
            </Link>
            <Link className={styles.btnGhost} to="/prehend/docs">
              Read the docs
            </Link>
          </div>
        </header>

        <hr className={styles.rule} />

        {/* ---- Why devs ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>Why developers keep it on</p>
          <h2>The AI reviewer that isn't exhausting.</h2>
        </section>
        <section className={styles.reasons}>
          {REASONS.map((r) => (
            <article key={r.h} className={styles.reason}>
              <h3>{r.h}</h3>
              <p>{r.p}</p>
            </article>
          ))}
        </section>

        {/* ---- Quickstart ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>Quickstart</p>
          <h2>In your terminal in a minute.</h2>
        </section>
        <div className={styles.codewrap}>
          <div className={styles.codebar}>
            <span className={styles.dotr} />
            <span className={styles.doty} />
            <span className={styles.dotg} />
            <span className={styles.codetitle}>terminal</span>
          </div>
          <pre className={styles.code}>
            <code>{QUICKSTART}</code>
          </pre>
        </div>
        <p className={styles.codecap}>
          Illustrative — the API and CLI are in preview.{' '}
          <Link to="/prehend/docs">See the full reference →</Link>
        </p>

        {/* ---- Keys / data ---- */}
        <section className={styles.split}>
          <div>
            <p className={styles.kicker}>Bring your own key</p>
            <h2>Two ways to run the model. You choose who holds the key.</h2>
            <p className={styles.p}>
              On <strong>BYOK</strong>, {PRODUCT_NAME} calls your model provider with your key — we
              never see the traffic, and you pay the provider directly with no markup. On the{' '}
              <strong>managed</strong> plan we run the calls for you under a usage cap you set. Either
              way, your code isn't retained to train models.
            </p>
            <Link className={styles.textlink} to="/prehend/security">
              Read the full data-flow →
            </Link>
          </div>
          <ul className={styles.keylist}>
            <li>
              <strong>BYOK</strong>
              <span>Your key, your provider, your bill. Code never hits our servers.</span>
            </li>
            <li>
              <strong>Managed</strong>
              <span>We call the API for you, one bill, capped so spend stays predictable.</span>
            </li>
            <li>
              <strong>Self-host</strong>
              <span>Run it inside your own network on the enterprise plan.</span>
            </li>
          </ul>
        </section>

        {/* ---- Onboarding ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>The part that helps your career</p>
          <h2>The fastest way into a codebase you didn't write.</h2>
          <p className={styles.p}>
            Dropped into a service you've never seen? Review a few chunks with {PRODUCT_NAME} and it
            walks you through what the code does and why — the top-down mental model that reading the
            files alone never quite builds. Comprehension coverage shows you exactly which corners you
            still haven't grasped, so "I know this system now" is something you can actually check.
          </p>
        </section>

        {/* ---- CTA ---- */}
        <section className={styles.finalCta}>
          <h2>Install it. Review the next chunk. Actually understand it.</h2>
          <div className={styles.cta}>
            <Link className={styles.btnPrimary} to="/prehend/pricing">
              Install free
            </Link>
            <Link className={styles.btnGhost} to="/prehend/how-it-works">
              See how it works
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

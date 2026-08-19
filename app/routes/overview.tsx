import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT } from '~/lib/product';
import styles from './overview.module.css';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  // Scoped to the product brand: a brand that does not offer this tab 404s here,
  // not merely omits the nav link — matching ai-workflow.tsx / about.tsx.
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
    title: `${PRODUCT_NAME} — code review that builds real understanding`,
    description:
      `${PRODUCT_NAME} reviews every change one chunk at a time and walks you through it until you can ` +
      `explain it back — bugs caught, comprehension proven. Bring your own model key or let us run it.`,
  });
}

export default function Overview() {
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4.5rem' }}>
      <div className={styles.page}>
        {/* ---- Hero ---- */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            <span className={styles.brand}>{PRODUCT_PARENT}</span>
            <span className={styles.sep}>/</span>
            <span>{PRODUCT_NAME}</span>
          </p>
          <h1>
            Code review that makes sure you <span className={styles.em}>understand</span> your code.
          </h1>
          <p className={styles.lede}>
            {PRODUCT_NAME} reviews every change one chunk at a time, then walks you through it until you
            can explain it back. Bugs caught, comprehension proven — not vibe-coded, but reviewed{' '}
            <em>and understood</em>.
          </p>
          <div className={styles.cta}>
            <Link className={styles.btnPrimary} to="/prehend/pricing">
              Start reviewing free
            </Link>
            <Link className={styles.btnGhost} to="/prehend/how-it-works">
              See how it works
            </Link>
          </div>
          <p className={styles.reassure}>
            Bring your own model key, or let us run it. Your code, your keys.
          </p>
        </header>

        <hr className={styles.rule} />

        {/* ---- Problem ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>The real risk</p>
          <h2>AI writes more code than any human can read.</h2>
          <p className={styles.p}>
            Approving code you don't understand isn't a shortcut — it's the risk. The next person to
            touch it is you, six weeks from now, with no idea why it works. {PRODUCT_NAME} exists to
            close that gap: it doesn't just find bugs, it makes sure a person actually understands
            what shipped.
          </p>
        </section>

        {/* ---- Pillars ---- */}
        <section className={styles.pillars} aria-label={`What ${PRODUCT_NAME} does`}>
          <article className={styles.pillar}>
            <p className={styles.pn}>Catch</p>
            <h3>Findings, per chunk</h3>
            <p>
              Bugs, security holes and regressions surfaced on the exact lines they live — one
              reviewable chunk at a time, not a wall of forty comments.
            </p>
          </article>
          <article className={`${styles.pillar} ${styles.pillarLead}`}>
            <p className={styles.pn}>Understand</p>
            <h3>Comprehension, proven</h3>
            <p>
              A conversational review that explains each chunk, asks what you think it does, and won't
              mark it understood until you're right. Coverage tracked per line.
            </p>
          </article>
          <article className={styles.pillar}>
            <p className={styles.pn}>Uphold</p>
            <h3>Direction, protected</h3>
            <p>
              Security and maintainability audits, architecture-pitfall warnings, and alerts when two
              developers' changes are about to collide.
            </p>
          </article>
        </section>

        {/* ---- Comprehension coverage showcase ---- */}
        <section className={styles.coverage}>
          <div className={styles.coverageHead}>
            <p className={styles.kicker}>Comprehension coverage</p>
            <h2>A receipt for understanding, not a vibe.</h2>
            <p className={styles.p}>
              Every line lands in one of three states. {PRODUCT_NAME} tracks them as you review, so
              "we understand our codebase" stops being a claim and becomes a number you can show.
            </p>
          </div>
          <div
            className={styles.meter}
            role="img"
            aria-label="Coverage example: all code is AI-generated, 82% human-reviewed, 61% understood"
          >
            <div className={styles.track}>
              <span className={`${styles.seg} ${styles.segAi}`} style={{ width: '100%' }}>
                AI-generated · 100%
              </span>
            </div>
            <div className={styles.track}>
              <span className={`${styles.seg} ${styles.segRev}`} style={{ width: '82%' }}>
                Human-reviewed · 82%
              </span>
            </div>
            <div className={styles.track}>
              <span className={`${styles.seg} ${styles.segUnd}`} style={{ width: '61%' }}>
                Understood · 61%
              </span>
            </div>
          </div>
          <p className={styles.metercap}>
            Illustrative. Real coverage is computed per line as review happens, and exports as a
            report you can hand to a client or an auditor.
          </p>
        </section>

        {/* ---- Outcomes ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>Why teams adopt it</p>
          <h2>Ship faster without shipping code nobody understands.</h2>
        </section>
        <section className={styles.outcomes}>
          <div className={styles.outcome}>
            <h3>Onboard in days, not weeks</h3>
            <p>New developers learn the codebase by being walked through it — not by guessing.</p>
          </div>
          <div className={styles.outcome}>
            <h3>Kill the bus factor</h3>
            <p>
              Coverage shows what only one person understands — before that person leaves for a long
              weekend, or for good.
            </p>
          </div>
          <div className={styles.outcome}>
            <h3>Fewer 2 a.m. regressions</h3>
            <p>
              Understanding a change is the cheapest way to stop it quietly breaking something three
              files away.
            </p>
          </div>
        </section>

        {/* ---- Pricing teaser ---- */}
        <section className={styles.priceTeaser}>
          <div className={styles.priceCopy}>
            <p className={styles.kicker}>Pricing</p>
            <h2>Two ways to pay. Both make you understand your code.</h2>
            <p className={styles.p}>
              Bring your own model key and pay the provider directly with no usage markup, or let us
              run the model for you under a predictable usage cap. Start free either way.
            </p>
            <Link className={styles.btnPrimary} to="/prehend/pricing">
              See pricing
            </Link>
          </div>
          <ul className={styles.tierList}>
            <li>
              <strong>BYOK + subscription</strong>
              <span>Your key, your provider, no usage markup.</span>
            </li>
            <li>
              <strong>Managed</strong>
              <span>We call the API, one bill, usage capped.</span>
            </li>
          </ul>
        </section>

        {/* ---- FAQ ---- */}
        <section className={styles.faq}>
          <h2>Questions developers actually ask</h2>
          <details>
            <summary>Where does my code go?</summary>
            <p>
              On BYOK, your code goes to your own model provider under your own key — we never see the
              model traffic. On the managed plan we call the API for you, under the cap you set. Either
              way, your code is never retained to train models. <Link to="/prehend/security">Full data flow →</Link>
            </p>
          </details>
          <details>
            <summary>Is this just another AI linter?</summary>
            <p>
              No. Linters and most AI reviewers optimise for finding more bugs with less noise.{' '}
              {PRODUCT_NAME} optimises for you <em>understanding</em> the change — the part every other
              tool skips.
            </p>
          </details>
          <details>
            <summary>Will it spam my pull requests?</summary>
            <p>
              It reviews one chunk at a time and talks it through, instead of dumping dozens of inline
              comments. Less noise is the entire point.
            </p>
          </details>
        </section>

        {/* ---- Final CTA ---- */}
        <section className={styles.finalCta}>
          <h2>Review the next chunk — and actually understand it.</h2>
          <div className={styles.cta}>
            <Link className={styles.btnPrimary} to="/prehend/pricing">
              Start reviewing free
            </Link>
            <Link className={styles.btnGhost} to="/prehend/developers">
              For developers
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT } from '~/lib/product';
import styles from './how-it-works.module.css';

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
    title: `How ${PRODUCT_NAME} works — a review that talks back`,
    description:
      `${PRODUCT_NAME} reviews one chunk at a time: it explains the change, asks what you think it ` +
      `does, resolves the disagreement, and only then marks it understood — tracking comprehension per line.`,
  });
}

const LOOP = [
  {
    n: '01',
    h: 'Split the change into chunks',
    p: 'A pull request becomes a sequence of small, self-contained chunks — a function, a branch, a migration — sized to be understood in one sitting instead of skimmed in bulk.',
  },
  {
    n: '02',
    h: 'Explain intent and risk',
    p: 'For each chunk, {P} states what the code is trying to do and where it could bite: the edge case, the security hole, the assumption that only holds today.',
  },
  {
    n: '03',
    h: 'Ask what you think it does',
    p: 'Then it turns the question back on you. You say what you believe the chunk does; {P} checks your answer against the code — the Socratic step every other reviewer skips.',
  },
  {
    n: '04',
    h: 'Resolve it in conversation',
    p: "If your understanding and the code disagree, you talk it through until they don't. No 40-comment dump — a short exchange that leaves you actually knowing the change.",
  },
  {
    n: '05',
    h: 'Mark it understood, update coverage',
    p: 'The chunk is recorded as reviewed and understood, with your reasoning attached, and comprehension coverage ticks up — per line, exportable as a receipt.',
  },
];

const UPKEEP = [
  {
    h: 'Security audit',
    p: 'Every chunk is checked for injection, auth gaps, secret leakage and unsafe dependencies as it is reviewed — not in a separate scan you forget to run.',
  },
  {
    h: 'Maintainability check',
    p: 'Flags the choices that are cheap now and expensive later: duplicated logic, load-bearing hacks, and the functions the next person will fear to touch.',
  },
  {
    h: 'Architecture direction',
    p: 'Watches for changes that quietly cut against the codebase’s own patterns, so drift gets named while it’s one chunk instead of a rewrite.',
  },
  {
    h: 'Conflict warnings',
    p: 'When two developers’ in-flight changes are heading for the same ground, {P} warns both before the merge, not after the incident.',
  },
];

/** Interpolate the product name into copy that carries {P}. */
function fill(text: string): string {
  return text.replaceAll('{P}', PRODUCT_NAME);
}

export default function HowItWorks() {
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
            <span>How it works</span>
          </p>
          <h1>
            A review that <span className={styles.em}>talks back</span> — one chunk at a time.
          </h1>
          <p className={styles.lede}>
            {PRODUCT_NAME} doesn't dump forty comments on your pull request. It takes one chunk,
            explains what it does, asks what <em>you</em> think it does, and won't mark it understood
            until you're right.
          </p>
        </header>

        <hr className={styles.rule} />

        {/* ---- The chunk loop ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>The chunk loop</p>
          <h2>Five steps, repeated until the change is understood.</h2>
        </section>
        <ol className={styles.loop}>
          {LOOP.map((step) => (
            <li key={step.n} className={styles.step}>
              <span className={styles.stepn}>{step.n}</span>
              <div>
                <h3>{step.h}</h3>
                <p>{fill(step.p)}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* ---- Conversation transcript ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>What a chunk looks like</p>
          <h2>The conversation, not the comment wall.</h2>
        </section>
        <div className={styles.transcript} aria-label="Example review conversation">
          <p className={styles.tfile}>
            <span className={styles.mono}>payments/charge.ts</span> · chunk 3 of 7
          </p>
          <div className={`${styles.msg} ${styles.msgBot}`}>
            <span className={styles.who}>{PRODUCT_NAME}</span>
            <p>
              This chunk wraps <code>chargeCard()</code> in a retry. What happens if the first attempt
              half-succeeds — the charge lands but the response times out?
            </p>
          </div>
          <div className={`${styles.msg} ${styles.msgYou}`}>
            <span className={styles.who}>You</span>
            <p>It'd retry and double-charge.</p>
          </div>
          <div className={`${styles.msg} ${styles.msgBot}`}>
            <span className={styles.who}>{PRODUCT_NAME}</span>
            <p>
              Right. So the retry needs an idempotency key. Should I flag that as a required change, or
              are you handling it upstream?
            </p>
          </div>
          <div className={`${styles.msg} ${styles.msgYou}`}>
            <span className={styles.who}>You</span>
            <p>
              Upstream — the key is set on the <code>PaymentIntent</code> before this runs.
            </p>
          </div>
          <div className={`${styles.msg} ${styles.msgBot}`}>
            <span className={styles.who}>{PRODUCT_NAME}</span>
            <p className={styles.resolve}>
              Understood — marking this chunk reviewed, with a note that idempotency is handled on{' '}
              <code>PaymentIntent</code>. Coverage for this file is now 100%.
            </p>
          </div>
        </div>
        <p className={styles.tcap}>
          Illustrative. The point isn't that {PRODUCT_NAME} caught the bug — it's that you can now
          explain why the code is safe.
        </p>

        {/* ---- Coverage ---- */}
        <section className={styles.coverage}>
          <div className={styles.col}>
            <p className={styles.kicker}>Comprehension coverage</p>
            <h2>"Understood" is a state, and it's tracked.</h2>
            <p className={styles.p}>
              Every line moves through three states as you review. {PRODUCT_NAME} keeps the tally per
              line, so the codebase carries a live, exportable record of how much of it a human
              actually understands — a receipt you can hand to a client, a new hire, or an auditor.
            </p>
          </div>
          <div className={styles.states}>
            <div className={styles.state}>
              <span className={`${styles.dot} ${styles.dotAi}`} />
              <div>
                <p className={styles.sh}>AI-generated</p>
                <p className={styles.sp}>Written by the model. The starting point, not the finish line.</p>
              </div>
            </div>
            <div className={styles.state}>
              <span className={`${styles.dot} ${styles.dotRev}`} />
              <div>
                <p className={styles.sh}>Human-reviewed</p>
                <p className={styles.sp}>A person read it and signed off on the change.</p>
              </div>
            </div>
            <div className={styles.state}>
              <span className={`${styles.dot} ${styles.dotUnd}`} />
              <div>
                <p className={styles.sh}>Understood</p>
                <p className={styles.sp}>
                  That person could explain what it does and why — proven in conversation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Upkeep ---- */}
        <section className={styles.col}>
          <p className={styles.kicker}>Beyond the diff</p>
          <h2>It watches the codebase, not just the change.</h2>
          <p className={styles.p}>
            Understanding a chunk is the core loop. Alongside it, {PRODUCT_NAME} keeps an eye on the
            things that only show up when you zoom out.
          </p>
        </section>
        <section className={styles.upkeep} aria-label="Upkeep checks">
          {UPKEEP.map((card) => (
            <article key={card.h} className={styles.ucard}>
              <h3>{card.h}</h3>
              <p>{fill(card.p)}</p>
            </article>
          ))}
        </section>

        {/* ---- Reviewed vs vibe-coded callout ---- */}
        <section className={styles.callout}>
          <p>
            The opposite of {PRODUCT_NAME} is vibe-coding: shipping AI output no human has read. It's
            the exact problem {PRODUCT_PARENT} refuses to hand a client.
          </p>
          <Link className={styles.calloutLink} to="/ai-workflow">
            How {PRODUCT_PARENT} builds with AI →
          </Link>
        </section>

        {/* ---- CTA ---- */}
        <section className={styles.finalCta}>
          <h2>Try it on your next chunk.</h2>
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

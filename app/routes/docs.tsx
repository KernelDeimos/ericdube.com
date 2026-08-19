import { Link } from 'react-router';
import Container from '~/components/Container';
import { resolveWebsite, requireTab, type SiteMetaMatch } from '~/lib/website';
import { seoMeta } from '~/lib/seo';
import { PRODUCT_NAME, PRODUCT_PARENT, PRODUCT_CLI } from '~/lib/product';
import styles from './docs.module.css';

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
    title: `${PRODUCT_NAME} API & CLI reference`,
    description:
      `Drive ${PRODUCT_NAME} from your terminal or your pipeline: review chunks, take the ` +
      `conversation, and pull comprehension coverage over a small REST API and CLI. Preview — not yet GA.`,
  });
}

const ENDPOINTS = [
  { m: 'POST', p: '/v1/reviews', d: 'Start a review of a change — pass a repo with base/head, or a raw diff.' },
  { m: 'GET', p: '/v1/reviews/{id}', d: 'Fetch a review: status and per-chunk findings.' },
  {
    m: 'POST',
    p: '/v1/reviews/{id}/turns',
    d: 'Take a conversational turn on a chunk — the Socratic back-and-forth that proves comprehension.',
  },
  {
    m: 'GET',
    p: '/v1/reviews/{id}/coverage',
    d: 'The comprehension-coverage report: reviewed and understood, per line and per file.',
  },
  { m: 'POST', p: '/v1/audits', d: 'Run an upkeep scan: security, maintainability, or architecture.' },
];

const WEBHOOKS = [
  { e: 'review.completed', d: 'A review finished; coverage is final.' },
  { e: 'coverage.updated', d: 'A chunk was marked understood; coverage moved.' },
  { e: 'conflict.detected', d: 'Two in-flight branches are heading for the same ground.' },
];

const CLI = `${PRODUCT_CLI} login
${PRODUCT_CLI} review --staged                 # or: --diff main..HEAD  |  --pr 128
${PRODUCT_CLI} explain payments/charge.ts:40-72  # open the conversation on one chunk
${PRODUCT_CLI} cover                           # print comprehension coverage
${PRODUCT_CLI} audit --security                # --maintainability | --architecture
${PRODUCT_CLI} watch                           # architecture & cross-developer conflict warnings`;

const AUTH = `# Every request carries a bearer token.
Authorization: Bearer <token>

# BYOK: route model calls through your own provider and key.
# (Managed plans omit these — we hold the key, under your usage cap.)
X-Model-Provider: anthropic          # anthropic | openai | ...
X-Model-Key: <your-provider-key>`;

const REST_EXAMPLE = `POST /v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{ "repo": "acme/payments", "base": "main", "head": "feat/retry" }

# → 201 Created
{ "id": "rev_9f2c", "status": "reviewing", "chunks": 7 }`;

const COVERAGE_EXAMPLE = `GET /v1/reviews/rev_9f2c/coverage

# → 200 OK
{
  "lines": 812,
  "reviewed": 0.82,
  "understood": 0.61,
  "byFile": [
    { "path": "payments/charge.ts", "understood": 1.0 }
  ]
}`;

const WEBHOOK_EXAMPLE = `POST https://your-app.example.com/hooks/${PRODUCT_CLI}
Content-Type: application/json

{
  "event": "conflict.detected",
  "review": "rev_9f2c",
  "branches": ["feat/retry", "feat/refund"],
  "path": "payments/charge.ts"
}`;

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className={styles.codewrap}>
      <div className={styles.codebar}>
        <span className={styles.dotr} />
        <span className={styles.doty} />
        <span className={styles.dotg} />
        <span className={styles.codetitle}>{title}</span>
      </div>
      <pre className={styles.code}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function Docs() {
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4.5rem' }}>
      <div className={styles.page}>
        {/* ---- Preview banner ---- */}
        <div className={styles.preview} role="note">
          <span className={styles.previewTag}>Preview</span>
          <span>
            The API and CLI are not yet generally available. Shapes below are illustrative and will
            change before launch.
          </span>
        </div>

        {/* ---- Hero ---- */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            <span className={styles.brand}>{PRODUCT_PARENT}</span>
            <span className={styles.sep}>/</span>
            <span>{PRODUCT_NAME}</span>
            <span className={styles.sep}>/</span>
            <span>Docs</span>
          </p>
          <h1>Drive {PRODUCT_NAME} from your terminal or your pipeline.</h1>
          <p className={styles.lede}>
            Review chunks, take the conversation, and pull comprehension coverage over a small REST
            API and a CLI. Same product, scriptable.
          </p>
        </header>

        <hr className={styles.rule} />

        {/* ---- Authentication ---- */}
        <section className={styles.section}>
          <h2 id="auth">Authentication</h2>
          <p className={styles.p}>
            All requests use a bearer token. On <strong>BYOK</strong>, add your model provider and key
            as headers and {PRODUCT_NAME} routes the model calls through them — we never see the
            traffic. Managed plans omit those headers; we hold the key under the usage cap you set.{' '}
            <Link to="/prehend/security">Where your code goes →</Link>
          </p>
          <CodeBlock title="headers">{AUTH}</CodeBlock>
        </section>

        {/* ---- REST reference ---- */}
        <section className={styles.section}>
          <h2 id="rest">REST reference</h2>
          <ul className={styles.endpoints}>
            {ENDPOINTS.map((e) => (
              <li key={e.m + e.p} className={styles.endpoint}>
                <span
                  className={`${styles.method} ${e.m === 'POST' ? styles.post : styles.get}`}
                >
                  {e.m}
                </span>
                <code className={styles.path}>{e.p}</code>
                <span className={styles.edesc}>{e.d}</span>
              </li>
            ))}
          </ul>
          <CodeBlock title="start a review">{REST_EXAMPLE}</CodeBlock>
          <CodeBlock title="comprehension coverage">{COVERAGE_EXAMPLE}</CodeBlock>
        </section>

        {/* ---- CLI ---- */}
        <section className={styles.section}>
          <h2 id="cli">CLI</h2>
          <p className={styles.p}>
            The CLI is the fastest way to review what you're about to commit. It reads your staged
            changes, a diff range, or a pull request, and opens the conversation right in your
            terminal.
          </p>
          <CodeBlock title="terminal">{CLI}</CodeBlock>
        </section>

        {/* ---- Webhooks ---- */}
        <section className={styles.section}>
          <h2 id="webhooks">Webhooks</h2>
          <p className={styles.p}>
            Subscribe an endpoint to get pushed the moments that matter — a review finishing,
            comprehension moving, or a conflict between two developers' branches surfacing early.
          </p>
          <ul className={styles.events}>
            {WEBHOOKS.map((w) => (
              <li key={w.e} className={styles.event}>
                <code>{w.e}</code>
                <span>{w.d}</span>
              </li>
            ))}
          </ul>
          <CodeBlock title="example delivery">{WEBHOOK_EXAMPLE}</CodeBlock>
        </section>

        {/* ---- Footer ---- */}
        <section className={styles.foot}>
          <p>
            Want early access to the API? It ships after the review experience is solid.{' '}
            <Link to="/prehend/developers">Start with the CLI →</Link>
          </p>
        </section>
      </div>
    </Container>
  );
}

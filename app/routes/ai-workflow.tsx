import Container from '~/components/Container';
import { resolveWebsite, requireTab, siteTitleFrom, type SiteMetaMatch } from '~/lib/website';
import styles from './ai-workflow.module.css';

export async function loader({ request }: { request: Request }) {
  const website = await resolveWebsite(request);
  // Coherent-Constructs-only page: a brand that does not offer the tab must 404
  // here, not merely omit the nav link. The central layout gate does the same,
  // so this is belt-and-suspenders matching about.tsx.
  requireTab(website, 'ai-workflow');
  return null;
}

export function meta({ matches }: { matches: readonly SiteMetaMatch[] }) {
  return [
    { title: `How we build with AI — ${siteTitleFrom(matches)}` },
    {
      name: 'description',
      content:
        'How Coherent Constructs builds with AI: AI-Centric development with mandatory human review, ' +
        'tracked coverage, and receipts. Your product is never vibe-coded.',
    },
  ];
}

/**
 * The pipeline diagram, kept as literal SVG markup and injected rather than
 * transcribed into JSX: it is static and authored here (no user input), and
 * keeping the markup verbatim means the drawing stays byte-identical to the
 * reviewed source instead of drifting through a hand camelCase conversion. Its
 * class names are themed by :global rules scoped under .figframe in the CSS
 * module; the custom properties they read inherit from .page.
 */
const DIAGRAM_SVG = `
<svg viewBox="0 0 1040 450" role="img"
     aria-label="Two development paths. Vibe coding is a bare line: prompt, AI writes every feature, review skipped, ship. AI-Centric development is a deep parallel pipeline: the 'Prompt the AI' stage runs technology research, attack-surface analysis and software architecture concurrently; the 'AI generates code' stage runs automated, smoke, manual and integration testing plus continuous integration concurrently; a mandatory human-review stage does per-line comprehension tracking of AI code and conventional code review of all code; then ship with receipts.">
  <defs>
    <marker id="ah" markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto">
      <path class="m-n" d="M0,0 L8,4 L0,8 Z" />
    </marker>
    <marker id="ahd" markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto">
      <path class="m-d" d="M0,0 L8,4 L0,8 Z" />
    </marker>
    <marker id="aha" markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto">
      <path class="m-a" d="M0,0 L8,4 L0,8 Z" />
    </marker>
  </defs>

  <!-- ===== Top lane: vibe coding ===== -->
  <text class="mono st-hd" x="20" y="30" font-size="12" letter-spacing="1.4">THE VIBE-CODING SHORTCUT</text>

  <rect class="d-box" x="20" y="44" width="150" height="50" rx="9"/>
  <text class="t-ink" x="95" y="66" text-anchor="middle" font-size="13.5">Prompt</text>
  <text class="t-ink" x="95" y="83" text-anchor="middle" font-size="13.5">the AI</text>

  <rect class="d-box" x="214" y="44" width="190" height="50" rx="9"/>
  <text class="t-ink" x="309" y="66" text-anchor="middle" font-size="13.5">AI writes every</text>
  <text class="t-ink" x="309" y="83" text-anchor="middle" font-size="13.5">feature</text>

  <rect class="d-skip" x="470" y="44" width="190" height="50" rx="9"/>
  <text class="t-d" x="565" y="65" text-anchor="middle" font-size="13">Human review</text>
  <text class="t-d mono" x="565" y="83" text-anchor="middle" font-size="11.5" letter-spacing="0.5">&#8212; SKIPPED &#8212;</text>

  <rect class="d-box" x="858" y="44" width="160" height="50" rx="9"/>
  <text class="t-ink" x="938" y="66" text-anchor="middle" font-size="13.5">Ship to</text>
  <text class="t-ink" x="938" y="83" text-anchor="middle" font-size="13.5">client</text>

  <line class="ln" x1="172" y1="69" x2="210" y2="69" marker-end="url(#ah)"/>
  <line class="ln" x1="406" y1="69" x2="466" y2="69" marker-end="url(#ah)"/>
  <line class="ln-d" x1="662" y1="69" x2="854" y2="69" stroke-dasharray="2 5" marker-end="url(#ahd)"/>
  <text class="mono st-hd" x="758" y="58" text-anchor="middle" font-size="11">handed off unreviewed</text>

  <!-- divider -->
  <line class="hair" x1="20" y1="150" x2="1018" y2="150"/>

  <!-- ===== Bottom lane: AI-centric ===== -->
  <text class="mono st-h" x="20" y="178" font-size="12" letter-spacing="1.4">AI-CENTRIC DEVELOPMENT</text>

  <!-- Box 1: concurrent activities — "Prompt the AI" is a peer item, not a heading -->
  <rect class="stage" x="20" y="196" width="228" height="168" rx="11"/>
  <rect class="chip" x="32" y="220" width="204" height="28" rx="7"/>
  <text class="t-ink" x="134" y="238" text-anchor="middle" font-size="12.5">Prompt the AI</text>
  <rect class="chip" x="32" y="255" width="204" height="28" rx="7"/>
  <text class="t-ink" x="134" y="273" text-anchor="middle" font-size="12.5">Technology research</text>
  <rect class="chip" x="32" y="290" width="204" height="28" rx="7"/>
  <text class="t-ink" x="134" y="308" text-anchor="middle" font-size="12.5">Attack-surface analysis</text>
  <rect class="chip" x="32" y="325" width="204" height="28" rx="7"/>
  <text class="t-ink" x="134" y="343" text-anchor="middle" font-size="12.5">Software architecture</text>

  <!-- Box 2: concurrent activities — "AI generates code" is a peer item -->
  <rect class="stage" x="288" y="196" width="236" height="237" rx="11"/>
  <rect class="chip" x="300" y="220" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="238" text-anchor="middle" font-size="12.5">AI generates code</text>
  <rect class="chip" x="300" y="255" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="273" text-anchor="middle" font-size="12.5">Automated testing</text>
  <rect class="chip" x="300" y="290" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="308" text-anchor="middle" font-size="12.5">Smoke testing</text>
  <rect class="chip" x="300" y="325" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="343" text-anchor="middle" font-size="12.5">Manual testing</text>
  <rect class="chip" x="300" y="360" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="378" text-anchor="middle" font-size="12.5">Integration testing</text>
  <rect class="chip" x="300" y="395" width="212" height="28" rx="7"/>
  <text class="t-ink" x="406" y="413" text-anchor="middle" font-size="12.5">Continuous integration</text>

  <!-- Box 3: Mandatory human review — a named category with two activities -->
  <rect class="stage-hi" x="560" y="196" width="250" height="142" rx="11"/>
  <text class="mono st-h" x="572" y="216" font-size="11.5" letter-spacing="0.5" font-weight="700">MANDATORY HUMAN REVIEW</text>
  <rect class="chip-a" x="572" y="226" width="226" height="44" rx="7"/>
  <text class="t-a" x="685" y="245" text-anchor="middle" font-size="12.5">Per-line comprehension</text>
  <text class="t-a" x="685" y="261" text-anchor="middle" font-size="12.5">tracking &#183; AI code</text>
  <rect class="chip-a" x="572" y="282" width="226" height="44" rx="7"/>
  <text class="t-a" x="685" y="301" text-anchor="middle" font-size="12.5">Conventional code review</text>
  <text class="t-a" x="685" y="317" text-anchor="middle" font-size="12.5">all code</text>

  <!-- Ship endpoint -->
  <rect class="d-gate" x="858" y="220" width="160" height="60" rx="9"/>
  <text class="t-a" x="938" y="246" text-anchor="middle" font-size="14" font-weight="700">Ship +</text>
  <text class="t-a" x="938" y="265" text-anchor="middle" font-size="14" font-weight="700">receipts</text>

  <!-- box-to-box arrows -->
  <line class="ln-a" x1="248" y1="250" x2="286" y2="250" marker-end="url(#aha)"/>
  <line class="ln-a" x1="524" y1="250" x2="558" y2="250" marker-end="url(#aha)"/>
  <line class="ln-a" x1="810" y1="250" x2="856" y2="250" marker-end="url(#aha)"/>

</svg>`;

export default function AiWorkflow() {
  return (
    <Container style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div className={styles.page}>
        <header className={styles.col}>
          <p className={styles.eyebrow}>
            <span className={styles.brand}>Coherent Constructs</span>
            <span className={styles.sep}>/</span>
            <span>AI Workflow</span>
          </p>
          <h1>
            How we build with AI <span className={styles.thin}>— and how you'll know.</span>
          </h1>
          <p className={styles.lede}>
            Our AI workflow is specially crafted by software experts with, collectively, decades of
            experience. We push new tools to the edge of what they can do —{' '}
            <span className={styles.em}>and won't settle for less</span> — yet we are also aware
            that this blade has two edges.
          </p>
        </header>

        <hr className={styles.rule} />

        <section className={styles.col}>
          <h2>
            Vibe Coding <span className={styles.vs}>vs</span> AI-Centric Development
          </h2>

          <p className={styles.p}>
            When we build a product for you, this product will <strong>never</strong> be “vibe
            coded.” Vibe coding is when a developer prompts AI to develop every feature of the
            software without ever reading the code — fine for a fun weekend project, but unacceptable
            and irresponsible to hand off to a client.
          </p>
          <p className={styles.p}>
            So how do you know <span className={styles.q}>we're not doing that?</span> That's the
            crux of the issue in the industry right now.
          </p>
        </section>

        <figure className={styles.diagram}>
          <div className={styles.figframe} dangerouslySetInnerHTML={{ __html: DIAGRAM_SVG }} />
          {/* <figcaption className={styles.figcaption}>
            Same two endpoints, opposite amount of engineering in between. Vibe coding is a straight
            line that <span className={styles.keyd}>skips review</span> and hands off code no human
            has read. AI-Centric development runs each stage as a set of{' '}
            <span className={styles.key}>concurrent activities</span> — research, security and
            architecture alongside the prompt; five kinds of testing alongside generation — and makes{' '}
            <span className={styles.key}>human review mandatory</span>: per-line comprehension
            tracking on the AI's code, conventional review on all of it. That's the depth behind “how
            do you know?”
          </figcaption> */}
        </figure>

        <section className={styles.col}>
          <p className={styles.p}>
            Generating code with AI isn't inherently bad; you don't want to hire a studio that
            refuses to use AI, because the cost of your product will be significantly higher — in{' '}
            <strong>both</strong> development and maintenance. What you want is a studio where the
            developers responsible for the software understand what it's doing and how it works.
          </p>

          {/* <div className={styles.pull}>
            When we build a product for you, it will{' '}
            <span className={styles.never}>
              never
              <svg
                className={styles.swish}
                viewBox="0 0 200 20"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path d="M4,13 C 30,4 58,4 90,12 C 118,19 150,19 178,9 C 187,6 193,3 199,10" />
              </svg>
            </span>{' '}
            be “vibe coded.”
          </div> */}

          <p className={styles.p}>
            We practice AI-Centric development with mandatory human review and tracked coverage, with
            a <strong>heavy</strong> emphasis on transparency. Not only will we tell you — and bring
            the receipts — how much of your code is generated by AI, we'll also tell you how much
            AI-generated code was reviewed by a human. We keep a meticulous system for this, tracked
            per line of code, and we evaluate human comprehension of the AI-generated code as well.
          </p>

          <div className={styles.receipts} aria-label="The receipts we bring">
            <div className={styles.receipt}>
              <p className={styles.n}>AI-generated</p>
              <p className={styles.d}>How much of your code the AI wrote.</p>
            </div>
            <div className={styles.receipt}>
              <p className={styles.n}>Human-reviewed</p>
              <p className={styles.d}>How much of that a person actually read.</p>
            </div>
            <div className={styles.receipt}>
              <p className={styles.n}>Comprehension</p>
              <p className={styles.d}>Whether the developer understands what it does.</p>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}

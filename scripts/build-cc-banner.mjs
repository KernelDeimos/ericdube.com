// Rebuilds public/banners/coherent-constructs.html from the Coherent Constructs
// marketing page.
//
// The banner is a copy of someone else's document, and it has already been
// hand-updated twice. Doing that by hand invites drift: the copy silently falls
// behind the original, and nobody can tell which differences are deliberate.
// So the copy is generated, and every deliberate difference lives in BANNER_CSS
// below rather than being patched into the copied rules.
//
//   node scripts/build-cc-banner.mjs [path/to/index.html]
//
// Defaults to ../website-coherentconstructs/index.html, i.e. the sibling
// checkout. Pass a path (or set CC_BANNER_SOURCE) if yours lives elsewhere.

import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  repoRoot,
  process.argv[2] ?? process.env.CC_BANNER_SOURCE ?? '../website-coherentconstructs/index.html'
);
const target = resolve(repoRoot, 'public/banners/coherent-constructs.html');

// Everything this banner does differently from the source page. Kept as an
// override block appended after the copied CSS so the copy stays byte-identical
// and a future re-run cannot lose these.
const BANNER_CSS = `/* Banner framing. The source is a full page; here it is a fixed-height backdrop
   behind the wordmark and nav, so it must not scroll, must not paint its own
   page background over the brand's, and must centre rather than flow from the
   top. */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background: transparent;
}
body {
  background-color: transparent;
  justify-content: center;
}
.intro-1 {
  margin-top: 0;
  flex: 1 1 auto;
  justify-content: center;
}
/* The banner sits behind light-on-dark chrome, so give the line art room and
   keep it from being clipped at short banner heights. */
.section-svganim {
  flex: 0 1 auto;
  min-height: 0;
  /* Inset so the drawing does not run under the wordmark and nav. */
  margin: 0 100px;
}
.section-svganim .factory {
  max-height: 100%;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
/* On a phone or tablet the banner is a small, cropped strip, so the full
   factory's ambient motion reads as noise. Keep the structure and the turning
   gears and belts, but skip the long camera build-in and drop the fiddly
   particle motion — steam, sparks, grain, travelling parts, blinking lights,
   scanners — for a calmer, simpler scene than the desktop animation.

   Gated on the primary pointer, not width: (hover: none) and (pointer: coarse)
   is a device whose main input is a finger — a phone or tablet, in any
   orientation — which is what "handheld" actually means; width missed a phone in
   landscape and caught a merely-narrow desktop window. It deliberately avoids the
   any-pointer/any-hover forms, so a touchscreen laptop (a Surface and the like),
   whose primary pointer is still a hovering trackpad, keeps the full desktop
   scene. Only a 2-in-1 with its keyboard detached — a tablet at that point —
   flips to the simplified one, which is the right call. */
@media (hover: none) and (pointer: coarse) {
  .factory .camera { animation-duration: 0.001s; }
  .factory .puff, .factory .grain, .factory .drop, .factory .spark,
  .factory .itA, .factory .itB, .factory .itC, .factory .bucket,
  .factory .hook, .factory .slide, .factory .agv, .factory .rk,
  .factory .scan, .factory .beam, .factory .blink, .factory .bar,
  .factory .wave, .factory .ram, .factory .arm1, .factory .arm2, .factory .grip,
  .factory .head2, .factory .head3, .factory .flapL, .factory .flapR,
  .factory .shutter, .factory .chain, .factory .level, .factory .needle,
  .factory .needle-s, .factory .sway { animation: none; }
}`;

function fail(message) {
  console.error(`build-cc-banner: ${message}`);
  process.exit(1);
}

const html = readFileSync(source, 'utf8');

// 1. The page's stylesheet, copied verbatim. It carries rules the banner never
//    uses (header, code ticker); harmless, and dropping them selectively is how
//    a generated copy starts needing a parser.
const styleOpen = html.indexOf('<style>');
const styleClose = html.indexOf('</style>', styleOpen);
if (styleOpen === -1 || styleClose === -1) fail('no <style> block found in the source');
const css = html.slice(styleOpen + '<style>'.length, styleClose);

// 2. The factory drawing, and only that. Eric asked for the animation without
//    the page header, and the code ticker and tagline that share .intro-1 with
//    it are page copy rather than animation, so they go too. The generated SVG
//    is fenced by markers the source's own inline-factory.py writes.
const begin = html.indexOf('factory:begin');
const end = html.indexOf('factory:end', begin);
if (begin === -1 || end === -1) fail('factory:begin/factory:end markers not found');
const wrapperOpen = html.lastIndexOf('<div class="section-svganim">', begin);
if (wrapperOpen === -1) fail('no <div class="section-svganim"> wrapping the factory markup');
const wrapperClose = html.indexOf('</div>', end);
if (wrapperClose === -1) fail('unterminated section-svganim wrapper');
const factory = html.slice(wrapperOpen, wrapperClose + '</div>'.length);

// animations.js is deliberately NOT inlined. Its only job is typing text into
// #square1_div, which is part of the copy we dropped, so on the banner it threw
// a TypeError every 30ms for as long as the page was open.

// 3. The physics layer, which is ours rather than the source page's, so it is
//    referenced rather than copied — otherwise a re-run would silently drop it.
//    matter.min.js is copied out of node_modules so the served version tracks
//    package.json instead of being a vendored blob nobody updates. It is not
//    loaded by a <script> tag here: cc-physics.js pulls it in itself, and only
//    after its startup gates pass, so a phone or a reduced-motion visitor never
//    downloads ~80KB of engine to leave it idle. Both are plain same-origin
//    scripts, which the banner's sandbox (allow-scripts, no allow-same-origin)
//    permits.
copyFileSync(
  resolve(repoRoot, 'node_modules/matter-js/build/matter.min.js'),
  resolve(repoRoot, 'public/banners/matter.min.js')
);

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coherent Constructs banner</title>
<!-- GENERATED by scripts/build-cc-banner.mjs — do not edit by hand.
     Source: the Coherent Constructs marketing page. Banner-only changes belong
     in BANNER_CSS in that script. -->
<style>
${css}
</style>
<style>
${BANNER_CSS}
</style>
</head>
<body>
    <div class="intro-1">
${factory
  .split('\n')
  .map((line) => (line.trim() ? `    ${line}` : line))
  .join('\n')}
    </div>
<script src="cc-physics.js"></script>
</body>
</html>
`;

writeFileSync(target, out);
console.log(
  `build-cc-banner: wrote ${target} (${out.length} bytes) from ${source}`
);

import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("ai-workflow", "routes/ai-workflow.tsx"),
    // Coherent Constructs' "Prehend" code-review product (feat/cc-code-review):
    // one top-level tab at /prehend whose section layout renders the product
    // sub-nav; the pages fan out beneath it, gated as a group by the 'prehend'
    // tab so a brand that omits it 404s the whole section.
    route("prehend", "routes/prehend-layout.tsx", [
      index("routes/overview.tsx"),
      route("how-it-works", "routes/how-it-works.tsx"),
      route("developers", "routes/developers.tsx"),
      route("docs", "routes/docs.tsx"),
      route("pricing", "routes/pricing.tsx"),
      route("security", "routes/security.tsx"),
    ]),
    route("articles", "routes/articles.tsx"),
    route("articles/:slug", "routes/articles.$slug.tsx"),
    route("services", "routes/services.tsx"),
    route("demos", "routes/demos.tsx"),
    route("artifacts", "routes/artifacts.tsx"),
    route("musings", "routes/musings.tsx"),
    route("weird-food", "routes/weird-food.tsx"),
    route("weird-food/:slug", "routes/weird-food.$slug.tsx"),
  ]),
  // full-bleed: no site chrome, the demo fills the viewport
  route("demos/particle-life", "routes/demos.particle-life.tsx"),
  // full-bleed: serves the artifact's raw self-contained HTML (no site chrome)
  route("artifacts/:slug", "routes/artifacts.$slug.tsx"),
  route("api/zerogpt", "routes/api.zerogpt.tsx"),
  // Computed per request (per-brand), not maintained files — see each route.
  route("sitemap.xml", "routes/sitemap.xml.tsx"),
  route("robots.txt", "routes/robots.txt.tsx"),
] satisfies RouteConfig;

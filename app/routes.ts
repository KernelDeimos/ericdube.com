import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("articles", "routes/articles.tsx"),
    route("articles/:slug", "routes/articles.$slug.tsx"),
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
] satisfies RouteConfig;

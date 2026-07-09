import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("articles", "routes/articles.tsx"),
    route("articles/:slug", "routes/articles.$slug.tsx"),
    route("demos", "routes/demos.tsx"),
    route("musings", "routes/musings.tsx"),
    route("weird-food", "routes/weird-food.tsx"),
    route("weird-food/:slug", "routes/weird-food.$slug.tsx"),
    route("nexus", "routes/nexus.tsx"),
  ]),
  route("api/nexus/health", "routes/api.nexus.health.tsx"),
  route("api/nexus/publish", "routes/api.nexus.publish.tsx"),
] satisfies RouteConfig;

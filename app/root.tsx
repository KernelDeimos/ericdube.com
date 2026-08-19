import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { resolveGoogleTagId, requestOrigin } from "~/lib/website";

/**
 * Resolved for every route — including the full-bleed pages that render outside
 * the branded layout — so a brand's Google tag reaches all of its pages, not
 * just the ones under the chrome. Only the ID, via its own narrow query (see
 * resolveGoogleTagId), never the whole brand document.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Canonicalise every page to a single trailing-slash URL. Only document
  // requests are redirected — a GET/HEAD that accepts HTML — so React Router's
  // own data fetches (Accept: */*) and form POSTs pass through untouched, and
  // only real navigations and crawlers get the 301. Home is already '/', paths
  // with a file extension (/sitemap.xml, assets, RR's .data) carry a dot in
  // their last segment and are skipped, and the API is left alone.
  const accepts = request.headers.get("accept") ?? "";
  const method = request.method.toUpperCase();
  const lastSegment = url.pathname.split("/").pop() ?? "";
  if (
    (method === "GET" || method === "HEAD") &&
    accepts.includes("text/html") &&
    url.pathname !== "/" &&
    !url.pathname.endsWith("/") &&
    !lastSegment.includes(".") &&
    !url.pathname.startsWith("/api/")
  ) {
    throw redirect(`${url.pathname}/${url.search}`, 301);
  }

  return {
    googleTagId: await resolveGoogleTagId(request),
    // Published so meta() — which has no request — can build absolute
    // canonical/og:url/JSON-LD URLs off the host the visitor actually reached.
    origin: requestOrigin(request),
  };
}

/**
 * The Google tag (gtag.js), rendered verbatim from Google's own snippet with the
 * brand's measurement ID substituted in. The ID is sanitised at resolution, so
 * both interpolations here are safe. Only ever rendered when a brand has set an
 * ID, so a brand without one — and every full-bleed page of it — stays
 * tag-free.
 */
function GoogleTag({ id }: { id: string }) {
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      {/* Body reproduced verbatim from Google's snippet, indentation and all, so
          the rendered tag matches their example exactly. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${id}');
`,
        }}
      />
    </>
  );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // useRouteLoaderData rather than useLoaderData: this component also wraps the
  // error boundary, where the root loader's data may be absent — so read it
  // defensively rather than assuming the loader ran.
  const googleTagId =
    useRouteLoaderData<typeof loader>("root")?.googleTagId ?? null;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* As high in <head> as Google's snippet asks for, after only the
            charset and viewport meta tags. */}
        {googleTagId && <GoogleTag id={googleTagId} />}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

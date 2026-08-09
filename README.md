# Eric's Personal Website

This README.md file contains the instal/dev/build instructions
from the original README.md from the React Router generator.

![Screenshot of the Website](./screenshot.png)

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

The website will be available at `http://localhost:5173`.

### Testing a brand locally

The site is whitelabelled: the request's host selects which `website` document
in Sanity drives branding, navigation and content. Locally every request would
otherwise resolve to the default brand, so there is a dev-only override:

```bash
WEBSITE_DOMAIN=coherentconstructs.com npm run dev
```

`WEBSITE_DOMAIN` is matched against each website's `domains` list exactly as a
real `Host` header would be, so you can preview any brand without editing
`/etc/hosts` or spoofing headers. It is **read only when `NODE_ENV` is not
`production`** and ignored otherwise — a stray value must never pin every
visitor to one brand in a deployment. Leave it unset to serve the default brand.

## Artifacts (claude-nexus)

The `/artifacts` pages are served from a local **claude-nexus** node running on
the same server (they used to come from Sanity). Two environment variables
configure the connection (used server-side only, never exposed to the browser):

- `NEXUS_URL` — the node's base URL (default `http://127.0.0.1:42067`).
- `NEXUS_TOKEN` — an `x-nexus-token` whose tokens.yaml grant includes read on `pub.artifacts` (or `**`), scoped to read `pub.artifacts`. Omit on a
  trusted-loopback dev node; required once the node enforces tokens.

## Services page enquiries

The contact form on `/services` delivers to two independent channels, each
enabled by its own environment variable (server-side only, never exposed to the
browser). Set either, or both:

- `SANITY_WRITE_TOKEN` — a Sanity token with write access to the `production`
  dataset. Creates an `enquiry` document you triage in the Studio: status,
  private notes, and a reference to the service it came from. This is the
  durable record.
- `ENQUIRY_NEXUS_KEY` — a claude-nexus log key (e.g. `pub.enquiries`) to
  announce each enquiry on, so it shows up live. Reuses the `NEXUS_URL` /
  `NEXUS_TOKEN` above; the key is created on first write.

A submission succeeds if **at least one** channel accepts it, so nexus alone is
a valid setup and a nexus outage cannot lose an enquiry Sanity already stored.
Every channel failure is logged server-side even when another succeeded. With
neither variable set the form tells the visitor it is not hooked up and offers a
mailto, so a message is never silently dropped.

Delivery lives in `app/lib/enquiries.ts` — adding email (Resend/SMTP) means one
more `deliverTo*` function alongside the existing two.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

---

Built with ❤️,😡,🥲,🤨,😵‍💫,🤯,😱, and 🥱 using React Router.

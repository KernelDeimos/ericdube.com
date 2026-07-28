/**
 * Runs an arbitrary static site as a brand's banner.
 *
 * A brand can supply either a URL to a static site or a self-contained HTML
 * document, and it renders behind the wordmark and nav exactly where the
 * built-in canvas animations do. Isolation is the whole point: the banner is
 * third-party content sitting inside a page that also carries a contact form,
 * so it runs in a sandboxed frame rather than being injected into the document.
 */

type Props = {
  /** A self-contained HTML document. Wins over `url` when both are supplied. */
  html?: string | null;
  /** An https:// URL, or a path on this site such as /banners/name.html. */
  url?: string | null;
  title: string;
  style?: React.CSSProperties;
};

/**
 * `allow-scripts` without `allow-same-origin` is deliberate and the pair must
 * stay that way: granting both together lets framed content reach out and
 * remove its own sandbox, which would defeat the isolation entirely. Scripts
 * are needed because these banners are animations; same-origin access is not.
 */
const SANDBOX = 'allow-scripts';

export default function StaticBanner({ html, url, title, style }: Props) {
  // A path is same-origin and safe to frame; an absolute URL must be https so a
  // banner cannot downgrade the page or be swapped in transit.
  const src = !html && url && (url.startsWith('/') || url.startsWith('https://')) ? url : null;
  if (!html && !src) return null;

  return (
    <iframe
      // Decorative: it carries no information the page does not already state,
      // and it must never take focus or swallow clicks meant for the nav.
      title={title}
      aria-hidden="true"
      tabIndex={-1}
      sandbox={SANDBOX}
      {...(html ? { srcDoc: html } : { src: src! })}
      referrerPolicy="no-referrer"
      loading="eager"
      scrolling="no"
      style={{
        border: 0,
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

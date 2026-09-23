"use client";

/**
 * A plain <a> that also sends a GA4 `card_click` event, tagged with the
 * link name and the QR source (?s=). gtag is loaded site-wide by
 * <GoogleAnalytics> in the root layout; if it is blocked, the link still
 * works because nothing waits on the event.
 */

type Gtag = (cmd: "event", name: string, params: Record<string, string>) => void;

export function TrackedLink({
  href,
  track,
  source,
  style,
  className,
  children,
  download,
  external,
}: {
  href: string;
  track: string;
  source: string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  download?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      style={style}
      className={className}
      download={download || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={() => {
        const g = (window as unknown as { gtag?: Gtag }).gtag;
        if (typeof g === "function") g("event", "card_click", { link: track, source });
      }}
    >
      {children}
    </a>
  );
}

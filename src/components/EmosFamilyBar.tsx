import Link from "next/link";

// EmosFamilyBar: one black strip, shown just above the footer on every EMOS
// surface (/emoshq hub, /emos-platform, /emos-academy, /emos-residency), so a
// visitor on any one offer page can see the other two and the hub exist.
// Added 24 Oct 2026 with the emoshq.com hub. Pass `current` to mark the page
// the visitor is on (it renders as a yellow label, not a link).
// Pure inline styles with the global SIA tokens so it drops into pages that
// use CSS classes, Tailwind, or inline tokens alike.

const ITEMS = [
  { key: "hub", label: "EMOS home", href: "/emoshq" },
  { key: "platform", label: "Platform · run it yourself", href: "/emos-platform" },
  { key: "academy", label: "Academy · learn it with a cohort", href: "/emos-academy" },
  { key: "residency", label: "Residency · built inside your company", href: "/emos-residency" },
] as const;

export type EmosFamilyKey = (typeof ITEMS)[number]["key"];

export function EmosFamilyBar({ current }: { current: EmosFamilyKey }) {
  return (
    <nav
      aria-label="EMOS: one method, three ways to run it"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        borderTop: "1px solid var(--color-ink)",
        borderBottom: "1px solid var(--color-ink)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
      }}
    >
      <span
        style={{
          background: "var(--color-yellow)",
          color: "var(--color-ink)",
          fontFamily: "var(--font-grot)",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          flex: "0 0 auto",
        }}
      >
        EMOS · One method, three ways
      </span>
      {ITEMS.map((it) => {
        const isCurrent = it.key === current;
        const base = {
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          padding: "12px 16px",
          borderLeft: "1px solid rgba(241,235,222,.2)",
          display: "flex",
          alignItems: "center",
          flex: "1 1 180px",
          textDecoration: "none",
        };
        return isCurrent ? (
          <span key={it.key} aria-current="page" style={{ ...base, color: "var(--color-yellow)" }}>
            ● {it.label}
          </span>
        ) : (
          <Link key={it.key} href={it.href} style={{ ...base, color: "var(--color-paper)" }}>
            {it.label} →
          </Link>
        );
      })}
    </nav>
  );
}

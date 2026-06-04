import Link from "next/link";
import { GROT, INK, INK15, INK55, PAPER, YEL } from "@/lib/tokens";

const CREAM     = "#FAFAFA";
const CREAM12   = "rgba(250,250,250,.12)";
const CREAM45   = "rgba(250,250,250,.45)";

// ── Slim tool header ──────────────────────────────────────────────────────────
// Sticky dark bar: SIA mark → tool name · back link on the right.
// Suppresses the site header (SiteHeader already returns null for /tools/).

export const ToolHeader = ({
  toolName,
  sticky = true,
}: {
  toolName: string;
  sticky?: boolean;
}) => (
  <header
    style={{
      background: INK,
      color: CREAM,
      borderBottom: `1px solid ${CREAM12}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "13px clamp(20px, 4vw, 56px)",
      position: sticky ? "sticky" : "relative",
      top: sticky ? 0 : undefined,
      zIndex: sticky ? 100 : undefined,
    }}
  >
    {/* Left: SIA mark + divider + tool name */}
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: YEL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: GROT,
            fontWeight: 900,
            fontSize: 11,
            color: INK,
          }}
        >
          SIA
        </div>
      </Link>

      <span
        style={{ width: 1, height: 18, background: CREAM12, flexShrink: 0 }}
      />

      <span
        style={{
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: CREAM45,
        }}
      >
        {toolName}
      </span>
    </div>

    {/* Right: back to site */}
    <Link
      href="/"
      style={{
        fontFamily: GROT,
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: ".16em",
        textTransform: "uppercase",
        color: CREAM45,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "color .12s",
      }}
    >
      ← syedirfanajmal.com
    </Link>
  </header>
);

// ── Slim tool footer ──────────────────────────────────────────────────────────
// One-line attribution + legal links. Replaces full Colophon on tool pages.

export const ToolFooter = () => (
  <footer
    style={{
      background: PAPER,
      borderTop: `1px solid ${INK15}`,
      padding: "18px clamp(20px, 4vw, 56px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      fontFamily: GROT,
      fontSize: 10,
      letterSpacing: ".10em",
      textTransform: "uppercase",
      color: INK55,
    }}
  >
    <span>
      A free tool by{" "}
      <Link
        href="/"
        style={{ color: "inherit", fontWeight: 700, textDecoration: "none" }}
      >
        Syed Irfan Ajmal
      </Link>
    </span>

    <span style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
      <span>© {new Date().getFullYear()} SIA Enterprises</span>
      <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
        Privacy
      </Link>
      <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
        Terms
      </Link>
    </span>
  </footer>
);

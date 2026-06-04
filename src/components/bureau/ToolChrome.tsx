import Link from "next/link";
import { GROT, INK, YEL } from "@/lib/tokens";

const CREAM     = "#FAFAFA";
const CREAM12   = "rgba(250,250,250,.12)";
const CREAM45   = "rgba(250,250,250,.45)";

// Matches CollabIQ LIGHT_T palette
const FOOTER_BG  = "#F0F0EE";
const FOOTER_BD  = "rgba(26,20,16,0.08)";
const FOOTER_TX  = "rgba(26,20,16,0.45)";
const FOOTER_TX2 = "rgba(26,20,16,0.28)";
const MONO = "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace";

// ── Slim tool header ──────────────────────────────────────────────────────────

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
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, background: YEL,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: GROT, fontWeight: 900, fontSize: 11, color: INK,
        }}>
          SIA
        </div>
      </Link>
      <span style={{ width: 1, height: 18, background: CREAM12, flexShrink: 0 }} />
      <span style={{
        fontFamily: GROT, fontWeight: 700, fontSize: 10,
        letterSpacing: ".16em", textTransform: "uppercase", color: CREAM45,
      }}>
        {toolName}
      </span>
    </div>

    <Link href="/" style={{
      fontFamily: GROT, fontWeight: 700, fontSize: 9,
      letterSpacing: ".16em", textTransform: "uppercase",
      color: CREAM45, textDecoration: "none", whiteSpace: "nowrap",
    }}>
      ← syedirfanajmal.com
    </Link>
  </header>
);

// ── Tool footer — matches CollabIQ WizardFooter palette ──────────────────────

export const ToolFooter = () => (
  <footer style={{
    background: FOOTER_BG,
    borderTop: `1px solid ${FOOTER_BD}`,
    padding: "14px clamp(20px, 4vw, 32px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: ".08em",
  }}>
    <a
      href="https://www.syedirfanajmal.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: FOOTER_TX, textDecoration: "none", fontWeight: 600 }}
    >
      A free tool by Syed Irfan Ajmal · syedirfanajmal.com ↗
    </a>

    <span style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", color: FOOTER_TX2 }}>
      <span>© {new Date().getFullYear()} SIA Enterprises</span>
      <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
      <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
    </span>
  </footer>
);

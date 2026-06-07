"use client";

/**
 * ToolHeader — shared dark header for all EMOS tool pages.
 *
 * Dark 52px sticky bar with:
 *   - 28×28 YEL SIA logo (links to /)
 *   - Tool name in SERIF 15px: "{toolPrefix}<em>IQ</em>" with YEL italic IQ
 *   - Vertical rule + MONO subtitle
 *   - Optional rightContent slot (tool-specific buttons/links)
 *
 * Works in both scrolling-page contexts (position: sticky activates) and
 * fixed-height flex-column shells like PressIQ (flex-shrink: 0 keeps it pinned).
 */

import Link from "next/link";
import { DARK, DARK_BD, GROT, INK, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";

const DIM = "rgba(241,235,222,.55)";   // readable but secondary on dark bg

interface ToolHeaderProps {
  /** Tool name prefix — e.g. "Coverage", "Press", "Signal", "JournoCollab" */
  toolPrefix: string;
  /** Short descriptor shown in MONO below the name — e.g. "PITCH TRACKING CRM · EMOS TOOL SUITE" */
  subtitle: string;
  /** Optional right-side slot — buttons, links, status indicators */
  rightContent?: React.ReactNode;
}

export function ToolHeader({ toolPrefix, subtitle, rightContent }: ToolHeaderProps) {
  return (
    <header
      style={{
        background: DARK,
        borderBottom: `1px solid ${DARK_BD}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(20px,4vw,28px)",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Left: logo + name + subtitle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 15,
            color: PAPER,
            letterSpacing: "-0.01em",
          }}
        >
          {toolPrefix}
          <em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
        </span>

        <div
          style={{
            width: 1,
            height: 18,
            background: "rgba(241,235,222,.28)",
            margin: "0 2px",
          }}
        />

        <span
          style={{
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: DIM,
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Right: optional slot */}
      {rightContent && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {rightContent}
        </div>
      )}
    </header>
  );
}

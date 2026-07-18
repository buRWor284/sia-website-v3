"use client";

/**
 * ToolPipelineFooter — shared earned-media pipeline footer.
 * Used on SignalIQ, PressIQ, JournoCollabIQ, CoverageIQ, and the two
 * platform teaser pages (AssetIQ, FactcheckIQ).
 * NOT used on PartnerCollabIQ (separate tool, outside EMOS workflow).
 *
 * The strip mixes two card kinds:
 *   - Free tools (SignalIQ, JournoCollabIQ, PressIQ, CoverageIQ): numbered
 *     01–04, unchanged from before — no renumbering, so no copy elsewhere
 *     that references "step 01–04" breaks.
 *   - Platform tools (AssetIQ, FactcheckIQ): visually distinct "PLATFORM"
 *     cards with an ink-on-yellow tag in place of a step number, so it's
 *     unmistakable that these live inside the paid EMOS Platform, not the
 *     free lead-magnet tools.
 *
 * Order (the Fairground journey): SignalIQ → AssetIQ → FactcheckIQ →
 * JournoCollabIQ → PressIQ → CoverageIQ → EMOS.
 *
 * Pass `currentTool` to highlight "You are here".
 * Pass `compact` when inside a fixed-height shell (removes top margin, reduces padding).
 *
 * 18 Jul 2026: FactcheckIQ is in private testing. Its card is intentionally
 * NOT clickable (testing: true → href null, "In testing" badge, dimmed) until
 * the tool passes testing. Flip testing back off and restore
 * href: "/tools/factcheckiq" to relaunch it in the strip. The real gate is the
 * FACTCHECKIQ_ALLOWED_ORG_IDS allowlist in src/lib/factcheck/access.ts; this
 * card is just the honest signpost.
 */

import Link from "next/link";
import { DoubleRule, Mark, SCaps } from "@/components/bureau/primitives";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";

export type ToolId =
  | "signaliq"
  | "assetiq"
  | "factcheckiq"
  | "journocollabiq"
  | "pressiq"
  | "coverageiq";

interface PipelineCard {
  step: string;
  tool: string;
  href: string | null;       // null = not clickable (coming soon or in testing)
  toolId: ToolId | "emos";
  role: string;
  comingSoon?: boolean;
  /** In private testing: card shows an "In testing" badge and is not clickable. */
  testing?: boolean;
  /** Platform-only tool (ships inside the paid EMOS Platform, not a free lead magnet). */
  platform?: boolean;
}

const PIPELINE: PipelineCard[] = [
  { step: "01", tool: "SignalIQ",        href: "/tools/signaliq",        toolId: "signaliq",        role: "Find the story" },
  { step: "PLATFORM", tool: "AssetIQ",       href: "/tools/assetiq",       toolId: "assetiq",       role: "Build the asset",   platform: true },
  { step: "PLATFORM", tool: "FactcheckIQ",   href: null,                   toolId: "factcheckiq",   role: "Verify the claims", platform: true, testing: true },
  { step: "02", tool: "JournoCollabIQ",  href: "/tools/journocollabiq",  toolId: "journocollabiq",  role: "Find the journalist" },
  { step: "03", tool: "PressIQ",         href: "/tools/pressiq",         toolId: "pressiq",         role: "Score the pitch" },
  { step: "04", tool: "CoverageIQ",      href: "/tools/coverageiq",      toolId: "coverageiq",      role: "Track the placement" },
  { step: "05", tool: "EMOS",            href: "/emos-platform",              toolId: "emos",            role: "Run the full system" },
];

const ORDER: (ToolId | "emos")[] = ["signaliq", "assetiq", "factcheckiq", "journocollabiq", "pressiq", "coverageiq", "emos"];

function getBadge(card: PipelineCard, currentTool: ToolId | undefined): string {
  if (card.comingSoon) return "Coming soon";
  if (card.testing && card.toolId !== currentTool) return "In testing";
  if (card.toolId === currentTool) return "You are here";

  if (currentTool) {
    const ci = ORDER.indexOf(currentTool);
    const ki = ORDER.indexOf(card.toolId);
    if (ci !== -1 && ki !== -1) {
      if (ki === ci + 1) return "Next step";
      if (ki > ci + 1)  return ki === ORDER.length - 1 ? "The system" : "Then this";
      if (ki < ci)      return "Previous";
    }
  }
  return "";
}

interface Props {
  currentTool?: ToolId;
  /** Remove top margin — use when inside a fixed-height shell (e.g. PressIQ) */
  compact?: boolean;
  /** Set when the footer sits on a dark page background (e.g. PressIQ's
   * ink-shell layout) — flips the label row from ink-on-dark (invisible)
   * to paper-on-dark. The card grid itself is unaffected: cards are always
   * light, regardless of page background. */
  onDark?: boolean;
}

export function ToolPipelineFooter({ currentTool, compact, onDark }: Props) {
  // Hairline borders via a 1px-gap grid on an ink-15 bed, rather than a
  // border-right chain + nth-child overrides — this stays correct at any
  // column count / wrap point, which matters now that 5 free-tool steps
  // share the strip with 2 platform cards (7 cards total).
  const css = `
    .tpf-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: ${INK15};
      border: 1px solid ${INK15};
      position: relative;
    }
    .tpf-card {
      padding: ${compact ? "10px 12px 12px" : "13px 14px 15px"};
      position: relative;
      background: ${PAPER};
      transition: background 0.12s ease;
      text-decoration: none;
      display: block;
    }
    .tpf-card:hover:not(.tpf-soon) { background: ${PAPER2}; }
    .tpf-card.active { background: ${PAPER2}; }
    .tpf-card.tpf-soon { cursor: default; opacity: 0.5; }
    .tpf-card.tpf-soon:hover { background: ${PAPER}; }
    .tpf-card.tpf-platform { background: #faf3df; }
    .tpf-card.tpf-platform.tpf-soon:hover { background: #faf3df; }
    .tpf-card.tpf-platform:hover:not(.tpf-soon) { background: ${PAPER2}; }
    .tpf-card.tpf-platform.active { background: ${INK}; }
    .tpf-arrow {
      position: absolute;
      right: -9px;
      top: 50%;
      transform: translateY(-50%);
      background: ${PAPER};
      border: 1px solid ${INK15};
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${SERIF};
      font-size: 9px;
      color: ${INK35};
      z-index: 1;
    }
    .tpf-card.active .tpf-arrow { background: ${PAPER2}; }
    @media (max-width: 980px) {
      .tpf-grid { grid-template-columns: repeat(4, 1fr); }
      .tpf-arrow { display: none; }
    }
    @media (max-width: 560px) {
      .tpf-grid { grid-template-columns: 1fr 1fr; }
    }
  `;

  return (
    <footer style={{
      padding: compact ? "0 20px 10px" : "0 clamp(20px,4vw,48px) 28px",
      marginTop: compact ? 0 : 48,
    }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <DoubleRule dark={onDark} style={{ marginBottom: compact ? 12 : 16 }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: compact ? 8 : 12, flexWrap: "wrap" }}>
        <SCaps size={8.5} ls="0.20em" color={onDark ? "rgba(241,235,222,.78)" : INK55}>The SIA earned-media pipeline</SCaps>
        <div style={{ flex: 1, height: 1, background: onDark ? "rgba(241,235,222,.22)" : INK15, minWidth: 16 }} />
        <Link href="/tools" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: onDark ? "rgba(241,235,222,.78)" : INK55, textDecoration: "none" }}>
          How they fit together ↗
        </Link>
      </div>

      <div className="tpf-grid">
        {PIPELINE.map((card, idx) => {
          const isActive = card.toolId === currentTool;
          const badge    = getBadge(card, currentTool);
          const notClickable = card.comingSoon || (card.testing && !isActive);
          const cardStyle = `tpf-card${card.platform ? " tpf-platform" : ""}${isActive ? " active" : ""}${notClickable ? " tpf-soon" : ""}`;
          const onDark = card.platform && isActive; // platform card flips to ink when active

          const inner = (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                {card.platform ? (
                  <span
                    style={{
                      fontFamily: GROT, fontWeight: 900, fontSize: 8.5, letterSpacing: ".14em",
                      textTransform: "uppercase", padding: "3px 6px",
                      background: onDark ? YEL : INK, color: onDark ? INK : YEL,
                    }}
                  >
                    Platform
                  </span>
                ) : (
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: onDark ? YEL : isActive ? INK : INK35, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {card.step}
                  </span>
                )}
                {badge && (
                  <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: onDark ? YEL : isActive ? INK : INK35 }}>
                    {badge}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: onDark ? PAPER : isActive ? INK : INK55, marginBottom: 2 }}>
                {isActive && !card.platform ? <Mark>{card.tool}</Mark> : card.tool}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: onDark ? "rgba(241,235,222,.72)" : isActive ? INK70 : INK35 }}>
                {card.role}
              </div>
              {idx < PIPELINE.length - 1 && !card.comingSoon && (
                <div className="tpf-arrow">→</div>
              )}
            </>
          );

          return card.href && !notClickable ? (
            <Link key={card.tool} href={card.href} className={cardStyle}>
              {inner}
            </Link>
          ) : (
            <div key={card.tool} className={cardStyle}>
              {inner}
            </div>
          );
        })}
      </div>
    </footer>
  );
}

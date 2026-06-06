"use client";

/**
 * ToolPipelineFooter — shared earned-media pipeline footer.
 * Used on SignalIQ, PressIQ, JournoCollabIQ, CoverageIQ (coming soon).
 * NOT used on PartnerCollabIQ (separate tool, outside EMOS workflow).
 *
 * Pass `currentTool` to highlight "You are here".
 * Pass `compact` when inside a fixed-height shell (removes top margin, reduces padding).
 */

import Link from "next/link";
import { DoubleRule, Mark, SCaps } from "@/components/bureau/primitives";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";

export type ToolId = "signaliq" | "pressiq" | "journocollabiq" | "coverageiq";

interface PipelineCard {
  step: string;
  tool: string;
  href: string | null;       // null = coming soon, not clickable
  toolId: ToolId | "emos";
  role: string;
  comingSoon?: boolean;
}

const PIPELINE: PipelineCard[] = [
  { step: "01", tool: "SignalIQ",        href: "/tools/signaliq",        toolId: "signaliq",        role: "Find the story" },
  { step: "02", tool: "PressIQ",         href: "/tools/pressiq",         toolId: "pressiq",         role: "Score the pitch" },
  { step: "03", tool: "JournoCollabIQ",  href: "/tools/journocollabiq",  toolId: "journocollabiq",  role: "Find the journalist" },
  { step: "04", tool: "CoverageIQ",      href: null,                     toolId: "coverageiq",      role: "Track the placement", comingSoon: true },
  { step: "05", tool: "EMOS",            href: "/emos",                  toolId: "emos",            role: "Run the full system" },
];

function getBadge(card: PipelineCard, currentTool: ToolId | undefined): string {
  if (card.comingSoon) return "Coming soon";
  if (card.toolId === currentTool) return "You are here";

  if (currentTool) {
    const order: (ToolId | "emos")[] = ["signaliq", "pressiq", "journocollabiq", "coverageiq", "emos"];
    const ci = order.indexOf(currentTool);
    const ki = order.indexOf(card.toolId);
    if (ci !== -1 && ki !== -1) {
      if (ki === ci + 1) return "Next step";
      if (ki > ci + 1)  return ki === order.length - 1 ? "The system" : "Then this";
      if (ki < ci)      return "Previous";
    }
  }
  return "";
}

interface Props {
  currentTool?: ToolId;
  /** Remove top margin — use when inside a fixed-height shell (e.g. PressIQ) */
  compact?: boolean;
}

export function ToolPipelineFooter({ currentTool, compact }: Props) {
  const css = `
    .tpf-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0;
      position: relative;
    }
    .tpf-card {
      border: 1px solid ${INK15};
      border-right: none;
      padding: ${compact ? "10px 12px 12px" : "13px 14px 15px"};
      position: relative;
      background: ${PAPER};
      transition: background 0.12s ease;
      text-decoration: none;
      display: block;
    }
    .tpf-card:last-child { border-right: 1px solid ${INK15}; }
    .tpf-card:hover:not(.tpf-soon) { background: ${PAPER2}; }
    .tpf-card.active { background: ${PAPER2}; border-color: ${INK35}; }
    .tpf-card.tpf-soon { cursor: default; opacity: 0.5; }
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
    .tpf-card.active .tpf-arrow { background: ${PAPER2}; border-color: ${INK35}; }
    @media (max-width: 900px) {
      .tpf-grid { grid-template-columns: repeat(3, 1fr); }
      .tpf-card:nth-child(3) { border-right: 1px solid ${INK15}; }
      .tpf-card:nth-child(4),
      .tpf-card:nth-child(5) { border-top: none; }
      .tpf-card:nth-child(5) { border-right: 1px solid ${INK15}; }
      .tpf-arrow { display: none; }
    }
    @media (max-width: 560px) {
      .tpf-grid { grid-template-columns: 1fr 1fr; }
      .tpf-card { border-right: none; border-bottom: none; }
      .tpf-card:nth-child(2n) { border-right: 1px solid ${INK15}; }
      .tpf-card:last-child { border-right: 1px solid ${INK15}; border-bottom: 1px solid ${INK15}; }
      .tpf-card:nth-child(n+3) { border-top: none; }
    }
  `;

  return (
    <footer style={{
      padding: compact ? "0 20px 10px" : "0 clamp(20px,4vw,48px) 28px",
      marginTop: compact ? 0 : 48,
    }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <DoubleRule style={{ marginBottom: compact ? 12 : 16 }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: compact ? 8 : 12, flexWrap: "wrap" }}>
        <SCaps size={8.5} ls="0.20em" color={INK55}>The SIA earned-media pipeline</SCaps>
        <div style={{ flex: 1, height: 1, background: INK15, minWidth: 16 }} />
        <Link href="/emos" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, textDecoration: "none" }}>
          How they fit together ↗
        </Link>
      </div>

      <div className="tpf-grid">
        {PIPELINE.map((card, idx) => {
          const isActive = card.toolId === currentTool;
          const badge    = getBadge(card, currentTool);
          const cardStyle = `tpf-card${isActive ? " active" : ""}${card.comingSoon ? " tpf-soon" : ""}`;

          const inner = (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: isActive ? YEL : INK35, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {card.step}
                </span>
                {badge && (
                  <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: isActive ? YEL : INK35 }}>
                    {badge}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: isActive ? INK : INK55, marginBottom: 2 }}>
                {isActive ? <Mark>{card.tool}</Mark> : card.tool}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: isActive ? INK70 : INK35 }}>
                {card.role}
              </div>
              {idx < PIPELINE.length - 1 && !card.comingSoon && (
                <div className="tpf-arrow">→</div>
              )}
            </>
          );

          return card.href ? (
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

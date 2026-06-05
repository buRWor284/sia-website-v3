"use client";

/**
 * ToolPipelineFooter — shared earned-media pipeline footer.
 * Used on every SIA tool page so users always know where they are
 * in the pipeline and can navigate to the next step.
 *
 * Pass `currentTool` to highlight the "You are here" card.
 * Pass `currentTool="journochecklist"` for the Journo Outreach Checklist —
 * no card is highlighted but PressIQ is called out as the natural next step.
 */

import Link from "next/link";
import {
  DoubleRule,
  Mark,
  SCaps,
} from "@/components/bureau/primitives";
import {
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  MONO,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

export type ToolId = "signaliq" | "pressiq" | "collabiq" | "journochecklist";

interface PipelineCard {
  step: string;
  tool: string;
  href: string;
  toolId: ToolId | "emos";
  role: string;
  desc: string;
  defaultBadge: string;
}

const PIPELINE: PipelineCard[] = [
  {
    step: "01",
    tool: "SignalIQ",
    href: "/tools/signaliq",
    toolId: "signaliq",
    role: "Find the story",
    desc: "Scan 5 live open-data feeds. Rank opportunities by signal-vs-coverage gap. Get in before the press does.",
    defaultBadge: "Step one",
  },
  {
    step: "02",
    tool: "PressIQ",
    href: "/tools/pressiq",
    toolId: "pressiq",
    role: "Score the pitch",
    desc: "Paste your pitch angle. PressIQ scores it on 8 factors — specificity, credibility, timeliness — before you send it.",
    defaultBadge: "Step two",
  },
  {
    step: "03",
    tool: "CollabIQ",
    href: "/tools/collabiq",
    toolId: "collabiq",
    role: "Find the journalist",
    desc: "Search 50,000+ journalist contact records by beat, outlet, and recency. Pitch the right reporter, not a cold list.",
    defaultBadge: "Step three",
  },
  {
    step: "04",
    tool: "EMOS",
    href: "/emos",
    toolId: "emos",
    role: "Run the full system",
    desc: "The Earned Media Operating System wraps all three tools with playbooks, cadence, and a coverage guarantee.",
    defaultBadge: "The system",
  },
];

/** Compute the badge label for a given card based on which tool is current. */
function getBadge(card: PipelineCard, currentTool: ToolId | undefined): string {
  if (card.toolId === currentTool) return "You are here";

  // When on the Journo Checklist, call out PressIQ as the natural next step.
  if (currentTool === "journochecklist" && card.toolId === "pressiq") {
    return "Pair with this →";
  }

  // Relative ordering badges when a specific tool is active.
  if (currentTool) {
    const order: (ToolId | "emos")[] = ["signaliq", "pressiq", "collabiq", "emos"];
    const currentIdx = order.indexOf(currentTool);
    const cardIdx = order.indexOf(card.toolId);
    if (currentIdx !== -1 && cardIdx !== -1) {
      if (cardIdx === currentIdx + 1) return "Next step";
      if (cardIdx === currentIdx + 2) return "Then this";
      if (cardIdx > currentIdx + 2) return "The system";
      if (cardIdx < currentIdx) return "Previous step";
    }
  }

  return card.defaultBadge;
}

interface Props {
  currentTool?: ToolId;
}

export function ToolPipelineFooter({ currentTool }: Props) {
  const css = `
    .tpf-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      position: relative;
    }
    .tpf-card {
      border: 1px solid ${INK15};
      border-right: none;
      padding: 16px 18px 20px;
      position: relative;
      background: ${PAPER};
      transition: background 0.12s ease;
      text-decoration: none;
      display: block;
    }
    .tpf-card:last-child { border-right: 1px solid ${INK15}; }
    .tpf-card:hover { background: ${PAPER2}; }
    .tpf-card.active { background: ${PAPER2}; border-color: ${INK35}; }
    .tpf-arrow {
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      background: ${PAPER};
      border: 1px solid ${INK15};
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${SERIF};
      font-size: 10px;
      color: ${INK35};
      z-index: 1;
    }
    .tpf-card.active .tpf-arrow {
      background: ${PAPER2};
      border-color: ${INK35};
      color: ${INK55};
    }
    @media (max-width: 860px) {
      .tpf-grid { grid-template-columns: 1fr 1fr; }
      .tpf-card:nth-child(2) { border-right: 1px solid ${INK15}; }
      .tpf-card:nth-child(3) { border-top: none; }
      .tpf-card:nth-child(4) { border-top: none; border-right: 1px solid ${INK15}; }
      .tpf-arrow { display: none; }
    }
    @media (max-width: 540px) {
      .tpf-grid { grid-template-columns: 1fr; }
      .tpf-card { border-right: 1px solid ${INK15}; border-bottom: none; }
      .tpf-card:last-child { border-bottom: 1px solid ${INK15}; }
    }
  `;

  return (
    <footer style={{ padding: "0 clamp(22px,5vw,56px) 36px", marginTop: 60 }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <DoubleRule style={{ marginBottom: 20 }} />

      {/* Pipeline grid */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <SCaps size={9} ls="0.22em" color={INK55}>
            The SIA earned-media pipeline
          </SCaps>
          <div
            style={{ flex: 1, height: 1, background: INK15, minWidth: 20 }}
          />
          <Link
            href="/emos"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 12,
              color: INK55,
              textDecoration: "none",
            }}
          >
            How they fit together ↗
          </Link>
        </div>

        <div className="tpf-grid">
          {PIPELINE.map((card, idx) => {
            const isActive = card.toolId === currentTool;
            const badge = getBadge(card, currentTool);
            return (
              <Link
                key={card.tool}
                href={card.href}
                className={`tpf-card${isActive ? " active" : ""}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: 18,
                      color: isActive ? YEL : INK35,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {card.step}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 7.5,
                      fontWeight: 700,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      color: isActive ? YEL : INK35,
                    }}
                  >
                    {badge}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: isActive ? INK : INK55,
                    marginBottom: 3,
                  }}
                >
                  {isActive ? <Mark>{card.tool}</Mark> : card.tool}
                </div>
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: ".10em",
                    textTransform: "uppercase",
                    color: isActive ? INK70 : INK35,
                    marginBottom: 8,
                  }}
                >
                  {card.role}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 12.5,
                    color: isActive ? INK70 : INK55,
                    lineHeight: 1.45,
                  }}
                >
                  {card.desc}
                </p>
                {idx < PIPELINE.length - 1 && (
                  <div className="tpf-arrow">→</div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Copyright row */}
      <div
        style={{
          paddingTop: 14,
          borderTop: `1px solid ${INK15}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <SCaps size={10} ls="0.16em" color={INK55}>
          © MMXXVI · Syed Irfan Ajmal · SIA Enterprises Inc
        </SCaps>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 999,
              background: YEL,
              border: `1px solid ${INK}`,
            }}
          />
          <SCaps size={10} ls="0.16em" color={INK55}>
            Open for projects, Q3 2026
          </SCaps>
        </div>
      </div>
    </footer>
  );
}

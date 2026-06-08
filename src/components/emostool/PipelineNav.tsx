/**
 * PipelineNav — shows the user's position in the EMOS pipeline
 * and a "Next step" CTA at the bottom of each tool page.
 *
 * Props:
 *   current   — which tool this is
 *   nextHref  — optional URL to pass to the next tool (e.g. with signal ID)
 */

import React from "react";
import { STAGE_META, STAGE_ORDER, type EmosStage } from "@/lib/emos-stage-config";

const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";

interface PipelineNavProps {
  current: EmosStage;
  nextHref?: string; // override href for next tool (e.g. /emostool/dashboard/assetiq?signal=xxx)
}

export default function PipelineNav({ current, nextHref }: PipelineNavProps) {
  const tools = STAGE_ORDER.filter(s => s !== "full") as EmosStage[];
  const currentIdx = tools.indexOf(current);
  const prevStage  = currentIdx > 0 ? tools[currentIdx - 1] : null;
  const nextStage  = currentIdx < tools.length - 1 ? tools[currentIdx + 1] : null;
  const nextMeta   = nextStage ? STAGE_META[nextStage] : null;

  return (
    <div style={{ marginTop: 64, borderTop: `1px solid ${INK15}` }}>

      {/* Pipeline position strip */}
      <div style={{ display: "flex", overflow: "hidden", borderBottom: `1px solid ${INK15}` }}>
        {tools.map((stage, i) => {
          const isCurrent = stage === current;
          const isPast    = i < currentIdx;
          return (
            <a
              key={stage}
              href={STAGE_META[stage].path}
              style={{
                flex: 1,
                padding: "10px 12px",
                textAlign: "center",
                background: isCurrent ? INK : "transparent",
                borderRight: i < tools.length - 1 ? `1px solid ${INK15}` : "none",
                textDecoration: "none",
              }}
            >
              <div style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em",
                textTransform: "uppercase",
                color: isCurrent ? PAPER : isPast ? GREEN : INK55,
              }}>
                {isPast ? "✓ " : ""}{STAGE_META[stage].label}
              </div>
            </a>
          );
        })}
      </div>

      {/* Next step CTA */}
      {nextMeta && (
        <div style={{ background: PAPER2, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>
              Next step in the pipeline
            </div>
            <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 14, letterSpacing: ".10em", textTransform: "uppercase", color: INK }}>
              {nextMeta.label} — {nextMeta.tool}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, marginTop: 3 }}>
              {nextMeta.description}
            </div>
          </div>
          <a
            href={nextHref ?? nextMeta.path}
            style={{
              padding: "12px 24px",
              background: INK, color: PAPER,
              fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
              textDecoration: "none", flexShrink: 0,
            }}
          >
            Go to {nextMeta.label} →
          </a>
        </div>
      )}

      {/* No next step = full EMOS */}
      {!nextMeta && (
        <div style={{ background: INK, color: PAPER, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: YEL }}>
            Pipeline complete — Full EMOS
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.65)", marginTop: 4 }}>
            You've worked through every stage. Keep logging and tracking to compound your results.
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * ScoreTargets — "what a sendable pitch looks like", in one place (2026-09-10).
 *
 * Irfan's rule: the scoring guidelines must be visible both in the docs
 * (/tools/pressiq/how-it-works) and inside the app (the dashboard PressIQ
 * page), so users know what to aim for and how to get there. Every number here
 * is read from src/lib/pitch/config.ts (TIERS, L1_BANDS), the same constants
 * the scorer uses, so the guide can never drift from the rubric. The drafter
 * prompt (src/lib/pitch/draft.ts) is written to the same targets.
 *
 * No hooks, so it renders from a server or a client component.
 */
import React from "react";
import { L1_BANDS, TIERS } from "@/lib/pitch/config";

const INK = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const INK15 = "rgba(26,20,16,.15)";
const PAPER = "#f1ebde";
const YEL = "#f5b81f";
const GROT = "var(--font-grot)";
const SERIF = "var(--font-serif)";
const MONO = "var(--font-mono)";

const placement = TIERS.find((t) => t.label === "Placement-grade") ?? TIERS[TIERS.length - 1];
const competitive = TIERS.find((t) => t.label === "Competitive") ?? TIERS[TIERS.length - 2];

const w = L1_BANDS.wordCount.ideal;
const s = L1_BANDS.subjectWords.ideal;
const g = L1_BANDS.readingGrade.ideal;

const TARGETS: { label: string; target: string }[] = [
  { label: "Length", target: `${w[0]} to ${w[1]} words, signature included` },
  { label: "Subject line", target: `${s[0]} to ${s[1]} words, carrying your strongest fact or offer` },
  { label: "Reading level", target: `Grade ${g[1]} or below: short sentences, everyday words` },
  { label: "Opening", target: "A checkable fact or your own data, tied to what this journalist covers" },
  { label: "The ending", target: `Exactly ${L1_BANDS.questions.ideal} easy question, then an offer to send more` },
  { label: "Signature", target: "Full name, title, company, website, email and LinkedIn" },
];

export default function ScoreTargets({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ border: `1px solid ${INK}`, background: PAPER }}>
      <div style={{ padding: compact ? "12px 14px" : "18px 20px", borderBottom: `1px solid ${INK15}` }}>
        <div style={{ display: "inline-block", fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", background: YEL, color: INK, padding: "2px 6px", marginBottom: 8 }}>
          What to aim for
        </div>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: compact ? 14 : 16, lineHeight: 1.5, color: INK }}>
          Send at <strong>{placement.min} or above</strong> ({placement.label}). {competitive.min} to {competitive.max} is{" "}
          {competitive.label.toLowerCase()}: close, but tighten it first. EMOS drafts are written to start at {competitive.min} or
          above. SignalIQ finds the news hook; the last points come from what only you can add: your own data and the
          journalist&apos;s recent work.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {TARGETS.map((t) => (
          <div key={t.label} style={{ padding: compact ? "10px 14px" : "14px 20px", borderRight: `1px solid ${INK15}`, borderBottom: `1px solid ${INK15}` }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>
              {t.label}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: compact ? 13 : 14.5, lineHeight: 1.45, color: INK }}>{t.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

/**
 * PressIQ — shared presentational cards + constants (Phase P6).
 * Moved verbatim from the public page so both surfaces render identical result
 * UI. No gate/Turnstile/Clerk/fetch here — pure presentation.
 */

import React, { useEffect, useState } from "react";
import { DIMENSION_EVIDENCE, EVIDENCE, tierFor } from "@/lib/pitch/config";
import { emosFrame } from "@/lib/pitch/feedback";
import { scoreLayer1 } from "@/lib/pitch/metrics";
import type { ScoreResponse } from "@/lib/pitch/types";
import { GROT, INK, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";

// ── Tool-specific colours (not in shared tokens) ───────────────────────────────
export const GREEN = "#3e6b45";
export const AMBER = "#9a6a08";
export const RED = "#c14a32";
export const BLUE = "#2d5393";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const ra = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
export function bandColor(s: number) { return s >= 75 ? GREEN : s >= 45 ? AMBER : RED; }

// ── Tabs ──────────────────────────────────────────────────────────────────────
export type Tab = "score" | "fixes" | "breakdown" | "evidence";
export const TABS: { id: Tab; label: string; short: string }[] = [
  { id: "score",     label: "01 · Score",     short: "Score"     },
  { id: "fixes",     label: "02 · Top Fixes", short: "Top Fixes" },
  { id: "breakdown", label: "03 · Breakdown", short: "Breakdown" },
  { id: "evidence",  label: "04 · Evidence",  short: "Evidence"  },
];

// ── Dimensions ────────────────────────────────────────────────────────────────
export const DIMS = [
  { key: "relevance",      name: "Answering the brief",  short: "Relevance",  mech: "Relevance: the #1 filter"            },
  { key: "objective",      name: "Mechanics",             short: "Mechanics",  mech: "Mechanics (Respondable-style)"        },
  { key: "checklist",      name: "SIA 7-Step Checklist", short: "SIA 7-step", mech: "SIA 7-step journo-outreach checklist" },
  { key: "newsroomReady",  name: "Newsroom-ready",        short: "Newsroom",   mech: "Newsroom-ready: publishable material" },
  { key: "storytelling",   name: "Storytelling",          short: "Story",      mech: "Narrative transportation"             },
  { key: "neuromarketing", name: "Neuromarketing",        short: "Neuro",      mech: "System 1 + original data"             },
  { key: "personalBrand",  name: "Personal brand",        short: "Personal",   mech: "E-E-A-T & the halo effect"            },
] as const;
export type DimKey = typeof DIMS[number]["key"];

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
export function Gauge({ score, color }: { score: number; color: string }) {
  const r = 70, circ = 2 * Math.PI * r, d = (score / 100) * circ;
  return (
    <svg viewBox="0 0 180 180" role="img" aria-label={`Score ${score} out of 100`} style={{ width: 180, height: 180 }}>
      <circle cx="90" cy="90" r={r} fill="none" stroke={ra(INK, 0.06)} strokeWidth="7" />
      <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${d.toFixed(1)} ${(circ - d).toFixed(1)}`} transform="rotate(-90 90 90)" />
      <text x="90" y="82" textAnchor="middle" fontFamily={SERIF} fontSize="48" fontWeight="700" fill={INK}>{score}</text>
      <text x="90" y="104" textAnchor="middle" fontFamily={GROT} fontSize="11" fontWeight="700" letterSpacing=".16em" fill={ra(INK, 0.62)}>/ 100</text>
    </svg>
  );
}

// ── Dimension bar chart (Score tab — handoff v2) ─────────────────────────────
export function DimBarChart({ scores, dims }: { scores: Record<string, number>; dims: readonly typeof DIMS[number][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {dims.map((dim, i) => {
        const s = scores[dim.key] ?? 0;
        const t = tierFor(s);
        return (
          <div key={dim.key} style={{
            display: "grid", gridTemplateColumns: "140px 42px 1fr", alignItems: "center",
            gap: 12, padding: "11px 0", borderBottom: `1px solid ${ra(INK, 0.06)}`,
            ...(i === 0 ? { borderTop: `1px solid ${ra(INK, 0.06)}` } : {}),
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK }}>{dim.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: t.color, textAlign: "right" }}>{s}</div>
            <div style={{ position: "relative", height: 18, background: ra(INK, 0.04) }}>
              <div style={{ position: "absolute", inset: 0, width: `${s}%`, background: t.color, opacity: 0.18 }} />
              <div style={{ position: "absolute", inset: 0, width: `${s}%`, borderRight: `2px solid ${t.color}` }} />
              <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontFamily: GROT, fontSize: 7, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.6) }}>
                {t.badge.toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Signal chip ───────────────────────────────────────────────────────────────
export function SignalChip({ label, met }: { label: string; met: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
      border: `1px solid ${met ? ra(GREEN, 0.4) : ra(RED, 0.35)}`, fontFamily: GROT, fontSize: 9.5, fontWeight: 600, color: met ? GREEN : RED }}>
      {met ? "✓" : "✗"} {label}
    </span>
  );
}

// ── Evidence card ─────────────────────────────────────────────────────────────
export function EvidCard({ figKey }: { figKey: string }) {
  const ev = EVIDENCE[figKey];
  if (!ev) return null;
  return (
    <a href={ev.url} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", gap: 10, padding: "9px 12px", background: ra(INK, 0.025), border: `1px solid ${ra(INK, 0.06)}`, textDecoration: "none", marginBottom: 5 }}>
      <div style={{ width: 6, height: 6, background: YEL, marginTop: 5, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{ev.figure}</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: ra(INK, 0.75), marginTop: 2 }}>{ev.source}</div>
      </div>
    </a>
  );
}

// ── Dimension block ───────────────────────────────────────────────────────────
export function DimBlock({ dim, score, analysis, subSignals, evidenceKeys, expanded, onToggle }: {
  dim: typeof DIMS[number]; score: number; analysis?: string;
  subSignals?: { label: string; met: boolean }[]; evidenceKeys?: string[];
  expanded: boolean; onToggle: () => void;
}) {
  const tc = bandColor(score);
  const band = score >= 75 ? "strong" : score >= 45 ? "weak" : ("missing" as const);
  const frame = emosFrame(dim.key as Parameters<typeof emosFrame>[0], score);
  const bandC = band === "strong" ? GREEN : band === "weak" ? AMBER : RED;
  const evKeys = evidenceKeys?.length ? evidenceKeys : (DIMENSION_EVIDENCE[dim.key] ?? []);
  return (
    <div style={{ border: `1px solid ${ra(INK, 0.18)}`, marginBottom: 10 }}>
      <div onClick={onToggle} role="button" tabIndex={0} aria-expanded={expanded} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }} style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK }}>{dim.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: tc }}>{score}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 72, height: 4, background: ra(INK, 0.06) }}>
            <div style={{ width: `${score}%`, height: "100%", background: tc }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.6), display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            {expanded ? "Collapse" : "Expand"}
            <span style={{ fontSize: 13, fontWeight: 700 }}>{expanded ? "-" : "+"}</span>
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${ra(INK, 0.08)}`, padding: "16px 18px" }}>
          {analysis && <div style={{ fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.65), lineHeight: 1.6, marginBottom: 14 }}>{analysis}</div>}
          {subSignals && subSignals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {subSignals.map((s, j) => <SignalChip key={j} label={s.label} met={s.met} />)}
            </div>
          )}
          <div style={{ borderTop: `1px solid ${ra(INK, 0.06)}`, paddingTop: 12 }}>
            <span style={{ display: "inline-block", padding: "3px 8px", background: bandC, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>
              {dim.mech}
            </span>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.62), lineHeight: 1.6, marginBottom: 12 }}>{frame.text}</div>
            {evKeys.map(k => <EvidCard key={k} figKey={k} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fix card ──────────────────────────────────────────────────────────────────
export function FixCard({ rank, fix }: { rank: number; fix: ScoreResponse["topFixes"][0] }) {
  return (
    <div style={{ border: `1px solid ${INK}`, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, background: YEL, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 13, color: INK }}>{rank}</div>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: PAPER }}>{fix.area}</div>
          {fix.mechanism && <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(PAPER, 0.65), marginTop: 2 }}>{fix.mechanism}</div>}
        </div>
      </div>
      <div style={{ padding: "14px 16px", fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.7), lineHeight: 1.6 }}>{fix.text}</div>
    </div>
  );
}

// ── Live meter ────────────────────────────────────────────────────────────────
export function LiveMeter({ label, val, band, hint }: { label: string; val: string; band: "green" | "amber" | "red" | "neutral"; hint: string }) {
  const fill = band === "neutral" ? "0%" : band === "green" ? "100%" : band === "amber" ? "60%" : "30%";
  const fillC = band === "green" ? GREEN : band === "amber" ? AMBER : band === "red" ? RED : ra(INK, 0.1);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontFamily: SERIF, fontSize: 14, color: INK, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK }}>{val}</span>
      </div>
      <div style={{ height: 4, background: ra(INK, 0.06) }}>
        <div style={{ width: fill, height: "100%", background: fillC, transition: "width .25s ease, background .25s ease" }} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(INK, 0.72), marginTop: 3 }}>{hint}</div>
    </div>
  );
}

// ── Live mechanics (standalone card, sits next to the pitch step) ────────────
export function LiveMechanics({ live }: { live: ReturnType<typeof scoreLayer1> | null }) {
  function st(s?: "ideal" | "ok" | "off"): "green" | "amber" | "red" | "neutral" {
    return !s ? "neutral" : s === "ideal" ? "green" : s === "ok" ? "amber" : "red";
  }
  return (
    <section style={{ background: "#fff", border: `1px solid ${ra(INK, 0.1)}`, borderRadius: 6, padding: "24px 28px" }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 18 }}>
        LIVE MECHANICS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
        <LiveMeter label="Word count" val={live ? String(live.bands.wordCount.value) : "0"} band={st(live?.bands.wordCount.status)} hint={live ? live.bands.wordCount.hint : "Type to measure"} />
        <LiveMeter label="Subject length" val={live ? `${live.bands.subjectWords.value} word${live.bands.subjectWords.value !== 1 ? "s" : ""}` : "0 words"} band={st(live?.bands.subjectWords.status)} hint={live ? live.bands.subjectWords.hint : "Add a subject line"} />
        <LiveMeter label="Reading level" val={live ? `Grade ${Math.round(live.bands.readingGrade.value)}` : "-"} band={st(live?.bands.readingGrade.status)} hint={live ? live.bands.readingGrade.hint : "Need more text"} />
        <LiveMeter label="Closing question" val={live ? (live.metrics.hasClosingQuestion ? "Yes" : "No") : "-"} band={st(live?.bands.questions.status)} hint={live ? live.bands.questions.hint : "Need more text"} />
        <div style={{ gridColumn: "1/-1" }}>
          <LiveMeter label="Tone / subjectivity"
            val={live ? (live.bands.subjectivity.status === "ideal" ? "Clean" : live.bands.subjectivity.status === "ok" ? "Mild" : "Flagged") : "-"}
            band={st(live?.bands.subjectivity.status)} hint={live ? live.bands.subjectivity.hint : "Need more text"} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 14, borderTop: `1px solid ${ra(INK, 0.06)}` }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.62) }}>Mechanics score</span>
        <div style={{ flex: 1, height: 4, background: ra(INK, 0.05) }}>
          <div style={{ height: "100%", width: `${live?.score ?? 0}%`, background: BLUE, transition: "width .3s ease" }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: INK }}>{live?.score ?? 0}</span>
      </div>
    </section>
  );
}

// ── Loading panel ─────────────────────────────────────────────────────────────
export function LoadingPanel() {
  // Elapsed-time counter + expectation setting: the AI scoring call routinely
  // takes 30-60s in practice and QA flagged that users assume the tool froze.
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: "80px 32px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: ra(INK, 0.62), marginBottom: 10, textAlign: "center" }}>
        Scoring against 32 factors across 7 dimensions…
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.45), marginBottom: 24, textAlign: "center" }}>
        {secs}s elapsed · a full analysis typically takes 30-60 seconds
      </div>
      <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.5), textAlign: "center", lineHeight: 1.9, marginBottom: 24 }}>
        Cision State of the Media 2026 (n≈1,800)<br />
        Muck Rack State of Journalism 2026 (n≈900)<br />
        Propel Media Barometer Q1 2024 (425k+ pitches)<br />
        Backlinko · Fractl · Boomerang (40M emails)
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="piq-dot" style={{ animationDelay: `${delay}s` }} />
        ))}
      </div>
    </div>
  );
}

// ── Per-tab step navigation ───────────────────────────────────────────────────
export function TabNav({ current, setTab, onReset }: { current: Tab; setTab: (t: Tab) => void; onReset: () => void }) {
  const idx = TABS.findIndex(t => t.id === current);
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null;
  function goNext(id: Tab) {
    setTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: `1px solid ${ra(INK, 0.1)}` }}>
      <div style={{ display: "flex", gap: 5 }}>
        {TABS.map((t, i) => (
          <div key={t.id} style={{ width: t.id === current ? 24 : 8, height: 4, background: (t.id === current || i < idx) ? INK : ra(INK, 0.12), transition: "all .15s" }} />
        ))}
      </div>
      {next ? (
        <button
          onClick={() => goNext(next.id)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
          onMouseOver={e => (e.currentTarget.style.opacity = ".85")} onMouseOut={e => (e.currentTarget.style.opacity = "1")}>
          {next.label} →
        </button>
      ) : (
        <button onClick={onReset} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "transparent", border: `1px solid ${ra(INK, 0.3)}`, color: ra(INK, 0.65), fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
          ← Score another pitch
        </button>
      )}
    </div>
  );
}

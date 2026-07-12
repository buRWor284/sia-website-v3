"use client";

/**
 * SignalIQ — shared presentational atoms + opportunity cards (Phase P6).
 * Moved verbatim from app/tools/signaliq/page.tsx so the public tool and the
 * EMOS dashboard render the exact same UI. Fixes land here ONCE.
 */

import React, { useState, useEffect, useRef, useId } from "react";
import { coverageState } from "@/lib/signaliq/score";
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
} from "@/lib/tokens";
import { SCaps } from "@/components/bureau/primitives";
import { GREEN, AMBER, RED, BLUE } from "./core-css";
import type { Opportunity, OppBand } from "@/lib/signaliq/types";

export { GREEN, AMBER, RED, BLUE };

// ── sources metadata (loader, sidebar; the public landing ticker reuses it) ──
export const SOURCES_DATA = [
  {
    id: "sec",
    name: "SEC EDGAR",
    type: "Federal Filings",
    credibility: 0.95,
    badge: "Highest credibility",
    benefit: "Detects corporate disclosure surges before mainstream press picks up the story. Federal-grade, primary-source receipts.",
    url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=10-K&dateb=&owner=include&count=40",
    role: "Signal",
  },
  {
    id: "gdelt",
    name: "GDELT DOC 2.0",
    type: "Global News Monitor",
    credibility: 0.80,
    badge: "Coverage denominator",
    benefit: "Measures what % of all global news already covers your topic. The gap between signal and coverage is your opportunity window.",
    url: "https://gdeltproject.org",
    role: "Denominator",
  },
  {
    id: "arxiv",
    name: "arXiv",
    type: "Academic Preprints",
    credibility: 0.80,
    badge: "Early signal",
    benefit: "Academic preprint volume precedes mainstream coverage by weeks to months. Research that hasn't hit the press yet.",
    url: "https://arxiv.org",
    role: "Signal",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    type: "Edit-Surge Detector",
    credibility: 0.65,
    badge: "Research signal",
    benefit: "Edit-frequency spikes reveal when a topic is being actively researched en masse, often weeks before journalist interest peaks.",
    url: "https://en.wikipedia.org",
    role: "Signal",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    type: "Tech Forum Velocity",
    credibility: 0.55,
    badge: "Attention radar",
    benefit: "Points and comment velocity reveals which tech, SaaS, and AI stories are gaining momentum right now, before they break wide.",
    url: "https://news.ycombinator.com",
    role: "Signal",
  },
] as const;

// Per-feed scale figures (verified June 2026). Keyed to SOURCES_DATA.id.
export const SOURCE_STATS: Record<
  string,
  { value: number; decimals?: number; prefix?: string; suffix?: string; label: string }
> = {
  sec:        { value: 4700,   prefix: "~", suffix: "/day", label: "new filings hit EDGAR" },
  gdelt:      { value: 100,    suffix: "+",                 label: "languages · refreshed every 15 min" },
  arxiv:      { value: 24226,                               label: "papers in a record month" },
  wikipedia:  { value: 493000, prefix: "~", suffix: "/day", label: "edits · 5.7 every second" },
  hackernews: { value: 1300,   prefix: "~", suffix: "/day", label: "new stories submitted" },
};

// Rotating cards shown while a scan runs (problem → proof → payoff).
export const SCAN_STATS: Array<{ big: string; rest: string; src: string }> = [
  { big: "3.43%",      rest: "the average response rate to a PR pitch. Timing is how you beat it.", src: "Propel · State of PR" },
  { big: "73%",        rest: "of pitches are rejected for being off-beat. A signal-backed angle isn't.", src: "Muck Rack 2024" },
  { big: "53%",        rest: "of journalists say a pitch should include original data. Your scan builds it.", src: "Muck Rack 2024" },
  { big: "Weeks ahead", rest: "academic preprints can lead mainstream coverage. SignalIQ reads them first.", src: "arXiv" },
  { big: "92%",        rest: "of people trust earned media above every form of advertising.", src: "Nielsen" },
  { big: "$15-40k/yr", rest: "what enterprise media tools cost. The signal layer they skip is free here.", src: "Prowly · Vendr" },
];

// ── colour helpers ────────────────────────────────────────────────────────────
export const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
// On-dark versions for use on the INK card header
export const bandColorLight = (b: OppBand): string =>
  b === "hot" ? "#6ecf7a" : b === "look" ? "#7ea8e8" : b === "early" ? "#f0c05a" : "rgba(241,235,222,.4)";
export const bandColor = (b: OppBand): string =>
  b === "hot" ? GREEN : b === "look" ? BLUE : b === "early" ? AMBER : INK55;

/** Tooltip copy explaining what each band means */
export const BAND_TOOLTIP: Record<OppBand, string> = {
  hot:   "Hot lead: Score ≥ 80. High signal volume vs. thin press coverage. Pitch now before the press catches up.",
  look:  "Worth a look: Score 60-79. A real gap exists. Investigate the angle before committing to a pitch.",
  early: "Early: Score 40-59. Signal is emerging but coverage is still low. First-mover window if the story develops.",
  noise: "Noise / late: Score < 40. Either very low signal or already heavily covered. Low opportunity.",
};

// Source display labels
export const SRC_LABEL: Record<string, string> = {
  gdelt: "GDELT",
  hackernews: "Hacker News",
  sec: "SEC EDGAR",
  wikipedia: "Wikipedia",
  arxiv: "arXiv",
};

// ── animated counter (count-up on scroll into view) ──────────────────────────
export function CountUp({
  value, decimals = 0, prefix = "", suffix = "", duration = 1400, className, style,
}: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
  duration?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) =>
      prefix +
      n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix;
    const reduced =
      typeof window !== "undefined" && !!window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let done = false;
    el.textContent = fmt(reduced ? value : 0);
    const animate = () => {
      let start = 0;
      const tick = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(value * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
        else el.textContent = fmt(value);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !done) {
            done = true;
            if (reduced) el.textContent = fmt(value);
            else animate();
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, decimals, prefix, suffix, duration]);
  return <span ref={ref} className={className} style={style} />;
}

// ── scan loader: rotating stat cards + sources lighting up ────────────────────
export function ScanLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SCAN_STATS.length), 5000);
    return () => clearInterval(id);
  }, []);
  // Elapsed-time counter, matching the pattern rolled out to PressIQ. QA found
  // users assume a long-running AI call has frozen without one. The "typically
  // 30-60 seconds" estimate reuses PressIQ's observed range as a placeholder
  // (Irfan's call, 08 Jul) since SignalIQ's own real-world scan time hasn't been
  // separately measured yet. Revisit once it has.
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const s = SCAN_STATS[i];
  return (
    <div className="siq-loader" role="status" aria-live="polite">
      <div className="siq-loader-head">
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55 }}>
          Scanning 5 live sources
        </span>
        <div className="siq-loader-bar"><span /></div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: INK55, textAlign: "center", marginTop: 8 }}>
        {secs}s elapsed · typically takes 30-60 seconds
      </div>
      <div className="siq-loader-feeds">
        {SOURCES_DATA.map((src, idx) => (
          <span key={src.id} className="siq-loader-feed" style={{ "--d": `${idx * 0.45}s` } as React.CSSProperties}>
            <span className="siq-loader-dot" style={{ "--d": `${idx * 0.45}s` } as React.CSSProperties} />
            {src.name}
          </span>
        ))}
      </div>
      <div key={i} className="siq-loader-stat">
        <span className="siq-loader-stat-big">{s.big}</span>
        <span className="siq-loader-stat-text">{s.rest}</span>
        <span className="siq-loader-stat-src">{s.src}</span>
      </div>
    </div>
  );
}

// ── info tooltip (click + hover + keyboard focus, works on mobile) ────────────
export function InfoTooltip({ text, dark = false, width = 270 }: { text: React.ReactNode; dark?: boolean; width?: number }) {
  const [open, setOpen] = useState(false);
  const tooltipId = `siq-tooltip-${useId()}`;
  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label="More information"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); (e.currentTarget as HTMLElement).blur(); }
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v => !v); }
        }}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: 999,
          border: `1px solid ${dark ? "rgba(241,235,222,.3)" : INK35}`,
          fontFamily: SERIF, fontStyle: "italic", fontSize: 9,
          color: dark ? "rgba(241,235,222,.55)" : INK55,
          cursor: "pointer", userSelect: "none",
        }}
      >i</span>
      {open && (
        <span id={tooltipId} role="tooltip" className="siq-tooltip-popup" style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          width, padding: "10px 13px",
          background: PAPER, color: INK55,
          zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.2)",
          border: `1px solid ${INK15}`,
          pointerEvents: "none",
          whiteSpace: "normal",
        }}>
          {text}
          <span style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, background: PAPER, border: `1px solid ${INK15}`, borderBottom: "none", borderRight: "none", rotate: "45deg" }} />
        </span>
      )}
    </span>
  );
}

// ── atoms ─────────────────────────────────────────────────────────────────────

export function ScoreRing({
  score,
  color,
  size = 110,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Score ${score} out of 100`}
      style={{ flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r={r} fill="none" stroke={INK15} strokeWidth="5.5" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="butt"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50"
        y="46"
        textAnchor="middle"
        dominantBaseline="central"
        fill={INK}
        fontFamily={SERIF}
        fontSize="28"
        fontWeight="700"
      >
        {score}
      </text>
      <text x="50" y="68" textAnchor="middle" fill={INK55} fontFamily={SERIF} fontSize="10">
        / 100
      </text>
    </svg>
  );
}

/** Small note explaining a non-"normal" coverage-gap reading. Shared by every
 * surface that shows the coverage gap so "no data" and "cooling" don't silently
 * look like a real medium/narrow reading. See coverageState() in lib/signaliq/score.ts. */
export function CoverageNote({ opp }: { opp: Opportunity }) {
  const state = coverageState(opp);
  if (state === "no-data") {
    return (
      <p style={{ margin: "3px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>
        No press data returned for this topic (GDELT) — this is a neutral default, not a real coverage reading.
      </p>
    );
  }
  if (state === "cooling") {
    return (
      <p style={{ margin: "3px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>
        Press coverage is falling and nothing here is rising — discounted, not real whitespace.
      </p>
    );
  }
  return null;
}

export function GapBar({ opp }: { opp: Opportunity }) {
  const value = opp.components.coverageGap;
  const pct = Math.round(value * 100);
  const state = coverageState(opp);
  const label =
    state === "no-data" ? "No data" :
    state === "cooling" ? "Cooling" :
    value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c =
    // a11y: was INK35 (~2:1, failed WCAG). INK70 keeps it neutral but readable.
    state === "no-data" ? INK70 :
    state === "cooling" ? AMBER :
    value >= 0.7 ? GREEN : value >= 0.4 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <SCaps size={9} ls="0.12em" color={INK}>Coverage gap</SCaps>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: c }}>
          {label}
        </span>
      </div>
      <div style={{ height: 6, background: PAPER2, border: `1px ${state === "no-data" ? "dashed" : "solid"} ${INK15}` }}>
        {state !== "no-data" && (
          <div style={{ height: "100%", width: `${pct}%`, background: c, transition: "width .6s ease" }} />
        )}
      </div>
      <CoverageNote opp={opp} />
    </div>
  );
}

export function CompBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const c = pct >= 70 ? GREEN : pct >= 40 ? AMBER : RED;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <SCaps size={9} ls="0.10em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: c }}>{pct}</span>
      </div>
      <div style={{ height: 5, background: PAPER2, border: `1px solid ${INK15}` }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

// ── sources sidebar (stage 3) ─────────────────────────────────────────────────

export function SourcesSidebar() {
  return (
    <aside className="siq-sources-sidebar">
      <div style={{ paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${INK15}` }}>
        <SCaps size={8.5} ls="0.20em" color={INK55}>Live data feeds</SCaps>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SOURCES_DATA.map((src) => {
          const credPct = Math.round(src.credibility * 100);
          const credColor = src.credibility >= 0.8 ? GREEN : src.credibility >= 0.6 ? AMBER : INK55;
          return (
            <div key={src.id} className="siq-source-card">
              {/* live pulse + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <span className="siq-pulse" />
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: INK, textDecoration: "none", lineHeight: 1.2 }}
                >
                  {src.name} ↗
                </a>
              </div>
              {/* type + role badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <SCaps size={8} ls="0.12em" color={INK55}>{src.type}</SCaps>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 7, letterSpacing: ".14em", textTransform: "uppercase", color: src.role === "Denominator" ? AMBER : GREEN, border: `1px solid ${src.role === "Denominator" ? AMBER : GREEN}`, padding: "1px 4px" }}>
                  {src.role}
                </span>
              </div>
              {/* credibility bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <SCaps size={7.5} ls="0.10em" color={INK55}>Credibility</SCaps>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 10, color: credColor }}>{credPct}%</span>
                </div>
                <div style={{ height: 3, background: INK15 }}>
                  <div style={{ height: "100%", width: `${credPct}%`, background: credColor, transition: "width .5s ease" }} />
                </div>
              </div>
              {/* scale stat — the volume SignalIQ watches on this feed */}
              {SOURCE_STATS[src.id] && (
                <div style={{ marginBottom: 8 }}>
                  <CountUp
                    value={SOURCE_STATS[src.id].value}
                    decimals={SOURCE_STATS[src.id].decimals ?? 0}
                    prefix={SOURCE_STATS[src.id].prefix ?? ""}
                    suffix={SOURCE_STATS[src.id].suffix ?? ""}
                    style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, letterSpacing: "-0.01em", display: "block", lineHeight: 1.05 }}
                  />
                  <span style={{ display: "block", marginTop: 2, fontFamily: MONO, fontWeight: 700, fontSize: 7.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, lineHeight: 1.3 }}>
                    {SOURCE_STATS[src.id].label}
                  </span>
                </div>
              )}
              {/* benefit */}
              <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, lineHeight: 1.45 }}>
                {src.benefit}
              </p>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${INK15}` }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, lineHeight: 1.5 }}>
          All feeds are free, no API key. Every signal links back to its primary-source URL: click through to verify.
        </p>
      </div>
    </aside>
  );
}

// ── opportunity card ──────────────────────────────────────────────────────────

export const SIGNAL_SOURCES: Array<{ id: "sec" | "arxiv" | "wikipedia" | "hackernews"; label: string }> = [
  { id: "sec",        label: "SEC EDGAR" },
  { id: "arxiv",      label: "arXiv" },
  { id: "wikipedia",  label: "Wikipedia" },
  { id: "hackernews", label: "Hacker News" },
];

/** Save-to-EMOS wiring (dashboard wrapper only — the public tool passes nothing). */
export interface OppCardSave {
  saved: boolean;
  saving: boolean;
  error?: string | null;
  onSave: () => void;
}

export function OppCard({
  opp,
  onGenerate,
  onSelect,
  save,
}: {
  opp: Opportunity;
  onGenerate: () => void;
  onSelect?: () => void;
  save?: OppCardSave;
}) {
  const [showSources, setShowSources] = useState(false);
  const signalBySource = Object.fromEntries(opp.signals.map(s => [s.source, s]));
  return (
    <div className={`siq-card${onSelect ? " siq-card-click" : ""}`} onClick={onSelect}>
      {/* INK header strip — one verdict: band label + score, read as a single rating */}
      <div className="siq-card-head">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase",
            color: bandColorLight(opp.band),
            border: `1px solid ${hexA(bandColorLight(opp.band), 0.45)}`,
            background: hexA(bandColorLight(opp.band), 0.12),
            padding: "2px 6px",
          }}>
            {opp.bandLabel}
          </span>
          <span style={{ color: "rgba(241,235,222,.72)", fontSize: 12 }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: PAPER, letterSpacing: "-0.02em" }}>
              {opp.score}
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(241,235,222,.5)" }}>/ 100</span>
          </span>
          <InfoTooltip text={BAND_TOOLTIP[opp.band]} dark />
        </span>
      </div>
      {/* PAPER2 body */}
      <div className="siq-card-body">
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: INK, letterSpacing: "-0.01em" }}>
          {opp.headline}
        </h3>
        {/* Why now — market-timing driver (coverage gap) */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ flexShrink: 0, width: 48, paddingTop: 1, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: INK35 }}>
            Why&nbsp;now
          </span>
          <div style={{ flex: 1 }}>
            <GapBar opp={opp} />
          </div>
        </div>

        {/* Why you — relevance to the user's startup (only when personalized) */}
        {opp.fit && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flexShrink: 0, width: 48, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: INK35 }}>
              Why&nbsp;you
            </span>
            <span style={{ fontFamily: GROT, fontSize: 11, color: INK70 }}>
              Fit for your startup:{" "}
              <span style={{
                fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
                color: opp.fit === "high" ? GREEN : opp.fit === "medium" ? AMBER : RED,
              }}>
                {opp.fit === "high" ? "High" : opp.fit === "medium" ? "Medium" : "Low"}
              </span>
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {opp.signals.map((s, i) =>
            s.source === "sec" ? (
              // EDGAR EFTS is a JSON-only API — no human-readable URL for individual results.
              // Link to the EDGAR full-text search so users can explore filings directly.
              <a
                key={i}
                href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=8-K&dateb=&owner=include&count=40"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="siq-chip"
                title="SEC EDGAR: no direct link for this result. Click to search EDGAR filings."
              >
                {SRC_LABEL[s.source]} · sec.gov ↗
              </a>
            ) : (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="siq-chip"
              >
                {SRC_LABEL[s.source] ?? s.source.toUpperCase()} ↗
              </a>
            )
          )}
        </div>
        {opp.sensitive && (
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: RED, lineHeight: 1.4 }}>
            Sensitive topic: handle with care.
          </p>
        )}

        {/* Sources checked — toggle */}
        <div style={{ borderTop: `1px solid ${INK15}`, marginTop: 12, paddingTop: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSources(v => !v); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".13em",
              textTransform: "uppercase", color: INK35,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <span>{showSources ? "▲" : "▼"}</span>
            Sources checked ({opp.signals.length + 1} of 5 returned data)
          </button>

          {showSources && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {/* GDELT — always the coverage denominator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: AMBER }}>
                  GDELT · Coverage baseline
                </span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, textAlign: "right" }}>
                  {opp.coverage
                    ? `${opp.coverage.articleCount.toLocaleString()} news articles · ${(opp.coverage.volume * 100).toFixed(0)}% saturated`
                    : "Coverage data unavailable"}
                </span>
              </div>

              {/* Signal sources */}
              {SIGNAL_SOURCES.map(({ id, label }) => {
                const sig = signalBySource[id];
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: sig ? GREEN : INK35 }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: sig ? INK70 : INK55, textAlign: "right" }}>
                      {sig ? (sig.detail || sig.title) : "No signal detected"}
                    </span>
                  </div>
                );
              })}

              <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 10.5, color: INK70, lineHeight: 1.5 }}>
                <strong style={{ fontStyle: "normal" }}>Score</strong> = weighted composite across all signal sources above.{" "}
                <strong style={{ fontStyle: "normal" }}>Coverage Gap bar</strong> uses GDELT alone as its denominator: it measures what % of global news already covers this topic.
                A wide gap means the story is surging in primary sources but hasn&rsquo;t landed in mainstream press yet, your window to pitch first.
              </p>
            </div>
          )}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onGenerate(); }} className="siq-gen-btn">
        <span>Generate asset pack →</span>
        <span className="siq-gen-sub">pitch angle · data brief · who to pitch</span>
      </button>
      {/* Save to EMOS — rendered only when the dashboard wrapper wires it up */}
      {save && (
        <div style={{ margin: "0 16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); if (!save.saved && !save.saving) save.onSave(); }}
            disabled={save.saving || save.saved}
            className="siq-save-btn"
            style={{ margin: 0 }}
          >
            {save.saving ? "Saving…" : save.saved ? "✓ Saved to EMOS" : "Save to EMOS →"}
          </button>
          {save.error && (
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: RED, lineHeight: 1.4 }}>
              ✗ {save.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── detail score panels ───────────────────────────────────────────────────────

export function ScorePanel({ opp }: { opp: Opportunity }) {
  return (
    <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "16px 18px" }}>
      <SCaps size={10} ls="0.16em" color={INK}>Score breakdown</SCaps>
      <div style={{ marginTop: 12 }}>
        <CompBar label="Magnitude" value={opp.components.magnitude} />
        <CompBar label="Velocity" value={opp.components.velocity} />
        <CompBar label="Coverage gap" value={opp.components.coverageGap} />
        <CoverageNote opp={opp} />
        {opp.relevanceMultiplier != null && opp.relevanceMultiplier < 0.999 && (
          <CompBar label="Startup fit" value={opp.components.relevance} />
        )}
        <CompBar label="Beat fit" value={opp.components.fit} />
        <CompBar label="Corroboration" value={opp.components.corroboration} />
      </div>
    </div>
  );
}

export function ReceiptsPanel({ opp }: { opp: Opportunity }) {
  return (
    <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "16px 18px" }}>
      <SCaps size={10} ls="0.16em" color={INK}>The receipts</SCaps>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
        {opp.signals.map((s, i) => (
          <div key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: SERIF, fontSize: 14.5, color: INK, textDecoration: "underline", textDecorationColor: INK35, lineHeight: 1.35 }}
            >
              {s.title} ↗
            </a>
            {s.detail && (
              <div style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: ".04em", color: INK55, marginTop: 2 }}>
                {SRC_LABEL[s.source] ?? s.source.toUpperCase()} · {s.detail}
              </div>
            )}
          </div>
        ))}
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, paddingTop: 6, borderTop: `1px solid ${INK15}` }}>
          {opp.coverage ? (
            <>
              Press coverage so far: {Math.round(opp.coverage.volume * 100)}% of saturation (GDELT)
              {opp.coverage.lowSample ? " — thin history, treat the trend cautiously" : ""}.
              {opp.cooling ? " Trending down alongside flat/falling signals — read as cooling, not whitespace." : ""}
            </>
          ) : (
            "Press coverage: no GDELT data returned for this topic — the coverage gap above uses a neutral default, not a real reading."
          )}
        </div>
      </div>
    </div>
  );
}

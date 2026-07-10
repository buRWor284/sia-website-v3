"use client";

/**
 * SignalIQ — /tools/signaliq
 * Proactive-PR radar: pick a beat → scan open-data signals → rank opportunities
 * by signal-vs-coverage gap → generate a newsjacking asset pack.
 *
 * Redesigned per Claude Design handoff (June 2026): custom header, step bar,
 * editorial hero with ghost watermark, INK-strip cards, ScoreRing, SectionMast
 * sections, "How to use" guide, live-sources callout, tool-nav footer.
 *
 * Honesty: scores are a lead/whitespace measure, never a prediction. Said so on-page.
 */

import React, { useState, useMemo, useEffect, useRef, useId } from "react";
import Link from "next/link";
import Script from "next/script";
import { getJsPDF } from "@/lib/pdf/house-style";
import { buildSignalIqReport } from "@/lib/pdf/signaliq-report";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { EmosCTAStrip } from "@/components/tools/ToolCTAStrips";
import { ToolHeader } from "@/components/tools/ToolHeader";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  DARK,
  DARK_BD,
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
import { BEATS, EMAIL_SCANS, FREE_SCANS, PRODUCT } from "@/lib/signaliq/config";
import { coverageState } from "@/lib/signaliq/score";
import type {
  AssetPack,
  BeatId,
  Opportunity,
  OppBand,
  ScanResponse,
} from "@/lib/signaliq/types";

// ── sources metadata ─────────────────────────────────────────────────────────
const SOURCES_DATA = [
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

// ── spot colours ──────────────────────────────────────────────────────────────
const GREEN = "#3e6b45";
const AMBER = "#d99211";
const RED = "#c14a32";
const BLUE = "#2d5393";

const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
// On-dark versions for use on the INK card header
const bandColorLight = (b: OppBand): string =>
  b === "hot" ? "#6ecf7a" : b === "look" ? "#7ea8e8" : b === "early" ? "#f0c05a" : "rgba(241,235,222,.4)";
const bandColor = (b: OppBand): string =>
  b === "hot" ? GREEN : b === "look" ? BLUE : b === "early" ? AMBER : INK55;

/** Tooltip copy explaining what each band means */
const BAND_TOOLTIP: Record<OppBand, string> = {
  hot:   "Hot lead: Score ≥ 80. High signal volume vs. thin press coverage. Pitch now before the press catches up.",
  look:  "Worth a look: Score 60-79. A real gap exists. Investigate the angle before committing to a pitch.",
  early: "Early: Score 40-59. Signal is emerging but coverage is still low. First-mover window if the story develops.",
  noise: "Noise / late: Score < 40. Either very low signal or already heavily covered. Low opportunity.",
};

// Source display labels
const SRC_LABEL: Record<string, string> = {
  gdelt: "GDELT",
  hackernews: "Hacker News",
  sec: "SEC EDGAR",
  wikipedia: "Wikipedia",
  arxiv: "arXiv",
};

const EMOS_URL = "/emos";

// Cloudflare Turnstile site key (public). When unset, the widget is NOT rendered
// and scanning works exactly as before. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (+ the
// server TURNSTILE_SECRET_KEY) to enforce the human check end-to-end.
// (H7, 2026-07-02 review: SignalIQ previously had no Turnstile wiring at all, so
// enabling the secret for PressIQ would have 403'd every SignalIQ user.)
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// ── stats: the value/effort behind SignalIQ ──────────────────────────────────
// Per-feed scale figures (verified June 2026). Keyed to SOURCES_DATA.id.
const SOURCE_STATS: Record<
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
const SCAN_STATS: Array<{ big: string; rest: string; src: string }> = [
  { big: "3.43%",      rest: "the average response rate to a PR pitch. Timing is how you beat it.", src: "Propel · State of PR" },
  { big: "73%",        rest: "of pitches are rejected for being off-beat. A signal-backed angle isn't.", src: "Muck Rack 2024" },
  { big: "53%",        rest: "of journalists say a pitch should include original data. Your scan builds it.", src: "Muck Rack 2024" },
  { big: "Weeks ahead", rest: "academic preprints can lead mainstream coverage. SignalIQ reads them first.", src: "arXiv" },
  { big: "92%",        rest: "of people trust earned media above every form of advertising.", src: "Nielsen" },
  { big: "$15-40k/yr", rest: "what enterprise media tools cost. The signal layer they skip is free here.", src: "Prowly · Vendr" },
];

// Headline proof bar on the landing view (counts up on scroll).
const PROOF_STATS: Array<{ value: number; decimals?: number; suffix?: string; label: string; src: string }> = [
  { value: 3.43, decimals: 2, suffix: "%", label: "average response rate to a cold PR pitch: the bar SignalIQ helps you clear", src: "Propel · State of PR" },
  { value: 73,                suffix: "%", label: "of pitches die for being off-beat; a signal-backed angle doesn't", src: "Muck Rack 2024" },
  { value: 53,                suffix: "%", label: "of journalists want original data in a pitch: every scan builds it", src: "Muck Rack 2024" },
  { value: 92,                suffix: "%", label: "of people trust earned media above all advertising", src: "Nielsen" },
];

// ── animated counter (count-up on scroll into view) ──────────────────────────
function CountUp({
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
function ScanLoader() {
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

// ── proof strip: headline stats that count up on the landing view ─────────────
function ProofStrip() {
  return (
    <div className="siq-proof">
      <div className="siq-proof-inner">
        {PROOF_STATS.map((p, idx) => (
          <div key={idx} className="siq-proof-cell">
            <CountUp value={p.value} decimals={p.decimals ?? 0} suffix={p.suffix} className="siq-proof-num" />
            <p className="siq-proof-label">{p.label}</p>
            <span className="siq-proof-src">{p.src}</span>
          </div>
        ))}
      </div>
      <p className="siq-proof-foot">
        Why timing beats volume in earned media: every figure links back to its source on the{" "}
        <Link href="/tools/signaliq/about" style={{ color: INK55, textDecoration: "underline", textDecorationColor: INK15 }}>methodology page</Link>.
      </p>
    </div>
  );
}

// ── info tooltip (click + hover + keyboard focus, works on mobile) ────────────
function InfoTooltip({ text, dark = false, width = 270 }: { text: React.ReactNode; dark?: boolean; width?: number }) {
  const [open, setOpen] = useState(false);
  const bg = dark ? PAPER : INK;
  const fg = dark ? INK : PAPER;
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

function ScoreRing({
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
function CoverageNote({ opp }: { opp: Opportunity }) {
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

function GapBar({ opp }: { opp: Opportunity }) {
  const value = opp.components.coverageGap;
  const pct = Math.round(value * 100);
  const state = coverageState(opp);
  const label =
    state === "no-data" ? "No data" :
    state === "cooling" ? "Cooling" :
    value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c =
    state === "no-data" ? INK35 :
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

function CompBar({ label, value }: { label: string; value: number }) {
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

// ── wire-feed ticker ─────────────────────────────────────────────────────────

function SourcesTicker() {
  // Duplicate items for seamless infinite loop
  const items = [...SOURCES_DATA, ...SOURCES_DATA];
  return (
    <div className="siq-ticker-wrap" aria-label="Live data sources">
      <div className="siq-ticker-label">
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 7.5, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(241,235,222,.5)" }}>
          Live feeds
        </span>
      </div>
      <div className="siq-ticker-overflow">
        <div className="siq-ticker-track">
          {items.map((src, i) => (
            <span key={i} className="siq-ticker-item">
              <span className="siq-ticker-dot" />
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.6)" }}>
                {src.type}
              </span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: "rgba(241,235,222,.95)", letterSpacing: "-0.01em" }}>
                {src.name}
              </span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.72)" }}>
                {src.benefit.split(". ")[0]}
              </span>
              <span className="siq-ticker-sep">·····</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── sources sidebar ───────────────────────────────────────────────────────────

function SourcesSidebar() {
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

// ── header ────────────────────────────────────────────────────────────────────

// ── Header: now a shared component ───────────────────────────────────────────
// SIQHeader removed; rendered inline with <ToolHeader> in the page return.

// ── step bar ──────────────────────────────────────────────────────────────────

// ── footer: now a shared component ───────────────────────────────────────────
// SIQFooter removed; use <ToolPipelineFooter currentTool="signaliq" /> below.

// ── hero ──────────────────────────────────────────────────────────────────────

function SIQHero({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ padding: "clamp(12px,2vw,24px) clamp(22px,5vw,56px) 0", position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-54%)",
          fontFamily: SERIF, fontWeight: 700,
          fontSize: "clamp(80px,14vw,160px)",
          letterSpacing: "-0.04em",
          color: "rgba(26,20,16,.04)",
          whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
        }}
      >
        SIGNAL
      </div>
      <SCaps color={INK55} size={10.5} ls="0.24em">
        {PRODUCT} · Story Radar
      </SCaps>

      {/* 2-col hero grid */}
      <div className="siq-hero-grid">
        {/* Left: headline + body */}
        <div style={{ paddingBottom: "clamp(20px,3vw,36px)" }}>
          <h1 className="siq-h1">
            See the story<br />
            <em style={{ fontStyle: "italic", fontWeight: 600 }}>
              <Mark>before it breaks.</Mark>
            </em>
          </h1>
          <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(15px,1.8vw,20px)", color: INK70, lineHeight: 1.5 }}>
            {PRODUCT} scans open, primary-source data (filings, research, search and
            forum surges) and ranks the stories rising fastest before the press has
            caught up. Then it drafts the pitch.
          </p>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 13, color: INK55, lineHeight: 1.5 }}>
            Early signals, not predictions: every opportunity links back to its source.
          </p>
          {/* Above-the-fold primary CTA — repeated lower on the page after the proof strip */}
          <div style={{ marginTop: "clamp(18px,2.4vw,26px)" }}>
            <button
              onClick={onStart}
              style={{
                padding: "15px 40px", border: "none", background: YEL, color: INK,
                fontFamily: GROT, fontWeight: 900, fontSize: 15, letterSpacing: ".10em",
                textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(245,184,31,.35)",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Start scanning →
            </button>
            <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
              {FREE_SCANS} free scans / month, or {EMAIL_SCANS} with your email · no API key needed
            </p>
          </div>
        </div>

        {/* Right: "How it works" editorial panel */}
        <div className="siq-hero-panel">
          <SCaps size={9} ls="0.20em" color={INK55}>How it works</SCaps>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
            {([
              ["01", "Pick a beat", "Choose your industry vertical: SaaS, Fintech, Health, Climate, AI, Cybersecurity, or Agency & Marketing."],
              ["02", "Scan the radar", "5 live open-data sources scanned in seconds. No API key. No cost."],
              ["03", "Get an asset pack", "Pitch angle, data brief, journalist list: ready to send."],
            ] as [string, string, string][]).map(([n, title, desc], idx, arr) => (
              <div key={n} style={{ display: "flex", gap: 14, paddingBottom: 16, marginBottom: idx < arr.length - 1 ? 16 : 0, borderBottom: idx < arr.length - 1 ? `1px solid ${INK15}` : "none" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: YEL, lineHeight: 1, flexShrink: 0, letterSpacing: "-0.02em" }}>{n}</span>
                <div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".10em", textTransform: "uppercase", color: INK, marginBottom: 4 }}>{title}</div>
                  <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.45 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DoubleRule />
    </section>
  );
}

// ── beat picker ───────────────────────────────────────────────────────────────

function BeatPicker({
  beats,
  setBeats,
  onScan,
  scanning,
  wizardMode = false,
}: {
  beats: BeatId[];
  setBeats: (b: BeatId[]) => void;
  onScan?: () => void;
  scanning?: boolean;
  wizardMode?: boolean;
}) {
  const primary = beats[0];
  const secondary = beats[1] as BeatId | undefined;
  const tertiary = beats[2] as BeatId | undefined;
  const currentBeat = BEATS.find((b) => b.id === primary);

  // Primary is the required tab-grid choice; secondary/tertiary are optional,
  // additive (weighted, still one scan). Setting primary keeps any secondary /
  // tertiary that don't collide with the new primary.
  const setPrimary = (id: BeatId) => setBeats([id, ...beats.slice(1).filter((b) => b !== id)]);
  const secondaryOptions = BEATS.filter((b) => b.id !== primary && b.id !== tertiary);
  const tertiaryOptions = BEATS.filter((b) => b.id !== primary && b.id !== secondary);
  const addSecondary = () => {
    const first = secondaryOptions[0];
    if (first) setBeats([primary, first.id]);
  };
  const changeSecondary = (id: BeatId) =>
    setBeats([primary, id, ...(tertiary && tertiary !== id ? [tertiary] : [])]);
  const removeSecondary = () => setBeats([primary]); // drops tertiary too
  const addTertiary = () => {
    const first = tertiaryOptions[0];
    if (first && secondary) setBeats([primary, secondary, first.id]);
  };
  const changeTertiary = (id: BeatId) => secondary && setBeats([primary, secondary, id]);
  const removeTertiary = () => secondary && setBeats([primary, secondary]);

  return (
    <section style={{ padding: "clamp(16px,3vw,28px) clamp(22px,5vw,56px) 0" }}>
      <div className="siq-beat-tabs">
        {BEATS.map((b, i) => {
          const isActive = b.id === primary;
          const seedsNode = (
            <span>
              <span style={{ fontStyle: "normal", fontWeight: 700 }}>Seed Phrases: </span>{b.seeds.join(", ")}
            </span>
          );
          return (
            <button
              key={b.id}
              onClick={() => setPrimary(b.id)}
              className={`siq-tab${isActive ? " active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                <span className="siq-tab-no">0{i + 1}</span>
                <span>{b.label}</span>
                <InfoTooltip text={seedsNode} dark={isActive} width={320} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Beat selection tip */}
      <p style={{ maxWidth: 800, marginTop: 10, marginBottom: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, lineHeight: 1.6 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontStyle: "normal", fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK70 }}>Tip:</span>{" "}
        Pick the vertical your <em>target journalists</em> cover as your <strong>main beat</strong>.
        Straddling two worlds &mdash; say health <em>and</em> AI? Add a second (and third) beat below and we scan all of them in one pass. It still counts as a single scan against your quota.
      </p>

      {/* Secondary / tertiary beats — progressive disclosure (all tiers free) */}
      <div className="siq-multibeat">
        {!secondary ? (
          <button type="button" className="siq-addbeat" onClick={addSecondary}>
            + Add a secondary beat <span className="siq-addbeat-opt">(optional)</span>
          </button>
        ) : (
          <div className="siq-beatrow">
            <span className="siq-beatrow-lbl">Secondary</span>
            <select className="siq-beatsel" value={secondary} onChange={(e) => changeSecondary(e.target.value as BeatId)}>
              {secondaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <button type="button" className="siq-beatx" onClick={removeSecondary} aria-label="Remove secondary beat">×</button>
          </div>
        )}
        {secondary && (!tertiary ? (
          <button type="button" className="siq-addbeat" onClick={addTertiary}>
            + Add a third beat <span className="siq-addbeat-opt">(optional)</span>
          </button>
        ) : secondary && tertiary ? (
          <div className="siq-beatrow">
            <span className="siq-beatrow-lbl">Tertiary</span>
            <select className="siq-beatsel" value={tertiary} onChange={(e) => changeTertiary(e.target.value as BeatId)}>
              {tertiaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <button type="button" className="siq-beatx" onClick={removeTertiary} aria-label="Remove third beat">×</button>
          </div>
        ) : null)}
      </div>
      {!wizardMode && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <button
            onClick={onScan}
            disabled={scanning}
            className="siq-scan-btn"
          >
            {scanning ? "Scanning the radar…" : beats.length > 1 ? `Scan ${beats.length} beats →` : `Scan ${currentBeat?.label} →`}
          </button>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
            {FREE_SCANS} free scans / month, or {EMAIL_SCANS} with your email · live open-data sources
          </p>
        </div>
      )}
    </section>
  );
}

// ── opportunity card ──────────────────────────────────────────────────────────

const SIGNAL_SOURCES: Array<{ id: "sec" | "arxiv" | "wikipedia" | "hackernews"; label: string }> = [
  { id: "sec",        label: "SEC EDGAR" },
  { id: "arxiv",      label: "arXiv" },
  { id: "wikipedia",  label: "Wikipedia" },
  { id: "hackernews", label: "Hacker News" },
];

function OppCard({
  opp,
  onGenerate,
  onSelect,
}: {
  opp: Opportunity;
  onGenerate: () => void;
  onSelect?: () => void;
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
          <span style={{ color: "rgba(241,235,222,.35)", fontSize: 12 }}>·</span>
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
    </div>
  );
}

// ── detail score panels ───────────────────────────────────────────────────────

function ScorePanel({ opp }: { opp: Opportunity }) {
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

function ReceiptsPanel({ opp }: { opp: Opportunity }) {
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

// ── pack view ─────────────────────────────────────────────────────────────────

// Minimal Markdown renderer for AI-generated text (## headings, **bold**, "- " lists).
// The model output for pack.brief is lightly-formatted Markdown; this renders it
// properly instead of showing the raw "##"/"**" syntax as literal characters.
function inlineMd(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

function MarkdownLite({ text, textColor }: { text: string; textColor: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.length > 0 && lines.every(l => /^\s*-\s+/.test(l));
        if (/^#{1,6}\s+/.test(block)) {
          const heading = block.replace(/^#{1,6}\s+/, "");
          return (
            <p key={i} style={{ margin: "14px 0 0", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: ".02em", color: textColor }}>
              {inlineMd(heading, `h${i}`)}
            </p>
          );
        }
        if (isList) {
          return (
            <ul key={i} style={{ margin: "10px 0 0", paddingLeft: 20, color: textColor }}>
              {lines.map((l, j) => (
                <li key={j} style={{ marginTop: j === 0 ? 0 : 4, lineHeight: 1.6 }}>
                  {inlineMd(l.replace(/^\s*-\s+/, ""), `li${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: "10px 0 0", lineHeight: 1.6, color: textColor }}>
            {inlineMd(block, `p${i}`)}
          </p>
        );
      })}
    </>
  );
}

function PackView({ pack, onDownloadPDF, emailDone }: { pack: AssetPack; onDownloadPDF: () => void; emailDone: boolean }) {
  const copy = (text: string) => {
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.1, color: INK }}>
        {pack.headline}
      </h3>

      {/* How to use this pack */}
      <div style={{ marginTop: 16, border: `1px solid ${INK}`, background: PAPER }}>
        <div style={{ padding: "14px 20px 0" }}>
          <SCaps size={10.5} ls="0.18em" color={INK}>How to use this pack</SCaps>
        </div>
        <div className="siq-detail-cols" style={{ padding: "12px 20px 18px", gap: 0 }}>
          {/* Path A — with EMOS & SIA tools */}
          <div style={{ paddingRight: 20, borderRight: `1px solid ${INK15}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Pill size={8} ls="0.14em">Recommended</Pill>
              <SCaps size={9} ls="0.14em" color={INK}>With EMOS &amp; SIA tools</SCaps>
            </div>
            {([
              ["01", "Score the pitch angle in PressIQ before you send it"],
              ["02", "Use the journalist shortlist in this pack, personalise your outreach to each one before sending"],
              ["03", "Build the linkable asset using the EMOS playbook and cadence"],
              ["04", "Run the full earned-media play: EMOS handles the system around it"],
            ] as [string, string][]).map(([n, t]) => (
              <div key={n} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "baseline" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1, borderBottom: `2px solid ${YEL}`, paddingBottom: 1, flexShrink: 0 }}>{n}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Path B — going solo */}
          <div style={{ paddingLeft: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <SCaps size={9} ls="0.14em" color={INK55}>Going solo</SCaps>
            </div>
            {([
              ["01", "Use the data brief as your research base: cite the numbers directly"],
              ["02", "Personalise the pitch angle for each journalist and outlet you contact"],
              ["03", "Build the linkable asset on your site before you pitch: give them something to link to"],
              ["04", "Verify every caution and fact-check the sources before sending anything"],
            ] as [string, string][]).map(([n, t]) => (
              <div key={n} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "baseline" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK55, lineHeight: 1, paddingBottom: 1, flexShrink: 0 }}>{n}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data brief */}
      <div style={{ marginTop: 18, padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <SCaps size={10} ls="0.16em" color={INK}>Data brief</SCaps>
        <div style={{ fontFamily: SERIF, fontSize: 15.5 }}>
          <MarkdownLite text={pack.brief} textColor={INK70} />
        </div>
      </div>

      {/* Pitch angle */}
      <div style={{ marginTop: 16, padding: "18px 20px", border: `1px solid ${INK}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <SCaps size={10} ls="0.16em" color={INK}>Pitch angle</SCaps>
          <button onClick={() => copy(pack.angle)} className="siq-back">Copy</button>
        </div>
        <p style={{ margin: "6px 0 0", fontFamily: GROT, fontSize: 11, letterSpacing: ".03em", color: INK55 }}>
          Subject: {pack.subjectLine}
        </p>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}>
          {pack.angle}
        </p>
        <a href="/tools/pressiq" className="siq-cross-link">
          Score this pitch in PressIQ →
        </a>
      </div>

      {/* Linkable asset idea */}
      <div style={{ marginTop: 16, padding: "16px 20px", borderLeft: `3px solid ${YEL}`, background: hexA(YEL, 0.08) }}>
        <SCaps size={10} ls="0.16em" color={INK}>Linkable asset to build</SCaps>
        <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK }}>
          {pack.linkableAssetIdea}
        </p>
      </div>

      {/* Signal chart */}
      {pack.chart && (
        <div style={{ marginTop: 16, padding: "16px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <SCaps size={10} ls="0.16em" color={INK}>{pack.chart.title}</SCaps>
          <div style={{ marginTop: 12 }}>
            {pack.chart.points.map((pt, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: ".04em", color: INK70 }}>{pt.x}</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12.5, color: INK }}>{pt.y}</span>
                </div>
                <div style={{ height: 7, background: PAPER, border: `1px solid ${INK15}` }}>
                  <div style={{ height: "100%", width: `${pt.y}%`, background: BLUE, transition: "width .5s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
            {pack.chart.caption}
          </p>
        </div>
      )}

      {/* Journalists */}
      {pack.journalists.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SCaps size={10} ls="0.16em" color={INK}>Who to pitch</SCaps>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {pack.journalists.map((j, i) => (
              <div key={i} style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "12px 14px" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: INK }}>{j.name}</div>
                <div style={{ fontFamily: GROT, fontSize: 10, letterSpacing: ".04em", color: INK55, margin: "2px 0 6px" }}>
                  {j.outlet} · {j.beat}
                </div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: INK70 }}>{j.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cautions */}
      {pack.cautions.length > 0 && (
        <div style={{ marginTop: 16, padding: "14px 18px", border: `1px solid ${AMBER}`, background: hexA(AMBER, 0.08) }}>
          <SCaps size={10} ls="0.16em" color={INK}>Before you pitch: verify</SCaps>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {pack.cautions.map((ct, i) => (
              <li key={i} style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, marginBottom: 4 }}>{ct}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources — live data callout (trust differentiator) */}
      <div style={{ marginTop: 16, border: `1px solid ${INK}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <SCaps size={10} ls="0.16em" color={INK}>Sources</SCaps>
          <Pill size={8} ls="0.14em">Live · Primary data</Pill>
        </div>
        <p style={{ margin: "8px 0 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.5 }}>
          Every signal below comes from a live, open, primary-source database,
          not stale training data. No hallucinated citations. Click through to verify.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 10, borderTop: `1px solid ${INK15}` }}>
          {pack.sources.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: INK35, flexShrink: 0 }}>
                Live
              </span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, textDecoration: "underline", textDecorationColor: INK35 }}
              >
                {s.label} ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* PDF download — first click opens a one-step email unlock, same pattern as PressIQ */}
      <div style={{ marginTop: 20, padding: "16px 20px", border: `1px solid ${INK15}`, background: PAPER2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <SCaps size={10} ls="0.14em" color={INK}>Download full report</SCaps>
          <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.4 }}>
            PDF covering all three steps: opportunities, asset pack, sources, and pitch angle.
            {!emailDone && " First download asks for your email — one step, then it's yours."}
          </p>
        </div>
        <button
          onClick={onDownloadPDF}
          className="siq-scan-btn"
          style={{ fontSize: 12, padding: "12px 22px", whiteSpace: "nowrap" }}
        >
          Download PDF →
        </button>
      </div>
    </div>
  );
}

// ── email gate ────────────────────────────────────────────────────────────────

function EmailGate({
  email,
  setEmail,
  done,
  onUnlock,
}: {
  email: string;
  setEmail: (v: string) => void;
  done: boolean;
  onUnlock: (e: React.FormEvent) => void;
}) {
  if (done) {
    return (
      <div style={{ padding: "14px 20px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.06), fontFamily: SERIF, fontSize: 14.5, color: INK }}>
        ✓ Unlocked, {EMAIL_SCANS} scans a month. Check your inbox.
      </div>
    );
  }
  return (
    <form onSubmit={onUnlock} style={{ padding: "18px 20px", border: `1px solid ${INK}`, background: PAPER2 }}>
      <SCaps size={10} ls="0.16em" color={INK}>Unlock more scans &amp; packs</SCaps>
      <p style={{ margin: "6px 0 10px", fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
        Add your email for {EMAIL_SCANS} scans/month and SIA&rsquo;s earned-media playbooks.
        One list, unsubscribe anytime.
      </p>
      <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, lineHeight: 1.5, borderLeft: `2px solid ${YEL}`, paddingLeft: 10 }}>
        Enterprise media tools (Cision, Meltwater) run $15,000&ndash;$40,000 a year for contacts and monitoring. The story-discovery layer they don&rsquo;t have is free here.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="siq-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <button type="submit" className="siq-scan-btn" style={{ fontSize: 12 }}>
          Unlock →
        </button>
      </div>
    </form>
  );
}

// ── PDF download gate (modal) ───────────────────────────────────────────────
// Same pattern as PressIQ: clicking "Download PDF" always works. The first
// click opens this one-step modal (report preview + a single email field);
// submitting unlocks and downloads immediately, no separate box to go hunt for.
function PdfDownloadGate({
  show,
  onClose,
  email,
  setEmail,
  submitting,
  onSubmit,
  opp,
  pack,
}: {
  show: boolean;
  onClose: () => void;
  email: string;
  setEmail: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  opp: Opportunity | null;
  pack: AssetPack | null;
}) {
  if (!show) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div role="dialog" aria-modal="true" aria-label="Download your SignalIQ report" style={{ background: PAPER2, border: `1px solid ${INK}`, maxWidth: 480, width: "100%", overflow: "hidden" }}>
        {/* Preview header */}
        <div style={{ background: INK, padding: "24px 28px" }}>
          <div style={{ fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".20em", textTransform: "uppercase", color: YEL, marginBottom: 10 }}>
            SignalIQ · Asset Pack Report
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.3, color: PAPER, marginBottom: 4 }}>
            {opp?.headline ?? pack?.headline ?? "Your asset pack"}
          </div>
          {opp && (
            <div style={{ fontFamily: GROT, fontSize: 10, letterSpacing: ".08em", color: "rgba(241,235,222,.55)" }}>
              {opp.bandLabel} · {opp.score}/100
            </div>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Radar Results", "Selected Opportunity", "Asset Pack", "Sources"].map((s) => (
              <span key={s} style={{ padding: "3px 8px", border: "1px solid rgba(250,250,250,.15)", fontFamily: MONO, fontSize: 7.5, color: "rgba(241,235,222,.4)", letterSpacing: ".10em", textTransform: "uppercase" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px 28px" }}>
          {submitting ? (
            <div style={{ textAlign: "center", padding: "16px 0", fontFamily: SERIF, fontSize: 16, color: GREEN, fontWeight: 600 }}>
              ✓ Generating your PDF…
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: INK, marginBottom: 6, letterSpacing: "-.015em" }}>
                One step to download
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK55, marginBottom: 16, lineHeight: 1.55 }}>
                Add your email to unlock this PDF, plus {EMAIL_SCANS} scans/month and SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="siq-input"
                  style={{ flex: 1, minWidth: 200 }}
                />
                <button type="submit" className="siq-scan-btn" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  Unlock &amp; download →
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ marginTop: 12, background: "none", border: "none", padding: 0, fontFamily: GROT, fontSize: 10.5, letterSpacing: ".06em", color: INK35, cursor: "pointer", textDecoration: "underline" }}
              >
                Not now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── detail view ───────────────────────────────────────────────────────────────

// Stage 4 — the Angle: why SignalIQ flagged this one opportunity.
function AngleView({ opp }: { opp: Opportunity }) {
  const c = bandColor(opp.band);
  const whyTag: React.CSSProperties = { flexShrink: 0, width: 48, paddingTop: 1, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: INK35 };
  return (
    <section style={{ padding: "18px clamp(22px,5vw,56px) 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ margin: "0 0 14px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
          Step 4 of 5 · the angle
        </p>

        {/* Opportunity header */}
        <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
          <ScoreRing score={opp.score} color={c} size={110} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: c,
                border: `1px solid ${hexA(c, 0.4)}`,
                background: hexA(c, 0.08), padding: "2px 7px",
              }}>
                {opp.bandLabel}
              </span>
              <InfoTooltip text={BAND_TOOLTIP[opp.band]} />
              <span style={{ fontFamily: MONO, fontSize: 8, color: INK55, letterSpacing: ".10em", textTransform: "uppercase" }}>
                · {BEATS.find((b) => b.id === opp.beat)?.label ?? opp.beat}
              </span>
            </span>
            <h2 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.5vw,38px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>
              {opp.headline}
            </h2>
          </div>
        </div>

        {/* Why now / Why you */}
        <div style={{ maxWidth: 540, marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={whyTag}>Why&nbsp;now</span>
            <div style={{ flex: 1 }}><GapBar opp={opp} /></div>
          </div>
          {opp.fit && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={whyTag}>Why&nbsp;you</span>
              <span style={{ fontFamily: GROT, fontSize: 12, color: INK70 }}>
                Fit for your startup:{" "}
                <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: opp.fit === "high" ? GREEN : opp.fit === "medium" ? AMBER : RED }}>
                  {opp.fit === "high" ? "High" : opp.fit === "medium" ? "Medium" : "Low"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* § 01 — Why SignalIQ flagged this */}
        <div style={{ marginTop: 28 }}>
          <SectionMast n="01" label="Why SignalIQ flagged this" />
          <div className="siq-detail-cols">
            <ScorePanel opp={opp} />
            <ReceiptsPanel opp={opp} />
          </div>
        </div>

        <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>
          A lead/whitespace score: how far ahead of the coverage you are. Not a prediction the story breaks.
        </p>
      </div>
    </section>
  );
}

// Stage 5 — the generated Asset Pack for the chosen opportunity.
function PackStage({
  opp,
  pack,
  packing,
  packError,
  onRetry,
  email,
  setEmail,
  emailDone,
  unlockEmail,
  onDownloadPDF,
}: {
  opp: Opportunity;
  pack: AssetPack | null;
  packing: boolean;
  packError: string | null;
  onRetry: () => void;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  unlockEmail: (e: React.FormEvent) => void;
  onDownloadPDF: () => void;
}) {
  return (
    <section style={{ padding: "18px clamp(22px,5vw,56px) 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ margin: "0 0 6px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
          Step 5 of 5 · your asset pack
        </p>
        <h2 style={{ margin: "0 0 4px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px,2.6vw,28px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: INK }}>
          {opp.headline}
        </h2>

        <div style={{ marginTop: 20 }}>
          <SectionMast n="02" label="Your asset pack" />
          {packing && (
            <div style={{ padding: 30, textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
              Building your asset pack: brief, pitch angle, and reporter desks…
            </div>
          )}
          {packError && !packing && (
            <div style={{ padding: "16px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
              {packError}{" "}
              <button onClick={onRetry} className="siq-back" style={{ marginLeft: 8 }}>
                Retry →
              </button>
            </div>
          )}
          {pack && !packing && <PackView pack={pack} emailDone={emailDone} onDownloadPDF={onDownloadPDF} />}
        </div>

        {/* Email gate — primary CTA */}
        <div style={{ marginTop: 32 }}>
          <EmailGate email={email} setEmail={setEmail} done={emailDone} onUnlock={unlockEmail} />
        </div>

        {/* EMOS pitch — fires once the user has their asset pack in hand,
            same "where this fits" pattern shared with PressIQ/CoverageIQ. */}
        <EmosCTAStrip
          toolName={PRODUCT}
          heading={
            <>
              {PRODUCT} finds the story.<br />
              <span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> turns it into coverage.
            </>
          }
          pitch={
            <>
              {PRODUCT} powers two of the three EMOS pillars:{" "}
              <strong style={{ color: PAPER }}>Authority Assets</strong> and{" "}
              <strong style={{ color: PAPER }}>Proactive PR</strong>. The full Earned Media
              Operating System gives your team the playbooks, journalist system, and
              guarantee to earn coverage in-house.
            </>
          }
          applyHref={EMOS_URL}
          applyLabel="Explore EMOS"
          hideExplore
        />
      </div>
    </section>
  );
}

// ── wizard chrome (stepper + footer, JCIQ pattern in SignalIQ tokens) ──────────

const WIZ_STEPS = ["Beat", "Context", "Radar", "Angle", "Pack"] as const;
type WizStage = 1 | 2 | 3 | 4 | 5;

function SiqWizardProgress({ stage, onGoStage }: { stage: WizStage; onGoStage: (n: WizStage) => void }) {
  return (
    <div style={{ background: DARK, borderBottom: `1px solid ${DARK_BD}`, position: "sticky", top: 52, zIndex: 49, padding: "10px clamp(20px,4vw,28px) 12px" }}>
      <div style={{ height: 2, background: "rgba(241,235,222,.14)", marginBottom: 12 }}>
        <div style={{ height: "100%", background: YEL, width: `${(stage / 5) * 100}%`, transition: "width .5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        {WIZ_STEPS.map((label, i) => {
          const n = (i + 1) as WizStage;
          const active = n === stage, done = n < stage, reachable = n <= stage;
          return (
            <button
              key={label}
              onClick={() => { if (reachable) onGoStage(n); }}
              disabled={!reachable}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: reachable ? "pointer" : "default" }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: MONO, fontWeight: 700, fontSize: 10,
                background: active ? YEL : done ? "rgba(245,184,31,.18)" : "transparent",
                color: active ? INK : done ? YEL : "rgba(241,235,222,.55)",
                border: `1px solid ${active ? YEL : done ? "rgba(245,184,31,.4)" : "rgba(241,235,222,.28)"}`,
              }}>
                {done ? "✓" : n}
              </span>
              <span className="siq-wiz-label" style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
                color: active ? "rgba(241,235,222,.95)" : done ? "rgba(241,235,222,.55)" : "rgba(241,235,222,.35)",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SiqWizardFooter({ stage, onBack, onNext, nextLabel, nextDisabled = false, onSkip }: {
  stage: WizStage;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
}) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: DARK, borderTop: `1px solid ${DARK_BD}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px clamp(20px,4vw,28px)", zIndex: 60 }}>
      <button onClick={onBack} className="siq-wiz-ghost">{stage === 1 ? "← Landing" : "← Back"}</button>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(241,235,222,.55)", letterSpacing: ".08em" }}>{stage} of 5</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onSkip && <button onClick={onSkip} className="siq-wiz-link">Skip →</button>}
        <button onClick={onNext} disabled={nextDisabled} className="siq-wiz-next">{nextLabel}</button>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function SignalIQPage() {
  // Ordered beat selection (primary first), length 1–3. All tiers are free.
  const [beats, setBeats] = useState<BeatId[]>(["saas"]);
  const beat = beats[0]; // derived primary — used for the PDF label etc.
  const [companyContext, setCompanyContext] = useState("");
  // Persist the chosen beat(s) (a preference) across reloads. companyContext is the
  // user's actual free-text input, not a preference — restoring it made every
  // fresh visit reopen with stale company context from a previous session, so
  // it's intentionally excluded here (same fix applied to PressIQ's pitch/beat).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem("signaliq_v1_input");
      if (raw) {
        const d = JSON.parse(raw) as { beat?: string; beats?: string[] };
        // New multi-beat shape first; fall back to the legacy single `beat`.
        const source = Array.isArray(d.beats) ? d.beats : typeof d.beat === "string" ? [d.beat] : [];
        const valid: BeatId[] = [];
        const seen = new Set<string>();
        for (const b of source) {
          if (typeof b === "string" && BEATS.some((x) => x.id === b) && !seen.has(b)) {
            seen.add(b);
            valid.push(b as BeatId);
          }
          if (valid.length >= 3) break;
        }
        if (valid.length) setBeats(valid);
      }
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    try { localStorage.setItem("signaliq_v1_input", JSON.stringify({ beats })); } catch { /* ignore */ }
  }, [beats]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [packing, setPacking] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [pack, setPack] = useState<AssetPack | null>(null);

  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [showPdfGate, setShowPdfGate] = useState(false);
  const [pdfGateSubmitting, setPdfGateSubmitting] = useState(false);

  // Cloudflare Turnstile (same hardened pattern as JournoCollabIQ: token ref
  // for async reads, expired-callback auto-reset, waitForToken before calls)
  const turnstileTokenRef = useRef("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const setToken = (tok: string) => { turnstileTokenRef.current = tok; };

  // Render is retried whenever the conditionally-mounted container appears.
  // The old run-once effect fired while the intro screen was still up, found
  // no container, and never tried again — so no token was ever issued and
  // every scan 403'd once server-side verification was enabled.
  function tryRenderTurnstile() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!TURNSTILE_SITE_KEY || !w.turnstile || !turnstileRef.current || turnstileWidgetId.current) return;
    turnstileWidgetId.current = w.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token: string) => setToken(token),
      // Token expired mid-session — reset so the managed widget re-solves.
      "expired-callback": () => {
        setToken("");
        try { if (turnstileWidgetId.current) w.turnstile.reset(turnstileWidgetId.current); } catch { /* noop */ }
      },
      "error-callback": () => setToken(""),
    });
  }

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).turnstile) { tryRenderTurnstile(); return; }
    const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let s = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
    if (!s) {
      s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
    const onLoad = () => tryRenderTurnstile();
    s.addEventListener("load", onLoad);
    return () => { s?.removeEventListener("load", onLoad); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turnstile tokens are single-use — refresh after every API call.
  function resetTurnstile() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (TURNSTILE_SITE_KEY && turnstileWidgetId.current && w.turnstile) {
      w.turnstile.reset(turnstileWidgetId.current);
      setToken("");
    }
  }

  // Wait (briefly) for a valid token before hitting the API. If the current
  // token is gone (expired/consumed), reset the widget — the managed flow
  // usually re-solves without user interaction — and poll for the new token.
  async function waitForToken(ms = 8000): Promise<string> {
    if (!TURNSTILE_SITE_KEY) return "";
    if (turnstileTokenRef.current) return turnstileTokenRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (turnstileWidgetId.current && w.turnstile) {
      try { w.turnstile.reset(turnstileWidgetId.current); } catch { /* noop */ }
    }
    // waitForToken only runs inside async event handlers (scan/pack), never
    // during render, so these clock reads are not a render-purity concern.
    // eslint-disable-next-line react-hooks/purity
    const t0 = Date.now();
    // eslint-disable-next-line react-hooks/purity
    while (Date.now() - t0 < ms) {
      await new Promise(r => setTimeout(r, 250));
      if (turnstileTokenRef.current) return turnstileTokenRef.current;
    }
    return "";
  }

  // Step 0: intro/landing screen (click-through before step 1)
  // Explicit wizard stage — 0 = intro/landing, 1..5 = Beat/Context/Radar/Angle/Pack
  const [stage, setStage] = useState<0 | WizStage>(0);

  const scrollTop = () => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Turnstile widget mounts across the wizard (stages 1-5) and tears down on the
  // intro so it renders cleanly next time. It must stay mounted before the scan
  // (stage 2→3) and pack (stage 4→5) calls, or no token is ever issued.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (stage === 0) {
      if (turnstileWidgetId.current && w.turnstile) {
        try { w.turnstile.remove(turnstileWidgetId.current); } catch { /* noop */ }
        turnstileWidgetId.current = null;
        setToken("");
      }
      return;
    }
    tryRenderTurnstile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Whether the scan was personalised (context provided) — drives result copy.
  const usedContext = !!companyContext.trim();

  // Option 3: re-rank opportunities by relevance to company context (client-side, instant)
  const rankedOpps = useMemo(() => {
    if (!scan) return [];
    if (!companyContext.trim()) return scan.opportunities;
    const words = companyContext
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 40);
    if (words.length === 0) return scan.opportunities;
    return [...scan.opportunities]
      .map((opp) => {
        const haystack = [
          opp.headline,
          ...opp.signals.map((s) => s.title),
          ...opp.signals.map((s) => s.detail ?? ""),
        ].join(" ").toLowerCase();
        const matches = words.filter((w) => haystack.includes(w)).length;
        return { opp, adjusted: opp.score + matches * 8 };
      })
      .sort((a, b) => b.adjusted - a.adjusted)
      .map((s) => s.opp);
  }, [scan, companyContext]);

  // ── wizard navigation ──────────────────────────────────────────────────────
  function goStage(n: WizStage) {
    if (n <= 3) { setSelected(null); setPack(null); setPackError(null); }
    setStage(n);
    scrollTop();
  }
  function goBack() {
    if (stage === 1) { setStage(0); scrollTop(); return; }  // Beat → landing
    goStage((stage - 1) as WizStage);
  }
  async function goNext() {
    if (stage === 1) { setStage(2); scrollTop(); return; }
    if (stage === 2) { setStage(3); scrollTop(); await runScan(); return; }   // context-before-scan
    if (stage === 3) { if (selected) { setStage(4); scrollTop(); } return; }
    if (stage === 4) { if (selected) { setStage(5); scrollTop(); await generatePack(selected); } return; }
    if (stage === 5) { startOver(); return; }
  }
  function startOver() {
    setSelected(null); setPack(null); setPackError(null); setScan(null); setScanError(null);
    setStage(1); scrollTop();
  }
  // Radar card actions: inspect → Angle (stage 4); Generate → straight to Pack (stage 5).
  function pickForAngle(opp: Opportunity) { setSelected(opp); setStage(4); scrollTop(); }
  function pickForPack(opp: Opportunity) { setSelected(opp); setStage(5); scrollTop(); generatePack(opp); }

  // Single scan — always includes context when provided (context-before-scan),
  // so there's only ever one /scan call per run (no generic-then-personalise
  // double hit against quota).
  async function runScan(ctxOverride?: string) {
    const ctx = (ctxOverride !== undefined ? ctxOverride : companyContext).trim();
    setScanError(null);
    setScanning(true);
    setScan(null);
    setSelected(null);
    setPack(null);
    try {
      const res = await fetch("/api/signaliq/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beats, companyContext: ctx || undefined, turnstileToken: (await waitForToken()) || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setScanError(data.error || "Scan failed.");
      else setScan(data as ScanResponse);
    } catch {
      setScanError("Network error. Please try again.");
    } finally {
      setScanning(false);
      resetTurnstile();
    }
  }

  async function generatePack(opp: Opportunity) {
    setSelected(opp);
    setPack(null);
    setPackError(null);
    setPacking(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch("/api/signaliq/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp, store: true, companyContext: companyContext.trim() || undefined, turnstileToken: (await waitForToken()) || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setPackError(data.error || "Could not generate the pack.");
      else setPack(data as AssetPack);
    } catch {
      setPackError("Network error. Please try again.");
    } finally {
      setPacking(false);
      resetTurnstile();
    }
  }

  // Actually builds + saves the PDF. Assumes the email gate has already
  // cleared — call downloadPDF() (below) from UI, not this directly.
  function generateAndDownloadPDF() {
    if (!selected || !pack) return;
    const JsPDF = getJsPDF();
    if (!JsPDF) { alert("PDF library still loading — try again in a moment."); return; }
    try {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      buildSignalIqReport(doc, {
        beatLabel: beats.map((id) => BEATS.find((b) => b.id === id)?.label ?? String(id)).join(" + "),
        companyContext: companyContext.trim(),
        opportunities: scan?.opportunities ?? [],
        selected,
        pack,
        generatedAt: scan?.generatedAt ?? new Date().toISOString(),
      });
      doc.save(`signaliq-report-${Date.now()}.pdf`);
    } catch {
      alert("Could not generate the PDF. Please try again.");
    }
  }

  // Download button handler (PressIQ pattern): always clickable. First click,
  // pre-email, opens the one-step gate modal instead of a disabled state.
  function downloadPDF() {
    if (!selected || !pack) return;
    if (!emailDone) { setShowPdfGate(true); return; }
    generateAndDownloadPDF();
  }

  async function unlockEmail(e: React.FormEvent): Promise<boolean> {
    e.preventDefault();
    if (!email) return false;
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!data.success) {
        // Surface the error so the user knows something went wrong
        alert(data.error || "Subscription failed. Please try again.");
        return false;
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
      return false;
    }
    // H7 (2026-07-02 review): the tier cookie is HMAC-signed server-side.
    // Setting it via document.cookie produced an unsigned value that fails
    // verifyTier() once PITCH_TIER_SECRET is set — use the same endpoint
    // PressIQ uses, which sets the signed, httpOnly cookie.
    try {
      await fetch("/api/pitch-tier", { method: "POST" });
    } catch { /* non-fatal — the subscribe succeeded; tier just won't unlock this session */ }
    setEmailDone(true);
    return true;
  }

  async function handlePdfGateSubmit(e: React.FormEvent) {
    setPdfGateSubmitting(true);
    const ok = await unlockEmail(e);
    if (!ok) { setPdfGateSubmitting(false); return; }
    setTimeout(() => {
      setShowPdfGate(false);
      setPdfGateSubmitting(false);
      generateAndDownloadPDF();
    }, 500);
  }

  const footerNextLabel =
    stage === 1 ? "Next: your context →" :
    stage === 2 ? (companyContext.trim() ? "Scan with my context →" : "Scan →") :
    stage === 3 ? (selected ? "View the angle →" : "Pick an opportunity") :
    stage === 4 ? "Generate asset pack →" :
    stage === 5 ? "Start over ↻" : "Next →";
  const footerNextDisabled = (stage === 3 && !selected) || scanning || packing;

  return (
    <>
      <style>{PAGE_CSS}</style>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <ToolHeader
        toolPrefix="Signal"
        subtitle="Story Radar"
        rightContent={
          <>
            <Link href="/tools/signaliq/how-it-works" target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none", whiteSpace: "nowrap" }}>
              How it works →
            </Link>
            <span className="siq-hide-sm" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              syedirfanajmal.com
            </span>
          </>
        }
      />
      {stage > 0 && <SiqWizardProgress stage={stage as WizStage} onGoStage={goStage} />}

      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh", paddingBottom: stage > 0 ? 84 : 0 }}>

        {/* ── Stage 0: Intro / landing ───────────────────────────────────── */}
        {stage === 0 && (
          <>
            <SIQHero onStart={() => setStage(1)} />
            <div style={{ marginTop: 12 }}>
              <SourcesTicker />
            </div>
            <ProofStrip />
            <div style={{ textAlign: "center", padding: "clamp(20px,3vw,36px) clamp(22px,5vw,56px)" }}>
              <button
                onClick={() => setStage(1)}
                style={{
                  padding: "18px 52px", border: "none", background: YEL, color: INK,
                  fontFamily: GROT, fontWeight: 900, fontSize: 17, letterSpacing: ".10em",
                  textTransform: "uppercase", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(245,184,31,.35)",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Start scanning →
              </button>
              <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                {FREE_SCANS} free scans / month, or {EMAIL_SCANS} with your email · no API key needed
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 9, color: INK35, letterSpacing: ".10em" }}>
                <Link href="/tools/signaliq/about" style={{ color: INK35, textDecoration: "underline", textDecorationColor: INK15 }}>
                  About the data & methodology →
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ── Stage 1: Beat ──────────────────────────────────────────────── */}
        {stage === 1 && (
          <section style={{ padding: "0 0 40px" }}>
            <div style={{ padding: "24px clamp(22px,5vw,56px) 0" }}>
              <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 1 of 5 · pick your beat
              </p>
              <h2 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>
                Pick your <em style={{ fontStyle: "italic", fontWeight: 600 }}>beat.</em>
              </h2>
              <p style={{ margin: 0, maxWidth: 620, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.5 }}>
                Choose the vertical your <em>target journalists</em> cover — that&rsquo;s where filings, research and news actually discuss your space.
              </p>
            </div>
            <BeatPicker beats={beats} setBeats={(bs) => { setBeats(bs); setScan(null); setScanError(null); }} wizardMode />
          </section>
        )}

        {/* ── Stage 2: Context ───────────────────────────────────────────── */}
        {stage === 2 && (
          <section style={{ padding: "24px clamp(22px,5vw,56px) 40px" }}>
            <div style={{ maxWidth: 680 }}>
              <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 2 of 5 · optional
              </p>
              <h2 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>
                Tell us about your <em style={{ fontStyle: "italic", fontWeight: 600 }}>startup.</em>
              </h2>
              <p style={{ margin: "0 0 22px", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.5 }}>
                We expand this into company-specific topics and score every result by how well it fits you — then personalise your pitch pack. Or skip straight to the full radar.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                  Your startup context
                </label>
                <InfoTooltip text="Your context tailors the scan itself: we expand it into company-specific topics and score every result by how well it fits you, then personalise your pitch pack. Takes a few extra seconds." />
              </div>
              <textarea
                value={companyContext}
                onChange={e => setCompanyContext(e.target.value)}
                maxLength={400}
                rows={4}
                placeholder="e.g. 'We're a B2B SaaS helping SMBs access working capital. We have proprietary data on 10,000+ lending decisions. Our founder is a former Goldman analyst.'"
                style={{
                  width: "100%", boxSizing: "border-box",
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK,
                  background: PAPER2, border: `1px solid ${INK15}`,
                  padding: "14px 16px", resize: "vertical", outline: "none",
                  lineHeight: 1.6,
                }}
              />
              {companyContext.trim() && (
                <p style={{ margin: "4px 0 0", fontFamily: MONO, fontSize: 9, color: INK35, letterSpacing: ".06em" }}>
                  {companyContext.trim().length}/400
                </p>
              )}
              <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, borderLeft: `2px solid ${AMBER}`, paddingLeft: 10 }}>
                Works best when your company operates <em>inside</em> one of these beats (health, fintech, SaaS, AI, etc.). Service or agency businesses (e.g. a marketing/PR firm) will see thinner results.
              </p>
            </div>
          </section>
        )}

        {/* ── Stage 3: Radar ─────────────────────────────────────────────── */}
        {stage === 3 && (
          <section style={{ padding: "24px 0 40px" }}>
            <div style={{ padding: "0 clamp(22px,5vw,56px)" }}>
              <p style={{ margin: 0, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 3 of 5 · the radar
              </p>
            </div>

            {scanning && <ScanLoader />}

            {scanError && !scanning && (
              <div style={{ maxWidth: 620, margin: "20px auto 0", padding: "12px 14px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
                {scanError}
              </div>
            )}

            {!scanning && scan && scan.notes.length > 0 && (
              <p style={{ maxWidth: 620, margin: "18px auto 0", padding: "0 clamp(22px,5vw,56px)", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, textAlign: "center" }}>
                {scan.notes.join(" ")}
              </p>
            )}

            {!scanning && scan && scan.opportunities.length > 0 && (
              <div style={{ padding: "16px clamp(22px,5vw,56px) 0" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 0 12px", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <Pill size={10} ls="0.14em">Radar</Pill>
                      <SCaps size={11} ls="0.14em" color={INK}>
                        {scan.opportunities.length} opportunities · ranked by signal-vs-coverage
                        {usedContext && <span style={{ color: INK55 }}> · personalised to your startup</span>}
                      </SCaps>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <SCaps size={10} ls="0.14em" color={INK55}>
                        {scan.usage.remaining} scan{scan.usage.remaining === 1 ? "" : "s"} left this month
                      </SCaps>
                      <Link href="/tools/signaliq/about" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: INK35, textDecoration: "underline", textDecorationColor: INK15 }}>
                        About the data
                      </Link>
                    </div>
                  </div>
                  {/* Legend — explains the band + gap labels at the point of use */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingBottom: 12, fontFamily: MONO, fontSize: 9, letterSpacing: ".04em", color: INK55 }}>
                    <span style={{ fontWeight: 700, color: INK70, textTransform: "uppercase", letterSpacing: ".10em" }}>How to read this:</span>
                    <span><strong style={{ color: INK }}>Score</strong> = signal vs. press coverage · Hot ≥80 · Worth a look 60–79 · Early 40–59 · Noise/late &lt;40</span>
                    <span style={{ color: INK35 }}>|</span>
                    <span><strong style={{ color: INK }}>Coverage gap</strong> = how little press exists yet (Wide = your best pitch window)</span>
                    <span style={{ color: INK35 }}>|</span>
                    <span>Wide gap means under-covered, not well-substantiated — check signal count before pitching</span>
                    <Link href="/tools/signaliq/about" style={{ fontWeight: 700, color: INK70, textDecoration: "underline", textDecorationColor: INK15 }}>Full methodology →</Link>
                  </div>
                  <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                    Click any opportunity to see the angle, or jump straight to its asset pack.
                  </p>
                  <HRule style={{ marginBottom: 20 }} />
                </div>
                <div className="siq-results-wrap">
                  <div className="siq-cards-col">
                    <div className="siq-cards">
                      {rankedOpps.map((opp) => (
                        <OppCard key={opp.id} opp={opp} onSelect={() => pickForAngle(opp)} onGenerate={() => pickForPack(opp)} />
                      ))}
                    </div>
                    {/* Compact newsletter CTA — after results */}
                    {!emailDone && (
                      <form onSubmit={unlockEmail} style={{ marginTop: 28, maxWidth: 1100, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 18px", border: `1px solid ${INK15}`, background: PAPER2 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 14, color: INK70, flex: 1, minWidth: 220 }}>
                          Get <strong>{EMAIL_SCANS} scans/month</strong> (up from {FREE_SCANS}) + the full earned-media playbook — free.
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="siq-input"
                          style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                        />
                        <button type="submit" className="siq-scan-btn" style={{ fontSize: 12, padding: "12px 20px" }}>
                          Unlock →
                        </button>
                      </form>
                    )}
                    {emailDone && (
                      <div style={{ marginTop: 28, maxWidth: 1100, padding: "12px 18px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.05), fontFamily: SERIF, fontSize: 14, color: INK }}>
                        ✓ Unlocked, {EMAIL_SCANS} scans/month. Check your inbox.
                      </div>
                    )}
                  </div>
                  <SourcesSidebar />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Stage 4: Angle ─────────────────────────────────────────────── */}
        {stage === 4 && selected && <AngleView opp={selected} />}

        {/* ── Stage 5: Pack ──────────────────────────────────────────────── */}
        {stage === 5 && selected && (
          <PackStage
            opp={selected}
            pack={pack}
            packing={packing}
            packError={packError}
            onRetry={() => generatePack(selected)}
            email={email}
            setEmail={setEmail}
            emailDone={emailDone}
            unlockEmail={unlockEmail}
            onDownloadPDF={downloadPDF}
          />
        )}

        {/* Cloudflare Turnstile — docked in the page flow (not floating) so it
            never overlaps content on any screen size. Mounted across stages 1-5;
            managed widget solves on render. Bottom padding clears the fixed footer. */}
        {TURNSTILE_SITE_KEY && stage > 0 && (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 32px" }}>
            <div ref={turnstileRef} />
          </div>
        )}

        {stage === 0 && <ToolPipelineFooter currentTool="signaliq" />}
      </div>

      {stage > 0 && (
        <SiqWizardFooter
          stage={stage as WizStage}
          onBack={goBack}
          onNext={goNext}
          nextLabel={footerNextLabel}
          nextDisabled={footerNextDisabled}
          onSkip={stage === 2 ? () => { setCompanyContext(""); setStage(3); scrollTop(); runScan(""); } : undefined}
        />
      )}

      <PdfDownloadGate
        show={showPdfGate}
        onClose={() => setShowPdfGate(false)}
        email={email}
        setEmail={setEmail}
        submitting={pdfGateSubmitting}
        onSubmit={handlePdfGateSubmit}
        opp={selected}
        pack={pack}
      />
    </>
  );
}

// ── scoped CSS ────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  /* layout */
  .siq-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .siq-detail-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* step bar */
  .siq-step-bar {
    display: flex;
    background: ${PAPER};
    border-bottom: 1px solid ${INK15};
    position: sticky;
    top: 52px;
    z-index: 50;
  }
  .siq-step {
    flex: 1;
    padding: 12px 22px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 9.5px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: rgba(26,20,16,.3);
    cursor: default;
    transition: color 0.12s ease, border-color 0.12s ease;
  }
  .siq-step.active {
    color: ${INK};
    border-bottom-color: ${INK};
  }
  .siq-step.past {
    color: ${INK55};
    cursor: pointer;
  }
  .siq-step.past:hover { color: ${INK}; }
  .siq-step-no {
    font-family: ${SERIF};
    font-style: italic;
    opacity: 0.6;
  }

  /* hero headline */
  .siq-h1 {
    margin: 0;
    font-family: ${SERIF};
    font-weight: 700;
    font-size: clamp(28px,4.5vw,54px);
    line-height: 0.96;
    letter-spacing: -0.03em;
    color: ${INK};
  }

  /* beat tabs — 2-row grid (3 per row) */
  .siq-beat-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid ${INK15};
  }
  .siq-tab {
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-right: 1px solid ${INK15};
    border-bottom: 1px solid ${INK15};
    font-family: ${GROT};
    font-weight: 700;
    font-size: 10px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(26,20,16,.45);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    white-space: nowrap;
  }
  .siq-tab:nth-child(3n)       { border-right: none; }
  /* 7 beats in a 3-col grid: the 7th (Agency) spans the full last row so there's
     no dangling half-row. Bottom border only comes off the very last tab. */
  .siq-tab:nth-child(7)        { grid-column: 1 / -1; border-right: none; }
  .siq-tab:last-child          { border-bottom: none; }
  .siq-tab.active { background: ${INK}; color: ${PAPER}; }
  .siq-tab-no {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 10px;
    opacity: 0.6;
    margin-right: 4px;
  }

  /* multi-beat: secondary / tertiary controls (progressive disclosure) */
  .siq-multibeat {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    margin-top: 14px;
  }
  .siq-addbeat {
    background: transparent;
    border: 1px dashed ${INK15};
    padding: 7px 12px;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 10px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: ${INK55};
    cursor: pointer;
    transition: color 0.12s ease, border-color 0.12s ease;
  }
  .siq-addbeat:hover { color: ${INK}; border-color: ${INK}; }
  .siq-addbeat-opt { opacity: 0.6; font-weight: 600; }
  .siq-beatrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid ${INK15};
    padding: 5px 6px 5px 10px;
  }
  .siq-beatrow-lbl {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8.5px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK55};
  }
  .siq-beatsel {
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    color: ${INK};
    background: ${PAPER};
    border: 1px solid ${INK15};
    padding: 5px 8px;
    cursor: pointer;
    outline: none;
  }
  .siq-beatx {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    font-size: 16px;
    line-height: 1;
    color: ${INK55};
    cursor: pointer;
    transition: color 0.12s ease;
  }
  .siq-beatx:hover { color: ${RED}; }

  /* scan button */
  .siq-scan-btn {
    padding: 14px 28px;
    border: none;
    background: ${INK};
    color: ${PAPER};
    font-family: ${GROT};
    font-weight: 800;
    font-size: 14px;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.12s ease;
  }
  .siq-scan-btn:hover:not(:disabled) { opacity: 0.85; }
  .siq-scan-btn:disabled {
    background: rgba(26,20,16,.15);
    color: ${INK55};
    cursor: wait;
  }

  /* opportunity card */
  .siq-card {
    border: 1px solid ${INK15};
    display: flex;
    flex-direction: column;
  }
  .siq-card-click { cursor: pointer; transition: border-color .12s ease, transform .12s ease, box-shadow .12s ease; }
  .siq-card-click:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(26,20,16,.08); }

  /* wizard footer buttons */
  .siq-wiz-ghost {
    background: transparent; border: 1px solid rgba(241,235,222,.3); color: rgba(241,235,222,.9);
    font-family: ${GROT}; font-weight: 700; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    padding: 10px 20px; cursor: pointer; transition: opacity .12s ease;
  }
  .siq-wiz-ghost:hover:not(:disabled) { opacity: .8; }
  .siq-wiz-ghost:disabled { opacity: .3; cursor: default; }
  .siq-wiz-link {
    background: transparent; border: none; color: rgba(241,235,222,.55);
    font-family: ${GROT}; font-weight: 700; font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    padding: 10px 12px; cursor: pointer; text-decoration: underline;
  }
  .siq-wiz-link:hover { color: rgba(241,235,222,.85); }
  .siq-wiz-next {
    background: ${YEL}; border: none; color: ${INK};
    font-family: ${GROT}; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    padding: 11px 26px; cursor: pointer; transition: opacity .12s ease;
  }
  .siq-wiz-next:hover:not(:disabled) { opacity: .85; }
  .siq-wiz-next:disabled { opacity: .4; cursor: default; }
  @media (max-width: 560px) { .siq-wiz-label { display: none; } }
  .siq-card-head {
    background: ${INK};
    padding: 12px 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .siq-card-body {
    background: ${PAPER2};
    padding: 14px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .siq-gen-btn {
    margin: 0 16px 16px;
    padding: 11px 14px;
    border: none;
    background: ${INK};
    color: ${PAPER};
    font-family: ${GROT};
    font-weight: 800;
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.12s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .siq-gen-sub {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(241,235,222,.55);
  }
  .siq-gen-btn:hover { opacity: 0.85; }

  /* source chips */
  .siq-chip {
    font-family: ${GROT};
    font-weight: 700;
    font-size: 9.5px;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: ${INK55};
    text-decoration: none;
    border: 1px solid ${INK15};
    padding: 3px 7px;
    background: ${PAPER};
    transition: border-color 0.12s ease, color 0.12s ease;
  }
  .siq-chip:hover { border-color: ${INK35}; color: ${INK}; }

  /* back / copy button */
  .siq-back {
    background: none;
    border: none;
    cursor: pointer;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: ${INK};
    transition: opacity 0.12s ease;
    padding: 0;
  }
  .siq-back:hover { opacity: 0.65; }

  /* cross-tool link */
  .siq-cross-link {
    display: inline-block;
    margin-top: 12px;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: ${INK};
    text-decoration: underline;
    text-decoration-color: ${INK35};
  }

  /* email input */
  .siq-input {
    background: ${PAPER};
    border: 1px solid ${INK};
    color: ${INK};
    font-family: ${SERIF};
    font-size: 15px;
    padding: 11px 13px;
    outline: none;
  }
  .siq-input:focus { border-color: ${YEL}; box-shadow: 0 0 0 2px rgba(245,184,31,.25); }

  /* hero 2-col grid */
  .siq-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(28px,4vw,56px);
    margin-top: 16px;
    align-items: start;
  }
  .siq-hero-panel {
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 20px 22px;
    position: relative;
  }

  /* responsive */
  @media (max-width: 860px) {
    .siq-hero-grid { grid-template-columns: 1fr; }
    .siq-hero-panel { display: none; }
  }
  @media (max-width: 720px) {
    .siq-detail-cols { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .siq-beat-tabs { grid-template-columns: repeat(2, 1fr); }
    /* 2-col recompute (bottom borders already correct from the desktop rules:
       only the last tab drops its bottom). The 7th tab stays full-width. */
    .siq-tab:nth-child(3n)        { border-right: 1px solid ${INK15}; }
    .siq-tab:nth-child(2n)        { border-right: none; }
    .siq-cards { grid-template-columns: 1fr; }
    .siq-step { padding: 10px 12px; font-size: 8.5px; }
    .siq-hide-sm { display: none; }
  }

  /* ── wire-feed ticker ───────────────────────────────────────────── */
  .siq-ticker-wrap {
    display: flex;
    align-items: stretch;
    background: ${DARK};
    border-bottom: 1px solid ${DARK_BD};
    overflow: hidden;
    height: 42px;
  }
  .siq-ticker-label {
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-right: 1px solid rgba(241,235,222,.08);
    flex-shrink: 0;
    background: rgba(241,235,222,.03);
  }
  .siq-ticker-overflow {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }
  @keyframes siq-crawl {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .siq-ticker-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: siq-crawl 110s linear infinite;
    white-space: nowrap;
  }
  .siq-ticker-track:hover { animation-play-state: paused; }
  .siq-ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 6px;
  }
  .siq-ticker-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${YEL};
    flex-shrink: 0;
    animation: siq-pulse 2s ease-in-out infinite;
  }
  .siq-ticker-sep {
    font-family: ${MONO};
    font-size: 8px;
    color: rgba(241,235,222,.15);
    letter-spacing: .18em;
    padding: 0 4px;
  }

  /* ── sources sidebar ────────────────────────────────────────────── */
  .siq-results-wrap {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    max-width: 1400px;
    margin: 0 auto;
  }
  .siq-cards-col {
    flex: 1;
    min-width: 0;
  }
  .siq-sources-sidebar {
    width: 220px;
    flex-shrink: 0;
    position: sticky;
    top: 108px;
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 16px 14px;
  }
  .siq-source-card {
    padding-bottom: 16px;
    border-bottom: 1px solid ${INK15};
  }
  .siq-source-card:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  @keyframes siq-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .45; transform: scale(.75); }
  }
  .siq-pulse {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${GREEN};
    flex-shrink: 0;
    animation: siq-pulse 2.2s ease-in-out infinite;
  }
  @media (max-width: 1100px) {
    .siq-sources-sidebar { display: none; }
  }

  /* tooltip popup — hard-reset inherited uppercase from tab buttons */
  .siq-tooltip-popup,
  .siq-tooltip-popup * {
    text-transform: none !important;
    letter-spacing: normal !important;
    font-family: ${SERIF} !important;
    font-style: italic !important;
    font-size: 8px !important;
    line-height: 1.6 !important;
    color: ${INK55} !important;
  }

  /* ── scan loader (rotating stats while scanning) ─────────────────── */
  .siq-loader {
    max-width: 640px;
    margin: 6px auto 0;
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 20px 22px;
  }
  .siq-loader-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .siq-loader-bar {
    position: relative;
    flex: 1;
    height: 2px;
    background: ${INK15};
    overflow: hidden;
  }
  .siq-loader-bar > span {
    position: absolute;
    top: 0;
    left: -35%;
    height: 100%;
    width: 35%;
    background: ${YEL};
    animation: siq-scan-bar 1.25s ease-in-out infinite;
  }
  @keyframes siq-scan-bar {
    0%   { left: -35%; }
    100% { left: 100%; }
  }
  .siq-loader-feeds {
    display: flex;
    flex-wrap: wrap;
    gap: 9px 16px;
    margin: 16px 0 18px;
  }
  .siq-loader-feed {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: ${MONO};
    font-weight: 700;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: ${INK55};
    animation: siq-feed-in .5s ease both;
    animation-delay: var(--d);
  }
  .siq-loader-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${GREEN};
    animation: siq-pulse 1.4s ease-in-out infinite;
    animation-delay: var(--d);
  }
  @keyframes siq-feed-in {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: none; }
  }
  .siq-loader-stat {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 86px;
    animation: siq-stat-in .5s ease both;
  }
  @keyframes siq-stat-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  .siq-loader-stat-big {
    font-family: ${SERIF};
    font-weight: 700;
    font-size: 30px;
    line-height: 1;
    color: ${INK};
    letter-spacing: -0.02em;
  }
  .siq-loader-stat-text {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 14px;
    color: ${INK70};
    line-height: 1.45;
    max-width: 520px;
  }
  .siq-loader-stat-src {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK35};
  }
  @media (prefers-reduced-motion: reduce) {
    .siq-loader-bar > span { animation: none; left: 0; width: 100%; opacity: .5; }
    .siq-loader-feed, .siq-loader-stat { animation: none; }
    .siq-loader-dot { animation: none; }
  }

  /* ── proof strip (headline stats on landing) ─────────────────────── */
  .siq-proof {
    padding: 6px clamp(22px,5vw,56px) 2px;
  }
  .siq-proof-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid ${INK15};
    background: ${PAPER2};
  }
  .siq-proof-cell {
    padding: 20px 18px;
    border-right: 1px solid ${INK15};
  }
  .siq-proof-cell:last-child { border-right: none; }
  .siq-proof-num {
    display: block;
    font-family: ${SERIF};
    font-weight: 700;
    font-size: clamp(26px,3.4vw,38px);
    line-height: 1;
    color: ${INK};
    letter-spacing: -0.02em;
  }
  .siq-proof-label {
    margin: 8px 0 8px;
    font-family: ${SERIF};
    font-style: italic;
    font-size: 12.5px;
    color: ${INK55};
    line-height: 1.4;
  }
  .siq-proof-src {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK35};
  }
  .siq-proof-foot {
    max-width: 1100px;
    margin: 10px auto 0;
    text-align: center;
    font-family: ${SERIF};
    font-style: italic;
    font-size: 12px;
    color: ${INK55};
  }
  @media (max-width: 760px) {
    .siq-proof-inner { grid-template-columns: repeat(2, 1fr); }
    .siq-proof-cell:nth-child(2) { border-right: none; }
    .siq-proof-cell:nth-child(1),
    .siq-proof-cell:nth-child(2) { border-bottom: 1px solid ${INK15}; }
  }

  /* ecosystem grid CSS moved to ToolPipelineFooter shared component */
`;

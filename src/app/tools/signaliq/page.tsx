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

import React, { useState } from "react";
import Link from "next/link";
import { Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
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
import { BEATS, EMAIL_SCANS, FREE_SCANS, PRODUCT } from "@/lib/signaliq/config";
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
    url: "https://efts.sec.gov",
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
    benefit: "Edit-frequency spikes reveal when a topic is being actively researched en masse — often weeks before journalist interest peaks.",
    url: "https://en.wikipedia.org",
    role: "Signal",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    type: "Tech Forum Velocity",
    credibility: 0.55,
    badge: "Attention radar",
    benefit: "Points and comment velocity reveals which tech, SaaS, and AI stories are gaining momentum right now — before they break wide.",
    url: "https://news.ycombinator.com",
    role: "Signal",
  },
] as const;

// ── spot colours ──────────────────────────────────────────────────────────────
const GREEN = "#3e6b45";
const AMBER = "#d99211";
const RED = "#c14a32";
const BLUE = "#2d5393";
const HDR_BG = "#0e0d0a";
const HDR_BORDER = "#2a2318";

const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const bandColor = (b: OppBand): string =>
  b === "hot" ? GREEN : b === "look" ? BLUE : b === "early" ? AMBER : INK55;

// Source display labels
const SRC_LABEL: Record<string, string> = {
  gdelt: "GDELT",
  hackernews: "Hacker News",
  sec: "SEC EDGAR",
  wikipedia: "Wikipedia",
  arxiv: "arXiv",
};

const EMOS_URL = "/emos";
const EMOS_APPLY = "/emos/apply";

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

function GapBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const label = value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c = value >= 0.7 ? GREEN : value >= 0.4 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <SCaps size={9} ls="0.12em" color={INK}>Coverage gap</SCaps>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: c }}>
          {label}
        </span>
      </div>
      <div style={{ height: 6, background: PAPER2, border: `1px solid ${INK15}` }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c, transition: "width .6s ease" }} />
      </div>
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
                {src.benefit.split(" — ")[0]}
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
          All feeds are free, no API key. Every signal links back to its primary-source URL — click through to verify.
        </p>
      </div>
    </aside>
  );
}

// ── header ────────────────────────────────────────────────────────────────────

function SIQHeader() {
  const DIM = "rgba(241,235,222,.25)";
  return (
    <header
      style={{
        background: HDR_BG,
        borderBottom: `1px solid ${HDR_BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(20px,4vw,28px)",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, background: YEL,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: GROT, fontWeight: 900, fontSize: 11, color: INK,
          }}>
            SIA
          </div>
        </Link>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: PAPER, letterSpacing: "-0.01em" }}>
          Signal<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
        </span>
        <div style={{ width: 1, height: 18, background: "rgba(241,235,222,.12)", margin: "0 2px" }} />
        <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: DIM }}>
          Story Radar · SIA Wire
        </span>
      </div>
      <span className="siq-hide-sm" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: DIM }}>
        syedirfanajmal.com
      </span>
    </header>
  );
}

// ── step bar ──────────────────────────────────────────────────────────────────

function StepBar({ step, onGoStep }: { step: 1 | 2 | 3; onGoStep: (n: 1 | 2 | 3) => void }) {
  const STEPS: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: "Pick your beat" },
    { n: 2, label: "Scan the radar" },
    { n: 3, label: "Asset pack" },
  ];
  return (
    <nav className="siq-step-bar">
      {STEPS.map((s) => {
        const active = s.n === step;
        const past = s.n < step;
        return (
          <button
            key={s.n}
            className={`siq-step${active ? " active" : ""}${past ? " past" : ""}`}
            onClick={() => past && onGoStep(s.n)}
          >
            <span className="siq-step-no">0{s.n}</span> · {s.label}
          </button>
        );
      })}
    </nav>
  );
}

// ── footer ────────────────────────────────────────────────────────────────────

function SIQFooter() {
  const ECOSYSTEM = [
    {
      step: "01",
      tool: "SignalIQ",
      href: "/tools/signaliq",
      active: true,
      role: "Find the story",
      desc: "Scan 5 live open-data feeds. Rank opportunities by signal-vs-coverage gap. Get in before the press does.",
      badge: "You are here",
    },
    {
      step: "02",
      tool: "PressIQ",
      href: "/tools/pressiq",
      active: false,
      role: "Score the pitch",
      desc: "Paste your pitch angle. PressIQ scores it on 8 factors — specificity, credibility, timeliness — before you send it.",
      badge: "Next step",
    },
    {
      step: "03",
      tool: "CollabIQ",
      href: "/tools/collabiq",
      active: false,
      role: "Find the journalist",
      desc: "Search 50,000+ journalist contact records by beat, outlet, and recency. Pitch the right reporter, not a cold list.",
      badge: "Then this",
    },
    {
      step: "04",
      tool: "EMOS",
      href: "/emos",
      active: false,
      role: "Run the full system",
      desc: "The Earned Media Operating System wraps all three tools with playbooks, cadence, and a coverage guarantee.",
      badge: "The system",
    },
  ];

  return (
    <footer style={{ padding: "0 clamp(22px,5vw,56px) 36px", marginTop: 60 }}>
      <DoubleRule style={{ marginBottom: 20 }} />

      {/* Ecosystem step-flow */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <SCaps size={9} ls="0.22em" color={INK55}>The SIA earned-media pipeline</SCaps>
          <div style={{ flex: 1, height: 1, background: INK15, minWidth: 20 }} />
          <Link href="/emos" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55, textDecoration: "none" }}>
            How they fit together ↗
          </Link>
        </div>

        <div className="siq-ecosystem-grid">
          {ECOSYSTEM.map((item, idx) => (
            <Link key={item.tool} href={item.href} style={{ textDecoration: "none" }} className={`siq-eco-card${item.active ? " active" : ""}`}>
              {/* connector arrow between cards */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: item.active ? YEL : INK35, letterSpacing: "-0.02em", lineHeight: 1 }}>{item.step}</span>
                <span style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: item.active ? YEL : INK35 }}>{item.badge}</span>
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", color: item.active ? INK : INK55, marginBottom: 3 }}>
                {item.active ? <Mark>{item.tool}</Mark> : item.tool}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase", color: item.active ? INK70 : INK35, marginBottom: 8 }}>
                {item.role}
              </div>
              <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: item.active ? INK70 : INK55, lineHeight: 1.45 }}>
                {item.desc}
              </p>
              {idx < ECOSYSTEM.length - 1 && (
                <div className="siq-eco-arrow">→</div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Copyright row */}
      <div style={{ paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SCaps size={10} ls="0.16em" color={INK55}>
          © MMXXVI · Syed Irfan Ajmal · SIA Enterprises Inc
        </SCaps>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: YEL, border: `1px solid ${INK}` }} />
          <SCaps size={10} ls="0.16em" color={INK55}>Open for projects, Q3 2026</SCaps>
        </div>
      </div>
    </footer>
  );
}

// ── hero ──────────────────────────────────────────────────────────────────────

function SIQHero() {
  return (
    <section style={{ padding: "clamp(24px,4vw,48px) clamp(22px,5vw,56px) 0", position: "relative", overflow: "hidden" }}>
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
        {PRODUCT} · Proactive-PR Radar · SIA Wire
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
            {PRODUCT} scans open, primary-source data — filings, research, search and
            forum surges — and ranks the stories rising fastest before the press has
            caught up. Then it drafts the pitch.
          </p>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 13, color: INK55, lineHeight: 1.5 }}>
            Early signals, not predictions — every opportunity links back to its source.
          </p>
        </div>

        {/* Right: "How it works" editorial panel */}
        <div className="siq-hero-panel">
          <SCaps size={9} ls="0.20em" color={INK55}>How it works</SCaps>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
            {([
              ["01", "Pick a beat", "Choose your industry vertical — SaaS, Fintech, Health, Climate, or AI."],
              ["02", "Scan the radar", "5 live open-data sources scanned in seconds. No API key. No cost."],
              ["03", "Get an asset pack", "Pitch angle, data brief, journalist list — ready to send."],
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
  beat,
  setBeat,
  onScan,
  scanning,
}: {
  beat: BeatId;
  setBeat: (b: BeatId) => void;
  onScan: () => void;
  scanning: boolean;
}) {
  const currentBeat = BEATS.find((b) => b.id === beat);
  return (
    <section style={{ padding: "clamp(16px,3vw,28px) clamp(22px,5vw,56px) 0" }}>
      <div className="siq-beat-tabs">
        {BEATS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setBeat(b.id)}
            className={`siq-tab${b.id === beat ? " active" : ""}`}
          >
            <span className="siq-tab-no">0{i + 1}</span> {b.label}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", margin: "24px 0" }}>
        <button
          onClick={onScan}
          disabled={scanning}
          className="siq-scan-btn"
        >
          {scanning ? "Scanning the radar…" : `Scan ${currentBeat?.label} →`}
        </button>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
          {FREE_SCANS} free scans / month · {EMAIL_SCANS} with your email · live open-data sources
        </p>
      </div>
    </section>
  );
}

// ── opportunity card ──────────────────────────────────────────────────────────

function OppCard({
  opp,
  onGenerate,
}: {
  opp: Opportunity;
  onGenerate: () => void;
}) {
  const c = bandColor(opp.band);
  return (
    <div className="siq-card">
      {/* INK header strip */}
      <div className="siq-card-head">
        <Pill size={9} ls="0.14em">{opp.bandLabel}</Pill>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginLeft: "auto" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: PAPER, letterSpacing: "-0.02em" }}>
            {opp.score}
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(241,235,222,.5)" }}>/ 100</span>
        </div>
      </div>
      {/* PAPER2 body */}
      <div className="siq-card-body">
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: INK, letterSpacing: "-0.01em" }}>
          {opp.headline}
        </h3>
        <GapBar value={opp.components.coverageGap} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {opp.signals.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="siq-chip"
            >
              {SRC_LABEL[s.source] ?? s.source.toUpperCase()} ↗
            </a>
          ))}
        </div>
        {opp.sensitive && (
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: RED, lineHeight: 1.4 }}>
            Sensitive topic — handle with care.
          </p>
        )}
      </div>
      <button onClick={onGenerate} className="siq-gen-btn">
        Generate asset pack →
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
        {opp.coverage && (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, paddingTop: 6, borderTop: `1px solid ${INK15}` }}>
            Press coverage so far: {Math.round(opp.coverage.volume * 100)}% of saturation (GDELT).
          </div>
        )}
      </div>
    </div>
  );
}

// ── pack view ─────────────────────────────────────────────────────────────────

function PackView({ pack }: { pack: AssetPack }) {
  const copy = (text: string) => {
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
  };
  const briefParas = pack.brief.split(/\n{2,}/).filter(Boolean);

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
              ["02", "Find the actual reporters in CollabIQ's journalist contact book"],
              ["03", "Build the linkable asset using the EMOS playbook and cadence"],
              ["04", "Run the full earned-media play — EMOS handles the system around it"],
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
              ["01", "Use the data brief as your research base — cite the numbers directly"],
              ["02", "Personalise the pitch angle for each journalist and outlet you contact"],
              ["03", "Build the linkable asset on your site before you pitch — give them something to link to"],
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
        {briefParas.map((p, i) => (
          <p key={i} style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: INK70 }}>{p}</p>
        ))}
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
        <Link href="/tools/pressiq" className="siq-cross-link">
          Score this pitch in PressIQ →
        </Link>
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
          <Link href="/tools/collabiq" className="siq-cross-link">
            Find the actual reporters in CollabIQ →
          </Link>
        </div>
      )}

      {/* Cautions */}
      {pack.cautions.length > 0 && (
        <div style={{ marginTop: 16, padding: "14px 18px", border: `1px solid ${AMBER}`, background: hexA(AMBER, 0.08) }}>
          <SCaps size={10} ls="0.16em" color={INK}>Before you pitch — verify</SCaps>
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
          Every signal below comes from a live, open, primary-source database —
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
        ✓ Unlocked — {EMAIL_SCANS} scans a month. Check your inbox.
      </div>
    );
  }
  return (
    <form onSubmit={onUnlock} style={{ padding: "18px 20px", border: `1px solid ${INK}`, background: PAPER2 }}>
      <SCaps size={10} ls="0.16em" color={INK}>Unlock more scans &amp; packs</SCaps>
      <p style={{ margin: "6px 0 12px", fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
        Add your email for {EMAIL_SCANS} scans/month and SIA&rsquo;s earned-media playbooks.
        One list, unsubscribe anytime.
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

// ── EMOS CTA ──────────────────────────────────────────────────────────────────

function EmosCTA() {
  return (
    <div style={{ background: INK, color: PAPER, padding: "clamp(22px,4vw,38px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: -30, right: -40, opacity: 0.06 }}>
        <SiaLogo height={200} />
      </div>
      <div style={{ position: "relative" }}>
        <SCaps size={11} ls="0.20em" color={YEL}>Where this fits</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3.2vw,34px)", lineHeight: 1.06, color: PAPER }}>
          {PRODUCT} finds the story.<br />
          <span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> turns it into coverage.
        </h3>
        <p style={{ margin: "14px 0 22px", fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.72)", lineHeight: 1.55, maxWidth: 560 }}>
          {PRODUCT} powers two of the three EMOS pillars —{" "}
          <strong style={{ color: PAPER }}>Linkable Assets</strong> and{" "}
          <strong style={{ color: PAPER }}>Proactive PR</strong>. The full Earned Media
          Operating System gives your team the playbooks, journalist system, and
          guarantee to earn coverage in-house.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={EMOS_APPLY} style={{ display: "inline-flex", alignItems: "center", gap: 12, background: YEL, color: INK, textDecoration: "none", padding: "14px 24px", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Apply to EMOS <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400 }}>↗</span>
          </a>
          <a href={EMOS_URL} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(241,235,222,.3)", color: PAPER, textDecoration: "none", padding: "14px 22px", fontFamily: GROT, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Explore EMOS
          </a>
        </div>
      </div>
    </div>
  );
}

// ── detail view ───────────────────────────────────────────────────────────────

function DetailView({
  opp,
  pack,
  packing,
  packError,
  onBack,
  onRetry,
  email,
  setEmail,
  emailDone,
  unlockEmail,
}: {
  opp: Opportunity;
  pack: AssetPack | null;
  packing: boolean;
  packError: string | null;
  onBack: () => void;
  onRetry: () => void;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  unlockEmail: (e: React.FormEvent) => void;
}) {
  const c = bandColor(opp.band);
  return (
    <section style={{ padding: "10px clamp(22px,5vw,56px) 32px" }}>
      <button onClick={onBack} className="siq-back" style={{ marginBottom: 16 }}>
        ← Back to the radar
      </button>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Opportunity header */}
        <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
          <ScoreRing score={opp.score} color={c} size={110} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <Pill size={10} ls="0.14em">{opp.bandLabel} · {opp.beat}</Pill>
            <h2 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.5vw,38px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>
              {opp.headline}
            </h2>
            <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>
              A lead/whitespace score — how far ahead of the coverage you are.
              Not a prediction the story breaks.
            </p>
          </div>
        </div>

        {/* § 01 — Why SignalIQ flagged this */}
        <div style={{ marginTop: 28 }}>
          <SectionMast n="01" label="Why SignalIQ flagged this" />
          <div className="siq-detail-cols">
            <ScorePanel opp={opp} />
            <ReceiptsPanel opp={opp} />
          </div>
        </div>

        {/* § 02 — Your asset pack */}
        <div style={{ marginTop: 36 }}>
          <SectionMast n="02" label="Your asset pack" />
          {packing && (
            <div style={{ padding: 30, textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
              Building your asset pack — brief, pitch angle, and reporter desks…
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
          {pack && !packing && <PackView pack={pack} />}
        </div>

        {/* Email gate */}
        <div style={{ marginTop: 32 }}>
          <EmailGate email={email} setEmail={setEmail} done={emailDone} onUnlock={unlockEmail} />
        </div>

        {/* EMOS CTA */}
        <div style={{ marginTop: 32 }}>
          <EmosCTA />
        </div>

        {/* Subscriptions */}
        <div style={{ marginTop: 30 }}>
          <Subscriptions sectionNumber="—" />
        </div>
      </div>
    </section>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function SignalIQPage() {
  const [beat, setBeat] = useState<BeatId>("fintech");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [packing, setPacking] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [pack, setPack] = useState<AssetPack | null>(null);

  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);

  // Derived step
  const step: 1 | 2 | 3 = selected ? 3 : scan ? 2 : 1;

  function handleGoStep(n: 1 | 2 | 3) {
    if (n === 1) { setSelected(null); setPack(null); setPackError(null); setScan(null); }
    if (n === 2) { setSelected(null); setPack(null); setPackError(null); }
  }

  async function runScan() {
    setScanError(null);
    setScanning(true);
    setScan(null);
    setSelected(null);
    setPack(null);
    try {
      const res = await fetch("/api/signaliq/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beat }),
      });
      const data = await res.json();
      if (!res.ok) setScanError(data.error || "Scan failed.");
      else setScan(data as ScanResponse);
    } catch {
      setScanError("Network error — please try again.");
    } finally {
      setScanning(false);
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
        body: JSON.stringify({ opportunity: opp, store: true }),
      });
      const data = await res.json();
      if (!res.ok) setPackError(data.error || "Could not generate the pack.");
      else setPack(data as AssetPack);
    } catch {
      setPackError("Network error — please try again.");
    } finally {
      setPacking(false);
    }
  }

  async function unlockEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch { /* non-fatal */ }
    document.cookie = `pp_tier=email; path=/; max-age=${60 * 60 * 24 * 365}`;
    setEmailDone(true);
  }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <SIQHeader />
      <StepBar step={step} onGoStep={handleGoStep} />

      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <SIQHero />

        {/* ── Wire-feed ticker ──────────────────────────────────────────── */}
        <SourcesTicker />

        {/* ── Detail view (step 3) ──────────────────────────────────────── */}
        {selected && (
          <DetailView
            opp={selected}
            pack={pack}
            packing={packing}
            packError={packError}
            onBack={() => { setSelected(null); setPack(null); setPackError(null); }}
            onRetry={() => generatePack(selected)}
            email={email}
            setEmail={setEmail}
            emailDone={emailDone}
            unlockEmail={unlockEmail}
          />
        )}

        {/* ── Radar (steps 1 & 2) ───────────────────────────────────────── */}
        {!selected && (
          <section style={{ padding: "0 0 40px" }}>
            <BeatPicker beat={beat} setBeat={(b) => { setBeat(b); setScan(null); setScanError(null); }} onScan={runScan} scanning={scanning} />

            {scanError && (
              <div style={{ maxWidth: 620, margin: "20px auto 0", padding: "12px 14px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
                {scanError}
              </div>
            )}

            {scan && scan.notes.length > 0 && (
              <p style={{ maxWidth: 620, margin: "18px auto 0", padding: "0 clamp(22px,5vw,56px)", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, textAlign: "center" }}>
                {scan.notes.join(" ")}
              </p>
            )}

            {scan && scan.opportunities.length > 0 && (
              <div style={{ padding: "0 clamp(22px,5vw,56px)" }}>
                {/* Results header */}
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                  <DoubleRule style={{ marginTop: 24 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0 12px", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <Pill size={10} ls="0.14em">Radar</Pill>
                      <SCaps size={11} ls="0.14em" color={INK}>
                        {scan.opportunities.length} opportunities · ranked by signal-vs-coverage
                      </SCaps>
                    </div>
                    <SCaps size={10} ls="0.14em" color={INK55}>
                      {scan.usage.remaining} scan{scan.usage.remaining === 1 ? "" : "s"} left
                    </SCaps>
                  </div>
                  <HRule style={{ marginBottom: 20 }} />
                </div>
                {/* Cards + sidebar */}
                <div className="siq-results-wrap">
                  <div className="siq-cards-col">
                    <div className="siq-cards">
                      {scan.opportunities.map((opp) => (
                        <OppCard key={opp.id} opp={opp} onGenerate={() => generatePack(opp)} />
                      ))}
                    </div>
                  </div>
                  <SourcesSidebar />
                </div>
              </div>
            )}
          </section>
        )}

        <SIQFooter />
      </div>
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
    font-size: clamp(36px,6vw,72px);
    line-height: 0.96;
    letter-spacing: -0.03em;
    color: ${INK};
  }

  /* beat tabs */
  .siq-beat-tabs {
    display: flex;
    max-width: 800px;
    border: 1px solid ${INK15};
  }
  .siq-tab {
    flex: 1;
    padding: 11px 18px;
    background: transparent;
    border: none;
    border-right: 1px solid ${INK15};
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: rgba(26,20,16,.45);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    white-space: nowrap;
  }
  .siq-tab:last-child { border-right: none; }
  .siq-tab.active { background: ${INK}; color: ${PAPER}; }
  .siq-tab-no {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 10px;
    opacity: 0.6;
    margin-right: 4px;
  }

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
    padding: 12px 14px;
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
    .siq-beat-tabs { flex-direction: column; }
    .siq-tab { border-right: none; border-bottom: 1px solid ${INK15}; }
    .siq-tab:last-child { border-bottom: none; }
    .siq-cards { grid-template-columns: 1fr; }
    .siq-step { padding: 10px 12px; font-size: 8.5px; }
    .siq-hide-sm { display: none; }
  }

  /* ── wire-feed ticker ───────────────────────────────────────────── */
  .siq-ticker-wrap {
    display: flex;
    align-items: stretch;
    background: ${HDR_BG};
    border-bottom: 1px solid ${HDR_BORDER};
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

  /* ecosystem pipeline grid */
  .siq-ecosystem-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    position: relative;
  }
  .siq-eco-card {
    border: 1px solid ${INK15};
    border-right: none;
    padding: 16px 18px 20px;
    position: relative;
    background: ${PAPER};
    transition: background 0.12s ease;
  }
  .siq-eco-card:last-child { border-right: 1px solid ${INK15}; }
  .siq-eco-card:hover { background: ${PAPER2}; }
  .siq-eco-card.active { background: ${PAPER2}; border-color: ${INK35}; }
  .siq-eco-arrow {
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
  .siq-eco-card.active .siq-eco-arrow {
    background: ${PAPER2};
    border-color: ${INK35};
    color: ${INK55};
  }
  @media (max-width: 860px) {
    .siq-ecosystem-grid { grid-template-columns: 1fr 1fr; }
    .siq-eco-card:nth-child(2) { border-right: 1px solid ${INK15}; }
    .siq-eco-card:nth-child(3) { border-top: none; }
    .siq-eco-card:nth-child(4) { border-top: none; border-right: 1px solid ${INK15}; }
    .siq-eco-arrow { display: none; }
  }
  @media (max-width: 540px) {
    .siq-ecosystem-grid { grid-template-columns: 1fr; }
    .siq-eco-card { border-right: 1px solid ${INK15}; border-bottom: none; }
    .siq-eco-card:last-child { border-bottom: 1px solid ${INK15}; }
  }
`;

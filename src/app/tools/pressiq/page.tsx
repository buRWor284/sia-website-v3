"use client";

/**
 * PressIQ — /tools/pressiq
 * Two-panel app layout matching the design handoff:
 *   – Dark header (52px)
 *   – Left panel 360px: dark input form
 *   – Right panel flex: pre-score | loading | post-score (4 tabs)
 *
 * Site header is suppressed for /tools/ routes (SiteHeader.tsx line ~40).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DIMENSION_EVIDENCE,
  EMAIL_LIMIT,
  EMOS_APPLY,
  EMOS_URL,
  EVIDENCE,
  FREE_LIMIT,
  PLATFORMS,
} from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { emosFrame } from "@/lib/pitch/feedback";
import {
  EMPTY_BRAND,
  type BrandSignals,
  type Platform,
  type ScoreResponse,
} from "@/lib/pitch/types";

// ── Handoff colour palette ────────────────────────────────────────────────────
const PAPER   = "#f1ebde";   // right-panel bg; also text on dark panels
const INK     = "#1a1410";
// (INK opacity variants used inline via ra() helper)
const YEL     = "#f5b81f";
const DARK    = "#0e0d0a";
const DARK2   = "#181510";
const DARK3   = "#221e17";
const DARK_BD = "#2a2318";
const GREEN   = "#3e6b45";
const AMBER   = "#d99211";
const RED     = "#c14a32";
const BLUE    = "#2d5393";

// ── Typography variables ──────────────────────────────────────────────────────
const SERIF = "var(--font-serif)";
const GROT  = "var(--font-grot)";
const MONO  = "var(--font-mono)";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ra = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

function bandColor(score: number) {
  return score >= 75 ? GREEN : score >= 45 ? AMBER : RED;
}

// ── Static content ────────────────────────────────────────────────────────────
const TICKER = [
  { stat: "82%",   text: "of journalists delete off-beat pitches",        src: "Cision 2026"          },
  { stat: "88%",   text: "immediately delete pitches outside their beat", src: "Muck Rack 2026"       },
  { stat: "3.03%", text: "response for 51–150 word pitches",              src: "Propel, 425k+ pitches" },
  { stat: "+36%",  text: "responses at 3rd-grade reading level",          src: "Boomerang, 40M emails" },
  { stat: "+50%",  text: "reply likelihood with 1–3 questions",           src: "Boomerang"            },
  { stat: "47%",   text: "want more data / research (#1 want)",           src: "Cision 2026"          },
  { stat: "58%",   text: "want source access for interviews",             src: "Muck Rack 2026"       },
  { stat: "53%",   text: "distrust generic, AI-sounding pitches",         src: "Cision 2026"          },
];

const DIMS = [
  { key: "relevance",      name: "Answering the brief",   short: "Relevance",  mech: "Relevance — the #1 filter"            },
  { key: "objective",      name: "Mechanics",              short: "Mechanics",  mech: "Mechanics (Respondable-style)"             },
  { key: "checklist",      name: "SIA 7-Step Checklist",  short: "SIA 7-step", mech: "SIA 7-step journo-outreach checklist"      },
  { key: "newsroomReady",  name: "Newsroom-ready",         short: "Newsroom",   mech: "Newsroom-ready — publishable material" },
  { key: "storytelling",   name: "Storytelling",           short: "Story",      mech: "Narrative transportation"                  },
  { key: "neuromarketing", name: "Neuromarketing",         short: "Neuro",      mech: "System 1 + original data"                  },
  { key: "personalBrand",  name: "Personal brand",         short: "Personal",   mech: "E-E-A-T & the halo effect"                 },
] as const;

type DimKey = typeof DIMS[number]["key"];

const SAMPLE_PITCH = `Subject: Re: Experts on the 4-day week — our 18-month data + [Stats + Examples]

Hi Sarah,

Loved your piece last month on remote-team burnout — the bit about “always-on guilt” mirrored exactly what we measured.

I’m Priya Raman, founder of Tilt (we run ops for 40 distributed startups). When we cut to a 4-day week 18 months ago, I was sure output would drop. It didn’t. We tracked 1,200 employees across 12 companies: focused output rose 9%, and voluntary attrition fell by a third.

The counterintuitive part: the win wasn’t “rest.” It was that a hard deadline forced teams to kill low-value meetings — 22% of recurring meetings vanished in the first month.

Happy to share the raw dataset, or connect you with two founders who reversed course and went back to five days. Which would be more useful for your piece?

Priya Raman — Founder, Tilt · tilt.example.com
priya@tilt.example.com · @priyaraman · linkedin.com/in/priyaraman`;

const SAMPLE_QUERY = `Looking for founders / HR leads who have implemented a 4-day work week for at least 6 months and can share real performance data (retention, output, revenue impact). Especially interested in anyone who tried it and reversed course. For a feature in The Future of Work series. Requirements: Named source, must be available for a 15-min phone interview.`;

const STORE_KEY = "sia.pressiq.v2";

const BRAND_LABELS: { key: keyof BrandSignals; label: string }[] = [
  { key: "website",     label: "Personal website"  },
  { key: "bylines",     label: "Published bylines" },
  { key: "youtube",     label: "YouTube / video"   },
  { key: "speaking",    label: "Speaking history"  },
  { key: "caseStudies", label: "Case studies"      },
  { key: "linkedin",    label: "Active LinkedIn"   },
];

// ── Shared left-panel style atoms ─────────────────────────────────────────────
const LSEC: React.CSSProperties = {
  padding: "18px 22px",
  borderBottom: `1px solid ${DARK_BD}`,
};

const LSEC_LBL: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: ".20em",
  textTransform: "uppercase",
  color: ra(PAPER, 0.28),
  marginBottom: 10,
  display: "block",
};

const LP_TEXTAREA: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: DARK3,
  border: `1px solid ${DARK_BD}`,
  fontFamily: GROT,
  fontSize: 12.5,
  color: PAPER,
  outline: "none",
  resize: "vertical",
  borderRadius: 0,
};

const LP_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: DARK3,
  border: `1px solid ${DARK_BD}`,
  fontFamily: GROT,
  fontSize: 12.5,
  color: PAPER,
  outline: "none",
  borderRadius: 0,
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "5px 9px",
    border: `1px solid ${active ? YEL : DARK_BD}`,
    background: active ? YEL : "transparent",
    fontSize: 10.5,
    fontWeight: 600,
    cursor: "pointer",
    color: active ? DARK : ra(PAPER, 0.35),
    transition: "all .1s",
    fontFamily: GROT,
    margin: 2,
    borderRadius: 0,
  };
}

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
function Gauge({ score, color }: { score: number; color: string }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const d = (score / 100) * circ;
  return (
    <svg viewBox="0 0 180 180" style={{ width: 180, height: 180 }}>
      <circle cx="90" cy="90" r={r} fill="none" stroke={ra(INK, 0.06)} strokeWidth="7" />
      <circle
        cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${d.toFixed(1)} ${(circ - d).toFixed(1)}`}
        transform="rotate(-90 90 90)"
      />
      <text x="90" y="82" textAnchor="middle" fontFamily={SERIF} fontSize="48" fontWeight="700" fill={INK}>
        {score}
      </text>
      <text x="90" y="104" textAnchor="middle" fontFamily={GROT} fontSize="11" fontWeight="700" letterSpacing=".16em" fill={ra(INK, 0.35)}>
        / 100
      </text>
    </svg>
  );
}

// ── SVG Radar ─────────────────────────────────────────────────────────────────
function Radar({
  scores,
  dims,
}: {
  scores: Record<string, number>;
  dims: readonly typeof DIMS[number][];
}) {
  const n = dims.length;
  const cx = 150, cy = 150, R = 110;
  const pt = (frac: number, i: number): [number, number] => {
    const ang = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + frac * R * Math.cos(ang), cy + frac * R * Math.sin(ang)];
  };
  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 300 }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={dims.map((_, i) => pt(f, i).map((v) => v.toFixed(1)).join(",")).join(" ")}
          fill="none"
          stroke={ra(INK, 0.08)}
          strokeWidth="1"
        />
      ))}
      {dims.map((_, i) => {
        const [x, y] = pt(1, i);
        return (
          <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={ra(INK, 0.08)} strokeWidth="1" />
        );
      })}
      <polygon
        points={dims.map((d, i) => pt((scores[d.key] ?? 0) / 100, i).map((v) => v.toFixed(1)).join(",")).join(" ")}
        fill={ra(BLUE, 0.12)}
        stroke={BLUE}
        strokeWidth="2"
      />
      {dims.map((d, i) => {
        const s = scores[d.key] ?? 0;
        const [x, y] = pt(s / 100, i);
        const [lx, ly] = pt(1.18, i);
        const ang = (2 * Math.PI * i) / n - Math.PI / 2;
        const anchor = Math.abs(Math.cos(ang)) < 0.15 ? "middle" : Math.cos(ang) > 0 ? "start" : "end";
        const tc = bandColor(s);
        return (
          <g key={d.key}>
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill={tc} />
            <text
              x={lx.toFixed(1)} y={(ly + 3).toFixed(1)} textAnchor={anchor}
              fontFamily={GROT} fontSize="8.5" fontWeight="700" letterSpacing=".06em" fill={ra(INK, 0.5)}
            >{d.short}</text>
            <text
              x={lx.toFixed(1)} y={(ly + 14).toFixed(1)} textAnchor={anchor}
              fontFamily={MONO} fontSize="9" fontWeight="700" fill={tc}
            >{s}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Signal chip (pass/fail) ───────────────────────────────────────────────────
function SignalChip({ label, met }: { label: string; met: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px",
      border: `1px solid ${met ? ra(GREEN, 0.4) : ra(RED, 0.35)}`,
      fontFamily: GROT, fontSize: 9.5, fontWeight: 600,
      color: met ? GREEN : RED,
    }}>
      {met ? "✓" : "✗"} {label}
    </span>
  );
}

// ── Evidence card ─────────────────────────────────────────────────────────────
function EvidCard({ figKey }: { figKey: string }) {
  const ev = EVIDENCE[figKey];
  if (!ev) return null;
  return (
    <a
      href={ev.url} target="_blank" rel="noopener noreferrer"
      style={{
        display: "flex", gap: 10, padding: "9px 12px",
        background: ra(INK, 0.025), border: `1px solid ${ra(INK, 0.06)}`,
        textDecoration: "none", marginBottom: 5,
      }}
    >
      <div style={{ width: 6, height: 6, background: YEL, marginTop: 5, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{ev.figure}</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: ra(INK, 0.35), marginTop: 2 }}>{ev.source}</div>
      </div>
    </a>
  );
}

// ── Dimension block ───────────────────────────────────────────────────────────
function DimBlock({
  dim, score, analysis, subSignals, evidenceKeys, expanded, onToggle,
}: {
  dim: typeof DIMS[number];
  score: number;
  analysis?: string;
  subSignals?: { label: string; met: boolean }[];
  evidenceKeys?: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const tc = bandColor(score);
  const band = score >= 75 ? "strong" : score >= 45 ? "weak" : ("missing" as const);
  const frame = emosFrame(dim.key as Parameters<typeof emosFrame>[0], score);
  const bandC = band === "strong" ? GREEN : band === "weak" ? AMBER : RED;
  const evKeys = evidenceKeys?.length ? evidenceKeys : (DIMENSION_EVIDENCE[dim.key] ?? []);

  return (
    <div style={{ border: `1px solid ${ra(INK, 0.18)}`, marginBottom: 10 }}>
      <div
        onClick={onToggle}
        style={{
          padding: "14px 18px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK }}>{dim.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: tc }}>{score}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 72, height: 4, background: ra(INK, 0.06) }}>
            <div style={{ width: `${score}%`, height: "100%", background: tc }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: ra(INK, 0.25), width: 16, textAlign: "center" }}>
            {expanded ? "–" : "+"}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${ra(INK, 0.08)}`, padding: "16px 18px" }}>
          {analysis && (
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.65), lineHeight: 1.6, marginBottom: 14 }}>
              {analysis}
            </div>
          )}
          {subSignals && subSignals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {subSignals.map((s, j) => <SignalChip key={j} label={s.label} met={s.met} />)}
            </div>
          )}
          <div style={{ borderTop: `1px solid ${ra(INK, 0.06)}`, paddingTop: 12 }}>
            <span style={{
              display: "inline-block", padding: "3px 8px", background: bandC, color: "#fff",
              fontFamily: GROT, fontWeight: 800, fontSize: 7.5,
              letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8,
            }}>
              {dim.mech}
            </span>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.55), lineHeight: 1.6, marginBottom: 12 }}>
              {frame.text}
            </div>
            {evKeys.map((k) => <EvidCard key={k} figKey={k} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fix card ──────────────────────────────────────────────────────────────────
function FixCard({ rank, fix }: { rank: number; fix: ScoreResponse["topFixes"][0] }) {
  return (
    <div style={{ border: `1px solid ${INK}`, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 26, height: 26, background: YEL, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: GROT, fontWeight: 900, fontSize: 13, color: INK,
        }}>{rank}</div>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: PAPER }}>{fix.area}</div>
          {fix.mechanism && (
            <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(PAPER, 0.35), marginTop: 2 }}>
              {fix.mechanism}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "14px 16px", fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.7), lineHeight: 1.6 }}>
        {fix.text}
      </div>
    </div>
  );
}

// ── Live meter ────────────────────────────────────────────────────────────────
function LiveMeter({
  label, val, band, hint,
}: {
  label: string; val: string;
  band: "green" | "amber" | "red" | "neutral"; hint: string;
}) {
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
      <div style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(INK, 0.38), marginTop: 3 }}>{hint}</div>
    </div>
  );
}

// ── Pre-score panel ───────────────────────────────────────────────────────────
function PreScorePanel({ live }: { live: ReturnType<typeof scoreLayer1> | null }) {
  const [tickIdx, setTickIdx] = useState(0);
  const [tickOp, setTickOp]   = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setTickOp(0);
      setTimeout(() => {
        setTickIdx((i) => (i + 1) % TICKER.length);
        setTickOp(1);
      }, 200);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const t = TICKER[tickIdx];

  function st(status: "ideal" | "ok" | "off" | undefined): "green" | "amber" | "red" | "neutral" {
    if (!status) return "neutral";
    return status === "ideal" ? "green" : status === "ok" ? "amber" : "red";
  }

  const mechScore = live?.score ?? 0;

  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "40px 32px 32px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 14 }}>
          PRESSIQ · JOURNALIST PITCH SCORE
        </div>
        <h1 style={{
          fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px,3.8vw,42px)",
          lineHeight: 1.08, letterSpacing: "-.025em", color: INK, margin: "0 0 16px",
        }}>
          Will a journalist<br />
          <em style={{ fontStyle: "italic" }}>
            <span style={{ background: YEL, color: INK, padding: "0 .12em" }}>paste this in?</span>
          </em>
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: ra(INK, 0.5), lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
          Score your HARO / Qwoted / Featured pitch against a 34-point system and the EMOS framework — and get the three fixes that move it most. No signup for your first {FREE_LIMIT}.
        </p>
      </div>

      {/* Live mechanics */}
      <div style={{ padding: "24px 32px 20px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 18 }}>
          LIVE MECHANICS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
          <LiveMeter
            label="Word count"
            val={live ? String(live.bands.wordCount.value) : "0"}
            band={st(live?.bands.wordCount.status)}
            hint={live ? live.bands.wordCount.hint : "Type to measure"}
          />
          <LiveMeter
            label="Subject length"
            val={live ? `${live.bands.subjectWords.value} word${live.bands.subjectWords.value !== 1 ? "s" : ""}` : "0 words"}
            band={st(live?.bands.subjectWords.status)}
            hint={live ? live.bands.subjectWords.hint : "Add a subject line"}
          />
          <LiveMeter
            label="Reading level"
            val={live ? `Grade ${Math.round(live.bands.readingGrade.value)}` : "—"}
            band={st(live?.bands.readingGrade.status)}
            hint={live ? live.bands.readingGrade.hint : "Need more text"}
          />
          <LiveMeter
            label="Closing question"
            val={live ? (live.metrics.hasClosingQuestion ? "Yes" : "No") : "—"}
            band={st(live?.bands.questions.status)}
            hint={live ? live.bands.questions.hint : "Need more text"}
          />
          <div style={{ gridColumn: "1/-1" }}>
            <LiveMeter
              label="Tone / subjectivity"
              val={live
                ? live.bands.subjectivity.status === "ideal" ? "Clean"
                : live.bands.subjectivity.status === "ok" ? "Mild" : "Flagged"
                : "—"}
              band={st(live?.bands.subjectivity.status)}
              hint={live ? live.bands.subjectivity.hint : "Need more text"}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 14, borderTop: `1px solid ${ra(INK, 0.06)}` }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.35) }}>
            Mechanics score
          </span>
          <div style={{ flex: 1, height: 4, background: ra(INK, 0.05) }}>
            <div style={{ height: "100%", width: `${mechScore}%`, background: BLUE, transition: "width .3s ease" }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: INK }}>{mechScore}</span>
        </div>
      </div>

      {/* Credibility ticker */}
      <div style={{ padding: "24px 32px 32px" }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 16 }}>
          BUILT ON
        </div>
        <div style={{ opacity: tickOp, transition: "opacity .2s ease", minHeight: 68 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: YEL, letterSpacing: "-.02em", lineHeight: 1, marginBottom: 5 }}>{t.stat}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.55), lineHeight: 1.4, marginBottom: 3 }}>{t.text}</div>
          <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.25) }}>{t.src}</div>
        </div>
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["Cision 2026", "Muck Rack 2026", "Propel", "Backlinko", "Fractl", "Boomerang"].map((s) => (
            <span key={s} style={{
              padding: "4px 8px", border: `1px solid ${ra(INK, 0.08)}`,
              fontFamily: MONO, fontSize: 7.5, fontWeight: 600,
              letterSpacing: ".10em", textTransform: "uppercase", color: ra(INK, 0.28),
            }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Loading panel ─────────────────────────────────────────────────────────────
function LoadingPanel() {
  return (
    <div style={{ padding: "100px 32px", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: ra(INK, 0.35), marginBottom: 14 }}>
        Scoring against 34 data points…
      </div>
      <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: ra(INK, 0.2) }}>
        Cision · Muck Rack · Propel · Backlinko · Boomerang
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 6, justifyContent: "center" }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="piq-dot" style={{ animationDelay: `${delay}s` }} />
        ))}
      </div>
    </div>
  );
}

// ── Post-score panel ──────────────────────────────────────────────────────────
function PostScorePanel({
  result, email, setEmail, emailDone, onUnlockEmail, onReset,
}: {
  result: ScoreResponse;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  onUnlockEmail: (e: React.FormEvent) => void;
  onReset: () => void;
}) {
  const [tab, setTab]     = useState<"score" | "fixes" | "breakdown" | "evidence">("score");
  const [expanded, setExpanded] = useState<Set<DimKey>>(new Set());

  const { composite, tier, areas, relevanceAssessed, strongestLine, topFixes, authenticityRisk } = result;

  // Build scores map for Radar (keyed by dim.key)
  const scoreMap: Record<string, number> = {};
  if (areas.relevance) scoreMap.relevance = areas.relevance.score;
  scoreMap.objective      = areas.objective.score;
  scoreMap.checklist      = areas.checklist.score;
  scoreMap.newsroomReady  = areas.newsroomReady.score;
  scoreMap.storytelling   = areas.emos.storytelling.score;
  scoreMap.neuromarketing = areas.emos.neuromarketing.score;
  scoreMap.personalBrand  = areas.emos.personalBrand.score;

  const radarDims = relevanceAssessed ? DIMS : DIMS.filter((d) => d.key !== "relevance");

  function areaFor(key: DimKey) {
    if (key === "relevance")      return areas.relevance ?? { score: 0 };
    if (key === "objective")      return areas.objective;
    if (key === "checklist")      return areas.checklist;
    if (key === "newsroomReady")  return areas.newsroomReady;
    if (key === "storytelling")   return areas.emos.storytelling;
    if (key === "neuromarketing") return areas.emos.neuromarketing;
    if (key === "personalBrand")  return areas.emos.personalBrand;
    return { score: 0 as number };
  }

  function toggleDim(key: DimKey) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  const shareText = encodeURIComponent(
    `My PR pitch scored ${composite}/100 (${tier.label}) on PressIQ by @syedirfanajmal. Score yours:`
  );

  const TABS: { id: typeof tab; label: string }[] = [
    { id: "score",     label: "01 · Score"     },
    { id: "fixes",     label: "02 · Top Fixes" },
    { id: "breakdown", label: "03 · Breakdown" },
    { id: "evidence",  label: "04 · Evidence"  },
  ];

  return (
    <div>
      {/* Sticky tab bar */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${ra(INK, 0.15)}`,
        background: PAPER, position: "sticky", top: 0, zIndex: 5,
      }}>
        {TABS.map((tb) => (
          <button
            key={tb.id} onClick={() => setTab(tb.id)}
            style={{
              padding: "12px 18px", fontFamily: GROT, fontSize: 9, fontWeight: 700,
              letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer",
              background: "none", border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: tab === tb.id ? `2px solid ${INK}` : "2px solid transparent",
              color: tab === tb.id ? INK : ra(INK, 0.4), transition: "all .1s",
            }}
          >{tb.label}</button>
        ))}
      </div>

      {/* ── Tab 01: Score ──────────────────────────────────────────────────── */}
      {tab === "score" && (
        <div style={{ padding: "0 32px 28px" }}>
          {/* Gauge */}
          <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
            <Gauge score={composite} color={tier.color} />
            <div style={{ marginTop: 14 }}>
              <span style={{
                display: "inline-block", padding: "5px 12px 6px",
                background: tier.color, color: "#fff",
                fontFamily: GROT, fontWeight: 800, fontSize: 8.5,
                letterSpacing: ".16em", textTransform: "uppercase",
              }}>
                {tier.badge.toUpperCase()} · {tier.label.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, marginTop: 12, letterSpacing: "-.015em" }}>
              {composite >= 85 ? "Placement-grade."
                : composite >= 65 ? "Competitive — tighten it."
                : composite >= 40 ? "Real material, missing the system."
                : "This will get ignored."}
            </div>
          </div>

          {/* No-query warning */}
          {!relevanceAssessed && (
            <div style={{
              padding: "13px 16px", marginBottom: 18,
              border: `1px solid ${AMBER}`, background: "rgba(217,146,17,.05)",
              fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.65),
            }}>
              Scored without the journalist&rsquo;s query, so relevance — the #1 driver of placement — wasn&rsquo;t assessed. Add it for a real score.
            </div>
          )}

          {/* Authenticity nudge */}
          {authenticityRisk?.flagged && (
            <div style={{
              padding: "13px 16px", marginBottom: 18,
              border: `1px solid ${RED}`, background: "rgba(193,74,50,.04)",
            }}>
              <span style={{
                display: "inline-block", padding: "3px 8px", background: RED, color: "#fff",
                fontFamily: GROT, fontWeight: 800, fontSize: 7.5,
                letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6,
              }}>READS TEMPLATED</span>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.65) }}>
                {authenticityRisk.note || "This reads like a template anyone could send. Add a first-hand detail or a number only you have — 53% of journalists distrust generic, AI-sounding pitches."}
              </div>
            </div>
          )}

          {/* Strongest line */}
          {strongestLine && (
            <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 20, marginTop: 4 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 8 }}>
                YOUR STRONGEST LINE
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: INK, lineHeight: 1.5, borderLeft: `3px solid ${YEL}`, paddingLeft: 16 }}>
                &ldquo;{strongestLine}&rdquo;
              </div>
            </div>
          )}

          {/* Radar */}
          <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 22, marginTop: 22 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 14 }}>
              YOUR PITCH, BY DIMENSION
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Radar scores={scoreMap} dims={radarDims} />
            </div>
          </div>

          {/* EMOS CTA */}
          <div style={{ background: INK, padding: 22, marginTop: 22 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: YEL, marginBottom: 8 }}>
              {composite >= 85 ? "YOU’VE GOT THE STANDARD — NOW SCALE IT" : "WHERE THIS SCORING COMES FROM"}
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: PAPER, letterSpacing: "-.01em", marginBottom: 6 }}>
              This tool scores one pitch.<br />
              <span style={{ color: YEL }}>EMOS builds the whole pipeline.</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(PAPER, 0.55), lineHeight: 1.6, marginBottom: 14 }}>
              PressIQ runs on the EMOS framework — Personal Branding × Storytelling × Neuromarketing. The full Earned Media Operating System hands your team the playbooks, journalist contacts, and pitch system to earn coverage in-house, permanently.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={composite >= 65 ? EMOS_APPLY : EMOS_URL}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", padding: "10px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none" }}
              >
                {composite >= 65 ? "Apply to EMOS ↗" : "Explore EMOS ↗"}
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=https://syedirfanajmal.com/tools/pressiq`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", padding: "10px 16px", border: `1px solid ${ra(PAPER, 0.25)}`, color: ra(PAPER, 0.5), fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none" }}
              >
                Share score on X
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 02: Top Fixes ──────────────────────────────────────────────── */}
      {tab === "fixes" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 18 }}>
            THE 3 FIXES THAT MOVE YOUR SCORE MOST
          </div>
          {topFixes.map((f, i) => <FixCard key={i} rank={i + 1} fix={f} />)}
        </div>
      )}

      {/* ── Tab 03: Breakdown ─────────────────────────────────────────────── */}
      {tab === "breakdown" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 18 }}>
            FULL BREAKDOWN
          </div>
          {DIMS.filter((d) => d.key !== "relevance" || relevanceAssessed).map((dim) => {
            const area = areaFor(dim.key);
            return (
              <DimBlock
                key={dim.key}
                dim={dim}
                score={area.score}
                analysis={area.analysis}
                subSignals={area.subSignals}
                evidenceKeys={area.evidence}
                expanded={expanded.has(dim.key)}
                onToggle={() => toggleDim(dim.key)}
              />
            );
          })}
        </div>
      )}

      {/* ── Tab 04: Evidence ──────────────────────────────────────────────── */}
      {tab === "evidence" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 14 }}>
            THE RESEARCH BEHIND YOUR SCORE
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 22 }}>
            Scored against published journalist research — Cision &amp; Muck Rack 2026, Propel, Backlinko, Fractl, Boomerang. Open any dimension in the Breakdown tab to see the exact figures and sources.
          </div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 10 }}>
            WHY THIS IS WORTH MORE IN 2026
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 24 }}>
            In an AI-answer world you don&rsquo;t just rank — you get cited. AI engines lean on earned media (Muck Rack: ~82% of AI citations come from earned coverage), and brand mentions out-predict backlinks for AI-Overview visibility ~3× (Ahrefs, 75k brands). The placement this pitch is aiming for is exactly that kind of citation — so a stronger pitch compounds.
          </div>
          {!emailDone ? (
            <form onSubmit={onUnlockEmail} style={{ border: `1px solid ${INK}`, padding: 18, marginTop: 18 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 8 }}>
                UNLOCK {EMAIL_LIMIT} SCORES / MONTH
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.55), marginBottom: 12 }}>
                Add your email to raise your monthly limit and get SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ flex: 1, padding: "9px 12px", background: PAPER, border: `1px solid ${ra(INK, 0.18)}`, fontFamily: GROT, fontSize: 12, color: INK, outline: "none", borderRadius: 0 }}
                />
                <button type="submit" style={{ padding: "9px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  Unlock →
                </button>
              </div>
            </form>
          ) : (
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: GREEN, fontWeight: 600, marginTop: 18 }}>
              ✓ Unlocked — you now have {EMAIL_LIMIT} scores a month. Check your inbox.
            </div>
          )}
        </div>
      )}

      {/* Reset link */}
      <div style={{ padding: "8px 32px 32px", textAlign: "center", borderTop: `1px solid ${ra(INK, 0.08)}` }}>
        <button onClick={onReset} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.35) }}>
          ← Score another pitch
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PressIQPage() {
  const [pitch,    setPitch]    = useState("");
  const [query,    setQuery]    = useState("");
  const [subject,  setSubject]  = useState("");
  const [platform, setPlatform] = useState<Platform>("haro");
  const [brand,    setBrand]    = useState<BrandSignals>(EMPTY_BRAND);
  const [store,    setStore]    = useState(true);

  const [view,      setView]      = useState<"pre" | "loading" | "post">("pre");
  const [result,    setResult]    = useState<ScoreResponse | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [email,     setEmail]     = useState("");
  const [emailDone, setEmailDone] = useState(false);

  const rightRef = useRef<HTMLElement>(null);

  // ── localStorage persist ──────────────────────────────────────────────────
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore on mount */
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (typeof d.pitch    === "string") setPitch(d.pitch);
        if (typeof d.query    === "string") setQuery(d.query);
        if (typeof d.subject  === "string") setSubject(d.subject);
        if (typeof d.platform === "string") setPlatform(d.platform as Platform);
        if (d.brand && typeof d.brand === "object") setBrand({ ...EMPTY_BRAND, ...(d.brand as Partial<BrandSignals>) });
      }
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ pitch, query, subject, platform, brand })); } catch { /* ignore */ }
  }, [pitch, query, subject, platform, brand]);

  // ── Live Layer-1 (no API) ─────────────────────────────────────────────────
  const live = useMemo(() => {
    if (pitch.trim().length < 15) return null;
    return scoreLayer1(computeMetrics(pitch, subject));
  }, [pitch, subject]);

  const subjectPlaceholder = resolveSubject(pitch, subject) || "Re: [Query] — …";
  const canAnalyze = pitch.trim().length >= 40 && view !== "loading";

  // ── Handlers ─────────────────────────────────────────────────────────────
  function loadSample() {
    setPitch(SAMPLE_PITCH);
    setQuery(SAMPLE_QUERY);
    const firstLine = SAMPLE_PITCH.split("\n")[0];
    if (firstLine.startsWith("Subject: ")) setSubject(firstLine.replace("Subject: ", ""));
  }

  async function analyze() {
    if (!canAnalyze) return;
    setError(null);
    setView("loading");
    setResult(null);
    try {
      const res = await fetch("/api/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch, query, subject, platform, brandSignals: brand, store }),
      });
      const data = (await res.json()) as { error?: string } & ScoreResponse;
      if (!res.ok) {
        setError(data.error || "Something went wrong scoring your pitch.");
        setView("pre");
      } else {
        setResult(data);
        setView("post");
        setTimeout(() => rightRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
      }
    } catch {
      setError("Network error — please try again.");
      setView("pre");
    }
  }

  function reset() {
    setView("pre");
    setResult(null);
    setError(null);
    rightRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="piq-shell">

        {/* ── Site header ────────────────────────────────────────────────── */}
        <header className="piq-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, background: YEL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 11, color: DARK }}>
                SIA
              </div>
            </Link>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: PAPER, letterSpacing: "-.01em" }}>
              Press<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
            </span>
            <span style={{ width: 1, height: 18, background: ra(PAPER, 0.12), margin: "0 6px" }} />
            <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: ra(PAPER, 0.25) }}>
              Journalist Pitch Score · SIA Wire
            </span>
          </div>
          <Link href="/" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: ra(PAPER, 0.25), textDecoration: "none" }}>
            syedirfanajmal.com
          </Link>
        </header>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="piq-body">

          {/* ── Left panel — inputs ──────────────────────────────────────── */}
          <aside className="piq-left">

            {/* Logo block */}
            <div style={{ padding: "22px 22px 16px", borderBottom: `1px solid ${DARK_BD}` }}>
              <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PAPER, letterSpacing: "-.025em", lineHeight: 1 }}>
                Press<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: ra(PAPER, 0.20), marginTop: 8, lineHeight: 1.7 }}>
                Journalist pitch score<br />by Syed Irfan Ajmal · SIA Wire
              </div>
            </div>

            {/* Pitch */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>
                Your pitch{" "}
                <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>
                  · subject + body, as you&rsquo;d send it
                </span>
              </span>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Paste your full pitch here…"
                className="piq-field"
                style={{ ...LP_TEXTAREA, minHeight: 140 }}
              />
              <div style={{ marginTop: 6 }}>
                <button onClick={loadSample} className="piq-ghost">↻ Load a sample pitch</button>
              </div>
            </div>

            {/* Query */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>
                Journalist&rsquo;s query{" "}
                <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>
                  · strongly recommended
                </span>
              </span>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste the HARO / Qwoted source request you&rsquo;re answering…"
                className="piq-field"
                style={{ ...LP_TEXTAREA, minHeight: 60 }}
              />
            </div>

            {/* Subject */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>
                Subject line{" "}
                <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>
                  · optional — else parsed from line 1
                </span>
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={subjectPlaceholder}
                className="piq-field"
                style={{ ...LP_INPUT, marginBottom: 0 }}
              />
            </div>

            {/* Platform */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>Platform</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => setPlatform(p.id)} style={chipStyle(platform === p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Authority signals */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>
                Your authority signals{" "}
                <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>
                  · for the personal-brand score
                </span>
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {BRAND_LABELS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setBrand((b) => ({ ...b, [key]: !b[key] }))}
                    style={chipStyle(brand[key])}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Analyze */}
            <div style={{ ...LSEC, borderBottom: "none" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                <input
                  type="checkbox" checked={store}
                  onChange={(e) => setStore(e.target.checked)}
                  style={{ marginTop: 3, accentColor: YEL }}
                />
                <span style={{ fontFamily: SERIF, fontSize: 11.5, color: ra(PAPER, 0.32), lineHeight: 1.4 }}>
                  Let SIA store this pitch (anonymised) to improve the tool. Uncheck to score without storing.
                </span>
              </label>

              {error && (
                <div style={{ marginBottom: 12, padding: "10px 12px", border: `1px solid ${ra(AMBER, 0.5)}`, background: ra(AMBER, 0.08), fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: PAPER, lineHeight: 1.4 }}>
                  {error}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={!canAnalyze}
                style={{
                  width: "100%", padding: 14, border: "none",
                  background: canAnalyze ? YEL : ra(YEL, 0.35),
                  color: canAnalyze ? DARK : ra(DARK, 0.4),
                  fontFamily: GROT, fontWeight: 800, fontSize: 11,
                  letterSpacing: ".12em", textTransform: "uppercase",
                  cursor: canAnalyze ? "pointer" : "not-allowed",
                  transition: "opacity .12s", borderRadius: 0,
                }}
              >
                {view === "loading" ? "Scoring your pitch…" : "Analyze pitch →"}
              </button>
              <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: ".10em", textTransform: "uppercase", color: ra(PAPER, 0.16), textAlign: "center", lineHeight: 1.9 }}>
                {FREE_LIMIT} free scores / month · {EMAIL_LIMIT} with your email<br />
                scored against published journalist research
              </div>
            </div>

          </aside>

          {/* ── Right panel — output ──────────────────────────────────────── */}
          <main ref={rightRef} className="piq-right">
            {view === "pre"     && <PreScorePanel live={live} />}
            {view === "loading" && <LoadingPanel />}
            {view === "post"    && result && (
              <PostScorePanel
                result={result}
                email={email}
                setEmail={setEmail}
                emailDone={emailDone}
                onUnlockEmail={unlockEmail}
                onReset={reset}
              />
            )}
          </main>

        </div>
      </div>
    </>
  );
}

// ── Scoped CSS ────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .piq-shell{display:flex;flex-direction:column;height:100dvh;background:${DARK};overflow:hidden}
  .piq-header{background:${DARK};border-bottom:1px solid ${DARK_BD};display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:52px;flex-shrink:0;position:sticky;top:0;z-index:100}
  .piq-body{display:flex;flex:1;overflow:hidden}
  .piq-left{width:360px;flex-shrink:0;background:${DARK2};border-right:1px solid ${DARK_BD};overflow-y:auto;height:100%}
  .piq-right{flex:1;background:${PAPER};overflow-y:auto;height:100%}
  .piq-left::-webkit-scrollbar{width:6px}
  .piq-left::-webkit-scrollbar-track{background:${DARK}}
  .piq-left::-webkit-scrollbar-thumb{background:${DARK_BD};border-radius:0}
  .piq-right::-webkit-scrollbar{width:8px}
  .piq-right::-webkit-scrollbar-track{background:${PAPER}}
  .piq-right::-webkit-scrollbar-thumb{background:${ra(INK, 0.18)};border:2px solid ${PAPER}}
  .piq-field:focus{border-color:${ra(YEL, 0.5)} !important;outline:none}
  .piq-field::placeholder{color:${ra(PAPER, 0.22)}}
  .piq-ghost{background:none;border:none;cursor:pointer;font-family:${MONO};font-size:9px;color:${ra(PAPER, 0.35)};padding:0;transition:color .1s}
  .piq-ghost:hover{color:${YEL}}
  @keyframes piq-pulse{0%,80%,100%{opacity:.15}40%{opacity:1}}
  .piq-dot{display:inline-block;width:8px;height:8px;background:${YEL};animation:piq-pulse 1.2s infinite ease-in-out}
`;

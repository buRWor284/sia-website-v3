"use client";

/**
 * PressIQ — /tools/pressiq
 * Two-panel app layout: dark header · left input panel · right output panel.
 * Post-score: 4 tabs with prev/next footer nav, PDF report (email-gated).
 * Site header is suppressed for /tools/ routes (SiteHeader.tsx).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { ToolHeader } from "@/components/tools/ToolHeader";
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

// ── Tokens from lib/tokens ─────────────────────────────────────────────────────
import {
  DARK, DARK_BD, DARK2,
  GROT, INK, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";

// ── Tool-specific colours (not in shared tokens) ───────────────────────────────
const DARK3   = "#221e17";
const GREEN   = "#3e6b45";
const AMBER   = "#9a6a08";
const RED     = "#c14a32";
const BLUE    = "#2d5393";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ra = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
function bandColor(s: number) { return s >= 75 ? GREEN : s >= 45 ? AMBER : RED; }
// Tier thresholds that match the 4-tier design system (85/65/40/0)
function tierForScore(s: number) {
  if (s >= 85) return { color: GREEN, label: "Filed",           badge: "FILED"   };
  if (s >= 65) return { color: BLUE,  label: "Competitive",     badge: "LIVE"    };
  if (s >= 40) return { color: AMBER, label: "Needs work",      badge: "WARMING" };
  return             { color: RED,   label: "Will be ignored",  badge: "COLD"    };
}

// ── Lazy-load jsPDF (avoids next/script in "use client") ─────────────────────
function loadJsPDF(): Promise<new (opts: object) => object> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.jspdf?.jsPDF) { resolve(w.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload  = () => resolve(w.jspdf.jsPDF);
    s.onerror = () => reject(new Error("jsPDF failed to load"));
    document.head.appendChild(s);
  });
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = "score" | "fixes" | "breakdown" | "evidence";
const TABS: { id: Tab; label: string; short: string }[] = [
  { id: "score",     label: "01 · Score",     short: "Score"     },
  { id: "fixes",     label: "02 · Top Fixes", short: "Top Fixes" },
  { id: "breakdown", label: "03 · Breakdown", short: "Breakdown" },
  { id: "evidence",  label: "04 · Evidence",  short: "Evidence"  },
];

// ── Dimensions ────────────────────────────────────────────────────────────────
const DIMS = [
  { key: "relevance",      name: "Answering the brief",  short: "Relevance",  mech: "Relevance — the #1 filter"           },
  { key: "objective",      name: "Mechanics",             short: "Mechanics",  mech: "Mechanics (Respondable-style)"        },
  { key: "checklist",      name: "SIA 7-Step Checklist", short: "SIA 7-step", mech: "SIA 7-step journo-outreach checklist" },
  { key: "newsroomReady",  name: "Newsroom-ready",        short: "Newsroom",   mech: "Newsroom-ready — publishable material"},
  { key: "storytelling",   name: "Storytelling",          short: "Story",      mech: "Narrative transportation"             },
  { key: "neuromarketing", name: "Neuromarketing",        short: "Neuro",      mech: "System 1 + original data"             },
  { key: "personalBrand",  name: "Personal brand",        short: "Personal",   mech: "E-E-A-T & the halo effect"            },
] as const;
type DimKey = typeof DIMS[number]["key"];

// ── Ticker data ───────────────────────────────────────────────────────────────
const TICKER = [
  { stat: "82%",   text: "of journalists delete off-beat pitches",        src: "Cision 2026"           },
  { stat: "88%",   text: "immediately delete pitches outside their beat", src: "Muck Rack 2026"        },
  { stat: "3.03%", text: "response for 51–150 word pitches",              src: "Propel, 425k+ pitches" },
  { stat: "+36%",  text: "responses at 3rd-grade reading level",          src: "Boomerang, 40M emails" },
  { stat: "+50%",  text: "reply likelihood with 1–3 questions",           src: "Boomerang"             },
  { stat: "47%",   text: "want more data / research (#1 want)",           src: "Cision 2026"           },
  { stat: "58%",   text: "want source access for interviews",             src: "Muck Rack 2026"        },
  { stat: "53%",   text: "distrust generic, AI-sounding pitches",         src: "Cision 2026"           },
];

// ── Sample content ────────────────────────────────────────────────────────────
const SAMPLE_PITCH = `Subject: Re: Experts on the 4-day week — our 18-month data + [Stats + Examples]

Hi Sarah,

Loved your piece last month on remote-team burnout — the bit about "always-on guilt" mirrored exactly what we measured.

I'm Priya Raman, founder of Tilt (we run ops for 40 distributed startups). When we cut to a 4-day week 18 months ago, I was sure output would drop. It didn't. We tracked 1,200 employees across 12 companies: focused output rose 9%, and voluntary attrition fell by a third.

The counterintuitive part: the win wasn't "rest." It was that a hard deadline forced teams to kill low-value meetings — 22% of recurring meetings vanished in the first month.

Happy to share the raw dataset, or connect you with two founders who reversed course and went back to five days. Which would be more useful for your piece?

Priya Raman — Founder, Tilt · tilt.example.com
priya@tilt.example.com · @priyaraman · linkedin.com/in/priyaraman`;

const SAMPLE_QUERY = `Looking for founders / HR leads who have implemented a 4-day work week for at least 6 months and can share real performance data (retention, output, revenue impact). Especially interested in anyone who tried it and reversed course. For a feature in The Future of Work series. Requirements: Named source, must be available for a 15-min phone interview.`;

const SAMPLE_BEAT = `Covers the future of work, distributed teams, and workplace productivity. Writes the Future of Work series — regular features on 4-day weeks, remote-first culture, async practices, and workforce wellbeing data. Prefers named sources with real numbers from their own operations, not thought-leader takes.`;

const STORE_KEY = "sia.pressiq.v2";

// Cloudflare Turnstile site key (public). When unset, the widget is NOT rendered and
// scoring works exactly as before. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (+ the server
// TURNSTILE_SECRET_KEY) to enforce the human check end-to-end.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const BRAND_LABELS: { key: keyof BrandSignals; label: string }[] = [
  { key: "website",     label: "Personal website"  },
  { key: "bylines",     label: "Published bylines" },
  { key: "youtube",     label: "YouTube / video"   },
  { key: "speaking",    label: "Speaking history"  },
  { key: "caseStudies", label: "Case studies"      },
  { key: "linkedin",    label: "Active LinkedIn"   },
];

// ── Shared left-panel style atoms ─────────────────────────────────────────────
const LSEC: React.CSSProperties = { padding: "18px 22px", borderBottom: `1px solid ${DARK_BD}` };
const LSEC_LBL: React.CSSProperties = {
  fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".20em",
  textTransform: "uppercase", color: ra(PAPER, 0.5), marginBottom: 10, display: "block",
};
const LP_TEXTAREA: React.CSSProperties = {
  width: "100%", padding: "9px 11px", background: DARK3, border: `1px solid ${DARK_BD}`,
  fontFamily: GROT, fontSize: 12.5, color: PAPER, outline: "none", resize: "vertical", borderRadius: 0,
};
const LP_INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 11px", background: DARK3, border: `1px solid ${DARK_BD}`,
  fontFamily: GROT, fontSize: 12.5, color: PAPER, outline: "none", borderRadius: 0,
};
function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-block", padding: "5px 9px",
    border: `1px solid ${active ? YEL : DARK_BD}`, background: active ? YEL : "transparent",
    fontSize: 10.5, fontWeight: 600, cursor: "pointer",
    color: active ? DARK : ra(PAPER, 0.35), transition: "all .1s", fontFamily: GROT, margin: 2, borderRadius: 0,
  };
}

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
function Gauge({ score, color }: { score: number; color: string }) {
  const r = 70, circ = 2 * Math.PI * r, d = (score / 100) * circ;
  return (
    <svg viewBox="0 0 180 180" role="img" aria-label={`Score ${score} out of 100`} style={{ width: 180, height: 180 }}>
      <circle cx="90" cy="90" r={r} fill="none" stroke={ra(INK, 0.06)} strokeWidth="7" />
      <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${d.toFixed(1)} ${(circ - d).toFixed(1)}`} transform="rotate(-90 90 90)" />
      <text x="90" y="82" textAnchor="middle" fontFamily={SERIF} fontSize="48" fontWeight="700" fill={INK}>{score}</text>
      <text x="90" y="104" textAnchor="middle" fontFamily={GROT} fontSize="11" fontWeight="700" letterSpacing=".16em" fill={ra(INK, 0.35)}>/ 100</text>
    </svg>
  );
}

// ── Dimension bar chart (Score tab — handoff v2) ─────────────────────────────
function DimBarChart({ scores, dims }: { scores: Record<string, number>; dims: readonly typeof DIMS[number][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {dims.map((dim, i) => {
        const s = scores[dim.key] ?? 0;
        const t = tierForScore(s);
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
              <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontFamily: GROT, fontSize: 7, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.25) }}>
                {t.label.toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Signal chip ───────────────────────────────────────────────────────────────
function SignalChip({ label, met }: { label: string; met: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
      border: `1px solid ${met ? ra(GREEN, 0.4) : ra(RED, 0.35)}`, fontFamily: GROT, fontSize: 9.5, fontWeight: 600, color: met ? GREEN : RED }}>
      {met ? "✓" : "✗"} {label}
    </span>
  );
}

// ── Evidence card ─────────────────────────────────────────────────────────────
function EvidCard({ figKey }: { figKey: string }) {
  const ev = EVIDENCE[figKey];
  if (!ev) return null;
  return (
    <a href={ev.url} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", gap: 10, padding: "9px 12px", background: ra(INK, 0.025), border: `1px solid ${ra(INK, 0.06)}`, textDecoration: "none", marginBottom: 5 }}>
      <div style={{ width: 6, height: 6, background: YEL, marginTop: 5, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{ev.figure}</div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: ra(INK, 0.35), marginTop: 2 }}>{ev.source}</div>
      </div>
    </a>
  );
}

// ── Dimension block ───────────────────────────────────────────────────────────
function DimBlock({ dim, score, analysis, subSignals, evidenceKeys, expanded, onToggle }: {
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
          <span style={{ fontSize: 16, fontWeight: 700, color: ra(INK, 0.25), width: 16, textAlign: "center" }}>{expanded ? "–" : "+"}</span>
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
            <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.55), lineHeight: 1.6, marginBottom: 12 }}>{frame.text}</div>
            {evKeys.map(k => <EvidCard key={k} figKey={k} />)}
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
        <div style={{ width: 26, height: 26, background: YEL, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 13, color: INK }}>{rank}</div>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: PAPER }}>{fix.area}</div>
          {fix.mechanism && <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(PAPER, 0.35), marginTop: 2 }}>{fix.mechanism}</div>}
        </div>
      </div>
      <div style={{ padding: "14px 16px", fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.7), lineHeight: 1.6 }}>{fix.text}</div>
    </div>
  );
}

// ── Live meter ────────────────────────────────────────────────────────────────
function LiveMeter({ label, val, band, hint }: { label: string; val: string; band: "green" | "amber" | "red" | "neutral"; hint: string }) {
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

// ── Email gate modal ──────────────────────────────────────────────────────────
function EmailGate({ show, onClose, onUnlock, result }: {
  show: boolean; onClose: () => void;
  onUnlock: () => void; result: ScoreResponse | null;
}) {
  const [email, setEmail]     = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr]         = useState("");
  const [done, setDone]       = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email."); return; }
    if (!consent) { setErr("Please accept to continue."); return; }
    setErr("");
    fetch("/api/newsletter-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => {});
    document.cookie = `pp_tier=email; path=/; max-age=${60 * 60 * 24 * 365}`;
    setDone(true);
    setTimeout(() => { onUnlock(); onClose(); setDone(false); setEmail(""); setConsent(false); }, 900);
  }

  if (!show) return null;

  const score = result?.composite ?? 0;
  const tierColor = result?.tier?.color ?? BLUE;
  const tierLabel = result?.tier?.label ?? "—";

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div role="dialog" aria-modal="true" aria-label="Download your PressIQ report" style={{ background: PAPER2, border: `1px solid ${INK}`, maxWidth: 480, width: "100%", overflow: "hidden" }}>

        {/* Preview header */}
        <div style={{ background: INK, padding: "24px 28px" }}>
          <div style={{ fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".20em", textTransform: "uppercase", color: YEL, marginBottom: 10 }}>
            PRESSIQ · PITCH SCORE REPORT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: tierColor, lineHeight: 1 }}>{score}</div>
              <div style={{ fontFamily: GROT, fontSize: 9, color: ra(PAPER, 0.35), letterSpacing: ".14em" }}>/ 100</div>
            </div>
            <div>
              <span style={{ display: "inline-block", padding: "4px 10px", background: tierColor, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>
                {tierLabel.toUpperCase()}
              </span>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: PAPER, lineHeight: 1.4 }}>
                Your full report includes the radar, top fixes, per-dimension breakdown with evidence, and EMOS recommendations.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Cover + Score", "Top 3 Fixes", "Full Breakdown", "Research + EMOS"].map(s => (
              <span key={s} style={{ padding: "3px 8px", border: `1px solid ${ra(PAPER, 0.15)}`, fontFamily: MONO, fontSize: 7.5, color: ra(PAPER, 0.4), letterSpacing: ".10em", textTransform: "uppercase" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px 28px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "16px 0", fontFamily: SERIF, fontSize: 18, color: GREEN, fontWeight: 600 }}>
              ✓ Generating your PDF…
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK, marginBottom: 6, letterSpacing: "-.015em" }}>
                One step to download
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: ra(INK, 0.55), marginBottom: 18, lineHeight: 1.55 }}>
                Join 2,400+ marketers. Real earned-media playbooks, zero filler. One or two emails a month.
              </p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ width: "100%", padding: "10px 12px", background: PAPER, border: `1px solid ${ra(INK, 0.25)}`, fontFamily: GROT, fontSize: 13, color: INK, outline: "none", borderRadius: 0, marginBottom: 12 }} />
              <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: INK }} />
                <span style={{ fontFamily: GROT, fontSize: 11, color: ra(INK, 0.55), lineHeight: 1.5 }}>I agree to receive marketing emails from SIA Enterprises. Unsubscribe anytime.</span>
              </label>
              {err && <div style={{ fontFamily: MONO, fontSize: 10, color: RED, marginBottom: 10 }}>{err}</div>}
              <button type="submit" style={{ width: "100%", padding: "13px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".10em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 0 }}>
                Subscribe &amp; download PDF →
              </button>
              <div style={{ fontFamily: MONO, fontSize: 9, color: ra(INK, 0.3), textAlign: "center", marginTop: 10, letterSpacing: ".08em" }}>
                No spam · One-click unsubscribe
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Per-tab step navigation ───────────────────────────────────────────────────
function TabNav({ current, setTab, onReset }: { current: Tab; setTab: (t: Tab) => void; onReset: () => void }) {
  const idx = TABS.findIndex(t => t.id === current);
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null;
  function goNext(id: Tab) {
    setTab(id);
    document.querySelector(".piq-right")?.scrollTo({ top: 0, behavior: "smooth" });
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
        <button onClick={onReset} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "transparent", border: `1px solid ${ra(INK, 0.2)}`, color: ra(INK, 0.5), fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
          ← Score another pitch
        </button>
      )}
    </div>
  );
}

// ── Pre-score panel ───────────────────────────────────────────────────────────
function PreScorePanel({ live }: { live: ReturnType<typeof scoreLayer1> | null }) {
  const [tickIdx, setTickIdx] = useState(0);
  const [tickOp, setTickOp]   = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setTickOp(0);
      setTimeout(() => { setTickIdx(i => (i + 1) % TICKER.length); setTickOp(1); }, 200);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const t = TICKER[tickIdx];
  function st(s?: "ideal" | "ok" | "off"): "green" | "amber" | "red" | "neutral" {
    return !s ? "neutral" : s === "ideal" ? "green" : s === "ok" ? "amber" : "red";
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "40px 32px 32px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 14 }}>
          PRESSIQ · JOURNALIST PITCH SCORE
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px,3.8vw,42px)", lineHeight: 1.08, letterSpacing: "-.025em", color: INK, margin: "0 0 16px" }}>
          Will a journalist<br />
          <em style={{ fontStyle: "italic" }}><span style={{ background: YEL, color: INK, padding: "0 .12em" }}>paste this in?</span></em>
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: ra(INK, 0.5), lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
          Score any PR pitch — standalone outreach or a query response — against a 32-point system and the EMOS framework. Get the three fixes that move it most. No signup for your first {FREE_LIMIT}.
        </p>
      </div>

      {/* Live mechanics */}
      <div style={{ padding: "24px 32px 20px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 18 }}>
          LIVE MECHANICS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
          <LiveMeter label="Word count" val={live ? String(live.bands.wordCount.value) : "0"} band={st(live?.bands.wordCount.status)} hint={live ? live.bands.wordCount.hint : "Type to measure"} />
          <LiveMeter label="Subject length" val={live ? `${live.bands.subjectWords.value} word${live.bands.subjectWords.value !== 1 ? "s" : ""}` : "0 words"} band={st(live?.bands.subjectWords.status)} hint={live ? live.bands.subjectWords.hint : "Add a subject line"} />
          <LiveMeter label="Reading level" val={live ? `Grade ${Math.round(live.bands.readingGrade.value)}` : "—"} band={st(live?.bands.readingGrade.status)} hint={live ? live.bands.readingGrade.hint : "Need more text"} />
          <LiveMeter label="Closing question" val={live ? (live.metrics.hasClosingQuestion ? "Yes" : "No") : "—"} band={st(live?.bands.questions.status)} hint={live ? live.bands.questions.hint : "Need more text"} />
          <div style={{ gridColumn: "1/-1" }}>
            <LiveMeter label="Tone / subjectivity"
              val={live ? (live.bands.subjectivity.status === "ideal" ? "Clean" : live.bands.subjectivity.status === "ok" ? "Mild" : "Flagged") : "—"}
              band={st(live?.bands.subjectivity.status)} hint={live ? live.bands.subjectivity.hint : "Need more text"} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 14, borderTop: `1px solid ${ra(INK, 0.06)}` }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.35) }}>Mechanics score</span>
          <div style={{ flex: 1, height: 4, background: ra(INK, 0.05) }}>
            <div style={{ height: "100%", width: `${live?.score ?? 0}%`, background: BLUE, transition: "width .3s ease" }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: INK }}>{live?.score ?? 0}</span>
        </div>
      </div>

      {/* WHAT JOURNALISTS SAY — rotating ticker */}
      <div style={{ padding: "24px 32px 0" }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 16 }}>
          WHAT JOURNALISTS SAY
        </div>
        <div style={{ opacity: tickOp, transition: "opacity .2s ease", minHeight: 78 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: YEL, letterSpacing: "-.02em", lineHeight: 1, marginBottom: 6 }}>{t.stat}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.55), lineHeight: 1.4, marginBottom: 4 }}>{t.text}</div>
          <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.25) }}>{t.src}</div>
        </div>
      </div>

      {/* SCORED AGAINST — source pills */}
      <div style={{ padding: "20px 32px 28px", borderTop: `1px solid ${ra(INK, 0.08)}`, marginTop: 20 }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.32), marginBottom: 10 }}>
          SCORED AGAINST
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {[
            "Cision State of the Media 2026",
            "Muck Rack State of Journalism 2026",
            "Propel Media Barometer Q1 2024",
            "Backlinko Journalist Outreach Study",
            "Fractl Journalist Survey (n≈500)",
            "Boomerang Email Response Study (40M)",
          ].map(s => (
            <span key={s} style={{ padding: "4px 8px", border: `1px solid ${ra(INK, 0.08)}`, fontFamily: MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: ra(INK, 0.28) }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Loading panel ─────────────────────────────────────────────────────────────
function LoadingPanel() {
  return (
    <div style={{ padding: "80px 32px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: ra(INK, 0.35), marginBottom: 24, textAlign: "center" }}>
        Scoring against 32 factors across 7 dimensions…
      </div>
      <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.2), textAlign: "center", lineHeight: 1.9, marginBottom: 24 }}>
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

// ── Post-score panel ──────────────────────────────────────────────────────────
function PostScorePanel({
  result, tab, setTab, email, setEmail, emailDone, setEmailDone, onDownload, onReset, pitchMode,
}: {
  result: ScoreResponse; tab: Tab; setTab: (t: Tab) => void;
  email: string; setEmail: (v: string) => void;
  emailDone: boolean; setEmailDone: (v: boolean) => void;
  onDownload: () => void; onReset: () => void;
  pitchMode: "standalone" | "query";
}) {
  const [expanded, setExpanded] = useState<Set<DimKey>>(new Set());
  const { composite, tier, areas, relevanceAssessed, strongestLine, topFixes, authenticityRisk } = result;

  const scoreMap: Record<string, number> = {};
  if (areas.relevance) scoreMap.relevance = areas.relevance.score;
  scoreMap.objective = areas.objective.score; scoreMap.checklist = areas.checklist.score;
  scoreMap.newsroomReady = areas.newsroomReady.score; scoreMap.storytelling = areas.emos.storytelling.score;
  scoreMap.neuromarketing = areas.emos.neuromarketing.score; scoreMap.personalBrand = areas.emos.personalBrand.score;

  const radarDims = relevanceAssessed ? DIMS : DIMS.filter(d => d.key !== "relevance");

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
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  const shareText = encodeURIComponent(`My PR pitch scored ${composite}/100 (${tier.label}) on PressIQ by @syedirfanajmal. Score yours:`);

  async function unlockEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try { await fetch("/api/newsletter-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); } catch { /* non-fatal */ }
    document.cookie = `pp_tier=email; path=/; max-age=${60 * 60 * 24 * 365}`;
    setEmailDone(true);
  }

  return (
    <div>
      {/* Sticky tab bar — visually distinct, hover states via CSS */}
      <div className="piq-tabs" role="tablist" aria-label="Score views">
        <div style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.3), padding: "0 18px", display: "flex", alignItems: "center", borderRight: `1px solid ${ra(INK, 0.08)}`, marginRight: 4, whiteSpace: "nowrap" }}>
          View:
        </div>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} role="tab" aria-selected={tab === tb.id} className={`piq-tab${tab === tb.id ? " piq-tab-active" : ""}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Score ────────────────────────────────────────────────── */}
      {tab === "score" && (
        <div style={{ padding: "0 32px 28px" }}>
          <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
            <Gauge score={composite} color={tier.color} />
            <div style={{ marginTop: 14 }}>
              <span style={{ display: "inline-block", padding: "5px 12px 6px", background: tier.color, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase" }}>
                {tier.badge.toUpperCase()} · {tier.label.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, marginTop: 12, letterSpacing: "-.015em" }}>
              {composite >= 85 ? "Placement-grade." : composite >= 65 ? "Competitive — tighten it." : composite >= 40 ? "Real material, missing the system." : "This will get ignored."}
            </div>
          </div>

          {!relevanceAssessed && (
            <div style={{ padding: "13px 16px", marginBottom: 18, border: `1px solid ${AMBER}`, background: "rgba(217,146,17,.05)", fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.65) }}>
              {pitchMode === "query"
                ? "Scored without the journalist’s query, so relevance — the #1 driver of placement — wasn’t assessed. Add it for a full score."
                : "No journalist beat was provided, so relevance — the #1 driver of placement — wasn’t assessed. Add the journalist’s beat for a fuller score."}
            </div>
          )}
          {authenticityRisk?.flagged && (
            <div style={{ padding: "13px 16px", marginBottom: 18, border: `1px solid ${RED}`, background: "rgba(193,74,50,.04)" }}>
              <span style={{ display: "inline-block", padding: "3px 8px", background: RED, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>READS TEMPLATED</span>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.65) }}>{authenticityRisk.note || "This reads like a template anyone could send. Add a first-hand detail or a number only you have — 53% of journalists distrust generic, AI-sounding pitches."}</div>
            </div>
          )}

          {strongestLine && (
            <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 20, marginTop: 4 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 8 }}>YOUR STRONGEST LINE</div>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: INK, lineHeight: 1.5, borderLeft: `3px solid ${YEL}`, paddingLeft: 16 }}>&ldquo;{strongestLine}&rdquo;</div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 22, marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35) }}>YOUR PITCH, BY DIMENSION</div>
              <div style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(INK, 0.28) }}>Full breakdown in 03 →</div>
            </div>
            <DimBarChart scores={scoreMap} dims={radarDims} />
          </div>

          {/* Scored Against */}
          <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 20, marginTop: 22 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 10 }}>SCORED AGAINST</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
              {["SIA 7-STEP CHECKLIST", "SIA 32-FACTOR SCORING SYSTEM", "EMOS FRAMEWORK"].map(s => (
                <span key={s} style={{ padding: "3px 7px", background: INK, fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: YEL }}>{s}</span>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Cision State of the Media 2026", "Muck Rack State of Journalism 2026", "Propel Media Barometer", "Backlinko Journalist Outreach", "Fractl Journalist Survey", "Boomerang Email Study (40M)"].map(s => (
                <span key={s} style={{ padding: "3px 7px", border: `1px solid ${ra(INK, 0.1)}`, fontFamily: MONO, fontSize: 7, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: ra(INK, 0.3) }}>{s}</span>
              ))}
            </div>
          </div>

          <TabNav current={tab} setTab={setTab} onReset={onReset} />

          {/* EMOS CTA */}
          <div style={{ background: INK, padding: 22, marginTop: 22 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: YEL, marginBottom: 8 }}>
              {composite >= 85 ? "YOU'VE GOT THE STANDARD — NOW SCALE IT" : "WHERE THIS SCORING COMES FROM"}
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: PAPER, letterSpacing: "-.01em", marginBottom: 6 }}>
              This tool scores one pitch.<br /><span style={{ color: YEL }}>EMOS builds the whole pipeline.</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(PAPER, 0.55), lineHeight: 1.6, marginBottom: 14 }}>
              PressIQ runs on the EMOS framework — Personal Branding × Storytelling × Neuromarketing. The full Earned Media Operating System hands your team the playbooks, journalist contacts, and pitch system to earn coverage in-house, permanently.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={composite >= 65 ? EMOS_APPLY : EMOS_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", padding: "10px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none" }}>
                {composite >= 65 ? "Apply to EMOS ↗" : "Explore EMOS ↗"}
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=https://syedirfanajmal.com/tools/pressiq`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", padding: "10px 16px", border: `1px solid ${ra(PAPER, 0.25)}`, color: ra(PAPER, 0.5), fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none" }}>
                Share score on X
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Top Fixes ───────────────────────────────────────────── */}
      {tab === "fixes" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 18 }}>THE 3 FIXES THAT MOVE YOUR SCORE MOST</div>
          {topFixes.map((f, i) => <FixCard key={i} rank={i + 1} fix={f} />)}
          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}

      {/* ── Tab: Breakdown ───────────────────────────────────────────── */}
      {tab === "breakdown" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 18 }}>FULL BREAKDOWN</div>
          {DIMS.filter(d => d.key !== "relevance" || relevanceAssessed).map(dim => {
            const area = areaFor(dim.key);
            return <DimBlock key={dim.key} dim={dim} score={area.score} analysis={area.analysis} subSignals={area.subSignals} evidenceKeys={area.evidence} expanded={expanded.has(dim.key)} onToggle={() => toggleDim(dim.key)} />;
          })}
          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}

      {/* ── Tab: Evidence ────────────────────────────────────────────── */}
      {tab === "evidence" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 14 }}>THE RESEARCH BEHIND YOUR SCORE</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 22 }}>
            Scored against published journalist research — Cision &amp; Muck Rack 2026, Propel, Backlinko, Fractl, Boomerang. Open any dimension in the Breakdown tab to see the exact figures and sources.
          </div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 10 }}>WHY THIS IS WORTH MORE IN 2026</div>
          <div style={{ fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 24 }}>
            In an AI-answer world you don&rsquo;t just rank — you get cited. AI engines lean on earned media (Muck Rack: ~82% of AI citations come from earned coverage), and brand mentions out-predict backlinks for AI-Overview visibility ~3× (Ahrefs, 75k brands). The placement this pitch is aiming for is exactly that kind of citation — so a stronger pitch compounds.
          </div>

          {/* PDF report download (value-add beyond design spec) */}
          <div style={{ padding: "16px 18px", border: `1px solid ${ra(INK, 0.15)}`, background: PAPER2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK, marginBottom: 3 }}>Download PDF report</div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: ra(INK, 0.55) }}>Cover, score, top fixes, full breakdown, EMOS recommendations.</div>
            </div>
            <button onClick={onDownload} style={{ padding: "10px 18px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", border: "none", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 0 }}>
              Download report ↓
            </button>
          </div>

          {/* Email unlock */}
          {!emailDone ? (
            <form onSubmit={unlockEmail} style={{ border: `1px solid ${INK}`, padding: 18 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.35), marginBottom: 8 }}>UNLOCK {EMAIL_LIMIT} SCORES / MONTH</div>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.55), marginBottom: 12 }}>Add your email to raise your monthly limit and get SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={{ flex: 1, padding: "9px 12px", background: PAPER, border: `1px solid ${ra(INK, 0.18)}`, fontFamily: GROT, fontSize: 12, color: INK, outline: "none", borderRadius: 0 }} />
                <button type="submit" style={{ padding: "9px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Unlock →</button>
              </div>
            </form>
          ) : (
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: GREEN, fontWeight: 600 }}>✓ Unlocked — you now have {EMAIL_LIMIT} scores a month. Check your inbox.</div>
          )}

          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}
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
  const [pitchMode, setPitchMode] = useState<"standalone" | "query">("standalone");
  const [journalistBeat, setJournalistBeat] = useState("");
  const [view,     setView]     = useState<"pre" | "loading" | "post">("pre");
  const [result,   setResult]   = useState<ScoreResponse | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [tab,      setTab]      = useState<Tab>("score");
  const [email,    setEmail]    = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [showGate, setShowGate]   = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const rightRef = useRef<HTMLElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  // localStorage persist
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (typeof d.pitch    === "string") setPitch(d.pitch);
        if (typeof d.query    === "string") setQuery(d.query);
        if (typeof d.subject  === "string") setSubject(d.subject);
        if (typeof d.platform === "string") setPlatform(d.platform as Platform);
        if (d.brand && typeof d.brand === "object") setBrand({ ...EMPTY_BRAND, ...(d.brand as Partial<BrandSignals>) });
        if (d.pitchMode === "standalone" || d.pitchMode === "query") setPitchMode(d.pitchMode as "standalone" | "query");
        if (typeof d.journalistBeat === "string") setJournalistBeat(d.journalistBeat);
      }
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ pitch, query, subject, platform, brand, pitchMode, journalistBeat })); } catch { /* ignore */ }
  }, [pitch, query, subject, platform, brand, pitchMode, journalistBeat]);

  // Cloudflare Turnstile: render the human-check widget when configured. No-op when
  // NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, so the tool keeps working without it.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const render = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (!w.turnstile || !turnstileRef.current || turnstileWidgetId.current) return;
      turnstileWidgetId.current = w.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).turnstile) { render(); return; }
    const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let s = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
    if (!s) {
      s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", render);
    return () => { s?.removeEventListener("load", render); };
  }, []);

  const live = useMemo(() => {
    if (pitch.trim().length < 15) return null;
    return scoreLayer1(computeMetrics(pitch, subject));
  }, [pitch, subject]);

  const subjectPlaceholder = resolveSubject(pitch, subject) || "Re: [Query] — …";
  const canAnalyze = pitch.trim().length >= 40 && view !== "loading" && (!TURNSTILE_SITE_KEY || !!turnstileToken);

  function loadSample() {
    setPitch(SAMPLE_PITCH);
    if (pitchMode === "query") setQuery(SAMPLE_QUERY);
    else setJournalistBeat(SAMPLE_BEAT);
    const fl = SAMPLE_PITCH.split("\n")[0];
    if (fl.startsWith("Subject: ")) setSubject(fl.replace("Subject: ", ""));
  }

  async function analyze() {
    if (!canAnalyze) return;
    setError(null); setView("loading"); setResult(null); setTab("score");
    try {
      const res = await fetch("/api/pitch-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pitch, query: pitchMode === "standalone" ? journalistBeat : query, subject, platform, brandSignals: brand, store, pitchMode, turnstileToken }) });
      const data = (await res.json()) as { error?: string } & ScoreResponse;
      if (!res.ok) { setError(data.error || "Something went wrong scoring your pitch."); setView("pre"); }
      else { setResult(data); setView("post"); setTimeout(() => rightRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50); }
    } catch { setError("Network error — please try again."); setView("pre"); }
    finally {
      // Turnstile tokens are single-use — refresh for the next submission.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (TURNSTILE_SITE_KEY && turnstileWidgetId.current && w.turnstile) {
        w.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken("");
      }
    }
  }

  function reset() { setView("pre"); setResult(null); setError(null); setTab("score"); rightRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }

  // PDF generation
  const generatePDF = useCallback(async () => {
    if (!result) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JsPDF: any;
    try { JsPDF = await loadJsPDF(); } catch { alert("PDF library failed to load. Check your connection and try again."); return; }

    const doc = new JsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297;
    const ML = 22, MR = 22;          // left / right margin
    const CW = W - ML - MR;          // content width = 166mm
    const iINK:   [number,number,number] = [26, 20, 16];
    const iGOLD:  [number,number,number] = [245, 184, 31];
    const iCREAM: [number,number,number] = [241, 235, 222];
    const iCREAM2:[number,number,number] = [232, 224, 204]; // PAPER2
    const iMID:   [number,number,number] = [130, 120, 108];
    const iDIM:   [number,number,number] = [80, 72, 62];
    const iDARK:  [number,number,number] = [14, 13, 10];
    const iDARKBD:[number,number,number] = [42, 35, 24];

    const tierRGB = (color: string): [number,number,number] => {
      const n = parseInt(color.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [tR,tG,tB] = tierRGB(result.tier.color);
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const pitchSubject = (subject || resolveSubject(pitch, subject) || "Pitch Review").substring(0, 72);

    // ── Shared helpers ────────────────────────────────────────────────────────
    function pgFooter(page: number, dark = false) {
      const FOOT_H = 14, footY = H - 5;
      if (dark) {
        doc.setFillColor(...iDARK); doc.rect(0, H - FOOT_H, W, FOOT_H, "F");
        doc.setDrawColor(...iDARKBD); doc.setLineWidth(0.4); doc.line(0, H - FOOT_H, W, H - FOOT_H);
        doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iGOLD);
        doc.text("PRESSIQ", ML, footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(70, 62, 50);
        doc.text("  ·  EMOS TOOL SUITE  ·  SYEDIRFANAJMAL.COM", ML + 13, footY);
      } else {
        doc.setFillColor(...iCREAM2); doc.rect(0, H - FOOT_H, W, FOOT_H, "F");
        doc.setDrawColor(210, 204, 190); doc.setLineWidth(0.4); doc.line(0, H - FOOT_H, W, H - FOOT_H);
        doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iINK);
        doc.text("PRESSIQ", ML, footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(...iMID);
        doc.text("  ·  EMOS TOOL SUITE  ·  SYEDIRFANAJMAL.COM", ML + 13, footY);
      }
      doc.setFont("helvetica","normal"); doc.setFontSize(5.5);
      doc.setTextColor(dark ? 70 : 130, dark ? 62 : 120, dark ? 50 : 108);
      doc.text(`${page}`, W - MR, footY, { align: "right" });
    }

    function innerPageSetup(sectionLabel: string) {
      // Full warm-cream background
      doc.setFillColor(...iCREAM); doc.rect(0, 0, W, H, "F");
      // Gold top rule (3mm)
      doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 3, "F");
      // Header row
      const hY = 13;
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...iINK);
      doc.text("Press", ML, hY);
      const pw = doc.getTextWidth("Press");
      doc.setTextColor(...iGOLD); doc.text("IQ", ML + pw, hY);
      doc.setFont("helvetica","normal"); doc.setFontSize(5.5); doc.setTextColor(...iMID);
      doc.text(sectionLabel.toUpperCase(), W - MR, hY, { align: "right" });
      // Full-width hairline under header
      doc.setDrawColor(...iINK); doc.setLineWidth(0.6); doc.line(0, 16, W, 16);
      return 24; // starting Y for content
    }

    // ── PAGE 1: DARK COVER ────────────────────────────────────────────────────
    // Full dark background
    doc.setFillColor(...iDARK); doc.rect(0, 0, W, H, "F");
    // Gold top bar (5mm) + bottom bar (5mm)
    doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 5, "F");
    doc.setFillColor(...iGOLD); doc.rect(0, H - 5, W, 5, "F");
    // Subtle vertical gold accent strip (left edge)
    doc.setFillColor(40, 32, 20); doc.rect(0, 5, 4, H - 10, "F");

    // SIA mark (top-left)
    doc.setFillColor(...iGOLD); doc.rect(ML, 14, 14, 14, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...iINK);
    doc.text("SIA", ML + 7, 23, { align: "center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(100, 90, 72);
    doc.text("Syed Irfan Ajmal  ·  syedirfanajmal.com", ML + 18, 21);

    // Eyebrow
    let y = 72;
    doc.setFillColor(...iGOLD); doc.rect(ML, y, 18, 1.2, "F");
    doc.setFillColor(38, 30, 20); doc.rect(ML + 20, y, CW - 20, 1.2, "F");
    y += 7;
    doc.setFont("helvetica","bold"); doc.setFontSize(6.5); doc.setTextColor(...iGOLD);
    doc.text("JOURNALIST PITCH SCORE REPORT", ML, y);

    // Wordmark
    y += 14;
    doc.setFont("helvetica","bold"); doc.setFontSize(52); doc.setTextColor(...iCREAM);
    doc.text("Press", ML, y);
    const pressW = doc.getTextWidth("Press");
    doc.setTextColor(...iGOLD); doc.text("IQ", ML + pressW, y);

    // Tagline
    y += 9;
    doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.setTextColor(150, 138, 118);
    doc.text("Your personalised pitch analysis", ML, y);

    // ── Score block ───────────────────────────────────────────────────────────
    y += 20;
    // Score number (large)
    const scoreX = ML + 2;
    doc.setFont("helvetica","bold"); doc.setFontSize(72); doc.setTextColor(...iGOLD);
    doc.text(String(result.composite), scoreX, y + 22);
    const scoreNumW = doc.getTextWidth(String(result.composite));
    // "/100" next to score
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(80, 72, 58);
    doc.text("/ 100", scoreX + scoreNumW + 2, y + 18);
    // Tier badge pill
    doc.setFillColor(tR, tG, tB); doc.rect(scoreX, y + 26, 38, 7, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(255, 255, 255);
    doc.text(result.tier.label.toUpperCase(), scoreX + 19, y + 31, { align: "center" });

    // Verdict + subject (right of score)
    const vX = scoreX + 56;
    const vW = W - MR - vX;
    doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...iCREAM);
    const headText = result.composite >= 85 ? "Placement-grade." : result.composite >= 65 ? "Competitive — tighten it." : result.composite >= 40 ? "Real material, missing the system." : "This will get ignored.";
    const headLines = doc.splitTextToSize(headText, vW) as string[];
    headLines.forEach((l, i) => doc.text(l, vX, y + 6 + i * 8));

    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(100, 90, 72);
    const subjLines = doc.splitTextToSize(pitchSubject, vW) as string[];
    let subjY = y + 6 + headLines.length * 8 + 5;
    subjLines.slice(0, 3).forEach(l => { doc.text(l, vX, subjY); subjY += 5.5; });

    // Thin horizontal rule below score block
    y += 40;
    doc.setDrawColor(38, 30, 20); doc.setLineWidth(0.4); doc.line(ML, y, W - MR, y);

    // Date
    y += 5;
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(70, 62, 50);
    doc.text(date, W - MR, y, { align: "right" });

    pgFooter(1, true);

    // ── PAGE 2: SCORE SUMMARY ─────────────────────────────────────────────────
    doc.addPage(); y = innerPageSetup("Score Summary");

    const dimOrder = (result.relevanceAssessed ? DIMS : DIMS.filter(d => d.key !== "relevance")) as typeof DIMS[number][];
    const scoreMap2: Record<string, number> = {};
    if (result.areas.relevance) scoreMap2.relevance = result.areas.relevance.score;
    scoreMap2.objective = result.areas.objective.score;
    scoreMap2.checklist = result.areas.checklist.score;
    scoreMap2.newsroomReady = result.areas.newsroomReady.score;
    scoreMap2.storytelling = result.areas.emos.storytelling.score;
    scoreMap2.neuromarketing = result.areas.emos.neuromarketing.score;
    scoreMap2.personalBrand = result.areas.emos.personalBrand.score;

    // Section heading
    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
    doc.text("Score by Dimension", ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
    doc.text("How your pitch performs across each scoring area.", ML, y); y += 10;

    // Dimension rows
    const BAR_X = ML + 90, BAR_W = CW - 90, ROW_H = 14;
    dimOrder.forEach((d, i) => {
      const s = scoreMap2[d.key] ?? 0;
      const [dr,dg,db] = tierRGB(s >= 75 ? GREEN : s >= 45 ? AMBER : RED);
      const rowY = y + i * ROW_H;
      // Alternating row tint
      if (i % 2 === 0) { doc.setFillColor(236, 229, 213); doc.rect(ML - 2, rowY - 4, CW + 4, ROW_H, "F"); }
      // Dimension name
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...iINK);
      doc.text(d.name, ML, rowY + 4);
      // Score number
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(dr,dg,db);
      doc.text(String(s), BAR_X - 6, rowY + 4, { align: "right" });
      // Bar track
      doc.setFillColor(210, 204, 190); doc.rect(BAR_X, rowY, BAR_W, 5, "F");
      // Bar fill
      doc.setFillColor(dr,dg,db); doc.rect(BAR_X, rowY, BAR_W * s / 100, 5, "F");
    });
    y += dimOrder.length * ROW_H + 10;

    // Composite score callout
    doc.setFillColor(...iINK); doc.rect(ML, y, CW, 18, "F");
    doc.setFillColor(...iGOLD); doc.rect(ML, y, 3, 18, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...iGOLD);
    doc.text(String(result.composite), ML + 10, y + 13);
    const compNumW = doc.getTextWidth(String(result.composite));
    doc.setFontSize(7); doc.setTextColor(100, 90, 72);
    doc.text("/ 100", ML + 11 + compNumW, y + 10);
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...iCREAM);
    doc.text("COMPOSITE SCORE", ML + 50, y + 7);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(160, 148, 130);
    doc.text(result.tier.label, ML + 50, y + 14);
    y += 26;

    // Strongest line callout
    if (result.strongestLine) {
      doc.setFillColor(...iCREAM2); doc.rect(ML, y, CW, 18, "F");
      doc.setFillColor(...iGOLD); doc.rect(ML, y, 3, 18, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iMID);
      doc.text("YOUR STRONGEST LINE", ML + 7, y + 5);
      doc.setFont("helvetica","italic"); doc.setFontSize(8.5); doc.setTextColor(...iDIM);
      const sLine = doc.splitTextToSize(`"${result.strongestLine}"`, CW - 10) as string[];
      doc.text(sLine[0] || "", ML + 7, y + 13);
    }

    pgFooter(2);

    // ── PAGE 3: TOP FIXES ─────────────────────────────────────────────────────
    doc.addPage(); y = innerPageSetup("Top 3 Fixes");

    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
    doc.text("The 3 Fixes That Move Your Score Most", ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
    doc.text("Address these in order — each one compounds the next.", ML, y); y += 12;

    result.topFixes.slice(0, 3).forEach((f, i) => {
      // Fix header bar (dark)
      doc.setFillColor(...iINK); doc.rect(ML, y, CW, 12, "F");
      // Gold rank square
      doc.setFillColor(...iGOLD); doc.rect(ML, y, 12, 12, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...iINK);
      doc.text(String(i + 1), ML + 6, y + 8.5, { align: "center" });
      // Fix name
      doc.setFontSize(9.5); doc.setTextColor(...iCREAM);
      doc.text(f.area, ML + 16, y + 8.5);
      // Mechanism tag (right-aligned)
      if (f.mechanism) {
        doc.setFont("helvetica","normal"); doc.setFontSize(5.5); doc.setTextColor(100, 90, 72);
        doc.text(f.mechanism.toUpperCase(), ML + CW, y + 8.5, { align: "right" });
      }
      y += 12;
      // Fix body
      doc.setFillColor(...iCREAM2); doc.rect(ML, y, CW, 0.4, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...iDIM);
      const fLines = doc.splitTextToSize(f.text, CW - 6) as string[];
      const fH = fLines.length * 5.2 + 10;
      doc.setFillColor(236, 229, 213); doc.rect(ML, y, CW, fH, "F");
      doc.text(fLines, ML + 4, y + 6);
      y += fH + 8;
    });

    pgFooter(3);

    // ── PAGE 4: FULL BREAKDOWN ────────────────────────────────────────────────
    doc.addPage(); y = innerPageSetup("Full Breakdown");
    let breakdownPage = 4;

    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
    doc.text("Dimension-by-Dimension Analysis", ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
    doc.text("Every scoring dimension explained, with AI-generated improvement guidance.", ML, y); y += 12;

    for (const d of dimOrder) {
      const area = (() => {
        if (d.key === "relevance")      return result.areas.relevance ?? { score: 0, analysis: "" };
        if (d.key === "objective")      return result.areas.objective;
        if (d.key === "checklist")      return result.areas.checklist;
        if (d.key === "newsroomReady")  return result.areas.newsroomReady;
        if (d.key === "storytelling")   return result.areas.emos.storytelling;
        if (d.key === "neuromarketing") return result.areas.emos.neuromarketing;
        return result.areas.emos.personalBrand;
      })();
      const s = area.score;
      const [dr,dg,db] = tierRGB(s >= 75 ? GREEN : s >= 45 ? AMBER : RED);
      const aLines = area.analysis ? doc.splitTextToSize(area.analysis, CW - 4) as string[] : [];
      const blockH = 8 + 5 + (aLines.length > 0 ? aLines.slice(0,4).length * 4.8 + 4 : 0) + 4;

      if (y + blockH > H - 24) {
        pgFooter(breakdownPage); doc.addPage(); breakdownPage++;
        y = innerPageSetup("Full Breakdown (cont.)");
      }

      // Dim heading row
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...iINK);
      doc.text(d.name, ML, y);
      doc.setTextColor(dr,dg,db); doc.text(String(s), ML + CW, y, { align: "right" }); y += 4;
      // Progress bar (6mm tall, full width)
      doc.setFillColor(210, 204, 190); doc.rect(ML, y, CW, 4, "F");
      doc.setFillColor(dr,dg,db); doc.rect(ML, y, CW * s / 100, 4, "F"); y += 7;
      // Analysis text
      if (aLines.length > 0) {
        doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...iDIM);
        aLines.slice(0, 4).forEach(l => { doc.text(l, ML, y); y += 4.8; });
      }
      // Hairline separator
      doc.setDrawColor(210, 204, 190); doc.setLineWidth(0.2); doc.line(ML, y + 2, ML + CW, y + 2);
      y += 8;
    }
    pgFooter(breakdownPage);

    // ── PAGE 5: EMOS CTA (DARK) ───────────────────────────────────────────────
    doc.addPage();
    doc.setFillColor(...iDARK); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 5, "F");
    doc.setFillColor(...iGOLD); doc.rect(0, H - 5, W, 5, "F");
    doc.setFillColor(22, 18, 12); doc.rect(0, 5, 4, H - 10, "F");

    // SIA mark (centred)
    y = 60;
    doc.setFillColor(...iGOLD); doc.rect(W / 2 - 18, y, 36, 36, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.setTextColor(...iINK);
    doc.text("SIA", W / 2, y + 22, { align: "center" }); y += 48;

    // Eyebrow
    doc.setFont("helvetica","bold"); doc.setFontSize(6.5); doc.setTextColor(...iGOLD);
    doc.text("WANT RESULTS LIKE THESE AT SCALE?", W / 2, y, { align: "center" }); y += 5;
    // Gold rule
    doc.setFillColor(...iGOLD); doc.rect(W / 2 - 20, y, 40, 0.8, "F"); y += 10;

    // Headline
    doc.setFont("helvetica","bold"); doc.setFontSize(28); doc.setTextColor(...iCREAM);
    doc.text("Earned Media", W / 2, y, { align: "center" }); y += 9;
    doc.setTextColor(...iGOLD); doc.text("Operating System", W / 2, y, { align: "center" }); y += 14;

    // Body copy
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(140, 128, 110);
    const ctaBody = doc.splitTextToSize(
      "The step-by-step system for founders who want press, partnerships, and authority — before their Series A.",
      110
    ) as string[];
    ctaBody.forEach(l => { doc.text(l, W / 2, y, { align: "center" }); y += 6; });
    y += 8;

    // CTA button (gold pill)
    doc.setFillColor(...iGOLD); doc.rect(W / 2 - 56, y, 112, 14, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...iINK);
    doc.text("syedirfanajmal.com/emos", W / 2, y + 9.5, { align: "center" });

    // Generated credit (bottom)
    doc.setFont("helvetica","normal"); doc.setFontSize(6); doc.setTextColor(60, 52, 40);
    doc.text(`Generated via PressIQ  ·  ${date}`, W / 2, H - 12, { align: "center" });

    doc.save(`PressIQ-Report-${date.replace(/ /g,"-")}.pdf`);
  }, [result, pitch, subject]);

  return (
    <>
      <style>{PAGE_CSS}</style>
      <EmailGate show={showGate} onClose={() => setShowGate(false)} onUnlock={() => { setShowGate(false); generatePDF(); }} result={result} />

      <div className="piq-shell">

        {/* ── Header ───────────────────────────────────────────────── */}
        <ToolHeader
          toolPrefix="Press"
          subtitle="Journalist Pitch Score · SIA Wire"
          rightContent={
            <Link href="/" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.55)", textDecoration: "none" }}>
              ← syedirfanajmal.com
            </Link>
          }
        />

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="piq-body">

          {/* Left panel */}
          <aside className="piq-left">
            <div style={{ padding: "22px 22px 16px", borderBottom: `1px solid ${DARK_BD}` }}>
              <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PAPER, letterSpacing: "-.025em", lineHeight: 1 }}>
                Press<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: ra(PAPER, 0.20), marginTop: 8, lineHeight: 1.7 }}>
                Journalist pitch score<br />by Syed Irfan Ajmal · SIA Wire
              </div>
            </div>

            {/* ── Pitch type toggle ──────────────────────────────── */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>Pitch type</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button onClick={() => setPitchMode("standalone")} style={chipStyle(pitchMode === "standalone")}>Standalone outreach</button>
                <button onClick={() => setPitchMode("query")} style={chipStyle(pitchMode === "query")}>Answering a query</button>
              </div>
              <em style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(PAPER, 0.28), lineHeight: 1.5, display: "block", marginTop: 10 }}>
                {pitchMode === "standalone"
                  ? "Proactive pitch to a journalist you’ve targeted. Relevance is scored against their known beat."
                  : "Response to a HARO / Qwoted / Featured source request. Relevance is scored against their specific ask."}
              </em>
            </div>

            {/* ── Journalist context (beat or query) ────────────── */}
            <div style={LSEC}>
              {pitchMode === "standalone" ? (
                <>
                  <span style={LSEC_LBL}>Journalist&rsquo;s beat <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· optional — what topics they cover</span></span>
                  <textarea value={journalistBeat} onChange={e => setJournalistBeat(e.target.value)} placeholder="e.g. Covers SaaS growth, founder stories, and future-of-work data. Writes for TechCrunch’s Startups desk." className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 72 }} />
                </>
              ) : (
                <>
                  <span style={LSEC_LBL}>Journalist&rsquo;s query <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· the source request you&rsquo;re answering</span></span>
                  <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Paste the HARO / Qwoted / Featured query here…" className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 72 }} />
                </>
              )}
            </div>

            <div style={LSEC}>
              <span style={LSEC_LBL}>Your pitch</span>
              <textarea value={pitch} onChange={e => setPitch(e.target.value)} placeholder="Paste your full pitch here…" className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 140 }} />
              <div style={{ marginTop: 6 }}><button onClick={loadSample} className="piq-ghost">↻ Load a sample pitch</button></div>
            </div>

            <div style={LSEC}>
              <span style={LSEC_LBL}>Subject line <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· optional — else parsed from line 1</span></span>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={subjectPlaceholder} className="piq-field" style={{ ...LP_INPUT, marginBottom: 0 }} />
            </div>

            <div style={LSEC}>
              <span style={LSEC_LBL}>Platform</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {PLATFORMS.map(p => <button key={p.id} onClick={() => setPlatform(p.id)} style={chipStyle(platform === p.id)}>{p.label}</button>)}
              </div>
            </div>

            <div style={LSEC}>
              <span style={LSEC_LBL}>Your authority signals <span style={{ color: ra(PAPER, 0.15), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· for the personal-brand score</span></span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {BRAND_LABELS.map(({ key, label }) => (
                  <button key={key} onClick={() => setBrand(b => ({ ...b, [key]: !b[key] }))} style={chipStyle(brand[key])}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ ...LSEC, borderBottom: "none" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={store} onChange={e => setStore(e.target.checked)} style={{ marginTop: 3, accentColor: YEL }} />
                <span style={{ fontFamily: SERIF, fontSize: 11.5, color: ra(PAPER, 0.32), lineHeight: 1.4 }}>Let SIA store this pitch (anonymised) to improve the tool.</span>
              </label>
              {TURNSTILE_SITE_KEY && <div ref={turnstileRef} style={{ marginBottom: 12 }} />}
              {error && (
                <div style={{ marginBottom: 12, padding: "10px 12px", border: `1px solid ${ra(AMBER, 0.5)}`, background: ra(AMBER, 0.08), fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: PAPER, lineHeight: 1.4 }}>{error}</div>
              )}
              <button onClick={analyze} disabled={!canAnalyze} style={{ width: "100%", padding: 14, border: "none", background: canAnalyze ? YEL : ra(YEL, 0.35), color: canAnalyze ? DARK : ra(DARK, 0.4), fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", cursor: canAnalyze ? "pointer" : "not-allowed", transition: "opacity .12s", borderRadius: 0 }}>
                {view === "loading" ? "Scoring your pitch…" : "Analyze pitch →"}
              </button>
              <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: ".10em", textTransform: "uppercase", color: ra(PAPER, 0.16), textAlign: "center", lineHeight: 1.9 }}>
                {FREE_LIMIT} free scores / month · {EMAIL_LIMIT} with your email<br />scored against published journalist research
              </div>
            </div>
          </aside>

          {/* Right panel */}
          <main ref={rightRef} className="piq-right">
            {view === "pre"     && <PreScorePanel live={live} />}
            {view === "loading" && <LoadingPanel />}
            {view === "post"    && result && (
              <PostScorePanel result={result} tab={tab} setTab={setTab}
                email={email} setEmail={setEmail} emailDone={emailDone} setEmailDone={setEmailDone}
                onDownload={() => setShowGate(true)} onReset={reset} pitchMode={pitchMode} />
            )}
          </main>
        </div>

        {/* ── Pipeline footer — inside shell so it's always visible ── */}
        <ToolPipelineFooter currentTool="pressiq" compact />

      </div>

    </>
  );
}

// ── Scoped CSS ────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .piq-shell{display:flex;flex-direction:column;height:100dvh;background:${DARK};overflow:hidden}
  .piq-body{display:flex;flex:1;overflow:hidden;min-height:0}
  .piq-left{width:360px;flex-shrink:0;background:${DARK2};border-right:1px solid ${DARK_BD};overflow-y:auto;height:100%}
  .piq-right{flex:1;background:${PAPER};overflow-y:auto;height:100%}
  .piq-left::-webkit-scrollbar{width:6px}
  .piq-left::-webkit-scrollbar-track{background:${DARK}}
  .piq-left::-webkit-scrollbar-thumb{background:${DARK_BD}}
  .piq-right::-webkit-scrollbar{width:8px}
  .piq-right::-webkit-scrollbar-track{background:${PAPER}}
  .piq-right::-webkit-scrollbar-thumb{background:${ra(INK,0.18)};border:2px solid ${PAPER}}
  .piq-field:focus{border-color:${ra(YEL,0.5)} !important;outline:none}
  .piq-field::placeholder{color:${ra(PAPER,0.22)}}
  .piq-ghost{background:none;border:none;cursor:pointer;font-family:${MONO};font-size:9px;color:${ra(PAPER,0.35)};padding:0;transition:color .1s}
  .piq-ghost:hover{color:${YEL}}
  .piq-tabs{display:flex;align-items:stretch;border-bottom:2px solid ${ra(INK,0.12)};background:${PAPER};position:sticky;top:0;z-index:5;padding:0 4px}
  .piq-tab{padding:14px 16px;font-family:${GROT};font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:${ra(INK,0.38)};transition:all .15s}
  .piq-tab:hover{color:${INK};background:${ra(INK,0.04)}}
  .piq-tab-active{color:${INK} !important;border-bottom-color:${INK} !important;background:${ra(INK,0.05)}}
  .piq-foot-ghost{background:none;border:1px solid ${ra(INK,0.2)};cursor:pointer;font-family:${GROT};font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${ra(INK,0.5)};padding:6px 12px;transition:all .1s}
  .piq-foot-ghost:hover{border-color:${INK};color:${INK}}
  .piq-foot-next{background:${INK};border:none;cursor:pointer;font-family:${GROT};font-weight:800;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${PAPER};padding:8px 16px;transition:opacity .1s}
  .piq-foot-next:hover{opacity:.85}
  @keyframes piq-pulse{0%,80%,100%{opacity:.15}40%{opacity:1}}
  .piq-dot{display:inline-block;width:8px;height:8px;background:${YEL};animation:piq-pulse 1.2s infinite ease-in-out}
  .piq-field:focus-visible{outline:2px solid ${YEL};outline-offset:1px}
  .piq-tab:focus-visible,.piq-ghost:focus-visible{outline:2px solid ${INK};outline-offset:2px}
  @media (max-width:768px){
    .piq-shell{height:auto;min-height:100dvh;overflow:visible}
    .piq-body{flex-direction:column;overflow:visible;min-height:0}
    .piq-left{width:100%;flex-shrink:1;height:auto;border-right:none;border-bottom:1px solid ${DARK_BD}}
    .piq-right{height:auto;overflow:visible}
  }
  @media (prefers-reduced-motion:reduce){
    .piq-dot{animation:none;opacity:.6}
    *{transition:none !important;scroll-behavior:auto !important}
  }
`;

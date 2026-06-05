"use client";

/**
 * PressIQ — /tools/pressiq
 * Scores a PR pitch across Layer 1 (objective, live), Layer 2 (34-pt checklist) and
 * Layer 3 (EMOS). Bureau light theme; mirrors AuthorityCalculator conventions.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Subscriptions, ToolFooter, ToolHeader } from "@/components/bureau";
import { DoubleRule, Mark, Pill, SCaps, SiaLogo } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";
import {
  EMAIL_LIMIT,
  EMOS_APPLY,
  EMOS_URL,
  EVIDENCE,
  FREE_LIMIT,
  PLATFORMS,
  PRODUCT_NAME,
} from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { emosFrame } from "@/lib/pitch/feedback";
import { EMPTY_BRAND, type BrandSignals, type Platform, type RadarAxis, type ScoreResponse, type SubSignal } from "@/lib/pitch/types";

// ── spot colours ────────────────────────────────────────────────────────────────
const GREEN = "#3e6b45";
const AMBER = "#d99211";
const RED = "#c14a32";
const BLUE = "#2d5393";
const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const statusColor = (s: "ideal" | "ok" | "off"): string => (s === "ideal" ? GREEN : s === "ok" ? AMBER : RED);

const STORE_KEY = "sia.pressprolific.v1";

const BRAND_LABELS: { key: keyof BrandSignals; label: string }[] = [
  { key: "website", label: "Personal website" },
  { key: "bylines", label: "Published bylines" },
  { key: "youtube", label: "YouTube / video" },
  { key: "speaking", label: "Speaking history" },
  { key: "caseStudies", label: "Case studies" },
  { key: "linkedin", label: "Active LinkedIn" },
];

const SAMPLE_PITCH = `Subject: Re: Experts on the 4-day week — our 18-month data + [Stats + Examples]

Hi Sarah,

Loved your piece last month on remote-team burnout — the bit about "always-on guilt" mirrored exactly what we measured.

I'm Priya Raman, founder of Tilt (we run ops for 40 distributed startups). When we cut to a 4-day week 18 months ago, I was sure output would drop. It didn't. We tracked 1,200 employees across 12 companies: focused output rose 9%, and voluntary attrition fell by a third.

The counterintuitive part: the win wasn't "rest." It was that a hard deadline forced teams to kill low-value meetings — 22% of recurring meetings vanished in the first month.

Happy to share the raw dataset, or connect you with two founders who reversed course and went back to five days. Which would be more useful for your piece?

Priya Raman — Founder, Tilt · tilt.example.com
priya@tilt.example.com · @priyaraman · linkedin.com/in/priyaraman`;

// ── small atoms ──────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, gap: 10 }}>
        <SCaps size={11} ls="0.14em" color={INK}>{label}</SCaps>
        {hint && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: PAPER, border: `1px solid ${INK}`, borderRadius: 0,
  color: INK, fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, padding: "12px 14px", outline: "none",
};

function LiveMeter({ label, hint, status, fill }: { label: string; hint: string; status: "ideal" | "ok" | "off"; fill: number }) {
  const c = statusColor(status);
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <SCaps size={10} ls="0.1em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontSize: 12.5, color: INK55 }}>{hint}</span>
      </div>
      <div style={{ height: 6, background: PAPER2, border: `1px solid ${INK15}` }}>
        <div style={{ height: "100%", width: `${Math.round(fill * 100)}%`, background: c, transition: "width .25s ease" }} />
      </div>
    </div>
  );
}

function ScoreMeter({ score, color }: { score: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="150" height="150" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke={INK15} strokeWidth="7" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={circ}
          strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x="60" y="58" textAnchor="middle" fill={INK} fontFamily="Georgia, serif" fontSize="34" fontWeight="700">{score}</text>
        <text x="60" y="76" textAnchor="middle" fill={INK55} fontFamily="Georgia, serif" fontSize="11">/ 100</text>
      </svg>
    </div>
  );
}

function Chip({ label, met }: { label: string; met: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", border: `1px solid ${met ? GREEN : INK15}`, background: met ? hexA(GREEN, 0.06) : PAPER, color: met ? INK : INK55, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.02em", lineHeight: 1.3 }}>
      <span style={{ color: met ? GREEN : RED, fontWeight: 800 }}>{met ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

function EvidenceCards({ keys }: { keys?: string[] }) {
  const items = (keys ?? []).map((k) => EVIDENCE[k]).filter(Boolean).slice(0, 3);
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {items.map((e, i) => (
        <a key={i} href={e.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 12px", border: `1px solid ${INK15}`, background: PAPER, textDecoration: "none" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.4 }}>{e.figure}</div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>{e.source}</div>
        </a>
      ))}
    </div>
  );
}

function Radar({ axes }: { axes: RadarAxis[] }) {
  const n = axes.length;
  if (n < 3) return null;
  const cx = 160, cy = 150, R = 96;
  const pt = (r: number, i: number): [number, number] => {
    const a = ((i * 360) / n - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const polyAt = (r: number) => axes.map((_, i) => pt(r, i).join(",")).join(" ");
  const dataPts = axes.map((ax, i) => pt((Math.max(0, Math.min(100, ax.score)) / 100) * R, i));
  const band = (s: number) => (s >= 75 ? GREEN : s >= 45 ? AMBER : RED);
  return (
    <svg viewBox="0 0 320 300" width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Score by dimension">
      {[25, 50, 75, 100].map((lvl) => (
        <polygon key={lvl} points={polyAt((lvl / 100) * R)} fill="none" stroke={INK15} strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(R, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={INK15} strokeWidth={1} />;
      })}
      <polygon points={dataPts.map((p) => p.join(",")).join(" ")} fill={hexA(BLUE, 0.16)} stroke={BLUE} strokeWidth={2} />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={band(axes[i].score)} />
      ))}
      {axes.map((ax, i) => {
        const [x, y] = pt(R + 16, i);
        const anchor = x < cx - 4 ? "end" : x > cx + 4 ? "start" : "middle";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="9.5" fill={INK55} style={{ fontFamily: GROT, letterSpacing: "0.04em" }}>
            {ax.label} {ax.score}
          </text>
        );
      })}
    </svg>
  );
}

function AreaBlock({ dim, label, score, analysis, note, fix, subSignals, evidence }: {
  dim: Parameters<typeof emosFrame>[0];
  label: string; score: number; analysis?: string; note?: string; fix?: string;
  subSignals?: SubSignal[]; evidence?: string[];
}) {
  const [open, setOpen] = useState(false);
  const c = score >= 75 ? GREEN : score >= 45 ? AMBER : RED;
  const frame = emosFrame(dim, score);
  const body = analysis || note;
  return (
    <div style={{ padding: "16px 0", borderTop: `1px solid ${INK15}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 12 }}>
        <SCaps size={11.5} ls="0.12em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: c }}>{score}</span>
      </div>
      <div style={{ height: 8, background: PAPER2, border: `1px solid ${INK15}`, marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${score}%`, background: c, transition: "width .6s ease" }} />
      </div>
      {body && <p style={{ margin: "0 0 8px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: INK70 }}>{body}</p>}
      {subSignals && subSignals.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 2 }}>
          {subSignals.map((s, i) => <Chip key={i} label={s.label} met={s.met} />)}
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} className="ps-link" style={{ marginTop: 10 }}>
        {open ? "− Hide why this matters" : "+ Why this matters & the evidence"}
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: PAPER2, border: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE }}>{frame.mechanism}</span>
          <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK70 }}>{frame.text}</p>
          {fix && <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55 }}>Fix: {fix}</p>}
          <EvidenceCards keys={evidence} />
          {frame.learn && <a href={frame.learn} style={{ display: "inline-block", marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: INK }}>Learn the mechanism →</a>}
        </div>
      )}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────
export default function PitchScorePage() {
  const [pitch, setPitch] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [platform, setPlatform] = useState<Platform>("haro");
  const [brand, setBrand] = useState<BrandSignals>(EMPTY_BRAND);
  const [store, setStore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResponse | null>(null);

  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);

  // restore inputs
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore of saved inputs on mount */
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.pitch === "string") setPitch(d.pitch);
        if (typeof d.query === "string") setQuery(d.query);
        if (typeof d.subject === "string") setSubject(d.subject);
        if (typeof d.platform === "string") setPlatform(d.platform);
        if (d.brand) setBrand({ ...EMPTY_BRAND, ...d.brand });
      }
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ pitch, query, subject, platform, brand })); } catch { /* ignore */ }
  }, [pitch, query, subject, platform, brand]);

  // live Layer-1 (pure JS, no API)
  const live = useMemo(() => {
    if (pitch.trim().length < 15) return null;
    const m = computeMetrics(pitch, subject);
    return scoreLayer1(m);
  }, [pitch, subject]);

  const subjectPreview = resolveSubject(pitch, subject);

  async function analyze() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch, query, subject, platform, brandSignals: brand, store }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong scoring your pitch.");
      } else {
        setResult(data as ScoreResponse);
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
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
    // raise the cap for subsequent scores
    document.cookie = `pp_tier=email; path=/; max-age=${60 * 60 * 24 * 365}`;
    setEmailDone(true);
  }

  const canAnalyze = pitch.trim().length >= 40 && !loading;

  return (
    <>
      <style>{PAGE_CSS}</style>
      <ToolHeader toolName={`${PRODUCT_NAME} · Pitch Score`} />
      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(30px,5vw,52px) clamp(22px,5vw,56px) 20px", textAlign: "center" }}>
          <SCaps color={INK70} size={12} ls="0.28em">{PRODUCT_NAME} · Journalist pitch score</SCaps>
          <h1 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.96, letterSpacing: "-0.03em", fontSize: "clamp(38px,6vw,76px)" }}>
            Will a journalist<br /><Mark>paste this in?</Mark>
          </h1>
          <p style={{ margin: "20px auto 0", maxWidth: 680, fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(16px,2.2vw,22px)", color: INK70, lineHeight: 1.45 }}>
            Score your HARO / Qwoted / Featured pitch against a 34-point system and the EMOS framework —
            and get the three fixes that move it most. No signup for your first {FREE_LIMIT}.
          </p>
          <DoubleRule style={{ margin: "30px 0 0" }} />
        </section>

        {/* ── Result (top when present) ──────────────────────────────────── */}
        {result && <Result result={result} email={email} setEmail={setEmail} emailDone={emailDone} unlockEmail={unlockEmail} onReset={() => setResult(null)} />}

        {/* ── Input ──────────────────────────────────────────────────────── */}
        {!result && (
          <section style={{ padding: "8px clamp(22px,5vw,56px) 40px" }}>
            <div className="ps-grid">
              {/* left: inputs */}
              <div>
                <Field label="Your pitch" hint="subject + body, as you'd send it">
                  <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={12} placeholder="Paste your full pitch here…" style={inputStyle} />
                  <button onClick={() => setPitch(SAMPLE_PITCH)} className="ps-link" style={{ marginTop: 8 }}>
                    ↻ Load a sample pitch
                  </button>
                </Field>

                <Field label="The journalist's query" hint="strongly recommended — relevance is the #1 factor">
                  <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3} placeholder="Paste the HARO/Qwoted source request you're answering…" style={inputStyle} />
                </Field>

                <div className="ps-grid2">
                  <Field label="Subject line" hint="optional — else parsed from line 1">
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={subjectPreview || "Re: [Query] — …"} style={inputStyle} />
                  </Field>
                  <Field label="Platform">
                    <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Your authority signals" hint="for the personal-brand score">
                  <div className="ps-brand">
                    {BRAND_LABELS.map(({ key, label }) => {
                      const on = brand[key];
                      return (
                        <button key={key} onClick={() => setBrand((b) => ({ ...b, [key]: !b[key] }))}
                          style={{ cursor: "pointer", textAlign: "left", padding: "9px 12px", border: `1px solid ${on ? INK : INK15}`, background: on ? INK : PAPER, color: on ? PAPER : INK70, fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 12, height: 12, border: `1.5px solid ${on ? PAPER : INK35}`, background: on ? YEL : "transparent", flexShrink: 0 }} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", marginTop: 4 }}>
                  <input type="checkbox" checked={store} onChange={(e) => setStore(e.target.checked)} style={{ marginTop: 3, accentColor: INK }} />
                  <span style={{ fontFamily: SERIF, fontSize: 13, color: INK55, lineHeight: 1.45 }}>
                    Let SIA store this pitch (anonymised) to improve the tool. Uncheck to score without storing.
                  </span>
                </label>

                {error && (
                  <div style={{ marginTop: 16, padding: "12px 14px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK }}>
                    {error}
                  </div>
                )}

                <button onClick={analyze} disabled={!canAnalyze}
                  style={{ marginTop: 18, width: "100%", padding: "16px 22px", border: "none", background: canAnalyze ? INK : INK15, color: canAnalyze ? PAPER : INK55, fontFamily: GROT, fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", cursor: canAnalyze ? "pointer" : "not-allowed" }}>
                  {loading ? "Scoring your pitch…" : "Analyze pitch →"}
                </button>
                <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, textAlign: "center" }}>
                  {FREE_LIMIT} free scores / month · {EMAIL_LIMIT} with your email · scored against published journalist research
                </p>
              </div>

              {/* right: live meters */}
              <div className="ps-rail">
                <div style={{ position: "sticky", top: 78, border: `1px solid ${INK}`, background: PAPER2 }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${INK}`, background: PAPER }}>
                    <SCaps size={10.5} ls="0.16em" color={INK}>Live mechanics</SCaps>
                  </div>
                  <div style={{ padding: "16px 16px" }}>
                    {!live ? (
                      <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55 }}>
                        Start typing — these update instantly, before you spend a score.
                      </p>
                    ) : (
                      <>
                        <LiveMeter label="Word count" hint={live.bands.wordCount.hint} status={live.bands.wordCount.status} fill={live.bands.wordCount.score} />
                        <LiveMeter label="Subject length" hint={live.bands.subjectWords.hint} status={live.bands.subjectWords.status} fill={live.bands.subjectWords.score} />
                        <LiveMeter label="Reading level" hint={live.bands.readingGrade.hint} status={live.bands.readingGrade.status} fill={live.bands.readingGrade.score} />
                        <LiveMeter label="Closing question" hint={live.bands.questions.hint} status={live.bands.questions.status} fill={live.bands.questions.score} />
                        <LiveMeter label="Tone / subjectivity" hint={live.bands.subjectivity.hint} status={live.bands.subjectivity.status} fill={live.bands.subjectivity.score} />
                        <div style={{ marginTop: 6, paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <SCaps size={10} ls="0.14em" color={INK}>Mechanics score</SCaps>
                          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK }}>{live.score}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <ToolFooter />
      </div>
    </>
  );
}

// ── Result view ──────────────────────────────────────────────────────────────────
function Result({
  result, email, setEmail, emailDone, unlockEmail, onReset,
}: {
  result: ScoreResponse;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  unlockEmail: (e: React.FormEvent) => void;
  onReset: () => void;
}) {
  const { composite, tier, areas, relevanceAssessed, strongestLine, topFixes, radar, authenticityRisk } = result;
  const shareText = encodeURIComponent(`My PR pitch scored ${composite}/100 (${tier.label}) on ${PRODUCT_NAME} by @syedirfanajmal. Score yours:`);

  return (
    <section style={{ padding: "12px clamp(22px,5vw,56px) 32px" }}>
      <div style={{ display: "flex", gap: "clamp(20px,4vw,44px)", flexWrap: "wrap", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: 8 }}>
        <ScoreMeter score={composite} color={tier.color} />
        <div style={{ textAlign: "left", maxWidth: 420 }}>
          <span style={{ display: "inline-block", padding: "4px 12px", border: `1px solid ${tier.color}`, color: tier.color, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            {tier.badge} · {tier.label}
          </span>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>
            {composite >= 85 ? "Placement-grade." : composite >= 65 ? "Competitive — tighten it." : composite >= 40 ? "Real material, missing the system." : "This will get ignored."}
          </h2>
          {!relevanceAssessed && (
            <p style={{ margin: "12px 0 0", padding: "8px 12px", background: hexA(AMBER, 0.1), border: `1px solid ${AMBER}`, fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.4 }}>
              Scored without the journalist&rsquo;s query, so relevance — the #1 driver of placement — wasn&rsquo;t assessed. Add it for a real score.
            </p>
          )}
        </div>
      </div>

      {strongestLine && (
        <div style={{ maxWidth: 760, margin: "20px auto 0", padding: "14px 18px", borderLeft: `3px solid ${GREEN}`, background: hexA(GREEN, 0.05) }}>
          <SCaps size={10} ls="0.16em" color={GREEN}>Your strongest line</SCaps>
          <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK, lineHeight: 1.5 }}>“{strongestLine}”</p>
        </div>
      )}

      {authenticityRisk?.flagged && (
        <div style={{ maxWidth: 760, margin: "18px auto 0", padding: "10px 14px", border: `1px solid ${AMBER}`, background: hexA(AMBER, 0.08), display: "flex", gap: 11, alignItems: "flex-start" }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, whiteSpace: "nowrap", paddingTop: 2 }}>Reads templated</span>
          <span style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.5 }}>
            {authenticityRisk.note || "This reads like a template anyone could send. Add a first-hand detail or a number only you have — 53% of journalists distrust generic, AI-sounding pitches."}
          </span>
        </div>
      )}

      {radar && radar.length >= 3 && (
        <div style={{ maxWidth: 760, margin: "22px auto 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <SCaps size={11} ls="0.18em" color={INK}>Your pitch, by dimension</SCaps>
          <div style={{ marginTop: 6, width: "100%", display: "flex", justifyContent: "center" }}><Radar axes={radar} /></div>
        </div>
      )}

      {/* top fixes */}
      <div style={{ maxWidth: 760, margin: "26px auto 0" }}>
        <SCaps size={11} ls="0.18em" color={INK}>The 3 fixes that move your score most</SCaps>
        <div style={{ marginTop: 12 }}>
          {topFixes.map((f, i) => (
            <div key={i} style={{ padding: "16px 0", borderTop: `1px solid ${INK15}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <Pill size={10}>{String(i + 1).padStart(2, "0")}</Pill>
                <SCaps size={11} ls="0.1em" color={INK}>{f.area}</SCaps>
                {f.mechanism && <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE }}>{f.mechanism}</span>}
              </div>
              <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70 }}>
                {f.text}{" "}
                {f.learn && <a href={f.learn} style={{ color: INK, textDecoration: "underline", textDecorationColor: INK35 }}>Learn the mechanism →</a>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* full breakdown */}
      <div style={{ maxWidth: 760, margin: "30px auto 0" }}>
        <SCaps size={11} ls="0.18em" color={INK}>Full breakdown</SCaps>
        {relevanceAssessed && areas.relevance && <AreaBlock dim="relevance" label="Answering the brief" score={areas.relevance.score} analysis={areas.relevance.analysis} note={areas.relevance.note} fix={areas.relevance.topFix} subSignals={areas.relevance.subSignals} evidence={areas.relevance.evidence} />}
        <AreaBlock dim="objective" label="Mechanics" score={areas.objective.score} analysis={areas.objective.analysis} note={areas.objective.note} subSignals={areas.objective.subSignals} evidence={areas.objective.evidence} />
        <AreaBlock dim="checklist" label="The SIA 34-point system" score={areas.checklist.score} analysis={areas.checklist.analysis} note={areas.checklist.note} fix={areas.checklist.topFix} subSignals={areas.checklist.subSignals} evidence={areas.checklist.evidence} />
        <AreaBlock dim="newsroomReady" label="Newsroom-ready — publishable material" score={areas.newsroomReady.score} analysis={areas.newsroomReady.analysis} note={areas.newsroomReady.note} fix={areas.newsroomReady.topFix} subSignals={areas.newsroomReady.subSignals} evidence={areas.newsroomReady.evidence} />
        <AreaBlock dim="storytelling" label="Storytelling" score={areas.emos.storytelling.score} analysis={areas.emos.storytelling.analysis} note={areas.emos.storytelling.note} fix={areas.emos.storytelling.topFix} subSignals={areas.emos.storytelling.subSignals} evidence={areas.emos.storytelling.evidence} />
        <AreaBlock dim="neuromarketing" label="Neuromarketing" score={areas.emos.neuromarketing.score} analysis={areas.emos.neuromarketing.analysis} note={areas.emos.neuromarketing.note} fix={areas.emos.neuromarketing.topFix} subSignals={areas.emos.neuromarketing.subSignals} evidence={areas.emos.neuromarketing.evidence} />
        <AreaBlock dim="personalBrand" label="Personal brand" score={areas.emos.personalBrand.score} analysis={areas.emos.personalBrand.analysis} note={areas.emos.personalBrand.note} fix={areas.emos.personalBrand.topFix} subSignals={areas.emos.personalBrand.subSignals} evidence={areas.emos.personalBrand.evidence} />
      </div>

      {/* email unlock */}
      {!emailDone ? (
        <form onSubmit={unlockEmail} style={{ maxWidth: 760, margin: "28px auto 0", padding: "20px 22px", border: `1px solid ${INK}`, background: PAPER2 }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Unlock {EMAIL_LIMIT} scores / month</SCaps>
          <p style={{ margin: "6px 0 12px", fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
            Add your email to raise your monthly limit and get SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
            <button type="submit" style={{ padding: "12px 20px", border: "none", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Unlock →</button>
          </div>
        </form>
      ) : (
        <div style={{ maxWidth: 760, margin: "28px auto 0", padding: "16px 22px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.06), fontFamily: SERIF, fontSize: 14.5, color: INK }}>
          ✓ Unlocked — you now have {EMAIL_LIMIT} scores a month. Check your inbox.
        </div>
      )}

      {/* research + GEO positioning (D-D — outside the score) */}
      <div style={{ maxWidth: 760, margin: "30px auto 0", padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <SCaps size={10.5} ls="0.16em" color={INK}>The research behind your score</SCaps>
        <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 13.5, color: INK70, lineHeight: 1.5 }}>
          Scored against published journalist research — Cision &amp; Muck Rack 2026, Propel, Backlinko, Fractl, Boomerang. Open any dimension above to see the exact figures and sources.
        </p>
        <div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${INK15}` }}>
          <SCaps size={10} ls="0.14em" color={BLUE}>Why this is worth more in 2026</SCaps>
          <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 13.5, color: INK70, lineHeight: 1.55 }}>
            In an AI-answer world you don&rsquo;t just rank — you get cited. AI engines lean on earned media (Muck Rack: ~82% of AI citations come from earned coverage), and brand mentions out-predict backlinks for AI-Overview visibility ~3&times; (Ahrefs, 75k brands). The placement this pitch is aiming for is exactly that kind of citation — so a stronger pitch compounds. That whole pipeline is what EMOS builds.
          </p>
        </div>
      </div>

      {/* EMOS CTA */}
      <div style={{ maxWidth: 760, margin: "28px auto 0", background: INK, color: PAPER, padding: "clamp(24px,4vw,40px)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -30, right: -40, opacity: 0.06 }}><SiaLogo height={220} /></div>
        <div style={{ position: "relative" }}>
          <SCaps size={11} ls="0.2em" color={YEL}>{composite >= 85 ? "You've got the standard — now scale it" : "Where this scoring comes from"}</SCaps>
          <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.5vw,38px)", lineHeight: 1.05, color: PAPER }}>
            This tool scores one pitch.<br /><span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> builds the whole pipeline.
          </h3>
          <p style={{ margin: "14px 0 22px", fontFamily: SERIF, fontSize: 16.5, color: "rgba(250,250,250,.72)", lineHeight: 1.55, maxWidth: 540 }}>
            PressIQ runs on the EMOS framework — Personal Branding × Storytelling × Neuromarketing. The full
            Earned Media Operating System hands your team the playbooks, journalist contacts, and pitch system to
            earn coverage in-house, permanently.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={composite >= 65 ? EMOS_APPLY : EMOS_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 14, background: YEL, color: INK, textDecoration: "none", padding: "15px 26px", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>{composite >= 65 ? "Apply to EMOS" : "Explore EMOS"}</span>
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400 }}>↗</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=https://syedirfanajmal.com/tools/pressiq`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(250,250,250,.3)", color: PAPER, textDecoration: "none", padding: "15px 22px", fontFamily: GROT, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Share score on X
            </a>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <button onClick={onReset} className="ps-link">← Score another pitch</button>
      </div>

      <div style={{ marginTop: 28 }}>
        <Subscriptions sectionNumber="—" />
      </div>
    </section>
  );
}

// ── scoped CSS ───────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .ps-grid { display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
  .ps-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .ps-brand { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ps-link { background: none; border: none; cursor: pointer; font-family: ${GROT}; font-weight: 700; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: ${INK}; }
  textarea, input, select { font-family: ${SERIF}; }
  textarea:focus, input:focus, select:focus { border-color: ${YEL} !important; box-shadow: 0 0 0 2px ${hexA(YEL, 0.25)}; }
  @media (max-width: 860px) {
    .ps-grid { grid-template-columns: 1fr; }
    .ps-rail { order: -1; }
    .ps-brand { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 520px) {
    .ps-grid2 { grid-template-columns: 1fr; }
  }
`;

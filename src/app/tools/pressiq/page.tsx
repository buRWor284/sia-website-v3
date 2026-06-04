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
  FREE_LIMIT,
  PLATFORMS,
  PRODUCT_NAME,
} from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { EMPTY_BRAND, type BrandSignals, type Platform, type ScoreResponse } from "@/lib/pitch/types";

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

function AreaBar({ label, score, note, fix }: { label: string; score: number; note?: string; fix?: string }) {
  const c = score >= 75 ? GREEN : score >= 45 ? AMBER : RED;
  return (
    <div style={{ padding: "16px 0", borderTop: `1px solid ${INK15}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 12 }}>
        <SCaps size={11.5} ls="0.12em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: c }}>{score}</span>
      </div>
      <div style={{ height: 8, background: PAPER2, border: `1px solid ${INK15}`, marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${score}%`, background: c, transition: "width .6s ease" }} />
      </div>
      {note && <p style={{ margin: "0 0 6px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.5, color: INK70 }}>{note}</p>}
      {fix && (
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.45, color: INK55 }}>
          Fix: {fix}
        </p>
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
  const { composite, tier, areas, relevanceAssessed, strongestLine, topFixes } = result;
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
              Scored without the journalist's query, so relevance — the #1 driver of placement — wasn't assessed. Add it for a real score.
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
        {relevanceAssessed && areas.relevance && <AreaBar label="Answering the brief" score={areas.relevance.score} note={areas.relevance.note} fix={areas.relevance.topFix} />}
        <AreaBar label="Mechanics" score={areas.objective.score} note={areas.objective.note} />
        <AreaBar label="The SIA 34-point system" score={areas.checklist.score} note={areas.checklist.note} fix={areas.checklist.topFix} />
        <AreaBar label="Storytelling" score={areas.emos.storytelling.score} note={areas.emos.storytelling.note} fix={areas.emos.storytelling.topFix} />
        <AreaBar label="Neuromarketing" score={areas.emos.neuromarketing.score} note={areas.emos.neuromarketing.note} fix={areas.emos.neuromarketing.topFix} />
        <AreaBar label="Personal brand" score={areas.emos.personalBrand.score} note={areas.emos.personalBrand.note} fix={areas.emos.personalBrand.topFix} />
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

"use client";

/**
 * PressIQ — /tools/pressiq  (THIN PUBLIC WRAPPER, Phase P6)
 *
 * The scoring tool itself (2-step form, live mechanics, loading, the 4 result
 * views) now comes from the shared core (components/pressiq/PressIQToolCore) —
 * the same component the dashboard uses. This wrapper owns ONLY the public-
 * surface concerns:
 *   - the intro/landing panel + site chrome (ToolHeader, ToolPipelineFooter)
 *   - the hardened Cloudflare Turnstile widget (docked into the core via
 *     `turnstileSlot`; token gates submission via `submitDisabled`)
 *   - the email gate (EmailGateModal for the PDF + the legacy inline unlock)
 *   - the jsPDF report (shared builder, email-gated here)
 *   - quota copy + localStorage prefs (via the core's persistKey)
 * Stateless / login-free — zero Clerk.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { EmailGateModal, EmosCTAStrip } from "@/components/tools/ToolCTAStrips";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { EMAIL_LIMIT, EMOS_URL, FREE_LIMIT } from "@/lib/pitch/config";
import type { ScoreResponse } from "@/lib/pitch/types";
import PressIQToolCore from "@/components/pressiq/PressIQToolCore";
import { PIQ_CSS } from "@/components/pressiq/core-css";
import { GREEN, ra } from "@/components/pressiq/cards";
import { buildPressIqReport } from "@/lib/pdf/pressiq-report";
import { GROT, INK, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";

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

// ── Ticker data ───────────────────────────────────────────────────────────────
const TICKER = [
  { stat: "82%",   text: "of journalists delete off-beat pitches",        src: "Cision 2026"           },
  { stat: "88%",   text: "immediately delete pitches outside their beat", src: "Muck Rack 2026"        },
  { stat: "3.03%", text: "response for 51-150 word pitches",              src: "Propel, 425k+ pitches" },
  { stat: "+36%",  text: "responses at 3rd-grade reading level",          src: "Boomerang, 40M emails" },
  { stat: "+50%",  text: "reply likelihood with 1-3 questions",           src: "Boomerang"             },
  { stat: "47%",   text: "want more data / research (#1 want)",           src: "Cision 2026"           },
  { stat: "58%",   text: "want source access for interviews",             src: "Muck Rack 2026"        },
  { stat: "53%",   text: "distrust generic, AI-sounding pitches",         src: "Cision 2026"           },
];

// Cloudflare Turnstile site key (public). When unset, the widget is NOT rendered and
// scoring works exactly as before.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// ── Intro panel (step 0 — sells the tool before asking for input) ────────────
function IntroPanel({ onStart }: { onStart: () => void }) {
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

  return (
    <div style={{ background: "#fff", border: `1px solid ${ra(INK, 0.1)}`, borderRadius: 6, overflow: "hidden" }}>
      {/* Hero */}
      <div style={{ padding: "40px 32px 32px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 14 }}>
          PRESSIQ · JOURNALIST PITCH SCORE
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px,3.8vw,42px)", lineHeight: 1.08, letterSpacing: "-.025em", color: INK, margin: "0 0 16px" }}>
          Will a journalist<br />
          <em style={{ fontStyle: "italic" }}><span style={{ background: YEL, color: INK, padding: "0 .12em" }}>paste this in?</span></em>
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: ra(INK, 0.5), lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
          Score any PR pitch (standalone outreach or a query response) against a 32-point system and the EMOS framework. Get the three fixes that move it most. No signup for your first {FREE_LIMIT}.
        </p>
      </div>

      {/* Explainer video */}
      <div style={{ padding: "24px 32px", borderBottom: `1px solid ${ra(INK, 0.1)}` }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 12 }}>
          HOW IT WORKS
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
          <iframe
            src="https://www.youtube.com/embed/HaXSuks2l54"
            title="PressIQ Explainer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>

      {/* WHAT JOURNALISTS SAY — rotating ticker */}
      <div style={{ padding: "24px 32px 0" }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 16 }}>
          WHAT JOURNALISTS SAY
        </div>
        <div style={{ opacity: tickOp, transition: "opacity .2s ease", minHeight: 78 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: INK, letterSpacing: "-.02em", lineHeight: 1, marginBottom: 6 }}>{t.stat}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.62), lineHeight: 1.4, marginBottom: 4 }}>{t.text}</div>
          <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: ra(INK, 0.6) }}>{t.src}</div>
        </div>
      </div>

      {/* SCORED AGAINST — source pills */}
      <div style={{ padding: "20px 32px 28px", borderTop: `1px solid ${ra(INK, 0.08)}`, marginTop: 20 }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 10 }}>
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
            <span key={s} style={{ padding: "4px 8px", border: `1px solid ${ra(INK, 0.08)}`, fontFamily: MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: ra(INK, 0.6) }}>{s}</span>
          ))}
        </div>
      </div>

      {/* CTA into the form */}
      <div style={{ padding: "24px 32px 32px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onStart} style={{ padding: "14px 28px", border: "none", background: INK, color: YEL, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0 }}>
          Start scoring your pitch →
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PressIQPage() {
  const [started, setStarted] = useState(false);
  const [coreStep, setCoreStep] = useState(1);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileTokenRef = useRef("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  // The pitch/subject behind the currently-shown result — captured for the PDF.
  const lastCtx = useRef<{ pitch: string; subject: string }>({ pitch: "", subject: "" });

  // Cloudflare Turnstile: render the widget when configured. No-op when the key
  // is unset. Re-runs when the core step changes (the container only exists in
  // the DOM once the pitch step is active) — matches the hardened SignalIQ mount.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const render = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (!w.turnstile || !turnstileRef.current || turnstileWidgetId.current) return;
      turnstileWidgetId.current = w.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (token: string) => { turnstileTokenRef.current = token; setTurnstileToken(token); },
        "expired-callback": () => { turnstileTokenRef.current = ""; setTurnstileToken(""); },
        "error-callback": () => { turnstileTokenRef.current = ""; setTurnstileToken(""); },
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
  }, [coreStep]);

  // ── Transport: adds the Turnstile token, resets it single-use after the call ──
  const api = {
    score: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, turnstileToken: turnstileTokenRef.current }),
      });
      const data = await res.json();
      // Turnstile tokens are single-use — refresh for the next submission.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (TURNSTILE_SITE_KEY && turnstileWidgetId.current && w.turnstile) {
        w.turnstile.reset(turnstileWidgetId.current);
        turnstileTokenRef.current = "";
        setTurnstileToken("");
      }
      return { ok: res.ok, data };
    },
  };

  // ── PDF (shared builder; email-gated on the public surface) ───────────────────
  const generatePDF = useCallback(async () => {
    if (!result) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JsPDF: any;
    try { JsPDF = await loadJsPDF(); } catch { alert("PDF library failed to load. Check your connection and try again."); return; }
    const doc = new JsPDF({ unit: "mm", format: "a4" });
    buildPressIqReport(doc, { result, pitch: lastCtx.current.pitch, subject: lastCtx.current.subject });
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).save(`PressIQ-Report-${date.replace(/ /g, "-")}.pdf`);
  }, [result]);

  // ── Inline email unlock (Evidence tab) — kept verbatim (legacy pp_tier path) ──
  async function unlockEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!data.success) {
        alert(data.error || "Subscription failed. Please try again.");
        return;
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
      return;
    }
    fetch("/api/pitch-tier", { method: "POST" }).catch(() => {});
    setEmailDone(true);
  }

  const emailUnlockNode = !emailDone ? (
    <form onSubmit={unlockEmail} style={{ border: `1px solid ${INK}`, padding: 18 }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 8 }}>UNLOCK {EMAIL_LIMIT} SCORES / MONTH</div>
      <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.62), marginBottom: 12 }}>Add your email to raise your monthly limit and get SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={{ flex: 1, padding: "9px 12px", background: PAPER, border: `1px solid ${ra(INK, 0.18)}`, fontFamily: GROT, fontSize: 12, color: INK, outline: "none", borderRadius: 0 }} />
        <button type="submit" style={{ padding: "9px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Unlock →</button>
      </div>
    </form>
  ) : (
    <div style={{ fontFamily: SERIF, fontSize: 14.5, color: GREEN, fontWeight: 600 }}>✓ Unlocked, you now have {EMAIL_LIMIT} scores a month. Check your inbox.</div>
  );

  const scoreTabCta = (r: ScoreResponse) => {
    const shareText = encodeURIComponent(`My PR pitch scored ${r.composite}/100 (${r.tier.label}) on PressIQ by @syedirfanajmal. Score yours:`);
    return (
      <EmosCTAStrip
        toolName="PressIQ"
        eyebrow={r.composite >= 85 ? "YOU'VE GOT THE STANDARD | NOW SCALE IT" : "WHERE THIS SCORING COMES FROM"}
        heading={
          <>
            PressIQ scores one pitch.<br /><span style={{ color: YEL }}>EMOS builds the whole pipeline.</span>
          </>
        }
        pitch="PressIQ runs on the EMOS framework: Personal Branding × Storytelling × Neuromarketing. The full Earned Media Operating System hands your team the playbooks, journalist contacts, and pitch system to earn coverage in-house, permanently."
        applyHref={EMOS_URL}
        applyLabel={r.composite >= 65 ? "Apply to EMOS" : "Explore EMOS"}
        hideExplore
        extraAction={
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=https://syedirfanajmal.com/tools/pressiq`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "14px 22px", border: `1px solid ${ra(PAPER, 0.25)}`, color: ra(PAPER, 0.5), fontFamily: GROT, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            Share score on X
          </a>
        }
      />
    );
  };

  return (
    <>
      <style>{PIQ_CSS}</style>
      <EmailGateModal variant="score" show={showGate} onClose={() => setShowGate(false)} onUnlock={() => { setShowGate(false); generatePDF(); }} result={result} />

      <div className="piq-page">
        <ToolHeader
          toolPrefix="Press"
          subtitle="Journalist Pitch Score"
          rightContent={
            <>
              <Link href="/tools/pressiq/how-it-works" target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none", whiteSpace: "nowrap" }}>
                How it works →
              </Link>
              <Link href="/" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.85)", textDecoration: "none" }}>
                ← Main Site
              </Link>
            </>
          }
        />

        {!started ? (
          <main className="piq-col">
            <IntroPanel onStart={() => setStarted(true)} />
          </main>
        ) : (
          <PressIQToolCore
            api={api}
            persistKey="sia.pressiq.v2"
            submitDisabled={!!TURNSTILE_SITE_KEY && !turnstileToken}
            turnstileSlot={TURNSTILE_SITE_KEY ? <div ref={turnstileRef} style={{ marginBottom: 12 }} /> : null}
            onStepChange={setCoreStep}
            quotaLine={<>{FREE_LIMIT} free scores / month · {EMAIL_LIMIT} with your email<br />scored against published journalist research</>}
            pdfAction={() => setShowGate(true)}
            onScored={(scored, ctx) => { setResult(scored); lastCtx.current = { pitch: ctx.pitch, subject: ctx.subject }; }}
            emailUnlockNode={emailUnlockNode}
            scoreTabCta={scoreTabCta}
          />
        )}

        <ToolPipelineFooter currentTool="pressiq" compact onDark />
      </div>
    </>
  );
}

"use client";

/**
 * SignalIQ — /tools/signaliq (PUBLIC THIN WRAPPER, Phase P6)
 * Proactive-PR radar: pick a beat → scan open-data signals → rank opportunities
 * by signal-vs-coverage gap → generate a newsjacking asset pack.
 *
 * P6 (Unified-Gate-Freemium RFP v1.1): the 5-step tool experience moved to the
 * shared core (components/signaliq/SignalIQToolCore.tsx) used by BOTH this page
 * and the EMOS dashboard. This wrapper owns ONLY the public-surface concerns:
 *   - landing screen (hero, wire-feed ticker, proof strip) + SEO chrome
 *   - the hardened Turnstile pattern (mounted containers, no run-once effects)
 *   - the unified gate/quota UI (P1–P3: /api/gate/status + EmailGateModal)
 *   - the jsPDF report download (gated behind the email modal)
 *   - localStorage beat persistence
 * It stays stateless/login-free: no Clerk, no persistence beyond localStorage.
 *
 * Honesty: scores are a lead/whitespace measure, never a prediction. Said so on-page.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { getJsPDF } from "@/lib/pdf/house-style";
import { buildSignalIqReport } from "@/lib/pdf/signaliq-report";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { EmailGateModal, EmosCTAStrip } from "@/components/tools/ToolCTAStrips";
import { ToolHeader } from "@/components/tools/ToolHeader";
import SignalIQToolCore, { type SiqPdfContext } from "@/components/signaliq/SignalIQToolCore";
import { SIQ_CSS } from "@/components/signaliq/core-css";
import { CountUp, SOURCES_DATA } from "@/components/signaliq/cards";
import { DoubleRule, Mark, SCaps } from "@/components/bureau/primitives";
import { INK, INK15, INK35, INK55, INK70, MONO, PAPER, SERIF, GROT, YEL } from "@/lib/tokens";
import { BEATS, EMAIL_SCANS, FREE_SCANS, PRODUCT } from "@/lib/signaliq/config";
import type { BeatId } from "@/lib/signaliq/types";

const EMOS_URL = "/emos";

// Cloudflare Turnstile site key (public). When unset, the widget is NOT rendered
// and scanning works exactly as before. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (+ the
// server TURNSTILE_SECRET_KEY) to enforce the human check end-to-end.
// (H7, 2026-07-02 review: SignalIQ previously had no Turnstile wiring at all, so
// enabling the secret for PressIQ would have 403'd every SignalIQ user.)
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Headline proof bar on the landing view (counts up on scroll).
const PROOF_STATS: Array<{ value: number; decimals?: number; suffix?: string; label: string; src: string }> = [
  { value: 3.43, decimals: 2, suffix: "%", label: "average response rate to a cold PR pitch: the bar SignalIQ helps you clear", src: "Propel · State of PR" },
  { value: 73,                suffix: "%", label: "of pitches die for being off-beat; a signal-backed angle doesn't", src: "Muck Rack 2024" },
  { value: 53,                suffix: "%", label: "of journalists want original data in a pitch: every scan builds it", src: "Muck Rack 2024" },
  { value: 92,                suffix: "%", label: "of people trust earned media above all advertising", src: "Nielsen" },
];

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
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1, flexShrink: 0, letterSpacing: "-0.02em" }}>{n}</span>
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

// ── page ──────────────────────────────────────────────────────────────────────

export default function SignalIQPage() {
  // Ordered beat selection (primary first), length 1–3. All tiers are free.
  const [beats, setBeats] = useState<BeatId[]>(["saas"]);
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

  // Landing (false) vs the shared 5-step tool core (true). Replaces the old
  // in-page "stage 0"; stages 1–5 now live inside SignalIQToolCore.
  const [started, setStarted] = useState(false);

  const [emailDone, setEmailDone] = useState(false);
  const [showGate, setShowGate] = useState(false);
  // When the gate is opened by the Download button, run the PDF once verified.
  const pendingDownloadRef = useRef(false);
  const pendingPdfCtxRef = useRef<SiqPdfContext | null>(null);

  // Recognize a returning verified subscriber (the signed sia_sub wristband, or
  // the legacy pp_tier cookie during the P1 grace period) so SignalIQ never
  // re-asks — parity with PCIQ/JCIQ, which already read gate status on mount (P2).
  useEffect(() => {
    let alive = true;
    fetch("/api/gate/status", { headers: { "Cache-Control": "no-store" } })
      .then((r) => r.json())
      .then((d: { subscriber?: boolean }) => { if (alive && d?.subscriber) setEmailDone(true); })
      .catch(() => { /* ignore — default to gated */ });
    return () => { alive = false; };
  }, []);

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
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      await new Promise(r => setTimeout(r, 250));
      if (turnstileTokenRef.current) return turnstileTokenRef.current;
    }
    return "";
  }

  // Turnstile widget mounts across the wizard (stages 1-5, i.e. `started`) and
  // tears down on the landing screen so it renders cleanly next time. It must
  // stay mounted before the scan and pack calls, or no token is ever issued.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!started) {
      if (turnstileWidgetId.current && w.turnstile) {
        try { w.turnstile.remove(turnstileWidgetId.current); } catch { /* noop */ }
        turnstileWidgetId.current = null;
        setToken("");
      }
      return;
    }
    tryRenderTurnstile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // ── transport: the core never sees URLs or Turnstile ────────────────────────
  const api = {
    scan: async (body: { beats: BeatId[]; companyContext?: string }) => {
      try {
        const res = await fetch("/api/signaliq/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, turnstileToken: (await waitForToken()) || undefined }),
        });
        const data = await res.json();
        return { ok: res.ok, data };
      } finally {
        resetTurnstile();
      }
    },
    pack: async (body: { opportunity: unknown; companyContext?: string }) => {
      try {
        const res = await fetch("/api/signaliq/pack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, store: true, turnstileToken: (await waitForToken()) || undefined }),
        });
        const data = await res.json();
        return { ok: res.ok, data };
      } finally {
        resetTurnstile();
      }
    },
  };

  // Actually builds + saves the PDF. Assumes the email gate has already
  // cleared — call handleDownloadPDF() (below) from UI, not this directly.
  function generateAndDownloadPDF(ctx: SiqPdfContext) {
    const JsPDF = getJsPDF();
    if (!JsPDF) { alert("PDF library still loading — try again in a moment."); return; }
    try {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      buildSignalIqReport(doc, {
        beatLabel: ctx.beats.map((id) => BEATS.find((b) => b.id === id)?.label ?? String(id)).join(" + "),
        companyContext: ctx.companyContext,
        opportunities: ctx.opportunities,
        selected: ctx.selected,
        pack: ctx.pack,
        generatedAt: ctx.generatedAt ?? new Date().toISOString(),
      });
      doc.save(`signaliq-report-${Date.now()}.pdf`);
    } catch {
      alert("Could not generate the PDF. Please try again.");
    }
  }

  // Download button (PressIQ pattern): always clickable. Pre-verification it opens
  // the shared unified gate modal and remembers to run the download once verified.
  function handleDownloadPDF(ctx: SiqPdfContext) {
    if (!emailDone) {
      pendingPdfCtxRef.current = ctx;
      pendingDownloadRef.current = true;
      setShowGate(true);
      return;
    }
    generateAndDownloadPDF(ctx);
  }

  // Fired by the shared EmailGateModal once the email is verified (6-digit code,
  // or instantly for a known email). The signed sia_sub wristband is already set
  // server-side by /api/gate/verify-code — here we just flip local UI state and
  // run any download the user was waiting on.
  function handleGateUnlocked() {
    setEmailDone(true);
    setShowGate(false);
    if (pendingDownloadRef.current && pendingPdfCtxRef.current) {
      pendingDownloadRef.current = false;
      generateAndDownloadPDF(pendingPdfCtxRef.current);
      pendingPdfCtxRef.current = null;
    }
  }

  return (
    <>
      <style>{SIQ_CSS}</style>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <ToolHeader
        toolPrefix="Signal"
        subtitle="Story Radar"
        rightContent={
          <>
            <Link href="/tools/signaliq/how-it-works" target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none", whiteSpace: "nowrap" }}>
              How it works →
            </Link>
            <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.85)" }}>
              ← Main Site
            </span>
          </>
        }
      />

      {/* ── Landing (the old stage 0) ─────────────────────────────────────── */}
      {!started && (
        <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
          <SIQHero onStart={() => setStarted(true)} />
          <div style={{ marginTop: 12 }}>
            <SourcesTicker />
          </div>
          <ProofStrip />
          <div style={{ textAlign: "center", padding: "clamp(20px,3vw,36px) clamp(22px,5vw,56px)" }}>
            <button
              onClick={() => setStarted(true)}
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
          <ToolPipelineFooter currentTool="signaliq" />
        </div>
      )}

      {/* ── Stages 1–5: the shared tool core ─────────────────────────────── */}
      {started && (
        <div style={{ background: PAPER, minHeight: "100vh" }}>
          <SignalIQToolCore
            api={api}
            beats={beats}
            onBeatsChange={setBeats}
            companyContext={companyContext}
            onCompanyContextChange={setCompanyContext}
            quotaUi={{
              emailDone,
              onOpenGate: () => { pendingDownloadRef.current = false; setShowGate(true); },
            }}
            packActions={{ onDownloadPDF: handleDownloadPDF, pressIqHref: "/tools/pressiq" }}
            belowPack={
              // EMOS pitch — fires once the user has their asset pack in hand,
              // same "where this fits" pattern shared with PressIQ/CoverageIQ.
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
            }
            belowStages={TURNSTILE_SITE_KEY ? <div ref={turnstileRef} /> : undefined}
            onExit={() => setStarted(false)}
            exitLabel="← Landing"
          />
        </div>
      )}

      <EmailGateModal
        show={showGate}
        onClose={() => { pendingDownloadRef.current = false; setShowGate(false); }}
        variant="subscribe"
        tool="signaliq"
        heading="Unlock more scans & downloads"
        blurb={`Add your email for ${EMAIL_SCANS} scans a month, PDF downloads, and SIA's earned-media playbooks. Verify once — it works across every tool. One list, unsubscribe anytime.`}
        onSubscribe={handleGateUnlocked}
      />
    </>
  );
}

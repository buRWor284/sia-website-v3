"use client";

/**
 * Shared conversion strips for public EMOS tool pages.
 *
 *  - EmailCaptureStrip: passive newsletter capture posting to
 *    /api/newsletter-subscribe. Used by CoverageIQ, which has no gated
 *    action to unlock — a footer nudge, not a gate.
 *  - EmailGateModal: the *gating* pattern (PDF download / subscribe-to-unlock
 *    modal), shared by PressIQ (score variant) and PartnerCollabIQ / JournoCollabIQ
 *    (subscribe variant). As of the Unified Gate P1 migration it runs a two-step
 *    email → 6-digit-code verification against /api/gate/* and sets a signed,
 *    domain-wide subscriber "wristband" cookie server-side (one verified email =
 *    one identity across every tool and device). A previously-verified email skips
 *    the code step. SignalIQ's gate is intentionally NOT part of this — it's an
 *    inline quota-unlock card, folded onto the shared modal in a later phase.
 *  - EmosCTAStrip: "where this fits" EMOS pitch with Apply/Explore buttons.
 */

import { ReactNode, useEffect, useRef, useState } from "react";
import { GROT, INK, INK15, MONO, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";

const PAPER72 = "rgba(241,235,222,.72)";
const PAPER45 = "rgba(241,235,222,.45)";
const PAPER30 = "rgba(241,235,222,.30)";

// ── EmailGateModal-only tokens (values match the original per-tool consts
//    exactly; kept local since they don't have shared-token equivalents) ──────
const GATE_TX3   = "rgba(26,20,16,0.45)";
const GATE_TX4   = "rgba(26,20,16,0.50)";
const GATE_ERR   = "#c0392b";
const GATE_GREEN = "#3e6b45";
const GATE_BLUE  = "#2d5393";

const gateRa = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

function gateLbl(color?: string): React.CSSProperties {
  return {
    fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: color || GATE_TX3, display: "block", marginBottom: 10,
  };
}
function gateInp(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%", padding: "14px 0 12px", background: "transparent",
    border: "none", borderBottom: `1px solid ${INK15}`, fontFamily: GROT,
    fontSize: 15, color: INK, outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", ...extra,
  };
}
function gatePrimaryBtn(): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 28px", cursor: "pointer", fontFamily: GROT, fontSize: 12,
    fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
    transition: "all 0.15s", border: "none", borderRadius: 0,
    background: YEL, color: PAPER,
  };
}

interface ScoreGateResult {
  composite?: number;
  tier?: { color?: string; label?: string };
}

interface EmailGateModalProps {
  show: boolean;
  onClose: () => void;
  /** "subscribe" (default) = PCIQ/JCIQ behavior: plain subscribe-to-unlock modal.
   *  "score" = PressIQ behavior: adds the report-preview header. */
  variant?: "subscribe" | "score";
  /** "subscribe" variant: fires with the email once unlocked. */
  onSubscribe?: (email: string) => void;
  /** "score" variant: fires once unlocked. */
  onUnlock?: () => void;
  /** "score" variant: drives the report-preview header. */
  result?: ScoreGateResult | null;
  /** Tool id for subscriber source attribution, e.g. "pressiq", "pciq", "jciq". */
  tool?: string;
  /** "subscribe" variant only: override the headline (default "Join founders and marketers."). */
  heading?: string;
  /** "subscribe" variant only: override the sub-copy paragraph. */
  blurb?: string;
}

export function EmailGateModal({
  show,
  onClose,
  variant = "subscribe",
  onSubscribe,
  onUnlock,
  result,
  tool,
  heading,
  blurb,
}: EmailGateModalProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const [done, setDone] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const toolTag = tool || (variant === "score" ? "pressiq" : "collabiq");

  // A11y: Escape-to-close, focus trapped inside the dialog while open, and the
  // email field auto-focused on open.
  useEffect(() => {
    if (!show) return;
    const focusTimer = setTimeout(() => emailInputRef.current?.focus(), 0);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { clearTimeout(focusTimer); document.removeEventListener("keydown", onKeyDown); };
  }, [show, onClose]);

  if (!show) return null;

  function resetState() {
    setStep("email"); setEmail(""); setCode(""); setConsent(false);
    setError(""); setSubmitting(false); setResent(false); setDone(false);
  }

  /** Fire the variant's unlock callback, then close + reset. */
  function finishUnlock() {
    setDone(true);
    if (variant === "score") {
      setTimeout(() => { onUnlock?.(); onClose(); resetState(); }, 900);
    } else {
      onSubscribe?.(email);
      setTimeout(() => { onClose(); resetState(); }, 1200);
    }
  }

  /** Step 1 — request a 6-digit code (or unlock immediately for a known email). */
  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email."); return; }
    if (!consent) { setError("Please accept to continue."); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/gate/request-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tool: toolTag }),
      });
      const data = (await res.json()) as { verified?: boolean; sent?: boolean; error?: string };
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); setSubmitting(false); return; }
      setSubmitting(false);
      if (data.verified) { finishUnlock(); return; } // known email — no code needed
      setStep("code");
    } catch {
      setError("Network error — check your connection and try again."); setSubmitting(false);
    }
  }

  /** Step 2 — verify the code. */
  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your email."); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/gate/verify-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, tool: toolTag }),
      });
      const data = (await res.json()) as { verified?: boolean; error?: string };
      if (!res.ok || !data.verified) { setError(data.error || "That code isn't right."); setSubmitting(false); return; }
      setSubmitting(false); finishUnlock();
    } catch {
      setError("Network error — check your connection and try again."); setSubmitting(false);
    }
  }

  async function resendCode() {
    setError(""); setResent(false); setSubmitting(true);
    try {
      const res = await fetch("/api/gate/request-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tool: toolTag }),
      });
      const data = (await res.json()) as { sent?: boolean; verified?: boolean; error?: string };
      setSubmitting(false);
      if (!res.ok) { setError(data.error || "Couldn't resend just yet. Please wait a moment."); return; }
      if (data.verified) { finishUnlock(); return; }
      setResent(true);
    } catch {
      setError("Network error — check your connection."); setSubmitting(false);
    }
  }

  // Shared step-2 (code entry) form, styled to fit both variants.
  const codeStep = (
    <form onSubmit={submitCode}>
      <span style={{ ...gateLbl(GATE_TX4), marginBottom: 14 }}>Check your email</span>
      <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: INK, marginBottom: 8, letterSpacing: "-0.02em" }}>Enter your code</h3>
      <p style={{ fontFamily: GROT, fontSize: 14, color: GATE_TX3, marginBottom: 20, lineHeight: 1.6 }}>
        We sent a 6-digit code to <strong style={{ color: INK }}>{email}</strong>. It expires in 10 minutes.
      </p>
      <input
        inputMode="numeric" autoComplete="one-time-code" maxLength={6}
        value={code}
        onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (error) setError(""); }}
        placeholder="000000"
        aria-label="6-digit verification code"
        style={{ ...gateInp(), textAlign: "center", letterSpacing: "0.5em", fontSize: 26, fontFamily: MONO, borderBottom: `1px solid ${INK15}`, marginBottom: 18 }}
      />
      {error && <div style={{ fontFamily: MONO, fontSize: 10, color: GATE_ERR, marginBottom: 12 }}>{error}</div>}
      {resent && <div style={{ fontFamily: MONO, fontSize: 10, color: GATE_GREEN, marginBottom: 12 }}>A new code is on its way.</div>}
      <button type="submit" disabled={submitting} style={{ ...gatePrimaryBtn(), width: "100%", justifyContent: "center", fontSize: 13, opacity: submitting ? 0.6 : 1 }}>
        {submitting ? "Verifying…" : "Verify & unlock"}
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <button type="button" onClick={() => { setStep("email"); setError(""); setCode(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 9, color: GATE_TX4, letterSpacing: "0.08em", padding: 0 }}>← Change email</button>
        <button type="button" onClick={resendCode} disabled={submitting} style={{ background: "none", border: "none", cursor: submitting ? "wait" : "pointer", fontFamily: MONO, fontSize: 9, color: GATE_TX4, letterSpacing: "0.08em", padding: 0 }}>Resend code</button>
      </div>
    </form>
  );

  if (variant === "score") {
    const score = result?.composite ?? 0;
    const tierColor = result?.tier?.color ?? GATE_BLUE;
    const tierLabel = result?.tier?.label ?? "-";
    return (
      <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Download your PressIQ report" style={{ position: "relative", background: PAPER2, border: `1px solid ${INK}`, maxWidth: 480, width: "100%", overflow: "hidden" }}>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: GROT, fontSize: 20, lineHeight: 1, color: PAPER, zIndex: 1 }}>
            ×
          </button>
          <div style={{ background: INK, padding: "24px 28px" }}>
            <div style={{ fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".20em", textTransform: "uppercase", color: YEL, marginBottom: 10 }}>
              PRESSIQ · PITCH SCORE REPORT
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: tierColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontFamily: GROT, fontSize: 9, color: gateRa(PAPER, 0.65), letterSpacing: ".14em" }}>/ 100</div>
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
                <span key={s} style={{ padding: "3px 8px", border: `1px solid ${gateRa(PAPER, 0.15)}`, fontFamily: MONO, fontSize: 7.5, color: gateRa(PAPER, 0.4), letterSpacing: ".10em", textTransform: "uppercase" }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "24px 28px" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "16px 0", fontFamily: SERIF, fontSize: 18, color: GATE_GREEN, fontWeight: 600 }}>
                ✓ Generating your PDF…
              </div>
            ) : step === "code" ? (
              codeStep
            ) : (
              <form onSubmit={requestCode}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK, marginBottom: 6, letterSpacing: "-.015em" }}>
                  One step to download
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 14, color: gateRa(INK, 0.62), marginBottom: 18, lineHeight: 1.55 }}>
                  Join founders and marketers. Real earned-media playbooks, zero filler. One or two emails a month.
                </p>
                <input ref={emailInputRef} type="email" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(""); }} placeholder="your@email.com"
                  style={{ width: "100%", padding: "10px 12px", background: PAPER, border: `1px solid ${gateRa(INK, 0.6)}`, fontFamily: GROT, fontSize: 13, color: INK, outline: "none", borderRadius: 0, marginBottom: 12 }} />
                <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: INK }} />
                  <span style={{ fontFamily: GROT, fontSize: 11, color: gateRa(INK, 0.62), lineHeight: 1.5 }}>I agree to receive marketing emails from SIA Enterprises. Unsubscribe anytime.</span>
                </label>
                {error && <div style={{ fontFamily: MONO, fontSize: 10, color: GATE_ERR, marginBottom: 10 }}>{error}</div>}
                <button type="submit" disabled={submitting} style={{ width: "100%", padding: "13px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".10em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 0, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? "Sending…" : "Continue →"}
                </button>
                <div style={{ fontFamily: MONO, fontSize: 9, color: gateRa(INK, 0.62), textAlign: "center", marginTop: 10, letterSpacing: ".08em" }}>
                  No spam · One-click unsubscribe
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // "subscribe" variant — PCIQ/JCIQ modal.
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "v2-fade 0.2s ease",
      }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Subscribe to unlock your download" style={{ position: "relative", background: PAPER2, border: `1px solid ${INK15}`, maxWidth: 420, width: "100%", padding: 36 }}>
        <button type="button" onClick={onClose} aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: GROT, fontSize: 20, lineHeight: 1, color: INK, zIndex: 1 }}>
          ×
        </button>
        {done ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: INK, marginBottom: 8 }}>You&rsquo;re in.</div>
            <p style={{ fontFamily: GROT, fontSize: 14, color: GATE_TX3 }}>Unlocking your download…</p>
          </div>
        ) : step === "code" ? (
          codeStep
        ) : (
          <form onSubmit={requestCode}>
            <span style={{ ...gateLbl(GATE_TX4), marginBottom: 14 }}>One step to download</span>
            <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: INK, marginBottom: 8, letterSpacing: "-0.02em" }}>{heading ?? "Join founders and marketers."}</h3>
            <p style={{ fontFamily: GROT, fontSize: 14, color: GATE_TX3, marginBottom: 24, lineHeight: 1.6 }}>
              {blurb ?? "Verify your email to unlock your PDF download. Real case studies, zero filler. One or two emails a month."}
            </p>
            <input ref={emailInputRef} type="email" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(""); }} placeholder="your@email.com"
              style={{ ...gateInp(), borderBottom: `1px solid ${INK15}`, marginBottom: 18, fontSize: 15 }} />
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: YEL }} />
              <span style={{ fontFamily: GROT, fontSize: 12, color: GATE_TX3, lineHeight: 1.5 }}>I agree to receive marketing emails from SIA Enterprises. Unsubscribe anytime.</span>
            </label>
            {error && <div style={{ fontFamily: MONO, fontSize: 10, color: GATE_ERR, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ ...gatePrimaryBtn(), width: "100%", justifyContent: "center", fontSize: 13, opacity: submitting ? 0.6 : 1 }}>{submitting ? "Sending…" : "Continue"}</button>
            <p style={{ fontFamily: MONO, fontSize: 9, color: GATE_TX4, textAlign: "center", marginTop: 14, letterSpacing: "0.08em" }}>No spam · One-click unsubscribe</p>
          </form>
        )}
      </div>
    </div>
  );
}

export function EmailCaptureStrip({ toolName, benefit }: { toolName: string; benefit: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit() {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setStatus("error"); return; }
    setStatus("busy");
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section style={{ background: PAPER, border: `1px solid ${INK}`, padding: "clamp(20px,3.5vw,32px)", margin: "40px 0 0" }}>
      <p style={{ margin: 0, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: INK }}>
        Get more from {toolName}
      </p>
      {status === "done" ? (
        <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.5 }}>
          You&apos;re in. Watch your inbox for the next earned-media playbook.
        </p>
      ) : (
        <>
          <p style={{ margin: "10px 0 16px", fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.5, maxWidth: 560 }}>
            {benefit}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="you@company.com"
              aria-label="Email address"
              style={{ flex: "1 1 220px", maxWidth: 320, padding: "12px 14px", border: `1px solid ${INK}`, background: "#fff", fontFamily: SERIF, fontSize: 14, color: INK, outline: "none", borderRadius: 0 }}
            />
            <button
              onClick={submit}
              disabled={status === "busy"}
              style={{ padding: "12px 22px", border: "none", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", cursor: status === "busy" ? "wait" : "pointer", borderRadius: 0 }}
            >
              {status === "busy" ? "Sending…" : "Subscribe"}
            </button>
          </div>
          {status === "error" && (
            <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "#8a2f22" }}>
              That email didn&apos;t go through. Check the address and try again.
            </p>
          )}
        </>
      )}
    </section>
  );
}

interface EmosCTAStripProps {
  toolName: string;
  pitch: ReactNode;
  /** Overrides the "WHERE THIS FITS" label — e.g. PressIQ swaps this for a
   * score-dependent line ("WHERE THIS SCORING COMES FROM" vs "YOU'VE GOT
   * THE STANDARD | NOW SCALE IT"). */
  eyebrow?: ReactNode;
  /** Overrides the whole headline. Defaults to the generic
   * "{toolName} tracks the coverage. EMOS earns it." pairing — tools whose
   * job isn't "tracking" (SignalIQ finds stories, PressIQ scores pitches)
   * should pass their own. */
  heading?: ReactNode;
  applyHref?: string;
  applyLabel?: ReactNode;
  applyTarget?: string;
  exploreHref?: string;
  exploreLabel?: ReactNode;
  exploreTarget?: string;
  /** Suppress the secondary Explore button — e.g. PressIQ shows one
   * score-gated primary button (Apply above threshold, Explore below it)
   * rather than both at once. */
  hideExplore?: boolean;
  /** Extra button rendered after Explore — e.g. PressIQ's "Share score on X". */
  extraAction?: ReactNode;
}

export function EmosCTAStrip({
  toolName,
  pitch,
  eyebrow = "Where this fits",
  heading,
  applyHref = "/emos/apply",
  applyLabel = "Apply to EMOS",
  applyTarget,
  exploreHref = "/emos",
  exploreLabel = "Explore EMOS",
  exploreTarget,
  hideExplore = false,
  extraAction,
}: EmosCTAStripProps) {
  return (
    <section style={{ background: INK, color: PAPER, padding: "clamp(22px,4vw,38px)", margin: "24px 0 48px" }}>
      <p style={{ margin: 0, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".20em", textTransform: "uppercase", color: YEL }}>
        {eyebrow}
      </p>
      <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3.2vw,34px)", lineHeight: 1.06, color: PAPER }}>
        {heading ?? (
          <>
            {toolName} tracks the coverage.<br />
            <span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> earns it.
          </>
        )}
      </h3>
      <p style={{ margin: "14px 0 22px", fontFamily: SERIF, fontSize: 16, color: PAPER72, lineHeight: 1.55, maxWidth: 560 }}>
        {pitch}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={applyHref} target={applyTarget} rel={applyTarget ? "noopener noreferrer" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 12, background: YEL, color: INK, textDecoration: "none", padding: "14px 24px", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {applyLabel} <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400 }}>↗</span>
        </a>
        {!hideExplore && (
          <a href={exploreHref} target={exploreTarget} rel={exploreTarget ? "noopener noreferrer" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${PAPER30}`, color: PAPER, textDecoration: "none", padding: "14px 22px", fontFamily: GROT, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {exploreLabel}
          </a>
        )}
        {extraAction}
      </div>
      <p aria-hidden style={{ margin: "18px 0 0", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: PAPER45 }}>
        The Earned Media Operating System
      </p>
    </section>
  );
}

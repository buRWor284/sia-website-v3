"use client";

/**
 * Shared conversion strips for public EMOS tool pages.
 *
 *  - EmailCaptureStrip: newsletter capture posting to /api/newsletter-subscribe
 *    (same endpoint every tool-specific gate already uses).
 *  - EmosCTAStrip: "where this fits" EMOS pitch with Apply/Explore buttons,
 *    modeled on SignalIQ's inline EmosCTA.
 *
 * First consumer: CoverageIQ (which previously had neither an email gate nor
 * an EMOS CTA). SignalIQ/PressIQ/JournoCollabIQ/PartnerCollabIQ keep their
 * bespoke gates for now; migrating them onto EmailCaptureStrip is a follow-up.
 */

import { ReactNode, useState } from "react";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";

const PAPER72 = "rgba(241,235,222,.72)";
const PAPER45 = "rgba(241,235,222,.45)";
const PAPER30 = "rgba(241,235,222,.30)";

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

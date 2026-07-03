"use client";

/**
 * FactCheck IQ — public teaser page
 * /tools/factcheckiq
 *
 * High-fidelity React port of the design handoff "FactCheck IQ Framework v4"
 * (design_handoff_factcheck_iq). This is a MARKETING EXPLAINER for a
 * platform-only tool, not a working version of FactCheck IQ: no API routes,
 * no email gates, no live file upload or scoring.
 *
 * Three lanes: a raw draft comes in → a 10-step verification pipeline runs
 * (animated, user-controllable) → a graded report comes out with one sourced
 * verdict per claim. Closes with a positioning statement: "a safety net, not
 * a ghostwriter." All copy, claims data, and verdicts are locked per the v4
 * spec. Zero border-radius, zero box-shadows, Unicode glyphs only.
 *
 * Pipeline position: sits between AssetIQ and JournoCollabIQ (verifies the
 * built asset's claims before it's pitched to journalists) — confirmed with
 * the site owner 2026-07-03; the handoff itself does not state a position.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";
import { HRule, SCaps } from "@/components/bureau/primitives";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

const P72 = "rgba(241,235,222,.72)";
const P55 = "rgba(241,235,222,.55)";
const P45 = "rgba(241,235,222,.45)";
const P35 = "rgba(241,235,222,.35)";
const P25 = "rgba(241,235,222,.25)";

type SpeedName = "Slow" | "Normal" | "Fast";
const SPEEDS: Record<SpeedName, number> = { Slow: 6000, Normal: 4000, Fast: 2000 };
const SPEED_NAMES: SpeedName[] = ["Slow", "Normal", "Fast"];
const pad = (n: number) => (n < 10 ? "0" + n : "" + n);

/* ── Verdict color map (locked) ───────────────────────────────────────────── */
type Verdict = "Verified" | "Partly accurate" | "Misleading" | "Unverifiable" | "Inaccurate" | "Fabricated";
const VERDICT_COLORS: Record<Verdict, { bg: string; fg: string }> = {
  "Verified":        { bg: "#3e6b45", fg: PAPER },
  "Partly accurate": { bg: "#e0a21a", fg: INK },
  "Misleading":      { bg: "#9c7414", fg: PAPER },
  "Unverifiable":    { bg: "rgba(26,20,16,.45)", fg: PAPER },
  "Inaccurate":      { bg: "#9b2c2c", fg: PAPER },
  "Fabricated":      { bg: "#7a1f1f", fg: PAPER },
};

/* ── Locked content (v4 spec) ─────────────────────────────────────────────── */
interface Step { icon: string; name: string; desc: string; chips: string[]; }

const STEPS: Step[] = [
  { icon: "◎", name: "Intake & scope", desc: "Read the whole piece, then state plainly what is being checked and how many claims were found.", chips: ["PASTE", "MARKDOWN", "PDF", "DOCX", "CLAIM COUNT"] },
  { icon: "◈", name: "Extract claims", desc: "Pull out statistics, citations, quotes, factual assertions, and logic claims in their exact wording.", chips: ["STATISTICS", "CITATIONS", "QUOTES", "ASSERTIONS"] },
  { icon: "◇", name: "Triage by risk", desc: "Spend the most effort where AI fails most, so the riskiest claims get checked first.", chips: ["UNSOURCED STATS", "NAMED STUDIES", "SUPERLATIVES", "CAUSAL CLAIMS"] },
  { icon: "◆", name: "Verify laterally", desc: "Leave the document, check independent sources, and require two or more for any load bearing claim.", chips: ["LEAVE THE PAGE", "TWO SOURCE RULE", "RANK BY TIER"] },
  { icon: "▣", name: "Citation gate", desc: "Every citation is tested for real existence, a matching DOI, and a source that actually supports the claim.", chips: ["DEAD LINK CHECK", "DOI GATE", "SUPPORTS CLAIM", "JOURNAL VETTING"] },
  { icon: "✦", name: "Numeric accuracy", desc: "Each figure is matched to its source for value, units, and scale, with any stripped context restored.", chips: ["EXACT MATCH", "UNIT & SCALE", "CONTEXT RESTORED", "RE DERIVE MATH"] },
  { icon: "◉", name: "Recency check", desc: "Facts that were true once but may now be stale are flagged for a fresh check.", chips: ["OFFICEHOLDERS", "PRICES", "LAWS", "LATEST / CURRENT"] },
  { icon: "❖", name: "Consistency & reasoning", desc: "Internal contradictions are caught, along with the four logic traps that turn true facts into false conclusions.", chips: ["CONTRADICTIONS", "CORRELATION VS CAUSE", "CHERRY PICKING", "BASE RATES"] },
  { icon: "▲", name: "Credibility pass", desc: "Speculation dressed as fact, overclaims, and false precision are flagged with a safer rewrite.", chips: ["FACT VS GUESS", "OVERCLAIMS", "FALSE PRECISION"] },
  { icon: "★", name: "Grade & report", desc: "A verdict is assigned per claim, a Markdown report is saved, and a short summary comes back with the file.", chips: ["VERDICT PER CLAIM", "MARKDOWN FILE", "SOURCE PER CLAIM"] },
];

interface Claim { n: number; text: string; verdict: Verdict; found: string; source: string; url: string | null; highlight: string; }

const CLAIMS: Claim[] = [
  { n: 1, text: "Nielsen surveyed more than 28,000 people across 56 countries", verdict: "Verified", found: "Nielsen's 2012 Global Trust in Advertising surveyed 28,000+ internet respondents in 56 countries.", source: "Nielsen 2012", url: "https://www.nielsen.com/insights/2012/global-trust-in-advertising-and-brand-messages-2/", highlight: "surveyed more than 28,000 people across 56 countries" },
  { n: 2, text: "92% trust earned media (meaning press coverage) above all advertising", verdict: "Partly accurate", found: "The 92% figure is real, but Nielsen defines it as recommendations from friends and family (word of mouth), not press coverage, and it is a 2012 number.", source: "Nielsen 2012", url: "https://www.nielsen.com/insights/2012/global-trust-in-advertising-and-brand-messages-2/", highlight: "92 percent of consumers trust earned media, meaning press and media coverage, above every other form of advertising" },
  { n: 3, text: "Online reviews were the least trusted source of brand information", verdict: "Inaccurate", found: "The same Nielsen study found online consumer reviews were the second most trusted source, at 70%.", source: "Nielsen 2012", url: "https://www.nielsen.com/insights/2012/global-trust-in-advertising-and-brand-messages-2/", highlight: "online reviews ranked as the least trusted source of brand information" },
  { n: 4, text: "Content marketing costs 62% less and generates 3x the leads", verdict: "Unverifiable", found: "Traces only to a DemandMetric infographic with no published sample, method, or year. Widely repeated, never sourced to primary data.", source: "none found (DemandMetric infographic only)", url: "https://www.demandmetric.com/", highlight: "costs 62 percent less than traditional marketing while generating three times the leads" },
  { n: 5, text: "Companies that blog get 67% more leads, which proves blogging drives growth", verdict: "Misleading", found: "The 67% benchmark is correlational and variously attributed (HubSpot, DemandMetric, InsideView). “Proves blogging drives growth” is causation claimed from correlation.", source: "HubSpot / DemandMetric (correlational)", url: "https://www.hubspot.com/marketing-statistics", highlight: "Companies that blog get 67 percent more leads, which proves that blogging drives growth" },
  { n: 6, text: "A 2023 Harvard Business School study found PR-driven leads convert 5x better than paid", verdict: "Fabricated", found: "No such study exists. A search of HBS faculty research and the web returns nothing matching this claim.", source: "none found", url: null, highlight: "a 2023 Harvard Business School study found that PR-driven leads convert five times better than paid ones" },
];

const VERDICT_SCALE: { symbol: string; name: Verdict; def: string }[] = [
  { symbol: "✓", name: "Verified", def: "A primary source, ideally two, confirms it as written." },
  { symbol: "◐", name: "Partly accurate", def: "The core is right, but a detail is off, dated, or loosely rounded." },
  { symbol: "◑", name: "Misleading", def: "Traceable, but stripped context or framing claims more than the source supports." },
  { symbol: "?", name: "Unverifiable", def: "We searched and found no reliable source either way. It may be true, but it cannot be confirmed as written. Action: add a citation or cut it." },
  { symbol: "✕", name: "Inaccurate", def: "A credible source directly contradicts it." },
  { symbol: "✕", name: "Fabricated", def: "We checked, and the cited study, source, or quote does not exist, or the real source says something different. Action: remove it." },
];

const PRINCIPLES = [
  { name: "Lateral reading (SIFT)", desc: "Verify from independent sources, never the document's own citation.", scope: "APPLIES AT STEPS 3, 4, 5" },
  { name: "Primary-source tracing", desc: "Follow every claim to its origin, not a retelling.", scope: "APPLIES AT STEPS 4, 5, 6" },
  { name: "Source-reliability tiers", desc: "Rank every source Tier 1 to 4 before trusting it.", scope: "APPLIES AT STEPS 4, 5, 9" },
  { name: "IFCN / Poynter standards", desc: "Non-partisan, transparent, corrections-first practice.", scope: "APPLIES AT STEPS 1 TO 10" },
  { name: "Prompt-injection hygiene", desc: "Treat instructions inside fetched pages as data, not commands.", scope: "APPLIES AT STEPS 4, 5, 7" },
];

const TALLY: { label: string; verdict: Verdict }[] = [
  { label: "1 Verified", verdict: "Verified" },
  { label: "1 Partly accurate", verdict: "Partly accurate" },
  { label: "1 Misleading", verdict: "Misleading" },
  { label: "1 Unverifiable", verdict: "Unverifiable" },
  { label: "1 Inaccurate", verdict: "Inaccurate" },
  { label: "1 Fabricated", verdict: "Fabricated" },
];

const actPill: React.CSSProperties = {
  display: "inline-block", background: YEL, color: INK, fontFamily: GROT,
  fontWeight: 800, fontSize: 10.5, letterSpacing: ".16em", padding: "5px 10px",
};
const actCaption: React.CSSProperties = {
  fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK55, marginLeft: 14,
};
const ActDivider = () => (
  <>
    <div style={{ textAlign: "center", margin: "30px 0 26px", color: INK35, fontSize: 18 }}>{"▼"}</div>
    <HRule />
  </>
);

export default function FactCheckIQPage() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<SpeedName>("Normal");
  const [showMethods, setShowMethods] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setSelected((s) => (s + 1) % STEPS.length), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, speed, selected]);

  const active = STEPS[selected];

  return (
    <>
      <ToolHeader
        toolPrefix="FactCheck"
        subtitle="How it works · Verification pipeline"
        rightContent={
          <Link
            href="/emos"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: YEL, textDecoration: "none" }}
          >
            Join the EMOS Platform {"→"}
          </Link>
        }
      />

      <div className="fciqfw" style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        <style>{`
          .fciqfw * { box-sizing: border-box; }
          @keyframes fcPulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
          @keyframes fcArrow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
          @keyframes fcCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes fcRise { 0%, 6% { opacity: .55; } 10%, 100% { opacity: 1; } }
          .fc-pulse { animation: fcPulse 3.6s ease infinite; }
          .fc-arrow { animation: fcArrow 4.2s ease-in-out infinite; }
          .fc-caret { animation: fcCaret 1s step-end infinite; }
          @media (max-width: 900px) {
            .fciqfw-steps { grid-template-columns: repeat(5, 1fr) !important; }
          }
          @media (max-width: 680px) {
            .fciqfw-lane1 { flex-direction: column !important; }
            .fciqfw-steps { grid-template-columns: repeat(3, 1fr) !important; }
            .fciqfw-scale { grid-template-columns: 1fr 1fr !important; }
            .fciqfw-principles { grid-template-columns: 1fr !important; }
            .fciqfw-table { font-size: 12px !important; }
          }
        `}</style>

        <div style={{ padding: "28px 24px 64px", overflowX: "hidden" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", border: `1px solid ${INK}`, background: PAPER }}>

            {/* ── MASTHEAD ─────────────────────────────────────────────────── */}
            <header style={{ background: INK, color: PAPER, padding: "26px 40px" }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: GROT, fontWeight: 900, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", padding: "5px 10px" }}>
                  Inside the EMOS Platform
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 30, letterSpacing: ".1em", textTransform: "uppercase", lineHeight: 1 }}>
                    FACTCHECK<span style={{ color: YEL }}>IQ</span>
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: P55, margin: "8px 0 0" }}>
                    How a draft becomes a graded, sourced report in a single pass
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className="fc-pulse" style={{ width: 9, height: 9, background: YEL, display: "inline-block" }} />
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".18em" }}>INTERACTIVE</span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: P55 }}>
                    10 STEPS {"·"} 2 MODES {"·"} 6 VERDICTS {"·"} 5 PRINCIPLES
                  </div>
                </div>
              </div>
            </header>

            <div style={{ padding: "38px 40px 44px" }}>

              {/* ── LANE 1 — RAW DRAFT IN ────────────────────────────────────── */}
              <div className="fciqfw-lane1" style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ minWidth: 220 }}>
                  <span style={actPill}>{"①"} Raw draft in</span>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK70, maxWidth: "24ch", margin: "16px 0 0" }}>
                    Paste, Markdown, PDF, or DOCX. Every checkable claim is pulled out, word for word.
                  </p>
                </div>
                <div style={{ flex: 1, maxWidth: 760, border: `1px solid ${INK}`, background: PAPER2, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <SCaps size={9.5} ls=".16em" color={INK55} style={{ display: "block", marginBottom: 8 }}>Pasted draft + 2 files</SCaps>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${INK}`, background: PAPER, fontFamily: MONO, fontWeight: 500, fontSize: 11, padding: "5px 9px" }}>
                        <span style={{ color: "#9b2c2c" }}>{"▣"}</span> nielsen-trust.pdf
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${INK}`, background: PAPER, fontFamily: MONO, fontWeight: 500, fontSize: 11, padding: "5px 9px" }}>
                        <span style={{ color: "#2a5db0" }}>{"▣"}</span> earned-media-post.docx
                      </span>
                    </div>
                  </div>
                  <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.85, margin: 0 }}>
                    Nielsen{" "}
                    <span style={{ background: VERDICT_COLORS["Verified"].bg, color: VERDICT_COLORS["Verified"].fg, padding: ".03em .18em" }}>surveyed more than 28,000 people across 56 countries</span>,
                    finding that{" "}
                    <span style={{ background: VERDICT_COLORS["Partly accurate"].bg, color: VERDICT_COLORS["Partly accurate"].fg, padding: ".03em .18em" }}>92 percent of consumers trust earned media, meaning press and media coverage, above every other form of advertising</span>.
                    The same study found{" "}
                    <span style={{ background: VERDICT_COLORS["Inaccurate"].bg, color: VERDICT_COLORS["Inaccurate"].fg, padding: ".03em .18em" }}>online reviews ranked as the least trusted source of brand information</span>.
                    Content marketing{" "}
                    <span style={{ background: VERDICT_COLORS["Unverifiable"].bg, color: VERDICT_COLORS["Unverifiable"].fg, padding: ".03em .18em" }}>costs 62 percent less than traditional marketing while generating three times the leads</span>, and{" "}
                    <span style={{ background: VERDICT_COLORS["Misleading"].bg, color: VERDICT_COLORS["Misleading"].fg, padding: ".03em .18em" }}>companies that blog get 67 percent more leads, which proves that blogging drives growth</span>.
                    In fact,{" "}
                    <span style={{ background: VERDICT_COLORS["Fabricated"].bg, color: VERDICT_COLORS["Fabricated"].fg, padding: ".03em .18em" }}>a 2023 Harvard Business School study found that PR-driven leads convert five times better than paid ones</span>.
                    <span className="fc-caret">{"▍"}</span>
                  </p>
                </div>
              </div>

              <ActDivider />

              {/* ── LANE 2 — THE TEN-STEP PIPELINE ──────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", borderTop: `3px solid ${INK}`, paddingTop: 14 }}>
                  <span style={actPill}>{"②"} The ten step pipeline</span>
                  <span style={actCaption}>the box below shows the step it is parked on. drive it with the player, or click any number</span>
                </div>

                <div style={{ overflowX: "auto", marginTop: 24 }}>
                  <div className="fciqfw-steps" style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", minWidth: 760, position: "relative", paddingTop: 10 }}>
                    <div style={{ position: "absolute", left: "5%", right: "5%", top: 42, height: 2, background: "rgba(26,20,16,.2)" }} />
                    {STEPS.map((s, i) => {
                      const on = i === selected;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setSelected(i)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 4px" }}
                        >
                          <span
                            style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25, background: on ? INK : PAPER, color: on ? YEL : INK, border: `1.5px solid ${on ? YEL : INK}`, transform: on ? "translateY(-7px)" : "none", transition: "all .5s ease" }}
                          >
                            {s.icon}
                            <span style={{ position: "absolute", top: -9, left: -9, width: 20, height: 20, background: INK, color: YEL, fontFamily: MONO, fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {pad(i + 1)}
                            </span>
                          </span>
                          <span style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${YEL}`, opacity: on ? 1 : 0, marginTop: 5 }} />
                          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", minHeight: 26, marginTop: 4, color: on ? INK : INK55 }}>
                            {s.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Player bar */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, background: INK, color: PAPER, border: `1px solid ${INK}`, padding: "12px 16px", marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, border: "none", padding: "9px 16px", cursor: "pointer" }}
                  >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                  </button>
                  <div style={{ width: 1, height: 18, background: P25 }} />
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".16em", color: P55 }}>SPEED</span>
                  <div style={{ display: "flex", gap: 0 }}>
                    {SPEED_NAMES.map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSpeed(sp)}
                        style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", background: speed === sp ? YEL : "transparent", color: speed === sp ? INK : PAPER, border: `1px solid ${speed === sp ? YEL : P35}`, padding: "7px 13px", cursor: "pointer", marginLeft: -1 }}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: ".08em", color: YEL }}>
                    STEP {pad(selected + 1)} / 10 {"·"} {playing ? "PLAYING" : "PAUSED"}
                  </span>
                </div>

                {/* Detail panel */}
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", border: `1px solid ${INK}`, borderTop: "none", background: PAPER2, minHeight: 150 }}>
                  <div style={{ background: INK, color: YEL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 44 }}>{active.icon}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: P72 }}>STEP {pad(selected + 1)}</span>
                  </div>
                  <div key={selected} style={{ padding: "22px 26px" }}>
                    <h3 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 17, letterSpacing: ".08em", textTransform: "uppercase", margin: "0 0 10px" }}>
                      {active.name}
                    </h3>
                    <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.55, color: INK70, maxWidth: "74ch", margin: 0 }}>
                      {active.desc}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                      {active.chips.map((c) => (
                        <span key={c} style={{ border: `1px solid ${INK}`, background: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", padding: "6px 11px" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── LANE 3 — GRADED REPORT OUT ──────────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", borderTop: `3px solid ${INK}`, paddingTop: 14 }}>
                  <span style={actPill}>{"③"} Graded report out</span>
                  <span style={actCaption}>one verdict per claim, each with a real source, never a placeholder</span>
                </div>

                <div style={{ border: `1px solid ${INK}`, marginTop: 20 }}>
                  <div style={{ background: INK, color: PAPER, display: "flex", justifyContent: "space-between", padding: "14px 22px", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13 }}>fact-check-report.md</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: P55 }}>FULL AUDIT {"·"} 2026 {"·"} 6 CLAIMS</span>
                  </div>

                  <div style={{ padding: "22px 22px 24px" }}>
                    {/* Tally row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 22px", marginBottom: 16 }}>
                      {TALLY.map((t) => (
                        <span key={t.label} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11.5, color: VERDICT_COLORS[t.verdict].bg === PAPER ? INK : VERDICT_COLORS[t.verdict].bg }}>
                          {t.label}
                        </span>
                      ))}
                    </div>

                    {/* Verdict banner */}
                    <div style={{ background: "#faf3e3", border: `1px solid ${INK}`, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                      <span style={{ width: 9, height: 9, background: "#9b2c2c", display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5 }}>
                        Not ready as written. Fix the Fabricated, Inaccurate, and Misleading claims first.
                      </span>
                    </div>

                    {/* Claims table */}
                    <div className="fciqfw-table" style={{ border: `1px solid ${INK}`, marginBottom: 26, overflowX: "auto" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "30px 1.55fr 118px 1.9fr 150px", minWidth: 720, background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" }}>
                        <div style={{ padding: "9px 8px" }}>{"#"}</div>
                        <div style={{ padding: "9px 8px" }}>Claim as written</div>
                        <div style={{ padding: "9px 8px" }}>Verdict</div>
                        <div style={{ padding: "9px 8px" }}>What verification found</div>
                        <div style={{ padding: "9px 8px" }}>Source</div>
                      </div>
                      {CLAIMS.map((c) => (
                        <div key={c.n} style={{ display: "grid", gridTemplateColumns: "30px 1.55fr 118px 1.9fr 150px", minWidth: 720, borderTop: `1px solid rgba(26,20,16,.2)` }}>
                          <div style={{ padding: "10px 8px", fontFamily: MONO, fontWeight: 700, fontSize: 12, color: INK55 }}>{c.n}</div>
                          <div style={{ padding: "10px 8px", fontFamily: SERIF, fontSize: 13.5 }}>{c.text}</div>
                          <div style={{ padding: "10px 8px" }}>
                            <span style={{ display: "inline-block", background: VERDICT_COLORS[c.verdict].bg, color: VERDICT_COLORS[c.verdict].fg, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".05em", textTransform: "uppercase", padding: "4px 8px" }}>
                              {c.verdict}
                            </span>
                          </div>
                          <div style={{ padding: "10px 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK70 }}>{c.found}</div>
                          <div style={{ padding: "10px 8px", fontFamily: MONO, fontSize: 10.5 }}>
                            {c.url ? (
                              <a href={c.url} target="_blank" rel="noopener" style={{ color: INK, textDecoration: "underline", textDecorationColor: YEL, textUnderlineOffset: 2 }}>
                                {c.source}
                              </a>
                            ) : (
                              <span style={{ color: INK55 }}>{c.source}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Verdict scale */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      <SCaps size={11} ls=".2em" color={INK55}>The verdict scale</SCaps>
                      <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: INK35 }}>CONFIRMED {"→"} INVENTED</span>
                    </div>
                    <div className="fciqfw-scale" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 1, background: INK, marginBottom: 18 }}>
                      {VERDICT_SCALE.map((v) => (
                        <div key={v.name} className="fc-arrow" style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ minHeight: 88, background: VERDICT_COLORS[v.name].bg, color: VERDICT_COLORS[v.name].fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 8 }}>
                            <span style={{ fontSize: 22 }}>{v.symbol}</span>
                            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{v.name}</span>
                          </div>
                          <div style={{ background: PAPER2, padding: "10px 10px", flex: 1 }}>
                            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.4, margin: 0 }}>{v.def}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK70, margin: 0 }}>
                      <span style={{ fontFamily: GROT, fontStyle: "normal", fontWeight: 800 }}>The difference: </span>
                      Unverifiable means we could not find evidence either way (absence of evidence). Fabricated means we found evidence it is invented or wrong (evidence of absence). Never treat one as the other.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── CROSS-CUTTING PRINCIPLES (collapsible) ──────────────────── */}
              <div style={{ marginTop: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: `3px solid ${INK}`, paddingTop: 14 }}>
                  <span style={actPill}>Cross-cutting principles</span>
                  <span style={actCaption}>the standards applied across every step</span>
                  <span style={{ flex: 1 }} />
                  <button
                    type="button"
                    onClick={() => setShowMethods((o) => !o)}
                    style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", background: INK, color: YEL, border: "none", padding: "9px 14px", cursor: "pointer" }}
                  >
                    {showMethods ? "▾ HIDE THE 5 PRINCIPLES" : "▸ SHOW THE 5 PRINCIPLES"}
                  </button>
                </div>
                {showMethods && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, marginBottom: 14 }}>
                      The steps are the sequence. These five principles are the standards applied across every step.
                    </p>
                    <div className="fciqfw-principles" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: INK15 }}>
                      {PRINCIPLES.map((p, i) => (
                        <div key={p.name} style={{ background: PAPER2, padding: "14px 15px" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                            <span style={{ background: INK, color: YEL, fontFamily: MONO, fontWeight: 700, fontSize: 11, padding: "2px 6px" }}>{pad(i + 1)}</span>
                            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, textTransform: "uppercase" }}>{p.name}</span>
                          </div>
                          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.4, margin: 0 }}>{p.desc}</p>
                          <div style={{ borderTop: `1px solid ${INK15}`, marginTop: 10, paddingTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: 8.5, color: INK55 }}>
                            {p.scope}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── POSITIONING BAND ─────────────────────────────────────────── */}
              <div style={{ marginTop: 30, background: INK, borderTop: `3px solid ${YEL}`, padding: "44px 40px 46px" }}>
                <span style={actPill}>What this is</span>
                <h2 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 34, letterSpacing: ".02em", textTransform: "uppercase", lineHeight: 1.05, maxWidth: "20ch", color: PAPER, margin: "16px 0 0" }}>
                  A safety net, <span style={{ color: YEL }}>not a ghostwriter</span>
                </h2>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.6, color: P72, maxWidth: "76ch", margin: "18px 0 0" }}>
                  Spell-check caught typos. Grammar-check caught grammar. FactCheck IQ catches the false claim and the invented source, before your reader does. It works the same whether a person or an AI wrote the draft: it verifies, and it never writes for you. Like the typewriter, spell-check, and Grammarly before it, this is a tool that makes writers more trustworthy, not obsolete.
                </p>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: P45, marginTop: 18 }}>
                  For human writers and AI drafts alike
                </div>
              </div>

              {/* ── PLATFORM CTA BAND ───────────────────────────────────────── */}
              <div style={{ marginTop: 24, marginBottom: 16, background: INK, borderTop: `3px solid ${YEL}`, padding: "36px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div style={{ maxWidth: 620 }}>
                  <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 9px", marginBottom: 12 }}>
                    Platform only
                  </span>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: PAPER, lineHeight: 1.2 }}>
                    FactCheck IQ is available to EMOS Platform members.
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: P72, marginTop: 8 }}>
                    Join the platform to grade and source-check every draft before it goes out.
                  </p>
                </div>
                <Link
                  href="/emos"
                  style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, padding: "15px 26px", whiteSpace: "nowrap", textDecoration: "none" }}
                >
                  Explore the EMOS Platform {"→"}
                </Link>
              </div>

              {/* ── FOOTER (colophon rule) ──────────────────────────────────── */}
              <div style={{ borderTop: `1px solid rgba(26,20,16,.15)`, padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>
                  FACTCHECK<span style={{ color: "#b78514" }}>IQ</span>
                </span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
                  Catch the made up statistic before your reader does.
                </span>
              </div>

            </div>
          </div>
        </div>

        <ToolPipelineFooter currentTool="factcheckiq" />
      </div>
    </>
  );
}

"use client";

/**
 * FactcheckIQ — public teaser page
 * /tools/factcheckiq
 *
 * High-fidelity React port of the design handoff "FactcheckIQ Framework v4"
 * (design_handoff_factcheck_iq). This is a MARKETING EXPLAINER for a
 * platform-only tool, not a working version of FactcheckIQ: no API routes,
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
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL, YEL2,
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

type ModeName = "Sequential" | "Parallel";
const MODE_NAMES: ModeName[] = ["Sequential", "Parallel"];
const MODE_NOTES: Record<ModeName, string> = {
  Sequential: "Sequential mode: one claim verified at a time, in the order shown below. Default for shorter drafts.",
  Parallel: "Parallel mode: many claims checked concurrently with helper agents, then aggregated, same rules applied to each. Same standards, less waiting on long documents.",
};
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

/* ── Locked content (v4 spec, enriched v3) ───────────────────────────────── */
interface Step {
  icon: string; name: string; desc: string; chips: string[];
  quote?: string; plain?: string; note?: string; traps?: string[];
}

const STEPS: Step[] = [
  { icon: "◎", name: "Intake & scope", desc: "Read the whole piece, then state plainly what is being checked and how many claims were found.", chips: ["PASTE", "MARKDOWN", "PDF", "DOCX", "CLAIM COUNT"] },
  { icon: "◈", name: "Extract claims", desc: "Pull out statistics, citations, quotes, factual assertions, and logic claims in their exact wording.", chips: ["STATISTICS", "CITATIONS", "QUOTES", "ASSERTIONS"] },
  { icon: "◇", name: "Triage by risk", desc: "Spend the most effort where AI fails most, so the riskiest claims get checked first.", chips: ["UNSOURCED STATS", "NAMED STUDIES", "SUPERLATIVES", "CAUSAL CLAIMS"] },
  { icon: "◆", name: "Verify laterally", desc: "Leave the document, check independent sources, and require two or more for any load bearing claim.", chips: ["LEAVE THE PAGE", "TWO SOURCE RULE", "RANK BY TIER"],
    quote: "Judge a claim by opening other sources, not by reading further down the same page.",
    plain: "Don't trust a page to vouch for itself. Open up what independent sources say, then decide.",
    note: "Follows SIFT: Stop → Investigate the source → Find better coverage → Trace to the original." },
  { icon: "▣", name: "Citation gate", desc: "Every citation is tested for real existence, a matching DOI, and a source that actually supports the claim.", chips: ["DEAD LINK CHECK", "DOI GATE", "SUPPORTS CLAIM", "JOURNAL VETTING"],
    quote: "A DOI that merely loads proves nothing.",
    plain: "The skill clicks through and confirms it is really the cited paper, and vets the venue: indexing (Scopus, Web of Science, PubMed, DOAJ), retractions (Retraction Watch), and predatory or hijacked journals.",
    note: "A “predatory” journal prints anything for a fee; a “hijacked” one is a counterfeit of a real journal." },
  { icon: "✦", name: "Numeric accuracy", desc: "Each figure is matched to its source for value, units, and scale, with any stripped context restored.", chips: ["EXACT MATCH", "UNIT & SCALE", "CONTEXT RESTORED", "RE DERIVE MATH"],
    quote: "A zombie statistic is a real number that wandered off from its context.",
    plain: "A survey of one age group quoted as “of all Americans” is the textbook case. The skill restores the missing context or flags the claim." },
  { icon: "◉", name: "Recency check", desc: "Facts that were true once but may now be stale are flagged for a fresh check.", chips: ["OFFICEHOLDERS", "PRICES", "LAWS", "LATEST / CURRENT"] },
  { icon: "❖", name: "Consistency & reasoning", desc: "Internal contradictions are caught, along with the four logic traps that turn true facts into false conclusions.", chips: ["CONTRADICTIONS", "CORRELATION VS CAUSE", "CHERRY PICKING", "BASE RATES"],
    traps: ["Correlation as causation", "Cherry-picking", "Base-rate neglect", "Single study vs. consensus"],
    plain: "One paper is not the final word. Moving together is not causing each other." },
  { icon: "▲", name: "Credibility pass", desc: "Speculation dressed as fact, overclaims, and false precision are flagged with a safer rewrite.", chips: ["FACT VS GUESS", "OVERCLAIMS", "FALSE PRECISION"],
    quote: "When a “maybe” turns into a “definitely.”",
    plain: "The skill catches the switch. Speculation dressed as certainty is flagged with a suggested rewrite." },
  { icon: "★", name: "Grade & report", desc: "A verdict is assigned per claim, a Markdown report is saved, and a short summary comes back with the file.", chips: ["VERDICT PER CLAIM", "MARKDOWN FILE", "SOURCE PER CLAIM"] },
];

interface Claim { n: number; text: string; verdict: Verdict; found: string; source: string; url: string | null; highlight: string; }

const CLAIMS: Claim[] = [
  { n: 1, text: "The top 100 online marketplaces grew 2.9% in 2022 to $3.2 trillion in GMV", verdict: "Verified", found: "Digital Commerce 360's Top 100 Marketplaces tracker recorded 2.9% growth to $3.2 trillion in combined third-party GMV for 2022.", source: "Digital Commerce 360", url: "https://www.digitalcommerce360.com/article/global-marketplace-sales/", highlight: "the top 100 online marketplaces grew 2.9 percent in 2022 to $3.2 trillion in GMV" },
  { n: 2, text: "67% of B2B buyers prefer a rep-free buying experience, proving marketplaces are how B2B commerce will be transacted", verdict: "Partly accurate", found: "The 67% figure is real, from Gartner's 2026 B2B buying survey, but it measures preference for self-service, rep-free purchasing in general. Gartner's survey doesn't single out marketplaces as the channel buyers want; that leap is the draft's, not Gartner's.", source: "Gartner 2026 B2B Buying Survey", url: "https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience", highlight: "67 percent of B2B buyers prefer a rep-free buying experience, proving marketplaces are how B2B commerce will be transacted" },
  { n: 3, text: "Digital Commerce 360 found the top 100 B2B marketplaces' GMV grew 10.1% in 2024", verdict: "Inaccurate", found: "Digital Commerce 360's 10.1% figure is a projected growth rate for 2025 (to $3.2 trillion), not a result reported for 2024. The year is misstated.", source: "Digital Commerce 360", url: "https://www.digitalcommerce360.com/top-online-marketplaces-data-stats/", highlight: "the top 100 B2B marketplaces' GMV grew 10.1 percent in 2024" },
  { n: 4, text: "The average B2B marketplace take rate is 15%, and onboarding a new vendor takes three days industry-wide", verdict: "Unverifiable", found: "Both figures circulate across marketplace-SaaS marketing blogs with no named study, sample, or methodology behind either one. Widely repeated, never traced to primary data.", source: "none found (marketplace-SaaS blog consensus only)", url: "https://www.shipturtle.com/blog/multi-vendor-marketplace-statistics", highlight: "the average B2B marketplace take rate is 15 percent, and onboarding a new vendor takes three days industry-wide" },
  { n: 5, text: "Sellers offered flexible onboarding and payout schedules see 20% higher retention, which proves fast onboarding is why marketplaces are outgrowing traditional B2B sales", verdict: "Misleading", found: "The 20% retention figure traces to real marketplace seller-retention research, but it's a correlation between onboarding flexibility and seller retention, not evidence that onboarding speed explains marketplace growth over traditional sales channels. “Proves” claims causation the underlying data doesn't support.", source: "Marketplace seller-retention research (correlational)", url: null, highlight: "sellers offered flexible onboarding and payout schedules see 20 percent higher retention, which proves fast onboarding is why marketplaces are outgrowing traditional B2B sales" },
  { n: 6, text: "A 2025 Gartner study found marketplace infrastructure providers cut vendor onboarding time by 80%", verdict: "Fabricated", found: "No such study exists. A search of Gartner's published research and newsroom returns nothing matching this claim.", source: "none found", url: null, highlight: "a 2025 Gartner study found marketplace infrastructure providers cut vendor onboarding time by 80 percent" },
];

const VERDICT_SCALE: { symbol: string; name: Verdict; def: string }[] = [
  { symbol: "✓", name: "Verified", def: "A primary source, ideally two, confirms it as written." },
  { symbol: "◐", name: "Partly accurate", def: "The core is right, but a detail is off, dated, or loosely rounded." },
  { symbol: "◑", name: "Misleading", def: "Traceable, but stripped context or framing claims more than the source supports." },
  { symbol: "?", name: "Unverifiable", def: "We searched and found no reliable source either way. It may be true, but it cannot be confirmed as written. Action: add a citation or cut it." },
  { symbol: "✕", name: "Inaccurate", def: "A credible source directly contradicts it." },
  { symbol: "✕", name: "Fabricated", def: "We checked, and the cited study, source, or quote does not exist, or the real source says something different. Action: remove it." },
];

type PrincipleKind = "dark" | "light" | "tint";
interface Principle {
  kind: PrincipleKind; num: number; icon: string; eyebrow: string; headline: string;
  body?: string; plain: string; scope: string; tiers?: boolean;
}

const PRINCIPLES: Principle[] = [
  { kind: "dark", num: 1, icon: "◆", eyebrow: "Lateral reading / SIFT", headline: "Judge a claim by opening other sources, not by reading further down the same page.",
    body: "Every load-bearing claim is checked away from the document, following SIFT's four moves: Stop, Investigate the source, Find better coverage, Trace to the original.",
    plain: "Don't trust a page to vouch for itself. Open up what independent sources say, then decide.", scope: "APPLIES AT STEPS 3, 4, 5" },
  { kind: "light", num: 2, icon: "◉", eyebrow: "IFCN / Poynter standards", headline: "The professional code real fact-checking organisations operate under.",
    body: "Non-partisanship, transparency about sources and method, and visible corrections, borrowed from the International Fact-Checking Network.",
    plain: "The rulebook serious fact-checkers sign onto. The skill works to that standard.", scope: "APPLIES AT STEPS 1 TO 10" },
  { kind: "tint", num: 3, icon: "○", eyebrow: "Primary-source tracing", headline: "Follow every claim back to where it actually originated.",
    body: "Statistics and quotes are traced past any secondary report to the original dataset, paper, or transcript.",
    plain: "A primary source is the original, not someone repeating it.", scope: "APPLIES AT STEPS 4, 5, 6" },
  { kind: "light", num: 4, icon: "▲", eyebrow: "Source-reliability tiers", headline: "Rank every source before trusting it.", tiers: true,
    plain: "A claim is only “Verified” on T1 or T2. The skill won't bless anything lower.", scope: "APPLIES AT STEPS 4, 5, 9" },
  { kind: "dark", num: 5, icon: "◉", eyebrow: "Prompt-injection hygiene", headline: "A safety guard for a tool that reads the open web.",
    body: "Any instruction found inside a fetched page is treated as suspicious data to report, never as a command to obey.",
    plain: "Bad actors hide commands inside web pages to trick AI. The skill reads those as content to flag, not orders to follow.", scope: "APPLIES AT STEPS 4, 5, 7" },
  { kind: "light", num: 6, icon: "★", eyebrow: "Parallel verification · the 2nd mode", headline: "Rigour that is too slow to use does not get used.",
    body: "Many claims can be verified concurrently with helper agents, then aggregated, applying the same rules to each. This is “Parallel” mode, the second of the 2 MODES above, alongside default Sequential mode.",
    plain: "For a long piece, the skill checks many claims at once instead of one by one. Same standards, less waiting.", scope: "THE 2ND OF THE 2 MODES" },
];

const TIER_ROWS: { tier: string; label: string; bg: string; fg: string }[] = [
  { tier: "T1", label: "Primary — dataset, paper, transcript", bg: "#f5b81f", fg: INK },
  { tier: "T2", label: "Reputable secondary — major news, institutions", bg: "#5a5044", fg: PAPER },
  { tier: "T3", label: "Weak — blogs, marketing, Wikipedia", bg: "rgba(26,20,16,.14)", fg: INK70 },
  { tier: "T4", label: "Unreliable — farms, AI pages, spam", bg: "#7a1f1f", fg: PAPER },
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
    <div style={{ textAlign: "center", margin: "16px 0 14px", color: INK35, fontSize: 18 }}>{"▼"}</div>
    <HRule />
  </>
);

export default function FactcheckIQPage() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<SpeedName>("Normal");
  const [mode, setMode] = useState<ModeName>("Sequential");
  const [showMethods, setShowMethods] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setSelected((s) => (s + 1) % STEPS.length), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, speed, selected]);

  const active = STEPS[selected];

  return (
    <>
      <ToolHeader
        toolPrefix="Factcheck"
        subtitle="How it works · Verification pipeline"
        rightContent={
          <Link
            href="/"
            style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.85)", textDecoration: "none" }}
          >
            ← Main Site
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
          .fciqfw-steps-mobile { display: none; }
          @media (max-width: 680px) {
            .fciqfw-lane1 { flex-direction: column !important; }
            /* Below 680px the 10-step grid only ever showed its first column
               (the grid stayed at minWidth:760 inside an overflow-x:auto box,
               so on a ~390px phone only steps 1/4/7/10 were visible with no
               obvious scroll affordance). Hide the grid entirely and drive
               the same selected state from a one-step-at-a-time pager
               instead, so mobile always shows exactly one step + its detail
               panel below. */
            .fciqfw-steps-desktop { display: none !important; }
            .fciqfw-steps-mobile { display: flex !important; }
            .fciqfw-detail { grid-template-columns: 1fr !important; }
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
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ display: "inline-block", fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", background: YEL, color: INK, padding: "4px 9px" }}>
                      Sample scenario · Fairground (illustrative)
                    </span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: P55 }}>
                    10 STEPS {"·"} 2 MODES {"·"} 6 VERDICTS {"·"} 5 PRINCIPLES {"·"} 11 METHODS
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
                <div style={{ flex: 1, maxWidth: 760, border: `1px solid ${INK}`, background: PAPER2, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <SCaps size={9.5} ls=".16em" color={INK55} style={{ display: "block", marginBottom: 8 }}>Fairground&apos;s draft blog post + 2 files</SCaps>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${INK}`, background: PAPER, fontFamily: MONO, fontWeight: 500, fontSize: 11, padding: "5px 9px" }}>
                        <span style={{ color: "#9b2c2c" }}>{"▣"}</span> dc360-marketplace-gmv.pdf
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${INK}`, background: PAPER, fontFamily: MONO, fontWeight: 500, fontSize: 11, padding: "5px 9px" }}>
                        <span style={{ color: "#2a5db0" }}>{"▣"}</span> fairground-onboarding-post.docx
                      </span>
                    </div>
                  </div>
                  <p style={{ fontFamily: SERIF, fontSize: 9.5, lineHeight: 1.5, margin: 0 }}>
                    Marketplace infrastructure keeps attracting investment because{" "}
                    <span style={{ background: VERDICT_COLORS["Verified"].bg, color: VERDICT_COLORS["Verified"].fg, padding: ".03em .18em" }}>the top 100 online marketplaces grew 2.9 percent in 2022 to $3.2 trillion in GMV</span>.
                    That tracks with the buyer side too:{" "}
                    <span style={{ background: VERDICT_COLORS["Partly accurate"].bg, color: VERDICT_COLORS["Partly accurate"].fg, padding: ".03em .18em" }}>67 percent of B2B buyers prefer a rep-free buying experience, proving marketplaces are how B2B commerce will be transacted</span>.
                    The momentum hasn&rsquo;t slowed:{" "}
                    <span style={{ background: VERDICT_COLORS["Inaccurate"].bg, color: VERDICT_COLORS["Inaccurate"].fg, padding: ".03em .18em" }}>the top 100 B2B marketplaces&rsquo; GMV grew 10.1 percent in 2024</span>.
                    Every operator we talk to already knows{" "}
                    <span style={{ background: VERDICT_COLORS["Unverifiable"].bg, color: VERDICT_COLORS["Unverifiable"].fg, padding: ".03em .18em" }}>the average B2B marketplace take rate is 15 percent, and onboarding a new vendor takes three days industry-wide</span>.
                    That&rsquo;s no accident:{" "}
                    <span style={{ background: VERDICT_COLORS["Misleading"].bg, color: VERDICT_COLORS["Misleading"].fg, padding: ".03em .18em" }}>sellers offered flexible onboarding and payout schedules see 20 percent higher retention, which proves fast onboarding is why marketplaces are outgrowing traditional B2B sales</span>.
                    In fact,{" "}
                    <span style={{ background: VERDICT_COLORS["Fabricated"].bg, color: VERDICT_COLORS["Fabricated"].fg, padding: ".03em .18em" }}>a 2025 Gartner study found marketplace infrastructure providers cut vendor onboarding time by 80 percent</span>.
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

                <div className="fciqfw-steps-desktop" style={{ overflowX: "auto", marginTop: 24 }}>
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

                {/* Mobile pager — one step at a time (grid above is hidden <680px) */}
                <div className="fciqfw-steps-mobile" style={{ alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 24, background: INK, border: `1px solid ${INK}`, padding: "12px 14px" }}>
                  <button
                    type="button"
                    onClick={() => setSelected((s) => Math.max(0, s - 1))}
                    disabled={selected === 0}
                    style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", background: "transparent", color: PAPER, border: `1px solid ${P35}`, padding: "9px 14px", cursor: selected === 0 ? "default" : "pointer", opacity: selected === 0 ? 0.35 : 1 }}
                  >
                    {"‹ Prev"}
                  </button>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", color: YEL }}>
                      STEP {pad(selected + 1)} / 10
                    </span>
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: P72 }}>
                      {STEPS[selected].name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected((s) => Math.min(STEPS.length - 1, s + 1))}
                    disabled={selected === STEPS.length - 1}
                    style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", background: YEL, color: INK, border: `1px solid ${YEL}`, padding: "9px 14px", cursor: selected === STEPS.length - 1 ? "default" : "pointer", opacity: selected === STEPS.length - 1 ? 0.35 : 1 }}
                  >
                    {"Next ›"}
                  </button>
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
                  <div style={{ width: 1, height: 18, background: P25 }} />
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".16em", color: P55 }}>MODE</span>
                  <div style={{ display: "flex", gap: 0 }}>
                    {MODE_NAMES.map((md) => (
                      <button
                        key={md}
                        type="button"
                        onClick={() => setMode(md)}
                        style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", background: mode === md ? YEL : "transparent", color: mode === md ? INK : PAPER, border: `1px solid ${mode === md ? YEL : P35}`, padding: "7px 13px", cursor: "pointer", marginLeft: -1 }}
                      >
                        {md}
                      </button>
                    ))}
                  </div>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: ".08em", color: YEL }}>
                    STEP {pad(selected + 1)} / 10 {"·"} {playing ? "PLAYING" : "PAUSED"}
                  </span>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: P72, flexBasis: "100%", margin: "8px 0 0", paddingTop: 6, borderTop: `1px dashed ${P25}` }}>
                    {MODE_NOTES[mode]}
                  </p>
                </div>

                {/* Detail panel */}
                <div className="fciqfw-detail" style={{ display: "grid", gridTemplateColumns: "120px 1fr", border: `1px solid ${INK}`, borderTop: "none", background: PAPER2, minHeight: 150 }}>
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
                    {(active.quote || active.plain || active.traps) && (
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${INK15}` }}>
                        {active.quote && (
                          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 15, color: INK, borderLeft: `3px solid ${YEL}`, paddingLeft: 12, margin: "0 0 10px" }}>
                            “{active.quote}”
                          </p>
                        )}
                        {active.traps && (
                          <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
                            {active.traps.map((t) => (
                              <li key={t} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".04em", color: INK55 }}>
                                <span style={{ color: YEL2, fontWeight: 900 }}>{"→ "}</span>{t}
                              </li>
                            ))}
                          </ul>
                        )}
                        {active.plain && (
                          <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, margin: 0, maxWidth: "70ch" }}>
                            <span style={{ fontFamily: GROT, fontStyle: "normal", fontWeight: 800, textTransform: "uppercase", fontSize: 12.5, color: INK }}>In plain terms: </span>
                            {active.plain}
                          </p>
                        )}
                        {active.note && (
                          <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, margin: "6px 0 0", maxWidth: "70ch" }}>{active.note}</p>
                        )}
                      </div>
                    )}
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

              {/* ── VERIFICATION FRAMEWORKS (was "cross-cutting principles", now the 5-card mosaic + capstone) ── */}
              <div style={{ marginTop: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: `3px solid ${INK}`, paddingTop: 14 }}>
                  <span style={actPill}>Verification frameworks</span>
                  <span style={actCaption}>5 cross-cutting principles {"·"} the heart of the skill</span>
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
                      The ten steps are the sequence claims move through. These five principles are the standards applied at every step, plus six more woven directly into steps 04, 05, 06, 08 and 09 above, and one (parallel verification) behind the 2 MODES stat up top. Eleven methods, one skill.
                    </p>
                    <div className="fciqfw-principles" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: INK }}>
                      {PRINCIPLES.map((p) => {
                        const isDark = p.kind === "dark";
                        const bg = isDark ? INK : p.kind === "tint" ? "#e4dcc4" : PAPER2;
                        const fg = isDark ? PAPER : INK;
                        return (
                          <div key={p.eyebrow} style={{ background: bg, color: fg, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: isDark ? YEL : INK55 }}>
                              <span style={{ background: isDark ? YEL : INK, color: isDark ? INK : YEL, fontFamily: MONO, fontWeight: 700, fontSize: 11, padding: "2px 6px" }}>{p.num}</span>
                              {p.eyebrow}
                            </div>
                            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.3, margin: 0 }}>{p.headline}</p>
                            {p.tiers ? (
                              <div>
                                {TIER_ROWS.map((t) => (
                                  <div key={t.tier} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 10.5, padding: "5px 8px", marginBottom: 2, background: t.bg, color: t.fg }}>
                                    <span>{t.tier}</span><span>{t.label}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: isDark ? P72 : INK70, margin: 0 }}>{p.body}</p>
                            )}
                            <p style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.45, color: isDark ? P72 : INK70, borderTop: `1px solid ${isDark ? P25 : INK15}`, paddingTop: 10, margin: 0 }}>
                              <span style={{ fontFamily: GROT, fontStyle: "normal", fontWeight: 800, textTransform: "uppercase", fontSize: 11, color: isDark ? PAPER : INK }}>In plain terms: </span>
                              {p.plain}
                            </p>
                            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".05em", color: isDark ? P45 : INK55, textTransform: "uppercase", marginTop: "auto" }}>
                              {p.scope}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── CAPSTONE QUOTE ───────────────────────────────────────────── */}
              <div style={{ marginTop: 1, background: INK, color: PAPER, padding: "34px 38px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 24, lineHeight: 1.3, maxWidth: "32ch", margin: 0 }}>
                  Rigour that is too slow to use does not get used.
                </p>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: P45 }}>
                    The design principle behind all 11 methods
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 56, color: P25, lineHeight: 1, marginTop: 6 }}>
                    11 {"×"}
                  </div>
                </div>
              </div>

              {/* ── POSITIONING BAND ─────────────────────────────────────────── */}
              <div style={{ marginTop: 30, background: INK, borderTop: `3px solid ${YEL}`, padding: "44px 40px 46px" }}>
                <span style={actPill}>What this is</span>
                <h2 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 34, letterSpacing: ".02em", textTransform: "uppercase", lineHeight: 1.05, maxWidth: "20ch", color: PAPER, margin: "16px 0 0" }}>
                  A safety net, <span style={{ color: YEL }}>not a ghostwriter</span>
                </h2>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.6, color: P72, maxWidth: "76ch", margin: "18px 0 0" }}>
                  Spell-check caught typos. Grammar-check caught grammar. FactcheckIQ catches the false claim and the invented source, before your reader does. It works the same whether a person or an AI wrote the draft: it verifies, and it never writes for you. Like the typewriter, spell-check, and Grammarly before it, this is a tool that makes writers more trustworthy, not obsolete.
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
                    FactcheckIQ is available to EMOS Platform members.
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: P72, marginTop: 8 }}>
                    Join the platform to verify drafts and AI-assisted copy before they publish.
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

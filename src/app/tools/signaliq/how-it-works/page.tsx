"use client";

/**
 * SignalIQ — How It Works (framework visual)
 * /tools/signaliq/how-it-works
 *
 * High-fidelity React port of the design handoff "SignalIQ Framework v6"
 * (design_handoff_signaliq). One continuous sample scenario — Fairground,
 * a fictional B2B marketplace SaaS — from signal to placement:
 *
 *   ① Open Data In → ② The Scoring Engine (animated 8-step player)
 *   → ③ Ranked Opportunity Out → ④ One Click, One Pack
 *   + band scale, collapsible 6-factor panel, EMOS pipeline footer.
 *
 * All copy is locked (verbatim from the v6 spec). The scan data (63/100,
 * breakdown 35/87/50/100, receipts, factor weights) is real and verified —
 * do not alter. Zero border-radius, zero shadows, Unicode glyphs only.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";
import { HRule, SCaps } from "@/components/bureau/primitives";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

/* ── On-ink paper transparencies (spec: paper #f1ebde on ink) ─────────────── */
const P72 = "rgba(241,235,222,.72)";
const P55 = "rgba(241,235,222,.55)";
const P45 = "rgba(241,235,222,.45)";
const P25 = "rgba(241,235,222,.25)";

/* ── Animation timeline ───────────────────────────────────────────────────── */
// cursor timeline: 0..7 = steps 1..8, 8..13 = pack build stages 1..6, then loops
const TOTAL = 14;
type SpeedName = "Slow" | "Normal" | "Fast";
const SPEEDS: Record<SpeedName, number> = { Slow: 2600, Normal: 1600, Fast: 800 };
const SPEED_NAMES: SpeedName[] = ["Slow", "Normal", "Fast"];

const pad = (n: number) => (n < 10 ? "0" + n : "" + n);

/* ── Locked content (verbatim from v6 spec) ───────────────────────────────── */
interface Step {
  name: string;
  icon: string;
  desc: string;
  chips: string[];
}

const STEPS: Step[] = [
  { name: "Pick a beat", icon: "◎", desc: "Choose one of six beats. Add a company profile to rank results for your company, not the whole industry.", chips: [] },
  { name: "Pull five open sources", icon: "⬢", desc: "GDELT, Hacker News, SEC EDGAR, Wikipedia, and arXiv are scanned for fresh movement on the beat.", chips: [] },
  { name: "Filter the junk", icon: "▽", desc: "Whole-word matching, per-source rate limits, and de-duplication strip the noise before anything is scored.", chips: [] },
  { name: "Correlate into topics", icon: "◇", desc: "Signals about the same topic are clustered, so one story is one opportunity, not five fragments.", chips: [] },
  { name: "Measure magnitude and velocity", icon: "▲", desc: "How big is the movement, and how fast is it growing against its own baseline.", chips: ["MAGNITUDE · 22%", "VELOCITY · 20%"] },
  { name: "The coverage denominator", icon: "◐", desc: "GDELT measures how much press coverage already exists. Opportunity is signal strength divided by existing coverage: big signal, little coverage, big opportunity.", chips: ["COVERAGE GAP · 28%"] },
  { name: "Credibility and corroboration", icon: "◆", desc: "Source quality is weighed, and independent sources agreeing makes noise less likely.", chips: ["CREDIBILITY · 10%", "CORROBORATION · 14%"] },
  { name: "Rank, guard, band", icon: "★", desc: "Company relevance ranks the list, sensitive topics (human tragedy) are demoted and never framed as opportunities, and the final score lands in one of four bands.", chips: ["BEAT FIT · 6%"] },
];

const SOURCES = [
  { idx: "01", name: "GDELT", role: "global news volume, the coverage denominator." },
  { idx: "02", name: "Hacker News", role: "developer and startup chatter." },
  { idx: "03", name: "SEC EDGAR", role: "regulatory filings and disclosures." },
  { idx: "04", name: "Wikipedia", role: "edit activity as an attention signal." },
  { idx: "05", name: "arXiv", role: "research pre-prints before the press finds them." },
];

const BEATS = ["SaaS & startups", "Fintech", "Health & wellness", "Climate & energy", "AI", "Cybersecurity & Privacy"];
const SELECTED_BEAT = "SaaS & startups";

const BREAKDOWN = [
  { name: "Magnitude", val: "35", w: "35%" },
  { name: "Velocity", val: "87", w: "87%" },
  { name: "Coverage gap", val: "50", w: "50%" },
  { name: "Beat fit", val: "100", w: "100%" },
];

const RECEIPTS = [
  { claim: "14 SEC filings mention “B2B marketplace” in 30 days", src: "SEC EDGAR · 14 filings vs ~8/mo prior" },
  { claim: "LinkedIn wants to own B2B creator discovery", src: "Hacker News · 4 pts in 30d" },
];

const JOURNALISTS = [
  { desk: "B2B Commerce reporter", outlet: "Modern Distribution Mgmt · procurement", why: "Their readership is the exact buyer persona for this shift." },
  { desk: "Enterprise reporter", outlet: "The Information · business models", why: "Goes deep on model evolution; SEC data is a concrete hook." },
  { desk: "Markets desk", outlet: "Fortune · enterprise", why: "LinkedIn news peg + filing trend = broader market narrative." },
];

const BANDS = [
  { name: "Hot lead", range: "80 to 100", desc: "Strong signal, little coverage. Move now.", filled: 4 },
  { name: "Worth a look", range: "60 to 79", desc: "Real movement with coverage room left. Read the receipts.", filled: 3 },
  { name: "Early", range: "40 to 59", desc: "Still forming. Watch it, and prepare the angle.", filled: 2 },
  { name: "Noise / late", range: "0 to 39", desc: "Weak signal, or the press is already on it.", filled: 1 },
];

const FACTORS = [
  { name: "Coverage gap", weight: "28%", desc: "how much press coverage already exists; less coverage, more opportunity." },
  { name: "Magnitude", weight: "22%", desc: "the raw size of the movement in the source data." },
  { name: "Velocity", weight: "20%", desc: "how fast the movement is growing against its own baseline." },
  { name: "Corroboration", weight: "14%", desc: "independent sources agreeing; noise rarely shows up twice." },
  { name: "Credibility", weight: "10%", desc: "the reliability tier of the sources carrying the signal." },
  { name: "Beat fit", weight: "6%", desc: "overlap between the topic and the chosen beat’s vocabulary." },
];

const PIPELINE_STRIP = [
  { name: "SignalIQ", current: true },
  { name: "AssetIQ", current: false },
  { name: "JournoCollabIQ", current: false },
  { name: "PressIQ", current: false },
  { name: "CoverageIQ", current: false },
];

/* ── Shared style fragments ───────────────────────────────────────────────── */
const actPill: React.CSSProperties = {
  display: "inline-block",
  background: YEL,
  color: INK,
  fontFamily: GROT,
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: ".12em",
  padding: "6px 11px",
};

const actCaption: React.CSSProperties = {
  fontFamily: SERIF,
  fontStyle: "italic",
  fontSize: 14.5,
  color: INK55,
  marginLeft: 14,
};

const slotHead: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 10,
  marginBottom: 14,
};

const slotNum: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  fontWeight: 700,
  color: INK35,
};

const slotName: React.CSSProperties = {
  fontFamily: GROT,
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: ".08em",
};

/* Act separator: centered ▼ glyph + full-width 1px ink rule */
const ActDivider = () => (
  <>
    <div style={{ textAlign: "center", margin: "34px 0 30px", color: INK35, fontSize: 18 }}>{"▼"}</div>
    <HRule />
  </>
);

/* Hollow yellow-bordered 6×6 square (sample/illustrative marker — NOT a live dot) */
const HollowSquare = () => (
  <span style={{ width: 6, height: 6, border: `1px solid ${YEL}`, display: "inline-block", flexShrink: 0 }} />
);

export default function SignalIQHowItWorksPage() {
  const [cursor, setCursor] = useState(0);
  const [speed, setSpeed] = useState<SpeedName>("Normal");
  const [playing, setPlaying] = useState(true);
  const [factorsOpen, setFactorsOpen] = useState(false);

  // Timer loop: advances the cursor while playing; delay follows the speed
  // setting. Keying the effect on `cursor` re-arms the timeout after each
  // tick (and immediately reschedules on speed change / pause / manual jump),
  // mirroring the spec's schedule() setTimeout loop.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setCursor((c) => (c + 1) % TOTAL), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, speed, cursor]);

  const step = Math.min(cursor, 7);
  // 0 none, 1 brief, 2 pitch, 3 chart, 4-6 journalists
  const packStage = cursor <= 7 ? 0 : cursor - 7;
  const active = STEPS[step];

  // During the steps phase (packStage 0) the pack stays fully shown from its
  // last build; during an active build (1..6) slots reveal in sequence.
  const shown = (t: number) => packStage === 0 || packStage >= t;
  const reveal = (on: boolean): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: `translateY(${on ? "0" : "10px"})`,
  });

  return (
    <>
      <ToolHeader
        toolPrefix="Signal"
        subtitle="How it works · The scoring framework"
        rightContent={
          <Link
            href="/tools/signaliq"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}
          >
            Open SignalIQ {"→"}
          </Link>
        }
      />

      <div className="sigfw" style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        <style>{`
          .sigfw * { box-sizing: border-box; }
          .sigfw .sig-src:hover { background: ${PAPER2}; }
          .sigfw .sig-step:hover .sig-ibox { border-color: ${INK}; }
          .sigfw .sig-beat:hover, .sigfw .sig-chip:hover { background: ${YEL}; color: ${INK}; }
          /* Narrow-width guardrails — desktop measurements untouched above these points */
          @media (max-width: 760px) {
            .sigfw-actindex { grid-template-columns: 1fr 1fr !important; }
            .sigfw-act1 { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 680px) {
            .sigfw-sources { grid-template-columns: 1fr !important; }
            .sigfw-pack { grid-template-columns: 1fr !important; }
            .sigfw-pack > div { border-right: none !important; }
            .sigfw-bands { grid-template-columns: 1fr 1fr !important; }
            .sigfw-factors { grid-template-columns: 1fr !important; }
            .sigfw-strip { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div style={{ padding: "28px 24px 64px", overflowX: "hidden" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", border: `1px solid ${INK}`, background: PAPER }}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <header style={{ background: INK, color: PAPER, padding: "30px 40px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: "clamp(36px, 5.4vw, 60px)", letterSpacing: "-.01em", lineHeight: 0.96, margin: 0 }}>
                    SIGNAL<span style={{ color: YEL }}>IQ</span>
                  </h1>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, margin: "10px 0 0", color: P72 }}>
                    See the story before it breaks.
                  </p>
                  <p style={{ fontFamily: GROT, fontWeight: 500, fontSize: 11.5, letterSpacing: ".02em", margin: "10px 0 0", color: P55, maxWidth: 420 }}>
                    Following Fairground, a fictional B2B marketplace SaaS, through one real signal.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 11, height: 11, background: YEL, display: "inline-block" }} />
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".2em" }}>INTERACTIVE</span>
                  </div>
                  <div style={{ fontFamily: GROT, fontWeight: 600, fontSize: 11, letterSpacing: ".16em", color: P55, marginBottom: 12 }}>
                    5 SOURCES {"·"} 8 STEPS {"·"} 4 BANDS {"·"} 1 CLICK
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px dashed ${P25}`, padding: "5px 10px" }}>
                    <HollowSquare />
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", color: P72 }}>
                      SAMPLE SCENARIO {"·"} FAIRGROUND (ILLUSTRATIVE)
                    </span>
                  </div>
                </div>
              </div>
              {/* Act index */}
              <div className="sigfw-actindex" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginTop: 26, border: `1px solid ${P25}` }}>
                {["Open Data In", "The Scoring Engine", "Ranked Opportunity Out", "One Click, One Pack"].map((label, i) => (
                  <div
                    key={label}
                    style={{ padding: "11px 14px", borderRight: i < 3 ? `1px solid ${P25}` : "none", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".03em" }}
                  >
                    <span style={{ color: YEL }}>{["①", "②", "③", "④"][i]}</span>
                    {"  "}
                    {label}
                  </div>
                ))}
              </div>
            </header>

            <div style={{ padding: "40px 40px 8px" }}>

              {/* ── ACT ① OPEN DATA IN ─────────────────────────────────────── */}
              <div className="sigfw-act1" style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 40, alignItems: "start" }}>
                <div>
                  <span style={actPill}>{"①"}{" "} OPEN DATA IN</span>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, lineHeight: 1.5, color: INK70, margin: "16px 0 0" }}>
                    Five open source feeds and a beat picker: the raw material every scan starts from.
                  </p>
                </div>
                <div>
                  {/* Source grid */}
                  <div className="sigfw-sources" style={{ border: `1px solid ${INK}`, display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                    {SOURCES.map((s) => (
                      <div key={s.idx} className="sig-src" style={{ padding: "16px 14px", borderRight: `1px solid ${INK15}`, transition: "background .12s ease" }}>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: INK35, marginBottom: 8 }}>{s.idx}</div>
                        <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13.5, marginBottom: 6 }}>{s.name}</div>
                        <div style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.4, color: INK70 }}>{s.role}</div>
                      </div>
                    ))}
                  </div>
                  {/* Beat picker */}
                  <div style={{ border: `1px solid ${INK}`, borderTop: "none", background: PAPER2, padding: "16px 18px" }}>
                    <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 12 }}>Beat picker</SCaps>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {BEATS.map((b) => (
                        <span
                          key={b}
                          className="sig-beat"
                          style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, border: `1px solid ${INK}`, background: b === SELECTED_BEAT ? YEL : "transparent", color: INK, padding: "7px 13px", transition: "background .12s ease, color .12s ease", cursor: "default" }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, margin: "14px 0 0", maxWidth: 640 }}>
                      Optional: add your company profile, and results are ranked for your company.
                    </p>
                    {/* Company profile card */}
                    <div style={{ border: `1px solid ${INK}`, background: PAPER, marginTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: INK, color: PAPER, padding: "8px 14px" }}>
                        <HollowSquare />
                        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".18em" }}>
                          COMPANY PROFILE {"·"} FAIRGROUND (ILLUSTRATIVE)
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 18px", padding: "14px 16px" }}>
                        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>Company</span>
                        <span style={{ fontFamily: SERIF, fontSize: 14 }}>Fairground</span>
                        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>One-line</span>
                        <span style={{ fontFamily: SERIF, fontSize: 14 }}>Marketplace infrastructure for B2B distributors and manufacturers</span>
                        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>Web</span>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: INK70 }}>fairground.example.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── ACT ② THE SCORING ENGINE ───────────────────────────────── */}
              <div style={{ marginTop: 30 }}>
                <span style={actPill}>{"②"}{" "} THE SCORING ENGINE</span>
                <span style={actCaption}>an 8 step pipeline. drive it with the player, or click any step.</span>

                {/* Pipeline row */}
                <div style={{ overflowX: "auto", marginTop: 26 }}>
                  <div style={{ position: "relative", minWidth: 760, display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                    <div style={{ position: "absolute", left: "6%", right: "6%", top: 46, height: 1, background: INK35 }} />
                    {STEPS.map((s, i) => {
                      const on = i === step;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setCursor(i)}
                          className="sig-step"
                          style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", padding: "0 4px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
                        >
                          <span style={{ fontFamily: MONO, fontSize: 11, color: INK35, marginBottom: 8 }}>{pad(i + 1)}</span>
                          <span
                            className="sig-ibox"
                            style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, background: on ? INK : PAPER, color: on ? YEL : INK, border: `1px solid ${on ? INK : INK35}`, transition: "all .18s ease" }}
                          >
                            {s.icon}
                          </span>
                          <span style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `7px solid ${YEL}`, opacity: on ? 1 : 0, marginTop: 6, transition: "opacity .18s ease" }} />
                          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".04em", textTransform: "uppercase", lineHeight: 1.25, marginTop: 4, color: on ? INK : INK55, maxWidth: 96 }}>
                            {s.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Player bar */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 26, background: INK, color: PAPER, padding: "13px 18px" }}>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", background: YEL, color: INK, border: "none", padding: "9px 18px", cursor: "pointer", minWidth: 96 }}
                  >
                    {playing ? "❙❙ Pause" : "▶ Play"}
                  </button>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".18em", color: P45 }}>SPEED</span>
                  <div style={{ display: "flex", border: `1px solid ${P25}` }}>
                    {SPEED_NAMES.map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSpeed(sp)}
                        style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: speed === sp ? YEL : "transparent", color: speed === sp ? INK : PAPER, border: "none", borderRight: `1px solid ${P25}`, padding: "9px 16px", cursor: "pointer" }}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".14em", color: YEL }}>
                    STEP {pad(step + 1)} / 8 {"·"} {playing ? "PLAYING" : "PAUSED"}
                  </span>
                </div>

                {/* Detail panel */}
                <div style={{ display: "flex", border: `1px solid ${INK}`, borderTop: "none", minHeight: 148 }}>
                  <div style={{ background: INK, color: YEL, width: 130, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 30, lineHeight: 1 }}>{active.icon}</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".12em", color: P55 }}>STEP {pad(step + 1)}</span>
                  </div>
                  <div style={{ padding: "22px 26px", background: PAPER, flex: 1 }}>
                    <h3 style={{ fontFamily: GROT, fontWeight: 800, fontSize: 20, letterSpacing: ".02em", textTransform: "uppercase", margin: "0 0 10px" }}>
                      {active.name}
                    </h3>
                    <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: INK70, margin: 0, maxWidth: 720 }}>
                      {active.desc}
                    </p>
                    {active.chips.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                        {active.chips.map((c) => (
                          <span key={c} className="sig-chip" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", border: `1px solid ${INK}`, background: PAPER, padding: "6px 11px", transition: "background .12s ease, color .12s ease" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── ACT ③ RANKED OPPORTUNITY OUT ───────────────────────────── */}
              <div style={{ marginTop: 30 }}>
                <span style={actPill}>{"③"}{" "} RANKED OPPORTUNITY OUT</span>
                <span style={actCaption}>one real opportunity, scored, sourced, and packed.</span>

                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: INK, borderLeft: `3px solid ${YEL}`, padding: "3px 0 3px 12px", marginTop: 22 }}>
                  Fairground{"’"}s top opportunity this week
                </div>

                <div style={{ border: `1px solid ${INK}`, marginTop: 14 }}>
                  <div style={{ background: INK, color: PAPER, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 18px" }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500 }}>ranked-opportunity.json</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".18em", color: P55 }}>LIVE SAAS SCAN {"·"} 2026</span>
                  </div>

                  <div>
                    <div>
                      {/* Score row */}
                      <div style={{ display: "flex", borderBottom: `1px solid ${INK}` }}>
                        <div style={{ background: INK, color: PAPER, padding: "18px 22px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 128 }}>
                          <span style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, lineHeight: 1 }}>63</span>
                          <span style={{ fontFamily: MONO, fontSize: 13, color: P55, marginTop: 2 }}>/ 100</span>
                        </div>
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: YEL, color: INK, padding: "4px 9px", alignSelf: "flex-start" }}>
                            Worth a look {"·"} saas
                          </span>
                          <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.22, margin: "12px 0 0", maxWidth: 460 }}>
                            14 SEC filings mention {"“"}B2B marketplace{"”"} in 30 days
                          </h3>
                        </div>
                      </div>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: INK70, margin: 0, padding: "14px 20px", borderBottom: `1px solid ${INK15}`, maxWidth: 600 }}>
                        A lead/whitespace score: how far ahead of the coverage you are. Not a prediction the story breaks.
                      </p>

                      {/* Score breakdown */}
                      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${INK15}` }}>
                        <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 14 }}>Score breakdown</SCaps>
                        {BREAKDOWN.map((b) => (
                          <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, width: 108, flexShrink: 0 }}>{b.name}</span>
                            <span style={{ flex: 1, height: 12, background: PAPER2, border: `1px solid ${INK15}`, position: "relative" }}>
                              <span style={{ position: "absolute", inset: "0 auto 0 0", width: b.w, background: YEL }} />
                            </span>
                            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, width: 34, textAlign: "right" }}>{b.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* The receipts */}
                      <div style={{ padding: "18px 20px" }}>
                        <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 14 }}>The receipts</SCaps>
                        {RECEIPTS.map((r) => (
                          <div key={r.src} style={{ borderLeft: `3px solid ${YEL}`, padding: "2px 0 2px 14px", marginBottom: 14 }}>
                            <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.4, marginBottom: 4, maxWidth: 520 }}>{r.claim}</div>
                            <div style={{ fontFamily: MONO, fontSize: 12, color: INK55 }}>{r.src}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: "2px 20px 22px" }}>
                      <button
                        type="button"
                        onClick={() => setCursor(8)}
                        style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", background: INK, color: PAPER, border: "none", padding: "12px 20px", cursor: "pointer" }}
                      >
                        Generate pack {"→"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── ACT ④ ONE CLICK, ONE PACK ──────────────────────────────── */}
              <div style={{ marginTop: 30 }}>
                <span style={actPill}>{"④"}{" "} ONE CLICK, ONE PACK</span>
                <span style={actCaption}>the payoff: one click turns the opportunity into a ready-to-send pack.</span>

                <div style={{ border: `1px solid ${INK}`, marginTop: 24 }}>
                  <div style={{ background: INK, color: PAPER, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 18px", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500 }}>asset-pack.md</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: P55 }}>
                      B2B MARKETPLACE SIGNAL {"·"} SAAS {"·"} 63/100
                    </span>
                  </div>

                  <div className="sigfw-pack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    {/* Slot 01 DATA BRIEF */}
                    <div style={{ borderRight: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: 20, ...reveal(shown(1)), transition: "opacity .4s ease, transform .4s ease" }}>
                      <div style={slotHead}><span style={slotNum}>01</span><span style={slotName}>DATA BRIEF</span></div>
                      <div style={{ borderLeft: `3px solid ${YEL}`, padding: "2px 0 2px 14px", marginBottom: 12 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.4, marginBottom: 4 }}>14 SEC filings mention {"“"}B2B marketplace{"”"} in 30 days</div>
                        <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK55 }}>SEC EDGAR {"·"} 14 filings vs ~8/mo prior</div>
                      </div>
                      <div style={{ borderLeft: `3px solid ${YEL}`, padding: "2px 0 2px 14px", marginBottom: 14 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.4, marginBottom: 4 }}>LinkedIn wants to own B2B creator discovery</div>
                        <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK55 }}>Hacker News {"·"} 4 pts in 30d</div>
                      </div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, borderTop: `1px solid ${INK15}`, paddingTop: 10 }}>
                        Every claim links to the primary record. No hallucinated citations.
                      </div>
                    </div>

                    {/* Slot 02 PITCH ANGLE */}
                    <div style={{ borderBottom: `1px solid ${INK}`, padding: 20, ...reveal(shown(2)), transition: "opacity .4s ease, transform .4s ease" }}>
                      <div style={slotHead}><span style={slotNum}>02</span><span style={slotName}>PITCH ANGLE</span></div>
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Subject</div>
                      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 12 }}>
                        SEC filings signal B2B marketplace moment: founder perspective
                      </div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, margin: "0 0 12px" }}>
                        Fourteen SEC filings in 30 days used the phrase {"“"}B2B marketplace{"”"}, nearly double the prior monthly baseline. That regulatory language shift is a leading indicator: the model is becoming material enough for public companies to disclose, before this becomes the obvious story everyone is writing.
                      </p>
                      <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "10px 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.45, color: INK70 }}>
                        Linkable asset to build: a {"“"}B2B Marketplace Disclosure Index{"”"}, track the filing-language trend quarterly and give reporters a number to cite.
                      </div>
                    </div>

                    {/* Slot 03 CHART */}
                    <div style={{ borderRight: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: 20, ...reveal(shown(3)), transition: "opacity .4s ease, transform .4s ease" }}>
                      <div style={{ ...slotHead, marginBottom: 16 }}><span style={slotNum}>03</span><span style={slotName}>CHART</span></div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, height: 150, borderBottom: `1px solid ${INK}`, padding: "0 8px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>~8</span>
                          <div style={{ width: "100%", background: PAPER2, border: `1px solid ${INK}`, height: shown(3) ? "57%" : "0%", transition: "height .6s ease" }} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>14</span>
                          <div style={{ width: "100%", background: YEL, border: `1px solid ${INK}`, height: shown(3) ? "100%" : "0%", transition: "height .6s ease" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 28, padding: "8px 8px 0" }}>
                        <span style={{ flex: 1, textAlign: "center", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".04em", color: INK55 }}>~8 FILINGS/MO BASELINE</span>
                        <span style={{ flex: 1, textAlign: "center", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".04em", color: INK55 }}>14 FILINGS IN 30 DAYS</span>
                      </div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK70, marginTop: 12 }}>
                        75% above the ~8 filings/month baseline.
                      </div>
                    </div>

                    {/* Slot 04 JOURNALIST SHORTLIST */}
                    <div style={{ borderBottom: `1px solid ${INK}`, padding: 20 }}>
                      <div style={slotHead}><span style={slotNum}>04</span><span style={slotName}>JOURNALIST SHORTLIST</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {JOURNALISTS.map((j, i) => (
                          <div key={j.desk} style={{ border: `1px solid ${INK}`, background: PAPER, padding: "12px 14px", ...reveal(shown(4 + i)), transition: "opacity .35s ease, transform .35s ease" }}>
                            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13 }}>{j.desk}</span>
                              <span style={{ fontFamily: MONO, fontSize: 11, color: INK55, textAlign: "right" }}>{j.outlet}</span>
                            </div>
                            <div style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.4, color: INK70, marginTop: 6 }}>{j.why}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", borderBottom: `2px solid ${YEL}`, paddingBottom: 2, cursor: "pointer" }}>
                      Build asset from this pack {"→"}
                    </span>
                  </div>
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: INK70, margin: "14px 0 0", maxWidth: 700 }}>
                  Click {"“"}Build asset from this pack{"”"} to continue Fairground{"’"}s story in AssetIQ {"→"}
                </p>
              </div>

              {/* ── BAND SCALE ─────────────────────────────────────────────── */}
              <div style={{ marginTop: 44 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <SCaps size={11} ls=".2em" color={INK55}>The band scale</SCaps>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: INK35 }}>HOT {"→"} LATE</span>
                </div>
                <div className="sigfw-bands" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, marginTop: 14 }}>
                  {BANDS.map((bd) => (
                    <div key={bd.name} style={{ borderRight: `1px solid ${INK15}` }}>
                      <div style={{ display: "flex", gap: 4, padding: "14px 16px 0" }}>
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} style={{ width: 13, height: 13, border: `1.5px solid ${INK}`, background: i < bd.filled ? YEL : "transparent" }} />
                        ))}
                      </div>
                      <div style={{ padding: "12px 16px 18px" }}>
                        <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{bd.name}</div>
                        <div style={{ fontFamily: MONO, fontSize: 12, color: INK55, marginBottom: 10 }}>{bd.range}</div>
                        <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.45, color: INK70 }}>{bd.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.55, color: INK70, margin: "14px 0 0", maxWidth: 840 }}>
                  The score measures lead, not likelihood. A 63 does not mean a 63 percent chance the story breaks. It means how far ahead of existing coverage you are. Never present it as a prediction.
                </p>
              </div>

              {/* ── FACTORS PANEL ──────────────────────────────────────────── */}
              <div style={{ marginTop: 40, paddingBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setFactorsOpen((o) => !o)}
                  style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", background: INK, color: PAPER, border: "none", padding: "12px 18px", cursor: "pointer" }}
                >
                  {factorsOpen ? "▾ HIDE THE 6 FACTORS" : "▸ SHOW THE 6 FACTORS"}
                </button>
                {factorsOpen && (
                  <div className="sigfw-factors" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}`, borderBottom: "none", marginTop: 16 }}>
                    {FACTORS.map((f) => (
                      <div key={f.name} style={{ padding: 18, borderRight: `1px solid ${INK15}`, borderBottom: `1px solid ${INK}` }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14 }}>{f.name}</span>
                          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: INK, background: YEL, padding: "2px 7px" }}>{f.weight}</span>
                        </div>
                        <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.45, color: INK70 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PIPELINE FOOTER ────────────────────────────────────────── */}
              <div style={{ marginTop: 24, borderTop: `1px solid ${INK}`, borderBottom: `3px solid ${INK}`, padding: "22px 0 6px" }}>
                <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 14 }}>The EMOS pipeline</SCaps>
                <div className="sigfw-strip" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `1px solid ${INK}` }}>
                  {PIPELINE_STRIP.map((t) => (
                    <div
                      key={t.name}
                      style={{ padding: "14px 12px", borderRight: `1px solid ${INK15}`, background: t.current ? INK : PAPER, color: t.current ? PAPER : INK55, display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 11, color: t.current ? YEL : "transparent" }}>{t.current ? "▸" : ""}</span>
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".04em" }}>{t.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: INK, color: PAPER, marginTop: 18, padding: "24px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ maxWidth: 560 }}>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: YEL, marginBottom: 10 }}>
                      Next step in the pipeline
                    </div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginBottom: 8 }}>
                      AssetIQ {"—"} Linkable Asset Builder
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: P72 }}>
                      Turn a signal into a linkable asset: report, calculator, quiz.
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, border: "none", padding: "14px 24px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Go to AssetIQ {"→"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <ToolPipelineFooter currentTool="signaliq" />
      </div>
    </>
  );
}

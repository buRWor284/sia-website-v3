"use client";

/**
 * AssetIQ — public teaser page
 * /tools/assetiq
 *
 * High-fidelity React port of the design handoff "AssetIQ Framework v3"
 * (design_handoff_assetiq_framework). This is a MARKETING EXPLAINER for a
 * platform-only tool, not a working version of AssetIQ: no API routes, no
 * email gates, no live form submission. AssetIQ itself ships inside the
 * authenticated EMOS Platform at /emos-platform/dashboard/assetiq.
 *
 * Three acts, following the v3 "Fairground" sample scenario (fictional B2B
 * marketplace SaaS, illustrative only):
 *   ① Signal In → ② The Builder Engine (animated 6-step player)
 *   → ③ Asset Out (record + AI creation plan + sequential handoff)
 *   + status scale, collapsible 5-asset-types panel, pipeline nav footer.
 *
 * All copy is locked per the v3 spec except where the README marks the plan
 * body paragraphs as illustrative/replaceable. Zero border-radius, zero
 * box-shadows, Unicode glyphs only, no icon libraries.
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
const P35 = "rgba(241,235,222,.35)";
const P25 = "rgba(241,235,222,.25)";

type SpeedName = "Slow" | "Normal" | "Fast";
const SPEEDS: Record<SpeedName, number> = { Slow: 3400, Normal: 1900, Fast: 950 };
const SPEED_NAMES: SpeedName[] = ["Slow", "Normal", "Fast"];
const pad = (n: number) => (n < 10 ? "0" + n : "" + n);

/* ── Locked content (v3 spec) ─────────────────────────────────────────────── */
interface Step { name: string; desc: string; }

const STEPS: Step[] = [
  { name: "Signal detected", desc: "A signal exists in SignalIQ with a headline. Its card carries a Build → link straight into AssetIQ." },
  { name: "Build asset pack (optional)", desc: "Button “Generate asset pack →” (loading: “Building pack…”) produces a headline, data brief, pitch angle, subject line, linkable asset idea, journalist list, and cautions, all in one AI call." },
  { name: "Land in AssetIQ with context", desc: "The page opens with the “From SignalIQ” banner and the pack’s three context columns." },
  { name: "Generate AI creation plan", desc: "Button “Generate creation plan →” calls the asset-brief endpoint with the asset type, working title, and all available context. Output renders under the heading “Asset creation plan.”" },
  { name: "Create the tracked asset record", desc: "Button “+ Create asset” opens a form (Asset type, Title, Target keyword, Notes) and submits “Create asset” (loading: “Creating…”). The new row is created with status Draft and appears at the top of the list immediately." },
  { name: "Brief it and hand it off", desc: "From the saved asset row, “Generate AI brief →” produces a standalone AI creation brief; “Find journalists →” (also shown as “Find journalists for this asset →” under a generated brief) hands off to JournoCollabIQ carrying the asset’s title, type, and idea." },
];

const ASSET_TYPES = [
  { name: "Research Report", desc: "Original data study or survey with shareable findings." },
  { name: "Calculator", desc: "Interactive tool that gives personalised results." },
  { name: "Quiz", desc: "Diagnostic or assessment that segments the reader." },
  { name: "Infographic", desc: "Visual data story designed for embedding / sharing." },
  { name: "Data Study", desc: "Analysis of proprietary or public datasets." },
];

const STATUSES = [
  { name: "Draft", desc: "the asset record has just been created; nothing has been built yet.", bg: PAPER, fg: INK },
  { name: "In review", desc: "the asset is being built or checked before publishing.", bg: YEL, fg: INK },
  { name: "Published", desc: "the asset is live; a Published URL is tracked and Links earned begins counting.", bg: INK, fg: PAPER, current: true },
  { name: "Archived", desc: "the asset is retired and no longer active.", bg: PAPER2, fg: INK55 },
];

const RECORD_FIELDS = [
  { label: "Asset type", value: "Research Report" },
  { label: "Title", value: "The State of B2B Marketplaces 2026" },
  { label: "Target keyword", value: "b2b marketplace software" },
  { label: "Description (Notes)", value: "Benchmark of 40 platforms against a 3-part marketplace definition" },
  { label: "Status", value: "Published" },
  { label: "Published URL", value: "fairground.example.com/reports/b2b-marketplace-2026" },
  { label: "Links earned", value: "1" },
  { label: "Linked signal", value: "14 SEC filings mention “B2B marketplace” in 30 days" },
];

const PLAN_SECTIONS = [
  { name: "Why This Asset Will Earn Links", body: "A benchmark study with a named methodology gives writers a citable number, the single strongest driver of inbound links." },
  { name: "The Core Angle", body: "B2B marketplace software is being disclosed in SEC filings well ahead of the press coverage, and no benchmark of the category exists yet." },
  { name: "Content Outline", body: "Definition, 40-platform scoring table, three archetypes, adoption curve, methodology, and a downloadable dataset." },
  { name: "Data You Need to Gather", body: "Platform feature lists, pricing tiers, filing mentions by quarter, and a three-part marketplace definition to score against." },
  { name: "Key Questions This Asset Answers", body: "What counts as a B2B marketplace, who are the 40 platforms, and how fast is the category actually growing." },
  { name: "Methodology Note (for credibility)", body: "Score each platform 0 to 3 against each of the three definitional criteria; sum for a 0 to 9 marketplace-fit score." },
  { name: "Pitch Hook (1-liner for journalist outreach)", body: "SEC filings just told us B2B marketplaces are having a moment, so we scored 40 of them to find out which ones actually qualify." },
  { name: "Distribution Angles", body: "Trade press covering procurement and distribution, newsletter roundups on B2B SaaS, and a LinkedIn post from the founder." },
];

/* ── Shared style fragments ───────────────────────────────────────────────── */
const actPill: React.CSSProperties = {
  display: "inline-block", background: YEL, color: INK, fontFamily: GROT,
  fontWeight: 800, fontSize: 12, letterSpacing: ".16em", padding: "5px 11px",
};
const actCaption: React.CSSProperties = {
  fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK55, marginLeft: 14,
};
const ActDivider = () => (
  <>
    <div style={{ textAlign: "center", margin: "34px 0 30px", color: INK35, fontSize: 18 }}>{"▼"}</div>
    <HRule />
  </>
);

export default function AssetIQPage() {
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState<SpeedName>("Normal");
  const [playing, setPlaying] = useState(true);
  const [showTypes, setShowTypes] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, speed, step]);

  const active = STEPS[step];

  return (
    <>
      <ToolHeader
        toolPrefix="Asset"
        subtitle="How it works · Linkable asset builder"
        rightContent={
          <Link
            href="/"
            style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.85)", textDecoration: "none" }}
          >
            ← Main Site
          </Link>
        }
      />

      <div className="aiqfw" style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        <style>{`
          .aiqfw * { box-sizing: border-box; }
          @keyframes aiqBlink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
          @keyframes aiqPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
          .aiq-blink { animation: aiqBlink 1.4s ease infinite; }
          .aiq-pulse { animation: aiqPulse 1.4s ease infinite; }
          .aiq-ink-btn:hover { opacity: .85; }
          .aiq-yel-btn:hover { background: #ffc83a; }
          .aiq-ghost-btn:hover { background: ${PAPER}; color: ${INK}; }
          @media (max-width: 760px) {
            .aiqfw-act3 { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 680px) {
            .aiqfw-ctx { grid-template-columns: 1fr !important; }
            .aiqfw-form2 { grid-template-columns: 1fr !important; }
            .aiqfw-steps { grid-template-columns: repeat(3, 1fr) !important; }
            .aiqfw-status { grid-template-columns: 1fr 1fr !important; }
            .aiqfw-types { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div style={{ padding: "28px 24px 64px", overflowX: "hidden" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", border: `1px solid ${INK}`, background: PAPER }}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <header style={{ background: INK, color: PAPER, padding: "34px 40px 30px" }}>
              {/* Platform badge — persistent, top of hero */}
              <div style={{ marginBottom: 18 }}>
                <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: GROT, fontWeight: 900, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", padding: "5px 10px" }}>
                  Inside the EMOS Platform
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: "clamp(32px, 4.6vw, 44px)", letterSpacing: ".02em", lineHeight: 1, margin: 0 }}>
                    ASSET<span style={{ color: YEL }}>IQ</span>
                  </h1>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, margin: "10px 0 0", color: P72 }}>
                    Linkable Asset Builder
                  </p>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, margin: "8px 0 0", color: P55, maxWidth: 560 }}>
                    {"Turn a signal into a linkable asset — report, calculator, quiz."}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 9, height: 9, background: YEL, display: "inline-block" }} />
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em" }}>INTERACTIVE</span>
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10.5, background: YEL, color: INK, padding: "3px 7px" }}>V3</span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ display: "inline-block", fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", background: YEL, color: INK, padding: "4px 9px" }}>
                      Sample scenario · Fairground (illustrative)
                    </span>
                  </div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", color: P55, marginBottom: 10 }}>
                    5 ASSET TYPES {"·"} 6 STEPS {"·"} 4 STATUSES
                  </div>
                  <div style={{ fontFamily: GROT, fontWeight: 400, fontSize: 10, color: P72 }}>
                    EMOS Platform members only
                  </div>
                </div>
              </div>

              {/* Breadcrumb */}
              <div style={{ marginTop: 22, paddingTop: 14, borderTop: `1px solid ${P25}`, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".16em", color: P72, display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span>SIGNALIQ</span><span style={{ color: P35 }}>{"→"}</span>
                <span style={{ color: YEL }}>ASSETIQ</span><span style={{ color: P35 }}>{"→"}</span>
                <span>FACTCHECKIQ</span><span style={{ color: P35 }}>{"→"}</span>
                <span>JOURNOCOLLABIQ</span><span style={{ color: P35 }}>{"→"}</span>
                <span>PRESSIQ</span><span style={{ color: P35 }}>{"→"}</span>
                <span>COVERAGEIQ</span>
              </div>
            </header>

            <div style={{ padding: "40px 40px 8px" }}>

              {/* ── ACT ① SIGNAL IN ──────────────────────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={actPill}>{"①"} SIGNAL IN</span>
                  <span style={actCaption}>a SignalIQ opportunity arrives with its context</span>
                </div>

                <div style={{ border: `1px solid ${INK}`, background: PAPER2, marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${INK15}` }}>
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", background: INK, color: PAPER, padding: "5px 10px" }}>
                      From SignalIQ
                    </span>
                    <Link href="/tools/signaliq" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, color: INK, textDecoration: "none" }}>
                      {"←"} Back to SignalIQ
                    </Link>
                  </div>

                  <div style={{ padding: "18px 20px", borderBottom: `1px dashed ${INK35}` }}>
                    <SCaps size={10} ls=".22em" color={INK55} style={{ display: "block", marginBottom: 8 }}>Signal headline</SCaps>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20 }}>
                      14 SEC filings mention {"“"}B2B marketplace{"”"} in 30 days
                    </div>
                  </div>

                  <div className="aiqfw-ctx" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, padding: "18px 20px" }}>
                    {[
                      { label: "Linkable asset idea", text: "A “B2B Marketplace Disclosure Index,” tracking the filing-language trend quarterly." },
                      { label: "Data brief", text: "14 SEC filings vs ~8/mo prior baseline; SEC EDGAR sourced, 75% above baseline." },
                      { label: "Pitch angle", text: "Regulatory language shift is a leading indicator the model is becoming material." },
                    ].map((c) => (
                      <div key={c.label} style={{ border: `1px solid ${INK}`, background: PAPER, padding: 14, minHeight: 78 }}>
                        <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{c.label}</div>
                        <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.4, color: INK70, marginTop: 8, borderTop: `1px solid ${INK15}`, paddingTop: 8 }}>{c.text}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "4px 20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em" }}>Your company context</label>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, marginLeft: 8 }}>(saved across all EMOS tools)</span>
                      <textarea
                        readOnly
                        defaultValue="We're a B2B marketplace SaaS, and our founder has SEC-filing data on 40+ platforms in the category."
                        style={{ display: "block", width: "100%", marginTop: 8, border: `1px solid ${INK}`, background: PAPER, fontFamily: SERIF, fontSize: 14, padding: "10px 12px", minHeight: 56, resize: "none" }}
                      />
                    </div>
                    <div className="aiqfw-form2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em" }}>Asset type</label>
                        <select disabled defaultValue="Research Report" style={{ display: "block", width: "100%", marginTop: 8, border: `1px solid ${INK}`, background: PAPER, fontFamily: SERIF, fontSize: 14, padding: "10px 12px" }}>
                          {ASSET_TYPES.map((t) => <option key={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em" }}>Working title</label>
                        <input readOnly defaultValue="The State of B2B Marketplaces 2026" style={{ display: "block", width: "100%", marginTop: 8, border: `1px solid ${INK}`, background: PAPER, fontFamily: SERIF, fontSize: 14, padding: "10px 12px" }} />
                      </div>
                    </div>
                    <button type="button" className="aiq-ink-btn" style={{ alignSelf: "flex-start", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", background: INK, color: PAPER, border: "none", padding: "13px 22px", cursor: "default", transition: "opacity .12s ease" }}>
                      Generate creation plan {"→"}
                    </button>
                  </div>

                  <div style={{ borderTop: `3px solid ${YEL}`, padding: "14px 20px", background: PAPER }}>
                    <SCaps size={9.5} ls=".18em" color={INK55} style={{ display: "block", marginBottom: 4 }}>When no assets exist yet</SCaps>
                    <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, margin: 0 }}>
                      A linkable asset is a piece of content worth linking to: a data study, calculator, or quiz built around a signal you spotted in SignalIQ.
                    </p>
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── ACT ② THE BUILDER ENGINE ────────────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={actPill}>{"②"} THE BUILDER ENGINE</span>
                  <span style={actCaption}>the box below shows the step it is parked on. drive it with the player, or click any step</span>
                </div>

                <div className="aiqfw-steps" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: `1px solid ${INK}`, borderTop: `1px solid ${INK}`, marginTop: 22 }}>
                  {STEPS.map((s, i) => {
                    const on = i === step;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setStep(i)}
                        style={{ position: "relative", textAlign: "left", cursor: "pointer", background: on ? INK : "transparent", color: on ? PAPER : INK, border: "none", borderRight: `1px solid ${INK15}`, padding: "16px 12px 20px", transition: "background .18s ease, color .18s ease" }}
                      >
                        <span className={on && playing ? "aiq-blink" : undefined} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: on ? YEL : INK35 }}>
                          {pad(i + 1)}
                        </span>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, marginTop: 6 }}>{s.name}</div>
                        {on && (
                          <span style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 12, height: 12, background: YEL, border: `1px solid ${INK}` }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Player bar */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, background: INK, color: PAPER, padding: "12px 16px" }}>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="aiq-yel-btn"
                    style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, border: "none", padding: "9px 16px", cursor: "pointer", minWidth: 92, transition: "background .12s ease" }}
                  >
                    {playing ? "❚❚ Pause" : "► Play"}
                  </button>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".16em", color: P55 }}>SPEED</span>
                  <div style={{ display: "flex", border: `1px solid ${P25}` }}>
                    {SPEED_NAMES.map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSpeed(sp)}
                        style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", background: speed === sp ? YEL : "transparent", color: speed === sp ? INK : P72, border: `1px solid ${speed === sp ? YEL : P35}`, padding: "7px 13px", cursor: "pointer" }}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: ".08em", color: YEL }}>
                    STEP {pad(step + 1)} / {STEPS.length} {"·"} {playing ? "PLAYING" : "PAUSED"}
                  </span>
                </div>

                {/* Detail panel */}
                <div style={{ display: "flex", border: `1px solid ${INK}`, borderTop: "none", minHeight: 150 }}>
                  <div style={{ width: 150, flexShrink: 0, background: INK, color: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className={playing ? "aiq-pulse" : undefined} style={{ width: 28, height: 28, background: YEL }} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: P55 }}>STEP {pad(step + 1)}</span>
                  </div>
                  <div key={step} style={{ padding: "22px 26px", flex: 1 }}>
                    <h3 style={{ fontFamily: GROT, fontWeight: 800, fontSize: 20, letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 10px" }}>
                      {active.name}
                    </h3>
                    <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.55, color: INK70, margin: 0, maxWidth: 820 }}>
                      {active.desc}
                    </p>
                  </div>
                </div>
              </div>

              <ActDivider />

              {/* ── ACT ③ ASSET OUT ─────────────────────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={actPill}>{"③"} ASSET OUT</span>
                  <span style={actCaption}>the tracked asset record, and the handoff to the next tool</span>
                </div>

                <div style={{ border: `1px solid ${INK}`, marginTop: 20 }}>
                  <div style={{ background: INK, color: PAPER, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500 }}>asset-record</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", color: P55 }}>TRACKED {"·"} SAMPLE VALUES</span>
                  </div>

                  <div className="aiqfw-act3" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0 }}>
                    {/* Left: record fields */}
                    <div style={{ padding: "20px 22px", borderRight: `1px solid ${INK15}` }}>
                      <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 12 }}>Asset record fields</SCaps>
                      {RECORD_FIELDS.map((f) => (
                        <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${INK15}`, padding: "9px 0" }}>
                          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", flexShrink: 0 }}>{f.label}</span>
                          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, textAlign: "right" }}>{f.value}</span>
                        </div>
                      ))}
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, marginTop: 10 }}>
                        {"↳"} from signal: 14 SEC filings mention {"“"}B2B marketplace{"”"}{"…"}
                      </div>

                      {/* Forward handoff — sequential, never both buttons at once */}
                      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => setShowBrief((v) => !v)}
                          className="aiq-ghost-btn"
                          style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "10px 16px", cursor: "pointer", transition: "background .12s ease, color .12s ease" }}
                        >
                          {showBrief ? "Hide AI brief" : "Generate AI brief →"}
                        </button>
                        {!showBrief && (
                          <Link
                            href="/tools/journocollabiq"
                            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: INK, color: PAPER, padding: "10px 16px", textDecoration: "none" }}
                          >
                            Find journalists {"→"}
                          </Link>
                        )}
                      </div>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, marginTop: 8 }}>
                        available once the asset record exists
                      </p>

                      {showBrief && (
                        <div style={{ border: `1px solid ${INK}`, marginTop: 14 }}>
                          <div style={{ background: INK, color: PAPER, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
                            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11 }}>AI creation brief</span>
                            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: P55 }}>GENERATED {"·"} STRUCTURE ONLY</span>
                          </div>
                          <div style={{ padding: "14px 16px" }}>
                            <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.5, color: INK70, margin: "0 0 10px" }}>
                              A ready-to-send creation brief for {"“"}The State of B2B Marketplaces 2026,{"”"} covering the core angle, outline, and pitch hook below.
                            </p>
                            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, margin: "0 0 14px" }}>
                              Illustrative sample content, not a real generated brief.
                            </p>
                            <Link
                              href="/tools/journocollabiq"
                              style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "9px 15px", textDecoration: "none" }}
                            >
                              Find journalists for this asset {"→"}
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: AI creation plan */}
                    <div style={{ padding: "20px 22px" }}>
                      <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 12 }}>Asset creation plan {"·"} 8 sections</SCaps>
                      <div style={{ border: `1px solid ${INK15}`, background: PAPER2 }}>
                        {PLAN_SECTIONS.map((p, i) => (
                          <div key={p.name} style={{ padding: "12px 14px", borderBottom: i < PLAN_SECTIONS.length - 1 ? `1px solid ${INK15}` : "none" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: INK35 }}>{pad(i + 1)}</span>
                              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                            </div>
                            <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.45, color: INK70, margin: "6px 0 0 24px" }}>{p.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STATUS SCALE ────────────────────────────────────────────── */}
              <div style={{ marginTop: 44 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <SCaps size={11} ls=".2em" color={INK55}>The status scale</SCaps>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>Draft {"→"} In review {"→"} Published {"→"} Archived</span>
                </div>
                <div className="aiqfw-status" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginTop: 14 }}>
                  {STATUSES.map((s, i) => (
                    <div key={s.name} style={{ borderLeft: i > 0 ? `1px solid ${INK15}` : "none", borderTop: s.current ? `3px solid ${YEL}` : "none", padding: "18px 16px", minHeight: 150, background: s.current ? "#faf3df" : PAPER }}>
                      <span style={{ display: "inline-block", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: s.bg, color: s.fg, border: `1px solid ${INK}`, padding: "5px 10px" }}>
                        {s.name}
                      </span>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, margin: "12px 0 0" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 5 ASSET TYPES (collapsible) ─────────────────────────────── */}
              <div style={{ marginTop: 24, paddingBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowTypes((o) => !o)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", background: PAPER2, border: `1px solid ${INK}`, padding: "12px 18px", cursor: "pointer" }}
                >
                  <span>{showTypes ? "▾ HIDE THE 5 ASSET TYPES" : "▸ SHOW THE 5 ASSET TYPES"}</span>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, textTransform: "none", letterSpacing: "normal", fontSize: 12, color: INK55 }}>the complete, shipped set</span>
                </button>
                {showTypes && (
                  <div className="aiqfw-types" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", border: `1px solid ${INK}`, borderTop: "none" }}>
                    {ASSET_TYPES.map((t, i) => (
                      <div key={t.name} style={{ borderLeft: i > 0 ? `1px solid ${INK15}` : "none", padding: 18, minHeight: 150 }}>
                        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: INK35 }}>{pad(i + 1)}</span>
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, borderBottom: `2px solid ${YEL}`, display: "inline-block", paddingBottom: 4, marginTop: 8 }}>{t.name}</div>
                        <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.4, color: INK70, marginTop: 10 }}>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PIPELINE NAV FOOTER ─────────────────────────────────────── */}
              <div style={{ marginTop: 24, borderTop: `1px solid ${INK}`, borderBottom: `3px solid ${INK}`, padding: "22px 0 6px" }}>
                <SCaps size={10} ls=".2em" color={INK55} style={{ display: "block", marginBottom: 14 }}>The EMOS pipeline</SCaps>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em" }}>
                  <span style={{ color: "#3f6b45" }}>{"✓"} SIGNALIQ</span>
                  <span style={{ color: INK35 }}>{"·"}</span>
                  <span style={{ background: YEL, color: INK, padding: "4px 9px" }}>ASSETIQ (CURRENT)</span>
                  <span style={{ color: INK35 }}>{"·"}</span>
                  <span style={{ color: INK55 }}>FACTCHECKIQ</span>
                  <span style={{ color: INK35 }}>{"·"}</span>
                  <span style={{ color: INK55 }}>JOURNOCOLLABIQ</span>
                  <span style={{ color: INK35 }}>{"·"}</span>
                  <span style={{ color: INK55 }}>PRESSIQ</span>
                  <span style={{ color: INK35 }}>{"·"}</span>
                  <span style={{ color: INK55 }}>COVERAGEIQ</span>
                </div>

                <div style={{ background: INK, color: PAPER, marginTop: 18, padding: "24px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ maxWidth: 560 }}>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: YEL, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      Next step in the pipeline
                      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", color: P55 }}>PLATFORM</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginBottom: 8 }}>
                      FactcheckIQ | Verification Pipeline
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: P72 }}>
                      Verify every claim in the asset before it goes out to journalists.
                    </div>
                  </div>
                  <Link
                    href="/tools/factcheckiq"
                    style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, padding: "14px 24px", whiteSpace: "nowrap", textDecoration: "none" }}
                  >
                    Go to FactcheckIQ {"→"}
                  </Link>
                </div>
              </div>

              {/* ── PLATFORM CTA BAND ───────────────────────────────────────── */}
              <div style={{ marginTop: 24, marginBottom: 16, background: INK, borderTop: `3px solid ${YEL}`, padding: "36px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div style={{ maxWidth: 620 }}>
                  <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 9px", marginBottom: 12 }}>
                    Platform only
                  </span>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: PAPER, lineHeight: 1.2 }}>
                    AssetIQ is available to EMOS Platform members.
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: P72, marginTop: 8 }}>
                    Join the platform to build tracked, linkable assets from your own signals.
                  </p>
                </div>
                <Link
                  href="/emos-platform"
                  style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", background: YEL, color: INK, padding: "15px 26px", whiteSpace: "nowrap", textDecoration: "none" }}
                >
                  Explore the EMOS Platform {"→"}
                </Link>
              </div>

            </div>
          </div>
        </div>

        <ToolPipelineFooter currentTool="assetiq" />
      </div>
    </>
  );
}

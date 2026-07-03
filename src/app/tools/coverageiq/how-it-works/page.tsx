"use client";

/**
 * CoverageIQ — How It Works (animated framework visual)
 * /tools/coverageiq/how-it-works
 *
 * React port of the "CoverageIQ Framework" design handoff (.dc.html spec).
 * Three acts: ① Pitch In (New Pitch modal) → ② The Tracking Pipeline
 * (animated 6-stage player) → ③ Coverage Out (5 tabbed reporting views),
 * followed by the stage legend, collapsible PESO panel, and the shared
 * EMOS pipeline footer strip with the end-state banner.
 *
 * ALL COPY IS LOCKED — pulled verbatim from the shipped CoverageIQ engine.
 * Honesty constraints that must survive any future edit:
 *   1. CoverageIQ has NO composite score and NO band system. The output is a
 *      stage. Points appear only at Placed/Amplified; formula not finalized.
 *   2. The alerts feed is not live-connected — it keeps its COMING SOON banner.
 *   3. All DR / Points numbers are illustrative sample data (asterisk + caveat
 *      + "SAMPLE SCENARIO · FAIRGROUND (ILLUSTRATIVE)" badges).
 * Zero border-radius. Zero box-shadow (except the functional active-marker
 * glow ring). No gradients, no emoji — Unicode glyphs only.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL, YEL2,
} from "@/lib/tokens";
import { DoubleRule } from "@/components/bureau/primitives";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

/* ── Spec constants (values without a token in src/lib/tokens.ts) ─────────── */
const SURROUND = "#ddd6c4";               // page surround behind the artboard
const GREEN    = "#2f7d32";               // success green (pipeline checkmarks)
const RED      = "#a11414";               // error red (Overdue label)
const AMBER    = "#c08a10";               // (required) marker + conversion stat
// ink transparencies used by the spec that have no token:
const INK35A = "rgba(26,20,16,.35)";
const INK40  = "rgba(26,20,16,.4)";
const INK45  = "rgba(26,20,16,.45)";
const INK50  = "rgba(26,20,16,.5)";
const INK60  = "rgba(26,20,16,.6)";
// paper transparencies on dark surfaces:
const P72 = "rgba(241,235,222,.72)";
const P55 = "rgba(241,235,222,.55)";
const P40 = "rgba(241,235,222,.4)";
const P25 = "rgba(241,235,222,.25)";

/* ── Locked stage data ────────────────────────────────────────────────────── */
type Stage = {
  n: string;
  name: string;
  glyph: string;
  short: string;
  when: string;
  day: string;
  reply: string | null;
};

const STAGES: Stage[] = [
  { n: "01", name: "Drafted",   glyph: "◇", short: "Written but not yet sent.",         when: "You've prepared the pitch but haven't emailed it.",           day: "Day 0",  reply: null },
  { n: "02", name: "Sent",      glyph: "○", short: "Pitch emailed to the journalist.",  when: "You hit send — waiting for any response.",               day: "Day 0",  reply: null },
  { n: "03", name: "Opened",    glyph: "◎", short: "Journalist opened your email.",     when: "Tracked via email open pixel or confirmed manually.",         day: "Day 1",  reply: null },
  { n: "04", name: "Replied",   glyph: "◉", short: "Journalist replied.",               when: "Any reply — even a rejection or request for more info.", day: "Day 2",  reply: "Can you send the full dataset and a contact at one of the 11 that qualify?" },
  { n: "05", name: "Placed",    glyph: "●", short: "Coverage confirmed and published.", when: "The piece is live. Add the URL and DR in the expanded view.", day: "Day 9",  reply: null },
  { n: "06", name: "Amplified", glyph: "★", short: "Placement shared and promoted.",    when: "You've shared it on social, in newsletters, or via outreach.", day: "Day 11", reply: null },
];

/* ── Locked view definitions ──────────────────────────────────────────────── */
type ViewKey = "pipeline" | "follow" | "log" | "contacts" | "peso";

const VIEWS: { key: ViewKey; num: string; label: string; sub: string }[] = [
  { key: "pipeline", num: "§ 01", label: "Pitch Pipeline",      sub: "DRAFTED → AMPLIFIED" },
  { key: "follow",   num: "§ 02", label: "Follow-ups",          sub: "ACTIONS + REMINDERS" },
  { key: "log",      num: "§ 03", label: "Coverage Log",        sub: "PLACEMENTS + POINTS" },
  { key: "contacts", num: "§ 04", label: "Journalist Contacts", sub: "RELATIONSHIP INDEX" },
  { key: "peso",     num: "§ 05", label: "PESO Dashboard",      sub: "PAID · EARNED · SHARED · OWNED" },
];

/* ── Locked PESO category descriptions ────────────────────────────────────── */
const PESO_DESCRIPTIONS: { name: string; text: string }[] = [
  { name: "Earned", text: "Media coverage earned through pitching, expert quotes, HARO responses, and guest contributions. The core of the EMOS playbook." },
  { name: "Shared", text: "Content distributed via social platforms — LinkedIn posts, Twitter threads, community shares. Amplifies earned wins." },
  { name: "Owned",  text: "Content published on your own properties — blog, newsletter, podcast. Full editorial control, permanent real estate." },
  { name: "Paid",   text: "Sponsored content, paid placements, native advertising. Used strategically to amplify earned coverage or fill gaps." },
];

/* ── Player speeds ────────────────────────────────────────────────────────── */
type Speed = "SLOW" | "NORMAL" | "FAST";
const SPEED_MS: Record<Speed, number> = { SLOW: 2600, NORMAL: 1500, FAST: 750 };

/* ── Shared style fragments ───────────────────────────────────────────────── */
const fieldLabel: CSSProperties = {
  fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em",
  textTransform: "uppercase", color: INK55,
};
const fieldBox: CSSProperties = {
  border: `1px solid ${INK35}`, padding: "9px 11px", marginTop: 5,
  fontFamily: SERIF, fontSize: 14.5,
};
const fieldTag: CSSProperties = {
  fontFamily: GROT, fontSize: 8.5, letterSpacing: ".12em", color: INK45,
};
const th: CSSProperties = {
  textAlign: "left", padding: "9px 12px", fontFamily: GROT, fontWeight: 700,
  fontSize: 9, letterSpacing: ".1em", color: INK55, borderBottom: `1px solid ${INK}`,
};
const td: CSSProperties = {
  padding: "11px 12px", borderBottom: `1px solid ${INK15}`,
};
const viewOverline: CSSProperties = {
  fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".16em",
  color: INK55, marginBottom: 16,
};
const actPill: CSSProperties = {
  background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5,
  letterSpacing: ".16em", padding: "5px 9px",
};
const actCaption: CSSProperties = {
  fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55,
};

/* Act section header: yellow pill + italic caption + double rule */
function ActHeader({ pill, caption }: { pill: string; caption: string }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={actPill}>{pill}</span>
        <span style={actCaption}>{caption}</span>
      </div>
      <DoubleRule style={{ marginTop: 14 }} />
    </>
  );
}

/* Modal field (label + bordered value box, optional right-aligned tag) */
function Field({ label, value, tag, full, required }: {
  label: string; value: string; tag?: string; full?: boolean; required?: boolean;
}) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <div style={fieldLabel}>
        {label} {required && <span style={{ color: AMBER, textTransform: "none" }}>(required)</span>}
      </div>
      <div style={{
        ...fieldBox,
        lineHeight: full ? 1.4 : undefined,
        ...(tag ? { display: "flex", justifyContent: "space-between", alignItems: "center" } : {}),
      }}>
        {value} {tag && <span style={fieldTag}>{tag}</span>}
      </div>
    </div>
  );
}

export default function CoverageIQHowItWorksPage() {
  const [step, setStep]         = useState(0);
  const [playing, setPlaying]   = useState(true);
  const [speed, setSpeed]       = useState<Speed>("NORMAL");
  const [view, setView]         = useState<ViewKey>("pipeline");
  const [showPeso, setShowPeso] = useState(false);

  // Auto-play loop: advance one stage per interval, wrapping 0 → 5 → 0.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 6), SPEED_MS[speed]);
    return () => clearInterval(t);
  }, [playing, speed]);

  // Selecting a speed also resumes playback (per spec).
  const pickSpeed = (sp: Speed) => { setSpeed(sp); setPlaying(true); };

  const active = STAGES[step];

  const speedBtn = (sp: Speed): CSSProperties => ({
    border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 700,
    fontSize: 10.5, letterSpacing: ".1em", padding: "8px 13px",
    background: speed === sp ? YEL : "transparent",
    color: speed === sp ? INK : PAPER,
  });

  return (
    <>
      <style>{`
        .ciq-frame ::selection { background: ${INK}; color: ${PAPER}; }
        .ciq-hov-ink { transition: opacity .12s; }
        .ciq-hov-ink:hover { opacity: .85; }
        .ciq-hov-yel { transition: background .12s; }
        .ciq-hov-yel:hover { background: ${YEL2} !important; }
        @media (max-width: 900px) {
          .ciq-act1 { grid-template-columns: 1fr !important; }
          .ciq-2col { grid-template-columns: 1fr !important; }
          .ciq-stages { grid-template-columns: repeat(3, 1fr) !important; row-gap: 22px !important; }
          .ciq-connector { display: none; }
          .ciq-detail { grid-template-columns: 1fr !important; }
          .ciq-tabs { grid-template-columns: repeat(2, 1fr) !important; }
          .ciq-cols6 { grid-template-columns: repeat(3, 1fr) !important; }
          .ciq-cols5 { grid-template-columns: repeat(2, 1fr) !important; }
          .ciq-cols4 { grid-template-columns: repeat(2, 1fr) !important; }
          .ciq-peso2 { grid-template-columns: 1fr !important; }
          .ciq-actnav { grid-template-columns: 1fr !important; }
          .ciq-actnav > div { border-right: none !important; border-bottom: 1px solid ${P25}; }
          .ciq-actnav > div:last-child { border-bottom: none; }
          .ciq-foot5 { grid-template-columns: 1fr 1fr !important; }
          .ciq-foot5 > div { border-right: none !important; border-bottom: 1px solid ${INK}; }
        }
      `}</style>

      <ToolHeader
        toolPrefix="Coverage"
        subtitle="HOW IT WORKS · PITCH TRACKING CRM"
        rightContent={
          <Link
            href="/tools/coverageiq"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}
          >
            Open CoverageIQ →
          </Link>
        }
      />

      <div className="ciq-frame" style={{ background: SURROUND }}>
        {/* ===================== ARTBOARD ===================== */}
        <div style={{ background: PAPER, maxWidth: 1180, margin: "0 auto", padding: 26, fontFamily: SERIF, color: INK }}>

          {/* ===================== HERO ===================== */}
          <div style={{ background: INK, color: PAPER, padding: "34px 40px 30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 60, lineHeight: 0.9, letterSpacing: "-.02em" }}>
                  COVERAGE<span style={{ color: YEL }}>IQ</span>
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: P72, marginTop: 12 }}>
                  Track every pitch from drafted to placed.
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 13.5, color: P55, marginTop: 8, maxWidth: 520 }}>
                  Following Fairground, a fictional B2B marketplace SaaS, one pitch from drafted to placed.
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", color: PAPER }}>
                  <span style={{ width: 10, height: 10, background: YEL, display: "inline-block" }} />
                  PITCH TRACKING CRM
                </div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", color: P55, marginTop: 16 }}>
                  6 STAGES {" "}/{" "} 3 ALERT TYPES {" "}/{" "} 5 VIEWS
                </div>
                <div style={{ marginTop: 14, display: "inline-block", border: `1px dashed ${P40}`, padding: "6px 11px", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", color: P72 }}>
                  SAMPLE SCENARIO · FAIRGROUND (ILLUSTRATIVE)
                </div>
              </div>
            </div>
            {/* act nav */}
            <div className="ciq-actnav" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${P25}`, marginTop: 26 }}>
              <div style={{ padding: "13px 18px", borderRight: `1px solid ${P25}`, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em" }}>
                <span style={{ color: YEL }}>①</span>{"  "}Pitch In
              </div>
              <div style={{ padding: "13px 18px", borderRight: `1px solid ${P25}`, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em" }}>
                <span style={{ color: YEL }}>②</span>{"  "}The Tracking Pipeline
              </div>
              <div style={{ padding: "13px 18px", fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em" }}>
                <span style={{ color: YEL }}>③</span>{"  "}Coverage Out
              </div>
            </div>
          </div>

          {/* ===================== ACT 1 — PITCH IN ===================== */}
          <div style={{ marginTop: 44 }}>
            <ActHeader pill={"①  PITCH IN"} caption="a new pitch is logged, carrying context from PressIQ." />

            <div className="ciq-act1" style={{ display: "grid", gridTemplateColumns: "1fr 1.9fr", gap: 40, marginTop: 26, alignItems: "start" }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70 }}>
                A pitch enters the tracking CRM. If it arrived via handoff, PressIQ passes its journalist query as a{" "}
                <span style={{ fontFamily: MONO, fontSize: 12.5 }}>?pitch=</span> URL parameter (truncated to 200 characters);
                CoverageIQ auto-opens this modal, pre-fills the subject, and defaults Data Source to PressIQ.
              </div>

              {/* New Pitch modal */}
              <div style={{ border: `1px solid ${INK}`, background: PAPER }}>
                <div style={{ background: INK, color: PAPER, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19 }}>New Pitch</span>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", color: P55 }}>SAMPLE · FAIRGROUND (ILLUSTRATIVE)</span>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div className="ciq-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                    <Field full required label="Pitch Subject" value="Data: 40 B2B marketplaces benchmarked, only 11 meet their own definition" />
                    <Field label="Journalist" value="Jordan Ames" />
                    <Field label="Client" value="Fairground" />
                    <Field label="PESO Type" value="Earned" />
                    <Field label="Pipeline Stage" value="Drafted" tag="DEFAULT" />
                    <Field label="Team" value="SIA" />
                    {/* Data Source — yellow-tinted, auto-filled from the PressIQ handoff */}
                    <div>
                      <div style={fieldLabel}>Data Source</div>
                      <div style={{ border: `1px solid ${YEL}`, background: "rgba(245,184,31,.18)", padding: "9px 11px", marginTop: 5, fontFamily: SERIF, fontSize: 14.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        PressIQ <span style={fieldTag}>AUTO</span>
                      </div>
                    </div>
                    <Field full label="Notes" value="Standalone pitch, scored 79/Competitive in PressIQ before sending." />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 20, paddingTop: 15, borderTop: `1px solid ${INK15}` }}>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>Pitch will be saved to your Supabase database</span>
                    <span style={{ background: INK, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".12em", padding: "11px 18px" }}>LOG PITCH →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* success + nudge */}
            <div className="ciq-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
              <div style={{ border: `1px solid ${INK}`, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 16, height: 16, background: YEL, border: `1.5px solid ${INK}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontSize: 11, fontWeight: 900 }}>✓</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19 }}>Pitch logged</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: INK70, marginTop: 10 }}>
                  {`"Data: 40 B2B marketplaces benchmarked, only 11 meet their own definition" added to pipeline as Drafted.`}
                </div>
                <span style={{ display: "inline-block", marginTop: 14, border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".14em", padding: "8px 15px" }}>DONE</span>
              </div>
              <div style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "20px 22px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>Before you send</div>
                <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: INK70, marginTop: 9 }}>
                  Score your pitch in PressIQ to check clarity, relevance, and journalist fit — before hitting send.
                </div>
                <span style={{ display: "inline-block", marginTop: 14, background: YEL, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".14em", padding: "8px 15px" }}>SCORE IN PRESSIQ →</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", color: INK35A, fontSize: 20, margin: "34px 0" }}>▼</div>

          {/* ===================== ACT 2 — THE TRACKING PIPELINE ===================== */}
          <div>
            <ActHeader pill={"②  THE TRACKING PIPELINE"} caption="a 6 stage pipeline. drive it with the player, or click any stage." />

            {/* stage row */}
            <div style={{ position: "relative", marginTop: 30 }}>
              <div className="ciq-connector" style={{ position: "absolute", top: 22, left: "9%", right: "9%", height: 1, background: INK35 }} />
              <div className="ciq-stages" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, position: "relative" }}>
                {STAGES.map((st, i) => {
                  const isActive = i === step;
                  const isPast = i < step;
                  return (
                    <button
                      key={st.n}
                      type="button"
                      onClick={() => setStep(i)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: 0, minWidth: 0 }}
                    >
                      <div
                        style={{
                          width: 44, height: 44, border: `1px solid ${INK}`,
                          background: isActive ? INK : isPast ? YEL : PAPER,
                          color: isActive ? YEL : INK,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                          // The one permitted shadow: the functional active-marker glow ring.
                          boxShadow: isActive ? "0 0 0 4px rgba(245,184,31,.35)" : undefined,
                        }}
                      >
                        {st.glyph}
                      </div>
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".1em", color: INK45 }}>{st.n}</div>
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".08em", textAlign: "center", color: isActive ? INK : INK60 }}>
                        {st.name.toUpperCase()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* player bar */}
            <div style={{ background: INK, color: PAPER, padding: "13px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
              <button
                type="button"
                className="ciq-hov-yel"
                onClick={() => setPlaying((p) => !p)}
                style={{ background: YEL, color: INK, border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", padding: "9px 15px" }}
              >
                {playing ? "❙❙ PAUSE" : "▶ PLAY"}
              </button>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", color: P55 }}>SPEED</span>
              <div style={{ display: "flex", gap: 0, border: `1px solid ${P25}` }}>
                {(["SLOW", "NORMAL", "FAST"] as Speed[]).map((sp) => (
                  <button key={sp} type="button" onClick={() => pickSpeed(sp)} style={speedBtn(sp)}>{sp}</button>
                ))}
              </div>
              <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", color: YEL }}>
                STEP {active.n} / 6 · {playing ? "PLAYING" : "PAUSED"}
              </span>
            </div>

            {/* detail panel */}
            <div className="ciq-detail" style={{ border: `1px solid ${INK}`, borderTop: "none", display: "grid", gridTemplateColumns: "120px 1fr" }}>
              <div style={{ background: INK, color: YEL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "22px 10px", gap: 10 }}>
                <div style={{ fontSize: 30, lineHeight: 1 }}>{active.glyph}</div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", color: P55 }}>STEP {active.n}</div>
              </div>
              <div style={{ padding: "22px 26px", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1 }}>{active.name}</div>
                <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: INK70, marginTop: 8, maxWidth: 640 }}>{active.short}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: INK55, marginTop: 6, maxWidth: 640 }}>
                  <span style={{ fontFamily: GROT, fontStyle: "normal", fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", color: INK45 }}>WHEN{" "}</span>
                  {active.when}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <span style={{ background: YEL, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", padding: "5px 10px" }}>{active.day}</span>
                  {active.reply && (
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70 }}>{`"${active.reply}"`}</span>
                  )}
                </div>
              </div>
            </div>

            {/* points caveat — CoverageIQ has no composite score; points only at Placed/Amplified */}
            <div style={{ border: `1px solid ${INK}`, borderTop: "none", background: PAPER2, padding: "16px 22px", display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              <span style={{ background: INK, color: YEL, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", padding: "5px 10px", flexShrink: 0 }}>POINTS</span>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.5, color: INK70, maxWidth: 820 }}>
                A <span style={{ fontFamily: MONO, fontSize: 12.5 }}>points</span> number is awarded only once a pitch reaches Placed or Amplified,
                currently driven by a Domain Rating (DR)-based mock formula, not yet finalized (per the product&rsquo;s own RFP).{" "}
                <strong style={{ color: INK }}>Points formula: DR-based, not yet finalized.</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", color: INK35A, fontSize: 20, margin: "34px 0" }}>▼</div>

          {/* ===================== ACT 3 — COVERAGE OUT ===================== */}
          <div>
            <ActHeader pill={"③  COVERAGE OUT"} caption="five reporting views, one pitch's whole journey." />

            {/* tab strip */}
            <div className="ciq-tabs" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", border: `1px solid ${INK}`, marginTop: 24 }}>
              {VIEWS.map((v) => {
                const on = v.key === view;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    style={{
                      border: "none", borderRight: `1px solid ${INK}`, cursor: "pointer",
                      padding: "12px 10px", display: "flex", flexDirection: "column",
                      alignItems: "flex-start", gap: 3, textAlign: "left",
                      background: on ? INK : PAPER, color: on ? PAPER : INK,
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6 }}>{v.num}</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em" }}>{v.label}</span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", opacity: 0.55 }}>{v.sub}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ border: `1px solid ${INK}`, borderTop: "none", padding: 26, minHeight: 340, background: PAPER }}>

              {/* VIEW 1: PITCH PIPELINE */}
              {view === "pipeline" && (
                <div>
                  <div style={viewOverline}>PITCH PIPELINE · DRAFTED → AMPLIFIED</div>
                  <div className="ciq-cols6" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                    {STAGES.map((st, i) => (
                      <div key={st.n} style={{ border: `1px solid ${INK}`, padding: 12, minHeight: 120, display: "flex", flexDirection: "column", background: i === 5 ? YEL : PAPER }}>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>{st.name}</div>
                        <div style={{ fontFamily: MONO, fontSize: 11, marginTop: "auto", paddingTop: 22, opacity: 0.6 }}>{st.day}</div>
                        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700 }}>1</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, marginTop: 16 }}>
                    {`Fairground's single pitch, currently resting at Amplified. Sample scenario (illustrative).`}
                  </div>
                </div>
              )}

              {/* VIEW 2: FOLLOW-UPS */}
              {view === "follow" && (
                <div>
                  <div style={viewOverline}>FOLLOW-UPS · ACTIONS + REMINDERS</div>
                  <div className="ciq-cols5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                    {([
                      { label: "Overdue",           sub: "Needs immediate attention",        btn: "FOLLOW UP →", yellow: false, red: true },
                      { label: "Due Today",         sub: null,                                btn: "FOLLOW UP →", yellow: false, red: false },
                      { label: "Upcoming",          sub: "Next 7 days",                       btn: "FOLLOW UP →", yellow: false, red: false },
                      { label: "Stalled pitches",   sub: "No response, no follow-up set",     btn: "RE-ENGAGE →", yellow: true,  red: false },
                      { label: "Ready to amplify",  sub: "Placed in last 14 days",            btn: "SHARE NOW →", yellow: true,  red: false },
                    ]).map((b) => (
                      <div key={b.label} style={{ border: `1px solid ${INK}`, padding: "15px 14px", minHeight: 150, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".04em", color: b.red ? RED : undefined }}>{b.label}</div>
                        {b.sub && (
                          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, marginTop: 6 }}>{b.sub}</div>
                        )}
                        <span style={{
                          marginTop: "auto", fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".1em",
                          padding: "7px 10px", textAlign: "center",
                          background: b.yellow ? YEL : INK, color: b.yellow ? INK : PAPER,
                        }}>
                          {b.btn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 3: COVERAGE LOG */}
              {view === "log" && (
                <div>
                  <div style={viewOverline}>COVERAGE LOG · PLACEMENTS + POINTS</div>
                  <div className="ciq-cols4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                    {([
                      { stat: "1",   label: "TOTAL PLACEMENTS",  illus: false },
                      { stat: "290", label: "TOTAL POINTS",      illus: true },
                      { stat: "93",  label: "AVG DOMAIN RATING", illus: true },
                      { stat: "1",   label: "DO-FOLLOW LINKS",   illus: false },
                    ]).map((s) => (
                      <div key={s.label} style={{ border: `1px solid ${INK}`, padding: 14 }}>
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1, borderBottom: `2px solid ${YEL}`, display: "inline-block", paddingBottom: 3 }}>{s.stat}</div>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", color: INK55, marginTop: 8 }}>
                          {s.label}{s.illus && <span style={{ color: INK35A }}> · ILLUS.</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ border: `1px solid ${INK}`, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SERIF, fontSize: 13.5, minWidth: 760 }}>
                      <thead>
                        <tr style={{ background: PAPER2 }}>
                          <th style={th}>DATE</th>
                          <th style={th}>PUBLICATION</th>
                          <th style={th}>ANCHOR TEXT</th>
                          <th style={th}>DR</th>
                          <th style={th}>PESO</th>
                          <th style={th}>LINK</th>
                          <th style={th}>TYPE</th>
                          <th style={th}>POINTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={td}>Day 9</td>
                          <td style={td}>
                            TechCrunch{" "}
                            <span style={{ fontFamily: GROT, fontSize: 8, letterSpacing: ".08em", color: INK40, display: "block", marginTop: 2 }}>ILLUSTRATIVE PLACEMENT</span>
                          </td>
                          <td style={{ ...td, fontStyle: "italic" }}>{`"benchmark of 40 B2B marketplace platforms"`}</td>
                          <td style={td}>93<span style={{ color: INK40 }}>*</span></td>
                          <td style={td}>Earned</td>
                          <td style={td}>Do Follow</td>
                          <td style={td}>Original</td>
                          <td style={td}>
                            <span style={{ background: YEL, padding: "2px 7px", fontFamily: GROT, fontWeight: 700, fontSize: 12 }}>290</span>
                            <span style={{ color: INK40 }}>*</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: INK55, border: `1px dashed ${INK35}`, padding: "5px 9px" }}>
                      techcrunch.com/[illustrative-slug] · ILLUSTRATIVE LINK, NOT REAL
                    </span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK50 }}>
                      * DR and Points illustrative, not live-verified. Points: DR-based mock formula, not yet finalized.
                    </span>
                  </div>
                </div>
              )}

              {/* VIEW 4: JOURNALIST CONTACTS */}
              {view === "contacts" && (
                <div>
                  <div style={viewOverline}>JOURNALIST CONTACTS · RELATIONSHIP INDEX</div>
                  <div style={{ border: `1px solid ${INK}`, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SERIF, fontSize: 13.5, minWidth: 720 }}>
                      <thead>
                        <tr style={{ background: PAPER2 }}>
                          <th style={th}>JOURNALIST / PUBLICATION</th>
                          <th style={th}>BEAT</th>
                          <th style={th}>DR</th>
                          <th style={th}>SENT</th>
                          <th style={th}>WON</th>
                          <th style={th}>RATE</th>
                          <th style={th}>LAST CONTACT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>
                            <strong style={{ fontWeight: 700 }}>Jordan Ames</strong>
                            <span style={{ display: "block", color: INK55, fontSize: 12 }}>TechCrunch</span>
                          </td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>B2B SaaS and marketplace infrastructure</td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>93<span style={{ color: INK40 }}>*</span></td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>1</td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>1</td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>
                            <span style={{ background: YEL, padding: "2px 7px", fontFamily: GROT, fontWeight: 700, fontSize: 11 }}>100%</span>
                          </td>
                          <td style={{ padding: 12, borderBottom: `1px solid ${INK15}` }}>Day 11</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK50, marginTop: 12 }}>
                    * DR illustrative, not live-verified. Single-pitch sample scenario (illustrative), not a claim about typical performance.
                  </div>
                </div>
              )}

              {/* VIEW 5: PESO DASHBOARD */}
              {view === "peso" && (
                <div>
                  <div style={viewOverline}>PESO DASHBOARD · PAID · EARNED · SHARED · OWNED</div>
                  <div className="ciq-peso2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ border: `2px solid ${INK}`, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em" }}>EARNED</span>
                        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>the core of the EMOS playbook</span>
                      </div>
                      <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, marginTop: 8 }}>
                        {PESO_DESCRIPTIONS[0].text}
                      </div>
                      <div style={{ display: "flex", gap: 18, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${INK15}`, flexWrap: "wrap" }}>
                        {([
                          { v: <>1</>, l: "PITCHES" },
                          { v: <>1</>, l: "PLACED" },
                          { v: <>290<span style={{ fontSize: 11, color: INK40 }}>*</span></>, l: "POINTS" },
                          { v: <>93<span style={{ fontSize: 11, color: INK40 }}>*</span></>, l: "AVG DR" },
                          { v: <span style={{ color: AMBER }}>100%</span>, l: "CONVERSION" },
                        ]).map((s) => (
                          <div key={s.l}>
                            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22 }}>{s.v}</div>
                            <div style={{ fontFamily: GROT, fontSize: 8.5, letterSpacing: ".1em", color: INK55 }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK50, marginTop: 10 }}>
                        * illustrative. Single-pitch sample (1 of 1), not typical performance.
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 14 }}>
                      {PESO_DESCRIPTIONS.slice(1).map((p) => (
                        <div key={p.name} style={{ border: `1px solid ${INK}`, padding: "12px 15px" }}>
                          <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em" }}>{p.name.toUpperCase()}</div>
                          <div style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.4, color: INK70, marginTop: 4 }}>{p.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* alerts feed — UI-complete but NOT live-connected: keeps its COMING SOON banner */}
                  <div style={{ border: `1px solid ${INK}`, marginTop: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: PAPER2, borderBottom: `1px solid ${INK}`, flexWrap: "wrap", gap: 10 }}>
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em" }}>ALERTS FEED</span>
                      <div style={{ display: "flex", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".08em", color: INK55, flexWrap: "wrap" }}>
                        <span style={{ background: INK, color: PAPER, padding: "3px 8px" }}>All (0)</span>
                        <span style={{ padding: "3px 8px" }}>new (0)</span>
                        <span style={{ padding: "3px 8px" }}>reviewed (0)</span>
                        <span style={{ padding: "3px 8px" }}>archived (0)</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, padding: "14px 16px", borderBottom: `1px solid ${INK15}`, flexWrap: "wrap" }}>
                      {([
                        { badge: "SYN", label: "syndication" },
                        { badge: "MEN", label: "mention" },
                        { badge: "AMP", label: "pickup" },
                      ]).map((a) => (
                        <span key={a.badge} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SERIF, fontSize: 13 }}>
                          <span style={{ background: YEL, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".08em", padding: "3px 7px" }}>{a.badge}</span>
                          {a.label}
                        </span>
                      ))}
                    </div>
                    <div style={{ background: INK, color: YEL, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ border: `1px solid ${YEL}`, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", padding: "4px 9px" }}>COMING SOON</span>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: P72 }}>
                        Will connect to Mention.com and/or Google Alerts RSS for live brand mention tracking.
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ===================== THE STAGE LEGEND ===================== */}
          <div style={{ marginTop: 44 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".16em" }}>THE STAGE LEGEND</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".14em", color: INK45 }}>DRAFTED → AMPLIFIED</div>
            </div>
            <div style={{ borderTop: `1px solid ${INK}`, marginTop: 12, marginBottom: 20 }} />
            <div className="ciq-cols6" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
              {STAGES.map((st) => (
                <div key={st.n} style={{ border: `1px solid ${INK}`, padding: 14 }}>
                  <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".04em" }}>{st.name}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.4, color: INK70, marginTop: 6 }}>{st.short}</div>
                </div>
              ))}
            </div>
            {/* Honesty note — locked. There is no score, tier, or band in CoverageIQ. */}
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: INK60, marginTop: 16, maxWidth: 900 }}>
              CoverageIQ has no composite score. This legend describes a tracking stage, not a rating.
              Points are only awarded at Placed or Amplified, and the points formula is currently DR-based
              mock data, not yet finalized. Never render a score or band that does not exist in the tool.
            </div>
          </div>

          {/* ===================== COLLAPSIBLE PESO PANEL ===================== */}
          <div style={{ marginTop: 34 }}>
            <button
              type="button"
              className="ciq-hov-ink"
              onClick={() => setShowPeso((p) => !p)}
              style={{ background: INK, color: PAPER, border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", padding: "11px 18px" }}
            >
              {showPeso ? "▾ HIDE THE PESO CATEGORIES" : "▸ SHOW THE PESO CATEGORIES"}
            </button>
            {showPeso && (
              <div className="ciq-cols4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 16 }}>
                {PESO_DESCRIPTIONS.map((p) => (
                  <div key={p.name} style={{ border: `1px solid ${INK}`, padding: 15 }}>
                    <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em" }}>{p.name}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.45, color: INK70, marginTop: 6 }}>{p.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===================== PIPELINE FOOTER (shared visual component) ===================== */}
          <div style={{ marginTop: 44 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: INK55, marginBottom: 12 }}>THE EMOS PIPELINE</div>
            <div className="ciq-foot5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", border: `1px solid ${INK}` }}>
              {["SIGNALIQ", "ASSETIQ", "JOURNOCOLLABIQ", "PRESSIQ"].map((t) => (
                <div key={t} style={{ padding: "13px 16px", borderRight: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", color: INK55 }}>
                  <span style={{ color: GREEN }}>✓</span> {t}
                </div>
              ))}
              <div style={{ padding: "13px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em" }}>COVERAGEIQ</div>
            </div>
            {/* End-state banner: CoverageIQ is the last tool in the pipeline */}
            <div style={{ background: INK, marginTop: 14, padding: "26px 30px" }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: YEL, lineHeight: 1.1 }}>
                Pipeline complete — Full EMOS
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: P72, marginTop: 8, maxWidth: 720 }}>
                {`You've worked through every stage. Keep logging and tracking to compound your results.`}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: P40, marginTop: 14 }}>
                {`Fairground's full sample journey: SignalIQ signal → AssetIQ asset → JournoCollabIQ shortlist → PressIQ score → CoverageIQ placement.`}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Site-wide pipeline footer (repo convention on tool sub-pages) */}
      <div style={{ background: PAPER, paddingTop: 1 }}>
        <ToolPipelineFooter currentTool="coverageiq" />
      </div>
    </>
  );
}

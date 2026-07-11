"use client";

/**
 * PressIQ — How It Works (visual framework)
 * /tools/pressiq/how-it-works
 *
 * React port of the "PressIQ Visual Framework" design handoff:
 * three acts (① Pitch In · ② The Scoring Engine · ③ Score Out) plus the
 * band scale, the collapsible 32-point checklist, the pipeline-position
 * strip and the next-step CTA.
 *
 * All copy and all numbers are LOCKED — transcribed verbatim from the
 * handoff's internally-consistent sample dataset (Fairground / Maya Chen
 * pitching Jordan Ames at TechCrunch). If any dimension score ever
 * changes, the composite, tier, radar and top-3 ordering must ALL be
 * recomputed together — never eyeballed.
 *
 * Bureau design rules: zero border-radius, zero box-shadow, no gradients,
 * no emoji — text glyphs only (→ ▼ ▲ ✓ ✗ ❚❚).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

/* ── Handoff-local colors (no token equivalents) ─────────────────────── */
const PAPER3 = "#faf6ec";            // card / input fill (slightly lighter than paper)
const PAPER2 = "#e8e0cc";            // secondary panels / aside boxes
const GREEN  = "#2f6b3f";            // "pass" / Filed band
const AMBER  = "#c8912a";            // "warning" / Warming band
const RED    = "#8f2d2d";            // "fail" (✗ chips)
const TRACK  = "#d8cfb8";            // mechanics / score bar backgrounds
const AMBER_INK = "#8a6414";         // amber text on paper (sample-loaded badge, standalone note)
const COLD   = "#3a3630";            // Cold band background
const P72 = "rgba(241,235,222,.72)"; // paper on dark (body)
const P75 = "rgba(241,235,222,.75)";
const P60 = "rgba(241,235,222,.6)";
const P55 = "rgba(241,235,222,.55)"; // paper on dark (muted)
const P50 = "rgba(241,235,222,.5)";

/* ── Locked dimension dataset (from the handoff logic class) ─────────── */
type Signal = { t: string; ok: boolean };
type Dim = {
  n: string;
  name: string;
  weight: string;
  score: number;
  tag: string;
  chips: string[];
  signals: Signal[];
  analysis: string;
  note?: string;
};

const DIMS: Dim[] = [
  {
    n: "01", name: "Answering the brief", weight: "24%", score: 88, tag: "Relevance: the #1 filter",
    chips: ["Answers the exact question asked"],
    signals: [{ t: "Directly relevant to the beat", ok: true }],
    analysis: "Standalone pitch, no query to answer; scored on beat relevance to Jordan Ames’ marketplace-infrastructure coverage, which it hits squarely.",
    note: "Only scored when a journalist query or beat is supplied; if absent, this weight is redistributed proportionally across the other six.",
  },
  {
    n: "02", name: "Mechanics", weight: "12%", score: 76, tag: "Mechanics (Respondable-style)",
    chips: ["Length in range", "Subject length", "Reading level", "Closing question", "Tone (not salesy)"],
    signals: [
      { t: "Length in range", ok: true },
      { t: "Subject length", ok: true },
      { t: "Reading level", ok: true },
      { t: "Closing question", ok: false },
      { t: "Tone (not salesy)", ok: true },
    ],
    analysis: "Clean length and reading level, non-salesy tone. Loses points for no closing question that invites a reply.",
  },
  {
    n: "03", name: "SIA 7-Step Checklist", weight: "24%", score: 81, tag: "SIA 7-step journo-outreach checklist",
    chips: [],
    signals: [{ t: "32-point checklist (see panel below)", ok: true }],
    analysis: "Strong across research, subject, intro and answer. Signature block is missing a headshot URL and a case-study link.",
    note: "This dimension contains its own internal 32-point checklist (see the panel below).",
  },
  {
    n: "04", name: "Newsroom-ready", weight: "12%", score: 90, tag: "Newsroom-ready: publishable material",
    chips: [
      "Original / exclusive data or research (not a Googleable third-party stat)",
      "A named, credentialed source offered for quote or interview",
      "Ready-to-use asset — chart, data viz, image, or screenshot",
      "Timely / newsworthy hook; respects any stated deadline, embargo, format or word limit",
    ],
    signals: [
      { t: "Original / exclusive data", ok: true },
      { t: "Named source offered for quote", ok: true },
      { t: "Ready-to-use breakdown offered", ok: true },
      { t: "Timely, newsworthy hook", ok: true },
    ],
    analysis: "The single strongest dimension: first-party benchmark data, two named sources offered for quote, a clear newsworthy hook.",
  },
  {
    n: "05", name: "Storytelling", weight: "11%", score: 70, tag: "Narrative transportation",
    chips: ["A real character in a scene", "Problem → insight → resolution arc"],
    signals: [
      { t: "A real character in a scene", ok: false },
      { t: "Problem → insight → resolution arc", ok: true },
    ],
    analysis: "The data carries a clean arc, but there is no named character or scene to pull the reader in.",
  },
  {
    n: "06", name: "Neuromarketing", weight: "11%", score: 65, tag: "System 1 + original data",
    chips: ["Subject passes the 2-second test", "Not just borrowed/Googleable stats"],
    signals: [
      { t: "Subject passes the 2-second test", ok: false },
      { t: "Not just borrowed/Googleable stats", ok: true },
    ],
    analysis: "The stat is genuinely original, but the subject reads like a headline, not a hook, so it fails the 2-second test.",
  },
  {
    n: "07", name: "Personal brand", weight: "6%", score: 60, tag: "E-E-A-T & the halo effect",
    chips: ["Surfaces verifiable authority in-line"],
    signals: [{ t: "Surfaces verifiable authority in-line", ok: true }],
    analysis: "CEO title, company and LinkedIn are in-line, but authority is thin beyond the role itself.",
  },
];

type Speed = "slow" | "normal" | "fast";
const SPEED_MS: Record<Speed, number> = { slow: 2600, normal: 1500, fast: 750 };

/* ── Small shared bits ───────────────────────────────────────────────── */

/** Section starter: 1px rule + 3px rule stacked with a 3px gap. */
const StartRule = () => (
  <>
    <div style={{ borderTop: `1px solid ${INK}`, marginBottom: 3 }} />
    <div style={{ borderTop: `3px solid ${INK}`, marginBottom: 20 }} />
  </>
);

/** ▼ divider between acts. */
const DownArrow = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "14px 0" }}>
    <span style={{ fontSize: 22, color: INK }}>▼</span>
  </div>
);

/** Yellow act badge. */
const ActBadge = ({ children }: { children: React.ReactNode }) => (
  <span style={{ display: "inline-block", padding: "5px 11px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".16em" }}>
    {children}
  </span>
);

/** 3-segment mechanics bar (Act ① aside). */
const MechBar = ({ label, segs }: { label: string; segs: [string, string, string] }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 5 }}>
      <span>{label}</span>
    </div>
    <div style={{ height: 7, background: TRACK, display: "flex" }}>
      {segs.map((c, i) => (
        <span key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  </div>
);

/** Off-state authority-signal button (presentational). */
const AuthOff = ({ children }: { children: React.ReactNode }) => (
  <button type="button" style={{ border: "1px solid rgba(26,20,16,.3)", background: "transparent", color: "rgba(26,20,16,.5)", padding: "8px 14px", fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".04em", cursor: "pointer" }}>
    {children}
  </button>
);

/** Checklist category card. */
const ChecklistCard = ({ name, count, desc }: { name: string; count: number; desc: string }) => (
  <div style={{ border: `1px solid ${INK}`, padding: "16px 18px", background: PAPER }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18 }}>{name}</span>
      <span style={{ fontFamily: MONO, fontSize: 12, color: YEL, background: INK, padding: "2px 7px" }}>{count}</span>
    </div>
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(26,20,16,.68)" }}>{desc}</p>
  </div>
);

/* ── Page ────────────────────────────────────────────────────────────── */

export default function PressIQHowItWorksPage() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [checklistOpen, setChecklistOpen] = useState(false);

  // Player clock: ~120ms tick accumulating elapsed time; advances when the
  // accumulator passes the speed cadence. The interval restarts (and the
  // accumulator resets) whenever play state or speed changes — matching the
  // handoff's resetClock() semantics.
  const accRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    accRef.current = 0;
    lastRef.current = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const dt = now - lastRef.current;
      lastRef.current = now;
      if (!playing) {
        accRef.current = 0;
        return;
      }
      accRef.current += dt;
      if (accRef.current >= SPEED_MS[speed]) {
        accRef.current = 0;
        setActive((a) => (a + 1) % 7);
      }
    }, 120);
    return () => clearInterval(iv);
  }, [playing, speed]);

  /** Click-to-jump: resets the accumulator, does not change play/pause. */
  const jumpTo = (i: number) => {
    accRef.current = 0;
    lastRef.current = Date.now();
    setActive(i);
  };

  const d = DIMS[active];
  const stepLabel = `STEP ${String(active + 1).padStart(2, "0")} / 7`;

  const spStyle = (sp: Speed): React.CSSProperties => ({
    background: speed === sp ? YEL : "transparent",
    color: speed === sp ? INK : P75,
    border: `1px solid ${speed === sp ? YEL : "rgba(241,235,222,.35)"}`,
    padding: "7px 13px",
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: ".1em",
    cursor: "pointer",
  });

  return (
    <>
      <ToolHeader
        toolPrefix="Press"
        subtitle="HOW IT WORKS · 7-DIMENSION SCORING ENGINE"
        rightContent={
          <Link
            href="/tools/pressiq"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}
          >
            Open PressIQ →
          </Link>
        }
      />

      <style>{`
        .piq-page ::selection { background: ${INK}; color: ${PAPER}; }
        .piq-grain::before { content:''; position:absolute; inset:0; pointer-events:none; z-index:1; opacity:.05;
          background-image:radial-gradient(rgba(26,20,16,.6) .5px,transparent .5px),radial-gradient(rgba(26,20,16,.4) .5px,transparent .5px);
          background-size:3px 3px,7px 7px; background-position:0 0,1px 1px; mix-blend-mode:multiply; }
        .piq-page button:focus-visible { outline: 2px solid ${YEL}; outline-offset: -1px; }
        .piq-inkbtn { transition: opacity .12s ease; }
        .piq-inkbtn:hover { opacity: .85; }
        .piq-cta { transition: background .12s ease; }
        .piq-cta:hover { background: #ffc83a !important; }
        @keyframes piqFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes piqBlink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .piq-reveal { animation: piqFadeUp .38s ease both; }
        .piq-blink { animation: piqBlink 1.4s ease-in-out infinite; }
        @media (max-width:1040px){ .piq-scorehead { grid-template-columns: 1fr !important; justify-items: center; } }
        @media (max-width:900px){
          .piq-a1grid, .piq-detail, .piq-bkrow { grid-template-columns: 1fr !important; }
          .piq-headlines, .piq-bands, .piq-checklist { grid-template-columns: 1fr 1fr !important; }
          .piq-tworow { grid-template-columns: 1fr !important; }
        }
        @media (max-width:560px){
          .piq-headlines, .piq-bands, .piq-checklist { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="piq-page piq-grain" style={{ position: "relative", fontFamily: SERIF, color: INK, background: PAPER, overflowX: "hidden" }}>

        {/* ===== HEADER ===== */}
        <header style={{ background: INK, color: PAPER, padding: "26px clamp(20px,4vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: "clamp(26px,3.4vw,40px)", letterSpacing: ".02em", lineHeight: 1 }}>
              PRESS<span style={{ color: YEL }}>IQ</span>
            </div>
            <div style={{ fontStyle: "italic", fontSize: "clamp(15px,1.6vw,19px)", color: P72 }}>Will a journalist paste this in?</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, textAlign: "right" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".13em" }}>
              <span style={{ width: 8, height: 8, background: INK, display: "inline-block" }} />
              SAMPLE SCENARIO · FAIRGROUND (ILLUSTRATIVE)
            </span>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".18em", color: P60 }}>7 DIMENSIONS / 32-POINT CHECKLIST / 4 TIERS</div>
          </div>
        </header>

        {/* act nav strip */}
        <div style={{ background: INK, color: P55, padding: "0 clamp(20px,4vw,56px) 22px", display: "flex", gap: 28, flexWrap: "wrap", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", borderBottom: "1px solid rgba(241,235,222,.15)" }}>
          <span>① PITCH IN</span><span>② THE SCORING ENGINE</span><span>③ SCORE OUT</span>
        </div>

        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>

          {/* ===== EXPLAINER VIDEO ===== */}
          <section style={{ padding: "48px 0 8px" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: INK55, marginBottom: 14 }}>
              WATCH · 90-SECOND WALKTHROUGH
            </div>
            <div style={{ maxWidth: 760, border: `1px solid ${INK15}`, background: "#000" }}>
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
          </section>

          {/* ===== ACT 1 ===== */}
          <section style={{ padding: "64px 0 20px" }}>
            <StartRule />
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <ActBadge>① PITCH IN</ActBadge>
              <span style={{ fontStyle: "italic", fontSize: 17, color: INK70 }}>the raw material: your pitch, the query, the platform, and your authority signals</span>
            </div>
            <p style={{ maxWidth: 760, fontSize: 16, lineHeight: 1.55, color: INK70, margin: "0 0 28px" }}>
              Score any PR pitch (standalone outreach or a query response) against a 32-point system and the EMOS framework.
            </p>

            <div className="piq-a1grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 40, alignItems: "start" }}>

              {/* form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 7 }}>
                    <label style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>Your pitch</label>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".1em", color: AMBER_INK }}>
                      <span style={{ width: 7, height: 7, background: YEL, display: "inline-block" }} />
                      SAMPLE LOADED · MAYA CHEN → JORDAN AMES
                    </span>
                  </div>
                  <div style={{ border: `1px solid ${INK}`, background: PAPER3, padding: "20px 22px" }}>
                    <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontWeight: 700, fontSize: 16, lineHeight: 1.4 }}>
                      {'Subject: Data: 40 B2B marketplaces benchmarked, only 11 meet their own definition'}
                    </p>
                    <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,20,16,.82)" }}>Hi Jordan,</p>
                    <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,20,16,.82)" }}>
                      {'I\'ve been following your coverage of marketplace infrastructure on TechCrunch. We just wrapped a benchmark of 40 platforms that call themselves a "B2B marketplace," scored against a simple 3-part definition (multi-vendor listings, split payments, independent vendor onboarding). Only 11 actually qualify.'}
                    </p>
                    <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,20,16,.82)" }}>
                      {'I\'m Maya Chen, co-founder and CEO of Fairground. We build the marketplace infrastructure some of these 40 platforms run on, so we had the data already, we just hadn\'t scored it until now.'}
                    </p>
                    <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,20,16,.82)" }}>
                      Happy to share the full breakdown, or put you in touch with two of the 11 that qualify for a quote.
                    </p>
                    <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,20,16,.82)" }}>
                      Maya Chen · Co-founder &amp; CEO, Fairground<br />
                      maya@fairground.example.com · @mayachen · linkedin.com/in/mayachen · fairground.example.com
                    </p>
                  </div>
                  <div style={{ marginTop: 8, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                    {'Standalone outreach, not a query response. This is the "standalone" pitch-mode path.'}
                  </div>
                </div>

                <div className="piq-tworow" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 7 }}>
                      {'The journalist\'s query'}
                    </label>
                    <div style={{ border: "1px dashed rgba(26,20,16,.4)", background: "transparent", padding: "12px 14px", minHeight: 48, display: "flex", alignItems: "center", fontStyle: "italic", fontSize: 14, color: INK55 }}>
                      Left blank — standalone pitch, no query to answer
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 7 }}>Platform</label>
                    <div style={{ border: "1px dashed rgba(26,20,16,.4)", background: "transparent", padding: "12px 14px", minHeight: 48, display: "flex", alignItems: "center", fontStyle: "italic", fontSize: 14, color: INK55 }}>
                      — · no query platform applies
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 9 }}>
                    <label style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>Your authority signals</label>
                    <span style={{ fontStyle: "italic", fontSize: 13, color: INK55 }}>two toggled on for this pitch</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <AuthOff>Personal website</AuthOff>
                    <button type="button" style={{ border: `1px solid ${INK}`, background: YEL, color: INK, padding: "8px 14px", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".04em", cursor: "pointer" }}>✓ Published bylines</button>
                    <AuthOff>YouTube / video</AuthOff>
                    <AuthOff>Speaking history</AuthOff>
                    <AuthOff>Case studies</AuthOff>
                    <button type="button" style={{ border: `1px solid ${INK}`, background: YEL, color: INK, padding: "8px 14px", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".04em", cursor: "pointer" }}>✓ Active LinkedIn</button>
                  </div>
                </div>

                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.45, color: INK70, cursor: "pointer" }}>
                  <span style={{ width: 16, height: 16, border: `1.5px solid ${INK}`, flex: "0 0 auto", marginTop: 2, background: YEL }} />
                  <span>Let SIA store this pitch (anonymised) to improve the tool. Uncheck to score without storing.</span>
                </label>

                <div>
                  <button type="button" className="piq-inkbtn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INK, color: PAPER, border: "none", padding: "14px 26px", fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer" }}>
                    Analyze pitch →
                  </button>
                  <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: INK55 }}>
                    <div>3 free scores / month · 10 with your email</div>
                    <div style={{ fontStyle: "italic" }}>scored against published journalist research</div>
                  </div>
                </div>
              </div>

              {/* live mechanics rail */}
              <aside style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "22px 20px", alignSelf: "stretch" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", paddingBottom: 10, borderBottom: `1px solid ${INK}`, marginBottom: 14 }}>Live mechanics</div>
                <p style={{ fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "rgba(26,20,16,.6)", margin: "0 0 18px" }}>Start typing — these update instantly, before you spend a score.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <MechBar label="Word count" segs={[GREEN, "transparent", "transparent"]} />
                  <MechBar label="Subject length" segs={[AMBER, AMBER, "transparent"]} />
                  <MechBar label="Reading level" segs={[GREEN, GREEN, "transparent"]} />
                  <MechBar label="Closing question" segs={[RED, "transparent", "transparent"]} />
                  <MechBar label="Tone / subjectivity" segs={[GREEN, "transparent", "transparent"]} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 20, paddingTop: 12, borderTop: `1px solid ${INK}` }}>
                  <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>Mechanics score</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26 }}>76</span>
                </div>
              </aside>
            </div>
          </section>

          <DownArrow />

          {/* ===== ACT 2 ===== */}
          <section style={{ padding: "20px 0" }}>
            <StartRule />
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
              <ActBadge>② THE SCORING ENGINE</ActBadge>
              <span style={{ fontStyle: "italic", fontSize: 17, color: INK70 }}>
                {'the marker moves dimension to dimension, now showing this pitch\'s per-dimension scores. drive it with the player, or click any card'}
              </span>
            </div>

            {/* pipeline cards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {DIMS.map((c, i) => {
                const on = i === active;
                return (
                  <div
                    key={c.n}
                    onClick={() => jumpTo(i)}
                    style={{
                      flex: "1 1 150px", minWidth: 140, border: `1px solid ${INK}`,
                      padding: "13px 13px 6px", cursor: "pointer", display: "flex",
                      flexDirection: "column", gap: 10,
                      background: on ? INK : PAPER3,
                      color: on ? PAPER : INK,
                      transition: "background .12s ease, color .12s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: on ? YEL : "rgba(26,20,16,.5)" }}>{c.n}</span>
                      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: on ? YEL : INK }}>{c.weight}</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, lineHeight: 1.1, letterSpacing: "-.01em", minHeight: 36 }}>{c.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1, color: on ? YEL : INK }}>{c.score}</span>
                      <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".1em", color: on ? P50 : "rgba(26,20,16,.45)" }}>/ 100</span>
                    </div>
                    <div style={{ textAlign: "center", color: YEL, fontSize: 14, height: 16, opacity: on ? 1 : 0, transition: "opacity .12s ease" }}>▲</div>
                  </div>
                );
              })}
            </div>

            {/* player */}
            <div style={{ background: INK, color: PAPER, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "12px 16px", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                style={{ background: YEL, color: INK, border: "none", padding: "9px 16px", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", minWidth: 96 }}
              >
                {playing ? "❚❚ PAUSE" : "▶ PLAY"}
              </button>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", color: P50 }}>SPEED</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setSpeed("slow")} style={spStyle("slow")}>SLOW</button>
                <button type="button" onClick={() => setSpeed("normal")} style={spStyle("normal")}>NORMAL</button>
                <button type="button" onClick={() => setSpeed("fast")} style={spStyle("fast")}>FAST</button>
              </div>
              <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".14em", color: YEL }}>
                {stepLabel} · {playing ? "PLAYING" : "PAUSED"}
              </span>
            </div>

            {/* detail panel */}
            <div className="piq-detail" style={{ border: `1px solid ${INK}`, display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 180 }}>
              <div style={{ background: INK, color: PAPER, padding: "24px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20 }}>
                <span className={playing ? "piq-blink" : undefined} style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".16em", color: P55 }}>{stepLabel}</span>
                <div key={d.n} className="piq-reveal" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", color: P55, textTransform: "uppercase", marginBottom: 4 }}>Weight</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 0.9, color: PAPER }}>{d.weight}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", color: P55, textTransform: "uppercase", marginBottom: 4 }}>Score</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 0.9, color: YEL }}>{d.score}</div>
                  </div>
                </div>
              </div>
              <div key={d.n} className="piq-reveal" style={{ padding: "26px 30px", background: PAPER3, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1, margin: 0, letterSpacing: "-.01em" }}>{d.name}</h3>
                  <span style={{ display: "inline-block", padding: "5px 10px", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, letterSpacing: ".04em" }}>{d.tag}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {d.chips.map((chip) => (
                    <span key={chip} style={{ border: `1px solid ${INK}`, background: "transparent", padding: "6px 11px", fontFamily: GROT, fontWeight: 600, fontSize: 12, letterSpacing: ".02em", lineHeight: 1.3, maxWidth: 520 }}>
                      {chip}
                    </span>
                  ))}
                </div>
                {d.note && (
                  <p style={{ margin: "4px 0 0", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: "rgba(26,20,16,.62)", maxWidth: 640 }}>{d.note}</p>
                )}
              </div>
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 14, color: INK55 }}>Weights sum to exactly 1.00 (100%).</p>
          </section>

          <DownArrow />

          {/* ===== ACT 3 ===== */}
          <section style={{ padding: "20px 0" }}>
            <StartRule />
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <ActBadge>③ SCORE OUT</ActBadge>
              <span style={{ fontStyle: "italic", fontSize: 17, color: INK70 }}>
                {'the fully worked sample score for Maya Chen\'s pitch, every number computed from the locked formula'}
              </span>
            </div>
            <p style={{ maxWidth: 820, fontSize: 15, lineHeight: 1.5, color: INK55, margin: "0 0 26px" }}>
              Composite, tier, radar and top-3 fixes below are all derived from the 7 per-dimension scores in Act ② using the real weights and formulas. The arithmetic is shown so nothing here is an unverified guess.
            </p>

            {/* score header: gauge + radar */}
            <div className="piq-scorehead" style={{ border: `1px solid ${INK}`, background: PAPER3, padding: 30, display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <svg viewBox="0 0 200 200" width={180} height={180}>
                  <circle cx="100" cy="100" r="86" fill="none" stroke={INK15} strokeWidth="14" />
                  <circle cx="100" cy="100" r="86" fill="none" stroke={YEL} strokeWidth="14" strokeDasharray="427 114" strokeLinecap="butt" transform="rotate(-90 100 100)" />
                  <text x="100" y="108" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="58" fill={INK}>79</text>
                  <text x="100" y="132" textAnchor="middle" fontFamily={GROT} fontWeight="700" fontSize="14" letterSpacing="2" fill="rgba(26,20,16,.5)">/ 100</text>
                </svg>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  <span style={{ width: 8, height: 8, background: INK, display: "inline-block" }} />
                  Live · Competitive
                </span>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontStyle: "italic", fontSize: 19, textAlign: "center" }}>Competitive: tighten it.</div>
              </div>
              <div style={{ flex: "1 1 380px", minWidth: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ alignSelf: "flex-start", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>
                  Dimension radar · 7 spokes · this pitch
                </div>
                <svg viewBox="0 0 300 292" width={300} height={284} style={{ maxWidth: "100%" }}>
                  <polygon points="150,58 210.5,87 225.4,152.5 183.5,205.2 116.5,205.2 74.6,152.5 89.5,87" fill="rgba(245,184,31,.06)" stroke="rgba(26,20,16,.28)" strokeWidth="1" />
                  <polygon points="150,93 180.2,107.5 187.7,140.2 166.7,166.6 133.3,166.6 112.3,140.2 119.8,107.5" fill="none" stroke={INK15} strokeWidth="1" />
                  <g stroke="rgba(26,20,16,.2)" strokeWidth="1">
                    <line x1="150" y1="128" x2="150" y2="58" />
                    <line x1="150" y1="128" x2="210.5" y2="87" />
                    <line x1="150" y1="128" x2="225.4" y2="152.5" />
                    <line x1="150" y1="128" x2="183.5" y2="205.2" />
                    <line x1="150" y1="128" x2="116.5" y2="205.2" />
                    <line x1="150" y1="128" x2="74.6" y2="152.5" />
                    <line x1="150" y1="128" x2="89.5" y2="87" />
                  </g>
                  <polygon points="150,66.4 195.98,96.84 211.07,147.85 173.45,182.04 128.22,178.18 104.76,142.7 95.55,91.1" fill="rgba(245,184,31,.42)" stroke={INK} strokeWidth="1.75" strokeLinejoin="round" />
                  <g fill={INK}>
                    <circle cx="150" cy="66.4" r="2.6" />
                    <circle cx="195.98" cy="96.84" r="2.6" />
                    <circle cx="211.07" cy="147.85" r="2.6" />
                    <circle cx="173.45" cy="182.04" r="2.6" />
                    <circle cx="128.22" cy="178.18" r="2.6" />
                    <circle cx="104.76" cy="142.7" r="2.6" />
                    <circle cx="95.55" cy="91.1" r="2.6" />
                  </g>
                  <g fontFamily={MONO} fontWeight="700" fontSize="11" fill={INK}>
                    <text x="150" y="30" textAnchor="middle">88</text>
                    <text x="296" y="66" textAnchor="end">76</text>
                    <text x="296" y="140" textAnchor="end">81</text>
                    <text x="190" y="243" textAnchor="middle">70</text>
                    <text x="110" y="243" textAnchor="middle">65</text>
                    <text x="4" y="140" textAnchor="start">60</text>
                    <text x="4" y="66" textAnchor="start">90</text>
                  </g>
                  <g fontFamily={GROT} fontWeight="700" fontSize="10.5" fill="rgba(26,20,16,.6)">
                    <text x="150" y="44" textAnchor="middle">RELEVANCE</text>
                    <text x="296" y="82" textAnchor="end">MECHANICS</text>
                    <text x="296" y="156" textAnchor="end">SIA 7-STEP</text>
                    <text x="188" y="227" textAnchor="middle">STORY</text>
                    <text x="112" y="227" textAnchor="middle">NEURO</text>
                    <text x="4" y="156" textAnchor="start">PERSONAL</text>
                    <text x="4" y="82" textAnchor="start">NEWSROOM</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* composite, worked */}
            <div style={{ border: `1px solid ${INK}`, background: PAPER3, marginBottom: 26 }}>
              <div style={{ background: INK, color: PAPER, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 13 }}>composite · weighted average of the 7 dimension scores</span>
                <code style={{ fontFamily: MONO, fontSize: 12, background: "rgba(241,235,222,.14)", padding: "3px 8px", color: YEL }}>composite = Σ (weight × score)</code>
              </div>
              <div className="piq-detail" style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "center" }}>
                <pre style={{ margin: 0, fontFamily: MONO, fontSize: 13.5, lineHeight: 1.55, color: "rgba(26,20,16,.82)", overflowX: "auto" }}>{`0.24 × 88 = 21.12
0.12 × 76 =  9.12
0.24 × 81 = 19.44
0.12 × 90 = 10.80
0.11 × 70 =  7.70
0.11 × 65 =  7.15
0.06 × 60 =  3.60
─────────────────
Total     = 78.93  →  79 / 100`}</pre>
                <div style={{ textAlign: "center", padding: "0 10px" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 72, lineHeight: 0.9 }}>79</div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".14em", color: INK55, marginTop: 4 }}>/ 100 · COMPETITIVE</div>
                </div>
              </div>
            </div>

            {/* score-dependent headline set */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>
                Score-dependent headline · one is chosen by band, never blended · 79 lands in 65–84
              </div>
              <div className="piq-headlines" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                <div style={{ border: "1px solid rgba(26,20,16,.3)", padding: 16, background: PAPER3, opacity: 0.5 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: INK55, marginBottom: 8 }}>85–100</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>Placement-grade.</div>
                </div>
                <div style={{ border: `1px solid ${INK}`, padding: 16, background: YEL }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: INK }}>65–84</span>
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".1em", background: INK, color: YEL, padding: "2px 6px" }}>← THIS PITCH</span>
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>Competitive: tighten it.</div>
                </div>
                <div style={{ border: "1px solid rgba(26,20,16,.3)", padding: 16, background: PAPER3, opacity: 0.5 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: INK55, marginBottom: 8 }}>40–64</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>Real material, missing the system.</div>
                </div>
                <div style={{ border: "1px solid rgba(26,20,16,.3)", padding: 16, background: PAPER3, opacity: 0.5 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: INK55, marginBottom: 8 }}>0–39</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>This will get ignored.</div>
                </div>
              </div>
            </div>

            {/* standalone-mode note */}
            <div style={{ border: `1px solid ${INK}`, borderLeft: `5px solid ${YEL}`, background: PAPER2, padding: "18px 20px", marginBottom: 26 }}>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: AMBER_INK, marginBottom: 8 }}>
                Standalone pitch · no query supplied
              </div>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5, color: "rgba(26,20,16,.78)" }}>
                {'This is standalone outreach, not a query response, so Relevance was scored on fit to Jordan Ames\' marketplace-infrastructure beat (88) rather than against a specific query. All seven dimensions were assessed.'}
              </p>
            </div>

            {/* strongest line + top 3 fixes */}
            <div className="piq-tworow" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, marginBottom: 26 }}>
              <div style={{ border: `1px solid ${INK}`, background: PAPER3, padding: 22 }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Your strongest line</div>
                <div style={{ borderLeft: `3px solid ${YEL}`, paddingLeft: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.4, color: "rgba(26,20,16,.82)" }}>
                  Only 11 of the 40 platforms we checked meet their own definition of a marketplace.
                </div>
                <div style={{ marginTop: 12, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", color: "rgba(26,20,16,.5)" }}>Quoted verbatim from the pitch</div>
              </div>
              <div style={{ border: `1px solid ${INK}`, background: PAPER3, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>The 3 fixes that move your score most</div>
                  <code style={{ fontFamily: MONO, fontSize: 12, background: PAPER2, padding: "3px 8px", color: INK }}>impact = (100 − score) × weight</code>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { rank: "1", name: "SIA 7-Step Checklist", math: "(100 − 81) × 0.24 = 4.56", fix: "Signature block is missing a headshot URL and a case-study link; add both to close out the checklist." },
                    { rank: "2", name: "Neuromarketing", math: "(100 − 65) × 0.11 = 3.85", fix: 'Subject line reads like a headline, not a hook; lead with the "11 of 40" tension instead of the topic.' },
                    { rank: "3", name: "Storytelling", math: "(100 − 70) × 0.11 = 3.30", fix: "No named character or scene; open with a specific distributor's onboarding problem before the data." },
                  ].map((f) => (
                    <div key={f.rank} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderTop: `1px solid ${INK15}` }}>
                      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: YEL, width: 20, flex: "0 0 auto" }}>{f.rank}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13.5, letterSpacing: ".02em" }}>{f.name}</span>
                          <code style={{ fontFamily: MONO, fontSize: 11.5, color: "rgba(26,20,16,.6)" }}>{f.math}</code>
                        </div>
                        <p style={{ margin: "5px 0 0", fontSize: 14, lineHeight: 1.5, color: "rgba(26,20,16,.72)" }}>{f.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <details style={{ marginTop: 14, borderTop: `1px solid ${INK15}`, paddingTop: 12 }}>
                  <summary style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", color: INK55, cursor: "pointer" }}>Show all 7 impact scores</summary>
                  <pre style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.5, color: "rgba(26,20,16,.75)", overflowX: "auto" }}>{`Relevance:      (100 − 88) × 0.24 = 2.88
Mechanics:      (100 − 76) × 0.12 = 2.88
Checklist:      (100 − 81) × 0.24 = 4.56   ← #1
Neuromarketing: (100 − 65) × 0.11 = 3.85   ← #2
Storytelling:   (100 − 70) × 0.11 = 3.30   ← #3
PersonalBrand:  (100 − 60) × 0.06 = 2.40
Newsroom-ready: (100 − 90) × 0.12 = 1.20`}</pre>
                </details>
              </div>
            </div>

            {/* full breakdown */}
            <div style={{ border: `1px solid ${INK}`, background: PAPER3 }}>
              <div style={{ background: INK, color: PAPER, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 13 }}>full-breakdown · 7 dimensions</span>
                <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", color: P55 }}>SCORE BAR · ANALYSIS · SIGNALS · EVIDENCE</span>
              </div>
              {DIMS.map((b) => (
                <div key={b.n} className="piq-bkrow" style={{ padding: "18px 20px", borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "220px 1fr", gap: 22, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18 }}>{b.name}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: INK55 }}>{b.weight}</span>
                    </div>
                    <div style={{ height: 8, background: TRACK }}>
                      <span style={{ display: "block", height: 8, width: `${b.score}%`, background: YEL }} />
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,20,16,.6)", marginTop: 6 }}>{b.score} / 100</div>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 12px", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: INK70, maxWidth: 640 }}>{b.analysis}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                      {b.signals.map((s) => (
                        <span
                          key={s.t}
                          style={{
                            border: `1px solid ${s.ok ? INK : "rgba(143,45,45,.7)"}`,
                            padding: "5px 10px", fontFamily: GROT, fontWeight: 600,
                            fontSize: 11.5, color: s.ok ? "rgba(26,20,16,.78)" : RED,
                            display: "inline-flex", gap: 6, alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 800, color: s.ok ? GREEN : RED }}>{s.ok ? "✓" : "✗"}</span>
                          {s.t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".04em", borderBottom: `2px solid ${YEL}`, paddingBottom: 2 }}>
                      + Why this matters &amp; the evidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== BAND SCALE ===== */}
          <section style={{ padding: "26px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>The band scale</span>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,20,16,.4)" }}>Filed → Cold</span>
            </div>
            <div className="piq-bands" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}` }}>
              <div style={{ borderRight: `1px solid ${INK}`, background: GREEN, color: PAPER, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 150 }}>
                <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "4px 10px", background: PAPER, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>Filed</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.05 }}>Placement-grade</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, opacity: 0.75, marginTop: 6 }}>85 to 100</div>
                </div>
              </div>
              <div style={{ borderRight: `1px solid ${INK}`, background: YEL, color: INK, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 150 }}>
                <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "4px 10px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>Live</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.05 }}>Competitive</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, opacity: 0.7, marginTop: 6 }}>65 to 84</div>
                </div>
              </div>
              <div style={{ borderRight: `1px solid ${INK}`, background: PAPER2, color: INK, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 150 }}>
                <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "4px 10px", background: AMBER, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>Warming</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.05 }}>Needs work</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, opacity: 0.6, marginTop: 6 }}>40 to 64</div>
                </div>
              </div>
              <div style={{ background: COLD, color: PAPER, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 150 }}>
                <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "4px 10px", background: PAPER, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>Cold</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.05 }}>Will be ignored</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, opacity: 0.6, marginTop: 6 }}>0 to 39</div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 32-POINT CHECKLIST (collapsible) ===== */}
          <section style={{ padding: "20px 0 40px" }}>
            <button
              type="button"
              onClick={() => setChecklistOpen((o) => !o)}
              style={{ width: "100%", textAlign: "left", background: INK, color: PAPER, border: "none", padding: "16px 20px", fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".12em", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{checklistOpen ? "▾ HIDE THE 32-POINT CHECKLIST" : "▸ SHOW THE 32-POINT CHECKLIST"}</span>
              <span style={{ color: YEL }}>32</span>
            </button>
            {checklistOpen && (
              <div className="piq-checklist" style={{ border: `1px solid ${INK}`, borderTop: "none", padding: "24px 20px", background: PAPER3, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                <ChecklistCard name="Research" count={3} desc="references the journalist's prior work or beat, shows style awareness, ties to what they cover." />
                <ChecklistCard name="Subject Line" count={5} desc="anchored to the query title, a substantive modifier, non-generic, scannable in about 2 seconds, tone fits the platform." />
                <ChecklistCard name="Intro + Bio" count={3} desc="first-name greeting, a 2 to 3 sentence bio, topic-tied credibility." />
                <ChecklistCard name="Answering the Query" count={7} desc="answers the exact question(s), a 70 to 250 word substantive answer, one sourced statistic, a screenshot/GIF/artifact, skimmable, a first-hand example, points to a tool, app, or book." />
                <ChecklistCard name="The Ending" count={2} desc="ends on one question (not a sign-off), offers to send more." />
                <ChecklistCard name="Signature" count={8} desc="full name, title, company, company URL, email, X/Twitter, LinkedIn, headshot URL." />
                <ChecklistCard name="More Hacks" count={4} desc="branded short URL, tight with no filler, proofed, read-receipt enabled." />
                <div style={{ border: "1px dashed rgba(26,20,16,.35)", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(26,20,16,.5)" }}>3 + 5 + 3 + 7 + 2 + 8 + 4 = 32 points</span>
                </div>
              </div>
            )}
          </section>

          {/* ===== PIPELINE FOOTER ===== */}
          <section style={{ padding: "20px 0 60px" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>Pipeline position</div>
            <div style={{ border: `1px solid ${INK}`, display: "flex", flexWrap: "wrap", marginBottom: 22 }}>
              <div style={{ flex: "1 1 auto", borderRight: `1px solid ${INK}`, padding: "14px 18px", background: PAPER3, display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", color: "rgba(26,20,16,.6)" }}>
                <span style={{ color: GREEN }}>✓</span>SIGNALIQ
              </div>
              <Link href="/tools/assetiq" style={{ flex: "1 1 auto", borderRight: `1px solid ${INK}`, padding: "14px 18px", background: PAPER3, display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", color: "rgba(26,20,16,.6)", textDecoration: "none" }}>
                <span style={{ color: GREEN }}>✓</span>ASSETIQ
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 7, letterSpacing: ".14em", color: "rgba(26,20,16,.35)" }}>PLATFORM</span>
              </Link>
              <div style={{ flex: "1 1 auto", borderRight: `1px solid ${INK}`, padding: "14px 18px", background: PAPER3, display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", color: "rgba(26,20,16,.6)" }}>
                <span style={{ color: GREEN }}>✓</span>JOURNOCOLLABIQ
              </div>
              <div style={{ flex: "1 1 auto", borderRight: `1px solid ${INK}`, padding: "14px 18px", background: INK, display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", color: YEL }}>
                <span style={{ width: 7, height: 7, background: YEL, display: "inline-block" }} />PRESSIQ
              </div>
              <div style={{ flex: "1 1 auto", padding: "14px 18px", background: PAPER3, display: "flex", alignItems: "center", gap: 8, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", color: "rgba(26,20,16,.45)" }}>
                COVERAGEIQ
              </div>
            </div>

            <div style={{ background: INK, color: PAPER, padding: "30px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 380px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: P50, marginBottom: 10 }}>Next step in the pipeline</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.05, marginBottom: 8 }}>CoverageIQ — Pitch Tracking</div>
                <p style={{ margin: 0, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: P72, maxWidth: 520 }}>Track your full pitch pipeline from drafted to amplified.</p>
              </div>
              <Link
                href="/tools/coverageiq"
                className="piq-cta"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: YEL, color: INK, textDecoration: "none", padding: "14px 26px", fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" }}
              >
                Go to CoverageIQ →
              </Link>
            </div>
          </section>

          {/* repo-standard pipeline footer */}
          <div style={{ margin: "0 calc(-1 * clamp(20px,4vw,56px))" }}>
            <ToolPipelineFooter currentTool="pressiq" />
          </div>

        </div>

        {/* ===== FOOTER ===== */}
        <footer style={{ background: INK, color: P55, padding: "22px clamp(20px,4vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".06em", color: PAPER }}>
            PRESS<span style={{ color: YEL }}>IQ</span>
          </span>
          <span style={{ fontStyle: "italic", fontSize: 14 }}>Will a journalist paste this in?</span>
        </footer>
      </div>
    </>
  );
}

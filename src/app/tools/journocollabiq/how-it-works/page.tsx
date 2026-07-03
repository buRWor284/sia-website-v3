"use client";

/**
 * JournoCollabIQ — How It Works (framework visual)
 * /tools/journocollabiq/how-it-works
 *
 * React port of the "JournoCollabIQ Framework v2" design handoff:
 * a three-act framework visual (input → animated matching engine → output)
 * with a travelling marker across the 8 fit criteria, a player bar
 * (Play/Pause + Slow/Normal/Fast), per-criterion detail panel, and a
 * pipeline handoff strip. All copy is locked per the handoff.
 *
 * Style law: zero border-radius, no box-shadows, no gradients, no emoji
 * (Unicode glyphs only). Sample scenario: Fairground (illustrative);
 * Jordan Ames / Priya Osei / Sam Whitfield are fictional journalists.
 */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";
import { DoubleRule, Pill } from "@/components/bureau/primitives";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

/* ---------- handoff-specific colors (not in the shared token set) ------- */
const GREEN   = "#3f6b45";              // tier-A green
const FIELD   = "#faf7ef";              // faux form-field fill
const YEL_DIM = "#c99a12";              // footer wordmark "IQ" on paper
/* on-dark paper transparencies */
const P72 = "rgba(250,250,250,.72)";
const P60 = "rgba(250,250,250,.6)";
const P55 = "rgba(250,250,250,.55)";
const P45 = "rgba(250,250,250,.45)";
const P40 = "rgba(250,250,250,.4)";
const P35 = "rgba(250,250,250,.35)";
const P25 = "rgba(250,250,250,.25)";
const P18 = "rgba(250,250,250,.18)";

/* ---------- player timing ----------------------------------------------- */
const SPEEDS = { slow: 3500, normal: 2200, fast: 1100 } as const;
type Speed = keyof typeof SPEEDS;

/* ---------- locked content ----------------------------------------------- */
interface Criterion {
  num: string;
  icon: string;
  question: string;
  test: string;
  tag: string;
  example?: string;
}

const CRITERIA: Criterion[] = [
  { num: "01", icon: "◎", question: "Do they cover this beat?", test: "Is this squarely in the topics they write about?", tag: "Beat match", example: "Yes, TechCrunch covers B2B SaaS and marketplace infrastructure regularly." },
  { num: "02", icon: "◆", question: "Have they written about it recently?", test: "A relevant article in the last few months.", tag: "Recent relevant coverage" },
  { num: "03", icon: "◇", question: "Does the outlet have real authority?", test: "Reach and domain strength (check the outlet).", tag: "Publication authority" },
  { num: "04", icon: "◉", question: "Is your angle genuinely newsworthy to them?", test: "A story their readers need, not an ad.", tag: "Audience fit" },
  { num: "05", icon: "◐", question: "Can you offer something specific?", test: "Expert take, exclusive data, or a timely hook.", tag: "Exclusivity fit" },
  { num: "06", icon: "▲", question: "Are they open to pitches?", test: "Some reporters say how to pitch them.", tag: "Responsiveness" },
  { num: "07", icon: "★", question: "Can you find a public contact?", test: "X handle or section desk, not a guessed email.", tag: "Contact findability" },
  { num: "08", icon: "✦", question: "Is the outlet brand-safe for you?", test: "You'll be associated with it.", tag: "Brand-safety fit" },
];

const INDUSTRIES = [
  "Automotive", "Home & Real Estate", "Finance & Insurance", "Health & Wellness",
  "Travel & Hospitality", "Fashion & Apparel", "Food & Beverage", "SaaS / Software",
  "E-commerce / Retail", "Legal Services", "Education / EdTech", "Pet Care",
  "Wedding & Events", "Fitness & Sports", "Marketing / Agency",
];
const INDUSTRY_SELECTED = "SaaS / Software";

const AUDIENCE_TYPES = ["B2C Consumers", "B2B Small Businesses", "B2B Mid-Market", "Enterprise", "Both B2B and B2C"];
const AUDIENCE_SELECTED = "B2B Mid-Market";

const GEOGRAPHIES = ["Global", "United Kingdom", "United States", "North America", "Europe", "Australia-NZ", "Asia-Pacific"];
const GEO_SELECTED = "North America";

const CONTACT_DISCLAIMER =
  "Contact data is AI-suggested from training knowledge. Not verified in real time. Names and LinkedIn URLs may be outdated or inaccurate. Always verify before outreach.";

interface Journalist {
  name: string;
  outlet: string;
  tier: "A" | "B" | "C";
  why: string;
  coverage: string;
  authority: string;
}

const JOURNALISTS: Journalist[] = [
  {
    name: "Jordan Ames", outlet: "TechCrunch", tier: "A",
    why: "Regularly covers B2B SaaS and marketplace infrastructure funding and product news; a strong fit for exclusive benchmark data in this space.",
    coverage: "Beat includes enterprise SaaS and marketplace platforms.",
    authority: "Tier 1 outlet, very high reach (illustrative).",
  },
  {
    name: "Priya Osei", outlet: "Modern Retail", tier: "B",
    why: "Covers marketplace and multi-vendor commerce models from the retail and distribution angle; operator-focused rather than funding-focused.",
    coverage: "Beat includes B2B and B2C marketplace models, retail technology.",
    authority: "Industry trade outlet, high relevance, moderate reach (illustrative).",
  },
  {
    name: "Sam Whitfield", outlet: "Digital Commerce 360", tier: "C",
    why: "Niche ecommerce and marketplace trade press; smaller reach but a highly targeted readership of marketplace operators and vendors.",
    coverage: "Beat includes ecommerce platforms and marketplace technology.",
    authority: "Trade newsletter, niche reach, high relevance (illustrative).",
  },
];

const BRIEF_SECTIONS = [
  { header: "## Targeting Overview", body: "Fairground's benchmark report on B2B marketplace positioning, targeted at SaaS and commerce trade press." },
  { header: "## The Tiered Media List", body: "Tier A, Jordan Ames, TechCrunch. Tier B, Priya Osei, Modern Retail. Tier C, Sam Whitfield, Digital Commerce 360." },
  { header: "## Outreach Sequence", body: "Tier 1 exclusive to Jordan Ames with a 48-hour window, then simultaneous outreach to Priya Osei and Sam Whitfield." },
  { header: "## Per-Journalist Angles", body: "The tailored angle above for Jordan Ames; a retail/operator-framed variant for Priya Osei; a platform-technology-framed variant for Sam Whitfield." },
  { header: "## Verify Before You Send", body: "Confirm each contact's current outlet and beat before sending; this shortlist is AI-suggested, not real-time verified." },
];

/* ---------- shared style helpers ----------------------------------------- */
const capsLbl = (size: number, ls: string, extra?: CSSProperties): CSSProperties => ({
  fontFamily: GROT,
  fontWeight: 700,
  fontSize: size,
  letterSpacing: ls,
  textTransform: "uppercase",
  color: INK55,
  ...extra,
});

/* ---------- small presentational pieces ----------------------------------- */
function Chip({ label, selected = false, dashed = false, strong = false, small = false }: {
  label: string;
  selected?: boolean;
  dashed?: boolean;
  strong?: boolean;
  small?: boolean;
}) {
  return (
    <span
      style={{
        border: dashed
          ? "1px dashed rgba(26,20,16,.45)"
          : `1px solid ${selected || strong ? INK : INK35}`,
        background: selected ? YEL : "transparent",
        padding: small ? "6px 10px" : "7px 11px",
        fontFamily: GROT,
        fontWeight: selected ? 700 : 600,
        fontSize: small ? 11.5 : 12,
        color: dashed ? INK55 : INK,
        cursor: "default",
      }}
    >
      {label}
    </span>
  );
}

function TierBadge({ tier }: { tier: "A" | "B" | "C" }) {
  const bg = tier === "A" ? GREEN : tier === "B" ? YEL : PAPER2;
  const color = tier === "A" ? PAPER : INK;
  return (
    <span style={{ border: `1px solid ${INK}`, background: bg, color, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", padding: "4px 9px", whiteSpace: "nowrap" }}>
      Tier {tier}
    </span>
  );
}

function JournalistCard({ j }: { j: Journalist }) {
  return (
    <div style={{ border: `1px solid ${INK}`, background: PAPER, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "15px 16px", borderBottom: `1px solid ${INK15}` }}>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.1 }}>{j.name}</div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, color: INK70, marginTop: 3 }}>{j.outlet}</div>
        </div>
        <TierBadge tier={j.tier} />
      </div>
      <div style={{ padding: "13px 16px", borderBottom: `1px solid ${INK15}` }}>
        <div style={capsLbl(9, "0.16em", { marginBottom: 6 })}>why</div>
        <div style={{ borderLeft: `2px solid ${YEL}`, paddingLeft: 11, fontFamily: SERIF, fontSize: 14, lineHeight: 1.45, color: INK70 }}>{j.why}</div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${INK15}` }}>
        <div style={capsLbl(9, "0.16em", { marginBottom: 5 })}>Recent coverage</div>
        <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.4, color: INK70 }}>{j.coverage}</div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${INK15}` }}>
        <div style={capsLbl(9, "0.16em", { marginBottom: 5 })}>Authority</div>
        <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.4, color: INK70 }}>{j.authority}</div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${INK15}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={capsLbl(9, "0.16em")}>Contact</div>
          <span
            title={CONTACT_DISCLAIMER}
            style={{ border: `1px solid ${INK35}`, width: 15, height: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 700, fontSize: 10, cursor: "help", color: INK55 }}
          >
            i
          </span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 12, lineHeight: 1.4, color: INK55 }}>{CONTACT_DISCLAIMER}</div>
      </div>
      <div style={{ padding: "12px 16px", marginTop: "auto" }}>
        <span style={{ display: "inline-block", border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 14px", cursor: "pointer", transition: "all .12s ease" }}>
          Select for brief
        </span>
      </div>
    </div>
  );
}

/** Centered ▼ + newspaper double rule between acts. */
function ActBreak({ padTop = 24 }: { padTop?: number }) {
  return (
    <>
      <div style={{ textAlign: "center", padding: `${padTop}px 0 4px`, color: INK, fontSize: 20 }}>{"▼"}</div>
      <DoubleRule style={{ marginBottom: 36 }} />
    </>
  );
}

/* ========================================================================== */
export default function JournoCollabIQHowItWorksPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [panelOpen, setPanelOpen] = useState(false);

  // Auto-play loop: one self-rescheduling timeout; re-armed whenever step,
  // playing, or speed changes; cleared on pause and on unmount.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % 8), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [playing, speed, step]);

  const jump = (i: number) => {
    setStep(i);
    setPlaying(false); // pause so the user can read the criterion
  };

  const current = CRITERIA[step];

  const speedBtn = (active: boolean): CSSProperties => ({
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    padding: "8px 12px",
    marginRight: 6,
    border: `1px solid ${active ? YEL : P35}`,
    background: active ? YEL : "transparent",
    color: active ? INK : PAPER,
    cursor: "pointer",
    borderRadius: 0,
    transition: "all .12s ease",
  });

  return (
    <>
      <ToolHeader
        toolPrefix="JournoCollab"
        subtitle="HOW IT WORKS · FRAMEWORK VISUAL"
        rightContent={
          <Link
            href="/tools/journocollabiq"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}
          >
            Open JournoCollabIQ →
          </Link>
        }
      />

      <div style={{ background: PAPER, fontFamily: SERIF, color: INK, minHeight: "100vh", overflowX: "hidden" }}>
        <style>{`
          @keyframes jcqFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
          @keyframes jcqBlink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
          .jcq-reveal { animation: jcqFadeUp .38s ease both; }
          .jcq-blink { animation: jcqBlink 1.4s ease-in-out infinite; }
        `}</style>

        {/* ============ HEADER / HERO (dark) ============ */}
        <header style={{ background: INK, color: PAPER, padding: "22px 40px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 34, letterSpacing: "-0.01em", lineHeight: 1 }}>
                JournoCollab<span style={{ color: YEL }}>IQ</span>
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: P72, marginTop: 8 }}>
                Find the journalists who&#39;ll actually cover this.
              </div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <Pill size={10.5} ls="0.18em">Journalist Beat Matcher</Pill>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: P55 }}>
                8 FIT CRITERIA{" "}/{" "}5 STAGES{" "}/{" "}3 TIERS
              </div>
              <div style={{ border: `1px solid ${P40}`, color: YEL, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 10px" }}>
                SAMPLE SCENARIO · FAIRGROUND (ILLUSTRATIVE)
              </div>
            </div>
          </div>
          {/* 5-stage wizard strip */}
          <div style={{ maxWidth: 1180, margin: "20px auto 0", borderTop: `1px solid ${P25}`, paddingTop: 16, display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: P45, marginRight: 18 }}>WIZARD</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {["01  Story", "02  Offer", "03  Journalists", "04  Angle", "05  Media Brief"].map((stage, i) => (
                <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span style={{ color: P35 }}>→</span>}
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", color: PAPER }}>{stage}</span>
                </span>
              ))}
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px 72px" }}>

          {/* ============ ACT ① — STORY & OFFER IN ============ */}
          <section style={{ paddingTop: 44 }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36, alignItems: "start" }}>
              {/* left rail label */}
              <div style={{ paddingTop: 2 }}>
                <Pill size={10.5} ls="0.14em">①&nbsp; Story &amp; Offer In</Pill>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: INK55, margin: "18px 0 0", maxWidth: 190 }}>
                  The raw material: the business, the industry, and what you&#39;re putting in front of a reporter.
                </p>
              </div>

              {/* content */}
              <div style={{ border: `1px solid ${INK}`, background: PAPER }}>
                {/* Stage 1 */}
                <div style={{ padding: "22px 26px 26px", borderBottom: `1px solid ${INK35}` }}>
                  <div style={capsLbl(10, "0.2em", { marginBottom: 6 })}>STAGE 01 · STORY</div>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: "-0.01em", margin: "0 0 18px" }}>
                    Find the journalists who&#39;ll actually cover this.
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 640 }}>
                    <div style={{ gridColumn: "1 / 2" }}>
                      <div style={capsLbl(10, "0.14em", { marginBottom: 6 })}>Business name *</div>
                      <div style={{ border: `1px solid ${INK}`, background: FIELD, height: 38, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: SERIF, fontSize: 16 }}>Fairground</div>
                    </div>
                    <div style={{ gridColumn: "2 / 3" }}>
                      <div style={capsLbl(10, "0.14em", { marginBottom: 6 })}>Website</div>
                      <div style={{ border: `1px solid ${INK35}`, background: FIELD, height: 38, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: MONO, fontSize: 13, color: INK70 }}>fairground.example.com</div>
                    </div>
                    <div style={{ gridColumn: "1 / 3" }}>
                      <div style={capsLbl(10, "0.14em", { marginBottom: 6 })}>One-line description</div>
                      <div style={{ border: `1px solid ${INK35}`, background: FIELD, height: 38, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: SERIF, fontSize: 16 }}>Marketplace infrastructure for B2B distributors and manufacturers</div>
                    </div>
                  </div>
                  <div style={capsLbl(10, "0.14em", { margin: "20px 0 10px" })}>Your industry</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {INDUSTRIES.map((ind, i) => (
                      <Chip key={ind} label={ind} selected={ind === INDUSTRY_SELECTED} strong={i === 0} />
                    ))}
                    <Chip label="+ Custom…" dashed />
                  </div>
                </div>

                {/* Stage 2 */}
                <div style={{ padding: "22px 26px 26px" }}>
                  <div style={capsLbl(10, "0.2em", { marginBottom: 6 })}>STAGE 02 · OFFER</div>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: "-0.01em", margin: "0 0 18px" }}>
                    What are you offering the journalist?
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    <div style={{ border: `1px solid ${INK35}`, padding: "16px 16px 18px", display: "flex", flexDirection: "column", minHeight: 150 }}>
                      <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.01em", marginBottom: 8 }}>Expert Commentary</div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, margin: 0 }}>
                        Offer a quotable expert take for a story they&#39;re already writing. The classic reactive source pitch.
                      </p>
                    </div>
                    <div style={{ border: `2px solid ${INK}`, background: PAPER2, padding: "15px 15px 17px", display: "flex", flexDirection: "column", minHeight: 150 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.01em" }}>Exclusive Data</div>
                        <span style={{ background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 7px" }}>Selected ✓</span>
                      </div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, margin: 0 }}>
                        Offer original data or research as an exclusive or embargo. The path to Tier-1 features.
                      </p>
                    </div>
                    <div style={{ border: `1px solid ${INK35}`, padding: "16px 16px 18px", display: "flex", flexDirection: "column", minHeight: 150 }}>
                      <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.01em", marginBottom: 8 }}>Trend Reaction</div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, margin: 0 }}>
                        Offer a timely reaction tied to a breaking trend or news hook. Newsjacking, done right.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 20 }}>
                    <div>
                      <div style={capsLbl(10, "0.14em", { marginBottom: 8 })}>Your audience · Type</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {AUDIENCE_TYPES.map((a) => (
                          <Chip key={a} label={a} selected={a === AUDIENCE_SELECTED} small />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={capsLbl(10, "0.14em", { marginBottom: 8 })}>Geography</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {GEOGRAPHIES.map((g) => (
                          <Chip key={g} label={g} selected={g === GEO_SELECTED} small />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <div style={capsLbl(10, "0.14em", { marginBottom: 6 })}>
                      Describe your ideal customer <span style={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "none" }}>(optional)</span>
                    </div>
                    <div style={{ border: `1px solid ${INK35}`, background: FIELD, minHeight: 64, padding: 12, fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: INK70 }}>
                      Mid-market distributors and manufacturers evaluating marketplace software
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ActBreak padTop={24} />

          {/* ============ ACT ② — THE MATCHING ENGINE ============ */}
          <section>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
              <Pill size={10.5} ls="0.14em">②&nbsp; The Matching Engine</Pill>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
                a travelling marker rates each journalist criterion by criterion. drive it with the player, or click any box.
              </span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70, maxWidth: 900, margin: "8px 0 22px" }}>
              Each journalist is scored by JournoCollabIQ against 8 fit criteria: beat match, recent relevant coverage, publication authority, audience fit, responsiveness, exclusivity fit, contact findability, and brand-safety fit.
            </p>

            {/* "Now scoring" cast strip */}
            <div style={{ border: `1px solid ${INK}`, background: PAPER2, display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", marginBottom: 18, flexWrap: "wrap" }}>
              <span style={capsLbl(10, "0.16em")}>Now scoring</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INK, color: PAPER, padding: "5px 11px" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14 }}>Jordan Ames</span>
                <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, color: P60 }}>TechCrunch</span>
                <span style={{ background: GREEN, fontFamily: GROT, fontWeight: 800, fontSize: 9, padding: "2px 5px" }}>A</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK55 }}>Priya Osei</span>
                <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, color: "rgba(26,20,16,.4)" }}>Modern Retail</span>
                <span style={{ border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 800, fontSize: 9, padding: "2px 5px" }}>B</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK55 }}>Sam Whitfield</span>
                <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, color: "rgba(26,20,16,.4)" }}>Digital Commerce 360</span>
                <span style={{ border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 800, fontSize: 9, padding: "2px 5px" }}>C</span>
              </span>
            </div>

            {/* pipeline row: 8-up criteria grid (guardrail: minmax(0,1fr), no overflow at 1280–1440px) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0,1fr))", gap: 8, marginBottom: 4 }}>
              {CRITERIA.map((c, i) => {
                const active = i === step;
                return (
                  <button
                    key={c.num}
                    type="button"
                    onClick={() => jump(i)}
                    aria-pressed={active}
                    style={{
                      border: `1px solid ${active ? INK : INK35}`,
                      background: active ? INK : PAPER,
                      padding: "12px 8px 10px",
                      minHeight: 118,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: 0,
                      transition: "all .12s ease",
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: active ? YEL : INK55 }}>{c.num}</div>
                    <div style={{ fontSize: 20, margin: "8px 0 8px", color: active ? YEL : INK }}>{c.icon}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 12, lineHeight: 1.2, color: active ? PAPER : INK }}>{c.question}</div>
                  </button>
                );
              })}
            </div>
            {/* marker row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0,1fr))", gap: 8, marginBottom: 22 }}>
              {CRITERIA.map((c, i) => (
                <div key={c.num} style={{ textAlign: "center", color: YEL, fontSize: 12, height: 12, opacity: i === step ? 1 : 0, transition: "opacity .18s ease" }}>
                  ▲
                </div>
              ))}
            </div>

            {/* player bar */}
            <div style={{ background: INK, color: PAPER, display: "flex", alignItems: "center", gap: 0, padding: "12px 16px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                style={{ background: YEL, color: INK, border: "none", borderRadius: 0, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", padding: "9px 16px", marginRight: 20, cursor: "pointer", transition: "all .12s ease" }}
              >
                {playing ? "‖ PAUSE" : "▶ PLAY"}
              </button>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", color: P45, marginRight: 14 }}>SPEED</span>
              <button type="button" onClick={() => setSpeed("slow")} style={speedBtn(speed === "slow")}>SLOW</button>
              <button type="button" onClick={() => setSpeed("normal")} style={speedBtn(speed === "normal")}>NORMAL</button>
              <button type="button" onClick={() => setSpeed("fast")} style={speedBtn(speed === "fast")}>FAST</button>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", color: YEL }}>
                STEP 0{step + 1} / 8 · {playing ? "PLAYING" : "PAUSED"}
              </div>
            </div>

            {/* detail panel + tier output */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 0, border: `1px solid ${INK}`, borderTop: "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "132px 1fr" }}>
                <div style={{ background: INK, color: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 10px" }}>
                  <div className={playing ? "jcq-blink" : undefined} style={{ fontSize: 30, color: YEL, lineHeight: 1 }}>{current.icon}</div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", marginTop: 14, color: P72 }}>
                    CRITERION {current.num}
                  </div>
                </div>
                <div key={current.num} className="jcq-reveal" style={{ padding: "24px 28px" }}>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 23, letterSpacing: "-0.01em", margin: "0 0 10px", maxWidth: 560 }}>{current.question}</h3>
                  <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.55, color: INK70, margin: 0, maxWidth: 560 }}>{current.test}</p>
                  <div style={capsLbl(10, "0.16em", { marginTop: 18 })}>{current.tag}</div>
                  {current.example && (
                    <div style={{ borderLeft: `2px solid ${YEL}`, padding: "8px 0 8px 12px", marginTop: 14, maxWidth: 560 }}>
                      <div style={capsLbl(9, "0.16em", { marginBottom: 4 })}>Jordan Ames · TechCrunch</div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: INK }}>{current.example}</div>
                    </div>
                  )}
                </div>
              </div>
              {/* engine output cell */}
              <div style={{ borderLeft: `1px solid ${INK}`, background: PAPER2, padding: "20px 20px 22px" }}>
                <div style={capsLbl(10, "0.18em", { marginBottom: 4 })}>Engine output</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.45, color: INK70, marginBottom: 14 }}>
                  A judgment call, not a computed score. No percentage.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${INK}`, background: GREEN, color: PAPER, padding: "9px 12px" }}>
                    <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 16, width: 20 }}>A</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15 }}>Highest priority.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${INK}`, background: YEL, color: INK, padding: "9px 12px" }}>
                    <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 16, width: 20 }}>B</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15 }}>Strong candidate.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${INK35}`, background: PAPER, color: INK, padding: "9px 12px" }}>
                    <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 16, width: 20 }}>C</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15 }}>Good to include.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ActBreak padTop={28} />

          {/* ============ ACT ③ — SHORTLIST & BRIEF OUT ============ */}
          <section>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
              <Pill size={10.5} ls="0.14em">③&nbsp; Shortlist &amp; Brief Out</Pill>
              <span style={{ border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 9px", color: INK55 }}>
                SAMPLE SCENARIO · FAIRGROUND (ILLUSTRATIVE)
              </span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70, maxWidth: 900, margin: "8px 0 22px" }}>
              3 journalists found for SaaS / Software using Exclusive Data. Select the ones you want in your media brief.
            </p>

            {/* journalist shortlist: 3 cast cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 30 }}>
              {JOURNALISTS.map((j) => (
                <JournalistCard key={j.name} j={j} />
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, alignItems: "start" }}>
              {/* left column: tailored angle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={capsLbl(10, "0.18em")}>Stage 04 · Tailored angle</div>
                    <div style={capsLbl(9.5, "0.1em")}>→ Jordan Ames, TechCrunch</div>
                  </div>
                  <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "16px 18px" }}>
                    <div style={capsLbl(9.5, "0.16em", { marginBottom: 4 })}>Subject line</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.3, marginBottom: 14 }}>
                      Data: 40 B2B marketplaces benchmarked, only 11 meet their own definition
                    </div>
                    <div style={capsLbl(9.5, "0.16em", { marginBottom: 4 })}>
                      Pitch body <span style={{ fontWeight: 600, textTransform: "none", letterSpacing: "0.02em" }}>(under 150 words)</span>
                    </div>
                    <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70, margin: "0 0 14px" }}>
                      40 platforms call themselves a &ldquo;B2B marketplace.&rdquo; We scored all of them against a simple 3-part definition and only 11 qualify. Happy to share the full dataset or connect you with two of the 11 for a quote.
                    </p>
                    <div style={{ borderTop: `1px solid ${INK35}`, paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: INK }}>
                      Verify the journalist&#39;s name, outlet, and contact before sending &mdash; then score the final pitch in PressIQ.
                    </div>
                  </div>
                </div>
              </div>

              {/* right column: media brief */}
              <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                <div>
                  <div style={capsLbl(10, "0.18em", { marginBottom: 10 })}>Stage 05 · Media targeting brief</div>
                  <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P18}`, fontFamily: MONO, fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
                      <span>media-brief.md</span><span style={{ color: P45 }}>5 SECTIONS</span>
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {BRIEF_SECTIONS.map((s) => (
                        <div key={s.header}>
                          <div style={{ fontFamily: MONO, fontSize: 13.5, color: YEL, marginBottom: 4 }}>{s.header}</div>
                          <div style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.5, color: P72 }}>{s.body}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "12px 16px", borderTop: `1px solid ${P18}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ background: YEL, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 11px" }}>Download full PDF playbook</span>
                      <span style={{ border: `1px solid ${P40}`, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 11px" }}>Copy brief text</span>
                      <span style={{ border: `1px solid ${P40}`, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 11px" }}>↓ Download list (CSV)</span>
                    </div>
                  </div>
                  {/* PressIQ handoff */}
                  <Link href="/tools/pressiq" style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ marginTop: 14, border: `1px solid ${INK}`, background: YEL, color: INK, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>Ready to pitch?</span>
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Score this pitch in PressIQ →</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* tier legend */}
            <div style={{ marginTop: 40 }}>
              <div style={capsLbl(10, "0.2em", { marginBottom: 12 })}>The tier legend</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                <div style={{ border: `1px solid ${INK}`, background: GREEN, color: PAPER, padding: "16px 18px" }}>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Tier A</div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.4 }}>Highest priority.</div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: P60, marginTop: 10 }}>Jordan Ames · TechCrunch</div>
                </div>
                <div style={{ border: `1px solid ${INK}`, background: YEL, color: INK, padding: "16px 18px" }}>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Tier B</div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.4 }}>Strong candidate.</div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(26,20,16,.6)", marginTop: 10 }}>Priya Osei · Modern Retail</div>
                </div>
                <div style={{ border: `1px solid ${INK}`, background: PAPER2, color: INK, padding: "16px 18px" }}>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Tier C</div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.4 }}>Good to include.</div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: INK55, marginTop: 10 }}>Sam Whitfield · Digital Commerce 360</div>
                </div>
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: INK55, margin: "12px 0 0", maxWidth: 900 }}>
                Tiers are an AI judgment against the 8 fit criteria above, not a computed percentage. There is no numeric match score. Never render an invented &ldquo;% fit.&rdquo;
              </p>
            </div>

            {/* collapsible 8 fit criteria */}
            <div style={{ marginTop: 40, borderTop: `1px solid ${INK}`, paddingTop: 20 }}>
              <button
                type="button"
                onClick={() => setPanelOpen((p) => !p)}
                aria-expanded={panelOpen}
                style={{ display: "inline-block", background: INK, color: PAPER, border: "none", borderRadius: 0, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer", transition: "all .12s ease" }}
              >
                {panelOpen ? "▾ HIDE THE 8 FIT CRITERIA" : "▸ SHOW THE 8 FIT CRITERIA"}
              </button>
              {panelOpen && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 18 }}>
                  {CRITERIA.map((c) => (
                    <div key={c.num} style={{ border: `1px solid ${INK35}`, background: PAPER, padding: "14px 15px", minHeight: 120 }}>
                      <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, color: INK, marginBottom: 8 }}>{c.num}</div>
                      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15.5, lineHeight: 1.25, marginBottom: 8 }}>{c.question}</div>
                      <div style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: INK70 }}>{c.test}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ============ PIPELINE FOOTER + NEXT STEP ============ */}
          <section style={{ marginTop: 44 }}>
            <DoubleRule style={{ marginBottom: 22 }} />
            {/* pipeline position strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", marginBottom: 22 }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: GREEN }}>✓ SIGNALIQ</span>
              <span style={{ color: INK35, margin: "0 12px" }}>·</span>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: GREEN }}>✓ ASSETIQ</span>
              <span style={{ color: INK35, margin: "0 12px" }}>·</span>
              <span style={{ background: INK, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", padding: "5px 10px" }}>JOURNOCOLLABIQ</span>
              <span style={{ color: INK35, margin: "0 12px" }}>·</span>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: INK55 }}>PRESSIQ</span>
              <span style={{ color: INK35, margin: "0 12px" }}>·</span>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: INK55 }}>COVERAGEIQ</span>
            </div>
            {/* next-step panel */}
            <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: P45, marginBottom: 8 }}>Next step in the pipeline</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, letterSpacing: "-0.01em", marginBottom: 6 }}>PressIQ &mdash; Pitch Scoring</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: P72, maxWidth: 560 }}>Score and refine your pitches against 32-point journalist criteria.</div>
              </div>
              <Link
                href="/tools/pressiq"
                style={{ background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", padding: "13px 20px", whiteSpace: "nowrap", textDecoration: "none" }}
              >
                Go to PressIQ →
              </Link>
            </div>
          </section>

        </main>

        {/* ============ FOOTER ============ */}
        <footer style={{ borderTop: `1px solid ${INK}`, background: PAPER }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 40px", borderBottom: `1px solid ${INK15}` }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: INK55, margin: 0, maxWidth: 920 }}>
              Sample scenario, illustrative. TechCrunch, Modern Retail, and Digital Commerce 360 are real, existing publications, named only to illustrate realistic outlet types and tiers. Jordan Ames, Priya Osei, and Sam Whitfield are entirely fictional: no real reporter by these names is implied, and no specific real article or quote is attributed to them.
            </p>
          </div>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14 }}>
              JournoCollab<span style={{ color: YEL_DIM }}>IQ</span>
            </span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
              Find the journalists who&#39;ll actually cover this.
            </span>
          </div>
        </footer>

        <ToolPipelineFooter currentTool="journocollabiq" />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { Colophon, Subscriptions, CTATicker } from "@/components/bureau";
import CoverageFlywheel from "@/components/bureau/CoverageFlywheel";
import PipelineFlow from "./PipelineFlow";
import PipelineFlowV2 from "./PipelineFlowV2";
import PitchClinicDemo from "./PitchClinicDemo";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
} from "@/components/bureau/primitives";
import { ScrollButtons } from "@/components/ScrollButtons";
import {
  BLUE,
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Earned Media in the Age of AI · Keynote & Interactive Session",
  description:
    "A flagship, interactive session on how AI is remaking earned media from both sides: AI agents that now run a six stage PR pipeline, and the LLMs and AI search that decide which brands get seen. Mapped from inside a working earned media OS by Syed Irfan Ajmal. Also presented as 'When AI Agents Pitch Journalists: The New Earned Media Engine.'",
  openGraph: {
    title: "Earned Media in the Age of AI · Keynote & Interactive Session",
    description:
      "How AI is changing earned media from both sides, mapped from the inside using real data from the earned media OS Syed Irfan Ajmal built. Keynote, workshop, or panel.",
  },
  alternates: { canonical: "/speaking/earned-media-ai" },
};

// ─── Page-scoped layout CSS (self-contained, no globals dependency) ───────────

const PAGE_CSS = `
.emai-hero{display:grid;grid-template-columns:1.5fr 1fr;gap:46px;align-items:start;}
.emai-intro{display:grid;grid-template-columns:1fr 1fr;gap:42px;align-items:end;margin-bottom:34px;}
.emai-split{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.emai-cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.emai-returns{display:grid;grid-template-columns:1fr 1fr;margin-top:30px;border-top:1px solid ${INK35};}
.emai-returns > div{border-bottom:1px solid ${INK35};padding:16px 22px 18px;}
.emai-returns > div:nth-child(odd){border-right:1px solid ${INK35};}
.emai-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;}
@media(max-width:980px){
  .emai-hero{grid-template-columns:1fr;gap:34px;}
  .emai-cards3{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:760px){
  .emai-intro{grid-template-columns:1fr;gap:16px;}
  .emai-split{grid-template-columns:1fr;}
  .emai-cards3{grid-template-columns:1fr;}
  .emai-returns{grid-template-columns:1fr;}
  .emai-returns > div:nth-child(odd){border-right:none;}
  .emai-stats{grid-template-columns:repeat(2,1fr);}
}
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const SESSION_SPECS: ReadonlyArray<[string, string]> = [
  ["Formats", "Keynote · Interactive workshop · Panel · Webinar"],
  ["Length", "45 min keynote to a half day workshop"],
  ["Room", "20 to ~500, in person or virtual"],
  ["Built for", "Founders, marketers, PR and comms teams"],
];

type Activity = { n: string; title: string; body: string };
const ACTIVITIES: ReadonlyArray<Activity> = [
  { n: "01", title: "Idea sprint", body: "The room picks a topic. Together we generate authority asset ideas the press would actually want to cover." },
  { n: "02", title: "Spot the slop", body: "We put an AI draft next to a human one. The room calls which is which, and we pull apart the tells that give AI away." },
  { n: "03", title: "Pitch clinic", body: "We review attendees’ real pitches live, then rebuild the weak ones on the spot." },
];

type Audience = { t: string; body: string; want: string };
const AUDIENCES: ReadonlyArray<Audience> = [
  { t: "People", body: "Readers, buyers, and the journalists who cover them still trust editorial coverage far more than an ad.", want: "A credible, quotable source with a real point of view." },
  { t: "Search engines", body: "Google weighs links, mentions and expertise signals to decide who ranks and who stays buried.", want: "Authority signals from independent sites." },
  { t: "Generative engines", body: "LLMs and AI search stake their reputation on citation quality, so they surface brands with genuine authority.", want: "To cite the most trusted, most mentioned source." },
];

const RETURNS: ReadonlyArray<[string, string, string]> = [
  ["01", "Reputation", "Media mentions signal authority to prospects, partners and search engines at the same time."],
  ["02", "Visibility", "Editorial coverage reaches audiences no paid budget can reliably touch."],
  ["03", "Conversions", "Third party validation turns interest into intent, faster than owned content can."],
  ["04", "Brand Equity", "Consistent coverage compounds into a brand that commands premium positioning."],
  ["05", "Magnetism", "Press begets press. Journalists cite sources other journalists have already cited."],
  ["06", "Liberty", "A media backed brand earns pricing power, category leadership, and freedom from paid ads."],
];

const TAKEAWAYS: ReadonlyArray<string> = [
  "Run a full earned media pipeline with AI and no code.",
  "Brief an AI agent for each of the six stages, from signal to attribution.",
  "Catch AI slop and unverified claims before they ship.",
  "Read the numbers that prove a placement actually worked.",
];

const FAILURES: ReadonlyArray<string> = [
  "It still fabricates and over claims. Verification is not optional.",
  "It cannot build a real relationship with a journalist.",
  "It misreads nuance, timing and embargoes.",
  "It cannot make the judgment call on what is genuinely newsworthy.",
];

const QA: ReadonlyArray<[string, string]> = [
  ["01", "Which jobs of a PR team can AI agents genuinely run today, and where do they still fail?"],
  ["02", "How do you pair AI with human judgment so the work earns the trust of journalists, customers, LLMs and AI search?"],
  ["03", "Why do LLMs and AI search now decide which brands get seen, and what do they reward?"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["22", "years in marketing, as an operator"],
  ["1.5M", "organic visitors grown, Ridester"],
  ["04", "countries hosted on stage"],
  ["~500", "biggest live audience"],
];

// ─── Shared button styles ─────────────────────────────────────────────────────

const btnBase = {
  display: "inline-block",
  textAlign: "center" as const,
  textDecoration: "none",
  fontFamily: GROT,
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  padding: "16px 26px",
};
const btnInk = { ...btnBase, background: INK, color: PAPER };
const btnYel = { ...btnBase, background: YEL, color: INK };
const btnGhostLight = { ...btnBase, background: "transparent", color: PAPER, border: `1px solid ${PAPER}` };
const btnGhostDark = { ...btnBase, background: "transparent", color: INK, border: `1px solid ${INK}` };

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 64, paddingBottom: 70 }}>
    <div style={{ marginBottom: 20 }}>
      <DoubleRule />
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "10px 0 6px", flexWrap: "wrap" }}>
        <Pill size={11} ls="0.18em">Flagship Session</Pill>
        <SCaps size={11.5} ls="0.22em" color={INK}>Keynote · Interactive Workshop · Panel</SCaps>
        <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
        <SCaps size={11} ls="0.18em" color={INK55}>Vol. XV · The AI Desk</SCaps>
      </div>
      <div style={{ marginTop: -1, borderTop: `1px solid ${INK}` }} />
    </div>

    <div className="emai-hero">
      {/* Left — the headline */}
      <div>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(40px, 7vw, 76px)", color: INK, lineHeight: 0.98, letterSpacing: "-0.028em" }}>
          Earned Media
          <br />
          <span style={{ fontStyle: "italic" }}>in the Age of <Mark>AI</Mark></span>
        </h1>
        <p style={{ margin: "26px 0 0", fontFamily: SERIF, fontSize: "clamp(18px, 2.4vw, 23px)", color: INK, lineHeight: 1.5, maxWidth: 620 }}>
          Earned media earns attention instead of buying it. That matters more every quarter, as paid ads get pricier, convert worse, and vanish behind ad blockers.
        </p>
        <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 620 }}>
          AI is now rewriting earned media from both sides at once. This session maps the whole shift from the inside, using real data from the earned media OS I built and run.
        </p>
        <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={btnInk}>Invite me to speak &rarr;</a>
          <a href="/contact" style={btnGhostDark}>Ask about this session &rarr;</a>
        </div>
        <p style={{ margin: "24px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: INK70, lineHeight: 1.5 }}>
          By Syed Irfan Ajmal · Founder of EMOS · CEO of DMR.agency · Quoted in Harvard Business Review and Forbes.
        </p>
        <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
          <SCaps size={10} ls="0.16em" color={INK55}>Also presented as</SCaps>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK, lineHeight: 1.4 }}>
            &ldquo;When AI Agents Pitch Journalists: The New Earned Media Engine&rdquo;
          </span>
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
          <SCaps size={10} ls="0.16em" color={INK55}>Travel edition</SCaps>
          <a href="/speaking/earned-media-ai/travel" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK, lineHeight: 1.4 }}>
            When Travelers Ask ChatGPT Where to Go &rarr;
          </a>
        </div>
      </div>

      {/* Right — the session desk */}
      <aside style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "24px 24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SCaps size={10.5} ls="0.18em" color={INK55}>Session Desk</SCaps>
          <Pill size={10} ls="0.18em">Signature</Pill>
        </div>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 21, lineHeight: 1.2, color: INK, fontWeight: 700 }}>
          One session, two sides of the shift.
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px" }}>
          {SESSION_SPECS.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <div><SCaps size={9.5} ls="0.14em" color={INK55}>{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.4 }}>{v}</div>
            </div>
          ))}
        </div>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ ...btnInk, marginTop: 18, display: "block" }}>Check a date &rarr;</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ ...btnYel, marginTop: 8, display: "block" }}>Speaker one-sheet &darr;</a>
        <a href="/press-kit" style={{ ...btnGhostDark, marginTop: 8, display: "block" }}>View the full press kit &rarr;</a>
      </aside>
    </div>
  </section>
);

// ─── §02 · The Shift ──────────────────────────────────────────────────────────

const Shift = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 84, paddingBottom: 84 }}>
    <SectionMast n="02" label="The Shift · Why this, why now" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        Paid attention is getting worse.
        <br />
        <span style={{ fontStyle: "italic" }}><Mark>Earned attention compounds.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        A credible mention in a publication your buyers already trust keeps working long after it goes live, and it makes the next mention easier to get. The moment you stop paying for an ad, the attention stops. And AI has just changed earned media from both sides at once.
      </p>
    </div>
    <div className="emai-split">
      <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "28px 26px" }}>
        <SCaps size={10.5} ls="0.18em" color={BLUE}>Supply side</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          AI agents can now do the core jobs of a PR team.
        </h3>
        <HRule style={{ margin: "16px 0", background: INK35 }} />
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 16, color: INK70, lineHeight: 1.6 }}>
          The work of earning coverage breaks into six stages. Each one now has an AI agent doing the heavy lifting, and each maps to a tool in the OS I run.
        </p>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "28px 26px" }}>
        <SCaps size={10.5} ls="0.18em" color={YEL}>Demand side</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: PAPER, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          LLMs and AI search now decide which brands get seen.
        </h3>
        <HRule style={{ margin: "16px 0", background: "rgba(241,235,222,.35)" }} />
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.75)", lineHeight: 1.6 }}>
          And they reward exactly what earned media produces: authoritative coverage, citations, and genuine expert content.
        </p>
      </div>
    </div>
  </section>
);

// ─── §04 · The Earned Media Pipeline ──────────────────────────────────────────

const Pipeline = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="04" label="Supply Side · The Earned Media Pipeline" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        Six jobs a PR team does.
        <br />
        <span style={{ fontStyle: "italic" }}>AI can now run every one.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Each stage maps to a tool in EMOS, the earned media OS I built and run, so the talk is backed by live data, not slideware. String the six together and you have a full pipeline, run with AI and no code.
      </p>
    </div>
    <PipelineFlow />
    <p style={{ margin: "30px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: INK, lineHeight: 1.5, textAlign: "center" }}>
      In the room, we do not just describe the pipeline. <Mark>We run it live.</Mark>
    </p>
  </section>
);

// ─── §04 · The Earned Media Pipeline · V2 (active) ────────────────
// V2 of Section 04. Same section shell as Pipeline (V1), with the reframed copy:
// leverage-led heading, "human decides at every gate" intro, PipelineFlowV2
// chips, the co-author caption, and the "work of ten" kicker.
// Rollback: render <Pipeline /> instead of <PipelineV2 /> below. V1 stays intact.

const PipelineV2 = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="04" label="Supply Side · The Earned Media Pipeline" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        Six jobs that used to need a team.
        <br />
        <span style={{ fontStyle: "italic" }}>AI can now run every one. None of them without a human.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Each stage maps to a tool in EMOS, the earned media OS I built and run, so the talk is backed by live data, not slideware. String the six together and you have a full pipeline where AI does the manual work and a human decides at every gate. No code, no autopilot.
      </p>
    </div>
    <PipelineFlowV2 />
    <div style={{ margin: "34px auto 0", maxWidth: 720, border: `1px solid ${INK}`, borderLeft: `3px solid ${YEL}`, background: PAPER, padding: "22px 26px" }}>
      <SCaps size={10.5} ls="0.18em" color={BLUE}>On AssetIQ &amp; PressIQ</SCaps>
      <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 16.5, color: INK, lineHeight: 1.6 }}>
        Treat the AI as a co-author, not a vending machine. You don&rsquo;t drop a coin and collect a finished pitch. You brief it, push back, rewrite. Your name goes on the final.
      </p>
    </div>
    <p style={{ margin: "30px auto 0", maxWidth: 780, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3.2vw, 30px)", color: INK, lineHeight: 1.25, letterSpacing: "-0.015em" }}>
      Even with a human deciding at every gate, one operator now does the earned media work of <span style={{ fontStyle: "italic" }}>ten, if not more.</span>
    </p>
    <p style={{ margin: "30px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: INK, lineHeight: 1.5, textAlign: "center" }}>
      In the room, we do not just describe the pipeline. <Mark>We run it live.</Mark>
    </p>
  </section>
);

// ─── §05 · In the Room ────────────────────────────────────────────────────────

const Activities = () => (
  <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 80, paddingBottom: 88, position: "relative", overflow: "hidden" }}>
    <div aria-hidden style={{ position: "absolute", top: -40, right: -60, opacity: 0.06, pointerEvents: "none" }}>
      <SiaLogo height={320} />
    </div>
    <SectionMast n="05" label="In the Room · Three live activities" dark />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: PAPER, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        A working session,
        <br />
        <span style={{ fontStyle: "italic", color: YEL }}>not a lecture.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: "rgba(241,235,222,.72)", lineHeight: 1.6, maxWidth: 560 }}>
        The room does the work. Three activities turn the pipeline from a slide into something everyone has tried by the time they leave.
      </p>
    </div>
    <div className="emai-cards3">
      {ACTIVITIES.map((a) => (
        <div key={a.n} style={{ border: "1px solid rgba(241,235,222,.28)", background: "rgba(241,235,222,.04)", padding: "26px 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(38px, 7vw, 56px)", color: YEL, lineHeight: 1, letterSpacing: "-0.03em" }}>{a.n}</div>
          <h3 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: PAPER, lineHeight: 1.15 }}>{a.title}</h3>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.72)", lineHeight: 1.6, flex: 1 }}>{a.body}</p>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 48, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
      <PitchClinicDemo />
    </div>
  </section>
);

// ─── §03 · Demand Side ────────────────────────────────────────────────────────

const Demand = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 84, paddingBottom: 84 }}>
    <SectionMast n="03" label="Demand Side · Who gets seen now" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        AI search rewards exactly
        <br />
        <span style={{ fontStyle: "italic" }}><Mark>what earned media produces.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Generative engines increasingly decide which brands surface in an answer. They stake their credibility on citation quality, so they reward authoritative coverage, third party citations, and real expert content. Earn it once and it pays out to people, to search, and to the machines that cite you, at the same time.
      </p>
    </div>
    <div className="emai-cards3">
      {AUDIENCES.map((a) => (
        <div key={a.t} style={{ border: `1px solid ${INK}`, background: PAPER, padding: "24px 22px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK, lineHeight: 1.15 }}>{a.t}</h3>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55, flex: 1 }}>{a.body}</p>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${INK35}` }}>
            <SCaps size={9.5} ls="0.14em" color={INK55}>They want</SCaps>
            <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 14.5, color: INK, lineHeight: 1.5, fontStyle: "italic" }}>{a.want}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── §01 · The Coverage Flywheel ──────────────────────────────────────────────

const Flywheel = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="01" label="The Payoff · The Coverage Flywheel" />
    <div style={{ maxWidth: 720, margin: "0 auto 8px", textAlign: "center" }}>
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.02, letterSpacing: "-0.025em" }}>
        One asset. One placement. <span style={{ fontStyle: "italic" }}>Six compounding returns.</span>
      </h2>
      <p style={{ margin: "16px auto 0", fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 620 }}>
        A single authority asset and a single piece of coverage do not stop at the placement. They compound around a six part flywheel. Spin it long enough and it starts turning on its own, because journalists cite sources other journalists have already cited.
      </p>
    </div>

    <div style={{ marginTop: 20 }}>
      <CoverageFlywheel
        hubEyebrow="Earned Media"
        hubTitle="Coverage Flywheel"
        hubSub="Six compounding returns"
        ctaHref="#invite"
        ctaLabel="Bring this session to your stage →"
      />
    </div>

    <p style={{ margin: "8px 0 0", fontFamily: GROT, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: INK55, textAlign: "center" }}>
      Hover or tap a segment to read each return
    </p>

    <div className="emai-returns">
      {RETURNS.map(([n, name, desc]) => (
        <div key={n}>
          <span style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", color: BLUE, marginBottom: 4 }}>{n}</span>
          <span style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, marginBottom: 6 }}>{name}</span>
          <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55 }}>{desc}</span>
        </div>
      ))}
    </div>
  </section>
);

// ─── §06 · What You Leave With + the honest part ──────────────────────────────

const LeaveWith = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 84, paddingBottom: 84 }}>
    <SectionMast n="06" label="What You Leave With · And the honest part" />
    <div className="emai-split">
      <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "30px 28px" }}>
        <SCaps size={11} ls="0.18em" color={BLUE}>You leave able to</SCaps>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {TAKEAWAYS.map((t, j) => (
            <li key={j} style={{ padding: "12px 0 12px 26px", position: "relative", borderTop: j === 0 ? "none" : `1px solid ${INK15}`, fontFamily: SERIF, fontSize: 16.5, color: INK, lineHeight: 1.5 }}>
              <span style={{ position: "absolute", left: 0, top: 12, fontFamily: GROT, fontSize: 11, fontWeight: 800, color: INK }}>0{j + 1}.</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "30px 28px" }}>
        <SCaps size={11} ls="0.18em" color={YEL}>The honest part · where AI still fails</SCaps>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {FAILURES.map((t, j) => (
            <li key={j} style={{ padding: "12px 0 12px 26px", position: "relative", borderTop: j === 0 ? "none" : "1px solid rgba(241,235,222,.16)", fontFamily: SERIF, fontSize: 16.5, color: "rgba(241,235,222,.82)", lineHeight: 1.5 }}>
              <span style={{ position: "absolute", left: 0, top: 13, width: 8, height: 8, background: YEL }} aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <p style={{ margin: "20px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(241,235,222,.6)", lineHeight: 1.5 }}>
          The session is candid about all of it. That is the point.
        </p>
      </div>
    </div>
  </section>
);

// ─── §07 · Q&A ────────────────────────────────────────────────────────────────

const QandA = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="07" label="Q&A · Where the room usually goes" />
    <div style={{ maxWidth: 760, marginBottom: 30 }}>
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px, 4.2vw, 42px)", color: INK, lineHeight: 1.02, letterSpacing: "-0.025em" }}>
        The questions this session tends to open.
      </h2>
    </div>
    <div style={{ borderTop: `2px solid ${INK}` }}>
      {QA.map(([n, q]) => (
        <div key={n} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, padding: "22px 0", borderBottom: `1px solid ${INK35}`, alignItems: "start" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 44px)", color: INK, lineHeight: 0.9, letterSpacing: "-0.02em" }}>{n}</div>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: "clamp(17px, 2.4vw, 22px)", color: INK, lineHeight: 1.4 }}>{q}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §08 · The Speaker ────────────────────────────────────────────────────────

const Speaker = () => (
  <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 84, paddingBottom: 84, position: "relative", overflow: "hidden" }}>
    <div aria-hidden style={{ position: "absolute", bottom: -60, left: -80, opacity: 0.06, pointerEvents: "none" }}>
      <SiaLogo height={340} />
    </div>
    <SectionMast n="08" label="The Speaker · On the record" dark />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: PAPER, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        An operator,
        <br />
        <span style={{ fontStyle: "italic", color: YEL }}>not a commentator.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17.5, color: "rgba(241,235,222,.75)", lineHeight: 1.6, maxWidth: 560 }}>
        Syed Irfan Ajmal is a serial entrepreneur and the founder of EMOS, an AI powered earned media operating system. He has led DMR.agency since 2013, delivering SEO-PR and content results like growing Ridester from zero to 1.5M monthly organic visitors. Earlier he cofounded Silk Route Interactive, a spatial intelligence startup, and studied and worked in Scandinavia. He also hosts the SIA Business podcast.
      </p>
    </div>
    <div style={{ marginTop: 6, paddingTop: 18, borderTop: "1px solid rgba(241,235,222,.16)" }}>
      <SCaps size={10} ls="0.16em" color="rgba(241,235,222,.55)">As seen in</SCaps>
      <p style={{ margin: "9px 0 0", fontFamily: SERIF, fontSize: 15.5, color: "rgba(241,235,222,.8)", lineHeight: 1.6 }}>
        Written for: World Bank · HuffPost · Forbes ME · SEMrush · SERPed &nbsp;|&nbsp; Quoted in: Harvard Business Review and Forbes (USA) &nbsp;|&nbsp; Workshops and talks: SEMrush · uHubs (UK) · DMSS.io (Bali) · MaGIC (Malaysia) · Arabian Travel Market (Dubai)
      </p>
    </div>
    <div className="emai-stats" style={{ marginTop: 16, background: "rgba(241,235,222,.22)", border: "1px solid rgba(241,235,222,.22)" }}>
      {STATS.map(([v, l]) => (
        <div key={l} style={{ background: INK, padding: "22px 18px" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 5vw, 48px)", color: YEL, lineHeight: 1, letterSpacing: "-0.02em" }}>{v}</div>
          <div style={{ marginTop: 8 }}><SCaps size={10} ls="0.12em" color="rgba(241,235,222,.7)">{l}</SCaps></div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Speaker Photo ────────────────────────────────────────────────────────────

const SpeakerPhotoStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 20 }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxWidth: 1000, margin: "0 auto" }}>
      <figure style={{ margin: 0, flex: "1 1 380px", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/speaking/dmss-irfan-large-audience.jpg"
          alt="Syed Irfan Ajmal speaking to a large live audience at DMSS Conference, Bali"
          style={{ width: "100%", aspectRatio: "16 / 9", display: "block", border: "1px solid rgba(250,250,250,.25)", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "#FAFAFA", lineHeight: 1.4 }}>
            DMSS Conference, Bali · Same live-room energy this session is built for, ~200 attendees.
          </div>
          <SCaps size={10} ls="0.16em" color="rgba(250,250,250,.55)">Photo · dmss.io</SCaps>
        </figcaption>
      </figure>
      <figure style={{ margin: 0, flex: "1 1 380px", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}` }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(250,250,250,.25)", overflow: "hidden" }}>
          <iframe
            src="https://www.youtube.com/embed/uSn4s5ZbJcQ?rel=0&start=743"
            title="Syed Irfan Ajmal on the panel at Arabian Travel Market, Dubai"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>
        <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "#FAFAFA", lineHeight: 1.4 }}>
            Arabian Travel Market, Dubai · On the panel at a ~40,000-attendee industry show.
          </div>
          <SCaps size={10} ls="0.16em" color="rgba(250,250,250,.55)">Panel · 2018</SCaps>
        </figcaption>
      </figure>
    </div>
  </section>
);

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

const BottomCTA = () => (
  <section id="invite" className="sx" style={{ background: YEL, paddingTop: 72, paddingBottom: 72 }}>
    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={INK}>Two ways in</SCaps>
      <h2 style={{ margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 5.5vw, 54px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.028em" }}>
        Bring this session to your stage.
      </h2>
      <p style={{ margin: "16px auto 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK, lineHeight: 1.5, maxWidth: 560, opacity: 0.85 }}>
        Organizers, send the event, audience and the metric you want moved. Curious about the content, ask a question. Response inside a working day, no salesy follow-up.
      </p>
      <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={btnInk}>Invite me to speak &rarr;</a>
        <a href="/contact" style={btnGhostDark}>Ask about this session &rarr;</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={btnGhostDark}>Speaker one-sheet &darr;</a>
        <a href="/press-kit" style={btnGhostDark}>Press kit &rarr;</a>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EarnedMediaInTheAgeOfAIPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <Hero />
      <Flywheel />
      <Shift />
      <Demand />
      <PipelineV2 />
      <Activities />
      <LeaveWith />
      <QandA />
      <Speaker />
      <SpeakerPhotoStrip />
      <BottomCTA />
      <CTATicker />
      <Subscriptions sectionNumber="09" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

import type { Metadata } from "next";
import { Colophon, Subscriptions, CTATicker } from "@/components/bureau";
import CoverageFlywheel from "@/components/bureau/CoverageFlywheel";
import PipelineFlowV2 from "../PipelineFlowV2";
import PitchClinicDemoTravel from "./PitchClinicDemoTravel";
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
  title: "When Travelers Ask ChatGPT Where to Go · Earned Media for Saudi Tourism",
  description:
    "80% of travelers now plan trips with AI (Global Muslim Travel Index 2026), and those answers are built from earned media: the coverage, reviews, and authority content the models trust. The travel edition of Earned Media in the Age of AI, tuned for Saudi tourism and Vision 2030, shows destinations, hotels, and travel brands how to win visibility across ChatGPT, Gemini, Perplexity and Google's AI Overviews, in English and Arabic.",
  openGraph: {
    title: "When Travelers Ask ChatGPT Where to Go · Earned Media for Saudi Tourism",
    description:
      "The travel edition of Earned Media in the Age of AI: how destinations, hotels, and travel brands win visibility in AI travel answers. Keynote, workshop, or panel.",
  },
  alternates: { canonical: "/speaking/earned-media-ai/travel" },
};

// ─── Page-scoped layout CSS (same grid system as the flagship page) ───────────

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
  ["Formats", "Keynote · Interactive workshop · Panel"],
  ["Length", "45 min keynote to a half day workshop"],
  ["Room", "20 to 500+, in person or virtual"],
  ["Built for", "DMOs, tourism boards, hotels, airlines, DMCs, travel marketers"],
];

type Activity = { n: string; title: string; body: string };
const ACTIVITIES: ReadonlyArray<Activity> = [
  { n: "01", title: "Idea sprint", body: "The room picks a travel topic. Together we generate authority asset ideas the travel press would actually want to cover." },
  { n: "02", title: "Spot the slop", body: "We put an AI draft next to a human one. The room calls which is which, and we pull apart the tells that give AI away." },
  { n: "03", title: "Pitch clinic", body: "We review attendees’ real pitches live, then rebuild the weak ones on the spot." },
];

type Audience = { t: string; body: string; want: string };
const AUDIENCES: ReadonlyArray<Audience> = [
  { t: "Travelers", body: "Trip planning now starts with a question to ChatGPT, Gemini or Perplexity, in English or Arabic, and travelers trust editorial coverage and reviews far more than a destination's own ads.", want: "A place worth going, vouched for by sources they trust." },
  { t: "Search engines", body: "Google still routes a huge share of travel demand, now through AI Overviews as well as classic results, weighing links, mentions and expertise signals to decide which destinations rank.", want: "Authority signals from independent travel media." },
  { t: "Generative engines", body: "LLMs and AI search, from ChatGPT to Perplexity, assemble travel answers from the coverage they trust, so they surface destinations and hotels with genuine authority.", want: "To cite the most trusted, most mentioned source." },
];

const RETURNS: ReadonlyArray<[string, string, string]> = [
  ["01", "Reputation", "Media mentions signal authority to travelers, trade partners and search engines at the same time."],
  ["02", "Visibility", "Editorial coverage reaches travelers no ad budget can reliably touch."],
  ["03", "Bookings", "Third party validation turns wish-list interest into booked trips faster than owned content can."],
  ["04", "Brand Equity", "Consistent coverage compounds into a destination brand that commands premium positioning."],
  ["05", "Magnetism", "Press begets press. Travel journalists cite sources other journalists have already cited."],
  ["06", "Liberty", "A media backed travel brand earns pricing power, category leadership, and freedom from paid ads."],
];

const STAGES_TRAVEL: ReadonlyArray<[string, string, string]> = [
  ["01", "Signal", "The topics about to break that a destination or travel brand can ride early."],
  ["02", "Authority Content", "The research, surveys, AI apps and data tools that earn travel coverage."],
  ["03", "Verify", "Keeping every claim brand-safe and traceable to a real source before anything ships."],
  ["04", "Match", "The right journalists, the right stories, the right beats."],
  ["05", "Pitch", "The outreach itself, briefed and reviewed by a human."],
  ["06", "Attribute", "The demand signals coverage moves, from AI share of voice to branded search and traffic, in a zero-click world."],
];

const TAKEAWAYS: ReadonlyArray<string> = [
  "Audit what AI assistants currently say about your destination, hotel, or brand.",
  "Earn the coverage AI models actually cite.",
  "Run a full earned media pipeline with AI, brand-safe and no code, every claim traceable to a real source.",
  "Track what actually moves in a zero-click world: whether AI recommends you, your share of voice, and the branded search and traffic coverage lifts.",
];

const FAILURES: ReadonlyArray<string> = [
  "It still fabricates and over claims. Verification is not optional.",
  "It cannot build a real relationship with a journalist.",
  "It misreads nuance, timing and embargoes.",
  "It cannot make the judgment call on what is genuinely newsworthy.",
];

const QA: ReadonlyArray<[string, string]> = [
  ["01", "Which jobs of a travel PR team can AI agents genuinely run today, and where do they still fail?"],
  ["02", "How do you pair AI with human judgment so the work earns the trust of journalists, travelers, LLMs and AI search?"],
  ["03", "Why do LLMs and AI search now decide which destinations and travel brands get seen, and what do they reward?"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["22", "years in marketing, as an operator"],
  ["1.5M", "organic visitors grown, Ridester"],
  ["04", "countries hosted on stage"],
  ["500+", "biggest live audience"],
];

const TRAVEL_STATS: ReadonlyArray<[string, string]> = [
  ["80%", "of travelers now research and plan trips with AI tools"],
  ["262M", "international Muslim travel arrivals projected by 2030, from ~196M in 2025"],
  ["$310B", "projected annual Muslim travel spend by 2030"],
  ["~40%", "of US travelers used AI to plan trips in 2025, up 11 points in a year"],
];

type Fmt = { t: string; meta: string; body: string };
const FORMATS: ReadonlyArray<Fmt> = [
  { t: "Keynote", meta: "30–45 min + Q&A · up to 500+", body: "A fast, story-led mainstage talk with a live “what does AI say about your destination?” moment. Best to open or close a track." },
  { t: "Interactive workshop", meta: "90 min to half day · capped ~20–40", body: "The full working session: idea sprint, spot-the-slop, and a live pitch clinic on the room’s real pitches. Best as a hands-on breakout." },
  { t: "Panel or fireside", meta: "30–45 min · any size", body: "I bring the live data and the contrarian takes; you bring the moderator and co-panelists. Best for a debate on AI, PR and destination marketing." },
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
const btnGhostDark = { ...btnBase, background: "transparent", color: INK, border: `1px solid ${INK}` };

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 64, paddingBottom: 70 }}>
    <div style={{ marginBottom: 20 }}>
      <DoubleRule />
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "10px 0 6px", flexWrap: "wrap" }}>
        <Pill size={11} ls="0.18em">Travel Edition</Pill>
        <SCaps size={11.5} ls="0.22em" color={INK}>Keynote · Interactive Workshop · Panel</SCaps>
        <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
        <SCaps size={11} ls="0.18em" color={INK55}>Vol. XV · The AI Desk · Travel</SCaps>
      </div>
      <div style={{ marginTop: -1, borderTop: `1px solid ${INK}` }} />
    </div>

    <div className="emai-hero">
      {/* Left — the headline */}
      <div>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(38px, 6.4vw, 70px)", color: INK, lineHeight: 0.98, letterSpacing: "-0.028em" }}>
          When Travelers Ask <Mark>ChatGPT</Mark>
          <br />
          <span style={{ fontStyle: "italic" }}>Where to Go</span>
        </h1>
        <p style={{ margin: "26px 0 0", fontFamily: SERIF, fontSize: "clamp(18px, 2.4vw, 23px)", color: INK, lineHeight: 1.5, maxWidth: 620 }}>
          Trip planning now starts with a question to ChatGPT, Gemini or Perplexity, in English or Arabic: where to go in Saudi Arabia, whether AlUla is worth it, where to stay on the Red Sea. The answers are built from earned media: the coverage, reviews, and authority content the models trust. A destination or hotel missing from that coverage is missing from the answer.
        </p>
        <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 620 }}>
          The travel edition of the flagship session{" "}
          <a href="/speaking/earned-media-ai" style={{ color: INK, fontStyle: "italic" }}>Earned Media in the Age of AI</a>, tuned for Saudi tourism and the brands connecting the Kingdom with the world, using real data from the earned media OS I built and run.
        </p>
        <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={btnInk}>Invite me to speak &rarr;</a>
          <a href="/contact" style={btnGhostDark}>Ask about this session &rarr;</a>
        </div>
        <p style={{ margin: "24px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: INK70, lineHeight: 1.5 }}>
          By Syed Irfan Ajmal · Founder of EMOS · Previously on stage at Arabian Travel Market Dubai.
        </p>
      </div>

      {/* Right — the session desk */}
      <aside style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "24px 24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SCaps size={10.5} ls="0.18em" color={INK55}>Session Desk</SCaps>
          <Pill size={10} ls="0.18em">KSA Ready</Pill>
        </div>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 21, lineHeight: 1.2, color: INK, fontWeight: 700 }}>
          Get covered, get found, get bookings.
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

// ─── §01 · The Coverage Flywheel ──────────────────────────────────────────────

const Flywheel = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="01" label="The Payoff · The Coverage Flywheel" />
    <div style={{ maxWidth: 720, margin: "0 auto 8px", textAlign: "center" }}>
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.02, letterSpacing: "-0.025em" }}>
        One asset. One placement. <span style={{ fontStyle: "italic" }}>Six compounding returns.</span>
      </h2>
      <p style={{ margin: "16px auto 0", fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 620 }}>
        A single authority asset and a single piece of travel coverage do not stop at the placement. They compound around a six part flywheel. Spin it long enough and it starts turning on its own, because journalists cite sources other journalists have already cited.
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

// ─── §02 · The Shift ──────────────────────────────────────────────────────────

const Shift = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 84, paddingBottom: 84 }}>
    <SectionMast n="02" label="The Shift · Why this, why now" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        AI changed how trips are planned.
        <br />
        <span style={{ fontStyle: "italic" }}><Mark>And how coverage is earned.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        A credible mention in media travelers already trust keeps selling a destination long after it goes live, and it makes the next mention easier to get. AI has just changed earned media from both sides at once: how travelers find you, and how the coverage gets earned.
      </p>
    </div>
    <div className="emai-split">
      <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "28px 26px" }}>
        <SCaps size={10.5} ls="0.18em" color={BLUE}>Demand side</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          LLMs and AI search now decide which destinations get seen.
        </h3>
        <HRule style={{ margin: "16px 0", background: INK35 }} />
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 16, color: INK70, lineHeight: 1.6 }}>
          And they reward exactly what earned media produces: authoritative coverage, citations, and genuine expert content.
        </p>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "28px 26px" }}>
        <SCaps size={10.5} ls="0.18em" color={YEL}>Supply side</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: PAPER, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          AI agents can now do the core jobs of a PR team.
        </h3>
        <HRule style={{ margin: "16px 0", background: "rgba(241,235,222,.35)" }} />
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.75)", lineHeight: 1.6 }}>
          The work of earning travel coverage breaks into six stages. Each one now has an AI agent doing the heavy lifting, with a human deciding at every gate.
        </p>
      </div>
    </div>
  </section>
);

// ─── The Shift · in numbers ───────────────────────────────────────────────────

const ShiftStats = () => (
  <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 56, paddingBottom: 52 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
      <SCaps size={11} ls="0.22em" color={YEL}>The Shift · In numbers</SCaps>
      <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.2)", minWidth: 40 }} />
    </div>
    <div className="emai-stats" style={{ background: "rgba(241,235,222,.22)", border: "1px solid rgba(241,235,222,.22)" }}>
      {TRAVEL_STATS.map(([v, l]) => (
        <div key={l} style={{ background: INK, padding: "24px 20px" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 5vw, 46px)", color: YEL, lineHeight: 1, letterSpacing: "-0.02em" }}>{v}</div>
          <div style={{ marginTop: 10 }}>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: "rgba(241,235,222,.78)", lineHeight: 1.45 }}>{l}</span>
          </div>
        </div>
      ))}
    </div>
    <p style={{ margin: "16px 0 0", fontFamily: GROT, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(241,235,222,.5)" }}>
      Sources: Mastercard &amp; CrescentRating, Global Muslim Travel Index 2026 · Phocuswright, 2025
    </p>
  </section>
);

// ─── §03 · Demand Side ────────────────────────────────────────────────────────

const Demand = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 84, paddingBottom: 84 }}>
    <SectionMast n="03" label="Demand Side · Who gets seen now" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        AI travel answers reward
        <br />
        <span style={{ fontStyle: "italic" }}><Mark>what earned media produces.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Ask an AI assistant to plan a week in Saudi Arabia, AlUla to the Red Sea to Diriyah, and ChatGPT, Gemini, Perplexity and Google&rsquo;s AI Overviews assemble the answer from sources they trust: travel press, guides, reviews, expert commentary, in English and Arabic. Earn that coverage once and it pays out to travelers, to search, and to the machines that cite you, at the same time.
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
    <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.5, maxWidth: 880 }}>
      Why AI rewards this: about 83% of AI citations point to third-party sources rather than brand-owned pages (Analyze, 83,670 citations); branded mentions are the strongest correlate of Google AI Overview visibility, roughly 3x backlinks (Ahrefs, 75,000 brands); and adding credible citations lifts generative-engine visibility 30 to 40% (Princeton GEO study).
    </p>
  </section>
);

// ─── §04 · The Earned Media Pipeline (travel terms) ───────────────────────────

const Pipeline = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="04" label="Supply Side · The Earned Media Pipeline" />
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        Six jobs that used to need a team.
        <br />
        <span style={{ fontStyle: "italic" }}>AI can now run every one. None of them without a human.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Each stage maps to a tool in the earned media system I built and run, so the session runs on live data, not slideware. No product pitch: you leave with the method, not a demo. Below the pipeline: the same six stages in travel terms.
      </p>
    </div>
    <PipelineFlowV2 />
    <div className="emai-returns">
      {STAGES_TRAVEL.map(([n, name, desc]) => (
        <div key={n}>
          <span style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", color: BLUE, marginBottom: 4 }}>{n}</span>
          <span style={{ display: "block", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, marginBottom: 6 }}>{name}</span>
          <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55 }}>{desc}</span>
        </div>
      ))}
    </div>
    <div style={{ margin: "34px auto 0", maxWidth: 760, border: `1px solid ${INK}`, borderLeft: `3px solid ${YEL}`, background: PAPER, padding: "22px 26px" }}>
      <SCaps size={10.5} ls="0.18em" color={BLUE}>A word on measurement · the zero-click era</SCaps>
      <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 16.5, color: INK, lineHeight: 1.6 }}>
        In a multi-platform, largely zero-click journey, no one can honestly draw a clean line from one article to one booking, and any vendor who promises that is selling you something. What you can track, and what this session sets up: whether AI assistants actually recommend you, your share of voice against rivals, and the demand signals coverage moves, from branded search to direct and referral traffic. Leading indicators you can act on, not vanity clippings.
      </p>
    </div>
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
      <PitchClinicDemoTravel />
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

// ─── The Saudi Angle · Vision 2030 band ───────────────────────────────────────

const SaudiAngle = () => (
  <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 64, paddingBottom: 64, borderTop: `1px solid ${INK}` }}>
    <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={YEL}>The Saudi Angle · Vision 2030</SCaps>
      <h2 style={{ margin: "16px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px, 4.4vw, 44px)", color: PAPER, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
        Earned media is how the Kingdom&rsquo;s tourism story
        <br />
        <span style={{ fontStyle: "italic", color: YEL }}>reaches the world.</span>
      </h2>
      <p style={{ margin: "18px auto 0", fontFamily: SERIF, fontSize: 17.5, color: "rgba(241,235,222,.75)", lineHeight: 1.6, maxWidth: 640 }}>
        From AlUla and Diriyah to the Red Sea and NEOM, Vision 2030 set the goal. AI search now decides which destinations travelers hear about. The travel brands that earn trusted coverage will be the ones the answers cite.
      </p>
    </div>
  </section>
);

// ─── §07 · Q&A ────────────────────────────────────────────────────────────────

const QandA = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84 }}>
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
        Syed Irfan Ajmal is a serial entrepreneur and the founder of EMOS, an AI powered earned media operating system. He has led DMR.agency since 2013, serving 300+ clients, mostly American brands, along with work for a Gulf government through DinarStandard in Dubai. He grew Ridester, a US transport publication, from zero to 1.5M monthly organic visitors, and his stages include Arabian Travel Market Dubai, DMSS Bali, and MaGIC Malaysia.
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
    <figure style={{ margin: "0 auto", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}`, maxWidth: 900 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/speaking/dmss-irfan-large-audience.jpg"
        alt="Syed Irfan Ajmal speaking to a large live audience at DMSS Conference, Bali"
        style={{ width: "100%", height: "auto", display: "block", border: "1px solid rgba(250,250,250,.25)", maxHeight: 380, objectFit: "cover", objectPosition: "center 30%" }}
      />
      <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#FAFAFA", lineHeight: 1.4 }}>
          DMSS Conference, Bali · Same live-room energy this session is built for, 500+ attendees.
        </div>
        <SCaps size={10} ls="0.16em" color="rgba(250,250,250,.55)">Photo by dmss.io</SCaps>
      </figcaption>
    </figure>
  </section>
);

// ─── Formats · three ways to run it ───────────────────────────────────────────

const Formats = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 84, paddingBottom: 84, borderTop: `1px solid ${INK}` }}>
    <div className="emai-intro">
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4.6vw, 46px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
        One session,
        <br />
        <span style={{ fontStyle: "italic" }}><Mark>three ways to run it.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.6, maxWidth: 560 }}>
        Same content, tuned to your room. Every format is built for Saudi tourism and Vision 2030, and runs in person or virtual, in English. Tell me the slot and the audience, and I will tell you which fits.
      </p>
    </div>
    <div className="emai-cards3">
      {FORMATS.map((f) => (
        <div key={f.t} style={{ border: `1px solid ${INK}`, background: PAPER, padding: "24px 22px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK, lineHeight: 1.15 }}>{f.t}</h3>
          <div style={{ marginTop: 8 }}><SCaps size={10} ls="0.12em" color={BLUE}>{f.meta}</SCaps></div>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55, flex: 1 }}>{f.body}</p>
        </div>
      ))}
    </div>
    <p style={{ margin: "26px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK70, lineHeight: 1.5, textAlign: "center" }}>
      Not sure which? Send the event, the slot and the audience, and I will recommend the format that moves your metric.
    </p>
  </section>
);

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

const BottomCTA = () => (
  <section id="invite" className="sx" style={{ background: YEL, paddingTop: 72, paddingBottom: 72 }}>
    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={INK}>Two ways in</SCaps>
      <h2 style={{ margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 5.5vw, 54px)", color: INK, lineHeight: 1.0, letterSpacing: "-0.028em" }}>
        Bring this session to your travel stage.
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

export default function EarnedMediaAITravelPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <Hero />
      <Flywheel />
      <Shift />
      <ShiftStats />
      <Demand />
      <Pipeline />
      <Activities />
      <LeaveWith />
      <SaudiAngle />
      <QandA />
      <Speaker />
      <SpeakerPhotoStrip />
      <Formats />
      <BottomCTA />
      <CTATicker />
      <Subscriptions sectionNumber="09" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

"use client";

/**
 * SignalIQ — About the data & methodology
 * /tools/signaliq/about
 *
 * Non-prediction disclosure, source documentation, scoring methodology,
 * and beta transparency notes. Linked from the (i) icons and the footer.
 */

import Link from "next/link";
import {
  GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";
import { DoubleRule, HRule, SCaps } from "@/components/bureau/primitives";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { BEATS } from "@/lib/signaliq/config";

const HDR_BG = "#0e0d0a";
const HDR_BORDER = "#2a2318";
const GREEN = "#3e6b45";
const AMBER = "#d99211";

const SOURCES = [
  {
    name: "SEC EDGAR",
    type: "Federal Filings",
    role: "Signal",
    credibility: "95%",
    description:
      "The SEC's full-text search index (EFTS). SignalIQ counts how many filings mention a keyword in the past 30 days and compares that to the prior-month baseline. A surge in disclosures — earnings calls, 10-Ks, 8-Ks — often precedes mainstream press coverage by days to weeks. Federal-grade, primary-source data: corporations are legally required to disclose material information, so these signals carry real weight.",
    url: "https://efts.sec.gov/LATEST/search-index?q=%22keyword%22&dateRange=custom&startdt=2024-01-01",
    commercial: "Public domain — US government data.",
  },
  {
    name: "GDELT DOC 2.0",
    type: "Global News Monitor",
    role: "Coverage denominator",
    credibility: "80%",
    description:
      "GDELT indexes virtually every news article published online worldwide. SignalIQ uses it as the coverage denominator: if a topic appears in 0.3% of all global news, it has moderate coverage. The Coverage Gap score is the difference between signal volume (primary sources) and coverage volume (news). A wide gap means a real story is emerging that journalists haven't caught up to yet.",
    url: "https://gdeltproject.org",
    commercial: "Open, free global news-data project. Attribution appreciated.",
  },
  {
    name: "arXiv",
    type: "Academic Preprints",
    role: "Signal",
    credibility: "80%",
    description:
      "arXiv hosts academic preprints — research papers published before peer review. Academic preprint volume is a leading indicator: research attention typically precedes mainstream press coverage by weeks to months. SignalIQ counts paper submissions matching a keyword in the past 30 days. We use only metadata (title, date, link) — not full paper text.",
    url: "https://arxiv.org",
    commercial: "Metadata freely reusable under arXiv's API terms.",
  },
  {
    name: "Wikipedia",
    type: "Edit-Surge Detector",
    role: "Signal",
    credibility: "65%",
    description:
      "Wikipedia's pageview API returns daily view counts for any article. A spike in views — especially across a cluster of related articles — reveals when a topic is being actively researched en masse. This often precedes journalist interest by one to three weeks: journalists research before they write. We use view counts only, not article text.",
    url: "https://wikimedia.org/api/rest_v1/",
    commercial: "View counts are open data, freely usable.",
  },
  {
    name: "Hacker News",
    type: "Tech Forum Velocity",
    role: "Signal",
    credibility: "55%",
    description:
      "Hacker News's Algolia API surfaces stories and comments. SignalIQ measures points and comment velocity for the top matching stories in the past 30 days. HN skews toward tech, SaaS, and AI stories — it's a leading indicator for those beats but a lagging one for health, climate, or fintech stories where the community is smaller.",
    url: "https://hn.algolia.com/api",
    commercial: "Free, public API.",
  },
];

const SCORE_COMPONENTS = [
  { label: "Coverage gap", weight: "30%", description: "How thin is press coverage relative to signal volume? The bigger the gap, the bigger the opportunity window. This is the heaviest component." },
  { label: "Signal magnitude", weight: "25%", description: "Raw volume of signals — filing counts, paper counts, view counts. More signal = more real activity." },
  { label: "Signal velocity", weight: "22%", description: "How fast is signal volume growing? A topic with 10 filings this month vs. 1 last month scores higher than one steady at 50." },
  { label: "Beat fit", weight: "13%", description: "How closely does this topic match the selected beat? Prevents off-topic results from surfacing high." },
  { label: "Source credibility", weight: "10%", description: "Weighted average credibility of the sources that returned data. An SEC-only signal scores higher than a Hacker News–only signal." },
  { label: "Corroboration bonus", weight: "+15% max", description: "A bonus added when multiple independent sources confirm the same topic. One source is a hint. Three is a story." },
];

export default function SignalIQAboutPage() {
  return (
    <>
      <style>{`
        .about-section { padding: 0 clamp(22px,5vw,56px); margin-bottom: 48px; max-width: 860px; }
        .about-table { width: 100%; border-collapse: collapse; }
        .about-table th, .about-table td { padding: 10px 12px; border: 1px solid rgba(26,20,16,.12); font-family: ${SERIF}; font-size: 14px; color: ${INK70}; text-align: left; vertical-align: top; }
        .about-table th { font-family: ${GROT}; font-size: 9.5px; letter-spacing: .10em; text-transform: uppercase; color: ${INK55}; background: ${PAPER2}; font-weight: 700; }
      `}</style>

      {/* Header */}
      <header style={{ background: HDR_BG, borderBottom: `1px solid ${HDR_BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(20px,4vw,28px)", height: 52, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: YEL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 11, color: INK }}>SIA</div>
          </Link>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: PAPER, letterSpacing: "-0.01em" }}>
            Signal<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
          </span>
          <div style={{ width: 1, height: 18, background: "rgba(241,235,222,.12)", margin: "0 2px" }} />
          <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(241,235,222,.25)" }}>
            About the data
          </span>
        </div>
        <Link href="/tools/signaliq" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>
          ← Back to SignalIQ
        </Link>
      </header>

      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>

        {/* Hero */}
        <section style={{ padding: "clamp(32px,5vw,56px) clamp(22px,5vw,56px) 0" }}>
          <SCaps size={10.5} ls="0.24em" color={INK55}>SignalIQ · Methodology & Data Sources</SCaps>
          <h1 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px,5vw,56px)", lineHeight: 1.0, letterSpacing: "-0.03em", color: INK }}>
            How SignalIQ works.<br />
            <em style={{ fontStyle: "italic", color: INK55 }}>What it measures. What it doesn&rsquo;t.</em>
          </h1>
          <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(15px,1.8vw,19px)", color: INK70, lineHeight: 1.55, maxWidth: 680 }}>
            SignalIQ is a signal-vs-coverage gap detector, not a prediction engine.
            It tells you where primary-source activity is surging ahead of press coverage —
            not whether a story will break. Every score links back to verifiable, open data.
          </p>
          <DoubleRule style={{ marginTop: 32 }} />
        </section>

        {/* § 01 — The honest disclaimer */}
        <section className="about-section" style={{ marginTop: 36 }}>
          <SCaps size={10} ls="0.16em" color={INK}>§ 01 · What the scores mean</SCaps>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            A score of 85/100 does not mean there is an 85% chance this story breaks in the press.
            It means this topic has a high signal-to-coverage gap right now: a lot of activity in
            primary sources (filings, papers, forum discussion) relative to how much the press has
            covered it. That gap is your opportunity window — not a guarantee.
          </p>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            Stories with high scores can go nowhere. Stories with low scores can explode overnight.
            SignalIQ gives you a data-backed starting point for your pitch research — the judgment
            call of whether and how to pitch is still yours.
          </p>
          <div style={{ marginTop: 20, padding: "16px 20px", borderLeft: `3px solid ${AMBER}`, background: "rgba(217,146,17,.06)" }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK70, lineHeight: 1.55 }}>
              <strong style={{ fontStyle: "normal", color: INK }}>The badge = lead/whitespace score.</strong>{" "}
              Think of it as &ldquo;how far ahead of the coverage are you?&rdquo; — not &ldquo;how likely is this to get covered?&rdquo;
            </p>
          </div>
        </section>

        <HRule style={{ margin: "0 clamp(22px,5vw,56px) 36px" }} />

        {/* § 02 — Data sources */}
        <section className="about-section">
          <SCaps size={10} ls="0.16em" color={INK}>§ 02 · Data sources</SCaps>
          <p style={{ margin: "12px 0 24px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            SignalIQ pulls from five open, primary-source databases. No paywalled data. No stale training data.
            Every signal links back to its original source — you can click through and verify anything we surface.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {SOURCES.map((src) => (
              <div key={src.name} style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: INK, textDecoration: "none" }}>
                    {src.name} ↗
                  </a>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>{src.type}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: src.role === "Coverage denominator" ? AMBER : GREEN, border: `1px solid ${src.role === "Coverage denominator" ? AMBER : GREEN}`, padding: "1px 5px" }}>
                    {src.role}
                  </span>
                  <span style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: INK55 }}>Credibility: {src.credibility}</span>
                </div>
                <p style={{ margin: "0 0 10px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>{src.description}</p>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 9, color: INK35, letterSpacing: ".06em" }}>Commercial use: {src.commercial}</p>
              </div>
            ))}
          </div>
        </section>

        <HRule style={{ margin: "0 clamp(22px,5vw,56px) 36px" }} />

        {/* § 03 — Scoring */}
        <section className="about-section">
          <SCaps size={10} ls="0.16em" color={INK}>§ 03 · How the score is calculated</SCaps>
          <p style={{ margin: "12px 0 24px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            The opportunity score is a weighted composite across five components, with a corroboration bonus
            added on top. Coverage gap carries the most weight — the whole premise of SignalIQ is that the
            gap between signal and press coverage is the opportunity.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${INK15}` }}>
            {SCORE_COMPONENTS.map((c, i) => (
              <div key={c.label} style={{ display: "flex", gap: 16, padding: "14px 18px", borderTop: i > 0 ? `1px solid ${INK15}` : "none", background: i % 2 === 0 ? PAPER : PAPER2, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: INK, minWidth: 140 }}>{c.label}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: YEL, minWidth: 50 }}>{c.weight}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, lineHeight: 1.5, flex: 1 }}>{c.description}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "14px 18px", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".06em", color: INK55, lineHeight: 1.6 }}>
              BAND THRESHOLDS: Hot lead ≥ 80 · Worth a look 60–79 · Early 40–59 · Noise / late &lt; 40
            </p>
          </div>
        </section>

        <HRule style={{ margin: "0 clamp(22px,5vw,56px) 36px" }} />

        {/* § 04 — Beta transparency */}
        <section className="about-section">
          <SCaps size={10} ls="0.16em" color={INK}>§ 04 · Beta transparency — what we hardcoded and why</SCaps>

          <p style={{ margin: "12px 0 16px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            SignalIQ is in beta. Two deliberate limitations are worth knowing about.
          </p>

          <div style={{ marginBottom: 24, padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: INK, marginBottom: 10 }}>
              20 seeds per beat
            </div>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>
              Each beat scans 20 pre-written search phrases (seeds) across all five data sources. For example,
              the Health &amp; Wellness beat searches for &ldquo;GLP-1 drugs&rdquo;, &ldquo;chronic disease management&rdquo;,
              &ldquo;clinical AI&rdquo;, and 17 others. The results you see are drawn from these 20 topics only.
            </p>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>
              We chose 20 because it balances coverage with cost and speed. Fewer seeds meant too many gaps
              (the original v1 had only 5). More seeds means slower scans and harder-to-audit results.
              The seeds are hand-curated by journalists and PR practitioners who cover each beat.
            </p>
            <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, lineHeight: 1.5 }}>
              This is intentional for the beta. In a future version, pro users will be able to add custom seeds
              for their specific niche — but we wanted to ship a reliable, auditable tool first.
            </p>
          </div>

          <div style={{ marginBottom: 24, padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: INK, marginBottom: 10 }}>
              5 beat categories
            </div>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>
              SignalIQ currently covers five beats: {BEATS.map(b => b.label).join(", ")}.
              These were chosen because they represent the highest-volume PR beats for the startup and scale-up
              companies most likely to use this tool.
            </p>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>
              The &ldquo;right&rdquo; beat for your company is not always your industry — it&rsquo;s the vertical your
              target journalists cover. A health-AI company should usually choose Health &amp; Wellness,
              not SaaS, unless the story is about the startup itself (a funding round, a product launch
              to tech press).
            </p>
            <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, lineHeight: 1.5 }}>
              More beats (Legal &amp; Policy, Consumer, Media &amp; Publishing, etc.) are planned for future versions.
              If you need a beat that isn&rsquo;t here,{" "}
              <a href="/contact" style={{ color: INK, textDecorationColor: "rgba(26,20,16,.35)" }}>let us know</a>.
            </p>
          </div>

          <div style={{ padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: INK, marginBottom: 10 }}>
              Your startup context — what it does and doesn&rsquo;t do
            </div>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: INK70 }}>
              Adding your startup context re-ranks the scan results by keyword relevance to your description,
              and personalises the pitch angle in your asset pack. It does not change what topics are scanned.
            </p>
            <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, lineHeight: 1.5 }}>
              We deliberately kept the scan beat-wide. A tool that only surfaces topics directly matching
              your company description would miss adjacent opportunities — often the most interesting ones.
              The market radar should be broader than your current pitch list.
            </p>
          </div>
        </section>

        <HRule style={{ margin: "0 clamp(22px,5vw,56px) 36px" }} />

        {/* § 05 — Data use */}
        <section className="about-section">
          <SCaps size={10} ls="0.16em" color={INK}>§ 05 · How we use your data</SCaps>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            SignalIQ collects your email address (if you choose to unlock more scans) and the startup context
            you optionally provide. We use your email to send SIA&rsquo;s earned-media newsletter and to manage
            your scan quota. We do not sell your data or share it with third parties. Your startup context
            is used only to generate your asset pack and is not stored beyond the current session.
          </p>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: INK70 }}>
            Unsubscribe from the newsletter at any time via the link in any email.
            For the full policy, see our{" "}
            <Link href="/privacy" style={{ color: INK, textDecorationColor: "rgba(26,20,16,.35)" }}>Privacy Policy</Link>.
          </p>
        </section>

        <HRule style={{ margin: "0 clamp(22px,5vw,56px) 48px" }} />

        {/* Back link */}
        <div style={{ padding: "0 clamp(22px,5vw,56px) 56px" }}>
          <Link
            href="/tools/signaliq"
            style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".10em", textTransform: "uppercase", color: INK, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", border: `2px solid ${INK}` }}
          >
            ← Back to SignalIQ
          </Link>
        </div>

        <ToolPipelineFooter currentTool="signaliq" />
      </div>
    </>
  );
}

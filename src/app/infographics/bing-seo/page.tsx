import React from "react";
import { Colophon, Subscriptions } from "@/components/bureau";
import { HRule, Mark, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
import {
  BLUE,
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  MONO,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// =========================================================================
// How to Win on Bing | And the AI Answer Engines It Feeds
// 2026 guide + interactive infographic. Replaces the restored 2015 guide,
// which now lives at /infographics/bing-seo-2015.
//
// Built server-rendered with native <details> cards: every stat, source and
// caveat is real text in the initial HTML, readable with JavaScript off.
// That is deliberate. This page follows its own advice (see section 5):
// Bing renders JS less reliably than Google, so the content does not hide
// behind a script.
//
// Em-dash policy: all original copy uses no em/en dashes ( | in the title,
// : before explanations, , for asides, - in ranges ). The one en-dash is
// inside a Microsoft blog post's verbatim title in the references.
// =========================================================================

// ─── Categories (colour-coded card tags + legend) ────────────────────────────
const CATS: Record<string, { label: string; color: string }> = {
  reach:   { label: "Reach",          color: BLUE },
  index:   { label: "Index plumbing", color: "#1f5b3a" },
  aeo:     { label: "AI visibility",  color: "#6e3c8a" },
  measure: { label: "Measurement",    color: "#a4441a" },
};

interface Card {
  n: string;
  cat: keyof typeof CATS;
  stat: string;
  label: string;
  take: string;
  source: string;
  todo: string;
}

// ─── The 10 data points (from the brief's 12 candidates; see drop note) ───────
const CARDS: Card[] = [
  {
    n: "01", cat: "reach", stat: "10-12%",
    label: "of worldwide DESKTOP search runs on Bing, vs about 5% blended and under 1% on mobile.",
    take: "Don't judge Bing by the blended number: it's a desktop game.",
    source: "StatCounter, May 2026 · DemandSage, Dec 2025",
    todo: "Check your GA4 desktop segment before writing Bing off.",
  },
  {
    n: "02", cat: "index", stat: "Copilot = Bing",
    label: "Microsoft Copilot runs on the Bing index.",
    take: "Optimizing for Bing IS optimizing for Copilot.",
    source: "Microsoft Bing Blog, Apr 2025",
    todo: "Verify and submit your site in Bing Webmaster Tools.",
  },
  {
    n: "03", cat: "index", stat: "1 of 2",
    label: "OpenAI names Bing as one of two ChatGPT search providers, alongside its own OAI-SearchBot crawler.",
    take: "ChatGPT's web layer leans partly on Bing.",
    source: "OpenAI Help Center, 2025-26",
    todo: "Don't block Bingbot or OAI-SearchBot: stay indexable in both.",
  },
  {
    n: "04", cat: "aeo", stat: "~10%",
    label: "Bing Copilot's cited sources overlap Google's AI Overviews only about 10% (Perplexity ~12%, ChatGPT ~14%).",
    take: "Each AI engine cites a different web: there is no single 'AI rank.'",
    source: "SE Ranking, Apr 2025",
    todo: "Optimize per engine; don't assume a Google rank equals an AI citation.",
  },
  {
    n: "05", cat: "aeo", stat: "0.66 vs 0.22",
    label: "Brand mentions correlate with AI visibility about 0.66; raw backlinks only about 0.22.",
    take: "For AI, being talked about beats being linked to.",
    source: "Ahrefs, 2025",
    todo: "Invest in digital PR and brand mentions, not just link volume.",
  },
  {
    n: "06", cat: "aeo", stat: "~0.74",
    label: "YouTube mentions are the single strongest correlate of AI visibility.",
    take: "Video presence feeds what the models recall.",
    source: "Ahrefs (75k brands), Dec 2025",
    todo: "Get your brand named in and on relevant YouTube content.",
  },
  {
    n: "07", cat: "aeo", stat: "76% → 38%",
    label: "AI Overview citations pulled from Google's top 10 fell from 76% to 38% in about eight months.",
    take: "A high Google rank no longer guarantees an AI citation.",
    source: "Ahrefs, Jul 2025 to Mar 2026",
    todo: "Write extractable, quotable answers, not just rank-chasing pages.",
  },
  {
    n: "08", cat: "index", stat: "5 engines, not Google",
    label: "IndexNow pings Bing, Yandex, Naver, Seznam and Yep instantly. Google doesn't support it.",
    take: "You can push to Bing in seconds instead of waiting for a crawl.",
    source: "IndexNow.org · Microsoft, 2021-2025",
    todo: "Turn on IndexNow (Cloudflare, Yoast, or RankMath).",
  },
  {
    n: "09", cat: "measure", stat: "<1%, +357%",
    label: "AI sends under 1% of referral traffic but grew about 357% YoY (~1.13B vs Google's 191B per month).",
    take: "AI traffic is tiny today but compounding fast.",
    source: "BrightEdge, Sep 2025 · SimilarWeb, Jul 2025",
    todo: "Start tracking AI referrers in GA4 now to set a baseline.",
  },
  {
    n: "10", cat: "measure", stat: "~68%",
    label: "of US Google searches end with zero clicks; AI Overviews cut top-spot CTR about 58%.",
    take: "Visibility is not clicks: answers, not just links, win.",
    source: "SparkToro / SimilarWeb, 2026 · Ahrefs, Feb 2026",
    todo: "Optimize to BE the cited answer; track impressions and citations, not only clicks.",
  },
];

// ─── AI engine -> index source map (only what the brief verified) ─────────────
interface EngineRow {
  engine: string;
  source: string;
  tag: string;
  tagColor: string;
  note: string;
}
const ENGINES: EngineRow[] = [
  {
    engine: "Microsoft Copilot",
    source: "Bing index",
    tag: "Definitive",
    tagColor: "#1f5b3a",
    note: "Grounding uses the same crawlers and quality signals as Bing search.",
  },
  {
    engine: "ChatGPT",
    source: "Bing (named provider) + OpenAI's own OAI-SearchBot crawler",
    tag: "Hybrid",
    tagColor: BLUE,
    note: "Bing is officially named; OpenAI also runs its own crawler. The full mix is partly undisclosed.",
  },
  {
    engine: "Perplexity",
    source: "Mostly its own index (PerplexityBot)",
    tag: "Bing reliance unclear",
    tagColor: "#a4441a",
    note: "Substantial proprietary crawling; real-time Bing use is contested.",
  },
  {
    engine: "Google AI Overviews / Gemini",
    source: "Google's own index, not Bing",
    tag: "Not Bing",
    tagColor: INK,
    note: "A page must be indexed in Google Search to appear here.",
  },
];

// ─── Measurement checklist ────────────────────────────────────────────────────
const CHECKLIST: { tool: string; desc: string }[] = [
  { tool: "Bing Webmaster Tools", desc: "Track impressions, clicks and positions. Check whether the AI-search performance report is live in your dashboard." },
  { tool: "IndexNow", desc: "Push new and updated URLs to Bing, Yandex, Naver, Seznam and Yep instantly." },
  { tool: "GA4 custom channel", desc: "Match AI referrer hostnames: chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, bing.com." },
  { tool: "Keep it in proportion", desc: "AI is under 1% of referrals today. Watch zero-click and citations, not only clicks." },
];

// ─── Table of contents ────────────────────────────────────────────────────────
const TOC: { n: string; id: string; title: string }[] = [
  { n: "01", id: "infographic", title: "The infographic: 10 data points" },
  { n: "1",  id: "why-bing",    title: "Why Bing still matters in 2026" },
  { n: "2",  id: "ai-layer",    title: "Bing feeds the AI answer layer" },
  { n: "3",  id: "vocabulary",  title: "The new vocabulary: AEO, GEO, AIO, LLM visibility" },
  { n: "4",  id: "since-2015",  title: "What's changed since 2015, and what hasn't" },
  { n: "5",  id: "technical",   title: "Technical foundation: BWT, sitemaps, IndexNow" },
  { n: "6",  id: "on-page",     title: "On-page for Bing and for extraction" },
  { n: "7",  id: "links",       title: "Links in 2026: quality over volume" },
  { n: "8",  id: "earned-media",title: "The earned-media engine" },
  { n: "9",  id: "formats",     title: "Content formats Bing and AI favor" },
  { n: "10", id: "measure",     title: "Measure it: Bing and AI referrals" },
  { n: "11", id: "checklist",   title: "The 2026 Bing and AI checklist" },
  { n: "·",  id: "references",  title: "References" },
];

// ─── References (carried from the guide + the 2 infographic-only sources) ─────
const REFS: { cite: string; url: string }[] = [
  { cite: 'StatCounter Global Stats, "Search Engine Market Share Worldwide" (live, May 2026).', url: "https://gs.statcounter.com/search-engine-market-share" },
  { cite: 'DemandSage (Naveen Kumar), "Bing Statistics 2026" (updated Dec 30, 2025).', url: "https://www.demandsage.com/bing-statistics/" },
  { cite: 'Search Engine Land (Danny Goodwin), "One year later, little change to Microsoft Bing search market share" (Feb 6, 2024).', url: "https://searchengineland.com/one-year-later-little-change-to-microsoft-bing-search-market-share-437238" },
  { cite: 'SparkToro and Datos (Rand Fishkin), "New Research: Search Happens Everywhere" (Mar 2, 2026).', url: "https://sparktoro.com/blog/new-research-search-happens-everywhere-an-analysis-of-41-websites-with-significant-search-activity/" },
  { cite: 'Microsoft Copilot Blog, "Bringing the best of AI search to Copilot" (Nov 7, 2025).', url: "https://www.microsoft.com/en-us/microsoft-copilot/blog/2025/11/07/bringing-the-best-of-ai-search-to-copilot/" },
  { cite: 'Microsoft Bing Search Blog, "Introducing Copilot Search in Bing" (Apr 4, 2025).', url: "https://blogs.bing.com/search/April-2025/Introducing-Copilot-Search-in-Bing" },
  { cite: 'Microsoft AI / Bing, "Evolving role of the index: From ranking pages to supporting answers" (May 6, 2026).', url: "https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers" },
  { cite: 'OpenAI Help Center, "ChatGPT search" (live 2025-26).', url: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
  { cite: 'OpenAI, "Overview of OpenAI crawlers" (OAI-SearchBot).', url: "https://developers.openai.com/api/docs/bots" },
  { cite: 'Wikipedia, "Perplexity AI."', url: "https://en.wikipedia.org/wiki/Perplexity_AI" },
  { cite: 'Google Search Central, "AI features and your website" (updated Dec 10, 2025).', url: "https://developers.google.com/search/docs/appearance/ai-features" },
  { cite: 'Computerworld, "Microsoft more than triples Bing Search API prices" (Feb 21, 2023).', url: "https://www.computerworld.com/article/1618921/microsoft-more-than-triples-bing-search-api-prices-to-recoup-investments.html" },
  { cite: 'Microsoft Learn, "Bing Search API retirement" (retired Aug 11, 2025).', url: "https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement" },
  { cite: 'The Register, "Bing Search APIs retired" (May 15, 2025).', url: "https://www.theregister.com/2025/05/15/bing_search_apis_retired/" },
  { cite: 'PPC Land, "Microsoft ends Bing Search APIs on August 11, alternative costs 40-483% more."', url: "https://ppc.land/microsoft-ends-bing-search-apis-on-august-11-alternative-costs-40-483-more/" },
  { cite: 'SE Ranking, "ChatGPT vs Perplexity vs Google vs Bing" citation-overlap study (Apr 2, 2025).', url: "https://seranking.com/blog/chatgpt-vs-perplexity-vs-google-vs-bing-comparison-research/" },
  { cite: 'Semrush, "ChatGPT Definitely Uses Google to Search the Web" (Adobe-owned; verify date before quoting).', url: "https://www.semrush.com/blog/chatgpt-definitely-uses-google/" },
  { cite: 'Profound, "What is answer engine optimization (AEO)?" (Jan 29, 2026).', url: "https://www.tryprofound.com/resources/articles/what-is-answer-engine-optimization" },
  { cite: 'Wikipedia, "AI Overviews."', url: "https://en.wikipedia.org/wiki/AI_Overviews" },
  { cite: 'Aggarwal et al., "GEO: Generative Engine Optimization," arXiv:2311.09735 (2023; KDD 2024).', url: "https://arxiv.org/abs/2311.09735" },
  { cite: 'SEO Sherpa (Mert Azizoglu), "Bing SEO: How to Optimize for Microsoft Search" (updated May 26, 2026).', url: "https://seosherpa.com/bing-seo/" },
  { cite: 'Search Engine Land (Barry Schwartz), "A deeper dive into more of the Bing Search ranking factors" (Aug 25, 2020).', url: "https://searchengineland.com/a-deeper-dive-into-more-of-the-bing-search-ranking-factors-339714" },
  { cite: 'Search Engine Land, "What Social Signals Do Google & Bing Really Count?"', url: "https://searchengineland.com/what-social-signals-do-google-bing-really-count-55389" },
  { cite: 'Microsoft Bing Webmaster Blog, "IndexNow – Instantly Index your web content" (Oct 18, 2021).', url: "https://blogs.bing.com/webmaster/october-2021/IndexNow-Instantly-Index-your-web-content-in-Search-Engines" },
  { cite: "IndexNow.org, homepage and FAQ.", url: "https://www.indexnow.org/" },
  { cite: 'PPC Land (Luis Rijo), "Google absence from IndexNow raises questions about web indexing standards" (Dec 30, 2024).', url: "https://ppc.land/googles-absence-from-indexnow-raises-questions-about-web-indexing-standards/" },
  { cite: 'Microsoft Bing Webmaster Blog, "Keeping Content Discoverable with Sitemaps in AI Powered Search" (Jul 31, 2025).', url: "https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search" },
  { cite: 'Microsoft Bing Webmaster Blog, "bingbot Series: submitting up to 10,000 URLs per day" (Jan 31, 2019; updated November 2025).', url: "https://blogs.bing.com/webmaster/january-2019/bingbot-Series-Get-your-content-indexed-fast-by-now-submitting-up-to-10,000-URLs-per-day-to-Bing" },
  { cite: 'Bing Webmaster Tools, "Link Building" help.', url: "https://www.bing.com/webmasters/help/link-building-7a3f99b7" },
  { cite: 'Microsoft Bing Webmaster Blog (Canel & Madhavan), "Does Duplicate Content Hurt SEO and AI Search Visibility?" (Dec 19, 2025).', url: "https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility" },
  { cite: 'Ahrefs (Linehan & Guan), "Top Brand Visibility Factors in ChatGPT, AI Mode, and AI Overviews (75k brands)" (Dec 12, 2025).', url: "https://ahrefs.com/blog/ai-brand-visibility-correlations/" },
  { cite: 'Ahrefs, "AI Overviews brand correlation" study (brand mentions 0.664 vs backlinks 0.218).', url: "https://ahrefs.com/blog/ai-overview-brand-correlation/" },
  { cite: 'Semrush (Loktionova with Indig), "Do Backlinks Still Matter in AI Search? [1,000 domains]" (Oct 16, 2025).', url: "https://www.semrush.com/blog/backlinks-ai-search-study/" },
  { cite: 'Search Engine Journal (Matt G. Southern), "Top factors influencing ChatGPT citations" (SE Ranking 129k-domain data, Nov 26, 2025).', url: "https://www.searchenginejournal.com/new-data-top-factors-influencing-chatgpt-citations/561954/" },
  { cite: 'Search Engine Land, "The Brand-to-Links Ratio Revolution" (Duane Forrester quote).', url: "https://searchengineland.com/guide/brand-to-links-ratio-revolution" },
  { cite: 'The Digital Bloom, "2025 AI Visibility Report."', url: "https://thedigitalbloom.com/learn/2025-ai-citation-llm-visibility-report/" },
  { cite: 'Semrush (Loktionova with Indig), "Why 62% of AI citations do not lead to brand mentions" (Jun 9, 2026).', url: "https://www.semrush.com/blog/the-ghost-citations-study/" },
  { cite: 'Bottle Digital PR (Jem Leslie), "How Digital PR is Redefining Brand Visibility" (Jul 11, 2026); underlying PRWeek study.', url: "https://www.wearebottle.com/blog/digital-pr-visibility-llms" },
  { cite: 'Search Engine Land (Danny Goodwin), "AI search drives less than 1% of referrals" (BrightEdge data, Sep 12, 2025).', url: "https://searchengineland.com/ai-search-traffic-referrals-organic-search-data-461935" },
  { cite: 'SimilarWeb (David F. Carr), "AI Referral Traffic Winners By Industry" (Jul 29, 2025).', url: "https://www.similarweb.com/blog/insights/ai-news/ai-referral-traffic-winners/" },
  { cite: 'Search Engine Land (Danny Goodwin), "Google zero-click searches hit 68% in early 2026" (Jun 9, 2026).', url: "https://searchengineland.com/google-zero-click-searches-2026-study-479717" },
  { cite: 'Ahrefs, "Update: AI Overviews Reduce Clicks by 58%" (Feb 4, 2026).', url: "https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/" },
  { cite: 'Ahrefs, "76% of AI Overview Citations Pull From the Top 10" (Jul 21, 2025).', url: "https://ahrefs.com/blog/search-rankings-ai-citations/" },
  { cite: 'Ahrefs, "Update: 38% of AI Overview Citations Pull From The Top 10" (Mar 2, 2026).', url: "https://ahrefs.com/blog/ai-overview-citations-top-10/" },
];

// ─── Prose style tokens (mirror the /resources article look) ──────────────────
const P: React.CSSProperties  = { margin: "0 0 20px", fontFamily: SERIF, fontSize: 18.5, lineHeight: 1.65, color: INK };
const H2: React.CSSProperties = { margin: "2.4em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.12, letterSpacing: "-0.02em", color: INK, borderTop: `1px solid ${INK}`, paddingTop: 22 };
const LI_WRAP: React.CSSProperties = { margin: "0 0 20px", padding: 0, listStyle: "none", borderTop: `1px solid ${INK15}` };

const B = ({ children }: { children: React.ReactNode }) => <strong style={{ fontWeight: 700, color: INK }}>{children}</strong>;
const I = ({ children }: { children: React.ReactNode }) => <em style={{ fontStyle: "italic" }}>{children}</em>;

const Bullets = ({ items }: { items: React.ReactNode[] }) => (
  <ul style={LI_WRAP}>
    {items.map((item, i) => (
      <li key={i} style={{ padding: "12px 0 12px 28px", borderBottom: `1px solid ${INK15}`, fontFamily: SERIF, fontSize: 17, color: INK, lineHeight: 1.55, position: "relative" }}>
        <span style={{ position: "absolute", left: 0, top: 17, width: 12, height: 12, background: YEL, border: `1.5px solid ${INK}` }} />
        {item}
      </li>
    ))}
  </ul>
);

// ─── Local components ─────────────────────────────────────────────────────────
const CatTag = ({ catKey }: { catKey: keyof typeof CATS }) => {
  const c = CATS[catKey];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: GROT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: c.color }}>
      <span style={{ width: 8, height: 8, background: c.color, display: "inline-block" }} />
      {c.label}
    </span>
  );
};

const StatCard = ({ c }: { c: Card }) => {
  const len = c.stat.length;
  const fs = len > 13 ? 22 : len > 8 ? 30 : 44;
  return (
    <details className="bsi-card" style={{ background: PAPER, border: `1px solid ${INK}`, borderTop: `3px solid ${CATS[c.cat].color}`, padding: "18px 20px 20px" }}>
      <summary style={{ display: "block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <CatTag catKey={c.cat} />
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: INK35 }}>{`No ${c.n}`}</span>
        </div>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: fs, lineHeight: 1, letterSpacing: "-0.02em", color: INK }}>{c.stat}</div>
        <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.45, color: INK70 }}>{c.label}</div>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.4, color: INK }}>{c.take}</div>
        <span className="bsi-hint" style={{ display: "inline-block", marginTop: 12, fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CATS[c.cat].color }}>Source + what to do +</span>
      </summary>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${INK15}` }}>
        <SCaps size={10} ls="0.18em" color={INK55}>Source</SCaps>
        <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 14.5, color: INK70, lineHeight: 1.4 }}>{c.source}</div>
        <div style={{ marginTop: 12 }}>
          <SCaps size={10} ls="0.18em" color={INK55}>What to do</SCaps>
          <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.45 }}>{c.todo}</div>
        </div>
      </div>
    </details>
  );
};

// =========================================================================
// PAGE
// =========================================================================
export default function BingSeoGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      {/* Native <details> needs a tiny bit of CSS that inline styles can't do:
          hide the disclosure marker and flip the hint label when open. */}
      <style>{`
        .bsi-card > summary { cursor: pointer; list-style: none; }
        .bsi-card > summary::-webkit-details-marker { display: none; }
        .bsi-card[open] > summary .bsi-hint::after { content: " (hide)"; }
        .bsi-card[open] > summary .bsi-hint { opacity: .6; }
      `}</style>

      {/* ── Header + TOC ───────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 56px" }}>
        <SectionMast n="00" label="The Infographics Desk · Bing SEO 2026" />
        <div className="grid-dark-card" style={{ alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">Guide + Infographic</Pill>
            <h1 style={{ margin: "16px 0 22px", fontFamily: SERIF, fontWeight: 700, fontSize: 60, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
              How to Win on Bing{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>| And the AI Answer Engines It Feeds</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 620 }}>
              {`A 2026 field guide for marketers, founders and PR practitioners who know Google SEO, for when the same content must satisfy Bing, Copilot and ChatGPT at once.`}
            </p>
          </div>
          <div style={{ paddingTop: 8 }}>
            <Pill size={10.5} ls="0.18em">In This Guide</Pill>
            <div style={{ marginTop: 16 }}>
              {TOC.map(({ n, id, title }) => (
                <a key={id} href={`#${id}`} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, padding: "9px 0", borderBottom: `1px solid ${INK15}`, textDecoration: "none", color: "inherit", alignItems: "baseline" }}>
                  <SCaps size={10} ls="0.12em" color={INK35}>{n}</SCaps>
                  <div style={{ fontFamily: SERIF, fontSize: 14.5, color: INK70 }}>{title}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 44, paddingTop: 24, borderTop: `1px solid ${INK15}` }}>
          {[
            { label: "Author", value: "Syed Irfan Ajmal" },
            { label: "Published", value: "June 2026" },
            { label: "Sources", value: "44 cited, dated and linked" },
            { label: "Archive", value: "2015 original at /infographics/bing-seo-2015" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lead ───────────────────────────────────────────────── */}
      <section style={{ padding: "8px 56px 0" }}>
        <div style={{ maxWidth: 760 }}>
          <p style={P}>
            {`Most marketers see "5% market share" and close the tab on Bing. I'd argue that's a mistake, and the reason is simple: that 5% is a blended, all-devices number. On desktop, where most B2B research and buying actually happens, Bing runs two to three times higher. And in 2026, Bing is no longer just Bing. It's the search index behind Microsoft Copilot and a named provider inside ChatGPT.`}
          </p>
          <p style={P}>
            {`So the real question isn't "should I bother with Bing?" It's "what do I change when the same page has to rank on Bing, get quoted by Copilot, and survive in an AI answer that may never send a click?"`}
          </p>
          <p style={P}>
            {`One throughline runs through everything below: being talked about across the web, not just linked to, is now the closest thing to a master signal for AI visibility. That's where PR meets SEO, and it's the thread this guide pulls.`}
          </p>
        </div>
      </section>

      {/* ── 01 · The infographic ───────────────────────────────── */}
      <section id="infographic" style={{ padding: "56px 56px 8px", scrollMarginTop: 24 }}>
        <SectionMast n="01" label="The Infographic · 10 data points" />

        {/* Engine -> index map */}
        <div style={{ maxWidth: 980 }}>
          <SCaps size={12} ls="0.2em">Which AI runs on which index</SCaps>
          <p style={{ margin: "10px 0 18px", fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: INK70, lineHeight: 1.5, maxWidth: 720 }}>
            {`"All AI runs on Bing" is wrong. Here is the honest map, using only what is on the record.`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {ENGINES.map((e) => (
              <div key={e.engine} style={{ border: `1px solid ${INK}`, borderTop: `3px solid ${e.tagColor}`, background: PAPER, padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.15, color: INK }}>{e.engine}</div>
                <div style={{ fontFamily: GROT, fontSize: 18, color: e.tagColor, lineHeight: 1 }}>{"↓"}</div>
                <div style={{ fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.4 }}>{e.source}</div>
                <span style={{ alignSelf: "flex-start", marginTop: 2, padding: "3px 8px", background: e.tagColor, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{e.tag}</span>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK70, lineHeight: 1.4 }}>{e.note}</div>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 11, color: INK55, lineHeight: 1.6 }}>
            {`Sources: Microsoft Bing Blog (Apr 2025); OpenAI Help Center (2025-26); Wikipedia, Perplexity AI; Google Search Central (Dec 2025); cross-engine overlap from SE Ranking (Apr 2025).`}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", margin: "36px 0 16px" }}>
          <SCaps size={11} ls="0.2em">The 10 cards, by theme</SCaps>
          {Object.entries(CATS).map(([k, c]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: GROT, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: INK70 }}>
              <span style={{ width: 10, height: 10, background: c.color, display: "inline-block" }} />
              {c.label}
            </span>
          ))}
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>Click any card for the source and the action.</span>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {CARDS.map((c) => <StatCard key={c.n} c={c} />)}
        </div>

        {/* Measurement checklist */}
        <div style={{ marginTop: 36, border: `1px solid ${INK}`, background: PAPER2, padding: "24px 26px" }}>
          <SCaps size={11} ls="0.2em">Measurement checklist</SCaps>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {CHECKLIST.map((m) => (
              <div key={m.tool} style={{ borderTop: `2px solid ${INK}`, paddingTop: 12 }}>
                <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK }}>{m.tool}</div>
                <div style={{ marginTop: 6, fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 · The guide ─────────────────────────────────────── */}
      <section style={{ padding: "56px 56px 0" }}>
        <SectionMast n="02" label="The Guide · 2026 edition" />
        <div style={{ maxWidth: 760 }}>

          <h2 style={{ ...H2, borderTop: "none", paddingTop: 0 }} id="why-bing">1 · Why Bing still matters in 2026</h2>
          <p style={P}>{`Here's the headline: Bing is a durable, slowly growing number two that's far bigger than its blended share suggests, and it's almost entirely a desktop story.`}</p>
          <p style={P}>{`Start with the blended number. As of May 2026, StatCounter put Google at 90.39% of worldwide search across all devices and Bing at 5.03%, ahead of Yahoo (1.4%), Yandex (0.99%), and DuckDuckGo (0.71%) (StatCounter, May 2026). Other trackers land lower: DemandSage, citing StatCounter, reported roughly 4.22% global at the end of 2025. The direction inside StatCounter's own data is what matters: Bing has roughly doubled from about 2.81% in early 2023 to around 5% by mid-2026, with no single "Google-killer" moment despite the AI relaunch (Search Engine Land, Feb 2024).`}</p>
          <p style={P}>{`The number that should change your mind is on desktop: roughly 10-12% of worldwide desktop search, mid-teens (about 13.7-17.6%) on US desktop, and under 1% (around 0.68%) on mobile (DemandSage, Dec 2025). That gap is the whole story: Bing's desktop share is roughly fifteen times its mobile share, which isn't a preference effect but a defaults effect, since Windows, Edge, and Microsoft 365 funnel people into Bing on work machines (Microsoft, Nov 2025).`}</p>
          <p style={P}>{`The clickstream data, which watches real behavior rather than page views, sharpens the point. In SparkToro and Datos's analysis of 41 high-search-activity sites, Google accounted for 73.7% of US desktop searches in Q4 2025, and Bing drew more search activity than ChatGPT, sitting alongside Amazon and YouTube as surfaces that grew share in 2025 (SparkToro and Datos, Mar 2026).`}</p>
          <p style={P}>{`That's the methodology trap: Google's share swings from about 90% (StatCounter page views) to about 74% (clickstream, US desktop) depending on how you count, while Bing's number stays relatively stable across methods. So always say which method you're quoting. By region, North America is Bing's strongest large market, with US all-device share around 7-8%, while Europe is weaker at roughly 3.4% (StatCounter via Search Engine Land; DemandSage).`}</p>
          <p style={P}>{`And because Bing also powers Yahoo and DuckDuckGo, among others, ranking in its index can mean visibility across several engines at once.`}</p>

          <h2 style={H2} id="ai-layer">2 · The real reason to care: Bing feeds the AI answer layer</h2>
          <p style={P}>{`Bing visibility increasingly buys AI visibility, but only if you're precise about which AI you mean. The lazy version, "all AI runs on Bing," is wrong. Here's the honest map.`}</p>
          <p style={P}><B>{`Microsoft Copilot is Bing.`}</B>{` This one's definitive. Microsoft describes Bing as its "AI-powered search and answer engine," and says Copilot's grounding "builds on the same crawlers, the same quality signals" as Bing search (Microsoft, Apr 2025; May 2026). Optimizing for Bing is optimizing for Copilot.`}</p>
          <p style={P}><B>{`ChatGPT is a hybrid.`}</B>{` OpenAI's own help doc says ChatGPT "may share disassociated search queries with third-party search providers such as Bing," and Bing is one of only two named providers (Shopify was added in May 2025). At the same time, OpenAI runs its own crawler, OAI-SearchBot, and notes that "sites opted out of OAI-SearchBot will not be shown" (OpenAI Help Center, 2025-26). Bing is officially in the mix, but not the whole mix.`}</p>
          <p style={P}><B>{`Perplexity is mostly its own thing.`}</B>{` Perplexity runs substantial proprietary crawling through PerplexityBot and launched its own search API in 2025; its real-time reliance on Bing is unclear and contested (Wikipedia, Perplexity AI). Don't assume Bing equals Perplexity.`}</p>
          <p style={P}><B>{`Google's AI Overviews, AI Mode, and Gemini run on Google's own index, not Bing.`}</B>{` A page must be indexed in Google Search to appear there (Google Search Central, Dec 2025).`}</p>
          <p style={P}>{`Why believe AI depends on Bing? The plumbing changed in public. In February 2023, Microsoft more than tripled its Bing Search API prices, from $7 to $25 per 1,000 queries on one tier, explicitly tied to "the addition of OpenAI's ChatGPT engine to Bing" (Computerworld, Feb 2023). Then in May 2025, Microsoft retired the Bing Search APIs entirely (decommissioned August 11, 2025), steering customers to "Grounding with Bing Search" in Azure AI, with replacement costs reported 40-483% higher depending on workload (Microsoft Learn; The Register, May 2025; PPC Land). That's concrete evidence an ecosystem leans on Bing's infrastructure.`}</p>
          <p style={P}>{`Now the honest caveat: different engines cite genuinely different webs. In SE Ranking's study of about 2,000 queries per engine, Bing Copilot's cited domains overlapped Google's AI Overviews only 9.81% (Perplexity 11.97%, ChatGPT 13.95%), and Bing Copilot's citation set was the most distinct of the four (SE Ranking, Apr 2025). So "rank on Bing, win everywhere in AI" is an oversimplification. A Semrush analysis even argues ChatGPT touches Google's results too, which tells you the provider mix is partly undisclosed. The defensible claim: Bing is officially named, it definitively powers Copilot, and per-engine overlap is low enough that you optimize for the layer, not a single bot.`}</p>

          <h2 style={H2} id="vocabulary">3 · The new vocabulary: SEO, AEO, GEO, AI Overviews, LLM visibility</h2>
          <p style={P}>{`These aren't buzzwords. They name distinct surfaces you now optimize for.`}</p>
          <p style={P}><B>{`AEO (Answer Engine Optimization)`}</B>{` is structuring and formatting content so AI tools like ChatGPT, Perplexity, and voice assistants can understand, trust, and cite it as a direct answer. Where classic SEO chases a link ranking, AEO targets accurate, extractable responses and brand citations (Profound, Jan 2026).`}</p>
          <p style={P}><B>{`AI Overviews (often shortened to AIO)`}</B>{` are Google's AI-generated summaries at the top of Search, with source links, powered by Gemini through retrieval-augmented generation, which simply means the model pulls live search results and writes an answer over them. They launched in the US at Google I/O in May 2024 and reached 100-plus countries by that October (Wikipedia, AI Overviews). One warning: "AIO" sometimes gets used loosely to mean "AI Optimization," so pick one meaning and stick to it. I'll only use it for Google's product.`}</p>
          <p style={P}><B>{`GEO (Generative Engine Optimization)`}</B>{` is the original academic framework for improving how visible your content is inside generative answers, and the founding paper reports its methods lifting visibility by up to 40% (Aggarwal et al., 2023).`}</p>
          <p style={P}><B>{`LLM visibility`}</B>{` (or LLM SEO) is the measurement practice: how often and how accurately your brand is mentioned or cited in AI answers, tracked as a visibility score or share of voice rather than a SERP rank (Profound, Jan 2026).`}</p>
          <p style={P}>{`The one-line distinction: AEO is being the cited answer, GEO is the academic framework behind it, AI Overviews is Google's specific product, and LLM visibility is how you measure all of it.`}</p>

          <h2 style={H2} id="since-2015">{`4 · What's changed since 2015, and what hasn't`}</h2>
          <p style={P}>{`If you ran a Bing playbook a decade ago, some of it still works and some of it will quietly hurt you. The fundamentals held up. The shortcuts aged out.`}</p>
          <p style={P}>{`Still valid, and more Bing-distinct than ever: verify your site in Bing Webmaster Tools and submit a sitemap; publish genuinely good, original content; earn links from trusted sites; place your exact target phrase deliberately in the title, H1, and opening; and lean into multimedia. Bing still favors older, established domains, and exact-match domains still carry a real edge on Bing that Google's own John Mueller says they don't get on Google (SEO Sherpa, May 2026).`}</p>
          <p style={P}>{`Aged out, and worth removing from your process:`}</p>
          <Bullets items={[
            <><B>{`Meta keywords as a ranking factor.`}</B>{` Bing still recognizes the tag but gives it minimal weight (SEO Sherpa, May 2026).`}</>,
            <><B>{`Keyword density and stuffing.`}</B>{` Stuffing reads as spam. Deliberate exact-keyword `}<I>{`placement`}</I>{` is different and still works on Bing; cramming does not.`}</>,
            <><B>{`"Social signals are a direct ranking lever."`}</B>{` Overstated. Bing treats social as a trust or "social proof" signal, never as a published, discrete weight (SEO Sherpa; Search Engine Land).`}</>,
            <><B>{`"Exact-match anchor backlinks are safe on Bing."`}</B>{` The riskiest holdover. Bing's current line is quality over quantity, and it penalizes manipulative links. Keep "earn links from high-authority sites." Drop the exact-match-anchor habit.`}</>,
          ]} />
          <p style={P}>{`One honesty note: Bing publishes no per-signal weights. Its product lead Fabrice Canel has said the signals are blended by machine learning (Search Engine Land, 2020). So when you read "Bing weighs X more than Google," including in this guide, treat it as credible analyst consensus, not a Bing quote.`}</p>

          <h2 style={H2} id="technical">5 · Technical foundation: Bing Webmaster Tools, sitemaps, and IndexNow</h2>
          <p style={P}>{`Bing hands you an edge here that Google doesn't offer, so don't skip it.`}</p>
          <p style={P}>{`Step one hasn't changed: verify your site in Bing Webmaster Tools, importing from Google Search Console to save time. Then submit an XML sitemap. Bing's 2025 guidance is specific: up to 50,000 URLs per file, keep your lastmod date accurate in ISO 8601 format with a timestamp because it's a key freshness signal, and don't bother with changefreq or priority because Bing ignores them (Microsoft, Jul 2025).`}</p>
          <p style={P}>{`Now the edge. `}<B>{`IndexNow`}</B>{` is a protocol, built by Microsoft Bing with Yandex and launched in October 2021, that lets you instantly notify engines when you add, update, or delete a URL. Ping one participating engine and they all get notified (Microsoft, Oct 2021). The participants include Microsoft Bing, Naver, Seznam.cz, Yandex, and Yep, plus an Amazon submission endpoint. Google is not a participant and relies on traditional crawling, with its push-based Indexing API limited to job postings and livestreams (IndexNow.org; PPC Land, Dec 2024).`}</p>
          <p style={P}>{`In plain terms: you can push content to Bing for near-instant indexing instead of waiting for a crawl, and the same ping reaches several other engines. IndexNow is built into Cloudflare and into CMS plugins like Yoast and RankMath, so turning it on is usually a toggle, not a project.`}</p>
          <p style={P}>{`Manual URL submission is still available, up to 10,000 URLs per day, with the quota scaling to your verified site's age and impressions. But as of a November 2025 update, Microsoft now recommends IndexNow as the primary real-time submission method (Microsoft, updated Nov 2025).`}</p>
          <p style={P}>{`Last technical point: make your content reachable without JavaScript. Bing renders JavaScript-heavy and single-page-app sites less reliably than Google, so expose your real content through server-side rendering or plain HTML (SEO Sherpa, May 2026). This page is built that way on purpose.`}</p>

          <h2 style={H2} id="on-page">6 · On-page for Bing, which is also on-page for extraction</h2>
          <p style={P}>{`The useful surprise: the same structure that ranks on Bing also makes you quotable by AI. You optimize once.`}</p>
          <p style={P}>{`Bing is more literal than Google. Put your exact target phrase in the title, H1, opening paragraph, URL, and a well-written meta description, which Bing often shows verbatim and uses to judge relevance (SEO Sherpa, May 2026). Do it naturally, not stuffed. Then use structured data, because Bing actively relies on schema to parse pages and qualify rich results, where Google treats it more as a hint.`}</p>
          <p style={P}>{`That doubles as AI work: the features that make a page easy for Bing to parse are the same ones that make it extractable as an answer: a clear question-and-answer structure, crisp definitions, lists and tables, named sources, an author byline, and a visible "last updated" date. Build the page to be quoted, and you've built it to rank.`}</p>

          <h2 style={H2} id="links">7 · Links in 2026: quality over volume</h2>
          <p style={P}>{`Links still help. But the 2026 story is quality and authority over raw volume, and that's true for Bing's own rankings and even more true for AI citations.`}</p>
          <p style={P}>{`Bing's own line is refreshingly direct: "even just a few quality inbound links from trusted websites is enough to help boost your rankings" (Bing Webmaster Tools). Schemes get penalized; the quality and trust of the linking domain matters far more than the count. Bing's December 2025 guidance frames links as just one signal among clicks, impressions, and engagement, noting that when several URLs share the same content, "signals such as clicks, links, impressions, and engagement are often diluted" (Microsoft, Dec 2025).`}</p>
          <p style={P}>{`One evidence gap to flag plainly: there is no public 2024-2026 study quantifying how much links move Bing rankings specifically. So treat Bing's link claims as Bing's stated position, not a measured correlation.`}</p>
          <p style={P}>{`For AI citations, the data humbles raw link counts. In Ahrefs's study of 75,000 brands, link metrics like number of backlinks and URL rating showed "very weak correlations across all AI systems," with Domain Rating landing at just 0.266 for ChatGPT, 0.285 for AI Mode, and 0.326 for AI Overviews (Ahrefs, Dec 2025). The often-quoted precise pairing, brand mentions at 0.664 versus backlinks at 0.218, comes from Ahrefs's earlier AI-Overviews study (Ahrefs, AI Overview brand correlation).`}</p>
          <p style={P}>{`That said, authority isn't worthless, it's a gate. Semrush found backlink `}<I>{`authority`}</I>{` correlates moderately with AI mentions, Pearson 0.65 and Spearman 0.57, but only past a threshold: the lowest tiers earned 0-4 citations while the top tier earned 79-plus, and nofollow links performed about the same as follow (Semrush, Oct 2025). Referring-domain `}<I>{`diversity`}</I>{` was the single strongest link-side predictor of ChatGPT citation in SE Ranking's large study, with sites above 350,000 referring domains earning 8.4 citations versus 1.6 for small sites, though .gov and .edu domains did not outperform commercial ones (Search Engine Journal, Nov 2025).`}</p>
          <p style={P}>{`So here's how I reconcile it: link `}<I>{`volume`}</I>{` barely moves AI citations, link-derived `}<I>{`authority`}</I>{` does but only past a minimum threshold, and even then it sits behind brand mentions in importance. All of it is correlational. AI systems don't crawl the link graph the way Googlebot does; links co-occur with the brand authority these systems reward.`}</p>
          <p style={P}>{`Two source notes, because consolidation is real in 2026: Ahrefs now owns Detailed, and Semrush is owned by Adobe. Both produce credible work; just don't treat two Adobe/Semrush-family studies as independent confirmation of each other.`}</p>

          <h2 style={H2} id="earned-media">8 · The earned-media engine: brand mentions and entities are AI visibility</h2>
          <p style={P}>{`Being talked about across many authoritative sites, and keeping a consistent entity footprint, predicts AI citation better than backlinks do. It's the bridge from digital PR to AI visibility, and it's where earned media stops being a "brand" line item and becomes a discoverability channel.`}</p>
          <p style={P}>{`Bing has actually said this out loud, if a while ago. Former Bing senior product manager Duane Forrester noted that "years ago, Bing figured out context and sentiment of tone, and how to associate mentions without a link" (Search Engine Land). That quote dates to around 2016 and Bing hasn't restated it recently, so treat it as a standing legacy position rather than fresh evidence. Still, it tells you Bing has long valued unlinked mentions, something Google has never confirmed as a direct factor.`}</p>
          <p style={P}>{`The modern AI data points the same way. Branded web mentions correlate with AI visibility at roughly 0.66-0.71, far above backlinks (Ahrefs, Dec 2025). The single strongest correlate Ahrefs found was YouTube mentions, at about 0.737 across ChatGPT, AI Mode, and AI Overviews, plausibly because Google and OpenAI trained on YouTube transcripts. Entity consistency matters too: a consistent name, description, and category across Wikipedia, Wikidata, LinkedIn, and Crunchbase, backed by schema, makes models surface you reliably. Wikidata is the largest single feed into Google's Knowledge Graph, and Wikipedia is consistently ChatGPT's most-cited domain (The Digital Bloom; Ahrefs).`}</p>
          <p style={P}>{`One finding reframes how you measure all this: Semrush, working with Kevin Indig, found that 62% of AI citations are "ghost citations," where a source is linked but the brand isn't named (Semrush, Jun 2026). The takeaway is to track unlinked brand mentions on third-party sites like Reddit, news, and listicles alongside your backlinks, because, as Indig puts it, AI engines mention brands they've already seen consistently across the web.`}</p>
          <p style={P}>{`On the PR-to-AI chain specifically, one widely cited study of the 100 biggest companies reports that 61% of AI responses about corporate reputation drew from editorial or earned media, rising to 65% for trust queries and 72% for value queries, while owned sites still supplied 66% for brand-innovation queries (PRWeek, via Bottle, Jul 2026). I'm citing those figures with a flag: they're attributed to PRWeek via a PR agency write-up, so verify them against the PRWeek primary before relying on them.`}</p>
          <p style={P}>{`Now the balance, because this thesis is easy to oversell. The relationship is correlational, and big brands dominate AI answers regardless of tactic, so mentions may partly proxy brand size. It's quality and consensus in the right sources that count, not raw mention volume; Ahrefs is blunt that chasing low-quality links and content "categorically won't help." Query intent moderates the effect, since informational queries rarely name brands while comparative ones name them far more often. And from a traditional-SEO seat, unlinked mentions still don't pass link equity; their value is entity recognition, not PageRank. Real, but bounded.`}</p>

          <h2 style={H2} id="formats">9 · Content formats Bing and AI both favor</h2>
          <p style={P}>{`The content that wins is original, multimedia, structured, dated, and signed.`}</p>
          <p style={P}>{`Bing has long favored pages that go beyond text: images with real alt text, video, infographics, and podcasts. That preference now does double duty, because multimedia and transcripts are exactly what AI systems extract and recall, which is part of why YouTube presence correlates so strongly with AI visibility. Layer the AEO structure from section 6 on top, and a single page earns its place in Bing's results and in an AI answer at once.`}</p>

          <h2 style={H2} id="measure">10 · Measure it: Bing and AI referrals, in proportion</h2>
          <p style={P}>{`You can't manage what you don't track. Set this up, then keep it in proportion.`}</p>
          <p style={P}>{`For Bing, use Bing Webmaster Tools for impressions, clicks, and positions; its recent output also references AI-search performance reporting, so check whether that report is live in your current dashboard. For Google, Search Console still covers organic, but be aware that AI Overview appearances aren't broken out cleanly and clicks are blended in. For AI engines, there's no single button: build a custom channel or segment in GA4 that matches AI referrer hostnames like chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, and bing.com, so you can see those sessions separately.`}</p>
          <p style={P}>{`Here's the proportion check, so you don't overreact. AI engines sent under 1% of referral traffic in 2025, even while growing about 357% year over year, roughly 1.13 billion AI referrals against 191 billion from Google Search as of June 2025 (BrightEdge via Search Engine Land; SimilarWeb, Jul 2025). The bigger near-term story is zero-click: around 68% of US Google searches ended without a click in early 2026, and AI Overviews cut top-position click-through rate by about 58% (SparkToro via Search Engine Land; Ahrefs, Feb 2026).`}</p>
          <p style={P}>{`One caveat on those zero-click trends: the data providers behind them have changed over the years, so the rise is real but the exact year-over-year deltas are soft. The practical lesson: optimize to `}<I>{`be`}</I>{` the cited answer, and track impressions and citations, not just clicks.`}</p>

          <h2 style={H2} id="checklist">11 · The 2026 Bing and AI checklist</h2>
          <p style={P}>{`Everything above, on one screen.`}</p>
          <p style={{ ...P, marginBottom: 8, fontWeight: 700 }}>{`Technical foundation`}</p>
          <Bullets items={[
            <>{`Verify your site in Bing Webmaster Tools (import from Google Search Console).`}</>,
            <>{`Submit an XML sitemap; keep lastmod accurate in ISO 8601; skip changefreq and priority.`}</>,
            <>{`Turn on IndexNow (Cloudflare, Yoast, or RankMath) to push new and updated URLs instantly to Bing, Yandex, Naver, Seznam, and Yep.`}</>,
            <>{`Use manual submission (up to 10,000 URLs/day) as a backup, but lead with IndexNow.`}</>,
            <>{`Make content reachable without JavaScript, through server-side rendering or HTML.`}</>,
          ]} />
          <p style={{ ...P, marginBottom: 8, fontWeight: 700 }}>{`On-page and content`}</p>
          <Bullets items={[
            <>{`Place your exact target phrase in the title, H1, opening paragraph, URL, and meta description, naturally.`}</>,
            <>{`Add structured data; Bing leans on it to parse your pages.`}</>,
            <>{`Publish original multimedia: images with alt text, video, infographics, podcasts.`}</>,
            <>{`Structure for extraction: clear Q&A, definitions, lists and tables, a named author, a visible update date.`}</>,
          ]} />
          <p style={{ ...P, marginBottom: 8, fontWeight: 700 }}>{`Authority and earned media`}</p>
          <Bullets items={[
            <>{`Earn a few high-quality, trusted links; avoid manipulative exact-match anchors.`}</>,
            <>{`Pursue brand mentions across many authoritative sites: digital PR, podcasts, YouTube, Reddit, and Quora. This is your strongest AI-visibility lever.`}</>,
            <>{`Lock down entity consistency: Wikipedia and Wikidata where eligible, consistent descriptions, and Organization or Person schema.`}</>,
          ]} />
          <p style={{ ...P, marginBottom: 8, fontWeight: 700 }}>{`Measurement`}</p>
          <Bullets items={[
            <>{`Track Bing in Webmaster Tools and AI referrers in GA4.`}</>,
            <>{`Keep AI traffic in proportion, and watch zero-click and citations, not only clicks.`}</>,
          ]} />
          <p style={P}>{`If you do only one thing this week, verify in Bing Webmaster Tools and switch on IndexNow. If you do only one thing this quarter, build the earned-media engine, because being talked about is what the answer engines reward. The marketers who win the AI answer layer won't be the ones chasing one more link. They'll be the ones the web keeps mentioning.`}</p>
        </div>
      </section>

      {/* ── 03 · References ────────────────────────────────────── */}
      <section id="references" style={{ padding: "56px 56px 0", scrollMarginTop: 24 }}>
        <SectionMast n="03" label="References · 44 sources, dated and linked" />
        <div style={{ maxWidth: 820 }}>
          <p style={{ ...P, fontSize: 16.5, color: INK70 }}>{`Every stat above carries an inline source and date. Full sources below, each confirmed to resolve.`}</p>
          <ol style={{ margin: "8px 0 0", padding: 0, listStyle: "none", borderTop: `1px solid ${INK15}` }}>
            {REFS.map(({ cite, url }, i) => (
              <li key={i} style={{ padding: "12px 0 12px 36px", borderBottom: `1px solid ${INK15}`, fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.6, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 15, fontFamily: GROT, fontWeight: 700, fontSize: 10, color: INK35, letterSpacing: "0.08em" }}>{`[${i + 1}]`}</span>
                {cite}{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: INK, textDecoration: "none", whiteSpace: "nowrap" }}>
                  View source ↗
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 04 · Next steps + archive ──────────────────────────── */}
      <section style={{ padding: "56px 56px", background: PAPER2, marginTop: 56 }}>
        <SectionMast n="04" label="Next Steps · Put this to work" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, marginTop: 8 }}>
          {[
            { title: "Read the 2015 original", body: "This guide replaced a faithfully restored 2015 article. The original, with its illustrated infographic, is preserved.", cta: "View the 2015 archive", href: "/infographics/bing-seo-2015" },
            { title: "Get cited by AI", body: "The EMOS programme turns earned media into AI visibility: brand mentions and coverage in the outlets the answer engines trust.", cta: "Learn about EMOS", href: "/emos" },
            { title: "Work with Syed", body: "For a fractional CMO arrangement or a done-for-you earned media programme, book a discovery call.", cta: "Book a call", href: CALENDLY },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK70 }}>{body}</p>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none" }}>
                {cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="05" />
      <Colophon />
    </div>
  );
}

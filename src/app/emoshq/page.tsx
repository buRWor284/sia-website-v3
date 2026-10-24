/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { EARNED_MEDIA_STATS } from "@/components/emos-platform/landing/content";
import { EmosFamilyBar } from "@/components/EmosFamilyBar";
import "./emoshq.css";

// EMOS hub (/emoshq): the one page every emoshq.com visitor lands on.
// v1 2026-10-24 (morning): a narrow boxed column reusing residency.css; Irfan
// judged it too plain. v2 2026-10-24 (evening): designed in Claude Design from
// the brief claude/EMOSHQ-Hub-Claude-Design-Brief-2026-10-24.md and ported
// here mechanically (HTML parsed to JSX, inline styles kept, template slots
// replaced by the Marquee / STEPS / StatCell pieces below), so the markup
// matches the approved design one-to-one. Full-bleed sections, offers first,
// one black band for the method, cream paper and the § bar system throughout.
//
// Portable on purpose: its own masthead and footer (the global SiteHeader is
// hidden for this route in SiteHeaderConditional), so the file can move to the
// real emoshq.com site unchanged. Shared facts are imports, never retyped:
// EARNED_MEDIA_STATS (same constant as /emos-platform and /emos-residency),
// screenshots under /assets/emos-platform, testimonial photos, the headshot.
// emoshq.com/* fallback redirects here (next.config.ts).
export const metadata: Metadata = {
  title: "EMOS · Earned Media Operating System · Platform, Academy, Residency",
  description:
    "One earned media method, used on 300+ client accounts since 2013, available three ways: run it yourself on the EMOS Platform, learn it in the EMOS Academy, or have it built inside your company in an EMOS Residency.",
  alternates: { canonical: "/emoshq" },
  openGraph: {
    title: "EMOS · Earned Media Operating System",
    description: "Find the story. Pitch the right journalist. Keep the proof. Three ways to run it: Platform, Academy, Residency.",
    url: "https://www.syedirfanajmal.com/emoshq",
    type: "website",
  },
};

const TICKER = [
  "CASE STUDY IN HBR",
  "QUOTED IN FORBES (USA)",
  "300+ CLIENTS SINCE 2013",
  "$160K → $1.2M MONTHLY ORGANIC REVENUE, NATIONAL TYRES",
  "0 → 1.5M MONTHLY VISITS, RIDESTER",
  "100+ PUBLICATIONS",
];
const OUTLETS_A = ["Forbes", "Yahoo", "Business Insider", "MSN", "AOL", "Reader's Digest", "Apartment Therapy", "Healthline"];
const OUTLETS_B = ["MarketWatch", "Bankrate", "Mashable", "Entrepreneur", "The Mirror", "The Next Web", "GoBankingRates", "Consumer Health Digest"];

// The six-tool chain. Arrow flips to ↓ under 760px via CSS (.hq-arrow).
const STEPS = [
  { n: "00", name: "Company Brief", line: "Your story, written once and used by every tool." },
  { n: "01", name: "SignalIQ", line: "Find what editors are already covering in your beat." },
  { n: "02", name: "AssetIQ", line: "Build the report or tool a journalist will cite." },
  { n: "03", name: "JournoCollabIQ", line: "Pitch the people who actually cover your story." },
  { n: "04", name: "PressIQ", line: "Draft and score every pitch before it goes out." },
  { n: "05", name: "CoverageIQ", line: "Show the board what the work produced." },
].map((s, i, a) => ({ ...s, arrow: i < a.length - 1 ? <span className="hq-arrow" aria-hidden="true" /> : null }));

// Infinite marquee: two copies of the list, translated -50% (keyframes emosMarq in emoshq.css).
function Marquee({ items, dur, variant, reverse = false }: { items: string[]; dur: number; variant: "ticker" | "outlet"; reverse?: boolean }) {
  const base =
    variant === "ticker"
      ? { fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".12em", color: "#f1ebde" }
      : { fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 26, letterSpacing: "-.01em", color: "#1a1410" };
  const sep = variant === "ticker" ? "////" : "·";
  const sepStyle = variant === "ticker" ? { color: "#f5b81f" } : { color: "rgba(26,20,16,.35)" };
  const run = (k: string) =>
    items.map((t, i) => (
      <span key={k + i} style={{ display: "inline-flex", alignItems: "center", gap: 28, paddingRight: 28, whiteSpace: "nowrap" }}>
        {t}
        <span style={sepStyle} aria-hidden="true">{sep}</span>
      </span>
    ));
  return (
    <div className="hq-marquee" style={{ ...base, animationDuration: `${dur}s`, animationDirection: reverse ? "reverse" : "normal" }}>
      {run("a")}
      {run("b")}
    </div>
  );
}

// One sourced stat cell for § 03. The big figure is the first number in the sentence.
function StatCell({ text, src, href, highlight }: { text: string; src: string; href: string; highlight: boolean }) {
  const lead = text.match(/\d+(?:\.\d+)?%?/)?.[0] ?? "";
  return (
    <div style={{ borderRight: "1px solid #1a1410", borderBottom: "1px solid #1a1410", padding: "clamp(18px,2vw,28px)", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontSize: "48px", fontWeight: "600", letterSpacing: "-.04em", lineHeight: ".95" }}>
        {highlight ? <span style={{ background: "linear-gradient(transparent 55%,#f5b81f 55%)" }}>{lead}</span> : lead}
      </span>
      <span style={{ fontSize: "17px", lineHeight: "1.4", flex: "1" }}>{text}</span>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".06em", lineHeight: "1.5", color: "rgba(26,20,16,.65)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
        {src} ↗
      </a>
    </div>
  );
}

export default function EmosHubPage() {
  return (
    <div className="hq-root">
        <div style={{ background: "#f1ebde", color: "#1a1410", fontFamily: "var(--font-serif)", minWidth: "0", overflowX: "clip" }}>
          {/* ============ 0. MASTHEAD ============ */}
          <header style={{ position: "sticky", top: "0", zIndex: "50", background: "#f1ebde", borderBottom: "1px solid #1a1410" }}>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "12px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 24px" }}>
              <Link href="/emoshq" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", flex: "0 0 auto" }}>
                <span style={{ background: "#1a1410", color: "#f5b81f", fontFamily: "var(--font-grot)", fontWeight: "900", fontSize: "15px", letterSpacing: ".28em", padding: "8px 8px 8px 12px", lineHeight: "1" }}>
                  EMOS
                </span>
                <span className="hq-wide">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(26,20,16,.7)" }}>
                    Earned Media Operating System
                  </span>
                </span>
              </Link>
              <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "clamp(12px,2vw,28px)", overflowX: "auto", maxWidth: "100%", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                <Link href="/emos-platform" style={{ textDecoration: "none" }}>
                  Platform
                </Link>
                <Link href="/emos-academy" style={{ textDecoration: "none" }}>
                  Academy
                </Link>
                <Link href="/emos-residency" style={{ textDecoration: "none" }}>
                  Residency
                </Link>
                <Link href="/tools" style={{ textDecoration: "none" }}>
                  Free tools
                </Link>
                <Link href="/emos-platform/signin" style={{ textDecoration: "none", border: "1px solid #1a1410", padding: "8px 12px" }} className="hq-h1">
                  Sign in
                </Link>
              </nav>
            </div>
          </header>
          {/* ============ 1. HERO ============ */}
          <section id="top" style={{ background: "#f1ebde" }}>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,6vw,88px) clamp(20px,4vw,56px) clamp(40px,5vw,72px)" }}>
              <span style={{ display: "inline-block", background: "#f5b81f", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 10px" }}>
                One method · Three ways to run it
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: "500", fontSize: "clamp(40px,6.6vw,96px)", lineHeight: ".98", letterSpacing: "-.03em", margin: "28px 0 0", textWrap: "balance" }}>
                Earn the coverage investors and AI check.
                <em style={{ fontWeight: "400" }}>
                  Then keep the system.
                </em>
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "40px clamp(32px,5vw,72px)", marginTop: "clamp(32px,4vw,56px)", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 360px", minWidth: "0", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "32px", paddingTop: "4px" }}>
                  <p style={{ fontSize: "20px", lineHeight: "1.5", margin: "0", maxWidth: "60ch", color: "#1a1410", textWrap: "pretty" }}>
                    EMOS is the earned media method used on 300+ client accounts since 2013, built into connected tools. Run it yourself, learn it with a cohort, or have it built
                    <span style={{ background: "linear-gradient(transparent 55%,#f5b81f 55%)" }}>
                      inside your own company
                    </span>
                    . Either way, the journalists, the pitches and the proof stay with you.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 28px" }}>
                    <a href="#ways" style={{ background: "#f5b81f", border: "1px solid #1a1410", padding: "16px 24px", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none", color: "#1a1410" }} className="hq-h2">
                      Pick your path ↓
                    </a>
                    <Link href="/tools" style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                      Try the free tools
                    </Link>
                  </div>
                </div>
                <figure style={{ flex: "1.45 1 520px", minWidth: "0", margin: "0" }}>
                  <div style={{ border: "1px solid #1a1410", background: "#f1ebde" }}>
                    <div style={{ height: "28px", background: "#1a1410", display: "flex", alignItems: "center", gap: "10px", padding: "0 12px" }}>
                      <span style={{ width: "9px", height: "9px", background: "#f5b81f", flex: "0 0 auto" }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".14em", color: "#f1ebde", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        EMOS · PressIQ · A pitch, scored · Live
                      </span>
                    </div>
                    <div style={{ position: "relative", aspectRatio: "1312/924", background: "#f1ebde", overflow: "hidden" }}>
                      <img src="/assets/emos-platform/S1a-pitch-before-score.webp" alt="PressIQ: a pitch drafted for one journalist, before scoring" className="hq-xf-a" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", display: "block", transition: "opacity .7s ease" }} loading="lazy" />
                      <img src="/assets/emos-platform/S1c-score-73-strongest-line.webp" alt="PressIQ: the same pitch scored 73 out of 100" className="hq-xf-b" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", display: "block", transition: "opacity .7s ease" }} loading="lazy" />
                    </div>
                  </div>
                  <figcaption style={{ fontStyle: "italic", fontSize: "17px", lineHeight: "1.45", marginTop: "14px", color: "rgba(26,20,16,.75)", textWrap: "pretty" }}>
                    Every pitch is written for one journalist and scored before it is sent. That habit is the product, whichever way you buy it.
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
          {/* ============ 1b. CREDIBILITY TICKER ============ */}
          <div style={{ background: "#1a1410", color: "#f1ebde", borderTop: "1px solid #1a1410", padding: "14px 0", overflow: "hidden" }}>
            <Marquee items={TICKER} dur={60} variant="ticker" />
          </div>
          {/* ============ 2. § 01 THREE WAYS TO RUN EMOS ============ */}
          <section id="ways" style={{ background: "#f1ebde", scrollMarginTop: "60px" }}>
            <div style={{ background: "#1a1410", color: "#f1ebde", borderTop: "1px solid rgba(241,235,222,.25)" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 01
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  Three ways to run EMOS
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Same method · Pick how much of it you do yourself
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,56px) clamp(56px,6vw,96px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))", gap: "28px 24px" }}>
                {/* WAY 01 Platform */}
                <article style={{ display: "grid", gridRow: "span 9", gridTemplateRows: "subgrid", rowGap: "0", border: "1px solid #1a1410", background: "#f1ebde", padding: "32px 28px 28px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: ".14em" }}>
                    WAY 01
                  </span>
                  <h3 style={{ margin: "14px 0 0", fontSize: "32px", fontWeight: "600", letterSpacing: "-.02em", lineHeight: "1.05" }}>
                    EMOS Platform
                  </h3>
                  <span style={{ marginTop: "8px", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(26,20,16,.7)" }}>
                    Run it yourself
                  </span>
                  <div style={{ margin: "24px 0 8px", border: "1px solid #1a1410", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <span style={{ fontSize: "44px", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                        $149
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase" }}>
                        per month
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                      Early adopter · cancel any time
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      Time
                    </span>
                    <span>
                      Start today
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      For
                    </span>
                    <span>
                      Founders and small teams who will send their own pitches and want a repeatable process, not a retainer.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You get
                    </span>
                    <span>
                      Six connected tools on one login: brief, story signals, asset briefs, journalist shortlists, scored pitch drafts and a placement log. A 1:1 onboarding call is included.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You keep
                    </span>
                    <span>
                      Your saved journalists, every pitch and score, and the record of what landed.
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignSelf: "end", paddingTop: "20px" }}>
                    <Link href="/emos-platform" style={{ display: "block", textAlign: "center", background: "#f5b81f", border: "1px solid #1a1410", padding: "16px 20px", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none" }} className="hq-h2">
                      See the Platform →
                    </Link>
                    <Link href="/tools" style={{ textAlign: "center", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      or try the free tools first
                    </Link>
                  </div>
                </article>
                {/* WAY 02 Academy (highlighted) */}
                <article style={{ position: "relative", display: "grid", gridRow: "span 9", gridTemplateRows: "subgrid", rowGap: "0", border: "1px solid #1a1410", background: "#e8e0cc", padding: "32px 28px 28px" }}>
                  <span style={{ position: "absolute", top: "-1px", right: "-1px", background: "#f5b81f", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", padding: "6px 10px" }}>
                    MOST CHOSEN
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: ".14em" }}>
                    WAY 02
                  </span>
                  <h3 style={{ margin: "14px 0 0", fontSize: "32px", fontWeight: "600", letterSpacing: "-.02em", lineHeight: "1.05" }}>
                    EMOS Academy
                  </h3>
                  <span style={{ marginTop: "8px", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(26,20,16,.7)" }}>
                    Learn it with a cohort
                  </span>
                  <div style={{ margin: "24px 5px 8px 0", border: "1px solid #1a1410", background: "#f1ebde", boxShadow: "5px 5px 0 #f5b81f", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase" }}>
                        from
                      </span>
                      <span style={{ fontSize: "44px", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                        $2,000
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase" }}>
                        one-time
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                      Foundation 4 weeks · Accelerate $3,500, 8 weeks
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.18)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      Time
                    </span>
                    <span>
                      4 to 8 weeks
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.18)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      For
                    </span>
                    <span>
                      Founders 3 to 12 months from a raise, with customers, results or a point of view, who will do the work or have someone on the team do it.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.18)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You get
                    </span>
                    <span>
                      Five founders per cohort, one live call a week, real pitches to real journalists from week two, the EMOS tools included, and a placements-or-refund guarantee.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You keep
                    </span>
                    <span>
                      The system, the skills, and the first placements on the record.
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignSelf: "end", paddingTop: "20px" }}>
                    <Link href="/emos-academy" style={{ display: "block", textAlign: "center", background: "#f5b81f", border: "1px solid #1a1410", padding: "16px 20px", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none" }} className="hq-h2">
                      See the Academy →
                    </Link>
                    <Link href="/emos-academy/apply" style={{ textAlign: "center", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      or apply now
                    </Link>
                  </div>
                </article>
                {/* WAY 03 Residency */}
                <article style={{ display: "grid", gridRow: "span 9", gridTemplateRows: "subgrid", rowGap: "0", border: "1px solid #1a1410", background: "#f1ebde", padding: "32px 28px 28px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: ".14em" }}>
                    WAY 03
                  </span>
                  <h3 style={{ margin: "14px 0 0", fontSize: "32px", fontWeight: "600", letterSpacing: "-.02em", lineHeight: "1.05" }}>
                    EMOS Residency
                  </h3>
                  <span style={{ marginTop: "8px", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(26,20,16,.7)" }}>
                    Have it built inside your company
                  </span>
                  <div style={{ margin: "24px 0 8px", border: "1px solid #1a1410", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <span style={{ fontSize: "36px", fontWeight: "600", letterSpacing: "-.02em", lineHeight: "1.1" }}>
                        Set per company
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                      Scope and length agreed after one call
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      Time
                    </span>
                    <span>
                      Weeks, not a year
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      For
                    </span>
                    <span>
                      Teams that want it built and running fast, with one person on staff who can take it over.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.15)", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You get
                    </span>
                    <span>
                      Irfan joins your team for a set period, runs EMOS every day on your real stories and journalists beside one of your people, then hands over.
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", gap: "12px", padding: "14px 0", fontSize: "16px", lineHeight: "1.45" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", paddingTop: "4px" }}>
                      You keep
                    </span>
                    <span>
                      A trained operator, a journalist list, a pitch library and a placement log.
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignSelf: "end", paddingTop: "20px" }}>
                    <Link href="/emos-residency" style={{ display: "block", textAlign: "center", background: "#f5b81f", border: "1px solid #1a1410", padding: "16px 20px", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none" }} className="hq-h2">
                      See the Residency →
                    </Link>
                    <Link href="/strategy-call" style={{ textAlign: "center", fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      or book a 30-minute call
                    </Link>
                  </div>
                </article>
              </div>
              {/* Comparison table */}
                <div style={{ marginTop: "clamp(48px,5vw,72px)", overflowX: "auto", border: "1px solid #1a1410" }}>
                  <div style={{ minWidth: "780px", fontSize: "15px", lineHeight: "1.4" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", background: "#1a1410", color: "#f1ebde", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontWeight: "400", opacity: ".6", letterSpacing: ".1em" }}>
                        Compare
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(241,235,222,.25)" }}>
                        Platform
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(241,235,222,.25)", background: "#f5b81f", color: "#1a1410" }}>
                        Academy
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(241,235,222,.25)" }}>
                        Residency
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid #1a1410" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Who does the work
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        You, with the software
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        Your team, coached by Irfan on live weekly calls
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Irfan and your team, side by side
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid rgba(26,20,16,.15)" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Format
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Self-serve, online
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        Remote cohort, five founders
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Inside your company
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid rgba(26,20,16,.15)" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Price
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        $149 per month
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        $2,000 or $3,500 one-time
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Set per company
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid rgba(26,20,16,.15)" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Time to first pitch
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Today
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        Week 2
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Week 1
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid rgba(26,20,16,.15)" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Guarantee
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Cancel any time
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        Placements or a full refund
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Agreed per company
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.15fr 1.15fr", borderTop: "1px solid rgba(26,20,16,.15)" }}>
                      <div style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Best for
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Teams that already pitch and want the system
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)", background: "#e8e0cc" }}>
                        Founders with time to learn it properly
                      </div>
                      <div style={{ padding: "14px 18px", borderLeft: "1px solid rgba(26,20,16,.15)" }}>
                        Teams that want it built and running fast
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </section>
          {/* ============ 3. § 02 THE METHOD (black band) ============ */}
          <section style={{ background: "#1a1410", color: "#f1ebde" }}>
            <div style={{ borderBottom: "1px solid rgba(241,235,222,.25)" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 02
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  The method
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Six tools · One chain · Every step reads the last
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(48px,6vw,88px) clamp(20px,4vw,56px)" }}>
              <h3 style={{ margin: "0 0 clamp(32px,4vw,48px)", fontSize: "clamp(30px,3.6vw,48px)", fontWeight: "500", lineHeight: "1.08", letterSpacing: "-.02em", maxWidth: "22ch", textWrap: "balance" }}>
                One chain from your story to the placement,
                <em>
                  each tool reading the one before it.
                </em>
              </h3>
              <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", borderTop: "1px solid rgba(241,235,222,.25)", borderLeft: "1px solid rgba(241,235,222,.25)" }}>
                {STEPS.map((s) => (
                  <li key={s.n} style={{ position: "relative", padding: "22px 22px 26px", borderRight: "1px solid rgba(241,235,222,.25)", borderBottom: "1px solid rgba(241,235,222,.25)", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                        {s.n}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "#f5b81f" }}>
                        {s.arrow}
                      </span>
                    </div>
                    <span style={{ fontSize: "24px", fontWeight: "600", letterSpacing: "-.01em", lineHeight: "1.1", marginTop: "auto" }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: "15px", lineHeight: "1.45", color: "rgba(241,235,222,.7)" }}>
                      {s.line}
                    </span>
                  </li>
                ))}
              </ol>
              {/* CoverageIQ pipeline frame */}
              <figure style={{ margin: "clamp(40px,5vw,64px) 0 0" }}>
                <div style={{ border: "1px solid #f1ebde", background: "#f1ebde", color: "#1a1410" }}>
                  <div style={{ height: "28px", background: "#1a1410", borderBottom: "1px solid #f1ebde", display: "flex", alignItems: "center", gap: "10px", padding: "0 12px" }}>
                    <span style={{ width: "9px", height: "9px", background: "#f5b81f", flex: "0 0 auto" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".14em", color: "#f1ebde", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      EMOS · CoverageIQ · Placement pipeline
                    </span>
                  </div>
                  <img src="/assets/emos-platform/S6-coverageiq-pipeline.webp" alt="CoverageIQ pipeline: drafted, sent, replied and placed pitches" style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />
                </div>
                <figcaption style={{ fontStyle: "italic", fontSize: "17px", marginTop: "14px", color: "rgba(241,235,222,.7)" }}>
                  CoverageIQ: every pitch, reply and placement on one board, ready for the next board meeting.
                </figcaption>
              </figure>
            </div>
          </section>
          {/* ============ 4. § 03 WHY EARNED MEDIA, WHY NOW ============ */}
          <section style={{ background: "#f1ebde" }}>
            <div style={{ background: "#1a1410", color: "#f1ebde" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 03
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  Why earned media, why now
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Every number sourced
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,56px) 40px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", borderTop: "1px solid #1a1410", borderLeft: "1px solid #1a1410" }}>
                {EARNED_MEDIA_STATS.map((s, i) => (
                  <StatCell key={s.href + s.text} text={s.text} src={s.src} href={s.href} highlight={i === 0} />
                ))}
              </div>
            </div>
            {/* Outlet marquee */}
            <div style={{ borderTop: "1px solid #1a1410", borderBottom: "1px solid #1a1410" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "12px clamp(20px,4vw,56px)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                Where we&apos;ve placed clients
              </div>
              <div style={{ borderTop: "1px solid rgba(26,20,16,.15)", padding: "14px 0", overflow: "hidden" }}>
                <Marquee items={OUTLETS_A} dur={54} variant="outlet" />
              </div>
              <div style={{ borderTop: "1px solid rgba(26,20,16,.15)", padding: "14px 0", overflow: "hidden" }}>
                <Marquee items={OUTLETS_B} dur={54} variant="outlet" reverse />
              </div>
            </div>
            <div style={{ height: "clamp(40px,5vw,72px)" }} />
          </section>
          {/* ============ 5. § 04 PROOF ============ */}
          <section style={{ background: "#f1ebde" }}>
            <div style={{ background: "#1a1410", color: "#f1ebde" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 04
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  Proof
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Same method · Client results via DMR.agency
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,56px) clamp(56px,6vw,96px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "24px" }}>
                <article style={{ border: "1px solid #1a1410", padding: "32px 28px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "40px", fontWeight: "700", letterSpacing: "-.04em", lineHeight: "1" }}>
                    0 → 1.5M
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                    Monthly visitors · Ridester
                  </span>
                  <blockquote style={{ margin: "12px 0 0", fontSize: "19px", lineHeight: "1.45", fontStyle: "italic", flex: "1", textWrap: "pretty" }}>
                    &quot;Syed and the team&apos;s expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success.&quot;
                  </blockquote>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(26,20,16,.15)", paddingTop: "16px", marginTop: "8px" }}>
                    <img src="/assets/testimonials/brett-helling.jpeg" alt="Brett Helling" style={{ width: "44px", height: "44px", objectFit: "cover", border: "1px solid #1a1410", display: "block" }} loading="lazy" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1" }}>
                      <span style={{ fontSize: "16px", fontWeight: "600" }}>
                        Brett Helling
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.6)" }}>
                        Ridester
                      </span>
                    </div>
                    <a href="https://www.dmr.agency/case-studies/ridester-seo/" style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      Case study →
                    </a>
                  </div>
                </article>
                <article style={{ border: "1px solid #1a1410", padding: "32px 28px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "40px", fontWeight: "700", letterSpacing: "-.04em", lineHeight: "1" }}>
                    +120%
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                    Organic traffic · Centriq
                  </span>
                  <blockquote style={{ margin: "12px 0 0", fontSize: "19px", lineHeight: "1.45", fontStyle: "italic", flex: "1", textWrap: "pretty" }}>
                    &quot;Our organic traffic increased by 120%. Our public database clicks grew by 515%. We saw a 6x increase in average daily signups.&quot;
                  </blockquote>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(26,20,16,.15)", paddingTop: "16px", marginTop: "8px" }}>
                    <img src="/assets/testimonials/imani-lea-brown.jpg" alt="Imani Lea Brown" style={{ width: "44px", height: "44px", objectFit: "cover", border: "1px solid #1a1410", display: "block", flex: "0 0 auto" }} loading="lazy" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1" }}>
                      <span style={{ fontSize: "16px", fontWeight: "600" }}>
                        Imani Lea Brown
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.6)" }}>
                        Centriq
                      </span>
                    </div>
                    <a href="https://www.dmr.agency/case-studies/centriq-digital-pr-growth/" style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      Case study →
                    </a>
                  </div>
                </article>
                <article style={{ border: "1px solid #1a1410", padding: "32px 28px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "40px", fontWeight: "700", letterSpacing: "-.04em", lineHeight: "1" }}>
                    +140%
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,20,16,.65)" }}>
                    Traffic in 3 months · Dinar Standard
                  </span>
                  <blockquote style={{ margin: "12px 0 0", fontSize: "19px", lineHeight: "1.45", fontStyle: "italic", flex: "1", textWrap: "pretty" }}>
                    &quot;They earned high-authority backlinks from Reader&apos;s Digest and MSN. Traffic increased by 140% in 3 months against a 25%/9-month goal.&quot;
                  </blockquote>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(26,20,16,.15)", paddingTop: "16px", marginTop: "8px" }}>
                    <img src="/assets/testimonials/reem-el-shafaki.jpg" alt="Reem El Shafaki" style={{ width: "44px", height: "44px", objectFit: "cover", border: "1px solid #1a1410", display: "block", flex: "0 0 auto" }} loading="lazy" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1" }}>
                      <span style={{ fontSize: "16px", fontWeight: "600" }}>
                        Reem El Shafaki
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(26,20,16,.6)" }}>
                        Dinar Standard
                      </span>
                    </div>
                    <a href="https://www.dmr.agency/case-studies/government-portal-seo/" style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                      Case study →
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>
          {/* ============ 6. § 05 WHO BUILT IT ============ */}
          <section style={{ background: "#f1ebde" }}>
            <div style={{ background: "#1a1410", color: "#f1ebde" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 05
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  Who built it
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Syed Irfan Ajmal
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,56px) clamp(56px,6vw,96px)", display: "flex", flexWrap: "wrap", gap: "40px clamp(40px,5vw,72px)", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 340px", minWidth: "0", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "0" }}>
                <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", border: "1px solid #1a1410", display: "block", background: "#e8e0cc" }} loading="lazy" />
                <div style={{ display: "flex", background: "#1a1410", color: "#f1ebde", marginTop: "16px", border: "1px solid #1a1410" }}>
                  <span style={{ flex: "0 0 112px", background: "#f5b81f", color: "#1a1410", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700", letterSpacing: ".12em", padding: "12px", lineHeight: "1.4" }}>
                    WRITTEN AND CITED IN
                  </span>
                  <span style={{ padding: "12px 14px", fontSize: "15px", lineHeight: "1.4", alignSelf: "center" }}>
                    Forbes Middle East, HuffPost, TNW, HBR (case study)
                  </span>
                </div>
                <div style={{ display: "flex", background: "#1a1410", color: "#f1ebde", border: "1px solid #1a1410", borderTop: "1px solid rgba(241,235,222,.25)" }}>
                  <span style={{ flex: "0 0 112px", background: "#f5b81f", color: "#1a1410", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700", letterSpacing: ".12em", padding: "12px", lineHeight: "1.4" }}>
                    SPEAKER
                  </span>
                  <span style={{ padding: "12px 14px", fontSize: "15px", lineHeight: "1.4", alignSelf: "center" }}>
                    50+ international talks
                  </span>
                </div>
              </div>
              <div style={{ flex: "1.3 1 440px", minWidth: "0", display: "flex", flexDirection: "column", gap: "28px" }}>
                <h3 style={{ margin: "0", fontSize: "clamp(32px,3.8vw,52px)", fontWeight: "500", lineHeight: "1.05", letterSpacing: "-.02em", textWrap: "balance" }}>
                  Someone who has been on both sides of the journalist&apos;s inbox.
                </h3>
                <blockquote style={{ margin: "0", borderLeft: "4px solid #f5b81f", padding: "4px 0 4px 24px", fontSize: "clamp(20px,1.8vw,24px)", lineHeight: "1.4", fontStyle: "italic", textWrap: "pretty" }}>
                  EMOS is what I learned sending pitches as an agency operator and reading them as a columnist. The software, the Academy and the Residency are the same method at three distances from me.
                </blockquote>
                <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.55", color: "rgba(26,20,16,.8)", maxWidth: "60ch", textWrap: "pretty" }}>
                  22 years in business, tech and marketing, the last 13 running DMR.agency. Before that I co-founded an award-winning geo-spatial startup and ran marketing at two self-funded, profitable ventures.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", borderTop: "1px solid #1a1410", borderLeft: "1px solid #1a1410" }}>
                  <div style={{ borderRight: "1px solid #1a1410", borderBottom: "1px solid #1a1410", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "clamp(30px,3vw,40px)", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                      300+
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", lineHeight: "1.5" }}>
                      Clients across the US, EU and Gulf
                    </span>
                  </div>
                  <div style={{ borderRight: "1px solid #1a1410", borderBottom: "1px solid #1a1410", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "clamp(30px,3vw,40px)", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                      $160K → $1.2M
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", lineHeight: "1.5" }}>
                      Monthly organic revenue, National Tyres and Autocare
                    </span>
                  </div>
                  <div style={{ borderRight: "1px solid #1a1410", borderBottom: "1px solid #1a1410", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "clamp(30px,3vw,40px)", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                      0 → 1.5M
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", lineHeight: "1.5" }}>
                      Monthly organic visits, Ridester
                    </span>
                  </div>
                  <div style={{ borderRight: "1px solid #1a1410", borderBottom: "1px solid #1a1410", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "clamp(30px,3vw,40px)", fontWeight: "600", letterSpacing: "-.03em", lineHeight: "1" }}>
                      100+
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", lineHeight: "1.5" }}>
                      Publications with my byline or name
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ============ 7. § 06 WHICH ONE IS FOR ME ============ */}
          <section style={{ background: "#f1ebde" }}>
            <div style={{ background: "#1a1410", color: "#f1ebde" }}>
              <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "16px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 24px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "#f5b81f" }}>
                  § 06
                </span>
                <h2 style={{ margin: "0", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  Which one is for me
                </h2>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", opacity: ".6" }}>
                  Honest filter
                </span>
              </div>
            </div>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,56px) clamp(56px,6vw,96px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: "24px" }}>
                <Link href="/emos-platform" style={{ textDecoration: "none", border: "1px solid #1a1410", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }} className="hq-h3">
                  <p style={{ margin: "0", fontSize: "clamp(22px,2vw,28px)", lineHeight: "1.3", fontStyle: "italic", textWrap: "pretty" }}>
                    &quot;We already send pitches. We want the tooling and the record.&quot;
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: "#f5b81f", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", padding: "5px 10px" }}>
                      PLATFORM
                    </span>
                    <span style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                      EMOS Platform →
                    </span>
                  </div>
                </Link>
                <Link href="/emos-academy" style={{ textDecoration: "none", border: "1px solid #1a1410", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }} className="hq-h3">
                  <p style={{ margin: "0", fontSize: "clamp(22px,2vw,28px)", lineHeight: "1.3", fontStyle: "italic", textWrap: "pretty" }}>
                    &quot;I want to learn the method properly, with other founders, and I want a guarantee.&quot;
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: "#f5b81f", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", padding: "5px 10px" }}>
                      ACADEMY
                    </span>
                    <span style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                      EMOS Academy →
                    </span>
                  </div>
                </Link>
                <Link href="/emos-residency" style={{ textDecoration: "none", border: "1px solid #1a1410", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }} className="hq-h3">
                  <p style={{ margin: "0", fontSize: "clamp(22px,2vw,28px)", lineHeight: "1.3", fontStyle: "italic", textWrap: "pretty" }}>
                    &quot;We have the budget and a person for it, but no time to learn it from scratch.&quot;
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: "#f5b81f", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", padding: "5px 10px" }}>
                      RESIDENCY
                    </span>
                    <span style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                      EMOS Residency →
                    </span>
                  </div>
                </Link>
                <a href="https://www.dmr.agency/" style={{ textDecoration: "none", border: "1px solid rgba(26,20,16,.32)", background: "#e8e0cc", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }} className="hq-h4">
                  <p style={{ margin: "0", fontSize: "clamp(22px,2vw,28px)", lineHeight: "1.3", fontStyle: "italic", color: "rgba(26,20,16,.75)", textWrap: "pretty" }}>
                    &quot;I want someone else to do all of it, forever.&quot;
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: "#f1ebde", border: "1px solid rgba(26,20,16,.55)", color: "rgba(26,20,16,.7)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", padding: "5px 10px" }}>
                      NONE OF THESE
                    </span>
                    <span style={{ fontSize: "16px", color: "rgba(26,20,16,.8)" }}>
                      That is an agency.
                      <span style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px", color: "#1a1410" }}>
                        DMR.agency ↗
                      </span>
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </section>
          {/* ============ 8. CLOSE (black) ============ */}
          <section id="close" style={{ background: "#1a1410", color: "#f1ebde" }}>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "clamp(64px,8vw,120px) clamp(20px,4vw,56px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "28px" }}>
              <span style={{ background: "#f5b81f", color: "#1a1410", border: "1px solid #1a1410", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: ".12em", padding: "5px 10px" }}>
                NOT SURE WHICH?
              </span>
              <h2 style={{ margin: "0", fontSize: "clamp(34px,3.6vw,48px)", fontWeight: "500", lineHeight: "1.08", letterSpacing: "-.02em", maxWidth: "24ch", textWrap: "balance" }}>
                One call, and I will tell you which of the three fits, or that none does.
              </h2>
              <p style={{ margin: "0", fontSize: "19px", lineHeight: "1.55", color: "rgba(241,235,222,.7)", maxWidth: "60ch", textWrap: "pretty" }}>
                Tell me what you sell and where you want to be covered. If the Platform on its own will do, I will say so. If you need the Academy or a Residency, I will say that instead.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 28px", marginTop: "8px" }}>
                <Link href="/strategy-call" style={{ background: "#f5b81f", border: "1px solid #f5b81f", color: "#1a1410", padding: "16px 24px", fontFamily: "var(--font-grot)", fontWeight: "800", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none" }} className="hq-h2">
                  Book a 30-minute call →
                </Link>
                <a href="mailto:sia@syedirfanajmal.com?subject=EMOS" style={{ color: "#f1ebde", fontFamily: "var(--font-mono)", fontSize: "13px", letterSpacing: ".04em", textDecoration: "underline" }}>
                  sia@syedirfanajmal.com
                </a>
              </div>
            </div>
          </section>
          <EmosFamilyBar current="hub" />
          {/* ============ 9. FOOTER ============ */}
          <footer style={{ background: "#f1ebde", borderTop: "1px solid #1a1410" }}>
            <div style={{ maxWidth: "1312px", margin: "0 auto", padding: "22px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 28px" }}>
              <Link href="/emoshq" style={{ textDecoration: "none", background: "#1a1410", color: "#f5b81f", fontFamily: "var(--font-grot)", fontWeight: "900", fontSize: "13px", letterSpacing: ".28em", padding: "7px 7px 7px 11px", lineHeight: "1" }}>
                EMOS
              </Link>
              <a href="https://www.syedirfanajmal.com/" style={{ fontFamily: "var(--font-grot)", fontWeight: "700", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
                Built and run by Syed Irfan Ajmal ↗
              </a>
              <span style={{ fontStyle: "italic", fontSize: "16px", color: "rgba(26,20,16,.7)" }}>
                Why pay for attention when you can earn it?
              </span>
              <nav style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: "8px 20px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase" }}>
                <Link href="/contact" style={{ textDecoration: "none" }}>
                  Contact
                </Link>
                <Link href="/refund-policy" style={{ textDecoration: "none" }}>
                  Refund policy
                </Link>
                <Link href="/privacy" style={{ textDecoration: "none" }}>
                  Privacy
                </Link>
                <Link href="/terms" style={{ textDecoration: "none" }}>
                  Terms
                </Link>
              </nav>
            </div>
          </footer>
        </div>
    </div>
  );
}

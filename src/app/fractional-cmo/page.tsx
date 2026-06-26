"use client";

import { Fragment, useState } from "react";
import { ScrollButtons } from "@/components/ScrollButtons";
import Script from "next/script";
import { Colophon, Subscriptions, CTATicker } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  CAL_LINK,
  CAL_URL,
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Cal.com config strings ───────────────────────────────────────────────────

const CAL_CFG_POPUP = JSON.stringify({ layout: "month_view", metadata: { source: "sia-fractional-cmo" } });
const CAL_CFG_AUDIT = JSON.stringify({ layout: "month_view", metadata: { source: "sia-fractional-cmo-audit" } });

// ─── Data ────────────────────────────────────────────────────────────────────

const AVAILABILITY_SPECS: ReadonlyArray<[string, string]> = [
  ["Engagement", "Monthly retainer · $5K–$10K"],
  ["Minimum",    "6 months"],
  ["Cadence",    "Weekly · 1-on-1 + team"],
  ["Geography",  "Remote · global"],
  ["Stack",      "PR · SEO · content · paid"],
  ["Reports to", "Founder / CEO"],
];

type ScopeItem = { no: string; t: string; d: string };
const SCOPE: ReadonlyArray<ScopeItem> = [
  { no: "01", t: "Strategy ownership",
    d: "Positioning, ICP, GTM plan, brand narrative, quarterly OKRs. I write the marketing strategy and answer for it. No fractional handwaving." },
  { no: "02", t: "Weekly cadence",
    d: "A standing weekly call with the founder, plus a weekly sync with the team or vendors. Decisions get made on the call, not in week-long Slack threads." },
  { no: "03", t: "Execution through DMR.agency",
    d: "You get the agency behind me without buying a second retainer. Digital PR, SEO, content production, link earning, journalist outreach — the full stack at agency rates inside the engagement." },
  { no: "04", t: "Hiring & vendor selection",
    d: "When it is time to add a content lead, a paid-media specialist, or a freelance designer, I run the brief, interview the candidates, and stand behind the hire." },
  { no: "05", t: "Investor & board narrative",
    d: "Marketing slides for board meetings. Investor updates that show growth in language they trust. Sales support when a founder-led deal needs marketing air cover." },
  { no: "06", t: "The hard \"no\"",
    d: "A fractional CMO's most important job is filtering. I will say no to half the marketing ideas in the room. The other half, we will ship." },
];

type Stage = { range: string; t: string; d: string };
const STAGES: ReadonlyArray<Stage> = [
  { range: "Days 1–14",  t: "Intake & audit",
    d: "Founder calls, sales call recordings, competitor scan, audit of every existing marketing asset and channel. You receive a written brief at the end of week two." },
  { range: "Days 15–45", t: "First plan, first wins",
    d: "A 60-day plan: positioning sharpening, ICP, two or three campaigns to ship immediately. We are looking for early signal, not perfection." },
  { range: "Days 45–90", t: "System & cadence",
    d: "The marketing function gets a real shape. Reporting cadence, content pipeline, PR calendar, the weekly rhythm. Hiring brief if a role needs filling." },
  { range: "Day 91+",    t: "Compound or part ways",
    d: "Quarterly review. We either renew, sharpen, or part ways. The retainer is monthly; you are never locked in past sixty days notice." },
];

const FIT_IN: ReadonlyArray<string> = [
  "You are Series A or B and feel marketing is the missing function.",
  "Revenue between roughly $1M and $20M ARR.",
  "You want senior marketing thinking weekly, but not a full-time hire yet.",
  "You can commit to six months of work and decision-making.",
];

const FIT_OUT: ReadonlyArray<string> = [
  "You are pre-product-market-fit. (You need product, not marketing.)",
  "You want someone to \"do marketing\" without setting strategy with you.",
  "You want a CMO five hours a month for $2K. (Retainers start at $5K, and they earn it.)",
  "You are looking for paid-media-only or single-channel help.",
];

const STATS: ReadonlyArray<{ n: string; label: string; sub: string }> = [
  { n: "1.5M",  label: "Monthly visitors",   sub: "Ridester · from zero" },
  { n: "6×",    label: "Daily signups",      sub: "Centriq · SaaS platform" },
  { n: "140%",  label: "Traffic in 3 months", sub: "DinarStandard · govt portal" },
  { n: "$1.2M", label: "Monthly revenue",     sub: "National Tyres & Autocare" },
];

type CaseFile = { tag: string; metric: string; client: string; result: string; body: string; href: string };
const CASE_FILES: ReadonlyArray<CaseFile> = [
  {
    tag: "SAAS · DIGITAL PR",
    metric: "6×",
    client: "CENTRIQ · RAISED $11M",
    result: "6× daily signups for a funded SaaS",
    body: "Digital PR and journalist outreach earned links from MSN, Yahoo, and niche-relevant sites. Organic traffic rose 120%, database clicks grew 515%, and DR moved 35 to 47.",
    href: "https://dmr.agency/case-studies/centriq-digital-pr-growth/",
  },
  {
    tag: "PLATFORM · SEO",
    metric: "1.5M/mo",
    client: "RIDESTER · USA",
    result: "Zero to 1.5M monthly visitors in 12 months",
    body: "460% organic growth through digital PR, visual content, and pay-for-performance journalist outreach. DR climbed 43 to 58 on the way.",
    href: "https://dmr.agency/case-studies/ridester-seo/",
  },
  {
    tag: "B2B · FINANCIAL SERVICES",
    metric: "38×",
    client: "PHYSICIANS THRIVE · USA",
    result: "734 to 29,000+ monthly visitors over 4 years",
    body: "A multi-year engagement: 500+ earned placements including MSN, Business Insider, and AOL, DR 33 to 57, and the CEO positioned as a quoted expert in national press.",
    href: "https://dmr.agency/case-studies/physicians-thrive/",
  },
];

type FAQItem = { q: string; a: string };
const FAQS: ReadonlyArray<FAQItem> = [
  {
    q: "What does it cost?",
    a: "Retainers run $5K to $10K a month depending on scope. For context, a full-time CMO costs $300K+ a year before you have hired a single person to execute; here the execution team comes with the chair. If six months feels like a big first step, the Marketing Leadership Audit below is the smaller one.",
  },
  {
    q: "How many hours a month do I actually get?",
    a: "The engagement is built around outcomes, not hours. In practice, most months include a weekly founder call (45–60 min), a weekly team or vendor sync (30–45 min), and 6–10 hours of async work — strategy documents, briefs, reviews, and decisions. The right question is whether the marketing function is moving, not how many hours are logged.",
  },
  {
    q: "What's the difference between this and hiring a marketing consultant?",
    a: "A consultant advises. I own. I take the marketing chair, write the strategy, and answer for the results alongside you. The weekly cadence means decisions get made in real time, not in a report you receive six weeks later. And the execution layer through DMR.agency means we can move from decision to campaign in days, not quarters.",
  },
  {
    q: "Do you work with non-tech companies?",
    a: "Yes. The framework travels across categories — SaaS, professional services, e-commerce, and media all follow the same earned-media and positioning logic. Clients in this portfolio include a government web portal, a gig-economy platform, an addiction treatment centre, and an automotive chain. The pattern is consistent: earned authority, a content system, and a growth loop tied to the sales motion.",
  },
  {
    q: "What happens when the engagement ends?",
    a: "You keep everything. Strategy documents, brand guidelines, editorial calendar, vendor relationships, and every playbook we built together. I write a transition brief at the close and will introduce the person taking the seat after me if that is relevant. The goal is to leave the function stronger than I found it — not to create dependency.",
  },
  {
    q: "Can we bring you on full-time later?",
    a: "It happens occasionally, but it is rarely the right move. The fractional model works because you get senior marketing thinking without a senior salary. If the company grows to a stage where a full-time CMO is warranted, I will help you find and hire the right person — that is a natural part of the engagement.",
  },
  {
    q: "Do you take equity?",
    a: "No. The retainer is cash-only. Equity complicates the relationship in ways that tend to hurt early-stage companies — it shifts incentives around spending, hiring, and timelines in subtle but real ways. A clean monthly retainer keeps incentives aligned: I need to produce visible results every month to keep the seat.",
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER }}>
    <div className="res-hero-grid">

      {/* Left: count */}
      <div className="res-hero-left">
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
          2
        </div>
        <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
          ● 2 CMO SPOTS<br />Q3 2026
        </div>
      </div>

      {/* Centre: headline */}
      <div className="res-hero-center">
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
          CMO
        </div>
        <SCaps size={10} ls="0.24em" color={INK55}>
          Senior Marketing Leadership &nbsp;&middot;&nbsp; On retainer &nbsp;&middot;&nbsp; By the month
        </SCaps>
        <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Marketing leadership,<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>without the headcount.</em>
        </h1>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
          For B2B and SaaS founders: marketing leadership led by digital PR, SEO, and content, the channels that compound. Strategy ownership, weekly cadence, and agency-level execution through DMR.agency.
        </p>
      </div>

      {/* Right: topic index */}
      <div className="res-hero-right">
        {[
          { label: "Strategy",   sub: "Positioning & GTM" },
          { label: "Execution",  sub: "PR, SEO, content" },
          { label: "Reporting",  sub: "Board & investor" },
        ].map(t => (
          <div key={t.label}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>{t.label}</div>
            <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>{t.sub}</div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

// ─── CMO Lead ─────────────────────────────────────────────────────────────────

const CMOLead = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 48, paddingBottom: 70 }}>
    <DoubleRule style={{ margin: "0 0 36px" }} />
    <div className="grid-hero-2col">
      {/* Lead body */}
      <div className="hero-body" style={{ fontFamily: SERIF, fontSize: 17.5, color: INK, lineHeight: 1.55, textAlign: "justify" }}>
        <p style={{ margin: 0 }}>
          <span className="hero-drop-cap" style={{ float: "left", fontFamily: SERIF, fontWeight: 700, fontStyle: "italic", lineHeight: 0.78, marginRight: 10, marginTop: 6, color: INK, background: YEL, padding: "6px 8px 2px 8px" }}>
            F
          </span>
          or founders without a marketing leader. I take the marketing chair at
          your table on a monthly retainer: strategy ownership, weekly cadence,
          agency-level execution through <strong>DMR.agency</strong>, and the
          kind of decision-making that does not wait on a six-month CMO search.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          The role looks different at every company, but the shape is
          consistent: I show up weekly, I own the marketing function end to
          end, and I have a small team behind me that can execute almost
          anything we decide on, almost immediately. PR, SEO, content,
          lifecycle, paid, brand. Hiring and vendor selection when it is time.
          Board and investor updates when those are needed.
        </p>
        <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
          Retainers run $5K&ndash;$10K a month depending on scope: a fraction
          of the $300K+ a full-time CMO costs, with agency execution included
          rather than billed on top. Six-month minimum, with sixty days&rsquo;
          notice after the first quarter, so you are never locked in.
          ● 2 FRACTIONAL CMO SPOTS · Q3 2026 — book the call below if you
          would like to discuss.
        </p>
      </div>

      {/* Availability aside */}
      <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: 24 }}>
        <Pill size={11} ls="0.20em">Availability</Pill>
        <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 700 }}>
          ● 2 FRACTIONAL CMO SPOTS · Q3 2026
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px" }}>
          {AVAILABILITY_SPECS.map(([k, v]) => (
            <Fragment key={k}>
              <div><SCaps size={10} ls="0.16em" color={INK55}>{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.4 }}>{v}</div>
            </Fragment>
          ))}
        </div>
        {/* Cal.com popup CTA */}
        <a
          href={CAL_URL}
          data-cal-link={CAL_LINK}
          data-cal-config={CAL_CFG_POPUP}
          style={{ marginTop: 22, display: "block", textAlign: "center", padding: "14px 18px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Book a discovery call &rarr;
        </a>
      </aside>
    </div>
  </section>
);

// ─── Stats Strip ──────────────────────────────────────────────────────────────

const StatsStrip = () => (
  <section style={{ background: INK }}>
    <div
      className="sx"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      {STATS.map((s, i) => (
        <div
          key={i}
          style={{
            padding: "36px 24px",
            borderRight: i < STATS.length - 1 ? `1px solid rgba(250,250,250,.12)` : "none",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px, 3.8vw, 44px)", color: YEL, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {s.n}
          </div>
          <div style={{ marginTop: 7, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: PAPER }}>
            {s.label}
          </div>
          <div style={{ marginTop: 4, fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "rgba(250,250,250,.45)", lineHeight: 1.4 }}>
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── §01 · Scope ─────────────────────────────────────────────────────────────

const Scope = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="01" label="Scope of the retainer · Six things included" />

    <div className="grid-intro">
      <h2
        className="h2-xl"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Six things
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>you actually get.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 19,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 560,
        }}
      >
        Fractional CMO is a phrase that has been used to mean almost anything
        in the last two years. Here is what it means in my work,
        specifically.
      </p>
    </div>

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {SCOPE.map((s) => (
        <div
          key={s.no}
          className="card-border"
          style={{
            padding: "28px 24px 26px",
            background: PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 240,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(32px, 6vw, 48px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {s.no}
          </div>
          <HRule style={{ margin: "14px 0 16px" }} />
          <h4
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 22,
              color: INK,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {s.t}
          </h4>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: SERIF,
              fontSize: 15,
              color: INK70,
              lineHeight: 1.55,
              fontStyle: "italic",
              flex: 1,
            }}
          >
            {s.d}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §02 · Case Files ────────────────────────────────────────────────────────

const CaseFiles = () => (
  <section
    className="sx"
    style={{
      background: PAPER2,
      paddingTop: 90,
      paddingBottom: 90,
      borderTop: `1px solid ${INK}`,
    }}
  >
    <SectionMast n="02" label="From the case files · Results on the record" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        The numbers,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>in print.</Mark>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        These campaigns were run by my team at DMR.agency, the same team that
        executes inside every Fractional CMO retainer. Full write-ups are in
        the public record.
      </p>
    </div>

    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {CASE_FILES.map((c) => (
        <div
          key={c.client}
          className="card-border"
          style={{ padding: "28px 24px 26px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 280 }}
        >
          <SCaps size={10} ls="0.18em" color={INK55}>{c.tag}</SCaps>
          <div style={{ marginTop: 14, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px, 5vw, 54px)", color: INK, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {c.metric}
          </div>
          <div style={{ marginTop: 10 }}>
            <SCaps size={10.5} ls="0.16em" color={INK55}>{c.client}</SCaps>
          </div>
          <h4 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            {c.result}
          </h4>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>
            {c.body}
          </p>
          <HRule style={{ margin: "16px 0 12px" }} />
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none" }}
          >
            Read the case file &rarr;
          </a>
        </div>
      ))}
    </div>

    <p style={{ margin: "22px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
      Twelve more case files, including $160K to $1.2M a month in organic
      revenue for an automotive retailer, are in{" "}
      <a href="https://dmr.agency/case-studies/" target="_blank" rel="noopener noreferrer" style={{ color: INK, textDecoration: "underline" }}>
        the archive &rarr;
      </a>
    </p>
  </section>
);

// ─── §03 · First 90 Days ─────────────────────────────────────────────────────

const Timeline = () => (
  <section
    className="sx"
    style={{
      background: PAPER2,
      paddingTop: 90,
      paddingBottom: 90,
      borderTop: `1px solid ${INK}`,
      borderBottom: `1px solid ${INK}`,
    }}
  >
    <SectionMast n="03" label="The first 90 days · A working shape" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Ninety days,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>specifically.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Most fractional engagements drift in the first quarter. To avoid that,
        every retainer follows the same opening shape &mdash; and we
        calibrate from there.
      </p>
    </div>

    <div
      className="grid-steps-4"
      style={{ border: `1px solid ${INK}` }}
    >
      {STAGES.map((s) => (
        <div
          key={s.range}
          className="step-card"
          style={{
            padding: "26px 22px 24px",
            background: PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 240,
          }}
        >
          <SCaps size={10.5} ls="0.18em" color={INK55}>{s.range}</SCaps>
          <h4
            style={{
              margin: "12px 0 0",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 24,
              color: INK,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {s.t}
          </h4>
          <HRule style={{ margin: "14px 0" }} />
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 15,
              color: INK70,
              lineHeight: 1.55,
              fontStyle: "italic",
              flex: 1,
            }}
          >
            {s.d}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §03 · Fit ────────────────────────────────────────────────────────────────

const Fit = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="04" label="Is it for you · The honest filter" />

    <div
      className="grid-subscriptions"
      style={{ border: `1px solid ${INK}` }}
    >
      {/* Yes if */}
      <div
        style={{
          padding: "36px 36px 32px",
          background: PAPER2,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <Pill size={11} ls="0.20em">Yes if</Pill>
          <SCaps size={10.5} ls="0.18em" color={INK55}>Good fit</SCaps>
        </div>
        <ul
          style={{
            margin: "20px 0 0",
            padding: 0,
            listStyle: "none",
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            lineHeight: 1.5,
          }}
        >
          {FIT_IN.map((line, j) => (
            <li
              key={j}
              style={{
                padding: "14px 0 14px 28px",
                position: "relative",
                borderBottom: j < FIT_IN.length - 1 ? `1px solid ${INK15}` : "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 16,
                  height: 16,
                  background: YEL,
                  border: `1.5px solid ${INK}`,
                  display: "inline-block",
                }}
              />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Probably not if */}
      <div style={{ padding: "36px 36px 32px", background: PAPER }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 9px 5px",
              border: `1.5px solid ${INK}`,
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: INK70,
            }}
          >
            Probably not if
          </span>
          <SCaps size={10.5} ls="0.18em" color={INK55}>
            Save us both the call
          </SCaps>
        </div>
        <ul
          style={{
            margin: "20px 0 0",
            padding: 0,
            listStyle: "none",
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            lineHeight: 1.5,
          }}
        >
          {FIT_OUT.map((line, j) => (
            <li
              key={j}
              style={{
                padding: "14px 0 14px 28px",
                position: "relative",
                borderBottom: j < FIT_OUT.length - 1 ? `1px solid ${INK15}` : "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 16,
                  height: 16,
                  border: `1.5px solid ${INK}`,
                  background: "transparent",
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 3,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: INK,
                  fontWeight: 700,
                }}
              >
                &times;
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

// ─── §04 · Client Results ─────────────────────────────────────────────────────

type CMOTestimonial = { quote: string; name: string; role: string; place: string; photo: string; stat?: string };
const CMO_TESTIMONIALS: ReadonlyArray<CMOTestimonial> = [
  {
    quote:
      "Their biggest weapon has been doing outreach to earn high-quality " +
      "backlinks and mentions at scale from the likes of Forbes, Mashable, " +
      "Reader's Digest, and hundreds of other authority sites. The biggest " +
      "success story has been helping grow Ridester from zero to 1.5 million " +
      "monthly visitors.",
    name: "Brett Helling",
    role: "Enterprise SEO Lead, ClickUp",
    place: "Omaha, NE",
    photo: "/assets/testimonials/brett-helling.jpeg",
    stat: "0 to 1.5M monthly visitors",
  },
  {
    quote:
      "Syed's team earned us high authority links from publications like MSN " +
      "and Yahoo. Our main site's organic traffic increased by 120%. Our " +
      "Public Database saw a 515% increase in clicks, and our average daily " +
      "signups grew 6x.",
    name: "Imani Lea Brown",
    role: "Content Architect and Systems Designer",
    place: "San Francisco",
    photo: "/assets/testimonials/imani-lea-brown.jpg",
    stat: "120% traffic, 6x signups",
  },
  {
    quote:
      "Irfan and his team earned high authority backlinks from publications " +
      "like Reader's Digest and MSN. The web portal's traffic increased by " +
      "140% in 3 months, greatly exceeding our goals.",
    name: "Reem El Shafaki",
    role: "Partner, DinarStandard",
    place: "Dubai",
    photo: "/assets/testimonials/reem-el-shafaki.jpg",
    stat: "140% traffic in 3 months",
  },
  {
    quote:
      "So chuffed to see a keyword rank to position #4 in Google that gets " +
      "over 160,000 searches a month — most with commercial intent to buy. " +
      "Cannot thank Syed Irfan Ajmal and the team enough. They are getting " +
      "hundreds of keywords for this site ranked.",
    name: "Azzam Sheikh",
    role: "Head of Digital, National Tyres & Autocare",
    place: "United Kingdom",
    photo: "/assets/testimonials/azzam-sheikh.jpeg",
    stat: "$160K → $1.2M monthly revenue",
  },
  {
    quote:
      "Within 2 months we saw quality links from Healthline (DR 92), " +
      "The Mirror (DR 90), MSN (DR 92), and Consumer Health Digest (DR 68). " +
      "Our domain rating went from 1 to 27. If you are looking to boost " +
      "organic traffic and earn quality backlinks, we highly recommend DMR.agency.",
    name: "Trent Carter",
    role: "CEO & Founder, Curednation",
    place: "USA",
    photo: "/assets/testimonials/trent-carter.jpeg",
    stat: "DR 1 → 27 in 2 months",
  },
  {
    quote:
      "Irfan always goes above and beyond when it comes to strategizing our " +
      "SEO tactics. He has provided really helpful recommendations and feedback " +
      "on our website to help us make it as user-friendly and SEO optimized " +
      "as possible.",
    name: "Bridget Hanson",
    role: "Manager of Grants and Community Engagement",
    place: "USA",
    photo: "/assets/testimonials/bridget-hanson.jpg",
  },
];

const CMOTestimonials = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="05" label="On the record · Named clients, real numbers" />
    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        What clients
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>have said.</Mark>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        Results from clients across SEO, digital PR, content, and growth. Numbers, publications, and the people behind them.
      </p>
    </div>
    <div className="grid-testimonials" style={{ border: `1px solid ${INK}` }}>
      {CMO_TESTIMONIALS.map((tm, i) => (
        <article key={i} className="letter-card" style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <Pill size={10.5} ls="0.18em">&numero; {String(i + 1).padStart(2, "0")}</Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>Filed from {tm.place}</SCaps>
          </div>
          <blockquote
            style={{
              margin: "20px 0 0", fontFamily: SERIF, fontSize: "clamp(15px, 2.8vw, 20px)",
              color: INK, lineHeight: 1.4, fontStyle: "italic", position: "relative",
              paddingLeft: 36, flex: 1,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute", left: 0, top: -4, fontFamily: SERIF,
                fontSize: 72, lineHeight: 1, color: YEL, fontStyle: "italic",
                pointerEvents: "none", userSelect: "none", opacity: 0.9,
              }}
            >&ldquo;</span>
            {tm.quote}
          </blockquote>
          <HRule style={{ margin: "22px 0 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tm.photo} alt={tm.name} width={44} height={44}
                style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${INK}`, objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK }}>{tm.name}</div>
                <div style={{ marginTop: 3 }}><SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps></div>
              </div>
            </div>
            {tm.stat && (
              <div style={{ padding: "5px 10px", background: INK, color: YEL, fontFamily: GROT, fontSize: 10, fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {tm.stat}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);

// ─── §05 · FAQ ────────────────────────────────────────────────────────────────

const FAQ = () => (
  <section
    className="sx"
    style={{
      background: PAPER2,
      paddingTop: 90,
      paddingBottom: 90,
      borderTop: `1px solid ${INK}`,
      borderBottom: `1px solid ${INK}`,
    }}
  >
    <SectionMast n="06" label="Common questions · The honest answers" />
    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        Questions worth
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>asking upfront.</Mark>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        The ones that come up most in discovery calls. Better to have them answered before we speak.
      </p>
    </div>
    <div style={{ border: `1px solid ${INK}`, marginTop: 40 }}>
      {FAQS.map((faq, i) => (
        <div
          key={i}
          style={{
            borderBottom: i < FAQS.length - 1 ? `1px solid ${INK}` : "none",
            padding: "28px 32px",
            background: i % 2 === 0 ? PAPER : PAPER2,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(16px, 2.2vw, 20px)",
              color: INK,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              marginBottom: 12,
            }}
          >
            {faq.q}
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 16,
              color: INK70,
              lineHeight: 1.65,
              fontStyle: "italic",
              maxWidth: 800,
            }}
          >
            {faq.a}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ─── CMO Inquiry Form ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  background: "rgba(250,250,250,.06)",
  border: "1px solid rgba(250,250,250,.35)",
  color: PAPER,
  fontFamily: SERIF,
  fontSize: 15,
  lineHeight: 1.4,
  outline: "none",
  boxSizing: "border-box",
  caretColor: YEL,
};

const CMOInquiryForm = () => {
  const [fields, setFields] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/cmo-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ padding: "22px 26px", border: "1px solid rgba(250,250,250,.25)", background: "rgba(250,250,250,.06)" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: YEL, marginBottom: 6 }}>
          Message received.
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(250,250,250,.65)", lineHeight: 1.55 }}>
          I&rsquo;ll get back to you within one working day.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="cmo-form" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{`
        .cmo-form input::placeholder,
        .cmo-form textarea::placeholder { color: rgba(250,250,250,.4); }
        .cmo-form input:focus,
        .cmo-form textarea:focus { border-color: rgba(250,250,250,.7); outline: none; }
      `}</style>
      {/* Honeypot */}
      <input name="website" type="text" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          type="text"
          placeholder="Name *"
          value={fields.name}
          onChange={set("name")}
          required
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email *"
          value={fields.email}
          onChange={set("email")}
          required
          style={inputStyle}
        />
      </div>
      <input
        type="text"
        placeholder="Company (optional)"
        value={fields.company}
        onChange={set("company")}
        style={inputStyle}
      />
      <textarea
        placeholder="What&apos;s the situation? *"
        value={fields.message}
        onChange={set("message")}
        required
        rows={4}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {status === "error" && (
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "#f87171" }}>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px",
          background: "transparent",
          color: PAPER,
          border: `1px solid ${PAPER}`,
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          cursor: status === "sending" ? "not-allowed" : "pointer",
          opacity: status === "sending" ? 0.6 : 1,
        }}
      >
        <span>{status === "sending" ? "Sending…" : "Send message"}</span>
        <span style={{ fontFamily: SERIF, fontSize: 20 }}>→</span>
      </button>
    </form>
  );
};

// ─── §06 · Book the Call ──────────────────────────────────────────────────────

const BookCall = () => (
  <section id="book" className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="07" label="The next move · Thirty minutes, no pitch deck" />

    <div
      className="grid-dark-card"
      style={{
        background: INK,
        color: PAPER,
        padding: "40px 32px",
        position: "relative",
        border: `1px solid ${INK}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          right: -1,
          padding: "8px 16px",
          background: YEL,
          color: INK,
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          border: `1px solid ${INK}`,
        }}
      >
        ● 2 FRACTIONAL CMO SPOTS · Q3 2026
      </div>

      <div>
        <SCaps size={11} ls="0.20em" color={YEL}>
          The honest next step
        </SCaps>
        <h2
          className="h2-sm"
          style={{
            margin: "14px 0 0",
            fontFamily: SERIF,
            fontWeight: 700,
            color: PAPER,
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
          }}
        >
          Thirty minutes,
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>no pitch deck.</span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: SERIF,
            fontSize: 17.5,
            color: "rgba(250,250,250,.72)",
            lineHeight: 1.55,
            maxWidth: 520,
          }}
        >
          Tell me where the business is, where you want it to be in twelve
          months, and what marketing has and has not done so far. I will tell
          you honestly whether a Fractional CMO is the right answer, or
          something else is.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Primary CTA */}
        <a
          href="https://www.syedirfanajmal.com/strategy-call"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 26px",
            background: YEL,
            color: INK,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          <span>Book a discovery call</span>
          <span style={{ fontFamily: SERIF, fontSize: 22 }}>→</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(250,250,250,.15)" }} />
          <SCaps size={10} ls="0.18em" color="rgba(250,250,250,.35)">or send a message</SCaps>
          <div style={{ flex: 1, height: 1, background: "rgba(250,250,250,.15)" }} />
        </div>
        <CMOInquiryForm />
        <div style={{ marginTop: 6 }}>
          <SCaps size={10.5} ls="0.16em" color="rgba(250,250,250,.55)">
            Reply within one working day. Time zone: GMT+5.
          </SCaps>
        </div>

        {/* What happens next */}
        <div style={{ marginTop: 22, paddingTop: 24, borderTop: `1px solid rgba(250,250,250,.15)` }}>
          <SCaps size={10} ls="0.18em" color="rgba(250,250,250,.4)">What happens next</SCaps>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px 24px" }}>
            {([
              { n: "01", t: "30-min call",         d: "Tell me where the business is and where you need it in 12 months." },
              { n: "02", t: "Proposal in 48h",     d: "If we're a fit, I'll send a written scope and retainer proposal within two working days." },
              { n: "03", t: "Start within a week", d: "No lengthy onboarding. Intake begins and the first weekly call is booked immediately." },
            ] as const).map(step => (
              <div key={step.n}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12, color: YEL, letterSpacing: "0.04em" }}>{step.n}</div>
                <div style={{ marginTop: 4, fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: PAPER, lineHeight: 1.25 }}>{step.t}</div>
                <div style={{ marginTop: 5, fontFamily: SERIF, fontSize: 13, color: "rgba(250,250,250,.5)", lineHeight: 1.55, fontStyle: "italic" }}>{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Start smaller: the audit */}
    <div
      style={{
        marginTop: 28,
        border: `1px solid ${INK}`,
        background: PAPER2,
        padding: "30px 32px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "20px 32px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: "1 1 480px" }}>
        <Pill size={11} ls="0.20em">Or start smaller</Pill>
        <h3 style={{ margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          The Marketing Leadership Audit.
        </h3>
        <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 16, color: INK70, lineHeight: 1.6, fontStyle: "italic", maxWidth: 640 }}>
          The first two weeks of the retainer, sold on its own: founder calls,
          sales-call recordings, competitor scan, a full audit of every
          marketing asset and channel, and a written brief at the end. $3,000,
          fixed. If you move into the retainer, the fee credits 100% against
          your first month.
        </p>
      </div>
      {/* Cal.com popup CTA — audit */}
      <a
        href={CAL_URL}
        data-cal-link={CAL_LINK}
        data-cal-config={CAL_CFG_AUDIT}
        style={{
          display: "inline-block",
          padding: "16px 24px",
          background: INK,
          color: PAPER,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        Book the audit &rarr;
      </a>
    </div>
  </section>
);

// ─── Tools band ───────────────────────────────────────────────────────────────

const ToolsBand = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 56, paddingBottom: 56, borderTop: `1px solid ${INK}` }}>
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "16px 32px" }}>
      <div style={{ flex: "1 1 480px" }}>
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
          Not ready for the call?
        </h3>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 16, color: INK70, lineHeight: 1.6, fontStyle: "italic", maxWidth: 620 }}>
          Run the tools my clients use, free in the library: PressIQ,
          SignalIQ, JournoCollabIQ, Partner Collab IQ, and 14 more kits,
          playbooks, and calculators.
        </p>
      </div>
      <a
        href="/resources"
        style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `2px solid ${INK}`, paddingBottom: 4, whiteSpace: "nowrap" }}
      >
        Browse the library &rarr;
      </a>
    </div>
  </section>
);

// ─── Cal.com Inline Booking ───────────────────────────────────────────────────

const CalSection = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${INK}` }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK }}>
        Book a slot
      </p>
      <h2 style={{ margin: "0 0 36px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 48px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
        Pick a time that works for you.
      </h2>
      <div
        id="cal-inline-fractional-cmo"
        style={{ minWidth: 320, height: 700, overflow: "scroll" }}
      />
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FractionalCMOPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      {/* Initialise Cal.com inline embed for the booking section */}
      <Script id="cal-inline-fcmo" strategy="afterInteractive">{`
        (function tryInit() {
          if (typeof Cal !== "undefined") {
            Cal("inline", {
              elementOrSelector: "#cal-inline-fractional-cmo",
              calLink: "syed-irfan-ajmal-cjjebv/30min",
              config: { layout: "month_view" },
            });
          } else {
            setTimeout(tryInit, 200);
          }
        })();
      `}</Script>
      <Hero />
      <CMOLead />
      <StatsStrip />
      <Scope />
      <CaseFiles />
      <Timeline />
      <Fit />
      <CMOTestimonials />
      <FAQ />
      <BookCall />
      <CalSection />
      <ToolsBand />
      <CTATicker />
      <Subscriptions sectionNumber="08" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

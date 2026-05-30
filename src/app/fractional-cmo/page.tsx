"use client";

import { Fragment } from "react";
import Script from "next/script";
import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  CALENDLY,
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

// ─── Data ────────────────────────────────────────────────────────────────────

const AVAILABILITY_SPECS: ReadonlyArray<[string, string]> = [
  ["Engagement", "Monthly retainer"],
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
  { no: "06", t: "The hard “no”",
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
  "You want someone to “do marketing” without setting strategy with you.",
  "You want a CMO five hours a month for $2K. (Not what this is.)",
  "You are looking for paid-media-only or single-channel help.",
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
          Seats open<br />this quarter
        </div>
      </div>

      {/* Centre: headline */}
      <div className="res-hero-center">
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
          CMO
        </div>
        <SCaps size={10} ls="0.24em" color={INK55}>
          Senior Marketing Leadership &nbsp;·&nbsp; On retainer &nbsp;·&nbsp; By the month
        </SCaps>
        <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Marketing leadership,<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>without the headcount.</em>
        </h1>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
          Strategy ownership, weekly cadence, and agency-level execution through DMR.agency.
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
          Six-month minimum engagement. Monthly retainer. Two seats open this
          quarter; book the call below if you would like to discuss.
        </p>
      </div>

      {/* Availability aside */}
      <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: 24 }}>
        <Pill size={11} ls="0.20em">Availability</Pill>
        <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 700 }}>
          Two seats open<br />
          <span style={{ fontStyle: "italic", fontWeight: 600 }}>this quarter.</span>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px" }}>
          {AVAILABILITY_SPECS.map(([k, v]) => (
            <Fragment key={k}>
              <div><SCaps size={10} ls="0.16em" color={INK55}>{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.4 }}>{v}</div>
            </Fragment>
          ))}
        </div>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ marginTop: 22, display: "block", textAlign: "center", padding: "14px 18px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Book a discovery call →
        </a>
      </aside>
    </div>
  </section>
);

// ─── §01 · Scope ─────────────────────────────────────────────────────────────

const Scope = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="01" label="What's on the table · Scope of the retainer" />

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
        in the last two years. Here is what it means at this bureau,
        specifically.
      </p>
    </div>

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {SCOPE.map((s, i) => (
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

// ─── §02 · First 90 Days ─────────────────────────────────────────────────────

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
    <SectionMast n="02" label="The first 90 days · A working shape" />

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
        every retainer at this bureau follows the same opening shape — and we
        calibrate from there.
      </p>
    </div>

    <div
      className="grid-steps-4"
      style={{ border: `1px solid ${INK}` }}
    >
      {STAGES.map((s, i) => (
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
    <SectionMast n="03" label="Is it for you · The honest filter" />

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
                ×
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
    photo: "/assets/testimonials/brett-helling.jpg",
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
    <SectionMast n="04" label="Client results · On the record" />
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
            <Pill size={10.5} ls="0.18em">№ {String(i + 1).padStart(2, "0")}</Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>Filed from {tm.place}</SCaps>
          </div>
          <blockquote
            style={{
              margin: "20px 0 0", fontFamily: SERIF, fontSize: "clamp(15px, 2.8vw, 20px)",
              color: INK, lineHeight: 1.4, fontStyle: "italic", position: "relative",
              paddingLeft: 32, flex: 1,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute", left: -4, top: -10, fontFamily: SERIF,
                fontSize: 84, lineHeight: 1, color: INK, fontStyle: "italic",
                background: YEL, padding: "0 4px",
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

// ─── §05 · Book the Call ──────────────────────────────────────────────────────

const BookCall = () => (
  <section id="book" className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="05" label="Book the call · The next move" />

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
        Two seats open · Q3
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
            color: "rgba(241,235,222,.72)",
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
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
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
        <a
          href="mailto:sia@syedirfanajmal.com"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 26px",
            background: "transparent",
            color: PAPER,
            border: `1px solid ${PAPER}`,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          <span>Email instead</span>
          <span style={{ fontFamily: SERIF, fontSize: 22 }}>↗</span>
        </a>
        <div style={{ marginTop: 10 }}>
          <SCaps size={10.5} ls="0.16em" color="rgba(241,235,222,.55)">
            Reply within one working day. Time zone: GMT+5.
          </SCaps>
        </div>
      </div>
    </div>
  </section>
);

// ─── Calendly ─────────────────────────────────────────────────────────────────

const CalendlySection = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${INK}` }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK }}>
        Book a slot
      </p>
      <h2 style={{ margin: "0 0 36px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 48px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
        Pick a time that works for you.
      </h2>
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/sia_dmr_agency/emos?hide_event_type_details=1"
        style={{ minWidth: 320, height: 700 }}
      />
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FractionalCMOPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <Hero />
      <CMOLead />
      <Scope />
      <Timeline />
      <Fit />
      <CMOTestimonials />
      <BookCall />
      <CalendlySection />
      <Subscriptions sectionNumber="07" />
      <Colophon />
    </div>
  );
}

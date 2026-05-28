"use client";

import { useState, Fragment } from "react";
import Script from "next/script";
import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import { ClientLogo } from "@/components/bureau/ClientLogo";
import {
  DoubleRule,
  Flag,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
} from "@/components/bureau/primitives";
import {
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
import { CLIENTS_PRE, CLIENTS_TIER1 } from "@/data/clients";

// ─── Data ────────────────────────────────────────────────────────────────────

const BOOKING_SPECS: ReadonlyArray<[string, string]> = [
  ["Format",    "Keynote · Workshop · Panel · Webinar"],
  ["Duration",  "20 min · 45 min · half-day · full-day"],
  ["Languages", "English (primary), Urdu, Pashto"],
  ["Travel",    "Asia, MENA, Europe · virtual worldwide"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["04",  "countries hosted on stage"],
  ["06",  "speaker formats offered"],
  ["12+", "webinars & guest podcasts"],
  ["200", "biggest live audience (DMSS, Bali)"],
];

type PrimaryTopic = {
  no: string;
  label: string;
  title: string;
  blurb: string;
  bullets: string[];
  casestudy: { v: string; l: string };
};

const PRIMARY_TOPICS: ReadonlyArray<PrimaryTopic> = [
  {
    no: "01",
    label: "Primary topic · most-requested",
    title: "Digital PR for Publicity",
    blurb:
      "How to land bylines, quotes and features in publications your buyers actually read — without paying for a PR agency. HARO, journalist outreach, story design.",
    bullets: [
      "Why earned media outperforms paid in 2026",
      "The HARO playbook: pitch, follow-up, conversion",
      "Tactics for landing Forbes, HBR, HuffPost",
      "Building a journalist relationship that compounds",
      "Measuring earned media ROI (the right way)",
    ],
    casestudy: { v: "60+", l: "media placements · single campaign" },
  },
  {
    no: "02",
    label: "Primary topic · most-requested",
    title: "Boosting Organic Visibility Through SEO-PR",
    blurb:
      "The synthesis of SEO and digital PR. How to compound rankings and authority by earning links from publications, not buying them. Built on a hundred client campaigns.",
    bullets: [
      "The SEO-PR loop: content → outreach → authority → rankings",
      "Where in-house teams plateau, and how to break through",
      "Live case studies: Ridester (0 → 1.5M visitors)",
      "How Centriq saw 120% traffic and 6× signups",
      "A repeatable system for organic, durable growth",
    ],
    casestudy: { v: "6×", l: "daily signups · Centriq case" },
  },
];

type SupportingTopic = { title: string; blurb: string };
const SUPPORTING_TOPICS: ReadonlyArray<SupportingTopic> = [
  {
    title: "Writing Your Way to Success",
    blurb:
      "Content marketing that builds brand, authority, and pipeline — with three case studies (Buffer, River Pools, a client at $200K/mo).",
  },
  {
    title: "Brand Yourself for Success",
    blurb:
      "Personal branding for founders & operators. The five pillars: clarity, consistency, content, community, credibility.",
  },
  {
    title: "Media Hacks · Free Publicity",
    blurb:
      "A tactical, repeatable, no-budget playbook for getting featured in Forbes, HBR and HuffPost without an agency retainer.",
  },
];

type Reel = {
  id: string;
  title: string;
  venue: string;
  city: string;
  region: string;
  note: string;
  badge?: string;
};

const REELS: ReadonlyArray<Reel> = [
  { id: "uSn4s5ZbJcQ", title: "Panel · Marketing to the Modern Muslim Traveller",
    venue: "Arabian Travel Market 2018", city: "Dubai",     region: "UAE",        note: "Finalist · onstage with industry leaders.", badge: "Featured" },
  { id: "2mJ3o2LyWAc", title: "Media Hacks · Free Publicity Online",
    venue: "IN5 Innovation Hub",        city: "Dubai",     region: "UAE",        note: "Workshop · the earned-media playbook"                           },
  { id: "50SIoLI-TW4", title: "Digital Marketing Workshop at MaGIC",
    venue: "MaGIC",                     city: "Cyberjaya", region: "Malaysia",   note: "Workshop · marketing for entrepreneurs"                         },
  { id: "OwQpDj4c1LE", title: "DMSS Conference · Media Hacks",
    venue: "DMSS",                      city: "Bali",      region: "Indonesia",  note: "Workshop · ~200 attendees"                                      },
  { id: "rRUS5dlJdc4", title: "Personal Branding Workshop",
    venue: "Durshal",                   city: "Peshawar",  region: "Pakistan",   note: "Workshop · the five pillars"                                    },
  { id: "zBUeBo4srpA", title: "Writing Your Way to Success",
    venue: "Webinar",                   city: "Remote",    region: "US / UK",    note: "20 min · three case studies"                                    },
];

type Stage = {
  yr: string; evt: string; city: string; country: string;
  fmt: string; topic: string; flag?: "AE" | "GB" | "US"; tag?: string;
};

const STAGES: ReadonlyArray<Stage> = [
  { yr: "2018",    evt: "IN5 Innovation Hub",           city: "Dubai",     country: "UAE",       fmt: "Workshop", topic: "Media Hacks · Free Publicity"                          },
  { yr: "2018",    evt: "Durshal",                      city: "KP",        country: "Pakistan",  fmt: "Workshop", topic: "Personal Branding"                                     },
  { yr: "2017",    evt: "Arabian Travel Market (ATM)",  city: "Dubai",     country: "UAE",       fmt: "Panel",    topic: "Marketing to the Modern Muslim Traveller", flag: "AE"  },
  { yr: "2016",    evt: "DMSS Conference",              city: "Bali",      country: "Indonesia", fmt: "Workshop", topic: "Media Hacks (200+ audience)",              tag: "Biggest" },
  { yr: "2016",    evt: "MPS2016 · M Powered Summit",   city: "Dubai",     country: "UAE",       fmt: "Talk",     topic: "Digital marketing keynote"                             },
  { yr: "2016",    evt: "AstroLabs",                    city: "Dubai",     country: "UAE",       fmt: "Talk",     topic: "Growth Hacking Your Brand to Success"                  },
  { yr: "2016",    evt: "IK Institute of Business",     city: "Dubai",     country: "UAE",       fmt: "Workshop", topic: "Co-trainer with Irfan Khairi"                          },
  { yr: "2016",    evt: "MaGIC",                        city: "Cyberjaya", country: "Malaysia",  fmt: "Workshop", topic: "Digital marketing for entrepreneurs"                   },
  { yr: "2014",    evt: "G-Day X",                      city: "Peshawar",  country: "Pakistan",  fmt: "Keynote",  topic: "Digital marketing & entrepreneurship"                  },
  { yr: "2014",    evt: "University of Peshawar",       city: "Peshawar",  country: "Pakistan",  fmt: "Talk",     topic: "Student talk"                                          },
  { yr: "2013",    evt: "IYDC",                         city: "Peshawar",  country: "Pakistan",  fmt: "Panel",    topic: "Social Media · panel discussion"                       },
  { yr: "On call", evt: "British SaaS startup",         city: "Remote",    country: "UK",        fmt: "Workshop", topic: "Internal SEO-PR training (private)",        flag: "GB" },
  { yr: "On call", evt: "World-class SEO SaaS",         city: "Remote",    country: "Global",    fmt: "Webinar",  topic: "SEO-PR strategy (audience to thousands)"               },
  { yr: "On call", evt: "Ruth King's Business Radio",   city: "Atlanta",   country: "USA",       fmt: "Radio",    topic: "Guest interview",                           flag: "US" },
];

type Format = { name: string; dur: string; note: string };
const FORMATS: ReadonlyArray<Format> = [
  { name: "Keynote",       dur: "20–45 min",   note: "Opening or closing keynote · single-track conferences, summits, internal kickoffs."                    },
  { name: "Workshop",      dur: "Half / full", note: "Hands-on training for marketing and growth teams. Cohorts of 8 to 50, with worksheets."               },
  { name: "Panel",         dur: "45–60 min",   note: "Moderated panel or co-panelist. Best paired with one of the signature topics."                        },
  { name: "Webinar",       dur: "45–60 min",   note: "Virtual delivery with live Q&A. Recording rights negotiable."                                         },
  { name: "Podcast guest", dur: "45–90 min",   note: "Long-form conversation. Bring research notes; the better the prep, the better the episode."          },
  { name: "Radio · video", dur: "On request",  note: "Business radio, video interviews, fireside chats. Examples: Ruth King's Business Radio Show."        },
];

type HostQuote = { quote: string; name: string; role: string; place: string; stat?: string };
const HOST_QUOTES: ReadonlyArray<HostQuote> = [
  { quote: "Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it, and it is hard not to like the guy.",
    name: "Chuck Wang",      role: "Host · The MVP Marketing Podcast", place: "San Francisco"                          },
  { quote: "Due to their efforts, our main site experienced an increase of 120.21% in organic traffic. Our Public Database website's clicks increased by 515.87%. These results gained us a 6× increase in average daily signups.",
    name: "Imani Lea Brown", role: "Centriq",                          place: "San Francisco", stat: "120% traffic · 6× signups" },
  { quote: "Syed Irfan Ajmal and his agency have helped us over the last several years on different content marketing & SEO projects. The biggest success story has been helping to grow Ridester from zero to 1.5 million monthly UVs.",
    name: "Brett Helling",   role: "Founder · Ridester",               place: "Omaha, NE",     stat: "0 → 1.5M monthly UVs"      },
  { quote: "Generous with knowledge, sharp with execution. The kind of operator you want on your side of the table when the stakes are real.",
    name: "Roberto Falchi",  role: "Marketing & speaking",             place: "Milan"                                  },
];

type Step = { no: string; t: string; d: string };
const STEPS: ReadonlyArray<Step> = [
  { no: "01", t: "Send the brief",            d: "Drop a note with the event, audience, date, and the metric you want moved. Anything you can share helps." },
  { no: "02", t: "I respond in 1 working day", d: "With topic options matched to your audience, dates that work, and terms. No pressure, no salesy follow-up." },
  { no: "03", t: "Pre-talk research call",    d: "30 minutes with you (and ideally a stakeholder) to make the talk specific to your room — not a generic deck." },
  { no: "04", t: "Deliver, on time",          d: "Show up early, run AV checks, deliver the talk, stay for Q&A, and follow up with a written recap if useful." },
];

const FEATURED_KEYS = ["nta", "ridester", "centriq", "curednation", "alrug"];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 60, paddingBottom: 70 }}>
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <SCaps color={INK70} size={12} ls="0.28em">
        The Speaker Sheet · 2026 booking open
      </SCaps>
    </div>
    <h1
      className="hero-h1"
      style={{
        margin: 0,
        textAlign: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.0,
        letterSpacing: "-0.028em",
      }}
    >
      <span style={{ display: "block" }}>Talks that move</span>
      <span style={{ display: "block", fontStyle: "italic", fontWeight: 600 }}>
        <Mark>a metric.</Mark>
      </span>
    </h1>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <SCaps size={11.5} ls="0.22em" color={INK55}>
        Syed Irfan Ajmal &nbsp;·&nbsp; Fractional CMO, Speaker &nbsp;·&nbsp;{" "}
        <span style={{ color: INK }}>Filed from Peshawar</span>
      </SCaps>
    </div>

    <DoubleRule style={{ margin: "44px 0 24px" }} />

    <div className="grid-hero-2col">
      {/* Lead body */}
      <div
        className="hero-body"
        style={{
          fontFamily: SERIF,
          fontSize: 17.5,
          color: INK,
          lineHeight: 1.55,
          textAlign: "justify",
        }}
      >
        <p style={{ margin: 0 }}>
          <span
            className="hero-drop-cap"
            style={{
              float: "left",
              fontFamily: SERIF,
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 0.78,
              marginRight: 10,
              marginTop: 6,
              color: INK,
              background: YEL,
              padding: "6px 8px 2px 8px",
            }}
          >
            I
          </span>
          have been on the speaker circuit since 2013, mostly on the subject of{" "}
          <strong>earned media</strong> and <strong>SEO-PR</strong>: how to get found by the
          right journalists, get covered by the right publications, and get the kind of
          organic traffic that turns into customers.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          The talks travel well. Workshop audiences at IN5 (Dubai), AstroLabs, MPS2016,
          the IK Institute of Business, MaGIC in Malaysia, and DMSS in Bali. Panel
          discussions at the Arabian Travel Market. Keynotes in Peshawar at G-Day X,
          Durshal, and the University of Peshawar. Plus webinars and a couple of years
          of podcast guest spots for hosts in North America, the UK, and Australia.
        </p>
        <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
          Style: business-savvy, case-study-led, with the receipts to back it up.
          Available in person across Asia, MENA and Europe, and virtually for the rest
          of the world. Booking is open for Q3 and Q4 of 2026.
        </p>
      </div>

      {/* Booking card */}
      <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: 24 }}>
        <Pill size={11} ls="0.20em">Booking Desk</Pill>
        <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 700 }}>
          Hire the speaker.
        </div>
        <div style={{ marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70, lineHeight: 1.5 }}>
          Tell me the event, the audience, and the metric you want moved. I&rsquo;ll
          come back inside a working day with topic options, dates, and terms.
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px" }}>
          {BOOKING_SPECS.map(([k, v]) => (
            <Fragment key={k}>
              <div><SCaps size={10} ls="0.16em" color={INK55}>{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.4 }}>{v}</div>
            </Fragment>
          ))}
        </div>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
          marginTop: 22, display: "block", textAlign: "center",
          padding: "14px 18px", background: INK, color: PAPER,
          textDecoration: "none", fontFamily: GROT, fontWeight: 800,
          fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>Inquire about booking →</a>
        <a href="#" style={{
          marginTop: 10, display: "block", textAlign: "center",
          padding: "14px 18px", background: YEL, color: INK,
          textDecoration: "none", fontFamily: GROT, fontWeight: 800,
          fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>Download speaker sheet ↓</a>
      </aside>
    </div>

    {/* Stat strip */}
    <DoubleRule style={{ margin: "52px 0 0" }} />
    <div className="grid-stats">
      {STATS.map(([n, l], i) => (
        <div key={n} className="stat-item" style={{ paddingTop: 24, paddingBottom: 6, textAlign: "center" }}>
          <div className="stat-number">{n}</div>
          <div style={{ marginTop: 8 }}><SCaps size={10.5} ls="0.16em" color={INK70}>{l}</SCaps></div>
        </div>
      ))}
    </div>
  </section>
);

// ─── §01 · Watch the Work ─────────────────────────────────────────────────────

const WatchTheWork = () => {
  const [active, setActive] = useState(0);
  const v = REELS[active];
  return (
    <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 70, paddingBottom: 90, position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: -40, right: -60, opacity: 0.06, pointerEvents: "none" }}>
        <SiaLogo height={320} />
      </div>

      <SectionMast n="01" label="See how it actually sounds · Watch the work" dark />

      <div className="grid-watch">
        {/* Left — reel list */}
        <div>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 50px)", color: PAPER, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
            Six reels<br />
            <span style={{ fontStyle: "italic", color: YEL }}>from the road.</span>
          </h2>
          <p style={{ marginTop: 16, fontFamily: SERIF, fontSize: 15.5, color: "rgba(241,235,222,.7)", lineHeight: 1.5, maxWidth: 360 }}>
            Click any reel to play. Four cities, three formats, one consistent point: earned media beats almost anything you can buy.
          </p>

          <div style={{ marginTop: 22, maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(241,235,222,.18)", padding: 10 }}>
            {REELS.map((r, i) => {
              const isActive = i === active;
              return (
                <button key={r.id} onClick={() => setActive(i)} style={{
                  display: "grid", gridTemplateColumns: "90px 1fr",
                  gap: 12, padding: 10, textAlign: "left",
                  background: isActive ? "rgba(245,184,31,.14)" : "transparent",
                  border: `1px solid ${isActive ? YEL : "rgba(241,235,222,.18)"}`,
                  cursor: "pointer", color: PAPER, font: "inherit",
                }}>
                  <div style={{ width: 90, height: 56, background: "#000", position: "relative", overflow: "hidden", border: "1px solid rgba(241,235,222,.22)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {isActive && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(245,184,31,.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 0, height: 0, borderLeft: `12px solid ${YEL}`, borderTop: "8px solid transparent", borderBottom: "8px solid transparent" }} />
                      </div>
                    )}
                    {r.badge && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: YEL, color: INK, padding: "2px 6px", fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {r.badge}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: PAPER }}>{r.title}</div>
                    <div style={{ marginTop: 5 }}><SCaps size={9.5} ls="0.16em" color={YEL}>{r.city}, {r.region}</SCaps></div>
                    <div style={{ marginTop: 2 }}><SCaps size={9} ls="0.10em" color="rgba(241,235,222,.55)">{r.venue}</SCaps></div>
                  </div>
                </button>
              );
            })}
          </div>

          <a href="/gallery" style={{
            marginTop: 18, display: "inline-flex", alignItems: "center", gap: 10,
            padding: "12px 18px", background: "transparent", color: PAPER,
            textDecoration: "none", fontFamily: GROT, fontWeight: 700,
            fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase",
            border: `1px solid ${PAPER}`,
          }}>Full gallery & playlist ↗</a>
        </div>

        {/* Right — main player */}
        <div>
          <div style={{ background: "#000", border: "1px solid rgba(241,235,222,.25)", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 4px 12px", borderBottom: "1px solid rgba(241,235,222,.25)", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: YEL }} />
                <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.85)">
                  Now playing · Reel № {String(active + 1).padStart(2, "0")}
                </SCaps>
              </div>
              <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.55)">{v.city}, {v.region}</SCaps>
            </div>
            <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(241,235,222,.25)", overflow: "hidden" }}>
              <iframe
                key={v.id}
                src={`https://www.youtube.com/embed/${v.id}?rel=0`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              />
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(241,235,222,.25)" }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 22px)", color: PAPER, lineHeight: 1.2 }}>{v.title}</div>
              <div style={{ marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(241,235,222,.75)", lineHeight: 1.4 }}>
                {v.venue} · {v.city}, {v.region} · {v.note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── §02 · Signature Topics ───────────────────────────────────────────────────

const Topics = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="02" label="Signature Topics · The five talks" />

    <div className="grid-intro">
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Two talks I can give<br />
        <span style={{ fontStyle: "italic" }}><Mark>in my sleep.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Twenty-two years of work has settled into two flagship talks and a handful of close cousins. Each is built around real case studies, the numbers behind them, and a take-home playbook the audience can apply on Monday morning.
      </p>
    </div>

    {/* Primary topics */}
    <div className="grid-testimonials" style={{ border: `1px solid ${INK}`, marginBottom: 24 }}>
      {PRIMARY_TOPICS.map((tp, i) => (
        <div key={tp.title} className="letter-card" style={{
          padding: "36px 28px 30px",
          background: i === 0 ? PAPER : PAPER2,
          display: "flex", flexDirection: "column", minHeight: 460,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <Pill size={10.5} ls="0.20em">Topic {tp.no}</Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>{tp.label}</SCaps>
          </div>
          <h3 style={{ margin: "18px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 38px)", color: INK, lineHeight: 1.05, letterSpacing: "-0.018em" }}>{tp.title}</h3>
          <HRule style={{ margin: "18px 0" }} />
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17, color: INK, lineHeight: 1.55, textAlign: "justify" }}>{tp.blurb}</p>
          <div style={{ marginTop: 22 }}>
            <SCaps size={10.5} ls="0.18em" color={INK55}>What the audience leaves with</SCaps>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.5 }}>
              {tp.bullets.map((b, j) => (
                <li key={j} style={{ padding: "6px 0 6px 24px", position: "relative", borderBottom: j < tp.bullets.length - 1 ? `1px solid ${INK15}` : "none" }}>
                  <span style={{ position: "absolute", left: 0, top: 6, fontFamily: GROT, fontSize: 10, fontWeight: 800, color: INK, letterSpacing: "0.06em" }}>0{j + 1}.</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, borderTop: `2px solid ${INK}`, flexWrap: "wrap", gap: 12 }}>
            <div>
              <SCaps size={10} ls="0.14em" color={INK55}>Headline number</SCaps>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 38px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 4 }}>{tp.casestudy.v}</div>
              <div style={{ marginTop: 4 }}><SCaps size={10} ls="0.12em" color={INK70}>{tp.casestudy.l}</SCaps></div>
            </div>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK, textDecoration: "none", fontWeight: 600 }}>
              <Mark>Book this talk →</Mark>
            </a>
          </div>
        </div>
      ))}
    </div>

    {/* Supporting topics */}
    <div style={{ marginTop: 36, marginBottom: 12 }}>
      <SCaps size={11} ls="0.20em" color={INK70}>And three more in regular rotation</SCaps>
    </div>
    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {SUPPORTING_TOPICS.map((s, i) => (
        <div key={s.title} className="card-border" style={{ padding: "26px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 200 }}>
          <SCaps size={10} ls="0.18em" color={INK55}>Topic 0{i + 3}</SCaps>
          <h4 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{s.title}</h4>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{s.blurb}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── MPS Photo Strip ──────────────────────────────────────────────────────────

const MPSStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 70, paddingBottom: 30 }}>
    <figure style={{ margin: 0, padding: 12, background: "#0e0d0a", border: `1px solid ${INK}` }}>
      <div style={{ width: "100%", height: "clamp(200px, 40vw, 360px)", overflow: "hidden", border: "1px solid rgba(241,235,222,.25)", position: "relative", background: "#000" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/gallery/mps-banner.jpg"
          alt="Speaking at MPS2016, Dubai · How Startup Founders Can Use Personal Branding"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", display: "block" }} />
      </div>
      <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#f1ebde", lineHeight: 1.4 }}>
          MPS2016, Dubai · &ldquo;How Startup Founders Can Use Personal Branding to Attract the Right Opportunities.&rdquo;
        </div>
        <SCaps size={10} ls="0.16em" color="rgba(241,235,222,.55)">Photo by hafeezsaeed.com</SCaps>
      </figcaption>
    </figure>
  </section>
);

// ─── §03 · Past Stages ────────────────────────────────────────────────────────

const Stages = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="03" label="Past Stages · A partial inventory" />
    <div className="grid-intro">
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Where the talks<br /><span style={{ fontStyle: "italic" }}><Mark>have travelled.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Four countries on stage, more on the webinar and podcast circuit. Below is the inventory, by format, with a short note on the talk.
      </p>
    </div>
    <ol style={{ margin: 0, padding: 0, listStyle: "none", borderTop: `2px solid ${INK}` }}>
      {STAGES.map((s, i) => (
        <li key={i} className="stages-table-row">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 22px)", color: INK, lineHeight: 1, letterSpacing: "-0.01em" }}>{s.yr}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(14px, 2vw, 20px)", color: INK, lineHeight: 1.25 }}>{s.evt}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }} className="stages-col-hide">{s.city}, {s.country}</div>
          <div className="stages-col-hide"><SCaps size={10} ls="0.14em" color={INK55}>{s.fmt}</SCaps></div>
          <div className="stages-col-hide" style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "baseline" }}>
            {(s.flag === "AE" || s.flag === "GB") && (
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.10em", padding: "2px 8px", background: INK, color: PAPER }}>{s.flag}</span>
            )}
            {s.flag === "US" && <Flag c="US" w={22} />}
            {s.tag && <Pill size={9} ls="0.14em">{s.tag}</Pill>}
          </div>
          <div className="stages-topic" style={{ fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.4 }}>{s.topic}</div>
        </li>
      ))}
    </ol>
  </section>
);

// ─── Client Strip ─────────────────────────────────────────────────────────────

const ClientStripSpeaking = () => {
  const pre = CLIENTS_PRE;
  const featured = CLIENTS_TIER1.filter((c) => FEATURED_KEYS.includes(c.key));
  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 30, paddingBottom: 56 }}>
      <DoubleRule />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 0 10px", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <Pill size={11} ls="0.22em">From the consulting roster →</Pill>
          <SCaps size={11} ls="0.22em" color={INK70}>The same companies trust the bureau when they hire the speaker</SCaps>
        </div>
        <a href="/clients" style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `1px solid ${INK}`, paddingBottom: 2 }}>
          The full roster →
        </a>
      </div>
      <div className="grid-clients" style={{ marginTop: 6 }}>
        {pre.map((c, i) => (
          <div key={c.key} className="client-cell" style={{ padding: "20px 16px", background: PAPER2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 100 }}>
            <ClientLogo client={c} height={48} maxWidth={180} />
            <div style={{ fontFamily: GROT, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>
              {c.countryLabel ? c.countryLabel.split("·")[0].trim() : ""}
            </div>
          </div>
        ))}
        <div className="client-divider" style={{ background: INK }} />
        {featured.map((c, i) => (
          <div key={c.key} className="client-cell" style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
            <ClientLogo client={c} height={42} maxWidth={140} />
          </div>
        ))}
      </div>
      <p style={{ margin: "14px auto 0", textAlign: "center", maxWidth: 760, fontFamily: "inherit", fontStyle: "italic", fontSize: 16, color: INK70, lineHeight: 1.5 }}>
        Booking a speaker is a low-stakes way to evaluate whether the bureau&rsquo;s approach fits your company.
      </p>
    </section>
  );
};

// ─── §04 · Available Formats ──────────────────────────────────────────────────

const Formats = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="04" label="Available Formats · Six ways to host" />
    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {FORMATS.map((f, i) => (
        <div key={f.name} className="card-border" style={{ padding: "26px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 170 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <SCaps size={10} ls="0.18em" color={INK55}>0{i + 1}</SCaps>
            <SCaps size={10} ls="0.14em" color={INK70}>{f.dur}</SCaps>
          </div>
          <h4 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 3vw, 26px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>{f.name}</h4>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 14.5, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{f.note}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §05 · What Hosts Say ─────────────────────────────────────────────────────

const HostQuotes = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="05" label="What Hosts Say · On the record" />
    <div className="grid-testimonials" style={{ border: `1px solid ${INK}` }}>
      {HOST_QUOTES.map((tm, i) => (
        <article key={i} className="letter-card" style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <Pill size={10.5} ls="0.18em">№ {String(i + 1).padStart(2, "0")}</Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>Filed from {tm.place}</SCaps>
          </div>
          <blockquote style={{ margin: "20px 0 0", fontFamily: SERIF, fontSize: "clamp(15px, 3vw, 21px)", color: INK, lineHeight: 1.4, fontStyle: "italic", position: "relative", paddingLeft: 30 }}>
            <span aria-hidden style={{ position: "absolute", left: -4, top: -8, fontFamily: SERIF, fontSize: 84, lineHeight: 1, color: INK, fontStyle: "italic", background: YEL, padding: "0 4px" }}>&ldquo;</span>
            {tm.quote}
          </blockquote>
          <HRule style={{ margin: "22px 0 14px", background: INK35 }} />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK }}>{tm.name}</div>
              <div style={{ marginTop: 4 }}><SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps></div>
            </div>
            {tm.stat && (
              <div style={{ padding: "6px 10px", background: INK, color: YEL, fontFamily: GROT, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.10em" }}>{tm.stat}</div>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);

// ─── §06 · Booking Process ────────────────────────────────────────────────────

const BookingProcess = () => (
  <section
    className="sx"
    style={{ background: PAPER2, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}
  >
    <SectionMast n="06" label="The Booking Process · Four steps" />
    <div className="grid-intro">
      <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        How to put me<br /><span style={{ fontStyle: "italic" }}><Mark>on your stage.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        I keep the process small and unfussy. The whole thing usually takes a couple of email exchanges and a thirty-minute call.
      </p>
    </div>
    <div className="grid-steps-4" style={{ border: `1px solid ${INK}` }}>
      {STEPS.map((step, i) => (
        <div key={step.no} className="step-card" style={{ padding: "28px 22px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 220 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(40px, 8vw, 64px)", color: INK, lineHeight: 1, letterSpacing: "-0.03em" }}>{step.no}</div>
          <HRule style={{ margin: "14px 0" }} />
          <h4 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{step.t}</h4>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{step.d}</p>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 44, textAlign: "center" }}>
      <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 32px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Start the booking conversation →
      </a>
    </div>
  </section>
);

// ─── §07 · Calendly ───────────────────────────────────────────────────────────

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

export default function SpeakingPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <Mast active="Speaking" />
      <Hero />
      <WatchTheWork />
      <Topics />
      <MPSStrip />
      <Stages />
      <ClientStripSpeaking />
      <Formats />
      <HostQuotes />
      <BookingProcess />
      <CalendlySection />
      <Subscriptions sectionNumber="08" />
      <Colophon />
    </div>
  );
}

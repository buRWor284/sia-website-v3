import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  Flag,
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
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Data ────────────────────────────────────────────────────────────────────

const BIO_STATS: ReadonlyArray<[string, string]> = [
  ["Based in",       "Peshawar, Pakistan"],
  ["Educated in",    "Sweden (M.Sc., Mälardalen, 2007)"],
  ["Earlier degree", "Bachelor in IT, Pakistan (2004)"],
  ["Worked in",      "Stockholm & Copenhagen (2007 to 10)"],
  ["Accelerated at", "BlackBox Connect, SV (2014)"],
  ["Founder of",     "DMR.agency · digital PR & SEO"],
  ["Speaks",         "English, Urdu, Pashto"],
  ["Available for",  "Fractional CMO, Speaking, Press"],
];

type TimelineItem = {
  year: string;
  t: string;
  d: string;
  flag?: "SE" | "DK" | "US" | "PK";
  tag?: string;
};

const TIMELINE: ReadonlyArray<TimelineItem> = [
  { year: "2026", t: "EMOS · Earned Media OS",                      d: "Productized the bureau's playbook for in-house teams.",                                             tag: "New"   },
  { year: "2021", t: "SIA Enterprises Inc",                          d: "Incorporated in Wyoming as a C-Corp, powering DMR.agency."                                                       },
  { year: "2018", t: "The SIA Business Podcast",                     d: "Launched. Three seasons, twenty-nine episodes."                                                                   },
  { year: "2018", t: "Speaking tour: IN5 Dubai · Durshal KP",        d: '"Media Hacks" and "Personal Branding" workshops.'                                                               },
  { year: "2017", t: "Panel: Arabian Travel Market, Dubai",          d: '"Marketing to the Modern Muslim Traveller" — with Tim Soulo (Ahrefs).'                                           },
  { year: "2016", t: "DMSS Conference, Bali",                        d: "Workshop on Media Hacks for ~200 attendees."                                                                     },
  { year: "2016", t: "Speaking debut, Dubai",                        d: "Astrolabs · IK Institute of Business · MPS2016."                                                                 },
  { year: "2014", t: "BlackBox Connect, Silicon Valley",             d: "Summer cohort of the global startup accelerator.",                                       flag: "US"               },
  { year: "2013", t: "Founded DMR.agency",                           d: "Digital PR and earned media. 100+ clients across 20+ countries."                                                },
  { year: "2013", t: "P@SHA Best Startup Award",                     d: "Silk Route Interactive (Crime Mapper) · 34% crime reduction in 3 months.",               tag: "Award"            },
  { year: "2013", t: "i2i Innovation to Impact, Finalist",           d: "Crime Mapper recognized for civic technology."                                                                   },
  { year: "2010", t: "Co-founded Silk Route Interactive",            d: "Spatial intelligence company, as Head of Marketing."                                                            },
  { year: "2008", t: "Invited Judge, SIFE Competition",              d: "Students In Free Enterprise."                                                                                    },
  { year: "2007", t: "M.Sc., Mälardalen University, Sweden",         d: "International Business & Entrepreneurship.",                                             flag: "SE"               },
  { year: "2007", t: "Marcus Evans, Sweden",                         d: "Through 2010. International business intelligence and events.",                           flag: "SE"               },
  { year: "2007", t: "InfoShare, Denmark",                           d: "Software development company, Copenhagen.",                                               flag: "DK"               },
  { year: "2007", t: "Affiliate Prophet, USA (remote)",              d: "MarTech startup, remote role.",                                                           flag: "US"               },
  { year: "2007", t: "SIFE National Cup Sweden · 2nd",               d: "Same team won the national cup in 2009 and 2010.",                                        flag: "SE"               },
  { year: "2007", t: "Best Recruitment Campaign · Adecco",           d: "Fortune 500 recruitment award."                                                                                  },
  { year: "2004", t: "Bachelor in IT, Pakistan",                     d: "Earliest degree."                                                                                               },
];

type Award = { year: string; t: string; by: string };
const AWARDS: ReadonlyArray<Award> = [
  { year: "2014", t: "BlackBox Connect, Silicon Valley",     by: "Highly competitive global startup accelerator, Summer cohort."     },
  { year: "2013", t: "P@SHA Best Startup Award",             by: 'For "Crime Mapper" — 34% crime reduction in three months.'        },
  { year: "2013", t: "i2i Finalist",                          by: "Innovation to Impact competition."                                },
  { year: "2008", t: "Invited Judge · SIFE Competition",     by: "Students In Free Enterprise."                                     },
  { year: "2007", t: "SIFE National Cup Sweden · 2nd Place", by: "Team went on to win the national cup in 2009 & 2010."             },
  { year: "2007", t: "Best Recruitment Campaign · Adecco",   by: "Awarded by Adecco (Fortune 500)."                                 },
];

type PressGroup = { label: string; items: ReadonlyArray<[string, string]> };
const PRESS_GROUPS: ReadonlyArray<PressGroup> = [
  { label: "Global business & ideas", items: [
    ["Forbes",                      "Contributor & featured"          ],
    ["Harvard Business Review",     "Guest contributor"               ],
    ["HuffPost",                    "Contributor · 358M monthly visitors"],
    ["Entrepreneur",                "Contributor"                     ],
    ["Reader's Digest",             "Featured"                        ],
  ]},
  { label: "Tech & startups", items: [
    ["The Next Web (TNW)",          "Featured"                        ],
    ["CNET",                        "Featured"                        ],
    ["Virgin Startup",              "Contributor"                     ],
    ["GBG · Google Business Group", "Featured"                        ],
  ]},
  { label: "Marketing, SEO & PR", items: [
    ["SEMrush Blog",                "Contributor"                     ],
    ["Search Engine Journal",       "Contributor"                     ],
    ["SERPed",                      "Contributor"                     ],
    ["Business.com",                "Contributor · 30M readers/month" ],
    ["Spin Sucks",                  "Contributor"                     ],
    ["GrowMap",                     "Contributor"                     ],
  ]},
  { label: "Regional & development", items: [
    ["Aurora",                      "Pakistan's largest marketing magazine"],
    ["The World Bank Blog",         "Contributor"                     ],
  ]},
];

type Testimonial = { quote: string; name: string; role: string; place: string };
const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  { quote: "Ranked a keyword to #4 on Google that gets over 160,000 searches a month. Commercial intent. Can't thank Irfan and the team enough.",
    name: "Azzam Sheikh",   role: "National Tyres & Autocare, UK", place: "Manchester"    },
  { quote: "Highly knowledgeable about content marketing and SEO. Ideas and execution both cutting-edge strategic, doesn't lose sight of what matters.",
    name: "Lisa Zahran",    role: "Copy & Coffee, Malaysia",        place: "Kuala Lumpur" },
  { quote: "One of the good guys. Knows digital marketing inside out. His expertise and growth in this area is exemplary.",
    name: "Sam Hurley",     role: "OPTIM-EYEZ, UK",                 place: "London"       },
  { quote: "Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it, and it is hard not to like the guy.",
    name: "Chuck Wang",     role: "The MVP Marketing Podcast, USA", place: "San Francisco"},
  { quote: "Working with Irfan was a masterclass in earned media. He knows how to find the angle that journalists actually want.",
    name: "Ghazzal Mehdi",  role: "formerly Marcus Evans",          place: "Dubai"        },
  { quote: "Real, tested SEO and content strategy. No fluff, no jargon, just outcomes you can put a number on.",
    name: "Daniel Bak",     role: "Marketing consultant",           place: "Stockholm"    },
  { quote: "Brought clarity to a campaign that had been spinning for months. We saw measurable lift inside the first quarter.",
    name: "Ercan Varol",    role: "Digital marketing lead",         place: "Istanbul"     },
  { quote: "Generous with knowledge, sharp with execution. The kind of operator you want on your side of the table.",
    name: "Roberto Falchi", role: "Marketing & speaking",           place: "Milan"        },
  { quote: "A trusted advisor for any founder navigating the awkward middle where you have product-market fit but not yet a brand.",
    name: "Khurram Awan",   role: "Founder",                        place: "Lahore"       },
  { quote: "He took the time to actually understand the business before recommending anything. Rare.",
    name: "Ameen Khwaja",   role: "Client",                         place: "Riyadh"       },
];

type MediaItem = {
  video?: string;
  poster?: string;
  src?: string;
  cap: string;
  sub: string;
  col: string;
  row: string;
  minH: number;
  badge?: string;
};

const OFF_THE_DESK: ReadonlyArray<MediaItem> = [
  { video: "/assets/personal/climb-video-1.mp4", poster: "/assets/personal/climb-1.jpg",
    cap: "Climbing reel · Peshawar", sub: "Mar 2022",
    col: "span 7", row: "span 2", minH: 380, badge: "Reel · 01" },
  { video: "/assets/personal/climb-video-2.mp4", poster: "/assets/personal/climb-2.jpg",
    cap: "Climbing reel · Peshawar", sub: "Mar 2022",
    col: "span 5", row: "span 2", minH: 380, badge: "Reel · 02" },
  { src: "/assets/personal/in-the-woods.jpg",
    cap: "In the woods", sub: "Pakistan",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/yoga.jpg",
    cap: "A bench in the forest", sub: "Pakistan",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/boat.jpg",
    cap: "On the water · Khanpur", sub: "Pakistan",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/sweden-malardalen.jpg",
    cap: "Mälardalen campus", sub: "Västerås, Sweden",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/sweden-audience.jpg",
    cap: "SIFE competition audience", sub: "Sweden · c. 2007",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/sweden-waterfront.jpg",
    cap: "On the dock", sub: "Sweden",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/sfo-2022.jpg",
    cap: "San Francisco", sub: "July 2022",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/climb-malaysia-2.jpg",
    cap: "Climbing wall", sub: "Kuala Lumpur",
    col: "span 4", row: "span 1", minH: 220 },
  { src: "/assets/personal/books.jpg",
    cap: "The reading pile", sub: "Off the road",
    col: "span 4", row: "span 1", minH: 220 },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER }}>
    <div className="res-hero-grid">

      {/* Left: count */}
      <div className="res-hero-left">
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
          22
        </div>
        <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
          Years<br />in practice
        </div>
      </div>

      {/* Centre: headline */}
      <div className="res-hero-center">
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
          ABOUT
        </div>
        <SCaps size={10} ls="0.24em" color={INK55}>
          Founder &nbsp;·&nbsp; Writer &nbsp;·&nbsp; Speaker &nbsp;·&nbsp; Filed from Peshawar
        </SCaps>
        <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          The man behind<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>the bureau.</em>
        </h1>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
          From Peshawar to Silicon Valley — a hundred clients, a dozen publications, and a book still coming.
        </p>
      </div>

      {/* Right: topic index */}
      <div className="res-hero-right">
        {[
          { label: "My Story",      sub: "Biography · 2004 – 2026" },
          { label: "The Timeline",  sub: "Career milestones" },
          { label: "Press & Awards", sub: "Recognition · Publications" },
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

// ─── About Lead ───────────────────────────────────────────────────────────────

const AboutLead = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 48, paddingBottom: 60 }}>
    <DoubleRule style={{ margin: "0 0 40px" }} />

    {/* Lead — portrait + 2-col body + vitals sidebar */}
    <div className="grid-about-lead">
      {/* Portrait card */}
      <figure
        style={{
          margin: 0,
          background: PAPER2,
          border: `1px solid ${INK}`,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          alignSelf: "start",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "4/5",
            border: `1px solid ${INK}`,
            background: PAPER,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot.jpg"
            alt="Syed Irfan Ajmal"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 18%",
              filter: "grayscale(0.18) contrast(1.02)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: YEL,
              padding: "4px 10px",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            The Editor
          </div>
        </div>
        <figcaption style={{ marginTop: 12 }}>
          <SCaps size={10} ls="0.20em" color={INK70}>Portrait, by staff</SCaps>
          <div
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: INK,
              lineHeight: 1.4,
            }}
          >
            Syed Irfan Ajmal, photographed at the bureau. Peshawar, May 2026.
          </div>
        </figcaption>
      </figure>

      {/* Body — 2-col bio with drop cap */}
      <div
        className="hero-body"
        style={{
          fontFamily: SERIF,
          fontSize: 17,
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
          have spent the last twenty-two years doing one thing, badly at first
          and then a little better each year: helping businesses get found, get
          covered, and get customers. The methods have changed. The
          questions <em>(who reads what; what earns trust; why this story now)</em>
          {" "}have not.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          The work began in Sweden, in 2007: a Master of Science in
          International Business and Entrepreneurship at Mälardalen University,
          followed by three years of hands-on work across Stockholm and
          Copenhagen.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          In 2010 I returned to Peshawar and co-founded{" "}
          <strong>Silk Route Interactive</strong>, a spatial intelligence
          company, as Head of Marketing. Our flagship product, Crime Mapper,
          helped reduce crime in its participating areas by thirty-four percent
          in three months and won the P@SHA Best Startup Award in 2013. The
          next summer I was accepted to BlackBox Connect in Silicon Valley.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          In Sweden I worked at <strong>Marcus Evans</strong>. In Denmark,
          at <strong>InfoShare</strong>, a software development company. And
          later, remotely from Pakistan, at{" "}
          <strong>Affiliate Prophet</strong>, a MarTech startup in the United
          States.
        </p>
        <p style={{ marginTop: "0.7em" }}>
          Soon after, I founded <strong>DMR.agency</strong>: a digital PR and
          earned-media practice that has served roughly a hundred clients in
          twenty-plus countries, including Procter &amp; Gamble. The writing
          happened in parallel. Pieces in <em>Forbes</em>, the{" "}
          <em>Harvard Business Review</em>, <em>HuffPost</em>,{" "}
          <em>The Next Web</em>, <em>Entrepreneur</em>, the{" "}
          <em>World Bank blog</em>. A podcast, three seasons, twenty-nine
          episodes. Speaking dates in Malaysia, Indonesia, the UAE, and
          Pakistan; webinars for American and British audiences. A book is
          coming. (It has been coming for a while.)
        </p>
        <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
          In 2021 I incorporated SIA Enterprises in Wyoming. In 2026 I
          productized the way we work into{" "}
          <strong>EMOS — the Earned Media OS</strong>. Otherwise: still in
          Peshawar, still writing, still answering email.
        </p>
      </div>

      {/* Sidebar — vital stats */}
      <aside className="about-vitals-aside">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Pill size={11} ls="0.20em">Vital Stats</Pill>
          <div style={{ flex: 1, height: 1, background: INK35 }} />
        </div>
        <div style={{ borderTop: `2px solid ${INK}`, marginTop: 10 }} />
        <dl style={{ margin: 0, padding: 0, fontFamily: SERIF, color: INK }}>
          {BIO_STATS.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 14,
                padding: "11px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <dt>
                <SCaps size={10.5} ls="0.14em" color={INK70}>{k}</SCaps>
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: 15.5,
                  lineHeight: 1.4,
                }}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 14px",
              background: INK,
              color: PAPER,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Book a call →
          </a>
          <a
            href="#"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 14px",
              background: YEL,
              color: INK,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Press kit ↓
          </a>
        </div>
      </aside>
    </div>
  </section>
);

// ─── §01 · Curriculum ─────────────────────────────────────────────────────────

const Curriculum = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="01" label="Curriculum · A career in brief" />

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
        Twenty-two years,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>year by year.</Mark>
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
        The short version of the long story, filed in reverse chronological
        order. Some of these are companies, some are talks, some are awards.
        They are listed without ranking, because in this work everything ranks
        itself soon enough.
      </p>
    </div>

    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        borderTop: `2px solid ${INK}`,
      }}
    >
      {TIMELINE.map((row, i) => (
        <li key={i} className="curriculum-row">
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(20px, 3vw, 28px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {row.year}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(15px, 2vw, 19px)",
              color: INK,
              lineHeight: 1.3,
            }}
          >
            {row.t}
          </div>
          <div
            className="curriculum-desc"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 16,
              color: INK70,
              lineHeight: 1.45,
            }}
          >
            {row.d}
          </div>
          <div
            className="curriculum-flag"
            style={{
              textAlign: "right",
              justifyContent: "flex-end",
              gap: 6,
              alignItems: "baseline",
            }}
          >
            {row.flag === "SE" && <Flag c="SE" w={22} />}
            {row.flag === "DK" && <Flag c="DK" w={22} />}
            {row.flag === "US" && <Flag c="US" w={22} />}
            {row.flag === "PK" && <Flag c="PK" w={22} />}
            {row.tag && (
              <Pill size={9.5} ls="0.14em">{row.tag}</Pill>
            )}
          </div>
        </li>
      ))}
    </ol>
  </section>
);

// ─── §02 · Honours & Awards ───────────────────────────────────────────────────

const Honours = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="02" label="Honours & Awards · For the record" />

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {AWARDS.map((a, i) => (
        <div
          key={a.t}
          className="card-border"
          style={{
            padding: "28px 26px 26px",
            background: PAPER,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: 200,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 36px)",
                color: INK,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {a.year}
            </div>
            <SCaps size={10.5} ls="0.18em" color={INK55}>
              Nº {String(i + 1).padStart(2, "0")}
            </SCaps>
          </div>
          <HRule style={{ margin: "16px 0" }} />
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(16px, 2.5vw, 21px)",
              color: INK,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {a.t}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 15,
              color: INK70,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {a.by}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── §03 · Press Archive ──────────────────────────────────────────────────────

const PressArchive = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="03" label="The Press Archive · Bylines & citations" />

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
        Where the work
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>has been read.</Mark>
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
        Selected publications I have written for, been quoted in, or been
        featured by. Grouped by department because thirteen outlets in one
        row flattens the dignity of the older ones.
      </p>
    </div>

    {/* Forbes ME print spread */}
    <div
      className="forbes-spread"
      style={{
        padding: 14,
        background: PAPER2,
        border: `1px solid ${INK}`,
        alignItems: "stretch",
      }}
    >
      <figure
        style={{
          margin: 0,
          padding: 8,
          background: "#1a1410",
          border: `1px solid ${INK}`,
          display: "flex",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/personal/forbes-me-print.jpg"
          alt="How Qatar Can Become The Silicon Valley Of The Arab World · Forbes Middle East print, by Syed Irfan Ajmal"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 420,
            objectFit: "contain",
            display: "block",
          }}
        />
      </figure>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "4px 4px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              background: YEL,
              color: INK,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            In print · Forbes ME
          </div>
          <h3
            style={{
              margin: "18px 0 0",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(20px, 3.5vw, 30px)",
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
            }}
          >
            &ldquo;How Qatar Can Become The Silicon Valley
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 600 }}>
              Of The Arab World.&rdquo;
            </span>
          </h3>
          <p
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 16,
              color: INK70,
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            Published in the Forbes Middle East Guide print edition, in
            collaboration with Arab Publisher House (APH). One of a small
            handful of in-print Forbes ME bylines by a Pakistani author.
          </p>
        </div>
        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: `1px solid ${INK15}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <SCaps size={10.5} ls="0.18em" color={INK55}>
            Forbes ME Guide · 2017 · Print edition
          </SCaps>
          <SCaps size={10.5} ls="0.16em" color={INK}>
            Featured byline
          </SCaps>
        </div>
      </div>
    </div>

    <div
      className="grid-testimonials"
      style={{ border: `1px solid ${INK}` }}
    >
      {PRESS_GROUPS.map((g, gi) => (
        <div
          key={g.label}
          className="letter-card"
          style={{
            padding: "28px 30px 26px",
            background: PAPER,
          }}
        >
          <SCaps size={10.5} ls="0.20em" color={INK55}>{g.label}</SCaps>
          <HRule style={{ margin: "14px 0" }} />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {g.items.map(([name, note]) => (
              <li
                key={name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 16,
                  padding: "10px 0",
                  borderBottom: `1px solid ${INK15}`,
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: "clamp(15px, 2.5vw, 19px)",
                    color: INK,
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 13.5,
                    color: INK70,
                    textAlign: "right",
                  }}
                >
                  {note}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

// ─── §04 · The Letters File ───────────────────────────────────────────────────

const Letters = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="04" label="The Letters File · What clients have said" />

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
        On the record,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>in their own words.</Mark>
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
        Selected letters from clients, colleagues, and past hosts. All
        reproduced with permission. A longer file is available on request,
        with names and contact details for verification.
      </p>
    </div>

    <div
      className="grid-testimonials"
      style={{ border: `1px solid ${INK}` }}
    >
      {TESTIMONIALS.map((tm, i) => (
        <article
          key={i}
          className="letter-card"
          style={{
            padding: "32px 32px 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Pill size={10.5} ls="0.18em">
              № {String(i + 1).padStart(2, "0")}
            </Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>
              Filed from {tm.place}
            </SCaps>
          </div>
          <blockquote
            style={{
              margin: "20px 0 0",
              fontFamily: SERIF,
              fontSize: "clamp(16px, 3vw, 21px)",
              color: INK,
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
              fontStyle: "italic",
              position: "relative",
              paddingLeft: 30,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: -4,
                top: -8,
                fontFamily: SERIF,
                fontSize: 84,
                lineHeight: 1,
                color: INK,
                fontStyle: "italic",
                background: YEL,
                padding: "0 4px",
              }}
            >
              &ldquo;
            </span>
            {tm.quote}
          </blockquote>
          <HRule style={{ margin: "22px 0 14px", background: INK35 }} />
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 17,
                color: INK,
              }}
            >
              {tm.name}
            </div>
            <div style={{ marginTop: 4 }}>
              <SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

// ─── §05 · Off the Desk ───────────────────────────────────────────────────────

const OffTheDesk = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="05" label="Off the desk · Hobbies, hikes, and a wall to climb" />

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
        The bureau,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>after hours.</Mark>
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
        Twenty-two years at a desk gets balanced out somewhere. For me that
        has been hiking the woods of Pakistan, climbing walls in Peshawar
        and Kuala Lumpur, the occasional bench in the forest, and a stubborn
        habit of reading on planes.
      </p>
    </div>

    <div className="gallery-mosaic">
      {OFF_THE_DESK.map((p, i) => (
        <figure
          key={i}
          style={{
            margin: 0,
            gridColumn: p.col,
            gridRow: p.row,
            background: PAPER2,
            border: `1px solid ${INK}`,
            padding: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: p.minH,
              border: `1px solid ${INK}`,
              overflow: "hidden",
              background: "#222",
              position: "relative",
            }}
          >
            {p.video ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={p.video}
                autoPlay
                muted
                loop
                playsInline
                poster={p.poster}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.src}
                alt={p.cap}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            {p.badge && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: YEL,
                  color: INK,
                  padding: "4px 9px",
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 9.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {p.badge}
              </div>
            )}
          </div>
          <figcaption
            style={{
              padding: "8px 4px 2px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13.5,
                color: INK,
                lineHeight: 1.35,
              }}
            >
              {p.cap}
            </div>
            <SCaps size={9.5} ls="0.14em" color={INK55}>{p.sub}</SCaps>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);

// ─── §06 · Also at the Bureau ─────────────────────────────────────────────────

const AlsoAtTheBureau = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="06" label="Also at the bureau · More from Irfan" />

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {[
        {
          label: "Ventures",
          href: "/ventures",
          desc: "Companies, partnerships, and projects beyond DMR.agency.",
        },
        {
          label: "Clients",
          href: "/clients",
          desc: "A selection of brands and founders the bureau has worked with.",
        },
        {
          label: "Gallery",
          href: "/gallery",
          desc: "Events, stages, press, and moments from twenty-two years in the field.",
        },
        {
          label: "Podcast",
          href: "/podcast",
          desc: "The SIA Business Podcast — three seasons, twenty-nine episodes.",
        },
      ].map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="card-border"
          style={{
            padding: "28px 26px 26px",
            background: PAPER,
            display: "flex",
            flexDirection: "column",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(20px, 3vw, 28px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 15.5,
              color: INK70,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {item.desc}
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            View →
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── Outro ────────────────────────────────────────────────────────────────────

const Outro = () => (
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
    <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={INK70}>A note to close</SCaps>
      <h2
        className="h2-sm"
        style={{
          margin: "18px 0 0",
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        If your business needs to be{" "}
        <span style={{ fontStyle: "italic" }}>
          <Mark>found, covered, or believed</Mark>
        </span>
        , you know where the bureau is.
      </h2>
      <div
        style={{
          marginTop: 36,
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "16px 26px",
            background: INK,
            color: PAPER,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Book a discovery call →
        </a>
        <a
          href="/"
          style={{
            padding: "16px 26px",
            background: "transparent",
            color: INK,
            textDecoration: "none",
            border: `1px solid ${INK}`,
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Back to the front page
        </a>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />
      <AboutLead />
      <Curriculum />
      <Honours />
      <PressArchive />
      <Letters />
      <OffTheDesk />
      <AlsoAtTheBureau />
      <Outro />
      <Subscriptions sectionNumber="07" />
      <Colophon />
    </div>
  );
}

import Script from "next/script";
import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
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
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";


const EMOS_URL = "https://dmr.agency/earnedmediaOS/";

// ─── Data ────────────────────────────────────────────────────────────────────

type InsideItem = { no: string; t: string; d: string };
const INSIDE: ReadonlyArray<InsideItem> = [
  { no: "01", t: "A working playbook",
    d: "Step-by-step methods refined over 100+ digital PR campaigns. Pitch templates, journalist outreach scripts, story-design frameworks." },
  { no: "02", t: "Trainings & cohorts",
    d: "Live and recorded sessions for in-house marketing teams. Cohort-based learning, not yet another self-paced course." },
  { no: "03", t: "Weekly cadence",
    d: "Office hours, accountability check-ins, and a working rhythm that keeps the earned-media engine running, not just talked about." },
  { no: "04", t: "The journalist contact book",
    d: "Curated relationships with editors and journalists across Forbes, HBR, HuffPost, niche trade press. Built one byline at a time." },
];

type Receipt = { v: string; l: string; sub: string };
const RECEIPTS: ReadonlyArray<Receipt> = [
  { v: "1.5M",  l: "monthly visitors",   sub: "Ridester · 0 to 1.5M in one year"       },
  { v: "6×",    l: "daily signups",      sub: "Centriq · 120% organic traffic lift"     },
  { v: "$535K", l: "in revenue",         sub: "E-commerce · five weeks"                 },
  { v: "500+",  l: "high-quality links", sub: "Physicians Thrive · DR 33 to 57"         },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 0 }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <SCaps color={INK70} size={12} ls="0.28em">
        A new offering from the Bureau · 2026
      </SCaps>
    </div>
    <h1
      style={{
        margin: 0,
        textAlign: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        color: INK,
        lineHeight: 0.96,
        letterSpacing: "-0.03em",
      }}
    >
      <span
        className="emos-h1-main"
        style={{
          display: "block",
          fontFamily: GROT,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: "-0.04em",
        }}
      >
        EMOS.
      </span>
      <span
        className="emos-h1-sub"
        style={{
          display: "block",
          fontStyle: "italic",
          fontWeight: 600,
        }}
      >
        the <Mark>Earned Media</Mark> Operating System.
      </span>
    </h1>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <SCaps size={11.5} ls="0.22em" color={INK55}>
        Productized by Syed Irfan Ajmal &nbsp;·&nbsp; Delivered through{" "}
        <span style={{ color: INK }}>DMR.agency</span>
      </SCaps>
    </div>

    <DoubleRule style={{ margin: "44px 0 8px" }} />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "6px 0 36px",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <SCaps size={10.5} ls="0.18em" color={INK70}>
        Below: a 30-second tour by the editor.
      </SCaps>
      <SCaps size={10.5} ls="0.18em" color={INK70}>
        Run time: 0:30 · 1080 × 1080
      </SCaps>
    </div>
  </section>
);

// ─── Video Card ───────────────────────────────────────────────────────────────

const VideoCard = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 60 }}>
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        background: INK,
        padding: 18,
        border: `1px solid ${INK}`,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 8px 16px",
          borderBottom: "1px solid rgba(241,235,222,.25)",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: YEL,
            }}
          />
          <SCaps size={10.5} ls="0.20em" color="rgba(241,235,222,.85)">
            REEL № 01 · A 30-second tour
          </SCaps>
        </div>
        <SCaps size={10.5} ls="0.20em" color="rgba(241,235,222,.55)">
          EMOS / 2026
        </SCaps>
      </div>

      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#000",
          border: "1px solid rgba(241,235,222,.25)",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/assets/emos-video.mp4"
          autoPlay
          muted
          loop
          controls
          playsInline
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 8,
          borderTop: "1px solid rgba(241,235,222,.25)",
          paddingTop: 14,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: "rgba(241,235,222,.85)",
            lineHeight: 1.4,
            maxWidth: 460,
          }}
        >
          A short film about{" "}
          <strong style={{ color: YEL, fontStyle: "normal" }}>EMOS</strong>{" "}
          &mdash; the Earned Media Operating System.
        </div>
        <SCaps size={10} ls="0.14em" color="rgba(241,235,222,.55)">
          DIR. SIA &nbsp;·&nbsp; 2026
        </SCaps>
      </div>
    </div>
  </section>
);

// ─── §01 · What's Inside ─────────────────────────────────────────────────────

const Inside = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 90 }}>
    <SectionMast n="01" label="What's inside · A short brief" />

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
        An agency,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>productized.</Mark>
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
        EMOS is what happens when you take the way a good earned-media agency
        actually works &mdash; the templates, the cadence, the journalist
        relationships, the editorial instincts &mdash; and hand it to an
        in-house marketing team to run themselves. For founders and operators
        who want the bylines without the retainer.
      </p>
    </div>

    <div
      className="grid-steps-4"
      style={{ border: `1px solid ${INK}` }}
    >
      {INSIDE.map((m, i) => (
        <div
          key={m.no}
          className="step-card"
          style={{
            padding: "26px 22px 24px",
            background: PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 220,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 56px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {m.no}
          </div>
          <HRule style={{ margin: "14px 0" }} />
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
            {m.t}
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
            {m.d}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §02 · Proof ─────────────────────────────────────────────────────────────

const Proof = () => (
  <section
    style={{
      background: INK,
      color: PAPER,
      paddingTop: 90,
      paddingBottom: 90,
      position: "relative",
      overflow: "hidden",
    }}
    className="sx"
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -40,
        right: -60,
        opacity: 0.06,
        pointerEvents: "none",
      }}
    >
      <SiaLogo height={320} />
    </div>

    <SectionMast n="02" label="Receipts · What the system has produced" dark />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: PAPER,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Numbers, by way
        <br />
        <span style={{ fontStyle: "italic", color: YEL }}>of evidence.</span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: "rgba(241,235,222,.72)",
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        EMOS is the same playbook that has produced these results for
        DMR.agency&rsquo;s clients. Names, full write-ups, and methodology are
        on the agency case-study page.
      </p>
    </div>

    <div
      className="grid-stats"
      style={{
        borderTop: "1px solid rgba(241,235,222,.25)",
        borderBottom: "1px solid rgba(241,235,222,.25)",
      }}
    >
      {RECEIPTS.map((r, i) => (
        <div
          key={r.v}
          className="stat-item"
          style={{
            padding: "34px 24px",
          }}
        >
          <div
            className="stat-number"
            style={{
              color: YEL,
            }}
          >
            {r.v}
          </div>
          <div style={{ marginTop: 10 }}>
            <SCaps size={11} ls="0.16em" color="rgba(241,235,222,.7)">
              {r.l}
            </SCaps>
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: "rgba(241,235,222,.6)",
              lineHeight: 1.45,
            }}
          >
            {r.sub}
          </div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 36, textAlign: "center" }}>
      <a
        href="https://dmr.agency/case-studies/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 22px",
          background: "transparent",
          color: PAPER,
          border: `1px solid ${PAPER}`,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        See all case studies on DMR.agency ↗
      </a>
    </div>
  </section>
);

// ─── §03 · Client Results ─────────────────────────────────────────────────────

type EMOSTestimonial = { quote: string; name: string; role: string; place: string; photo: string; stat?: string };
const EMOS_TESTIMONIALS: ReadonlyArray<EMOSTestimonial> = [
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
];

const EMOSTestimonials = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="03" label="Client results · The system in action" />
    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        The receipts,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>from the clients.</Mark>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        These are the results EMOS has produced for real companies. Names, numbers, and the publications that covered them.
      </p>
    </div>
    <div className="grid-testimonials" style={{ border: `1px solid ${INK}` }}>
      {EMOS_TESTIMONIALS.map((tm, i) => (
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
              <div style={{ padding: "5px 10px", background: INK, color: YEL, fontFamily: GROT, fontSize: 10, fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                {tm.stat}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);

// ─── §04 · Handoff ────────────────────────────────────────────────────────────

const Handoff = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="04" label="The handoff · For pricing, modules & booking" />

    <div
      className="grid-dark-card"
      style={{
        background: PAPER2,
        border: `1px solid ${INK}`,
        padding: "40px 32px",
        position: "relative",
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
        Full info → DMR.agency
      </div>

      <div>
        <SCaps size={11} ls="0.20em" color={INK70}>
          For pricing, modules, booking
        </SCaps>
        <h2
          className="h2-sm"
          style={{
            margin: "14px 0 0",
            fontFamily: SERIF,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
          }}
        >
          The full EMOS page lives on
          <br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>DMR.agency.</Mark>
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: SERIF,
            fontSize: 17.5,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 520,
          }}
        >
          This page is the trailer; the agency page is the feature. Module
          breakdown, pricing, cohort dates, FAQs, and a booking form are all
          over there.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a
          href={EMOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 26px",
            background: INK,
            color: PAPER,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          <span>Visit the EMOS page</span>
          <span style={{ fontFamily: SERIF, fontSize: 20 }}>↗</span>
        </a>
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
          <span>Book a call with the editor</span>
          <span style={{ fontFamily: SERIF, fontSize: 20 }}>→</span>
        </a>
        <div style={{ marginTop: 10 }}>
          <SCaps size={10.5} ls="0.16em" color={INK55}>
            Both open in a new tab. The agency page is hosted at{" "}
            <span style={{ color: INK }}>dmr.agency/earnedmediaOS/</span>.
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

export default function EMOSPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <Hero />
      <VideoCard />
      <Inside />
      <Proof />
      <EMOSTestimonials />
      <Handoff />
      <CalendlySection />
      <Subscriptions sectionNumber="06" />
      <Colophon />
    </div>
  );
}

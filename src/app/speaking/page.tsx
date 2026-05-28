import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
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

const EVENTS: ReadonlyArray<{
  n: string;
  city: string;
  country: string;
  period: string;
  events: string;
  audience: string;
}> = [
  {
    n: "01",
    city: "Peshawar",
    country: "Pakistan",
    period: "2013 → present",
    events: "G-Day X · Durshal Tech Hub",
    audience: "500+",
  },
  {
    n: "02",
    city: "Kuala Lumpur",
    country: "Malaysia",
    period: "2016 → 2019",
    events: "Irfan Khairi workshops · webinars",
    audience: "300+",
  },
  {
    n: "03",
    city: "Bali",
    country: "Indonesia",
    period: "Nov 2016",
    events: "DMSS · Digital Marketing Summit",
    audience: "200+",
  },
  {
    n: "04",
    city: "Dubai",
    country: "UAE",
    period: "2016 → 2018",
    events: "ATM · IN5 Hub · MPS 2016",
    audience: "400+",
  },
  {
    n: "05",
    city: "Online",
    country: "US / UK",
    period: "2017 → present",
    events: "12+ webinar sessions",
    audience: "1,000+",
  },
  {
    n: "06",
    city: "Podcast",
    country: "Remote",
    period: "2018 → present",
    events: "15+ guest appearances",
    audience: "10,000+",
  },
];

const TOPICS = [
  {
    n: "I",
    title: "Writing Your Way to Success",
    sub: "Content, SEO & Authority",
    body: "How to build a sustainable content engine that earns media, drives traffic, and converts readers into clients. Covers keyword strategy, long-form writing, and the editorial mindset that separates brands that get covered from those that don't.",
    tags: ["Content Strategy", "SEO", "Authority Building", "Editorial"],
  },
  {
    n: "II",
    title: "Brand Yourself for Success",
    sub: "Personal Branding & Positioning",
    body: "A tactical framework for building a personal brand that opens doors. Covers positioning, LinkedIn authority, thought leadership publishing, and how to become the recognized expert in your field — even if you're starting from zero.",
    tags: ["Personal Branding", "Positioning", "Thought Leadership", "LinkedIn"],
  },
  {
    n: "III",
    title: "Media Hacks · Free Publicity Online",
    sub: "Earned Media & PR",
    body: "The Earned Media OS condensed into a keynote. How to get featured in Forbes, HBR, and top publications without a PR agency. Covers HARO, relationship-led pitching, story angles, and the systems that turn press into profit.",
    tags: ["Earned Media", "PR", "HARO", "Publications"],
  },
];

const TESTIMONIALS = [
  {
    n: "01",
    quote:
      "The most practical media keynote I've seen. No fluff — just systems that work.",
    name: "Agnieszka Borushko",
    role: "Co-organiser, DMSS Bali",
    location: "Bali, Indonesia",
  },
  {
    n: "02",
    quote:
      "Syed knows how to hold a room. The audience left with an action plan, not just inspiration.",
    name: "Egor Borushko",
    role: "DMSS Conference",
    location: "Bali, Indonesia",
  },
];

export default function SpeakingPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Speaking" />

      {/* ── Dark hero ─────────────────────────────────────────── */}
      <section
        style={{
          background: INK,
          color: PAPER,
          padding: "90px 56px",
          position: "relative",
          overflow: "hidden",
        }}
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

        <SectionMast n="00" label="The Touring Desk · Keynote Speaker" dark />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            position: "relative",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 80,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: PAPER,
              }}
            >
              Stages across
              <br />
              <span style={{ fontStyle: "italic", color: YEL }}>
                four countries.
              </span>
            </h1>
            <p
              style={{
                marginTop: 28,
                fontSize: 18,
                lineHeight: 1.55,
                color: "rgba(241,235,222,.72)",
                maxWidth: 480,
              }}
            >
              Keynotes in Malaysia, Indonesia, the UAE, and Pakistan. Webinars for
              American and British audiences. Fifteen-plus podcast guest appearances.
              Every talk is researched, tailored, and built to leave the audience
              with something they can use the same week.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 36,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                background: YEL,
                color: INK,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Enquire about a keynote →
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {[
              { stat: "4", label: "Countries" },
              { stat: "40+", label: "Talks & webinars" },
              { stat: "15+", label: "Podcast guest spots" },
              { stat: "10K+", label: "Audience reach" },
            ].map(({ stat, label }) => (
              <div
                key={label}
                style={{
                  padding: "28px 24px",
                  border: "1px solid rgba(241,235,222,.18)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 52,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: YEL,
                  }}
                >
                  {stat}
                </div>
                <SCaps
                  size={10.5}
                  ls="0.16em"
                  color="rgba(241,235,222,.6)"
                  style={{ marginTop: 8, display: "block" }}
                >
                  {label}
                </SCaps>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px" }}>
        <SectionMast n="01" label="The Repertoire · Speaking Topics" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {TOPICS.map(({ n, title, sub, body, tags }) => (
            <div key={n} style={{ borderTop: `2px solid ${INK}` }}>
              <div
                style={{
                  padding: "16px 0 12px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <SCaps size={11} ls="0.18em" color={YEL}>
                  {n}.
                </SCaps>
                <SCaps size={10.5} ls="0.14em">
                  {sub}
                </SCaps>
              </div>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontWeight: 700,
                  fontSize: 30,
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                }}
              >
                {title}
              </h2>
              <HRule />
              <p
                style={{
                  margin: "16px 0 24px",
                  fontSize: 16.5,
                  lineHeight: 1.6,
                  color: INK70,
                }}
              >
                {body}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag) => (
                  <Pill key={tag} size={9.5} ls="0.12em">
                    {tag}
                  </Pill>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, textAlign: "center" }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "14px 28px",
              background: INK,
              color: PAPER,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Book Syed for your event →
          </a>
        </div>
      </section>

      <HRule />

      {/* ── Events table ─────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="The Circuit · Past Engagements" />
        <div>
          {EVENTS.map(({ n, city, country, period, events, audience }) => (
            <div
              key={n}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1.4fr 1fr 1.6fr 80px",
                gap: 24,
                padding: "22px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <SCaps size={11} ls="0.14em" color={INK35}>
                {n}.
              </SCaps>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: "-0.01em",
                }}
              >
                {city}
              </div>
              <div
                style={{
                  fontStyle: "italic",
                  fontSize: 16,
                  color: INK55,
                }}
              >
                {country}
              </div>
              <div>
                <SCaps size={10.5} ls="0.12em">{period}</SCaps>
                <div style={{ marginTop: 4 }}>
                  <SCaps size={10.5} ls="0.10em" color={YEL}>
                    {events}
                  </SCaps>
                </div>
              </div>
              <SCaps size={10.5} ls="0.10em" color={INK55}>
                {audience}
              </SCaps>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ padding: "80px 56px" }}>
        <SectionMast n="03" label="Letters of Note · Testimonials" />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}
        >
          {TESTIMONIALS.map(({ n, quote, name, role, location }) => (
            <div key={n}>
              <Pill size={10.5} ls="0.16em">№ {n}</Pill>
              <p
                style={{
                  margin: "20px 0 0",
                  fontStyle: "italic",
                  fontSize: 22,
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    lineHeight: 0,
                    verticalAlign: "-0.3em",
                    color: INK35,
                    marginRight: 4,
                  }}
                >
                  &ldquo;
                </span>
                {quote}
              </p>
              <HRule style={{ margin: "20px 0 12px" }} />
              <SCaps size={11} ls="0.18em">{name}</SCaps>
              <div style={{ marginTop: 4 }}>
                <SCaps size={10.5} ls="0.14em" color={INK55}>{role}</SCaps>
              </div>
              <div style={{ marginTop: 4 }}>
                <SCaps size={10.5} ls="0.12em" color={INK35}>
                  Filed from {location}
                </SCaps>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Gallery preview ──────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="04" label="The Archive · Speaking Gallery" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {[
            "/assets/gallery/dmss-speaking-at.jpg",
            "/assets/gallery/mps-audience.jpg",
            "/assets/gallery/gdayx-1.jpg",
            "/assets/gallery/ik-audience.jpg",
          ].map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt="Speaking engagement"
              style={{
                width: "100%",
                aspectRatio: "4/3",
                objectFit: "cover",
                display: "block",
                filter: "sepia(0.08)",
                border: `1px solid ${INK35}`,
              }}
            />
          ))}
        </div>
        <a
          href="/gallery"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 11.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: INK,
            textDecoration: "none",
          }}
        >
          View full gallery →
        </a>
      </section>

      <Subscriptions sectionNumber="05" />
      <Colophon />
    </div>
  );
}

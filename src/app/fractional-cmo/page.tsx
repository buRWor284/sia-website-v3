import { Colophon, Mast, Subscriptions } from "@/components/bureau";
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

const WHAT_YOU_GET = [
  {
    n: "01",
    title: "Marketing strategy",
    body: "A 90-day roadmap built around your growth stage — not a generic framework. Channel selection, positioning, messaging architecture, and campaign priorities.",
  },
  {
    n: "02",
    title: "Earned media & PR",
    body: "Forbes, HBR, and category-relevant publications. Journalist relationships, story engineering, and systematic press outreach — no retainer agency required.",
  },
  {
    n: "03",
    title: "Content & SEO",
    body: "Editorial planning, long-form content production oversight, and an SEO strategy that builds organic moats rather than chasing algorithm updates.",
  },
  {
    n: "04",
    title: "Team & vendor management",
    body: "Hire, brief, and manage your marketing team and freelancers. Syed acts as the strategic layer that translates business goals into executable briefs.",
  },
  {
    n: "05",
    title: "Board & investor reporting",
    body: "Marketing dashboards, board decks, and investor update sections that show marketing's contribution to pipeline and revenue — not just vanity metrics.",
  },
  {
    n: "06",
    title: "Founder coaching",
    body: "Positioning coaching for the founder as a public figure — LinkedIn, speaking, thought leadership — because in early-stage companies, founder brand is company brand.",
  },
];

const WHO_ITS_FOR = [
  "Series A / Series B founders who need a CMO but not a full-time hire",
  "Bootstrapped SaaS or services companies with $1M–$10M ARR",
  "Professional services firms (law, consulting, finance) building authority",
  "PE-backed companies in transition — outgoing CMO, incoming strategy",
  "Founders entering a new market who need positioning done right",
];

export default function FractionalCmoPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Fractional CMO" />

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
            top: -60,
            right: -80,
            opacity: 0.06,
            pointerEvents: "none",
          }}
        >
          <SiaLogo height={360} />
        </div>

        <SectionMast
          n="00"
          label="Fractional CMO · Strategic Marketing Leadership"
          dark
        />

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
                fontSize: 72,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: PAPER,
              }}
            >
              CMO-level thinking.
              <br />
              <span style={{ fontStyle: "italic", color: YEL }}>
                Without the hire.
              </span>
            </h1>
            <p
              style={{
                marginTop: 28,
                fontSize: 18,
                lineHeight: 1.55,
                color: "rgba(241,235,222,.72)",
                maxWidth: 500,
              }}
            >
              A fractional CMO arrangement gives you senior marketing leadership
              at a fraction of the cost of a full-time hire — with none of the
              onboarding delay, equity dilution, or performance-review overhead.
            </p>
            <p
              style={{
                marginTop: 16,
                fontSize: 18,
                lineHeight: 1.55,
                color: "rgba(241,235,222,.55)",
                maxWidth: 500,
              }}
            >
              Syed embeds into your leadership team, owns the marketing function,
              and builds the systems, team, and positioning that survive after
              the engagement ends.
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
              Start the conversation →
            </a>
          </div>

          <div>
            <Pill size={11} ls="0.18em" color="rgba(241,235,222,.8)">
              Engagement model
            </Pill>
            <div style={{ marginTop: 20 }}>
              {[
                {
                  label: "Commitment",
                  value: "3–12 month retainer",
                },
                {
                  label: "Time",
                  value: "2–4 days per week embedded",
                },
                {
                  label: "Format",
                  value: "Remote-first, on-site as needed",
                },
                {
                  label: "Start",
                  value: "2–4 week onboarding sprint",
                },
                {
                  label: "Verticals",
                  value: "B2B SaaS, Services, Tech",
                },
                {
                  label: "Availability",
                  value: "2 engagements maximum",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(241,235,222,.14)",
                    alignItems: "baseline",
                  }}
                >
                  <SCaps
                    size={10.5}
                    ls="0.14em"
                    color="rgba(241,235,222,.5)"
                  >
                    {label}
                  </SCaps>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 16,
                      color: "rgba(241,235,222,.85)",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What you get ─────────────────────────────────────── */}
      <section style={{ padding: "80px 56px" }}>
        <SectionMast n="01" label="The Scope · What Is Covered" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {WHAT_YOU_GET.map(({ n, title, body }) => (
            <div key={n} style={{ borderTop: `2px solid ${INK}` }}>
              <div
                style={{
                  padding: "14px 0 10px",
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <SCaps size={11} ls="0.18em" color={YEL}>{n}</SCaps>
                <SCaps size={10.5} ls="0.14em">Area {n}</SCaps>
              </div>
              <h3
                style={{
                  margin: "0 0 14px",
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <HRule />
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: INK70,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Who it's for ─────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="The Brief · Who This Is For" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 20px",
                fontWeight: 700,
                fontSize: 48,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
              }}
            >
              You&rsquo;re growing.
              <br />
              <span style={{ fontStyle: "italic" }}>
                <Mark>Marketing is the bottleneck.</Mark>
              </span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              You have product-market fit. Revenue is growing. But marketing is
              founder-led, inconsistent, and not converting at the rate it should.
              You need someone to own the function — not an agency that runs ads
              and sends monthly reports.
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              A fractional CMO brings ownership, accountability, and strategic
              continuity without the $300K+ price tag of a full-time C-suite hire.
            </p>
          </div>

          <div>
            {WHO_ITS_FOR.map((item, i) => (
              <div
                key={item}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: `1px solid ${INK15}`,
                  alignItems: "start",
                }}
              >
                <SCaps size={11} ls="0.14em" color={YEL}>
                  {String(i + 1).padStart(2, "0")}.
                </SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 16.5,
                    lineHeight: 1.45,
                    color: INK,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 56px",
          background: INK,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -60,
            left: -80,
            opacity: 0.05,
            pointerEvents: "none",
          }}
        >
          <SiaLogo height={360} />
        </div>

        <div style={{ maxWidth: 640, position: "relative" }}>
          <Pill size={11} ls="0.18em">§ 03 · Start the conversation</Pill>
          <h2
            style={{
              margin: "20px 0 16px",
              fontWeight: 700,
              fontSize: 56,
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
              color: PAPER,
            }}
          >
            Two engagements open.{" "}
            <span style={{ fontStyle: "italic", color: YEL }}>
              Book the call.
            </span>
          </h2>
          <p
            style={{
              margin: "0 0 32px",
              fontSize: 18,
              lineHeight: 1.55,
              color: "rgba(241,235,222,.72)",
              maxWidth: 480,
            }}
          >
            A 30-minute discovery call to understand your stage, your bottlenecks,
            and whether a fractional arrangement is the right model. No pitch —
            just a diagnostic conversation.
          </p>
          <DoubleRule dark />
          <div style={{ marginTop: 28 }}>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                background: YEL,
                color: INK,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Book a discovery call →
            </a>
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}

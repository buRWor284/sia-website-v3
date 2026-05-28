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
    title: "Strategy ownership",
    body: "Positioning, ICP, GTM plan, brand narrative, quarterly OKRs. I write the marketing strategy and answer for it. No fractional handwaving.",
  },
  {
    n: "02",
    title: "Weekly cadence",
    body: "A standing weekly call with the founder, plus a weekly sync with the team or vendors. Decisions get made on the call, not in week-long Slack threads.",
  },
  {
    n: "03",
    title: "Execution through DMR.agency",
    body: "Digital PR, SEO, content production, link earning, journalist outreach — the full agency stack at agency rates, inside the engagement. You don't pay a second retainer.",
  },
  {
    n: "04",
    title: "Hiring & vendor selection",
    body: "When it's time to add a content lead, a paid-media specialist, or a freelance designer, I run the brief, interview the candidates, and stand behind the hire.",
  },
  {
    n: "05",
    title: "Investor & board narrative",
    body: "Marketing slides for board meetings. Investor updates that show growth in language they trust. Sales support when a founder-led deal needs marketing air cover.",
  },
  {
    n: "06",
    title: "The hard 'no'",
    body: "A fractional CMO's most important job is filtering. I will say no to half the marketing ideas in the room. The other half, we will ship.",
  },
];

const WHO_ITS_FOR = [
  "You are Series A or B and feel marketing is the missing function.",
  "Revenue between roughly $1M and $20M ARR.",
  "You want senior marketing thinking weekly, but not a full-time hire yet.",
  "You can commit to six months of work and decision-making.",
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
              Marketing leadership,
              <br />
              <span style={{ fontStyle: "italic", color: YEL }}>
                without the headcount.
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
              For founders without a marketing leader. I take the marketing chair
              at your table on a monthly retainer: strategy ownership, weekly
              cadence, agency-level execution through DMR.agency, and the kind of
              decision-making that does not wait on a six-month CMO search.
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
              The role looks different at every company, but the shape is
              consistent: I show up weekly, I own the marketing function end to
              end, and I have a small team behind me that can execute almost
              anything we decide on, almost immediately.
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
            <Pill size={11} ls="0.18em">
              Engagement model
            </Pill>
            <div style={{ marginTop: 20 }}>
              {[
                {
                  label: "Engagement",
                  value: "Monthly retainer",
                },
                {
                  label: "Minimum",
                  value: "6 months",
                },
                {
                  label: "Cadence",
                  value: "Weekly · 1-on-1 + team",
                },
                {
                  label: "Geography",
                  value: "Remote · global",
                },
                {
                  label: "Stack",
                  value: "PR · SEO · content · paid",
                },
                {
                  label: "Reports to",
                  value: "Founder / CEO",
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
            Thirty minutes,{" "}
            <span style={{ fontStyle: "italic", color: YEL }}>
              no pitch deck.
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
            Tell me where the business is, where you want it to be in twelve
            months, and what marketing has and has not done so far. I will tell
            you honestly whether a Fractional CMO is the right answer, or
            something else is.
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

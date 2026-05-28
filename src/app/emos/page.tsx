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
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Audit & Positioning",
    body: "We map your existing authority, identify your most credible story angles, and position you as the go-to expert in your category. Most founders skip this — and it's why their pitches get ignored.",
  },
  {
    n: "02",
    title: "The Media List",
    body: "We build a prioritised target list of publications, journalists, and podcasts that your ideal buyers actually read. No spray-and-pray. Every target is chosen for fit and conversion potential.",
  },
  {
    n: "03",
    title: "Story Engineering",
    body: "We craft the pitches, data points, and narratives that make editors say yes. This includes HARO responses, direct pitches, op-ed drafts, and contributed article angles.",
  },
  {
    n: "04",
    title: "Outreach & Placement",
    body: "We execute the outreach systematically — following up, building relationships, and landing placements in publications that move the needle for your business.",
  },
  {
    n: "05",
    title: "Amplification & Repurposing",
    body: "Each placement is amplified across LinkedIn, turned into content, and added to your credibility asset library. Press compounds — we make sure it does.",
  },
  {
    n: "06",
    title: "Reporting & Iteration",
    body: "Monthly reporting on placements, reach, and inbound leads attributed to earned media. We iterate the strategy based on what's converting.",
  },
];

const RESULTS = [
  { stat: "Forbes", label: "Top-tier placement" },
  { stat: "HBR", label: "Authority vertical" },
  { stat: "HuffPost", label: "Mass reach" },
  { stat: "TNW", label: "Tech audience" },
  { stat: "300%", label: "Avg. inbound lift" },
  { stat: "90d", label: "First placement" },
];

const FAQS = [
  {
    q: "Who is EMOS for?",
    a: "Founders, consultants, and executives who want to be known as the authority in their field — and know that press coverage is the fastest path there. You don't need to be famous. You need to have a point of view.",
  },
  {
    q: "How long until we see results?",
    a: "Most clients see their first placement within 60–90 days. Forbes, HBR, and top-tier verticals can take 3–6 months depending on your positioning and story strength.",
  },
  {
    q: "Do you guarantee placements?",
    a: "We don't guarantee specific outlets — no ethical PR operation does. We guarantee a systematic, professional earned media programme run by someone who has personally been featured in Forbes, HBR, and HuffPost.",
  },
  {
    q: "What's included?",
    a: "Positioning audit, media list, pitch writing, HARO monitoring, outreach execution, placement tracking, and monthly reporting. Everything in one retainer.",
  },
];

export default function EmosPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="EMOS" />

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
            bottom: -80,
            left: -100,
            opacity: 0.06,
            pointerEvents: "none",
          }}
        >
          <SiaLogo height={400} />
        </div>

        <SectionMast
          n="00"
          label="EMOS · Earned Media Operating System"
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
                fontSize: 76,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: PAPER,
              }}
            >
              Get in{" "}
              <span style={{ fontStyle: "italic", color: YEL }}>Forbes.</span>
              <br />
              Get in{" "}
              <span style={{ fontStyle: "italic", color: YEL }}>HBR.</span>
              <br />
              Get clients.
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
              EMOS is a done-for-you earned media programme. We position you as the
              authority, pitch your story to the right journalists, and land
              placements in publications your buyers actually read.
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
              No PR agency fees. No retainer black holes. A systematic process
              run by someone who has done it himself — and knows what works.
            </p>
            <div style={{ marginTop: 36, display: "flex", gap: 16 }}>
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
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
                Apply for EMOS →
              </a>
              <a
                href="#how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  border: "1px solid rgba(241,235,222,.3)",
                  color: "rgba(241,235,222,.8)",
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                How it works ↓
              </a>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              alignContent: "start",
            }}
          >
            {RESULTS.map(({ stat, label }) => (
              <div
                key={label}
                style={{
                  padding: "28px 24px",
                  background: "rgba(241,235,222,.04)",
                  border: "1px solid rgba(241,235,222,.12)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 40,
                    lineHeight: 1,
                    letterSpacing: "-0.025em",
                    color: YEL,
                  }}
                >
                  {stat}
                </div>
                <SCaps
                  size={10.5}
                  ls="0.14em"
                  color="rgba(241,235,222,.55)"
                  style={{ marginTop: 8, display: "block" }}
                >
                  {label}
                </SCaps>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video ────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="01" label="In Brief · Watch the Overview" />
        <div
          style={{
            maxWidth: 840,
            margin: "0 auto",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/assets/emos-video.mp4"
            controls
            playsInline
            style={{
              width: "100%",
              display: "block",
              border: `1px solid ${INK35}`,
              background: INK,
            }}
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <SCaps size={10.5} ls="0.16em" color={INK55}>
              EMOS Overview · Syed Irfan Ajmal · DMR.agency
            </SCaps>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 56px" }}>
        <SectionMast n="02" label="The Process · How EMOS Works" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {HOW_IT_WORKS.map(({ n, title, body }) => (
            <div key={n}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 16,
                  borderTop: `2px solid ${INK}`,
                  paddingTop: 16,
                }}
              >
                <SCaps size={11} ls="0.18em" color={YEL}>
                  {n}
                </SCaps>
                <SCaps size={10.5} ls="0.14em">Step {n}</SCaps>
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

      {/* ── Proof / press ────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="03" label="The Proof · Creator's Own Press" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
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
              He practises what he{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>preaches.</Mark>
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
              Syed Irfan Ajmal built the EMOS framework by landing his own press
              — Forbes, HBR, HuffPost, TNW, and more — without a PR agency, a
              publicist, or a large budget. Every technique in EMOS is one he has
              used himself.
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              He then packaged that process into a repeatable system and used it
              to earn media for his clients — generating inbound leads, investor
              interest, and category authority.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 20px",
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
              Book a discovery call →
            </a>
          </div>

          <div>
            {[
              "Forbes",
              "Harvard Business Review",
              "HuffPost",
              "The Next Web",
              "Entrepreneur",
              "Inc. Magazine",
              "Fast Company",
              "Content Marketing Institute",
              "Search Engine Journal",
            ].map((outlet, i, arr) => (
              <div
                key={outlet}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${INK15}` : undefined,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <SCaps
                  size={10.5}
                  ls="0.12em"
                  color={INK35}
                  style={{ minWidth: 24 }}
                >
                  {String(i + 1).padStart(2, "0")}.
                </SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 20,
                    fontWeight: 600,
                    color: INK,
                  }}
                >
                  {outlet}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px" }}>
        <SectionMast n="04" label="Common Questions · FAQ" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 64px",
          }}
        >
          {FAQS.map(({ q, a }, i) => (
            <div
              key={q}
              style={{
                padding: "28px 0",
                borderBottom: `1px solid ${INK15}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {q}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: INK70,
                }}
              >
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

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
            top: -60,
            right: -80,
            opacity: 0.05,
            pointerEvents: "none",
          }}
        >
          <SiaLogo height={360} />
        </div>
        <div
          style={{
            maxWidth: 640,
            position: "relative",
          }}
        >
          <Pill size={11} ls="0.18em">§ 05 · Apply Now</Pill>
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
            Ready to get{" "}
            <span style={{ fontStyle: "italic", color: YEL }}>covered?</span>
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
            Book a 30-minute discovery call. We&rsquo;ll review your current
            positioning, identify your best story angles, and tell you whether EMOS
            is a good fit.
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

      <Subscriptions sectionNumber="06" />
      <Colophon />
    </div>
  );
}

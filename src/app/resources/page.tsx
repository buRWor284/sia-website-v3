import { Colophon, Subscriptions } from "@/components/bureau";
import { SCaps } from "@/components/bureau/primitives";
import { ResourcesClientShell } from "@/components/resources/ResourcesClientShell";
import { GROT, INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";
import { ScrollButtons } from "@/components/ScrollButtons";

// ─── Hero ─────────────────────────────────────────────────────────────────────
// 3-column editorial layout: count left · headline centre · topics right
// No centred text.

const TOPICS = [
  { label: "SEO / GEO Backlinking", sub: "Link building · GEO" },
  { label: "Digital PR",            sub: "Outreach · HARO" },
  { label: "Content Marketing",     sub: "Writing · Strategy" },
] as const;

const Hero = () => (
  <section className="sx" style={{ background: PAPER }}>
    <div className="res-hero-grid">

      {/* ─── Left: Count ──────────────────────────────────────────────────── */}
      <div className="res-hero-left">
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(52px, 7vw, 84px)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: INK,
          }}
        >
          18
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK55,
            lineHeight: 1.6,
          }}
        >
          Resources
          <br />
          in the Library
        </div>
      </div>

      {/* ─── Centre: Headline ─────────────────────────────────────────────── */}
      <div className="res-hero-center">
        {/* Watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(56px, 10vw, 128px)",
            letterSpacing: "-0.04em",
            color: "rgba(26,20,16,.042)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          RESOURCES
        </div>

        <SCaps size={10} ls="0.24em" color={INK55}>
          A working library &nbsp;·&nbsp; Earned Media &amp; SEO
        </SCaps>

        <h1
          style={{
            marginTop: 12,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(30px, 3.8vw, 52px)",
            lineHeight: 1.02,
            letterSpacing: "-0.028em",
            color: INK,
          }}
        >
          The frameworks
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>
            behind the bylines.
          </em>
        </h1>

        <p
          style={{
            marginTop: 12,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.5,
            color: INK70,
            maxWidth: 480,
          }}
        >
          Interactive kits, playbooks, and original research on earned media,
          digital PR, and SEO — packaged to use, not just read.
        </p>
      </div>

      {/* ─── Right: Topic index ───────────────────────────────────────────── */}
      <div className="res-hero-right">
        {TOPICS.map((t) => (
          <div key={t.label}>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 17,
                color: INK,
                lineHeight: 1.2,
                letterSpacing: "-0.008em",
              }}
            >
              {t.label}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INK55,
              }}
            >
              {t.sub}
            </div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />
      <ResourcesClientShell />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import { SCaps } from "@/components/bureau/primitives";
import { ResourcesClientShell } from "@/components/resources/ResourcesClientShell";
import { GROT, INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

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
            fontSize: "clamp(68px, 9vw, 108px)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: INK,
          }}
        >
          15
        </div>
        <div
          style={{
            marginTop: 14,
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
            fontSize: "clamp(64px, 12vw, 148px)",
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
            marginTop: 18,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(36px, 4.5vw, 60px)",
            lineHeight: 1.0,
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
            marginTop: 20,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.55,
            color: INK70,
            maxWidth: 520,
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
      <Mast active="Resources" />
      <Hero />
      <ResourcesClientShell />
      <Subscriptions sectionNumber="07" />
      <Colophon />
    </div>
  );
}

import { Colophon } from "@/components/bureau";
import { DoubleRule, Pill, SCaps } from "@/components/bureau/primitives";
import { CALENDLY, GROT, INK, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

export default function NotFound() {
  return (
    <>
      <section
        className="sx"
        style={{
          background: PAPER,
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(80px, 14vw, 180px)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: INK,
          }}
        >
          404
        </div>

        <DoubleRule style={{ marginTop: 28, marginBottom: 28, maxWidth: 200 }} />

        <Pill size={11} ls="0.22em">Story Not Filed</Pill>

        <p
          style={{
            marginTop: 24,
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            color: INK,
            maxWidth: 500,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          Even the best reporters hit a dead end sometimes.
        </p>

        <p
          style={{
            marginTop: 12,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            color: INK70,
            maxWidth: 440,
            lineHeight: 1.55,
          }}
        >
          This page either never existed, got pulled from the archives,
          or wandered off after deadline. It happens.
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/"
            style={{
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 24px",
              background: INK,
              color: YEL,
              textDecoration: "none",
              transition: "background .15s",
            }}
          >
            Back to the front page &rarr;
          </a>
          <a
            href="/contact"
            style={{
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 24px",
              border: `2px solid ${INK}`,
              color: INK,
              background: "transparent",
              textDecoration: "none",
              transition: "background .15s",
            }}
          >
            File a report &rarr;
          </a>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 24px",
              border: `2px solid ${INK}`,
              color: INK,
              background: "transparent",
              textDecoration: "none",
              transition: "background .15s",
            }}
          >
            Book a call instead &rarr;
          </a>
        </div>

        <SCaps size={9} ls="0.18em" color={INK55} style={{ marginTop: 40 }}>
          Or try: &nbsp;
          <a href="/about" style={{ color: INK, textDecoration: "underline" }}>About</a> &nbsp;·&nbsp;
          <a href="/resources" style={{ color: INK, textDecoration: "underline" }}>Resources</a> &nbsp;·&nbsp;
          <a href="/emos" style={{ color: INK, textDecoration: "underline" }}>EMOS</a> &nbsp;·&nbsp;
          <a href="/speaking" style={{ color: INK, textDecoration: "underline" }}>Speaking</a>
        </SCaps>
      </section>
      <Colophon />
    </>
  );
}

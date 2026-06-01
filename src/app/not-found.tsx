import { Colophon } from "@/components/bureau";
import { DoubleRule, SCaps } from "@/components/bureau/primitives";
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
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(36px, 5.5vw, 72px)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: INK,
            maxWidth: 700,
          }}
        >
          You&rsquo;ve taken a wrong turn.
        </h1>

        <p
          style={{
            marginTop: 16,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 19,
            color: INK70,
            maxWidth: 480,
            lineHeight: 1.55,
          }}
        >
          But hey, the best discoveries happen off the beaten path.
        </p>

        <DoubleRule style={{ marginTop: 36, marginBottom: 36, maxWidth: 200 }} />

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
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
          <a href="/about" style={{ color: INK, textDecoration: "underline" }}>About</a> &nbsp;&middot;&nbsp;
          <a href="/resources" style={{ color: INK, textDecoration: "underline" }}>Resources</a> &nbsp;&middot;&nbsp;
          <a href="/emos" style={{ color: INK, textDecoration: "underline" }}>EMOS</a> &nbsp;&middot;&nbsp;
          <a href="/speaking" style={{ color: INK, textDecoration: "underline" }}>Speaking</a>
        </SCaps>
      </section>
      <Colophon />
    </>
  );
}

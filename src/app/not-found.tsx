import { Colophon } from "@/components/bureau";
import { DoubleRule, Pill } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

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
            fontSize: "clamp(72px, 12vw, 160px)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: INK,
          }}
        >
          404
        </div>
        <DoubleRule style={{ marginTop: 28, marginBottom: 28, maxWidth: 200 }} />
        <Pill size={11} ls="0.22em">Page Not Found</Pill>
        <p
          style={{
            marginTop: 20,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 18,
            color: INK70,
            maxWidth: 440,
            lineHeight: 1.55,
          }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist, or it may have moved.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
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
              color: "#f5b81f",
              textDecoration: "none",
            }}
          >
            Back to home &rarr;
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
              border: "2px solid " + INK,
              color: INK,
              background: "transparent",
              textDecoration: "none",
            }}
          >
            Contact
          </a>
        </div>
      </section>
      <Colophon />
    </>
  );
}

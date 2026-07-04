"use client";

import { Colophon } from "@/components/bureau";
import { Pill } from "@/components/bureau/primitives";
import { GROT, INK, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

export default function CaseStudiesPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <section
        style={{
          flex: 1,
          background: PAPER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <Pill size={11} ls="0.2em">Case Studies</Pill>

          <h1
            style={{
              marginTop: 20,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: INK,
            }}
          >
            Coming <em style={{ fontStyle: "italic" }}>soon</em>.
          </h1>

          <p
            style={{
              marginTop: 18,
              fontFamily: SERIF,
              fontSize: 17,
              lineHeight: 1.55,
              color: INK70,
            }}
          >
            This page is being built out. In the meantime, browse the case
            studies over on DMR.agency.
          </p>

          <a
            href="https://dmr.agency/case-studies"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 32,
              padding: "16px 28px",
              background: INK,
              color: YEL,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Visit DMR.agency/case-studies →
          </a>
        </div>
      </section>

      <Colophon />
    </div>
  );
}

"use client";

import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "./primitives";

export const Subscriptions = ({
  sectionNumber = "06",
}: {
  sectionNumber?: string;
}) => (
  <section
    style={{
      background: INK,
      color: PAPER,
      padding: "80px 56px",
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
        opacity: 0.06,
        pointerEvents: "none",
      }}
    >
      <SiaLogo height={360} />
    </div>

    <SectionMast
      n={sectionNumber}
      label="Subscriptions Desk · Two emails a month"
      dark
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 64,
        alignItems: "center",
        position: "relative",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 72,
            color: PAPER,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          A letter
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>
            from the bureau.
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: SERIF,
            fontSize: 18,
            color: "rgba(241,235,222,.72)",
            lineHeight: 1.55,
            maxWidth: 480,
          }}
        >
          One or two letters a month. Real case studies, the campaigns I&rsquo;m
          building right now, and zero filler. Unsubscribe whenever.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <SCaps size={11} ls="0.20em" color={YEL}>
          Apply for a subscription
        </SCaps>
        <div style={{ marginTop: 14, display: "flex" }}>
          <input
            placeholder="you@yourcompany.com"
            style={{
              flex: 1,
              padding: "18px 18px",
              border: "1px solid rgba(241,235,222,.5)",
              borderRight: "none",
              background: "transparent",
              color: PAPER,
              fontFamily: SERIF,
              fontSize: 17,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "18px 26px",
              background: YEL,
              color: INK,
              border: `1px solid ${YEL}`,
              cursor: "pointer",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Subscribe →
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <SCaps size={10.5} ls="0.14em" color="rgba(241,235,222,.45)">
            No spam · One-click unsubscribe · Hosted by Mailmunch
          </SCaps>
        </div>
      </form>
    </div>
  </section>
);

import Link from "next/link";
import { GROT, INK, SERIF, YEL } from "@/lib/tokens";

const CREAM = "#FAFAFA";

/**
 * RadarCallout — a small, self-contained teaser that links to the live Earned
 * Media Radar (/radar). Paper card with an ink border so it reads on both light
 * and dark sections. Server-compatible (no client hooks). Drop it into any page.
 */
export function RadarCallout({ maxWidth = 1000 }: { maxWidth?: number }) {
  return (
    <div style={{ padding: "0 24px", boxSizing: "border-box", width: "100%" }}>
      <Link
        href="/radar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          maxWidth,
          margin: "40px auto",
          padding: "22px 26px",
          background: CREAM,
          border: `2px solid ${INK}`,
          textDecoration: "none",
        }}
      >
        <span
          style={{
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 8.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            background: YEL,
            color: INK,
            padding: "4px 8px",
            whiteSpace: "nowrap",
          }}
        >
          Live
        </span>
        <span style={{ flex: 1, minWidth: 240 }}>
          <span
            style={{
              display: "block",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 20,
              color: INK,
              lineHeight: 1.2,
            }}
          >
            See the Earned Media Radar
          </span>
          <span
            style={{
              display: "block",
              fontFamily: GROT,
              fontSize: 12.5,
              color: "rgba(26,20,16,.68)",
              marginTop: 5,
            }}
          >
            A live map of what the press is covering across PR, earned media, SEO, and AI search. Powered by SignalIQ.
          </span>
        </span>
        <span
          style={{
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: ".10em",
            textTransform: "uppercase",
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          Open radar &rarr;
        </span>
      </Link>
    </div>
  );
}

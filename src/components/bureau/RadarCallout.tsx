import Link from "next/link";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";

/**
 * RadarCallout — a small, self-contained teaser that links to the live Earned
 * Media Radar (/earned-media-radar). Built in the Bureau newspaper system —
 * ink band, yellow rules, a pulsing radar glyph — so it reads as a live
 * "wire bulletin" rather than a generic card. Server-compatible (no client
 * hooks; the sweep/pulse are pure CSS). Drop it into any page.
 */
export function RadarCallout({ maxWidth = 1000 }: { maxWidth?: number }) {
  return (
    <div style={{ padding: "0 24px", boxSizing: "border-box", width: "100%" }}>
      <style>{`
        @keyframes radarSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radarPulse { 0% { transform: scale(0.35); opacity: .85; } 100% { transform: scale(1); opacity: 0; } }
        .rc-glyph { position: relative; width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%; border: 1px solid rgba(245,184,31,.35); }
        .rc-glyph::before, .rc-glyph::after {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          border: 1px solid rgba(245,184,31,.55);
          animation: radarPulse 2.6s cubic-bezier(.2,.6,.4,1) infinite;
        }
        .rc-glyph::after { animation-delay: 1.3s; }
        .rc-glyph-sweep {
          position: absolute; inset: 3px; border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(245,184,31,.9), rgba(245,184,31,0) 55%);
          animation: radarSweep 3.4s linear infinite;
        }
        .rc-glyph-dot { position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; margin: -2.5px; border-radius: 50%; background: ${YEL}; }
        .rc-band { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
        .rc-stats { display: flex; gap: 22px; flex-wrap: wrap; }
        @media (max-width: 720px) { .rc-cta { margin-left: 0 !important; } }
      `}</style>
      <Link
        href="/earned-media-radar"
        className="rc-band"
        style={{
          maxWidth,
          margin: "40px auto 0",
          padding: "26px 30px",
          background: INK,
          borderTop: `3px solid ${YEL}`,
          borderBottom: "1px solid rgba(245,184,31,.25)",
          textDecoration: "none",
        }}
      >
        <div className="rc-glyph">
          <div className="rc-glyph-sweep" />
          <div className="rc-glyph-dot" />
        </div>

        <span
          style={{
            display: "inline-block",
            padding: "4px 8px",
            background: YEL,
            color: INK,
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 8.5,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          Live · Wire
        </span>

        <span style={{ flex: "2 1 300px", minWidth: 240 }}>
          <span
            style={{
              display: "block",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 22,
              color: PAPER,
              lineHeight: 1.2,
            }}
          >
            The Earned Media Radar<span style={{ color: YEL }}>.</span>
          </span>
          <span
            style={{
              display: "block",
              fontFamily: GROT,
              fontSize: 12.5,
              color: "rgba(241,235,222,.62)",
              marginTop: 6,
              maxWidth: 480,
              lineHeight: 1.5,
            }}
          >
            A live map of what the press is covering across PR, earned media, SEO, and AI search — powered by SignalIQ.
          </span>
        </span>

        <span className="rc-stats" style={{ flex: "1 1 220px" }}>
          <span>
            <span style={{ display: "block", fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: YEL, lineHeight: 1 }}>28</span>
            <span style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", marginTop: 4 }}>Beats tracked</span>
          </span>
          <span>
            <span style={{ display: "block", fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: YEL, lineHeight: 1 }}>4</span>
            <span style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", marginTop: 4 }}>Lenses · PR / SEO / GEO / Earned</span>
          </span>
        </span>

        <span
          className="rc-cta"
          style={{
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 11.5,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: INK,
            background: YEL,
            padding: "11px 18px",
            whiteSpace: "nowrap",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          Open Radar &rarr;
        </span>
      </Link>

      {/* "Also live" strip — the other SignalIQ-powered radars. Sits inside
          the same ink band so it works on any page background. */}
      <div
        style={{
          maxWidth,
          margin: "0 auto 40px",
          padding: "10px 30px 12px",
          background: INK,
          borderBottom: `3px solid ${YEL}`,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 8.5,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(241,235,222,.45)",
          }}
        >
          Also live
        </span>
        {[
          { label: "KSA Tourism & Hospitality Radar", href: "/ksa-tourism-radar" },
          { label: "KSA Retail & Consumer Radar", href: "/ksa-retail-radar" },
          { label: "Founder Movers", href: "/founder-movers" },
        ].map((r) => (
          <Link
            key={r.href}
            href={r.href}
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "rgba(241,235,222,.85)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(245,184,31,.45)",
              paddingBottom: 2,
            }}
          >
            {r.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}

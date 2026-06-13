import type { Metadata } from "next";
import Script from "next/script";
import { Colophon } from "@/components/bureau";
import { SCaps } from "@/components/bureau/primitives";
import {
  CAL_LINK,
  CAL_URL,
  GROT,
  INK,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Book a Strategy Call",
  description:
    "Book a free 30-minute strategy call with Syed Irfan Ajmal. " +
    "Fractional CMO, earned media strategist, and founder of DMR.agency.",
};

export default function StrategyCallPage() {
  return (
    <main style={{ background: PAPER, minHeight: "100vh" }}>
      {/* Cal.com inline init */}
      <Script id="cal-inline-strategy" strategy="afterInteractive">{`
        (function tryInit() {
          if (typeof Cal !== "undefined") {
            Cal("inline", {
              elementOrSelector: "#cal-strategy-call",
              calLink: "syed-irfan-ajmal-cjjebv/30min",
              config: { layout: "month_view" },
            });
          } else {
            setTimeout(tryInit, 200);
          }
        })();
      `}</Script>

      {/* Page header */}
      <section
        style={{
          background: INK,
          padding: "64px 24px 56px",
          textAlign: "center",
        }}
      >
        <SCaps size={10} ls="0.24em" color={YEL}>
          Free &nbsp;&middot;&nbsp; 30 minutes &nbsp;&middot;&nbsp; No pitch deck
        </SCaps>
        <h1
          style={{
            margin: "16px auto 0",
            maxWidth: 640,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(32px, 5vw, 58px)",
            lineHeight: 1.02,
            letterSpacing: "-0.028em",
            color: PAPER,
          }}
        >
          Book a strategy call.
        </h1>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: 520,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.55,
            color: "rgba(250,250,250,.65)",
          }}
        >
          Tell me where the business is and where you need it in 12 months.
          I will tell you what marketing can and cannot do about that.
        </p>

        <div
          style={{
            margin: "36px auto 0",
            maxWidth: 560,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px 16px",
            textAlign: "left",
          }}
        >
          {([
            { n: "01", t: "30-min call",       d: "Tell me the situation." },
            { n: "02", t: "Proposal in 48h",   d: "If we fit, I'll write a scope." },
            { n: "03", t: "Start in a week",   d: "No lengthy onboarding." },
          ] as const).map(s => (
            <div key={s.n}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 11, color: YEL, letterSpacing: "0.04em" }}>{s.n}</div>
              <div style={{ marginTop: 6, fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: PAPER, lineHeight: 1.25 }}>{s.t}</div>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 13, color: "rgba(250,250,250,.45)", lineHeight: 1.5, fontStyle: "italic" }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cal.com inline calendar */}
      <section
        style={{
          padding: "64px 24px 80px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <div
          id="cal-strategy-call"
          style={{
            minWidth: 320,
            height: 700,
            overflow: "scroll",
          }}
        />
      </section>

      {/* Fallback link — visible if Cal.com fails to load */}
      <section style={{ padding: "0 24px 64px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 15,
            color: INK55,
            lineHeight: 1.6,
          }}
        >
          Calendar not loading?{" "}
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: INK, textDecoration: "underline" }}
          >
            Open on cal.com &rarr;
          </a>
        </p>
      </section>

      {/* What to expect */}
      <section
        style={{
          borderTop: `1px solid ${INK}`,
          background: PAPER2,
          padding: "56px 24px 56px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <SCaps size={10} ls="0.20em" color={INK55}>What to expect</SCaps>
          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "28px 40px",
            }}
          >
            {([
              {
                t: "No upsell",
                d: "If a Fractional CMO engagement is not the right fit for your stage, I will tell you. There is no pitch on the call.",
              },
              {
                t: "Prepared",
                d: "I will look at your site, your competitors, and your public presence before we speak. The call starts at level two, not zero.",
              },
              {
                t: "Confidential",
                d: "Everything you share stays between us. No case study without permission, no sharing with third parties.",
              },
            ] as const).map(item => (
              <div key={item.t}>
                <div
                  style={{
                    width: 20,
                    height: 3,
                    background: YEL,
                    marginBottom: 14,
                  }}
                />
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 18,
                    color: INK,
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.t}
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontFamily: SERIF,
                    fontSize: 15,
                    color: INK70,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  {item.d}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 48,
              padding: "28px 32px",
              background: INK,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px 24px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: YEL,
                }}
              >
                Prefer email?
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 16,
                  color: PAPER,
                  lineHeight: 1.4,
                }}
              >
                sia@syedirfanajmal.com &mdash; reply within one working day.
              </div>
            </div>
            <a
              href="mailto:sia@syedirfanajmal.com"
              style={{
                padding: "12px 22px",
                border: `1px solid ${PAPER}`,
                color: PAPER,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Send an email &nearr;
            </a>
          </div>
        </div>
      </section>

      <Colophon />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fractional CMO Pilot Offer · Resourcex × happy.co",
  description: "One-page engagement outline for the Resourcex × happy.co Fractional CMO Pilot: scope, rate, success-fee structure, and pilot terms.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex/cmo-pilot" },
};

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const PAPER   = "#FAFAFA";
const PAPER2  = "#F0F0EE";
const INK     = "#1a1410";
const INK70   = "rgba(26,20,16,.70)";
const INK55   = "rgba(26,20,16,.55)";
const INK35   = "rgba(26,20,16,.32)";
const INK15   = "rgba(26,20,16,.15)";
const YEL     = "#f5b81f";
const YEL2    = "#ffc83a";
const SERIF   = "var(--font-serif)";
const GROT    = "var(--font-grot)";
const MONO    = "var(--font-mono)";
const P25     = "rgba(250,250,250,.25)";
const P45     = "rgba(250,250,250,.45)";
const P70     = "rgba(250,250,250,.70)";
const P72     = "rgba(250,250,250,.72)";

/* Shared section mast component */
function SectionMast({ num, label, vol, dark }: { num: string; label: string; vol?: string; dark?: boolean }) {
  const rule   = dark ? P25  : INK35;
  const text   = dark ? P45  : INK55;
  const bottom = dark ? `1px solid ${P25}` : `1px solid ${INK35}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: INK, background: YEL, padding: "3px 8px", flexShrink: 0,
        }}>
          § {num}
        </span>
        <span style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: dark ? P45 : INK55,
        }}>
          {label}
        </span>
        <div style={{ flexGrow: 1, height: 1, background: rule }} />
        {vol && (
          <span style={{ fontFamily: MONO, fontSize: 9, color: text, flexShrink: 0 }}>
            {vol}
          </span>
        )}
      </div>
      {/* Double rule */}
      <div style={{ height: 1, background: dark ? P45 : INK }} />
      <div style={{ height: 3, marginTop: 3, background: dark ? P45 : INK }} />
    </div>
  );
}

export default function CmoPilotProposal() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <style>{`
        .cmo-book-btn:hover { background: ${YEL2} !important; }
        @media (max-width: 700px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-left, .hero-right { border-right: none !important; border-bottom: 1px solid ${INK} !important; }
          .invest-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .timeline-grid { grid-template-columns: 1fr 1fr !important; }
          .cover-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .masthead-center { display: none !important; }
          .timeline-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", background: PAPER }}>

        {/* ══ MASTHEAD ══════════════════════════════════════════════════════ */}
        <header style={{
          borderBottom: `1px solid ${INK}`,
          padding: "14px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}>
          {/* Left: SIA logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: YEL,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: GROT, fontWeight: 900, fontSize: 11, color: INK,
              flexShrink: 0,
            }}>
              SIA
            </div>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase", color: INK55,
            }}>
              Syed Irfan Ajmal
            </span>
          </div>

          {/* Center: THE SIA WIRE */}
          <div className="masthead-center" style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: GROT, fontWeight: 900, fontSize: 13,
              letterSpacing: "0.30em", textTransform: "uppercase", color: INK,
            }}>
              THE SIA WIRE
            </div>
            <div style={{
              fontFamily: GROT, fontWeight: 400, fontSize: 10,
              letterSpacing: "0.16em", textTransform: "uppercase", color: INK55,
              marginTop: 3,
            }}>
              Pilot Proposal &nbsp;·&nbsp; Fractional CMO &nbsp;·&nbsp; Advisory
            </div>
          </div>

          {/* Right: date + vol */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.16em", color: INK55,
            }}>
              June 2026
            </div>
            <div style={{
              fontFamily: MONO, fontSize: 10, color: INK55, marginTop: 2,
            }}>
              Vol. I &nbsp;·&nbsp; № 01
            </div>
          </div>
        </header>

        {/* ══ HERO 3-COLUMN GRID ════════════════════════════════════════════ */}
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 180px",
            borderBottom: `1px solid ${INK}`,
          }}
        >
          {/* Left panel */}
          <div
            className="hero-left"
            style={{
              borderRight: `1px solid ${INK}`,
              padding: "28px 22px",
              display: "flex", flexDirection: "column", gap: 20,
            }}
          >
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>PREPARED FOR</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: INK, lineHeight: 1.1 }}>Resourcex.io</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>The Happy.co Account</div>
            </div>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>TERM</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK, lineHeight: 1 }}>3-month</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 3 }}>Pilot &nbsp;·&nbsp; Extendable to 6</div>
            </div>
            <div>
              <div style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK,
                borderBottom: `2px solid ${YEL}`, display: "inline-block", lineHeight: 1.1,
              }}>
                10 hrs
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>/ Week commitment</div>
            </div>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>START</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 13, color: INK, lineHeight: 1.4 }}>First Monday after sign-off</div>
            </div>
          </div>

          {/* Center */}
          <div style={{
            padding: "32px",
            borderRight: `1px solid ${INK}`,
          }}>
            <div style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK55, marginBottom: 12,
            }}>
              Est. 2013 &nbsp;·&nbsp; Global
            </div>
            <h1 style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 0.96, letterSpacing: "-0.03em",
              color: INK, marginBottom: 20,
            }}>
              Fractional CMO<br />
              <em>Pilot</em>
            </h1>

            {/* Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
                letterSpacing: "0.14em", textTransform: "uppercase",
                background: INK, color: PAPER, padding: "5px 10px",
              }}>
                TECHNICAL DEPTH
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: INK55 }}>→</span>
              <span style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
                letterSpacing: "0.14em", textTransform: "uppercase",
                background: YEL, color: INK, padding: "5px 10px",
              }}>
                BUSINESS IMPACT
              </span>
            </div>

            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15,
              lineHeight: 1.6, color: INK70, textAlign: "justify",
              marginBottom: 20,
            }}>
              One person fluent in both languages: represent Resourcex in every conversation, keep both sides aligned, and grow the account, including the case for a dedicated happy.co dev team in Pakistan.
            </p>

            {/* Flow diagram */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              border: `1px solid ${INK}`, gap: 1, background: INK15,
            }}>
              {[
                { label: "RESOURCEX", sub: "Engineering", highlight: false },
                { label: "IRFAN",     sub: "Account Lead", highlight: true  },
                { label: "HAPPY.CO",  sub: "Product",      highlight: false },
              ].map((c) => (
                <div key={c.label} style={{
                  background: c.highlight ? YEL : PAPER2,
                  padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{
                    fontFamily: GROT, fontWeight: 800, fontSize: 9,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: INK,
                  }}>
                    {c.label}
                  </div>
                  <div style={{
                    fontFamily: GROT, fontWeight: 400, fontSize: 8,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: INK55, marginTop: 2,
                  }}>
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Contents */}
          <div
            className="hero-right"
            style={{ padding: "28px 20px", display: "flex", flexDirection: "column" }}
          >
            <div style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK55, marginBottom: 14,
            }}>
              CONTENTS
            </div>
            {[
              { num: "01", label: "THE ENGAGEMENT",   sub: "3-month pilot"          },
              { num: "02", label: "PILOT COVERS",      sub: "Included · Not included" },
              { num: "03", label: "INVESTMENT",        sub: "Base + success fee"      },
              { num: "04", label: "NEXT STEP",         sub: "Selected results"        },
            ].map((row) => (
              <div key={row.num} style={{
                borderBottom: `1px solid ${INK15}`,
                padding: "10px 0",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{
                    fontFamily: GROT, fontWeight: 700, fontSize: 9,
                    letterSpacing: "0.10em", color: YEL,
                  }}>
                    § {row.num}
                  </span>
                  <span style={{
                    fontFamily: GROT, fontWeight: 700, fontSize: 9,
                    letterSpacing: "0.12em", textTransform: "uppercase", color: INK,
                  }}>
                    {row.label}
                  </span>
                </div>
                <div style={{
                  fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
                  fontSize: 11, color: INK55, marginTop: 2,
                }}>
                  {row.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ §01 THE ENGAGEMENT ════════════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="01" label="THE ENGAGEMENT" vol="Vol. I · № 01" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 24 }}>
            {/* Left: body */}
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15.5,
              lineHeight: 1.6, color: INK70, textAlign: "justify", margin: 0,
            }}>
              One person fluent in both languages: represent Resourcex in every conversation, keep both sides aligned, and grow the account — including building the case for a dedicated happy.co development team in Pakistan.
            </p>

            {/* Right: data grid */}
            <div style={{
              border: `1px solid ${INK15}`,
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 1, background: INK15,
            }}>
              <div style={{ background: PAPER, padding: "16px 20px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>TERM</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1 }}>3-month</div>
                <div style={{ fontFamily: GROT, fontWeight: 400, fontSize: 8.5, color: INK55, marginTop: 3 }}>extendable to 6</div>
              </div>
              <div style={{ background: PAPER, padding: "16px 20px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>COMMITMENT</div>
                <div style={{
                  fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK,
                  borderBottom: `2px solid ${YEL}`, display: "inline-block", lineHeight: 1,
                }}>
                  10 hrs
                </div>
                <div style={{ fontFamily: GROT, fontWeight: 400, fontSize: 8.5, color: INK55, marginTop: 3 }}>per week</div>
              </div>
              <div style={{ background: PAPER, padding: "16px 20px", gridColumn: "1 / -1" }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>START</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 14, color: INK }}>First Monday after sign-off</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            className="timeline-grid"
            style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              border: `1px solid ${INK}`, gap: 1, background: INK15,
            }}
          >
            {[
              { label: "DAY 0",               body: "Kick-off call, briefing, shared workspace set up" },
              { label: "SAFETY VALVE · DAY 30", body: "First checkpoint — either side may exit with 14 days' notice" },
              { label: "DAY 90",              body: "Full 3-month pilot closes; renewal or exit" },
              { label: "MONTH 6",             body: "Optional extension; full retainer renegotiation" },
            ].map((t) => (
              <div key={t.label} style={{ background: PAPER, padding: "14px 16px" }}>
                <div style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: YEL,
                  marginBottom: 6,
                }}>
                  {t.label}
                </div>
                <div style={{
                  fontFamily: SERIF, fontWeight: 400, fontSize: 13,
                  lineHeight: 1.5, color: INK70,
                }}>
                  {t.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: INK15, margin: "0 40px" }} />

        {/* ══ §02 WHAT THE PILOT COVERS ═════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="02" label="WHAT THE PILOT COVERS" vol="Vol. I · № 01" />

          <div
            className="cover-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}` }}
          >
            {/* Included */}
            <div style={{ borderRight: `1px solid ${INK}` }}>
              <div style={{ background: INK, padding: "10px 20px" }}>
                <span style={{
                  fontFamily: GROT, fontWeight: 800, fontSize: 9,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: PAPER,
                }}>
                  INCLUDED
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                {[
                  "Weekly strategy sync with Resourcex leadership",
                  "Direct liaison on all happy.co account conversations",
                  "Earned media angle identification and brief writing",
                  "Ongoing advisory: positioning, messaging, outreach review",
                ].map((item) => (
                  <div key={item} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    marginBottom: 14,
                  }}>
                    <div style={{
                      width: 14, height: 14,
                      background: YEL,
                      border: `1.5px solid ${INK}`,
                      flexShrink: 0, marginTop: 2,
                    }} />
                    <span style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.5, color: INK,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Included */}
            <div>
              <div style={{ background: PAPER2, padding: "10px 20px" }}>
                <span style={{
                  fontFamily: GROT, fontWeight: 800, fontSize: 9,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: INK,
                }}>
                  NOT INCLUDED
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                {[
                  "Content production (writing, design, video)",
                  "Paid media management or ad spend",
                  "Technical SEO implementation",
                  "Sales or business development execution",
                  "Full-time executive responsibilities",
                ].map((item) => (
                  <div key={item} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    marginBottom: 14,
                  }}>
                    <div style={{
                      width: 14, height: 14,
                      border: `1.5px solid ${INK}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>×</span>
                    </div>
                    <span style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.5, color: INK55,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
                <div style={{
                  borderTop: `1px solid ${INK15}`, paddingTop: 12, marginTop: 4,
                }}>
                  <p style={{
                    fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
                    fontSize: 12.5, lineHeight: 1.5, color: INK55, margin: 0,
                  }}>
                    Production partners and implementation teams can be recommended at cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: INK15, margin: "0 40px" }} />

        {/* ══ §03 INVESTMENT ════════════════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="03" label="INVESTMENT" vol="Vol. I · № 01" />

          <div
            className="invest-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}
          >
            {/* Base retainer */}
            <div style={{ border: `1px solid ${INK}`, padding: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>BASE RETAINER</div>
              <div style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 40,
                borderBottom: `2px solid ${YEL}`, display: "inline-block",
                lineHeight: 1, color: INK,
              }}>
                USD 3,500
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>/month</div>
              <p style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5,
                lineHeight: 1.5, color: INK55, marginTop: 12,
              }}>
                Invoiced monthly in advance. Standard rate is $5,000/mo — pilot pricing reflects the relationship and the opportunity.
              </p>
            </div>

            {/* Success fee */}
            <div style={{ border: `1px solid ${INK}`, padding: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>SUCCESS FEE</div>
              <div style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 40,
                borderBottom: `2px solid ${YEL}`, display: "inline-block",
                lineHeight: 1, color: INK,
              }}>
                10%
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>of new revenue</div>
              <p style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5,
                lineHeight: 1.5, color: INK55, marginTop: 12,
              }}>
                Applied to net new revenue directly attributable to the happy.co account relationship during the engagement period.
              </p>
            </div>
          </div>

          {/* Context callout */}
          <div style={{
            background: PAPER2,
            borderLeft: `3px solid ${YEL}`,
            padding: "16px 20px",
            marginBottom: 20,
          }}>
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 13.5,
              lineHeight: 1.6, color: INK70, margin: 0,
            }}>
              The base retainer covers strategic time and account presence. The success fee aligns incentives directly with outcomes — if the happy.co relationship grows, we both benefit. No hidden fees, no surprise charges.
            </p>
          </div>

          {/* Info grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
            border: `1px solid ${INK15}`, padding: "16px 20px",
          }}>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>SIMPLE EXIT</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13.5, lineHeight: 1.5, color: INK70, margin: 0 }}>
                14 days' written notice from either side. No kill fees, no lock-in beyond the notice period.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>CASE STUDY</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13.5, lineHeight: 1.5, color: INK70, margin: 0 }}>
                Irfan may publish anonymised results 6 months after engagement close, unless Resourcex opts out in writing.
              </p>
            </div>
          </div>
        </section>

        {/* ══ §04 DARK CTA + SELECTED RESULTS ══════════════════════════════ */}
        <section style={{ background: INK, padding: "36px 40px" }}>
          <SectionMast num="04" label="NEXT STEP" dark />

          <div
            className="cta-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 8 }}
          >
            {/* Left: CTA */}
            <div>
              <p style={{
                fontFamily: SERIF, fontWeight: 400, fontSize: 20,
                lineHeight: 1.5, color: P72, marginBottom: 20,
              }}>
                Ready to move forward? Book a 30-minute call to finalise terms and set a start date.
              </p>
              <div style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 17,
                color: PAPER, marginBottom: 16,
              }}>
                Syed Irfan Ajmal
              </div>
              <Link
                href="/strategy-call"
                className="cmo-book-btn"
                style={{
                  display: "inline-block",
                  fontFamily: GROT, fontWeight: 700, fontSize: 10,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  background: YEL, color: INK,
                  padding: "13px 22px",
                  textDecoration: "none",
                  transition: "background 0.12s ease",
                }}
              >
                BOOK YOUR STRATEGY CALL →
              </Link>
            </div>

            {/* Right: Selected results */}
            <div>
              <div style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: P45, marginBottom: 12,
              }}>
                SELECTED RESULTS
              </div>
              <div style={{ border: `1px solid ${P25}` }}>
                {[
                  { client: "RIDESTER",    result: "0 → 1.5M monthly visitors"     },
                  { client: "CENTRIQ",     result: "6× daily signups"              },
                  { client: "NAT. TYRES",  result: "$160K → $1.2M monthly revenue" },
                ].map((r, i, arr) => (
                  <div key={r.client} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr",
                    alignItems: "center", gap: 16,
                    padding: "12px 16px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${P25}` : "none",
                  }}>
                    <span style={{
                      fontFamily: GROT, fontWeight: 800, fontSize: 10,
                      letterSpacing: "0.12em", textTransform: "uppercase", color: YEL,
                    }}>
                      {r.client}
                    </span>
                    <span style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.4, color: P70,
                    }}>
                      {r.result}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{
                fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
                fontSize: 12, color: P45, marginTop: 10,
              }}>
                More at{" "}
                <Link href="/fractional-cmo" style={{ color: P45 }}>
                  syedirfanajmal.com/fractional-cmo
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer style={{
          borderTop: `1px solid ${INK}`,
          padding: "14px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          {[
            "© 2013 – 2026 Syed Irfan Ajmal",
            "SIA Enterprises Inc (WY C-Corp) · SIA Enterprises (PK Sole Prop.)",
            "sia@syedirfanajmal.com · www.syedirfanajmal.com",
          ].map((text) => (
            <span key={text} style={{
              fontFamily: GROT, fontWeight: 400, fontSize: 9,
              letterSpacing: "0.12em", textTransform: "uppercase", color: INK55,
            }}>
              {text}
            </span>
          ))}
        </footer>

      </div>
    </div>
  );
}

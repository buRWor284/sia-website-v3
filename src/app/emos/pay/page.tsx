import type { Metadata } from "next";
import {
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  MONO,
  YEL,
} from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Complete Your EMOS Payment",
  description:
    "Secure your seat in EMOS Cohort 1. Foundation ($2,000) or Accelerate ($3,500) — one-time investment, capability you keep forever.",
  robots: { index: false, follow: false },
};

/* =========================================================================
   EMOS PAY PAGE — unlisted, noindexed
   ========================================================================= */

/*
 * ── PAYMENT LINK PLACEHOLDERS ──────────────────────────────────────────
 * Replace these with your actual Wise / Payoneer payment-request URLs.
 * Each link should be for the specific amount ($2,000 or $3,500).
 */
const WISE_FOUNDATION_LINK  = "#wise-foundation-placeholder";
const WISE_ACCELERATE_LINK  = "#wise-accelerate-placeholder";
const PAYONEER_FOUNDATION_LINK = "#payoneer-foundation-placeholder";
const PAYONEER_ACCELERATE_LINK = "#payoneer-accelerate-placeholder";

export default function EmosPayPage() {
  return (
    <>
      {/* ── Announcement bar ──────────────────────────────────────────── */}
      <div className="emos-announce">
        Cohort 1 begins <strong>June 22, 2026</strong> &nbsp;·&nbsp; 5 founders
        &nbsp;·&nbsp; Application required
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="emos-nav">
        <div className="emos-nav-inner">
          <a href="/emos" className="emos-nav-logo">
            <span
              style={{
                background: YEL,
                color: INK,
                padding: "0 0.12em",
                fontWeight: "inherit",
              }}
            >
              EMOS
            </span>
            &nbsp; by Syed Irfan Ajmal
          </a>
          <a
            href="/emos"
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: INK55,
              textDecoration: "none",
            }}
          >
            ← Back to overview
          </a>
        </div>
      </nav>

      <div style={{ paddingTop: 91 }}>
        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section
          className="sy sx"
          style={{ textAlign: "center", paddingTop: 72, paddingBottom: 48 }}
        >
          <div className="max" style={{ maxWidth: 720, marginInline: "auto" }}>
            <div
              style={{
                fontFamily: GROT,
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: "0.24em",
                textTransform: "uppercase" as const,
                color: YEL,
                marginBottom: 20,
              }}
            >
              Complete Your Payment
            </div>
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: "clamp(28px, 4.5vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: INK,
                marginBottom: 20,
                textTransform: "uppercase" as const,
              }}
            >
              Secure Your Seat.
            </h1>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(16px, 1.8vw, 19px)",
                lineHeight: 1.65,
                color: INK70,
                maxWidth: 560,
                marginInline: "auto",
                marginBottom: 0,
              }}
            >
              Choose your track below and complete payment via{" "}
              <strong style={{ color: INK }}>Wise</strong> or{" "}
              <strong style={{ color: INK }}>Payoneer</strong>. Your seat is
              held once payment clears.
            </p>
          </div>
        </section>

        {/* ── TRACK CARDS ─────────────────────────────────────────────── */}
        <section className="sx" style={{ paddingBottom: 72 }}>
          <div className="max" style={{ maxWidth: 920, marginInline: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
              }}
              className="emos-pay-cards-grid"
            >
              {/* ── Foundation ── */}
              <div
                style={{
                  padding: "40px 32px",
                  border: `1px solid ${INK15}`,
                  borderRight: "none",
                  background: PAPER,
                }}
              >
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase" as const,
                    color: INK55,
                    marginBottom: 8,
                  }}
                >
                  Foundation Track
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 800,
                    fontSize: 48,
                    letterSpacing: "-0.03em",
                    color: INK,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  $2,000
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: INK55,
                    marginBottom: 28,
                  }}
                >
                  one-time · 4 weeks
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {[
                    "Group cohort format",
                    "30-day Slack access",
                    "1 placement guaranteed in 60 days",
                    "Journo Tracker [Beta]",
                  ].map((feat) => (
                    <div
                      key={feat}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontFamily: SERIF,
                        fontSize: 15,
                        color: INK70,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ color: YEL, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {feat}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a
                    href={WISE_FOUNDATION_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 24px",
                      border: `2px solid ${INK}`,
                      background: "transparent",
                      fontFamily: GROT,
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: INK,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Pay $2,000 via Wise →
                  </a>
                  <a
                    href={PAYONEER_FOUNDATION_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 24px",
                      border: `1px solid ${INK15}`,
                      background: "transparent",
                      fontFamily: GROT,
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: INK55,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Pay $2,000 via Payoneer →
                  </a>
                </div>
              </div>

              {/* ── Accelerate ── */}
              <div
                style={{
                  padding: "40px 32px",
                  border: `2px solid ${YEL}`,
                  background: PAPER,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    right: 20,
                    background: YEL,
                    padding: "3px 10px",
                    fontFamily: GROT,
                    fontWeight: 900,
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: INK,
                  }}
                >
                  ★ Best Value
                </div>
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase" as const,
                    color: YEL,
                    marginBottom: 8,
                  }}
                >
                  Accelerate Track
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 800,
                    fontSize: 48,
                    letterSpacing: "-0.03em",
                    color: INK,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  $3,500
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: INK55,
                    marginBottom: 28,
                  }}
                >
                  one-time · 8 weeks
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {[
                    "Done-with-you first 5 placements",
                    "Group + 1-on-1 strategy calls",
                    "90-day Slack access",
                    "2 placements guaranteed in 90 days",
                    "Priority pitch reviews (4 hrs)",
                    "VA sourcing module",
                    "Linkable asset build (Weeks 5–8)",
                    "Full EMOS Tools suite",
                    "Lifetime access to future cohorts",
                  ].map((feat) => (
                    <div
                      key={feat}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontFamily: SERIF,
                        fontSize: 15,
                        color: INK70,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ color: YEL, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {feat}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a
                    href={WISE_ACCELERATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 24px",
                      border: "none",
                      background: YEL,
                      fontFamily: GROT,
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: INK,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Pay $3,500 via Wise →
                  </a>
                  <a
                    href={PAYONEER_ACCELERATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 24px",
                      border: `1px solid ${INK15}`,
                      background: "transparent",
                      fontFamily: GROT,
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: INK55,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Pay $3,500 via Payoneer →
                  </a>
                </div>
              </div>
            </div>

            {/* ── Guarantee reminder ── */}
            <div
              style={{
                marginTop: 40,
                padding: "22px 28px",
                background: YEL,
                border: `1px solid ${INK}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: INK,
                  margin: 0,
                }}
              >
                <strong>Placements-or-refund guarantee.</strong> Foundation: 1
                verified placement in 60 days. Accelerate: 2 in 90 days. Miss
                either target and every dollar comes back.
              </p>
            </div>

            {/* ── How it works ── */}
            <div
              style={{
                marginTop: 48,
                padding: "32px",
                border: `1px solid ${INK15}`,
                background: PAPER2,
              }}
            >
              <div
                style={{
                  fontFamily: GROT,
                  fontWeight: 900,
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase" as const,
                  color: INK55,
                  marginBottom: 20,
                }}
              >
                How Payment Works
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  {
                    n: "1",
                    text: "Click your preferred payment method above. You'll be taken to a secure Wise or Payoneer payment page.",
                  },
                  {
                    n: "2",
                    text: "Complete the payment using bank transfer, card, or your Wise/Payoneer balance.",
                  },
                  {
                    n: "3",
                    text: "Once payment clears, you'll receive a confirmation email with onboarding details and Slack access within 24 hours.",
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        background: YEL,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: GROT,
                        fontWeight: 900,
                        fontSize: 11,
                        color: INK,
                        flexShrink: 0,
                      }}
                    >
                      {step.n}
                    </div>
                    <p
                      style={{
                        fontFamily: SERIF,
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: INK70,
                        margin: 0,
                      }}
                    >
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Questions ── */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  color: INK55,
                  lineHeight: 1.6,
                }}
              >
                Questions before paying?{" "}
                <a
                  href="mailto:sia@syedirfanajmal.com"
                  style={{ color: INK, fontWeight: 700 }}
                >
                  sia@syedirfanajmal.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer className="emos-footer sx">
          <div className="max emos-footer-inner">
            <div className="emos-footer-copy">
              © 2026 Syed Irfan Ajmal &nbsp;·&nbsp; SIA Enterprises Inc
            </div>
            <div className="emos-footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="mailto:sia@syedirfanajmal.com">sia@syedirfanajmal.com</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Responsive override for mobile ── */}
      <style>{`
        .emos-pay-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 740px) {
          .emos-pay-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .emos-pay-cards-grid > div:first-child {
            border-right: 1px solid rgba(26,20,16,.15) !important;
            border-bottom: none !important;
          }
        }
      `}</style>
    </>
  );
}

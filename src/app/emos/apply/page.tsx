import type { Metadata } from "next";
import { EmosApplyForm } from "@/components/bureau/EmosApplyForm";
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
  title: "Apply for EMOS Cohort 1 · 5 Seats · June 22, 2026",
  description:
    "One short application. We review every submission personally within 48 hours. If it's a fit, we'll send a Calendly link to talk through the details.",
};

/* =========================================================================
   EMOS APPLY PAGE
   ========================================================================= */

export default function EmosApplyPage() {
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
        <section className="sy sx" style={{ textAlign: "center", paddingTop: 72, paddingBottom: 48 }}>
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
              Apply for Cohort 1
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
              5 Seats. June 22, 2026.
              <br />
              Here&rsquo;s How to Claim One.
            </h1>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(16px, 1.8vw, 19px)",
                lineHeight: 1.65,
                color: INK70,
                maxWidth: 560,
                marginInline: "auto",
                marginBottom: 28,
              }}
            >
              One short application. We review every submission{" "}
              <strong style={{ color: INK }}>personally within 48 hours</strong>.
              If it&rsquo;s a fit, we&rsquo;ll send a Calendly link to talk
              through the details.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                border: `1px solid ${INK15}`,
                background: PAPER2,
                fontFamily: SERIF,
                fontSize: 14,
              }}
            >
              <span>⏱</span>
              <span>
                <strong>5 minutes.</strong>{" "}
                <span style={{ color: INK70, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Decision within 48 hours.
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* ── MAIN: Two-column (value props + form) ───────────────────── */}
        <section className="sx" style={{ paddingBottom: 72 }}>
          <div className="max">
            <div className="emos-apply-page-grid">
              {/* ── Left: What You'll Walk Away With ── */}
              <div>
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 900,
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase" as const,
                    color: YEL,
                    marginBottom: 14,
                  }}
                >
                  What You&rsquo;ll Walk Away With
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: "clamp(22px, 2.8vw, 30px)",
                    lineHeight: 1.15,
                    color: INK,
                    marginBottom: 36,
                  }}
                >
                  An in-house earned media engine &mdash; not another agency
                  retainer.
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {[
                    {
                      icon: "🏆",
                      title: "Investor-grade media credibility",
                      body: "Verified placements in the publications buyers and investors trust — the kind of presence checked before your first Series A meeting.",
                    },
                    {
                      icon: "💡",
                      title: "Guided implementation, not a course",
                      body: "DIY video lessons + done-with-you group calls + 1:1 reviews with Syed. We sit with you while you pitch.",
                    },
                    {
                      icon: "📊",
                      title: "A repeatable pitching cadence",
                      body: "Weekly sessions, real pitches to real journalists. By week 4 (Foundation) or week 8 (Accelerate), the cadence runs without you.",
                    },
                    {
                      icon: "✍️",
                      title: "Thought leadership that compounds",
                      body: "Position yourself as the named voice in your category. The placements stay live and keep ranking long after the cohort ends.",
                    },
                    {
                      icon: "🛡️",
                      title: "Placements-or-refund guarantee",
                      body: "Foundation: 1 verified placement in 60 days. Accelerate: 2 in 90 days. Miss either and every dollar comes back.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.4 }}>
                        {item.icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontWeight: 700,
                            fontSize: 17,
                            color: INK,
                            marginBottom: 4,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.title}
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
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Yellow callout ── */}
                <div
                  style={{
                    marginTop: 40,
                    padding: "18px 22px",
                    background: YEL,
                    border: `1px solid ${INK}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: INK,
                      margin: 0,
                    }}
                  >
                    <strong>5 seats only.</strong> Cohort 1 starts June 22, 2026.
                    We close applications as soon as the cohort fills — early
                    applicants get priority on the 15-minute call slots.
                  </p>
                </div>
              </div>

              {/* ── Right: Application Form ── */}
              <div
                style={{
                  border: `1px solid ${INK15}`,
                  padding: "36px 32px",
                  background: PAPER,
                }}
              >
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 900,
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase" as const,
                    color: YEL,
                    marginBottom: 10,
                  }}
                >
                  Your Application
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 22,
                    lineHeight: 1.2,
                    color: INK,
                    marginBottom: 6,
                  }}
                >
                  Tell us about you and your company
                </h3>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: INK55,
                    marginBottom: 28,
                  }}
                >
                  Takes about 5 minutes. Required fields are marked with{" "}
                  <span style={{ color: INK }}>*</span>.
                </p>

                <EmosApplyForm />

                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 13,
                    color: INK55,
                    marginTop: 20,
                    textAlign: "center" as const,
                  }}
                >
                  📋 We review every application and respond within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE PROCESS ─────────────────────────────────────────────── */}
        <section className="sy sx" style={{ textAlign: "center", background: PAPER2 }}>
          <div className="max" style={{ maxWidth: 800, marginInline: "auto" }}>
            <div
              style={{
                fontFamily: GROT,
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: "0.24em",
                textTransform: "uppercase" as const,
                color: YEL,
                marginBottom: 16,
              }}
            >
              The Process
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                textTransform: "uppercase" as const,
                color: INK,
                marginBottom: 16,
              }}
            >
              What Happens After You Apply.
            </h2>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                lineHeight: 1.6,
                color: INK70,
                marginBottom: 48,
              }}
            >
              Four short steps. No discovery-call gauntlet. No long-form sales
              sequence.
            </p>
            <div className="emos-process-steps">
              {[
                {
                  n: "1",
                  title: "Submit your application",
                  body: "5 minutes. The form on this page.",
                },
                {
                  n: "2",
                  title: "Personal review",
                  body: "Syed reads every submission within 48 hours.",
                },
                {
                  n: "3",
                  title: "15-minute call",
                  body: "Qualified applicants only. Confirm fit, no pitch.",
                },
                {
                  n: "4",
                  title: "Decision & onboarding",
                  body: "Seat held only after we both say yes.",
                },
              ].map((step) => (
                <div key={step.n} className="emos-process-step-card">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: YEL,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: GROT,
                      fontWeight: 900,
                      fontSize: 14,
                      color: INK,
                      marginBottom: 14,
                      marginInline: "auto",
                    }}
                  >
                    {step.n}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: 17,
                      color: INK,
                      marginBottom: 6,
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: INK55,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
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
    </>
  );
}

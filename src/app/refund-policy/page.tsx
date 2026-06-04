import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { DoubleRule, Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Refund Policy",
  robots: { index: false },
};

const LAST_UPDATED = "June 4, 2026";

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Our guarantee",
    body: (
      <>
        <p>
          We stand behind EMOS with a <strong>placements-or-refund guarantee</strong>:
        </p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 12 }}>
          <li><strong>Foundation tier ($2,000):</strong> secure 1 verified media placement within 60 days of cohort end, or receive a full refund — no negotiation.</li>
          <li style={{ marginTop: 8 }}><strong>Accelerate tier ($3,500):</strong> secure 2 verified media placements within 90 days of cohort end, or receive a full refund.</li>
        </ul>
        <p style={{ marginTop: 14 }}>
          A "verified media placement" means a published article, interview, or feature in a recognized outlet that names you as a source or subject, obtained using the EMOS system during your cohort.
        </p>
      </>
    ),
  },
  {
    heading: "Guarantee eligibility",
    body: (
      <>
        <p>To qualify for the guarantee, you must:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 12 }}>
          <li>complete the full EMOS curriculum;</li>
          <li style={{ marginTop: 8 }}>attend the scheduled group calls (or review recordings within 7 days);</li>
          <li style={{ marginTop: 8 }}>submit your pitches and outreach as directed within the cohort timeline; and</li>
          <li style={{ marginTop: 8 }}>show evidence of completed outreach activity upon request.</li>
        </ul>
        <p style={{ marginTop: 14 }}>
          Refund claims that cannot demonstrate genuine participation and outreach effort will not qualify.
        </p>
      </>
    ),
  },
  {
    heading: "How to request a refund",
    body: (
      <p>
        Email <a href="mailto:syedirfanajmal@gmail.com" style={{ color: INK, textDecoration: "underline" }}>syedirfanajmal@gmail.com</a> from the email address used at checkout. Include your order number and a brief summary of outreach activity completed. We review refund requests within <strong>5 business days</strong> and confirm by email.
      </p>
    ),
  },
  {
    heading: "How refunds are issued",
    body: (
      <p>
        Approved refunds are returned to your original payment method through our payment processor (2Checkout / Verifone, Wise, Payoneer, or ElevatePay, depending on how you paid). Depending on your bank or card issuer, it may take several business days for the refund to appear.
      </p>
    ),
  },
  {
    heading: "Outside the guarantee window",
    body: (
      <p>
        Refund requests submitted after the applicable guarantee window (60 or 90 days post-cohort) are evaluated on a case-by-case basis at our discretion. We are not obligated to issue refunds outside this window.
      </p>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about a refund? Email <a href="mailto:syedirfanajmal@gmail.com" style={{ color: INK, textDecoration: "underline" }}>syedirfanajmal@gmail.com</a>.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="sx"
        style={{ background: PAPER, paddingTop: 80, paddingBottom: 56, borderBottom: `1px solid ${INK15}` }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Pill size={11} ls="0.22em">Legal</Pill>
          <h1
            style={{
              marginTop: 20,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.028em",
              color: INK,
            }}
          >
            Refund Policy
          </h1>
          <p
            style={{
              marginTop: 12,
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK55,
            }}
          >
            Last updated: {LAST_UPDATED}
          </p>
          <p style={{ marginTop: 20, fontFamily: SERIF, fontSize: 17, color: INK70, lineHeight: 1.65, maxWidth: 600 }}>
            We want you to get results. This policy explains how our placements-or-refund guarantee works and how to claim it.
          </p>
        </div>
      </section>

      {/* Guarantee banner */}
      <section className="sx" style={{ background: INK, paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(17px, 2.2vw, 22px)", color: PAPER, lineHeight: 1.5 }}>
            🛡 <strong style={{ color: YEL }}>1 verified media placement in 60 days</strong>, or every dollar back.
            <br />
            <span style={{ fontWeight: 400, fontSize: "0.85em", color: "rgba(241,235,222,0.75)" }}>No negotiation. No hoops. See eligibility below.</span>
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="sx" style={{ background: PAPER, paddingTop: 64, paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 48 }}>
              <SCaps style={{ color: INK55, marginBottom: 12 }}>{s.heading}</SCaps>
              <DoubleRule style={{ marginBottom: 20 }} />
              <div style={{ fontFamily: SERIF, fontSize: 16, color: INK70, lineHeight: 1.72 }}>
                {s.body}
              </div>
            </div>
          ))}

          <DoubleRule style={{ marginTop: 64, marginBottom: 24 }} />
          <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>
            Questions? &nbsp;
            <a href="/contact" style={{ color: INK, textDecoration: "underline" }}>Get in touch</a>
          </p>
        </div>
      </section>

      <Subscriptions />
      <Colophon />
      <ScrollButtons />
    </>
  );
}

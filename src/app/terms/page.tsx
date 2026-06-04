import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { DoubleRule, Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false },
};

const LAST_UPDATED = "June 4, 2026";

const sections: { n: string; heading: string; body: React.ReactNode }[] = [
  {
    n: "1",
    heading: "The Service",
    body: (
      <p>
        EMOS — the Expert Media Outreach System — is a cohort-based program teaching founders and executives how to earn verified media placements through a repeatable outreach system. Upon purchase, you receive access to curriculum, tools, and (depending on your tier) live coaching calls and 1-on-1 support, delivered digitally over the cohort period.
      </p>
    ),
  },
  {
    n: "2",
    heading: "Eligibility",
    body: <p>You must be legally able to enter into a binding contract to purchase or use the Service.</p>,
  },
  {
    n: "3",
    heading: "Orders and payment",
    body: (
      <p>
        Prices are displayed at checkout in USD. Payments are processed by our payment processors — which may include 2Checkout (Verifone), Wise, Payoneer, and/or ElevatePay — acting as payment facilitators. By placing an order, you authorize the applicable charge. Your order is confirmed once payment is approved and access to the Service is granted.
      </p>
    ),
  },
  {
    n: "4",
    heading: "Refunds",
    body: (
      <p>
        Refunds are governed by our{" "}
        <a href="/refund-policy" style={{ color: INK, textDecoration: "underline" }}>Refund Policy</a>,
        which includes our placements-or-refund guarantee.
      </p>
    ),
  },
  {
    n: "5",
    heading: "License and acceptable use",
    body: (
      <p>
        We grant you a limited, non-exclusive, non-transferable license to use EMOS for your own business use. You may not resell, redistribute, sublicense, or reverse-engineer the Service or its materials except where permitted by law.
      </p>
    ),
  },
  {
    n: "6",
    heading: "Intellectual property",
    body: (
      <p>
        All content and materials within the Service — including curriculum, templates, tools, and recordings — are owned by SIA Enterprises or its licensors and are protected by applicable intellectual-property laws.
      </p>
    ),
  },
  {
    n: "7",
    heading: "Disclaimers",
    body: (
      <p>
        The Service is provided "as is" and "as available," without warranties of any kind, to the fullest extent permitted by law. Media placement results depend on factors including the quality of your outreach, your niche, and editorial decisions outside our control. Past case studies and client results do not guarantee identical outcomes.
      </p>
    ),
  },
  {
    n: "8",
    heading: "Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, our total liability for any claim arising out of or relating to the Service is limited to the amount you paid for it.
      </p>
    ),
  },
  {
    n: "9",
    heading: "Changes",
    body: (
      <p>
        We may modify the Service and these Terms from time to time. Material changes will be posted on this page with an updated "Last updated" date.
      </p>
    ),
  },
  {
    n: "10",
    heading: "Governing law",
    body: (
      <p>
        These Terms are governed by the laws of Pakistan, without regard to its conflict-of-laws rules.
      </p>
    ),
  },
  {
    n: "11",
    heading: "Contact",
    body: (
      <p>
        SIA Enterprises (sole proprietorship) · Pakistan<br />
        Email: <a href="mailto:syedirfanajmal@gmail.com" style={{ color: INK, textDecoration: "underline" }}>syedirfanajmal@gmail.com</a>
      </p>
    ),
  },
];

export default function TermsofServicePage() {
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
            Terms of Service
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
            These Terms govern your access to and use of syedirfanajmal.com and EMOS — the Expert Media Outreach System (the "Service"), provided by SIA Enterprises ("we", "us", "our"). By purchasing or using the Service, you agree to these Terms.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="sx" style={{ background: PAPER, paddingTop: 64, paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {sections.map((s) => (
            <div key={s.n} style={{ marginBottom: 48 }}>
              <SCaps style={{ color: INK55, marginBottom: 12 }}>{s.n}. {s.heading}</SCaps>
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

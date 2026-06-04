import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { DoubleRule, Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

const LAST_UPDATED = "June 4, 2026";

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Information we collect",
    body: (
      <ul style={{ paddingLeft: 20, lineHeight: 1.75 }}>
        <li><strong>Information you provide:</strong> your name, email address, billing details, and anything you submit when you contact us or place an order.</li>
        <li style={{ marginTop: 10 }}><strong>Payment information:</strong> payments are processed by our payment processor(s) — 2Checkout (Verifone), Wise, Payoneer, and/or ElevatePay. We do <strong>not</strong> store full card numbers on our servers; card and payment data is handled by PCI-DSS-compliant processors.</li>
        <li style={{ marginTop: 10 }}><strong>Usage data:</strong> basic technical information such as IP address, browser type, and pages visited, collected through cookies and similar technologies.</li>
      </ul>
    ),
  },
  {
    heading: "How we use your information",
    body: (
      <p>We use your information only to: process and deliver your order; provide customer support; send you communications related to your order or account; comply with our legal, tax, and accounting obligations; and detect and prevent fraud.</p>
    ),
  },
  {
    heading: "How we share your information",
    body: (
      <>
        <p>We do <strong>not</strong> sell or rent your personal information. We share it only with:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.75, marginTop: 10 }}>
          <li>our payment processor(s), to complete and support your purchase;</li>
          <li style={{ marginTop: 8 }}>service providers who help us operate the Service (e.g., hosting and email providers); and</li>
          <li style={{ marginTop: 8 }}>authorities or third parties where we are required to do so by law.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Cookies",
    body: <p>We use cookies to operate the site and understand how it is used. You can control or disable cookies through your browser settings.</p>,
  },
  {
    heading: "Data retention",
    body: <p>We keep your personal data only as long as necessary for the purposes described above and to meet our legal and tax obligations.</p>,
  },
  {
    heading: "Your rights",
    body: (
      <p>
        Depending on where you live, you may have the right to access, correct, delete, or restrict the processing of your personal data, or to object to it. To exercise any of these rights, email us at{" "}
        <a href="mailto:syedirfanajmal@gmail.com" style={{ color: INK, textDecoration: "underline" }}>syedirfanajmal@gmail.com</a>.
      </p>
    ),
  },
  {
    heading: "International transfers",
    body: <p>Because we serve customers globally, your information may be processed in countries other than your own. Where this happens, we take steps to protect it consistent with this policy.</p>,
  },
  {
    heading: "Security",
    body: <p>We use reasonable technical and organizational measures to protect your personal information.</p>,
  },
  {
    heading: "Contact",
    body: (
      <p>
        SIA Enterprises (sole proprietorship) · Pakistan<br />
        Email: <a href="mailto:syedirfanajmal@gmail.com" style={{ color: INK, textDecoration: "underline" }}>syedirfanajmal@gmail.com</a>
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
            SIA Enterprises ("we", "us", "our") operates syedirfanajmal.com and provides EMOS — the Expert Media Outreach System (the "Service"). This policy explains what personal information we collect, how we use it, who we share it with, and your rights.
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

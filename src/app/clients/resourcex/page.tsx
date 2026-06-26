import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resourcex.io · Client Workspace",
  description: "Private workspace for Resourcex.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex" },
};

const NAVY = "#1B3A5C";
const TEAL = "#0E7C7B";
const INK = "#1a2a3a";
const GRAY = "#6c6c6c";
const LINE = "#d4e4e4";
const BG = "#f2f7f7";

type Asset = { href: string; title: string; desc: string; tag: string; cta: string };

const ASSETS: Asset[] = [
  {
    href: "/clients/resourcex/emos-proposal.html",
    title: "EMOS Private Founder's Intensive — Proposal",
    desc: "Your personalised 8-week earned-media program: full scope, timeline, deliverables, and investment summary. Designed to peak at your acquisition announcement.",
    tag: "Interactive deck",
    cta: "View the proposal →",
  },
  {
    href: "/clients/resourcex/cmo-offer.pdf",
    title: "Fractional CMO Pilot Offer",
    desc: "The one-page engagement outline for the Resourcex × happy.co account: scope, rate, success-fee structure, and pilot terms.",
    tag: "PDF · one-pager",
    cta: "Open the PDF →",
  },
];

export default function ResourcexClientWorkspace() {
  return (
    <main
      style={{
        background: BG,
        minHeight: "100vh",
        color: INK,
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
      }}
    >
      <section
        style={{
          background: `linear-gradient(155deg, ${TEAL} 0%, ${NAVY} 120%)`,
          color: "#fff",
          padding: "48px 0 64px",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,.14)",
              border: "1px solid rgba(255,255,255,.3)",
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".4px",
              marginBottom: 16,
            }}
          >
            Private workspace · Resourcex.io
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, maxWidth: 720 }}>
            Sajid Shah: your SIA client workspace
          </h1>
          <p style={{ marginTop: 12, maxWidth: 640, opacity: 0.92, fontSize: 16 }}>
            Working assets prepared by Syed Irfan Ajmal. Shared privately for your review.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gap: 16, marginTop: -36 }}>
          {ASSETS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              style={{
                display: "block",
                textDecoration: "none",
                color: INK,
                background: "#fff",
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                padding: 22,
                boxShadow: "0 18px 44px -32px rgba(14,124,123,.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h2 style={{ fontSize: 19, color: NAVY, fontWeight: 800 }}>{a.title}</h2>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: TEAL,
                    background: "rgba(14,124,123,.1)",
                    padding: "3px 9px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.tag}
                </span>
              </div>
              <p style={{ marginTop: 8, fontSize: 14, color: GRAY, lineHeight: 1.55 }}>
                {a.desc}
              </p>
              <span
                style={{
                  marginTop: 14,
                  display: "inline-block",
                  background: TEAL,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "9px 16px",
                  borderRadius: 7,
                }}
              >
                {a.cta}
              </span>
            </a>
          ))}
        </div>

        <p style={{ margin: "26px 0 60px", fontSize: 12, color: GRAY, lineHeight: 1.6 }}>
          All materials are confidential and prepared exclusively for Sajid Shah / Resourcex.io.
          Please do not forward or share externally.
        </p>
      </section>
    </main>
  );
}

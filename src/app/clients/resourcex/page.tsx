import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resourcex.io · Client Workspace",
  description: "Private workspace for Sajid Shah / Resourcex.io.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex" },
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
const SERIF   = "var(--font-serif)";
const GROT    = "var(--font-grot)";
const MONO    = "var(--font-mono)";
const P25     = "rgba(250,250,250,.25)";

const DOCS = [
  {
    title: "EMOS Private Founder's Intensive — Proposal",
    body: "Your personalised 8-week earned-media program: full scope, timeline, deliverables, and investment summary. Designed to peak at your acquisition announcement.",
    cta: "View the proposal →",
    href: "/clients/resourcex/emos-deck",
    tag: "INTERACTIVE DECK",
    tagDark: false,
  },
  {
    title: "Fractional CMO Pilot Offer",
    body: "The one-page engagement outline for the Resourcex × happy.co account: scope, rate, success-fee structure, and pilot terms.",
    cta: "Open the PDF →",
    href: "/clients/resourcex/cmo-pilot",
    tag: "PDF · ONE-PAGER",
    tagDark: true,
  },
] as const;

export default function ResourcexWorkspace() {
  return (
    <main style={{ background: INK, minHeight: "100vh" }}>
      {/* Hover styles — server-safe CSS */}
      <style>{`
        .doc-cta:hover { opacity: 0.85 !important; }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background: INK, padding: "56px 40px 64px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          {/* Workspace badge */}
          <div style={{
            display: "flex", alignItems: "stretch",
            marginBottom: 24, width: "fit-content",
          }}>
            <span style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK, background: YEL, padding: "5px 10px",
            }}>
              PRIVATE WORKSPACE
            </span>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(250,250,250,.60)",
              border: `1px solid ${P25}`, padding: "5px 12px",
            }}>
              Resourcex.io
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: SERIF, fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 0.96, letterSpacing: "-0.03em",
            color: PAPER, marginBottom: 18,
          }}>
            Sajid Shah: your SIA<br />
            <em>client workspace</em>
          </h1>

          <p style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 17,
            lineHeight: 1.6, color: "rgba(250,250,250,.60)",
            maxWidth: 520, margin: 0,
          }}>
            Working assets prepared by Syed Irfan Ajmal. Shared privately for your review.
          </p>
        </div>
      </section>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          {/* Section mast */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: INK, background: YEL,
              padding: "3px 8px", flexShrink: 0,
            }}>
              YOUR DOCUMENTS
            </span>
            <div style={{ flexGrow: 1, height: 1, background: INK35 }} />
            <span style={{
              fontFamily: MONO, fontSize: 9,
              color: INK55, flexShrink: 0,
            }}>
              2 items
            </span>
          </div>

          {/* Double rule */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: INK }} />
            <div style={{ height: 3, marginTop: 3, background: INK }} />
          </div>

          {/* Card container */}
          <div style={{ border: `1px solid ${INK}` }}>
            {DOCS.map((doc, i) => (
              <div
                key={doc.tag}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 24,
                  padding: "32px 36px",
                  alignItems: "start",
                  borderBottom: i < DOCS.length - 1 ? `1px solid ${INK}` : "none",
                }}
              >
                {/* Left */}
                <div>
                  <h2 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 24,
                    lineHeight: 1.15, letterSpacing: "-0.01em",
                    color: INK, marginBottom: 10,
                  }}>
                    {doc.title}
                  </h2>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 15,
                    lineHeight: 1.6, color: INK70, marginBottom: 20,
                  }}>
                    {doc.body}
                  </p>
                  <Link
                    href={doc.href}
                    className="doc-cta"
                    style={{
                      display: "inline-block",
                      fontFamily: GROT, fontWeight: 700, fontSize: 10,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      background: INK, color: PAPER,
                      padding: "12px 20px",
                      textDecoration: "none",
                      transition: "opacity 0.12s ease",
                    }}
                  >
                    {doc.cta}
                  </Link>
                </div>

                {/* Right: type tag */}
                <span style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: doc.tagDark ? PAPER : INK55,
                  background: doc.tagDark ? INK : PAPER2,
                  border: `1px solid ${doc.tagDark ? INK : INK35}`,
                  padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}>
                  {doc.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: PAPER2,
        borderTop: `1px solid ${INK15}`,
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 24,
      }}>
        <p style={{
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
          fontSize: 12.5, lineHeight: 1.5, color: INK55,
          margin: 0, maxWidth: 520,
        }}>
          All materials are confidential and prepared exclusively for Sajid Shah / Resourcex.io.
          Please do not forward or share externally.
        </p>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <div style={{
            width: 8, height: 8,
            background: YEL,
            border: `1.5px solid ${INK}`,
            borderRadius: "50%",
          }} />
          <span style={{
            fontFamily: GROT, fontWeight: 700, fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: INK55,
          }}>
            CONFIDENTIAL
          </span>
        </div>
      </footer>
    </main>
  );
}

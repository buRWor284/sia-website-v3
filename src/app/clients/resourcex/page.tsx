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

export default function ResourcexWorkspace() {
  return (
    <main style={{ background: INK, minHeight: "100vh" }}>
      <style>{`
        .doc-cta:hover { opacity: 0.85 !important; }
        @media (max-width: 640px) {
          .rx-hero { padding: 14px 20px !important; }
          .rx-docs { padding: 28px 20px 36px !important; }
          .rx-doc-card { grid-template-columns: 1fr !important; padding: 20px !important; }
          .rx-doc-tag { display: none !important; }
          .rx-doc-title { font-size: 18px !important; }
          .rx-cta-row { flex-direction: column !important; align-items: stretch !important; }
          .doc-cta { display: flex !important; align-items: center !important; justify-content: center !important; min-height: 44px !important; padding: 12px 20px !important; box-sizing: border-box !important; }
          .rx-footer { padding: 14px 20px !important; flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }
      `}</style>

      {/* ── Hero — compact masthead ────────────────────────────────────── */}
      <section className="rx-hero" style={{ background: INK, padding: "16px 40px 14px", borderBottom: "1px solid rgba(250,250,250,.10)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, padding: "4px 8px", flexShrink: 0 }}>
          PRIVATE WORKSPACE
        </span>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em", color: PAPER, margin: 0 }}>
          Sajid Shah &amp; <em>your SIA client workspace</em>
        </h1>
        <span style={{ fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,250,.25)", border: "1px solid rgba(250,250,250,.12)", padding: "4px 9px", flexShrink: 0 }}>
          Resourcex.io
        </span>
      </section>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <section className="rx-docs" style={{ background: PAPER, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 8px", flexShrink: 0 }}>
              YOUR DOCUMENTS
            </span>
            <div style={{ flexGrow: 1, height: 1, background: INK35 }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: INK55, flexShrink: 0 }}>2 items</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: INK }} />
            <div style={{ height: 3, marginTop: 3, background: INK }} />
          </div>

          <div style={{ border: `1px solid ${INK}` }}>

            {/* ── Card 1: EMOS Proposal + Deck (combined) ── */}
            <div className="rx-doc-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "32px 36px", alignItems: "start", borderBottom: `1px solid ${INK}` }}>
              <div>
                <h2 className="rx-doc-title" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em", color: INK, marginBottom: 10 }}>
                  Founder PR + Acquisition Launch Strategy
                </h2>
                <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: INK70, marginBottom: 24 }}>
                  Your 8-week earned-media roadmap: press kit, authority content, journalist relationships, and an announcement sprint timed to your deal. Available in two formats below.
                </p>
                <div className="rx-cta-row" style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <Link href="/clients/resourcex/emos-proposal" className="doc-cta" style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: INK, color: PAPER, padding: "12px 20px", textDecoration: "none", transition: "opacity 0.12s ease" }}>
                      Read the proposal →
                    </Link>
                    <div style={{ fontFamily: GROT, fontSize: 9, color: INK55, marginTop: 6, letterSpacing: "0.08em" }}>Scrollable · works on any device</div>
                  </div>
                  <div>
                    <Link href="/clients/resourcex/emos-deck" target="_blank" className="doc-cta" style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: PAPER2, color: INK, border: `1.5px solid ${INK35}`, padding: "12px 20px", textDecoration: "none", transition: "opacity 0.12s ease" }}>
                      View the deck →
                    </Link>
                    <div style={{ fontFamily: GROT, fontSize: 9, color: INK55, marginTop: 6, letterSpacing: "0.08em" }}>Slide format · best on desktop</div>
                  </div>
                </div>
              </div>
              <span className="rx-doc-tag" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, background: PAPER2, border: `1px solid ${INK35}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                PROPOSAL + DECK
              </span>
            </div>

            {/* ── Card 2: Fractional CMO ── */}
            <div className="rx-doc-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "32px 36px", alignItems: "start" }}>
              <div>
                <h2 className="rx-doc-title" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em", color: INK, marginBottom: 10 }}>
                  Fractional CMO Pilot Offer
                </h2>
                <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: INK70, marginBottom: 20 }}>
                  The one-page engagement outline for the Resourcex x happy.co account: scope, rate, success-fee structure, and pilot terms.
                </p>
                <Link href="/clients/resourcex/cmo-pilot" className="doc-cta" style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: INK, color: PAPER, padding: "12px 20px", textDecoration: "none", transition: "opacity 0.12s ease" }}>
                  Open the offer →
                </Link>
              </div>
              <span className="rx-doc-tag" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: PAPER, background: INK, border: `1px solid ${INK}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                PDF · ONE-PAGER
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="rx-footer" style={{ background: PAPER2, borderTop: `1px solid ${INK15}`, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, color: INK55, margin: 0, maxWidth: 520 }}>
          All materials prepared exclusively for Sajid Shah / Resourcex.io. Built on the EMOS framework by Syed Irfan Ajmal, shared privately for review.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, background: YEL, border: `1.5px solid ${INK}`, borderRadius: "50%" }} />
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>CONFIDENTIAL</span>
        </div>
      </footer>
    </main>
  );
}

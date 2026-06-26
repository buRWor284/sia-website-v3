"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const PAPER  = "#FAFAFA";
const PAPER2 = "#F0F0EE";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const YEL2   = "#ffc83a";
const SERIF  = "var(--font-serif)";
const GROT   = "var(--font-grot)";
const MONO   = "var(--font-mono)";
const P25    = "rgba(250,250,250,.25)";
const P45    = "rgba(250,250,250,.45)";
const P70    = "rgba(250,250,250,.70)";
const P72    = "rgba(250,250,250,.72)";

/* ── Section mast ──────────────────────────────────────────────────────────── */
function SectionMast({
  num, label, vol, dark,
}: { num: string; label: string; vol?: string; dark?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: INK, background: YEL, padding: "3px 8px", flexShrink: 0,
        }}>§ {num}</span>
        <span style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: dark ? P45 : INK55,
        }}>{label}</span>
        <div style={{ flexGrow: 1, height: 1, background: dark ? P25 : INK35 }} />
        {vol && (
          <span style={{ fontFamily: MONO, fontSize: 9, color: dark ? P45 : INK55, flexShrink: 0 }}>
            {vol}
          </span>
        )}
      </div>
      <div style={{ height: 1, background: dark ? P45 : INK }} />
      <div style={{ height: 3, marginTop: 3, background: dark ? P45 : INK }} />
    </div>
  );
}

/* ── Email form ────────────────────────────────────────────────────────────── */
function EmailForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/email-cmo-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: YEL,
        }}>✓ Sent to {email}</span>
        <button onClick={onClose} style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.12em", textTransform: "uppercase",
          background: "none", border: "none", color: INK55,
          cursor: "pointer", padding: 0,
        }}>Dismiss</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="email"
        placeholder="recipient@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        style={{
          fontFamily: GROT, fontSize: 10,
          border: `1px solid ${status === "error" ? "#c0392b" : INK35}`,
          background: PAPER, color: INK,
          padding: "7px 12px", outline: "none", width: 200,
        }}
      />
      <button
        onClick={handleSend}
        disabled={status === "sending"}
        style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          background: INK, color: PAPER,
          border: "none", padding: "8px 14px",
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
        }}
      >
        {status === "sending" ? "Sending…" : "Send →"}
      </button>
      <button onClick={onClose} style={{
        fontFamily: GROT, fontWeight: 700, fontSize: 9,
        letterSpacing: "0.12em", textTransform: "uppercase",
        background: "none", border: "none", color: INK55,
        cursor: "pointer", padding: "8px 4px",
      }}>✕</button>
      {status === "error" && (
        <span style={{ fontFamily: GROT, fontSize: 9, color: "#c0392b" }}>
          {email ? "Failed — try again." : "Enter a valid email."}
        </span>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export function CmoPilotProposal() {
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <style>{`
        .cmo-book-btn:hover { background: ${YEL2} !important; }
        .action-dl:hover { opacity: 0.8 !important; }
        .action-email:hover { opacity: 0.8 !important; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        @media (max-width: 700px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .hero-left, .hero-right { border-right: none !important; border-bottom: 1px solid ${INK} !important; }
          .invest-grid { grid-template-columns: 1fr !important; }
          .cta-grid    { grid-template-columns: 1fr !important; }
          .timeline-grid { grid-template-columns: 1fr 1fr !important; }
          .cover-grid  { grid-template-columns: 1fr !important; }
          .role-grid   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .masthead-center { display: none !important; }
          .timeline-grid   { grid-template-columns: 1fr !important; }
          .action-bar-inner { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", background: PAPER }}>

        {/* ══ ACTION BAR ════════════════════════════════════════════════════ */}
        <div className="no-print" style={{
          background: PAPER2,
          borderBottom: `1px solid ${INK15}`,
          padding: "10px 40px",
        }}>
          <div className="action-bar-inner" style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 16,
          }}>
            {/* Back link */}
            <Link href="/clients/resourcex" style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: INK55, textDecoration: "none",
            }}>
              ← Workspace
            </Link>

            {/* Buttons */}
            {emailOpen ? (
              <EmailForm onClose={() => setEmailOpen(false)} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="action-dl"
                  onClick={() => window.print()}
                  style={{
                    fontFamily: GROT, fontWeight: 700, fontSize: 9,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    background: "none", color: INK,
                    border: `1px solid ${INK35}`,
                    padding: "7px 14px", cursor: "pointer",
                    transition: "opacity 0.12s",
                  }}
                >
                  ↓ Download PDF
                </button>
                <button
                  className="action-email"
                  onClick={() => setEmailOpen(true)}
                  style={{
                    fontFamily: GROT, fontWeight: 700, fontSize: 9,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    background: INK, color: PAPER,
                    border: "none",
                    padding: "8px 14px", cursor: "pointer",
                    transition: "opacity 0.12s",
                  }}
                >
                  ✉ Email PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══ MASTHEAD ══════════════════════════════════════════════════════ */}
        <header style={{
          borderBottom: `1px solid ${INK}`,
          padding: "14px 40px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: YEL,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: GROT, fontWeight: 900, fontSize: 11, color: INK,
              flexShrink: 0,
            }}>SIA</div>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase", color: INK55,
            }}>Syed Irfan Ajmal</span>
          </div>

          <div className="masthead-center" style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: GROT, fontWeight: 900, fontSize: 13,
              letterSpacing: "0.30em", textTransform: "uppercase", color: INK,
            }}>THE SIA WIRE</div>
            <div style={{
              fontFamily: GROT, fontWeight: 400, fontSize: 10,
              letterSpacing: "0.16em", textTransform: "uppercase", color: INK55,
              marginTop: 3,
            }}>Pilot Proposal &nbsp;·&nbsp; Fractional CMO &nbsp;·&nbsp; Advisory</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", color: INK55 }}>
              June 2026
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK55, marginTop: 2 }}>
              Vol. I &nbsp;·&nbsp; № 01
            </div>
          </div>
        </header>

        {/* ══ HERO 3-COLUMN GRID ════════════════════════════════════════════ */}
        <div className="hero-grid" style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 180px",
          borderBottom: `1px solid ${INK}`,
        }}>
          {/* Left */}
          <div className="hero-left" style={{
            borderRight: `1px solid ${INK}`,
            padding: "28px 22px",
            display: "flex", flexDirection: "column", gap: 20,
          }}>
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
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, borderBottom: `2px solid ${YEL}`, display: "inline-block", lineHeight: 1.1 }}>10 hrs</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>/ week commitment</div>
            </div>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>START</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 13, color: INK, lineHeight: 1.4 }}>First Monday after sign-off</div>
            </div>
          </div>

          {/* Center */}
          <div style={{ padding: "32px", borderRight: `1px solid ${INK}` }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>
              Est. 2013 &nbsp;·&nbsp; Global
            </div>
            <h1 style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 0.96, letterSpacing: "-0.03em",
              color: INK, marginBottom: 20,
            }}>
              Fractional CMO<br /><em>Pilot</em>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", background: INK, color: PAPER, padding: "5px 10px" }}>TECHNICAL DEPTH</span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: INK55 }}>→</span>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", background: YEL, color: INK, padding: "5px 10px" }}>BUSINESS IMPACT</span>
            </div>
            {/* Flow diagram — 3 cells + bidirectional arrow row */}
            <div style={{ border: `1px solid ${INK}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: INK15 }}>
                {[
                  { label: "RESOURCEX", sub: "Engineering",     highlight: false },
                  { label: "IRFAN",     sub: "Account Lead",    highlight: true  },
                  { label: "HAPPY.CO",  sub: "Product · Business", highlight: false },
                ].map(c => (
                  <div key={c.label} style={{ background: c.highlight ? YEL : PAPER2, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK }}>{c.label}</div>
                    <div style={{ fontFamily: GROT, fontWeight: 400, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 2 }}>{c.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: PAPER, borderTop: `1px solid ${INK15}`, padding: "6px 12px", textAlign: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 8.5, color: INK55, letterSpacing: "0.06em" }}>◀ PRODUCT &amp; BUSINESS CONTEXT &nbsp;→&nbsp; ENGINEERING TEAM</span>
              </div>
            </div>
          </div>

          {/* Right — Contents */}
          <div className="hero-right" style={{ padding: "28px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 14 }}>CONTENTS</div>
            {[
              { num: "01", label: "THE ROLE",             sub: "Mandate + context"        },
              { num: "02", label: "THE ENGAGEMENT",       sub: "3-month pilot"            },
              { num: "03", label: "WHAT THE PILOT COVERS", sub: "Included · Not included" },
              { num: "04", label: "INVESTMENT",           sub: "Base + success fee"       },
            ].map(row => (
              <div key={row.num} style={{ borderBottom: `1px solid ${INK15}`, padding: "10px 0" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.10em", color: YEL }}>§ {row.num}</span>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK }}>{row.label}</span>
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 11, color: INK55, marginTop: 2 }}>{row.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ §01 THE ROLE ══════════════════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="01" label="THE ROLE" vol="Vol. I · № 01" />
          <p style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 16,
            lineHeight: 1.65, color: INK70, textAlign: "justify",
            maxWidth: 700, margin: 0,
          }}>
            One person fluent in both languages: represent Resourcex in every conversation, keep both
            sides aligned, and grow the account, including the case for a dedicated happy.co dev team
            in Pakistan.
          </p>
        </section>

        <div style={{ height: 1, background: INK15, margin: "0 40px" }} />

        {/* ══ §02 THE ENGAGEMENT ════════════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="02" label="THE ENGAGEMENT" vol="3-month pilot" />

          {/* Data grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}`, gap: 1, background: INK15, marginBottom: 20 }}>
            {[
              { label: "TERM",        val: "3-month pilot",      sub: "extendable to 6 months" },
              { label: "COMMITMENT",  val: "10 hrs / week",      sub: "dedicated to this account", highlight: true },
              { label: "START",       val: "First Mon after sign", sub: "no delay, no discovery sprint" },
            ].map(c => (
              <div key={c.label} style={{ background: c.highlight ? YEL : PAPER, padding: "18px 20px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>{c.label}</div>
                <div style={{
                  fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: INK, lineHeight: 1,
                  ...(c.label === "COMMITMENT" ? { borderBottom: `2px solid ${INK}`, display: "inline-block" } : {}),
                }}>{c.val}</div>
                <div style={{ fontFamily: GROT, fontWeight: 400, fontSize: 8.5, color: INK55, marginTop: 4 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="timeline-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, gap: 1, background: INK15 }}>
            {[
              { label: "DAY 0",        note: "",              body: "First Monday after sign-off." },
              { label: "DAY 30",       note: "SAFETY VALVE",  body: "Check-in: adjust or stop, no pressure." },
              { label: "DAY 90",       note: "",              body: "Pilot ends, or we extend." },
              { label: "MONTH 6",      note: "",              body: "Optional extension by agreement." },
            ].map(t => (
              <div key={t.label} style={{ background: t.note ? YEL : PAPER, padding: "14px 16px" }}>
                {t.note && (
                  <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, marginBottom: 2 }}>{t.note}</div>
                )}
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: t.note ? INK : YEL, marginBottom: 6 }}>{t.label}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: INK70 }}>{t.body}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: INK15, margin: "0 40px" }} />

        {/* ══ §03 WHAT THE PILOT COVERS ═════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="03" label="WHAT THE PILOT COVERS" vol="Included · Not included" />

          <div className="cover-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}` }}>
            {/* Included */}
            <div style={{ borderRight: `1px solid ${INK}` }}>
              <div style={{ background: INK, padding: "10px 20px" }}>
                <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: PAPER }}>INCLUDED</span>
              </div>
              <div style={{ padding: "20px" }}>
                {[
                  "Weekly sync with the Resourcex team, plus happy.co calls as your account lead",
                  "Two-way translation: technical detail into business impact, and product context back to engineering",
                  "Account growth: shaping and pursuing expansion with happy.co, including the Pakistan dev-team case",
                  "A concise monthly written report: account health, open opportunities, risks, next steps",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 14, height: 14, background: YEL, border: `1.5px solid ${INK}`, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: INK }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Included */}
            <div>
              <div style={{ background: PAPER2, padding: "10px 20px" }}>
                <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK }}>NOT INCLUDED</span>
              </div>
              <div style={{ padding: "20px" }}>
                {[
                  "Hands-on development, QA, design, or day-to-day delivery management",
                  "Acting as the routine point of contact for delivery issues or support requests",
                  "Recruitment or HR execution: I build the Pakistan case, hiring stays with Resourcex",
                  "Marketing assets, content, or PR beyond agreed business-development materials",
                  "Work involving Resourcex clients other than happy.co",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 14, height: 14, border: `1.5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>×</span>
                    </div>
                    <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: INK55 }}>{item}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${INK15}`, paddingTop: 12, marginTop: 4 }}>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, color: INK55, margin: 0 }}>
                    Anything outside the included list is scoped and quoted separately before work begins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: INK15, margin: "0 40px" }} />

        {/* ══ §04 INVESTMENT ════════════════════════════════════════════════ */}
        <section style={{ padding: "36px 40px 40px" }}>
          <SectionMast num="04" label="INVESTMENT" vol="Base + success fee" />

          {/* Price cards */}
          <div className="invest-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
            <div style={{ border: `1px solid ${INK}`, padding: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>BASE RETAINER</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, borderBottom: `2px solid ${YEL}`, display: "inline-block", lineHeight: 1, color: INK }}>USD 3,500</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>/month</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: INK55, marginTop: 12 }}>
                Invoiced on the 1st of each month, payable within 7 days.
              </p>
            </div>
            <div style={{ border: `1px solid ${INK}`, padding: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>SUCCESS FEE</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, borderBottom: `2px solid ${YEL}`, display: "inline-block", lineHeight: 1, color: INK }}>10%</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>of new revenue</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: INK55, marginTop: 12 }}>
                On each new project I help land, applied to its first 12 months of billings. <em>Help land</em> means I originated it or led the business case or negotiation, recorded before close. Renewals and pre-pilot scope excluded.
              </p>
            </div>
          </div>

          {/* Context callout */}
          <div style={{ background: PAPER2, borderLeft: `3px solid ${YEL}`, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13.5, lineHeight: 1.6, color: INK70, margin: 0 }}>
              For context: independent fractional CMOs bill USD 150 to 350+ per hour, and my standard retainer is USD 5,000 per month. At full utilisation this pilot is roughly USD 81 per hour: a family rate, structured as a real engagement.
            </p>
          </div>

          {/* Exit + Case Study */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, border: `1px solid ${INK15}`, padding: "16px 20px" }}>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>SIMPLE EXIT</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13.5, lineHeight: 1.5, color: INK70, margin: 0 }}>
                Either party may end with 14 days' written notice. Success fees on projects already closed remain payable on their original terms.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>CASE STUDY</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13.5, lineHeight: 1.5, color: INK70, margin: 0 }}>
                This engagement may be published as a fractional CMO case study on syedirfanajmal.com, with Resourcex approving the final draft and confidential figures anonymised.
              </p>
            </div>
          </div>
        </section>

        {/* ══ DARK CTA + RESULTS ════════════════════════════════════════════ */}
        <section style={{ background: INK, padding: "36px 40px" }}>
          <SectionMast num="04" label="NEXT STEP" dark />

          <div className="cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 8 }}>
            <div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, lineHeight: 1.5, color: P72, marginBottom: 20 }}>
                Next step: a 30-minute call to walk through this together. If the shape looks right, we sign a short agreement and pick a start date.
              </p>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: PAPER, marginBottom: 16 }}>Syed Irfan Ajmal</div>
              <Link href="/strategy-call" className="cmo-book-btn" style={{
                display: "inline-block",
                fontFamily: GROT, fontWeight: 700, fontSize: 10,
                letterSpacing: "0.16em", textTransform: "uppercase",
                background: YEL, color: INK,
                padding: "13px 22px", textDecoration: "none",
                transition: "background 0.12s ease",
              }}>
                BOOK YOUR STRATEGY CALL →
              </Link>
            </div>

            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: P45, marginBottom: 12 }}>SELECTED RESULTS</div>
              <div style={{ border: `1px solid ${P25}` }}>
                {[
                  { client: "RIDESTER",       result: "0 → 1.5M monthly visitors"     },
                  { client: "CENTRIQ",        result: "6× daily signups"              },
                  { client: "NAT. TYRES",     result: "$160K → $1.2M monthly revenue" },
                ].map((r, i, arr) => (
                  <div key={r.client} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr",
                    alignItems: "center", gap: 16,
                    padding: "12px 16px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${P25}` : "none",
                  }}>
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: YEL }}>{r.client}</span>
                    <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.4, color: P70 }}>{r.result}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 12, color: P45, marginTop: 10 }}>
                More at{" "}
                <Link href="/fractional-cmo" style={{ color: P45 }}>syedirfanajmal.com/fractional-cmo</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer style={{
          borderTop: `1px solid ${INK}`,
          padding: "14px 40px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          {[
            "© 2013 – 2026 Syed Irfan Ajmal",
            "SIA Enterprises Inc (WY C-Corp) · SIA Enterprises (PK Sole Prop.)",
            "sia@syedirfanajmal.com · www.syedirfanajmal.com",
          ].map(text => (
            <span key={text} style={{ fontFamily: GROT, fontWeight: 400, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>{text}</span>
          ))}
        </footer>

      </div>
    </div>
  );
}

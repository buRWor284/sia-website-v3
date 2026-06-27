"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Design tokens (EMOS warm palette) ────────────────────────────────────── */
const P    = "#ECE8DA";
const P2   = "#E4DDC7";
const K    = "#1a1712";
const K70  = "rgba(26,23,18,.70)";
const K55  = "rgba(26,23,18,.55)";
const K35  = "rgba(26,23,18,.35)";
const K18  = "rgba(26,23,18,.18)";
const K10  = "rgba(26,23,18,.10)";
const Y    = "#f5c518";
const OD45 = "rgba(236,232,218,.45)";
const OD25 = "rgba(236,232,218,.25)";
const OD12 = "rgba(236,232,218,.12)";
const SERIF = "'Newsreader', Georgia, serif";
const SANS  = "'Archivo', 'Helvetica Neue', Arial, sans-serif";
const MONO  = "'Courier New', monospace";

/* ── Section mast ──────────────────────────────────────────────────────────── */
function SectionMast({ num, label, vol, dark }: { num: string; label: string; vol?: string; dark?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: K, background: Y, padding: "3px 8px", flexShrink: 0 }}>§ {num}</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: dark ? OD45 : K55 }}>{label}</span>
        <div style={{ flexGrow: 1, height: 1, background: dark ? OD25 : K35 }} />
        {vol && <span style={{ fontFamily: MONO, fontSize: 9, color: dark ? OD45 : K55, flexShrink: 0 }}>{vol}</span>}
      </div>
      <div style={{ height: 1, background: dark ? OD45 : K }} />
      <div style={{ height: 3, marginTop: 3, background: dark ? OD45 : K }} />
    </div>
  );
}

/* ── Email form ────────────────────────────────────────────────────────────── */
function EmailForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/email-emos-deck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: email }) });
      setStatus(res.ok ? "sent" : "error");
    } catch { setStatus("error"); }
  }

  const BASE: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" };

  if (status === "sent") return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ ...BASE, color: Y }}>✓ Sent to {email}</span>
      <button onClick={onClose} style={{ ...BASE, background: "none", border: "none", color: K55, cursor: "pointer", padding: 0 }}>Dismiss</button>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="email" placeholder="recipient@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} style={{ fontFamily: SANS, fontSize: 10, border: `1px solid ${status === "error" ? "#c0392b" : K35}`, background: P, color: K, padding: "7px 12px", outline: "none", width: 200 }} />
      <button onClick={handleSend} disabled={status === "sending"} style={{ ...BASE, background: K, color: P, border: "none", padding: "8px 14px", cursor: status === "sending" ? "wait" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>{status === "sending" ? "Sending…" : "Send →"}</button>
      <button onClick={onClose} style={{ ...BASE, background: "none", border: "none", color: K55, cursor: "pointer", padding: "8px 4px" }}>✕</button>
      {status === "error" && <span style={{ fontFamily: SANS, fontSize: 9, color: "#c0392b" }}>{email ? "Failed — try again." : "Enter valid email."}</span>}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export function EmosProposal() {
  const [emailOpen, setEmailOpen] = useState(false);

  const WEEKS = [
    { num: "01", title: "FOUNDATION, WEB PRESENCE & SETUP", points: ["How the journalist outreach ecosystem actually works", "Identifying your quotable zones", "The Relevancy Spectrum framework", "Founder web presence and full press kit underway"] },
    { num: "02", title: "PITCH WRITING MASTERY", points: ["Anatomy of a winning pitch, written for the journalist's reader", "Speed vs. quality. Subject line psychology", "Live pitch teardowns on your real submissions", "The Journo Outreach Checklist introduced and in use"] },
    { num: "03", title: "PITCH AT SCALE · TRACK & OPTIMISE", points: ["Volume to 15+ pitches per week", "Tracking routine and metrics in place", "Blacklist of non-responsive contacts built", "Rejection pattern analysis"] },
    { num: "04", title: "ADVANCED STRATEGIES, VA & SCALE", points: ["Building journalist relationships for repeat coverage", "Breaking news monitoring", "Extracting five returns from every placement", "VA sourcing and training: typical cost $500 to $1,500 / mo"] },
  ];

  const SPRINT_STEPS = [
    { n: "1", title: "NARRATIVE AND ANGLE", body: "First-deal-of-its-kind framing often carries further than the number." },
    { n: "2", title: "EMBARGO AND EXCLUSIVITY PLAN", body: "15 to 20 named Tier 1 journalists. One outlet gets the story first; no one scoops you early." },
    { n: "3", title: "DONE-WITH-YOU LAUNCH", body: "The Authority Asset goes live; we work the first placements together." },
    { n: "4", title: "NOTHING BREAKS EARLY", body: "Articles and press kit already in place before you go public." },
  ];

  const DELIVERABLES = [
    "A press-ready kit: bios, boilerplate, fact sheet, past-coverage page, and media contact — ready the day the news breaks.",
    "Two to four ghostwritten authority articles under your name, live before the announcement.",
    "A refreshed founder web presence tuned for search and credibility.",
    "A trained internal team that owns the pitching system, templates, and tracking permanently.",
    "A named journalist list and announcement plan timed to your window.",
    "Three months of free access to the EMOS toolset (SignalIQ, PressIQ, CollabIQ, CoverageIQ, JournoIQ) — beta or better, with a human reviewing output.",
  ];

  return (
    <div style={{ background: P, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,700;1,6..72,400;1,6..72,600&display=swap');
        .ep-action-btn:hover { opacity: 0.8 !important; }
        .ep-deck-link:hover  { opacity: 0.8 !important; }
        @media print {
          .ep-no-print { display: none !important; }
          body { background: white; }
          .ep-dark-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media (max-width: 700px) {
          .ep-before-after { grid-template-columns: 1fr !important; }
          .ep-modules      { grid-template-columns: 1fr !important; }
          .ep-curriculum   { grid-template-columns: 1fr 1fr !important; }
          .ep-sprint-grid  { grid-template-columns: 1fr !important; }
          .ep-invest-grid  { grid-template-columns: 1fr !important; }
          .ep-what-keep    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .ep-curriculum   { grid-template-columns: 1fr !important; }
          .ep-action-bar   { padding: 8px 16px !important; }
          .ep-action-inner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .ep-back-link    { min-height: 44px; display: flex !important; align-items: center !important; }
          .ep-action-btn   { min-height: 44px !important; display: flex !important; align-items: center !important; }
          .ep-deck-link    { min-height: 44px !important; display: flex !important; align-items: center !important; }
          .ep-section      { padding: 24px 16px 28px !important; }
          .ep-divider      { margin: 0 16px !important; }
          .ep-hero-inner   { padding: 32px 16px 24px !important; }
          .ep-footer       { padding: 12px 16px !important; flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .ep-coverage     { padding: 14px 16px !important; gap: 20px !important; overflow-x: auto; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", background: P }}>

        {/* ══ ACTION BAR ════════════════════════════════════════════════════ */}
        <div className="ep-action-bar ep-no-print" style={{ background: K, borderBottom: `1px solid ${OD12}`, padding: "10px 32px" }}>
          <div className="ep-action-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <Link href="/clients/resourcex" className="ep-back-link" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, textDecoration: "none" }}>← Workspace</Link>
            {emailOpen ? (
              <EmailForm onClose={() => setEmailOpen(false)} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link href="/clients/resourcex/emos-deck" target="_blank" className="ep-deck-link" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, textDecoration: "none", border: `1px solid ${OD25}`, padding: "7px 14px", transition: "opacity 0.12s" }}>▶ View Presentation</Link>
                <button className="ep-action-btn" onClick={() => window.print()} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: "none", color: OD45, border: `1px solid ${OD25}`, padding: "7px 14px", cursor: "pointer", transition: "opacity 0.12s" }}>↓ Download PDF</button>
                <button className="ep-action-btn" onClick={() => setEmailOpen(true)} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: Y, color: K, border: "none", padding: "8px 14px", cursor: "pointer", transition: "opacity 0.12s" }}>✉ Email PDF</button>
              </div>
            )}
          </div>
        </div>

        {/* ══ HERO / COVER ══════════════════════════════════════════════════ */}
        <div className="ep-dark-hero" style={{ background: K }}>
          <div className="ep-hero-inner" style={{ padding: "56px 40px 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}>
            <div style={{ width: 80, height: 80, background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: K, letterSpacing: "0.04em" }}>EMOS</span>
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: OD45 }}>
              EARNED MEDIA OPERATING SYSTEM · SIA ENTERPRISES
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(40px, 8vw, 80px)", lineHeight: 0.96, letterSpacing: "-0.03em", color: P, margin: 0 }}>
              The Private<br />Founder&apos;s<br /><em>Intensive</em>
            </h1>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(15px, 2.5vw, 20px)", color: OD45, margin: 0, maxWidth: 540 }}>
              A done-with-you earned media program, prepared privately for Sajid Shah.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K, background: Y, padding: "5px 14px" }}>CONFIDENTIAL</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: OD45 }}>PREPARED JUNE 2026</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 40px", borderTop: `1px solid ${OD12}`, fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: OD45 }}>
            <span>EMOS · SIA ENTERPRISES</span>
            <span>SAJID SHAH · RESOURCEX.IO</span>
          </div>
        </div>

        {/* ══ §01 THE CHAPTER YOU'RE ENTERING ══════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="01" label="THE CHAPTER YOU'RE ENTERING" />
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: K, marginBottom: 24, margin: "0 0 24px" }}>
            You built it.<br />You sold it.<br />You&apos;re building what&apos;s next.
          </h2>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 17, lineHeight: 1.65, color: K70, maxWidth: 680, margin: 0 }}>
            The acquisition is part of the story. Not the whole story, and it does not set the clock.
            You decide what&apos;s public, and when. This program builds the narrative infrastructure
            around your name — before the news breaks, and permanently after it does.
          </p>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §02 WHEN THEY LOOK YOU UP ════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 0" }}>
          <SectionMast num="02" label="WHEN THEY LOOK YOU UP, WHAT DO THEY FIND?" />
          <div className="ep-before-after" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, border: `1px solid ${K18}`, marginBottom: 0 }}>
            {/* Today */}
            <div style={{ background: P, padding: "28px 32px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: K55, marginBottom: 14 }}>WHAT THEY FIND TODAY</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: K70, margin: 0 }}>
                A LinkedIn profile. Maybe a mention in a Pakistan tech roundup. No bylines. No press kit.
                No owned narrative. The story of OnSense.io exists — it just isn&apos;t findable under your name.
              </p>
            </div>
            {/* After */}
            <div style={{ background: K, padding: "28px 32px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: OD45, marginBottom: 14 }}>WHAT THEY&apos;LL FIND AFTER</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: "rgba(236,232,218,.70)", margin: 0 }}>
                Bylined articles in outlets they recognise. A press kit ready to share. An Authority Asset
                they can link to. A founder narrative that shows up before anyone has to ask.
              </p>
            </div>
          </div>
          {/* Coverage strip */}
          <div className="ep-coverage" style={{ borderTop: `2px solid ${K}`, padding: "16px 40px", display: "flex", alignItems: "center", gap: 36, background: P2, flexWrap: "wrap" }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, whiteSpace: "nowrap", flexShrink: 0 }}>COVERAGE WE&apos;VE EARNED</span>
            {["Harvard Business Review", "Forbes", "Apartment Therapy", "Bankrate", "MSN", "Yahoo"].map(pub => (
              <span key={pub} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: K, whiteSpace: "nowrap" }}>{pub}</span>
            ))}
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §03 HOW IT'S BUILT ════════════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="03" label="HOW IT'S BUILT" vol="8 weeks · 2 modules" />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: K55, margin: "0 0 28px" }}>
            One 8-week intensive, in two modules: the 6-week Foundation now, the 2-week Sprint on your date.
          </p>
          <div className="ep-modules" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Module 01 */}
            <div style={{ border: `2px solid ${K}`, display: "flex", flexDirection: "column" }}>
              <div style={{ background: K, padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: P }}>▶</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45 }}>START NOW · 6 WEEKS · NOT PEGGED TO THE DATE</span>
              </div>
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: K55 }}>MODULE 01</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: K, margin: 0 }}>
                  Founder Authority<br />Foundation
                </h3>
                <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: K70, margin: 0 }}>
                  Web presence, authority articles, press kit, the Authority Asset built, and your team trained on EMOS.
                </p>
              </div>
            </div>
            {/* Module 02 */}
            <div style={{ border: `1.5px solid ${K35}`, display: "flex", flexDirection: "column" }}>
              <div style={{ background: P2, padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${K18}` }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: K55 }}>◎</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55 }}>2 WEEKS · ACTIVATES ON YOUR CONFIRMED DATE</span>
              </div>
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: K55 }}>MODULE 02</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: K55, margin: 0 }}>
                  The Announcement<br />Sprint
                </h3>
                <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: K55, margin: 0 }}>
                  Narrative, embargo plan, outreach templates, and done-with-you launch support.
                </p>
              </div>
            </div>
          </div>
          {/* Bottom callout */}
          <div style={{ marginTop: 16, background: K, padding: "16px 24px" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: OD45, margin: 0, textAlign: "center" }}>
              Start the Foundation now. Trigger the Sprint when your date is set.
            </p>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §04 THE CURRICULUM ════════════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="04" label="THE CURRICULUM" vol="Module 01 · Foundation" />

          {/* Weeks 1–4 */}
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: K, marginBottom: 16 }}>WEEKS 1 TO 4 — FOUNDATION</div>
          <div className="ep-curriculum" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: K18, border: `1px solid ${K18}`, marginBottom: 24 }}>
            {WEEKS.map(w => (
              <div key={w.num} style={{ background: P, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 12, padding: "3px 9px", display: "inline-block", alignSelf: "flex-start" }}>{w.num}</span>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: K, lineHeight: 1.3 }}>{w.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {w.points.map(pt => (
                    <div key={pt} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, background: Y, flexShrink: 0, marginTop: 7 }} />
                      <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: K70 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Weeks 5–6 */}
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: K, marginBottom: 16 }}>WEEKS 5 TO 6 — AUTHORITY ASSET</div>
          <div className="ep-modules" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, border: `1px solid ${K18}`, marginBottom: 16 }}>
            <div style={{ background: P, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 12, padding: "3px 9px" }}>05</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: K }}>AUTHORITY ASSET · DATA BRIEF</span>
              </div>
              {["What makes an Authority Asset genuinely newsworthy", "Data audit and asset concept development", "Introduction to JournoCollabIQ [Beta] for identifying high-fit journalists"].map(pt => (
                <div key={pt} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 5, height: 5, background: Y, flexShrink: 0, marginTop: 8 }} />
                  <span style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70 }}>{pt}</span>
                </div>
              ))}
            </div>
            <div style={{ background: P, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 12, padding: "3px 9px" }}>06</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: K }}>AUTHORITY ASSET · BUILD</span>
              </div>
              {["What they are and why they earn links", "Types: data reports, surveys, interactive quizzes, calculators, AI tools, infographics, mapographics", "Team selects one asset to build; review and iteration"].map(pt => (
                <div key={pt} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 5, height: 5, background: Y, flexShrink: 0, marginTop: 8 }} />
                  <span style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Done for you / What you keep */}
          <div className="ep-what-keep" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, border: `1px solid ${K18}` }}>
            <div style={{ background: P2, padding: "16px 24px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 6 }}>DONE FOR YOU · IN PARALLEL</div>
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70, margin: 0 }}>Founder web presence · 2 to 4 authority articles · complete press kit. Articles cover your expertise only — nothing about the deal.</p>
            </div>
            <div style={{ background: P2, padding: "16px 24px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 6 }}>WHAT YOU KEEP · PERMANENTLY</div>
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70, margin: 0 }}>Content lead + 1 to 2 VAs · approx. 25 to 35 hrs/week. System, templates, trackers, and journalist list stay in-house. No recurring retainer.</p>
            </div>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §05 THE ANNOUNCEMENT SPRINT ══════════════════════════════════ */}
        <section className="ep-section ep-dark-hero" style={{ padding: "40px 40px 36px", background: K }}>
          <SectionMast num="05" label="MODULE 02 · THE ANNOUNCEMENT SPRINT" vol="Weeks 7 to 8" dark />
          <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45, marginBottom: 24 }}>
            Activates on your confirmed date
          </p>
          <div className="ep-sprint-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: OD12, border: `1px solid ${OD12}`, marginBottom: 20 }}>
            {SPRINT_STEPS.map(s => (
              <div key={s.n} style={{ background: K, padding: "28px 28px" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: Y, lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: P, marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: OD45, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(236,232,218,.06)", border: `1px solid ${OD12}`, padding: "16px 24px" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: OD45, margin: 0 }}>
              Done well, this turns one strong placement into search results, social proof, and warm introductions.
              How much is named is always your call.
            </p>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §06 WHAT YOU WALK AWAY WITH ══════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="06" label="WHAT YOU WALK AWAY WITH" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {DELIVERABLES.map(item => (
              <div key={item} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 14, height: 14, background: Y, border: `1.5px solid ${K}`, flexShrink: 0, marginTop: 4 }} />
                <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: K }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: P2, borderLeft: `3px solid ${Y}`, padding: "14px 18px" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.55, color: K55, margin: 0 }}>
              On placements: we sell the system and the assets that maximise your odds, not a guarantee of any specific publication.
              Coverage is the upside that this machine is built to earn.
            </p>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §07 INVESTMENT ════════════════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="07" label="INVESTMENT" vol="Base + optional continuation" />

          {/* Context callout */}
          <div style={{ background: P2, borderLeft: `3px solid ${Y}`, padding: "16px 20px", marginBottom: 24 }}>
            <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: K70, margin: 0 }}>
              <strong style={{ fontWeight: 700, color: K }}>For context:</strong> a done-for-you agency delivering this scope — press kit, ghostwritten authority content, and announcement PR — typically runs $25,000 to $45,000, and the knowledge leaves when they do.
              This program delivers the assets <strong style={{ fontWeight: 700, color: K }}>and</strong> leaves the capability with your team, for a fraction of that.
            </p>
          </div>

          <div className="ep-invest-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Price card */}
            <div style={{ border: `2px solid ${K}`, padding: 28 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 12 }}>PROGRAM TOTAL</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em", color: K, borderBottom: `3px solid ${Y}`, display: "inline-block", marginBottom: 8 }}>$6,000</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: K55, marginBottom: 16 }}>ONE-TIME · BOTH PHASES</div>
              <div style={{ border: `1px solid ${K18}`, padding: "14px 18px", marginBottom: 12 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: K55, marginBottom: 6 }}>FLEXIBLE PAYMENT</div>
                <p style={{ fontFamily: SERIF, fontSize: 14, color: K, margin: 0 }}>$4,000 to begin · $2,000 when your Sprint fires</p>
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: K55, margin: 0 }}>Separately later: $7,000 — commit now, save $1,000.</p>
            </div>
            {/* What's included */}
            <div style={{ border: `1px solid ${K18}`, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 8 }}>INCLUDED FREE · 3 MONTHS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Journo Outreach Checklist", "PressIQ [beta]", "JournoCollabIQ [beta]"].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 5, height: 5, background: Y, flexShrink: 0 }} />
                      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: K }}>{t}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: K55, marginTop: 10, marginBottom: 0 }}>Upgraded to full release at no extra cost when betas ship.</p>
              </div>
              <div style={{ borderTop: `1px solid ${K10}`, paddingTop: 16 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 8 }}>OPTIONAL CONTINUATION</div>
                <p style={{ fontFamily: SERIF, fontSize: 14, color: K70, margin: 0 }}>$1,200/month after Month 2 — coverage tracking, ongoing pitching, monthly content. Month-to-month.</p>
              </div>
              <div style={{ borderTop: `1px solid ${K10}`, paddingTop: 16 }}>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: K70, margin: 0 }}>What we guarantee: every deliverable, on the dated schedule we agree.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ DARK CTA ══════════════════════════════════════════════════════ */}
        <section className="ep-dark-hero" style={{ background: K, padding: "40px 40px 48px" }}>
          <SectionMast num="08" label="THE FIRST STEP" dark />
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(16px, 3vw, 22px)", lineHeight: 1.6, color: OD45, marginBottom: 24, maxWidth: 640 }}>
            Ideally we lock a start date for the Foundation by early July — that clears eight weeks before your announcement window.
            Confirm who from your team joins as operators, and I send a short onboarding brief.
            We can begin within a week of your go-ahead.
          </p>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: P }}>Syed Irfan Ajmal</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: Y, marginTop: 4 }}>SIA ENTERPRISES</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: OD45, marginTop: 6 }}>SIA@SYEDIRFANAJMAL.COM</div>
          </div>
          <Link href="/strategy-call" style={{ display: "inline-block", fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: Y, color: K, padding: "13px 24px", textDecoration: "none" }}>
            BOOK YOUR STRATEGY CALL →
          </Link>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer className="ep-footer" style={{ borderTop: `1px solid ${K18}`, padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", background: P2 }}>
          {[
            "© 2013 – 2026 Syed Irfan Ajmal",
            "SIA Enterprises Inc (WY C-Corp) · SIA Enterprises (PK Sole Prop.)",
            "sia@syedirfanajmal.com",
          ].map(text => (
            <span key={text} style={{ fontFamily: SANS, fontWeight: 400, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>{text}</span>
          ))}
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>CONFIDENTIAL · PLEASE DO NOT CIRCULATE</span>
        </footer>

      </div>
    </div>
  );
}

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
const OD   = "#ECE8DA";
const OD70 = "rgba(236,232,218,.70)";
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

  const JOURNALISTS = [
    {
      tier: "T1", name: "Alex Konrad", pub: "Forbes", beat: "Tech",
      angle: "\"Bootstrapped Pakistani founder flips the \'you need VC\' narrative — exits on his own terms after 3 years.\"",
      badge: "✓ Email verified", note: "3 past SaaS exits covered",
    },
    {
      tier: "T1", name: "Melia Russell", pub: "Business Insider", beat: "Startups",
      angle: "\"The quiet acquisition that\'s making noise: how Sajid Shah sold OnSense.io without a single press release.\"",
      badge: "✓ Email verified", note: "Covered 5 Pakistan tech stories",
    },
    {
      tier: "T2", name: "Freya Pratty", pub: "Sifted", beat: "Emerging Markets",
      angle: "\"Bootstrapped exit as a template: what South Asian SaaS founders can learn from OnSense.io\'s journey.\"",
      badge: null, note: null,
    },
  ];

  const PRESS_CARDS = [
    {
      outlet: "TechCrunch", outletColor: "#21ce56", outletBg: "#111010",
      badge: "QUOTED", section: "STARTUPS · AI",
      headline: "How founders in the Global South are building 7-figure AI startups",
      byline: "Sajid Shah, Founder of OnSense.io, quoted · June 2026",
    },
    {
      outlet: "Startup Grind Pakistan", outletColor: Y, outletBg: "#111010",
      badge: "FEATURE, PODCAST", section: "PODCAST · EP. 84",
      headline: "Sajid Shah on winning P@SHA ICT and building OnSense from Karachi",
      byline: "Guest interview · also on Spotify · June 2026",
    },
    {
      outlet: "Entrepreneur", outletColor: "#fff", outletBg: "#cc1f24",
      badge: "GUEST BYLINE", section: "FOUNDERS · EARNED MEDIA",
      headline: "The bootstrapped playbook: growing without a PR agency",
      byline: "By Sajid Shah · Founder, OnSense.io · June 2026",
    },
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
          .ep-dark-press { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media (max-width: 700px) {
          .ep-before-after  { grid-template-columns: 1fr !important; }
          .ep-modules       { grid-template-columns: 1fr !important; }
          .ep-curriculum    { grid-template-columns: 1fr 1fr !important; }
          .ep-sprint-grid   { grid-template-columns: 1fr !important; }
          .ep-journo-layout { grid-template-columns: 1fr !important; }
          .ep-press-grid    { grid-template-columns: 1fr !important; }
          .ep-invest-grid   { grid-template-columns: 1fr !important; }
          .ep-what-keep     { grid-template-columns: 1fr !important; }
          .ep-why-grid      { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .ep-curriculum    { grid-template-columns: 1fr !important; }
          .ep-action-bar    { padding: 8px 16px !important; }
          .ep-action-inner  { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .ep-btn-group     { flex-direction: column !important; align-items: stretch !important; width: 100% !important; }
          .ep-back-link     { min-height: 44px; display: flex !important; align-items: center !important; }
          .ep-action-btn    { min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .ep-deck-link     { min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .ep-section       { padding: 24px 16px 28px !important; }
          .ep-divider       { margin: 0 16px !important; }
          .ep-hero-inner    { padding: 32px 16px 24px !important; }
          .ep-footer        { padding: 12px 16px !important; flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .ep-coverage      { padding: 14px 16px !important; gap: 20px !important; }
          .ep-journo-left   { min-width: 0 !important; width: 100% !important; }
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
              <div className="ep-btn-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(40px, 8vw, 80px)", lineHeight: 0.96, letterSpacing: "-0.03em", color: OD, margin: 0 }}>
              The Private<br />Founder&apos;s<br /><em>Intensive</em>
            </h1>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(15px, 2.5vw, 20px)", color: OD45, margin: 0, maxWidth: 540 }}>
              A done-with-you earned media program, prepared for Sajid Shah.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K, background: Y, padding: "5px 14px" }}>CONFIDENTIAL</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: OD45 }}>PREPARED PRIVATELY FOR SAJID / RESOURCEX.IO · JUNE 2026</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 40px", borderTop: `1px solid ${OD12}`, fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: OD45 }}>
            <span>EMOS · SIA ENTERPRISES</span>
            <span>JUNE 2026</span>
          </div>
        </div>

        {/* ══ §01 THE CHAPTER YOU'RE ENTERING ══════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="01" label="THE CHAPTER YOU'RE ENTERING" />
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: K, margin: "0 0 28px" }}>
            You built it.<br />You sold it.<br />You&apos;re building what&apos;s next.
          </h2>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 17, lineHeight: 1.65, color: K70, maxWidth: 680, margin: 0 }}>
            The acquisition is part of the story. Not the whole story, and it does not set the clock.
            You decide what&apos;s public, and when.
          </p>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §02 WHEN THEY LOOK YOU UP ════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 0" }}>
          <SectionMast num="02" label="WHEN THEY LOOK YOU UP, WHAT DO THEY FIND?" />
          <div className="ep-before-after" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, border: `1px solid ${K18}` }}>
            <div style={{ background: P, padding: "28px 32px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: K55, marginBottom: 16 }}>WHAT THEY FIND TODAY</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: K70, margin: 0 }}>
                A LinkedIn profile. Maybe a mention in a Pakistan tech roundup. No quotes in the outlets
                that matter. No authored articles. No press kit. No owned narrative. The story of
                OnSense.io exists, it just isn&apos;t findable under your name.
              </p>
            </div>
            <div style={{ background: K, padding: "28px 32px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: OD45, marginBottom: 16 }}>WHAT THEY&apos;LL FIND AFTER</div>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: OD70, margin: 0 }}>
                Quotes in outlets they recognise. Articles under your name on your own channels: your
                site, LinkedIn and Medium. A press kit ready to share. An Authority Asset they can link
                to. A founder narrative that shows up before anyone has to ask.
              </p>
            </div>
          </div>
          {/* Coverage strip */}
          <div className="ep-coverage" style={{ borderTop: `2px solid ${K}`, padding: "16px 32px", display: "flex", alignItems: "center", gap: 32, background: P2, flexWrap: "wrap" }}>
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
          <div className="ep-modules" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Module 01 */}
            <div style={{ border: `2px solid ${K}`, display: "flex", flexDirection: "column" }}>
              <div style={{ background: K, padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: OD }}>▶</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45 }}>START NOW · 6 WEEKS · NOT PEGGED TO THE DATE</span>
              </div>
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: K55 }}>MODULE 01</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 4vw, 34px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: K, margin: 0 }}>
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
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 4vw, 34px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: K55, margin: 0 }}>
                  The Announcement<br />Sprint
                </h3>
                <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: K55, margin: 0 }}>
                  Narrative, embargo plan, outreach templates, and done-with-you launch support.
                </p>
              </div>
            </div>
          </div>
          <div style={{ background: K, padding: "16px 24px" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: OD45, margin: 0, textAlign: "center" }}>
              Start the Foundation now. Trigger the Sprint when your date is set.
            </p>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §04 THE CURRICULUM ════════════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="04" label="THE CURRICULUM — MODULE 01 · FOUNDATION" />

          {/* Weeks 1–4 */}
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: K, marginBottom: 14 }}>WEEKS 1 TO 4 &nbsp;&nbsp; FOUNDATION</div>
          <div className="ep-curriculum" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: K18, border: `1px solid ${K18}`, marginBottom: 28 }}>
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
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: K, marginBottom: 14 }}>WEEKS 5 TO 6 &nbsp;&nbsp; AUTHORITY ASSET</div>
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
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70, margin: 0 }}>Founder web presence · 2–4 authority articles · complete press kit. Articles cover your expertise only — nothing about the deal.</p>
            </div>
            <div style={{ background: P2, padding: "16px 24px" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, marginBottom: 6 }}>WHAT YOU KEEP · PERMANENTLY</div>
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: K70, margin: 0 }}>Content lead + 1–2 VAs · ~25–35 hrs/week. System, templates, trackers and journalist list stay in-house. No recurring retainer.</p>
            </div>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §05 THE ANNOUNCEMENT SPRINT ══════════════════════════════════ */}
        <section className="ep-section ep-dark-hero" style={{ padding: "40px 40px 36px", background: K }}>
          <SectionMast num="05" label="MODULE 02 · THE ANNOUNCEMENT SPRINT" dark />
          <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45, marginBottom: 24 }}>
            MODULE 02 &nbsp;·&nbsp; Week 7 and Week 8 · activates on your confirmed date
          </p>
          <div className="ep-sprint-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: OD12, border: `1px solid ${OD12}`, marginBottom: 20 }}>
            {[
              { n: "1", title: "NARRATIVE AND ANGLE",           body: "First-deal-of-its-kind framing often carries further than the number." },
              { n: "2", title: "EMBARGO AND EXCLUSIVITY PLAN",  body: "15 to 20 named Tier 1 journalists. One outlet gets the story first; no one scoops you early." },
              { n: "3", title: "DONE-WITH-YOU LAUNCH",          body: "The Authority Asset goes live; we work the first placements with you." },
              { n: "4", title: "NOTHING BREAKS EARLY",          body: "Articles and press kit already in place before you go public." },
            ].map(s => (
              <div key={s.n} style={{ background: K, padding: "28px 28px" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: Y, lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: OD, marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: OD45, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, flexWrap: "wrap" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: OD45, margin: 0, flex: 1, minWidth: 200 }}>
              Done well, this turns one strong placement into search results, social proof, and warm introductions.
            </p>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: OD }}>YOU CONTROL THE STORY.</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: OD45, marginTop: 4 }}>How much is named is always your call.</div>
            </div>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ JOURNOCOLLABIQ DEMO ═══════════════════════════════════════════ */}
        <section className="ep-section ep-dark-hero" style={{ padding: "40px 40px 36px", background: "#0d0c0a" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45, marginBottom: 4 }}>
            EMOS · ONE OF THE MULTIPLE TOOLS YOUR TEAM WILL USE
          </div>
          <div style={{ height: 1, background: OD12, marginBottom: 24 }} />

          <div className="ep-journo-layout" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 1, background: OD12 }}>
            {/* Left: input panel */}
            <div className="ep-journo-left" style={{ background: "rgba(26,23,18,.88)", padding: "28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 20, color: Y, letterSpacing: "0.04em" }}>JOURNOCOLLABIQ</div>
                <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 13, color: OD45, marginTop: 4 }}>Find journalists · build angles · draft outreach</div>
              </div>
              <div style={{ height: 1, background: OD12 }} />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 6 }}>FOUNDER / BRAND</div>
                <div style={{ border: `1px solid ${OD25}`, padding: "10px 12px", fontFamily: SANS, fontWeight: 700, fontSize: 14, color: OD }}>Sajid Shah · OnSense.io</div>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 6 }}>STORY ANGLE</div>
                <div style={{ border: `1.5px solid ${Y}`, padding: "10px 12px", fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: OD70, background: "rgba(245,197,24,.04)" }}>
                  Pakistani SaaS founder sells bootstrapped company after 3 years. Building in public, no VC, earned media-only growth.
                </div>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 8 }}>TARGET BEATS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["SaaS / Tech", "Founders", "Pakistan / South Asia", "Bootstrapped"].map(t => (
                    <span key={t} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11, color: OD70, border: `1px solid ${OD25}`, padding: "4px 9px" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: Y, padding: "12px 0", textAlign: "center", marginTop: 8 }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: K }}>▶ RUN ANALYSIS</span>
              </div>
            </div>

            {/* Right: results */}
            <div style={{ background: K, padding: "22px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.10em", textTransform: "uppercase", color: OD }}>JOURNALIST MATCHES · TIER 1–3 · 24 FOUND</span>
                <span style={{ background: "rgba(245,197,24,.12)", border: `1px solid rgba(245,197,24,.35)`, fontFamily: SANS, fontWeight: 700, fontSize: 11, color: Y, padding: "3px 10px" }}>✓ Verified active</span>
              </div>
              <div style={{ height: 2, background: Y }} />

              {JOURNALISTS.map(j => (
                <div key={j.name} style={{ border: `1px solid ${OD12}`, padding: "12px 16px", background: "rgba(236,232,218,.03)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: j.tier === "T1" ? Y : "rgba(236,232,218,.18)", color: j.tier === "T1" ? K : OD45, fontFamily: SANS, fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{j.tier}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, color: OD }}>{j.name}</span>
                        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: OD45 }}>{j.pub} · {j.beat}</span>
                      </div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: OD70, marginBottom: j.badge ? 6 : 0 }}>{j.angle}</div>
                      {j.badge && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: "#1a5c28", color: "#7ee89a", fontFamily: SANS, fontWeight: 700, fontSize: 10, padding: "2px 8px" }}>{j.badge}</span>
                          {j.note && <span style={{ fontFamily: SANS, fontSize: 11, color: OD45 }}>{j.note}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Outreach sequence */}
              <div style={{ background: "rgba(245,197,24,.07)", border: `1px solid rgba(245,197,24,.18)`, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: Y }}>OUTREACH SEQUENCE READY</span>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: Y }}>Export →</span>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: OD70, margin: "0 0 6px" }}>
                  3-touch email sequence drafted for Tier 1 journalists · personalised per outlet
                </p>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: OD45, marginBottom: 4 }}>TESTED VARIANTS:</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.6, color: OD45 }}>
                  A: &quot;Pakistani founder bootstrapped, then exited — no VC, no press release&quot;<br />
                  B: &quot;How Sajid Shah sold OnSense.ai without a single pitch to media&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Bottom banner */}
          <div style={{ background: Y, padding: "16px 24px", marginTop: 0 }}>
            <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, lineHeight: 1.4, color: K, margin: 0 }}>
              STORY ANGLE SHOWN IS PRE-ANNOUNCEMENT.{" "}
              <em style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15 }}>
                The Sprint module adds the acquisition narrative and embargo plan.
              </em>
            </p>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ ILLUSTRATIVE RESULTS ══════════════════════════════════════════ */}
        <section className="ep-section ep-dark-press" style={{ padding: "40px 40px 36px", background: "#0d0c0a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45 }}>EMOS · WHAT THIS COULD LOOK LIKE · ILLUSTRATIVE, NOT A GUARANTEE</span>
            <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 700, fontSize: 9, padding: "4px 10px", letterSpacing: "0.12em", flexShrink: 0 }}>ILLUSTRATIVE</span>
          </div>
          <div style={{ height: 1, background: OD12, marginBottom: 16 }} />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.55, color: OD45, margin: "0 0 24px", maxWidth: 680 }}>
            Illustrative forms of earned coverage: a quote, a feature, and a guest byline. None are guaranteed.
            Your authored articles also run under your name on your own channels: your site, LinkedIn, Medium.
          </p>

          <div className="ep-press-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {/* TechCrunch */}
            <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #21ce56", flexShrink: 0 }}>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 18, color: "#21ce56" }}>TechCrunch</span>
                <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 700, fontSize: 9, padding: "2px 7px" }}>QUOTED</span>
              </div>
              <div style={{ padding: "16px 18px", flex: 1 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#21ce56", marginBottom: 12 }}>STARTUPS · AI</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: OD, margin: "0 0 12px" }}>
                  How founders in the Global South are building 7-figure AI startups
                </h3>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: OD45, margin: 0 }}>Sajid Shah, Founder of OnSense.io, quoted · June 2026</p>
              </div>
              <div style={{ height: 140, flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/clients/sajid-headshot.jpg" alt="Sajid Shah" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
              </div>
            </div>

            {/* Startup Grind Pakistan */}
            <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,.08)", flexShrink: 0 }}>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 17, color: Y }}>Startup Grind</span>
                <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 700, fontSize: 9, padding: "2px 6px" }}>FEATURE, PODCAST</span>
              </div>
              <div style={{ height: 140, flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/clients/sajid-event.jpg" alt="OnSense at tech event" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%", display: "block" }} />
              </div>
              <div style={{ padding: "16px 18px", flex: 1 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: OD45, marginBottom: 10 }}>PODCAST · EP. 84</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: OD, margin: "0 0 12px" }}>
                  Sajid Shah on winning P@SHA ICT and building OnSense from Karachi
                </h3>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: OD45, margin: 0 }}>Guest interview · also on Spotify · June 2026</p>
              </div>
            </div>

            {/* Entrepreneur */}
            <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ background: "#cc1f24", padding: "12px 18px", flexShrink: 0 }}>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "#fff" }}>Entrepreneur</span>
              </div>
              <div style={{ padding: "16px 18px", flex: 1 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  {["GUEST BYLINE", "FOUNDERS", "EARNED MEDIA"].map(tag => (
                    <span key={tag} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.10em", color: "#e8a020", border: "1px solid rgba(232,160,32,.35)", padding: "2px 7px" }}>{tag}</span>
                  ))}
                </div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: OD, margin: "0 0 12px" }}>
                  The bootstrapped playbook: growing without a PR agency
                </h3>
                <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: 12, color: OD45, margin: 0 }}>By Sajid Shah · Founder, OnSense.io · June 2026</p>
              </div>
              <div style={{ height: 140, flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/clients/sajid-pasha.jpg" alt="Sajid Shah at P@SHA ICT Awards" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }} />
              </div>
            </div>
          </div>
        </section>

        <div className="ep-divider" style={{ height: 1, background: K18, margin: "0 40px" }} />

        {/* ══ §07 INVESTMENT ════════════════════════════════════════════════ */}
        <section className="ep-section" style={{ padding: "40px 40px 36px" }}>
          <SectionMast num="07" label="INVESTMENT" />

          <div className="ep-invest-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, border: `1px solid ${K18}` }}>
            {/* Left: price */}
            <div style={{ background: K, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 72, lineHeight: 0.92, letterSpacing: "-0.04em", color: OD, borderBottom: `3px solid ${Y}`, display: "inline-block" }}>$6,000</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: OD }}>THE PRIVATE FOUNDER&apos;S INTENSIVE</div>
              <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: OD70, margin: 0 }}>Both phases. Both modules. 3 months of tools. One commitment, secured today.</p>
              <div style={{ border: `1px solid ${OD25}`, padding: "16px 20px" }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: Y, marginBottom: 8 }}>FLEXIBLE PAYMENT</div>
                <p style={{ fontFamily: SERIF, fontSize: 16, color: OD, margin: 0 }}>$4,000 to begin · $2,000 when your Sprint fires</p>
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: OD45, margin: 0 }}>Separately later: $7,000 — commit now, save $1,000.</p>
            </div>

            {/* Right: context */}
            <div style={{ background: "rgba(26,23,18,.60)", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: OD, marginBottom: 12 }}>WHY LOCK BOTH PHASES NOW</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: OD70, margin: 0 }}>Reserves your Sprint window · locks today&apos;s rate · your Authority Asset only pays off when Phase 2 launches it.</p>
              </div>
              <div style={{ borderTop: `1px solid ${OD12}`, paddingTop: 20 }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: OD, marginBottom: 12 }}>MARKET COMPARISON</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: OD70, margin: 0 }}>Done-for-you elsewhere: $25,000–$45,000 — and the capability leaves when they do.</p>
              </div>
              <div style={{ borderTop: `1px solid ${OD12}`, paddingTop: 20 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 12 }}>INCLUDED FREE · 3 MONTHS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {["Journo Outreach Checklist", "PressIQ [beta]", "JournoCollabIQ [beta]"].map(t => (
                    <div key={t} style={{ border: `1px solid ${OD25}`, padding: "8px 14px" }}>
                      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: OD }}>{t}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: OD45, margin: 0 }}>Upgraded to full release at no extra cost when betas ship.</p>
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: OD70, margin: 0 }}>What we guarantee: every deliverable, on the dated schedule we agree.</p>
            </div>
          </div>
        </section>

        {/* ══ THE FIRST STEP (CTA) ══════════════════════════════════════════ */}
        <section className="ep-dark-hero" style={{ background: K, padding: "40px 40px 48px" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: OD45, marginBottom: 24 }}>
            THE FIRST STEP &nbsp;&nbsp;·&nbsp;&nbsp; A SIMPLE PLACE TO START.
          </div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 5vw, 52px)", lineHeight: 1.0, letterSpacing: "-0.02em", color: OD, margin: "0 0 32px", maxWidth: 700 }}>
            Shall we lock in the Intensive and pencil your Foundation start?
          </h2>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: OD }}>Syed Irfan Ajmal</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: Y, marginTop: 4 }}>SIA ENTERPRISES</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: OD45, marginTop: 6 }}>SIA@SYEDIRFANAJMAL.COM</div>
          </div>
          <Link href="/strategy-call" style={{ display: "inline-block", fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: Y, color: K, padding: "13px 24px", textDecoration: "none" }}>
            BOOK YOUR STRATEGY CALL →
          </Link>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer className="ep-footer" style={{ borderTop: `1px solid ${K18}`, padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", background: P2 }}>
          <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>
            © 2026 Syed Irfan Ajmal · SIA Enterprises Inc (WY C-Corp) · SIA Enterprises (PK Sole Prop.)
          </span>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>CONFIDENTIAL · PLEASE DO NOT CIRCULATE</span>
        </footer>

      </div>
    </div>
  );
}

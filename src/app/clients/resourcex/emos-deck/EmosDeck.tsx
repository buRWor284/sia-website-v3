"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ── Design tokens (warm EMOS deck palette) ───────────────────────────────── */
const P    = "#ECE8DA";   // paper — warm cream
const P2   = "#E4DDC7";   // panel — slightly darker
const K    = "#1a1712";   // ink
const K70  = "rgba(26,23,18,.70)";
const K55  = "rgba(26,23,18,.55)";
const K35  = "rgba(26,23,18,.35)";
const K18  = "rgba(26,23,18,.18)";
const Y    = "#f5c518";   // yellow
const OD   = "#ECE8DA";   // on-dark
const OD70 = "rgba(236,232,218,.70)";
const OD55 = "rgba(236,232,218,.55)";
const OD45 = "rgba(236,232,218,.45)";
const OD25 = "rgba(236,232,218,.25)";
const OD12 = "rgba(236,232,218,.12)";
const SERIF = "'Newsreader', Georgia, serif";
const SANS  = "'Archivo', 'Helvetica Neue', Arial, sans-serif";

/* ── Shared utility bar (top of each slide) ───────────────────────────────── */
function Util({ badge, right, dark }: { badge: string; right: string; dark?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 80px", height: 68, flexShrink: 0,
      borderBottom: `1.5px solid ${dark ? OD12 : K18}`,
      fontFamily: SANS, fontWeight: 700, fontSize: 18,
      letterSpacing: "0.16em", textTransform: "uppercase",
      color: dark ? OD45 : K55,
    }}>
      <span style={{ background: Y, color: K, fontWeight: 800, padding: "5px 14px", fontSize: 15, letterSpacing: "0.10em" }}>{badge}</span>
      <span>{right}</span>
    </div>
  );
}

/* ── Slide 01 — Cover (dark) ──────────────────────────────────────────────── */
function Slide01() {
  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="EMOS · SIA ENTERPRISES" right="CONFIDENTIAL" dark />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ width: 110, height: 110, background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: K, letterSpacing: "0.04em" }}>EMOS</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: "0.28em", textTransform: "uppercase", color: OD45, textAlign: "center" }}>
          EARNED MEDIA OPERATING SYSTEM · SIA ENTERPRISES
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 94, lineHeight: 0.94, letterSpacing: "-0.03em", color: OD, textAlign: "center", margin: 0 }}>
          The Private<br />Founder's<br /><em>Intensive</em>
        </h1>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: OD70, textAlign: "center", margin: 0 }}>
          A done-with-you earned media program, prepared for Sajid Shah.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 80px", height: 60, borderTop: `1.5px solid ${OD12}`, fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, flexShrink: 0 }}>
        <span>CONFIDENTIAL · PREPARED PRIVATELY FOR SAJID / RESOURCEX.IO</span>
        <span>JUNE 2026</span>
      </div>
    </div>
  );
}

/* ── Slide 02 — §01 The Chapter You're Entering (dark) ───────────────────── */
function Slide02() {
  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 01 · THE CHAPTER YOU'RE ENTERING" right="SAJID · RESOURCEX.IO" dark />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 100, lineHeight: 0.92, letterSpacing: "-0.03em", color: OD, marginBottom: 56, margin: "0 0 56px" }}>
          YOU BUILT IT.<br />YOU SOLD IT.<br />YOU'RE BUILDING<br />WHAT'S NEXT.
        </h2>
        <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, lineHeight: 1.55, color: OD70, maxWidth: 820, margin: 0 }}>
          The acquisition is part of the story. Not the whole story, and it does not set the clock.
          You decide what's public, and when.
        </p>
      </div>
    </div>
  );
}

/* ── Slide 03 — §02 When They Look You Up (light) ────────────────────────── */
function Slide03() {
  const pubs = ["Harvard Business Review", "Forbes", "Apartment Therapy", "Bankrate", "MSN", "Yahoo"];
  return (
    <div style={{ background: P, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 02 · WHEN THEY LOOK YOU UP, WHAT DO THEY FIND?" right="SAJID · RESOURCEX.IO" />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", padding: "0 80px", gap: 0 }}>
        {/* Left: today */}
        <div style={{ borderRight: `1.5px solid ${K18}`, paddingRight: 60, paddingTop: 60, paddingBottom: 40 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.20em", textTransform: "uppercase", color: K55, marginBottom: 24 }}>
            WHAT THEY FIND<br />TODAY
          </div>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.6, color: K70 }}>
            A LinkedIn profile. Maybe a mention in a Pakistan tech roundup. No bylines. No press kit.
            No owned narrative. The story of OnSense.io exists — it just isn't findable under your name.
          </p>
        </div>
        {/* Right: after */}
        <div style={{ paddingLeft: 60, paddingTop: 60, paddingBottom: 40 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.20em", textTransform: "uppercase", color: K55, marginBottom: 24 }}>
            WHAT THEY'LL FIND<br />AFTER
          </div>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.6, color: K70 }}>
            Bylined articles in outlets they recognise. A press kit ready to share. An Authority Asset
            they can link to. A founder narrative that shows up before anyone has to ask.
          </p>
        </div>
      </div>
      {/* Coverage strip */}
      <div style={{ flexShrink: 0, borderTop: `1.5px solid ${K18}`, padding: "18px 80px", display: "flex", alignItems: "center", gap: 48, background: P2 }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, whiteSpace: "nowrap" }}>COVERAGE WE'VE EARNED</span>
        {pubs.map(p => (
          <span key={p} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: K, whiteSpace: "nowrap" }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 04 — §03 How It's Built (light) ───────────────────────────────── */
function Slide04() {
  return (
    <div style={{ background: P, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 03 · HOW IT'S BUILT" right="SAJID · RESOURCEX.IO" />
      <div style={{ padding: "20px 80px 0", flexShrink: 0 }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: K55, margin: "0 0 36px" }}>
          One 8-week intensive, in two modules: the 6-week Foundation now, the 2-week Sprint on your date.
        </p>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", padding: "0 80px", gap: 32, paddingBottom: 60 }}>
        {/* Module 01 */}
        <div style={{ border: `2px solid ${K}`, display: "flex", flexDirection: "column" }}>
          <div style={{ background: K, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: OD }}>▶</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: OD55 }}>START NOW · 6 WEEKS · NOT PEGGED TO THE DATE</span>
          </div>
          <div style={{ flex: 1, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: K55 }}>MODULE 01</div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, lineHeight: 0.92, letterSpacing: "-0.02em", color: K, margin: 0 }}>
              FOUNDER<br />AUTHORITY<br />FOUNDATION
            </h3>
            <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, lineHeight: 1.55, color: K70, margin: 0 }}>
              Web presence, authority articles, press kit, the Authority Asset built, and your team trained on EMOS.
            </p>
          </div>
        </div>
        {/* Module 02 */}
        <div style={{ border: `1.5px solid ${K35}`, display: "flex", flexDirection: "column" }}>
          <div style={{ background: P2, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16, borderBottom: `1.5px solid ${K18}` }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: K55 }}>◎</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: K55 }}>2 WEEKS · ACTIVATES ON YOUR CONFIRMED DATE</span>
          </div>
          <div style={{ flex: 1, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: K55 }}>MODULE 02</div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, lineHeight: 0.92, letterSpacing: "-0.02em", color: K55, margin: 0 }}>
              THE<br />ANNOUNCEMENT<br />SPRINT
            </h3>
            <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, lineHeight: 1.55, color: K55, margin: 0 }}>
              Narrative, embargo plan, outreach templates, and done-with-you launch support.
            </p>
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, borderTop: `2px solid ${K}`, padding: "18px 80px", background: K }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: OD70, margin: 0, textAlign: "center" }}>
          Start the Foundation now. Trigger the Sprint when your date is set.
        </p>
      </div>
    </div>
  );
}

/* ── Slide 05 — §04 Curriculum Weeks 1–4 (light) ─────────────────────────── */
function Slide05() {
  const weeks = [
    {
      num: "01",
      title: "FOUNDATION, WEB PRESENCE & SETUP",
      points: [
        "How the journalist outreach ecosystem actually works",
        "Identifying your quotable zones",
        "The Relevancy Spectrum framework",
        "Founder web presence and full press kit underway",
      ],
    },
    {
      num: "02",
      title: "PITCH WRITING MASTERY",
      points: [
        "Anatomy of a winning pitch, written for the journalist's reader",
        "Speed vs. quality. Subject line psychology",
        "Live pitch teardowns on your real submissions",
        "The Journo Outreach Checklist introduced and in use",
      ],
    },
    {
      num: "03",
      title: "PITCH AT SCALE · TRACK & OPTIMISE",
      points: [
        "Volume to 15+ pitches per week",
        "Tracking routine and metrics in place",
        "Blacklist of non-responsive contacts built",
        "Rejection pattern analysis",
      ],
    },
    {
      num: "04",
      title: "ADVANCED STRATEGIES, VA & SCALE",
      points: [
        "Building journalist relationships for repeat coverage",
        "Breaking news monitoring",
        "Extracting five returns from every placement",
        "VA sourcing and training: typical cost $500 to $1,500 / mo",
      ],
    },
  ];
  return (
    <div style={{ background: P, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 04 · THE CURRICULUM — MODULE 01 · FOUNDATION" right="SAJID · RESOURCEX.IO" />
      {/* Sub header */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 80px", background: P2, borderBottom: `1.5px solid ${K18}` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: K }}>WEEKS 1 TO 4 &nbsp;&nbsp;FOUNDATION</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>WEEKS 1 – 4 OF 6</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: K18 }}>
        {weeks.map(w => (
          <div key={w.num} style={{ background: P, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "4px 10px" }}>{w.num}</span>
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: "0.10em", textTransform: "uppercase", color: K, lineHeight: 1.3 }}>{w.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {w.points.map(pt => (
                <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, background: Y, flexShrink: 0, marginTop: 9 }} />
                  <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 17, lineHeight: 1.5, color: K70 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 06 — §04 Curriculum Weeks 5–6 (light panel) ───────────────────── */
function Slide06() {
  return (
    <div style={{ background: P, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 04 · MODULE 01 · FOUNDATION (AUTHORITY ASSET)" right="SAJID · RESOURCEX.IO" />
      {/* Sub header */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 80px", background: P2, borderBottom: `1.5px solid ${K18}` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: K }}>WEEKS 5 TO 6 &nbsp;&nbsp;AUTHORITY ASSET</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: K55 }}>WEEKS 5 – 6 OF 6</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18 }}>
        {/* Week 05 */}
        <div style={{ background: P, padding: "36px 52px 36px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "4px 10px" }}>05</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: "0.10em", textTransform: "uppercase", color: K }}>AUTHORITY ASSET · DATA BRIEF</span>
          </div>
          {[
            "What makes an Authority Asset genuinely newsworthy",
            "Data audit and asset concept development",
            "Introduction to JournoCollabIQ [Beta] for identifying high-fit journalists",
          ].map(pt => (
            <div key={pt} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, background: Y, flexShrink: 0, marginTop: 10 }} />
              <span style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: K70 }}>{pt}</span>
            </div>
          ))}
        </div>
        {/* Week 06 */}
        <div style={{ background: P, padding: "36px 80px 36px 52px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "4px 10px" }}>06</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: "0.10em", textTransform: "uppercase", color: K }}>AUTHORITY ASSET · BUILD</span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: K70, margin: 0 }}>What they are and why they earn links</p>
          <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: K70, margin: 0 }}>Types: data reports, surveys, interactive quizzes, calculators, AI tools, infographics, mapographics</p>
          <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: K70, margin: 0 }}>Team selects one asset to build; review and iteration</p>
        </div>
      </div>
      {/* Done for you / What you keep strip */}
      <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: K18, borderTop: `1.5px solid ${K18}` }}>
        <div style={{ background: P2, padding: "20px 52px 20px 80px" }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, display: "block", marginBottom: 8 }}>DONE FOR YOU · IN PARALLEL</span>
          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.5, color: K70, margin: 0 }}>Founder web presence · 2–4 authority articles · complete press kit. Articles cover your expertise only — nothing about the deal.</p>
        </div>
        <div style={{ background: P2, padding: "20px 80px 20px 52px" }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: K55, display: "block", marginBottom: 8 }}>WHAT YOU KEEP · PERMANENTLY</span>
          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.5, color: K70, margin: 0 }}>Content lead + 1–2 VAs · ~25–35 hrs/week. System, templates, trackers and journalist list stay in-house. No recurring retainer.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 07 — §05 Announcement Sprint (dark) ───────────────────────────── */
function Slide07() {
  const steps = [
    { n: "1", title: "NARRATIVE AND ANGLE",         body: "First-deal-of-its-kind framing often carries further than the number." },
    { n: "2", title: "EMBARGO AND EXCLUSIVITY PLAN", body: "15 to 20 named Tier 1 journalists. One outlet gets the story first; no one scoops you early." },
    { n: "3", title: "DONE-WITH-YOU LAUNCH",         body: "The Authority Asset goes live; we work the first placements with you." },
    { n: "4", title: "NOTHING BREAKS EARLY",         body: "Articles and press kit already in place before you go public." },
  ];
  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 05 · MODULE 02 · THE ANNOUNCEMENT SPRINT" right="SAJID · RESOURCEX.IO" dark />
      <div style={{ flexShrink: 0, padding: "18px 80px", borderBottom: `1.5px solid ${OD12}` }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: OD45 }}>MODULE 02 &nbsp;·&nbsp; Week 7 and Week 8 · activates on your confirmed date</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, background: OD12 }}>
        {steps.map(s => (
          <div key={s.n} style={{ background: K, padding: "40px 64px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: Y, lineHeight: 1, margin: 0 }}>{s.n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", color: OD }}>{s.title}</div>
            <p style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.55, color: OD70, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 80px", borderTop: `1.5px solid ${OD12}`, background: "rgba(236,232,218,.04)" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: OD55, margin: 0 }}>
          Done well, this turns one strong placement into search results, social proof, and warm introductions.
        </p>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", color: OD }}>YOU CONTROL THE STORY.</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: OD55, marginTop: 4 }}>How much is named is always your call.</div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 08 — JournoCollabIQ Demo (dark, animated) ─────────────────────── */
function Slide08() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1300),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => setStep(4), 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const JOURNALISTS = [
    {
      tier: "T1", name: "Alex Konrad", pub: "Forbes", beat: "Tech", pubColor: "#e8392a",
      angle: "\"Bootstrapped Pakistani founder flips the 'you need VC' narrative — exits on his own terms after 3 years.\"",
      badge: "✓ Email verified", note: "3 past SaaS exits covered",
    },
    {
      tier: "T1", name: "Melia Russell", pub: "Business Insider", beat: "Startups", pubColor: "#4a7fd4",
      angle: "\"The quiet acquisition that's making noise: how Sajid Shah sold OnSense.io without a single press release.\"",
      badge: "✓ Email verified", note: "Covered 5 Pakistan tech stories",
    },
    {
      tier: "T2", name: "Freya Pratty", pub: "Sifted", beat: "Emerging Markets", pubColor: null,
      angle: "\"Bootstrapped exit as a template: what South Asian SaaS founders can learn from OnSense.io's journey.\"",
      badge: null, note: null,
    },
  ];

  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Custom util bar — plain text both sides, no yellow badge */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 80px", height: 68, flexShrink: 0,
        borderBottom: `1.5px solid ${OD12}`,
        fontFamily: SANS, fontWeight: 700, fontSize: 14,
        letterSpacing: "0.14em", textTransform: "uppercase", color: OD45,
      }}>
        <span>EMOS · ONE OF THE MULTIPLE TOOLS YOUR TEAM WILL USE · JOURNOCOLLABIQ</span>
        <span>SAJID · RESOURCEX.IO</span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "400px 1fr", gap: 1, background: OD12, overflow: "hidden" }}>
        {/* Left: input panel */}
        <div style={{ background: "rgba(26,23,18,.88)", padding: "32px 36px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 22, color: Y, letterSpacing: "0.04em" }}>JOURNOCOLLABIQ</div>
            <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 14, color: OD45, marginTop: 4 }}>Find journalists · build angles · draft outreach</div>
          </div>
          <div style={{ height: 1, background: OD12, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 8 }}>FOUNDER / BRAND</div>
            <div style={{ border: `1px solid ${OD25}`, padding: "11px 14px", fontFamily: SANS, fontWeight: 700, fontSize: 16, color: OD }}>
              Sajid Shah · OnSense.io
            </div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 8 }}>STORY ANGLE</div>
            <div style={{ border: `1.5px solid ${Y}`, padding: "12px 14px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: OD70, background: "rgba(245,197,24,.04)" }}>
              Pakistani SaaS founder sells bootstrapped company after 3 years. Building in public, no VC, earned media-only growth.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 10 }}>TARGET BEATS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["SaaS / Tech", "Founders", "Pakistan / South Asia", "Bootstrapped"].map(t => (
                <span key={t} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: OD70, border: `1px solid ${OD25}`, padding: "5px 10px" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", padding: "15px 0", cursor: "default" }}>▶ RUN ANALYSIS</button>
        </div>

        {/* Right: results (animated) */}
        <div style={{ background: K, padding: "24px 40px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", color: OD }}>JOURNALIST MATCHES · TIER 1 - 3 · 24 FOUND</span>
            <span style={{ background: "rgba(245,197,24,.12)", border: `1px solid rgba(245,197,24,.35)`, fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: "0.10em", color: Y, padding: "4px 12px" }}>✓ Verified active</span>
          </div>
          <div style={{ height: 2, background: Y, marginBottom: 14, flexShrink: 0 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {JOURNALISTS.map((j, i) => (
              <div key={j.name} style={{
                border: `1px solid ${OD12}`,
                padding: "14px 18px",
                background: "rgba(236,232,218,.03)",
                opacity: step > i ? 1 : 0,
                transform: step > i ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: j.tier === "T1" ? Y : "rgba(236,232,218,.18)",
                    color: j.tier === "T1" ? K : OD70,
                    fontFamily: SANS, fontWeight: 900, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{j.tier}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 18, color: OD }}>{j.name}</span>
                      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: j.pubColor || OD45 }}>{j.pub} · {j.beat}</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: OD70, marginBottom: j.badge ? 8 : 0 }}>{j.angle}</div>
                    {j.badge && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: "#1a5c28", color: "#7ee89a", fontFamily: SANS, fontWeight: 700, fontSize: 11, padding: "3px 10px" }}>{j.badge}</span>
                        {j.note && <span style={{ fontFamily: SANS, fontSize: 13, color: OD45 }}>{j.note}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Outreach sequence */}
            <div style={{
              background: "rgba(245,197,24,.07)", border: `1px solid rgba(245,197,24,.18)`,
              padding: "14px 18px",
              opacity: step >= 4 ? 1 : 0,
              transform: step >= 4 ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: Y }}>OUTREACH SEQUENCE READY</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: Y }}>Export →</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: OD70, margin: "0 0 8px" }}>
                3-touch email sequence drafted for Tier 1 journalists · personalised per outlet
              </p>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 5 }}>TESTED VARIANTS:</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, color: OD55 }}>
                A: &quot;Pakistani founder bootstrapped, then exited — no VC, no press release&quot;<br />
                B: &quot;How Sajid Shah sold OnSense.ai without a single pitch to media&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom yellow banner */}
      <div style={{ flexShrink: 0, background: Y, padding: "20px 80px" }}>
        <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, lineHeight: 1.4, color: K, margin: 0 }}>
          STORY ANGLE SHOWN IS PRE-ANNOUNCEMENT.{" "}
          <em style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22 }}>
            The Sprint module adds the acquisition narrative and embargo plan.
          </em>
        </p>
      </div>
    </div>
  );
}

/* ── Slide 09 — EMOS Potential Results (dark, with real photos) ───────────── */
function Slide09() {
  return (
    <div style={{ background: "#0d0c0a", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Custom util bar — plain text left, yellow badge right */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 80px", height: 68, flexShrink: 0,
        borderBottom: `1.5px solid ${OD12}`,
        fontFamily: SANS, fontWeight: 700, fontSize: 14,
        letterSpacing: "0.14em", textTransform: "uppercase", color: OD45,
      }}>
        <span>EMOS · WHAT THIS COULD LOOK LIKE · ILLUSTRATIVE, NOT A GUARANTEE</span>
        <span style={{ background: Y, color: K, fontWeight: 800, fontSize: 11, padding: "5px 12px", letterSpacing: "0.12em", flexShrink: 0 }}>ILLUSTRATIVE</span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, padding: "28px 60px", alignItems: "stretch" }}>

        {/* ── TechCrunch card ── */}
        <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #21ce56" }}>
            <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 22, color: "#21ce56" }}>TechCrunch</span>
            <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 700, fontSize: 10, padding: "3px 8px", letterSpacing: "0.10em" }}>EXCLUSIVE</span>
          </div>
          <div style={{ padding: "18px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#21ce56" }}>STARTUPS · AI</div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/clients/sajid-headshot.jpg" alt="Sajid Shah" style={{ width: 72, height: 72, objectFit: "cover", objectPosition: "center top", flexShrink: 0 }} />
              <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.25, color: OD, margin: 0 }}>
                Building a 7-Figure AI Startup for the Best from the Global South
              </h3>
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: OD45, margin: 0 }}>
              By Sajid Shah · Founder, OnSense.io · June 2026
            </p>
          </div>
        </div>

        {/* ── Startup Grind Pakistan card ── */}
        <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 22px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 20, color: Y }}>Startup Grind</span>
            <span style={{ background: Y, color: K, fontFamily: SANS, fontWeight: 700, fontSize: 10, padding: "2px 7px", letterSpacing: "0.10em" }}>PAKISTAN</span>
          </div>
          <div style={{ height: 185, flexShrink: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/clients/sajid-event.jpg" alt="OnSense at tech event" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
          <div style={{ padding: "14px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45 }}>PODCAST · EP. 84</div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.25, color: OD, margin: 0 }}>
              Sajid Shah on Winning P@SHA ICT and Building OnSense From Karachi
            </h3>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: OD45, margin: 0 }}>
              1h 12m · Also on Spotify · June 2026
            </p>
          </div>
        </div>

        {/* ── Entrepreneur card ── */}
        <div style={{ background: "#111010", border: "1px solid rgba(255,255,255,.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "#cc1f24", padding: "14px 22px" }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 26, color: "#fff" }}>Entrepreneur</span>
          </div>
          <div style={{ padding: "12px 22px 0", display: "flex", gap: 8 }}>
            {["FOUNDERS", "EARNED MEDIA"].map(tag => (
              <span key={tag} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "#e8a020", border: "1px solid rgba(232,160,32,.35)", padding: "3px 8px" }}>{tag}</span>
            ))}
          </div>
          <div style={{ flex: 1, padding: "12px 22px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.25, color: OD, margin: 0, flex: 1 }}>
              How I Grew OnSense.io Without a PR Agency — and Got Press That Mattered
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
              <div>
                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: OD55, margin: "0 0 2px" }}>By Sajid Shah</p>
                <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: 11, color: OD45, margin: 0 }}>Contributing Writer · June 2026</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/clients/sajid-pasha.jpg" alt="Sajid Shah at P@SHA" style={{ width: 110, height: 80, objectFit: "cover", objectPosition: "center 20%", flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 10 — §07 Investment (dark) ────────────────────────────────────── */
function Slide10() {
  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="§ 07 · INVESTMENT" right="SAJID · RESOURCEX.IO" dark />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: OD12 }}>
        {/* Left: pricing */}
        <div style={{ background: K, padding: "48px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 88, lineHeight: 0.92, letterSpacing: "-0.04em", color: OD, borderBottom: `3px solid ${Y}`, display: "inline-block" }}>$6,000</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: OD }}>THE PRIVATE FOUNDER'S INTENSIVE</div>
          <p style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.5, color: OD70, margin: 0 }}>Both phases. Both modules. 3 months of tools. One commitment, secured today.</p>
          <div style={{ border: `1px solid ${OD25}`, padding: "20px 24px" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: Y, marginBottom: 10 }}>FLEXIBLE PAYMENT</div>
            <p style={{ fontFamily: SERIF, fontSize: 20, color: OD, margin: 0 }}>$4,000 to begin · $2,000 when your Sprint fires</p>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: OD55, margin: 0 }}>Separately later: $7,000 — commit now, save $1,000.</p>
        </div>
        {/* Right: comparison + included */}
        <div style={{ background: "rgba(26,23,18,.60)", padding: "48px 80px 48px 60px", display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: OD, marginBottom: 14 }}>WHY LOCK BOTH PHASES NOW</div>
            <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: OD70, margin: 0 }}>Reserves your Sprint window · locks today's rate · your Authority Asset only pays off when Phase 2 launches it.</p>
          </div>
          <div style={{ borderTop: `1px solid ${OD12}`, paddingTop: 24 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: OD, marginBottom: 14 }}>MARKET COMPARISON</div>
            <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.55, color: OD70, margin: 0 }}>Done-for-you elsewhere: $25,000–$45,000 — and the capability leaves when they do.</p>
          </div>
          <div style={{ borderTop: `1px solid ${OD12}`, paddingTop: 24 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, marginBottom: 14 }}>INCLUDED FREE · 3 MONTHS</div>
            <div style={{ display: "flex", gap: 16 }}>
              {["Journo Outreach Checklist", "PressIQ [beta]", "JournoCollabIQ [beta]"].map(t => (
                <div key={t} style={{ border: `1px solid ${OD25}`, padding: "10px 16px" }}>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: OD }}>{t}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: OD45, marginTop: 12 }}>Upgraded to full release at no extra cost when betas ship.</p>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: OD70, margin: 0 }}>What we guarantee: every deliverable, on the dated schedule we agree.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 11 — The First Step (dark) ────────────────────────────────────── */
function Slide11() {
  return (
    <div style={{ background: K, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Util badge="THE FIRST STEP" right="SAJID · RESOURCEX.IO" dark />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", gap: 32 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: "0.20em", textTransform: "uppercase", color: OD45 }}>A SIMPLE PLACE TO START.</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 80, lineHeight: 0.94, letterSpacing: "-0.03em", color: OD, margin: 0, maxWidth: 980 }}>
          SHALL WE LOCK IN THE INTENSIVE AND PENCIL your Foundation start?
        </h2>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: OD }}>Syed Irfan Ajmal</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: Y, marginTop: 4 }}>SIA ENTERPRISES</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: OD55, marginTop: 8 }}>SIA@SYEDIRFANAJMAL.COM</div>
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 80px", borderTop: `1.5px solid ${OD12}`, fontFamily: SANS, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: OD45 }}>
        <span>© 2026 SYED IRFAN AJMAL · SIA ENTERPRISES INC (WY C-CORP) · SIA ENTERPRISES (PK SOLE PROP.)</span>
        <span>CONFIDENTIAL · PLEASE DO NOT CIRCULATE</span>
      </div>
    </div>
  );
}

const SLIDES = [Slide01, Slide02, Slide03, Slide04, Slide05, Slide06, Slide07, Slide08, Slide09, Slide10, Slide11];

/* ── Email form (action bar) ──────────────────────────────────────────────── */
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
  const BASE: React.CSSProperties = { fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" };
  if (status === "sent") return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ ...BASE, color: Y }}>✓ Sent to {email}</span>
      <button onClick={onClose} style={{ ...BASE, background: "none", border: "none", color: K55, cursor: "pointer", padding: 0 }}>Dismiss</button>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="email" placeholder="recipient@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} style={{ fontFamily: "'Archivo',sans-serif", fontSize: 10, border: `1px solid ${status === "error" ? "#c0392b" : K35}`, background: "#FAFAFA", color: K, padding: "7px 12px", outline: "none", width: 200 }} />
      <button onClick={handleSend} disabled={status === "sending"} style={{ ...BASE, background: K, color: P, border: "none", padding: "8px 14px", cursor: status === "sending" ? "wait" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>{status === "sending" ? "Sending…" : "Send →"}</button>
      <button onClick={onClose} style={{ ...BASE, background: "none", border: "none", color: K55, cursor: "pointer", padding: "8px 4px" }}>✕</button>
      {status === "error" && <span style={{ fontFamily: "'Archivo',sans-serif", fontSize: 9, color: "#c0392b" }}>{email ? "Failed — try again." : "Enter valid email."}</span>}
    </div>
  );
}

/* ── Main deck component ──────────────────────────────────────────────────── */
export function EmosDeck() {
  const [slide, setSlide] = useState(0);
  const [emailOpen, setEmailOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = SLIDES.length;

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setSlide(s => Math.min(total - 1, s + 1)), [total]);

  /* keyboard navigation */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  /* scale canvas to fit stage */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      const sx = width / 1920;
      const sy = height / 1080;
      setScale(Math.min(sx, sy));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const SlideComponent = SLIDES[slide];

  return (
    <div style={{ background: "#14130f", height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600;1,800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500;1,6..72,600&display=swap');
        .emos-nav-btn:hover { opacity: 0.8 !important; }
        .emos-action-btn:hover { opacity: 0.8 !important; }
        .emos-prev-btn:hover, .emos-next-btn:hover { background: rgba(245,197,24,.15) !important; }
        @media print {
          .emos-no-print { display: none !important; }
          body { background: white !important; }
          .emos-stage { height: auto !important; }
          .emos-canvas { position: static !important; transform: none !important; width: 100% !important; height: auto !important; page-break-after: always !important; }
        }
      `}</style>

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <div className="emos-no-print" style={{
        background: "#1e1c17", borderBottom: `1px solid ${OD12}`,
        padding: "10px 32px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <Link href="/clients/resourcex" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: OD45, textDecoration: "none" }}>← Workspace</Link>
          {emailOpen ? (
            <EmailForm onClose={() => setEmailOpen(false)} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="emos-action-btn" onClick={() => window.print()} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: "none", color: OD45, border: `1px solid rgba(236,232,218,.25)`, padding: "7px 14px", cursor: "pointer", transition: "opacity 0.12s" }}>↓ Download PDF</button>
              <button className="emos-action-btn" onClick={() => setEmailOpen(true)} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: Y, color: K, border: "none", padding: "8px 14px", cursor: "pointer", transition: "opacity 0.12s" }}>✉ Email PDF</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stage ──────────────────────────────────────────────────────────── */}
      <div className="emos-stage" ref={stageRef} style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Slide canvas */}
        <div className="emos-canvas" style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: "center center", position: "absolute", overflow: "hidden" }}>
          <SlideComponent />
        </div>

        {/* Prev button */}
        <button
          className="emos-prev-btn emos-no-print"
          onClick={prev}
          disabled={slide === 0}
          style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(236,232,218,.08)", border: `1px solid ${OD12}`, color: OD, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: slide === 0 ? "default" : "pointer", opacity: slide === 0 ? 0.25 : 0.7, fontSize: 20, transition: "opacity 0.12s" }}
          aria-label="Previous slide"
        >‹</button>

        {/* Next button */}
        <button
          className="emos-next-btn emos-no-print"
          onClick={next}
          disabled={slide === total - 1}
          style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(236,232,218,.08)", border: `1px solid ${OD12}`, color: OD, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: slide === total - 1 ? "default" : "pointer", opacity: slide === total - 1 ? 0.25 : 0.7, fontSize: 20, transition: "opacity 0.12s" }}
          aria-label="Next slide"
        >›</button>
      </div>

      {/* ── Slide counter / dot nav ─────────────────────────────────────────── */}
      <div className="emos-no-print" style={{ flexShrink: 0, background: "#1e1c17", borderTop: `1px solid ${OD12}`, padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{ width: i === slide ? 24 : 8, height: 8, background: i === slide ? Y : OD25, border: "none", cursor: "pointer", transition: "all 0.2s", borderRadius: 0 }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: OD45, marginLeft: 16 }}>{slide + 1} / {total}</span>
      </div>
    </div>
  );
}

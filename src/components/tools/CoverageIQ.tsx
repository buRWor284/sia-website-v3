"use client";

/**
 * CoverageIQ — EMOS Pitch Tracking Mini-CRM (PUBLIC / lead-magnet surface)
 * Route: /tools/coverageiq
 *
 * Thin shell over the shared CoverageIQ core (src/components/coverageiq/*):
 * seeds mock data, persists to localStorage, and renders the 5 shared tabs
 * read-mostly (no auth, no CRUD). Email-capture + EMOS CTA strips + pipeline
 * footer are the public-only chrome.
 */

import { useState, useMemo } from "react";
import { PAPER, PAPER2, INK, INK55, INK35, INK15, YEL, SERIF, GROT, MONO } from "@/lib/tokens";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { EmailCaptureStrip, EmosCTAStrip } from "@/components/tools/ToolCTAStrips";
import { SectionMast, DataSourceNote } from "@/components/coverageiq/primitives";
import { CIQ_CSS } from "@/components/coverageiq/core-css";
import {
  PipelineView, FollowUpsView, CoverageLogView, ContactsView, PESODashboard, NewPitchModal,
} from "@/components/coverageiq/views";
import {
  pitchFromMock, journalistFromMock, alertFromMock,
  type MockPitch, type MockJournalist, type MockAlert,
  type NewPitchDraft, type TabId, type DataSource,
} from "@/lib/coverageiq/types";

// ── Mock data ──────────────────────────────────────────────────────────────────
//
// ★ EVERYTHING BELOW IS INVENTED. The journalists, outlets, pitches, placement
// URLs and alerts are all fictional demo content for the public shop-window
// version of the tool. Several look uncomfortably real — named writers at real
// outlets, a Yahoo Finance link, a Rand Fishkin tweet — none of which exist.
//
// M9 (2026-07-02 security/UX review): a pulsing amber "LIVE" pill used to sit
// above this in the header, so a first-time visitor had every reason to read
// fabricated alerts as real monitoring output. For a product whose whole pitch
// is PR credibility, that is the wrong kind of wrong. The header badge now says
// SAMPLE DATA. If you add anything here, keep it obviously illustrative and do
// not invent quotes, links or coverage attributed to real named people.

const JOURNALISTS: MockJournalist[] = [
  { id: "j1",  name: "Jordan Ames",     outlet: "TechCrunch",                beat: "Marketplace Infra",  dr: 93, email: "j.ames@tc.com",              lastContact: "2026-05-28", pitchesSent: 4, placements: 2 },
  { id: "j2",  name: "Marcus Webb",     outlet: "Forbes",                    beat: "Marketing / CMO",    dr: 95, email: "m.webb@forbes.com",          lastContact: "2026-06-01", pitchesSent: 3, placements: 1 },
  { id: "j3",  name: "Priya Sharma",    outlet: "Search Engine Journal",     beat: "SEO / Content",      dr: 82, email: "priya@sej.com",              lastContact: "2026-05-15", pitchesSent: 6, placements: 3 },
  { id: "j4",  name: "Tom Kaplan",      outlet: "Entrepreneur",              beat: "Growth / Founders",  dr: 91, email: "t.kaplan@entrepreneur.com",  lastContact: "2026-05-20", pitchesSent: 2, placements: 0 },
  { id: "j5",  name: "Elena Rodriguez", outlet: "HubSpot Blog",              beat: "Inbound / Content",  dr: 88, email: "e.rodriguez@hubspot.com",    lastContact: "2026-06-03", pitchesSent: 5, placements: 3 },
  { id: "j6",  name: "James Liu",       outlet: "Moz",                       beat: "SEO / Link Building",dr: 79, email: "james@moz.com",              lastContact: "2026-04-22", pitchesSent: 3, placements: 1 },
  { id: "j7",  name: "Amanda Foster",   outlet: "Inc. Magazine",             beat: "Leadership / Ops",   dr: 92, email: "a.foster@inc.com",           lastContact: "2026-05-30", pitchesSent: 2, placements: 1 },
  { id: "j8",  name: "David Park",      outlet: "Ahrefs Blog",               beat: "SEO / Data",         dr: 85, email: "d.park@ahrefs.com",          lastContact: "2026-06-02", pitchesSent: 4, placements: 2 },
  { id: "j9",  name: "Nina Petrova",    outlet: "Content Marketing Institute",beat: "Content Strategy",  dr: 80, email: "nina@cmi.com",               lastContact: "2026-05-10", pitchesSent: 3, placements: 2 },
  { id: "j10", name: "Carlos Mendez",   outlet: "Marketing Land",            beat: "Digital Marketing",  dr: 76, email: "carlos@mland.com",           lastContact: "2026-05-18", pitchesSent: 2, placements: 0 },
];

const DEFAULT_PITCHES: MockPitch[] = [
  { id:"p1",  subject:"Data: 40 B2B marketplaces benchmarked, only 11 meet their own definition",          journalist:"j1",  client:"Fairground", stage:"placed",    peso:"Earned", sentDate:"2026-05-10", placedDate:"2026-05-28", url:"https://techcrunch.com/2026/05/b2b-marketplace-benchmark/",           anchorText:"B2B marketplace benchmark",           dr:93, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"PressIQ", followUpDue:null,         points:460 },
  { id:"p2",  subject:"Expert quote: Why fractional CMOs are the future for Series A",          journalist:"j2",  client:"Tilt",       stage:"replied",   peso:"Earned", sentDate:"2026-06-01", placedDate:null,         url:null,                                                           anchorText:"fractional CMO",             dr:95, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:"2026-06-06", points:null },
  { id:"p3",  subject:"Guest post: The PESO framework for modern link building",                journalist:"j3",  client:"Fairground",             stage:"placed",    peso:"Earned", sentDate:"2026-04-20", placedDate:"2026-05-15", url:"https://searchenginejournal.com/peso-link-building/",          anchorText:"PESO media model",           dr:82, linkType:"Do Follow", contentType:"Original",   team:"Nirvana",      dataSource:"PressIQ", followUpDue:null,         points:380 },
  { id:"p4",  subject:"Founder story: From 0 to 1.5M organic traffic in one year",             journalist:"j4",  client:"Northbeam",               stage:"sent",      peso:"Earned", sentDate:"2026-06-03", placedDate:null,         url:null,                                                           anchorText:null,                         dr:91, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-08", points:null },
  { id:"p5",  subject:"How-to: Building a content engine that earns 50+ links/quarter",        journalist:"j5",  client:"Fairground", stage:"amplified", peso:"Earned", sentDate:"2026-04-01", placedDate:"2026-04-18", url:"https://blog.hubspot.com/content-engine-links/",               anchorText:"content marketing strategy", dr:88, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"PressIQ", followUpDue:null,         points:420 },
  { id:"p6",  subject:"Data pitch: Link building ROI benchmarks by industry",                  journalist:"j6",  client:"Fairground",             stage:"opened",    peso:"Earned", sentDate:"2026-06-02", placedDate:null,         url:null,                                                           anchorText:null,                         dr:79, linkType:null,         contentType:null,          team:"Nirvana",      dataSource:"PressIQ", followUpDue:"2026-06-07", points:null },
  { id:"p7",  subject:"Expert roundup contribution: Top SEO predictions for 2027",             journalist:"j7",  client:"Tilt",       stage:"placed",    peso:"Earned", sentDate:"2026-05-12", placedDate:"2026-05-30", url:"https://inc.com/seo-predictions-2027/",                        anchorText:"SEO-PR strategy",            dr:92, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:450 },
  { id:"p8",  subject:"Case study: Earned media vs paid backlinks: 18-month analysis",        journalist:"j8",  client:"Fairground",             stage:"replied",   peso:"Earned", sentDate:"2026-05-28", placedDate:null,         url:null,                                                           anchorText:"earned media analysis",      dr:85, linkType:"Do Follow", contentType:"Original",   team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-05", points:null },
  { id:"p9",  subject:"Thought leadership: The death of transactional link building",          journalist:"j9",  client:"Tilt",       stage:"amplified", peso:"Earned", sentDate:"2026-03-15", placedDate:"2026-04-02", url:"https://contentmarketinginstitute.com/death-transactional-links/", anchorText:"earned media operating system", dr:80, linkType:"Do Follow", contentType:"Original", team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:360 },
  { id:"p10", subject:"Newsjacking: Google March 2026 core update, earned media angle",       journalist:"j10", client:"Fairground", stage:"drafted",   peso:"Earned", sentDate:null,         placedDate:null,         url:null,                                                           anchorText:null,                         dr:76, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:null,         points:null },
  { id:"p11", subject:"LinkedIn article: 5 PESO lessons from 200+ earned placements",         journalist:null,  client:"Tilt",       stage:"amplified", peso:"Shared", sentDate:"2026-05-20", placedDate:"2026-05-20", url:"https://linkedin.com/pulse/peso-lessons/",                     anchorText:null,                         dr:null,linkType:null,         contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:200 },
  { id:"p12", subject:"Blog post: How CoverageIQ tracks your earned media pipeline",           journalist:null,  client:"Fairground",             stage:"placed",    peso:"Owned",  sentDate:"2026-05-25", placedDate:"2026-05-25", url:"https://dmr.agency/blog/coverageiq-pipeline/",                 anchorText:null,                         dr:null,linkType:null,         contentType:"Original",   team:"Nirvana",      dataSource:"Manual",  followUpDue:null,         points:150 },
  { id:"p13", subject:"Sponsored feature: Earned Media OS for in-house teams",                journalist:"j2",  client:"Tilt",       stage:"sent",      peso:"Paid",   sentDate:"2026-06-04", placedDate:null,         url:null,                                                           anchorText:"EMOS",                       dr:95, linkType:null,         contentType:null,          team:"Firestarters", dataSource:"Manual",  followUpDue:"2026-06-09", points:null },
  { id:"p14", subject:"HARO response: Best practices for digital PR measurement",              journalist:"j3",  client:"Fairground",             stage:"placed",    peso:"Earned", sentDate:"2026-05-05", placedDate:"2026-05-22", url:"https://searchenginejournal.com/digital-pr-measurement/",      anchorText:"digital PR metrics",         dr:82, linkType:"Do Follow", contentType:"Original",   team:"Nirvana",      dataSource:"PressIQ", followUpDue:null,         points:380 },
  { id:"p15", subject:"Infographic pitch: The anatomy of a successful media pitch",            journalist:"j5",  client:"Fairground", stage:"opened",    peso:"Earned", sentDate:"2026-06-03", placedDate:null,         url:null,                                                           anchorText:null,                         dr:88, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-08", points:null },
  { id:"p16", subject:"Expert quote: Neuromarketing meets earned media",                       journalist:"j7",  client:"Tilt",       stage:"drafted",   peso:"Earned", sentDate:null,         placedDate:null,         url:null,                                                           anchorText:null,                         dr:92, linkType:null,         contentType:null,          team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:null },
];

const ALERTS: MockAlert[] = [
  { id:"a1", date:"2026-06-05", type:"syndication", title:"Your TechCrunch piece syndicated to Yahoo Finance",       url:"https://finance.yahoo.com/news/earned-media-study/",  source:"Google Alert", status:"new" },
  { id:"a2", date:"2026-06-04", type:"mention",     title:"Syed Irfan Ajmal quoted in MarketingProfs newsletter",   url:"https://marketingprofs.com/newsletter/june-2026/",    source:"Mention",      status:"new" },
  { id:"a3", date:"2026-06-03", type:"pickup",      title:"SEJ article shared by Rand Fishkin (48K reach)",         url:"https://twitter.com/randfish/status/12345",           source:"Mention",      status:"reviewed" },
  { id:"a4", date:"2026-06-02", type:"syndication", title:"HubSpot piece republished on Business2Community",        url:"https://business2community.com/content-engine/",      source:"Google Alert", status:"reviewed" },
  { id:"a5", date:"2026-06-01", type:"mention",     title:"EMOS mentioned in Ahrefs weekly digest",                 url:"https://ahrefs.com/digest/june-1/",                   source:"Google Alert", status:"archived" },
];

// ── localStorage-backed pitch store ─────────────────────────────────────────────
const CIQ_KEY = "sia.coverageiq.v1";

function loadPitches(): MockPitch[] {
  if (typeof window === "undefined") return [...DEFAULT_PITCHES];
  try {
    const raw = localStorage.getItem(CIQ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockPitch[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_PITCHES];
}

const PUBLIC_TEAMS = ["Firestarters", "Nirvana", "Wizards"];
const PUBLIC_SOURCES: DataSource[] = ["manual", "PressIQ", "SignalIQ", "Google Alerts"];

// ── Main shell ───────────────────────────────────────────────────────────────

type Tab = TabId;

export default function CoverageIQ() {
  const [activeTab, setActiveTab] = useState<Tab>("pipeline");
  const [showModal, setShowModal] = useState(false);
  // Lazy init reads localStorage once on client mount. Safe with no hydration
  // guard because the tool is rendered ssr:false (see CoverageIQClient.tsx), so
  // there is no server HTML to mismatch.
  const [pitches, setPitches] = useState<MockPitch[]>(() => loadPitches());

  const vmPitches = useMemo(() => pitches.map(p => pitchFromMock(p, JOURNALISTS)), [pitches]);
  const vmJournalists = useMemo(() => JOURNALISTS.map(journalistFromMock), []);
  const vmAlerts = useMemo(() => ALERTS.map(alertFromMock), []);

  const addPitch = (draft: NewPitchDraft) => {
    const newPitch: MockPitch = {
      id: `u${Date.now()}`,
      subject: draft.subject,
      journalist: draft.journalistId,
      client: draft.client ?? "—",
      stage: draft.stage,
      peso: draft.peso,
      sentDate: draft.stage !== "drafted" ? new Date().toISOString().split("T")[0] : null,
      placedDate: null,
      url: null,
      anchorText: null,
      dr: null,
      linkType: null,
      contentType: null,
      team: draft.team ?? "",
      dataSource: draft.dataSource,
      followUpDue: null,
      points: null,
    };
    setPitches(prev => {
      const next = [newPitch, ...prev];
      try { localStorage.setItem(CIQ_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const followUpCount =
    vmPitches.filter(p => p.followUpDue && new Date(p.followUpDue) <= today).length +
    vmPitches.filter(p => !p.followUpDue && (p.stage === "sent" || p.stage === "opened") && p.sentDate && (today.getTime() - new Date(p.sentDate).getTime()) / 86400000 > 5).length;

  const tabs: { id: Tab; label: string; count: number | null; highlight?: boolean }[] = [
    { id: "pipeline",  label: "Pipeline",       count: vmPitches.length },
    { id: "followups", label: "Follow-ups",     count: followUpCount, highlight: followUpCount > 0 },
    { id: "coverage",  label: "Coverage Log",   count: vmPitches.filter(p => p.stage === "placed" || p.stage === "amplified").length },
    { id: "contacts",  label: "Contacts",       count: vmJournalists.length },
    { id: "peso",      label: "PESO Dashboard", count: null },
  ];

  const sectionMastProps: Record<Tab, { number: string; label: string; vol: string }> = {
    pipeline:  { number: "§ 01", label: "Pitch Pipeline",       vol: "DRAFTED → AMPLIFIED" },
    followups: { number: "§ 02", label: "Follow-ups",           vol: "ACTIONS + REMINDERS" },
    coverage:  { number: "§ 03", label: "Coverage Log",         vol: "PLACEMENTS + POINTS" },
    contacts:  { number: "§ 04", label: "Journalist Contacts",  vol: "RELATIONSHIP INDEX" },
    peso:      { number: "§ 05", label: "PESO Dashboard",       vol: "PAID · EARNED · SHARED · OWNED" },
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>
      <style dangerouslySetInnerHTML={{ __html: CIQ_CSS }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <ToolHeader
        toolPrefix="Coverage"
        subtitle="Pitch Tracking CRM · EMOS Tool Suite"
        rightContent={
          <>
            <a href="/tools/coverageiq/how-it-works" target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none", whiteSpace: "nowrap" }}>
              How it works →
            </a>
            <button
              onClick={() => setShowModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={e => (e.currentTarget.style.opacity = "1")}
            >
              + New Pitch
            </button>
            {followUpCount > 0 && (
              <button
                onClick={() => setActiveTab("followups")}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: "pointer" }}
              >
                <span style={{ width: 6, height: 6, background: INK, display: "inline-block" }} />
                {followUpCount} ACTION{followUpCount !== 1 ? "S" : ""} DUE
              </button>
            )}
            {/* M9: was a pulsing amber "LIVE" pill, which read as real-time
                monitoring sitting directly above invented alerts (fake Yahoo
                Finance syndication, a fake Rand Fishkin tweet). Now labelled for
                what it is. Square marker, not a dot — Bureau has no rounded
                corners; amber stays a marker, never the text, per the locked
                a11y colour rules. */}
            <div
              title="Every pitch, contact and alert in this demo is invented."
              style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}
            >
              <span style={{ width: 6, height: 6, background: YEL, display: "inline-block" }} />
              Sample data
            </div>
          </>
        }
      />

      {/* ── Tab nav ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${INK35}`, background: PAPER, position: "sticky", top: 52, zIndex: 49 }}>
        <div style={{ display: "flex", maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", overflowX: "auto" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="ciq-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px", background: active ? INK : "transparent",
                  color: active ? PAPER : INK55,
                  border: "none", borderRight: `1px solid ${INK15}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 10,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    fontFamily: MONO, fontWeight: 700, fontSize: 10, opacity: active ? 0.6 : 0.5,
                    background: tab.highlight && !active ? YEL : "transparent",
                    color: tab.highlight && !active ? INK : "inherit",
                    padding: tab.highlight && !active ? "1px 5px" : 0,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Who it's for (Camper-demo fix: filter wrong-fit demos early) ─── */}
      <div style={{ borderBottom: `1px solid ${INK15}`, background: PAPER2 }}>
        <div style={{ maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", paddingBlock: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          Built for founders and small teams running their own PR.
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1240, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>
        <SectionMast {...sectionMastProps[activeTab]} />
        {activeTab === "pipeline"  && <PipelineView pitches={vmPitches} />}
        {activeTab === "followups" && <FollowUpsView pitches={vmPitches} />}
        {activeTab === "coverage"  && <CoverageLogView pitches={vmPitches} />}
        {activeTab === "contacts"  && <ContactsView journalists={vmJournalists} />}
        {activeTab === "peso"      && <PESODashboard pitches={vmPitches} alerts={vmAlerts} alertsPublicChrome />}

        {/* Data-source transparency (Camper-demo fix). */}
        <DataSourceNote variant="public" />

        {/* Conversion strips — deliver value, capture the email, pitch EMOS. */}
        <EmailCaptureStrip
          toolName="CoverageIQ"
          benefit="Get the follow-up cadences, placement playbooks, and PESO scoring templates behind this CRM: one earned-media brief in your inbox each week, no fluff."
        />
        <EmosCTAStrip
          toolName="CoverageIQ"
          pitch="CoverageIQ is the last step of the pipeline: it tracks what your pitches earn. The full Earned Media Operating System gives your team the story signals, journalist matching, and pitch scoring that fill this pipeline in the first place."
          applyHref="/emos-platform"
          applyLabel="Explore EMOS"
          hideExplore
        />
      </main>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {showModal && (
        <NewPitchModal
          journalists={vmJournalists}
          teams={PUBLIC_TEAMS}
          dataSources={PUBLIC_SOURCES}
          defaultDataSource="manual"
          footerNote="Pitch will be added to the pipeline"
          savedSuffix={() => " saved to your pipeline."}
          successSlot={() => (
            <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "14px 20px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Before you send</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.5, marginBottom: 10 }}>
                Score your pitch in PressIQ to check clarity, relevance, and journalist fit — before hitting send.
              </div>
              <a
                href="/tools/pressiq"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
              >
                Score in PressIQ →
              </a>
            </div>
          )}
          onClose={() => setShowModal(false)}
          onSubmit={(draft) => { addPitch(draft); }}
        />
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <ToolPipelineFooter currentTool="coverageiq" />
    </div>
  );
}

"use client";

/**
 * CoverageIQ — EMOS Pitch Tracking Mini-CRM
 * Design: design_handoff_coverageiq/README.md
 * Route: /tools/coverageiq
 *
 * 5 tabs: Pipeline · Follow-ups · Coverage Log · Contacts · PESO Dashboard
 * + New Pitch Modal
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, YEL2, SERIF, GROT, MONO,
} from "@/lib/tokens";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";

// ── Data model ─────────────────────────────────────────────────────────────────

type Stage = "drafted" | "sent" | "opened" | "replied" | "placed" | "amplified";
type PesoType = "Earned" | "Shared" | "Owned" | "Paid";
type LinkType = "Do Follow" | "No Follow";
type ContentType = "Original" | "Republished";
type DataSource = "Manual" | "PressIQ" | "SignalIQ" | "Google Alerts";
type AlertStatus = "new" | "reviewed" | "archived";
type AlertType = "syndication" | "mention" | "pickup";

interface Journalist {
  id: string;
  name: string;
  outlet: string;
  beat: string;
  dr: number;
  email: string;
  lastContact: string;
  pitchesSent: number;
  placements: number;
}

interface Pitch {
  id: string;
  subject: string;
  journalist: string | null;
  client: string;
  stage: Stage;
  peso: PesoType;
  sentDate: string | null;
  placedDate: string | null;
  url: string | null;
  anchorText: string | null;
  dr: number | null;
  linkType: LinkType | null;
  contentType: ContentType | null;
  team: string;
  dataSource: DataSource;
  followUpDue: string | null;
  points: number | null;
}

interface Alert {
  id: string;
  date: string;
  type: AlertType;
  title: string;
  url: string;
  source: string;
  status: AlertStatus;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: { id: Stage; label: string }[] = [
  { id: "drafted",   label: "Drafted" },
  { id: "sent",      label: "Sent" },
  { id: "opened",    label: "Opened" },
  { id: "replied",   label: "Replied" },
  { id: "placed",    label: "Placed" },
  { id: "amplified", label: "Amplified" },
];

const JOURNALISTS: Journalist[] = [
  { id: "j1",  name: "Sarah Chen",      outlet: "TechCrunch",                beat: "SaaS / Startups",    dr: 93, email: "s.chen@tc.com",              lastContact: "2026-05-28", pitchesSent: 4, placements: 2 },
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

const DEFAULT_PITCHES: Pitch[] = [
  { id:"p1",  subject:"Data study: 73% of earned links outperform paid in 12 months",          journalist:"j1",  client:"DMR.agency", stage:"placed",    peso:"Earned", sentDate:"2026-05-10", placedDate:"2026-05-28", url:"https://techcrunch.com/2026/05/earned-media-study/",           anchorText:"earned media ROI",           dr:93, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"PressIQ", followUpDue:null,         points:460 },
  { id:"p2",  subject:"Expert quote: Why fractional CMOs are the future for Series A",          journalist:"j2",  client:"SIA Enterprises",       stage:"replied",   peso:"Earned", sentDate:"2026-06-01", placedDate:null,         url:null,                                                           anchorText:"fractional CMO",             dr:95, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:"2026-06-06", points:null },
  { id:"p3",  subject:"Guest post: The PESO framework for modern link building",                journalist:"j3",  client:"DMR.agency",             stage:"placed",    peso:"Earned", sentDate:"2026-04-20", placedDate:"2026-05-15", url:"https://searchenginejournal.com/peso-link-building/",          anchorText:"PESO media model",           dr:82, linkType:"Do Follow", contentType:"Original",   team:"Nirvana",      dataSource:"PressIQ", followUpDue:null,         points:380 },
  { id:"p4",  subject:"Founder story: From 0 to 1.5M organic traffic in one year",             journalist:"j4",  client:"Ridester",               stage:"sent",      peso:"Earned", sentDate:"2026-06-03", placedDate:null,         url:null,                                                           anchorText:null,                         dr:91, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-08", points:null },
  { id:"p5",  subject:"How-to: Building a content engine that earns 50+ links/quarter",        journalist:"j5",  client:"DMR.agency", stage:"amplified", peso:"Earned", sentDate:"2026-04-01", placedDate:"2026-04-18", url:"https://blog.hubspot.com/content-engine-links/",               anchorText:"content marketing strategy", dr:88, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"PressIQ", followUpDue:null,         points:420 },
  { id:"p6",  subject:"Data pitch: Link building ROI benchmarks by industry",                  journalist:"j6",  client:"DMR.agency",             stage:"opened",    peso:"Earned", sentDate:"2026-06-02", placedDate:null,         url:null,                                                           anchorText:null,                         dr:79, linkType:null,         contentType:null,          team:"Nirvana",      dataSource:"PressIQ", followUpDue:"2026-06-07", points:null },
  { id:"p7",  subject:"Expert roundup contribution: Top SEO predictions for 2027",             journalist:"j7",  client:"SIA Enterprises",       stage:"placed",    peso:"Earned", sentDate:"2026-05-12", placedDate:"2026-05-30", url:"https://inc.com/seo-predictions-2027/",                        anchorText:"SEO-PR strategy",            dr:92, linkType:"Do Follow", contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:450 },
  { id:"p8",  subject:"Case study: Earned media vs paid backlinks — 18 month analysis",        journalist:"j8",  client:"DMR.agency",             stage:"replied",   peso:"Earned", sentDate:"2026-05-28", placedDate:null,         url:null,                                                           anchorText:"earned media analysis",      dr:85, linkType:"Do Follow", contentType:"Original",   team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-05", points:null },
  { id:"p9",  subject:"Thought leadership: The death of transactional link building",          journalist:"j9",  client:"SIA Enterprises",       stage:"amplified", peso:"Earned", sentDate:"2026-03-15", placedDate:"2026-04-02", url:"https://contentmarketinginstitute.com/death-transactional-links/", anchorText:"earned media operating system", dr:80, linkType:"Do Follow", contentType:"Original", team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:360 },
  { id:"p10", subject:"Newsjacking: Google March 2026 core update — earned media angle",       journalist:"j10", client:"DMR.agency", stage:"drafted",   peso:"Earned", sentDate:null,         placedDate:null,         url:null,                                                           anchorText:null,                         dr:76, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:null,         points:null },
  { id:"p11", subject:"LinkedIn article: 5 PESO lessons from 200+ earned placements",         journalist:null,  client:"SIA Enterprises",       stage:"amplified", peso:"Shared", sentDate:"2026-05-20", placedDate:"2026-05-20", url:"https://linkedin.com/pulse/peso-lessons/",                     anchorText:null,                         dr:null,linkType:null,         contentType:"Original",   team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:200 },
  { id:"p12", subject:"Blog post: How CoverageIQ tracks your earned media pipeline",           journalist:null,  client:"DMR.agency",             stage:"placed",    peso:"Owned",  sentDate:"2026-05-25", placedDate:"2026-05-25", url:"https://dmr.agency/blog/coverageiq-pipeline/",                 anchorText:null,                         dr:null,linkType:null,         contentType:"Original",   team:"Nirvana",      dataSource:"Manual",  followUpDue:null,         points:150 },
  { id:"p13", subject:"Sponsored feature: Earned Media OS for in-house teams",                journalist:"j2",  client:"SIA Enterprises",       stage:"sent",      peso:"Paid",   sentDate:"2026-06-04", placedDate:null,         url:null,                                                           anchorText:"EMOS",                       dr:95, linkType:null,         contentType:null,          team:"Firestarters", dataSource:"Manual",  followUpDue:"2026-06-09", points:null },
  { id:"p14", subject:"HARO response: Best practices for digital PR measurement",              journalist:"j3",  client:"DMR.agency",             stage:"placed",    peso:"Earned", sentDate:"2026-05-05", placedDate:"2026-05-22", url:"https://searchenginejournal.com/digital-pr-measurement/",      anchorText:"digital PR metrics",         dr:82, linkType:"Do Follow", contentType:"Original",   team:"Nirvana",      dataSource:"PressIQ", followUpDue:null,         points:380 },
  { id:"p15", subject:"Infographic pitch: The anatomy of a successful media pitch",            journalist:"j5",  client:"DMR.agency", stage:"opened",    peso:"Earned", sentDate:"2026-06-03", placedDate:null,         url:null,                                                           anchorText:null,                         dr:88, linkType:null,         contentType:null,          team:"Wizards",      dataSource:"PressIQ", followUpDue:"2026-06-08", points:null },
  { id:"p16", subject:"Expert quote: Neuromarketing meets earned media",                       journalist:"j7",  client:"SIA Enterprises",       stage:"drafted",   peso:"Earned", sentDate:null,         placedDate:null,         url:null,                                                           anchorText:null,                         dr:92, linkType:null,         contentType:null,          team:"Firestarters", dataSource:"Manual",  followUpDue:null,         points:null },
];

const ALERTS: Alert[] = [
  { id:"a1", date:"2026-06-05", type:"syndication", title:"Your TechCrunch piece syndicated to Yahoo Finance",       url:"https://finance.yahoo.com/news/earned-media-study/",  source:"Google Alert", status:"new" },
  { id:"a2", date:"2026-06-04", type:"mention",     title:"Syed Irfan Ajmal quoted in MarketingProfs newsletter",   url:"https://marketingprofs.com/newsletter/june-2026/",    source:"Mention",      status:"new" },
  { id:"a3", date:"2026-06-03", type:"pickup",      title:"SEJ article shared by Rand Fishkin (48K reach)",         url:"https://twitter.com/randfish/status/12345",           source:"Mention",      status:"reviewed" },
  { id:"a4", date:"2026-06-02", type:"syndication", title:"HubSpot piece republished on Business2Community",        url:"https://business2community.com/content-engine/",      source:"Google Alert", status:"reviewed" },
  { id:"a5", date:"2026-06-01", type:"mention",     title:"EMOS mentioned in Ahrefs weekly digest",                 url:"https://ahrefs.com/digest/june-1/",                   source:"Google Alert", status:"archived" },
];

// ── Live pitch store (localStorage-backed) ─────────────────────────────────────
const CIQ_KEY = "sia.coverageiq.v1";

function _loadPitches(): Pitch[] {
  if (typeof window === "undefined") return [...DEFAULT_PITCHES];
  try {
    const raw = localStorage.getItem(CIQ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Pitch[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_PITCHES];
}

// eslint-disable-next-line prefer-const
let PITCHES: Pitch[] = _loadPitches();
let _rerenderCoverage: (() => void) | null = null;

function addPitchGlobal(p: Pitch): void {
  PITCHES = [p, ...PITCHES];
  try { localStorage.setItem(CIQ_KEY, JSON.stringify(PITCHES)); } catch { /* ignore */ }
  _rerenderCoverage?.();
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

function daysAgoLabel(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function getJournalist(id: string | null): Journalist | undefined {
  if (!id) return undefined;
  return JOURNALISTS.find(j => j.id === id);
}

// ── Shared components ──────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  const map: Record<Stage, { bg: string; fg: string; border: string }> = {
    drafted:   { bg: PAPER2,  fg: INK55, border: INK35 },
    sent:      { bg: INK,     fg: PAPER, border: INK },
    opened:    { bg: "transparent", fg: INK, border: INK },
    replied:   { bg: YEL,     fg: INK,   border: YEL },
    placed:    { bg: INK,     fg: YEL,   border: INK },
    amplified: { bg: YEL,     fg: INK,   border: YEL },
  };
  const s = map[stage];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px 4px",
      background: s.bg, color: s.fg, border: `1px solid ${s.border}`,
      fontFamily: GROT, fontWeight: 800, fontSize: 9,
      letterSpacing: "0.14em", textTransform: "uppercase",
    }}>
      {stage}
    </span>
  );
}

function PESOBadge({ type }: { type: PesoType }) {
  const map: Record<PesoType, { bg: string; fg: string; border?: string }> = {
    Earned: { bg: YEL,          fg: INK },
    Shared: { bg: INK,          fg: PAPER },
    Owned:  { bg: PAPER2,       fg: INK },
    Paid:   { bg: "transparent", fg: INK55, border: INK35 },
  };
  const c = map[type];
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px 4px",
      background: c.bg, color: c.fg,
      border: c.border ? `1px solid ${c.border}` : "none",
      fontFamily: GROT, fontWeight: 800, fontSize: 9,
      letterSpacing: "0.16em",
    }}>
      {type.charAt(0)}
    </span>
  );
}

function DRBar({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  const fill = value >= 80 ? YEL : value >= 50 ? INK : INK55;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, minWidth: 24 }}>{value}</span>
      <div style={{ flex: 1, height: 4, background: INK15, maxWidth: 60 }}>
        <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: fill }} />
      </div>
    </div>
  );
}

function PointsBadge({ points }: { points: number | null }) {
  if (!points) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontFamily: MONO, fontWeight: 700, fontSize: 14,
      borderBottom: `2px solid ${YEL}`, paddingBottom: 2,
    }}>
      {points}
    </span>
  );
}

function AlertTypeBadge({ type }: { type: AlertType }) {
  const labels: Record<AlertType, string> = { syndication: "SYN", mention: "MEN", pickup: "AMP" };
  const bgs:    Record<AlertType, string> = { syndication: YEL,   mention: INK,   pickup: PAPER2 };
  const fgs:    Record<AlertType, string> = { syndication: INK,   mention: YEL,   pickup: INK };
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px 3px",
      background: bgs[type], color: fgs[type],
      fontFamily: GROT, fontWeight: 800, fontSize: 8,
      letterSpacing: "0.14em", textTransform: "uppercase",
      border: type === "pickup" ? `1px solid ${INK35}` : "none",
    }}>
      {labels[type]}
    </span>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-block", padding: "6px 14px",
      background: active ? INK : "transparent",
      color: active ? PAPER : INK55,
      border: `1px solid ${active ? INK : INK35}`,
      fontFamily: GROT, fontWeight: 700, fontSize: 10,
      letterSpacing: "0.14em", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.12s ease",
    }}>
      {label}
    </button>
  );
}

function SectionMast({ number, label, vol }: { number: string; label: string; vol?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Double rule */}
      <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 3, borderBottom: "none" }}>
        <div style={{ borderTop: `3px solid ${INK}`, paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{
              background: YEL, color: INK,
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "3px 10px 4px",
            }}>
              {number}
            </span>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.18em", textTransform: "uppercase", color: INK55,
            }}>
              {label}
            </span>
            <div style={{ flex: 1, height: 1, background: INK15, minWidth: 20 }} />
            {vol && (
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase", color: INK35,
              }}>
                {vol}
              </span>
            )}
          </div>
        </div>
      </div>
      <div style={{ borderBottom: `1px solid ${INK15}`, marginTop: 10 }} />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: "48px 32px", textAlign: "center",
      border: `1px solid ${INK15}`, background: PAPER2,
    }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

// ── Pipeline View ──────────────────────────────────────────────────────────────

function PipelineView() {
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => { c[s.id] = 0; });
    PITCHES.forEach(p => { c[p.stage]++; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    const list = stageFilter === "all" ? [...PITCHES] : PITCHES.filter(p => p.stage === stageFilter);
    const order = PIPELINE_STAGES.map(s => s.id);
    return list.sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage));
  }, [stageFilter]);

  const totalPoints = PITCHES.reduce((s, p) => s + (p.points ?? 0), 0);

  return (
    <div>
      {/* Stage funnel strip */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`,
        border: `1px solid ${INK}`, marginBottom: 28,
      }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const active = stageFilter === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setStageFilter(active ? "all" : stage.id)}
              style={{
                padding: "20px 16px",
                borderRight: i < PIPELINE_STAGES.length - 1 ? `1px solid ${INK}` : "none",
                background: active ? INK : "transparent",
                cursor: "pointer", border: "none",
                transition: "background 0.12s",
                textAlign: "center",
              }}
            >
              <div style={{
                fontFamily: MONO, fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1,
                color: active ? YEL : INK, letterSpacing: "-0.02em",
              }}>
                {stageCounts[stage.id]}
              </div>
              <div style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: active ? "rgba(250,250,250,.55)" : INK55, marginTop: 6,
              }}>
                {stage.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 150px 96px 80px 64px 72px",
          background: INK, color: PAPER,
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          {["Pitch", "Journalist", "Stage", "DR", "PESO", "Points"].map((h, i) => (
            <div key={h} style={{
              padding: "12px 16px",
              borderRight: i < 5 ? "1px solid rgba(241,235,222,.15)" : "none",
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map(pitch => {
          const journalist = getJournalist(pitch.journalist);
          const isExpanded = expandedId === pitch.id;
          return (
            <div key={pitch.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : pitch.id)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 150px 96px 80px 64px 72px",
                  borderBottom: `1px solid ${INK15}`, cursor: "pointer",
                  background: isExpanded ? PAPER2 : "transparent",
                  transition: "background 0.12s",
                }}
              >
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3, overflow: "hidden", minWidth: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: INK }}>{pitch.subject}</span>
                  <span style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.08em" }}>
                    {pitch.client}{pitch.sentDate ? ` · ${fmt(pitch.sentDate)}` : " · Not sent"}
                  </span>
                </div>
                <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, overflow: "hidden", minWidth: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {journalist ? journalist.name : "—"}
                  </span>
                  {journalist && (
                    <span style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {journalist.outlet}
                    </span>
                  )}
                </div>
                <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                  <StageBadge stage={pitch.stage} />
                </div>
                <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
                  <DRBar value={pitch.dr} />
                </div>
                <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PESOBadge type={pitch.peso} />
                </div>
                <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                  <PointsBadge points={pitch.points} />
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  borderBottom: `1px solid ${INK15}`, background: PAPER2,
                  padding: "20px 16px", display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
                }}>
                  {/* Col 1 */}
                  <div>
                    <DetailColHead>Pitch Details</DetailColHead>
                    <DetailRow label="Team" value={pitch.team} />
                    <DetailRow label="Data Source" value={pitch.dataSource} />
                    <DetailRow label="Link Type" value={pitch.linkType ?? "—"} />
                    <DetailRow label="Content Type" value={pitch.contentType ?? "—"} />
                  </div>
                  {/* Col 2 */}
                  <div>
                    <DetailColHead>Timeline</DetailColHead>
                    <DetailRow label="Sent" value={fmt(pitch.sentDate)} />
                    <DetailRow label="Placed" value={fmt(pitch.placedDate)} />
                    <DetailRow label="Follow-up Due" value={pitch.followUpDue ? fmt(pitch.followUpDue) : "—"} />
                    {pitch.followUpDue && new Date(pitch.followUpDue) <= new Date() && (
                      <div style={{ marginTop: 8, padding: "6px 10px", background: YEL, display: "inline-block", fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        FOLLOW-UP OVERDUE
                      </div>
                    )}
                  </div>
                  {/* Col 3 */}
                  <div>
                    <DetailColHead>Placement</DetailColHead>
                    <DetailRow label="Anchor Text" value={pitch.anchorText ?? "—"} />
                    {pitch.url && (
                      <div style={{ marginTop: 6 }}>
                        <a href={pitch.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 11, color: INK, borderBottom: `1px solid ${YEL}`, wordBreak: "break-all", textDecoration: "none" }}>
                          {pitch.url.replace("https://", "").substring(0, 45)}…
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary line */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55 }}>
          {filtered.length} pitch{filtered.length !== 1 ? "es" : ""}{stageFilter !== "all" ? ` in ${stageFilter}` : " total"}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: INK55 }}>
          Total points: {totalPoints}
        </span>
      </div>
    </div>
  );
}

function DetailColHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${INK15}` }}>
      <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>{label}</span>
      <span style={{ fontFamily: SERIF, fontSize: 14, color: INK }}>{value}</span>
    </div>
  );
}

// ── Follow-ups View ────────────────────────────────────────────────────────────

function FollowUpsView() {
  const today = new Date(); today.setHours(0,0,0,0);

  const overdue        = PITCHES.filter(p => p.followUpDue && new Date(p.followUpDue) < today);
  const dueToday       = PITCHES.filter(p => p.followUpDue && new Date(p.followUpDue).toDateString() === today.toDateString());
  const upcoming       = PITCHES.filter(p => p.followUpDue && new Date(p.followUpDue) > today);
  const stalled        = PITCHES.filter(p => !p.followUpDue && (p.stage === "sent" || p.stage === "opened") && p.sentDate && (today.getTime() - new Date(p.sentDate).getTime()) / 86400000 > 5);
  const readyToAmp     = PITCHES.filter(p => p.stage === "placed" && p.placedDate && (today.getTime() - new Date(p.placedDate).getTime()) / 86400000 < 14);
  const totalActions   = overdue.length + dueToday.length + upcoming.length + stalled.length + readyToAmp.length;

  const summary = [
    { num: overdue.length,    label: "OVERDUE",       highlight: overdue.length > 0 },
    { num: dueToday.length,   label: "DUE TODAY",     highlight: dueToday.length > 0 },
    { num: upcoming.length,   label: "UPCOMING",      highlight: false },
    { num: stalled.length,    label: "STALLED",       highlight: false },
    { num: readyToAmp.length, label: "READY TO AMP",  highlight: false },
  ];

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `1px solid ${INK}`, marginBottom: 28 }}>
        {summary.map((item, i) => (
          <div key={i} style={{
            padding: "18px 14px",
            borderRight: i < 4 ? `1px solid ${INK}` : "none",
            background: item.highlight ? YEL : "transparent",
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: item.highlight ? INK : INK55, marginTop: 5 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {totalActions === 0
        ? <EmptyState message="No follow-ups pending. All caught up." />
        : <>
            <FollowUpSection title="Overdue"           subtitle="Needs immediate attention"      items={overdue}    urgency="overdue"  today={today} />
            <FollowUpSection title="Due Today"         subtitle=""                               items={dueToday}   urgency="today"    today={today} />
            <FollowUpSection title="Upcoming"          subtitle="Next 7 days"                    items={upcoming}   urgency="upcoming" today={today} />
            <FollowUpSection title="Stalled pitches"   subtitle="No response, no follow-up set" items={stalled}    urgency="stalled"  today={today} />
            <FollowUpSection title="Ready to amplify"  subtitle="Placed in last 14 days"         items={readyToAmp} urgency="amplify"  today={today} />
          </>
      }
    </div>
  );
}

type Urgency = "overdue" | "today" | "upcoming" | "stalled" | "amplify";

function FollowUpSection({ title, subtitle, items, urgency, today }: {
  title: string; subtitle: string; items: Pitch[]; urgency: Urgency; today: Date;
}) {
  if (items.length === 0) return null;

  const colorMap: Record<Urgency, { bg: string; fg: string; indicator: string }> = {
    overdue:  { bg: YEL,     fg: INK,   indicator: INK },
    today:    { bg: INK,     fg: PAPER, indicator: YEL },
    upcoming: { bg: "transparent", fg: INK, indicator: INK55 },
    stalled:  { bg: PAPER2,  fg: INK,   indicator: INK35 },
    amplify:  { bg: "transparent", fg: INK, indicator: YEL },
  };
  const c = colorMap[urgency];

  const actionLabel = urgency === "amplify" ? "Share now →" : urgency === "stalled" ? "Re-engage →" : "Follow up →";
  const btnBg = urgency === "overdue" ? INK : YEL;
  const btnFg = urgency === "overdue" ? YEL : INK;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: c.bg, color: c.fg, borderTop: `3px solid ${INK}` }}>
        <span style={{ width: 8, height: 8, background: c.indicator, flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>{title}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, opacity: 0.6 }}>{items.length}</span>
        {subtitle && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, marginLeft: "auto", opacity: 0.7 }}>{subtitle}</span>}
      </div>
      <div style={{ border: `1px solid ${INK}`, borderTop: "none" }}>
        {items.map((pitch, idx) => {
          const journalist = getJournalist(pitch.journalist);
          const daysDiff = pitch.followUpDue ? Math.round((new Date(pitch.followUpDue).getTime() - today.getTime()) / 86400000) : null;
          const daysSinceSent = pitch.sentDate ? Math.round((today.getTime() - new Date(pitch.sentDate).getTime()) / 86400000) : null;
          return (
            <div key={pitch.id} style={{
              display: "grid", gridTemplateColumns: "1fr 160px 100px 120px 160px",
              borderBottom: idx < items.length - 1 ? `1px solid ${INK15}` : "none",
              alignItems: "center",
            }}>
              <div style={{ padding: "14px 16px", overflow: "hidden", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pitch.subject}</div>
                <div style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.06em", marginTop: 3 }}>{pitch.client}</div>
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}`, overflow: "hidden", minWidth: 0 }}>
                {journalist
                  ? <>
                      <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{journalist.name}</div>
                      <div style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.06em" }}>{journalist.outlet}</div>
                    </>
                  : <span style={{ color: INK35 }}>—</span>}
              </div>
              <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}` }}>
                <StageBadge stage={pitch.stage} />
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}` }}>
                {pitch.followUpDue
                  ? <>
                      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: daysDiff !== null && daysDiff < 0 ? INK : INK70 }}>{fmt(pitch.followUpDue)}</div>
                      <div style={{ fontFamily: GROT, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3, color: daysDiff !== null && daysDiff < 0 ? INK : INK55 }}>
                        {daysDiff !== null && daysDiff < 0 ? `${Math.abs(daysDiff)}d overdue` : daysDiff === 0 ? "Due today" : `In ${daysDiff}d`}
                      </div>
                    </>
                  : <div style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                      {daysSinceSent !== null ? `Sent ${daysSinceSent}d ago` : "—"}
                    </div>
                }
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}` }}>
                <button
                  onClick={() => {
                    if (urgency === "amplify") {
                      if (pitch.url) window.open(pitch.url, "_blank", "noopener,noreferrer");
                    } else {
                      const email = journalist?.email;
                      if (email) {
                        navigator.clipboard.writeText(email).then(() => {
                          const btn = document.activeElement as HTMLButtonElement;
                          const orig = btn.textContent ?? "";
                          btn.textContent = "Copied!";
                          setTimeout(() => { btn.textContent = orig; }, 1500);
                        });
                      }
                    }
                  }}
                  style={{ padding: "7px 14px", background: btnBg, color: btnFg, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  {actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Coverage Log View ──────────────────────────────────────────────────────────

type CoverageLogKey = "placedDate" | "outlet" | "anchorText" | "dr" | "peso" | "linkType" | "contentType" | "points";

function CoverageLogView() {
  const coverageLog = PITCHES.filter(p => p.stage === "placed" || p.stage === "amplified").map(p => {
    const j = p.journalist ? JOURNALISTS.find(jj => jj.id === p.journalist) : null;
    return { ...p, outlet: j ? j.outlet : (p.peso === "Shared" ? "LinkedIn" : "DMR.agency Blog") };
  });
  const [sortBy, setSortBy] = useState<CoverageLogKey>("placedDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...coverageLog].sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortBy] ?? "";
      const vb = (b as Record<string, unknown>)[sortBy] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortDir, coverageLog]);

  const handleSort = (col: CoverageLogKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const arrow = (col: CoverageLogKey) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const totalPoints = coverageLog.reduce((s, c) => s + (c.points ?? 0), 0);
  const drItems = coverageLog.filter(c => c.dr);
  const avgDR = drItems.length ? Math.round(drItems.reduce((s, c) => s + (c.dr ?? 0), 0) / drItems.length) : 0;
  const doFollow = coverageLog.filter(c => c.linkType === "Do Follow").length;

  const cols: { key: CoverageLogKey; label: string; w: string }[] = [
    { key: "placedDate",  label: "Date",        w: "90px" },
    { key: "outlet",      label: "Publication", w: "150px" },
    { key: "anchorText",  label: "Anchor Text", w: "1fr" },
    { key: "dr",          label: "DR",          w: "80px" },
    { key: "peso",        label: "PESO",        w: "72px" },
    { key: "linkType",    label: "Link",        w: "82px" },
    { key: "contentType", label: "Type",        w: "82px" },
    { key: "points",      label: "Pts",         w: "64px" },
  ];
  const grid = cols.map(c => c.w).join(" ");

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, marginBottom: 24 }}>
        {[
          { num: coverageLog.length, label: "TOTAL PLACEMENTS" },
          { num: totalPoints,         label: "TOTAL POINTS" },
          { num: avgDR,               label: "AVG DOMAIN RATING" },
          { num: doFollow,            label: "DO-FOLLOW LINKS" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "20px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: grid, background: INK, color: PAPER }}>
          {cols.map((col, i) => (
            <div key={col.key} onClick={() => handleSort(col.key)} style={{
              padding: "11px 14px", cursor: "pointer",
              borderRight: i < cols.length - 1 ? "1px solid rgba(241,235,222,.15)" : "none",
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              userSelect: "none", whiteSpace: "nowrap",
            }}>
              {col.label}{arrow(col.key)}
            </div>
          ))}
        </div>

        {sorted.map((entry, idx) => (
          <div key={entry.id} style={{
            display: "grid", gridTemplateColumns: grid,
            borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none",
          }}>
            <div style={logCell(false)}><span style={{ fontFamily: MONO, fontSize: 12 }}>{fmt(entry.placedDate)}</span></div>
            <div style={logCell(true)}>
              {entry.url
                ? <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>{entry.outlet}</a>
                : <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{entry.outlet}</span>}
            </div>
            <div style={logCell(true)}><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70 }}>{entry.anchorText ?? "—"}</span></div>
            <div style={logCell(true)}><DRBar value={entry.dr} /></div>
            <div style={logCell(true)}><PESOBadge type={entry.peso} /></div>
            <div style={logCell(true)}>
              <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: entry.linkType === "Do Follow" ? INK : INK55 }}>
                {entry.linkType ?? "—"}
              </span>
            </div>
            <div style={logCell(true)}>
              <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>
                {entry.contentType ?? "—"}
              </span>
            </div>
            <div style={logCell(true)}><PointsBadge points={entry.points} /></div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {coverageLog.length} placements logged · Click column headers to sort
      </div>
    </div>
  );
}

function logCell(border: boolean): React.CSSProperties {
  return {
    padding: "12px 10px", borderLeft: border ? `1px solid ${INK15}` : "none",
    display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0,
  };
}

// ── Contacts View ──────────────────────────────────────────────────────────────

type ContactKey = keyof Journalist;

function ContactsView() {
  const [sortBy, setSortBy] = useState<ContactKey>("lastContact");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...JOURNALISTS].sort((a, b) => {
      const va = a[sortBy] as string | number;
      const vb = b[sortBy] as string | number;
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [sortBy, sortDir]);

  const handleSort = (col: ContactKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const arrow = (col: ContactKey) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const grid = "1.3fr 1fr 110px 52px 52px 72px 100px";
  const headers: { key: ContactKey; label: string }[] = [
    { key: "name",        label: "Journalist / Publication" },
    { key: "beat",        label: "Beat" },
    { key: "dr",          label: "DR" },
    { key: "pitchesSent", label: "Sent" },
    { key: "placements",  label: "Won" },
    { key: "placements",  label: "Rate" }, // computed — sort by placements for rate
    { key: "lastContact", label: "Last Contact" },
  ];

  return (
    <div>
      <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: grid, background: INK, color: PAPER }}>
          {headers.map((col, i) => (
            <div key={col.label} onClick={i !== 5 ? () => handleSort(col.key) : undefined} style={{
              padding: "11px 12px", cursor: i !== 5 ? "pointer" : "default",
              borderRight: i < headers.length - 1 ? "1px solid rgba(241,235,222,.15)" : "none",
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap",
            }}>
              {col.label}{i !== 5 ? arrow(col.key) : ""}
            </div>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((j, idx) => {
          const rate = j.pitchesSent > 0 ? Math.round((j.placements / j.pitchesSent) * 100) : 0;
          return (
            <div key={j.id} style={{
              display: "grid", gridTemplateColumns: grid,
              borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none",
            }}>
              <div style={cc(false)}>
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{j.name}</span>
                    <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: INK55, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.outlet}</span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: INK70, marginTop: 2 }}>{j.email}</div>
                </div>
              </div>
              <div style={cc(true)}><span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.08em", color: INK70, lineHeight: 1.3 }}>{j.beat}</span></div>
              <div style={{ ...cc(true), justifyContent: "center" }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: j.dr >= 80 ? INK : INK70 }}>{j.dr}</span>
              </div>
              <div style={{ ...cc(true), justifyContent: "center" }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.pitchesSent}</span>
              </div>
              <div style={{ ...cc(true), justifyContent: "center" }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.placements}</span>
              </div>
              <div style={{ ...cc(true), justifyContent: "center" }}>
                <span style={{
                  fontFamily: GROT, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                  color: rate >= 50 ? INK : INK55,
                  background: rate >= 50 ? YEL : "transparent",
                  padding: rate >= 50 ? "2px 6px" : 0,
                }}>
                  {rate}%
                </span>
              </div>
              <div style={cc(true)}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap" }}>{fmt(j.lastContact)}</div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 1, whiteSpace: "nowrap" }}>{daysAgoLabel(j.lastContact)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {JOURNALISTS.length} contacts · Click column headers to sort
      </div>
    </div>
  );
}

function cc(border: boolean): React.CSSProperties {
  return {
    padding: "12px 12px", borderLeft: border ? `1px solid ${INK15}` : "none",
    display: "flex", alignItems: "center", gap: 4, overflow: "hidden", minWidth: 0,
  };
}

// ── PESO Dashboard ─────────────────────────────────────────────────────────────

function PESODashboard() {
  const pesoTypes: PesoType[] = ["Earned", "Shared", "Owned", "Paid"];

  const pesoData = useMemo(() => pesoTypes.map(type => {
    const pitches = PITCHES.filter(p => p.peso === type);
    const placed  = pitches.filter(p => p.stage === "placed" || p.stage === "amplified");
    const points  = placed.reduce((s, p) => s + (p.points ?? 0), 0);
    const drItems = placed.filter(p => p.dr);
    const avgDR   = drItems.length ? Math.round(drItems.reduce((s, p) => s + (p.dr ?? 0), 0) / drItems.length) : 0;
    return { type, total: pitches.length, placed: placed.length, points, avgDR };
  }), []);

  const totalPitches = PITCHES.length;
  const totalPlaced  = PITCHES.filter(p => p.stage === "placed" || p.stage === "amplified").length;
  const convRate     = totalPitches > 0 ? Math.round((totalPlaced / totalPitches) * 100) : 0;

  const descriptions: Record<PesoType, string> = {
    Earned: "Media coverage earned through pitching, expert quotes, HARO responses, and guest contributions. The core of the EMOS playbook.",
    Shared: "Content distributed via social platforms — LinkedIn posts, Twitter threads, community shares. Amplifies earned wins.",
    Owned:  "Content published on your own properties — blog, newsletter, podcast. Full editorial control, permanent real estate.",
    Paid:   "Sponsored content, paid placements, native advertising. Used strategically to amplify earned coverage or fill gaps.",
  };

  return (
    <div>
      {/* 4-card PESO grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
        {pesoData.map((p, i) => {
          const earned = p.type === "Earned";
          return (
            <div key={p.type} style={{
              padding: "28px 20px",
              borderRight: i < 3 ? `1px solid ${INK}` : "none",
              background: earned ? INK : "transparent",
              color: earned ? PAPER : INK,
            }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 0.9, letterSpacing: "-0.04em", color: earned ? YEL : INK15, marginBottom: 16 }}>
                {p.type.charAt(0)}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, color: earned ? YEL : INK55 }}>
                {p.type}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: earned ? "rgba(241,235,222,.7)" : INK70, marginBottom: 20, minHeight: 65 }}>
                {descriptions[p.type]}
              </div>
              <div style={{ borderTop: earned ? "1px solid rgba(241,235,222,.2)" : `1px solid ${INK15}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {([["Pitches", p.total], ["Placed", p.placed], ["Points", p.points], ["Avg DR", p.avgDR || "—"]] as [string, number | string][]).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: earned ? "rgba(241,235,222,.5)" : INK55 }}>{label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: earned ? PAPER : INK }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion + Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}`, marginBottom: 32 }}>
        <div style={{ padding: "28px 24px", borderRight: `1px solid ${INK}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>
            OVERALL CONVERSION RATE
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }}>{convRate}%</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, marginTop: 6 }}>
            {totalPlaced} placed out of {totalPitches} total pitches
          </div>
        </div>
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>
            PESO DISTRIBUTION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pesoData.map(p => {
              const pct = totalPitches > 0 ? Math.round((p.total / totalPitches) * 100) : 0;
              return (
                <div key={p.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", width: 60, color: INK55 }}>{p.type}</span>
                  <div style={{ flex: 1, height: 12, background: INK15 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: p.type === "Earned" ? YEL : INK, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, width: 36, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts feed */}
      <SectionMast number="§ A" label="Alerts Feed" vol="GOOGLE ALERTS + MENTION" />
      <AlertsFeed />
    </div>
  );
}

function AlertsFeed() {
  const [filter, setFilter] = useState<AlertStatus | "all">("all");
  const filtered = filter === "all" ? ALERTS : ALERTS.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["all", "new", "reviewed", "archived"] as const).map(f => (
          <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}
            label={f === "all" ? `All (${ALERTS.length})` : `${f} (${ALERTS.filter(a => a.status === f).length})`}
          />
        ))}
      </div>
      <div style={{ border: `1px solid ${INK}` }}>
        {filtered.map((alert, idx) => (
          <div key={alert.id} style={{
            display: "grid", gridTemplateColumns: "80px 60px 1fr 100px",
            borderBottom: idx < filtered.length - 1 ? `1px solid ${INK15}` : "none",
            background: alert.status === "new" ? "oklch(97% .03 80 / .5)" : "transparent",
          }}>
            <div style={{ padding: "12px 14px", fontFamily: MONO, fontSize: 12 }}>{fmt(alert.date)}</div>
            <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              <AlertTypeBadge type={alert.type} />
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}` }}>
              <a href={alert.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>
                {alert.title}
              </a>
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}`, fontFamily: GROT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55, display: "flex", alignItems: "center" }}>
              {alert.source}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState message="No alerts matching this filter." />}
      </div>
    </div>
  );
}

// ── New Pitch Modal ────────────────────────────────────────────────────────────

interface PitchForm {
  subject: string; journalist: string; client: string;
  peso: PesoType; stage: Stage; team: string;
  dataSource: DataSource; notes: string;
}

const DATA_SOURCES: DataSource[] = ["Manual", "PressIQ", "SignalIQ", "Google Alerts"];
const TEAMS = ["Firestarters", "Nirvana", "Wizards"];

function NewPitchModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Pitch) => void }) {
  const [form, setForm] = useState<PitchForm>({
    subject: "", journalist: "", client: "", peso: "Earned",
    stage: "drafted", team: "", dataSource: "Manual", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof PitchForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: PAPER, border: `1px solid ${INK}`,
    fontFamily: SERIF, fontSize: 15, color: INK,
    outline: "none", boxSizing: "border-box",
  };

  if (submitted) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
        <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: 48, maxWidth: 480, textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 40, height: 40, background: YEL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 18 }}>✓</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Pitch logged</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55, marginBottom: 24 }}>
            &ldquo;{form.subject}&rdquo; saved to your pipeline.
          </div>
          {/* PressIQ cross-link nudge */}
          <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "14px 20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Before you send</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.5, marginBottom: 10 }}>
              Score your pitch in PressIQ to check clarity, relevance, and journalist fit — before hitting send.
            </div>
            <a
              href="/tools/pressiq"
              onClick={onClose}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
            >
              Score in PressIQ →
            </a>
          </div>
          <button onClick={onClose} style={{ padding: "12px 28px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, paddingTop: 60, overflowY: "auto" }} onClick={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        if (!form.subject.trim()) return;
        const newPitch: Pitch = {
          id: `u${Date.now()}`,
          subject: form.subject.trim(),
          journalist: form.journalist || null,
          client: form.client.trim() || "—",
          stage: form.stage,
          peso: form.peso,
          sentDate: form.stage !== "drafted" ? new Date().toISOString().split("T")[0] : null,
          placedDate: null,
          url: null,
          anchorText: null,
          dr: null,
          linkType: null,
          contentType: null,
          team: form.team || "",
          dataSource: form.dataSource,
          followUpDue: null,
          points: null,
        };
        onAdd(newPitch);
        setSubmitted(true);
      }}
        style={{ background: PAPER, border: `1px solid ${INK}`, width: "100%", maxWidth: 640, marginBottom: 60 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: INK, color: PAPER }}>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>New Pitch</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: PAPER, fontFamily: GROT, fontWeight: 900, fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <MField label="Pitch Subject">
            <input type="text" required value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g., Data study: 73% of earned links outperform paid" style={inp} />
          </MField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <MField label="Journalist">
              <select value={form.journalist} onChange={e => set("journalist", e.target.value)} style={inp}>
                <option value="">Select or leave blank</option>
                {JOURNALISTS.map(j => <option key={j.id} value={j.id}>{j.name} — {j.outlet}</option>)}
              </select>
            </MField>
            <MField label="Client">
              <input type="text" value={form.client} onChange={e => set("client", e.target.value)} placeholder="e.g., DMR.agency" style={inp} />
            </MField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <MField label="PESO Type">
              <select value={form.peso} onChange={e => set("peso", e.target.value as PesoType)} style={inp}>
                {(["Earned","Shared","Owned","Paid"] as PesoType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </MField>
            <MField label="Pipeline Stage">
              <select value={form.stage} onChange={e => set("stage", e.target.value as Stage)} style={inp}>
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </MField>
            <MField label="Team">
              <select value={form.team} onChange={e => set("team", e.target.value)} style={inp}>
                <option value="">Select team</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </MField>
          </div>

          <MField label="Data Source">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DATA_SOURCES.map(src => (
                <button key={src} type="button" onClick={() => set("dataSource", src)} style={{
                  padding: "7px 14px",
                  background: form.dataSource === src ? INK : "transparent",
                  color: form.dataSource === src ? PAPER : INK55,
                  border: `1px solid ${form.dataSource === src ? INK : INK35}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  {src}
                </button>
              ))}
            </div>
          </MField>

          <MField label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Any additional context, angles, or data points…" style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
          </MField>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>Pitch will be added to the pipeline</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${INK35}`, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ padding: "10px 20px", background: YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: "pointer" }}>Log Pitch →</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main CoverageIQ shell ──────────────────────────────────────────────────────

type TabId = "pipeline" | "followups" | "coverage" | "contacts" | "peso";

export default function CoverageIQ() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [showModal, setShowModal] = useState(false);
  // Ticker forces re-render when addPitchGlobal mutates the module-level PITCHES array
  const [, setTick] = useState(0);
  useEffect(() => {
    _rerenderCoverage = () => setTick(n => n + 1);
    return () => { _rerenderCoverage = null; };
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const followUpCount =
    PITCHES.filter(p => p.followUpDue && new Date(p.followUpDue) <= today).length +
    PITCHES.filter(p => !p.followUpDue && (p.stage === "sent" || p.stage === "opened") && p.sentDate && (today.getTime() - new Date(p.sentDate).getTime()) / 86400000 > 5).length;

  const tabs: { id: TabId; label: string; count: number | null; highlight?: boolean }[] = [
    { id: "pipeline",  label: "Pipeline",       count: PITCHES.length },
    { id: "followups", label: "Follow-ups",     count: followUpCount, highlight: followUpCount > 0 },
    { id: "coverage",  label: "Coverage Log",   count: PITCHES.filter(p => p.stage === "placed" || p.stage === "amplified").length },
    { id: "contacts",  label: "Contacts",       count: JOURNALISTS.length },
    { id: "peso",      label: "PESO Dashboard", count: null },
  ];

  const css = `
    .ciq-tab { transition: all 0.12s ease; }
    .ciq-tab:hover { opacity: 0.8; }
    .ciq-stage-btn { border: none !important; }
    @media (max-width: 700px) {
      .ciq-funnel { grid-template-columns: repeat(3, 1fr) !important; }
      .ciq-pipeline-table { font-size: 12px; }
    }
  `;

  const sectionMastProps: Record<TabId, { number: string; label: string; vol: string }> = {
    pipeline:  { number: "§ 01", label: "Pitch Pipeline",       vol: "DRAFTED → AMPLIFIED" },
    followups: { number: "§ 02", label: "Follow-ups",           vol: "ACTIONS + REMINDERS" },
    coverage:  { number: "§ 03", label: "Coverage Log",         vol: "PLACEMENTS + POINTS" },
    contacts:  { number: "§ 04", label: "Journalist Contacts",  vol: "RELATIONSHIP INDEX" },
    peso:      { number: "§ 05", label: "PESO Dashboard",       vol: "PAID · EARNED · SHARED · OWNED" },
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <ToolHeader
        toolPrefix="Coverage"
        subtitle="Pitch Tracking CRM · EMOS Tool Suite"
        rightContent={
          <>
            <a href="/tools/coverageiq/how-it-works" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none", whiteSpace: "nowrap" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%", display: "inline-block" }} />
              LIVE
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

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1240, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>
        <SectionMast {...sectionMastProps[activeTab]} />
        {activeTab === "pipeline"  && <PipelineView />}
        {activeTab === "followups" && <FollowUpsView />}
        {activeTab === "coverage"  && <CoverageLogView />}
        {activeTab === "contacts"  && <ContactsView />}
        {activeTab === "peso"      && <PESODashboard />}
      </main>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {showModal && <NewPitchModal onClose={() => setShowModal(false)} onAdd={addPitchGlobal} />}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <ToolPipelineFooter currentTool="coverageiq" />
    </div>
  );
}

"use client";

/**
 * JournoCollabIQ v2 — 5-Stage Journalist Beat-Matcher Wizard
 * Design: design_handoff_collabiq/README.md
 * Route: /tools/journocollabiq
 */

import { useState, useEffect, useReducer, useRef } from "react";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { EmailGateModal, EmosCTAStrip } from "@/components/tools/ToolCTAStrips";

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG0  = "#f1ebde";   // warm cream — matches tokens.PAPER
const BG1  = "#e8e0cc";   // warm cream 2 — matches tokens.PAPER2
const BG2  = "#FFFFFF";
const BD   = "rgba(26,20,16,0.15)";
const BDS  = "rgba(26,20,16,0.08)";
const TX   = "#1a1410";
const TX2  = "rgba(26,20,16,0.70)";
const TX3  = "rgba(26,20,16,0.45)";
const TX4  = "rgba(26,20,16,0.50)";
const ACC  = "#f5b81f";
const SUCC = "#2d8a4e";
const ERR  = "#c0392b";

// Cloudflare Turnstile site key (public). When unset, the widget is NOT rendered
// and generation works exactly as before. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (+
// the server TURNSTILE_SECRET_KEY) to enforce the human check end-to-end.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const INFO = "#3a7bd5";
const AMB2 = "#c4900a";

const LIGHT_T = { BG0, BG1, BG2, BG3: BG0, BD, BDS, TX, TX2, TX3, TX4 };

const SF = "var(--font-serif)";
const GF = "var(--font-grot)";
const MF = "var(--font-mono)";

const TC: Record<string, string>  = { A: ACC,  B: INFO,  C: TX3 };
const TBG: Record<string, string> = {
  A: "rgba(245,184,31,0.08)",
  B: "rgba(58,123,213,0.08)",
  C: "rgba(26,20,16,0.04)",
};

// ── Constants ──────────────────────────────────────────────────────────────────
const V2_INDUSTRIES = [
  "Automotive","Home & Real Estate","Finance & Insurance","Health & Wellness",
  "Travel & Hospitality","Fashion & Apparel","Food & Beverage","SaaS / Software",
  "E-commerce / Retail","Legal Services","Education / EdTech","Pet Care",
  "Wedding & Events","Fitness & Sports","Marketing / Agency",
];

const V2_STRATEGIES: Record<string, { label: string; brief: string; icon: string }> = {
  discount:    { label: "Expert Commentary",  brief: "Offer a quotable expert take for a story they're already writing. The classic reactive source pitch.", icon: "01" },
  institution: { label: "Exclusive Data",     brief: "Offer original data or research as an exclusive or embargo. The path to Tier-1 features.", icon: "02" },
  badge:       { label: "Trend Reaction",     brief: "Offer a timely reaction tied to a breaking trend or news hook. Newsjacking, done right.", icon: "03" },
};

const V2_SCORECARD = [
  { q: "Do they cover this beat?",                           sub: "Is this squarely in the topics they write about?" },
  { q: "Have they written about it recently?",               sub: "A relevant article in the last few months." },
  { q: "Does the outlet have real authority?",               sub: "Reach and domain strength (check the outlet)." },
  { q: "Is your angle genuinely newsworthy to them?",        sub: "A story their readers need — not an ad." },
  { q: "Can you offer something specific?",                  sub: "Expert take, exclusive data, or a timely hook." },
  { q: "Are they open to pitches?",                          sub: "Some reporters say how to pitch them." },
  { q: "Can you find a public contact?",                     sub: "X handle or section desk, not a guessed email." },
  { q: "Is the outlet brand-safe for you?",                  sub: "You'll be associated with it." },
];

const V2_LOADING = [
  { h: "Scanning coverage on your beat…",                    s: "Finding who's writing about this topic now." },
  { h: "Matching reporters to your story…",                  s: "Ranking by beat fit and recent coverage." },
  { h: "Checking outlet authority & reach…",                 s: "Only surfacing journalists worth your time." },
  { h: "Profiling how to reach them…",                       s: "Handles and section desks — verified emails coming soon." },
  { h: "Almost there.",                                      s: "Compiling a media list that would take an agency a week." },
];

// Elapsed-time counter, matching the pattern rolled out to PressIQ/SignalIQ.
// A standalone component so it resets naturally each time it mounts (i.e. each
// time a fresh loading run starts), with no manual reset call needed. The
// "typically 30-60s" estimate reuses PressIQ's observed range as a placeholder
// (Irfan's call, 08 Jul) since JournoCollabIQ's own research time hasn't been
// separately measured yet. Revisit once it has.
function ElapsedSecs() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{secs}</>;
}

// Fallback mock journalists — only shown if the API key is missing or Claude returns invalid JSON.
// These are plausible beat reporters used for UI demonstration only.
// Verify names, outlets, and contacts before any real outreach.
const V2_MOCK: Record<string, AiPartner[]> = {
  "SaaS / Software": [
    { name:"Kyle Wiggers",    url:"techcrunch.com",   why:"Covers AI, developer tools, and enterprise SaaS at TechCrunch. Regularly features founder commentary on product trends and funding rounds.",           linkPage:"techcrunch.com/author/kyle-wiggers/",        contact:"@kyle_l_wiggers",  seoNote:"DA 94 · Tier 1 · Very high reach",  tier:"A" },
    { name:"Janko Roettgers", url:"theverge.com",     why:"Tech and media reporter at The Verge with a focus on software platforms, streaming, and creator tools. Good fit for B2C SaaS stories.",              linkPage:"theverge.com/authors/janko-roettgers",       contact:"@jankoroettgers", seoNote:"DA 93 · Tier 1 · Very high reach",  tier:"A" },
    { name:"Ron Miller",      url:"techcrunch.com",   why:"Enterprise software and cloud infrastructure reporter at TechCrunch. Actively covers SaaS funding, acquisitions, and founder interviews.",           linkPage:"techcrunch.com/author/ron-miller/",          contact:"@ron_miller",      seoNote:"DA 94 · Tier 1 · Enterprise focus", tier:"A" },
    { name:"Ingrid Lunden",   url:"techcrunch.com",   why:"Covers startup funding, B2B SaaS, and tech M&A at TechCrunch. Strong track record of exclusive data-led scoops.",                                   linkPage:"techcrunch.com/author/ingrid-lunden/",       contact:"@ingridlunden",    seoNote:"DA 94 · Tier 1 · Funding/data beat",tier:"B" },
    { name:"Haje Jan Kamps",  url:"techcrunch.com",   why:"Startup and product reporter covering early-stage SaaS companies and founder stories. Good fit for exclusive data or expert commentary pitches.",     linkPage:"techcrunch.com/author/haje-jan-kamps/",      contact:"@Haje",            seoNote:"DA 94 · Tier 1 · Startup focus",    tier:"B" },
    { name:"Frederic Lardinois",url:"techcrunch.com", why:"Developer tools and open-source software reporter at TechCrunch. Covers APIs, dev platforms, and infrastructure — ideal for technical SaaS stories.", linkPage:"techcrunch.com/author/frederic-lardinois/",  contact:"@fredericl",       seoNote:"DA 94 · Tier 1 · Dev tools beat",   tier:"C" },
  ],
  "Health & Wellness": [
    { name:"Kristen V. Brown",url:"bloomberg.com",    why:"Health and science reporter at Bloomberg covering wellness trends, FDA policy, and consumer health brands. Strong reach for data-led health stories.",  linkPage:"bloomberg.com/authors/kristen-v-brown",     contact:"@kvb",             seoNote:"DA 95 · Tier 1 · National health",  tier:"A" },
    { name:"Amanda Mull",     url:"theatlantic.com",  why:"Consumer culture and health writer at The Atlantic. Covers wellness industry trends, fitness culture, and health behaviour — great for trend reactions.",linkPage:"theatlantic.com/author/amanda-mull/",        contact:"@amandamull",      seoNote:"DA 92 · Tier 1 · Wellness culture", tier:"A" },
    { name:"Christina Jewett",url:"nytimes.com",      why:"Health reporter at The New York Times covering consumer wellness, medical devices, and health-tech. Responds well to exclusive data pitches.",          linkPage:"nytimes.com/by/christina-jewett",           contact:"@by_cjewett",      seoNote:"DA 95 · Tier 1 · National health",  tier:"A" },
    { name:"Tara Parker-Pope", url:"nytimes.com",     why:"Founder of NYT Well section covering fitness, nutrition, and mental wellness. Expert commentary and research-backed angles land well with her.",        linkPage:"nytimes.com/by/tara-parker-pope",           contact:"@taraparkerpope",  seoNote:"DA 95 · Tier 1 · Well/wellness",    tier:"B" },
    { name:"Markham Heid",    url:"time.com",         why:"Health and science writer at TIME covering fitness, longevity, and nutrition research. Good fit for data-backed expert commentary.",                    linkPage:"time.com/author/markham-heid/",             contact:"@MarkhamHeid",     seoNote:"DA 93 · Tier 1 · Health/science",   tier:"B" },
    { name:"Dani Blum",       url:"nytimes.com",      why:"Health reporter at NYT Well covering mental wellness, fitness trends, and consumer health. Engages with trend-reaction and data pitches.",              linkPage:"nytimes.com/by/dani-blum",                  contact:"@daniblum44",      seoNote:"DA 95 · Tier 1 · Well/wellness",    tier:"C" },
  ],
};
// Generic fallback when no industry match exists. Verify before any real outreach.
const V2_GENERIC: AiPartner[] = [
  { name:"Reporter A",  url:"techcrunch.com",  why:"Covers startup and industry stories at a major tech publication. Suitable for funding, product, or data-driven pitches.",          linkPage:"techcrunch.com",           contact:"Verify via Muck Rack",  seoNote:"DA 94 · Tier 1",  tier:"A" },
  { name:"Reporter B",  url:"forbes.com",      why:"Industry trends and business reporter. Good fit for expert commentary and executive perspectives on sector news.",                  linkPage:"forbes.com",               contact:"Verify via Muck Rack",  seoNote:"DA 95 · Tier 1",  tier:"A" },
  { name:"Reporter C",  url:"inc.com",         why:"Covers entrepreneurship, growth, and SMB stories. Responds well to founder-led expert commentary angles.",                         linkPage:"inc.com",                  contact:"Verify via Muck Rack",  seoNote:"DA 92 · Tier 1",  tier:"B" },
  { name:"Reporter D",  url:"fastcompany.com", why:"Innovation and business culture reporter. Good for trend-reaction pitches tied to workplace or consumer behaviour shifts.",         linkPage:"fastcompany.com",          contact:"Verify via Muck Rack",  seoNote:"DA 92 · Tier 1",  tier:"B" },
  { name:"Reporter E",  url:"entrepreneur.com",why:"Covers startups and small business growth. Expert commentary on your industry's challenges or opportunities lands well here.",      linkPage:"entrepreneur.com",         contact:"Verify via Muck Rack",  seoNote:"DA 91 · Tier 2",  tier:"C" },
  { name:"Reporter F",  url:"businessinsider.com",why:"Broad business and consumer tech coverage. Exclusive data or research with a clear news hook is a strong entry point.",         linkPage:"businessinsider.com",      contact:"Verify via Muck Rack",  seoNote:"DA 93 · Tier 1",  tier:"C" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
type Strategy = "discount" | "institution" | "badge";

interface AiPartner {
  name: string; url: string; why: string;
  linkPage: string; contact: string; contactLinkedIn?: string; seoNote: string;
  tier: "A" | "B" | "C";
}

interface CollabState {
  biz: string; domain: string; desc: string;
  industry: string; customInd: string;
  strategy: Strategy;
  audType: string; geo: string; audDesc: string;
  selNiches: string[];
  scPartner: string; scCat: string;
  scores: Record<number, number>;
  step: number;
}

type Action =
  | { type: "SET"; key: keyof CollabState; val: string }
  | { type: "SET_INDUSTRY"; val: string }
  | { type: "SET_CUSTOM_IND"; val: string }
  | { type: "SET_SCORE"; idx: number; val: number }
  | { type: "TOGGLE_NICHE"; val: string }
  | { type: "SET_NICHES"; val: string[] }
  | { type: "SCORE_PARTNER"; name: string; cat: string }
  | { type: "GO"; step: number };

// ── State ──────────────────────────────────────────────────────────────────────
// NOTE: keys were "collabiq_v2_*" (copied when this tool was forked from
// PartnerCollabIQ), so the two tools silently shared persisted form state —
// business names typed into one showed up "pre-filled" in the other
// (2026-07 QA finding). Own keys now; PartnerCollabIQ keeps the old ones.
const V2_STORE = "journocollabiq_v1_state";

function initState(): CollabState {
  // Always start blank — do not rehydrate form fields from a previous
  // session's localStorage. Old business/industry/desc text was showing up
  // as "stale data" on fresh visits (2026-07 QA finding).
  return { biz:"",domain:"",desc:"",industry:"",customInd:"",strategy:"discount",
    audType:"",geo:"",audDesc:"",selNiches:[],scPartner:"",scCat:"",scores:{},step:1 };
}

function reducer(state: CollabState, action: Action): CollabState {
  switch (action.type) {
    case "SET": return { ...state, [action.key]: action.val };
    case "SET_INDUSTRY": return { ...state, industry: action.val, customInd: "", selNiches: [] };
    case "SET_CUSTOM_IND": return { ...state, customInd: action.val, industry: action.val ? "" : state.industry, selNiches: [] };
    case "SET_SCORE": return { ...state, scores: { ...state.scores, [action.idx]: action.val } };
    case "TOGGLE_NICHE": { const has = state.selNiches.includes(action.val); return { ...state, selNiches: has ? state.selNiches.filter(x => x !== action.val) : [...state.selNiches, action.val] }; }
    case "SET_NICHES": return { ...state, selNiches: action.val };
    case "SCORE_PARTNER": return { ...state, scPartner: action.name, scCat: action.cat, step: 4 };
    case "GO": return { ...state, step: action.step };
    default: return state;
  }
}

// ── Style helpers ──────────────────────────────────────────────────────────────
function lbl(color?: string): React.CSSProperties {
  return { fontFamily: MF, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: color || TX3, display: "block", marginBottom: 10 };
}
function inp(extra?: React.CSSProperties): React.CSSProperties {
  return { width: "100%", padding: "14px 0 12px", background: "transparent",
    border: "none", borderBottom: `1px solid ${BD}`, fontFamily: GF,
    fontSize: 15, color: TX, outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", ...extra };
}
function primaryBtn(): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 28px", cursor: "pointer", fontFamily: GF, fontSize: 12,
    fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
    transition: "all 0.15s", border: "none", borderRadius: 0,
    // a11y: near-black ink on amber (~10:1). Cream/white on amber failed WCAG AA.
    background: ACC, color: TX };
}
function ghostBtn(): React.CSSProperties {
  return { ...primaryBtn(), background: "transparent", color: TX2, border: `1px solid ${BD}` };
}

// ── Global CSS ─────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  .v2-stage-animate{animation:v2fadeup .4s ease both}
  @keyframes v2fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .v2-shimmer{background:linear-gradient(90deg,rgba(26,20,16,.06) 25%,rgba(26,20,16,.10) 50%,rgba(26,20,16,.06) 75%);background-size:200% 100%;animation:v2shim 1.4s infinite}
  @keyframes v2shim{from{background-position:200% 0}to{background-position:-200% 0}}
  @keyframes v2-fade{from{opacity:0}to{opacity:1}}
  .v2-spin{animation:v2spin .7s linear infinite}
  @keyframes v2spin{to{transform:rotate(360deg)}}
  .v2-unlock{animation:v2unlock 1.4s ease}
  @keyframes v2unlock{0%{box-shadow:0 0 0 0 rgba(245,184,31,.6)}60%{box-shadow:0 0 0 8px rgba(245,184,31,0)}100%{box-shadow:0 0 0 0 rgba(245,184,31,0)}}
  .v2-step-label{display:block}
  @media(max-width:600px){.v2-step-label{display:none!important}.v2-meta-grid{grid-template-columns:1fr!important}.v2-footer-stepcount{display:none!important}}
  .v2-collabiq *{box-sizing:border-box}
  .v2-collabiq input,.v2-collabiq textarea,.v2-collabiq select{font-family:var(--font-grot),sans-serif}
  .v2-contact-tip:hover .v2-tooltip{display:block!important}
  .v2-tooltip::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1c1a16}
`;

// ── Stage Wrapper ──────────────────────────────────────────────────────────────
function StageWrapper({ title, subtitle, heroExtra, children }: { title: string; subtitle?: string; heroExtra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="v2-stage-animate" style={{ width: "100%", maxWidth: 680, padding: "0 24px" }}>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, color: TX, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 16 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: GF, fontSize: 15, color: TX2, lineHeight: 1.6, marginBottom: heroExtra ? 18 : 40, marginTop: 0 }}>{subtitle}</p>}
        {heroExtra}
        {children}
      </div>
    </div>
  );
}

// ── Stage 1: Business ──────────────────────────────────────────────────────────
function Stage1({ state, dispatch }: { state: CollabState; dispatch: React.Dispatch<Action> }) {
  const { biz, domain, desc, industry, customInd } = state;
  return (
    <StageWrapper
      title="Find the journalists who'll actually cover this."
      subtitle="JournoCollabIQ surfaces the reporters who cover your beat, grounded in their recent work, then gives you the angle, a media list, and a targeting brief to land the story."
      heroExtra={
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
          <a href="/tools/journocollabiq/how-it-works" target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn(), padding: "10px 18px", fontSize: 11, textDecoration: "none" }}>
            See a worked example →
          </a>
          <span style={{ fontFamily: MF, fontSize: 10, fontWeight: 700, color: TX3, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            8 fit criteria · 5 stages · 3 tiers
          </span>
        </div>
      }
    >
      <div style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 28 }}>
          <label style={lbl(TX2)}>Business name *</label>
          <input style={inp()} placeholder="e.g. Fairground" value={biz} autoFocus
            onChange={e => dispatch({ type: "SET", key: "biz", val: e.target.value })}
            onPaste={e => setTimeout(() => dispatch({ type: "SET", key: "biz", val: (e.target as HTMLInputElement).value }), 0)}
            onBlur={e => dispatch({ type: "SET", key: "biz", val: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div>
            <label style={lbl(TX3)}>Website</label>
            <input style={inp()} placeholder="e.g. fairground.example.com" value={domain}
              onChange={e => dispatch({ type: "SET", key: "domain", val: e.target.value })} />
          </div>
          <div>
            <label style={lbl(TX3)}>One-line description</label>
            <input style={inp()} placeholder="What you do in one sentence" value={desc}
              onChange={e => dispatch({ type: "SET", key: "desc", val: e.target.value })} />
          </div>
        </div>
      </div>
      <div>
        <label style={lbl(TX2)}>Your industry</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8, marginBottom: 16 }}>
          {V2_INDUSTRIES.map(ind => {
            const sel = industry === ind && !customInd;
            return (
              <button key={ind} onClick={() => dispatch({ type: "SET_INDUSTRY", val: ind })}
                style={{ padding: "14px 16px", background: sel ? "rgba(245,184,31,0.08)" : BG2,
                  border: `1px solid ${sel ? ACC : BD}`, fontFamily: GF, fontSize: 13,
                  fontWeight: sel ? 700 : 400, color: sel ? ACC : TX2,
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s", borderRadius: 0 }}>
                {ind}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <span style={{ fontFamily: MF, fontSize: 9, color: TX4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Or</span>
          <input style={{ ...inp(), flex: 1 }} placeholder="Type a custom industry…" value={customInd}
            onChange={e => dispatch({ type: "SET_CUSTOM_IND", val: e.target.value })} />
        </div>
      </div>
    </StageWrapper>
  );
}

// ── Stage 2: Strategy ──────────────────────────────────────────────────────────
function Stage2({ state, dispatch }: { state: CollabState; dispatch: React.Dispatch<Action> }) {
  const { strategy, audType, geo, audDesc } = state;
  return (
    <StageWrapper title="What are you offering the journalist?" subtitle="Each angle lands differently. Pick the offer that fits your story, then tell us about the beat and your target tier.">
      <div style={{ marginBottom: 48 }}>
        <label style={lbl(TX2)}>What are you offering the journalist?</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {(["discount","institution","badge"] as Strategy[]).map(s => {
            const sel  = strategy === s;
            const info = V2_STRATEGIES[s];
            return (
              <button key={s} onClick={() => dispatch({ type: "SET", key: "strategy", val: s })}
                style={{ padding: "22px 24px", background: sel ? "rgba(245,184,31,0.06)" : BG2,
                  border: `1px solid ${sel ? ACC : BD}`, cursor: "pointer", textAlign: "left",
                  display: "flex", gap: 20, alignItems: "flex-start", transition: "all 0.15s", borderRadius: 0 }}>
                <span style={{ fontFamily: MF, fontSize: 32, fontWeight: 700, lineHeight: 1, color: sel ? TX : TX4, flexShrink: 0, width: 52 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SF, fontSize: 18, fontWeight: 700, color: sel ? TX : TX2, marginBottom: 4, letterSpacing: "-0.01em" }}>{info.label}</div>
                  <div style={{ fontFamily: GF, fontSize: 13, color: TX3, lineHeight: 1.5 }}>{info.brief}</div>
                </div>
                {sel && <span style={{ width: 22, height: 22, background: ACC, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: TX, flexShrink: 0 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={lbl(TX2)}>Your audience</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ ...lbl(TX4), fontSize: 9 }}>Type</label>
            <select style={inp()} value={audType} onChange={e => dispatch({ type: "SET", key: "audType", val: e.target.value })}>
              <option value="">Select…</option>
              {["B2C Consumers","B2B Small Businesses","B2B Mid-Market / Enterprise","Both B2B and B2C"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...lbl(TX4), fontSize: 9 }}>Geography</label>
            <select style={inp()} value={geo} onChange={e => dispatch({ type: "SET", key: "geo", val: e.target.value })}>
              <option value="">Select…</option>
              {["Global","United Kingdom","United States","North America","Europe","Australia / NZ","Asia-Pacific"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ ...lbl(TX4), fontSize: 9 }}>Describe your ideal customer (optional)</label>
          <textarea style={{ ...inp(), resize: "vertical", minHeight: 60 }} placeholder="Who buys from you? What problem do they have?"
            value={audDesc} onChange={e => dispatch({ type: "SET", key: "audDesc", val: e.target.value })} />
        </div>
      </div>
    </StageWrapper>
  );
}

// ── Stage 3: Partners ──────────────────────────────────────────────────────────
function Stage3({ partners, loading, loadingIdx, industry, strategy, biz, selNiches, onToggle, onScore, onGatedCsv, error, onRetry }: {
  partners: AiPartner[]; loading: boolean; loadingIdx: number;
  industry: string; strategy: string; biz: string;
  selNiches: string[];
  onToggle: (n: string) => void;
  onScore:  (n: string, c: string) => void;
  onGatedCsv: () => void;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    const msg = V2_LOADING[loadingIdx % V2_LOADING.length];
    return (
      <StageWrapper title="Finding your journalists…" subtitle="JournoCollabIQ is matching your beat and angle to the reporters covering it.">
        <div style={{ background: BG2, border: `1px solid ${BD}`, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: MF, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,184,31,0.6)" }}>JournoCollabIQ · Live Research</span>
            <span style={{ fontFamily: MF, fontSize: 9, color: TX4 }}><ElapsedSecs />s elapsed (typically 30-60s) · Step {(loadingIdx % V2_LOADING.length) + 1}/{V2_LOADING.length}</span>
          </div>
          <div className="v2-stage-animate">
            <div style={{ fontFamily: SF, fontSize: 20, fontWeight: 700, color: TX, marginBottom: 6 }}>{msg.h}</div>
            <div style={{ fontFamily: GF, fontSize: 14, color: TX3 }}>{msg.s}</div>
          </div>
          <div style={{ marginTop: 20, height: 3, background: BDS }}>
            <div style={{ height: "100%", background: ACC, width: `${((loadingIdx % V2_LOADING.length) + 1) / V2_LOADING.length * 100}%`, transition: "width 0.5s" }} />
          </div>
        </div>
        {[90,75,60].map((w,i) => (
          <div key={i} style={{ padding: "18px 0", borderBottom: `1px solid ${BDS}`, opacity: 1 - i * 0.25 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <div className="v2-shimmer" style={{ width: 28, height: 12 }} />
              <div className="v2-shimmer" style={{ width: `${w}%`, height: 18 }} />
            </div>
            <div className="v2-shimmer" style={{ width: "100%", height: 10, marginBottom: 4 }} />
            <div className="v2-shimmer" style={{ width: "70%", height: 10 }} />
          </div>
        ))}
      </StageWrapper>
    );
  }

  // H6 (2026-07-02 review): real error state instead of silently substituting
  // mock journalists (real named reporters, some no longer at those outlets)
  // labelled as live, personalised AI matches.
  if (error) {
    return (
      <StageWrapper title="The research didn't come back." subtitle="No sample journalists have been substituted — retry to get live matches personalised to your story.">
        <div style={{ border: `1px solid ${ERR}`, background: "rgba(192,57,43,0.06)", padding: "22px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: GF, fontSize: 14, color: TX, margin: "0 0 16px", lineHeight: 1.6 }}>{error}</p>
          <button onClick={onRetry} style={{ ...primaryBtn(), justifyContent: "center" }}>↻ Try again</button>
        </div>
      </StageWrapper>
    );
  }

  const strat    = V2_STRATEGIES[strategy] || V2_STRATEGIES.discount;
  const selCount = selNiches.length;

  return (
    <StageWrapper title="Your journalist shortlist." subtitle={`${partners.length} journalists found for ${industry} using ${strat.label}. Select the ones you want in your media brief.`}>
      <div style={{ background: "rgba(245,184,31,0.06)", border: `1px solid rgba(245,184,31,0.2)`, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ background: ACC, fontFamily: MF, fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", color: TX, flexShrink: 0 }}>AI</span>
        <span style={{ fontFamily: GF, fontSize: 12, color: TX2 }}>Each journalist is scored by JournoCollabIQ against 8 fit criteria: beat match, recent relevant coverage, publication authority, audience fit, responsiveness, exclusivity fit, contact findability, and brand-safety fit.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${BD}`, marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MF, fontSize: 10, color: TX3, letterSpacing: "0.1em" }}>Generated by JournoCollabIQ · Personalised to {biz}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {selCount > 0 && <span style={{ fontFamily: MF, fontSize: 10, fontWeight: 700, color: TX, letterSpacing: "0.1em" }}>{selCount} selected</span>}
          <button onClick={onGatedCsv} style={{ ...ghostBtn(), fontSize: 9, padding: "6px 12px" }}>↓ Download list (CSV)</button>
        </div>
      </div>
      {partners.map((p, i) => {
        const sel = selNiches.includes(p.name);
        const tc  = TC[p.tier] || TX3;
        const tbg = TBG[p.tier] || "transparent";
        return (
          <div key={i} style={{ borderBottom: `1px solid ${BDS}`, padding: "22px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => onToggle(p.name)} aria-label={sel ? `Deselect ${p.name}` : `Select ${p.name}`}
                  style={{ width: 22, height: 22, border: `2px solid ${sel ? SUCC : BD}`,
                    background: sel ? SUCC : "transparent", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", flexShrink: 0,
                    fontSize: 12, color: sel ? "#fff" : "transparent", fontWeight: 700, borderRadius: 0 }}>✓</button>
                <div>
                  <div style={{ fontFamily: SF, fontSize: 18, fontWeight: 700, color: TX, letterSpacing: "-0.01em" }}>{p.name}</div>
                  <span style={{ fontFamily: MF, fontSize: 9, color: TX4, letterSpacing: "0.04em" }}>{p.url}</span>
                </div>
              </div>
              <span style={{ background: tbg, color: tc, border: `1px solid ${tc}`, fontFamily: MF, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", flexShrink: 0 }}>Tier {p.tier}</span>
            </div>
            <div style={{ background: BG2, borderLeft: `3px solid ${tc}`, padding: "12px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.65, margin: 0, fontFamily: GF }}>{p.why}</p>
            </div>
            <div className="v2-meta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", marginBottom: 12 }}>
              <div><span style={{ ...lbl(TX4), fontSize: 8, marginBottom: 4 }}>Recent article</span>{p.linkPage ? <a href={p.linkPage.startsWith("http") ? p.linkPage : `https://${p.linkPage}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: INFO, fontWeight: 600, fontFamily: GF, textDecoration: "none" }}>{p.linkPage.replace(/^https?:\/\//, "")} ↗</a> : <span style={{ fontSize: 12, color: INFO, fontWeight: 600, fontFamily: GF }}>—</span>}</div>
              <div>
                <span style={{ ...lbl(TX4), fontSize: 8, marginBottom: 4 }}>Contact</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: TX2, fontFamily: GF }}>{p.contact}</span>
                  <span className="v2-contact-tip" style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help" }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(196,144,10,0.15)", border: `1px solid ${AMB2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: MF, fontSize: 8, fontWeight: 700, color: AMB2, lineHeight: 1, flexShrink: 0 }}>!</span>
                    <span className="v2-tooltip" style={{
                      display: "none", position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                      background: "#1c1a16", border: `1px solid ${AMB2}`, padding: "10px 12px", width: 220, zIndex: 99,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
                    }}>
                      <div style={{ fontFamily: GF, fontSize: 11, color: "#f1ebde", lineHeight: 1.55, marginBottom: 6 }}>
                        Contact data is AI-suggested from training knowledge. Not verified in real time. Names and LinkedIn URLs may be outdated or inaccurate. Always verify before outreach.
                      </div>
                      <div style={{ fontFamily: MF, fontSize: 9, color: AMB2, letterSpacing: "0.04em" }}>
                        ✦ Verified real-time contacts coming soon
                      </div>
                    </span>
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>
                  {p.contactLinkedIn ? (
                    <a href={`https://${p.contactLinkedIn.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: MF, fontSize: 8, color: INFO, textDecoration: "none", letterSpacing: "0.04em" }}>View LinkedIn profile ↗</a>
                  ) : (
                    <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.contact + " " + p.name)}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: MF, fontSize: 8, color: INFO, textDecoration: "none", letterSpacing: "0.04em" }}>Search LinkedIn ↗</a>
                  )}
                </div>
              </div>
              <div><span style={{ ...lbl(TX4), fontSize: 8, marginBottom: 4 }}>Authority</span><span style={{ fontSize: 12, color: AMB2, fontWeight: 600, fontFamily: GF }}>{p.seoNote}</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onToggle(p.name)} style={{ ...(sel ? primaryBtn() : ghostBtn()), fontSize: 9, padding: "7px 14px" }}>{sel ? "Selected ✓" : "Select for brief"}</button>
            </div>
          </div>
        );
      })}
      <div style={{ padding: "16px 0", display: "flex", gap: 14, flexWrap: "wrap" }}>
        {([["A","Highest priority",TC.A],["B","Strong candidate",TC.B],["C","Good to include",TC.C]] as [string,string,string][]).map(([t,l,c]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: c, border: `1px solid ${c}`, fontFamily: MF, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px" }}>Tier {t}</span>
            <span style={{ fontFamily: MF, fontSize: 9, color: TX4 }}>{l}</span>
          </div>
        ))}
      </div>
    </StageWrapper>
  );
}

// ── Stage 4: Outreach ─────────────────────────────────────────────────────────
function Stage4({ state, dispatch, partners, onGated, aiEmail, aiEmailLoading }: {
  state: CollabState; dispatch: React.Dispatch<Action>;
  partners: AiPartner[];
  onGated: (action: string) => void;
  aiEmail: string; aiEmailLoading: boolean;
}) {
  const { strategy, biz, domain, desc } = state;
  const strat = V2_STRATEGIES[strategy] || V2_STRATEGIES.discount;

  const templates: Record<Strategy, string> = {
    discount:    `Subject: Expert source for your [TOPIC] story?\n\nHi [FIRST NAME],\n\nI've been following your coverage of [BEAT/TOPIC] — your recent piece on [ARTICLE TITLE] was spot-on.\n\nI'm [YOUR NAME], [TITLE] at ${biz||"[BRAND]"} (${domain||"[WEBSITE]"}). We ${desc||"[DESCRIPTION]"}.\n\nI can offer a quotable expert take on [SPECIFIC ANGLE]. Happy to provide on-record commentary, background stats, or a quick on-the-record call — whatever format works for you.\n\nAny interest?\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
    institution: `Subject: Exclusive data for your [TOPIC] coverage — embargo available\n\nHi [FIRST NAME],\n\nI've followed your [BEAT] reporting closely — your work on [RECENT ARTICLE] stood out.\n\nI'm [YOUR NAME] from ${biz||"[BRAND]"} (${domain||"[WEBSITE]"}). We ${desc||"[DESCRIPTION]"}.\n\nWe've just completed original research on [TOPIC]: [KEY FINDING]. The data hasn't been published anywhere.\n\nOffering you first look — happy to embargo to fit your schedule, share the full dataset, and arrange a briefing with our [EXPERT TITLE].\n\nInterested in an exclusive?\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
    badge:       `Subject: [TRENDING TOPIC] angle — quick reaction on record?\n\nHi [FIRST NAME],\n\nWith [TRENDING NEWS/EVENT] dominating the conversation, I thought you might want a quick expert reaction for your [BEAT] coverage.\n\nI'm [YOUR NAME], [TITLE] at ${biz||"[BRAND]"} (${domain||"[WEBSITE]"}). We ${desc||"[DESCRIPTION]"}.\n\nMy take: [1-2 SENTENCE HOOK TIE TO TREND]. Happy to go on record — short quote, longer call, or written response, whatever your deadline needs.\n\nWorth a quick chat?\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
  };

  return (
    <StageWrapper title="Your angle." subtitle="Pick a journalist, then let AI draft a tailored angle. Score the final pitch in PressIQ before you send.">
      {/* Journalist picker */}
      <div style={{ marginBottom: 32 }}>
        <label style={lbl(TX2)}>Who are you pitching?</label>
        <select style={inp()} value={state.scPartner} onChange={e => dispatch({ type: "SET", key: "scPartner", val: e.target.value })}>
          <option value="">Select a journalist…</option>
          {partners.map(p => <option key={p.name} value={p.name}>{p.name} (Tier {p.tier}) · {p.url}</option>)}
        </select>
      </div>

      {/* Template */}
      <div style={{ marginBottom: 32 }}>
        <label style={lbl(TX2)}>{strat.label} outreach template</label>
        <pre id="v2-tpl" style={{ background:BG2, border:`1px solid ${BD}`, borderLeft:`3px solid ${ACC}`, padding:20, fontSize:13, fontFamily:GF, lineHeight:1.8, whiteSpace:"pre-wrap", color:TX2, marginBottom:10, overflowX:"auto" }}>
          {templates[strategy as Strategy]}
        </pre>
        <button onClick={()=>{ const el=document.getElementById("v2-tpl"); if(el) navigator.clipboard.writeText(el.textContent||""); }}
          style={{ ...ghostBtn(), fontSize:9, padding:"8px 14px" }}>Copy template</button>
      </div>

      {/* AI email */}
      <div style={{ borderTop:`1px solid ${BD}`, paddingTop:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ background:ACC, fontFamily:MF, fontSize:8, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 8px", color:TX }}>AI</span>
          <span style={{ fontFamily:SF, fontSize:18, fontWeight:700, color:TX, letterSpacing:"-0.01em" }}>Tailored angle</span>
        </div>
        <p style={{ fontSize:14, color:TX3, marginBottom:20, fontFamily:GF, lineHeight:1.6 }}>
          JournoCollabIQ drafts a tailored angle for your chosen journalist — built on their beat and recent work. Score the final pitch in PressIQ before you send.
        </p>
        <button onClick={()=>onGated("email")} disabled={aiEmailLoading||!biz||!state.scPartner}
          style={{ ...primaryBtn(), opacity:(!biz||aiEmailLoading||!state.scPartner)?0.4:1, cursor:(!biz||!state.scPartner)?"not-allowed":"pointer", fontSize:13, padding:"14px 28px" }}>
          {aiEmailLoading ? "Writing…" : state.scPartner ? `Write email for ${state.scPartner} →` : "Select a partner above first"}
        </button>
        {aiEmail && (
          <div style={{ marginTop:24 }}>
            <pre style={{ background:BG2, border:`1px solid ${BD}`, borderLeft:`3px solid ${ACC}`, padding:20, fontSize:13, lineHeight:1.8, color:TX2, whiteSpace:"pre-wrap", fontFamily:GF }}>
              {aiEmail}
            </pre>
            <button onClick={()=>navigator.clipboard.writeText(aiEmail)}
              style={{ ...ghostBtn(), fontSize:9, padding:"8px 14px", marginTop:10 }}>Copy email</button>
          </div>
        )}
      </div>
    </StageWrapper>
  );
}

// ── Stage 5: 90-Day Playbook ───────────────────────────────────────────────────
function Stage5({ state, onGated, aiBrief, aiBriefLoading, pdfLoading, pdfDone }: {
  state: CollabState;
  onGated: (action: string) => void;
  aiBrief: string; aiBriefLoading: boolean;
  pdfLoading: boolean; pdfDone: boolean;
}) {
  const { biz, domain, strategy, industry, customInd, selNiches, audType, geo } = state;
  const ind   = customInd || industry;
  const strat = V2_STRATEGIES[strategy] || V2_STRATEGIES.discount;

  const [justUnlocked, setJustUnlocked] = useState(false);
  const downloadBtnRef = useRef<HTMLButtonElement | null>(null);
  // Seed with the current aiBrief value (not false) so re-mounting this stage with
  // a brief already generated (e.g. navigating back to stage 4 and forward again)
  // doesn't re-fire the "just unlocked" scroll — that should only fire the moment
  // the brief actually finishes generating during this mount's lifetime.
  const prevAiBrief = useRef(!!aiBrief);
  useEffect(() => {
    if (aiBrief && !prevAiBrief.current) {
      setJustUnlocked(true);
      downloadBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(() => setJustUnlocked(false), 1500);
      prevAiBrief.current = true;
      return () => clearTimeout(t);
    }
    prevAiBrief.current = !!aiBrief;
  }, [aiBrief]);

  // Always land at the top of this stage on mount, so the heading is visible
  // instead of wherever the viewport happened to be scrolled on the previous stage.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <StageWrapper title="Your media targeting brief." subtitle="Generate your tiered journalist list, outreach sequence, and per-journalist angles. Download or copy it when you're done. Scroll down for your downloadable PDF playbook.">

      {/* Campaign at a glance */}
      <div style={{ background:BG2, border:`1px solid ${BD}`, padding:24, marginBottom:32 }}>
        <span style={{ ...lbl(TX4), marginBottom:16 }}>Campaign at a glance</span>
        {([["Business",biz],["Website",domain],["Industry",ind],["Strategy",strat.label],["Audience type",audType],["Geography",geo]] as [string,string][]).map(([k,v])=>(
          <div key={k} style={{ display:"flex", gap:12, padding:"7px 0", borderBottom:`1px solid ${BDS}` }}>
            <span style={{ fontFamily:MF, fontSize:10, color:TX4, width:110, flexShrink:0 }}>{k}</span>
            <span style={{ fontSize:13, color:TX, fontFamily:GF }}>{v||"—"}</span>
          </div>
        ))}
        {selNiches.length > 0 && (
          <div style={{ marginTop:14 }}>
            <span style={{ ...lbl(TX4), marginBottom:8 }}>Selected journalists ({selNiches.length})</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {selNiches.map(n=>(
                <span key={n} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#1a1410", border:"1px solid #1a1410", padding:"5px 12px", fontSize:12, fontWeight:600, color:"#ffffff", fontFamily:GF }}>
                  <span aria-hidden style={{ width:6, height:6, borderRadius:"50%", background:ACC, flexShrink:0 }} />
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate brief */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ background:ACC, fontFamily:MF, fontSize:8, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 8px", color:TX }}>AI</span>
        <span style={{ fontFamily:SF, fontSize:22, fontWeight:700, color:TX, letterSpacing:"-0.02em" }}>Media targeting brief</span>
      </div>
      <p style={{ fontFamily:GF, fontSize:14, color:TX3, lineHeight:1.6, marginBottom:20 }}>
        JournoCollabIQ builds your media brief: a tiered journalist list, an outreach sequence (exclusive → embargo → wide), per-journalist angles, and a verify-before-you-send checklist.
      </p>
      <button onClick={()=>onGated("brief")} disabled={aiBriefLoading||!biz}
        style={{ ...primaryBtn(), opacity:(!biz||aiBriefLoading)?0.4:1, fontSize:14, padding:"16px 32px", marginBottom:32, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {aiBriefLoading && <span className="v2-spin" style={{ width:14, height:14, border:"2px solid rgba(26,20,16,.3)", borderTopColor:"#1a1410", borderRadius:"50%", display:"inline-block" }} />}
        {aiBriefLoading ? "Generating your brief…" : "Generate 90-day brief →"}
      </button>

      {/* Brief preview — generated */}
      {aiBrief && (
        <div style={{ marginBottom:32 }}>
          {/* Summary preview card */}
          <div style={{ background:"#1a1410", padding:"24px 28px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <span style={{ fontFamily:MF, fontSize:8, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:ACC }}>Your playbook is ready</span>
            </div>
            {/* Phase summary */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[
                ["01","Foundation","Days 1-14","Research, partner list, outreach assets"],
                ["02","Outreach","Days 15-45","Tier A first, follow-ups, Tier B parallel"],
                ["03","Execution","Days 46-75","Negotiate placements, monitor backlinks"],
                ["04","Optimise","Days 76-90","Review metrics, expand, document"],
              ].map(([num, title, days, desc])=>(
                <div key={num} style={{ border:"1px solid rgba(250,250,250,0.1)", padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontFamily:MF, fontSize:16, fontWeight:700, color:ACC, lineHeight:1 }}>{num}</span>
                    <span style={{ fontFamily:GF, fontSize:11, fontWeight:800, color:"#f1ebde", textTransform:"uppercase", letterSpacing:"0.04em" }}>{title}</span>
                  </div>
                  <span style={{ fontFamily:MF, fontSize:8, color:"rgba(241,235,222,0.7)", letterSpacing:"0.08em", display:"block", marginBottom:4 }}>{days}</span>
                  <span style={{ fontFamily:GF, fontSize:10, color:"rgba(241,235,222,0.9)", lineHeight:1.5 }}>{desc}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:MF, fontSize:9, color:"rgba(241,235,222,0.72)", letterSpacing:"0.08em", textAlign:"center" }}>
              Full analysis, partner table, outreach template and methodology in the PDF
            </p>
          </div>
        </div>
      )}

      {/* Download / copy — always visible; download unlocks once the brief is generated above */}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginBottom:32 }}>
        <button ref={downloadBtnRef} onClick={()=>onGated("pdf")} disabled={pdfLoading || !aiBrief}
          className={justUnlocked ? "v2-unlock" : undefined}
          style={{ ...primaryBtn(), fontSize:13, padding:"14px 32px", opacity:!aiBrief?0.4:(pdfLoading?0.75:1), cursor:!aiBrief?"not-allowed":(pdfLoading?"wait":"pointer"), display:"flex", alignItems:"center", gap:10 }}>
          {pdfLoading && <span className="v2-spin" style={{ width:14, height:14, border:"2px solid rgba(26,20,16,.3)", borderTopColor:"#1a1410", borderRadius:"50%", display:"inline-block" }} />}
          {pdfDone ? "Downloaded ✓" : pdfLoading ? "Preparing PDF…" : "Download full PDF playbook"}
        </button>
        {aiBrief && <button onClick={()=>onGated("copy")} style={{ ...ghostBtn(), fontSize:13, padding:"14px 20px" }}>Copy brief text</button>}
        {!aiBrief && (
          <span style={{ fontFamily:MF, fontSize:9, color:TX4, letterSpacing:"0.08em" }}>
            🔒 Unlocks once your brief is generated above
          </span>
        )}
      </div>

      {/* EMOS CTA — shared skeleton (ToolCTAStrips.EmosCTAStrip), same
          component SignalIQ/PressIQ/CoverageIQ use. Copy rewritten to match
          their "[Tool] does X. EMOS does Y" pattern (2026-07-08 copy pass);
          the done-with-you angle moved into the pitch line instead of
          standing alone as the eyebrow. */}
      <div style={{ marginTop: aiBrief ? 0 : 16 }}>
        <EmosCTAStrip
          toolName="JournoCollabIQ"
          heading={
            <>
              JournoCollabIQ finds the journalist.<br />
              <span style={{ fontStyle: "italic", color: ACC }}>EMOS</span> gets the pitch in their inbox.
            </>
          }
          pitch="JournoCollabIQ builds the target list, the outreach sequence, and the per-journalist angles. The full Earned Media Operating System hands your team the story signals and pitch system that feed this list, and can run the whole outreach for you if you'd rather not do it in-house."
          applyHref="/emos"
          applyLabel="Explore EMOS"
          hideExplore
        />
      </div>
    </StageWrapper>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
function WizardProgress({ step, onLogoClick, topOffset = 0 }: {
  step: number;
  onLogoClick: () => void;
  topOffset?: number;
}) {
  const t = LIGHT_T;
  const STEPS = ["Story","Offer","Journalists","Angle","Media Brief"];
  return (
    <div style={{ position:"fixed", top:topOffset, left:0, right:0, zIndex:90, background:t.BG0, borderBottom:`1px solid ${t.BDS}` }}>
      <div style={{ height:3, background:t.BDS }}>
        <div style={{ height:"100%", background:ACC, width:`${((step+1)/STEPS.length)*100}%`, transition:"width 0.5s ease" }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 32px", maxWidth:800, margin:"0 auto" }}>
        {STEPS.map((s,i)=>{
          const done=i<step, active=i===step;
          return (
            <button key={i} disabled={!done}
              style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:"none", cursor:done?"pointer":"default", padding:0 }}>
              <span style={{ width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MF, fontSize:10, fontWeight:700,
                background:active?ACC:done?SUCC:"transparent", color:active||done?"#fff":t.TX3,
                border:`1px solid ${active?ACC:done?SUCC:t.BD}`, flexShrink:0, transition:"all 0.3s" }}>
                {done?"✓":String(i+1)}
              </span>
              <span className="v2-step-label" style={{ fontFamily:MF, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:active?t.TX:done?t.TX2:t.TX4, transition:"color 0.3s" }}>{s}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Footer Nav ─────────────────────────────────────────────────────────────────
function WizardFooter({ step, onBack, onNext, nextLabel, nextDisabled }: {
  step: number; onBack: ()=>void; onNext: ()=>void;
  nextLabel: string; nextDisabled: boolean;
}) {
  const t = LIGHT_T;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:90,
      background:t.BG0, borderTop:`1px solid ${t.BDS}`, padding:"14px 32px",
      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        {step>0 && <button onClick={onBack} style={{ ...ghostBtn(), padding:"10px 20px" }}>← Back</button>}
      </div>
      <span className="v2-footer-stepcount" style={{ fontFamily:MF, fontSize:11, color:t.TX4, letterSpacing:"0.08em" }}>{`${step + 1} of 5`}</span>
      {nextLabel
        ? <button onClick={onNext} disabled={nextDisabled}
            style={{ ...primaryBtn(), padding:"10px 24px", opacity:nextDisabled?0.4:1, cursor:nextDisabled?"not-allowed":"pointer" }}>
            {nextLabel}
          </button>
        : <div />
      }
    </div>
  );
}

// ── Email Gate Modal ───────────────────────────────────────────────────────────
// Migrated to the shared EmailGateModal (components/tools/ToolCTAStrips.tsx,
// 2026-07-10) — was byte-identical to PartnerCollabIQ's copy of this same modal.
// See usage below (variant="subscribe", the default).

// ── Main export ────────────────────────────────────────────────────────────────
export function JournoCollabIQ({ toolHeaderHeight = 0 }: { toolHeaderHeight?: number }) {
  const [state, dispatch]           = useReducer(reducer, null, initState);
  const [partners, setPartners]     = useState<AiPartner[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [aiEmail, setAiEmail]       = useState("");
  const [aiBrief, setAiBrief]       = useState("");
  const [aiEmailLoading, setAiEmailLoading] = useState(false);
  const [aiBriefLoading, setAiBriefLoading] = useState(false);
  const [partnersError, setPartnersError]   = useState<string|null>(null);
  const [showGate, setShowGate]     = useState(false);
  const [gatedAction, setGatedAction] = useState<string|null>(null);
  const [isSub, setIsSub]   = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const pdfDoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ind  = state.customInd || state.industry;
  const step = state.step;

  // Lock to light theme
  useEffect(()=>{
    document.documentElement.style.background = BG1;
    document.body.style.background = BG1;
    document.body.style.color = TX;
  }, []);

  // Persist state
  useEffect(()=>{ try { localStorage.setItem(V2_STORE, JSON.stringify(state)); } catch { /* noop */ } }, [state]);

  // Unified gate (P1): subscriber status is server-side now. Ask /api/gate/status on
  // mount (honors the signed wristband + legacy pp_tier) instead of a per-browser
  // localStorage flag, so one verified email unlocks across every tool and device.
  useEffect(()=>{
    let alive = true;
    fetch("/api/gate/status", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (alive && d?.subscriber) setIsSub(true); })
      .catch(()=>{});
    return ()=>{ alive = false; };
  }, []);

  // Loading cycle
  useEffect(()=>{
    if (!loading) { setLoadingIdx(0); return; }
    const t = setInterval(()=>setLoadingIdx(i=>i+1), 2200);
    return ()=>clearInterval(t);
  }, [loading]);

  // Cloudflare Turnstile (same managed-widget pattern as PressIQ/SignalIQ).
  // Fix (2026-07-03): tokens were expiring (~5 min) while users filled stages
  // 1–2, and "Generate partners" didn't wait for a token — the API then 403'd
  // with "Verification failed". Now: a ref mirrors the token for async reads,
  // expiry auto-resets the widget, and API calls wait for a fresh token.
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileTokenRef = useRef("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const setToken = (tok: string) => { turnstileTokenRef.current = tok; setTurnstileToken(tok); };

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const render = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (!w.turnstile || !turnstileRef.current || turnstileWidgetId.current) return;
      turnstileWidgetId.current = w.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        callback: (token: string) => setToken(token),
        // Token expired mid-session — reset so the managed widget re-solves.
        "expired-callback": () => {
          setToken("");
          try { if (turnstileWidgetId.current) w.turnstile.reset(turnstileWidgetId.current); } catch { /* noop */ }
        },
        "error-callback": () => setToken(""),
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).turnstile) { render(); return; }
    const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let s = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
    if (!s) {
      s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", render);
    return () => { s?.removeEventListener("load", render); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turnstile tokens are single-use — refresh after every API call.
  function resetTurnstile() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (TURNSTILE_SITE_KEY && turnstileWidgetId.current && w.turnstile) {
      w.turnstile.reset(turnstileWidgetId.current);
      setToken("");
    }
  }

  // Wait (briefly) for a valid token before hitting the API. If the current
  // token is gone (expired/consumed), reset the widget — the managed flow
  // usually re-solves without user interaction — and poll for the new token.
  async function waitForToken(ms = 8000): Promise<string> {
    if (!TURNSTILE_SITE_KEY) return "";
    if (turnstileTokenRef.current) return turnstileTokenRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (turnstileWidgetId.current && w.turnstile) {
      try { w.turnstile.reset(turnstileWidgetId.current); } catch { /* noop */ }
    }
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      await new Promise(r => setTimeout(r, 250));
      if (turnstileTokenRef.current) return turnstileTokenRef.current;
    }
    return "";
  }

  // Scroll to top when journalist results finish loading so content isn't hidden
  useEffect(()=>{
    if (!loading && partners.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function generatePartners() {
    // H6 (2026-07-02 review): no more silent mock fallback. The old mock
    // contained REAL named reporters (several no longer at those outlets)
    // presented as live AI matches — users could pitch stale people believing
    // they were matched live. Show a real error + retry instead.
    setLoading(true); setPartners([]); setLoadingIdx(0); setPartnersError(null);
    try {
      const token = await waitForToken();
      const res = await fetch("/api/journo-ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"partner-suggestions", data:{ biz:state.biz, domain:state.domain, desc:state.desc, industry:ind, audType:state.audType, audDesc:state.audDesc, geo:state.geo, strategy:state.strategy }, turnstileToken: token || undefined }),
      });
      const json = await res.json().catch(() => ({})) as { result?: string; error?: string };
      if (res.ok && json.result) {
        // Strip markdown fences if present
        const cleaned = json.result.replace(/^```json?\s*/i,"").replace(/```\s*$/,"").trim();
        const list = JSON.parse(cleaned) as AiPartner[];
        if (Array.isArray(list) && list.length > 0) {
          const sliced = list.slice(0, 8);
          setPartners(sliced);
          // Auto-select all + clear stale email target from previous session
          dispatch({ type: "SET_NICHES", val: sliced.map(p => p.name) });
          dispatch({ type: "SET", key: "scPartner", val: sliced[0]?.name || "" });
          return;
        }
      }
      setPartnersError(json.error || "The AI research didn't come back with results. Please try again.");
    } catch {
      setPartnersError("Couldn't reach the AI research service. Check your connection and try again.");
    } finally {
      setLoading(false);
      resetTurnstile();
    }
  }

  function handleGated(action: string) {
    // Brief and email generation are always free — PDF download, copy, and CSV require email
    if (action === "brief" || action === "email") { perform(action); return; }
    if (isSub) { perform(action); } else { setGatedAction(action); setShowGate(true); }
  }
  function handleGatedCsv() {
    if (isSub) { downloadCsv(); } else { setGatedAction("csv"); setShowGate(true); }
  }
  function downloadCsv() {
    const rows = [["Name","URL","Tier","Why","Link Placement","Contact","LinkedIn","SEO"],...partners.map(p=>[p.name,p.url,p.tier,p.why,p.linkPage,p.contact,p.contactLinkedIn||"",p.seoNote])];
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `JournoCollabIQ-Partners-${state.biz||"List"}.csv`; a.click();
  }
  function handleSub() {
    // The gate modal has already verified the email and set the signed wristband
    // cookie server-side (P1) — no localStorage flag to write. Just unlock locally.
    setIsSub(true);
    if (gatedAction) perform(gatedAction);
    setGatedAction(null);
  }

  function downloadPdfWithFeedback() {
    // jsPDF's doc.save() runs synchronously on the click, so without this
    // wrapper the button never visibly changes state. Defer the heavy build
    // by two animation frames so React can paint the loading state before
    // the synchronous build blocks the thread, then guarantee the loading
    // state stays visible for a minimum ~600ms so a human can register it
    // even when the real work finishes instantly.
    if (pdfDoneTimer.current) clearTimeout(pdfDoneTimer.current);
    setPdfLoading(true);
    setPdfDone(false);
    const started = Date.now();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { generatePDF(); }
      finally {
        const elapsed = Date.now() - started;
        const wait = Math.max(0, 600 - elapsed);
        setTimeout(() => {
          setPdfLoading(false);
          setPdfDone(true);
          pdfDoneTimer.current = setTimeout(() => setPdfDone(false), 12000);
        }, wait);
      }
    }));
  }

  function generatePDF() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDF = (window as any).jspdf?.jsPDF;
    if (!jsPDF) { alert("PDF library still loading. Try again in a moment."); return; }
    const doc = new jsPDF({ unit:"mm", format:"a4" });
    const W=210, H=297, M=28;
    const INK:[number,number,number]  = [26,20,16];
    const GOLD:[number,number,number] = [245,184,31];
    const CREAM:[number,number,number]= [250,250,250];
    const GREY:[number,number,number] = [153,153,153];
    const DGREY:[number,number,number]= [80,80,80];
    const TAUR:[number,number,number] = [196,144,10];
    const TBLUE:[number,number,number]= [58,123,213];
    const date = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const bizName = state.biz||"Your Business";
    const strat = V2_STRATEGIES[state.strategy]?.label||"Discount Partnership";
    const pList = partners.length>0?partners:V2_GENERIC;
    const totalPages = aiBrief ? 5 : 4;

    // ── Helpers ────────────────────────────────────────────────────
    function pageFooter(page:number, dark=false) {
      const footY = H-8;
      if(dark){
        doc.setFillColor(...INK); doc.rect(0,H-16,W,16,"F");
        doc.setDrawColor(50,42,32); doc.setLineWidth(0.3); doc.line(0,H-16,W,H-16);
        doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(...CREAM);
        doc.text("JournoCollabIQ",M,footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(80,70,60);
        doc.text("  ·  syedirfanajmal.com/tools/journocollabiq  ·  Syed Irfan Ajmal",M+18,footY);
        doc.setTextColor(80,70,60);
      } else {
        doc.setFillColor(...CREAM); doc.rect(0,H-16,W,16,"F");
        doc.setDrawColor(220,215,205); doc.setLineWidth(0.3); doc.line(0,H-16,W,H-16);
        doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(...INK);
        doc.text("JournoCollabIQ",M,footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(...GREY);
        doc.text("  ·  syedirfanajmal.com/tools/journocollabiq  ·  Syed Irfan Ajmal",M+18,footY);
        doc.setTextColor(...GREY);
      }
      doc.setFont("helvetica","normal"); doc.setFontSize(6);
      doc.text(`Page ${page} of ${totalPages}`, W-M, footY, {align:"right"});
    }
    function lightHeader(rightLabel:string) {
      doc.setFillColor(...CREAM); doc.rect(0,0,W,H,"F");
      doc.setFillColor(...GOLD); doc.rect(0,0,W,3,"F");
      doc.setDrawColor(...INK); doc.setLineWidth(1.5); doc.line(0,15,W,15);
      doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...INK);
      doc.text("Collab",M,12);
      const cw=doc.getTextWidth("Collab");
      doc.setTextColor(...GOLD); doc.text("IQ",M+cw,12);
      doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...GREY);
      doc.text("  ·  "+bizName.substring(0,30), M+cw+8, 12);
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GREY);
      doc.text(rightLabel.toUpperCase(), W-M, 12, {align:"right"});
    }
    function sectionNum(num:string, title:string, yp:number):number {
      doc.setFillColor(...INK); doc.rect(M,yp-5,13,11,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...GOLD);
      doc.text(num, M+6.5, yp+2, {align:"center"});
      doc.setFontSize(17); doc.setTextColor(...INK);
      doc.text(title, M+18, yp+2);
      return yp+16;
    }
    // Fit single line of text to maxW, append ellipsis if truncated
    function fitLine(text:string, maxW:number, fs:number):string {
      doc.setFontSize(fs);
      if(doc.getTextWidth(text)<=maxW) return text;
      let out=text;
      while(out.length>1 && doc.getTextWidth(out+"…")>maxW) out=out.slice(0,-1);
      return out+"…";
    }
    const tierRGB = (t:string):[number,number,number] => t==="A"?TAUR:t==="B"?TBLUE:GREY;

    // ════ PAGE 1: DARK COVER ════════════════════════════════════════
    doc.setFillColor(...INK); doc.rect(0,0,W,H,"F");
    doc.setFillColor(...GOLD); doc.rect(0,0,W,6,"F");
    doc.setFillColor(40,32,24); doc.rect(M,15,12,12,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...INK);
    doc.text("SIA", M+6, 22.5, {align:"center"});
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...CREAM);
    doc.text("Syed Irfan Ajmal  ·  syedirfanajmal.com", M+16, 22);
    doc.setTextColor(70,60,50); doc.setFontSize(7);
    doc.text("syedirfanajmal.com", W-M, 22, {align:"right"});
    let y=68;
    doc.setFillColor(...GOLD); doc.rect(M,y,22,1.5,"F");
    doc.setFillColor(40,32,24); doc.rect(M+24,y,W-M*2-24,1.5,"F");
    y+=9; doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...GOLD);
    doc.text("PARTNERSHIP INTELLIGENCE REPORT", M, y); y+=20;
    doc.setFont("helvetica","bold"); doc.setFontSize(50); doc.setTextColor(...CREAM);
    doc.text("Collab", M, y);
    doc.setTextColor(...GOLD); doc.text("IQ", M+doc.getTextWidth("Collab"), y); y+=13;
    doc.setFont("helvetica","normal"); doc.setFontSize(17); doc.setTextColor(180,165,145);
    doc.text("Your personalised partnership", M, y); y+=7;
    doc.text("campaign brief", M, y); y+=16;
    doc.setFillColor(...GOLD); doc.rect(M,y,46,1.5,"F");
    doc.setFillColor(40,32,24); doc.rect(M+48,y,W-M*2-48,1.5,"F"); y+=14;
    // Business summary grid
    const cW2=(W-M*2)/2;
    const summaryRows:[string,string,boolean][]=[
      ["Business",bizName,true],["Website",state.domain||"—",false],
      ["Industry",ind||"—",false],["Strategy",strat,true],
      ["Audience",state.audType||"—",false],["Geography",state.geo||"—",false],
    ];
    summaryRows.forEach(([label,val,accent],i)=>{
      const cx=M+(i%2)*cW2, cy=y+Math.floor(i/2)*22;
      doc.setDrawColor(50,42,32); doc.setFillColor(0,0,0,0); doc.setLineWidth(0.3);
      doc.rect(cx,cy-5,cW2,22);
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(120,105,85);
      doc.text(label.toUpperCase(), cx+7, cy);
      doc.setFont("helvetica",accent?"bold":"normal"); doc.setFontSize(12);
      doc.setTextColor(...(accent?GOLD:([180,165,145] as [number,number,number])));
      doc.text(fitLine(val, cW2-16, 12), cx+7, cy+9);
    });
    y+=3*22+10;
    // Selected partners
    if(state.selNiches.length>0){
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(100,88,70);
      doc.text("SELECTED PARTNERS", M, y); y+=6;
      let chipX=M;
      state.selNiches.slice(0,8).forEach(name=>{
        doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
        const chipW=doc.getTextWidth(name)+8;
        if(chipX+chipW>W-M){ chipX=M; y+=9; }
        doc.setDrawColor(70,58,42); doc.setLineWidth(0.3); doc.setFillColor(0,0,0,0);
        doc.rect(chipX,y-5,chipW,8);
        doc.setTextColor(170,155,130); doc.text(name,chipX+4,y);
        chipX+=chipW+4;
      });
      y+=10;
    }
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(70,60,50);
    doc.text(date, W-M, y, {align:"right"});
    pageFooter(1,true);

    // ════ PAGE 2: PARTNER INTELLIGENCE — ALL 8 ═════════════════════
    doc.addPage();
    lightHeader("Partner Intelligence");
    y=28;
    y=sectionNum("01", `${pList.length} Partnership Targets Identified`, y);
    // Smaller cards (4 rows x 2 cols = 8 partners)
    const cW=(W-M*2-8)/2, cH=32;
    pList.slice(0,8).forEach((p,i)=>{
      const cx=M+(i%2)*(cW+8), cy=y+Math.floor(i/2)*(cH+4);
      doc.setDrawColor(210,205,195); doc.setFillColor(255,255,255); doc.setLineWidth(0.4);
      doc.rect(cx,cy,cW,cH);
      // Tier badge
      const [tr,tg,tb]=tierRGB(p.tier);
      doc.setDrawColor(tr,tg,tb); doc.setLineWidth(0.5);
      doc.rect(cx+cW-20,cy+3,18,7);
      doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(tr,tg,tb);
      doc.text(`Tier ${p.tier}`,cx+cW-11,cy+8,{align:"center"});
      // Name — fit to available width (exclude tier badge area)
      const nameMaxW=cW-26;
      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...INK);
      doc.text(fitLine(p.name, nameMaxW, 10), cx+5, cy+9);
      // URL
      doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY);
      doc.text(fitLine(p.url, cW-10, 6.5), cx+5, cy+15);
      // Why — 1 line max at this card height
      doc.setFontSize(7.5); doc.setTextColor(...DGREY);
      const why=doc.splitTextToSize(p.why.replace(/[—–]/g,"-"), cW-10) as string[];
      doc.text(why[0]||"", cx+5, cy+21);
      // SEO + Contact footer row
      const halfW=cW/2-6;
      doc.setFontSize(6.5); doc.setTextColor(...TAUR); doc.setFont("helvetica","bold");
      doc.text(fitLine(p.seoNote, halfW, 6.5), cx+5, cy+28);
      doc.setTextColor(...GREY); doc.setFont("helvetica","normal");
      doc.text(fitLine(p.contact, halfW, 6.5), cx+cW/2+2, cy+28);
    });
    pageFooter(2);

    // ════ PAGE 3: OUTREACH + 90-DAY ROADMAP ════════════════════════
    doc.addPage();
    lightHeader("Strategy & Outreach");
    y=28;
    // Section 02 — Outreach Template (fixed numbering)
    y=sectionNum("02","Outreach Template",y);
    // Fix template: avoid "We [desc]" duplication — use desc as standalone sentence
    const descText=state.desc
      ? (state.desc.endsWith(".")?state.desc:state.desc+".")
      : "[Briefly describe what you do and who you help.]";
    const tplMap:{[k:string]:string}={
      discount:`Subject: Partnership idea — [THEIR BRAND] x ${bizName}\n\nHi [FIRST NAME],\n\nI'm [YOUR NAME] from ${bizName}. ${descText}\n\nI noticed you serve the same audience from a different angle — and there's a natural fit.\n\nProposal: we offer your clients an exclusive [X]% discount on ${bizName}. You mention us on your partner page with a link.\n\nThree-way win.\n\n15 minutes to explore this?\n\n[YOUR NAME]  ·  ${bizName}  ·  ${state.domain||"[website]"}`,
      institution:`Subject: Exclusive discount for [INSTITUTION] members\n\nHi [CONTACT],\n\nI'm [YOUR NAME] from ${bizName}. ${descText}\n\nWe'd love to offer [INSTITUTION] members an exclusive [X]% discount. All we'd ask: a mention on your rebate page with a link.\n\nNo strings, no fees.\n\n[YOUR NAME]  ·  ${bizName}  ·  ${state.domain||"[website]"}`,
      badge:`Subject: Featured in our [GUIDE TITLE]\n\nHi [EXPERT],\n\nI'm building a guide: [GUIDE TITLE] featuring [EXPERT TYPE]. You'd get a feature with credentials, a badge for your site, and promotion to [AUDIENCE].\n\nInterested?\n\n[YOUR NAME]  ·  ${bizName}  ·  ${state.domain||"[website]"}`,
    };
    const tplText=tplMap[state.strategy]||tplMap.discount;
    doc.setFillColor(...INK); doc.rect(M,y,W-M*2,54,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(190,178,158);
    const tlines=doc.splitTextToSize(tplText,W-M*2-14) as string[];
    doc.text(tlines.slice(0,14),M+7,y+7);
    y+=58;
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...GREY);
    doc.text("Replace [BRACKETED] text before sending. Personalise for each specific partner.", M, y); y+=10;
    // Section 03 — 90-Day Roadmap (fixed numbering)
    y=sectionNum("03","90-Day Campaign Roadmap",y);
    doc.setFillColor(...GOLD); doc.rect(M+130,y-19,10,8,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(...INK);
    doc.text("AI",M+135,y-13,{align:"center"});
    const phases:[string,string,string,string[]][]=[
      ["01","Foundation","DAYS 1-14",["Audit backlink profile","Identify 20-30 target partners","Create discount codes per tier","Personalise top 10 outreach"]],
      ["02","Outreach","DAYS 15-45",["Send to Tier A partners first","Follow up after 5-7 days","Begin Tier B in parallel","Track in spreadsheet"]],
      ["03","Execution","DAYS 46-75",["Negotiate link placements","Provide assets to partners","Monitor new backlinks","Begin Tier C for volume"]],
      ["04","Optimise","DAYS 76-90",["Review links, DA, referral traffic","Share data with partners","Identify top categories","Document the playbook"]],
    ];
    const phW=(W-M*2-8)/2, phH=44;
    phases.forEach(([num,title,days,bullets],i)=>{
      const cx=M+(i%2)*(phW+8), cy=y+Math.floor(i/2)*(phH+5);
      doc.setDrawColor(210,205,195); doc.setFillColor(255,255,255); doc.setLineWidth(0.4);
      doc.rect(cx,cy,phW,phH);
      doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(232,228,220);
      doc.text(num,cx+6,cy+13);
      doc.setFontSize(9); doc.setTextColor(...INK);
      doc.text(title.toUpperCase(),cx+22,cy+10);
      doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...GREY);
      doc.text(days,cx+22,cy+16);
      doc.setFontSize(7.5); doc.setTextColor(...DGREY);
      bullets.forEach((b,bi)=>doc.text(`- ${b}`,cx+6,cy+23+bi*5.5));
    });
    y+=2*(phH+5)+10;
    doc.setFillColor(252,250,244); doc.rect(M,y,W-M*2,20,"F");
    doc.setFillColor(...GOLD); doc.rect(M,y,2.5,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GREY);
    doc.text("ABOUT THIS METHOD",M+7,y+6);
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DGREY);
    const mtext=doc.splitTextToSize("The Collab Link Building method was developed by Syed Irfan Ajmal and executed by DMR.agency. It finds non-competing companies with overlapping audiences to create mutual-value partnerships generating referral traffic, brand authority, and high-quality backlinks.",W-M*2-14) as string[];
    doc.text(mtext,M+7,y+12);
    pageFooter(3);

    // ════ PAGE 4 (optional): AI-GENERATED BRIEF ════════════════════
    if(aiBrief){
      doc.addPage();
      lightHeader("AI-Generated Brief");
      y=28;
      doc.setFillColor(...INK); doc.rect(M,y-5,12,8,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GOLD);
      doc.text("AI",M+6,y,{align:"center"});
      doc.setFontSize(17); doc.setTextColor(...INK);
      doc.text("Your 90-Day AI Campaign Brief",M+17,y); y+=14;

      // Inline markdown renderer — handles **bold** spans with word-wrap
      function renderInlineMd(text: string, lx: number, ly: number, maxW: number, fs: number): number {
        const LH = fs * 0.38;
        const parts = text.split("**");
        let cx = lx, cy = ly;
        doc.setFontSize(fs);
        for (let pi = 0; pi < parts.length; pi++) {
          const part = parts[pi];
          if (!part) continue;
          doc.setFont("helvetica", pi % 2 === 1 ? "bold" : "normal");
          const words = part.split(/(\s+)/);
          for (const w of words) {
            if (!w) continue;
            const isWs = /^\s+$/.test(w);
            const wW = doc.getTextWidth(w);
            if (!isWs && cx + wW > lx + maxW && cx > lx) { cx = lx; cy += LH; }
            if (isWs && cx === lx) continue;
            doc.text(w, cx, cy);
            cx += wW;
          }
        }
        return cy;
      }

      let briefPage = 4;
      const briefLines=aiBrief.split("\n");
      for(const line of briefLines){
        if(y>H-22){ pageFooter(briefPage); briefPage++; doc.addPage(); lightHeader("AI-Generated Brief"); y=28; }
        if(line.startsWith("# ")){
          doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...INK);
          doc.text(line.replace("# ",""),M,y); y+=9;
        } else if(line.startsWith("## ")){
          doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...INK);
          const hLines=doc.splitTextToSize(line.replace("## ","").replace(/\*\*/g,""),W-M*2) as string[];
          doc.text(hLines,M,y); y+=hLines.length*6+2;
        } else if(line.startsWith("- ")){
          doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DGREY);
          const bullet = "- " + line.replace(/^-\s*/,"");
          const endY = renderInlineMd(bullet, M+4, y, W-M*2-6, 8);
          y = endY + 5;
        } else if(line.trim()){
          doc.setTextColor(...DGREY);
          const endY = renderInlineMd(line.trim(), M, y, W-M*2, 8);
          y = endY + 5;
        } else { y+=4; }
      }
      pageFooter(briefPage);
    }

    // ════ FINAL PAGE: EMOS CTA (DARK) ══════════════════════════════
    doc.addPage();
    const lastPage=aiBrief?5:4;
    doc.setFillColor(...INK); doc.rect(0,0,W,H,"F");
    doc.setFillColor(...GOLD); doc.rect(0,0,W,6,"F");
    let cy=52;
    doc.setFillColor(...GOLD); doc.rect(W/2-18,cy,36,36,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.setTextColor(...INK);
    doc.text("SIA",W/2,cy+21,{align:"center"});
    cy+=48;
    doc.setFillColor(...GOLD); doc.rect(M,cy,18,1,"F"); doc.rect(W-M-18,cy,18,1,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GOLD);
    doc.text("WANT RESULTS LIKE THESE AT SCALE?",W/2,cy+1,{align:"center"});
    cy+=12;
    doc.setFont("helvetica","bold"); doc.setFontSize(34); doc.setTextColor(...CREAM);
    doc.text("Earned Media",W/2,cy,{align:"center"}); cy+=12;
    doc.setTextColor(...GOLD); doc.text("Operating System",W/2,cy,{align:"center"}); cy+=14;
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(140,128,110);
    const sub=doc.splitTextToSize("The step-by-step system for founders who want press, partnerships, and authority before their Series A.",120) as string[];
    doc.text(sub,W/2,cy,{align:"center"}); cy+=sub.length*7+14;
    const inclusions=["Step-by-step earned media playbooks","Journalist & editor contact database","Collab link building templates & frameworks","Ongoing platform access, no cohort or course"];
    const inclBoxH=16+inclusions.length*10+8;
    doc.setDrawColor(50,42,32); doc.setLineWidth(0.4);
    doc.rect(W/2-52,cy,104,inclBoxH);
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(90,80,65);
    doc.text("WHAT YOU GET",W/2-44,cy+8);
    inclusions.forEach((inc,i)=>{
      doc.setFillColor(...GOLD); doc.rect(W/2-44,cy+14+i*10,3,3,"F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(170,158,138);
      doc.text(inc,W/2-38,cy+17+i*10);
    });
    cy+=inclBoxH+14;
    doc.setFillColor(...GOLD); doc.rect(W/2-54,cy,108,14,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text("Learn more at syedirfanajmal.com/emos",W/2,cy+9,{align:"center"});
    // Attribution well above footer zone — no overlap
    doc.setFontSize(7); doc.setTextColor(55,46,36);
    doc.text(`Generated via JournoCollabIQ  ·  ${date}`,W/2,H-24,{align:"center"});
    pageFooter(lastPage,true);

    doc.save(`JournoCollabIQ-Playbook-${bizName.replace(/\s+/g,"-")}.pdf`);
  }

  async function generateAiEmail() {
    setAiEmailLoading(true);
    try {
      const scoreTotal = Object.values(state.scores).reduce((a,b)=>a+b,0);
      const scorePct   = Math.round((scoreTotal / (V2_SCORECARD.length * 2)) * 100);
      const res = await fetch("/api/journo-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        type:"email-writer",
        data:{ biz:state.biz, domain:state.domain, desc:state.desc, industry:ind,
               audType:state.audType, audDesc:state.audDesc, geo:state.geo,
               strategy:state.strategy,
               partner:state.scPartner,       // field name the API prompt expects
               partnerCat:state.scCat,
               scorePct },
        turnstileToken: (await waitForToken()) || undefined,
      })});
      if(res.ok){const j=await res.json() as {result?:string};if(j.result){setAiEmail(j.result);setAiEmailLoading(false);return;}}
    } catch { /* fallback */ } finally { resetTurnstile(); }
    setAiEmail(`Subject: Partnership idea — [PARTNER] × ${state.biz}\n\nHi [FIRST NAME],\n\nI'm reaching out from ${state.biz} — we ${state.desc||"[what you do]"}.\n\nI came across [PARTNER] while researching companies that serve the same audience, and there's a natural fit.\n\nProposal: we create an exclusive offer for your customers — [SPECIFIC OFFER]. In return, a mention on your partner page with a link.\n\nThree-way win:\n→ Your customers get exclusive value\n→ You deepen loyalty\n→ We get warm referral traffic\n\n15 minutes this week?\n\nBest,\n[YOUR NAME]\n${state.biz} · ${state.domain||"[website]"}`);
    setAiEmailLoading(false);
  }

  async function generateAiBrief() {
    setAiBriefLoading(true);
    try {
      const scoreTotal  = Object.values(state.scores).reduce((a,b)=>a+b,0);
      const scorePct    = Math.round((scoreTotal / (V2_SCORECARD.length * 2)) * 100);
      const verdictText = scorePct >= 70 ? "Strong prospect. Prioritise." : scorePct >= 45 ? "Moderate fit. Review weak areas." : scorePct > 0 ? "Low fit. Find a better target." : "Not yet scored";
      const res = await fetch("/api/journo-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        type:"campaign-brief",
        data:{ biz:state.biz, domain:state.domain, desc:state.desc, industry:ind,
               audType:state.audType, audDesc:state.audDesc, geo:state.geo,
               strategy:state.strategy, stratLabel:V2_STRATEGIES[state.strategy]?.label,
               selNiches:state.selNiches,
               partner:state.scPartner, partnerCat:state.scCat,
               scorePct, verdictText },
        turnstileToken: (await waitForToken()) || undefined,
      })});
      if(res.ok){const j=await res.json() as {result?:string};if(j.result){setAiBrief(j.result);setAiBriefLoading(false);return;}}
    } catch { /* fallback */ } finally { resetTurnstile(); }
    setAiBrief(`# 90-Day Collab Link Building Brief\n\n## Executive Summary\nA 90-day campaign for ${state.biz} using ${V2_STRATEGIES[state.strategy]?.label} in ${ind}.\n\n## Phase 1: Foundation (Days 1-14)\n- Audit backlink profile (Ahrefs/SEMrush)\n- Identify 20-30 target partners across 3-4 categories\n- Create landing pages or discount codes per tier\n- Personalise outreach for top 10 targets\n\n## Phase 2: Outreach (Days 15-45)\n- Send to Tier A partners first\n- Follow up after 5-7 business days\n- Begin Tier B outreach in parallel\n- Track in spreadsheet\n\n## Phase 3: Execution (Days 46-75)\n- Negotiate link placements\n- Provide assets (codes, badges, content)\n- Monitor new backlinks in Ahrefs\n- Begin Tier C for volume\n\n## Phase 4: Optimisation (Days 76-90)\n- Review metrics: links, DA, referral traffic\n- Share performance data with partners\n- Identify top categories for expansion\n- Document playbook`);
    setAiBriefLoading(false);
  }

  function perform(action: string) {
    if (action==="copy") {
      navigator.clipboard.writeText(`JournoCollabIQ Brief\nBusiness: ${state.biz}\nIndustry: ${ind}\nStrategy: ${V2_STRATEGIES[state.strategy]?.label}\n\nSelected Partners:\n${state.selNiches.join(", ")||"None"}\n\n${aiBrief||""}`);
    } else if (action==="pdf")   { downloadPdfWithFeedback(); }
    else if (action==="email")   { generateAiEmail(); }
    else if (action==="brief")   { generateAiBrief(); }
    else if (action==="csv")     { downloadCsv(); }
  }

  const canAdvance = [
    ()=>true,
    ()=>!!state.biz&&!!ind,
    // Step 2 → 3 fires the AI call: require the human check to have solved
    // first (PressIQ pattern) so the API never 403s with "Verification failed".
    ()=>!TURNSTILE_SITE_KEY||!!turnstileToken,
    ()=>partners.length>0&&!loading,
    ()=>true,
    ()=>true,
  ];
  function goNext() {
    if(step===2){dispatch({type:"GO",step:3});generatePartners();}
    else if(step<5) dispatch({type:"GO",step:step+1});
  }
  function goBack() { if(step>0) dispatch({type:"GO",step:step-1}); }

  const nextLabels = ["","Continue →","Generate partners →","Continue to outreach →","Build your playbook →",""];
  const t = LIGHT_T;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="v2-collabiq" style={{ background:t.BG1, color:t.TX, minHeight:"100vh" }}>
        {step>0 && <WizardProgress step={step===5 && !!aiBrief ? step : step-1} onLogoClick={()=>dispatch({type:"GO",step:1})} topOffset={toolHeaderHeight} />}

        <div key={`stage-${step}`}>
          {step===1 && <Stage1 state={state} dispatch={dispatch} />}
          {step===2 && <Stage2 state={state} dispatch={dispatch} />}
          {step===3 && <Stage3 partners={partners} loading={loading} loadingIdx={loadingIdx} industry={ind} strategy={state.strategy} biz={state.biz} selNiches={state.selNiches} onToggle={n=>dispatch({type:"TOGGLE_NICHE",val:n})} onScore={(n,c)=>dispatch({type:"SCORE_PARTNER",name:n,cat:c})} onGatedCsv={handleGatedCsv} error={partnersError} onRetry={generatePartners} />}
          {step===4 && <Stage4 state={state} dispatch={dispatch} partners={partners} onGated={handleGated} aiEmail={aiEmail} aiEmailLoading={aiEmailLoading} />}
          {step===5 && <Stage5 state={state} onGated={handleGated} aiBrief={aiBrief} aiBriefLoading={aiBriefLoading} pdfLoading={pdfLoading} pdfDone={pdfDone} />}
        </div>

        {/* Cloudflare Turnstile human check — docked in the page flow (centered,
            with bottom padding to clear the fixed wizard footer) so it never
            overlaps content on any screen size. Matches the PartnerCollabIQ /
            PressIQ in-flow pattern, which renders reliably in this framework. */}
        {TURNSTILE_SITE_KEY && step>0 && (
          <div style={{ display:"flex", justifyContent:"center", padding:"8px 0 96px" }}>
            <div ref={turnstileRef} />
          </div>
        )}

        {step>0 && <WizardFooter step={step-1} onBack={goBack} onNext={goNext} nextLabel={nextLabels[step]} nextDisabled={!canAdvance[step]()} />}

        {/* Pipeline footer — shown only on the final step as a "what's next?" prompt */}
        {step > 0 && <div style={{ paddingBottom: 72 }}><ToolPipelineFooter currentTool="journocollabiq" compact /></div>}

        <EmailGateModal variant="subscribe" tool="jciq" show={showGate} onClose={()=>{setShowGate(false);setGatedAction(null);}} onSubscribe={handleSub} />
      </div>
    </>
  );
}

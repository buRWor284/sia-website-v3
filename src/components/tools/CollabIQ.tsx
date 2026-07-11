"use client";

/**
 * CollabIQ v2 — 5-Stage Partnership Intelligence Wizard
 * Design: design_handoff_collabiq/README.md
 * Route: /tools/collabiq
 */

import { useState, useEffect, useReducer, useRef } from "react";
import { EmailGateModal } from "@/components/tools/ToolCTAStrips";

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG0  = "#f1ebde";
const BG1  = "#e8e0cc";
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
  discount:    { label: "Discount Partnership",   brief: "Offer your partner's customers a deal. They link to you from their partner page. Three-way win.", icon: "01" },
  institution: { label: "Institution Rebate",     brief: "Earn .edu, .gov, and .org backlinks by offering exclusive discounts to institutions.", icon: "02" },
  badge:       { label: "Expert Roundup",         brief: "Feature experts in a guide. Award each a badge with your URL embedded. Scalable backlink engine.", icon: "03" },
};

const V2_SCORECARD = [
  { q: "Do they serve the same target audience?",           sub: "Would their ideal customer also buy from you?" },
  { q: "Are they genuinely non-competing?",                  sub: "Choosing them doesn't mean skipping you." },
  { q: "Do they have real domain authority?",                sub: "Content + backlinks (check Ahrefs/SEMrush)." },
  { q: "Is there a page where a link could live?",           sub: "Partner page, deals page, resources section." },
  { q: "Can you offer a clear value exchange?",              sub: "Discount, listing, badge — something concrete." },
  { q: "Do they already link to other brands?",              sub: "Check blog, resources, or footer." },
  { q: "Can you find a specific named contact?",             sub: "Named person on LinkedIn, not info@." },
  { q: "Is their brand quality solid?",                      sub: "You'll be associated with them." },
];

const V2_LOADING = [
  { h: "Scanning for your perfect partners…",               s: "Cross-referencing industry, audience, and strategy." },
  { h: "Finding companies that want your audience…",         s: "Identifying non-competing businesses with overlap." },
  { h: "Cross-referencing DA scores…",                       s: "Only surfacing links worth your time." },
  { h: "Profiling who to contact…",                          s: "Finding the right inbox at each company." },
  { h: "Almost there.",                                      s: "Compiling a report that would take an agency a week." },
];

// Elapsed-time counter, matching the pattern rolled out to PressIQ/SignalIQ/
// JournoCollabIQ. A standalone component so it resets naturally each time it
// mounts (i.e. each time a fresh loading run starts), with no manual reset call
// needed. The "typically 30-60s" estimate reuses PressIQ's observed range as a
// placeholder (Irfan's call, 08 Jul) since PartnerCollabIQ's own research time
// hasn't been separately measured yet. Revisit once it has.
function ElapsedSecs() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{secs}</>;
}

const V2_MOCK: Record<string, AiPartner[]> = {
  "SaaS / Software": [
    { name:"Loom",          url:"loom.com",        why:"Async video platform serving the same startup audience. Active integrations directory with dofollow links.",          linkPage:"loom.com/integrations",       contact:"Partnerships Lead",      seoNote:"DA 78 · Dofollow",       tier:"A" },
    { name:"Calendly",      url:"calendly.com",    why:"Same B2B sales audience. Integrations marketplace with branded badges and contextual backlinks.",                    linkPage:"calendly.com/integrations",   contact:"Head of Partnerships",   seoNote:"DA 76 · Strong referral", tier:"A" },
    { name:"Miro",          url:"miro.com",        why:"Product teams needing complementary tools. Marketplace with 130+ integrations and co-marketing.",                    linkPage:"miro.com/marketplace",        contact:"Ecosystem Manager",      seoNote:"DA 74 · Growing",         tier:"B" },
    { name:"Pitch",         url:"pitch.com",       why:"Startup teams building strategies. Partner tools featured in resources section.",                                    linkPage:"pitch.com/resources",         contact:"Head of Marketing",      seoNote:"DA 62 · Engaged",         tier:"B" },
    { name:"Trainual",      url:"trainual.com",    why:"Onboarding platform for growing SMBs scaling their tech stack.",                                                     linkPage:"trainual.com/integrations",   contact:"Content Lead",           seoNote:"DA 58 · Niche",           tier:"B" },
    { name:"Process Street",url:"process.st",      why:"Operations-focused teams at SMBs. Active co-marketing with SaaS.",                                                  linkPage:"process.st/integrations",     contact:"Growth Manager",         seoNote:"DA 65 · Active",          tier:"C" },
  ],
  "Health & Wellness": [
    { name:"Mindbody",  url:"mindbody.com", why:"Powers booking for wellness businesses. Partner marketplace with dofollow links.", linkPage:"mindbody.com/partners",    contact:"Partnerships Manager", seoNote:"DA 72 · Dominant",    tier:"A" },
    { name:"Gymshark",  url:"gymshark.com", why:"18M+ fitness community. Ambassador programme with resource page features.",       linkPage:"gymshark.com/ambassadors", contact:"Brand Partnerships",  seoNote:"DA 74 · Massive reach",tier:"A" },
    { name:"Headspace", url:"headspace.com",why:"Mental wellness audience overlapping with health brands. B2B partnerships.",     linkPage:"headspace.com/work",       contact:"B2B Partnerships",    seoNote:"DA 76 · Premium",     tier:"B" },
    { name:"Noom",      url:"noom.com",     why:"Health coaching for the same health-conscious consumer.",                        linkPage:"noom.com/blog",             contact:"Content Partnerships",seoNote:"DA 68 · High traffic",tier:"B" },
    { name:"ClassPass", url:"classpass.com",why:"Fitness enthusiasts. Partner network in deals sections.",                        linkPage:"classpass.com/partners",   contact:"Partnerships Lead",   seoNote:"DA 66 · Active",      tier:"B" },
    { name:"Alo Yoga",  url:"aloyoga.com",  why:"Premium wellness audience. Editorial content and community partner features.",    linkPage:"aloyoga.com/community",    contact:"Brand Collaborations",seoNote:"DA 60 · Premium",     tier:"C" },
  ],
};
const V2_GENERIC: AiPartner[] = [
  { name:"Partner Alpha",  url:"alpha.com",   why:"Serves the same audience through a complementary product. Active partner directory.",   linkPage:"alpha.com/partners",  contact:"Head of Partnerships", seoNote:"DA 65 · Active",  tier:"A" },
  { name:"Partner Beta",   url:"beta.com",    why:"Customer base directly overlaps. Resources page links to complementary brands.",        linkPage:"beta.com/resources",  contact:"Marketing Manager",    seoNote:"DA 58 · Growing", tier:"A" },
  { name:"Partner Gamma",  url:"gamma.com",   why:"Same demographic, non-competing. Maintained deals page.",                               linkPage:"gamma.com/deals",     contact:"Content Lead",         seoNote:"DA 54 · Niche",   tier:"B" },
  { name:"Partner Delta",  url:"delta.com",   why:"Blog features complementary brands with contextual links.",                             linkPage:"delta.com/blog",      contact:"SEO Manager",          seoNote:"DA 48 · Blog",    tier:"B" },
  { name:"Partner Epsilon",url:"epsilon.org", why:"Association with member benefits page for complementary deals.",                         linkPage:"epsilon.org/benefits",contact:"Member Services",       seoNote:"DA 52 · .org",    tier:"C" },
  { name:"Partner Zeta",   url:"zeta.com",    why:"Growing partner programme with contextual link placements.",                             linkPage:"zeta.com/partners",   contact:"Growth Lead",          seoNote:"DA 45 · Early",   tier:"C" },
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
const V2_STORE = "collabiq_v2_state";
const V2_SUB   = "collabiq_v2_sub";

function initState(): CollabState {
  // Always start blank — do not rehydrate form fields from a previous
  // session's localStorage. Old business/domain/desc text was showing up
  // as "stale data" on fresh visits (2026-07 QA finding).
  return { biz:"",domain:"",desc:"",industry:"",customInd:"",strategy:"discount",
    audType:"",geo:"",audDesc:"",selNiches:[],scPartner:"",scCat:"",scores:{},step:0 };
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
    background: ACC, color: BG0 };
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
  .v2-step-label{display:block}
  .v2-footer-attribution{}
  @media(max-width:600px){.v2-step-label{display:none!important}.v2-meta-grid{grid-template-columns:1fr!important}.v2-footer-attribution{display:none!important}.v2-wizard-footer{padding:12px 16px!important}}
  .v2-collabiq *{box-sizing:border-box}
  .v2-collabiq input,.v2-collabiq textarea,.v2-collabiq select{font-family:var(--font-grot),sans-serif}
  .v2-contact-tip:hover .v2-tooltip{display:block!important}
  .v2-tooltip::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1c1a16}
`;

// ── Stage 0: Static Explainer ──────────────────────────────────────────────────
// 2026-07-11: replaced the 7-scene animated "cinema" explainer with a static,
// normal-flow layout — the animation broke on mobile (illegible text on some
// scenes, one scene's grid running off the edge of the screen) and was worth
// simplifying rather than patching, since most other tools in the suite don't
// carry a video/animated intro at all. Same proof points (case study, revenue
// lift, testimonial), just laid out top-to-bottom instead of as timed scenes.
function Stage0({ onStart }: { onStart: () => void }) {
  const cTx  = "#f1ebde", cTx2 = "rgba(241,235,222,.6)", cTx3 = "rgba(241,235,222,.3)", cTx4 = "rgba(241,235,222,.15)";
  const cBg2 = "#1a1714", cBd = "#2a2318";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: MF, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TX4 }}>PartnerCollabIQ · Partnership Intelligence</span>
      </div>

      {/* Static explainer panel */}
      <div style={{ width: "100%", maxWidth: 760, background: "#0c0b09", border: "1px solid #2a2318", padding: "clamp(28px,6vw,48px) clamp(20px,5vw,40px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, background: ACC, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GF, fontWeight: 900, fontSize: 10, color: "#0c0b09" }}>SIA</div>
            <span style={{ fontFamily: MF, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: cTx3, textTransform: "uppercase" }}>Syed Irfan Ajmal · DMR.agency</span>
          </div>
          <h2 style={{ fontFamily: SF, fontSize: "clamp(22px,4.5vw,36px)", fontWeight: 700, color: cTx, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 520, margin: "0 0 12px" }}>
            What if growth wasn&rsquo;t about competing, but <em style={{ color: ACC, fontStyle: "italic" }}>collaborating</em>?
          </h2>
          <div style={{ width: 40, height: 2, background: ACC }} />
        </div>

        <div style={{ width: "100%", maxWidth: 480, height: 1, background: cBd }} />

        {/* Case study */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: MF, fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ACC, marginBottom: 10, display: "block" }}>Case Study</span>
          <h3 style={{ fontFamily: SF, fontSize: "clamp(18px,3.5vw,28px)", fontWeight: 700, color: cTx, lineHeight: 1.15, margin: "0 0 16px" }}>National Tyres &amp; Autocare</h3>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
            {[["Industry","Automotive"],["Market","United Kingdom"],["Challenge","Scale organic revenue"]].map(([k,v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MF, fontSize: 8, color: cTx4, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                <div style={{ fontFamily: GF, fontSize: 13, color: cTx2, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SF, fontSize: 14, fontStyle: "italic", color: cTx3, maxWidth: 420, lineHeight: 1.55, margin: "0 auto" }}>
            &ldquo;We needed a strategy that went beyond traditional link building and paid ads.&rdquo; DMR.agency identified companies serving the same UK car owners, then offered their customers exclusive discounts — the same drivers, zero competition.
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 480, height: 1, background: cBd }} />

        {/* Result */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: MF, fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: cTx4, marginBottom: 8, display: "block" }}>National Tyres &amp; Autocare · Organic Revenue</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: SF, fontSize: "clamp(20px,4vw,28px)", fontWeight: 700, color: cTx3, textDecoration: "line-through", textDecorationColor: cTx4 }}>$160K/mo</span>
            <span style={{ fontSize: 18, color: cTx3 }}>→</span>
            <span style={{ fontFamily: SF, fontSize: "clamp(30px,6vw,48px)", fontWeight: 700, color: ACC, letterSpacing: "-0.03em", lineHeight: 1 }}>$1.2M/mo</span>
          </div>
          <p style={{ fontFamily: SF, fontSize: 13, fontStyle: "italic", color: cTx2, maxWidth: 400, lineHeight: 1.5, margin: "0 auto" }}>
            From organic traffic alone. No paid ads. Just strategic partnerships built by DMR.agency.
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 480, height: 1, background: cBd }} />

        {/* Testimonial + proof */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ maxWidth: 440, width: "100%", padding: "18px 20px", background: cBg2, borderLeft: `3px solid ${ACC}` }}>
            <p style={{ fontFamily: SF, fontSize: 14, fontStyle: "italic", color: cTx2, lineHeight: 1.6, marginBottom: 10 }}>
              &ldquo;Can not thank Syed Irfan Ajmal and the team enough for getting it ranked — they are getting 100s of keywords for this site ranked. Exceptional professionalism.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/assets/testimonials/Azzam_Sheikh_NTA_Testimonial_LinkedIn.png" alt="Azzam Sheikh" style={{ width: 32, height: 32, objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
              <span style={{ fontFamily: GF, fontSize: 11, fontWeight: 700, color: cTx }}>Azzam Sheikh</span>
              <span style={{ fontFamily: MF, fontSize: 8, color: cTx3, marginLeft: 4 }}>Client · LinkedIn</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontFamily: MF, fontSize: 8, color: cTx4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Featured in</span>
            {["FORBES","SEMrush","HBR"].map(n => (
              <span key={n} style={{ fontFamily: GF, fontWeight: 800, fontSize: n === "FORBES" ? 14 : 12, color: cTx3, letterSpacing: n === "FORBES" ? "0.06em" : "0.02em" }}>{n}</span>
            ))}
          </div>
          <span style={{ fontFamily: MF, fontSize: 8, color: cTx4, letterSpacing: "0.08em", textAlign: "center" }}>
            Presented at SEMrush webinar to 1,000+ marketers
          </span>
        </div>
      </div>

      {/* CTA below panel */}
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <div style={{ fontFamily: SF, fontSize: "clamp(22px,4.5vw,32px)", fontWeight: 700, color: TX, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 10 }}>
          Collab<em style={{ color: ACC, fontStyle: "italic" }}>IQ</em>
        </div>
        <p style={{ fontFamily: GF, fontSize: 14, color: TX2, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 20px" }}>
          AI-powered partnership intelligence. Find non-obvious partners, score them, and get your campaign brief in minutes.
        </p>
        <button onClick={onStart} style={{ ...primaryBtn(), fontSize: 14, padding: "16px 40px" }}>Try PartnerCollabIQ free →</button>
        <p style={{ fontFamily: MF, fontSize: 9, color: TX4, marginTop: 10, letterSpacing: "0.1em" }}>No signup required · Results in under 2 minutes</p>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <span style={{ fontFamily: MF, fontSize: 8, color: TX4, letterSpacing: "0.1em" }}>Built by Syed Irfan Ajmal · DMR.agency</span>
      </div>
    </div>
  );
}

// ── Stage Wrapper ──────────────────────────────────────────────────────────────
function StageWrapper({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="v2-stage-animate" style={{ width: "100%", maxWidth: 680, padding: "0 24px" }}>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, color: TX, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 16 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: GF, fontSize: 15, color: TX2, lineHeight: 1.6, marginBottom: 40, marginTop: 0 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// ── Stage 1: Business ──────────────────────────────────────────────────────────
function Stage1({ state, dispatch }: { state: CollabState; dispatch: React.Dispatch<Action> }) {
  const { biz, domain, desc, industry, customInd } = state;
  return (
    <StageWrapper title="Find the partners hiding in plain sight." subtitle="PartnerCollabIQ surfaces non-obvious companies that share your audience but don't compete with you, then gives you the strategy, outreach templates, and campaign brief to close the deal.">
      <div style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 28 }}>
          <label style={lbl(TX2)}>Business name *</label>
          <input style={inp()} placeholder="e.g. Fairground" value={biz} autoFocus
            onChange={e => dispatch({ type: "SET", key: "biz", val: e.target.value })} />
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
    <StageWrapper title="How do you want to earn links?" subtitle="Each approach earns backlinks differently. Pick the strategy that fits your business, then tell us about your audience.">
      <div style={{ marginBottom: 48 }}>
        <label style={lbl(TX2)}>Collab strategy</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {(["discount","institution","badge"] as Strategy[]).map(s => {
            const sel  = strategy === s;
            const info = V2_STRATEGIES[s];
            return (
              <button key={s} onClick={() => dispatch({ type: "SET", key: "strategy", val: s })}
                style={{ padding: "22px 24px", background: sel ? "rgba(245,184,31,0.06)" : BG2,
                  border: `1px solid ${sel ? ACC : BD}`, cursor: "pointer", textAlign: "left",
                  display: "flex", gap: 20, alignItems: "flex-start", transition: "all 0.15s", borderRadius: 0 }}>
                <span style={{ fontFamily: MF, fontSize: 32, fontWeight: 700, lineHeight: 1, color: sel ? ACC : TX4, flexShrink: 0, width: 52 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SF, fontSize: 18, fontWeight: 700, color: sel ? TX : TX2, marginBottom: 4, letterSpacing: "-0.01em" }}>{info.label}</div>
                  <div style={{ fontFamily: GF, fontSize: 13, color: TX3, lineHeight: 1.5 }}>{info.brief}</div>
                </div>
                {sel && <span style={{ width: 22, height: 22, background: ACC, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: BG0, flexShrink: 0 }}>✓</span>}
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
      <StageWrapper title="Finding your partners…" subtitle="PartnerCollabIQ is analysing your industry and generating tailored partnership targets.">
        <div style={{ background: BG2, border: `1px solid ${BD}`, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: MF, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,184,31,0.6)" }}>PartnerCollabIQ · Live Research</span>
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
  // mock data labelled as live, personalised AI results.
  if (error) {
    return (
      <StageWrapper title="The research didn't come back." subtitle="No sample data has been substituted — retry to get live results personalised to your business.">
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
    <StageWrapper title="Your partner intelligence." subtitle={`${partners.length} targets found for ${industry} using ${strat.label}. Select the partners you want in your campaign brief.`}>
      <div style={{ background: "rgba(245,184,31,0.06)", border: `1px solid rgba(245,184,31,0.2)`, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ background: ACC, fontFamily: MF, fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", color: BG0, flexShrink: 0 }}>AI</span>
        <span style={{ fontFamily: GF, fontSize: 12, color: TX2 }}>Each suggestion has been scored by PartnerCollabIQ against 8 partnership criteria: audience overlap, non-competition, domain authority, link placement availability, value exchange potential, existing linking behaviour, contact findability, and brand quality.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${BD}`, marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MF, fontSize: 10, color: TX3, letterSpacing: "0.1em" }}>Generated by PartnerCollabIQ · Personalised to {biz}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {selCount > 0 && <span style={{ fontFamily: MF, fontSize: 10, fontWeight: 700, color: ACC, letterSpacing: "0.1em" }}>{selCount} selected</span>}
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
              <div><span style={{ ...lbl(TX4), fontSize: 8, marginBottom: 4 }}>Link placement</span><span style={{ fontSize: 12, color: INFO, fontWeight: 600, fontFamily: GF }}>{p.linkPage}</span></div>
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
              <div><span style={{ ...lbl(TX4), fontSize: 8, marginBottom: 4 }}>SEO</span><span style={{ fontSize: 12, color: AMB2, fontWeight: 600, fontFamily: GF }}>{p.seoNote}</span></div>
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
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    const text = aiEmail || "";
    const done = (ok: boolean) => { setEmailCopied(ok); setTimeout(()=>setEmailCopied(false), 2000); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(()=>done(true)).catch(()=>{
        // Fallback for browsers that block the async clipboard API
        try {
          const ta = document.createElement("textarea");
          ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.focus(); ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          done(ok);
        } catch { done(false); }
      });
    } else {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        done(ok);
      } catch { done(false); }
    }
  };

  const templates: Record<Strategy, string> = {
    discount:    `Subject: Partnership idea — [THEIR BRAND] × ${biz||"[YOUR BRAND]"}\n\nHi [FIRST NAME],\n\nI'm [YOUR NAME] from ${biz||"[BRAND]"} — we ${desc||"[DESCRIPTION]"}.\n\nI noticed you serve the same audience — [SHARED AUDIENCE] — from a different angle.\n\nProposal: we offer your clients an exclusive [X]% discount. You mention us on your partner page with a link.\n\nThree-way win.\n\n15 minutes to explore this?\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
    institution: `Subject: Exclusive discount for [INSTITUTION] members\n\nHi [CONTACT],\n\nI'm [YOUR NAME] from ${biz||"[BRAND]"}. We ${desc||"[DESCRIPTION]"}.\n\nWe'd love to offer [INSTITUTION] members an exclusive [X]% discount.\n\nAll we'd ask: a mention on your rebate page with a link.\n\nNo strings, no fees.\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
    badge:       `Subject: Featured in our [GUIDE TITLE]\n\nHi [EXPERT],\n\nI'm building a guide: [GUIDE TITLE] — featuring [EXPERT TYPE] ranked by [CRITERIA].\n\nYou'd get:\n→ Feature with credentials + link\n→ "[AWARD]" badge for your site\n→ Promotion to [AUDIENCE]\n\nInterested?\n\n[YOUR NAME]\n${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`,
  };

  return (
    <StageWrapper title="Reach out." subtitle="Pick your target partner, use the template as a starting point, or let AI write a bespoke email.">
      {/* Partner picker */}
      <div style={{ marginBottom: 32 }}>
        <label style={lbl(TX2)}>Who are you emailing?</label>
        <select style={inp()} value={state.scPartner} onChange={e => dispatch({ type: "SET", key: "scPartner", val: e.target.value })}>
          <option value="">Select a partner…</option>
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
          <span style={{ background:ACC, fontFamily:MF, fontSize:8, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 8px", color:BG0 }}>AI</span>
          <span style={{ fontFamily:SF, fontSize:18, fontWeight:700, color:TX, letterSpacing:"-0.01em" }}>Personalised email</span>
        </div>
        <p style={{ fontSize:14, color:TX3, marginBottom:20, fontFamily:GF, lineHeight:1.6 }}>
          PartnerCollabIQ writes a fully personalised email for your chosen partner, tailored to their audience, your offer, and your strategy.
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
            <button onClick={copyEmail}
              style={{ ...ghostBtn(), fontSize:9, padding:"8px 14px", marginTop:10 }}>{emailCopied ? "Copied ✓" : "Copy email"}</button>
          </div>
        )}
      </div>
    </StageWrapper>
  );
}

// ── Stage 5: 90-Day Playbook ───────────────────────────────────────────────────
function Stage5({ state, onGated, aiBrief, aiBriefLoading }: {
  state: CollabState;
  onGated: (action: string) => void;
  aiBrief: string; aiBriefLoading: boolean;
}) {
  const { biz, domain, strategy, industry, customInd, selNiches, audType, geo } = state;
  const ind   = customInd || industry;
  const strat = V2_STRATEGIES[strategy] || V2_STRATEGIES.discount;

  return (
    <StageWrapper title="Your 90-day playbook." subtitle="Generate your full partnership execution plan. Download or copy it when you're done.">

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
            <span style={{ ...lbl(TX4), marginBottom:8 }}>Target partners ({selNiches.length})</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {selNiches.map(n=>(
                <span key={n} style={{ background:"rgba(245,184,31,0.08)", border:"1px solid rgba(245,184,31,0.25)", padding:"4px 12px", fontSize:12, fontWeight:600, color:ACC, fontFamily:GF }}>{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate brief */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ background:ACC, fontFamily:MF, fontSize:8, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 8px", color:BG0 }}>AI</span>
        <span style={{ fontFamily:SF, fontSize:22, fontWeight:700, color:TX, letterSpacing:"-0.02em" }}>90-Day campaign brief</span>
      </div>
      <p style={{ fontFamily:GF, fontSize:14, color:TX3, lineHeight:1.6, marginBottom:20 }}>
        PartnerCollabIQ builds a full 90-day execution plan: phased outreach, success metrics, partner categories, and risk mitigation, tailored to your business and strategy.
      </p>
      <button onClick={()=>onGated("brief")} disabled={aiBriefLoading||!biz}
        style={{ ...primaryBtn(), opacity:(!biz||aiBriefLoading)?0.4:1, fontSize:14, padding:"16px 32px", marginBottom:32 }}>
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
                    <span style={{ fontFamily:MF, fontSize:16, fontWeight:700, color:"rgba(250,250,250,0.1)", lineHeight:1 }}>{num}</span>
                    <span style={{ fontFamily:GF, fontSize:11, fontWeight:800, color:"#f1ebde", textTransform:"uppercase", letterSpacing:"0.04em" }}>{title}</span>
                  </div>
                  <span style={{ fontFamily:MF, fontSize:8, color:"rgba(250,250,250,0.3)", letterSpacing:"0.08em", display:"block", marginBottom:4 }}>{days}</span>
                  <span style={{ fontFamily:GF, fontSize:10, color:"rgba(250,250,250,0.75)", lineHeight:1.5 }}>{desc}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:MF, fontSize:9, color:"rgba(250,250,250,0.3)", letterSpacing:"0.08em", textAlign:"center" }}>
              Full analysis, partner table, outreach template and methodology in the PDF
            </p>
          </div>
          {/* Download / copy — prominent */}
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={()=>onGated("pdf")} style={{ ...primaryBtn(), fontSize:13, padding:"14px 32px" }}>Download full PDF playbook</button>
            <button onClick={()=>onGated("copy")} style={{ ...ghostBtn(), fontSize:13, padding:"14px 20px" }}>Copy brief text</button>
          </div>
        </div>
      )}

      {/* DMR.agency CTA */}
      <div style={{ marginTop:aiBrief?0:16, padding:"24px 28px", background:BG2, border:`1px solid ${BD}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div>
          <span style={{ fontFamily:MF, fontSize:9, color:TX4, letterSpacing:"0.14em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Want someone to execute this for you?</span>
          <span style={{ fontFamily:SF, fontSize:18, fontWeight:700, color:TX, fontStyle:"italic", letterSpacing:"-0.01em" }}>DMR.agency</span>
          <span style={{ fontSize:13, color:TX3, marginLeft:10, fontFamily:GF }}>done for you Digital PR, GEO, SEO, and Content Marketing.</span>
        </div>
        <a href="https://dmr.agency" target="_blank" rel="noopener noreferrer"
          style={{ ...primaryBtn(), textDecoration:"none", fontSize:11, padding:"12px 22px" }}>
          Learn more ↗
        </a>
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
  const STEPS = ["Business","Strategy","Partners","Outreach","90-Day Playbook"];
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
    <div className="v2-wizard-footer" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:90,
      background:t.BG0, borderTop:`1px solid ${t.BDS}`, padding:"14px 32px",
      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, minWidth:0 }}>
        {step>0 && <button onClick={onBack} style={{ ...ghostBtn(), padding:"10px 20px", flexShrink:0 }}>← Back</button>}
        <a className="v2-footer-attribution" href="https://www.syedirfanajmal.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily:MF, fontSize:11, letterSpacing:"0.08em", color:t.TX3, textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" }}>A free tool by Syed Irfan Ajmal · syedirfanajmal.com ↗</a>
        <span className="v2-footer-attribution" style={{ display:"flex", alignItems:"center", gap:7 }}>
          <a href="/privacy" style={{ fontFamily:MF, fontSize:11, letterSpacing:"0.08em", color:t.TX4, textDecoration:"none", fontWeight:600 }}>Privacy</a>
          <span style={{ fontFamily:MF, fontSize:11, color:t.TX4 }}>·</span>
          <a href="/terms" style={{ fontFamily:MF, fontSize:11, letterSpacing:"0.08em", color:t.TX4, textDecoration:"none", fontWeight:600 }}>Terms</a>
        </span>
      </div>
      <span style={{ fontFamily:MF, fontSize:11, color:t.TX4, letterSpacing:"0.08em", flexShrink:0 }}>{`${step + 1} of 5`}</span>
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
// 2026-07-10) — was byte-identical to JournoCollabIQ's copy of this same modal.
// See usage below (variant="subscribe", the default).

// ── Main export ────────────────────────────────────────────────────────────────
export function PartnerCollabIQ({ toolHeaderHeight = 0 }: { toolHeaderHeight?: number }) {
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
  const [isSub, setIsSub]   = useState(()=>{ try { return !!localStorage.getItem(V2_SUB); } catch { return false; } });

  const ind  = state.customInd || state.industry;
  const step = state.step;

  // Apply (light) theme to DOM
  useEffect(()=>{
    document.documentElement.style.background = LIGHT_T.BG1;
    document.body.style.background = LIGHT_T.BG1;
    document.body.style.color = LIGHT_T.TX;
  }, []);

  // Persist state
  useEffect(()=>{ try { localStorage.setItem(V2_STORE, JSON.stringify(state)); } catch { /* noop */ } }, [state]);

  // Loading cycle
  useEffect(()=>{
    if (!loading) { setLoadingIdx(0); return; }
    const t = setInterval(()=>setLoadingIdx(i=>i+1), 2200);
    return ()=>clearInterval(t);
  }, [loading]);

  // Cloudflare Turnstile (same hardened pattern as JournoCollabIQ/SignalIQ:
  // token ref for async reads, render retried when the container mounts,
  // expired-callback auto-reset, waitForToken before every API call)
  const turnstileTokenRef = useRef("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const setToken = (tok: string) => { turnstileTokenRef.current = tok; };

  // The widget container only exists when step>0 — the intro (step 0) is up at
  // mount, so a run-once render finds no container and would never retry.
  function tryRenderTurnstile() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!TURNSTILE_SITE_KEY || !w.turnstile || !turnstileRef.current || turnstileWidgetId.current) return;
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
  }

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).turnstile) { tryRenderTurnstile(); return; }
    const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let s = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
    if (!s) {
      s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
    const onLoad = () => tryRenderTurnstile();
    s.addEventListener("load", onLoad);
    return () => { s?.removeEventListener("load", onLoad); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-attempt render whenever the step changes: the container mounts when the
  // visitor leaves the intro (step 0 → 1), and tearing down/re-rendering is a
  // no-op thanks to the turnstileWidgetId guard.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || state.step === 0) return;
    tryRenderTurnstile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

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

  async function generatePartners() {
    // H6 (2026-07-02 review): no more silent mock fallback. The old behaviour
    // substituted hardcoded sample companies labelled "Generated by
    // PartnerCollabIQ · Personalised to {biz}" whenever the API failed — users
    // could act on stale, non-personalised data believing it was live. Now we
    // show a real error + retry instead.
    setLoading(true); setPartners([]); setLoadingIdx(0); setPartnersError(null);
    try {
      const res = await fetch("/api/collab-ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"partner-suggestions", data:{ biz:state.biz, domain:state.domain, desc:state.desc, industry:ind, audType:state.audType, audDesc:state.audDesc, geo:state.geo, strategy:state.strategy }, turnstileToken: (await waitForToken()) || undefined }),
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
    a.download = `PartnerCollabIQ-Partners-${state.biz||"List"}.csv`; a.click();
  }
  function handleSub(email: string) {
    try { localStorage.setItem(V2_SUB, JSON.stringify({ email, ts:Date.now() })); } catch { /* noop */ }
    setIsSub(true);
    setTimeout(()=>{ if(gatedAction) perform(gatedAction); setGatedAction(null); }, 1300);
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
        doc.text("PartnerCollabIQ",M,footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(80,70,60);
        doc.text("  ·  syedirfanajmal.com/tools/collabiq  ·  Syed Irfan Ajmal  ·  DMR.agency",M+18,footY);
        doc.setTextColor(80,70,60);
      } else {
        doc.setFillColor(...CREAM); doc.rect(0,H-16,W,16,"F");
        doc.setDrawColor(220,215,205); doc.setLineWidth(0.3); doc.line(0,H-16,W,H-16);
        doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(...INK);
        doc.text("PartnerCollabIQ",M,footY);
        doc.setFont("helvetica","normal"); doc.setTextColor(...GREY);
        doc.text("  ·  syedirfanajmal.com/tools/collabiq  ·  Syed Irfan Ajmal  ·  DMR.agency",M+18,footY);
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
    doc.text("Syed Irfan Ajmal  ·  DMR.agency", M+16, 22);
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

    // ════ FINAL PAGE: DMR.agency CTA (DARK) ══════════════════════════════
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
    doc.text("WANT SOMEONE TO EXECUTE THIS FOR YOU?",W/2,cy+1,{align:"center"});
    cy+=12;
    doc.setFont("helvetica","bold"); doc.setFontSize(34); doc.setTextColor(...CREAM);
    doc.text("DMR.agency",W/2,cy,{align:"center"}); cy+=14;
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(140,128,110);
    const sub=doc.splitTextToSize("Partnership outreach, link building, and co-marketing execution — handled end-to-end by the team at DMR.agency.",120) as string[];
    doc.text(sub,W/2,cy,{align:"center"}); cy+=sub.length*7+14;
    const inclusions=["Partner identification & vetting","Outreach execution and follow-up","Backlink & co-marketing placements","Reporting on results, not just activity"];
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
    doc.text("Learn more at dmr.agency",W/2,cy+9,{align:"center"});
    // Attribution well above footer zone — no overlap
    doc.setFontSize(7); doc.setTextColor(55,46,36);
    doc.text(`Generated via PartnerCollabIQ  ·  ${date}`,W/2,H-24,{align:"center"});
    pageFooter(lastPage,true);

    doc.save(`PartnerCollabIQ-Playbook-${bizName.replace(/\s+/g,"-")}.pdf`);
  }

  async function generateAiEmail() {
    setAiEmailLoading(true);
    try {
      const scoreTotal = Object.values(state.scores).reduce((a,b)=>a+b,0);
      const scorePct   = Math.round((scoreTotal / (V2_SCORECARD.length * 2)) * 100);
      const res = await fetch("/api/collab-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
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
      const res = await fetch("/api/collab-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
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
      navigator.clipboard.writeText(`PartnerCollabIQ Brief\nBusiness: ${state.biz}\nIndustry: ${ind}\nStrategy: ${V2_STRATEGIES[state.strategy]?.label}\n\nSelected Partners:\n${state.selNiches.join(", ")||"None"}\n\n${aiBrief||""}`);
    } else if (action==="pdf")   { generatePDF(); }
    else if (action==="email")   { generateAiEmail(); }
    else if (action==="brief")   { generateAiBrief(); }
    else if (action==="csv")     { downloadCsv(); }
  }

  const canAdvance = [
    ()=>true,
    ()=>!!state.biz&&!!ind,
    ()=>true,
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
        {step>0 && <WizardProgress step={step-1} onLogoClick={()=>dispatch({type:"GO",step:0})} topOffset={toolHeaderHeight} />}

        <div key={`stage-${step}`}>
          {step===0 && <Stage0 onStart={()=>dispatch({type:"GO",step:1})} />}
          {step===1 && <Stage1 state={state} dispatch={dispatch} />}
          {step===2 && <Stage2 state={state} dispatch={dispatch} />}
          {step===3 && <Stage3 partners={partners} loading={loading} loadingIdx={loadingIdx} industry={ind} strategy={state.strategy} biz={state.biz} selNiches={state.selNiches} onToggle={n=>dispatch({type:"TOGGLE_NICHE",val:n})} onScore={(n,c)=>dispatch({type:"SCORE_PARTNER",name:n,cat:c})} onGatedCsv={handleGatedCsv} error={partnersError} onRetry={generatePartners} />}
          {step===4 && <Stage4 state={state} dispatch={dispatch} partners={partners} onGated={handleGated} aiEmail={aiEmail} aiEmailLoading={aiEmailLoading} />}
          {step===5 && <Stage5 state={state} onGated={handleGated} aiBrief={aiBrief} aiBriefLoading={aiBriefLoading} />}
        </div>

        {/* Cloudflare Turnstile human check — renders only when the site key is set */}
        {TURNSTILE_SITE_KEY && step>0 && (
          <div style={{ display:"flex", justifyContent:"center", padding:"8px 0 96px" }}>
            <div ref={turnstileRef} />
          </div>
        )}

        {step>0 && <WizardFooter step={step-1} onBack={goBack} onNext={goNext} nextLabel={nextLabels[step]} nextDisabled={!canAdvance[step]()} />}

        <EmailGateModal variant="subscribe" show={showGate} onClose={()=>{setShowGate(false);setGatedAction(null);}} onSubscribe={handleSub} />
      </div>
    </>
  );
}

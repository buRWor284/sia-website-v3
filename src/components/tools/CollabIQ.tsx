"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, SERIF, GROT, MONO,
} from "@/lib/tokens";

// ── Dark-panel tokens ─────────────────────────────────────────
const DARK        = "#0e0d0a";
const DARK2       = "#181510";
const DARK3       = "#221e17";
const DARK_BORDER = "#2a2318";
const AMBER       = "#a85000";
const BLUE        = "#1e4d80";
const GREEN       = "#1f6b3a";

// ── Types ─────────────────────────────────────────────────────
type Strategy = "discount" | "institution" | "badge";
type AiMode   = "suggestions" | "email" | "brief" | null;

interface AiPartner {
  name:     string;
  url:      string;
  why:      string;
  linkPage: string;
  contact:  string;
  seoNote:  string;
  tier:     "A" | "B" | "C";
}

// ── Loading messages ─────────────────────────────────────────
const LOADING_MSGS = [
  { h: "Scanning the internet for your perfect partners…",       s: "Claude is cross-referencing your industry, audience, and strategy in real time." },
  { h: "Finding companies that want your audience's attention…", s: "Identifying non-competing businesses with overlapping customer bases." },
  { h: "Cross-referencing DA scores and partner page structures…", s: "Not all backlinks are equal. We're only surfacing ones worth your time." },
  { h: "No link building agency was harmed in this process.",    s: "Unlike an agency, Claude doesn't charge £5,000/month to do this." },
  { h: "Profiling who contacts on LinkedIn…",                    s: "Head of Partnerships? SEO Manager? We're identifying the right inbox." },
  { h: "Your future backlinks are being located.",               s: "Finding the deals that your competitors haven't thought of yet." },
  { h: "Claude is reading the entire internet. Almost done.",    s: "We're not actually reading the whole internet. Just the useful parts." },
  { h: "Finding the non-obvious partners other SEOs miss…",      s: "The best collab partners are rarely the first ones you think of." },
  { h: "Calculating audience overlap with suspicious accuracy…", s: "Mapping shared customers, distribution channels, and partnership fit." },
  { h: "Compiling a report that would take an agency a week.",   s: "You're getting this in about 10 seconds. You're welcome." },
];

// ── Constants ────────────────────────────────────────────────
const INDUSTRIES = [
  "Automotive","Home & Real Estate","Finance & Insurance","Health & Wellness",
  "Travel & Hospitality","Fashion & Apparel","Food & Beverage","SaaS / Software",
  "E-commerce / Retail","Legal Services","Education / EdTech","Pet Care",
  "Wedding & Events","Fitness & Sports","Marketing / Agency",
];

const SCORECARD_QS = [
  { q: "Do they serve the same target audience?",           sub: "Would their ideal customer also consider buying from you?" },
  { q: "Are they genuinely non-competing with your offer?", sub: "A customer choosing them doesn't mean they won't also choose you." },
  { q: "Do they have a real web presence with domain authority?", sub: "Check their site has content and backlinks (Ahrefs/SEMrush)." },
  { q: "Do they have a page where a link could logically live?",  sub: "Partner page, deals page, resources section — a natural home." },
  { q: "Is there a clear value exchange you can offer?",    sub: "Discount code, institutional listing, badge — something concrete." },
  { q: "Do they already link to complementary brands?",     sub: "Check their blog, resources page, or footer." },
  { q: "Can you find a specific named contact?",            sub: "A named person on LinkedIn — not a generic info@ address." },
  { q: "Is their brand quality and reputation solid?",      sub: "You'll be associated with them. A spammy site hurts your authority." },
];

const CHECKLIST = [
  { text: "Study your top 3 competitors' backlink profiles", sub: "Ahrefs or SEMrush — look for clusters of links from the same type of site." },
  { text: "Identify the right contact at the target company", sub: "LinkedIn: Head of Marketing, SEO Manager, Partnerships Lead, Student Services." },
  { text: "Research the company before writing anything",    sub: "Know their products, tone, audience, and existing partner perks." },
  { text: "Prepare a specific mutual-value proposition",     sub: "What do THEY get? A discount, a featured spot, a badge." },
  { text: "Create or identify a linkable asset",             sub: "Discount code, expert guide, badge embed — something with a URL to link to." },
  { text: "Check if they already have a partner/deals page", sub: "If they do, your pitch has a ready home." },
  { text: "Set a follow-up reminder for 5–7 business days",  sub: "Most deals happen on follow-up. One email rarely closes." },
  { text: "Track outreach in a spreadsheet",                 sub: "Company, contact, email sent, date, response, outcome." },
];

const STRATEGY_DETAILS: Record<Strategy, { label: string; detail: string; actions: string[] }> = {
  discount:    { label: "Discount Partnership",    detail: "Offer a discount code or referral deal to your target partner's customers. The partner promotes the deal and links to your site from their partner page or deals section. Three-way win: you earn links and referral traffic, they offer their clients added value, their customers get a deal. NTA used this with car insurance and leasing companies to grow from £165K to over £1M/month in organic revenue.", actions: ["Identify 10–20 target companies per partner category","Create a unique discount code or landing page for each partner","Find the Head of Marketing or Partnerships Manager on LinkedIn","Send personalised outreach using the Discount Partnership template","Negotiate a contextual in-content link — not just a footer mention","Track which partner pages go live and monitor monthly in Ahrefs","Follow up with performance data to strengthen the relationship over time"] },
  institution: { label: "Institution Rebate",      detail: ".edu, .gov, and .org backlinks are among the hardest to earn — but the Institution Rebate model provides a direct, scalable path to them. Offer an exclusive discount for students, members, or citizens of an institution. They list the deal on their rebate or resources page. A fitness supplements brand earned dozens of .edu backlinks using this approach at scale.", actions: ["Build a list of 20–50 relevant universities, colleges, or associations","Create a dedicated institution discount landing page per institution","Find the Student Services, Welfare Officer, or Member Benefits contact","Keep outreach short and benefit-led","Ask them to list it on their student discounts or member benefits page","Monitor .edu/.org link acquisitions monthly in Ahrefs","Expand to professional associations, trade bodies, and alumni networks"] },
  badge:       { label: "Expert Roundup + Badge",  detail: "Create a high-quality guide featuring experts, coaches, or practitioners adjacent to your audience. Rank them by a transparent KPI. Award each expert a badge embedded with your URL. Every expert who displays the badge gives you an automatic backlink. The sports accessories brand used this with swimming coaches — the guide provided value, the badge provided a scalable backlink engine.", actions: ["Choose a topic your audience cares about and identify relevant expert types","Build a list of 30–50 experts via LinkedIn, Google, and Instagram","Define transparent ranking criteria — certifications, following, years active","Send outreach inviting them to be featured — make the value clear","Create the expert guide with quality writing and expert quotes","Design a branded Featured Expert badge with your URL in the HTML embed code","Publish and notify all featured experts — track badge usage monthly"] },
};

const TIER_COLORS: Record<string, string> = { A: "#c4900a", B: BLUE, C: INK55 };
const TIER_BG: Record<string, string>     = { A: "#fdf8ec", B: "#edf2fb", C: "#f5f3f0" };

// ── JSON parser ───────────────────────────────────────────────
function parsePartners(raw: string): AiPartner[] {
  try {
    const direct = JSON.parse(raw);
    if (Array.isArray(direct)) return direct as AiPartner[];
  } catch { /* fall through */ }
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed as AiPartner[];
    } catch { /* fall through */ }
  }
  return [];
}

// ── Shared style helpers ──────────────────────────────────────
const monoLabel = (color = "rgba(241,235,222,0.45)"): React.CSSProperties => ({
  fontFamily: MONO, fontSize: 9, fontWeight: 700,
  letterSpacing: "0.2em", textTransform: "uppercase" as const,
  color, marginBottom: 12, display: "block",
});
const fieldLabel: React.CSSProperties = {
  fontFamily: MONO, fontSize: 8, fontWeight: 700,
  letterSpacing: "0.16em", textTransform: "uppercase" as const,
  color: INK35, marginBottom: 5, display: "block",
};
const mkBtn = (variant: "dark"|"yel"|"outline"): React.CSSProperties => ({
  display: "inline-block", padding: "10px 22px",
  fontFamily: GROT, fontSize: 10, fontWeight: 800,
  letterSpacing: "0.1em", textTransform: "uppercase" as const, cursor: "pointer",
  border: `2px solid ${variant === "dark" ? DARK : variant === "yel" ? YEL : INK35}`,
  background: variant === "dark" ? DARK : variant === "yel" ? YEL : "transparent",
  color: variant === "dark" ? YEL : variant === "yel" ? DARK : INK,
  transition: "all 0.15s",
});
const lpInput: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: DARK3, border: `1px solid ${DARK_BORDER}`,
  fontFamily: GROT, fontSize: 13, color: PAPER,
  outline: "none", marginBottom: 10,
};
const rpInput: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: PAPER, border: `1px solid ${INK15}`,
  fontFamily: GROT, fontSize: 13, color: INK,
  outline: "none", marginBottom: 16,
};

// ── Main Component ────────────────────────────────────────────
export function CollabIQ() {
  // inputs
  const [biz,        setBiz]        = useState("");
  const [domain,     setDomain]     = useState("");
  const [desc,       setDesc]       = useState("");
  const [industry,   setIndustry]   = useState("");
  const [customInd,  setCustomInd]  = useState("");
  const [strategy,   setStrategy]   = useState<Strategy>("discount");
  const [audType,    setAudType]    = useState("");
  const [geo,        setGeo]        = useState("");
  const [audDesc,    setAudDesc]    = useState("");
  const [customInput,setCustomInput]= useState("");
  const [customPartners, setCustomPartners] = useState<string[]>([]);
  const [selNiches,  setSelNiches]  = useState<string[]>([]);

  // scorecard
  const [scPartner,  setScPartner]  = useState("");
  const [scCat,      setScCat]      = useState("");
  const [scores,     setScores]     = useState<Record<number, number>>({});
  const [checklist,  setChecklist]  = useState<boolean[]>(CHECKLIST.map(() => false));

  // template tab
  const [tplTab,     setTplTab]     = useState<Strategy>("discount");

  // AI state
  const [aiMode,       setAiMode]       = useState<AiMode>(null);
  const [aiPartners,   setAiPartners]   = useState<AiPartner[]>([]);
  const [aiEmail,      setAiEmail]      = useState("");
  const [aiBrief,      setAiBrief]      = useState("");
  const [aiError,      setAiError]      = useState("");
  const [hasTriggered, setHasTriggered] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const ind = customInd || industry;

  // score derived
  const scoreTotal  = Object.values(scores).reduce((a, b) => a + b, 0);
  const scorePct    = Math.round((scoreTotal / (SCORECARD_QS.length * 2)) * 100);
  const scoreVerdict =
    scorePct >= 70 ? `Strong prospect (${scorePct}%). Prioritise and personalise your pitch.` :
    scorePct >= 45 ? `Moderate fit (${scorePct}%). Review low-scoring criteria before outreach.` :
    scorePct  > 0  ? `Low fit (${scorePct}%). Find a higher-scoring target first.` : "";

  // ── AI partner suggestions — auto-trigger on industry+strategy change
  const prevKey = useRef("");
  const triggerPartners = useCallback(async (currentInd: string, currentStrat: Strategy) => {
    if (!currentInd) return;
    setAiMode("suggestions");
    setAiError("");
    try {
      const res = await fetch("/api/collab-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partner-suggestions",
          data: { biz, domain, desc, industry: currentInd, audType, audDesc, geo, strategy: currentStrat },
        }),
      });
      const json = await res.json() as { result?: string; error?: string };
      if (json.error) throw new Error(json.error);
      const parsed = parsePartners(json.result || "");
      setAiPartners(parsed);
      setHasTriggered(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setAiMode(null);
    }
  }, [biz, domain, desc, audType, audDesc, geo]);

  useEffect(() => {
    if (!ind) return;
    const key = `${ind}|${strategy}`;
    if (key === prevKey.current) return;
    prevKey.current = key;
    const t = setTimeout(() => triggerPartners(ind, strategy), 600);
    return () => clearTimeout(t);
  }, [ind, strategy, triggerPartners]);

  // ── Cycle loading messages while AI is running
  useEffect(() => {
    if (aiMode !== "suggestions") { setLoadingMsgIdx(0); return; }
    const t = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MSGS.length), 2800);
    return () => clearInterval(t);
  }, [aiMode]);

  // ── AI email
  const callEmail = useCallback(async () => {
    setAiMode("email");
    setAiError("");
    try {
      const res = await fetch("/api/collab-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email-writer",
          data: { biz, domain, desc, industry: ind, audType, audDesc, geo, strategy, partner: scPartner, partnerCat: scCat, scorePct },
        }),
      });
      const json = await res.json() as { result?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setAiEmail(json.result || "");
    } catch (e) { setAiError(e instanceof Error ? e.message : "Error"); }
    finally { setAiMode(null); }
  }, [biz, domain, desc, ind, audType, audDesc, geo, strategy, scPartner, scCat, scorePct]);

  // ── AI brief
  const callBrief = useCallback(async () => {
    setAiMode("brief");
    setAiError("");
    try {
      const res = await fetch("/api/collab-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign-brief",
          data: { biz, domain, desc, industry: ind, audType, audDesc, geo, strategy, stratLabel: STRATEGY_DETAILS[strategy].label, selNiches, partner: scPartner, partnerCat: scCat, scorePct, verdictText: scoreVerdict },
        }),
      });
      const json = await res.json() as { result?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setAiBrief(json.result || "");
    } catch (e) { setAiError(e instanceof Error ? e.message : "Error"); }
    finally { setAiMode(null); }
  }, [biz, domain, desc, ind, audType, audDesc, geo, strategy, selNiches, scPartner, scCat, scorePct, scoreVerdict]);

  // ── PDF
  const downloadPDF = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDFLib = (window as any).jspdf;
    if (!jsPDFLib) { alert("PDF library still loading — please try again in a moment."); return; }
    const { jsPDF } = jsPDFLib;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W=210,H=297,M=20,CW=170; let y: number;
    const tc=(...c: number[])=>doc.setTextColor(...c);
    const fc=(...c: number[])=>doc.setFillColor(...c);
    const dc=(...c: number[])=>doc.setDrawColor(...c);
    const BLK=[26,20,16],YELC=[245,184,31],DRK=[14,13,10],PAP=[241,235,222],MID=[107,96,84],MID2=[160,148,130],BDR=[220,210,195],AMB=[168,80,0],BLU=[30,77,128];
    function phdr(){fc(...DRK);doc.rect(0,0,W,11,"F");fc(...YELC);doc.rect(0,0,W,2,"F");tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("COLLABIQ  ·  PARTNERSHIP INTELLIGENCE  ·  SIA WIRE",M,7.5);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.text("syedirfanajmal.com",W-M,7.5,{align:"right"});}
    function np(){doc.addPage();phdr();return 22;}
    function need(cy: number,h: number){return cy+h>H-18?np():cy;}
    function shdr(label: string,cy: number){cy=need(cy,14);tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text(label.toUpperCase(),M,cy);cy+=2;dc(...BDR);doc.setLineWidth(0.25);doc.line(M,cy,W-M,cy);return cy+7;}
    function row(key: string,val: string,cy: number){cy=need(cy,9);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text(key,M,cy);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const lines=doc.splitTextToSize(val||"—",CW-52);doc.text(lines,M+50,cy);const h=Math.max(7,lines.length*5.2);dc(...BDR);doc.setLineWidth(0.15);doc.line(M,cy+h-2.5,W-M,cy+h-2.5);return cy+h;}
    const sd=STRATEGY_DETAILS[strategy];
    const dateStr=new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"});
    // Cover
    fc(...DRK);doc.rect(0,0,W,H,"F");fc(...YELC);doc.rect(0,0,W,3,"F");
    tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("COLLABIQ  ·  SIA WIRE  ·  S02E06",M,26);
    tc(...PAP);doc.setFont("helvetica","bold");doc.setFontSize(42);doc.text("Collab",M,72);tc(...YELC);doc.text("IQ",M+62,72);
    tc(...PAP);doc.setFont("helvetica","normal");doc.setFontSize(20);doc.text("Partnership Intelligence Brief",M,88);
    dc(40,36,30);doc.setLineWidth(0.4);doc.line(M,96,W-M,96);
    if(biz){tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text("Prepared for:",M,108);tc(...PAP);doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text(biz,M,118);}
    fc(26,22,18);doc.rect(M,130,110,11,"F");tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.text("STRATEGY: "+sd.label.toUpperCase(),M+5,137);
    if(ind){tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Industry: "+ind,M,153);}
    tc(...MID);doc.text("Generated: "+dateStr,M,161);
    fc(...YELC);doc.rect(M,H-58,CW,30,"F");tc(...DRK);doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text("Want press coverage before your Series A?",M+6,H-45);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Earned Media OS  ·  dmr.agency/earnedmediaos",M+6,H-36);doc.link(M,H-58,CW,30,{url:"https://dmr.agency/earnedmediaos/"});
    tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.text("syedirfanajmal.com  ·  The SIA Business Podcast  ·  Season 2 Episode 6",W/2,H-10,{align:"center"});
    // Business page
    y=np();y=shdr("01 — Business Overview",y);y=row("Business",biz,y);y=row("Website",domain,y);y=row("Description",desc,y);y=row("Industry",ind,y);y=row("Audience",audType,y);y=row("Geography",geo,y);y=row("Strategy",sd.label,y);y+=4;
    if(audDesc){y=need(y,22);y=shdr("Target Customer",y);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const al=doc.splitTextToSize(audDesc,CW);al.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=5.2;});y+=6;}
    if(selNiches.length){y=need(y,20);y=shdr("Selected Partner Targets",y);selNiches.forEach(n=>{y=need(y,8);fc(...PAP);doc.rect(M,y-4,CW,8,"F");tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9.5);doc.text("→  "+n,M+4,y+1);y+=9;});}
    // AI Partners page
    if(aiPartners.length){
      y=np();y=shdr("02 — AI-Generated Partner Suggestions",y);
      tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.text("Strategy: "+sd.label+"  ·  "+aiPartners.length+" targeted partners  ·  Generated by Claude",M,y);y+=8;
      aiPartners.forEach((p,i)=>{
        y=need(y,42);
        const tierC = p.tier==="A"?[196,144,10]:p.tier==="B"?[30,77,128]:[107,96,84];
        fc(...tierC);doc.rect(M,y-4.5,CW,2,"F");
        fc(...DRK);doc.rect(M,y-2.5,CW,13,"F");
        tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("TIER "+p.tier,M+3,y+2);
        tc(...PAP);doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text(p.name+(p.url?" · "+p.url:""),M+18,y+2);y+=14;
        tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("WHY THEY FIT",M+2,y);y+=4.5;
        tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9);const wl=doc.splitTextToSize(p.why,CW-4);wl.forEach((l: string)=>{y=need(y,6);doc.text(l,M+2,y);y+=4.8;});y+=2;
        tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("LINK PLACEMENT",M+2,y);tc(...BLU);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(p.linkPage,M+40,y);y+=5;
        tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("WHO TO CONTACT",M+2,y);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(p.contact,M+42,y);y+=5;
        tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("SEO POTENTIAL",M+2,y);tc(...AMB);doc.setFont("helvetica","normal");doc.setFontSize(9);const sl=doc.splitTextToSize(p.seoNote,CW-40);doc.text(sl,M+38,y);y+=sl.length*4.8+4;
        dc(...BDR);doc.setLineWidth(0.2);doc.line(M,y-2,W-M,y-2);i<aiPartners.length-1&&(y+=4);
      });
    }
    // Actions page
    y=np();
    if(scPartner){y=shdr("03 — Qualified Partner",y);y=row("Company",scPartner,y);y=row("Category",scCat,y);y=row("Fit Score",scorePct+"%",y);y=row("Verdict",scoreVerdict,y);y+=6;}
    y=need(y,20);y=shdr("04 — Strategy Overview",y);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const sdL=doc.splitTextToSize(sd.detail,CW);sdL.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=5;});y+=8;
    y=need(y,20);y=shdr("05 — Next Actions",y);sd.actions.forEach((a,i)=>{y=need(y,14);fc(...DRK);doc.circle(M+3.5,y-1.5,2.8,"F");tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text(String(i+1),M+2.5,y-0.5);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const al=doc.splitTextToSize(a,CW-12);al.forEach((l: string)=>{y=need(y,6);doc.text(l,M+10,y);y+=5;});y+=3;});
    if(aiBrief){y=need(y,20);y=shdr("06 — AI Campaign Brief",y);tc(...BLK);doc.setFont("helvetica","normal");doc.setFontSize(9);const bl=doc.splitTextToSize(aiBrief.replace(/#{1,3}\s/g,"").replace(/\*\*/g,""),CW);bl.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=4.8;});}
    // EMOS page
    doc.addPage();fc(...DRK);doc.rect(0,0,W,H,"F");fc(...YELC);doc.rect(0,0,W,3,"F");
    tc(...YELC);doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("EARNED MEDIA OS  ·  SYED IRFAN AJMAL",M,22);
    tc(90,84,72);doc.setFont("helvetica","normal");doc.setFontSize(12);doc.text("Want press coverage before your Series A?",M,58);
    tc(...PAP);doc.setFont("helvetica","bold");doc.setFontSize(32);doc.text("Earned Media OS",M,78);
    dc(40,36,30);doc.setLineWidth(0.3);doc.line(M,85,M+90,85);
    tc(...YELC);doc.setFont("helvetica","normal");doc.setFontSize(14);doc.text("The system for founders who want press",M,96);doc.text("before their Series A.",M,108);
    tc(90,84,72);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const cL=doc.splitTextToSize("EMOS gives pre-Series A founders a step-by-step system for generating earned media — the kind that makes investors take notice, builds trust with enterprise buyers, and creates leverage before fundraising. No PR agency retainer.",CW);cL.forEach((l: string,i: number)=>doc.text(l,M,120+i*5.8));
    fc(...YELC);doc.rect(M,154,106,14,"F");tc(...DRK);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("dmr.agency/earnedmediaos",M+7,163);doc.link(M,154,106,14,{url:"https://dmr.agency/earnedmediaos/"});
    tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Generated using CollabIQ — SIA Wire S02E06",M,182);tc(...YELC);doc.text("syedirfanajmal.com",M,196);doc.link(M,190,60,10,{url:"https://syedirfanajmal.com"});
    const total=doc.internal.getNumberOfPages();for(let i=2;i<=total-1;i++){doc.setPage(i);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.text(`${i-1} / ${total-2}`,W-M,H-8,{align:"right"});}
    doc.save((biz?biz.replace(/[^a-z0-9]/gi,"_").toLowerCase()+"_":"")+"collabiq_brief.pdf");
  }, [aiPartners, aiBrief, biz, domain, desc, ind, audType, audDesc, geo, strategy, selNiches, scPartner, scCat, scorePct, scoreVerdict]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "calc(100svh - 56px)", fontFamily: GROT }}>

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <aside style={{ width: 348, flexShrink: 0, background: DARK2, borderRight: `1px solid ${DARK_BORDER}`, position: "sticky", top: 56, height: "calc(100svh - 56px)", overflowY: "auto" }}>

        {/* Logo */}
        <div style={{ padding: "26px 24px 22px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: PAPER, letterSpacing: "-0.025em", lineHeight: 1 }}>
            Collab<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,235,222,0.22)", marginTop: 8, lineHeight: 1.7 }}>
            Partnership intelligence<br />by Syed Irfan Ajmal · SIA Wire
          </div>
        </div>

        {/* Business */}
        <Lsec label="Your Business">
          <input style={lpInput} placeholder="Business name" value={biz} onChange={e => setBiz(e.target.value)} />
          <input style={lpInput} placeholder="Website (e.g. brex.com)" value={domain} onChange={e => setDomain(e.target.value)} />
          <input style={{ ...lpInput, marginBottom: 0 }} placeholder="What you do in one sentence" value={desc} onChange={e => setDesc(e.target.value)} />
        </Lsec>

        {/* Industry */}
        <Lsec label="Industry — select to generate partners">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 12 }}>
            {INDUSTRIES.map(i => {
              const isSel = industry === i && !customInd;
              return (
                <span key={i} onClick={() => { setIndustry(i); setCustomInd(""); setAiPartners([]); setHasTriggered(false); prevKey.current = ""; }}
                  style={{ padding: "5px 9px", border: `1px solid ${isSel ? YEL : DARK_BORDER}`, fontSize: 11, fontWeight: 600, cursor: "pointer", background: isSel ? YEL : "transparent", color: isSel ? DARK : "rgba(241,235,222,0.38)", transition: "all 0.1s", userSelect: "none" }}>
                  {i}
                </span>
              );
            })}
          </div>
          <input style={{ ...lpInput, marginBottom: 0 }} placeholder="Or type a custom industry…" value={customInd} onChange={e => { setCustomInd(e.target.value); if (e.target.value) { setIndustry(""); setAiPartners([]); setHasTriggered(false); prevKey.current = ""; } }} />
        </Lsec>

        {/* Strategy */}
        <Lsec label="Collab Strategy">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${DARK_BORDER}` }}>
            {(["discount","institution","badge"] as Strategy[]).map((s, i) => (
              <button key={s} onClick={() => { setStrategy(s); setAiPartners([]); setHasTriggered(false); prevKey.current = ""; }}
                style={{ padding: "13px 6px", border: "none", borderRight: i < 2 ? `1px solid ${DARK_BORDER}` : "none", background: strategy === s ? YEL : "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: strategy === s ? DARK : "rgba(241,235,222,0.3)", lineHeight: 1.6, transition: "all 0.12s" }}>
                <span style={{ fontSize: 8, opacity: 0.5, display: "block", marginBottom: 2 }}>0{i+1}</span>
                {s === "discount" ? "Discount" : s === "institution" ? "Institution" : "Expert"}<br />
                {s === "discount" ? "Partnership" : s === "institution" ? "Rebate" : "Roundup"}
              </button>
            ))}
          </div>
        </Lsec>

        {/* Audience */}
        <Lsec label="Audience">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <select style={{ ...lpInput, marginBottom: 0, cursor: "pointer" }} value={audType} onChange={e => setAudType(e.target.value)}>
              <option value="">Audience type</option>
              <option>B2C Consumers</option><option>B2B Small Businesses</option>
              <option>B2B Mid-Market / Enterprise</option><option>Both B2B and B2C</option>
            </select>
            <select style={{ ...lpInput, marginBottom: 0, cursor: "pointer" }} value={geo} onChange={e => setGeo(e.target.value)}>
              <option value="">Geography</option>
              <option>Global</option><option>United Kingdom</option><option>United States</option>
              <option>North America</option><option>Europe</option><option>Australia / NZ</option>
              <option>Asia-Pacific</option><option>Local / City</option>
            </select>
          </div>
          <textarea style={{ ...lpInput, marginBottom: 0, resize: "vertical" as const, minHeight: 72 }} placeholder="Describe your typical customer…" value={audDesc} onChange={e => setAudDesc(e.target.value)} />
        </Lsec>

        {/* Custom partners */}
        <Lsec label="Add Custom Targets">
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...lpInput, marginBottom: 0, flex: 1 }} placeholder="Company or category…" value={customInput} onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter"){const v=customInput.trim();if(v&&!customPartners.includes(v)){setCustomPartners(p=>[...p,v]);setSelNiches(n=>[...n,v]);}setCustomInput("");}}} />
            <button onClick={() => {const v=customInput.trim();if(v&&!customPartners.includes(v)){setCustomPartners(p=>[...p,v]);setSelNiches(n=>[...n,v]);}setCustomInput("");}}
              style={{ padding:"10px 12px",background:"transparent",border:`1px solid ${DARK_BORDER}`,color:"rgba(241,235,222,0.4)",fontFamily:MONO,fontSize:10,fontWeight:700,cursor:"pointer" }}>
              Add
            </button>
          </div>
          {customPartners.length > 0 && (
            <div style={{ display:"flex",flexWrap:"wrap" as const,gap:5,marginTop:10 }}>
              {customPartners.map(p => (
                <span key={p} onClick={() => {setCustomPartners(cp=>cp.filter(x=>x!==p));setSelNiches(n=>n.filter(x=>x!==p));}}
                  style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",background:"rgba(245,184,31,0.1)",border:"1px solid rgba(245,184,31,0.2)",fontFamily:MONO,fontSize:9,fontWeight:600,color:"rgba(245,184,31,0.7)",cursor:"pointer" }}>
                  ✕ {p}
                </span>
              ))}
            </div>
          )}
        </Lsec>
      </aside>

      {/* ══ RIGHT PANEL ════════════════════════════════════════ */}
      <main style={{ flex: 1, background: PAPER }}>

        {/* ── 01 PARTNER INTELLIGENCE ── */}
        <Rsec num="01" title="Partner Intelligence" action={aiPartners.length ? `${aiPartners.length} partners found` : ""}>
          <div style={{ padding: "0 32px 32px" }}>

            {/* Empty / prompt state */}
            {!ind && aiMode !== "suggestions" && (
              <div style={{ padding: "52px 0", textAlign: "center" as const }}>
                <p style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: INK35, lineHeight: 1.6, marginBottom: 12 }}>
                  Select your industry on the left to generate tailored partner targets.
                </p>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: INK35 }}>
                  Powered by Claude · personalised to your exact business
                </span>
              </div>
            )}

            {/* ── Animated loading state ── */}
            {aiMode === "suggestions" && (
              <div>
                <style>{`
                  @keyframes ciq-fade {
                    from { opacity: 0; transform: translateY(5px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes ciq-dot {
                    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                    40%           { opacity: 1;   transform: scale(1); }
                  }
                  @keyframes ciq-shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                  }
                  .ciq-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${YEL}; animation: ciq-dot 1.4s ease-in-out infinite; }
                  .ciq-dot:nth-child(2) { animation-delay: 0.16s; }
                  .ciq-dot:nth-child(3) { animation-delay: 0.32s; }
                  .ciq-shimmer {
                    background: linear-gradient(90deg, rgba(26,20,16,.07) 25%, rgba(26,20,16,.13) 50%, rgba(26,20,16,.07) 75%);
                    background-size: 800px 100%;
                    animation: ciq-shimmer 1.6s ease-in-out infinite;
                  }
                `}</style>

                {/* Hero loading block */}
                <div style={{ background: DARK, padding: "28px 28px 24px", marginBottom: 2 }}>
                  {/* Top row: label + dots */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(245,184,31,0.55)" }}>
                        Claude · Live Research
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <span className="ciq-dot" />
                      <span className="ciq-dot" />
                      <span className="ciq-dot" />
                    </div>
                  </div>

                  {/* Cycling headline — remounts on idx change to replay animation */}
                  <div key={`h-${loadingMsgIdx}`} style={{ animation: "ciq-fade 0.45s ease both" }}>
                    <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: PAPER, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 10 }}>
                      {LOADING_MSGS[loadingMsgIdx].h}
                    </div>
                    <div style={{ fontFamily: GROT, fontSize: 13, fontWeight: 300, color: "rgba(241,235,222,0.45)", lineHeight: 1.6 }}>
                      {LOADING_MSGS[loadingMsgIdx].s}
                    </div>
                  </div>

                  {/* Progress ticker */}
                  <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(241,235,222,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(241,235,222,0.22)" }}>
                      Analysing {ind}
                    </span>
                    <span style={{ color: "rgba(241,235,222,0.12)", fontSize: 10 }}>·</span>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(241,235,222,0.22)" }}>
                      {["Discount Partnership","Institution Rebate","Expert Roundup + Badge"].find((_,i) => ["discount","institution","badge"][i] === strategy) || "Strategy"}
                    </span>
                    <span style={{ color: "rgba(241,235,222,0.12)", fontSize: 10 }}>·</span>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(245,184,31,0.35)" }}>
                      Powered by Claude
                    </span>
                  </div>
                </div>

                {/* Shimmer skeleton cards */}
                {[88, 72, 64, 56].map((w, i) => (
                  <div key={i} style={{ padding: "22px 0", borderBottom: `1px solid ${INK15}`, opacity: 1 - i * 0.16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div className="ciq-shimmer" style={{ width: 24, height: 11, flexShrink: 0 }} />
                      <div className="ciq-shimmer" style={{ width: `${w}%`, height: 20 }} />
                    </div>
                    <div style={{ marginLeft: 38 }}>
                      <div className="ciq-shimmer" style={{ width: "100%", height: 11, marginBottom: 6 }} />
                      <div className="ciq-shimmer" style={{ width: "82%", height: 11, marginBottom: 16 }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[60, 72, 55].map((sw, j) => (
                          <div key={j} className="ciq-shimmer" style={{ width: `${sw}%`, height: 9 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {aiError && aiMode === null && !aiPartners.length && (
              <div style={{ padding: "24px", background: "#fdf0f0", border: "1px solid #e8c0c0", borderLeft: "3px solid #b02020", margin: "24px 0" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#b02020", marginBottom: 8 }}>Error generating suggestions</div>
                <div style={{ fontSize: 13, color: "#6b2020", marginBottom: 14 }}>{aiError}</div>
                <button onClick={() => { prevKey.current = ""; triggerPartners(ind, strategy); }} style={mkBtn("dark")}>Try Again</button>
              </div>
            )}

            {/* ── PARTNER CARDS — the hero output ── */}
            {aiPartners.length > 0 && aiMode !== "suggestions" && (
              <div>
                {/* Summary bar */}
                <div style={{ padding: "18px 0", borderBottom: `2px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12, marginBottom: 4 }}>
                  <div>
                    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: INK55 }}>
                      {aiPartners.length} partner targets &nbsp;·&nbsp; {ind} &nbsp;·&nbsp; {STRATEGY_DETAILS[strategy].label}
                    </span>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: INK35, marginTop: 4 }}>
                      Generated by Claude &nbsp;·&nbsp; Personalised to {biz || "your business"} &nbsp;·&nbsp; {new Date().toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <button onClick={() => { prevKey.current = ""; setAiPartners([]); triggerPartners(ind, strategy); }}
                    style={{ ...mkBtn("outline"), fontSize: 9, padding: "7px 14px" }}>
                    Regenerate
                  </button>
                </div>

                {aiPartners.map((p, i) => {
                  const tierColor = TIER_COLORS[p.tier] || INK55;
                  const tierBg    = TIER_BG[p.tier]    || PAPER;
                  const isSel     = selNiches.includes(p.name);
                  return (
                    <div key={i} onClick={() => setSelNiches(n => isSel ? n.filter(x=>x!==p.name) : [...n, p.name])}
                      style={{ borderBottom: `1px solid ${INK15}`, borderTop: i === 0 ? `1px solid ${INK15}` : "none", padding: "24px 0", cursor: "pointer", background: isSel ? "#fffdf5" : "transparent", transition: "background 0.12s" }}>

                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK35, flexShrink: 0 }}>{String(i+1).padStart(2,"0")}</span>
                          <div>
                            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{p.name}</div>
                            {p.url && <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, color: INK35, marginTop: 3, letterSpacing: "0.06em" }}>{p.url}</div>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          <span style={{ background: tierBg, color: tierColor, border: `1px solid ${tierColor}`, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, padding: "3px 9px" }}>
                            Tier {p.tier}
                          </span>
                          {isSel && <span style={{ background: YEL, color: DARK, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "3px 8px" }}>Selected</span>}
                        </div>
                      </div>

                      {/* Why section — full width, prominent */}
                      <div style={{ background: "#f8f5ef", border: `1px solid ${INK15}`, borderLeft: `3px solid ${tierColor}`, padding: "14px 16px", marginBottom: 16 }}>
                        <span style={fieldLabel}>Why they are a perfect fit</span>
                        <p style={{ fontSize: 13, color: INK70, lineHeight: 1.75, margin: 0 }}>{p.why}</p>
                      </div>

                      {/* Meta grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px" }}>
                        <div>
                          <span style={fieldLabel}>Where the link lives</span>
                          <p style={{ fontSize: 12, color: BLUE, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{p.linkPage}</p>
                        </div>
                        <div>
                          <span style={fieldLabel}>Who to contact</span>
                          <p style={{ fontSize: 12, color: INK70, lineHeight: 1.5, margin: 0 }}>{p.contact}</p>
                        </div>
                        <div>
                          <span style={fieldLabel}>SEO potential</span>
                          <p style={{ fontSize: 12, color: AMBER, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{p.seoNote}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Tier legend */}
                <div style={{ padding: "16px 0", display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                  {[["A","Highest priority — approach first",TIER_COLORS.A,TIER_BG.A],["B","Strong candidate",TIER_COLORS.B,TIER_BG.B],["C","Good to include",TIER_COLORS.C,TIER_BG.C]].map(([t,l,c,bg])=>(
                    <div key={t as string} style={{ display:"flex",alignItems:"center",gap:7 }}>
                      <span style={{ background: bg as string,color: c as string,border:`1px solid ${c as string}`,fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase" as const,padding:"2px 8px" }}>Tier {t}</span>
                      <span style={{ fontFamily:MONO,fontSize:9,color:INK35 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Rsec>

        {/* ── 02 QUALIFY ── */}
        <Rsec num="02" title="Qualify a Partner" action="Score before you pitch">
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><span style={fieldLabel}>Company Name</span><input style={rpInput} placeholder="e.g. Brex" value={scPartner} onChange={e => setScPartner(e.target.value)} /></div>
              <div><span style={fieldLabel}>Partner Category</span><input style={rpInput} placeholder="e.g. Corporate Card" value={scCat} onChange={e => setScCat(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              {[{l:"Yes = 2",c:"#eef7f2",t:GREEN},{l:"Partial = 1",c:"#fff3e6",t:AMBER},{l:"No = 0",c:"#fdf0f0",t:"#b02020"}].map(p=>(
                <span key={p.l} style={{ padding:"3px 9px",fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,background:p.c,color:p.t }}>{p.l}</span>
              ))}
            </div>
            {SCORECARD_QS.map((q,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"14px 0",borderBottom:`1px solid ${INK15}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:INK,marginBottom:3,lineHeight:1.35 }}>{q.q}</div>
                  <div style={{ fontSize:11,color:INK55,lineHeight:1.5 }}>{q.sub}</div>
                </div>
                <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                  {[{l:"Yes",v:2},{l:"Part",v:1},{l:"No",v:0}].map(b=>{
                    const sel=scores[i]===b.v&&scores[i]!==undefined;
                    const bg=sel?(b.v===2?GREEN:b.v===1?"#a06800":"#b02020"):"transparent";
                    return <button key={b.v} onClick={()=>setScores(s=>({...s,[i]:b.v}))} style={{ padding:"6px 11px",border:`1px solid ${sel?bg:INK35}`,background:bg,fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.06em",color:sel?"#fff":INK55,cursor:"pointer" }}>{b.l}</button>;
                  })}
                </div>
              </div>
            ))}
            <div style={{ background:DARK,padding:"24px 28px",marginTop:20,display:"flex",alignItems:"center",gap:24,flexWrap:"wrap" as const }}>
              <div style={{ textAlign:"center" as const,flexShrink:0 }}>
                <span style={{ fontFamily:SERIF,fontSize:56,fontWeight:700,color:YEL,lineHeight:1,display:"block",letterSpacing:"-0.03em" }}>{scorePct}%</span>
                <span style={{ fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:"rgba(241,235,222,0.25)",marginTop:5,display:"block" }}>Fit Score</span>
              </div>
              <div style={{ flex:1,minWidth:160 }}>
                <div style={{ height:3,background:"#1e1c17",marginBottom:14 }}><div style={{ height:"100%",background:YEL,width:`${scorePct}%`,transition:"width 0.5s ease" }}/></div>
                <div style={{ fontSize:12,color:scorePct>=70?"#7ad4a0":scorePct>=45?"#f0c060":scorePct>0?"#e08080":"rgba(241,235,222,0.4)",lineHeight:1.65 }}>
                  {scoreVerdict || "Answer the questions above to score this partner."}
                </div>
              </div>
            </div>
            <div style={{ marginTop:24 }}>
              <span style={{ ...fieldLabel, color: INK55 }}>Pre-Outreach Checklist</span>
              {CHECKLIST.map((c,i)=>(
                <div key={i} onClick={()=>setChecklist(cl=>{const n=[...cl];n[i]=!n[i];return n;})}
                  style={{ display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${INK15}`,cursor:"pointer" }}>
                  <div style={{ width:18,height:18,border:`2px solid ${checklist[i]?GREEN:INK35}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:checklist[i]?"#fff":"transparent",background:checklist[i]?GREEN:"transparent",marginTop:2 }}>✓</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:checklist[i]?INK55:INK,textDecoration:checklist[i]?"line-through":"none",lineHeight:1.4 }}>{c.text}</div>
                    <div style={{ fontSize:11,color:INK55,marginTop:2,lineHeight:1.5 }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Rsec>

        {/* ── 03 TEMPLATE ── */}
        <Rsec num="03" title="Outreach Template" action={<span>Fill in <span style={{color:AMBER,fontWeight:700}}>[brackets]</span></span>}>
          <div style={{ padding:"28px 32px" }}>
            <div style={{ display:"flex",borderBottom:`2px solid ${INK}`,marginBottom:24 }}>
              {(["discount","institution","badge"] as Strategy[]).map(s=>(
                <button key={s} onClick={()=>setTplTab(s)} style={{ padding:"10px 18px",border:"none",background:"transparent",fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:tplTab===s?INK:INK55,cursor:"pointer",borderBottom:`2px solid ${tplTab===s?INK:"transparent"}`,marginBottom:-2 }}>
                  {s==="discount"?"Discount Partnership":s==="institution"?"Institution Rebate":"Expert Roundup"}
                </button>
              ))}
            </div>
            {(["discount","institution","badge"] as Strategy[]).map(s => tplTab!==s ? null : (
              <div key={s}>
                <pre style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${INK}`,padding:"22px",fontSize:13,fontFamily:GROT,fontWeight:400,lineHeight:1.9,whiteSpace:"pre-wrap" as const,color:INK,marginBottom:12,overflowX:"auto" as const }}>
                  {s==="discount"
                    ? `Subject: Partnership idea — [THEIR BRAND] × [YOUR BRAND${biz?` (${biz})`:""}]: a deal for your clients?\n\nHi [FIRST NAME],\n\nI'm [YOUR NAME] from ${biz||"[YOUR BRAND]"} — we ${desc||"[ONE-LINE DESCRIPTION]"}.\n\nI noticed you serve the same people we do — [SHARED AUDIENCE] — just from a completely different angle.\n\nHere's what I'd like to propose: we offer your clients an exclusive [X]% discount on [YOUR PRODUCT/SERVICE]. In exchange, you mention us on your partner page with a link.\n\nThree-way win: your clients get a deal, you give them extra value, we get a warm referral.\n\n15 minutes to explore this?\n\n[YOUR NAME]\n[ROLE] · ${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`
                    : s==="institution"
                    ? `Subject: Exclusive [DISCOUNT] for [INSTITUTION] students/members\n\nHi [STUDENT SERVICES CONTACT],\n\nI'm [YOUR NAME] from ${biz||"[YOUR BRAND]"}. We ${desc||"[DESCRIPTION]"} and a large part of our customer base is students / [MEMBER TYPE].\n\nWe'd love to offer [INSTITUTION] members an exclusive [X]% discount using a dedicated code.\n\nAll we'd ask in return is a mention on your rebate or resources page with a link. No strings, no fees.\n\nWould you be the right person to arrange this?\n\n[YOUR NAME]\n[ROLE] · ${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`
                    : `Subject: Featured in our [GUIDE TITLE] — and a badge for your site\n\nHi [EXPERT'S NAME],\n\nI'm putting together a guide: [GUIDE TITLE] — featuring leading [EXPERT TYPE] ranked by [CRITERIA].\n\nHere's what you'd get:\n→ A feature with your name, credentials, and a link to your site\n→ A "[AWARD NAME]" badge for your website\n→ Promotion to our audience of [SIZE/TYPE]\n\nAll I need: [ONE EXPERT QUESTION]\n\nGuide goes live: [DATE]\n\nInterested?\n\n[YOUR NAME]\n[ROLE] · ${biz||"[BRAND]"} · ${domain||"[WEBSITE]"}`
                  }
                </pre>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>{const el=document.querySelector(`pre[data-tpl="${s}"]`);navigator.clipboard.writeText(el?.textContent||"");}} style={{ ...mkBtn("outline"),fontSize:9 }}>Copy Template</button>
                </div>
              </div>
            ))}

            {/* AI email */}
            <div style={{ marginTop:28,paddingTop:24,borderTop:`1px solid ${INK15}` }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12,marginBottom:16 }}>
                <div>
                  <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:INK55,display:"block",marginBottom:4 }}>AI-Personalised Email</span>
                  <span style={{ fontSize:12,color:INK55 }}>Claude writes a bespoke email for your specific target partner</span>
                </div>
                <button onClick={callEmail} disabled={aiMode==="email"||!biz}
                  style={{ ...mkBtn("dark"),opacity:(!biz||aiMode==="email")?0.5:1,cursor:(!biz||aiMode==="email")?"wait":"pointer" }}>
                  {aiMode==="email"?"Generating…":"Generate AI Email"}
                </button>
              </div>
              {aiEmail && (
                <pre style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${YEL}`,padding:"20px 22px",fontSize:13,lineHeight:1.8,color:INK,whiteSpace:"pre-wrap" as const,fontFamily:GROT }}>
                  {aiEmail}
                </pre>
              )}
            </div>
          </div>
        </Rsec>

        {/* ── 04 BRIEF ── */}
        <Rsec num="04" title="Campaign Brief" action="Auto-populated · updates live">
          <div style={{ padding:"32px 32px 24px",borderBottom:`1px solid ${INK15}` }}>
            <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:INK35,marginBottom:10,display:"block" }}>CollabIQ · SIA Wire · S02E06</span>
            <h2 style={{ fontFamily:SERIF,fontSize:24,fontWeight:700,letterSpacing:"-0.02em",color:INK,marginBottom:6 }}>Collab Link Building Campaign Brief</h2>
            <span style={{ fontFamily:MONO,fontSize:10,color:INK35 }}>{new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})}</span>
          </div>
          <div id="collabiq-brief" style={{ padding:"0 32px 32px" }}>
            <Bsec label="Business">
              <Brow k="Name" v={biz}/><Brow k="Website" v={domain}/><Brow k="Description" v={desc}/>
              <Brow k="Industry" v={ind}/><Brow k="Audience" v={audType}/><Brow k="Geography" v={geo}/>
              <Brow k="Strategy" v={STRATEGY_DETAILS[strategy].label}/>
            </Bsec>
            <Bsec label="Selected Partner Targets">
              {selNiches.length
                ? selNiches.map(n => <span key={n} style={{ display:"inline-flex",alignItems:"center",background:"#fdf8ec",border:"1px solid rgba(245,184,31,0.35)",padding:"4px 10px",fontSize:11,fontWeight:600,color:"#7a4e00",margin:2 }}>{n}</span>)
                : <span style={{ color:INK35,fontSize:13 }}>Click partner cards above to select targets.</span>}
            </Bsec>
            <Bsec label="Scored Partner">
              <Brow k="Company" v={scPartner}/><Brow k="Fit Score" v={scorePct>0?scorePct+"%":"Not scored yet"}/><Brow k="Verdict" v={scoreVerdict}/>
            </Bsec>
            <Bsec label="Strategy Overview">
              <p style={{ fontSize:13,lineHeight:1.8,color:INK70 }}>{STRATEGY_DETAILS[strategy].detail}</p>
            </Bsec>
            <Bsec label="Next Actions">
              {STRATEGY_DETAILS[strategy].actions.map((a,i) => (
                <div key={i} style={{ display:"flex",gap:10,alignItems:"baseline",marginBottom:5 }}>
                  <span style={{ color:INK35,flexShrink:0 }}>→</span>
                  <span style={{ fontSize:13,color:INK70 }}>{a}</span>
                </div>
              ))}
            </Bsec>

            {/* AI brief */}
            <div style={{ paddingTop:24,borderTop:`1px solid ${INK15}` }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12,marginBottom:16 }}>
                <div>
                  <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:INK55,display:"block",marginBottom:4 }}>AI Campaign Brief</span>
                  <span style={{ fontSize:12,color:INK55 }}>Claude writes a full 90-day strategy brief tailored to your business</span>
                </div>
                <button onClick={callBrief} disabled={aiMode==="brief"||!biz}
                  style={{ ...mkBtn("dark"),opacity:(!biz||aiMode==="brief")?0.5:1,cursor:(!biz||aiMode==="brief")?"wait":"pointer" }}>
                  {aiMode==="brief"?"Generating…":"Generate AI Brief"}
                </button>
              </div>
              {aiBrief && (
                <div style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${INK}`,padding:"22px",fontSize:13,lineHeight:1.85,color:INK,fontFamily:GROT }}>
                  {aiBrief.split("\n").map((line, i) => {
                    if(line.startsWith("## ")) return <div key={i} style={{ fontFamily:SERIF,fontSize:16,fontWeight:700,color:INK,marginTop:18,marginBottom:6,letterSpacing:"-0.01em" }}>{line.replace("## ","")}</div>;
                    if(line.startsWith("# "))  return <div key={i} style={{ fontFamily:SERIF,fontSize:18,fontWeight:700,color:INK,marginTop:6,marginBottom:8,letterSpacing:"-0.01em" }}>{line.replace("# ","")}</div>;
                    if(line.startsWith("- ") || line.startsWith("→ ")) return <div key={i} style={{ display:"flex",gap:8,alignItems:"baseline",marginBottom:4 }}><span style={{color:INK35,flexShrink:0}}>→</span><span>{line.replace(/^[-→]\s/,"")}</span></div>;
                    if(!line.trim()) return <div key={i} style={{ height:10 }} />;
                    return <p key={i} style={{ marginBottom:6,color:INK70 }}>{line.replace(/\*\*(.*?)\*\*/g,"$1")}</p>;
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ display:"flex",gap:8,flexWrap:"wrap" as const,padding:"20px 32px",borderTop:`2px solid ${INK}` }}>
            <button onClick={downloadPDF} style={mkBtn("dark")}>Download PDF</button>
            <button onClick={()=>{const el=document.getElementById("collabiq-brief");if(el)navigator.clipboard.writeText(el.innerText);}} style={mkBtn("outline")}>Copy Brief</button>
          </div>

          {/* EMOS CTA */}
          <div style={{ background:DARK,padding:"32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap" as const }}>
            <div>
              <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:"rgba(245,184,31,0.45)",marginBottom:8,display:"block" }}>Ready to execute?</span>
              <div style={{ fontFamily:SERIF,fontSize:20,fontWeight:700,color:PAPER,marginBottom:8,letterSpacing:"-0.015em" }}>Earned Media OS</div>
              <p style={{ fontSize:12,color:"rgba(241,235,222,0.45)",lineHeight:1.65,maxWidth:380 }}>The step-by-step system for pre-Series A founders who want press coverage that makes investors take notice — without a PR agency retainer.</p>
            </div>
            <a href="https://dmr.agency/earnedmediaos/" target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-block",background:YEL,color:DARK,textDecoration:"none",fontFamily:GROT,fontSize:10,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase" as const,padding:"13px 20px",border:`2px solid ${YEL}`,whiteSpace:"nowrap" as const,flexShrink:0 }}>
              Explore EMOS ↗
            </a>
          </div>
          <div style={{ padding:"14px 32px",textAlign:"center" as const,fontFamily:MONO,fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:INK35,background:PAPER2,borderTop:`1px solid ${INK15}` }}>
            Generated via <a href="https://syedirfanajmal.com" target="_blank" rel="noopener noreferrer" style={{ color:INK55,textDecoration:"none" }}>SIA Wire</a> · Season 2 Episode 6 · Collab Link Building Method
          </div>
        </Rsec>

      </main>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────
function Lsec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
      <span style={monoLabel()}>{label}</span>
      {children}
    </div>
  );
}

function Rsec({ num, title, action, children }: { num: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `2px solid ${INK}` }}>
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${INK15}` }}>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: YEL, background: INK, padding: "12px 18px", borderRight: `1px solid ${INK15}`, flexShrink: 0 }}>{num}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: INK55, padding: "12px 18px", flex: 1 }}>{title}</span>
        {action && <span style={{ fontFamily: MONO, fontSize: 9, color: INK35, padding: "12px 18px", flexShrink: 0 }}>{action}</span>}
      </div>
      {children}
    </div>
  );
}

function Bsec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: `1px solid ${INK15}` }}>
      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: INK35, marginBottom: 12, display: "block", paddingBottom: 8, borderBottom: `1px solid ${INK15}` }}>{label}</span>
      {children}
    </div>
  );
}

function Brow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid ${INK15}` }}>
      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: INK55, width: 130, flexShrink: 0 }}>{k}</span>
      <span style={{ fontSize: 13, color: INK, flex: 1, lineHeight: 1.45 }}>{v || "—"}</span>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, SERIF, GROT, MONO,
} from "@/lib/tokens";

// ── Local dark-panel tokens ───────────────────────────────────
const DARK  = "#0e0d0a";
const DARK2 = "#181510";
const DARK3 = "#221e17";
const DARK_BORDER = "#2a2318";
const AMBER = "#a85000";
const BLUE  = "#1e4d80";
const GREEN = "#1f6b3a";

// ── Types ─────────────────────────────────────────────────────
type Strategy = "discount" | "institution" | "badge";
interface PartnerEntry { name: string; why: string; example: string; link: string; }
interface PartnerMap { discount: PartnerEntry[]; institution: PartnerEntry[]; badge: PartnerEntry[]; }
type AiMode = "suggestions" | "email" | "brief" | null;

// ── Static partner data ───────────────────────────────────────
const INDUSTRIES = [
  "Automotive","Home & Real Estate","Finance & Insurance","Health & Wellness",
  "Travel & Hospitality","Fashion & Apparel","Food & Beverage","SaaS / Software",
  "E-commerce / Retail","Legal Services","Education / EdTech","Pet Care",
  "Wedding & Events","Fitness & Sports","Marketing / Agency",
];

const PARTNER_DATA: Record<string, PartnerMap> = {
  "Automotive":{discount:[{name:"Car Insurance Companies",why:"Same audience — every car owner needs insurance.",example:"Admiral, Direct Line, Aviva",link:"Partner page / deals page"},{name:"Car Leasing Companies",why:"Leasing customers immediately need tyres, accessories, servicing.",example:"Leaseplan, Lex Autolease",link:"Partner resources"},{name:"Breakdown Cover Providers",why:"AA/RAC customers are car owners who need auto care.",example:"AA, RAC, Green Flag",link:"Partner deals section"},{name:"Auto Finance Providers",why:"New car finance = new car owner needing everything.",example:"Black Horse, Motonovo",link:"Customer perks page"},{name:"Driving Schools",why:"New drivers are a major untapped auto-care audience.",example:"RED, BSM, AA Driving School",link:"Student resources"},{name:"Fuel Card Companies",why:"Fleet & business drivers are premium auto-care buyers.",example:"Allstar, Fleetcor",link:"Fleet resources"}],institution:[{name:"Universities with Motoring Societies",why:".edu links from student pages — students are new car owners.",example:"University of Birmingham, UCL",link:"Student discounts page"},{name:"Fleet Industry Associations",why:"Fleet managers are a major B2B auto-care audience.",example:"BVRLA, FTA",link:"Member benefits"},{name:"Motoring Charities & Clubs",why:"Dedicated car enthusiast audiences.",example:"IAM RoadSmart, Classic Car Club",link:"Member perks"}],badge:[{name:"Independent Auto Mechanics",why:"Feature top-rated garages in a Best Mechanics guide.",example:"Independents on Google Maps",link:"Badge on their website"},{name:"Motoring Journalists & Bloggers",why:"Top UK Motoring Writers roundup earns a link from each bio.",example:"Car Magazine contributors",link:"Badge + bio page"},{name:"Driving Instructors",why:"Best Driving Instructors in [City] — badges on their sites.",example:"DVSA-registered instructors",link:"Badge on instructor sites"}]},
  "Health & Wellness":{discount:[{name:"Gym Chains & Fitness Studios",why:"Your customers buy supplements and go to the gym — same wallet.",example:"PureGym, Anytime Fitness",link:"Partner deals page"},{name:"Health Insurance Providers",why:"Health-conscious people buy wellness products and insurance together.",example:"Bupa, AXA Health",link:"Member perks"},{name:"Activewear Brands",why:"Fitness gear and supplements are bought in the same mindset window.",example:"Gymshark, Lululemon",link:"Collab page"},{name:"Nutrition Apps",why:"App users tracking macros are your ideal supplement buyer.",example:"MyFitnessPal, Cronometer",link:"Partner integrations"}],institution:[{name:"Universities",why:"Student health and fitness is a major institutional focus.",example:"Student Unions across UK/US",link:"Student discounts page"},{name:"Sports Clubs & Associations",why:"Club members are your exact target buyer.",example:"Athletics clubs, BUCS",link:"Member benefits page"},{name:"NHS / Healthcare Bodies",why:"Wellness products near public health bodies earn trusted links.",example:"NHS partners, CCGs",link:"Healthy living resources"}],badge:[{name:"Personal Trainers & Coaches",why:"Feature top PTs in a Best Coaches guide.",example:"PT Network, Google Maps PTs",link:"Badge on PT website"},{name:"Nutritionists & Dietitians",why:"Top Registered Dietitians guide — nutrition authority builds trust.",example:"BDA members",link:"Badge on practice sites"},{name:"Fitness Influencers",why:"Most Trusted Fitness Voices — badge earns links from their sites.",example:"Instagram fitness creators",link:"Badge in bio/website"}]},
  "SaaS / Software":{discount:[{name:"Digital Marketing Agencies",why:"Agencies recommend software to clients constantly.",example:"Top agencies in your country",link:"Agency partner program"},{name:"Complementary SaaS Tools",why:"Integration partners list you on their integrations page.",example:"Zapier, HubSpot integrations",link:"Integrations / ecosystem page"},{name:"Startup Accelerators",why:"Startups sign up for software from day one.",example:"Y Combinator, Seedcamp",link:"Startup deals / stack page"},{name:"Online Course Platforms",why:"Educators teaching relevant skills recommend tools mid-course.",example:"Udemy, Teachable instructors",link:"Resources section"}],institution:[{name:"Universities with CS / Business Programmes",why:"Students need tools and .edu backlinks are gold.",example:"Imperial, Stanford",link:"Student resources page"},{name:"Industry Trade Associations",why:"Professional body members are your B2B buyers.",example:"CIPR, CIM, IoD",link:"Member benefits / recommended tools"}],badge:[{name:"Industry Bloggers & Analysts",why:"Top [Industry] Blogs guide — badge on each site.",example:"Niche newsletter writers",link:"Badge in footer or about page"},{name:"Consultants Who Use Your Tool",why:"Case Study Champions guide with badge earns a trusted contextual link.",example:"Freelancers, consultants",link:"Badge + case study page"}]},
  "Marketing / Agency":{discount:[{name:"CRM & Marketing Tech Platforms",why:"Agencies and marketers use the same tools — stack discounts build loyalty.",example:"HubSpot, ActiveCampaign, Klaviyo",link:"Partner marketplace / integrations"},{name:"Startup Accelerators & VC Funds",why:"Portfolio companies need marketing from day one.",example:"Y Combinator, Techstars, First Round",link:"Portfolio perks / startup resources"},{name:"Corporate Card & Fintech Platforms",why:"Brex, Mercury, and Carta serve exactly the same founders and operators.",example:"Brex, Mercury, Carta, Ramp",link:"Perks / partner deals page"},{name:"Freelancer & Agency Marketplaces",why:"Marketplaces connecting clients with agencies share your audience exactly.",example:"Clutch, GoodFirms, MarketerHire",link:"Partner directory / listing"}],institution:[{name:"Business Schools & MBA Programmes",why:"Marketing students need real tools — .edu links and early adopters.",example:"Wharton, INSEAD, LBS",link:"Student resources / recommended tools"},{name:"Marketing & PR Trade Bodies",why:"Professional member benefits page plus .org authority links.",example:"CIPR, CIM, AMA",link:"Member benefits"},{name:"Chambers of Commerce",why:"SMB owners in chambers need marketing support.",example:"Local chambers globally",link:"Member resources / events page"}],badge:[{name:"Marketing Consultants & Strategists",why:"Top Marketing Consultants to Follow — badge on each consulting site.",example:"LinkedIn marketing consultants",link:"Badge on consultant website"},{name:"Podcast Hosts in the Marketing Space",why:"Best Marketing Podcasts roundup — badge on podcast site.",example:"Independent marketing podcasters",link:"Badge on podcast / show website"},{name:"Newsletter Writers & Analysts",why:"Top Marketing Newsletters — badge earns links from each issue page.",example:"Substack marketing writers",link:"Badge in newsletter footer or website"}]},
  "E-commerce / Retail":{discount:[{name:"Payment Gateway Providers",why:"Every online seller uses payments. You share the merchant audience.",example:"Stripe, Klarna, PayPal",link:"Partner ecosystem page"},{name:"Shipping & Logistics Companies",why:"E-com businesses need fulfillment and your product.",example:"Evri, DPD, ShipBob",link:"Partner perks"},{name:"E-commerce Platform Partners",why:"Shopify/WooCommerce store owners are your B2B audience.",example:"Shopify App Store, WooCommerce",link:"App directory listing"}],institution:[{name:"Universities with Business / E-com Courses",why:"Students learning to sell online are your audience.",example:"Northampton, Manchester Met",link:"Student discounts / resources"},{name:"Small Business Associations",why:"SMB members are exactly who buys e-com tools.",example:"FSB, Chambers of Commerce",link:"Member resources page"}],badge:[{name:"E-commerce Bloggers & Consultants",why:"Top E-commerce Experts to Follow — badge on their site.",example:"Shopify Partners, consultants",link:"Badge + author bio"},{name:"Podcast Hosts in Your Niche",why:"Best Podcasts for [Niche] Sellers — badge on podcast site.",example:"Independent podcasters",link:"Badge on podcast site"}]},
  "Legal Services":{discount:[{name:"Accountancy Firms",why:"Legal and accounting advice are bought together by businesses.",example:"Local accounting practices",link:"Partner referrals page"},{name:"HR Consultancies",why:"Employment law and HR are inseparable for SMBs.",example:"Peninsula, Moorepay",link:"Partner resources"},{name:"Business Insurance Brokers",why:"Legal and insurance risk are managed in the same decision window.",example:"Simply Business, Hiscox",link:"Partner ecosystem"},{name:"Business Formation Platforms",why:"New businesses need legal from day one.",example:"Companies Made Simple, Tide",link:"Start-up toolkit"}],institution:[{name:"Law Schools & Universities",why:".edu links from student resources and careers pages.",example:"BPP, College of Law",link:"Student resources"},{name:"Law Societies & Bar Associations",why:"Professional body credibility plus .org links.",example:"Law Society, Bar Council",link:"Member resources / CPD"}],badge:[{name:"Legal Bloggers & Commentators",why:"Top [Legal Niche] Blogs roundup with badge.",example:"Employment law bloggers",link:"Badge on legal blog"},{name:"Business Coaches Who Advise on Legal",why:"Best Business Advisors guide — badge on coach site.",example:"LinkedIn coaches",link:"Badge + author bio"}]},
  "Education / EdTech":{discount:[{name:"Careers Guidance Platforms",why:"Students planning careers are actively choosing education tools.",example:"Prospects, Gradcracker",link:"Resources / student tools"},{name:"Productivity & Study Tools",why:"Note-taking apps and EdTech are both in the student workflow.",example:"Notion, Anki, Quizlet",link:"Student toolkit page"},{name:"Student Finance Providers",why:"Anyone funding education is already in the education ecosystem.",example:"SLC, private lenders",link:"Student money page"}],institution:[{name:"Universities & Colleges",why:"Direct institutional partnerships give you .edu links and referrals.",example:"Any accredited institution",link:"Approved resources / tools"},{name:"Professional Certifying Bodies",why:"Cert holders are your career-advancing learner audience.",example:"CIPD, PMP, CompTIA",link:"Member benefits / learning resources"}],badge:[{name:"Teachers, Tutors & Educators",why:"Top [Subject] Educators Online guide with badge.",example:"YouTube teachers, bloggers",link:"Badge on educator site"},{name:"Education Bloggers",why:"Best EdTech Blogs list — badge earns a link from each.",example:"Education Week contributors",link:"Badge in sidebar/footer"}]},
  "Fitness & Sports":{discount:[{name:"Sports Nutrition Brands",why:"Fitness gear and supplements are bought by the same person.",example:"Myprotein, Optimum Nutrition",link:"Partner deals"},{name:"Personal Trainers",why:"PTs recommend equipment and gear to clients every day.",example:"Independent PTs, PT studios",link:"Recommended gear page"},{name:"Sports Clubs & Associations",why:"Club members are the core buyer for sports products.",example:"Athletics clubs, swimming clubs",link:"Member perks / kit supplier"}],institution:[{name:"University Sports Unions",why:"Students in sports societies are your prime buyer — .edu links.",example:"University Athletic Unions",link:"Student sports discounts"},{name:"National Governing Bodies",why:"NGBs represent sport practitioners at every level.",example:"British Swimming, UK Athletics",link:"Affiliated member perks"}],badge:[{name:"Sports Coaches & Instructors",why:"Top [Sport] Coaches guide — badge on each coach site.",example:"Swimming, cycling, running coaches",link:"Badge on coach website"},{name:"Fitness YouTubers & Bloggers",why:"Most Trusted [Sport] Creators guide with ranked badge.",example:"YouTube fitness channels",link:"Badge in video description / website"}]},
  "default":{discount:[{name:"Non-competing companies serving your exact audience",why:"Same customer base, different product category — the core of the strategy.",example:"Identify via competitor backlink analysis",link:"Partner / deals page"},{name:"Complementary service providers",why:"They complete your product or solve an adjacent problem.",example:"Study your customer journey",link:"Recommended resources"},{name:"Industry tool & software providers",why:"Businesses using industry tools are also your buyers.",example:"Search your industry + software",link:"Integration or partner page"}],institution:[{name:"Industry trade associations",why:"Members are professionals in your exact target sector.",example:"Search [your industry] + association",link:"Member benefits / resources"},{name:"Universities running related courses",why:".edu links from student resources pages.",example:"Search [your topic] + university course",link:"Student resources page"}],badge:[{name:"Niche bloggers & content creators",why:"Feature them in a Top Voices in [Niche] roundup.",example:"Search your niche + blog/YouTube",link:"Badge on their site"},{name:"Practitioners & consultants",why:"Expert feature plus badge earns a trusted contextual link.",example:"LinkedIn search in your industry",link:"Badge on practice/consultant site"}]},
};

const SCORECARD_QS = [
  { q: "Do they serve the same target audience?", sub: "Would their ideal customer also consider buying from you?" },
  { q: "Are they genuinely non-competing with your offer?", sub: "A customer choosing them doesn't mean they won't also choose you." },
  { q: "Do they have a real web presence with some domain authority?", sub: "Check their site exists, has content, and has backlinks (Ahrefs/SEMrush)." },
  { q: "Do they have a page where they could logically place a link?", sub: "Partner page, deals page, resources section — a natural home for a mention." },
  { q: "Is there a clear value exchange you can offer?", sub: "Discount code, institutional listing, badge — something concrete." },
  { q: "Do they already mention or link to complementary brands?", sub: "Check their blog, resources page, or footer." },
  { q: "Can you find a specific named contact to reach out to?", sub: "A named person on LinkedIn — not a generic info@ address." },
  { q: "Is their brand quality and reputation acceptable?", sub: "You'll be associated with them. A spammy site can hurt your authority." },
];

const CHECKLIST = [
  { text: "Study your top 3 competitors' backlink profiles first", sub: "Ahrefs or SEMrush. Look for clusters of links from the same type of site." },
  { text: "Identify the right contact at the target company", sub: "LinkedIn: Head of Marketing, SEO Manager, Partnerships Lead, Student Services." },
  { text: "Research the company before writing anything", sub: "Know their products, tone, audience, and existing partner perks." },
  { text: "Prepare a specific mutual-value proposition", sub: "What do THEY get? A discount, a featured spot, a badge." },
  { text: "Create or identify a linkable asset", sub: "Discount code, expert guide, badge embed — something with a clear URL to link to." },
  { text: "Check if they already have a partner/deals/resources page", sub: "If they do, your pitch has a ready home." },
  { text: "Set a follow-up reminder for 5–7 business days", sub: "Most deals happen on follow-up. One email rarely closes." },
  { text: "Track outreach in a spreadsheet", sub: "Company, contact, email sent, date, response, outcome." },
];

const STRATEGY_DETAILS: Record<Strategy, { label: string; detail: string; actions: string[] }> = {
  discount: { label: "Discount Partnership", detail: "Offer a discount code or referral deal to your target partner's customers. The partner promotes the deal and links to your site from their partner page or deals section. Three-way win: you earn links and referral traffic, they offer their clients added value, their customers get a deal. NTA used this with car insurance and leasing companies to grow from £165K to over £1M/month in organic revenue.", actions: ["Identify 10–20 target companies per partner category", "Create a unique discount code or landing page for each partner", "Find the Head of Marketing or Partnerships Manager on LinkedIn", "Send personalised outreach using the Discount Partnership template", "Negotiate a contextual in-content link — not just a footer mention", "Track which partner pages go live and monitor monthly in Ahrefs/SEMrush", "Follow up with performance data to strengthen the relationship over time"] },
  institution: { label: "Institution Rebate", detail: ".edu, .gov, and .org backlinks are among the hardest to earn — but the Institution Rebate model provides a direct, scalable path to them. Offer an exclusive discount for students, members, or citizens of an institution. They list the deal on their rebate or resources page. A fitness supplements brand earned dozens of .edu backlinks using this approach at scale.", actions: ["Build a list of 20–50 relevant universities, colleges, or associations", "Create a dedicated institution discount landing page per institution", "Find the Student Services, Welfare Officer, or Member Benefits contact", "Keep outreach short and benefit-led", "Ask them to list it on their student discounts or member benefits page", "Monitor .edu/.org link acquisitions monthly in Ahrefs", "Expand to professional associations, trade bodies, and alumni networks"] },
  badge: { label: "Expert Roundup + Badge", detail: "Create a high-quality guide featuring experts, coaches, or practitioners adjacent to your audience. Rank them by a transparent KPI. Award each featured expert a badge embedded with your URL. Every expert who displays the badge on their website gives you an automatic backlink. The sports accessories brand used this with swimming coaches — the guide provided value, the badge provided a scalable backlink engine.", actions: ["Choose a topic your audience cares about and identify relevant expert types", "Build a list of 30–50 experts via LinkedIn, Google, and Instagram", "Define transparent ranking criteria — certifications, following, years active", "Send outreach inviting them to be featured — make the value clear", "Create the expert guide with quality writing and expert quotes", "Design a branded Featured Expert badge with your URL in the HTML embed code", "Publish and notify all featured experts — track badge usage monthly"] },
};

// ── Shared style helpers ──────────────────────────────────────
const monoLabel: React.CSSProperties = {
  fontFamily: MONO, fontSize: 9, fontWeight: 700,
  letterSpacing: "0.2em", textTransform: "uppercase" as const,
  color: "rgba(241,235,222,0.45)", marginBottom: 12, display: "block",
};
const rpLabel: React.CSSProperties = {
  fontFamily: MONO, fontSize: 9, fontWeight: 700,
  letterSpacing: "0.16em", textTransform: "uppercase" as const,
  color: INK55, marginBottom: 7, display: "block",
};
const btn = (variant: "dark" | "yel" | "outline"): React.CSSProperties => ({
  display: "inline-block", padding: "10px 20px",
  fontFamily: GROT, fontSize: 10, fontWeight: 800,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  cursor: "pointer", border: "2px solid transparent",
  background: variant === "dark" ? DARK : variant === "yel" ? YEL : "transparent",
  color: variant === "dark" ? YEL : variant === "yel" ? DARK : INK,
  borderColor: variant === "dark" ? DARK : variant === "yel" ? YEL : INK35,
  transition: "all 0.15s",
});

// ── Component ─────────────────────────────────────────────────
export function CollabIQ() {
  // ── Business inputs
  const [biz,     setBiz]     = useState("");
  const [domain,  setDomain]  = useState("");
  const [desc,    setDesc]    = useState("");
  const [industry,    setIndustry]    = useState("");
  const [customInd,   setCustomInd]   = useState("");
  const [strategy,    setStrategy]    = useState<Strategy>("discount");
  const [audType,     setAudType]     = useState("");
  const [geo,         setGeo]         = useState("");
  const [audDesc,     setAudDesc]     = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customPartners, setCustomPartners] = useState<string[]>([]);
  const [selNiches,   setSelNiches]   = useState<string[]>([]);

  // ── Scorecard
  const [scPartner, setScPartner] = useState("");
  const [scCat,     setScCat]     = useState("");
  const [scores,    setScores]    = useState<Record<number, number>>({});
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST.map(() => false));

  // ── Template tab
  const [tplTab, setTplTab] = useState<Strategy>("discount");

  // ── AI state
  const [aiMode,    setAiMode]    = useState<AiMode>(null);
  const [aiResult,  setAiResult]  = useState<Record<string, string>>({});
  const [aiError,   setAiError]   = useState("");

  const ind = customInd || industry;

  // ── Derived: partner list
  const staticPartners: PartnerEntry[] = (PARTNER_DATA[ind] || PARTNER_DATA["default"])[strategy] || [];
  const allPartners: PartnerEntry[] = [
    ...staticPartners,
    ...customPartners.map(p => ({ name: p, why: "Custom target added by you.", example: "—", link: "—" })),
  ];

  // ── Score calc
  const scoreTotal = Object.values(scores).reduce((a, b) => a + b, 0);
  const scorePct   = Math.round((scoreTotal / (SCORECARD_QS.length * 2)) * 100);
  const scoreVerdict =
    scorePct >= 70 ? `Strong prospect (${scorePct}%). Prioritise and personalise your pitch.` :
    scorePct >= 45 ? `Moderate fit (${scorePct}%). Review low-scoring criteria before outreach.` :
    scorePct  > 0  ? `Low fit (${scorePct}%). Find a higher-scoring target first.` : "";

  // ── AI call helper
  const callAI = useCallback(async (type: string, extra?: Record<string, unknown>) => {
    setAiMode(type as AiMode);
    setAiError("");
    const payload = { type, data: { biz, domain, desc, industry: ind, audType, audDesc, geo, strategy, stratLabel: STRATEGY_DETAILS[strategy].label, selNiches, partner: scPartner, partnerCat: scCat, scorePct, verdictText: scoreVerdict, ...extra } };
    try {
      const res = await fetch("/api/collab-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json() as { result?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setAiResult(prev => ({ ...prev, [type]: json.result || "" }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setAiMode(null);
    }
  }, [biz, domain, desc, ind, audType, audDesc, geo, strategy, selNiches, scPartner, scCat, scorePct, scoreVerdict]);

  // ── PDF export (uses window.jspdf loaded via Script in page.tsx)
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
    const INK_=[26,20,16],YEL_=[245,184,31],DARK_=[14,13,10],PAPER_=[241,235,222],MID=[107,96,84],MID2=[160,148,130],BORDER=[220,210,195],AMBER_=[168,80,0],BLUE_=[30,77,128];
    function phdr(){fc(...DARK_);doc.rect(0,0,W,11,"F");fc(...YEL_);doc.rect(0,0,W,2,"F");tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("COLLABIQ  ·  PARTNERSHIP INTELLIGENCE  ·  SIA WIRE",M,7.5);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.text("syedirfanajmal.com",W-M,7.5,{align:"right"});}
    function np(){doc.addPage();phdr();return 22;}
    function need(cy: number,h: number){return cy+h>H-18?np():cy;}
    function shdr(label: string,cy: number){cy=need(cy,14);tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text(label.toUpperCase(),M,cy);cy+=2;dc(...BORDER);doc.setLineWidth(0.25);doc.line(M,cy,W-M,cy);return cy+7;}
    function row(key: string,val: string,cy: number){cy=need(cy,9);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text(key,M,cy);tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const lines=doc.splitTextToSize(val||"—",CW-52);doc.text(lines,M+50,cy);const h=Math.max(7,lines.length*5.2);dc(...BORDER);doc.setLineWidth(0.15);doc.line(M,cy+h-2.5,W-M,cy+h-2.5);return cy+h;}
    const sd = STRATEGY_DETAILS[strategy];
    const dateStr = new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"});
    const partners = allPartners;
    // Cover
    fc(...DARK_);doc.rect(0,0,W,H,"F");fc(...YEL_);doc.rect(0,0,W,3,"F");
    tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("COLLABIQ  ·  SIA WIRE  ·  S02E06",M,26);
    tc(...PAPER_);doc.setFont("helvetica","bold");doc.setFontSize(42);doc.text("Collab",M,72);tc(...YEL_);doc.text("IQ",M+62,72);
    tc(...PAPER_);doc.setFont("helvetica","normal");doc.setFontSize(20);doc.text("Partnership Intelligence Brief",M,88);
    dc(40,36,30);doc.setLineWidth(0.4);doc.line(M,96,W-M,96);
    if(biz){tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text("Prepared for:",M,108);tc(...PAPER_);doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text(biz,M,118);}
    fc(26,22,18);doc.rect(M,130,110,11,"F");tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.text("STRATEGY: "+sd.label.toUpperCase(),M+5,137);
    if(ind){tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Industry: "+ind,M,153);}
    tc(...MID);doc.text("Generated: "+dateStr,M,161);
    fc(...YEL_);doc.rect(M,H-58,CW,30,"F");tc(...DARK_);doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text("Want press coverage before your Series A?",M+6,H-45);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Earned Media OS  ·  dmr.agency/earnedmediaos",M+6,H-36);doc.link(M,H-58,CW,30,{url:"https://dmr.agency/earnedmediaos/"});
    tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.text("syedirfanajmal.com  ·  The SIA Business Podcast  ·  Season 2 Episode 6",W/2,H-10,{align:"center"});
    // Business
    y=np();y=shdr("01 — Business Overview",y);y=row("Business",biz,y);y=row("Website",domain,y);y=row("Description",desc,y);y=row("Industry",ind,y);y=row("Audience",audType,y);y=row("Geography",geo,y);y=row("Strategy",sd.label,y);y+=4;
    if(audDesc){y=need(y,22);y=shdr("Target Customer",y);tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const al=doc.splitTextToSize(audDesc,CW);al.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=5.2;});y+=6;}
    if(selNiches.length){y=need(y,20);y=shdr("Selected Partner Categories",y);selNiches.forEach(n=>{y=need(y,8);fc(...PAPER_);doc.rect(M,y-4,CW,8,"F");tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9.5);doc.text("→  "+n,M+4,y+1);y+=9;});}
    // Partners
    y=np();y=shdr("02 — Partner Suggestions",y);tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.text("Strategy: "+sd.label+"  ·  "+partners.length+" targets",M,y);y+=8;
    partners.forEach((p,i)=>{
      y=need(y,38);fc(...DARK_);doc.rect(M,y-4.5,CW,13,"F");tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text(String(i+1).padStart(2,"0"),M+3,y+2);tc(...PAPER_);doc.setFont("helvetica","bold");doc.setFontSize(10.5);doc.text(p.name,M+13,y+2);y+=13;
      tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("WHY THEY FIT",M+2,y);y+=4.5;tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9);const wl=doc.splitTextToSize(p.why,CW-4);wl.forEach((l: string)=>{y=need(y,6);doc.text(l,M+2,y);y+=4.8;});y+=2;
      tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("EXAMPLES",M+2,y);y+=4.5;tc(...AMBER_);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(p.example,M+2,y);y+=5;
      tc(...MID2);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("LINK PLACEMENT",M+2,y);tc(...BLUE_);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(p.link,M+36,y);y+=9;
      dc(...BORDER);doc.setLineWidth(0.2);doc.line(M,y-4,W-M,y-4);
    });
    // Brief / actions
    y=np();
    if(scPartner){y=shdr("03 — Qualified Partner",y);y=row("Company",scPartner,y);y=row("Category",scCat,y);y=row("Fit Score",scorePct+"%",y);y=row("Verdict",scoreVerdict,y);y+=6;}
    y=need(y,20);y=shdr("04 — Strategy Overview",y);tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const sdL=doc.splitTextToSize(sd.detail,CW);sdL.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=5;});y+=8;
    y=need(y,20);y=shdr("05 — Next Actions",y);sd.actions.forEach((a,i)=>{y=need(y,14);fc(...DARK_);doc.circle(M+3.5,y-1.5,2.8,"F");tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text(String(i+1),M+2.5,y-0.5);tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const al=doc.splitTextToSize(a,CW-12);al.forEach((l: string)=>{y=need(y,6);doc.text(l,M+10,y);y+=5;});y+=3;});
    // AI brief if generated
    const aiBriefText = aiResult["campaign-brief"];
    if(aiBriefText){y=need(y,20);y=shdr("06 — AI-Generated Campaign Brief",y);tc(...INK_);doc.setFont("helvetica","normal");doc.setFontSize(9);const bl=doc.splitTextToSize(aiBriefText.replace(/#{1,3}\s/g,"").replace(/\*\*/g,""),CW);bl.forEach((l: string)=>{y=need(y,6);doc.text(l,M,y);y+=4.8;});}
    // EMOS page
    doc.addPage();fc(...DARK_);doc.rect(0,0,W,H,"F");fc(...YEL_);doc.rect(0,0,W,3,"F");
    tc(...YEL_);doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("EARNED MEDIA OS  ·  SYED IRFAN AJMAL",M,22);
    tc(90,84,72);doc.setFont("helvetica","normal");doc.setFontSize(12);doc.text("Want press coverage before your Series A?",M,58);
    tc(...PAPER_);doc.setFont("helvetica","bold");doc.setFontSize(32);doc.text("Earned Media OS",M,78);
    dc(40,36,30);doc.setLineWidth(0.3);doc.line(M,85,M+90,85);
    tc(...YEL_);doc.setFont("helvetica","normal");doc.setFontSize(14);doc.text("The system for founders who want press",M,96);doc.text("before their Series A.",M,108);
    tc(90,84,72);doc.setFont("helvetica","normal");doc.setFontSize(9.5);const cL=doc.splitTextToSize("EMOS gives pre-Series A founders a step-by-step system for generating earned media — the kind that makes investors take notice, builds trust with enterprise buyers, and creates leverage before fundraising. No PR agency retainer.",CW);cL.forEach((l: string,i: number)=>doc.text(l,M,120+i*5.8));
    fc(...YEL_);doc.rect(M,154,106,14,"F");tc(...DARK_);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("dmr.agency/earnedmediaos",M+7,163);doc.link(M,154,106,14,{url:"https://dmr.agency/earnedmediaos/"});
    tc(...MID);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Generated using CollabIQ — SIA Wire S02E06",M,182);tc(...YEL_);doc.text("syedirfanajmal.com",M,196);doc.link(M,190,60,10,{url:"https://syedirfanajmal.com"});
    const total=doc.internal.getNumberOfPages();for(let i=2;i<=total-1;i++){doc.setPage(i);tc(...MID2);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.text(`${i-1} / ${total-2}`,W-M,H-8,{align:"right"});}
    const fname=(biz?biz.replace(/[^a-z0-9]/gi,"_").toLowerCase()+"_":"")+"collabiq_brief.pdf";
    doc.save(fname);
  }, [allPartners, biz, domain, desc, ind, audType, audDesc, geo, strategy, selNiches, scPartner, scCat, scorePct, scoreVerdict, aiResult]);

  // ── Input style
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

  return (
    <div style={{ display: "flex", minHeight: "calc(100svh - 56px)", fontFamily: GROT }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <aside style={{
        width: 348, flexShrink: 0,
        background: DARK2, borderRight: `1px solid ${DARK_BORDER}`,
        position: "sticky", top: 56,
        height: "calc(100svh - 56px)",
        overflowY: "auto",
      }}>

        {/* Head */}
        <div style={{ padding: "28px 24px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: PAPER, letterSpacing: "-0.025em", lineHeight: 1 }}>
            Collab<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,235,222,0.25)", marginTop: 10, lineHeight: 1.6 }}>
            Partnership intelligence<br />by Syed Irfan Ajmal · SIA Wire
          </div>
        </div>

        {/* Business */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <span style={monoLabel}>Your Business</span>
          <input style={lpInput} placeholder="Business name" value={biz} onChange={e => setBiz(e.target.value)} />
          <input style={lpInput} placeholder="Website" value={domain} onChange={e => setDomain(e.target.value)} />
          <input style={{ ...lpInput, marginBottom: 0 }} placeholder="What you do in one sentence" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        {/* Industry */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <span style={monoLabel}>Industry</span>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 12 }}>
            {INDUSTRIES.map(i => (
              <span key={i} onClick={() => { setIndustry(i); setCustomInd(""); }}
                style={{ padding: "5px 10px", border: `1px solid ${industry === i && !customInd ? YEL : DARK_BORDER}`, fontFamily: GROT, fontSize: 11, fontWeight: 600, cursor: "pointer", background: industry === i && !customInd ? YEL : "transparent", color: industry === i && !customInd ? DARK : "rgba(241,235,222,0.4)", transition: "all 0.12s" }}>
                {i}
              </span>
            ))}
          </div>
          <input style={{ ...lpInput, marginBottom: 0 }} placeholder="Or type a custom industry…" value={customInd} onChange={e => { setCustomInd(e.target.value); if(e.target.value) setIndustry(""); }} />
        </div>

        {/* Strategy */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <span style={monoLabel}>Collab Strategy</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${DARK_BORDER}` }}>
            {(["discount","institution","badge"] as Strategy[]).map((s,i) => (
              <button key={s} onClick={() => setStrategy(s)} style={{ padding: "13px 6px", border: "none", borderRight: i < 2 ? `1px solid ${DARK_BORDER}` : "none", background: strategy === s ? YEL : "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: strategy === s ? DARK : "rgba(241,235,222,0.3)", lineHeight: 1.5, transition: "all 0.12s" }}>
                <span style={{ fontSize: 8, opacity: 0.6, display: "block", marginBottom: 3 }}>0{i+1}</span>
                {s === "discount" ? "Discount\nPartnership" : s === "institution" ? "Institution\nRebate" : "Expert\nRoundup"}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DARK_BORDER}` }}>
          <span style={monoLabel}>Audience</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <select style={{ ...lpInput, marginBottom: 0, cursor: "pointer" }} value={audType} onChange={e => setAudType(e.target.value)}>
              <option value="">Audience type</option>
              <option>B2C Consumers</option>
              <option>B2B Small Businesses</option>
              <option>B2B Mid-Market / Enterprise</option>
              <option>Both B2B and B2C</option>
            </select>
            <select style={{ ...lpInput, marginBottom: 0, cursor: "pointer" }} value={geo} onChange={e => setGeo(e.target.value)}>
              <option value="">Geography</option>
              <option>Global</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Australia / NZ</option>
              <option>Asia-Pacific</option>
              <option>Local / City</option>
            </select>
          </div>
          <textarea style={{ ...lpInput, marginBottom: 0, resize: "vertical", minHeight: 76 }} placeholder="Describe your typical customer…" value={audDesc} onChange={e => setAudDesc(e.target.value)} />
        </div>

        {/* Custom partners */}
        <div style={{ padding: "20px 24px" }}>
          <span style={monoLabel}>Add Custom Partner Targets</span>
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...lpInput, marginBottom: 0, flex: 1 }} placeholder="Company or category…" value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){ const v=customInput.trim(); if(v&&!customPartners.includes(v)){setCustomPartners(p=>[...p,v]);setSelNiches(n=>[...n,v]);} setCustomInput(""); }}} />
            <button onClick={() => { const v=customInput.trim(); if(v&&!customPartners.includes(v)){setCustomPartners(p=>[...p,v]);setSelNiches(n=>[...n,v]);} setCustomInput(""); }}
              style={{ padding: "10px 12px", background: "transparent", border: `1px solid ${DARK_BORDER}`, color: "rgba(241,235,222,0.4)", fontFamily: MONO, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>
              Add
            </button>
          </div>
          {customPartners.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginTop: 10 }}>
              {customPartners.map(p => (
                <span key={p} onClick={() => { setCustomPartners(cp=>cp.filter(x=>x!==p)); setSelNiches(n=>n.filter(x=>x!==p)); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "rgba(245,184,31,0.1)", border: "1px solid rgba(245,184,31,0.2)", fontFamily: MONO, fontSize: 9, fontWeight: 600, color: "rgba(245,184,31,0.7)", cursor: "pointer" }}>
                  ✕ {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <main style={{ flex: 1, background: PAPER, borderLeft: `1px solid ${INK15}` }}>

        {/* ─ 01 PARTNER INTELLIGENCE ─ */}
        <Section num="01" title="Partner Intelligence" action={allPartners.length ? `${allPartners.length} targets` : ""}>
          <div style={{ padding: "28px 32px" }}>
            {allPartners.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <p style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: INK35, lineHeight: 1.6 }}>Select your industry and strategy on the left to see partner targets.</p>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: INK35, marginTop: 12, display: "block" }}>Results update instantly</span>
              </div>
            ) : (
              <div>
                {allPartners.map((p, i) => {
                  const isSel = selNiches.includes(p.name);
                  return (
                    <div key={p.name} onClick={() => setSelNiches(n => isSel ? n.filter(x=>x!==p.name) : [...n,p.name])}
                      style={{ borderBottom: `1px solid ${INK15}`, padding: "22px 0", display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 18px", cursor: "pointer", background: isSel ? "#fffdf5" : "transparent", paddingLeft: isSel ? 8 : 0, transition: "all 0.12s" }}>
                      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isSel ? "#c4900a" : INK35, paddingTop: 3 }}>{String(i+1).padStart(2,"0")}</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", color: INK }}>{p.name}</span>
                          {isSel && <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, background: YEL, color: DARK, padding: "3px 8px", flexShrink: 0 }}>Selected</span>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                          <Field label="Why they fit" value={p.why} />
                          <Field label="Example companies" value={p.example} color={AMBER} />
                          <Field label="Link placement" value={p.link} color={BLUE} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Suggestions */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${INK15}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: INK55, display: "block", marginBottom: 4 }}>AI-Powered Suggestions</span>
                  <span style={{ fontSize: 12, color: INK55 }}>Powered by Claude — personalised to your exact business</span>
                </div>
                <button onClick={() => callAI("partner-suggestions")} disabled={aiMode === "suggestions" || !ind}
                  style={{ ...btn("dark"), opacity: (!ind || aiMode === "suggestions") ? 0.5 : 1, cursor: (!ind || aiMode === "suggestions") ? "wait" : "pointer" }}>
                  {aiMode === "suggestions" ? "Generating…" : "Get AI Suggestions"}
                </button>
              </div>
              {aiError && aiMode === null && <div style={{ fontSize: 12, color: "#b02020", padding: "10px 14px", background: "#fdf0f0", border: "1px solid #e8c0c0", marginBottom: 12 }}>{aiError}</div>}
              {aiResult["partner-suggestions"] && (
                <div style={{ background: "#fafaf6", border: `1px solid ${INK15}`, borderLeft: `3px solid ${INK}`, padding: "20px 22px", fontSize: 13, lineHeight: 1.8, color: INK70, whiteSpace: "pre-wrap" as const, fontFamily: GROT }}>
                  {aiResult["partner-suggestions"]}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ─ 02 QUALIFY ─ */}
        <Section num="02" title="Qualify a Partner" action="Score before you pitch">
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <span style={rpLabel}>Company Name</span>
                <input style={rpInput} placeholder="e.g. Admiral Car Insurance" value={scPartner} onChange={e => setScPartner(e.target.value)} />
              </div>
              <div>
                <span style={rpLabel}>Partner Category</span>
                <input style={rpInput} placeholder="e.g. Car Insurance" value={scCat} onChange={e => setScCat(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {[{l:"Yes = 2 pts",c:"#eef7f2",t:GREEN},{l:"Partial = 1 pt",c:"#fff3e6",t:AMBER},{l:"No = 0 pts",c:"#fdf0f0",t:"#b02020"}].map(p=>(
                <span key={p.l} style={{ display:"inline-block",padding:"3px 9px",fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,background:p.c,color:p.t }}>{p.l}</span>
              ))}
            </div>

            {SCORECARD_QS.map((q,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:16,padding:"15px 0",borderBottom:`1px solid ${INK15}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:INK,marginBottom:3,lineHeight:1.4 }}>{q.q}</div>
                  <div style={{ fontSize:11,color:INK55,lineHeight:1.55 }}>{q.sub}</div>
                </div>
                <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                  {[{l:"Yes",v:2,k:"ay"},{l:"Part",v:1,k:"ap"},{l:"No",v:0,k:"an"}].map(b=>{
                    const sel = scores[i]===b.v && scores[i]!==undefined;
                    const bg = sel ? (b.v===2?GREEN:b.v===1?"#a06800":"#b02020") : "transparent";
                    return <button key={b.v} onClick={()=>setScores(s=>({...s,[i]:b.v}))} style={{ padding:"6px 11px",border:`1px solid ${sel?bg:INK35}`,background:bg,fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:sel?"#fff":INK55,cursor:"pointer" }}>{b.l}</button>;
                  })}
                </div>
              </div>
            ))}

            <div style={{ background:DARK,padding:"24px 28px",marginTop:20,display:"flex",alignItems:"center",gap:28,flexWrap:"wrap" as const }}>
              <div style={{ textAlign:"center",flexShrink:0 }}>
                <span style={{ fontFamily:SERIF,fontSize:56,fontWeight:700,color:YEL,lineHeight:1,display:"block",letterSpacing:"-0.03em" }}>{scorePct}%</span>
                <span style={{ fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:"rgba(241,235,222,0.25)",marginTop:5,display:"block" }}>Fit Score</span>
              </div>
              <div style={{ flex:1,minWidth:160 }}>
                <div style={{ height:3,background:"#1e1c17",marginBottom:14 }}><div style={{ height:"100%",background:YEL,width:`${scorePct}%`,transition:"width 0.5s ease" }} /></div>
                <div style={{ fontSize:12,color:scorePct>=70?"#7ad4a0":scorePct>=45?"#f0c060":scorePct>0?"#e08080":"rgba(241,235,222,0.4)",lineHeight:1.65 }}>
                  {scoreVerdict || "Answer the questions above to score this partner."}
                </div>
              </div>
            </div>

            <div style={{ marginTop:28 }}>
              <span style={rpLabel}>Pre-Outreach Checklist</span>
              {CHECKLIST.map((c,i)=>(
                <div key={i} onClick={()=>setChecklist(cl=>{const n=[...cl];n[i]=!n[i];return n;})}
                  style={{ display:"flex",gap:12,padding:"13px 0",borderBottom:`1px solid ${INK15}`,cursor:"pointer" }}>
                  <div style={{ width:18,height:18,border:`2px solid ${checklist[i]?GREEN:INK35}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:checklist[i]?"#fff":"transparent",background:checklist[i]?GREEN:"transparent",marginTop:2,transition:"all 0.12s" }}>✓</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:checklist[i]?INK55:INK,textDecoration:checklist[i]?"line-through":"none",lineHeight:1.45 }}>{c.text}</div>
                    <div style={{ fontSize:11,color:INK55,marginTop:2,lineHeight:1.55 }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─ 03 OUTREACH TEMPLATE ─ */}
        <Section num="03" title="Outreach Template" action={<span>Fill in the <span style={{ color:AMBER,fontWeight:700 }}>[bracketed fields]</span></span>}>
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display:"flex",borderBottom:`2px solid ${INK}`,marginBottom:24 }}>
              {(["discount","institution","badge"] as Strategy[]).map(s=>(
                <button key={s} onClick={()=>setTplTab(s)} style={{ padding:"10px 18px",border:"none",background:"transparent",fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:tplTab===s?INK:INK55,cursor:"pointer",borderBottom:`2px solid ${tplTab===s?INK:"transparent"}`,marginBottom:-2,transition:"all 0.15s" }}>
                  {s==="discount"?"Discount Partnership":s==="institution"?"Institution Rebate":"Expert Roundup"}
                </button>
              ))}
            </div>

            {(["discount","institution","badge"] as Strategy[]).map(s => tplTab!==s ? null : (
              <div key={s}>
                <div style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${INK}`,padding:"22px",fontSize:13,fontFamily:GROT,fontWeight:400,lineHeight:1.9,whiteSpace:"pre-wrap" as const,color:INK,marginBottom:12 }}>
                  {s==="discount"?`Subject: Partnership idea — [THEIR BRAND] × [YOUR BRAND]: a deal for your clients?\n\nHi [FIRST NAME],\n\nI'm [YOUR NAME] from [YOUR BRAND] — we [ONE-LINE DESCRIPTION].\n\nI noticed you serve the same people we do — [SHARED AUDIENCE] — just from a completely different angle.\n\nHere's what I'd like to propose: we offer your clients an exclusive [X]% discount on [YOUR PRODUCT/SERVICE]. In exchange, you mention us on your partner page with a link.\n\nThree-way win: your clients get a deal, you give them extra value, we get a warm referral.\n\n15 minutes to explore this?\n\n[YOUR NAME]\n[ROLE] · [BRAND] · [WEBSITE]`
                  :s==="institution"?`Subject: Exclusive [DISCOUNT] for [INSTITUTION] students/members\n\nHi [STUDENT SERVICES CONTACT],\n\nI'm [YOUR NAME] from [YOUR BRAND]. We [DESCRIPTION] and a large part of our customer base is students / [MEMBER TYPE].\n\nWe'd love to offer [INSTITUTION] members an exclusive [X]% discount using a dedicated code.\n\nAll we'd ask in return is a mention on your rebate or resources page with a link. No strings, no fees.\n\nWould you be the right person to arrange this?\n\n[YOUR NAME]\n[ROLE] · [BRAND] · [WEBSITE]`
                  :`Subject: Featured in our [GUIDE TITLE] — and a badge for your site\n\nHi [EXPERT'S NAME],\n\nI'm putting together a guide: [GUIDE TITLE] — featuring leading [EXPERT TYPE] ranked by [CRITERIA].\n\nHere's what you'd get:\n→ A feature with your name, credentials, and a link to your site\n→ A "[AWARD NAME]" badge for your website\n→ Promotion to our audience of [SIZE/TYPE]\n\nAll I need: [ONE EXPERT QUESTION]\n\nGuide goes live: [DATE]\n\nInterested?\n\n[YOUR NAME]\n[ROLE] · [BRAND] · [WEBSITE]`}
                </div>
                <button onClick={()=>{const el=document.querySelector(`[data-tpl="${s}"]`);if(el)navigator.clipboard.writeText(el.textContent||"");}}
                  style={{ ...btn("outline"), fontSize: 9 }}>
                  Copy Template
                </button>
              </div>
            ))}

            {/* AI email generator */}
            <div style={{ marginTop:28,paddingTop:24,borderTop:`1px solid ${INK15}` }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12,marginBottom:16 }}>
                <div>
                  <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:INK55,display:"block",marginBottom:4 }}>AI-Generated Email</span>
                  <span style={{ fontSize:12,color:INK55 }}>Claude writes a fully personalised email for your specific partner</span>
                </div>
                <button onClick={()=>callAI("email-writer")} disabled={aiMode==="email"||!biz}
                  style={{ ...btn("dark"),opacity:(!biz||aiMode==="email")?0.5:1,cursor:(!biz||aiMode==="email")?"wait":"pointer" }}>
                  {aiMode==="email"?"Generating…":"Generate AI Email"}
                </button>
              </div>
              {aiResult["email-writer"] && (
                <div style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${YEL}`,padding:"20px 22px",fontSize:13,lineHeight:1.8,color:INK70,whiteSpace:"pre-wrap" as const,fontFamily:GROT }}>
                  {aiResult["email-writer"]}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ─ 04 CAMPAIGN BRIEF ─ */}
        <Section num="04" title="Campaign Brief" action="Auto-populated · updates live">
          {/* Brief header */}
          <div style={{ padding:"32px 32px 24px",borderBottom:`1px solid ${INK15}` }}>
            <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:INK35,marginBottom:12,display:"block" }}>CollabIQ · SIA Wire · S02E06 · Partnership Intelligence</span>
            <h2 style={{ fontFamily:SERIF,fontSize:26,fontWeight:700,letterSpacing:"-0.02em",color:INK,marginBottom:6,lineHeight:1.1 }}>Collab Link Building Campaign Brief</h2>
            <span style={{ fontFamily:MONO,fontSize:10,fontWeight:500,letterSpacing:"0.08em",color:INK35 }}>{new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})}</span>
          </div>

          <div style={{ padding:"0 32px 32px" }}>
            <BriefSection label="Business">
              <BriefRow k="Name" v={biz} /><BriefRow k="Website" v={domain} /><BriefRow k="Description" v={desc} />
              <BriefRow k="Industry" v={ind} /><BriefRow k="Audience" v={audType} /><BriefRow k="Geography" v={geo} />
              <BriefRow k="Strategy" v={STRATEGY_DETAILS[strategy].label} />
            </BriefSection>

            <BriefSection label="Target Partner Categories">
              {selNiches.length ? selNiches.map(n=>(
                <span key={n} style={{ display:"inline-flex",alignItems:"center",background:"#fdf8ec",border:"1px solid rgba(245,184,31,0.35)",padding:"4px 10px",fontSize:11,fontWeight:600,color:"#7a4e00",margin:2 }}>{n}</span>
              )) : <span style={{ color:INK35,fontSize:13 }}>No categories selected — click partner cards above to select.</span>}
            </BriefSection>

            <BriefSection label="Scored Partner">
              <BriefRow k="Company" v={scPartner} /><BriefRow k="Fit Score" v={scorePct > 0 ? scorePct+"%" : "Not scored yet"} />
              <BriefRow k="Verdict" v={scoreVerdict} />
            </BriefSection>

            <BriefSection label="Strategy Overview">
              <p style={{ fontSize:13,fontWeight:400,lineHeight:1.8,color:INK70 }}>{STRATEGY_DETAILS[strategy].detail}</p>
            </BriefSection>

            <BriefSection label="Next Actions">
              {STRATEGY_DETAILS[strategy].actions.map((a,i)=>(
                <div key={i} style={{ display:"flex",gap:10,alignItems:"baseline",marginBottom:4 }}>
                  <span style={{ color:INK35,flexShrink:0,fontSize:12 }}>→</span>
                  <span style={{ fontSize:13,color:INK70 }}>{a}</span>
                </div>
              ))}
            </BriefSection>

            {/* AI brief generator */}
            <div style={{ paddingTop:24,borderTop:`1px solid ${INK15}`,marginTop:8 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12,marginBottom:16 }}>
                <div>
                  <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:INK55,display:"block",marginBottom:4 }}>AI Campaign Brief</span>
                  <span style={{ fontSize:12,color:INK55 }}>Claude writes a full 90-day campaign strategy brief</span>
                </div>
                <button onClick={()=>callAI("campaign-brief")} disabled={aiMode==="brief"||!biz}
                  style={{ ...btn("dark"),opacity:(!biz||aiMode==="brief")?0.5:1,cursor:(!biz||aiMode==="brief")?"wait":"pointer" }}>
                  {aiMode==="brief"?"Generating…":"Generate AI Brief"}
                </button>
              </div>
              {aiResult["campaign-brief"] && (
                <div style={{ background:"#fafaf6",border:`1px solid ${INK15}`,borderLeft:`3px solid ${INK}`,padding:"20px 22px",fontSize:13,lineHeight:1.8,color:INK,fontFamily:GROT,whiteSpace:"pre-wrap" as const }}>
                  {aiResult["campaign-brief"]}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" as const,marginTop:28,paddingTop:24,borderTop:`2px solid ${INK}` }}>
              <button onClick={downloadPDF} style={btn("dark")}>Download PDF</button>
              <button onClick={()=>{const el=document.getElementById("collabiq-brief");if(el)navigator.clipboard.writeText(el.innerText);}} style={btn("outline")}>Copy Brief</button>
            </div>
          </div>

          {/* EMOS CTA */}
          <div style={{ background:DARK,padding:"32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap" as const }}>
            <div>
              <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:"rgba(245,184,31,0.45)",marginBottom:8,display:"block" }}>Ready to execute this strategy?</span>
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
        </Section>

      </main>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────
function Section({ num, title, action, children }: { num: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `2px solid ${INK}` }}>
      <div style={{ display:"flex",alignItems:"center",borderBottom:`1px solid ${INK15}` }}>
        <span style={{ fontFamily:MONO,fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:YEL,background:INK,padding:"13px 18px",borderRight:`1px solid ${INK15}`,flexShrink:0 }}>{num}</span>
        <span style={{ fontFamily:MONO,fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:INK55,padding:"13px 18px",flex:1 }}>{title}</span>
        {action && <span style={{ fontFamily:MONO,fontSize:9,color:INK35,padding:"13px 18px",flexShrink:0 }}>{action}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <span style={{ fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase" as const,color:INK35,marginBottom:4,display:"block" }}>{label}</span>
      <span style={{ fontSize:12,color:color||INK70,lineHeight:1.55 }}>{value}</span>
    </div>
  );
}

function BriefSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop:22,paddingBottom:22,borderBottom:`1px solid ${INK15}` }}>
      <span style={{ fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:INK35,marginBottom:14,display:"block",paddingBottom:10,borderBottom:`1px solid ${INK15}` }}>{label}</span>
      {children}
    </div>
  );
}

function BriefRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${INK15}` }}>
      <span style={{ fontFamily:MONO,fontSize:10,fontWeight:600,letterSpacing:"0.05em",color:INK55,width:130,flexShrink:0,paddingTop:1 }}>{k}</span>
      <span style={{ fontSize:13,color:INK,flex:1,lineHeight:1.5 }}>{v || "—"}</span>
    </div>
  );
}

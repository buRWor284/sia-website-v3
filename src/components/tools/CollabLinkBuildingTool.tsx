"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface PartnerEntry {
  name: string;
  why: string;
  example: string;
  link: string;
}

interface PartnerMap {
  discount: PartnerEntry[];
  institution: PartnerEntry[];
  badge: PartnerEntry[];
}

type StratKey = "discount" | "institution" | "badge";

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const industries = [
  { icon: "🚗", name: "Automotive" },
  { icon: "🏠", name: "Home & Real Estate" },
  { icon: "💰", name: "Finance & Insurance" },
  { icon: "🏃", name: "Health & Wellness" },
  { icon: "✈️", name: "Travel & Hospitality" },
  { icon: "👗", name: "Fashion & Apparel" },
  { icon: "🍽️", name: "Food & Beverage" },
  { icon: "💻", name: "SaaS / Software" },
  { icon: "🛒", name: "E-commerce / Retail" },
  { icon: "⚖️", name: "Legal Services" },
  { icon: "📚", name: "Education / EdTech" },
  { icon: "🐾", name: "Pet Care" },
  { icon: "💍", name: "Wedding & Events" },
  { icon: "🏋️", name: "Fitness & Sports" },
  { icon: "📣", name: "Marketing / Agency" },
];

const partnerData: Record<string, PartnerMap> = {
  Automotive: {
    discount: [
      { name: "Car Insurance Companies", why: "Same audience — every car owner needs insurance.", example: "Admiral, Direct Line, Aviva", link: "Partner page / deals page" },
      { name: "Car Leasing Companies", why: "Leasing customers immediately need tyres, accessories, servicing.", example: "Leaseplan, Lex Autolease", link: "Partner resources" },
      { name: "Breakdown Cover Providers", why: "AA/RAC customers are car owners who need auto care.", example: "AA, RAC, Green Flag", link: "Partner deals section" },
      { name: "Auto Finance Providers", why: "New car finance = new car owner needing everything.", example: "Black Horse, Motonovo", link: "Customer perks page" },
      { name: "Driving Schools", why: "New drivers are a major untapped auto-care audience.", example: "RED, BSM, AA Driving School", link: "Student resources" },
      { name: "Fuel Card Companies", why: "Fleet & business drivers are premium auto-care buyers.", example: "Allstar, Fleetcor", link: "Fleet resources" },
    ],
    institution: [
      { name: "Universities with Motoring Societies", why: ".edu links from student pages — students are new car owners.", example: "University of Birmingham, UCL", link: "Student discounts page" },
      { name: "Fleet Industry Associations", why: "Fleet managers are a major B2B auto-care audience.", example: "BVRLA, FTA", link: "Member benefits" },
      { name: "Motoring Charities & Clubs", why: "Dedicated car enthusiast audiences.", example: "IAM RoadSmart, Classic Car Club", link: "Member perks" },
    ],
    badge: [
      { name: "Independent Auto Mechanics / Garages", why: 'Feature top-rated local garages in a "Best Mechanics" guide.', example: "Independents on Google Maps", link: "Badge on their website" },
      { name: "Motoring Journalists & Bloggers", why: 'Create a "Top UK Motoring Writers" roundup with badges.', example: "Car Magazine contributors", link: "Badge + bio page" },
      { name: "Driving Instructors", why: '"Best Driving Instructors in [City]" guide — badges on their sites.', example: "DVSA-registered instructors", link: "Badge on instructor sites" },
    ],
  },
  "Health & Wellness": {
    discount: [
      { name: "Gym Chains & Fitness Studios", why: "Your customers buy supplements, they go to the gym. Same wallet.", example: "PureGym, Anytime Fitness", link: "Partner deals page" },
      { name: "Health Insurance Providers", why: "Health-conscious people buy wellness products AND insurance.", example: "Bupa, AXA Health", link: "Member perks" },
      { name: "Activewear Brands", why: "Fitness gear and supplements are bought in the same mindset window.", example: "Gymshark, Lululemon", link: "Collab page" },
      { name: "Nutrition Apps", why: "App users tracking macros are your ideal supplement buyer.", example: "MyFitnessPal, Cronometer", link: "Partner integrations" },
    ],
    institution: [
      { name: "Universities", why: "Student health and fitness is a major institutional focus.", example: "Student Unions across UK/US", link: "Student discounts page ← .edu links" },
      { name: "Sports Clubs & Associations", why: "Club members are your exact target buyer.", example: "Athletics clubs, BUCS", link: "Member benefits page" },
      { name: "NHS / Healthcare Bodies", why: "Wellness products near public health bodies get trusted links.", example: "NHS partners, CCGs", link: "Healthy living resources ← .nhs.uk" },
    ],
    badge: [
      { name: "Personal Trainers & Coaches", why: 'Feature top PTs in your area in a "Best Coaches" guide.', example: "PT Network, Google Maps PTs", link: "Badge on PT website" },
      { name: "Nutritionists & Dietitians", why: '"Top Registered Dietitians" guide — nutrition authority builds trust.', example: "BDA members", link: "Badge on practice sites" },
      { name: "Fitness Influencers", why: '"Most Trusted Fitness Voices" — badge earns links from their sites.', example: "Instagram fitness creators", link: "Badge in bio/website" },
    ],
  },
  "E-commerce / Retail": {
    discount: [
      { name: "Payment Gateway Providers", why: "Every online seller uses payments. You share the merchant audience.", example: "Stripe, Klarna, PayPal", link: "Partner ecosystem page" },
      { name: "Shipping & Logistics Companies", why: "E-com businesses need fulfillment AND your product.", example: "Evri, DPD, ShipBob", link: "Partner perks" },
      { name: "E-commerce Platform Partners", why: "Shopify/WooCommerce store owners are your B2B audience.", example: "Shopify App Store, WooCommerce", link: "App directory listing" },
      { name: "Product Photography Services", why: "Every seller needs great photos — same ecosystem.", example: "Local photography studios", link: "Recommended tools page" },
    ],
    institution: [
      { name: "Universities with Business / E-com Courses", why: "Students learning to sell online are your audience.", example: "Northampton, Manchester Met", link: "Student discounts / resources" },
      { name: "Small Business Associations", why: "SMB members are exactly who buys e-com tools.", example: "FSB, Chambers of Commerce", link: "Member resources page" },
    ],
    badge: [
      { name: "E-commerce Bloggers & Consultants", why: '"Top E-commerce Experts to Follow" — badge on their site.', example: "Shopify Partners, consultants", link: "Badge + author bio" },
      { name: "Podcast Hosts in Your Niche", why: 'Feature them in a "Best Podcasts for [Niche] Sellers" guide.', example: "Independent podcasters", link: "Badge on podcast site" },
    ],
  },
  "SaaS / Software": {
    discount: [
      { name: "Digital Marketing Agencies", why: "Agencies recommend software to clients constantly.", example: "Top agencies in your country", link: "Agency partner program" },
      { name: "Complementary SaaS Tools", why: "Integration partners can list you on their integrations page.", example: "Zapier, HubSpot integrations", link: "Integrations / ecosystem page" },
      { name: "Startup Accelerators", why: "Startups sign up for software from day one.", example: "Y Combinator, Seedcamp", link: "Startup deals / stack page" },
      { name: "Online Course Platforms", why: "Educators teaching relevant skills recommend tools mid-course.", example: "Udemy, Teachable instructors", link: "Resources section" },
    ],
    institution: [
      { name: "Universities with CS / Business Programmes", why: "Students need tools + .edu backlinks are gold.", example: "Imperial, Stanford", link: "Student resources page" },
      { name: "Industry Trade Associations", why: "Professional body members are your B2B buyers.", example: "CIPR, CIM, IoD", link: "Member benefits / recommended tools" },
    ],
    badge: [
      { name: "Industry Bloggers & Analysts", why: '"Top [Industry] Blogs to Follow" guide — badge on their site.', example: "Niche newsletter writers", link: "Badge in footer or about page" },
      { name: "Consultants Who Use Your Tool", why: 'Feature power users in a "Case Study Champions" guide with badge.', example: "Freelancers, consultants", link: "Badge + case study page" },
    ],
  },
  "Fitness & Sports": {
    discount: [
      { name: "Sports Nutrition Brands", why: "Fitness gear and supplements are bought by the same person.", example: "Myprotein, Optimum Nutrition", link: "Partner deals" },
      { name: "Personal Trainers", why: "PTs recommend equipment and gear to clients every day.", example: "Independent PTs, PT studios", link: "Recommended gear page" },
      { name: "Sports Clubs & Associations", why: "Club members are the core buyer for sports products.", example: "Athletics clubs, swimming clubs", link: "Member perks / kit supplier" },
    ],
    institution: [
      { name: "University Sports Unions", why: "Students in sports societies are your prime buyer — .edu links.", example: "University Athletic Unions", link: "Student sports discounts" },
      { name: "National Governing Bodies", why: "NGBs represent sport practitioners at every level.", example: "British Swimming, UK Athletics", link: "Affiliated member perks" },
      { name: "Schools with Sports Programmes", why: "Schools need kit and equipment — .sch.uk links.", example: "Academy trusts, PE departments", link: "School sports resources" },
    ],
    badge: [
      { name: "Sports Coaches & Instructors", why: 'Create "Top [Sport] Coaches in [Country]" — badge on their site.', example: "Swimming, cycling, running coaches", link: "Badge on coach website" },
      { name: "Fitness YouTubers & Bloggers", why: '"Most Trusted [Sport] Creators" guide with ranked badge.', example: "YouTube fitness channels", link: "Badge in video description / website" },
      { name: "Event Organisers", why: '"Best [Sport] Events to Enter" guide — badge on event sites.', example: "Parkrun, triathlon events", link: "Badge on event page" },
    ],
  },
  default: {
    discount: [
      { name: "Non-competing companies serving your exact audience", why: "Same customer base, different product category.", example: "Identify via competitor backlink analysis", link: "Partner / deals page" },
      { name: "Complementary service providers", why: "They complete your product or solve an adjacent problem.", example: "Study your customer journey", link: "Recommended resources" },
      { name: "Industry tool & software providers", why: "Businesses using industry tools are also your buyers.", example: 'Search your industry + "software"', link: "Integration or partner page" },
    ],
    institution: [
      { name: "Industry trade associations", why: "Members are professionals in your exact target sector.", example: "Search [your industry] + association", link: "Member benefits / resources" },
      { name: "Universities running related courses", why: ".edu links from student resources pages.", example: "Search [your topic] + university course", link: "Student resources page" },
    ],
    badge: [
      { name: "Niche bloggers & content creators", why: 'Feature them in a "Top Voices in [Niche]" roundup.', example: "Search your niche + blog/YouTube", link: "Badge on their site" },
      { name: "Practitioners & consultants", why: "Expert feature + badge earns a trusted contextual link.", example: "LinkedIn search in your industry", link: "Badge on practice/consultant site" },
    ],
  },
};

const scorecardQs = [
  { q: "Do they serve the same target audience?", sub: "Would their ideal customer also consider buying from you?" },
  { q: "Are they genuinely non-competing with your offer?", sub: "A customer choosing them doesn't mean they won't also choose you." },
  { q: "Do they have a real web presence with some domain authority?", sub: "Check their site exists, has content, and has some backlinks. Use Ahrefs or SEMrush." },
  { q: "Do they have a page where they could logically place a link?", sub: "Partner page, deals page, resources section, blog — a natural home for a mention." },
  { q: "Is there a clear value exchange you can offer?", sub: "Discount code, co-written piece, institutional listing, badge — something concrete." },
  { q: "Do they already mention or link to complementary brands?", sub: "Check their blog, resources page, or footer. If yes, they're already open to it." },
  { q: "Can you find a specific named contact to reach out to?", sub: "A named person on LinkedIn or their website — not a generic info@ address." },
  { q: "Is their brand quality and reputation acceptable?", sub: "You'll be associated with them. A low-quality or spammy site can hurt your own authority." },
];

const checklistItems = [
  { text: "Study your top 3 competitors' backlink profiles first", sub: "Use Ahrefs or SEMrush. Look for clusters of links from the same type of site — that's the strategy map." },
  { text: "Identify the right contact person at the target company", sub: "LinkedIn: Head of Marketing, SEO Manager, Partnerships Lead, Student Services." },
  { text: "Research the company before writing anything", sub: "Know their products, tone, audience, and what they already offer as partner perks." },
  { text: "Prepare a specific mutual-value proposition", sub: "What do THEY get? A discount to offer clients, a featured spot, a badge. Make it concrete." },
  { text: "Create or identify a linkable asset", sub: "Discount code, expert guide, badge embed, university rebate — something with a clear URL to link to." },
  { text: "Check if they already have a partner/deals/resources page", sub: "If they do, your pitch has a ready home. If not, suggest where the link could live." },
  { text: "Set a follow-up reminder for 5–7 business days", sub: "Most deals happen on follow-up. One email rarely closes." },
  { text: "Track outreach in a spreadsheet", sub: "Company, contact, email sent, date, response, outcome. Don't manage it in your head." },
];

const strategyDetails: Record<StratKey, { label: string; detail: string; actions: string[] }> = {
  discount: {
    label: "🏷️ Discount Partnership",
    detail: "Offer a discount code or referral deal to your target partner's customers. The partner promotes the deal to their audience — and links to your site from their partner page, deals section, or blog. The pitch is a three-way win: you earn links and referral traffic, they offer their clients added value, and their customers get a deal. NTA used this with car insurance and car leasing companies to build a link portfolio that contributed to growing from £165K to £1M+ per month in organic revenue.",
    actions: [
      "Identify 10–20 target companies per partner category",
      "Create a unique discount code or landing page for each partner",
      "Find the Head of Marketing or Partnerships Manager on LinkedIn",
      "Send personalised outreach using the Discount Partnership template",
      "Negotiate placement: aim for a contextual in-content link, not just a footer",
      "Track which partner pages go live and monitor monthly in Ahrefs/SEMrush",
      "Follow up with performance data to strengthen the relationship over time",
    ],
  },
  institution: {
    label: "🎓 Institution Rebate",
    detail: ".edu, .gov, and .org backlinks are among the hardest to earn — but the Institution Rebate model provides a direct, scalable path to them. Offer an exclusive discount for students, members, or citizens of an institution. They list the deal on their student rebate, member benefits, or resources page. A fitness supplements brand earned dozens of .edu backlinks using this approach at scale.",
    actions: [
      "Build a list of 20–50 relevant universities, colleges, or associations",
      "Create a dedicated institution discount landing page with a unique code per institution",
      "Find the Student Services, Welfare Officer, or Member Benefits contact",
      "Send the Institution Rebate outreach template — keep it short and benefit-led",
      "Ask them to list it on their student discounts or member benefits page",
      "Monitor .edu/.org link acquisitions monthly in Ahrefs",
      "Expand to professional associations, trade bodies, and alumni networks",
    ],
  },
  badge: {
    label: "🏅 Expert Roundup + Badge",
    detail: "Create a high-quality guide featuring experts, coaches, or practitioners in a field adjacent to your audience. Rank them by a transparent KPI (followers, certifications, years of experience). Award each featured expert a downloadable badge — embedded with your URL in the badge image code. Every expert who displays the badge on their website gives you an automatic backlink.",
    actions: [
      "Choose a topic your audience cares about and identify relevant expert types",
      "Build a list of 30–50 experts via LinkedIn, Google, and Instagram",
      "Define a transparent ranking criteria (e.g. certifications, following, years active)",
      "Send outreach inviting them to be featured — make the value clear (promotion + badge)",
      "Create the expert guide with quality writing, photos, and expert quotes",
      "Design a branded 'Featured Expert' badge with your URL embedded in the HTML embed code",
      "Publish and notify all featured experts — track badge usage monthly",
    ],
  },
};

const templates: Record<StratKey, string> = {
  discount: `Subject: Partnership idea — [THEIR BRAND] × [YOUR BRAND]: a deal for your clients?

Hi [FIRST NAME],

I'm [YOUR NAME] from [YOUR BRAND] — we [ONE-LINE DESCRIPTION].

I came across [THEIR BRAND] and noticed something: you serve the same people we do — [SHARED AUDIENCE] — just from a completely different angle.

Here's what I'd like to propose:

We offer your clients an exclusive [X]% discount on [YOUR PRODUCT/SERVICE]. In exchange, you mention us on your partner page or resources section with a link.

Three-way win: your clients get a deal, you give them extra value, and we get a warm referral.

We've done this with [EXAMPLE PARTNER IF YOU HAVE ONE] and it's worked well for both sides.

15 minutes to explore this?

[YOUR NAME]
[ROLE] · [BRAND] · [WEBSITE]`,
  institution: `Subject: Exclusive [DISCOUNT] for [UNIVERSITY/ASSOCIATION] students/members

Hi [STUDENT SERVICES / WELFARE CONTACT],

I'm [YOUR NAME] from [YOUR BRAND]. We [DESCRIPTION] and a large part of our customer base is students / [MEMBER TYPE].

We'd love to offer [INSTITUTION NAME] students/members an exclusive [X]% discount using a dedicated code.

All we'd ask in return is a mention on your student discounts / rebate page with a link to our site so students can find and use the offer easily.

We're already live on several university rebate pages and it's a genuinely useful perk for students — no strings, no fees.

Would you be the right person to arrange this, or should I reach out to someone else on your team?

[YOUR NAME]
[ROLE] · [BRAND] · [WEBSITE]`,
  badge: `Subject: Featured in our [GUIDE TITLE] — and a badge for your site

Hi [EXPERT'S NAME],

I'm putting together a guide: [GUIDE TITLE] — featuring leading [EXPERT TYPE e.g. swimming coaches] ranked by [CRITERIA e.g. experience, follower count, certifications].

I'd love to include you. Here's what you'd get:

→ A feature in the guide with your name, credentials, and a link to your site
→ A downloadable "[AWARD NAME]" badge you can display on your website
→ Promotion to our audience of [AUDIENCE SIZE/TYPE]

All I need from you is a short answer to this question: [YOUR ONE EXPERT QUESTION]

The guide goes live on [DATE] — happy to send you a preview before we publish.

Interested?

[YOUR NAME]
[ROLE] · [BRAND] · [WEBSITE]`,
};

// ─────────────────────────────────────────────────────────────
// CSS (injected once at mount)
// ─────────────────────────────────────────────────────────────

const css = `
  .clb-root{--black:#0d0d0b;--white:#faf9f6;--cream:#f3f0e8;--gold:#c4913a;--gold-light:#e8d5a8;--gold-pale:#fdf6e6;--mid:#6b6460;--border:#e2ddd4;--green:#2a6e45;--green-bg:#edf6f1;--amber:#b85c00;--amber-bg:#fdf3e6;--red:#b03030;--red-bg:#fdf0f0;--blue:#2a5080;--blue-bg:#edf3fb;--card:#ffffff;--shadow:0 2px 12px rgba(0,0,0,.06);font-family:'Georgia',serif;background:var(--cream);color:var(--black);font-size:15px;}
  .clb-root *{box-sizing:border-box;margin:0;padding:0;}
  .clb-topbar{background:var(--black);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;border-bottom:2px solid var(--gold);}
  .clb-topbar-brand{color:var(--gold);font-size:12px;letter-spacing:.15em;text-transform:uppercase;}
  .clb-topbar-tag{color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
  .clb-hero{background:var(--black);color:var(--white);padding:64px 28px 0;text-align:center;}
  .clb-hero-eyebrow{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--gold);margin-bottom:20px;display:block;}
  .clb-hero-title{font-size:clamp(32px,5vw,52px);font-weight:normal;line-height:1.15;margin-bottom:22px;}
  .clb-hero-title em{color:var(--gold);font-style:normal;}
  .clb-hero-sub{font-size:16px;color:#999;max-width:580px;margin:0 auto 36px;line-height:1.7;}
  .clb-proof-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#1a1a18;border-top:1px solid #1a1a18;max-width:900px;margin:0 auto;}
  .clb-proof-card{background:#111110;padding:28px 24px;text-align:left;}
  .clb-proof-card .p-label{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin-bottom:12px;display:block;}
  .clb-proof-card .p-num{font-size:30px;color:var(--gold);display:block;line-height:1;margin-bottom:6px;}
  .clb-proof-card .p-desc{font-size:12px;color:#777;line-height:1.5;}
  .clb-proof-card .p-strategy{display:inline-block;margin-top:10px;padding:3px 10px;border-radius:12px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;background:#1e1e1c;color:#666;}
  .clb-hiw{background:var(--cream);padding:56px 28px;border-bottom:1px solid var(--border);}
  .clb-sec-eyebrow{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:12px;display:block;}
  .clb-sec-title{font-size:clamp(22px,3vw,30px);font-weight:normal;text-align:center;margin-bottom:8px;}
  .clb-sec-sub{font-size:14px;color:var(--mid);text-align:center;max-width:520px;margin:0 auto 44px;line-height:1.7;}
  .clb-steps-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:860px;margin:0 auto;}
  .clb-step-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:24px 20px;position:relative;}
  .clb-step-card::after{content:'→';position:absolute;right:-14px;top:50%;transform:translateY(-50%);color:var(--gold);font-size:18px;z-index:2;}
  .clb-step-card:last-child::after{display:none;}
  .clb-step-card .s-num{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;display:block;}
  .clb-step-card .s-icon{font-size:28px;margin-bottom:12px;display:block;}
  .clb-step-card h4{font-size:14px;font-weight:normal;margin-bottom:6px;}
  .clb-step-card p{font-size:12px;color:var(--mid);line-height:1.6;}
  .clb-strategies{background:var(--black);padding:64px 28px;}
  .clb-strategy-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:960px;margin:0 auto;}
  .clb-strat-card{background:#111110;border:1px solid #222;border-radius:8px;padding:28px 24px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
  .clb-strat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);opacity:0;transition:opacity .2s;}
  .clb-strat-card:hover,.clb-strat-card.active{border-color:var(--gold);background:#141412;}
  .clb-strat-card:hover::before,.clb-strat-card.active::before{opacity:1;}
  .clb-strat-card .strat-num{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin-bottom:16px;display:block;}
  .clb-strat-card .strat-icon{font-size:32px;margin-bottom:14px;display:block;}
  .clb-strat-card h3{font-size:17px;font-weight:normal;color:var(--white);margin-bottom:10px;line-height:1.3;}
  .clb-strat-card .strat-desc{font-size:13px;color:#888;line-height:1.65;margin-bottom:18px;}
  .clb-strat-card .strat-example{background:#1a1a18;border-radius:4px;padding:12px 14px;font-size:11px;color:#aaa;line-height:1.6;}
  .clb-strat-card .strat-example strong{color:var(--gold);font-weight:normal;}
  .clb-strat-card .strat-win{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
  .win-pill{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;background:#1e1e1c;color:#777;letter-spacing:.05em;}
  .clb-strat-card.active .win-pill{background:#2a2418;color:var(--gold);}
  .active-badge{display:none;position:absolute;top:14px;right:14px;background:var(--gold);color:var(--black);font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:10px;}
  .clb-strat-card.active .active-badge{display:block;}
  .clb-tool-wrap{max-width:860px;margin:0 auto;padding:48px 24px 80px;}
  .clb-prog-track{display:flex;align-items:center;gap:0;margin-bottom:40px;background:var(--card);border:1px solid var(--border);border-radius:6px;overflow:hidden;}
  .clb-prog-step{flex:1;padding:14px 10px;border:none;background:transparent;cursor:pointer;font-family:'Georgia',serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mid);border-right:1px solid var(--border);transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;}
  .clb-prog-step:last-child{border-right:none;}
  .clb-prog-step .ps-num{font-size:15px;color:inherit;}
  .clb-prog-step.active{background:var(--black);color:var(--gold);}
  .clb-prog-step.done{background:#f0f5f1;color:var(--green);}
  .clb-panel{display:none;}
  .clb-panel.active{display:block;}
  .clb-panel-head{margin-bottom:32px;padding-bottom:22px;border-bottom:1px solid var(--border);}
  .clb-panel-head .ph-tag{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;display:block;}
  .clb-panel-head h2{font-size:clamp(22px,3vw,30px);font-weight:normal;margin-bottom:10px;line-height:1.3;}
  .clb-panel-head p{font-size:14px;color:var(--mid);line-height:1.7;}
  .clb-card{background:var(--card);border:1px solid var(--border);border-radius:6px;padding:26px;margin-bottom:20px;box-shadow:var(--shadow);}
  .clb-card h3{font-size:15px;font-weight:normal;margin-bottom:18px;letter-spacing:.02em;}
  .clb-card-sub{font-size:13px;color:var(--mid);margin-bottom:18px;line-height:1.6;}
  .clb-callout{border-radius:6px;padding:18px 20px;margin-bottom:20px;font-size:13px;line-height:1.7;}
  .clb-callout-gold{background:var(--gold-pale);border-left:3px solid var(--gold);color:#6b4c10;}
  .clb-callout strong{font-weight:normal;color:inherit;font-style:italic;}
  .clb-callout .c-source{font-size:11px;opacity:.7;margin-top:6px;display:block;letter-spacing:.05em;}
  .clb-label{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mid);margin-bottom:8px;}
  .clb-input,.clb-textarea,.clb-select{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:4px;font-family:'Georgia',serif;font-size:14px;color:var(--black);background:var(--white);outline:none;transition:border-color .2s;margin-bottom:20px;}
  .clb-input:focus,.clb-textarea:focus,.clb-select:focus{border-color:var(--gold);}
  .clb-textarea{resize:vertical;min-height:80px;}
  .clb-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .clb-ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:20px;}
  .clb-ind-chip{padding:12px 14px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:var(--white);transition:all .15s;display:flex;align-items:center;gap:10px;font-family:'Georgia',serif;}
  .clb-ind-chip:hover{border-color:var(--gold);background:var(--gold-pale);}
  .clb-ind-chip.sel{background:var(--black);color:var(--gold);border-color:var(--black);}
  .clb-ind-chip .ic-icon{font-size:20px;flex-shrink:0;}
  .clb-ind-chip .ic-text{font-size:13px;line-height:1.2;}
  .clb-sp-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
  .clb-sp-card{padding:16px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:var(--white);transition:all .15s;text-align:center;}
  .clb-sp-card:hover{border-color:var(--gold);}
  .clb-sp-card.sel{border-color:var(--gold);background:var(--gold-pale);}
  .clb-sp-card .sp-icon{font-size:26px;margin-bottom:8px;display:block;}
  .clb-sp-card .sp-name{font-size:13px;font-weight:normal;}
  .clb-sp-card .sp-sub{font-size:11px;color:var(--mid);margin-top:4px;line-height:1.4;}
  .clb-niche-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;}
  .clb-nc{background:var(--white);border:1px solid var(--border);border-radius:6px;padding:18px;cursor:pointer;transition:all .15s;position:relative;}
  .clb-nc:hover{border-color:var(--gold);transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.08);}
  .clb-nc.sel{border-color:var(--gold);background:var(--gold-pale);}
  .clb-nc .nc-check{position:absolute;top:12px;right:12px;width:20px;height:20px;border-radius:50%;background:var(--gold);color:var(--black);display:flex;align-items:center;justify-content:center;font-size:11px;}
  .clb-nc .nc-name{font-size:14px;margin-bottom:6px;}
  .clb-nc .nc-why{font-size:12px;color:var(--mid);line-height:1.55;margin-bottom:8px;}
  .clb-nc .nc-example{font-size:11px;color:var(--amber);background:var(--amber-bg);padding:4px 10px;border-radius:12px;display:inline-block;}
  .clb-nc .nc-link-type{font-size:10px;color:var(--blue);background:var(--blue-bg);padding:3px 8px;border-radius:10px;display:inline-block;margin-top:4px;}
  .clb-sc-item{padding:18px 0;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:flex-start;}
  .clb-sc-item:last-child{border-bottom:none;}
  .clb-sc-q{flex:1;}
  .clb-sc-q .sq-text{font-size:14px;line-height:1.5;margin-bottom:4px;}
  .clb-sc-q .sq-sub{font-size:12px;color:var(--mid);line-height:1.5;}
  .clb-sc-btns{display:flex;flex-direction:column;gap:5px;flex-shrink:0;}
  .clb-sc-btn{padding:6px 14px;border-radius:4px;border:1px solid var(--border);cursor:pointer;font-size:12px;font-family:'Georgia',serif;background:var(--white);color:var(--mid);transition:all .15s;white-space:nowrap;}
  .clb-sc-btn:hover{border-color:var(--gold);}
  .clb-sc-btn.ay{background:var(--green);color:#fff;border-color:var(--green);}
  .clb-sc-btn.ap{background:#d4870a;color:#fff;border-color:#d4870a;}
  .clb-sc-btn.an{background:var(--red);color:#fff;border-color:var(--red);}
  .clb-score-meter{background:var(--black);border-radius:8px;padding:28px;margin:24px 0 20px;display:flex;gap:28px;align-items:center;flex-wrap:wrap;}
  .clb-score-num-wrap{text-align:center;flex-shrink:0;}
  .clb-score-big{font-size:52px;color:var(--gold);line-height:1;display:block;}
  .clb-score-label{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#666;margin-top:4px;display:block;}
  .clb-score-right{flex:1;min-width:200px;}
  .clb-score-bar-wrap{height:8px;background:#1a1a18;border-radius:4px;overflow:hidden;margin-bottom:14px;}
  .clb-score-bar-fill{height:100%;background:var(--gold);border-radius:4px;transition:width .5s ease;}
  .clb-verdict-text{font-size:13px;line-height:1.65;color:#ccc;}
  .clb-verdict-text.v-strong{color:#7ad4a0;}
  .clb-verdict-text.v-mid{color:#f0c070;}
  .clb-verdict-text.v-weak{color:#e08080;}
  .clb-cl-item{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--border);cursor:pointer;user-select:none;}
  .clb-cl-item:last-child{border-bottom:none;}
  .clb-cl-box{width:22px;height:22px;border:1.5px solid var(--border);border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;color:transparent;transition:all .15s;margin-top:1px;}
  .clb-cl-item.ck .clb-cl-box{background:var(--green);border-color:var(--green);color:#fff;}
  .clb-cl-item.ck .cl-main{text-decoration:line-through;color:var(--mid);}
  .cl-main{font-size:14px;line-height:1.5;}
  .cl-sub{font-size:12px;color:var(--mid);margin-top:3px;line-height:1.5;}
  .clb-tab-row{display:flex;gap:0;border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:20px;}
  .clb-tab-btn{flex:1;padding:11px 8px;border:none;background:transparent;cursor:pointer;font-family:'Georgia',serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mid);border-right:1px solid var(--border);transition:all .2s;}
  .clb-tab-btn:last-child{border-right:none;}
  .clb-tab-btn.active{background:var(--black);color:var(--gold);}
  .clb-tpl-box{background:#fafaf7;border:1px solid var(--border);border-radius:4px;padding:22px;font-size:13px;line-height:1.85;white-space:pre-wrap;font-family:'Georgia',serif;color:var(--black);margin-bottom:14px;}
  .clb-btn{display:inline-block;padding:13px 26px;border-radius:4px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;font-family:'Georgia',serif;transition:all .2s;}
  .clb-btn-gold{background:var(--gold);color:var(--black);}
  .clb-btn-gold:hover{background:#b0802a;}
  .clb-btn-dark{background:var(--black);color:var(--gold);}
  .clb-btn-dark:hover{background:#222;}
  .clb-btn-outline{background:transparent;color:var(--black);border:1px solid var(--border);}
  .clb-btn-outline:hover{border-color:var(--gold);}
  .clb-btn-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px;padding-top:22px;border-top:1px solid var(--border);justify-content:space-between;align-items:center;}
  .clb-brief-wrap{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:36px;box-shadow:var(--shadow);}
  .clb-brief-hd{text-align:center;margin-bottom:36px;padding-bottom:28px;border-bottom:2px solid var(--gold);}
  .clb-brief-hd h2{font-size:24px;font-weight:normal;margin-bottom:6px;}
  .clb-brief-hd p{font-size:12px;color:var(--mid);letter-spacing:.08em;}
  .clb-brief-sec{margin-bottom:30px;}
  .clb-brief-sec h4{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--border);}
  .clb-brief-row{display:flex;gap:16px;padding:8px 0;border-bottom:1px solid #f2ede4;font-size:13px;}
  .clb-brief-key{color:var(--mid);width:160px;flex-shrink:0;font-size:12px;}
  .clb-brief-val{color:var(--black);flex:1;}
  .clb-brief-tag{display:inline-flex;align-items:center;gap:4px;background:var(--gold-pale);border:1px solid var(--gold-light);border-radius:16px;padding:4px 12px;font-size:12px;margin:3px;}
  .clb-next-items{font-size:13px;line-height:2.1;color:#444;}
  .clb-next-items div{display:flex;gap:10px;align-items:baseline;}
  .clb-next-items .ni-check{color:var(--gold);flex-shrink:0;}
  .clb-add-partner-row{display:flex;gap:10px;align-items:flex-end;}
  .clb-add-partner-row .clb-input{margin-bottom:0;flex:1;}
  .clb-added-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}
  .clb-added-tag{display:inline-flex;align-items:center;gap:6px;background:var(--amber-bg);border:1px solid #e8c8a0;border-radius:16px;padding:4px 12px;font-size:12px;cursor:pointer;}
  .clb-added-tag:hover{background:#fde0c0;}
  .clb-empty-state{text-align:center;padding:36px;color:var(--mid);font-size:13px;border:1px dashed var(--border);border-radius:6px;}
  .clb-pill{display:inline-block;padding:2px 10px;border-radius:10px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;}
  .clb-pill-g{background:var(--green-bg);color:var(--green);}
  .clb-pill-a{background:var(--amber-bg);color:var(--amber);}
  .clb-pill-r{background:var(--red-bg);color:var(--red);}
  .clb-quote-block{border-left:3px solid var(--gold);padding:14px 18px;margin:16px 0;font-size:13px;font-style:italic;color:#555;line-height:1.7;background:var(--gold-pale);}
  .clb-quote-block .q-attr{font-style:normal;font-size:11px;color:var(--mid);margin-top:8px;display:block;letter-spacing:.05em;}
  /* ── AI SECTIONS ── */
  .clb-ai-card{background:var(--black);border:2px solid var(--gold);border-radius:8px;padding:28px;margin-top:24px;}
  .clb-ai-card-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .clb-ai-badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:var(--black);font-family:'Georgia',serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;padding:5px 12px;border-radius:3px;font-weight:normal;flex-shrink:0;}
  .clb-ai-card-title{font-size:17px;font-weight:normal;color:var(--white);line-height:1.2;}
  .clb-ai-card-desc{font-size:13px;color:#aaa;line-height:1.65;margin-bottom:20px;}
  .clb-ai-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 24px;border-radius:4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1px solid var(--gold);background:var(--gold);color:var(--black);font-family:'Georgia',serif;transition:all .2s;}
  .clb-ai-btn:hover{background:#b0802a;border-color:#b0802a;}
  .clb-ai-btn:disabled{opacity:.45;cursor:not-allowed;}
  .clb-ai-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(13,13,11,.3);border-top-color:var(--black);border-radius:50%;animation:clb-spin .7s linear infinite;}
  @keyframes clb-spin{to{transform:rotate(360deg);}}
  .clb-ai-result{background:#111110;border:1px solid #333;border-radius:6px;padding:22px;margin-top:18px;font-size:13px;line-height:1.85;white-space:pre-wrap;font-family:'Georgia',serif;color:#ddd;}
  .clb-ai-result-label{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;display:block;}
  .clb-ai-result-copy{display:inline-flex;align-items:center;gap:6px;margin-top:14px;padding:8px 16px;border:1px solid #444;border-radius:4px;background:transparent;color:#aaa;font-family:'Georgia',serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
  .clb-ai-result-copy:hover{border-color:var(--gold);color:var(--gold);}
  .clb-ai-note{font-size:11px;color:#777;margin-top:10px;font-style:italic;}
  .clb-ai-error{font-size:12px;color:#e08080;margin-top:10px;}
  @media(max-width:700px){.clb-steps-row{grid-template-columns:1fr 1fr;}.clb-strategy-grid{grid-template-columns:1fr;}.clb-sp-row{grid-template-columns:1fr;}.clb-form-row{grid-template-columns:1fr;}.clb-proof-strip{grid-template-columns:1fr;}}
  @media print{.clb-topbar,.clb-prog-track,.clb-btn-row,.clb-strategies,.clb-hiw{display:none!important;}.clb-panel{display:block!important;}.clb-card{break-inside:avoid;}}
`;

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CollabLinkBuildingTool() {
  const [step, setStep] = useState(0);

  // Step 1
  const [biz, setBiz] = useState("");
  const [domain, setDomain] = useState("");
  const [desc, setDesc] = useState("");
  const [selIndustry, setSelIndustry] = useState("");
  const [customInd, setCustomInd] = useState("");
  const [audType, setAudType] = useState("");
  const [geo, setGeo] = useState("");
  const [audDesc, setAudDesc] = useState("");
  const [selStrat, setSelStrat] = useState<StratKey>("discount");

  // Step 2
  const [selNiches, setSelNiches] = useState<string[]>([]);
  const [customPartners, setCustomPartners] = useState<string[]>([]);
  const [customPInput, setCustomPInput] = useState("");

  // Step 3
  const [scores, setScores] = useState<Record<number, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [scPartner, setScPartner] = useState("");
  const [scCat, setScCat] = useState("");
  const [activeTpl, setActiveTpl] = useState<StratKey>("discount");

  // AI state
  const [aiPartnerLoading, setAiPartnerLoading] = useState(false);
  const [aiPartnerResult, setAiPartnerResult] = useState("");
  const [aiEmailLoading, setAiEmailLoading] = useState(false);
  const [aiEmailResult, setAiEmailResult] = useState("");
  const [aiBriefLoading, setAiBriefLoading] = useState(false);
  const [aiBriefResult, setAiBriefResult] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (document.getElementById("clb-styles")) return;
    const el = document.createElement("style");
    el.id = "clb-styles";
    el.textContent = css;
    document.head.appendChild(el);
  }, []);

  // Derived
  const effectiveIndustry = customInd || selIndustry;
  const stratData = (partnerData[effectiveIndustry] || partnerData["default"])[selStrat] || [];
  const scoreTotal = Object.values(scores).reduce((a, b) => a + b, 0);
  const scorePct = scorecardQs.length > 0 ? Math.round((scoreTotal / (scorecardQs.length * 2)) * 100) : 0;
  const verdictText =
    scorePct >= 70
      ? `Strong prospect (${scorePct}%). This partner ticks the key criteria. Prioritise them, personalise your pitch, and invest time in the outreach.`
      : scorePct >= 45
      ? `Moderate fit (${scorePct}%). Some gaps — review which criteria scored low. A stronger value proposition can often bridge the gap.`
      : `Low fit (${scorePct}%). This company may not be the right collab partner right now. Find a higher-scoring target before investing outreach time.`;
  const verdictClass = scorePct >= 70 ? "v-strong" : scorePct >= 45 ? "v-mid" : "v-weak";

  const goTo = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleNiche = (name: string) => {
    setSelNiches(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const addCustomP = () => {
    const v = customPInput.trim();
    if (!v) return;
    if (!customPartners.includes(v)) {
      setCustomPartners(p => [...p, v]);
      setSelNiches(n => n.includes(v) ? n : [...n, v]);
    }
    setCustomPInput("");
  };

  const removeCustomP = (name: string) => {
    setCustomPartners(p => p.filter(x => x !== name));
    setSelNiches(n => n.filter(x => x !== name));
  };

  const copyBrief = () => {
    const sd = strategyDetails[selStrat];
    const text = [
      "COLLAB LINK BUILDING CAMPAIGN BRIEF",
      `Generated: ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`,
      "", "BUSINESS",
      `Business: ${biz || "—"}`, `Website: ${domain || "—"}`,
      `Description: ${desc || "—"}`, `Industry: ${effectiveIndustry || "—"}`,
      `Audience: ${audType || "—"}`, `Geography: ${geo || "—"}`,
      `Strategy: ${sd.label}`, "", "TARGET PARTNER CATEGORIES",
      selNiches.join(", ") || "None selected", "", "SCORED PARTNER",
      `Company: ${scPartner || "—"}`, `Category: ${scCat || "—"}`,
      `Fit Score: ${Object.keys(scores).length > 0 ? scorePct + "%" : "Not scored"}`,
      `Verdict: ${verdictText}`, "", "STRATEGY DETAIL", sd.detail,
      "", "NEXT ACTIONS", ...sd.actions.map(a => `→ ${a}`),
      aiBriefResult ? "\n\nAI CAMPAIGN BRIEF\n" + aiBriefResult : "",
    ].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const callAI = useCallback(async (
    type: string,
    payload: Record<string, unknown>,
    setLoading: (v: boolean) => void,
    setResult: (v: string) => void,
  ) => {
    setLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/collab-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json() as { result?: string };
      setResult(json.result || "");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runAIPartners = () => callAI("partner-suggestions",
    { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat },
    setAiPartnerLoading, setAiPartnerResult);

  const runAIEmail = () => callAI("email-writer",
    { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat, partner: scPartner, partnerCat: scCat, scorePct },
    setAiEmailLoading, setAiEmailResult);

  const runAIBrief = () => {
    const sd = strategyDetails[selStrat];
    callAI("campaign-brief",
      { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat, stratLabel: sd.label, selNiches, partner: scPartner, partnerCat: scCat, scorePct, verdictText },
      setAiBriefLoading, setAiBriefResult);
  };

  // ── Render ──

  return (
    <div className="clb-root">
      {/* TOPBAR */}
      <div className="clb-topbar">
        <span className="clb-topbar-brand">Syed Irfan Ajmal · SIA Wire</span>
        <span className="clb-topbar-tag">S02E06 · Collab Link Building</span>
      </div>

      {/* HERO */}
      <div className="clb-hero">
        <span className="clb-hero-eyebrow">Interactive Tool · The SIA Business Podcast · Season 2 Episode 6</span>
        <h1 className="clb-hero-title">The <em>Collab Link Building</em><br />Partner Finder</h1>
        <p className="clb-hero-sub">Three proven strategies. Real case studies. A step-by-step system for earning high-quality backlinks by partnering with non-competing companies that share your audience.</p>
        <div className="clb-proof-strip">
          <div className="clb-proof-card">
            <span className="p-label">NTA · Auto Retailer · UK</span>
            <span className="p-num">£165K→£1.2M</span>
            <p className="p-desc">Monthly organic revenue after Collab Link Building with car insurance &amp; leasing companies.</p>
            <span className="p-strategy">Discount Partnership</span>
          </div>
          <div className="clb-proof-card">
            <span className="p-label">Fitness Supplements · E-commerce</span>
            <span className="p-num">.edu Backlinks</span>
            <p className="p-desc">Earned university backlinks — the hardest type to get — by offering student discounts.</p>
            <span className="p-strategy">Institution Rebate</span>
          </div>
          <div className="clb-proof-card">
            <span className="p-label">Sports Accessories · E-commerce</span>
            <span className="p-num">Auto-Backlinks</span>
            <p className="p-desc">Swimming coaches who used the branded badge embed automatically gave the site a backlink.</p>
            <span className="p-strategy">Expert Roundup + Badge</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="clb-hiw">
        <span className="clb-sec-eyebrow">How Collab Link Building Works</span>
        <h2 className="clb-sec-title">Same audience. Different offer. No competition.</h2>
        <p className="clb-sec-sub">Find companies that serve your exact customers but don&apos;t sell what you sell — then create a mutual-benefit arrangement that earns you a link.</p>
        <div className="clb-steps-row">
          {[
            { n: "01", icon: "🔍", title: "Find Shoulder Niches", body: "Identify non-competing companies that share your audience. Study competitor backlinks — that's where the opportunity already exists." },
            { n: "02", icon: "🤝", title: "Choose a Strategy", body: "Discount partnership, institution rebate, or expert roundup with badge. Pick the model that fits your business and partners." },
            { n: "03", icon: "📊", title: "Score & Qualify", body: "Not every potential partner is worth approaching. Score each one against 8 criteria before investing time in outreach." },
            { n: "04", icon: "✉️", title: "Pitch the Win-Win-Win", body: "Three-way value: you get links, they add a partner perk, their customers get a deal. That's the pitch." },
          ].map(s => (
            <div className="clb-step-card" key={s.n}>
              <span className="s-num">Step {s.n}</span>
              <span className="s-icon">{s.icon}</span>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 STRATEGIES */}
      <div className="clb-strategies">
        <span className="clb-sec-eyebrow">Three Proven Models</span>
        <h2 className="clb-sec-title" style={{ color: "var(--white)" }}>Choose Your Collab Strategy</h2>
        <p className="clb-sec-sub">Each model works differently. The tool will tailor partner suggestions and outreach templates to whichever you select.</p>
        <div className="clb-strategy-grid">
          {([
            { id: "discount" as StratKey, num: "Model 01", icon: "🏷️", title: "Discount Partnership", desc: "Offer a discount to your partner's customers. They promote the deal — and link to you from their partner page, deals page, or blog.", example: "NTA (auto retailer) offered car insurance & car leasing companies a discount for their customers. Those companies listed NTA on their partner pages with a backlink. Revenue went from £165K → over £1M/month.", wins: ["You get: Links + referral traffic", "They get: Extra perk for their clients", "Customer gets: Discount"] },
            { id: "institution" as StratKey, num: "Model 02", icon: "🎓", title: "Institution Rebate", desc: "Offer a discount specifically to institutions (universities, associations, government bodies). They list you on their rebate or resources page — giving you rare .edu or .gov backlinks.", example: "A fitness supplements e-commerce brand offered universities a student discount. Universities listed them on student rebate pages. Result: a flood of .edu backlinks.", wins: ["You get: .edu/.gov/.org links", "They get: Exclusive deal for members", "Students/members get: Savings"] },
            { id: "badge" as StratKey, num: "Model 03", icon: "🏅", title: "Expert Roundup + Badge", desc: "Build an expert guide featuring coaches, specialists, or practitioners in your space. Award them a badge with your URL embedded — every site that displays it links back automatically.", example: "A sports accessories brand created a swimming guide featuring top coaches. Coaches received a badge with an embedded backlink. Every coach who used the badge became an automatic backlink source.", wins: ["You get: Links + expert credibility", "They get: Featured + badge for their site", "Audience gets: Expert guide"] },
          ]).map(s => (
            <div key={s.id} className={`clb-strat-card${selStrat === s.id ? " active" : ""}`} onClick={() => setSelStrat(s.id)}>
              <div className="active-badge">Selected</div>
              <span className="strat-num">{s.num}</span>
              <span className="strat-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p className="strat-desc">{s.desc}</p>
              <div className="strat-example"><strong>Real Case:</strong> {s.example}</div>
              <div className="strat-win">{s.wins.map(w => <span className="win-pill" key={w}>{w}</span>)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOOL */}
      <div className="clb-tool-wrap">
        <nav className="clb-prog-track">
          {["Your Business", "Partner Discovery", "Score a Partner", "Campaign Brief"].map((label, i) => (
            <button key={i} className={`clb-prog-step${step === i ? " active" : step > i ? " done" : ""}`} onClick={() => goTo(i)}>
              <span className="ps-num">0{i + 1}</span>{label}
            </button>
          ))}
        </nav>

        {/* ── Step 1 ── */}
        <div className={`clb-panel${step === 0 ? " active" : ""}`}>
          <div className="clb-panel-head">
            <span className="ph-tag">Step 01 of 04 · Business Setup</span>
            <h2>Define your business, audience &amp; strategy</h2>
            <p>Collab link building starts with knowing who your audience is and which of the three strategy models fits your business.</p>
          </div>
          <div className="clb-callout clb-callout-gold">
            <strong>The Competitor Shortcut:</strong> Before anything, study the backlinks of your top 3 competitors in Ahrefs or SEMrush. Look for clusters of links from the same types of sites. That&apos;s where the opportunity already exists.
            <span className="c-source">— S02E06 Transcript, Syed Irfan Ajmal</span>
          </div>
          <div className="clb-card">
            <h3>Your Business</h3>
            <div className="clb-form-row">
              <div>
                <label className="clb-label">Business / Brand Name</label>
                <input className="clb-input" value={biz} onChange={e => setBiz(e.target.value)} placeholder="e.g. National Tyres & Auto-Care" />
              </div>
              <div>
                <label className="clb-label">Website</label>
                <input className="clb-input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. nationaltyres.co.uk" />
              </div>
            </div>
            <label className="clb-label">What you do (one sentence)</label>
            <input className="clb-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. We sell tyres and auto-care services across the UK" />
          </div>
          <div className="clb-card">
            <h3>Your Industry</h3>
            <p className="clb-card-sub">Select your primary industry — this unlocks tailored shoulder-niche suggestions in Step 2.</p>
            <div className="clb-ind-grid">
              {industries.map(ind => (
                <div key={ind.name} className={`clb-ind-chip${selIndustry === ind.name ? " sel" : ""}`} onClick={() => { setSelIndustry(ind.name); setCustomInd(""); }}>
                  <span className="ic-icon">{ind.icon}</span>
                  <span className="ic-text">{ind.name}</span>
                </div>
              ))}
            </div>
            <label className="clb-label">Or describe a custom industry</label>
            <input className="clb-input" value={customInd} onChange={e => { setCustomInd(e.target.value); if (e.target.value) setSelIndustry(""); }} placeholder="e.g. Pet Grooming, Legal Tech, B2B SaaS..." />
          </div>
          <div className="clb-card">
            <h3>Your Audience</h3>
            <div className="clb-form-row">
              <div>
                <label className="clb-label">Audience Type</label>
                <select className="clb-select" value={audType} onChange={e => setAudType(e.target.value)}>
                  <option value="">— Select —</option>
                  <option>B2C Consumers</option>
                  <option>B2B Small Businesses</option>
                  <option>B2B Mid-Market / Enterprise</option>
                  <option>Both B2B and B2C</option>
                </select>
              </div>
              <div>
                <label className="clb-label">Geography</label>
                <select className="clb-select" value={geo} onChange={e => setGeo(e.target.value)}>
                  <option value="">— Select —</option>
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
            </div>
            <label className="clb-label">Describe your typical customer</label>
            <textarea className="clb-textarea" value={audDesc} onChange={e => setAudDesc(e.target.value)} placeholder="e.g. Car owners aged 25–55 across the UK who need tyres, MOTs, and auto-care services..." />
          </div>
          <div className="clb-card">
            <h3>Which Collab Strategy fits you best?</h3>
            <p className="clb-card-sub">You can run all three, but start with one. The tool will tailor partner suggestions and the outreach template to your choice.</p>
            <div className="clb-sp-row">
              {([
                { id: "discount" as StratKey, icon: "🏷️", name: "Discount Partnership", sub: "Partner page / deals page links" },
                { id: "institution" as StratKey, icon: "🎓", name: "Institution Rebate", sub: ".edu / .org / .gov links" },
                { id: "badge" as StratKey, icon: "🏅", name: "Expert Roundup + Badge", sub: "Embedded badge auto-links" },
              ]).map(s => (
                <div key={s.id} className={`clb-sp-card${selStrat === s.id ? " sel" : ""}`} onClick={() => setSelStrat(s.id)}>
                  <span className="sp-icon">{s.icon}</span>
                  <div className="sp-name">{s.name}</div>
                  <div className="sp-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="clb-btn-row">
            <span style={{ fontSize: "12px", color: "var(--mid)" }}>Fill in your details above to unlock partner discovery</span>
            <button className="clb-btn clb-btn-gold" onClick={() => goTo(1)}>Discover Partners →</button>
          </div>
        </div>

        {/* ── Step 2 ── */}
        <div className={`clb-panel${step === 1 ? " active" : ""}`}>
          <div className="clb-panel-head">
            <span className="ph-tag">Step 02 of 04 · Partner Discovery</span>
            <h2>Your shoulder-niche partner targets</h2>
            <p>These companies share your audience but don&apos;t compete with you. Select the categories that look viable.</p>
          </div>
          <div className="clb-callout clb-callout-gold">
            {selStrat === "discount" && <><strong>Discount Partnership Strategy:</strong> Your pitch is a three-way win — your company gets a link, the partner gives their audience a perk, and their customers get a discount. Focus on companies with an existing &quot;partner deals&quot; or &quot;recommended&quot; page.</>}
            {selStrat === "institution" && <><strong>Institution Rebate Strategy:</strong> The goal is .edu, .org, or .gov links. Your pitch: an exclusive discount for their students/members in exchange for a listing on their rebate or resources page.</>}
            {selStrat === "badge" && <><strong>Expert Roundup + Badge Strategy:</strong> You&apos;re building a guide featuring real practitioners. Each expert gets promoted and a badge they can display on their site. The badge embed includes your URL — every display is an automatic backlink.</>}
            <span className="c-source">— S02E06 · Syed Irfan Ajmal</span>
          </div>
          <div className="clb-card">
            <h3>Suggested Partner Categories — <span style={{ color: "var(--gold)" }}>{effectiveIndustry || "your industry"}</span></h3>
            <p className="clb-card-sub">Based on your industry and chosen strategy. Click to select.</p>
            {stratData.length > 0 ? (
              <div className="clb-niche-grid">
                {stratData.map(n => (
                  <div key={n.name} className={`clb-nc${selNiches.includes(n.name) ? " sel" : ""}`} onClick={() => toggleNiche(n.name)}>
                    {selNiches.includes(n.name) && <div className="nc-check">✓</div>}
                    <div className="nc-name">{n.name}</div>
                    <div className="nc-why">{n.why}</div>
                    <span className="nc-example">{n.example}</span><br />
                    <span className="nc-link-type">Link placement: {n.link}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="clb-empty-state">← Complete Step 1 to see tailored suggestions.</div>
            )}
            <div className="clb-ai-card">
              <div className="clb-ai-card-header">
                <span className="clb-ai-badge">✦ AI-Powered</span>
                <span className="clb-ai-card-title">AI Partner Intelligence</span>
              </div>
              <p className="clb-ai-card-desc">Instead of generic categories, get specific company names, the right LinkedIn contact to search for, and a tailored &ldquo;why them&rdquo; rationale — all generated from your exact business details.</p>
              <button className="clb-ai-btn" onClick={runAIPartners} disabled={aiPartnerLoading || (!biz && !desc)}>
                {aiPartnerLoading ? <><span className="clb-ai-spinner" /> Generating partner suggestions…</> : "✦ Generate AI Partner Suggestions"}
              </button>
              {(!biz && !desc) && <p className="clb-ai-note">← Fill in your business details in Step 1 first.</p>}
              {aiError && <p className="clb-ai-error">{aiError}</p>}
              {aiPartnerResult && (
                <div className="clb-ai-result">
                  <span className="clb-ai-result-label">✦ AI-generated — specific to your business</span>
                  {aiPartnerResult}
                  <button className="clb-ai-result-copy" onClick={() => navigator.clipboard.writeText(aiPartnerResult).catch(() => {})}>Copy</button>
                </div>
              )}
            </div>
          </div>
          <div className="clb-card">
            <h3>Add Custom Partners</h3>
            <p className="clb-card-sub">A specific company or type you already have in mind.</p>
            <div className="clb-add-partner-row">
              <input className="clb-input" value={customPInput} onChange={e => setCustomPInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomP()} placeholder="e.g. RAC Breakdown Cover, LV= Insurance..." />
              <button className="clb-btn clb-btn-outline" onClick={addCustomP} style={{ marginBottom: "0" }}>Add</button>
            </div>
            {customPartners.length > 0 && (
              <div className="clb-added-tags">
                {customPartners.map(p => <span key={p} className="clb-added-tag" onClick={() => removeCustomP(p)}>✕ {p}</span>)}
              </div>
            )}
          </div>
          <div className="clb-card">
            <h3>How to find the right contact</h3>
            <p className="clb-card-sub">Sending to a generic info@ is the fastest way to get ignored.</p>
            <div className="clb-quote-block">
              &ldquo;The outreach campaign was not just us asking for a link. We told them: if your clients want auto care, refer them to us — they&apos;ll get X% discount.&rdquo;
              <span className="q-attr">— Syed Irfan Ajmal, S02E06</span>
            </div>
            <div style={{ fontSize: "13px", lineHeight: "1.85", color: "#444", marginTop: "4px" }}>
              Search LinkedIn for: <strong>Head of Marketing</strong>, <strong>SEO Manager</strong>, or <strong>Partnerships Manager</strong>. For institutions: <strong>Student Services</strong> or <strong>Welfare Officer</strong>. For expert roundups: their coaching website contact form or Instagram DM.
            </div>
          </div>
          <div className="clb-btn-row">
            <button className="clb-btn clb-btn-outline" onClick={() => goTo(0)}>← Back</button>
            <button className="clb-btn clb-btn-gold" onClick={() => goTo(2)}>Score a Partner →</button>
          </div>
        </div>

        {/* ── Step 3 ── */}
        <div className={`clb-panel${step === 2 ? " active" : ""}`}>
          <div className="clb-panel-head">
            <span className="ph-tag">Step 03 of 04 · Qualify &amp; Score</span>
            <h2>Partner Qualification Scorecard</h2>
            <p>Run any specific company through these 8 questions before spending time on outreach. A score under 50% is a signal to find a better-fit target first.</p>
          </div>
          <div className="clb-card">
            <h3>Who are you scoring?</h3>
            <div className="clb-form-row">
              <div>
                <label className="clb-label">Company Name</label>
                <input className="clb-input" value={scPartner} onChange={e => setScPartner(e.target.value)} placeholder="e.g. Admiral Car Insurance" />
              </div>
              <div>
                <label className="clb-label">Partner Category</label>
                <input className="clb-input" value={scCat} onChange={e => setScCat(e.target.value)} placeholder="e.g. Car Insurance" />
              </div>
            </div>
          </div>
          <div className="clb-card">
            <h3>Qualification Questions</h3>
            <p className="clb-card-sub" style={{ marginBottom: "4px" }}>
              <span className="clb-pill clb-pill-g">Yes = 2 pts</span>&nbsp;
              <span className="clb-pill clb-pill-a">Partial = 1 pt</span>&nbsp;
              <span className="clb-pill clb-pill-r">No = 0 pts</span>
            </p>
            {scorecardQs.map((q, i) => (
              <div className="clb-sc-item" key={i}>
                <div className="clb-sc-q">
                  <div className="sq-text">{q.q}</div>
                  <div className="sq-sub">{q.sub}</div>
                </div>
                <div className="clb-sc-btns">
                  {([{ val: 2, label: "Yes ✓", cls: "ay" }, { val: 1, label: "Sort of ~", cls: "ap" }, { val: 0, label: "No ✗", cls: "an" }] as const).map(({ val, label, cls }) => (
                    <button key={val} className={`clb-sc-btn${scores[i] === val ? ` ${cls}` : ""}`} onClick={() => setScores(prev => ({ ...prev, [i]: val }))}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="clb-score-meter">
              <div className="clb-score-num-wrap">
                <span className="clb-score-big">{Object.keys(scores).length > 0 ? `${scorePct}%` : "—"}</span>
                <span className="clb-score-label">Fit Score</span>
              </div>
              <div className="clb-score-right">
                <div className="clb-score-bar-wrap"><div className="clb-score-bar-fill" style={{ width: `${scorePct}%` }} /></div>
                <div className={`clb-verdict-text${Object.keys(scores).length > 0 ? ` ${verdictClass}` : ""}`}>
                  {Object.keys(scores).length > 0 ? verdictText : "Answer the questions above to generate your score."}
                </div>
              </div>
            </div>
          </div>
          <div className="clb-card">
            <h3>Pre-Outreach Checklist</h3>
            <p className="clb-card-sub">Complete these before sending a single email.</p>
            {checklistItems.map((c, i) => (
              <div key={i} className={`clb-cl-item${checkedItems[i] ? " ck" : ""}`} onClick={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))}>
                <div className="clb-cl-box">✓</div>
                <div><div className="cl-main">{c.text}</div><div className="cl-sub">{c.sub}</div></div>
              </div>
            ))}
          </div>
          <div className="clb-card">
            <h3>Outreach Template</h3>
            <p className="clb-card-sub">Tailored to your chosen strategy. Fill in the <span style={{ color: "var(--gold)" }}>[bracketed fields]</span> — or use AI to generate a fully personalised email below.</p>
            <div className="clb-tab-row">
              {([["discount", "🏷️ Discount"], ["institution", "🎓 Institution"], ["badge", "🏅 Badge"]] as [StratKey, string][]).map(([id, label]) => (
                <button key={id} className={`clb-tab-btn${activeTpl === id ? " active" : ""}`} onClick={() => setActiveTpl(id)}>{label}</button>
              ))}
            </div>
            <div className="clb-tpl-box">{templates[activeTpl]}</div>
            <button className="clb-btn clb-btn-outline" onClick={() => navigator.clipboard.writeText(templates[activeTpl]).catch(() => {})} style={{ fontSize: "11px" }}>Copy Template</button>
            <div className="clb-ai-card">
              <div className="clb-ai-card-header">
                <span className="clb-ai-badge">✦ AI-Powered</span>
                <span className="clb-ai-card-title">AI Outreach Email Writer</span>
              </div>
              <p className="clb-ai-card-desc">Skip the template. Get a fully written, ready-to-send email personalised to your business, the partner you just scored, and your chosen strategy. Just review and hit send.</p>
              <button className="clb-ai-btn" onClick={runAIEmail} disabled={aiEmailLoading || !biz}>
                {aiEmailLoading ? <><span className="clb-ai-spinner" /> Writing your email…</> : "✦ Write My Outreach Email"}
              </button>
              {!biz && <p className="clb-ai-note">← Fill in your business name in Step 1 first.</p>}
              {aiEmailResult && (
                <div className="clb-ai-result">
                  <span className="clb-ai-result-label">✦ AI-written — review before sending</span>
                  {aiEmailResult}
                  <button className="clb-ai-result-copy" onClick={() => navigator.clipboard.writeText(aiEmailResult).catch(() => {})}>Copy Email</button>
                </div>
              )}
            </div>
          </div>
          <div className="clb-btn-row">
            <button className="clb-btn clb-btn-outline" onClick={() => goTo(1)}>← Back</button>
            <button className="clb-btn clb-btn-gold" onClick={() => goTo(3)}>Generate Campaign Brief →</button>
          </div>
        </div>

        {/* ── Step 4 ── */}
        <div className={`clb-panel${step === 3 ? " active" : ""}`}>
          <div className="clb-panel-head">
            <span className="ph-tag">Step 04 of 04 · Campaign Brief</span>
            <h2>Your Collab Link Building Campaign Brief</h2>
            <p>A complete summary of your setup. Use this to brief your team, hand to a VA, or share with an agency.</p>
          </div>
          <div className="clb-brief-wrap">
            <div className="clb-brief-hd">
              <h2>Collab Link Building Campaign Brief</h2>
              <p>Generated via SIA Wire S02E06 Method · {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="clb-brief-sec">
              <h4>01 — Business</h4>
              {([["Business", biz], ["Website", domain], ["Description", desc], ["Industry", effectiveIndustry], ["Audience", audType], ["Geography", geo], ["Strategy Model", strategyDetails[selStrat].label]] as [string, string][]).map(([k, v]) => (
                <div className="clb-brief-row" key={k}><span className="clb-brief-key">{k}</span><span className="clb-brief-val">{v || "—"}</span></div>
              ))}
            </div>
            <div className="clb-brief-sec">
              <h4>02 — Target Partner Categories</h4>
              <div style={{ padding: "12px 0" }}>
                {selNiches.length > 0 ? selNiches.map(n => <span className="clb-brief-tag" key={n}>{n}</span>) : <span style={{ color: "var(--mid)", fontSize: "13px" }}>No categories selected — go back to Step 2.</span>}
              </div>
            </div>
            <div className="clb-brief-sec">
              <h4>03 — Scored Partner</h4>
              {([["Company", scPartner], ["Category", scCat], ["Fit Score", Object.keys(scores).length > 0 ? `${scorePct}%` : "Not scored yet"], ["Recommendation", Object.keys(scores).length > 0 ? verdictText : "—"]] as [string, string][]).map(([k, v]) => (
                <div className="clb-brief-row" key={k}><span className="clb-brief-key">{k}</span><span className="clb-brief-val">{v || "—"}</span></div>
              ))}
            </div>
            <div className="clb-brief-sec">
              <h4>04 — The Strategy in Brief</h4>
              <div style={{ fontSize: "13px", lineHeight: "1.85", color: "#444", padding: "10px 0" }}>{strategyDetails[selStrat].detail}</div>
            </div>
            <div className="clb-brief-sec">
              <h4>05 — Next Actions</h4>
              <div className="clb-next-items">
                {strategyDetails[selStrat].actions.map((a, i) => <div key={i}><span className="ni-check">→</span> {a}</div>)}
              </div>
            </div>
            <div className="clb-ai-card">
              <div className="clb-ai-card-header">
                <span className="clb-ai-badge">✦ AI-Powered</span>
                <span className="clb-ai-card-title">AI Campaign Brief Generator</span>
              </div>
              <p className="clb-ai-card-desc">Takes everything you&apos;ve entered — your business, target partners, partner score, and strategy — and writes a complete, polished campaign brief ready to hand to a VA, team member, or agency.</p>
              <button className="clb-ai-btn" onClick={runAIBrief} disabled={aiBriefLoading || !biz}>
                {aiBriefLoading ? <><span className="clb-ai-spinner" /> Writing your campaign brief…</> : "✦ Generate My Campaign Brief"}
              </button>
              {!biz && <p className="clb-ai-note">← Fill in your business details in Step 1 first.</p>}
              {aiBriefResult && (
                <div className="clb-ai-result">
                  <span className="clb-ai-result-label">✦ AI-generated campaign strategy brief</span>
                  {aiBriefResult}
                  <button className="clb-ai-result-copy" onClick={() => navigator.clipboard.writeText(aiBriefResult).catch(() => {})}>Copy Brief</button>
                </div>
              )}
            </div>
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: "11px", color: "var(--mid)", letterSpacing: ".1em" }}>
              SIA WIRE · SYEDIRFANAJMAL.COM · PODCAST S02E06 · COLLAB LINK BUILDING METHOD
            </div>
          </div>
          <div className="clb-btn-row">
            <button className="clb-btn clb-btn-outline" onClick={() => goTo(2)}>← Back</button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="clb-btn clb-btn-outline" onClick={() => window.print()}>Print / PDF</button>
              <button className="clb-btn clb-btn-dark" onClick={copyBrief}>Copy Brief</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

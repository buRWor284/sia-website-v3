#!/usr/bin/env node
/**
 * PressIQ Scoring Calibration Harness
 * ────────────────────────────────────
 * Pipes 25 test pitches through the live /api/pitch/score endpoint and
 * prints a score spread report across all 7 dimensions.
 *
 * Usage:
 *   node scripts/pressiq-calibration.mjs
 *
 * Requires the dev server running:
 *   pnpm dev (default port 3000)
 *
 * Or point at production:
 *   BASE_URL=https://www.syedirfanajmal.com node scripts/pressiq-calibration.mjs
 *
 * Output: console table + a summary of each dimension's min/max/avg/stddev.
 * If any dimension's avg is <30 or >85 it flags it as likely needing a weight tune.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ENDPOINT = `${BASE_URL}/api/pitch/score`;

// ── 25 test pitches ──────────────────────────────────────────────────────────
// Spread across quality tiers: ~5 "will be ignored", ~8 "needs work",
// ~8 "competitive", ~4 "placement-grade". Each has a realistic HARO-style query.

const PITCHES = [
  // ── Tier 1: Will be ignored (score target <40) ───────────────────────────
  {
    label: "T1-A: Zero context, no story",
    query: "Looking for experts on B2B SaaS pricing",
    subject: "Re: SaaS pricing experts",
    pitch: `Hi,

I am a SaaS expert with 10 years of experience. I can help with pricing. Let me know if interested.

Best,
John
CEO, Acme Corp`,
  },
  {
    label: "T1-B: Generic, off-beat, no data",
    query: "Seeking sources on remote work productivity",
    subject: "Remote work expert available",
    pitch: `Remote work is very important today. Many companies are doing it. I think productivity is key. I have worked remotely for years and can share my thoughts on this important topic. Please feel free to reach out.`,
  },
  {
    label: "T1-C: Wall of text, no structure",
    query: "Need fintech founders for a piece on fundraising",
    subject: "Fintech founder for your article",
    pitch: `I am a fintech founder who raised 2 million dollars and I can tell you all about the experience of fundraising in the current market which is very difficult because investors are being cautious and you need to have a good pitch deck and strong metrics and also a great team and product market fit and ideally some revenue and a clear path to profitability and also you need to network a lot and go to events and meet people and follow up consistently and also have a good story about why you are building this and why now and why you are the right team to do it and also you should have a clear vision for the next 3 to 5 years.`,
  },
  {
    label: "T1-D: No credentials, no proof",
    query: "Experts on mental health in the workplace",
    subject: "Mental health expert",
    pitch: `I know a lot about mental health in the workplace. I have dealt with this personally and professionally. Happy to share my perspective. Thanks.`,
  },
  {
    label: "T1-E: Pitch mode mismatch, no query answer",
    query: "Looking for PR experts to discuss media pitching",
    subject: "PR expert available for your piece",
    pitch: `My company does amazing PR. We have helped many clients get coverage in Forbes and TechCrunch. Our proprietary methodology is unique in the market. Would love to be featured in your article.`,
  },

  // ── Tier 2: Needs work (score target 40–64) ──────────────────────────────
  {
    label: "T2-A: Good idea, poor structure",
    query: "How are companies using AI in HR?",
    subject: "AI in HR — practical examples",
    pitch: `Hi Sarah,

We use AI for resume screening at my company and it cut time-to-hire by 40%. The tool isn't perfect — it introduced some bias issues we had to work through. Happy to discuss in more detail.

Jane, HR Director`,
  },
  {
    label: "T2-B: Relevant but long + no data",
    query: "Seeking cybersecurity experts for article on SMB threats",
    subject: "Cybersecurity expert — SMB focus",
    pitch: `Hi Marcus,

Small businesses are incredibly vulnerable to cyber attacks and most don't realize it until it's too late. I've spent the last decade working with SMBs on their security posture and what I consistently see is that phishing is the number one threat vector.

The real problem isn't the attack itself — it's that most SMBs have no incident response plan. When they get hit, they panic, often making things worse. I've seen companies lose weeks of productivity to a ransomware attack that could have been contained in hours.

I'd be happy to provide more specific insights for your piece and can share some anonymized case studies from clients I've worked with.

David Chen
CEO, SecurePoint Consulting`,
  },
  {
    label: "T2-C: Some data, weak personalization",
    query: "Content marketing experts on B2B lead gen",
    subject: "Content marketing + B2B lead gen insights",
    pitch: `Studies show that companies publishing 16+ blog posts per month generate 4.5x more leads. In my experience running content for a B2B SaaS company, we saw similar results — though consistency and SEO targeting mattered more than volume.

The key insight: gating content too aggressively kills distribution. We switched to ungated thought leadership with soft CTAs and lead quality improved significantly.

Emily R.
VP Marketing, Acme SaaS`,
  },
  {
    label: "T2-D: Decent pitch, weak bio, no closing Q",
    query: "Founders on what they wish they knew about product-market fit",
    subject: "PMF lessons from my SaaS journey",
    pitch: `Hi,

The biggest PMF lesson I learned the hard way: retention beats acquisition every time. We were growing 20% MoM but our 30-day churn was 25%. We were pouring water into a leaky bucket.

The shift that saved us: switching from feature requests to job-to-be-done interviews. Instead of asking users what they wanted, we asked what they were trying to accomplish and what they'd do if our product disappeared.

Three months of that work gave us the clarity to cut 40% of our roadmap and focus on two core workflows. Churn dropped to 8% in 6 months.

Mike T.`,
  },
  {
    label: "T2-E: Good storytelling, poor mechanics",
    query: "Leaders on managing remote teams across time zones",
    subject: "5 years managing distributed teams — hard lessons",
    pitch: `Managing a 12-person team across 8 time zones since 2019 taught me that async communication isn't about tools — it's about a fundamentally different trust model. When you can't see your team, you have to trust output over activity. That transition nearly broke us in year one.

Our turning point was what we call the "context document" — every project, decision, and discussion logged in a format any team member could catch up on after sleeping. It's the closest thing to a distributed team's shared memory. Productivity went up 30% and we eliminated 60% of sync meetings. Would love to share more for your piece.`,
  },
  {
    label: "T2-F: On-topic, too formal, weak hook",
    query: "Experts on sustainable supply chain management",
    subject: "Sustainable supply chain expert — available for comment",
    pitch: `Dear Editor,

I am writing in response to your query regarding sustainable supply chain management. As a supply chain professional with 15 years of experience, I have extensive knowledge of this subject matter.

Recent research indicates that companies with sustainable supply chains outperform their peers by 15-20% on ESG metrics. I have helped three Fortune 500 companies implement sustainable sourcing frameworks.

I am available for a phone interview at your convenience. Please find my contact information below.

Sincerely,
Patricia Wong
Director, Supply Chain Sustainability`,
  },
  {
    label: "T2-G: Good data, authenticity risk (sounds templated)",
    query: "Experts on email marketing open rates",
    subject: "Email marketing open rates: what the data shows",
    pitch: `Hi [Name],

Email marketing continues to deliver exceptional ROI — $42 for every $1 spent (DMA). In my work with clients, I've found that subject line personalization lifts open rates by 26% (Campaign Monitor), while list segmentation can increase revenue by 760% (DMA).

The top three things we do that consistently improve performance: (1) clean list hygiene, (2) behavior-based segmentation, (3) A/B testing subject lines rigorously.

Happy to provide more insights for your piece. I've helped clients achieve open rates consistently above 35%.

Best,
Alex K.`,
  },
  {
    label: "T2-H: Good mechanics, no original insight",
    query: "How startup CTOs approach technical debt",
    subject: "CTO take on technical debt management",
    pitch: `Hi Jordan,

Technical debt is one of the most misunderstood concepts in startup leadership. Most CEOs see it as a problem; the best CTOs treat it as a strategic variable.

The key is distinguishing between intentional and unintentional debt. Intentional debt is a conscious trade-off for speed. Unintentional debt is sloppiness. The first is manageable; the second is fatal.

We use a simple rule: we track debt as a budget item on the roadmap. Every sprint, 20% goes to debt paydown. That single change took us from constant firefighting to sustainable velocity.

Dan M., CTO`,
  },

  // ── Tier 3: Competitive (score target 65–84) ─────────────────────────────
  {
    label: "T3-A: Strong story, verified data, good bio",
    query: "Founders on their biggest hiring mistakes",
    subject: "Hired fast, paid slow: our $400k talent mistake",
    pitch: `Hi Priya,

I read your piece on talent strategy last month — your point about cultural fit being measurable, not just felt, stayed with me.

Our most expensive hire was a sales leader who looked perfect on paper. 18 months, $400k in salary + equity, and a pipeline that never closed. The postmortem revealed we'd made the classic mistake: we hired for what we needed today, not for the stage we'd be at in 12 months.

The fix we implemented: stage-appropriate hiring rubrics. We now explicitly score candidates on "can this person 3x alongside the company?" not just "can they do the job today?" First hire using this rubric closed 3x the pipeline of their predecessor in the first quarter.

Happy to share the rubric we built if it's useful for your readers. Would you like me to send it over?

Lena C.
Founder, Hireflow (backed by a16z)`,
  },
  {
    label: "T3-B: Clear, concise, strong data, good closing",
    query: "What makes a B2B cold email actually work?",
    subject: "Cold email: 1 experiment, 847 replies",
    pitch: `Hi Sam,

Quick context: I ran a 4,200-email A/B test on cold outreach for our SaaS tool last year.

The finding that surprised us: specificity in the opening line mattered more than personalization. Emails opening with a specific observation about the prospect's business (e.g., "I noticed you recently expanded to APAC...") got a 19.4% reply rate. Generic "Hi [Name], I love what you're doing at [Company]" got 3.1%.

The mechanism: specificity signals research. Research signals respect for their time. Respect for time is the cold-email currency.

Total: 847 replies from one campaign. Happy to share the full methodology — could be useful data for your readers. What angle are you taking for the piece?

James T.
Growth Lead, Outbound.ai`,
  },
  {
    label: "T3-C: Good storytelling arc, strong personal brand signals",
    query: "PR experts on what journalists hate about pitches",
    subject: "I was a journalist. Here's what made me delete pitches instantly.",
    pitch: `Hi Rachel,

I spent four years at TechCrunch before crossing to PR, so I've been on both sides of the delete button.

The thing that made me delete instantly wasn't bad writing. It was pitches that made me do work. If I had to figure out the story, why it mattered, and how to pitch it to my editor — you'd already lost me. The best pitches I received could be forwarded to my editor with one sentence of context.

The framework I now use with clients: write the editor pitch, not the journalist pitch. If you can summarize your story in a single sentence that a section editor would immediately understand as publishable, you have a pitch. If not, you're still in the ideation phase.

Three clients got placements in publications they'd tried to break into for two years using this reframe alone.

Would it be useful to include a before/after example for your piece?

Sarah M.
Founder, Press Narrative
(bylines: Wired, The Verge, Fast Company)`,
  },
  {
    label: "T3-D: Solid all-round, slightly long",
    query: "How do companies retain top engineering talent?",
    subject: "0% engineering attrition in 3 years — what we did differently",
    pitch: `Hi Kenji,

Our engineering team hasn't had a single voluntary departure in 36 months. In a market where 18-month engineering tenure is considered good, I want to share what's working.

The two levers that moved the needle most:

1. Scope, not salary. We stopped competing on comp (we pay competitive, not top of market) and started offering uncommon scope. Our engineers own domains end-to-end — concept through production through iteration. No one is a ticket-taker.

2. We killed the performance review. Replaced it with quarterly "growth conversations" where the engineer drives: what did I build, what did I learn, what do I want next? Managers are coaches, not evaluators.

The data: 3-year retention, 40% reduction in time-to-ramp for new engineers (they see the culture before they join), and NPS of 71 from our engineering team.

Happy to go deeper on either point. Do you want specific quotes or would anonymized data be more useful for your piece?

Tom K.
CTO, Buildstack`,
  },
  {
    label: "T3-E: Original insight, tight writing, good source",
    query: "Experts on what's broken in venture capital today",
    subject: "VC's dirty secret: the signaling game nobody talks about",
    pitch: `Hi Claire,

The most underreported problem in venture: signal-chasing has replaced thesis investing.

I analyzed 200 Series A decks from 2021–2023 and found that 67% cited the same 12 metrics as growth proof points. VCs have converged on such similar checklists that they're optimizing for the same companies — and then surprised when portfolios correlate.

The founder who suffers: anyone building something genuinely new. If you can't show a J-curve in month 6, you're invisible to most early-stage funds, even if your defensibility is extraordinary.

I've written about this in First Round Review and talked about it at SaaStr. Happy to provide the dataset or get on a quick call if you're running the piece this week.

Maya S.
General Partner, Foundry Capital`,
  },
  {
    label: "T3-F: Excellent mechanics, weaker storytelling arc",
    query: "Customer success leaders on reducing churn",
    subject: "How we cut enterprise churn from 22% to 6% in 18 months",
    pitch: `Hi Tom,

We reduced enterprise churn from 22% to 6% over 18 months. Here's what actually moved the needle.

The root cause wasn't product — it was onboarding. 73% of our churned accounts had never completed our core workflow. They churned because they never got value, not because value wasn't there.

The fix: we rebuilt onboarding around the "first value moment" — the specific action that correlates with 12-month retention. For us, it's importing a dataset and generating a report in the first session. Everything else in onboarding was trimmed.

Secondary lever: we implemented a 30-day health score that predicted churn 60 days out with 78% accuracy. CSMs now intervene before customers disengage, not after.

Happy to share the specific metrics we tracked or the health-score framework. What would be most useful for your readers?

Priya L.
VP Customer Success, DataCore`,
  },
  {
    label: "T3-G: Strong credibility + data, somewhat generic structure",
    query: "Experts on the state of B2B content marketing",
    subject: "B2B content ROI: what 3 years of data actually shows",
    pitch: `Hi,

I've run content programs for four B2B SaaS companies over the past decade, and I track ROI obsessively.

The consistent finding: organic traffic compounds, paid doesn't. The companies that invest in content for 24+ months see a 3:1 advantage over paid-only programs within 36 months, even accounting for content production costs.

The underrated channel: case studies tied to specific use cases, not vague success stories. When we published a case study targeting "project management for architecture firms," it drove 38% of our pipeline from that vertical for two years.

I publish monthly breakdowns on this on LinkedIn (47k followers) and spoke at Content Marketing World in 2024.

Happy to provide more data points for your piece. What angle are you taking?

Andrea M.
Head of Content, Series B SaaS`,
  },
  {
    label: "T3-H: Good pitch, slightly over-long and over-broad",
    query: "What's the future of remote work?",
    subject: "Remote work: the 5-year thesis from someone who's lived it",
    pitch: `Hi,

I've run a fully distributed company since 2019 — before remote work was a trend, through the pandemic forced adoption, and now into the "return to office" backlash. I've watched the narrative cycle from "impossible" to "mandatory" to "everyone's figuring it out."

The thesis I've arrived at: remote work doesn't fail because of productivity. It fails because of culture infrastructure. Most companies adopted async tools without building async culture. The tools don't change the fundamental issue: most managers don't know how to manage what they can't see.

What I think happens over the next 5 years: a split. Companies that invest in async-first culture will build significantly better talent networks (global hiring, no commute premium). Companies that don't will drift back to office — not because it's better, but because it's the only management model their leaders know.

Happy to share specific culture practices we've built or discuss the talent market dynamics in more depth.

Kevin R.
CEO, Remote-first consulting firm (150+ clients)`,
  },

  // ── Tier 4: Placement-grade (score target 85+) ───────────────────────────
  {
    label: "T4-A: Perfect structure, exclusive data, strong hook",
    query: "Founders who've been through a startup pivot — what worked?",
    subject: "We pivoted with $180k left. Here's the 30-day playbook.",
    pitch: `Hi Melissa,

I read your series on founder resilience — the piece on the "infinite trough of sorrow" was the most honest thing I've read about early-stage in years.

We pivoted TalentOS 28 months ago with $180k in the bank and a team of seven. The conventional advice — talk to customers, find the pain, rebuild — is right but incomplete. Nobody tells you how to do it in 30 days with a scared team and a VC group chat going silent.

Here's what our 30-day pivot sprint looked like:
— Week 1: problem validation (12 customer calls, one question: "what's the most painful thing you do weekly that you'd pay to not do?")
— Week 2: hypothesis → prototype (a Notion template and a Loom, not code)
— Week 3: 3 paid pilots at $500/mo to test willingness-to-pay before a line was written
— Week 4: all-team decision meeting with data, not intuition

Result: 18 months later, $3.2M ARR, same team. Three of those first pilot customers are still with us.

I have the actual Notion doc and Loom scripts we used. Would it be useful to share them with your readers, or would you prefer to keep it to the framework?

Alex P.
CEO, TalentOS (featured in First Round Review, YC Startup School)`,
  },
  {
    label: "T4-B: Journalist personalization, specific data, editorial forward",
    query: "Experts on AI adoption challenges in enterprise",
    subject: "Enterprise AI: the gap between the pilot and production (new data)",
    pitch: `Hi Jonathan,

Your analysis last week on AI adoption ROI was the clearest framework I've seen on this topic — the point about measurement maturity being the constraint, not compute, reframed how I think about enterprise readiness.

I've been advising Fortune 500 AI implementation programs for three years. The consistent finding, across 14 companies: the bottleneck is never the model. It's the data governance layer.

New data (from a survey we ran last quarter, n=340 enterprise IT leaders): 73% have a proof of concept in production. Only 19% have moved a second AI use case beyond pilot stage. The gap: they don't have a reusable data pipeline. Each pilot rebuilds from scratch.

The companies succeeding are treating AI infrastructure like payments infrastructure — a platform play, not a project play. I've mapped five specific interventions that separate "stuck at POC" from "scaling organization." I haven't published this analysis yet — could share it exclusively for this piece if the timing works.

Best,
Nikhil R.
Partner, AI Strategy, Deloitte Digital
(published: MIT Sloan Management Review, Harvard Business Review)`,
  },
  {
    label: "T4-C: Perfect example pitch — personal, specific, original data, strong close",
    query: "PR and communications experts on measurement of earned media",
    subject: "We stopped measuring PR by coverage volume. Here's what changed.",
    pitch: `Hi Abby,

I noticed you've been covering the ROI question in comms for a while — the newsletter piece on SOV vs pipeline attribution was spot on.

We made a controversial call 18 months ago: we stopped counting press clips. Our comms team had been judged by volume — 30 pieces a month, 60% tier-1 — and it was producing exactly the wrong behavior. We were pitching anything that would land, not stories that served our brand.

We replaced the KPI with a single metric: "media-attributed pipeline." Every piece of coverage is tagged, we track downstream leads, and coverage that doesn't produce pipeline within 90 days gets post-mortemed.

The results surprised us: we now produce fewer stories (18/month), but our media-attributed pipeline grew 140% YoY. And our team is more creative — they pitch ideas they believe in, not ideas they think will land.

I built the tracking system in HubSpot and am happy to share the template. I've also written this up in a longer piece for PRSA Journal (coming out next month) — if you wanted a preview to inform your story, I could share a draft.

Would love to know what angle you're taking on this.

Jordan K.
VP Communications, Series C SaaS (raised $85M, Sequoia-backed)`,
  },
  {
    label: "T4-D: Highest difficulty — hybrid proactive/reactive, exclusive research",
    query: "Seeking economists on housing affordability solutions",
    subject: "Housing affordability: why the policy debate is missing the 40% (new research)",
    pitch: `Hi Christine,

Your investigation into zoning reform was one of the most rigorous pieces I've read on housing policy — specifically your finding that ADU legalization alone doesn't move the needle without financing reform.

I'm an applied economist and just completed a 3-year study on housing affordability interventions across 22 cities (published next month in the Journal of Urban Economics, embargo lifts Nov 15). One finding that hasn't been covered yet: the 40% of renters in the $50k–$80k income band — too rich for subsidized housing, too poor to buy — are absent from almost every policy model.

We built a simulation showing that even aggressive zoning reform produces zero net benefit for this cohort unless paired with community land trust expansion. The data is counterintuitive and directly challenges the dominant policy narrative.

I can share an embargoed copy before publication and make myself available for a full interview. I also have geographic maps showing which cities have the widest policy blind spot for this cohort — could be useful for dataviz.

Are you planning to continue the housing series? This data might fit well as a follow-up to your zoning piece.

Dr. Aisha Patel
Associate Professor of Urban Economics, Columbia University
(cited in NYT, WSJ; testified to Senate Housing Committee, 2023)`,
  },
];

// ── Scoring ──────────────────────────────────────────────────────────────────

async function scorePitch(pitch) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pitch: pitch.pitch,
      query: pitch.query,
      subject: pitch.subject,
      platform: "haro",
      brandSignals: { website: true, bylines: true, youtube: false, speaking: false, caseStudies: false, linkedin: true },
      store: false,
      pitchMode: "query",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

function stddev(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
}

function stat(arr) {
  if (!arr.length) return { min: 0, max: 0, avg: 0, stddev: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    stddev: Math.round(stddev(arr)),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nPressIQ Calibration Harness — ${PITCHES.length} pitches → ${ENDPOINT}\n`);
  console.log("Warming up… (this will take a few minutes due to AI calls)\n");

  const results = [];
  const dims = ["relevance", "objective", "checklist", "storytelling", "neuromarketing", "personalBrand", "newsroomReady"];

  for (let i = 0; i < PITCHES.length; i++) {
    const p = PITCHES[i];
    process.stdout.write(`[${i + 1}/${PITCHES.length}] ${p.label}… `);
    try {
      const data = await scorePitch(p);
      const row = {
        label: p.label,
        composite: data.composite,
        tier: data.tier?.badge ?? "?",
        relevance: data.areas?.relevance?.score ?? null,
        objective: data.areas?.objective?.score ?? null,
        checklist: data.areas?.checklist?.score ?? null,
        storytelling: data.areas?.emos?.storytelling?.score ?? null,
        neuromarketing: data.areas?.emos?.neuromarketing?.score ?? null,
        personalBrand: data.areas?.emos?.personalBrand?.score ?? null,
        newsroomReady: data.areas?.newsroomReady?.score ?? null,
      };
      results.push(row);
      console.log(`→ ${data.composite} (${row.tier})`);
    } catch (e) {
      console.error(`FAILED — ${e.message}`);
      results.push({ label: p.label, composite: null, tier: "ERR", error: e.message });
    }
    // Brief pause between calls to avoid overwhelming the local server
    await new Promise(r => setTimeout(r, 800));
  }

  // ── Print results table ──────────────────────────────────────────────────
  console.log("\n\n══════════════════════════════════════════════════════════════════════");
  console.log(" RESULTS");
  console.log("══════════════════════════════════════════════════════════════════════");

  const WIDTH = 38;
  const header = `${"Pitch".padEnd(WIDTH)} ${"Score".padStart(5)} ${"Tier".padEnd(8)} ${dims.map(d => d.slice(0, 5).padStart(6)).join("")}`;
  console.log(header);
  console.log("─".repeat(header.length));

  for (const r of results) {
    const dimCols = dims.map(d => (r[d] != null ? String(Math.round(r[d])).padStart(6) : "    —")).join("");
    console.log(`${r.label.padEnd(WIDTH)} ${String(r.composite ?? "ERR").padStart(5)} ${(r.tier ?? "?").padEnd(8)}${dimCols}`);
  }

  // ── Dimension spread analysis ────────────────────────────────────────────
  console.log("\n\n══════════════════════════════════════════════════════════════════════");
  console.log(" DIMENSION SPREAD (flag if avg <30 or >85 — may need weight tune)");
  console.log("══════════════════════════════════════════════════════════════════════");
  console.log(`${"Dimension".padEnd(16)} ${"Min".padStart(5)} ${"Avg".padStart(5)} ${"Max".padStart(5)} ${"Std".padStart(5)}  Flag`);
  console.log("─".repeat(60));

  for (const d of dims) {
    const vals = results.map(r => r[d]).filter(v => v != null);
    const s = stat(vals);
    const flag = s.avg < 30 ? "⚠ avg too low (scores cluster at bottom)"
      : s.avg > 85 ? "⚠ avg too high (scores cluster at top)"
      : s.stddev < 10 ? "⚠ low spread (scores aren't differentiating)"
      : "✓";
    console.log(`${d.padEnd(16)} ${String(s.min).padStart(5)} ${String(s.avg).padStart(5)} ${String(s.max).padStart(5)} ${String(s.stddev).padStart(5)}  ${flag}`);
  }

  // ── Composite spread ─────────────────────────────────────────────────────
  const composites = results.map(r => r.composite).filter(v => v != null);
  const cs = stat(composites);
  console.log("\n── Composite ─────────────────────────────────────────────────────────");
  console.log(`Min: ${cs.min}  Avg: ${cs.avg}  Max: ${cs.max}  StdDev: ${cs.stddev}`);
  const tierBuckets = { Cold: 0, Warming: 0, Live: 0, Filed: 0 };
  results.forEach(r => { if (tierBuckets[r.tier] !== undefined) tierBuckets[r.tier]++; });
  console.log(`Tiers: Cold=${tierBuckets.Cold} Warming=${tierBuckets.Warming} Live=${tierBuckets.Live} Filed=${tierBuckets.Filed}`);

  console.log("\n── Current weights (WEIGHTS_V2 in src/lib/pitch/config.ts) ───────────");
  const weights = { relevance: 0.24, objective: 0.12, checklist: 0.24, storytelling: 0.11, neuromarketing: 0.11, personalBrand: 0.06, newsroomReady: 0.12 };
  for (const [k, v] of Object.entries(weights)) {
    console.log(`  ${k.padEnd(16)} ${(v * 100).toFixed(0)}%`);
  }

  console.log("\n── Next steps ─────────────────────────────────────────────────────────");
  console.log("  1. If any dimension avg is <30 or >85, lower/raise its weight in WEIGHTS_V2");
  console.log("  2. If composite stddev < 15, scores aren't spreading — revisit prompt or bands");
  console.log("  3. Tier distribution target: ~20% Cold, ~30% Warming, ~35% Live, ~15% Filed");
  console.log("     (matches the 25-pitch quality distribution in this harness)");
  console.log("  4. After any weight change, re-run this script to verify improvement");
  console.log("");
}

main().catch(e => { console.error(e); process.exit(1); });

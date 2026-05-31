import type { Metadata } from "next";
import { SectionMast } from "@/components/bureau/primitives";
import AuthorityCalculator from "@/components/bureau/AuthorityCalculator";
import {
  T1Grid,
  AccordionGroup,
  EmosPageWrapper,
  ReferralCopyButton,
} from "@/components/bureau/EmosInteractive";
import {
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  MONO,
  YEL,
} from "@/lib/tokens";

export const metadata: Metadata = {
  title: "EMOS · Build the Media Presence Investors Check Before Your First Meeting",
  description:
    "EMOS is a Guided Implementation System for founders 3 to 12 months from a Series A raise. One-time investment. Capability you keep forever.",
};

/* =========================================================================
   EMOS LANDING PAGE v3
   ========================================================================= */

export default function EmosPage() {
  return (
    <>
      {/* ── Announcement bar ──────────────────────────────────────────── */}
      <div className="emos-announce">
        Cohort 1 begins <strong>June 8, 2026</strong> &nbsp;·&nbsp; 5 founders
        &nbsp;·&nbsp; Application required
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="emos-nav">
        <div className="emos-nav-inner">
          <a href="#" className="emos-nav-logo">
            <span
              style={{
                background: YEL,
                color: INK,
                padding: "0 0.12em",
                fontWeight: "inherit",
              }}
            >
              EMOS
            </span>
            &nbsp; by Syed Irfan Ajmal
          </a>
          <ul className="emos-nav-items">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#tools">Tools</a></li>
            <li><a href="#curriculum">Curriculum</a></li>
            <li><a href="#proof">Proof</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#guarantee">Guarantee</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="#apply" className="emos-nav-cta">
            Submit Your Application →
          </a>
        </div>
      </nav>

      <EmosPageWrapper>
        <div style={{ paddingTop: 91 }}>
          {/* ── HERO ────────────────────────────────────────────────────── */}
          <section id="hero" className="emos-hero bg-ink sx">
            <div className="max">
              <div className="emos-anti-pills">
                <span className="emos-anti-pill">Not a course</span>
                <span className="emos-anti-pill">No agency retainers</span>
                <span className="emos-anti-pill">No ad spend</span>
                <span className="emos-anti-pill">No platform dependency</span>
              </div>
              <h1 className="emos-hero-headline">
                Build the Media Presence Investors Check Before Your First
                Meeting.
              </h1>
              <p className="emos-hero-sub">
                <strong>EMOS</strong> is a Guided Implementation System for
                founders <strong>3 to 12 months from a Series A</strong>.
              </p>
              <div className="emos-hero-cta-row">
                <a href="#apply" className="emos-cta-yellow">
                  Submit Your Application →
                </a>
                <span className="emos-hero-cta-meta">
                  5 minutes. Decision within 48 hours.
                </span>
              </div>
              <div className="emos-guarantee-block">
                <span className="emos-guarantee-icon">🛡</span>
                <div className="emos-guarantee-content">
                  <span className="emos-guarantee-label">
                    Placements-or-refund guarantee
                  </span>
                  <span className="emos-guarantee-body">
                    Every dollar back if we miss what we promised.
                  </span>
                </div>
                <a href="#guarantee" className="emos-guarantee-see-terms">
                  See terms ↓
                </a>
              </div>
            </div>
          </section>

          {/* ── LOGO BAR ───────────────────────────────────────────────── */}
          <section
            className="emos-marquee-section"
            style={{
              borderTop: `1px solid ${INK15}`,
              borderBottom: `1px solid ${INK15}`,
            }}
          >
            <p className="emos-marquee-label">Where we&#39;ve placed clients</p>
            <div className="emos-marquee-track">
              {["Forbes","Harvard Business Review","Yahoo","Business Insider","MSN","AOL","Reader's Digest","Apartment Therapy","Healthline","Forbes","Harvard Business Review","Yahoo","Business Insider","MSN","AOL","Reader's Digest","Apartment Therapy","Healthline"].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
            <div className="emos-marquee-track emos-marquee-track-rev">
              {["MarketWatch","Bankrate","Mashable","Entrepreneur","The Mirror","The Next Web","GoBankingRates","Consumer Health Digest","MarketWatch","Bankrate","Mashable","Entrepreneur","The Mirror","The Next Web","GoBankingRates","Consumer Health Digest"].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
          </section>

          {/* ── PROOF BAR ──────────────────────────────────────────────── */}
          <section className="sy-sm bg-p2 sx">
            <div className="max">
              <p style={{ fontFamily: SERIF, fontSize: "clamp(16px,1.8vw,20px)", lineHeight: 1.55, marginBottom: 32, maxWidth: 680 }}>
                VCs Google you before the first meeting. What they find, or don&#39;t find, is already shaping the conversation.
              </p>
              <div className="emos-proof-grid">
                <div className="emos-proof-cell"><div className="emos-proof-num">218</div><div className="emos-proof-key">Citations earned</div><div className="emos-proof-note">MarketWatch · Forbes · Bankrate</div></div>
                <div className="emos-proof-cell"><div className="emos-proof-num">5+</div><div className="emos-proof-key">Tier 1 placements</div><div className="emos-proof-note">Top-tier publications only</div></div>
                <div className="emos-proof-cell"><div className="emos-proof-num">100%</div><div className="emos-proof-key">Earned · zero pay-to-play</div><div className="emos-proof-note">No sponsored content</div></div>
              </div>
              <p style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                Physicians Thrive · 13-month campaign · Live metrics from a production campaign built on the same system EMOS deploys.
              </p>
            </div>
          </section>

          {/* ── § A: BUILT BY ──────────────────────────────────────────── */}
          <section id="built-by" className="sy sx">
            <div className="max">
              <SectionMast n="A" label="Built By · Syed Irfan Ajmal" />
              <div className="emos-built-by-grid">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" className="emos-bio-photo" />
                  <div className="emos-bio-name">Syed Irfan Ajmal</div>
                  <div className="emos-bio-title">Columnist · Agency Operator · 12+ Years</div>
                </div>
                <div>
                  <h2 className="sec-h2" style={{ marginBottom: 24 }}>
                    Someone who&#39;s been on both sides of the journalist&#39;s inbox.
                  </h2>
                  <p className="emos-bio-quote">
                    EMOS is the consolidation of two perspectives most operators only ever see one of: the agency operator sending pitches, and the columnist reading them.
                  </p>
                  <p className="emos-bio-body">
                    Founded an earned media agency 12+ years ago. Previously co-founded an award-winning geo-spatial intelligence startup; held marketing leadership at two other ventures. All bootstrapped to profitability. Hosts <em>The SIA Business Podcast</em> (7+ years). Clients across the US, Canada, Europe, Australia, and the Gulf.
                  </p>
                  <div className="emos-stats-strip">
                    {[["12+","Years"],["100+","Publications"],["$1.2M","Client rev/mo"],["4","Continents"]].map(([v,k]) => (
                      <div className="emos-stat-cell" key={k}><div className="emos-stat-val">{v}</div><div className="emos-stat-key">{k}</div></div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: INK15, marginTop: 32 }}>
                    <div className="emos-t2-cell">
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Written &amp; Cited In</div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: INK70 }}>Forbes, HBR, HuffPost, World Bank, SEJ, Entrepreneur, The Next Web, Yahoo, MSN +more</p>
                    </div>
                    <div className="emos-t2-cell">
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>International Speaker</div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: INK70 }}>World Bank · Arabian Travel Market · MaGIC Malaysia · Astrolabs Dubai · DMSS.io Bali</p>
                    </div>
                    <div className="emos-t2-cell">
                      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Custom Workshops</div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: INK70 }}>Delivered for SEMrush (NYSE: SEMR) and uHubs: global platforms and enterprise brands.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── § B: REAL PROBLEM ──────────────────────────────────────── */}
          <section id="how-it-works" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast n="B" label="The Real Problem · Why Most Founders Fail at PR" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Four failure modes. Every industry.</h2>
              <p className="sec-sub" style={{ marginBottom: 36 }}>EMOS is built to remove all four. Click any card to read the full pattern.</p>
              <T1Grid className="emos-t1-grid-2">
                {[
                  { num:"01", title:"Generic Mass-Pitching", sub:"No founder POV · No angle · No response", name:"Press release to 200 journalists", sector:"Five-second editor filter · Never gets read", body:"Sending the same press release to 200 journalists. No angle, no expertise, no reason for anyone to respond. Modern editors filter this in under five seconds.", fix:"A pitching system built around your founder POV and journalist beat, not a blast list." },
                  { num:"02", title:"Agency Dependency Trap", sub:"$4K to $10K per month · Knowledge walks when it ends", name:"Pay retainer · Own nothing", sector:"Relationships, templates, data: gone on exit", body:"Pay a retainer, get monthly reports, never see what's being sent on your behalf. When the contract ends, every relationship, template, and tracking sheet walks out the door.", fix:"One-time investment. You own the system, contacts, and process. Permanently." },
                  { num:"03", title:"No System", sub:"Tried sporadically · Abandoned in 3 weeks", name:"20 queries · No response · Tab closed", sector:"Platform was right · Consistency wasn't", body:"Most founders try journalist outreach platforms casually. No system, no schedule, no review of what worked. After 20 unanswered queries, the tab gets closed.", fix:"A structured weekly cadence, tracking system, and a library of what's working, so you stay consistent." },
                  { num:"04", title:"Wrong Pitch", sub:"Treating journalists like sales prospects", name:"Pitch company, not the story", sector:"Get ignored or blocked · Conclude press doesn't work", body:"Treating reporters like prospects. Pitching the company instead of the story. Getting ignored or blocked, then concluding \"press doesn't work for us.\" Press worked. The pitch didn't.", fix:"Pitch anatomy built around the journalist's reader, not your product. Week 2 covers this in full." },
                ].map(c => (
                  <div className="emos-t1" key={c.num}>
                    <div className="emos-t1-top">
                      <div className="emos-t1-logo" style={{ minWidth:64, minHeight:48, fontFamily:SERIF, fontWeight:700, fontSize:36, color:INK15, letterSpacing:"-.03em" }}>{c.num}</div>
                      <div className="emos-t1-plus">+</div>
                    </div>
                    <div className="emos-t1-stat-row"><div className="emos-t1-stat" style={{ fontSize:28 }}>{c.title}</div><div className="emos-t1-stat-sub">{c.sub}</div></div>
                    <div className="emos-t1-meta"><div className="emos-t1-name">{c.name}</div><div className="emos-t1-sector">{c.sector}</div></div>
                    <div className="emos-t1-body"><p className="emos-t1-body-p">{c.body}</p><span className="emos-t1-rl">The Fix · EMOS</span><span className="emos-t1-rv">{c.fix}</span></div>
                  </div>
                ))}
              </T1Grid>
            </div>
          </section>

          {/* ── § C: INVESTOR LENS ─────────────────────────────────────── */}
          <section className="sy sx">
            <div className="max">
              <SectionMast n="C" label="The Investor Lens · How VCs Read Your Media Presence" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>How investors read your media presence.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Press coverage is not vanity. To a VC running a five-minute pre-meeting search, what they find is already a signal, whether you intended it to be or not.</p>
              <table className="emos-lens-table">
                <thead><tr><th>What they find</th><th>What they think</th></tr></thead>
                <tbody>
                  <tr><td>No press mentions</td><td>&ldquo;Unknown. Higher risk.&rdquo;</td></tr>
                  <tr><td>Generic or low-tier mentions</td><td>&ldquo;Chasing vanity. No real traction.&rdquo;</td></tr>
                  <tr><td>Cited in relevant publications</td><td>&ldquo;Credible. Knows their space.&rdquo;</td></tr>
                  <tr><td>Consistent Tier 1 coverage</td><td>&ldquo;This founder has pull. Worth a meeting.&rdquo;</td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 22, fontFamily: SERIF, fontSize: 16, color: INK70 }}>
                Want to see where you stand? Use the <a href="#calculator" className="emos-tool-link-ink">Authority Cost Calculator ↓</a> to calculate what renting vs. owning authority costs you.
              </p>
            </div>
          </section>

          {/* ── § D: NUMBERS ───────────────────────────────────────────── */}
          <section className="sy bg-ink sx">
            <div className="max">
              <SectionMast n="D" label="The Numbers · Independent Research" dark />
              <h2 className="sec-h2" style={{ marginBottom: 12, color: PAPER }}>Authority isn&#39;t a vibe. It&#39;s how the buying decision happens now.</h2>
              <p className="sec-sub" style={{ marginBottom: 48, color: "rgba(241,235,222,.55)" }}>Three numbers that explain why earned authority outperforms paid acquisition on the metrics that matter to a founder under fundraising pressure.</p>
              <div className="emos-numbers-grid">
                <div className="emos-num-card"><div className="emos-num-big">83%</div><div className="emos-num-label">B2B decisions before first contact</div><p className="emos-num-body">Prospects and investors research independently. If you&#39;re not credible where they look, you&#39;re not on the list.</p><div className="emos-num-source">Gartner / Edelman-LinkedIn B2B Report</div></div>
                <div className="emos-num-card"><div className="emos-num-big">3×</div><div className="emos-num-label">More likely to take a meeting</div><p className="emos-num-body">B2B buyers trust thought leadership over marketing materials. A journalist quoting you does what no landing page ever can.</p><div className="emos-num-source">Edelman-LinkedIn 2024/2025</div></div>
                <div className="emos-num-card"><div className="emos-num-big" style={{ fontSize: "clamp(28px,3.5vw,48px)" }}>$160K→$1.2M</div><div className="emos-num-label">Monthly revenue lift · client case study</div><p className="emos-num-body">National Tyres &amp; Autocare scaled from $160K to $1.2M monthly organic revenue. Earned coverage compounds; paid ads stop when you pause spend.</p><div className="emos-num-source">Client case study · NTA Campaign</div></div>
              </div>
            </div>
          </section>

          {/* ── § E: WHY NOW ───────────────────────────────────────────── */}
          <section className="sy sx">
            <div className="max" style={{ maxWidth: 760 }}>
              <SectionMast n="E" label="Why Now · The Fundraising Timeline Problem" />
              <h2 className="sec-h2" style={{ marginBottom: 24 }}>Six months from now is too late.</h2>
              <p style={{ fontFamily: SERIF, fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.65, color: INK70, marginBottom: 20 }}>
                Press takes 30 to 60 days to materialize. Tier 1 placements take 60 to 120. If you wait until fundraising starts, you&#39;re already late.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: INK70, marginBottom: 40 }}>
                Most founders realize this after their first investor call, when a VC says <strong>&ldquo;I couldn&#39;t find much about you online.&rdquo;</strong> The fix takes a quarter to build. The diligence window is shorter.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <a href="#apply" className="emos-cta-ink">Submit Your Application →</a>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>5 minutes. Decision within 48 hours.</span>
              </div>
            </div>
          </section>

          {/* ── § F: WHAT YOU'LL BUILD ─────────────────────────────────── */}
          <section id="how-it-works-detail" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast n="F" label="What You'll Build · Three Stages" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Three stages. One compounding system.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Stop outsourcing authority. Start owning it. Each stage produces a concrete output you keep forever.</p>
              <div className="emos-stages-grid">
                <div className="emos-stage-card">
                  <div className="emos-stage-num">01</div><div className="emos-stage-name">Get Quoted</div><div className="emos-stage-weeks">Weeks 1 to 4 · Foundation &amp; Accelerate</div>
                  <p className="emos-stage-outcome">Pitching muscle built. First verified Tier 2/3 placements earned. Investor-ready citation list starts taking shape.</p>
                  <div className="emos-stage-items">
                    {["Quotable zones mapped & media kit live","5 personalized pitch templates","15+ pitches submitted with tracking sheet","At least 1 verified placement"].map(t => (<div className="emos-stage-item" key={t}><div className="emos-stage-dot" />{t}</div>))}
                  </div>
                </div>
                <div className="emos-stage-card">
                  <div className="emos-stage-num">02</div><div className="emos-stage-name">Build Authority Assets</div><div className="emos-stage-weeks">Weeks 5 to 8 · Accelerate only</div>
                  <p className="emos-stage-outcome">Syed works alongside you on your first 5 pitches. One owned linkable asset goes live. Tier 1 outreach in motion.</p>
                  <div className="emos-stage-items">
                    {["Done-with-you first 5 placements","Original report or data study","Infographic and mapographic","Direct outreach to 15 to 20 Tier 1 journalists"].map(t => (<div className="emos-stage-item" key={t}><div className="emos-stage-dot" />{t}</div>))}
                  </div>
                </div>
                <div className="emos-stage-card">
                  <div className="emos-stage-num">03</div><div className="emos-stage-name">Scale &amp; Systemize</div><div className="emos-stage-weeks">Post-cohort · Accelerate-led</div>
                  <p className="emos-stage-outcome">The machine runs without you. Coverage compounds month over month, long after the cohort ends.</p>
                  <div className="emos-stage-items">
                    {["20+ named-journalist target list","VA-ready system & sourcing module","90-day scaling plan","5-return extraction from every placement"].map(t => (<div className="emos-stage-item" key={t}><div className="emos-stage-dot" />{t}</div>))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── § G: TOOLS ─────────────────────────────────────────────── */}
          <section id="tools" className="sy sx">
            <div className="max">
              <SectionMast n="G" label="Tools · Purpose-built for the System" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Three tools. Included free.<br /><em style={{ color: YEL }}>Founding cohort only.</em></h2>
              <p className="sec-sub" style={{ marginBottom: 28 }}>Purpose-built tools that replace the manual work. Cohort 1 founding members get permanent free access to all three. Future cohorts pay separately.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", background: YEL, border: `1px solid ${INK}`, marginBottom: 36 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🔑</span>
                <div>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>Founding member benefit · Cohort 1 only</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, marginTop: 3 }}>Free access to all three tools, indefinitely. Future cohorts pay separately. Closes when Cohort 1 fills.</div>
                </div>
              </div>
              <T1Grid className="emos-t1-grid-3">
                {[
                  { badge:"Beta", badgeDark:false, track:"Foundation + Accelerate", stat:"Journo Tracker", statSub:"Pitch tracking · Follow-ups · Placement log", name:"Journo Outreach Checklist Tracker", sector:"Tool 01 · Replaces scattered spreadsheets", body:"Track every pitch, follow-up, and response in one place. Submission count, follow-up dates, and placement status at a glance. Replaces scattered HARO exports and manual spreadsheets.", replaces:"Scattered HARO exports and manual follow-up tracking" },
                  { badge:"Beta", badgeDark:false, track:"Accelerate only", stat:"CollabIQ", statSub:"Journalist matching · Beat · Coverage fit", name:"Journalist Beat Matcher", sector:"Tool 02 · Replaces cold guesswork", body:"Identify the journalists and editors most likely to respond, based on beat, recent coverage, publication fit, and engagement history. Built from 12+ years of outreach data. Stop cold-pitching into the dark.", replaces:"Manual press page trawling and cold inbox roulette" },
                  { badge:"Coming Soon", badgeDark:true, track:"Accelerate only", stat:"QuerySniper", statSub:"Real-time query monitoring · Beat alerts", name:"Real-Time Query Monitor", sector:"Tool 03 · Accelerate founding members get day-one access", body:"Automated real-time monitoring for journalist queries matching your expertise across HARO, Qwoted, and direct request platforms. Get notified before the deadline, not after. Launching for Cohort 2.", replaces:"Manual platform monitoring and missed deadlines" },
                ].map(tool => (
                  <div className="emos-t1" key={tool.stat}>
                    <div className="emos-t1-top">
                      <div className="emos-t1-logo" style={{ flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                        <span style={{ padding: "2px 7px", background: tool.badgeDark ? INK : YEL, color: tool.badgeDark ? PAPER : INK, fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase" }}>{tool.badge}</span>
                        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, whiteSpace: "nowrap" }}>{tool.track}</span>
                      </div>
                      <div className="emos-t1-plus">+</div>
                    </div>
                    <div className="emos-t1-stat-row"><div className="emos-t1-stat" style={{ fontSize: 26, letterSpacing: "-.01em" }}>{tool.stat}</div><div className="emos-t1-stat-sub">{tool.statSub}</div></div>
                    <div className="emos-t1-meta"><div className="emos-t1-name">{tool.name}</div><div className="emos-t1-sector">{tool.sector}</div></div>
                    <div className="emos-t1-body"><p className="emos-t1-body-p">{tool.body}</p><span className="emos-t1-rl">Replaces</span><span className="emos-t1-rv">{tool.replaces}</span></div>
                  </div>
                ))}
              </T1Grid>
            </div>
          </section>

          {/* ── § H: 5-RETURN FRAMEWORK ────────────────────────────────── */}
          <section className="sy bg-ink sx">
            <div className="max">
              <SectionMast n="H" label="The 5-Return Framework · One Placement, Five Returns" dark />
              <h2 className="sec-h2" style={{ marginBottom: 12, color: PAPER }}>One placement. Five returns.</h2>
              <p className="sec-sub" style={{ marginBottom: 44, color: "rgba(241,235,222,.55)" }}>Most founders treat a press placement as a one-off win. EMOS extracts five compounding returns from every single one. Which is why one Forbes citation can keep paying for years.</p>
              <div className="emos-returns-grid">
                {[
                  ["01 · SEO Authority","Backlink equity","A high-DA backlink lifts your domain rating; target pages rank higher for the keywords your buyers use."],
                  ["02 · LLM Citation","AI visibility","ChatGPT, Perplexity, and Google AI Overviews cite credible publications. Your name surfaces in AI answers about your space."],
                  ["03 · Sales Collateral","\"As featured in\"","Lifts homepage trust, deck credibility, and email signature legitimacy in every buyer conversation."],
                  ["04 · Investor Proof","Series A credibility","Founders cited in Tier 1 publications skip the \"who is this?\" question before the meeting starts."],
                  ["05 · Social Signal","Compounding reach","Share-worthy content for LinkedIn and X. Earned coverage compounds organic reach and personal-brand momentum."],
                ].map(([n,title,body]) => (
                  <div className="emos-return-cell" key={n}><div className="emos-return-n">{n}</div><div className="emos-return-title">{title}</div><p className="emos-return-body">{body}</p></div>
                ))}
              </div>
            </div>
          </section>

          {/* ── § I: CURRICULUM ─────────────────────────────────────────── */}
          <section id="curriculum" className="sy sx">
            <div className="max">
              <SectionMast n="I" label="Curriculum · Two Tracks" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Choose the track that matches how fast you need to move.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Both tracks teach the same foundation. Accelerate adds 4 more weeks for founders who want Tier 1 publications and linkable assets.</p>
              <table className="emos-curr-table">
                <thead><tr><th style={{ width: "38%" }}></th><th>Foundation</th><th>Accelerate ★ Best Value</th></tr></thead>
                <tbody>
                  {[
                    ["Duration","4 weeks","8 weeks"],["Investment","$2,000 one-time","$3,500 one-time"],["Slack access","30 days","90 days"],["Weekly group calls","✓","✓"],["1-on-1 calls","·","✓"],["Done-with-you first 5 placements","·","✓"],["Linkable asset build","·","✓"],["EMOS Tools","Journo Tracker [Beta]","Full suite"],["Placements guaranteed","1 in 60 days","2 in 90 days"],
                  ].map(([label,f,a],i) => (
                    <tr key={label}><td>{label}</td><td>{i===8?<strong>{f}</strong>:f}</td><td>{i===8?<strong>{a}</strong>:a}</td></tr>
                  ))}
                </tbody>
              </table>
              <AccordionGroup>
                <div className="emos-acc-header" />
                <div className="emos-acc-track-title">Foundation Track · 4 Weeks</div>
                {[
                  { q:"Week 1 · Foundation & Platform Setup", a:"How the journalist outreach ecosystem actually works. Identifying your quotable zones. The Relevancy Spectrum framework. Media kit and bio templates ready to send.", d:"All platforms live. Media kit complete. 3 polished bio variations." },
                  { q:"Week 2 · Pitch Writing Mastery", a:"Anatomy of a winning pitch, written for the journalist's reader. Speed vs. quality. Subject line psychology. Live pitch teardowns on your real submissions.", d:"5 personalized pitch templates. First batch of 8 to 10 submitted." },
                  { q:"Week 3 · Volume, Tracking & Optimization", a:"A sustainable pitching routine. Tracking the metrics that matter. The 700+ site blacklist. Common rejection patterns and how to overcome them.", d:"15+ pitches submitted. Tracking system live. Optimization plan documented." },
                  { q:"Week 4 · Advanced Strategies, VA & Scale", a:"Building journalist relationships for repeat coverage. Breaking news monitoring. Extracting five returns from every placement. VA sourcing and training: typical cost $500 to $1,500 per month.", d:"At least 1 verified placement. 20+ named journalist target list. 90-day scaling plan." },
                ].map(item => (
                  <div className="emos-acc-item" key={item.q}><button className="emos-acc-q"><span className="emos-acc-q-text">{item.q}</span><span className="emos-acc-icon">+</span></button><div className="emos-acc-body"><div className="emos-acc-body-inner">{item.a}<div className="emos-acc-deliverable"><strong>Deliverable:</strong> {item.d}</div></div></div></div>
                ))}
                <div className="emos-acc-track-title" style={{ marginTop: 32 }}>Accelerate Track · Weeks 5 to 8 (adds to Foundation)</div>
                {[
                  { q:"Week 5 · Data Brief & Planning", a:"What makes a linkable asset genuinely newsworthy. Data audit. Report concept development. Introduction to CollabIQ [Beta] for identifying high-fit journalists.", d:"Report concept locked. Methodology documented. Data sources identified." },
                  { q:"Week 6 · Report Build", a:"First draft review. Infographic and mapographic concepts. Asset production coordination.", d:"First draft complete. Infographic + mapographic in production." },
                  { q:"Week 7 · Outreach Strategy", a:"Identifying 15 to 20 named journalists at target publications. Direct pitch training. Headline testing. Three outreach templates.", d:"15 to 20 journalists identified. 3 templates ready. Headline variants tested." },
                  { q:"Week 8 · Launch & Outreach", a:"Publishing on a dedicated landing page. Tier 1 exclusivity strategy. Integrating the report into your ongoing earned media process.", d:"Report live. Tier 1 and Tier 2 outreach sent. Report integrated into all future pitching." },
                ].map(item => (
                  <div className="emos-acc-item" key={item.q}><button className="emos-acc-q"><span className="emos-acc-q-text">{item.q}</span><span className="emos-acc-icon">+</span></button><div className="emos-acc-body"><div className="emos-acc-body-inner">{item.a}<div className="emos-acc-deliverable"><strong>Deliverable:</strong> {item.d}</div></div></div></div>
                ))}
              </AccordionGroup>
            </div>
          </section>

          {/* ── § J: PROOF / TESTIMONIALS ──────────────────────────────── */}
          <section id="proof" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast n="J" label="Proof · The Same System. Their Results." />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>The same system. Their results.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Five results from client campaigns across the US, UK, and Gulf. Click any card to read the full testimony.</p>
              <div style={{ overflow: "hidden", border: `1px solid ${INK15}`, padding: "14px 0", marginBottom: 44 }}>
                <p className="emos-marquee-label" style={{ marginBottom: 10 }}>Founders we&#39;ve worked with</p>
                <div className="emos-marquee-track" style={{ gap: 40 }}>
                  {["Ridester","Curednation","Centriq","Dunlop Tires","BeeBole","Quran Academy","Efani","Smith Thompson","Paralign","Ridester","Curednation","Centriq","Dunlop Tires","BeeBole","Quran Academy","Efani","Smith Thompson","Paralign"].map((n,i) => (<span key={i}>{n}</span>))}
                </div>
              </div>
              <T1Grid className="emos-t1-grid-3">
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/brett-helling.jpeg" alt="Brett Helling" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">1.5M</div><div className="emos-t1-stat-sub">Monthly unique visitors · Ridester.com</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Brett Helling</div><div className="emos-t1-sector">Media · Ridesharing · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Syed and the team&#39;s expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success, helping to grow Ridester from zero to 1.5 million monthly visitors.&rdquo;</p><span className="emos-t1-rl">Role · The Bureau</span><span className="emos-t1-rv">Earned media · SEO · Digital PR</span><a href="/clients/ridester" className="emos-t1-cy">See case study →</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar-init">IB</div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">+120%</div><div className="emos-t1-stat-sub">Organic traffic increase · Centriq</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Imani Lea Brown</div><div className="emos-t1-sector">SaaS · Home Management · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Our organic traffic increased by 120%. Our public database clicks grew by 515%. We saw a 6x increase in average daily signups. Syed is truly an expert in his field. Thoughtful, conscientious, and goes above and beyond.&rdquo;</p><span className="emos-t1-rl">Notable · Centriq</span><span className="emos-t1-rv">Subsequently raised $11M in funding</span><a href="#" className="emos-t1-co">Case on request</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar-init">TC</div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">DR 1→27</div><div className="emos-t1-stat-sub">Domain rating growth · Curednation</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Trent Carter</div><div className="emos-t1-sector">Healthcare · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Within 2 months of working with us we earned quality links from Healthline (DR 92), The Mirror (DR 90), and MSN (DR 92). Our Domain Rating grew from 1 to 27.&rdquo;</p><span className="emos-t1-rl">Role · The Bureau</span><span className="emos-t1-rv">Digital PR · Link building · Healthcare niche</span><a href="#" className="emos-t1-co">Case on request</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar-init">RE</div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">+140%</div><div className="emos-t1-stat-sub">Traffic in 3 months · Dinar Standard</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Reem El Shafaki</div><div className="emos-t1-sector">Finance · US/UAE 🇦🇪</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;The team partnered with our US and UAE teams on a Gulf government web portal. They earned high-authority backlinks from Reader&#39;s Digest and MSN. Traffic increased by 140% in 3 months against a 25%/9-month goal. Page views up 102%, impressions up 65%.&rdquo;</p><span className="emos-t1-rl">Context</span><span className="emos-t1-rv">Government web portal · Gulf region</span><a href="#" className="emos-t1-co">Case on request</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/azzam-sheikh.jpeg" alt="Azzam Sheikh" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">Pos. #4</div><div className="emos-t1-stat-sub">Google rank · 160K monthly searches</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Azzam Sheikh</div><div className="emos-t1-sector">E-Commerce · Autocare · United Kingdom 🇬🇧</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;So chuffed to see a keyword rank to position #4 in Google that gets over 160,000 searches a month. Most with commercial intent. Can&#39;t thank Syed and the team enough; they&#39;re now ranking hundreds of keywords for us. Exceptional professionalism.&rdquo;</p><span className="emos-t1-rl">Role · The Bureau</span><span className="emos-t1-rv">SEO · Digital PR · Earned media</span><a href="/clients/nta" className="emos-t1-cy">See case study →</a></div>
                </div>
              </T1Grid>
            </div>
          </section>

          {/* ── § K: FIT CHECK ─────────────────────────────────────────── */}
          <section className="sy sx">
            <div className="max">
              <SectionMast n="K" label="Fit Check · Who This Is Not For" />
              <h2 className="sec-h2" style={{ marginBottom: 40 }}>Who this is NOT for.</h2>
              <div className="emos-fit-grid">
                <div className="emos-fit-col emos-fit-col-bad">
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: INK55, marginBottom: 20 }}>✗ Not for you if you are:</div>
                  {["A pre-revenue founder with no story to pitch yet. Come back when you have customer outcomes to talk about.","A founder who isn't ready to be quoted publicly with their name and title attached. That's the whole point of EMOS.","A passive learner who wants to watch videos and hope for results. This is implementation work, not a Netflix queue.","Anyone looking for someone to do it entirely for them. I have a done-for-you service for that, but it isn't this."].map(t => (
                    <div className="emos-fit-item" key={t}><span className="emos-fit-dash">✕</span>{t}</div>
                  ))}
                </div>
                <div className="emos-fit-col emos-fit-col-good">
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: YEL, marginBottom: 20 }}>✓ This IS for you</div>
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(241,235,222,.72)", marginBottom: 32 }}>
                    This is for founders <strong style={{ color: PAPER }}>3 to 12 months from a raise</strong> who are willing to do the work, or have a team member or VA willing to do it under your direction.
                  </p>
                  <a href="#apply" className="emos-cta-yellow" style={{ display: "flex", justifyContent: "center" }}>Submit Your Application →</a>
                </div>
              </div>
            </div>
          </section>

          {/* ── § L: THE MATH / CALCULATOR ──────────────────────────────── */}
          <section id="calculator" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast n="L" label="The Math · Authority Cost Calculator" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Find out how much EMOS will save you<br />in financial costs alone.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Let alone the benefits of doing things in-house: investor credibility, AI citations, sales proof, and compounding reach. Adjust to your real numbers.</p>
              <AuthorityCalculator />
            </div>
          </section>

          {/* ── § M: INVESTMENT ─────────────────────────────────────────── */}
          <section id="pricing" className="sy bg-ink sx">
            <div className="max">
              <SectionMast n="M" label="Investment · Two Tracks, One-Time Fee" dark />
              <div className="emos-pricing-outer">
                <div className="emos-pricing-math">
                  <h2 className="sec-h2" style={{ marginBottom: 24, color: PAPER }}>Two tracks. One-time investment. Capability you keep forever.</h2>
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(241,235,222,.60)", marginBottom: 16 }}>A mid-tier PR agency: <strong style={{ color: PAPER }}>$24K to $60K per year</strong>, every year, knowledge walks out when the contract ends.</p>
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(241,235,222,.60)" }}>EMOS: <strong style={{ color: YEL }}>$2,000 to $3,500 one-time</strong>. The capability stays. Forever.</p>
                  <p style={{ marginTop: 24, fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: PAPER, lineHeight: 1.4, borderLeft: `3px solid ${YEL}`, paddingLeft: 16 }}>One placement on a DA 80+ site is worth more than the program.</p>
                  <p style={{ marginTop: 20, fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.60)" }}>Use the <a href="#calculator" className="emos-tool-link">Authority Cost Calculator ↑</a> to run the numbers for your business.</p>
                </div>
                <div className="emos-price-cards">
                  <div className="emos-price-card">
                    <div className="emos-price-name">Foundation</div><div className="emos-price-amount">$2K</div><div className="emos-price-period">one-time · 4 weeks</div>
                    <div className="emos-price-features">
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Group cohort format</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>30-day Slack access</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>1 placement guaranteed in 60 days</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Journo Tracker [Beta]</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check" style={{ color: "rgba(241,235,222,.2)" }}>·</span><span className="emos-price-feat-no">Done-with-you placements</span></div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check" style={{ color: "rgba(241,235,222,.2)" }}>·</span><span className="emos-price-feat-no">Linkable asset build</span></div>
                    </div>
                    <a href="#apply" className="emos-cta-ghost" style={{ marginTop: 24, justifyContent: "center", width: "100%" }}>Apply →</a>
                  </div>
                  <div className="emos-price-card emos-price-card-best">
                    <div className="emos-price-card-best-badge">★ Best Value</div>
                    <div className="emos-price-name emos-price-name-best">Accelerate</div><div className="emos-price-amount">$3.5K</div><div className="emos-price-period">one-time · 8 weeks</div>
                    <div className="emos-price-features">
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span><strong style={{ color: YEL }}>Done-with-you first 5 placements</strong></div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Group + 1-on-1 strategy calls</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>90-day Slack access</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>2 placements guaranteed in 90 days</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Priority pitch reviews (4 hrs)</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>VA sourcing module</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Linkable asset build (Weeks 5 to 8)</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Full EMOS Tools suite</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Lifetime access to future cohorts</div>
                    </div>
                    <a href="#apply" className="emos-cta-yellow" style={{ marginTop: 24, justifyContent: "center", width: "100%" }}>Apply →</a>
                  </div>
                </div>
              </div>
              <div id="apply" className="emos-apply-block">
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(241,235,222,.60)", marginBottom: 16 }}>Apply for Cohort 1</div>
                <div className="emos-apply-grid">
                  <div>
                    <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3vw,36px)", color: PAPER, lineHeight: 1.1, marginBottom: 16 }}>5 seats. June 8, 2026.<br />Here&#39;s how to claim one.</h3>
                    <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: "rgba(241,235,222,.60)" }}>One short application. I review every submission personally within 48 hours. If it&#39;s a fit, I&#39;ll send a Calendly link to talk through the details.</p>
                    <p style={{ marginTop: 14, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.40)" }}>Both tracks include lifetime access to every future EMOS cohort</p>
                  </div>
                  <div>
                    {[["1","Submit your application","5 minutes"],["2","Personal review by Syed","within 48 hours"],["3","15-minute call to confirm fit","qualified applicants only"],["4","Decision and onboarding",""]].map(([n,text,sub]) => (
                      <div className="emos-apply-step" key={n}><div className="emos-apply-n">{n}</div><div className="emos-apply-text"><strong>{text}</strong>{sub && <>&nbsp;&nbsp;·&nbsp;&nbsp;{sub}</>}</div></div>
                    ))}
                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                      <a href="/emos/apply/" className="emos-cta-yellow">Submit Your Application →</a>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.45)" }}>5 minutes. Decision within 48 hours.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── § N: GUARANTEE ──────────────────────────────────────────── */}
          <section id="guarantee" className="sy sx">
            <div className="max">
              <SectionMast n="N" label="Risk Reversal · The Guarantee" />
              <h2 className="sec-h2" style={{ marginBottom: 24 }}>A guarantee no PR agency will ever match.</h2>
              <div className="emos-guarantee-banner"><p className="emos-guarantee-banner-text"><strong>1 verified media placement in 60 days</strong>, or every dollar back. No negotiation.</p></div>
              <div className="emos-commit-grid">
                <div className="emos-commit-col">
                  <div className="emos-commit-title emos-commit-title-left">You commit:</div>
                  <div className="emos-commit-item"><span className="emos-commit-x">✓</span><span><strong>Foundation:</strong> Complete all 4 sessions and submit at least 15 pitches</span></div>
                  <div className="emos-commit-item"><span className="emos-commit-x">✓</span><span><strong>Accelerate:</strong> Complete all 8 weeks and submit at least 30 pitches</span></div>
                  <div className="emos-commit-item"><span className="emos-commit-x">✓</span><span>Share your tracking spreadsheet as proof of effort</span></div>
                </div>
                <div className="emos-commit-col emos-commit-col-right">
                  <div className="emos-commit-title emos-commit-title-right">I commit:</div>
                  <div className="emos-commit-item emos-commit-item-inv"><span className="emos-commit-check">✓</span><span><strong style={{ color: PAPER }}>Foundation:</strong> 1 verified placement within 60 days of cohort end</span></div>
                  <div className="emos-commit-item emos-commit-item-inv"><span className="emos-commit-check">✓</span><span><strong style={{ color: PAPER }}>Accelerate:</strong> 2 verified placements within 90 days</span></div>
                  <div className="emos-commit-item emos-commit-item-inv"><span className="emos-commit-check">✓</span><span>If I miss either: <strong style={{ color: PAPER }}>full refund of the investment</strong></span></div>
                  <p className="emos-commit-note">In 12+ years of running earned media campaigns, this system has never failed to produce placements for anyone who worked it consistently.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── § O: FAQ ───────────────────────────────────────────────── */}
          <section id="faq" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast n="O" label="FAQ · Common Questions" />
              <h2 className="sec-h2" style={{ marginBottom: 40 }}>Common questions.</h2>
              <AccordionGroup className="emos-faq-wrap">
                {[
                  { q:"How much time does this require each week?", a:"Plan for 3 to 5 hours per week: 90 minutes for the live session plus 2 to 3 hours for assignments. The assignments aren't busywork: they're real pitches going to real journalists. Most founders pair the system with a part-time VA ($300 to $1,500 per month)." },
                  { q:"I don't have a team member who can run this. What do I do?", a:"Accelerate includes a VA sourcing and training module. I help you identify what support you need, source the right person, and train them on the system. The real qualification isn't whether you have someone today; it's whether you're willing to hire one after the program ends." },
                  { q:"I tried PR before and it didn't work. Why is this different?", a:"Most failed PR efforts share four traits: generic mass pitching, no founder POV, no consistent system, and total dependency on an agency that takes the knowledge with them. EMOS is built specifically to remove all four." },
                  { q:"Is this really better than just hiring a PR agency?", a:"Different thing. An agency runs pitches on your behalf for $24K to $60K per year indefinitely, and the knowledge leaves when the relationship does. EMOS is a one-time investment that builds the capability inside your company. Some clients do both. Most don't need to." },
                  { q:"Will this work for my industry?", a:"Yes, provided you have customers, results, or a defensible point of view. The system has produced placements for SaaS, fintech, healthcare, marketplaces, e-commerce, AI, mobility, education, and consumer products." },
                  { q:"When can I expect my first placement?", a:"Most participants submit their first pitches in Week 2 and land their first verified placement within 4 to 6 weeks of cohort end. Tier 1 placements generally take 60 to 120 days from a cold start." },
                  { q:"Will this still work as AI changes search?", a:"Earned media is the most resilient channel against AI-driven shifts. LLMs cite credible publications. When your name appears in Forbes, HBR, or Business Insider, AI systems cite you as a source. EMOS doesn't just survive the AI shift; it benefits from it." },
                  { q:"How exactly does the placement guarantee work?", a:"Foundation: 15 pitches, 1 placement in 60 days. Accelerate: 30 pitches, 2 placements in 90 days. Proof of effort is your tracking spreadsheet. Miss the target and I refund the full investment. In 12+ years, this system has never failed to produce placements for anyone who worked it consistently." },
                  { q:"What are the EMOS tools? And do I really get them free?", a:"Yes. Cohort 1 founding members get permanent free access to all three tools, indefinitely. Future cohorts pay separately.\n\nJourno Outreach Checklist Tracker [Beta]: tracks every pitch and follow-up. Foundation + Accelerate.\nCollabIQ [Beta]: identifies high-fit journalists by beat and coverage history. Accelerate only.\nQuerySniper [Coming Soon]: real-time journalist query monitoring. Accelerate founding members get day-one access on release." },
                ].map(item => (
                  <div className="emos-acc-item" key={item.q}>
                    <button className="emos-acc-q"><span className="emos-acc-q-text">{item.q}</span><span className="emos-acc-icon">+</span></button>
                    <div className="emos-acc-body"><div className="emos-acc-body-inner">{item.a.split("\n\n").map((p,i) => (<p key={i} style={i > 0 ? { marginTop: 12 } : undefined}>{p}</p>))}</div></div>
                  </div>
                ))}
              </AccordionGroup>
            </div>
          </section>

          {/* ── FINAL CTA ──────────────────────────────────────────────── */}
          <section className="sy bg-ink sx" style={{ textAlign: "center" }}>
            <div className="max" style={{ maxWidth: 800, marginInline: "auto" }}>
              <h2 className="emos-final-cta-headline">Stop renting authority.<br /><em>Start owning it.</em></h2>
              <p style={{ fontFamily: SERIF, fontSize: "clamp(16px,1.8vw,19px)", lineHeight: 1.7, color: "rgba(241,235,222,.60)", marginBottom: 40, maxWidth: 620, marginInline: "auto" }}>
                This time next year, your team owns the system. Your name lives in the publications your buyers and investors already trust. The coverage compounds long after the program ends.
              </p>
              <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(241,235,222,.40)", marginBottom: 28 }}>
                Cohort 1 opens June 8 &nbsp;·&nbsp; Five founders &nbsp;·&nbsp; Application required
              </p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <a href="/emos/apply/" className="emos-cta-yellow" style={{ fontSize: 13, padding: "18px 36px" }}>Submit Your Application →</a>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(241,235,222,.40)" }}>5 minutes. Decision within 48 hours.</span>
              </div>
            </div>
          </section>

          {/* ── REFERRAL BAR ───────────────────────────────────────────── */}
          <div className="emos-referral-bar">
            <span style={{ fontFamily: SERIF, fontSize: 16, color: INK70 }}>Know a founder who should see this? </span>
            <ReferralCopyButton />
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <footer className="emos-footer sx">
            <div className="max emos-footer-inner">
              <div className="emos-footer-copy">© 2026 Syed Irfan Ajmal &nbsp;·&nbsp; SIA Enterprises Inc</div>
              <div className="emos-footer-links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="mailto:sia@syedirfanajmal.com">sia@syedirfanajmal.com</a></div>
            </div>
          </footer>
        </div>
      </EmosPageWrapper>
    </>
  );
}

import type { Metadata } from "next";
import { Fragment } from "react";
import { SectionMast } from "@/components/bureau/primitives";
import AuthorityCalculator from "@/components/bureau/AuthorityCalculator";
import {
  T1Grid,
  AccordionGroup,
  EmosPageWrapper,
  ReferralCopyButton,
} from "@/components/bureau/EmosInteractive";
import { Figure } from "@/components/bureau/EmosFigures";
import { EmosTOC } from "@/components/bureau/EmosTOC";
import CoverageFlywheel from "@/components/bureau/CoverageFlywheel";
import { RadarCallout } from "@/components/bureau/RadarCallout";
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

const OG_TITLE = "EMOS Academy · Build the Media Presence Investors Check";
const OG_DESC =
  "A guided implementation system for founders 3 to 12 months from a Series A. One-time investment, capability you keep forever.";

// Open Graph + Twitter set here on the deepest route segment so every scraper
// (LinkedIn, Twitter/X, WhatsApp, Facebook) renders the EMOS-specific card
// rather than falling back to the site-wide default. The file-convention
// opengraph-image.tsx / twitter-image.tsx in this folder supply the image with
// width/height/type automatically.
export const metadata: Metadata = {
  title: "EMOS Academy · Earned Media OS for Founders",
  description:
    "EMOS Academy is a guided implementation system for founders 3 to 12 months from a Series A. One-time investment, capability you keep forever.",
  alternates: { canonical: "/emos-academy" },
  openGraph: {
    type: "website",
    siteName: "Syed Irfan Ajmal",
    url: "https://www.syedirfanajmal.com/emos-academy",
    title: OG_TITLE,
    description: OG_DESC,
  },
  twitter: {
    card: "summary_large_image",
    site: "@syedirfanajmal",
    creator: "@syedirfanajmal",
    title: OG_TITLE,
    description: OG_DESC,
  },
};

/* =========================================================================
   EMOS LANDING PAGE v4 | restructured for length, front-loading, and
   consolidation. See EMOS-Page-Length-Structure-Audit.md for the rationale.
   ========================================================================= */

export default function EmosPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Sticky mobile apply bar: shown where the desktop rail is hidden (< 1200px). */
          .emos-mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:200;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 16px;background:${INK};border-top:1px solid ${YEL};box-shadow:0 -10px 30px -18px rgba(0,0,0,.7);}
          .emos-mobile-bar .mmb-price{font-family:${'var(--font-grot)'};font-weight:900;font-size:12px;letter-spacing:.04em;color:${PAPER};line-height:1.2;}
          .emos-mobile-bar .mmb-price span{display:block;font-family:${'var(--font-serif)'};font-weight:400;font-style:italic;font-size:10.5px;letter-spacing:0;color:rgba(250,250,250,.6);}
          .emos-mobile-bar .mmb-btn{flex:0 0 auto;font-family:${'var(--font-grot)'};font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;background:${YEL};color:${INK};border:1px solid ${INK};padding:12px 16px;text-decoration:none;}
          @media (min-width:1200px){.emos-mobile-bar{display:none;}}
          /* keep the fixed bar from covering the footer on mobile */
          @media (max-width:1199px){.emos-footer{padding-bottom:84px;}}
          `,
        }}
      />
      <EmosPageWrapper>
        <div className="layout">
          <EmosTOC />
          <aside className="cta-rail">
            <div className="cta-top">
              <div className="cta-kicker">Cohort 1 · Founding</div>
              <div className="cta-title">Apply now</div>
            </div>
            <div className="cta-body">
              {/* CHANGE 2: price surfaced in the sticky rail */}
              <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 14, letterSpacing: ".03em", color: INK, marginBottom: 10 }}>
                $2K · $3.5K{" "}
                <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", fontSize: 11, letterSpacing: 0, color: INK55 }}>one-time</span>
              </div>
              <div className="cta-meta">
                <div className="cta-meta-row"><b>Rolling</b> applications</div>
                <div className="cta-meta-row"><b>5</b> founder seats</div>
                <div className="cta-meta-row"><b>48h</b> decision</div>
              </div>
              <div className="cta-seats" title="Seats remaining"><div className="cta-seat" /><div className="cta-seat" /><div className="cta-seat" /><div className="cta-seat open" /><div className="cta-seat open" /></div>
              <a href="#apply" className="cta-btn">Submit Application →</a>
              <p className="cta-fine">5 min · reviewed personally</p>
            </div>
          </aside>
          <div className="page-body">

          {/* ── HERO ────────────────────────────────────────────────────── */}
          <section id="hero" className="emos-hero bg-ink sx">
            <div className="max">
              <h1 className="emos-hero-headline">
                Build the Media Presence Investors Check Before Your First
                Meeting.
              </h1>

              <div className="emos-hero-film">
                <p className="emos-hero-film-kicker">In a hurry? Watch the 45-second film</p>
                <div className="emos-hero-film-frame">
                  <iframe
                    src="/assets/emos-hero.standalone.html"
                    title="EMOS | what investors find when they look you up"
                    loading="lazy"
                    scrolling="no"
                  />
                </div>
              </div>

              <div className="emos-anti-pills">
                <span className="emos-anti-pill">Not a course</span>
                <span className="emos-anti-pill">No agency retainers</span>
                <span className="emos-anti-pill">No ad spend</span>
                <span className="emos-anti-pill">No platform dependency</span>
              </div>

              <p className="emos-hero-sub">
                <strong>EMOS Academy</strong>, built on EMOS — the Earned Media Operating System — is a
                Guided Implementation System for founders <strong>3 to 12 months from a Series A</strong>.
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
          <section className="emos-marquee-section">
            <div className="max">
              <div style={{ overflow: "hidden", border: `1px solid ${INK15}`, padding: "14px 0" }}>
                <p className="emos-marquee-label" style={{ marginBottom: 10 }}>Where we&#39;ve placed clients</p>
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
              </div>
            </div>
          </section>

          {/* ── PROOF BAR ──────────────────────────────────────────────── */}
          <section className="sy-sm bg-p2 sx">
            <div className="max">
              <p style={{ fontFamily: SERIF, fontSize: "clamp(16px,1.8vw,20px)", lineHeight: 1.55, marginBottom: 32, maxWidth: 680 }}>
                VCs look you up before the first meeting. What they find, or don&#39;t find, is already shaping the conversation.
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

          {/* ── CHANGE 1: OFFER SUMMARY (front-loaded) ──────────────────── */}
          <section id="offer" className="sy-sm sx">
            <div className="max">
              <div style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "clamp(22px,3vw,38px)", display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,44px)", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: "1 1 340px", minWidth: 0 }}>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>The offer · 30-second read</div>
                  <p style={{ fontFamily: SERIF, fontSize: "clamp(18px,2vw,23px)", lineHeight: 1.4, color: INK, marginBottom: 18 }}>
                    A guided cohort where you build your own earned-media system in 4 to 8 weeks, then keep it forever. <strong>Placements-or-refund guarantee.</strong>
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                    <span style={{ border: `1px solid ${INK15}`, padding: "8px 13px", fontFamily: SERIF, fontSize: 14 }}><strong>Foundation</strong> · $2,000 · 4 weeks</span>
                    <span style={{ border: `1px solid ${INK}`, background: YEL, padding: "8px 13px", fontFamily: SERIF, fontSize: 14 }}><strong>Accelerate</strong> · $3,500 · 8 weeks</span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>one-time · plan for 3 to 5 hrs/week</span>
                  </div>
                </div>
                <div style={{ flex: "0 1 290px", minWidth: 0 }}>
                  <a href="#apply" className="emos-cta-yellow" style={{ display: "flex", justifyContent: "center", width: "100%" }}>Submit Your Application →</a>
                  <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: INK70, marginTop: 12 }}>
                    Apply in 5 minutes. <strong>No payment now.</strong> I review within 48 hours, then a 15-minute fit call decides.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── § 1: BUILT BY ──────────────────────────────────────────── */}
          <section id="built-by" className="sy sx">
            <div className="max">
              <SectionMast noVol n="1" label="Built By" />
              <div className="emos-built-by-grid">
                <div>
                  <div className="pc-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/headshot-circle.png" alt="Syed Irfan Ajmal" className="pc-photo" />
                    <div className="pc-name">Syed Irfan Ajmal</div>
                    <div className="pc-title">Columnist · Agency Operator · ~13 Years</div>
                  </div>
                  <div className="pc-creds">
                    <div className="pc-cred"><div className="pc-cred-label">Written &amp; Cited In</div><div className="pc-cred-text">Forbes, HBR, HuffPost, World Bank, SEJ, Entrepreneur, The Next Web, Yahoo, MSN, SEMrush, SERPed <em>+ more</em></div></div>
                    <div className="pc-cred"><div className="pc-cred-label">International Speaker</div><div className="pc-cred-text">World Bank · Arabian Travel Market · MaGIC Malaysia · Astrolabs Dubai · DMSS.io Bali</div></div>
                    <div className="pc-cred"><div className="pc-cred-label">Custom Workshops</div><div className="pc-cred-text">Delivered for SEMrush (NYSE: SEMR) &amp; uHubs(SaaS, UK)</div></div>
                  </div>
                </div>
                <div>
                  <h2 className="sec-h2" style={{ marginBottom: 24 }}>
                    Someone who&#39;s been on both sides of the journalist&#39;s inbox.
                  </h2>
                  <p className="emos-bio-quote">
                    EMOS is the consolidation of two perspectives most operators only ever see one of: the agency operator sending pitches, and the columnist reading them.
                  </p>
                  {/* CHANGE 10: bio lightly condensed (facts unchanged) */}
                  <p className="emos-bio-body">
                    Founded an earned media agency ~13 years ago. Earlier, co-founded an award-winning geo-spatial intelligence startup and led marketing at two more ventures, all bootstrapped to profitability. Hosts <em>The SIA Business Podcast</em> (7+ years). Clients across the US, Canada, Europe, Australia, and the Gulf.
                  </p>
                  <div className="emos-stats-strip">
                    {[["~13","Years, Agency"],["100+","Publications"],["$1.2M","Client rev/mo"],["4","Continents"]].map(([v,k]) => (
                      <div className="emos-stat-cell" key={k}><div className="emos-stat-val">{v}</div><div className="emos-stat-key">{k}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── § 2: REAL PROBLEM ──────────────────────────────────────── */}
          <RadarCallout />
          <section id="how-it-works" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast noVol n="2" label="The Real Problem · Why Most Founders Fail at PR" />
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

          {/* ── § 3: INVESTOR LENS (+ Numbers merged in) ───────────────── */}
          <section id="investor-lens" className="sy sx">
            <div className="max">
              <SectionMast noVol n="3" label="The Investor Lens · How VCs Read Your Media Presence" />
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
              <Figure n={3} />

              {/* CHANGE 4: The Numbers folded under the Lens (dark panel keeps the white-on-dark cards readable) */}
              <div style={{ background: INK, padding: "clamp(28px,4vw,48px)", marginTop: 40 }}>
                <h3 className="sec-h2" style={{ marginBottom: 12, color: PAPER }}>Authority isn&#39;t a vibe. It&#39;s how the buying decision happens now.</h3>
                <p className="sec-sub" style={{ marginBottom: 40, color: "rgba(250,250,250,.55)" }}>Three numbers that explain why earned authority outperforms paid acquisition on the metrics that matter to a founder under fundraising pressure.</p>
                {/* CHANGE (item 6): the three numbers shown as an editorial stat ledger instead of a card grid */}
                <div>
                  {[
                    { big: "83%", fs: "clamp(30px,4vw,46px)", label: "B2B decisions before first contact", body: "Prospects and investors research independently. If you're not credible where they look, you're not on the list.", src: "Gartner / Edelman-LinkedIn B2B Report" },
                    { big: "3×", fs: "clamp(30px,4vw,46px)", label: "More likely to take a meeting", body: "B2B buyers trust thought leadership over marketing materials. A journalist quoting you does what no landing page ever can.", src: "Edelman-LinkedIn 2024/2025" },
                    { big: "$160K→$1.2M", fs: "clamp(20px,2.4vw,30px)", label: "Monthly revenue lift · client case study", body: "National Tyres & Autocare scaled from $160K to $1.2M monthly organic revenue. Earned coverage compounds; paid ads stop when you pause spend.", src: "Client case study · NTA Campaign" },
                  ].map((r) => (
                    <div key={r.big} style={{ display: "flex", flexWrap: "wrap", gap: "6px 30px", alignItems: "baseline", padding: "26px 0", borderTop: "1px solid rgba(250,250,250,.14)" }}>
                      <div style={{ flex: "0 0 210px", fontFamily: SERIF, fontWeight: 700, fontSize: r.fs, lineHeight: 1, color: YEL, letterSpacing: "-.02em" }}>{r.big}</div>
                      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: PAPER, marginBottom: 8 }}>{r.label}</div>
                        <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: "rgba(250,250,250,.6)", marginBottom: 8 }}>{r.body}</p>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(250,250,250,.35)" }}>{r.src}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── § 4: WHY NOW (condensed) ───────────────────────────────── */}
          <section id="why-now" className="sy sx">
            <div className="max" style={{ maxWidth: 760 }}>
              <SectionMast noVol n="4" label="Why Now · The Fundraising Timeline Problem" />
              <h2 className="sec-h2" style={{ marginBottom: 24 }}>Six months from now is too late.</h2>
              {/* CHANGE 5: two paragraphs condensed to one (all facts kept) */}
              <p style={{ fontFamily: SERIF, fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.65, color: INK70, marginBottom: 40 }}>
                Press takes 30 to 60 days to materialize, Tier 1 placements 60 to 120. Most founders only realize this after their first investor call, when a VC says <strong>&ldquo;I couldn&#39;t find much about you online&rdquo;</strong>, and by then the diligence window is far shorter than the quarter it takes to fix. If you wait until fundraising starts, you&#39;re already late.
              </p>
              <Figure n={1} />
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <a href="#apply" className="emos-cta-ink">Submit Your Application →</a>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>5 minutes. Decision within 48 hours.</span>
              </div>
            </div>
          </section>

          {/* ── § 5: THE PAYOFF · COVERAGE FLYWHEEL (unchanged) ─────────── */}
          <section id="the-payoff" className="sy sx">
            <div className="max">
              <SectionMast noVol n="5" label="The Payoff · Six Compounding Benefits" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Six benefits. One compounding <em style={{ color: YEL }}>engine.</em></h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Every advantage EMOS builds, arranged around the flywheel that compounds them. Hover, tap, or focus any segment to explore.</p>
              <CoverageFlywheel ctaHref="#curriculum" />
            </div>
          </section>

          {/* ── § 6: 5-RETURN FRAMEWORK (moved up, beside the flywheel) ──── */}
          <section id="five-returns" className="sy bg-ink sx">
            <div className="max">
              <SectionMast noVol n="6" label="The 5-Return Framework · One Placement, Five Returns" dark />
              <h2 className="sec-h2" style={{ marginBottom: 12, color: PAPER }}>One placement. Five returns.</h2>
              <p className="sec-sub" style={{ marginBottom: 44, color: "rgba(250,250,250,.55)" }}>Most founders treat a press placement as a one-off win. EMOS extracts five parallel returns from every single one. Which is why one Forbes citation can keep paying for years.</p>
              <Figure n={2} />
            </div>
          </section>

          {/* ── § 7: CURRICULUM (+ What You'll Build merged in as a strip) ── */}
          <section id="curriculum" className="sy sx">
            <div className="max">
              <SectionMast noVol n="7" label="Curriculum · Three Stages, Two Tracks" />
              {/* CHANGE 6: What You'll Build merged in as the 3-stage overview strip */}
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Three stages. One compounding system.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Stop outsourcing authority. Start owning it. Each stage produces a concrete output you keep forever.</p>
              <div className="emos-st-track">
                {[
                  { num: "01", title: "Get Quoted", weeksA: "Weeks 1 to 4", weeksB: "Foundation & Accelerate", conn: "", dark: false,
                    desc: "Pitching muscle built. First verified Tier 2/3 placements earned. Investor-ready citation list starts taking shape.",
                    items: ["Quotable zones mapped & media kit live","5 personalized pitch templates","15+ pitches submitted with tracking sheet","At least 1 verified placement"], assets: [] as string[] },
                  { num: "02", title: "Build Authority Assets", weeksA: "Weeks 5 to 8", weeksB: "Accelerate only", conn: "Builds into →", dark: false,
                    desc: "Syed works alongside you on your first 5 pitches. One owned linkable asset goes live. Tier 1 outreach in motion.",
                    items: ["Done-with-you first 5 placements","Original report or data study","Infographic and mapographic","Direct outreach to 15 to 20 Tier 1 journalists"], assets: ["Report","Data study","AI mini-tool","Calculator","Quiz"] },
                  { num: "03", title: "Scale & Systemize", weeksA: "Post-cohort", weeksB: "Accelerate-led", conn: "Compounds into →", dark: true,
                    desc: "The machine runs without you. Coverage compounds month over month, long after the cohort ends.",
                    items: ["20+ named-journalist target list","VA-ready system & sourcing module","90-day scaling plan","5-return extraction from every placement"], assets: [] as string[] },
                ].map((s, i) => (
                  <Fragment key={s.num}>
                    {i > 0 && (
                      <div className="emos-st-conn">
                        <div className="emos-st-conn-line" />
                        <span className="emos-st-conn-label">{s.conn}</span>
                      </div>
                    )}
                    <div className={`emos-st-card${s.dark ? " is-dark" : ""}`}>
                      <div className="emos-st-numcol">
                        <span className="emos-st-vnum">{s.num}</span>
                        <span className="emos-st-dot" /><span className="emos-st-dot" /><span className="emos-st-dot" />
                      </div>
                      <div className="emos-st-content">
                        <div className="emos-st-header">
                          <div className="emos-st-headleft">
                            <span className="emos-st-bignum">{s.num}</span>
                            <div className="emos-st-meta">
                              <span className="emos-st-tier">{s.weeksA}</span>
                              <span className="emos-st-sep" />
                              <span className="emos-st-tier">{s.weeksB}</span>
                            </div>
                            <h3 className="emos-st-title">{s.title}</h3>
                          </div>
                          <div className="emos-st-headright">
                            <p className="emos-st-desc">{s.desc}</p>
                          </div>
                        </div>
                        <div className="emos-st-deliverables">
                          {s.items.map(t => (
                            <div className="emos-st-item" key={t}><span className="emos-st-tick" /><span className="emos-st-itext">{t}</span></div>
                          ))}
                        </div>
                        {s.assets.length > 0 && (
                          <div className="emos-st-assets">
                            <span className="emos-st-assets-label">Linkable asset can be</span>
                            <div className="emos-st-chips">
                              {s.assets.map(a => (<span className="emos-st-chip" key={a}>{a}</span>))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
              <Figure n={4} />

              <h3 className="sec-h2" style={{ marginTop: 8, marginBottom: 12 }}>Choose the track that matches how fast you need to move.</h3>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Both tracks teach the same foundation. Accelerate adds 4 more weeks for founders who want Tier 1 publications and linkable assets.</p>
              <table className="emos-curr-table">
                <thead><tr><th style={{ width: "38%" }}></th><th>Foundation</th><th>Accelerate ★ Best Value</th></tr></thead>
                <tbody>
                  {[
                    ["Duration","4 weeks","8 weeks"],["Investment","$2,000 one-time","$3,500 one-time"],["Slack access","30 days","90 days"],["Weekly group calls","✓","✓"],["1-on-1 calls","·","✓"],["Done-with-you first 5 placements","·","✓"],["Linkable asset build","·","✓"],["EMOS Tools","Outreach Checklist","Full suite"],["Placements guaranteed","1 in 60 days","2 in 90 days"],
                  ].map(([label,f,a],i) => (
                    <tr key={label}><td>{label}</td><td>{i===8?<strong>{f}</strong>:f}</td><td>{i===8?<strong>{a}</strong>:a}</td></tr>
                  ))}
                </tbody>
              </table>
              <Figure n={5} />
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
                  { q:"Week 5 · Data Brief & Planning", a:"What makes a linkable asset genuinely newsworthy. Data audit. Report concept development. Introduction to JournoCollabIQ [Beta] for identifying high-fit journalists.", d:"Report concept locked. Methodology documented. Data sources identified." },
                  { q:"Week 6 · Report Build", a:"First draft review. Infographic and mapographic concepts. Asset production coordination.", d:"First draft complete. Infographic + mapographic in production." },
                  { q:"Week 7 · Outreach Strategy", a:"Identifying 15 to 20 named journalists at target publications. Direct pitch training. Headline testing. Three outreach templates.", d:"15 to 20 journalists identified. 3 templates ready. Headline variants tested." },
                  { q:"Week 8 · Launch & Outreach", a:"Publishing on a dedicated landing page. Tier 1 exclusivity strategy. Integrating the report into your ongoing earned media process.", d:"Report live. Tier 1 and Tier 2 outreach sent. Report integrated into all future pitching." },
                ].map(item => (
                  <div className="emos-acc-item" key={item.q}><button className="emos-acc-q"><span className="emos-acc-q-text">{item.q}</span><span className="emos-acc-icon">+</span></button><div className="emos-acc-body"><div className="emos-acc-body-inner">{item.a}<div className="emos-acc-deliverable"><strong>Deliverable:</strong> {item.d}</div></div></div></div>
                ))}
              </AccordionGroup>
            </div>
          </section>

          {/* ── § 8: TOOLS (moved to sit beside Curriculum) ────────────── */}
          <section id="tools" className="sy sx">
            <div className="max">
              <SectionMast noVol n="8" label="Tools · Purpose-built for the System" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Three tools. Included free.<br /><em style={{ color: YEL }}>Founding cohort only.</em></h2>
              <p className="sec-sub" style={{ marginBottom: 28 }}>Purpose-built tools that replace the manual work. Cohort 1 founding members get free 3-month access to all three.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", background: YEL, border: `1px solid ${INK}`, marginBottom: 36 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🔑</span>
                <div>
                  <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>Founding member benefit · Cohort 1 only</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, marginTop: 3 }}>Free 3-month access to all three tools.</div>
                </div>
              </div>
              <T1Grid className="grid-2up">
                {[
                  { num:"01", stat:"The Journo Outreach Checklist", beta:false, statSub:"Pitch tracking · Follow-ups · Placement log", name:"Every pitch and follow-up in one place", sector:"Tool 01 · Replaces scattered spreadsheets", body:"Track every pitch, follow-up, and response in one place. Submission count, follow-up dates, and placement status at a glance.", replaces:"Scattered HARO exports and manual follow-up tracking" },
                  { num:"02", stat:"PressIQ", beta:true, statSub:"PR pitch scorer · Mechanics · Personalization", name:"Score and fix your pitch before you send", sector:"Tool 02 · Replaces sending blind", body:"Scores your media pitch across mechanics, personalization, and strength, then shows you exactly how to fix it before you hit send.", replaces:"Sending pitches blind and hoping they land" },
                  { num:"03", stat:"JournoCollabIQ", beta:true, statSub:"Journalist matching · Beat · Coverage fit", name:"The journalists most likely to respond", sector:"Tool 03 · Replaces cold guesswork", body:"Identify the journalists and editors most likely to respond, based on beat, recent coverage, publication fit, and engagement history. Built from ~13 years of outreach data.", replaces:"Manual press-page trawling and cold inbox roulette" },
                ].map(tool => (
                  <div className="emos-t1" key={tool.stat}>
                    <div className="emos-t1-top">
                      <div className="emos-t1-logo" style={{ minWidth: 64, minHeight: 48, fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: INK15, letterSpacing: "-.03em" }}>{tool.num}</div>
                      <div className="emos-t1-plus">+</div>
                    </div>
                    <div className="emos-t1-stat-row"><div className="emos-t1-stat" style={{ fontSize: 26, letterSpacing: "-.01em" }}>{tool.stat}{tool.beta && <span className="beta-tag">Beta</span>}</div><div className="emos-t1-stat-sub">{tool.statSub}</div></div>
                    <div className="emos-t1-meta"><div className="emos-t1-name">{tool.name}</div><div className="emos-t1-sector">{tool.sector}</div></div>
                    <div className="emos-t1-body"><p className="emos-t1-body-p">{tool.body}</p><span className="emos-t1-rl">Replaces</span><span className="emos-t1-rv">{tool.replaces}</span></div>
                  </div>
                ))}
              </T1Grid>
            </div>
          </section>

          {/* ── § 9: PROOF / TESTIMONIALS (fixed case-study links kept) ──── */}
          <section id="proof" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast noVol n="9" label="Proof · The Same System. Their Results." />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>The same system. Their results.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Five results from client campaigns across the US, UK, and Gulf. Click any card to read the full testimony.</p>
              <div style={{ overflow: "hidden", border: `1px solid ${INK15}`, padding: "14px 0", marginBottom: 44 }}>
                <p className="emos-marquee-label" style={{ marginBottom: 10 }}>Founders we&#39;ve worked with</p>
                <div className="emos-marquee-track" style={{ gap: 40 }}>
                  {["Ridester","Curednation","Centriq","Dunlop Tires","BeeBole","Quran Academy","Efani","Smith Thompson","Paralign","Ridester","Curednation","Centriq","Dunlop Tires","BeeBole","Quran Academy","Efani","Smith Thompson","Paralign"].map((n,i) => (<span key={i}>{n}</span>))}
                </div>
              </div>
              <T1Grid className="grid-2up">
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/brett-helling.jpeg" alt="Brett Helling" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">1.5M</div><div className="emos-t1-stat-sub">Monthly unique visitors · Ridester.com</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Brett Helling</div><div className="emos-t1-sector">Media · Ridesharing · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Syed and the team&#39;s expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success, helping to grow Ridester from zero to 1.5 million monthly visitors.&rdquo;</p><span className="emos-t1-rl">Role · Irfan Ajmal</span><span className="emos-t1-rv">Earned media · SEO · Digital PR</span><a href="https://www.dmr.agency/case-studies/ridester-seo/" target="_blank" rel="noopener noreferrer" className="emos-t1-cy">See case study →</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/imani-lea-brown.jpg" alt="Imani Lea Brown" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">+120%</div><div className="emos-t1-stat-sub">Organic traffic increase · Centriq</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Imani Lea Brown</div><div className="emos-t1-sector">SaaS · Home Management · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Our organic traffic increased by 120%. Our public database clicks grew by 515%. We saw a 6x increase in average daily signups. Syed is truly an expert in his field. Thoughtful, conscientious, and goes above and beyond.&rdquo;</p><span className="emos-t1-rl">Notable · Centriq</span><span className="emos-t1-rv">Subsequently raised $11M in funding</span><a href="https://www.dmr.agency/case-studies/centriq-digital-pr-growth/" target="_blank" rel="noopener noreferrer" className="emos-t1-co">See case study →</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/trent-carter.jpeg" alt="Trent Carter" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">DR 1→27</div><div className="emos-t1-stat-sub">Domain rating growth · Curednation</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Trent Carter</div><div className="emos-t1-sector">Healthcare · United States 🇺🇸</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;Within 2 months of working with us we earned quality links from Healthline (DR 92), The Mirror (DR 90), and MSN (DR 92). Our Domain Rating grew from 1 to 27.&rdquo;</p><span className="emos-t1-rl">Role · Irfan Ajmal</span><span className="emos-t1-rv">Digital PR · Link building · Healthcare niche</span><a href="https://www.dmr.agency/case-studies/addiction-treatment-center-seo/" target="_blank" rel="noopener noreferrer" className="emos-t1-co">See case study →</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/reem-el-shafaki.jpg" alt="Reem El Shafaki" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">+140%</div><div className="emos-t1-stat-sub">Traffic in 3 months · Dinar Standard</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Reem El Shafaki</div><div className="emos-t1-sector">Finance · US/UAE 🇦🇪</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;The team partnered with our US and UAE teams on a Gulf government web portal. They earned high-authority backlinks from Reader&#39;s Digest and MSN. Traffic increased by 140% in 3 months against a 25%/9-month goal. Page views up 102%, impressions up 65%.&rdquo;</p><span className="emos-t1-rl">Context</span><span className="emos-t1-rv">Government web portal · Gulf region</span><a href="https://www.dmr.agency/case-studies/government-portal-seo/" target="_blank" rel="noopener noreferrer" className="emos-t1-co">See case study →</a></div>
                </div>
                <div className="emos-t1">
                  <div className="emos-t1-top"><div className="emos-t1-logo"><div className="emos-avatar">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/testimonials/azzam-sheikh.jpeg" alt="Azzam Sheikh" /></div></div><div className="emos-t1-plus">+</div></div>
                  <div className="emos-t1-stat-row"><div className="emos-t1-stat">Pos. #4</div><div className="emos-t1-stat-sub">Google rank · 160K monthly searches</div></div>
                  <div className="emos-t1-meta"><div className="emos-t1-name">Azzam Sheikh</div><div className="emos-t1-sector">E-Commerce · Autocare · United Kingdom 🇬🇧</div></div>
                  <div className="emos-t1-body"><p className="emos-t1-body-p">&ldquo;So chuffed to see a keyword rank to position #4 in Google that gets over 160,000 searches a month. Most with commercial intent. Can&#39;t thank Syed and the team enough; they&#39;re now ranking hundreds of keywords for us. Exceptional professionalism.&rdquo;</p><span className="emos-t1-rl">Role · Irfan Ajmal</span><span className="emos-t1-rv">SEO · Digital PR · Earned media</span><a href="https://www.dmr.agency/case-studies/auto-retailer-seo/" target="_blank" rel="noopener noreferrer" className="emos-t1-cy">See case study →</a></div>
                </div>
              </T1Grid>
            </div>
          </section>

          {/* ── § 10: FIT CHECK ────────────────────────────────────────── */}
          <section id="fit" className="sy sx">
            <div className="max">
              <SectionMast noVol n="10" label="Fit Check · Who This Is Not For" />
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
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(250,250,250,.72)", marginBottom: 32 }}>
                    This is for founders <strong style={{ color: PAPER }}>3 to 12 months from a raise</strong> who are willing to do the work, or have a team member or VA willing to do it under your direction.
                  </p>
                  <a href="#apply" className="emos-cta-yellow" style={{ display: "flex", justifyContent: "center" }}>Submit Your Application →</a>
                </div>
              </div>
            </div>
          </section>

          {/* ── § 11: THE MATH / CALCULATOR (TCO moved out to Investment) ── */}
          <section id="calculator" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast noVol n="11" label="The Math · SIA Authority ROI Calculator" />
              <h2 className="sec-h2" style={{ marginBottom: 12 }}>Find out how much EMOS will save you<br />in financial costs alone.</h2>
              <p className="sec-sub" style={{ marginBottom: 40 }}>Let alone the benefits of doing things in-house: investor credibility, AI citations, sales proof, and compounding reach. Adjust to your real numbers.</p>
              <AuthorityCalculator />
            </div>
          </section>

          {/* ── § 12: INVESTMENT (+ TCO merged in) ─────────────────────── */}
          <section id="pricing" className="sy bg-ink sx">
            <div className="max">
              <SectionMast noVol n="12" label="Investment · Two Tracks, One-Time Fee" dark />
              <div className="emos-pricing-outer">
                <div className="emos-pricing-math">
                  <h2 className="sec-h2" style={{ marginBottom: 24, color: PAPER }}>Two tracks. One-time investment. Capability you keep forever.</h2>
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(250,250,250,.60)", marginBottom: 16 }}>A traditional agency charges <strong style={{ color: PAPER }}>$60,000 to $240,000 a year</strong> for content, SEO, and digital PR, before a single result lands, and the knowledge walks out when the contract ends.</p>
                  <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: "rgba(250,250,250,.60)" }}>EMOS: <strong style={{ color: YEL }}>$2,000 to $3,500 one-time</strong>. The capability stays. Forever.</p>
                  <p style={{ marginTop: 24, fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: PAPER, lineHeight: 1.4, borderLeft: `3px solid ${YEL}`, paddingLeft: 16 }}>One placement on a DA 80+ site is worth more than the program.</p>
                  <p style={{ marginTop: 20, fontFamily: SERIF, fontSize: 16, color: "rgba(250,250,250,.60)" }}>Use the <a href="#calculator" className="emos-tool-link">SIA Authority ROI Calculator ↑</a> to run the numbers for your business.</p>
                </div>
                <div className="emos-price-cards">
                  <div className="emos-price-card">
                    <div className="emos-price-name">Foundation</div><div className="emos-price-amount">$2K</div><div className="emos-price-period">one-time · 4 weeks</div>
                    <div className="emos-price-features">
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>Group cohort format</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>30-day Slack access</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>1 placement guaranteed in 60 days</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check">✓</span>The Journo Outreach Checklist</div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check" style={{ color: "rgba(250,250,250,.2)" }}>·</span><span className="emos-price-feat-no">Done-with-you placements</span></div>
                      <div className="emos-price-feat"><span className="emos-price-feat-check" style={{ color: "rgba(250,250,250,.2)" }}>·</span><span className="emos-price-feat-no">Linkable asset build</span></div>
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

              {/* CHANGE 8: TCO 3-year comparison moved here from The Math (keeps its own paper background) */}
              <div className="tco">
                <div className="tco-head">
                  <div className="tco-eyebrow">Your real cost over 3 years</div>
                  <div className="tco-sub">EMOS is a one-time investment. The only ongoing cost is optional: a VA to run the system, roughly $5K to $30K a year depending on where you hire, or $0 if you run it yourself. An agency bills the full amount again, every single year.</div>
                </div>
                <div className="tcb-wrap">
                  <div className="tcb-row">
                    <div className="tcb-head"><span className="tcb-name">EMOS</span><span className="tcb-amt">$3.5K once, then an optional VA · <strong>$3.5K to ~$40K total</strong></span></div>
                    <div className="tcb-track"><div className="tcb-fill tcb-emos" style={{ width: "11%" }} /></div>
                  </div>
                  <div className="tcb-row">
                    <div className="tcb-head"><span className="tcb-name">Content + SEO + PR agencies</span><span className="tcb-amt"><strong className="tcb-amt-big">$180K to $720K total</strong></span></div>
                    <div className="tcb-track"><div className="tcb-fill tcb-agency" style={{ width: "100%" }}><span className="tcb-seg">Year 1</span><span className="tcb-seg">Year 2</span><span className="tcb-seg">Year 3</span></div></div>
                  </div>
                  <div className="tcb-scale">Agencies bill the full amount again, every year. EMOS is paid once.</div>
                </div>
                <div className="tco-foot">Three years of EMOS, even with an onshore VA, runs about half the cheapest agency path and a fraction of the rest. Run it yourself and it&#39;s a rounding error.</div>
              </div>

              <div id="apply" className="emos-apply-block">
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(250,250,250,.60)", marginBottom: 16 }}>Apply for Cohort 1</div>
                <div className="emos-apply-grid">
                  <div>
                    <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3vw,36px)", color: PAPER, lineHeight: 1.1, marginBottom: 16 }}>5 seats. Rolling applications.<br />Here&#39;s how to claim one.</h3>
                    <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: "rgba(250,250,250,.60)" }}>One short application. I review every submission personally within 48 hours. If it&#39;s a fit, I&#39;ll send a Calendly link to talk through the details.</p>
                    <p style={{ marginTop: 14, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(250,250,250,.40)" }}>Both tracks include lifetime access to every future EMOS cohort</p>
                  </div>
                  <div>
                    {[["1","Submit your application","5 minutes"],["2","Personal review by Syed","within 48 hours"],["3","15-minute call to confirm fit","qualified applicants only"],["4","Decision and onboarding",""]].map(([n,text,sub]) => (
                      <div className="emos-apply-step" key={n}><div className="emos-apply-n">{n}</div><div className="emos-apply-text"><strong>{text}</strong>{sub && <>&nbsp;&nbsp;·&nbsp;&nbsp;{sub}</>}</div></div>
                    ))}
                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                      <a href="/emos-academy/apply" className="emos-cta-yellow">Submit Your Application →</a>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(250,250,250,.45)" }}>5 minutes. Decision within 48 hours.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── § 13: GUARANTEE ────────────────────────────────────────── */}
          <section id="guarantee" className="sy sx">
            <div className="max">
              <SectionMast noVol n="13" label="Risk Reversal · The Guarantee" />
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
                  <p className="emos-commit-note">EMOS is new, but the playbook behind it isn&#39;t. It&#39;s the same earned-media approach my agency has used for ~13 years, and clients who work it consistently earn placements.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── § 14: FAQ (Q3 / Q4 / Q8 trimmed to pointers) ───────────── */}
          <section id="faq" className="sy bg-p2 sx">
            <div className="max">
              <SectionMast noVol n="14" label="FAQ · Common Questions" />
              <h2 className="sec-h2" style={{ marginBottom: 40 }}>Common questions.</h2>
              <AccordionGroup className="emos-faq-wrap">
                {[
                  { q:"How much time does this require each week?", a:"Plan for 3 to 5 hours per week: 90 minutes for the live session plus 2 to 3 hours for assignments. The assignments aren't busywork: they're real pitches going to real journalists. Most founders pair the system with a part-time VA ($300 to $1,500 per month)." },
                  { q:"I don't have a team member who can run this. What do I do?", a:"Accelerate includes a VA sourcing and training module. I help you identify what support you need, source the right person, and train them on the system. The real qualification isn't whether you have someone today; it's whether you're willing to hire one after the program ends." },
                  { q:"I tried PR before and it didn't work. Why is this different?", a:"Short version: most failed efforts share four traits (generic mass pitching, no founder POV, no consistent system, agency dependency). EMOS removes all four, and because the coverage is earned, it compounds instead of evaporating when you stop paying. The full breakdown is in The Real Problem above." },
                  { q:"Is this really better than hiring agencies for content, SEO, and PR?", a:"Agencies run $60,000 to $240,000 a year and the knowledge leaves when the relationship does. EMOS is a one-time investment that builds the capability inside your company. Some clients do both; most don't need to. See the 3-year cost comparison in Investment above, and run your own numbers in the calculator." },
                  { q:"Will this work for my industry?", a:"Yes, provided you have customers, results, or a defensible point of view. The system has produced placements for SaaS, fintech, healthcare, marketplaces, e-commerce, AI, mobility, education, and consumer products." },
                  { q:"When can I expect my first placement?", a:"Most participants submit their first pitches in Week 2 and land their first verified placement within 4 to 6 weeks of cohort end. Tier 1 placements generally take 60 to 120 days from a cold start." },
                  { q:"Will this still work as AI changes search?", a:"Earned media is the most resilient channel against AI-driven shifts. For AI visibility, brand mentions matter even more than backlinks: ChatGPT, Perplexity, and Google's AI Overviews surface the names credible publications talk about, linked or not. Earned coverage gets you both at once: the brand mentions AI cites you for, and the high-authority backlinks that lift your SEO and rank your domain for the terms your buyers use. EMOS doesn't just survive the AI shift; it's built to benefit from it." },
                  { q:"How exactly does the placement guarantee work?", a:"Foundation: 15 pitches, 1 placement in 60 days. Accelerate: 30 pitches, 2 in 90 days. Miss it and I refund in full. Full terms, and what each side commits to, are in The Guarantee above." },
                  { q:"What are the EMOS tools? And do I really get them free?", a:"Yes. Cohort 1 founding members get free 3-month access. The Journo Outreach Checklist tracks every pitch, follow-up, and placement, and is included on both tracks. Accelerate adds the full suite: PressIQ [Beta], the PR pitch scorer that grades your pitch on mechanics, personalization, and strength; and JournoCollabIQ [Beta], which surfaces the journalists most likely to respond by beat and coverage fit." },
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
              <p style={{ fontFamily: SERIF, fontSize: "clamp(16px,1.8vw,19px)", lineHeight: 1.7, color: "rgba(250,250,250,.60)", marginBottom: 40, maxWidth: 620, marginInline: "auto" }}>
                This time next year, your team owns the system. Your name lives in the publications your buyers and investors already trust. The coverage compounds long after the program ends.
              </p>
              <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(250,250,250,.40)", marginBottom: 28 }}>
                Rolling applications — next cohort forming now &nbsp;·&nbsp; Five founders &nbsp;·&nbsp; Application required
              </p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <a href="/emos-academy/apply" className="emos-cta-yellow" style={{ fontSize: 13, padding: "18px 36px" }}>Submit Your Application →</a>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(250,250,250,.40)" }}>5 minutes. Decision within 48 hours.</span>
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
              <div className="emos-footer-links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="/refund-policy">Refund Policy</a><a href="mailto:sia@syedirfanajmal.com">sia@syedirfanajmal.com</a></div>
            </div>
          </footer>
          </div>
        </div>
      </EmosPageWrapper>

      {/* CHANGE 3: sticky mobile apply bar (the desktop rail is hidden < 1200px) */}
      <div className="emos-mobile-bar">
        <div className="mmb-price">$2K · $3.5K<span>one-time · Cohort 1 · 5 seats</span></div>
        <a href="/emos-academy/apply" className="mmb-btn">Apply →</a>
      </div>
    </>
  );
}

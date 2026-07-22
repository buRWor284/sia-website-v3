import type { Metadata } from "next";
import Link from "next/link";
import { getRadarData } from "@/lib/radar/data";
import { delta7 } from "@/lib/radar/types";
import RadarModule from "./RadarModule";
import "./radar.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

export const metadata: Metadata = {
  title: "Earned Media Radar",
  description:
    "A live map of what the press is covering across PR, earned media, SEO, and AI search. Powered by SignalIQ. See why earned media wins now, and how to put it to work.",
  alternates: { canonical: "/earned-media-radar" },
  openGraph: {
    title: "Earned Media Radar · Syed Irfan Ajmal",
    description: "A live map of what the press is covering across PR, earned media, SEO, and AI search. Powered by SignalIQ.",
    url: "/earned-media-radar",
  },
};

const pctInt = (x: number): string => {
  const s = Math.round(x * 100);
  return (s >= 0 ? "+" : "−") + Math.abs(s) + "%";
};

// Internal link targets — real routes verified against the app router.
const LINKS = {
  book: "/strategy-call",
  signaliq: "/tools/signaliq",
  tools: "/tools",
  emosPlatform: "/emos-platform",
  emosAcademy: "/emos-academy",
  emosAcademyApply: "/emos-academy/apply",
  fractionalCmo: "/fractional-cmo",
  // External (dmr.agency)
  eme: "https://www.dmr.agency/earned-media-engine/",
  emb: "https://www.dmr.agency/earned-media-booster/",
};

export default async function RadarPage() {
  const data = await getRadarData();
  const top = data.risers[0];
  const quiet = data.topics.filter((t) => t.tr < 0).sort((a, b) => a.tr - b.tr)[0];
  const geoWoW = delta7(data.series.geo);

  const ticker: string[] = [
    top ? `“${top.topic}” coverage ${pctInt(top.tr)} in 30 days` : "Earned coverage compounds while paid stops the moment you stop paying",
    quiet ? `“${quiet.topic}” coverage ${pctInt(quiet.tr)}, an open lane` : "Quiet in the press is yours to own",
    `GEO / AI-search coverage ${pctInt(geoWoW)} week over week`,
    "If you are not in the coverage, you are not in the AI answer",
    "The window that pays is before the story breaks",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Earned Media Radar",
    url: "https://www.syedirfanajmal.com/earned-media-radar",
    description:
      "A live map of what the press is covering across PR, earned media, SEO, and AI search, powered by SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  return (
    <main className="emr-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="emr-hero">
        <div className="emr-scaps">Live Earned Media Radar</div>
        <h1 className="emr-h1">Everyone else is buying attention. This is a live map of how to earn it.</h1>
        <p className="emr-body-lg" style={{ margin: "0 0 28px" }}>
          Right now, in real time, this radar reads what the press is actually covering across PR, earned media, SEO, and AI search. It runs
          on SignalIQ, the same engine behind the campaigns that have put founders in Forbes, Harvard Business Review, and Business Insider.
          Scroll down and watch it work.
        </p>
        <div className="emr-cta-row">
          <Link href={LINKS.book} className="emr-btn-yellow">
            Book a discovery call
          </Link>
          <Link href={LINKS.signaliq} className="emr-tlink">
            or start with SignalIQ, free
          </Link>
        </div>
        <p className="emr-micro">
          This is not a mockup. Every dot is a topic. Every number is real coverage data from SignalIQ, refreshed daily. Hover anything to see it.
        </p>
      </section>

      {/* LIVE RADAR */}
      <div className="emr-double" />
      <div className="emr-mast">
        <span className="emr-pill">§ 03</span>
        <h2 className="emr-h3">The live radar</h2>
      </div>
      <RadarModule data={data} />
      <div style={{ textAlign: "center", padding: "28px 0 8px" }}>
        <Link href={LINKS.signaliq} className="emr-btn">
          Start with SignalIQ, free
        </Link>
      </div>

      {/* WHY EARNED WHY NOW */}
      <section className="emr-section">
        <div className="emr-scaps">§ 04 · Why earned, why now</div>
        <h2 className="emr-h2" style={{ margin: "10px 0 24px", maxWidth: 760 }}>
          Ads stop the second you stop paying. Earned media compounds while you sleep.
        </h2>
        <div className="emr-four">
          {[
            {
              n: "01",
              h: "A journalist quoting you beats an ad you wrote about yourself.",
              b: "Nobody trusts the brand that says it is the best. They trust the reporter, the study, the third party. Earned coverage borrows that credibility, and it is the only kind of visibility your competitor cannot simply outbid you for.",
            },
            {
              n: "02",
              h: "AI now answers your buyer with earned coverage, not your ad.",
              b: "Ask ChatGPT, Perplexity, or Google's AI Overviews about your category and the answer is stitched from what the open web has published about you. The radar shows this shift live: answer engine optimization is one of the fastest-rising topics on the board. If you are not in the coverage, you are not in the answer.",
            },
            {
              n: "03",
              h: "The window that pays is before the story breaks.",
              b: "Once a topic is hot, every comms person can see it and you are the two-hundredth pitch. The money is in the one to two weeks before a story crests, when the signal is in the data but not yet in the headlines. That gap is exactly what the radar measures.",
            },
            {
              n: "04",
              h: "Earned assets keep working. Paid stops dead.",
              b: "A research report reporters cite, a tool they link to, a quote that gets syndicated: those keep sending you traffic, links, and authority for years. Pause an ad budget and the traffic is gone. One is an asset. The other is a meter running.",
            },
          ].map((c) => (
            <div className="emr-card" key={c.n}>
              <span className="emr-num">{c.n}</span>
              <h3 className="emr-h3" style={{ marginBottom: 10 }}>
                {c.h}
              </h3>
              <p className="emr-body" style={{ fontSize: 14.5 }}>
                {c.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* THE SYSTEM */}
      <section className="emr-section">
        <div className="emr-scaps">§ 05 · How it actually works</div>
        <h2 className="emr-h2" style={{ margin: "10px 0 24px", maxWidth: 760 }}>
          Getting quoted is not a lottery. It is four repeatable moves.
        </h2>
        <div className="emr-four">
          {[
            { s: "01 · Detect · SignalIQ", h: "Find the signal early.", b: "Watch open, primary sources and find the stories rising fastest before the press catches up. This is SignalIQ, the engine you are watching above." },
            { s: "02 · Build · AssetIQ", h: "Build the thing reporters cite.", b: "Turn the signal into a linkable asset: a sourced data brief, a chart or map, a survey, a small tool. Not a press release. Something with a reason to exist." },
            { s: "03 · Pitch · PressIQ + JournoCollabIQ", h: "Pitch it early, to the right desk.", b: "Score the pitch before you send it, and match it to the journalist most likely to bite. Early plus relevant beats late plus generic every time." },
            { s: "04 · Track · CoverageIQ", h: "Track it and compound.", b: "Follow the placement, the links, and the citations, then feed what worked back into the next cycle." },
          ].map((c) => (
            <div className="emr-step" key={c.s}>
              <div className="emr-scaps" style={{ display: "block", marginBottom: 8 }}>
                {c.s}
              </div>
              <h3 className="emr-h3" style={{ marginBottom: 8 }}>
                {c.h}
              </h3>
              <p className="emr-body" style={{ fontSize: 14 }}>
                {c.b}
              </p>
            </div>
          ))}
        </div>
        <p className="emr-body-lg emr-italic" style={{ marginTop: 22, maxWidth: 760 }}>
          That loop is EMOS, the Earned Media Operating System. You can run it yourself, learn it with me, or hand it over.
        </p>
      </section>

      {/* THE LADDER */}
      <section className="emr-section">
        <div className="emr-scaps">§ 06 · Where do you want to start</div>
        <h2 className="emr-h2" style={{ margin: "10px 0 24px", maxWidth: 760 }}>
          From &ldquo;let me try it myself&rdquo; to &ldquo;please just run this for me.&rdquo;
        </h2>
        <div className="emr-ladder">
          <div className="emr-lcard emr-first">
            <span className="emr-scaps">Do it yourself · free</span>
            <h3 className="emr-h3">The public tools</h3>
            <p className="emr-body" style={{ fontSize: 14 }}>
              Open, no card, no signup wall. Start with SignalIQ and watch the same radar find opportunities in your category.
            </p>
            <Link href={LINKS.signaliq} className="emr-tlink emr-lcard-cta">
              Start with SignalIQ, free →
            </Link>
          </div>

          <div className="emr-lcard">
            <span className="emr-scaps">Run it as software</span>
            <h3 className="emr-h3">EMOS platform</h3>
            <p className="emr-body" style={{ fontSize: 14 }}>
              The operating system behind everything here: find the story, build the asset, score the pitch, find the journalist, track the placement.
            </p>
            <Link href={LINKS.emosPlatform} className="emr-tlink emr-lcard-cta">
              See the EMOS platform →
            </Link>
          </div>

          <div className="emr-lcard">
            <span className="emr-scaps">Learn it, with guidance</span>
            <h3 className="emr-h3">EMOS Academy</h3>
            <p className="emr-body" style={{ fontSize: 14 }}>
              The guided version. Build a real media presence over the cohort, and keep the capability forever. Built for founders near a raise.
            </p>
            <Link href={LINKS.emosAcademy} className="emr-tlink emr-lcard-cta">
              Apply to the Academy →
            </Link>
          </div>

          <div className="emr-lcard">
            <span className="emr-scaps">Done for you · reactive</span>
            <h3 className="emr-h3">Earned Media Booster</h3>
            <p className="emr-body" style={{ fontSize: 14 }}>
              We catch the journalist requests worth answering and get you quoted, so you get the coverage without living in the queries.
            </p>
            <a href={LINKS.emb} className="emr-tlink emr-lcard-cta" target="_blank" rel="noopener">
              See Earned Media Booster →
            </a>
          </div>

          <div className="emr-lcard">
            <span className="emr-scaps">Done for you · proactive</span>
            <h3 className="emr-h3">Earned Media Engine</h3>
            <p className="emr-body" style={{ fontSize: 14 }}>
              Original research, surveys, and mini-tools, taken to the press for Tier-1 coverage and AI citations. Manufacture the signal instead of waiting for it.
            </p>
            <a href={LINKS.eme} className="emr-tlink emr-lcard-cta" target="_blank" rel="noopener">
              See the Earned Media Engine →
            </a>
          </div>

          <div className="emr-lcard emr-primary">
            <span className="emr-scaps">Marketing leadership</span>
            <h3 className="emr-h3">Fractional CMO + audit</h3>
            <p className="emr-body" style={{ fontSize: 14, color: "var(--color-paper-72)" }}>
              Hand marketing leadership to an operator who has shipped the campaigns. The lowest-risk way in is a Marketing Leadership Audit: two weeks, a full read, a written plan. Move into the retainer and the fee credits back in full.
            </p>
            <Link href={LINKS.book} className="emr-btn-yellow emr-lcard-cta">
              Book a discovery call
            </Link>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="emr-proof">
        <div className="emr-proof-inner">
          <div className="emr-scaps">§ 07 · This is not theory</div>
          <h2 className="emr-h2" style={{ margin: "10px 0 20px", color: "var(--color-paper)", maxWidth: 760 }}>
            I have spent over a decade on both sides of the journalist&apos;s inbox.
          </h2>
          <div className="emr-logos">
            Forbes &nbsp;·&nbsp; Harvard Business Review &nbsp;·&nbsp; Business Insider &nbsp;·&nbsp; Entrepreneur &nbsp;·&nbsp; Yahoo &nbsp;·&nbsp;
            MarketWatch &nbsp;·&nbsp; MSN &nbsp;·&nbsp; World Bank &nbsp;·&nbsp; SEMrush &nbsp;·&nbsp; Ahrefs
          </div>
          <div className="emr-stats">
            {[
              { n: "0 → 1.5M", c: "Monthly visitors · Ridester" },
              { n: "160K → 1.2M", c: "Monthly revenue · National Tyres & Autocare" },
              { n: "6×", c: "Daily signups · Centriq" },
              { n: "+140%", c: "Traffic in 3 months · DinarStandard" },
            ].map((s) => (
              <div key={s.c}>
                <div className="emr-stat-num">{s.n}</div>
                <div className="emr-stat-cap">{s.c}</div>
              </div>
            ))}
          </div>
          <p className="emr-proof-body">
            Not a titled ex-CMO, and I would rather say that plainly than let three letters imply something they have not earned. An operator:
            22 years building companies since 2004, 13 of them running DMR.agency, and the campaigns above are ones I actually shipped.
          </p>
          <p style={{ marginTop: 18 }}>
            <span className="emr-pill">2 CMO spots open · Q3 2026</span>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="emr-final">
        <h2 className="emr-h2">Stop renting attention. Start earning it.</h2>
        <p className="emr-body-lg" style={{ margin: "16px 0 24px" }}>
          The reporters and the AI engines your buyers trust are writing tomorrow&apos;s answers from today&apos;s data. This radar reads the
          same data. The only question is whether you want to watch it yourself, learn to work it, or hand it to someone who does this for a living.
        </p>
        <Link href={LINKS.book} className="emr-btn-yellow">
          Book a discovery call
        </Link>
        <p className="emr-micro">Thirty minutes, no pitch deck. The easiest first step is a Marketing Leadership Audit, and if you go further it pays for itself.</p>
        <div className="emr-secondary-links">
          <Link href={LINKS.signaliq} className="emr-tlink">
            Try SignalIQ free
          </Link>
          <a href={LINKS.eme} className="emr-tlink" target="_blank" rel="noopener">
            See the Earned Media Engine
          </a>
          <Link href={LINKS.emosAcademyApply} className="emr-tlink">
            Apply to the Academy
          </Link>
        </div>
        <div className="emr-honesty">
          I built all of this on one rule: earned media is earned, not faked. The radar shows real signals in real data and links every one back
          to its source. It will never hand you a prediction dressed up as a fact, and I will never sell you a tool that spends the credibility you
          are trying to build. That is the whole point.
          <span className="emr-sign">Syed Irfan Ajmal</span>
        </div>
      </section>

      {/* TICKER */}
      <div className="emr-ticker" aria-hidden="true">
        <div className="emr-ticker-lbl">Headline insights</div>
        <div className="emr-ticker-track">
          {ticker.concat(ticker).map((t, i) => (
            <span key={i}>
              <span className="emr-diamond">&#9670;</span>
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="emr-copyright">© MMXXVI Syed Irfan Ajmal · SIA Enterprises Inc</p>
    </main>
  );
}

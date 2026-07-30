import type { Metadata } from "next";
import Link from "next/link";
import { getRadarData } from "@/lib/radar/data";
import { delta7 } from "@/lib/radar/types";
import RadarModule from "./RadarModule";
import { Colophon } from "@/components/bureau";
import "./radar.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

export const metadata: Metadata = {
  title: "Earned Media Radar",
  description:
    "A live map of what the press is covering across PR, earned media, SEO, and AI search. Powered by SignalIQ. See why earned media wins now, and how to put it to work.",
  alternates: { canonical: "/earned-media-radar" },
  icons: { icon: "/favicon.png" },
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
  ksaRadar: "/ksa-tourism-radar",
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
    quiet ? `“${quiet.topic}” coverage ${pctInt(quiet.tr)}, a wide-open lane` : "Quiet in the press is yours to own",
    `GEO / AI-search coverage ${pctInt(geoWoW)} week over week`,
    "If you are not in the coverage, you are not in the AI answer",
    "The window that pays opens before the story breaks",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Earned Media Radar",
    url: "https://www.syedirfanajmal.com/earned-media-radar",
    description: "A live map of what the press is covering across PR, earned media, SEO, and AI search, powered by SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO + RADAR */}
      <main className="emr-wrap">
        <section className="emr-hero">
          <div className="emr-scaps">Live Earned Media Radar</div>
          <h1 className="emr-h1">Everyone else is buying attention. This is a live map of how to earn it.</h1>
          <p className="emr-body-lg" style={{ margin: "0 0 26px" }}>
            Ask ChatGPT or Google&rsquo;s AI Overviews about your market and the answer is built from what the press has published &mdash; not from your ad
            budget. This radar reads that coverage in real time across PR, earned media, SEO, and AI search. It runs on SignalIQ, the same engine behind
            founder placements in Forbes, Harvard Business Review, and Business Insider.
          </p>
          <div className="emr-cta-row">
            <Link href={LINKS.book} className="emr-btn-yellow">
              Book a discovery call
            </Link>
            <Link href={LINKS.signaliq} className="emr-tlink">
              or start with SignalIQ, free
            </Link>
          </div>
          <p className="emr-micro">Not a mockup. Every mark is a real topic, every number is live coverage data, refreshed daily. Click a lens to filter it.</p>
        </section>

        <div className="emr-double" />
        <div className="emr-mast">
          <span className="emr-pill">§ 03</span>
          <h2 className="emr-h3">The live radar</h2>
        </div>

        <RadarModule data={data} />

        <div style={{ textAlign: "center", padding: "30px 0 6px" }}>
          <Link href={LINKS.signaliq} className="emr-btn">
            Start with SignalIQ, free
          </Link>
        </div>

        {/* Regional edition — sibling instrument pointed at KSA tourism */}
        <Link
          href={LINKS.ksaRadar}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
            maxWidth: 1000,
            margin: "16px auto 0",
            padding: "20px 24px",
            background: "var(--color-paper-2)",
            border: "2px solid var(--color-ink)",
            textDecoration: "none",
          }}
        >
          <span style={{ flex: 1, minWidth: 240 }}>
            <span className="emr-scaps" style={{ display: "block", marginBottom: 6 }}>
              Regional edition
            </span>
            <span className="emr-body" style={{ display: "block", fontSize: 15, color: "var(--color-ink)" }}>
              There&rsquo;s a version of this radar pointed at Saudi Arabia&rsquo;s tourism &amp; hospitality boom &mdash; the giga-projects, mega-events, and
              faith-travel beats, and the coverage gaps a challenger brand or speaker can still own.
            </span>
          </span>
          <span className="emr-tlink" style={{ whiteSpace: "nowrap" }}>
            See the KSA Tourism Radar &rarr;
          </span>
        </Link>

        {/* pull line: radar -> hire */}
        <div style={{ textAlign: "center", maxWidth: 840, margin: "52px auto 6px" }}>
          <p className="emr-h2" style={{ fontStyle: "italic" }}>
            &ldquo;I built this radar. Now imagine it pointed at <span className="emr-hl">your</span> company.&rdquo;
          </p>
          <p className="emr-scaps" style={{ marginTop: 16, display: "block" }}>
            &mdash; Syed Irfan Ajmal
          </p>
        </div>
      </main>

      {/* § 04 — WHY (paper-2 band) */}
      <div className="emr-band-p2">
        <div className="emr-band-inner">
          <div className="emr-mast">
            <span className="emr-pill">§ 04</span>
            <span className="emr-scaps">Why earned, why now</span>
          </div>
          <h2 className="emr-h2" style={{ maxWidth: 820 }}>
            Ads stop the second you stop paying. Earned media compounds while you sleep.
          </h2>
          <div className="emr-why-grid">
            <div className="emr-why-card feature">
              <span className="emr-why-num">01</span>
              <h3 className="emr-h3" style={{ marginBottom: 10 }}>
                AI now answers your buyer with earned coverage &mdash; not your ad.
              </h3>
              <p className="emr-body">
                Ask ChatGPT, Perplexity, or Google&rsquo;s AI Overviews about your category and the answer is assembled from what the open web has published
                about you. The radar shows it live:{" "}
                <span className="emr-hl">&ldquo;answer engine optimization&rdquo; is one of the fastest-rising beats on the board</span>. If you&rsquo;re not in
                the coverage, you&rsquo;re not in the answer &mdash; and that answer is quietly replacing the search result.
              </p>
            </div>
            <div className="emr-why-card">
              <span className="emr-why-num">02</span>
              <h3 className="emr-h3" style={{ marginBottom: 10 }}>
                A reporter quoting you beats an ad you wrote about yourself.
              </h3>
              <p className="emr-body">
                Nobody trusts the brand that says it&rsquo;s the best. They trust the journalist, the study, the third party. Earned coverage borrows that
                credibility &mdash; and it&rsquo;s the one kind of visibility a competitor can&rsquo;t simply outbid you for.
              </p>
            </div>
            <div className="emr-why-card">
              <span className="emr-why-num">03</span>
              <h3 className="emr-h3" style={{ marginBottom: 10 }}>
                The window that pays opens before the story breaks.
              </h3>
              <p className="emr-body">
                Once a topic is hot, you&rsquo;re the two-hundredth pitch. The money is in the one-to-two weeks before a story crests &mdash; visible in the
                data, not yet in the headlines. That gap is exactly what this radar measures.
              </p>
            </div>
            <div className="emr-why-card">
              <span className="emr-why-num">04</span>
              <h3 className="emr-h3" style={{ marginBottom: 10 }}>
                Earned assets compound. Paid stops dead.
              </h3>
              <p className="emr-body">
                A cited study, a linked tool, a syndicated quote keep sending you traffic, links, and authority for years. Pause an ad and the traffic vanishes
                that afternoon. One is an asset. The other is a meter running.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* § 05 — SYSTEM (ink band, 5 steps) */}
      <div className="emr-band-ink">
        <div className="emr-band-inner">
          <div className="emr-mast">
            <span className="emr-pill">§ 05</span>
            <span className="emr-scaps" style={{ color: "var(--color-paper-55)" }}>
              How it actually works
            </span>
          </div>
          <h2 className="emr-h2" style={{ color: "var(--color-paper)", maxWidth: 820 }}>
            Getting quoted is not a lottery. It is five repeatable moves.
          </h2>
          <div className="emr-steps">
            <div className="emr-step">
              <div className="emr-step-num">01 &middot; Detect</div>
              <div className="emr-step-tool">SignalIQ</div>
              <h4>Find the signal early.</h4>
              <p>Watch open, primary sources and surface the stories rising fastest, before the press catches up. It&rsquo;s the engine behind this radar.</p>
            </div>
            <div className="emr-step">
              <div className="emr-step-num">02 &middot; Build</div>
              <div className="emr-step-tool">AssetIQ</div>
              <h4>Build what reporters cite.</h4>
              <p>Turn the signal into something worth citing: a sourced data brief, a chart, a survey, a small tool. Not a press release.</p>
            </div>
            <div className="emr-step">
              <div className="emr-step-num">03 &middot; Verify</div>
              {/* FactCheckIQ is a real step in the method but not a shipped tool
                  (pulled out of the EMOS launch, 30 Jul 2026). The method stays;
                  the "coming soon" tag stops this reading as something a new
                  subscriber gets today. Drop the tag when the tool opens. */}
              <div className="emr-step-tool">
                FactCheckIQ{" "}
                <span style={{ fontWeight: 600, opacity: 0.6, letterSpacing: ".1em" }}>&middot; coming soon</span>
              </div>
              <h4>Make every claim airtight.</h4>
              <p>Pressure-test every stat and citation before you send. A reporter stakes their name on your numbers &mdash; earned, not faked, is the whole brand. This step is the method; the tool that automates it is still in build.</p>
            </div>
            <div className="emr-step">
              <div className="emr-step-num">04 &middot; Pitch</div>
              <div className="emr-step-tool">PressIQ + JournoCollabIQ</div>
              <h4>Pitch it right.</h4>
              <p>Score the pitch before it goes out, and match it to the journalist most likely to bite. Early and relevant beats late and generic.</p>
            </div>
            <div className="emr-step">
              <div className="emr-step-num">05 &middot; Track</div>
              <div className="emr-step-tool">CoverageIQ</div>
              <h4>Track and compound.</h4>
              <p>Follow the placement, the links, and the citations &mdash; then feed what worked back into the next cycle.</p>
            </div>
          </div>
          <p className="emr-throughline">
            That loop is <span className="emr-hl">EMOS</span>, the Earned Media Operating System. Run it yourself, learn it with me, or hand it over &mdash;
            that&rsquo;s the rest of this page.
          </p>
        </div>
      </div>

      {/* § 06 — LADDER */}
      <main className="emr-wrap">
        <div className="emr-mast" style={{ marginTop: 56 }}>
          <span className="emr-pill">§ 06</span>
          <span className="emr-scaps">Where do you want to start</span>
        </div>
        <h2 className="emr-h2" style={{ maxWidth: 820 }}>
          From &ldquo;let me try it myself&rdquo; to &ldquo;please just run this for me.&rdquo;
        </h2>
        <div className="emr-ladder">
          <div className="emr-lcard first">
            <span className="tier">Free &middot; DIY</span>
            <h3 className="emr-h3">The public tools</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              Point SignalIQ at your own category and watch it surface opportunities in minutes. No card, no signup wall.
            </p>
            <Link href={LINKS.signaliq} className="emr-tlink cta">
              Start with SignalIQ, free &rarr;
            </Link>
          </div>
          <div className="emr-lcard">
            <span className="tier">Software</span>
            <h3 className="emr-h3">EMOS platform</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              Run the whole play under one login: find the story, build and verify the asset, pitch the journalist, track the coverage.
            </p>
            <Link href={LINKS.emosPlatform} className="emr-tlink cta">
              See the EMOS platform &rarr;
            </Link>
          </div>
          <div className="emr-lcard">
            <span className="tier">Learn &middot; DWY</span>
            <h3 className="emr-h3">EMOS Academy</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              Build a real media presence over a guided cohort &mdash; and keep the capability for good. For founders three-to-twelve months from a raise.
            </p>
            <Link href={LINKS.emosAcademyApply} className="emr-tlink cta">
              Apply to the Academy &rarr;
            </Link>
          </div>
          <div className="emr-lcard">
            <span className="tier">Done-for-you</span>
            <h3 className="emr-h3">Earned Media Booster</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              We catch the journalist requests worth answering and get you quoted &mdash; coverage, without you living in the queries.
            </p>
            <a href={LINKS.emb} className="emr-tlink cta" target="_blank" rel="noopener">
              See Earned Media Booster &rarr;
            </a>
          </div>
          <div className="emr-lcard">
            <span className="tier">Done-for-you</span>
            <h3 className="emr-h3">Earned Media Engine</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              Original research, surveys, and tools taken to the press for Tier-1 coverage and AI citations. We manufacture the signal instead of waiting.
            </p>
            <a href={LINKS.eme} className="emr-tlink cta" target="_blank" rel="noopener">
              See the Earned Media Engine &rarr;
            </a>
          </div>
          <div className="emr-lcard primary">
            <span className="tier">Leadership</span>
            <h3 className="emr-h3">Fractional CMO + audit</h3>
            <p className="emr-body" style={{ fontSize: 14.5 }}>
              Hand marketing leadership to the operator who built this radar. Start with a two-week Marketing Leadership Audit; move to the retainer and it
              credits back in full.
            </p>
            <Link href={LINKS.book} className="emr-btn-yellow cta">
              Book a discovery call
            </Link>
          </div>
        </div>
      </main>

      {/* § 07 — PROOF (ink band) */}
      <div className="emr-band-ink" style={{ marginTop: 60 }}>
        <div className="emr-band-inner">
          <div className="emr-mast">
            <span className="emr-pill">§ 07</span>
            <span className="emr-scaps" style={{ color: "var(--color-paper-55)" }}>
              This is not theory
            </span>
          </div>
          <h2 className="emr-h2" style={{ color: "var(--color-paper)", maxWidth: 800 }}>
            I&rsquo;ve spent over a decade on both sides of the journalist&rsquo;s inbox.
          </h2>
          <div className="emr-logos" style={{ marginTop: 18 }}>
            Forbes &nbsp;&middot;&nbsp; Harvard Business Review &nbsp;&middot;&nbsp; Business Insider &nbsp;&middot;&nbsp; Entrepreneur &nbsp;&middot;&nbsp; Yahoo
            &nbsp;&middot;&nbsp; MarketWatch &nbsp;&middot;&nbsp; MSN &nbsp;&middot;&nbsp; World Bank &nbsp;&middot;&nbsp; SEMrush &nbsp;&middot;&nbsp; Ahrefs
          </div>
          <div className="emr-stats">
            {[
              { n: "0 → 1.5M", c: "Monthly visitors · Ridester" },
              { n: "160K → 1.2M", c: "Monthly revenue · National Tyres" },
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
            Not a titled ex-CMO, and I&rsquo;d rather say that plainly than let three letters imply something they haven&rsquo;t earned. An operator: 22 years
            building companies since 2004, 13 of them running DMR.agency &mdash; the same team behind every result here.
          </p>
          <p style={{ marginTop: 20 }}>
            <span className="emr-pill">2 CMO spots open &middot; Q3 2026</span>
          </p>
        </div>
      </div>

      {/* FINAL */}
      <main className="emr-wrap" style={{ paddingBottom: 64 }}>
        <section className="emr-final">
          <h2 className="emr-h2">Stop renting attention. Start earning it.</h2>
          <p className="emr-body-lg" style={{ margin: "16px 0 24px" }}>
            The reporters and the AI engines your buyers trust are writing tomorrow&rsquo;s answers from today&rsquo;s data. This radar reads the same data. The
            only question is whether you watch it yourself, learn to work it, or hand it to someone who does this for a living.
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
            I built all of this on one rule: earned media is earned, not faked. The radar shows real signals in real data &mdash; real article volumes counted
            daily from open news, never a prediction dressed up as a fact. And I&rsquo;ll never sell you a tool that spends the credibility you&rsquo;re trying
            to build. That is the whole point.
            <span className="sign">Syed Irfan Ajmal</span>
          </div>
        </section>

        <div className="emr-ticker" aria-hidden="true">
          <div className="emr-ticker-lbl">Headline insights</div>
          <div className="emr-ticker-track">
            {ticker.concat(ticker).map((t, i) => (
              <span key={i}>
                <span className="d">&#9670;</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </main>

      <Colophon />
    </>
  );
}

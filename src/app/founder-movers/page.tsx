import type { Metadata } from "next";
import Link from "next/link";
import { getMoversData } from "@/lib/movers/data";
import { pctInt, fmtK, sparkline, type MoverTopic } from "@/lib/movers/types";
import { displayTopic } from "@/lib/topics/display";
import { Colophon } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import "./movers.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

export const metadata: Metadata = {
  title: "Founder Movers",
  description:
    "This week's biggest movers in press coverage across founder and Series-A topics — what's heating up, and what's cooling. Powered by SignalIQ.",
  alternates: { canonical: "/founder-movers" },
  openGraph: {
    title: "Founder Movers · Syed Irfan Ajmal",
    description:
      "This week's biggest movers in press coverage across founder / Series-A topics. Powered by SignalIQ.",
    url: "/founder-movers",
  },
};

const LINKS = {
  book: "/strategy-call",
  signaliq: "/tools/signaliq",
  radar: "/earned-media-radar",
  emosAcademyApply: "/emos-academy/apply",
};

function Spark({ series }: { series: number[] }) {
  const p = sparkline(series);
  if (!p) return null;
  return (
    <svg className="mvr-spark" viewBox="0 0 92 26" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={p.line} />
    </svg>
  );
}

/** One row of the diverging (tornado) chart: bar grows right in amber for rising
 *  topics, left in ink for cooling ones, from a shared center 0% line, with a
 *  4-week sparkline and the weekly article count + change. */
function TornadoRow({ t, maxAbs }: { t: MoverTopic; maxAbs: number }) {
  const up = t.wow >= 0;
  const half = maxAbs > 0 ? Math.min(48, (Math.abs(t.wow) / maxAbs) * 48) : 0;
  return (
    <div className="mvr-trow">
      <div className="mvr-tlabel">{displayTopic(t.topic)}</div>
      <div className="mvr-ttrack">
        <span className={"mvr-tbar " + (up ? "up" : "down")} style={{ width: half + "%" }} />
      </div>
      <Spark series={t.series} />
      <div className="mvr-tval">
        {fmtK(t.last7)} · {up ? "▲" : "▼"} {pctInt(t.wow)}
      </div>
    </div>
  );
}

export default async function MoversPage() {
  const data = await getMoversData();
  // One ranked column, most-rising at the top to most-cooling at the bottom.
  const movers = [...data.risers, ...data.coolers].sort((a, b) => b.wow - a.wow);
  const maxAbs = movers.length ? Math.max(...movers.map((m) => Math.abs(m.wow))) : 1;
  const biggest = movers.length ? movers.reduce((a, b) => (Math.abs(b.wow) > Math.abs(a.wow) ? b : a)) : null;
  const topRise = data.risers[0] ?? null;
  const topCool = data.coolers[0] ?? null;
  const live = data.covered > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Founder Movers",
    url: "https://www.syedirfanajmal.com/founder-movers",
    description:
      "This week's biggest movers in press coverage across founder / Series-A topics, powered by SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  const statTiles = [
    biggest
      ? {
          num: `${biggest.wow >= 0 ? "▲" : "▼"} ${pctInt(biggest.wow)}`,
          lbl: `Biggest mover · ${displayTopic(biggest.topic)}`,
        }
      : { num: String(data.covered), lbl: "Founder topics tracked" },
    { num: String(data.heatingCount), lbl: "Heating up this week" },
    { num: String(data.coolingCount), lbl: "Cooling down" },
    { num: fmtK(data.totalLast7), lbl: "Articles · last 7 days" },
  ];

  const tickerItems = movers.map((t) => `${displayTopic(t.topic)} ${t.wow >= 0 ? "▲" : "▼"} ${pctInt(t.wow)}`);

  return (
    <>
      <main className="emr-wrap">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* HERO */}
        <section className="emr-hero">
          <div className="emr-scaps">Live · Founder Movers</div>
          <h1 className="emr-h1">This week&apos;s biggest movers in press coverage.</h1>
          {live && topRise && topCool ? (
            <p className="emr-body-lg mvr-lede">
              This week, <strong>{displayTopic(topRise.topic)}</strong> is breaking out — coverage up{" "}
              <strong>{pctInt(topRise.wow)}</strong> — while <strong>{displayTopic(topCool.topic)}</strong> went quiet at{" "}
              <strong>{pctInt(topCool.wow)}</strong>: an open lane.
            </p>
          ) : (
            <p className="emr-body-lg mvr-lede">
              Every day, SignalIQ counts how much the press covers the topics a Series-A founder builds authority around.
              This is the weekly read: what is heating up to ride now, and what has gone quiet to own.
            </p>
          )}
          <div className="emr-cta-row">
            <Link href={LINKS.signaliq} className="emr-btn-yellow">
              Scan your own category, free
            </Link>
            <Link href={LINKS.emosAcademyApply} className="emr-tlink">
              or learn the system in the Academy
            </Link>
          </div>
          <p className="emr-micro">
            {live
              ? `Live from SignalIQ · coverage through ${data.asOf} · ${data.covered} founder topics · ${fmtK(
                  data.totalLast7,
                )} articles in the last 7 days`
              : "Warming up — the coverage scan is populating this board. Check back shortly."}
          </p>
        </section>

        {/* TICKER (motion) */}
        {tickerItems.length > 0 && (
          <div className="emr-ticker" aria-hidden="true">
            <div className="emr-ticker-lbl">This week</div>
            <div className="emr-ticker-track">
              {tickerItems.concat(tickerItems).map((s, i) => (
                <span key={i}>
                  <span className="emr-diamond">&#9670;</span>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STATS (biggest mover leads) */}
        <div className="mvr-stats">
          {statTiles.map((s) => (
            <div className="mvr-stat" key={s.lbl}>
              <div className="mvr-stat-num">{s.num}</div>
              <div className="mvr-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* MOVERS — diverging centerpiece */}
        {movers.length ? (
          <div className="mvr-tornado">
            <div className="mvr-tornado-head">
              <span className="emr-scaps">This week&apos;s movers</span>
              <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
                {data.heatingCount} up · {data.coolingCount} down
              </span>
            </div>
            <div className="mvr-tornado-mid">
              <span>&larr; cooling</span>
              <span>heating &rarr;</span>
            </div>
            {movers.map((t) => (
              <TornadoRow key={t.topic} t={t} maxAbs={maxAbs} />
            ))}
          </div>
        ) : (
          <p className="mvr-note" style={{ padding: "8px 0 20px" }}>
            Nothing clearly moving yet — check back after the next daily scan.
          </p>
        )}

        {/* BREAKING NOW: spikes */}
        <div className="emr-panel">
          <div className="emr-panel-head">
            <span className="emr-scaps">Breaking now</span>
            <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
              vs a normal day
            </span>
          </div>
          <div className="emr-panel-body">
            {data.spikes.length ? (
              data.spikes.map((t) => (
                <div className="mvr-spikerow" key={t.topic}>
                  <span className="mvr-name">{displayTopic(t.topic)}</span>
                  <Spark series={t.series} />
                  <span className="mvr-meta">
                    {Math.round(t.lastDay)} today · {t.avgDay.toFixed(0)}/day avg
                  </span>
                  <span className="mvr-z">{(t.avgDay > 0 ? t.lastDay / t.avgDay : 0).toFixed(1)}×</span>
                </div>
              ))
            ) : (
              <p className="mvr-note">No unusual single-day spikes right now.</p>
            )}
          </div>
        </div>

        {/* HOW TO USE IT — one line */}
        <section className="emr-section">
          <div className="emr-scaps">How to use it</div>
          <p className="emr-body-lg emr-italic" style={{ margin: "10px 0 0", maxWidth: 820 }}>
            Pitch into what is heating up while reporters are still hunting for sources, and quietly own what has gone cold
            before anyone else claims it. Momentum is a 7-day-versus-prior-7-day change in real press coverage, refreshed
            daily — early signals, not predictions, and every one traces back to its source.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="emr-final">
          <h2 className="emr-h2">Stop guessing what to post about. Read the board.</h2>
          <p className="emr-body-lg" style={{ margin: "16px 0 24px" }}>
            The founders who compound attention are not louder. They are earlier. Scan your own category free, or learn to
            run the whole loop with me in the Academy.
          </p>
          <Link href={LINKS.signaliq} className="emr-btn-yellow">
            Scan your category, free
          </Link>
          <div className="emr-secondary-links">
            <Link href={LINKS.radar} className="emr-tlink">
              See the full Earned Media Radar
            </Link>
            <Link href={LINKS.emosAcademyApply} className="emr-tlink">
              Apply to the Academy
            </Link>
            <Link href={LINKS.book} className="emr-tlink">
              Book a discovery call
            </Link>
          </div>
        </section>
      </main>

      <Colophon />
      <ScrollButtons />
    </>
  );
}

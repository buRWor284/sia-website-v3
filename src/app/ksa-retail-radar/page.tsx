import type { Metadata } from "next";
import Link from "next/link";
import { getRetailRadarData } from "@/lib/ksa-retail/data";
import { Colophon } from "@/components/bureau";
import RetailRadarModule from "./RetailRadarModule";
import { KPIS, SRC_GROUPS, TALKS, VERDICT_META } from "./content";
import type { RetailRadarData } from "@/lib/ksa-retail/types";
import "./ksa-retail-radar.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

// Public since 2026-08-11 (same day it shipped): linked from the nav (Earned
// Media dropdown), the /resources ledger (Radars group, Saudi Arabia topic),
// the footer Live Radars column, the RadarCallout "Also live" strip, the
// earned-media-ai speaking pages, and the sitemap. Built 2026-08-10 as a
// direct-URL pitch prop for the KSA speaking circuit (Seamless, Athar, the
// Riyadh workshop).
export const metadata: Metadata = {
  title: "KSA Retail & Consumer Radar",
  description:
    "25 sourced signals on Saudi Arabia's consumer economy: e-commerce and delivery, retail groups and brands, lifestyle retail, and the macro picture. Curated from official statistics and named reports, wired to live press-coverage data via SignalIQ.",
  alternates: { canonical: "/ksa-retail-radar" },
  openGraph: {
    title: "KSA Retail & Consumer Radar · Syed Irfan Ajmal",
    description: "A consumer economy approaching $294B with thin English coverage in monitored sources (SignalIQ x GDELT). Live coverage data shows exactly where the gaps are.",
    url: "/ksa-retail-radar",
  },
};

const LINKS = {
  book: "/strategy-call",
  session: "/speaking/earned-media-ai",
  globalRadar: "/earned-media-radar",
  tourismRadar: "/ksa-tourism-radar",
  signaliq: "/tools/signaliq",
};

/** The Window — every tracked topic plotted by press volume (x, log) and 30v30
 *  momentum (y), from the live SignalIQ wire. Quadrant boundaries: the tracked
 *  set's median volume, and +10% momentum. Server-rendered SVG, no client JS. */
function TheWindow({ live }: { live: RetailRadarData }) {
  if (!live.hasData || live.topics.length === 0) {
    return <p className="krr-micro">The window plots every tracked topic by press volume and momentum once the live wire has data.</p>;
  }
  const W = 860;
  const H = 486;
  const L = 64;
  const T = 34;
  const pw = W - L - 24;
  const ph = H - T - 80;
  const maxN = Math.max(...live.topics.map((t) => t.n), 10);
  const ns = live.topics.map((t) => t.n).sort((a, b) => a - b);
  const mid = Math.floor(ns.length / 2);
  const median = ns.length % 2 ? ns[mid] : (ns[mid - 1] + ns[mid]) / 2;
  const X = (n: number) => L + (Math.log10(n + 1) / Math.log10(maxN + 1)) * pw;
  const Y = (tr: number) => {
    const c = Math.max(-0.5, Math.min(0.5, tr));
    return T + ph / 2 - (c / 0.5) * (ph / 2 - 10);
  };
  const vx = X(Math.max(median, 1));
  const hy = Y(0.1);
  const LABELED = new Set(["salla", "jahez", "alshaya", "jarir", "savvy games", "saudi retail", "white friday", "saudi e-commerce", "bindawood"]);
  return (
    <div className="krr-window">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Scatter of the tracked Saudi retail topics by press volume (log scale) and 30-day momentum, split into four zones: early window, newsjack, check the demand, and late."
      >
        <rect x={L} y={T} width={Math.max(vx - L, 0)} height={Math.max(hy - T, 0)} fill="#f5b81f" opacity={0.13} />
        <rect x={vx} y={T} width={Math.max(L + pw - vx, 0)} height={Math.max(hy - T, 0)} fill="#1a1410" opacity={0.05} />
        <rect x={L} y={hy} width={Math.max(vx - L, 0)} height={Math.max(T + ph - hy, 0)} fill="#1a1410" opacity={0.02} />
        <rect x={L} y={T} width={pw} height={ph} fill="none" stroke="rgba(26,20,16,.35)" />
        <line x1={vx} y1={T} x2={vx} y2={T + ph} stroke="rgba(26,20,16,.45)" />
        <line x1={L} y1={hy} x2={L + pw} y2={hy} stroke="rgba(26,20,16,.45)" />
        <text x={L + 10} y={T + 18} className="zl">EARLY WINDOW · OWN IT NOW</text>
        <text x={L + pw - 10} y={T + 18} textAnchor="end" className="zl">NEWSJACK · DATA ANGLE, FAST</text>
        <text x={L + 10} y={T + ph + 15} className="zl">CHECK THE DEMAND · WHITESPACE OR DORMANT</text>
        <text x={L + pw - 10} y={T + ph + 15} textAnchor="end" className="zl">LATE · WAIT FOR THE CATALYST</text>
        <text x={L + pw / 2} y={H - 18} textAnchor="middle" className="ax">press volume · articles, log scale →</text>
        <text x={14} y={T - 12} className="ax">↑ momentum · 30d vs prior 30d</text>
        <text x={vx} y={T + ph + 34} textAnchor="middle" className="axm">set median</text>
        <text x={L + pw - 6} y={hy - 6} textAnchor="end" className="axm">+10% = rising</text>
        {live.topics.map((t) => {
          const x = X(t.n);
          const y = Y(t.tr);
          const ecom = t.lens === "ecom";
          const flip = x > L + pw - 96;
          return (
            <g key={t.topic}>
              <circle cx={x} cy={y} r={5.5} fill={ecom ? "#f5b81f" : "#1a1410"} stroke={ecom ? "#1a1410" : "#f1ebde"} strokeWidth={1.2}>
                <title>{`${t.topic} · ${t.n.toLocaleString()} articles · ${(t.tr * 100).toFixed(1)}% 30v30`}</title>
              </circle>
              {LABELED.has(t.topic) ? (
                <text x={x + (flip ? -9 : 9)} y={y + 4} textAnchor={flip ? "end" : "start"} className="dl">
                  {t.topic}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="krr-window-rules">
        Three rules, one read. <b>Volume</b> says how crowded a story is (the boundary is this set&rsquo;s median). <b>Momentum</b> says which way it is
        moving. <b>Demand</b>, the revenue, transactions, and dated catalysts in each signal file, says whether quiet means opportunity or nothing. Quiet
        plus demand is whitespace you can own. Loud plus rising is a newsjack you enter fast, with data. Loud plus flat means wait for the next catalyst.
        In this category most dots sit left of the median: that is not a failure of the market, it is the finding. A $294B consumer economy is trading
        every day while the English press file in monitored sources (SignalIQ x GDELT) stays thin, and each quiet dot with a demand line is a story someone gets to own first.
      </p>
      <div className="krr-verdict-legend">
        {(["early", "whitespace", "newsjack", "late", "dormant", "recal"] as const).map((k) => (
          <span key={k}>
            <span className={"krr-verdict v-" + VERDICT_META[k].tone}>{VERDICT_META[k].label}</span> {VERDICT_META[k].note}
          </span>
        ))}
      </div>
      <p className="krr-micro" style={{ marginTop: 10 }}>
        One topic is tracked deliberately as a calibration control: bindawood{" "}
        <span className="krr-info" title="BinDawood Holding is a real Tadawul-listed grocer with a near SAR 2 billion quarterly run rate. It is tracked without a curated demand file precisely so the instrument can demonstrate a DORMANT reading: quiet press plus no demand file on this page equals no call.">(i)</span>, a Tadawul-listed grocer whose English press file is close to empty. It should read DORMANT,
        because dormant means quiet with no demand signal on file, and no demand file is kept for it here. A radar that can say no is the point. Dots
        under 12 articles: the momentum axis is noise-prone there, and verdicts ignore it.
      </p>
    </div>
  );
}

export default async function RetailRadarPage() {
  const live = await getRetailRadarData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "KSA Retail & Consumer Radar",
    url: "https://www.syedirfanajmal.com/ksa-retail-radar",
    description:
      "25 sourced signals on Saudi Arabia's consumer economy across e-commerce and delivery, retail groups and brands, lifestyle retail, and the macro picture, with live press-coverage data via SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="krr-wrap">
        {/* HERO */}
        <section className="krr-hero">
          <div className="krr-hero-lead">
            <div className="krr-scaps">Signal Radar · KSA Retail Edition · إصدار التجزئة السعودية</div>
            <h1 className="krr-h1">KSA Retail &amp; Consumer Radar</h1>
            <p className="krr-hero-sub">
              Twenty-five Saudi retail and consumer signals, one live instrument: a consumer economy approaching $294B, where English coverage stays thin
              in monitored sources (SignalIQ x GDELT), and exactly where the open stories are.
            </p>
          </div>
        </section>

        <div className="krr-double" />

        {/* § 01 — THE RADAR (lead with the live instrument, above the fold) */}
        <div className="krr-mast">
          <span className="krr-pill">§ 01</span>
          <h2 className="krr-h3">The radar · 25 signals, 4 lenses, 3 horizons</h2>
          <span className="krr-freshness">{live.hasData ? `live data as of ${live.asOf}` : "curated layer live · wire pending"}</span>
        </div>
        <RetailRadarModule live={live} />

        <div className="krr-metastrip">
          <span>
            Curated layer as of 10 Aug 2026 · SignalIQ × GDELT BigQuery{live.hasData ? ` · data as of ${live.asOf}` : " · wire pending"}
          </span>
          <span>
            SAUDI RETAIL MARKET · <b>$293.6B (2025)</b> heading to $411.7B by 2034 ·{" "}
            <a href="https://www.imarcgroup.com/saudi-arabia-retail-market" target="_blank" rel="noopener noreferrer">
              IMARC Group ↗
            </a>
          </span>
        </div>

        {/* § 02 — THE WINDOW (the methodology, visible) */}
        <div className="krr-mast" style={{ marginTop: 46 }}>
          <span className="krr-pill">§ 02</span>
          <h2 className="krr-h3">The window · how ownable gets called</h2>
        </div>
        <TheWindow live={live} />

        {/* § 03 — AUTHORITY KPIs */}
        <div className="krr-mast" style={{ marginTop: 48 }}>
          <span className="krr-pill">§ 03</span>
          <span className="krr-scaps">The size of the prize</span>
        </div>
        <div className="krr-kpis-band" style={{ marginTop: 0 }}>
          <div className="krr-kpis">
            {KPIS.map((k) => (
              <div className="krr-kpi" key={k.lbl}>
                <div className="krr-kpi-label">{k.lbl}</div>
                <div className="krr-kpi-val">{k.val}</div>
                {k.delta ? <div className="krr-kpi-delta krr-up">{k.delta}</div> : null}
                <div className="krr-kpi-sub">{k.sub}</div>
                <div className="krr-kpi-src">
                  {k.src.map((s) => (
                    <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer">
                      {s.t} ↗
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="krr-honesty">
          <b>Read this first.</b> This is a curated intelligence layer: official statistics and named reports, compiled 10 Aug 2026, each figure linked to
          its source. Status badges reflect July and August 2026 news activity, assessed editorially. Unlike the tourism edition, most topics here sit
          under the low-sample floor in global English press as measured in monitored sources (SignalIQ x GDELT), and the page says so instead of dressing it up: thin coverage against a $294B market is
          precisely the whitespace argument. The daily-refreshing SignalIQ wire adds Arabic and English press volume per topic in the live-wire band above.
        </div>

      </main>

      {/* § 04 — TALKS (ink band) */}
      <div className="krr-band-ink">
        <div className="krr-band-inner">
          <div className="krr-mast">
            <span className="krr-pill">§ 04</span>
            <span className="krr-scaps" style={{ color: "var(--color-paper-55)" }}>
              Talks this radar powers
            </span>
          </div>
          <h2 className="krr-h2" style={{ color: "var(--color-paper)", maxWidth: 860 }}>
            Sessions built on sourced market intelligence, not recycled slideware.
          </h2>
          <div className="krr-talks">
            {TALKS.map((t) => (
              <div className="krr-talk" key={t.n}>
                <div className="krr-talk-num">Talk 0{t.n}</div>
                <h3>{t.t}</h3>
                <p className="sub">{t.s}</p>
                <p className="body">{t.p}</p>
                <div className="fmt">
                  {t.fmt.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
                <p className="ev">{t.ev}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* § 05 — SPEAKER */}
      <main className="krr-wrap" style={{ paddingBottom: 64 }}>
        {/* teaser: radar -> the pitched session */}
        <div style={{ border: "1px solid rgba(26,20,16,.18)", borderLeft: "3px solid #f5b81f", padding: "22px 26px", margin: "40px 0 24px", display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <span className="krr-scaps">The session this radar powers</span>
            <h3 className="krr-h3" style={{ margin: "6px 0 8px" }}>Earned Media in the AI Era</h3>
            <p className="krr-body-sm" style={{ margin: 0 }}>
              The keynote, workshop, and panel built on this radar&rsquo;s live data. Tuned for retailers, e-commerce operators, payment platforms, and the
              agencies that serve them.
            </p>
          </div>
          <Link href={LINKS.session} className="krr-btn-yellow">
            See the session
          </Link>
        </div>
        <section className="krr-final">
          <div className="krr-scaps">Speaker · Syed Irfan Ajmal</div>
          <h2 className="krr-h2" style={{ margin: "14px 0 16px" }}>
            Bring the radar to your stage.
          </h2>
          <p className="krr-body-lg" style={{ margin: "0 0 24px" }}>
            Earned-media strategist and builder of the EMOS suite (SignalIQ, PressIQ, CoverageIQ, FactCheckIQ). 300+ clients, mostly American brands, plus
            Gulf-government work through DinarStandard. Profiled as a case study in Harvard Business Review, quoted in Forbes (US); bylines in Forbes Middle East. Available for
            keynotes, masterclasses, and panels across KSA, Sep-Nov 2026.
          </p>
          <div className="krr-cta-row">
            <Link href={LINKS.book} className="krr-btn-yellow">
              Book a speaker call
            </Link>
            <Link href={LINKS.tourismRadar} className="krr-tlink">
              the sibling tourism radar
            </Link>
            <Link href={LINKS.globalRadar} className="krr-tlink">
              the live global radar
            </Link>
          </div>
        </section>

        {/* SOURCES */}
        <section className="krr-sources">
          <details className="krr-src-details">
            <summary>
              <span className="krr-pill">Sources</span>
              <span className="krr-scaps">every figure on this page · {SRC_GROUPS.reduce((n, g) => n + g.links.length, 0)} links</span>
            </summary>
            <div className="krr-srcflow">
              {SRC_GROUPS.map((g) => (
                <p key={g.h}>
                  <b>{g.h}</b>
                  {g.links.map((l) => (
                    <a key={l.u} href={l.u} target="_blank" rel="noopener noreferrer">
                      {l.t} ↗
                    </a>
                  ))}
                </p>
              ))}
            </div>
          </details>
          <p className="krr-micro" style={{ marginTop: 18 }}>
            Method: curated layer compiled 10 Aug 2026 from official statistics and named reports. Live layer: SignalIQ × GDELT Web News NGrams via
            BigQuery, refreshed daily. Counts are exact-phrase and multilingual, so brand variants can undercount; verdicts are relative to the tracked
            set and survive systematic undercounting.
          </p>
        </section>
      </main>

      <Colophon />
    </>
  );
}

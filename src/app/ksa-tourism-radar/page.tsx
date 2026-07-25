import type { Metadata } from "next";
import Link from "next/link";
import { getKsaRadarData } from "@/lib/ksa-radar/data";
import { Colophon } from "@/components/bureau";
import KsaRadarModule from "./KsaRadarModule";
import { GAPS, KPIS, SPARK_SERIES, SRC_GROUPS, TALKS, VERDICT_META } from "./content";
import type { KsaRadarData } from "@/lib/ksa-radar/types";
import "./ksa-radar.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

// Deliberately unlinked: no nav entry, no sitemap entry (pitch-prop page for
// the KSA speaking circuit, Sep-Nov 2026). Direct URL only, like
// /speaking/earned-media-ai/travel.
export const metadata: Metadata = {
  title: "KSA Tourism & Hospitality Radar",
  description:
    "28 sourced signals on Saudi tourism: giga-projects, mega-events, hospitality and aviation, and faith travel. Curated from official statistics and named industry reports, wired to live press-coverage data via SignalIQ.",
  alternates: { canonical: "/ksa-tourism-radar" },
  openGraph: {
    title: "KSA Tourism & Hospitality Radar · Syed Irfan Ajmal",
    description: "What is moving in Saudi tourism now, what is building toward 2030, and which narratives nobody owns yet. Every number links to its source.",
    url: "/ksa-tourism-radar",
  },
};

const LINKS = {
  book: "/strategy-call",
  session: "/speaking/earned-media-ai/travel",
  globalRadar: "/earned-media-radar",
  signaliq: "/tools/signaliq",
};

/** Tiny server-rendered sparkline for the visitors KPI (real 2019-2025 series). */
function VisitorsSpark() {
  const { years, vals } = SPARK_SERIES;
  const w = 150;
  const h = 40;
  const mx = Math.max(...vals);
  const pts = vals
    .map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - 4 - (v / mx) * (h - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      className="ksr-kpi-spark"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Inbound visitors by year, ${years[0]} to ${years[years.length - 1]}, millions: ${vals.join(", ")}`}
    >
      <polyline points={pts} fill="none" stroke="#1a1410" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={h - 4 - (vals[vals.length - 1] / mx) * (h - 8)} r={3.4} fill="#f5b81f" stroke="#1a1410" strokeWidth={1} />
    </svg>
  );
}


/** The Window — every tracked topic plotted by press volume (x, log) and 30v30
 *  momentum (y), from the live SignalIQ wire. Quadrant boundaries: the tracked
 *  set's median volume, and +10% momentum. Server-rendered SVG, no client JS. */
function TheWindow({ live }: { live: KsaRadarData }) {
  if (!live.hasData || live.topics.length === 0) {
    return <p className="ksr-micro">The window plots every tracked topic by press volume and momentum once the live wire has data.</p>;
  }
  const W = 860;
  const H = 470;
  const L = 64;
  const T = 34;
  const pw = W - L - 24;
  const ph = H - T - 64;
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
  const LABELED = new Set(["hajj", "umrah", "riyadh air", "neom", "alula", "expo 2030", "soudah peaks", "nusuk", "sharqiah season"]);
  return (
    <div className="ksr-window">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Scatter of the tracked Saudi tourism topics by press volume (log scale) and 30-day momentum, split into four zones: early window, newsjack, check the demand, and late."
      >
        <rect x={L} y={T} width={Math.max(vx - L, 0)} height={Math.max(hy - T, 0)} fill="#f5b81f" opacity={0.13} />
        <rect x={vx} y={T} width={Math.max(L + pw - vx, 0)} height={Math.max(hy - T, 0)} fill="#1a1410" opacity={0.05} />
        <rect x={L} y={hy} width={Math.max(vx - L, 0)} height={Math.max(T + ph - hy, 0)} fill="#1a1410" opacity={0.02} />
        <rect x={L} y={T} width={pw} height={ph} fill="none" stroke="rgba(26,20,16,.35)" />
        <line x1={vx} y1={T} x2={vx} y2={T + ph} stroke="rgba(26,20,16,.45)" />
        <line x1={L} y1={hy} x2={L + pw} y2={hy} stroke="rgba(26,20,16,.45)" />
        <text x={L + 10} y={T + 18} className="zl">EARLY WINDOW · OWN IT NOW</text>
        <text x={L + pw - 10} y={T + 18} textAnchor="end" className="zl">NEWSJACK · DATA ANGLE, FAST</text>
        <text x={L + 10} y={T + ph - 10} className="zl">CHECK THE DEMAND · WHITESPACE OR DORMANT</text>
        <text x={L + pw - 10} y={T + ph - 10} textAnchor="end" className="zl">LATE · WAIT FOR THE CATALYST</text>
        <text x={L + pw / 2} y={H - 18} textAnchor="middle" className="ax">press volume · articles, log scale →</text>
        <text x={14} y={T - 12} className="ax">↑ momentum · 30d vs prior 30d</text>
        <text x={vx} y={T + ph + 16} textAnchor="middle" className="axm">set median</text>
        <text x={L + pw - 6} y={hy - 6} textAnchor="end" className="axm">+10% = rising</text>
        {live.topics.map((t) => {
          const x = X(t.n);
          const y = Y(t.tr);
          const faith = t.lens === "faith";
          const flip = x > L + pw - 96;
          return (
            <g key={t.topic}>
              <circle cx={x} cy={y} r={5.5} fill={faith ? "#f5b81f" : "#1a1410"} stroke={faith ? "#1a1410" : "#f1ebde"} strokeWidth={1.2}>
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
      <p className="ksr-window-rules">
        Three rules, one read. <b>Volume</b> says how crowded a story is (the boundary is this set&rsquo;s median). <b>Momentum</b> says which way it is
        moving. <b>Demand</b>, the committed capital, real visitors, and dated catalysts in each signal file, says whether quiet means opportunity or
        nothing. Quiet plus demand is whitespace you can own. Loud plus rising is a newsjack you enter fast, with data. Loud plus flat means wait for the
        next catalyst. Think of a quiet topic with real demand like a stock with strong revenue and no analyst coverage: the silence is a lag you can
        profit from, not a verdict on the company.
      </p>
      <div className="ksr-verdict-legend">
        {(["early", "whitespace", "newsjack", "late", "dormant", "recal"] as const).map((k) => (
          <span key={k}>
            <span className={"ksr-verdict v-" + VERDICT_META[k].tone}>{VERDICT_META[k].label}</span> {VERDICT_META[k].note}
          </span>
        ))}
      </div>
      <p className="ksr-micro" style={{ marginTop: 10 }}>
        One topic is tracked deliberately as a calibration control: sharqiah season{" "}
        <span className="ksr-info" title="Its siblings still run: Riyadh Season and Diriyah Season carry the Saudi Season format forward. A dormant sibling is a sharper control than an obscure topic.">(i)</span>, a 2019 Saudi Season with no announced return. It should read DORMANT,
        and in an open market scan most quiet topics would look like it. Everything else here was curated because reality is moving in it. Dots under{" "}
        12 articles: the momentum axis is noise-prone there, and verdicts ignore it.
      </p>
    </div>
  );
}

export default async function KsaRadarPage() {
  const live = await getKsaRadarData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "KSA Tourism & Hospitality Radar",
    url: "https://www.syedirfanajmal.com/ksa-tourism-radar",
    description:
      "28 sourced signals on Saudi tourism across giga-projects, mega-events, hospitality and aviation, and faith travel, with live press-coverage data via SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="ksr-wrap">
        {/* HERO */}
        <section className="ksr-hero">
          <div className="ksr-hero-lead">
            <div className="ksr-scaps">Signal Radar · KSA Edition · إصدار المملكة العربية السعودية</div>
            <h1 className="ksr-h1">KSA Tourism &amp; Hospitality Radar</h1>
            <p className="ksr-hero-sub">
              Twenty-eight Saudi tourism signals, one live instrument: what is moving now, what is building toward 2030, and which stories nobody owns yet.
            </p>
          </div>
        </section>

        <div className="ksr-double" />

        {/* § 01 — THE RADAR (lead with the live instrument, above the fold) */}
        <div className="ksr-mast">
          <span className="ksr-pill">§ 01</span>
          <h2 className="ksr-h3">The radar · 28 signals, 4 lenses, 3 horizons</h2>
          <span className="ksr-freshness">{live.hasData ? `live data as of ${live.asOf}` : "curated layer live · wire pending"}</span>
        </div>
        <KsaRadarModule live={live} />

        <div className="ksr-metastrip">
          <span>
            Curated layer as of 24 Jul 2026 · SignalIQ × GDELT BigQuery{live.hasData ? ` · data as of ${live.asOf}` : " · wire pending"}
          </span>
          <span>
            VISION 2030 TARGET · <b>150M visits/yr</b> (70M international + 80M domestic) ·{" "}
            <a href="https://www.sta.gov.sa/en/vision2030" target="_blank" rel="noopener noreferrer">
              Saudi Tourism Authority ↗
            </a>
          </span>
        </div>

        {/* § 02 — THE WINDOW (the methodology, visible) */}
        <div className="ksr-mast" style={{ marginTop: 46 }}>
          <span className="ksr-pill">§ 02</span>
          <h2 className="ksr-h3">The window · how ownable gets called</h2>
        </div>
        <TheWindow live={live} />

        {/* § 03 — AUTHORITY KPIs */}
        <div className="ksr-mast" style={{ marginTop: 48 }}>
          <span className="ksr-pill">§ 03</span>
          <span className="ksr-scaps">The size of the prize</span>
        </div>
        <div className="ksr-kpis-band" style={{ marginTop: 0 }}>
          <div className="ksr-kpis">
            {KPIS.map((k) => (
              <div className="ksr-kpi" key={k.lbl}>
                <div className="ksr-kpi-label">{k.lbl}</div>
                <div className="ksr-kpi-val">{k.val}</div>
                {k.delta ? <div className="ksr-kpi-delta ksr-up">{k.delta}</div> : null}
                <div className="ksr-kpi-sub">{k.sub}</div>
                {k.spark ? <VisitorsSpark /> : null}
                <div className="ksr-kpi-src">
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
        <div className="ksr-honesty">
          <b>Read this first.</b> This is a curated intelligence layer: official statistics and named industry reports, compiled 24 Jul 2026, each figure
          linked to its source. Status badges reflect July 2026 news activity, assessed editorially. The recalibrations are shown as-is (NEOM&rsquo;s pause,
          the Mukaab retender, the 2026 F1 and Esports World Cup moves) because a radar that only blinks green is decoration, not intelligence. The
          daily-refreshing SignalIQ wire adds Arabic and English press volume per topic in the live-wire band below.
        </div>

      </main>

      {/* § 03 — OWNABLE NARRATIVES (paper-2 band) */}
      <div className="ksr-band-p2">
        <div className="ksr-band-inner">
          <div className="ksr-mast">
            <span className="ksr-pill">§ 04</span>
            <span className="ksr-scaps">Ownable narratives · the coverage gaps</span>
          </div>
          <h2 className="ksr-h2" style={{ maxWidth: 820 }}>
            The angles nobody in this market has claimed yet.
          </h2>
          <p className="ksr-body" style={{ maxWidth: 720, marginTop: 10 }}>
            Under-covered relative to their weight, as of July 2026. In earned media the gap is the opportunity: these are the stories a speaker, a
            destination, or a brand can still own.
          </p>
          <div className="ksr-gapgrid">
            {GAPS.map((g) => (
              <div className="ksr-gapcard" key={g.n}>
                <span className="ksr-gapnum">
                  GAP {g.n} → feeds talk 0{g.talk}
                </span>
                <h3 className="ksr-h3">{g.t}</h3>
                <p className="ksr-body-sm">{g.p}</p>
                <a href={g.src.u} target="_blank" rel="noopener noreferrer" className="ksr-gapsrc">
                  {g.src.t} ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* § 04 — TALKS (ink band) */}
      <div className="ksr-band-ink">
        <div className="ksr-band-inner">
          <div className="ksr-mast">
            <span className="ksr-pill">§ 05</span>
            <span className="ksr-scaps" style={{ color: "var(--color-paper-55)" }}>
              Talks this radar powers
            </span>
          </div>
          <h2 className="ksr-h2" style={{ color: "var(--color-paper)", maxWidth: 860 }}>
            Sessions built on sourced market intelligence, not recycled slideware.
          </h2>
          <div className="ksr-talks">
            {TALKS.map((t) => (
              <div className="ksr-talk" key={t.n}>
                <div className="ksr-talk-num">Talk 0{t.n}</div>
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
      <main className="ksr-wrap" style={{ paddingBottom: 64 }}>
        {/* teaser: radar -> the pitched travel session */}
        <div style={{ border: "1px solid rgba(26,20,16,.18)", borderLeft: "3px solid #f5b81f", padding: "22px 26px", margin: "40px 0 24px", display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <span className="ksr-scaps">The session this radar powers</span>
            <h3 className="ksr-h3" style={{ margin: "6px 0 8px" }}>When Travelers Ask ChatGPT Where to Go</h3>
            <p className="ksr-body-sm" style={{ margin: 0 }}>
              Earned media for Saudi tourism: the keynote, workshop, and panel built on this radar&rsquo;s live data. Tuned for DMOs, hotels, airlines, and travel marketers.
            </p>
          </div>
          <Link href={LINKS.session} className="ksr-btn-yellow">
            See the travel session
          </Link>
        </div>
        <section className="ksr-final">
          <div className="ksr-scaps">Speaker · Syed Irfan Ajmal</div>
          <h2 className="ksr-h2" style={{ margin: "14px 0 16px" }}>
            Bring the radar to your stage.
          </h2>
          <p className="ksr-body-lg" style={{ margin: "0 0 24px" }}>
            Earned-media strategist and builder of the EMOS suite (SignalIQ, PressIQ, CoverageIQ, FactCheckIQ). 300+ clients, mostly American brands, plus
            Gulf-government work through DinarStandard. Quoted in Harvard Business Review and Forbes (US); bylines in Forbes Middle East. Available for
            keynotes, masterclasses, and panels across KSA, Sep-Nov 2026.
          </p>
          <div className="ksr-cta-row">
            <Link href={LINKS.book} className="ksr-btn-yellow">
              Book a speaker call
            </Link>
            <Link href={LINKS.session} className="ksr-tlink">
              the pitched session
            </Link>
            <Link href={LINKS.globalRadar} className="ksr-tlink">
              the live global radar
            </Link>
          </div>
        </section>

        {/* SOURCES */}
        <section className="ksr-sources">
          <details className="ksr-src-details">
            <summary>
              <span className="ksr-pill">Sources</span>
              <span className="ksr-scaps">every figure on this page · {SRC_GROUPS.reduce((n, g) => n + g.links.length, 0)} links</span>
            </summary>
            <div className="ksr-srcflow">
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
          <p className="ksr-micro" style={{ marginTop: 18 }}>
            Method: curated layer compiled 24 Jul 2026 from official statistics and named reports. Live layer: SignalIQ × GDELT Web News NGrams via BigQuery,
            refreshed daily. †The 2019 inbound-visitor basis varies across official series.
          </p>
        </section>
      </main>

      <Colophon />
    </>
  );
}

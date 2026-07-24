import type { Metadata } from "next";
import Link from "next/link";
import { getKsaRadarData } from "@/lib/ksa-radar/data";
import { Colophon } from "@/components/bureau";
import KsaRadarModule from "./KsaRadarModule";
import { GAPS, KPIS, SPARK_SERIES, SRC_GROUPS, TALKS } from "./content";
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
          <div className="ksr-scaps">Signal Radar · KSA Edition · إصدار المملكة العربية السعودية</div>
          <h1 className="ksr-h1">KSA Tourism &amp; Hospitality Radar</h1>
          <p className="ksr-ar-sub" dir="rtl">رادار السياحة والضيافة في المملكة العربية السعودية</p>
          <p className="ksr-body-lg" style={{ margin: "0 0 26px" }}>
            Twenty-eight signals across four lenses: what is moving in Saudi tourism right now, what is building toward 2030, and which narratives nobody owns
            yet. Every number on this page links to its source.
          </p>
          <div className="ksr-cta-row">
            <Link href={LINKS.book} className="ksr-btn-yellow">
              Book a speaker call
            </Link>
            <Link href={LINKS.session} className="ksr-tlink">
              see the pitched session
            </Link>
          </div>
          <p className="ksr-micro">
            Curated layer as of 24 Jul 2026 · live wire: SignalIQ × GDELT BigQuery{live.hasData ? ` · live data as of ${live.asOf}` : " · pending first scan"}
          </p>
          <div className="ksr-target">
            VISION 2030 TARGET · <b>150M visits/yr</b> (70M international + 80M domestic) ·{" "}
            <a href="https://www.sta.gov.sa/en/vision2030" target="_blank" rel="noopener noreferrer">
              Saudi Tourism Authority ↗
            </a>
          </div>
        </section>

        <div className="ksr-double" />

        {/* § 01 — AUTHORITY KPIs */}
        <div className="ksr-mast">
          <span className="ksr-pill">§ 01</span>
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

        {/* § 02 — THE RADAR */}
        <div className="ksr-mast" style={{ marginTop: 48 }}>
          <span className="ksr-pill">§ 02</span>
          <h2 className="ksr-h3">The radar · 28 signals, 4 lenses, 3 horizons</h2>
        </div>
        <KsaRadarModule live={live} />
      </main>

      {/* § 03 — OWNABLE NARRATIVES (paper-2 band) */}
      <div className="ksr-band-p2">
        <div className="ksr-band-inner">
          <div className="ksr-mast">
            <span className="ksr-pill">§ 03</span>
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
            <span className="ksr-pill">§ 04</span>
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
          <div className="ksr-mast">
            <span className="ksr-pill">Sources</span>
            <span className="ksr-scaps">every figure on this page</span>
          </div>
          <div className="ksr-srcgrid">
            {SRC_GROUPS.map((g) => (
              <div key={g.h}>
                <h5>{g.h}</h5>
                {g.links.map((l) => (
                  <a key={l.u} href={l.u} target="_blank" rel="noopener noreferrer">
                    {l.t} ↗
                  </a>
                ))}
              </div>
            ))}
          </div>
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

import type { Metadata } from "next";
import Link from "next/link";
import { getMoversData } from "@/lib/movers/data";
import { pctInt, fmtK, sparkline, type MoverTopic } from "@/lib/movers/types";
import "./movers.css";

export const revalidate = 43200; // 12h; the coverage scan runs daily

export const metadata: Metadata = {
  title: "Founder Movers",
  description:
    "A live weekly read of which founder and Series-A topics the press is covering more — and less — this week. Powered by SignalIQ. Ride the wave while it's rising; own the quiet lanes.",
  alternates: { canonical: "/movers" },
  openGraph: {
    title: "Founder Movers · Syed Irfan Ajmal",
    description:
      "Which founder / Series-A topics are heating up in the press this week, and which are cooling. Powered by SignalIQ.",
    url: "/movers",
  },
};

// Internal link targets — real routes used by the /radar page.
const LINKS = {
  book: "/strategy-call",
  signaliq: "/tools/signaliq",
  radar: "/radar",
  emosAcademy: "/emos-academy",
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

function MoverRow({ t, i, rising, max }: { t: MoverTopic; i: number; rising: boolean; max: number }) {
  const width = max > 0 ? Math.max(6, (Math.abs(t.wow) / max) * 100) : 6;
  return (
    <div className="emr-list-row">
      <span className="emr-rank">{i + 1}</span>
      <div className="emr-row-main">
        <div className="emr-row-name">{t.topic}</div>
        <div className="emr-bar">
          <i className={rising ? "emr-bar-y" : ""} style={{ width: width + "%" }} />
        </div>
      </div>
      <span className="emr-mom">
        {rising ? "▲" : "▼"} {pctInt(t.wow)}
      </span>
    </div>
  );
}

export default async function MoversPage() {
  const data = await getMoversData();
  const maxRise = data.risers.length ? Math.max(...data.risers.map((t) => t.wow)) : 1;
  const maxFall = data.coolers.length ? Math.max(...data.coolers.map((t) => Math.abs(t.wow))) : 1;
  const live = data.covered > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Founder Movers",
    url: "https://www.syedirfanajmal.com/movers",
    description:
      "A live weekly read of which founder / Series-A topics the press is covering more and less, powered by SignalIQ.",
    isPartOf: { "@id": "https://www.syedirfanajmal.com/#website" },
    about: { "@id": "https://www.syedirfanajmal.com/#person" },
  };

  const stats: { n: string; l: string }[] = [
    { n: String(data.covered), l: "Founder topics tracked" },
    { n: String(data.heatingCount), l: "Heating up this week" },
    { n: String(data.coolingCount), l: "Cooling down" },
    { n: fmtK(data.totalLast7), l: "Articles · last 7 days" },
  ];

  return (
    <main className="emr-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="emr-hero">
        <div className="emr-scaps">Live · Founder Movers</div>
        <h1 className="emr-h1">What the press is writing more — and less — about in your category this week.</h1>
        <p className="emr-body-lg" style={{ margin: "0 0 24px" }}>
          Every day, SignalIQ counts how much the press covers the topics a pre-Series-A and Series-A founder builds
          authority around. This turns that into one weekly read: what is heating up, so you ride the wave while it is
          rising, and what has gone quiet, an open lane you can still own.
        </p>
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

      <div className="emr-double" />

      {/* STATS */}
      <div className="mvr-stats">
        {stats.map((s) => (
          <div className="mvr-stat" key={s.l}>
            <div className="mvr-stat-num">{s.n}</div>
            <div className="mvr-stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* BOARD: risers + coolers */}
      <div className="mvr-board">
        <div className="emr-panel">
          <div className="emr-panel-head">
            <span className="emr-scaps">Heating up this week</span>
            <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
              week over week
            </span>
          </div>
          <div className="emr-panel-body">
            {data.risers.length ? (
              data.risers.map((t, i) => <MoverRow key={t.topic} t={t} i={i} rising max={maxRise} />)
            ) : (
              <p className="mvr-note">Nothing clearly rising yet — check back after the next daily scan.</p>
            )}
          </div>
        </div>

        <div className="emr-panel">
          <div className="emr-panel-head">
            <span className="emr-scaps">Cooling down</span>
            <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
              quiet lanes
            </span>
          </div>
          <div className="emr-panel-body">
            {data.coolers.length ? (
              data.coolers.map((t, i) => <MoverRow key={t.topic} t={t} i={i} rising={false} max={maxFall} />)
            ) : (
              <p className="mvr-note">No clear cool-offs this week.</p>
            )}
          </div>
        </div>
      </div>

      {/* BREAKING NOW: spikes */}
      <div className="emr-panel">
        <div className="emr-panel-head">
          <span className="emr-scaps">Breaking now</span>
          <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
            latest day vs baseline
          </span>
        </div>
        <div className="emr-panel-body">
          {data.spikes.length ? (
            data.spikes.map((t) => (
              <div className="mvr-spikerow" key={t.topic}>
                <span className="mvr-name">{t.topic}</span>
                <Spark series={t.series} />
                <span className="mvr-meta">
                  {Math.round(t.lastDay)} today · {t.avgDay.toFixed(0)}/day avg
                </span>
                <span className="mvr-z">{t.z.toFixed(1)}σ</span>
              </div>
            ))
          ) : (
            <p className="mvr-note">No unusual single-day spikes right now.</p>
          )}
        </div>
      </div>

      {/* HOW TO USE IT */}
      <section className="emr-section">
        <div className="emr-scaps">How to use it</div>
        <h2 className="emr-h2" style={{ margin: "10px 0 24px", maxWidth: 760 }}>
          A founder&apos;s category has a rhythm. The move is to pitch on the upbeat.
        </h2>
        <div className="emr-four">
          {[
            {
              n: "01",
              h: "Ride what is heating up.",
              b: "When a topic in your world is climbing, reporters are already looking for sources and takes. That is the week to publish your view, share your data, and pitch, while the story is cresting and you are not the two-hundredth email.",
            },
            {
              n: "02",
              h: "Own what has gone quiet.",
              b: "A cooling topic is not a dead one. It is an open lane, less crowded, easier to become the name attached to it. Founders build durable authority on the beats nobody else is fighting over yet.",
            },
            {
              n: "03",
              h: "Move the day it breaks.",
              b: "The Breaking-now list flags topics spiking hard against their own baseline today. That is a same-day newsjacking window: a fast comment or a founder take can get you into a live story.",
            },
            {
              n: "04",
              h: "Then do it for your exact company.",
              b: "This board tracks the founder category as a whole. SignalIQ runs the same read on the precise topics your company owns, and turns each into a pitch angle and a journalist to send it to.",
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
        <p className="emr-body-lg emr-italic" style={{ marginTop: 22, maxWidth: 760 }}>
          Momentum is a 7-day-versus-prior-7-day change in press coverage, measured from real article counts and refreshed
          daily. Early signals, not predictions — and every one traces back to the source.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="emr-final">
        <h2 className="emr-h2">Stop guessing what to post about. Read the board.</h2>
        <p className="emr-body-lg" style={{ margin: "16px 0 24px" }}>
          The founders who compound attention are not louder. They are earlier. Scan your own category free, or learn to run
          the whole loop with me in the Academy.
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

      <p className="emr-copyright">© MMXXVI Syed Irfan Ajmal · SIA Enterprises Inc</p>
    </main>
  );
}

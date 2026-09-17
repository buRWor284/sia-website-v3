import type { Metadata } from "next";
import { Colophon } from "@/components/bureau";
import { ANCHOR_STAT, ATHAR_CALLOUT, SIGNALS, SIGNAL_LEGS, SIGNAL_LEGS_NOT_USED, SRC_GROUPS, type DecodingSignal } from "./content";
import "./decoding-saudi.css";

// Hidden 2026-09-17: not in nav, not on home page, not in sitemap.ts. Same
// "hidden data cut" convention as the ksa-culture beat it reads from
// (src/lib/signaliq/config.ts) and as ksa-tourism-radar/ksa-retail-radar
// used before they went public. Direct-URL only, for Megha S Anthony
// (Content Head, Athar Festival) to support an ask for Irfan's own talk on
// the "Decoding Saudi" conference stream. Reframed 2026-09-17 (v3): the
// angle is "where Saudi attention actually is, versus where brands assume
// it is", with an anchor stat, an Athar callout and a sources-of-signal box
// (see content.ts header). Rebuilt 2026-09-17 (v2) at Irfan's
// request to match the ksa-retail-radar / ksa-tourism-radar house style:
// sourced signal files with a demand-side fact and a talk angle per topic,
// not just a raw count table. Deliberately smaller than those two radars
// (10 signals, not 25): no lens/ring/lifecycle apparatus, no live-wire
// scatterplot, because a 10-topic sport-and-entertainment cut doesn't carry
// that machinery honestly. Press-volume counts are a one-time snapshot (see
// content.ts header); there is no history yet to wire live.
export const metadata: Metadata = {
  title: "Decoding Saudi: Where the Attention Actually Is",
  description:
    "Ten Saudi sport and entertainment topics, each with a real press-volume count via SignalIQ, a cited demand-side number, and what a brand marketing into Saudi should do with the gap between them. Built for the Decoding Saudi conference stream.",
  robots: { index: false, follow: false },
};

/** Server-rendered horizontal bar chart, log scale (the ten topics span 385
 *  down to 1, so a linear scale would make the small bars invisible). Matches
 *  the hand-rolled inline-SVG convention ksa-retail-radar's "The Window" uses:
 *  no chart library, just SVG against the design tokens (grep confirmed no
 *  recharts/d3 dependency in this repo). Every bar's real count is printed as
 *  a label, so the log scale never hides the actual number. */
function VolumeChart({ signals }: { signals: DecodingSignal[] }) {
  const rows = signals
    .map((s) => ({ s, n: s.counts.find((c) => c.lang === "EN" && c.window === "14d")?.n ?? 0 }))
    .sort((a, b) => b.n - a.n);
  const W = 900;
  const rowH = 32;
  const gap = 8;
  const top = 6;
  const H = top + rows.length * (rowH + gap);
  const labelW = 186;
  const valueW = 44;
  const barAreaW = W - labelW - valueW - 14;
  const maxN = Math.max(...rows.map((r) => r.n), 1);
  const X = (n: number) => (Math.log10(n + 1) / Math.log10(maxN + 1)) * barAreaW;
  return (
    <div className="dsg-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Horizontal bar chart of English press-article counts in 14 days across the ten Decoding Saudi topics, log scale."
      >
        {rows.map((r, i) => {
          const y = top + i * (rowH + gap);
          const bw = Math.max(X(r.n), 3);
          const barFill = r.s.weak ? "var(--color-ink-15)" : "var(--color-yellow)";
          return (
            <g key={r.s.id}>
              <text x={labelW - 10} y={y + rowH / 2 + 4} textAnchor="end" className="dsg-chart-label">
                {r.s.name}
              </text>
              <rect x={labelW} y={y} width={barAreaW} height={rowH} fill="var(--color-paper-2)" />
              <rect x={labelW} y={y} width={bw} height={rowH} fill={barFill} stroke="var(--color-ink)" strokeWidth={1} />
              <text x={labelW + barAreaW + 12} y={y + rowH / 2 + 4} className="dsg-chart-val">
                {r.n}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="dsg-chart-note">
        English articles in 14 days per topic, log scale so the smallest signals stay visible next to Saudi Pro
        League&rsquo;s 385. Grey bars mark the three low-priority context topics.
      </p>
    </div>
  );
}

/** Small two-segment bar for a topic where Arabic coverage outweighs English.
 *  Windows differ (EN 14d vs AR 60d), so this is a proportion illustration
 *  of the two counts side by side, not a like-for-like comparison; the
 *  caption says so, and the underlying counts also appear as chips above. */
function SplitBar({ s }: { s: DecodingSignal }) {
  const en = s.counts.find((c) => c.lang === "EN");
  const ar = s.counts.find((c) => c.lang === "AR");
  if (!en || !ar) return null;
  const total = en.n + ar.n;
  const enPct = Math.round((en.n / total) * 100);
  return (
    <div className="dsg-split">
      <div className="dsg-split-bar">
        <span className="dsg-split-en" style={{ width: `${enPct}%` }} />
        <span className="dsg-split-ar" style={{ width: `${100 - enPct}%` }} />
      </div>
      <div className="dsg-split-legend">
        <span>
          <i className="dsg-sw en" /> {en.n} EN / {en.window}
        </span>
        <span>
          <i className="dsg-sw ar" /> {ar.n} AR / {ar.window}
        </span>
      </div>
    </div>
  );
}

function Counts({ s }: { s: DecodingSignal }) {
  return (
    <div className="dsg-counts">
      {s.counts.map((c) => (
        <span className={"dsg-chip" + (c.lang === "AR" ? " ar" : "")} key={`${c.lang}-${c.window}`}>
          {c.n} {c.lang} / {c.window}
        </span>
      ))}
      {s.weak ? <span className="dsg-chip weak">low priority</span> : null}
      {s.arOutweighs ? <span className="dsg-chip ar-flag">AR &gt; EN</span> : null}
    </div>
  );
}

function SignalCard({ s }: { s: DecodingSignal }) {
  return (
    <div className={"dsg-card" + (s.weak ? " weak" : "")}>
      <div className="dsg-card-head">
        <div>
          <div className="dsg-card-name">{s.name}</div>
          <div className="dsg-card-ar">{s.ar}</div>
        </div>
        <Counts s={s} />
      </div>
      {s.arOutweighs ? <SplitBar s={s} /> : null}
      <p className="dsg-card-demand">{s.demand}</p>
      <div className="dsg-card-srcs">
        {s.demandS.map((src) => (
          <a key={src.u} href={src.u} target="_blank" rel="noopener noreferrer">
            {src.t} ↗
          </a>
        ))}
      </div>
      <p className="dsg-card-talk">
        <b>For brands.</b> {s.forBrands}
      </p>
    </div>
  );
}

export default function DecodingSaudiPage() {
  const sport = SIGNALS.filter((s) => s.group === "sport");
  const entertainment = SIGNALS.filter((s) => s.group === "entertainment");
  const totalEn14d = SIGNALS.reduce((sum, s) => sum + s.counts.filter((c) => c.lang === "EN" && c.window === "14d").reduce((a, c) => a + c.n, 0), 0);
  const arOutweighCount = SIGNALS.filter((s) => s.arOutweighs).length;

  return (
    <>
      <main className="dsg-wrap">
        {/* HERO */}
        <section className="dsg-hero">
          <div className="dsg-scaps">SignalIQ · Decoding Saudi · فك رموز السعودية</div>
          <h1 className="dsg-h1">Decoding Saudi: where the attention actually is, versus where brands assume it is</h1>
          <p className="dsg-hero-sub">
            Most brand plans for Saudi are written from the English press. This page checks that against two
            other things: what the English and Arabic press actually files on ten sport and entertainment topics,
            via <mark className="dsg-mark">SignalIQ</mark>, and the real audience numbers behind each one, sourced
            and linked. Where the two disagree is where a marketer&rsquo;s money is either late or wasted. Every
            topic ends with one concrete line on what a brand should do with the gap.
          </p>
        </section>

        <div className="dsg-double" />

        {/* § 00 — SCALE + ATHAR */}
        <div className="dsg-anchor-row">
          <div className="dsg-anchor">
            <div className="dsg-stat-label">{ANCHOR_STAT.label}</div>
            <div className="dsg-stat-val">{ANCHOR_STAT.val}</div>
            <p className="dsg-anchor-sub">{ANCHOR_STAT.sub}</p>
            <div className="dsg-card-srcs">
              {ANCHOR_STAT.src.map((src) => (
                <a key={src.u} href={src.u} target="_blank" rel="noopener noreferrer">
                  {src.t} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="dsg-callout">
            <div className="dsg-scaps">{ATHAR_CALLOUT.label}</div>
            <p>{ATHAR_CALLOUT.text}</p>
            <div className="dsg-card-srcs">
              {ATHAR_CALLOUT.src.map((src) => (
                <a key={src.u} href={src.u} target="_blank" rel="noopener noreferrer">
                  {src.t} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="dsg-double" />

        {/* § 01 — THE CUT */}
        <div className="dsg-mast">
          <span className="dsg-pill">§ 01</span>
          <h2 className="dsg-h3">The cut · 10 signals, 2 groups</h2>
          <span className="dsg-freshness">snapshot as of 17 Sep 2026</span>
        </div>

        <div className="dsg-stats">
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">English articles, 14 days</div>
            <div className="dsg-stat-val">{totalEn14d}</div>
            <div className="dsg-stat-sub">across all ten topics, via SignalIQ × GDELT</div>
          </div>
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">Arabic outweighs English</div>
            <div className="dsg-stat-val">{arOutweighCount}<span className="dsg-stat-of">/10</span></div>
            <div className="dsg-stat-sub">topics where AR press coverage leads</div>
          </div>
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">Widest single signal</div>
            <div className="dsg-stat-val">385</div>
            <div className="dsg-stat-sub">Saudi Pro League, EN articles / 14d</div>
          </div>
        </div>

        <h3 className="dsg-group-h">Sport</h3>
        <div className="dsg-grid">
          {sport.map((s) => (
            <SignalCard s={s} key={s.id} />
          ))}
        </div>

        <h3 className="dsg-group-h">Entertainment</h3>
        <div className="dsg-grid">
          {entertainment.map((s) => (
            <SignalCard s={s} key={s.id} />
          ))}
        </div>

        {/* § 02 — THE CHART */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 02</span>
          <h2 className="dsg-h3">The volume, side by side</h2>
        </div>
        <VolumeChart signals={SIGNALS} />

        {/* § 03 — THE READ */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 03</span>
          <span className="dsg-scaps">The honest read</span>
        </div>
        <div className="dsg-honesty">
          <p>
            <b>Read this first.</b> On one topic, <mark className="dsg-mark">Saudi Pro League</mark>, the press
            and the audience agree: 385 English articles in 14 days under a 230 million-viewer broadcast footprint.
            Everywhere else the audience is ahead of the coverage. <mark className="dsg-mark">Riyadh Season</mark>{" "}
            (20 million visitors) and Saudi National Day (a nationwide, multi-city programme) each drew 23 English
            articles in 14 days. The Esports World Cup, with a $75 million prize pool, drew 44. On Saudi Grand Prix
            and Saudi film industry, the conversation that exists is mostly in Arabic. If a plan is built from
            English coverage, it will overweight the league and underweight almost everything else.
          </p>
          <p>
            What did not work: the wider &quot;Saudi culture&quot; topics this cut started with (streaming, youth
            culture, festivals beyond the ones named, and similar) tested at near-zero English press volume in the
            same scan, so they are not on this page. Saudi esports, Saudi motorsport and Saudi cinema are kept as
            low-priority context with one grounding fact each. And the third data leg, search interest from Google
            Trends, could not be fetched for this pass, so the attention side here rests on official visitor and
            broadcast numbers rather than on search data. The page shows where signal exists, not where it was
            expected to.
          </p>
          <p className="dsg-note-live">
            Counts are a one-time snapshot from a BigQuery test scan of the ksa-culture beat, taken 2026-09-17, the
            same day the beat went live; there is no backfill history yet for a live query to show anything
            meaningful, so this page states the known numbers directly instead of wiring a live feed that would have
            nothing behind it.
          </p>
        </div>

        {/* § 04 — SOURCES OF SIGNAL */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 04</span>
          <span className="dsg-scaps">Sources of signal: how to read this</span>
        </div>
        <div className="dsg-legs">
          {SIGNAL_LEGS.map((leg) => (
            <div className="dsg-leg" key={leg.name}>
              <div className="dsg-leg-head">
                <span className="dsg-leg-name">{leg.name}</span>
                <span className={"dsg-chip" + (leg.used ? "" : " weak")}>{leg.used ? "used here" : "not used"}</span>
              </div>
              <p>{leg.note}</p>
            </div>
          ))}
          <p className="dsg-legs-foot">{SIGNAL_LEGS_NOT_USED}</p>
        </div>

        {/* § 05 — SOURCES */}
        <div className="dsg-sources">
          <details className="dsg-src-details">
            <summary>
              <span className="dsg-pill">§ 05</span>
              <span className="dsg-scaps">Every source, in one place</span>
            </summary>
            <div className="dsg-src-grid">
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
          </details>
        </div>

        <p className="dsg-micro">Data as of 17 Sep 2026, via SignalIQ.</p>
      </main>

      <Colophon />
    </>
  );
}

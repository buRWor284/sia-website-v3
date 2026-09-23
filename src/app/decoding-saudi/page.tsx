import type { Metadata } from "next";
import { Colophon } from "@/components/bureau";
import {
  ANCHOR_STAT,
  ATHAR_CALLOUT,
  ATTENTION_CALLOUT,
  SIGNALS,
  SIGNAL_LEGS,
  SIGNAL_LEGS_NOT_USED,
  SRC_GROUPS,
  TRENDS,
  TRENDS_MONTHS,
  TREND_SEARCHES,
  fmtMonth,
  trendPeak,
  type DecodingSignal,
} from "./content";
import "./decoding-saudi.css";

// Hidden 2026-09-17: not in nav, not on home page, not in sitemap.ts. Same
// "hidden data cut" convention as the ksa-culture beat it reads from
// (src/lib/signaliq/config.ts) and as ksa-tourism-radar/ksa-retail-radar
// used before they went public. Direct-URL only, for Megha S Anthony
// (Content Head, Athar Festival) to support an ask for Irfan's own talk on
// the "Decoding Saudi" conference stream. Reframed 2026-09-17 (v3): the
// angle is "where Saudi attention actually is, versus where brands assume
// it is", with an anchor stat, an Athar callout and a sources-of-signal box
// (see content.ts header). Trends pass 2026-09-17 (v4): Google Trends
// exported by hand (SA, Search term, 1 Sep 2023 to 17 Sep 2026) and wired in
// as a typed constant: a two-line sparkline (EN yellow, AR black, same
// colours as SplitBar) with peak chips on five cards, "what people search"
// lines on Pro League and Riyadh Season, and a § 03 "Attention, not just
// coverage" callout; later sections renumbered. Rebuilt 2026-09-17 (v2) at Irfan's
// request to match the ksa-retail-radar / ksa-tourism-radar house style:
// sourced signal files with a demand-side fact and a talk angle per topic,
// not just a raw count table. Deliberately smaller than those two radars
// (10 signals, not 25): no lens/ring/lifecycle apparatus, no live-wire
// scatterplot, because a 10-topic sport-and-entertainment cut doesn't carry
// that machinery honestly. Press-volume counts are a one-time snapshot (see
// content.ts header); there is no history yet to wire live. 60-day EN vs
// AR pass 2026-09-22 (v5): every card now carries a SplitBar on ONE 60-day
// window for both languages (press60 in content.ts), the VolumeChart is
// paired EN/AR bars on a log scale, and the § 01 stat strip is the 60-day
// totals. Unchecked Arabic seeds carry a "phrase check pending" chip.
export const metadata: Metadata = {
  title: "Decoding Saudi: Where the Attention Actually Is",
  description:
    "Ten Saudi sport and entertainment topics, each with a real press-volume count via SignalIQ, a cited demand-side number, and what a brand marketing into Saudi should do with the gap between them. Built for the Decoding Saudi conference stream.",
  robots: { index: false, follow: false },
};

/** Server-rendered paired horizontal bar chart, log scale: one yellow (EN)
 *  and one black (AR) bar per topic, both from the same 60-day window, so
 *  the two bars in a row really do compare. The ten topics span 4,389 down
 *  to 2, so a linear scale would make the small bars invisible. Matches the
 *  hand-rolled inline-SVG convention ksa-retail-radar's "The Window" uses:
 *  no chart library, just SVG against the design tokens. Every bar's real
 *  count is printed as a label, so the log scale never hides the number.
 *  An unchecked Arabic seed draws its bar hatched (dashed outline, no fill)
 *  so it is never read as a verified count. */
function VolumeChart({ signals }: { signals: DecodingSignal[] }) {
  const rows = [...signals].sort((a, b) => Math.max(b.press60.en, b.press60.ar ?? 0) - Math.max(a.press60.en, a.press60.ar ?? 0));
  const W = 900;
  const barH = 13;
  const rowH = barH * 2 + 2;
  const gap = 10;
  const top = 6;
  const H = top + rows.length * (rowH + gap);
  const labelW = 186;
  const valueW = 92;
  const barAreaW = W - labelW - valueW - 14;
  const maxN = Math.max(...rows.map((r) => Math.max(r.press60.en, r.press60.ar ?? 0)), 1);
  const X = (n: number) => (Math.log10(n + 1) / Math.log10(maxN + 1)) * barAreaW;
  return (
    <div className="dsg-chart">
      <div className="dsg-split-legend dsg-chart-legend">
        <span>
          <i className="dsg-sw en" /> English articles, 60 days
        </span>
        <span>
          <i className="dsg-sw ar" /> Arabic articles, 60 days
        </span>
        <span>
          <i className="dsg-sw pending" /> Arabic seed, phrase check pending
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Paired horizontal bar chart of English and Arabic press-article counts over the same 60 days, 19 July to 16 September 2026, across the ten Decoding Saudi topics, log scale."
      >
        {rows.map((r, i) => {
          const y = top + i * (rowH + gap);
          const en = r.press60.en;
          const ar = r.press60.ar;
          const enW = Math.max(X(en), 3);
          const arW = ar === undefined ? 0 : Math.max(X(ar), 3);
          return (
            <g key={r.id}>
              <text x={labelW - 10} y={y + rowH / 2 + 4} textAnchor="end" className={"dsg-chart-label" + (r.weak ? " weak" : "")}>
                {r.name}
              </text>
              <rect x={labelW} y={y} width={barAreaW} height={rowH} fill="var(--color-paper-2)" />
              <rect x={labelW} y={y} width={enW} height={barH} fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth={1} />
              <text x={labelW + enW + 6} y={y + barH - 3} className="dsg-chart-val">
                {en.toLocaleString("en-US")} EN
              </text>
              {ar === undefined ? (
                <text x={labelW + 6} y={y + barH * 2 - 2} className="dsg-chart-val muted">
                  no AR pair (seed returned 0, dropped)
                </text>
              ) : (
                <>
                  <rect
                    x={labelW}
                    y={y + barH + 2}
                    width={arW}
                    height={barH}
                    fill={r.press60.arChecked ? "var(--color-ink)" : "none"}
                    stroke="var(--color-ink)"
                    strokeWidth={1}
                    strokeDasharray={r.press60.arChecked ? undefined : "3 2"}
                  />
                  <text x={labelW + arW + 6} y={y + barH * 2 - 2} className="dsg-chart-val">
                    {ar.toLocaleString("en-US")} AR{r.press60.arChecked ? "" : " (pending)"}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <p className="dsg-chart-note">
        English (yellow) and Arabic (black) articles per topic over the same 60 days, 19 Jul to 16 Sep 2026, via
        SignalIQ on GDELT, run 22 Sep 2026. Log scale so the single-digit topics stay visible next to the league&rsquo;s
        4,389 Arabic articles; every real count is printed. A dashed, unfilled Arabic bar is a seed whose phrase has
        not yet been collocation-checked, so read it as a candidate, not a verified count.
      </p>
    </div>
  );
}

/** Ratio label for the 60-day pair: which language leads and by how much. */
function ratioLabel(en: number, ar: number): string {
  if (en === 0 && ar === 0) return "no coverage";
  if (ar >= en) return en === 0 ? "AR only" : `AR ${(ar / en).toFixed(1)}x`;
  return ar === 0 ? "EN only" : `EN ${(en / ar).toFixed(1)}x`;
}

/** Two-segment EN vs AR bar on every card, both counts from the SAME 60-day
 *  window (19 Jul to 16 Sep 2026), so the two segments really do compare.
 *  Yellow = English, black = Arabic. Prints both counts and the ratio; an
 *  Arabic seed that has not passed a collocation check gets a "phrase check
 *  pending" chip and a hatched segment. A topic with no Arabic pair (the
 *  motorsport seed returned zero and was dropped) says so instead. */
function SplitBar({ s }: { s: DecodingSignal }) {
  const { en, ar, arChecked } = s.press60;
  if (ar === undefined) {
    return (
      <div className="dsg-split">
        <div className="dsg-split-bar">
          <span className="dsg-split-en" style={{ width: "100%" }} />
        </div>
        <div className="dsg-split-legend">
          <span>
            <i className="dsg-sw en" /> {en} EN / 60d
          </span>
          <span className="dsg-split-note">no AR pair: seed returned 0 over 60 days, dropped</span>
        </div>
      </div>
    );
  }
  const total = en + ar;
  const enPct = total === 0 ? 50 : Math.round((en / total) * 100);
  const near = en > 0 && ar > 0 && Math.max(en, ar) / Math.min(en, ar) < 1.15;
  return (
    <div className="dsg-split">
      <div className="dsg-split-bar">
        <span className="dsg-split-en" style={{ width: `${enPct}%` }} />
        <span className={"dsg-split-ar" + (arChecked ? "" : " pending")} style={{ width: `${100 - enPct}%` }} />
      </div>
      <div className="dsg-split-legend">
        <span>
          <i className="dsg-sw en" /> {en.toLocaleString("en-US")} EN / 60d
        </span>
        <span>
          <i className={"dsg-sw " + (arChecked ? "ar" : "pending")} /> {ar.toLocaleString("en-US")} AR / 60d
        </span>
        <span className="dsg-split-ratio">
          {ratioLabel(en, ar)}
          {near ? " · near parity" : ""}
        </span>
        {arChecked ? null : <span className="dsg-chip pending">phrase check pending</span>}
      </div>
    </div>
  );
}

/** Hand-rolled inline-SVG sparkline of the two Google Trends monthly series
 *  for a topic (38 points, Aug 2023 to Sep 2026). Yellow = English term,
 *  black = Arabic term, the same colours SplitBar uses. Both lines share one
 *  0 to 100 axis because each Trends batch is already a 0 to 100 index, but
 *  the two batches are indexed to different top terms, so the caption in
 *  § 03 says heights compare within a language only. Thin year ticks at
 *  every January. A flat line at zero is drawn as is, not hidden. */
function Sparkline({ id }: { id: string }) {
  const t = TRENDS[id];
  if (!t) return null;
  const W = 420;
  const H = 72;
  const padX = 4;
  const padTop = 6;
  const padBot = 14;
  const n = TRENDS_MONTHS.length;
  const x = (i: number) => padX + (i / (n - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - v / 100) * (H - padTop - padBot);
  const path = (vals: number[]) => vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const years = TRENDS_MONTHS.map((m, i) => ({ m, i })).filter(({ m }) => m.endsWith("-01"));
  const enPk = trendPeak(t.en);
  const arPk = trendPeak(t.ar);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="dsg-spark"
      role="img"
      aria-label={`Google Trends monthly search interest in Saudi Arabia, Aug 2023 to Sep 2026, for ${t.enTerm} (English, peak ${enPk.val} in ${fmtMonth(enPk.month)}) and ${t.arTerm} (Arabic, peak ${arPk.val} in ${fmtMonth(arPk.month)}).`}
    >
      <line x1={padX} x2={W - padX} y1={y(0)} y2={y(0)} stroke="var(--color-ink-15)" strokeWidth={1} />
      {years.map(({ m, i }) => (
        <g key={m}>
          <line x1={x(i)} x2={x(i)} y1={padTop} y2={y(0)} stroke="var(--color-ink-15)" strokeWidth={1} strokeDasharray="2 3" />
          <text x={x(i)} y={H - 2} className="dsg-spark-tick" textAnchor="middle">
            {m.slice(0, 4)}
          </text>
        </g>
      ))}
      <polyline points={path(t.ar)} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} strokeLinejoin="round" />
      <polyline points={path(t.en)} fill="none" stroke="var(--color-yellow)" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(t.ar.indexOf(arPk.val))} cy={y(arPk.val)} r={2.6} fill="var(--color-ink)" />
      <circle cx={x(t.en.indexOf(enPk.val))} cy={y(enPk.val)} r={2.6} fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth={1} />
    </svg>
  );
}

/** The audience-attention block inside a card: sparkline, one peak chip per
 *  language, and (where exported) the top related queries. Only the five
 *  topics with a Trends export render this. */
function TrendBlock({ id }: { id: string }) {
  const t = TRENDS[id];
  if (!t) return null;
  const enPk = trendPeak(t.en);
  const arPk = trendPeak(t.ar);
  const q = TREND_SEARCHES[id];
  return (
    <div className="dsg-trend">
      <div className="dsg-trend-head">
        <span className="dsg-scaps">Search interest · Google Trends · SA</span>
      </div>
      <Sparkline id={id} />
      <div className="dsg-trend-chips">
        <span className="dsg-chip">
          <i className="dsg-sw en" />
          {enPk.val === 0 ? "EN: zero all 38 months" : `EN peaks ${fmtMonth(enPk.month)} · ${enPk.val}`}
        </span>
        <span className="dsg-chip ar">
          <i className="dsg-sw ar" />
          {arPk.val === 0 ? "AR: zero all 38 months" : `AR peaks ${fmtMonth(arPk.month)} · ${arPk.val}`}
        </span>
      </div>
      {q ? (
        <p className="dsg-trend-q">
          <b>What people actually search ({q.lang}).</b> {q.lead}
          {q.queries.map((item, i) => (
            <span key={item.q}>
              {i > 0 ? ", " : ""}
              <span className="dsg-q" dir={q.lang === "AR" ? "rtl" : undefined}>
                &ldquo;{item.q}&rdquo;
              </span>{" "}
              ({item.n})
            </span>
          ))}
          . Scores are relative to the top related query in the same export.
        </p>
      ) : null}
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
      {s.press60.ar !== undefined && s.press60.ar > s.press60.en ? (
        <span className="dsg-chip ar-flag">{s.press60.arChecked ? "AR > EN / 60d" : "AR > EN? pending"}</span>
      ) : null}
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
      <SplitBar s={s} />
      <p className="dsg-card-demand">{s.demand}</p>
      <TrendBlock id={s.id} />
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
  const totalEn60 = SIGNALS.reduce((sum, s) => sum + s.press60.en, 0);
  const totalAr60 = SIGNALS.reduce((sum, s) => sum + (s.press60.ar ?? 0), 0);
  const totalArUnchecked = SIGNALS.filter((s) => !s.press60.arChecked).reduce((sum, s) => sum + (s.press60.ar ?? 0), 0);
  const arLeadsChecked = SIGNALS.filter((s) => s.press60.arChecked && s.press60.ar !== undefined && s.press60.ar > s.press60.en).length;
  const arLeadsPending = SIGNALS.filter((s) => !s.press60.arChecked && s.press60.ar !== undefined && s.press60.ar > s.press60.en).length;
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <>
      <main className="dsg-wrap">
        {/* HERO */}
        <section className="dsg-hero">
          <div className="dsg-scaps">SignalIQ · Decoding Saudi · فك رموز السعودية</div>
          <h1 className="dsg-h1">Decoding Saudi: where the attention actually is, versus where brands assume it is</h1>
          <p className="dsg-hero-sub">
            Most brand plans for Saudi are written from the English press. This page checks that against two
            other things: what the English and the Arabic press actually filed on ten sport and entertainment
            topics over the same 60 days, via <mark className="dsg-mark">SignalIQ</mark>, and the real audience
            numbers behind each one, sourced and linked. The short version: on the{" "}
            <mark className="dsg-mark">Saudi Pro League, Saudi National Day and Saudi football</mark> the Arabic
            press outwrites the English press three, eleven and three to one, while the Esports World Cup and
            Riyadh Season are covered almost equally in both languages, because those two are told to the world in
            English by design. Where press attention and audience attention disagree is where a marketer&rsquo;s
            money is either late or wasted. Every topic ends with one concrete line on what a brand should do with
            the gap.
          </p>
          <p className="dsg-pull">
            What Saudi wants the world to see is told in English. What Saudis care about is told in Arabic.
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
          <span className="dsg-freshness">60-day scan, 19 Jul to 16 Sep 2026, run 22 Sep 2026</span>
        </div>

        <div className="dsg-stats four">
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">English articles, 60 days</div>
            <div className="dsg-stat-val">{fmt(totalEn60)}</div>
            <div className="dsg-stat-sub">across all ten topics, via SignalIQ × GDELT</div>
          </div>
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">Arabic articles, 60 days</div>
            <div className="dsg-stat-val">{fmt(totalAr60)}</div>
            <div className="dsg-stat-sub">
              same window, nine Arabic seeds; {fmt(totalArUnchecked)} of these sit on two thin seeds still pending a phrase check
            </div>
          </div>
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">Arabic outwrites English</div>
            <div className="dsg-stat-val">
              {arLeadsChecked}
              <span className="dsg-stat-of">/10</span>
            </div>
            <div className="dsg-stat-sub">
              topics where the checked Arabic count leads, plus {arLeadsPending} more pending a phrase check
            </div>
          </div>
          <div className="dsg-stat-cell">
            <div className="dsg-stat-label">Widest single signal</div>
            <div className="dsg-stat-val">4,389</div>
            <div className="dsg-stat-sub">الدوري السعودي, AR articles / 60d, against 1,495 EN</div>
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
          <h2 className="dsg-h3">The volume, English and Arabic side by side</h2>
          <span className="dsg-freshness">both languages, same 60 days</span>
        </div>
        <VolumeChart signals={SIGNALS} />

        {/* § 03 — ATTENTION (Google Trends) */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 03</span>
          <h2 className="dsg-h3">{ATTENTION_CALLOUT.label}</h2>
          <span className="dsg-freshness">Google Trends, exported 17 Sep 2026</span>
        </div>
        <div className="dsg-attention">
          <div className="dsg-attention-legend">
            <span>
              <i className="dsg-sw en" /> English term
            </span>
            <span>
              <i className="dsg-sw ar" /> Arabic term
            </span>
            <span className="dsg-attention-legend-note">Monthly, Aug 2023 to Sep 2026, region Saudi Arabia. Lines and peak chips sit on five of the ten cards above.</span>
          </div>
          {ATTENTION_CALLOUT.paras.map((para, i) => (
            <p key={i}>{i === 0 ? <><b>Four findings.</b> {para}</> : i === 1 ? <><b>The scaling rule.</b> {para}</> : <><b>Caveat.</b> {para}</>}</p>
          ))}
          <div className="dsg-card-srcs">
            {ATTENTION_CALLOUT.src.map((src) => (
              <a key={src.u} href={src.u} target="_blank" rel="noopener noreferrer">
                {src.t} ↗
              </a>
            ))}
          </div>
        </div>

        {/* § 04 — THE READ */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 04</span>
          <span className="dsg-scaps">The honest read</span>
        </div>
        <div className="dsg-honesty">
          <p>
            <b>The export story and the home story.</b> There is a simple way to read the 60-day split. The two
            topics that sit near parity in English and Arabic, the Esports World Cup (649 EN to 627 AR) and Riyadh
            Season (143 to 135), are the ones Saudi deliberately tells to the world in English. The topics where
            Arabic outwrites English by three to eleven times, the Saudi Pro League (4,389 AR to 1,495 EN), Saudi
            National Day (292 to 26) and Saudi football (246 to 76), are the ones Saudis themselves care about. So
            the pattern is this: what Saudi wants the world to see gets told in English, and what Saudis care about
            gets told in Arabic. A brand that only reads the English press sees the{" "}
            <mark className="dsg-mark">export story</mark> and misses the{" "}
            <mark className="dsg-mark">home story</mark>. A brand planning from English coverage is planning from the
            export story.
          </p>
          <p>
            <b>Read this first.</b> Over the same 60 days (19 Jul to 16 Sep 2026) the Arabic press filed{" "}
            {fmt(totalAr60)} articles on these ten topics and the English press {fmt(totalEn60)}. On{" "}
            <mark className="dsg-mark">Saudi Pro League</mark> (4,389 AR to 1,495 EN), Saudi National Day (292 to
            26) and Saudi football (246 to 76), Arabic outwrites English roughly three, eleven and three to one. On{" "}
            <mark className="dsg-mark">Esports World Cup</mark> (649 EN to 627 AR) and Riyadh Season (143 to 135) the
            two languages are almost level: those two are told to the world in English by design, and a plan
            written from the English press will find them but will not find the rest. The league is the one
            property where press and audience already agree (a 230 million-viewer footprint under the largest count
            on the page), and even there three quarters of the coverage is in Arabic. Riyadh Season (20 million
            visitors) and National Day (a nationwide, multi-city programme) still sit far below the audience they
            actually draw. If a plan is built from English coverage, it will overweight the league and the World
            Cup and underweight almost everything else.
          </p>
          <p>
            What did not work: the wider &quot;Saudi culture&quot; topics this cut started with (streaming, youth
            culture, festivals beyond the ones named, and similar) tested at near-zero English press volume in the
            earlier scan, so they are not on this page. Saudi esports, Saudi motorsport and Saudi cinema are kept as
            low-priority context with one grounding fact each. The Saudi cinema Arabic seed (السينما السعودية, 80)
            passed its phrase check on 23 Sep with a caveat worth knowing: 21 of 22 probe hits read دور السينما
            السعودية, Saudi cinemas as theatres rather than an industry, and the outlets are mostly Egyptian
            (Al-Masry Al-Youm, Veto, Shorouk) reporting Egyptian films&rsquo; Saudi box office, so it now counts in
            the &quot;Arabic outwrites English&quot; cell as a box-office story told in Egypt&rsquo;s press. Two thin
            Arabic seeds are still not collocation-checked and are shown with a &quot;phrase check pending&quot; chip
            rather than as verified counts: صناعة السينما السعودية (13) and الرياضات الإلكترونية السعودية (3). The
            Saudi motorsport Arabic seed (رياضة السيارات السعودية) returned zero over 60 days and
            has been dropped from the page and the beat. The third data leg, search interest from Google Trends, is
            on the page for five of the ten topics (§ 03 and the sparklines on those cards), exported by hand on 17
            Sep 2026; the other five topics still rest on official visitor and broadcast numbers only. The page
            shows where signal exists, not where it was expected to.
          </p>
          <p className="dsg-note-live">
            Press counts are from one BigQuery scan of the ksa-culture beat, both languages, 2026-07-19 to
            2026-09-16, run 2026-09-22 (audits/culture-scan-60d-en-ar.csv). The 14-day English-only chips on each
            card are the earlier snapshot of 2026-09-17, the day the beat went live, kept for continuity. There is
            no backfill history yet for a live query to show anything meaningful, so this page states the known
            numbers directly instead of wiring a live feed that would have nothing behind it.
          </p>
        </div>

        {/* § 05 — SOURCES OF SIGNAL */}
        <div className="dsg-mast" style={{ marginTop: 48 }}>
          <span className="dsg-pill">§ 05</span>
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

        {/* § 06 — SOURCES */}
        <div className="dsg-sources">
          <details className="dsg-src-details">
            <summary>
              <span className="dsg-pill">§ 06</span>
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

        <p className="dsg-micro">Press data: SignalIQ 60-day EN + AR scan, 19 Jul to 16 Sep 2026, run 22 Sep 2026. Search data: Google Trends, exported 17 Sep 2026.</p>
      </main>

      <Colophon />
    </>
  );
}

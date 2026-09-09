/**
 * /ar/ksa-tourism-radar
 *
 * Arabic (MSA, RTL) edition of the KSA Tourism & Hospitality Radar.
 *
 * ── STATUS ──────────────────────────────────────────────────────────────────
 * NOINDEX AND UNLINKED, exactly like the Arabic travel page. No hreflang in
 * either direction until the language review is applied, because hreflang
 * pointing at a noindexed URL is an invalid cluster. Go-live checklist lives in
 * ../REVIEW-NOTES-RADARS.md.
 *
 * ── HOW IT STAYS IN SYNC ────────────────────────────────────────────────────
 * This page reads the SAME live data function as the English radar
 * (getKsaRadarData) and the SAME curated English content module. It adds only
 * an Arabic prose overlay. So:
 *   · every number on both pages comes from one source and cannot drift
 *   · the verdict engine, the low-sample floor and the median are shared, so
 *     the two pages can never disagree about what a signal is doing
 *   · a signal added in English appears here immediately, in English, marked
 *     with a "not yet translated" chip rather than silently disappearing
 *
 * The interactive lens/ring filter module from the English page is not ported.
 * It is an English client component; rebuilding it in Arabic is a second piece
 * of work. Here every signal is rendered, grouped by horizon, with no filter.
 */

import type { Metadata } from "next";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { getKsaRadarData } from "@/lib/ksa-radar/data";
import type { KsaRadarData, KsaLiveTopic } from "@/lib/ksa-radar/types";
import {
  GAPS, KPIS, RING_LABEL, SIGNALS, SRC_GROUPS, TALKS,
  VERDICT_META, LOW_SAMPLE_N, verdictFor,
} from "../../ksa-tourism-radar/content";
import { GAP_AR, KPI_AR, SIGNAL_AR, TALK_AR, UI } from "./content.ar";
import { ArabicFooter, ArabicHeader, DraftBanner } from "../_components/chrome";
import "../radar-ar.css";

const amiri = Amiri({ variable: "--font-ar-serif", subsets: ["arabic"], weight: ["400", "700"], display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ variable: "--font-ar-grot", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });

export const revalidate = 43200; // 12h, matching the English radar

export const metadata: Metadata = {
  title: UI.metaTitle,
  description: UI.metaDescription,
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/ar/ksa-tourism-radar" },
};

const EN_URL = "/ksa-tourism-radar";

/** Numbers inside Arabic prose need isolating so they read left to right. */
const Num = ({ children }: { children: React.ReactNode }) => (
  <span className="ar-num">{children}</span>
);

/* ── The Window: server-rendered SVG, ported with Arabic labels ──────────── */

function TheWindow({ live }: { live: KsaRadarData }) {
  if (!live.hasData || live.topics.length === 0) {
    return <p className="ar-micro">{UI.noWire}</p>;
  }
  const W = 860, H = 486, L = 64, T = 34;
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

  return (
    <div className="ar-window">
      {/* The SVG itself stays left-to-right: a scatter plot is not a text
          direction. Only the labels are Arabic. */}
      {/* React SVG props have no `dir`, so the LTR isolation goes on a wrapper.
          A scatter plot is not text: it keeps its left-to-right axes inside the
          RTL page, and only the labels are Arabic. */}
      <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={UI.windowAxisX}>
        <rect x={L} y={T} width={Math.max(vx - L, 0)} height={Math.max(hy - T, 0)} fill="#f5b81f" opacity={0.13} />
        <rect x={vx} y={T} width={Math.max(L + pw - vx, 0)} height={Math.max(hy - T, 0)} fill="#1a1410" opacity={0.05} />
        <rect x={L} y={hy} width={Math.max(vx - L, 0)} height={Math.max(T + ph - hy, 0)} fill="#1a1410" opacity={0.02} />
        <rect x={L} y={T} width={pw} height={ph} fill="none" stroke="rgba(26,20,16,.35)" />
        <line x1={vx} y1={T} x2={vx} y2={T + ph} stroke="rgba(26,20,16,.45)" />
        <line x1={L} y1={hy} x2={L + pw} y2={hy} stroke="rgba(26,20,16,.45)" />
        <text x={L + 10} y={T + 18} className="zl">{UI.windowZones.early}</text>
        <text x={L + pw - 10} y={T + 18} textAnchor="end" className="zl">{UI.windowZones.newsjack}</text>
        <text x={L + 10} y={T + ph + 15} className="zl">{UI.windowZones.check}</text>
        <text x={L + pw - 10} y={T + ph + 15} textAnchor="end" className="zl">{UI.windowZones.late}</text>
        <text x={L + pw / 2} y={H - 18} textAnchor="middle" className="ax">{UI.windowAxisX}</text>
        <text x={L + 6} y={T - 12} className="ax">{UI.windowAxisY}</text>
        <text x={vx} y={T + ph + 34} textAnchor="middle" className="axm">{UI.windowMedian}</text>
        <text x={L + pw - 6} y={hy - 6} textAnchor="end" className="axm">{UI.windowRising}</text>
        {live.topics.map((t) => {
          const x = X(t.n), y = Y(t.tr);
          const faith = t.lens === "faith";
          return (
            <g key={t.topic}>
              <circle cx={x} cy={y} r={5.5} fill={faith ? "#f5b81f" : "#1a1410"} stroke={faith ? "#1a1410" : "#f1ebde"} strokeWidth={1.2}>
                <title>{`${t.topic} · ${t.n.toLocaleString("en")} · ${(t.tr * 100).toFixed(1)}%`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      </div>
      <p className="ar-window-rules">{UI.windowRules}</p>
      <div className="ar-legend">
        {(["early", "whitespace", "newsjack", "late", "dormant", "recal"] as const).map((k) => (
          <span key={k}>
            <span className={"ar-verdict v-" + VERDICT_META[k].tone}>{UI.verdicts[k].label}</span>
            {UI.verdicts[k].note}
          </span>
        ))}
      </div>
      <p className="ar-micro">{UI.windowControl}</p>
    </div>
  );
}

/* ── Signal file ─────────────────────────────────────────────────────────── */

function SignalFile({ sig, live, median }: { sig: (typeof SIGNALS)[number]; live: KsaRadarData; median: number }) {
  const ar = SIGNAL_AR[sig.id];
  const translated = Boolean(ar);

  // Pick the loudest live topic feeding this signal, matching the English page's
  // one-line-per-signal read.
  let best: KsaLiveTopic | null = null;
  for (const t of live.topics) {
    if (sig.topics.includes(t.topic) && (!best || t.n > best.n)) best = t;
  }
  const n = best ? best.n : null;
  const tr = best ? best.tr : null;
  const verdict = verdictFor(n, tr, median, sig.demand, sig.catalyst, sig.status);
  const v = UI.verdicts[verdict];
  const lowSample = n !== null && n < LOW_SAMPLE_N;

  return (
    <div className="ar-file">
      <div className="ar-file-head">
        <h3 className="ar-file-name">{sig.ar || sig.name}</h3>
        <span className={"ar-verdict v-" + VERDICT_META[verdict].tone}>{v.label}</span>
        <span className="ar-status">{UI.statusLabels[sig.status] ?? sig.status}</span>
        {translated ? null : <span className="ar-untranslated">لم تُترجم بعد</span>}
      </div>

      <div className="ar-wire">
        {n !== null ? (
          <>
            <span>
              <b><Num>{n.toLocaleString("en")}</Num></b> {UI.articlesUnit}
            </span>
            <span>
              {lowSample ? UI.lowSample : <>الزخم <b><Num>{`${tr! >= 0 ? "+" : ""}${(tr! * 100).toFixed(0)}%`}</Num></b></>}
            </span>
          </>
        ) : (
          <span>{UI.wirePending}</span>
        )}
      </div>

      <div className="ar-chips">
        {(ar?.demand ?? sig.demand) ? <span className="ar-chip">الطلب: {ar?.demand ?? sig.demand}</span> : null}
        {(ar?.catalyst ?? sig.catalyst) ? <span className="ar-chip">المحفّز: {ar?.catalyst ?? sig.catalyst}</span> : null}
      </div>

      <p>{ar?.stat ?? sig.stat}</p>
      <div className="ar-srcs">
        {sig.statS.map((s) => (
          <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer" hrefLang="en">{s.t} ↗</a>
        ))}
      </div>

      <p className="ar-sig" style={{ marginTop: 12 }}>{ar?.sig ?? sig.sig}</p>
      <div className="ar-srcs">
        {sig.sigS.map((s) => (
          <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer" hrefLang="en">{s.t} ↗</a>
        ))}
      </div>

      <p className="ar-talk">{ar?.talk ?? sig.talk}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function ArabicKsaTourismRadarPage() {
  const live = await getKsaRadarData();

  const ns = live.topics.map((t) => t.n).sort((a, b) => a - b);
  const mid = Math.floor(ns.length / 2);
  const median = ns.length ? (ns.length % 2 ? ns[mid] : (ns[mid - 1] + ns[mid]) / 2) : 0;

  const byRing = [1, 2, 3].map((r) => SIGNALS.filter((s) => s.ring === r));
  const srcCount = SRC_GROUPS.reduce((n, g) => n + g.links.length, 0);

  return (
    <div dir="rtl" lang="ar" className={`ar-radar ${amiri.variable} ${plex.variable}`}>
      <DraftBanner text={UI.draftBanner} />
      <ArabicHeader active="tourism" switchHref={EN_URL} />

      <main>
        <section className="ar-shell ar-hero">
          <span className="ar-eyebrow">{UI.eyebrow}</span>
          <h1 className="ar-h1">{UI.h1}</h1>
          <p className="ar-lead">{UI.heroSub}</p>
        </section>

        <div className="ar-shell"><div className="ar-double" /></div>

        {/* § 01 the radar */}
        <section className="ar-shell">
          <div className="ar-mast">
            <span className="ar-pill">§ 01</span>
            <h2>{UI.s01}</h2>
            <span className="ar-rule" />
            <span className="ar-fresh">{live.hasData ? UI.liveAsOf(live.asOf) : UI.wirePending}</span>
          </div>

          {byRing.map((group, i) =>
            group.length === 0 ? null : (
              <div key={i}>
                <span className="ar-ring">{UI.ringLabels[i] ?? RING_LABEL[i]}</span>
                <div className="ar-files">
                  {group.map((s) => (
                    <SignalFile key={s.id} sig={s} live={live} median={median} />
                  ))}
                </div>
              </div>
            ),
          )}

          <div className="ar-metastrip" style={{ marginTop: 26 }}>
            <span>
              {UI.metaCurated}
              {live.hasData ? UI.metaDataAsOf(live.asOf) : ""}
            </span>
            <span>
              {UI.visionLabel} <b>{UI.visionValue}</b> {UI.visionSub}{" "}
              <a href="https://www.sta.gov.sa/en/vision2030" target="_blank" rel="noopener noreferrer" hrefLang="en">
                {UI.visionSrc} ↗
              </a>
            </span>
          </div>

          {/* § 02 the window */}
          <div className="ar-mast">
            <span className="ar-pill">§ 02</span>
            <h2>{UI.s02}</h2>
            <span className="ar-rule" />
          </div>
          <TheWindow live={live} />

          {/* § 03 KPIs */}
          <div className="ar-mast">
            <span className="ar-pill">§ 03</span>
            <h2>{UI.s03}</h2>
            <span className="ar-rule" />
          </div>
          <div className="ar-kpis">
            {KPIS.map((k) => {
              const a = KPI_AR[k.lbl];
              return (
                <div className="ar-kpi" key={k.lbl}>
                  <div className="ar-kpi-label">{a?.lbl ?? k.lbl}</div>
                  <div className="ar-kpi-val">{a?.val ?? k.val}</div>
                  {(a?.delta ?? k.delta) ? <div className="ar-kpi-delta">{a?.delta ?? k.delta}</div> : null}
                  <div className="ar-kpi-sub">{a?.sub ?? k.sub}</div>
                  <div className="ar-kpi-src">
                    {k.src.map((s) => (
                      <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer" hrefLang="en">{s.t} ↗</a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ar-honesty">{UI.honesty}</div>
        </section>

        {/* § 04 coverage gaps */}
        <div className="ar-band-p2">
          <div className="ar-shell">
            <div className="ar-mast" style={{ marginTop: 0 }}>
              <span className="ar-pill">§ 04</span>
              <h2>{UI.s04}</h2>
              <span className="ar-rule" />
            </div>
            <h2 className="ar-h2">{UI.gapsH2}</h2>
            <p className="ar-lead">{UI.gapsIntro}</p>
            <div className="ar-gapgrid">
              {GAPS.map((g) => {
                const a = GAP_AR[g.n];
                return (
                  <div className="ar-gapcard" key={g.n}>
                    <span className="ar-gapnum">{UI.gapLabel(g.n, g.talk)}</span>
                    <h3>{a?.t ?? g.t}</h3>
                    <p>{a?.p ?? g.p}</p>
                    <a href={g.src.u} target="_blank" rel="noopener noreferrer" hrefLang="en" className="ar-gapsrc">
                      {g.src.t} ↗
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* § 05 talks */}
        <div className="ar-band-ink">
          <div className="ar-shell">
            <div className="ar-mast" style={{ marginTop: 0 }}>
              <span className="ar-pill">§ 05</span>
              <h2>{UI.s05}</h2>
              <span className="ar-rule" />
            </div>
            <h2 className="ar-h2">{UI.talksH2}</h2>
            <div className="ar-talks">
              {TALKS.map((t) => {
                const a = TALK_AR[t.n];
                return (
                  <div className="ar-talk-card" key={t.n}>
                    <div className="ar-talk-num">{UI.talkNum(t.n)}</div>
                    <h3>{a?.t ?? t.t}</h3>
                    <p className="sub">{a?.s ?? t.s}</p>
                    <p className="body">{a?.p ?? t.p}</p>
                    <div className="fmt">
                      {(a?.fmt ?? t.fmt).map((f) => <span key={f}>{f}</span>)}
                    </div>
                    <p className="ev">{a?.ev ?? t.ev}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* speaker + CTA */}
        <section className="ar-shell">
          <div className="ar-final">
            <span className="ar-eyebrow">{UI.sessionEyebrow}</span>
            <h3 className="ar-h2" style={{ fontSize: "clamp(20px,2.8vw,28px)", margin: "6px 0 8px" }}>
              {UI.sessionTitle}
            </h3>
            <p style={{ margin: 0, color: "var(--ink70)", fontSize: 15.5, lineHeight: 1.9 }}>{UI.sessionBody}</p>
            <div className="ar-cta-row">
              <a className="ar-btn" href="/ar/speaking/earned-media-ai/travel">{UI.sessionCta} ←</a>
            </div>
          </div>

          <div className="ar-final">
            <span className="ar-eyebrow">{UI.speakerEyebrow}</span>
            <h2 className="ar-h2" style={{ margin: "10px 0 12px" }}>{UI.speakerH2}</h2>
            <p style={{ margin: 0, color: "var(--ink70)", fontSize: 16, lineHeight: 1.95 }}>{UI.speakerBody}</p>
            <div className="ar-cta-row">
              <a className="ar-btn" href="/strategy-call" hrefLang="en">{UI.ctaBook} ←</a>
              <a className="ar-tlink" href="/ar/speaking/earned-media-ai/travel">{UI.ctaSession}</a>
              <a className="ar-tlink" href="/earned-media-radar" hrefLang="en">{UI.ctaGlobalRadar}</a>
              <a className="ar-tlink" href="/ar/ksa-retail-radar">{UI.ctaSibling}</a>
            </div>
          </div>

          <section className="ar-sources">
            <details>
              <summary>
                <span className="ar-pill">{UI.sourcesPill}</span>
                <span style={{ fontFamily: "var(--grot)", fontSize: 12, color: "var(--ink55)" }}>
                  {UI.sourcesNote(srcCount)}
                </span>
              </summary>
              <div className="ar-srcflow">
                {SRC_GROUPS.map((g) => (
                  <p key={g.h}>
                    <b>{g.h}</b>
                    {g.links.map((l) => (
                      <a key={l.u} href={l.u} target="_blank" rel="noopener noreferrer" hrefLang="en">{l.t} ↗</a>
                    ))}
                  </p>
                ))}
              </div>
            </details>
            <p className="ar-micro">{UI.method}</p>
          </section>
        </section>
      </main>

      <ArabicFooter note={UI.englishNote} cta={UI.englishCta} href={EN_URL} />
    </div>
  );
}

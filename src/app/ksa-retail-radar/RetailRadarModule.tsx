"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RETAIL_LENSES, RETAIL_LENS_LABEL, retailDelta7, type RetailLens, type RetailLiveTopic, type RetailRadarData } from "@/lib/ksa-retail/types";
import { LOW_SAMPLE_N, RING_LABEL, SIGNALS, SIGNAL_BY_TOPIC, STATUS_META, VERDICT_META, verdictFor, type RetailSignal } from "./content";

type LensFilter = RetailLens | "all";
type MarkShape = "disc" | "square" | "ring" | "diamond";

const INK = "#1a1410";
const YEL = "#f5b81f";
const MARK: Record<RetailLens, MarkShape> = { brands: "disc", lifestyle: "square", macro: "ring", ecom: "diamond" };
const CATCOL: Record<RetailLens, string> = { brands: INK, lifestyle: INK, macro: INK, ecom: YEL };
const QUAD: Record<RetailLens, number> = {
  brands: -Math.PI / 4,
  lifestyle: Math.PI / 4,
  macro: (3 * Math.PI) / 4,
  ecom: (-3 * Math.PI) / 4,
};
const RING_RAD = [0.3, 0.56, 0.82];

const fmtK = (n: number): string => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.round(n)));
const pct = (x: number): string => {
  const s = x * 100;
  const abs = Math.abs(s);
  return (s >= 0 ? "+" : "−") + (abs >= 100 ? String(Math.round(abs)) : abs.toFixed(1)) + "%";
};
const chipClass = (l: RetailLens): string => "krr-chip" + (l === "ecom" ? " c-ecom" : "");

const sparkPoints = (series: number[]): { line: string; area: string } | null => {
  if (!series || series.length < 2) return null;
  const w = 150;
  const h = 40;
  const mn = Math.min(...series);
  const mx = Math.max(...series);
  const rg = mx - mn || 1;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 3 - ((v - mn) / rg) * (h - 6);
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
  return { line: pts, area: `0,${h} ${pts} ${w},${h}` };
};

function Spark({ series, color }: { series: number[]; color: string }) {
  const p = sparkPoints(series);
  if (!p) return null;
  return (
    <svg className="krr-kpi-spark" viewBox="0 0 150 40" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={p.area} fill={color} fillOpacity={0.12} />
      <polyline points={p.line} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** SVG legend mark, one per lens — matches the canvas shapes. */
function LensMark({ lens }: { lens: RetailLens }) {
  const c = CATCOL[lens];
  const m = MARK[lens];
  if (m === "disc") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill={c} /></svg>;
  if (m === "square") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" fill={c} /></svg>;
  if (m === "ring") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke={c} strokeWidth="2" /></svg>;
  return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill={c} transform="rotate(45 7 7)" /></svg>;
}

interface LiveLine {
  n: number;
  tr: number;
}

export default function RetailRadarModule({ live }: { live: RetailRadarData }) {
  const [lens, setLens] = useState<LensFilter>("all");
  const [selectedId, setSelectedId] = useState<string>("saudi-ecommerce");
  const lensRef = useRef<LensFilter>("all");
  const selRef = useRef<string>("saudi-ecommerce");
  useEffect(() => {
    lensRef.current = lens;
  }, [lens]);
  useEffect(() => {
    selRef.current = selectedId;
  }, [selectedId]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  /** topic -> live coverage row */
  const liveMap = useMemo(() => {
    const m = new Map<string, RetailLiveTopic>();
    for (const t of live.topics) m.set(t.topic, t);
    return m;
  }, [live.topics]);

  const liveFor = useMemo(() => {
    return (s: RetailSignal): LiveLine | null => {
      if (!live.hasData || s.topics.length === 0) return null;
      let n = 0;
      let trWeighted = 0;
      let seen = false;
      for (const topic of s.topics) {
        const row = liveMap.get(topic);
        if (!row) continue;
        seen = true;
        n += row.n;
        trWeighted += row.tr * Math.max(row.n, 1);
      }
      if (!seen) return null;
      return { n, tr: trWeighted / Math.max(n, s.topics.length) };
    };
  }, [live.hasData, liveMap]);

  const medianN = useMemo(() => {
    const ns = live.topics.map((t) => t.n).sort((a, b) => a - b);
    if (ns.length === 0) return 1;
    const mid = Math.floor(ns.length / 2);
    return ns.length % 2 ? ns[mid] : (ns[mid - 1] + ns[mid]) / 2;
  }, [live.topics]);

  const trendRisers = useMemo(() => live.risers.filter((t) => t.n >= LOW_SAMPLE_N).slice(0, 8), [live.risers]);

  const selected = SIGNALS.find((s) => s.id === selectedId) ?? SIGNALS[0];
  const selectedLive = liveFor(selected);
  const selectedVerdict = verdictFor(selectedLive?.n ?? null, selectedLive?.tr ?? null, medianN, selected.demand, selected.catalyst, selected.status);

  // ---- radar canvas (all helpers are arrow fns to preserve cv/ctx null-narrowing) ----
  useEffect(() => {
    const cv = canvasRef.current;
    const tip = tipRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const RM = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const byLens: Record<RetailLens, RetailSignal[]> = { ecom: [], brands: [], lifestyle: [], macro: [] };
    for (const s of SIGNALS) byLens[s.lens].push(s);
    const blips: { s: RetailSignal; ang: number; rad: number; ping: number; sx?: number; sy?: number }[] = [];
    (Object.keys(byLens) as RetailLens[]).forEach((cat) => {
      const arr = byLens[cat];
      arr.forEach((s, i) => {
        const spread = arr.length > 1 ? (i / (arr.length - 1) - 0.5) * 1.15 : 0;
        const jitter = (((i * 2.7) % 1) - 0.5) * 0.1;
        blips.push({ s, ang: QUAD[cat] + spread, rad: Math.max(0.16, Math.min(0.92, RING_RAD[s.ring - 1] + jitter)), ping: 0 });
      });
    });

    let size = 560;
    let cx = 280;
    let cy = 280;
    let R = 250;
    const sizeRadar = () => {
      const w = cv.parentElement ? cv.parentElement.clientWidth : 560;
      size = w;
      cx = w / 2;
      cy = w / 2;
      R = w / 2 - 20;
      cv.width = w * DPR;
      cv.height = w * DPR;
      cv.style.height = w + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    const polar = (a: number, r: number) => ({ x: cx + Math.cos(a) * r * R, y: cy + Math.sin(a) * r * R });

    const drawMark = (x: number, y: number, cat: RetailLens, base: number) => {
      const c = CATCOL[cat];
      const m = MARK[cat];
      if (m === "disc") {
        ctx.beginPath();
        ctx.arc(x, y, base, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
      } else if (m === "square") {
        const s = base * 1.7;
        ctx.fillStyle = c;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else if (m === "ring") {
        ctx.beginPath();
        ctx.arc(x, y, base, 0, Math.PI * 2);
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else {
        const d = base * 1.25;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = c;
        ctx.fillRect(-d, -d, d * 2, d * 2);
        ctx.restore();
      }
    };

    let sweep = 0;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      // horizon rings at the three ring radii + outer
      ctx.strokeStyle = "rgba(26,20,16,.16)";
      ctx.lineWidth = 1;
      [...RING_RAD, 1].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * Math.min(r + 0.09, 1), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(26,20,16,.1)";
      [0, Math.PI / 2].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R);
        ctx.stroke();
      });
      // ring labels up the top axis (canvas cannot resolve CSS vars — literal family)
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(26,20,16,.45)";
      RING_LABEL.forEach((t, i) => {
        ctx.fillText(t, cx, cy - R * (RING_RAD[i] + 0.045));
      });
      // quadrant labels
      ctx.font = "11px Archivo, sans-serif";
      ctx.fillStyle = "rgba(26,20,16,.5)";
      ctx.fillText("BRANDS & GROUPS", cx + R * 0.58, cy - R * 0.72);
      ctx.fillText("LIFESTYLE RETAIL", cx + R * 0.6, cy + R * 0.76);
      ctx.fillText("CONSUMER ECONOMY", cx - R * 0.6, cy + R * 0.76);
      ctx.fillStyle = "rgba(245,184,31,.95)";
      ctx.fillText("E-COMMERCE", cx - R * 0.62, cy - R * 0.72);
      // sweep
      for (let i = 0; i < 36; i++) {
        const a = sweep - i * 0.05;
        const grad = i / 36;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a - 0.055, a);
        ctx.closePath();
        ctx.fillStyle = "rgba(245,184,31," + 0.16 * (1 - grad) + ")";
        ctx.fill();
      }
      const le = polar(sweep, 1);
      ctx.strokeStyle = "rgba(245,184,31,.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(le.x, le.y);
      ctx.stroke();
      const cur = lensRef.current;
      const sel = selRef.current;
      blips.forEach((b) => {
        if (cur !== "all" && cur !== b.s.lens) {
          b.sx = undefined;
          return;
        }
        const d = (((sweep - b.ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (d < 0.06) b.ping = 1;
        b.ping *= 0.955;
        const p = polar(b.ang, b.rad);
        b.sx = p.x;
        b.sy = p.y;
        const base = 2.4 + b.s.size * 0.9 + b.ping * 4;
        if (b.s.id === sel) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, base + 7, 0, Math.PI * 2);
          ctx.strokeStyle = YEL;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.globalAlpha = 0.72 + b.ping * 0.28;
        drawMark(p.x, p.y, b.s.lens, base);
        ctx.globalAlpha = 1;
      });
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = YEL;
      ctx.fill();
    };
    const loop = () => {
      sweep += RM ? 0.006 : 0.013;
      if (sweep > Math.PI * 2) sweep -= Math.PI * 2;
      draw();
      raf = requestAnimationFrame(loop);
    };
    sizeRadar();
    raf = requestAnimationFrame(loop);

    const onResize = () => sizeRadar();
    window.addEventListener("resize", onResize);

    const nearest = (mx: number, my: number) => {
      let best: (typeof blips)[number] | null = null;
      let bd = 1e9;
      blips.forEach((b) => {
        if (b.sx == null || b.sy == null) return;
        const dx = b.sx - mx;
        const dy = b.sy - my;
        const dd = dx * dx + dy * dy;
        if (dd < bd) {
          bd = dd;
          best = b;
        }
      });
      return { best, bd };
    };
    const onMove = (e: MouseEvent) => {
      if (!tip) return;
      const rect = cv.getBoundingClientRect();
      const { best, bd } = nearest(e.clientX - rect.left, e.clientY - rect.top);
      if (best && bd < 320) {
        const bb = best as (typeof blips)[number];
        cv.style.cursor = "pointer";
        tip.style.left = (bb.sx ?? 0) + "px";
        tip.style.top = (bb.sy ?? 0) + "px";
        tip.style.opacity = "1";
        const lv = liveFor(bb.s);
        tip.innerHTML =
          '<span style="font-family:var(--font-grot);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-yellow)">' +
          RETAIL_LENS_LABEL[bb.s.lens] +
          " · " +
          RING_LABEL[bb.s.ring - 1] +
          '</span><b style="display:block">' +
          bb.s.name +
          "</b>" +
          '<span style="font-size:10.5px;opacity:.85">' +
          (lv ? lv.n.toLocaleString() + " articles / 60d · " + pct(lv.tr) : STATUS_META[bb.s.status].glyph + " " + STATUS_META[bb.s.status].note) +
          "</span>";
      } else {
        cv.style.cursor = "default";
        tip.style.opacity = "0";
      }
    };
    const onLeave = () => {
      if (tip) tip.style.opacity = "0";
    };
    const onClick = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const { best, bd } = nearest(e.clientX - rect.left, e.clientY - rect.top);
      if (best && bd < 480) setSelectedId((best as (typeof blips)[number]).s.id);
    };
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", onLeave);
    cv.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseleave", onLeave);
      cv.removeEventListener("click", onClick);
    };
  }, [liveFor]);

  const lenses: { l: LensFilter; label: string }[] = [
    { l: "all", label: "§ All" },
    { l: "ecom", label: "E-commerce" },
    { l: "brands", label: "Brands & groups" },
    { l: "lifestyle", label: "Lifestyle" },
    { l: "macro", label: "Consumer economy" },
  ];

  const totalSeries = useMemo(
    () => live.series.ecom.map((_, i) => live.series.ecom[i] + live.series.brands[i] + live.series.lifestyle[i] + live.series.macro[i]),
    [live.series],
  );

  return (
    <div className="krr-mod" data-lens={lens}>
      <div className="krr-lenses" role="tablist" aria-label="Filter by lens">
        {lenses.map((x) => (
          <button key={x.l} type="button" className="krr-lens" data-active={lens === x.l} aria-pressed={lens === x.l} onClick={() => setLens(x.l)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="krr-readout" aria-live="polite">
        {lens === "all" ? (
          <>
            Tracking <b>{SIGNALS.length} signals</b> across 4 lenses
            {live.hasData ? (
              <>
                {" "}
                · <b>{fmtK(live.grand)}</b> articles of press coverage over the last 60 days · <b>{live.heating}</b> heating
              </>
            ) : (
              <> · curated layer live · SignalIQ wire pending first scan</>
            )}
          </>
        ) : (
          <>
            <span className="krr-ro-lens">{RETAIL_LENS_LABEL[lens]}</span> · <b>{SIGNALS.filter((s) => s.lens === lens).length} signals</b>
            {live.hasData ? (
              <>
                {" "}
                · <b>{fmtK(live.lensTotal[lens])}</b> articles / 60d · {retailDelta7(live.series[lens]) >= 0 ? "▲" : "▼"} {pct(retailDelta7(live.series[lens]))} week
                over week
              </>
            ) : null}
          </>
        )}
      </div>

      <div className="krr-stage-grid">
        <div className="krr-radar-stage">
          <canvas ref={canvasRef} className="krr-radar-canvas" width={620} height={620} aria-label="Radar of 25 Saudi retail and consumer signals by lens and time horizon. The same data is listed in the signal index below." />
          <div ref={tipRef} className="krr-radar-tip" />
        </div>

        {/* signal file (detail card) */}
        <aside className="krr-file" aria-live="polite">
          <div className="krr-scaps">Signal file · {RING_LABEL[selected.ring - 1]}</div>
          <h3 className="krr-file-name">{selected.name}</h3>
          <div className="krr-file-ar" dir="rtl">{selected.ar}</div>
          <div className="krr-file-badges">
            <span className={chipClass(selected.lens)}>{RETAIL_LENS_LABEL[selected.lens]}</span>
            <span className="krr-chip">
              {STATUS_META[selected.status].glyph} {STATUS_META[selected.status].label} · {STATUS_META[selected.status].note}
            </span>
          </div>
          <p className="krr-file-stat">{selected.stat}</p>
          <p className="krr-file-sig">
            <span className="krr-file-lbl">Latest signal</span>
            {selected.sig}
          </p>
          <div className="krr-file-verdict">
            <span className="row"><b>Press</b>{selectedLive ? `${selectedLive.n.toLocaleString()} articles · ${selectedLive.n < LOW_SAMPLE_N ? "sample too small for a trend" : selectedLive.tr >= 0.1 ? "rising" : selectedLive.tr <= -0.1 ? "falling" : "flat"}` : selected.topics.length === 0 ? "context only, untracked by design" : "wire pending"}</span>
            <span className="row"><b>Reality</b>{selected.demand || "none on file"}</span>
            <span className="row"><b>Next</b>{selected.catalyst || "none scheduled"}</span>
            <span className={"krr-verdict v-" + VERDICT_META[selectedVerdict].tone}>{VERDICT_META[selectedVerdict].label}</span>
            <span className="vnote">{VERDICT_META[selectedVerdict].note}{selectedLive ? ` · SignalIQ × GDELT, as of ${live.asOf}` : ""}</span>
          </div>
          <p className="krr-file-talk">
            <b>Talk angle:</b> {selected.talk}
          </p>
          <p className="krr-file-srcs">
            {[...selected.statS, ...selected.sigS].map((sl) => (
              <a key={sl.u + sl.t} href={sl.u} target="_blank" rel="noopener noreferrer">
                {sl.t} ↗
              </a>
            ))}
          </p>
        </aside>
      </div>

      <div className="krr-radar-legend">
        {RETAIL_LENSES.map((l) => (
          <span className="krr-lg" key={l}>
            <LensMark lens={l} />
            {RETAIL_LENS_LABEL[l]}
          </span>
        ))}
      </div>

      <div className="krr-read-help krr-read-below">
        <p className="krr-body">
          Each mark is one Saudi retail or consumer signal. <b>Distance from the centre is time</b>: inner ring is live now, the middle is building, the
          outer ring is the 2030+ horizon. <b>Mark size is the scale of the bet.</b> Click any mark, or any row below, to open its signal file.
        </p>
      </div>

      {/* signal index: four lens columns */}
      <div className="krr-cols">
        {RETAIL_LENSES.map((l) => (
          <div className="krr-col" key={l} data-cat={l}>
            <h4 className="krr-col-head">
              <LensMark lens={l} />
              {RETAIL_LENS_LABEL[l]}
            </h4>
            <ul>
              {SIGNALS.filter((s) => s.lens === l).map((s) => {
                const lv = liveFor(s);
                return (
                  <li key={s.id}>
                    <button type="button" data-active={s.id === selectedId} onClick={() => setSelectedId(s.id)}>
                      <span className="nm">{s.name}</span>
                      <span className="st">
                        {lv ? fmtK(lv.n) + " · " : ""}
                        {STATUS_META[s.status].glyph} {RING_LABEL[s.ring - 1].split(" ")[0]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ---- live wire band ---- */}
      <div className="krr-mast" style={{ marginTop: 46 }}>
        <span className="krr-pill">Live wire</span>
        <span className="krr-scaps">SignalIQ × GDELT BigQuery · Arabic + English press volume</span>
      </div>

      {live.hasData ? (
        <>
          <div className="krr-kpis-band">
            <div className="krr-kpis">
              <div className="krr-kpi" data-cat="all">
                <div className="krr-kpi-label">Total coverage · 60d</div>
                <div className="krr-kpi-val">{fmtK(live.grand)}</div>
                <div className="krr-kpi-delta">{retailDelta7(totalSeries) >= 0 ? "▲" : "▼"} {pct(retailDelta7(totalSeries))} 7d</div>
                <Spark series={totalSeries} color={INK} />
              </div>
              {RETAIL_LENSES.map((l) => (
                <div className="krr-kpi" data-cat={l} key={l}>
                  <div className="krr-kpi-label">{RETAIL_LENS_LABEL[l]} · 60d</div>
                  <div className="krr-kpi-val">{fmtK(live.lensTotal[l])}</div>
                  <div className="krr-kpi-delta">{retailDelta7(live.series[l]) >= 0 ? "▲" : "▼"} {pct(retailDelta7(live.series[l]))} 7d</div>
                  <Spark series={live.series[l]} color={l === "ecom" ? YEL : INK} />
                </div>
              ))}
              <div className="krr-kpi" data-cat="all">
                <div className="krr-kpi-label">Heating up now</div>
                <div className="krr-kpi-val">
                  {live.heating}
                  <span className="u"> / {live.topics.length}</span>
                </div>
                <div className="krr-kpi-note">{live.risers[0] ? `▲ ${live.risers[0].topic} ${pct(live.risers[0].tr)}` : "topics with rising coverage"}</div>
              </div>
            </div>
          </div>

          <div className="krr-panels">
            <div className="krr-panel">
              <div className="krr-panel-head">
                <span className="krr-scaps">Trending in the Saudi consumer story</span>
                <span className="krr-mono">momentum · 30d</span>
              </div>
              <div className="krr-panel-explain">Rising and quiet is the early window. Rising and loud means enter fast, with a data angle.</div>
              <div className="krr-panel-body">
                {trendRisers.length === 0 ? (
                  <div className="krr-panel-explain">
                    No tracked retail topic currently clears the {LOW_SAMPLE_N}-article floor with rising momentum. In this category that is the finding:
                    the coverage is thin enough that the whitespace panel on the right is where the opportunity lives.
                  </div>
                ) : (
                  trendRisers.map((t, i) => (
                    <div className={"krr-list-row cat-" + t.lens} key={t.topic}>
                      <span className="krr-rank">{i + 1}</span>
                      <div className="krr-row-main">
                        <div className="krr-row-name">
                          <span className={chipClass(t.lens)}>{RETAIL_LENS_LABEL[t.lens]}</span>
                          {t.topic}
                        </div>
                        <div className="krr-bar">
                          <i className={t.lens === "ecom" ? "krr-bar-y" : ""} style={{ width: (t.tr / Math.max(trendRisers[0]?.tr || 1, 0.01)) * 100 + "%" }} />
                        </div>
                      </div>
                      <span className="krr-mom">{pct(t.tr)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="krr-panel">
              <div className="krr-panel-head">
                <span className="krr-scaps">Quiet · check the demand</span>
                <span className="krr-mono">fewest articles first</span>
              </div>
              <div className="krr-panel-explain">
                Quiet means few articles, not no interest. The test: is reality (revenue, transactions, a dated catalyst) ahead of the coverage? If yes,
                whitespace you can own; if no, dormant. Counts are exact-phrase, so variants can undercount, and under {LOW_SAMPLE_N} articles a trend
                percentage is noise, so we say low sample instead.
              </div>
              <div className="krr-panel-body">
                {live.quiet.map((t) => {
                  const sig = SIGNAL_BY_TOPIC.get(t.topic);
                  const v = verdictFor(t.n, t.tr, medianN, sig?.demand, sig?.catalyst, sig?.status ?? "steady");
                  return (
                    <div className={"krr-list-row cat-" + t.lens} key={t.topic}>
                      <div className="krr-row-main">
                        <div className="krr-row-name">
                          <span className={chipClass(t.lens)}>{RETAIL_LENS_LABEL[t.lens]}</span>
                          {t.topic}
                          <span className={"krr-verdict sm v-" + VERDICT_META[v].tone}>{VERDICT_META[v].label}</span>
                        </div>
                        {sig ? <div className="krr-quiet-demand">vs {sig.demand}</div> : null}
                      </div>
                      <span className="krr-gapval">
                        {t.n.toLocaleString()} articles · {t.n < LOW_SAMPLE_N ? "low sample" : pct(t.tr)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="krr-pending">
          <p className="krr-body">
            The curated layer above is the snapshot. This band becomes the <b>daily-refreshing momentum layer</b>: per-topic article counts computed from
            GDELT&rsquo;s Web News NGrams corpus (global press in 65 languages, Arabic included) via Google BigQuery, using the same SignalIQ pipeline already
            live on the{" "}
            <a href="/earned-media-radar" className="krr-tlink-inline">
              Earned Media Radar
            </a>
            .
          </p>
          <div className="krr-skel" />
          <div className="krr-skel" />
          <p className="krr-micro">No fabricated trend lines: these stay empty until the first scans land. That is the house rule.</p>
        </div>
      )}
    </div>
  );
}

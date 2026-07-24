"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LENSES, LENS_LABEL, delta7, type Lens, type RadarData, type RadarTopic } from "@/lib/radar/types";

type LensFilter = Lens | "all";
type MarkShape = "disc" | "square" | "ring" | "diamond";

const INK = "#1a1410";
const YEL = "#f5b81f";
const MARK: Record<Lens, MarkShape> = { pr: "disc", earned: "square", seo: "ring", geo: "diamond" };
const CATCOL: Record<Lens, string> = { pr: INK, earned: INK, seo: INK, geo: YEL };
const QUAD: Record<Lens, number> = {
  pr: -Math.PI / 4,
  earned: Math.PI / 4,
  seo: (3 * Math.PI) / 4,
  geo: (-3 * Math.PI) / 4,
};

const fmtK = (n: number): string => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.round(n)));
const pct = (x: number): string => {
  const s = x * 100;
  const abs = Math.abs(s);
  return (s >= 0 ? "+" : "−") + (abs >= 100 ? String(Math.round(abs)) : abs.toFixed(1)) + "%";
};
const chipClass = (l: Lens): string => "emr-chip" + (l === "geo" ? " c-geo" : "");

function sparkPoints(series: number[]): { line: string; area: string } | null {
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
}

function Spark({ series, color }: { series: number[]; color: string }) {
  const p = sparkPoints(series);
  if (!p) return null;
  return (
    <svg className="emr-kpi-spark" viewBox="0 0 150 40" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={p.area} fill={color} fillOpacity={0.12} />
      <polyline points={p.line} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** SVG legend/label mark, one per lens — matches the shapes drawn on the canvas. */
function LensMark({ lens }: { lens: Lens }) {
  const c = CATCOL[lens];
  const m = MARK[lens];
  if (m === "disc") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill={c} /></svg>;
  if (m === "square") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" fill={c} /></svg>;
  if (m === "ring") return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke={c} strokeWidth="2" /></svg>;
  return <svg className="m" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill={c} transform="rotate(45 7 7)" /></svg>;
}

interface FeedItem {
  key: number;
  lens: Lens;
  text: string;
  meta: string;
  d: number;
}

function feedLine(t: RadarTopic): string {
  const n = t.n.toLocaleString();
  if (t.tr > 0.4) return `“${t.topic}” is breaking out. Press coverage ${pct(t.tr)} in 30 days.`;
  if (t.tr > 0) return `“${t.topic}” is rising, ${pct(t.tr)} on ${n} articles.`;
  if (t.tr < -0.4) return `“${t.topic}” has gone quiet, ${pct(t.tr)}. A wide-open lane.`;
  if (t.tr < 0) return `“${t.topic}” is cooling, ${pct(t.tr)} on ${n} articles.`;
  return `“${t.topic}” holding steady at ${n} articles.`;
}

interface Kpi {
  label: string;
  value: string;
  unit: string;
  series: number[];
  color: string;
  cat: LensFilter;
  delta?: number;
  note?: string;
}

export default function RadarModule({ data }: { data: RadarData }) {
  const [lens, setLens] = useState<LensFilter>("all");
  const lensRef = useRef<LensFilter>("all");
  useEffect(() => {
    lensRef.current = lens;
  }, [lens]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const sweepLblRef = useRef<HTMLSpanElement | null>(null);

  // ---- derived, from real data ----
  const totalSeries = useMemo(
    () => data.series.pr.map((_, i) => data.series.pr[i] + data.series.earned[i] + data.series.seo[i] + data.series.geo[i]),
    [data.series],
  );

  const kpis = useMemo<Kpi[]>(() => {
    const top = data.risers[0];
    return [
      { label: "Total coverage · 30d", value: fmtK(data.grand), unit: "", series: totalSeries, color: INK, cat: "all", delta: delta7(totalSeries) },
      { label: "PR · press volume 30d", value: fmtK(data.lensTotal.pr), unit: "", series: data.series.pr, color: INK, cat: "pr", delta: delta7(data.series.pr) },
      { label: "Earned media · 30d", value: fmtK(data.lensTotal.earned), unit: "", series: data.series.earned, color: INK, cat: "earned", delta: delta7(data.series.earned) },
      { label: "SEO · 30d", value: fmtK(data.lensTotal.seo), unit: "", series: data.series.seo, color: INK, cat: "seo", delta: delta7(data.series.seo) },
      { label: "GEO / AI-search · 30d", value: fmtK(data.lensTotal.geo), unit: "", series: data.series.geo, color: YEL, cat: "geo", delta: delta7(data.series.geo) },
      {
        label: "Heating up now",
        value: String(data.heating),
        unit: " / " + data.topics.length,
        series: totalSeries,
        color: INK,
        cat: "all",
        note: top ? `▲ ${top.topic} ${pct(top.tr)}` : "",
      },
    ];
  }, [data, totalSeries]);

  const risers = useMemo(() => data.risers.slice(0, 8), [data.risers]);
  const gaps = data.gaps;
  const maxRise = risers.length ? Math.max(...risers.map((t) => t.tr)) : 1;

  const feedPool = useMemo<FeedItem[]>(() => {
    const ordered = data.topics.slice().sort((a, b) => Math.abs(b.tr) - Math.abs(a.tr));
    return ordered.map((t, i) => ({
      key: i,
      lens: t.lens,
      text: feedLine(t),
      meta: `${LENS_LABEL[t.lens]} · ${t.n.toLocaleString()} articles`,
      d: t.tr,
    }));
  }, [data.topics]);

  // ---- feed cycling (real coverage facts) ----
  const [feed, setFeed] = useState<FeedItem[]>([]);
  useEffect(() => {
    if (feedPool.length === 0) {
      setFeed([]);
      return;
    }
    let counter = feedPool.length;
    setFeed(feedPool.slice(0, 8).map((f, i) => ({ ...f, key: i })));
    const RM = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const id = setInterval(
      () => {
        setFeed((prev) => {
          const next = feedPool[counter % feedPool.length];
          counter += 1;
          return [{ ...next, key: counter }, ...prev].slice(0, 24);
        });
      },
      RM ? 9000 : 6500,
    );
    return () => clearInterval(id);
  }, [feedPool]);

  // ---- radar canvas (all helpers are arrow fns to preserve cv/ctx null-narrowing) ----
  useEffect(() => {
    const cv = canvasRef.current;
    const tip = tipRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const RM = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const byCat: Record<Lens, RadarTopic[]> = { pr: [], earned: [], seo: [], geo: [] };
    for (const t of data.topics) byCat[t.lens].push(t);
    const blips: { cat: Lens; ang: number; rad: number; label: string; n: number; tr: number; ping: number; sx?: number; sy?: number }[] = [];
    (Object.keys(byCat) as Lens[]).forEach((cat) => {
      const arr = byCat[cat];
      arr.forEach((t, i) => {
        const spread = arr.length > 1 ? (i / (arr.length - 1) - 0.5) * 1.15 : 0;
        blips.push({ cat, ang: QUAD[cat] + spread, rad: Math.max(0.16, Math.min(0.92, 0.88 - t.vol * 0.6)), label: t.topic, n: t.n, tr: t.tr, ping: 0 });
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

    const drawMark = (x: number, y: number, cat: Lens, base: number) => {
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
      ctx.strokeStyle = "rgba(26,20,16,.16)";
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * r) / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(26,20,16,.1)";
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R);
        ctx.stroke();
      });
      ctx.font = "11px Archivo, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(26,20,16,.5)";
      ctx.fillText("PR", cx + R * 0.66, cy - R * 0.66);
      ctx.fillText("EARNED", cx + R * 0.62, cy + R * 0.7);
      ctx.fillText("SEO", cx - R * 0.66, cy + R * 0.7);
      ctx.fillStyle = "rgba(245,184,31,.95)";
      ctx.fillText("GEO", cx - R * 0.64, cy - R * 0.66);
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
      blips.forEach((b) => {
        if (cur !== "all" && cur !== b.cat) {
          b.sx = undefined;
          return;
        }
        const d = (((sweep - b.ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (d < 0.06) b.ping = 1;
        b.ping *= 0.955;
        const p = polar(b.ang, b.rad);
        b.sx = p.x;
        b.sy = p.y;
        const base = 3 + b.ping * 4.5;
        ctx.globalAlpha = 0.72 + b.ping * 0.28;
        drawMark(p.x, p.y, b.cat, base);
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
      if (sweepLblRef.current) sweepLblRef.current.textContent = "live · sweep " + (((Math.round((sweep * 180) / Math.PI) % 360) + 360) % 360) + "°";
      raf = requestAnimationFrame(loop);
    };
    sizeRadar();
    raf = requestAnimationFrame(loop);

    const onResize = () => sizeRadar();
    window.addEventListener("resize", onResize);
    const onMove = (e: MouseEvent) => {
      if (!tip) return;
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
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
      if (best && bd < 260) {
        const bb = best as (typeof blips)[number];
        tip.style.left = (bb.sx ?? 0) + "px";
        tip.style.top = (bb.sy ?? 0) + "px";
        tip.style.opacity = "1";
        tip.innerHTML =
          '<span style="font-family:var(--font-grot);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-yellow)">' +
          LENS_LABEL[bb.cat] +
          '</span><b style="display:block">' +
          bb.label +
          '</b><span style="font-size:10.5px;opacity:.8">' +
          bb.n.toLocaleString() +
          " articles · " +
          pct(bb.tr) +
          "</span>";
      } else {
        tip.style.opacity = "0";
      }
    };
    const onLeave = () => {
      if (tip) tip.style.opacity = "0";
    };
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseleave", onLeave);
    };
  }, [data]);

  const lenses: { l: LensFilter; label: string }[] = [
    { l: "all", label: "§ All" },
    { l: "pr", label: "PR" },
    { l: "earned", label: "Earned Media" },
    { l: "seo", label: "SEO" },
    { l: "geo", label: "GEO" },
  ];

  return (
    <div className="emr-mod" data-lens={lens}>
      <div className="emr-read-help">
        <p className="emr-body">
          Each mark is a topic your buyers and the press care about. <b>Near the centre</b> means the press is already saturated &mdash; you&rsquo;re late.{" "}
          <b>Out at the edge</b> means it&rsquo;s quiet, and quiet is where you can still become the source reporters cite.
        </p>
      </div>

      <div className="emr-lenses" role="tablist" aria-label="Filter by lens">
        {lenses.map((x) => (
          <button key={x.l} type="button" className="emr-lens" data-active={lens === x.l} aria-pressed={lens === x.l} onClick={() => setLens(x.l)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="emr-readout" aria-live="polite">
        {lens === "all" ? (
          <>
            Tracking <b>{data.topics.length} topics</b> across 4 lenses · <b>{fmtK(data.grand)}</b> articles of press coverage in the last 30 days
          </>
        ) : (
          <>
            <span className="emr-ro-lens">{LENS_LABEL[lens]}</span> · <b>{data.lensCount[lens]} topics</b> · <b>{fmtK(data.lensTotal[lens])}</b> articles / 30d ·{" "}
            {delta7(data.series[lens]) >= 0 ? "▲" : "▼"} {pct(delta7(data.series[lens]))} week over week
          </>
        )}
      </div>

      <div className="emr-radar-stage">
        <canvas ref={canvasRef} className="emr-radar-canvas" width={620} height={620} />
        <div ref={tipRef} className="emr-radar-tip" />
      </div>
      <div className="emr-radar-foot">
        <span>each mark = one tracked topic</span>
        <span ref={sweepLblRef}>live</span>
      </div>
      <div className="emr-radar-legend">
        {LENSES.map((l) => (
          <span className="emr-lg" key={l}>
            <LensMark lens={l} />
            {LENS_LABEL[l]}
          </span>
        ))}
      </div>
      <p className="emr-help-line">Filter by lens &mdash; the radar, the six numbers, and the lists below all narrow to it.</p>

      {/* BIG KPI BAND */}
      <div className="emr-kpis-band">
        <div className="emr-kpis">
          {kpis.map((k, i) => {
            const up = (k.delta ?? 0) >= 0;
            const dotColor = k.cat === "all" ? INK : CATCOL[k.cat];
            const isRing = k.cat !== "all" && MARK[k.cat] === "ring";
            const isDiamond = k.cat !== "all" && MARK[k.cat] === "diamond";
            const dotStyle: CSSProperties = isRing
              ? { background: "transparent", border: `2px solid ${INK}` }
              : { background: dotColor, ...(isDiamond ? { transform: "rotate(45deg)" } : {}) };
            return (
              <div className="emr-kpi" data-cat={k.cat} key={i}>
                <div className="emr-kpi-label">
                  <span className="kd" style={dotStyle} />
                  {k.label}
                </div>
                <div className="emr-kpi-val">
                  {k.value}
                  {k.unit ? <span className="u">{k.unit}</span> : null}
                </div>
                {k.note ? (
                  <div className="emr-kpi-note">{k.note}</div>
                ) : (
                  <div className={"emr-kpi-delta " + (up ? "emr-up" : "emr-down")}>
                    {up ? "▲" : "▼"} {Math.abs((k.delta ?? 0) * 100).toFixed(1)}% <span style={{ color: "var(--color-ink-55)" }}>7d</span>
                  </div>
                )}
                {k.note ? null : <Spark series={k.series} color={k.color} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* TRENDING + GAPS */}
      <div className="emr-panels">
        <div className="emr-panel">
          <div className="emr-panel-head">
            <span className="emr-scaps">Trending topics</span>
            <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
              momentum &middot; 30d
            </span>
          </div>
          <div className="emr-panel-explain">The beats where press coverage is accelerating right now.</div>
          <div className="emr-panel-body">
            {risers.map((t, i) => (
              <div className={"emr-list-row cat-" + t.lens} key={t.topic}>
                <span className="emr-rank">{i + 1}</span>
                <div className="emr-row-main">
                  <div className="emr-row-name">
                    <span className={chipClass(t.lens)}>{LENS_LABEL[t.lens]}</span>
                    {t.topic}
                  </div>
                  <div className="emr-bar">
                    <i className={t.lens === "geo" ? "emr-bar-y" : ""} style={{ width: (t.tr / maxRise) * 100 + "%" }} />
                  </div>
                </div>
                <span className="emr-mom emr-up">{pct(t.tr)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="emr-panel">
          <div className="emr-panel-head">
            <span className="emr-scaps">Coverage gaps</span>
            <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
              quiet &middot; ownable
            </span>
          </div>
          <div className="emr-panel-explain">
            <b>Quiet</b> = very few articles. <b>Ownable</b> = so little competition that one good asset can make you the source. These are your openings.
          </div>
          <div className="emr-panel-body">
            {gaps.map((t) => (
              <div className={"emr-list-row cat-" + t.lens} key={t.topic}>
                <div className="emr-row-main">
                  <div className="emr-row-name">
                    <span className={chipClass(t.lens)}>{LENS_LABEL[t.lens]}</span>
                    {t.topic}
                  </div>
                  <div className="emr-bar">
                    <i className={t.lens === "geo" ? "emr-bar-y" : ""} style={{ width: Math.max(6, (1 - t.vol) * 100) + "%" }} />
                  </div>
                </div>
                <span className="emr-gapval">
                  {t.n.toLocaleString()} articles &middot; {pct(t.tr)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEED */}
      <div className="emr-feed-wrap">
        <div className="emr-panel-head">
          <span className="emr-scaps">Signal feed</span>
          <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
            live coverage moves
          </span>
        </div>
        <div className="emr-feed">
          {feed.map((x, i) => {
            const up = x.d >= 0;
            return (
              <div className={"emr-feed-item cat-" + x.lens + (i === 0 ? " emr-new" : "")} key={x.key}>
                <div className="emr-feed-top">
                  <span className={chipClass(x.lens)}>{LENS_LABEL[x.lens]}</span>
                  <span className={"emr-feed-mom " + (up ? "emr-up" : "emr-down")}>{pct(x.d)}</span>
                </div>
                <div className="emr-feed-text">{x.text}</div>
                <div className="emr-feed-meta">{x.meta}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

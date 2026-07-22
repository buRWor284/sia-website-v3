"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LENS_LABEL, delta7, type Lens, type RadarData, type RadarTopic } from "@/lib/radar/types";

type LensFilter = Lens | "all";

const CATS: Record<Lens, { c: string; op: number; name: string }> = {
  pr: { c: "#1a1410", op: 1, name: "PR" },
  earned: { c: "#1a1410", op: 0.72, name: "Earned Media" },
  seo: { c: "#1a1410", op: 0.5, name: "SEO" },
  geo: { c: "#f5b81f", op: 1, name: "GEO" },
};
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

function sparkPoints(series: number[]): { line: string; area: string } | null {
  if (!series || series.length < 2) return null;
  const w = 150;
  const h = 34;
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
    <svg className="emr-kpi-spark" viewBox="0 0 150 34" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={p.area} fill={color} fillOpacity={0.14} />
      <polyline points={p.line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface FeedItem {
  key: number;
  lens: Lens;
  text: string;
  meta: string[];
  d: number;
}

function feedLine(t: RadarTopic): string {
  const n = t.n.toLocaleString();
  if (t.tr > 0.4) return `“${t.topic}” is breaking out. Press coverage ${pct(t.tr)} in 30 days.`;
  if (t.tr > 0) return `“${t.topic}” is rising, ${pct(t.tr)} on ${n} articles.`;
  if (t.tr < -0.4) return `“${t.topic}” has gone quiet, ${pct(t.tr)}. An open lane.`;
  if (t.tr < 0) return `“${t.topic}” is cooling, ${pct(t.tr)} on ${n} articles.`;
  return `“${t.topic}” holding steady at ${n} articles.`;
}

interface Kpi {
  label: string;
  value: string;
  unit: string;
  series: number[];
  color: string;
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
      { label: "Total coverage · 30d", value: fmtK(data.grand), unit: "", series: totalSeries, color: "#1a1410", delta: delta7(totalSeries) },
      { label: "PR · press volume 30d", value: fmtK(data.lensTotal.pr), unit: "", series: data.series.pr, color: "#1a1410", delta: delta7(data.series.pr) },
      { label: "Earned media · 30d", value: fmtK(data.lensTotal.earned), unit: "", series: data.series.earned, color: "#1a1410", delta: delta7(data.series.earned) },
      { label: "SEO · 30d", value: fmtK(data.lensTotal.seo), unit: "", series: data.series.seo, color: "#1a1410", delta: delta7(data.series.seo) },
      { label: "GEO / AI-search · 30d", value: fmtK(data.lensTotal.geo), unit: "", series: data.series.geo, color: "#f5b81f", delta: delta7(data.series.geo) },
      {
        label: "Heating up now",
        value: String(data.heating),
        unit: " / " + data.topics.length,
        series: totalSeries,
        color: "#1a1410",
        note: top ? `${top.topic.length > 22 ? top.topic.slice(0, 20) + "…" : top.topic} ${pct(top.tr)}` : "",
      },
    ];
  }, [data, totalSeries]);

  const risers = useMemo(() => data.risers.slice(0, 8), [data.risers]);
  const gaps = data.gaps;

  const captions = useMemo(() => {
    const out = [
      "Near center means the press is already saturated. Out at the edge is quiet, and quiet is where you can still own the story.",
    ];
    const top = data.risers[0];
    if (top) out.push(`“${top.topic}” coverage is up ${pct(top.tr)} in a month. Being early to a rising beat is the whole game.`);
    const quiet = data.topics.filter((t) => t.tr < 0).sort((a, b) => a.tr - b.tr)[0];
    if (quiet) out.push(`“${quiet.topic}” coverage has gone almost silent, ${pct(quiet.tr)}. That is not a dead topic. That is an open lane.`);
    return out;
  }, [data]);

  const feedPool = useMemo<FeedItem[]>(() => {
    const ordered = data.topics.slice().sort((a, b) => Math.abs(b.tr) - Math.abs(a.tr));
    return ordered.map((t, i) => ({
      key: i,
      lens: t.lens,
      text: feedLine(t),
      meta: [LENS_LABEL[t.lens], `${t.n.toLocaleString()} articles`],
      d: t.tr,
    }));
  }, [data.topics]);

  // ---- caption cycling ----
  const [capIdx, setCapIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCapIdx((i) => i + 1), 7000);
    return () => clearInterval(id);
  }, []);

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
    const id = setInterval(() => {
      setFeed((prev) => {
        const next = feedPool[counter % feedPool.length];
        counter += 1;
        return [{ ...next, key: counter }, ...prev].slice(0, 26);
      });
    }, RM ? 9000 : 6200);
    return () => clearInterval(id);
  }, [feedPool]);

  // ---- radar canvas ----
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

    let size = 300;
    let cx = 150;
    let cy = 150;
    let R = 130;
    const sizeRadar = () => {
      const w = cv.parentElement ? cv.parentElement.clientWidth : 380;
      size = w;
      cx = w / 2;
      cy = w / 2;
      R = w / 2 - 16;
      cv.width = w * DPR;
      cv.height = w * DPR;
      cv.style.height = w + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    const polar = (a: number, r: number) => ({ x: cx + Math.cos(a) * r * R, y: cy + Math.sin(a) * r * R });

    let sweep = 0;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = "rgba(26,20,16,.15)";
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
      ctx.font = "10px Archivo, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(26,20,16,.5)";
      ctx.fillText("PR", cx + R * 0.62, cy - R * 0.62);
      ctx.fillText("EARNED", cx + R * 0.6, cy + R * 0.66);
      ctx.fillText("SEO", cx - R * 0.62, cy + R * 0.66);
      ctx.fillStyle = "rgba(245,184,31,.95)";
      ctx.fillText("GEO", cx - R * 0.6, cy - R * 0.62);
      for (let i = 0; i < 34; i++) {
        const a = sweep - i * 0.05;
        const grad = i / 34;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a - 0.055, a);
        ctx.closePath();
        ctx.fillStyle = "rgba(245,184,31," + 0.14 * (1 - grad) + ")";
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
        const d = (((sweep - b.ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (d < 0.06) b.ping = 1;
        b.ping *= 0.955;
        const p = polar(b.ang, b.rad);
        b.sx = p.x;
        b.sy = p.y;
        const dim = cur !== "all" && cur !== b.cat;
        const meta = CATS[b.cat];
        const base = 2.6 + b.ping * 4;
        ctx.globalAlpha = (dim ? 0.14 : 0.6 + b.ping * 0.4) * meta.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, base, 0, Math.PI * 2);
        ctx.fillStyle = meta.c;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#f5b81f";
      ctx.fill();
    }
    const loop = () => {
      sweep += RM ? 0.006 : 0.014;
      if (sweep > Math.PI * 2) sweep -= Math.PI * 2;
      draw();
      if (sweepLblRef.current) sweepLblRef.current.textContent = "sweep " + (((Math.round((sweep * 180) / Math.PI) % 360) + 360) % 360) + "°";
      raf = requestAnimationFrame(loop);
    }
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
      if (best && bd < 200) {
        const bb = best as (typeof blips)[number];
        tip.style.left = (bb.sx ?? 0) + "px";
        tip.style.top = (bb.sy ?? 0) + "px";
        tip.style.opacity = "1";
        tip.innerHTML =
          '<span style="font-family:var(--font-grot);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-yellow)">' +
          CATS[bb.cat].name +
          '</span><b style="display:block">' +
          bb.label +
          '</b><span style="font-size:10px;opacity:.75">' +
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
  const maxRise = risers.length ? Math.max(...risers.map((t) => t.tr)) : 1;

  return (
    <div>
      <div className="emr-lenses" role="tablist" aria-label="Filter by lens">
        {lenses.map((x) => (
          <button
            key={x.l}
            type="button"
            className="emr-lens"
            data-active={lens === x.l}
            aria-pressed={lens === x.l}
            onClick={() => setLens(x.l)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="emr-radar-grid">
        {/* left: canvas */}
        <div className="emr-panel emr-panel-pad">
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} className="emr-radar-canvas" width={600} height={600} />
            <div ref={tipRef} className="emr-radar-tip" />
          </div>
          <div className="emr-radar-foot">
            <span>near center = more press coverage</span>
            <span ref={sweepLblRef}>sweep 0&deg;</span>
          </div>
          <p className="emr-caption">{captions.length ? captions[capIdx % captions.length] : ""}</p>
          <p className="emr-scaps" style={{ marginTop: 10, display: "block" }}>
            Early signals, not predictions. We show our work, and so should any tool you trust with your reputation.
          </p>
        </div>

        {/* right: tiles + lists */}
        <div className="emr-col">
          <div className="emr-kpis">
            {kpis.map((k, i) => {
              const up = (k.delta ?? 0) >= 0;
              return (
                <div className="emr-kpi" key={i}>
                  <div className="emr-kpi-label">{k.label}</div>
                  <div>
                    <span className="emr-kpi-val">
                      {k.value}
                      {k.unit ? <span className="emr-kpi-unit">{k.unit}</span> : null}
                    </span>
                  </div>
                  <div className={"emr-kpi-delta " + (up ? "emr-up" : "emr-down")}>
                    {k.note ? (
                      <span>&#9650; {k.note}</span>
                    ) : (
                      <span>
                        {up ? "▲" : "▼"} {Math.abs((k.delta ?? 0) * 100).toFixed(1)}% <span style={{ color: "var(--color-ink-55)" }}>7d</span>
                      </span>
                    )}
                  </div>
                  <Spark series={k.series} color={k.color} />
                </div>
              );
            })}
          </div>

          <div className="emr-panel">
            <div className="emr-panel-head">
              <span className="emr-scaps">Trending topics</span>
              <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
                heating up &middot; 30d
              </span>
            </div>
            <div className="emr-panel-body">
              {risers.map((t, i) => (
                <div className="emr-list-row" key={t.topic}>
                  <span className="emr-rank">{i + 1}</span>
                  <div className="emr-row-main">
                    <div className="emr-row-name">
                      <span className="emr-chip">{LENS_LABEL[t.lens]}</span>
                      {t.topic}
                    </div>
                    <div className="emr-bar">
                      <i className={t.lens === "geo" ? "emr-bar-y" : ""} style={{ width: (t.tr / maxRise) * 100 + "%" }} />
                    </div>
                  </div>
                  <span className="emr-mom">{pct(t.tr)}</span>
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
            <div className="emr-panel-body">
              {gaps.map((t) => (
                <div className="emr-list-row" key={t.topic}>
                  <div className="emr-row-main">
                    <div className="emr-row-name">
                      <span className="emr-chip">{LENS_LABEL[t.lens]}</span>
                      {t.topic}
                    </div>
                    <div className="emr-bar">
                      <i className={t.lens === "geo" ? "emr-bar-y" : ""} style={{ width: Math.max(6, (1 - t.vol) * 100) + "%" }} />
                    </div>
                  </div>
                  <span className="emr-gapval">
                    {t.n.toLocaleString()} &middot; {pct(t.tr)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* feed */}
      <div className="emr-panel">
        <div className="emr-panel-head">
          <span className="emr-scaps">Signal feed</span>
          <span className="emr-mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-ink-55)" }}>
            live coverage moves
          </span>
        </div>
        <div className="emr-feed">
          {feed
            .filter((x) => lens === "all" || x.lens === lens)
            .map((x, i) => {
              const up = x.d >= 0;
              return (
                <div className={"emr-feed-item" + (i === 0 ? " emr-new" : "")} key={x.key}>
                  <div className="emr-feed-top">
                    <span className="emr-chip">{LENS_LABEL[x.lens]}</span>
                    <span className={"emr-feed-mom " + (up ? "emr-up" : "emr-down")}>{pct(x.d)}</span>
                  </div>
                  <div className="emr-feed-text">{x.text}</div>
                  <div className="emr-feed-meta">
                    {x.meta.map((m, j) => (
                      <span key={j}>
                        {j > 0 ? <span style={{ color: "var(--color-ink-55)" }}>&middot; </span> : null}
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

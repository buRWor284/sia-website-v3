"use client";

import { useEffect, useRef, type CSSProperties, type SVGProps } from "react";
import { PAPER, INK, YEL, BLUE } from "@/lib/tokens";

/* =========================================================================
   EMOS Coverage Flywheel
   Native port of the design handoff prototype (design_handoff_emos_coverage_flywheel).
   - Slow continuous spin (1 rev / 72s); hover, focus, or tap a segment to pause
     and reveal its benefit in the hub.
   - Light surface only (matches the EMOS page section it lives in).
   - Accessibility added beyond the prototype: segment labels are real buttons
     (keyboard focusable + aria), tap-to-reveal works on touch, and the spin and
     entrance animations are fully disabled under prefers-reduced-motion.
   Palette/typography use the shared bureau tokens (same hex as src/lib/tokens.ts).
   ========================================================================= */

type IconType = "shield" | "eye" | "trend" | "gem" | "magnet" | "clock";
interface Seg {
  icon: IconType;
  label: string;
  num: string;
  desc: string;
}

// ── Geometry (SVG viewBox 0 0 820 640) ──────────────────────────────────────
const CX = 410;
const CY = 310;
const R = 250; // outer radius
const RI = 108; // inner (hub) radius
const GAP = 2.6; // angular gap between segments (deg)
const R_ICON = (R + RI) / 2; // 179 — badge centre radius
const R_LABEL = R + 34; // 284 — label anchor radius
const R_BADGE = 40;

function polar(ang: number, rad: number): [number, number] {
  const a = (ang * Math.PI) / 180;
  return [CX + rad * Math.cos(a), CY + rad * Math.sin(a)];
}
function sectorPath(a0: number, a1: number): string {
  const s0 = a0 + GAP / 2;
  const s1 = a1 - GAP / 2;
  const o0 = polar(s0, R);
  const o1 = polar(s1, R);
  const i1 = polar(s1, RI);
  const i0 = polar(s0, RI);
  return `M${o0[0]},${o0[1]} A${R},${R} 0 0 1 ${o1[0]},${o1[1]} L${i1[0]},${i1[1]} A${RI},${RI} 0 0 0 ${i0[0]},${i0[1]} Z`;
}

// [segFill, iconInk, badgeFill] — 3-colour alternating pairs
const PALETTE: ReadonlyArray<[string, string, string]> = [
  ["#1a1410", "#f5b81f", "#f5b81f"], // 01 Reputation   INK + YEL
  ["#f5b81f", "#1a1410", "#1a1410"], // 02 Visibility   YEL + INK
  ["#f1ebde", "#1a1410", "#1a1410"], // 03 Conversions  PAPER + INK
  ["#1a1410", "#f5b81f", "#f5b81f"], // 04 Brand Equity INK + YEL
  ["#f5b81f", "#1a1410", "#1a1410"], // 05 Magnetism    YEL + INK
  ["#f1ebde", "#1a1410", "#1a1410"], // 06 Liberty      PAPER + INK
];

const SEGS: ReadonlyArray<Seg> = [
  { icon: "shield", label: "Reputation", num: "01", desc: "Media mentions signal authority to prospects, partners, and search engines simultaneously." },
  { icon: "eye", label: "Visibility", num: "02", desc: "Editorial coverage reaches audiences no paid budget can reliably touch." },
  { icon: "trend", label: "Conversions", num: "03", desc: "Third-party validation turns interest into intent, faster than any owned content can." },
  { icon: "gem", label: "Brand Equity", num: "04", desc: "Consistent coverage compounds into a brand that commands premium positioning over time." },
  { icon: "magnet", label: "Magnetism", num: "05", desc: "Press begets press. Journalists cite sources other journalists have already cited." },
  { icon: "clock", label: "Liberty", num: "06", desc: "A media-backed brand gives you pricing power, category leadership, and exit optionality." },
];

function WIcon({ type }: { type: IconType }) {
  const p: SVGProps<SVGSVGElement> = {
    width: 38,
    height: 38,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (type) {
    case "shield":
      return (<svg {...p}><path d="M12 2 20 5.2V11c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5.2Z" /><path d="M8.5 12l2.3 2.3L15.5 9.7" /></svg>);
    case "eye":
      return (<svg {...p}><path d="M2 12C4 7.5 7.6 5.2 12 5.2S20 7.5 22 12c-2 4.5-5.6 6.8-10 6.8S4 16.5 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
    case "trend":
      return (<svg {...p}><polyline points="3 16.5 9 10.5 13 14.5 21 6.5" /><polyline points="15 6.5 21 6.5 21 12.5" /></svg>);
    case "gem":
      return (<svg {...p}><path d="M6 3h12l4 6-10 12L2 9Z" /><path d="M2 9h20" /><path d="M9 9l3 12 3-12" /><path d="M6 3 9 9" /><path d="M18 3 15 9" /></svg>);
    case "magnet":
      return (<svg {...p}><path d="M6 4v8a6 6 0 0 0 12 0V4" /><path d="M3 4h6" /><path d="M15 4h6" /><path d="M6 9h3" /><path d="M15 9h6" /></svg>);
    case "clock":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>);
  }
}

type Align = "left" | "right" | "center";

interface CoverageFlywheelProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export default function CoverageFlywheel({
  ctaHref = "#how-it-works-detail",
  ctaLabel = "See how EMOS builds all six →",
}: CoverageFlywheelProps) {
  const wheelwRef = useRef<HTMLDivElement | null>(null);
  const rotorRef = useRef<SVGGElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const hubDetNumRef = useRef<HTMLDivElement | null>(null);
  const hubDetNameRef = useRef<HTMLDivElement | null>(null);
  const hubDetDescRef = useRef<HTMLDivElement | null>(null);
  const segRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hovRef = useRef<number>(-1); // hovered / focused index
  const pinnedRef = useRef<number>(-1); // clicked / tapped index
  const effectiveRef = useRef<number>(-1); // resolved active index
  const angleRef = useRef<number>(0);

  // Precomputed geometry per segment.
  const geom = SEGS.map((s, i) => {
    const a0 = -90 + i * 60;
    const a1 = a0 + 60;
    const ac = a0 + 30;
    const ic = polar(ac, R_ICON);
    const lc = polar(ac, R_LABEL);
    const cos = Math.cos((ac * Math.PI) / 180);
    const pal = PALETTE[i];
    const ltx: string = cos > 0.2 ? "0%" : cos < -0.2 ? "-100%" : "-50%";
    const lalign: Align = cos > 0.2 ? "left" : cos < -0.2 ? "right" : "center";
    return { i, s, path: sectorPath(a0, a1), fill: pal[0], ink: pal[1], badge: pal[2], ix: ic[0], iy: ic[1], lx: lc[0], ly: lc[1], ltx, lalign };
  });

  function applyState() {
    const eff = pinnedRef.current >= 0 ? pinnedRef.current : hovRef.current;
    effectiveRef.current = eff;
    segRefs.current.forEach((el, idx) => {
      if (el) el.classList.toggle("cf-hover", idx === eff);
    });
    labelRefs.current.forEach((el, idx) => {
      if (el) {
        el.classList.toggle("cf-hover", idx === eff);
        el.setAttribute("aria-pressed", String(pinnedRef.current === idx));
      }
    });
    if (eff >= 0) {
      const seg = SEGS[eff];
      if (hubDetNumRef.current) hubDetNumRef.current.textContent = seg.num;
      if (hubDetNameRef.current) hubDetNameRef.current.textContent = seg.label;
      if (hubDetDescRef.current) hubDetDescRef.current.textContent = seg.desc;
      if (hubRef.current) hubRef.current.classList.add("cf-active");
    } else if (hubRef.current) {
      hubRef.current.classList.remove("cf-active");
    }
  }

  function onEnter(i: number) {
    hovRef.current = i;
    applyState();
  }
  function onLeave() {
    hovRef.current = -1;
    applyState();
  }
  function onToggle(i: number) {
    pinnedRef.current = pinnedRef.current === i ? -1 : i;
    applyState();
  }

  useEffect(() => {
    const wheelw = wheelwRef.current;
    if (!wheelw) return;

    const positionLabels = (angle: number) => {
      for (let i = 0; i < SEGS.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const ac = -90 + i * 60 + 30 + angle;
        const lc = polar(ac, R_LABEL);
        const cos = Math.cos((ac * Math.PI) / 180);
        const ltx = cos > 0.2 ? "0%" : cos < -0.2 ? "-100%" : "-50%";
        const lalign: Align = cos > 0.2 ? "left" : cos < -0.2 ? "right" : "center";
        el.style.left = `${(lc[0] / 820) * 100}%`;
        el.style.top = `${(lc[1] / 640) * 100}%`;
        el.style.transform = `translate(${ltx},-50%)`;
        el.style.textAlign = lalign;
      }
    };

    positionLabels(0);

    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      wheelw.classList.add("cf-noanim", "cf-settled");
      return;
    }

    const timers: number[] = [];
    let raf = 0;
    let last: number | null = null;
    let spinning = false;

    const reveal = () => {
      if (wheelw.classList.contains("cf-inview")) return;
      wheelw.classList.add("cf-inview");
      timers.push(window.setTimeout(() => wheelw.classList.add("cf-settled"), 2300));
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(wheelw);

    // Fallback in case the observer never fires (already in view, etc.).
    timers.push(
      window.setTimeout(() => {
        const r = wheelw.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) reveal();
      }, 1300)
    );

    timers.push(
      window.setTimeout(() => {
        spinning = true;
      }, 2400)
    );

    const tick = (ts: number) => {
      if (spinning) {
        if (effectiveRef.current === -1) {
          if (last !== null) angleRef.current = (angleRef.current + (ts - last) * 0.005) % 360;
          last = ts;
        } else {
          last = null;
        }
        if (rotorRef.current) rotorRef.current.style.transform = `rotate(${angleRef.current}deg)`;
        positionLabels(angleRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  return (
    <div
      className="cf-root"
      style={{ "--cf-paper": PAPER, "--cf-ink": INK, "--cf-yel": YEL, "--cf-blue": BLUE } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: CF_CSS }} />
      <div className="cf-wheelw" ref={wheelwRef}>
        <div className="cf-stage">
          <svg className="cf-svg" viewBox="0 0 820 640" aria-hidden="true" focusable="false">
            <circle className="cf-shadow" cx={CX} cy={CY + 8} r={R + 6} />
            <circle className="cf-ring" cx={CX} cy={CY} r={R + 10} pathLength={1} />
            <g className="cf-rotor" ref={rotorRef}>
              {geom.map((g) => (
                <g
                  key={g.i}
                  ref={(el) => {
                    segRefs.current[g.i] = el;
                  }}
                  className="cf-seg"
                  style={{ "--i": g.i } as CSSProperties}
                  onMouseEnter={() => onEnter(g.i)}
                  onMouseLeave={onLeave}
                  onClick={() => onToggle(g.i)}
                >
                  <path className="cf-seg-fill" d={g.path} fill={g.fill} />
                  <g className="cf-seg-mark">
                    <circle className="cf-badge" cx={g.ix} cy={g.iy} r={R_BADGE} fill={g.badge} />
                    <g transform={`translate(${g.ix - 19},${g.iy - 19})`} style={{ color: g.ink }}>
                      <WIcon type={g.s.icon} />
                    </g>
                  </g>
                </g>
              ))}
            </g>
          </svg>

          <div className="cf-hub" ref={hubRef}>
            <div className="cf-hub-pulse" />
            <div className="cf-hub-default">
              <div className="cf-hub-eyebrow">EMOS</div>
              <div className="cf-hub-title">Coverage Flywheel</div>
              <div className="cf-hub-sub">Six compounding benefits</div>
            </div>
            <div className="cf-hub-detail" aria-hidden="true">
              <div className="cf-hub-det-num" ref={hubDetNumRef} />
              <div className="cf-hub-det-name" ref={hubDetNameRef} />
              <div className="cf-hub-det-desc" ref={hubDetDescRef} />
            </div>
          </div>

          {geom.map((g) => (
            <button
              key={`l${g.i}`}
              type="button"
              className="cf-label"
              ref={(el) => {
                labelRefs.current[g.i] = el;
              }}
              style={{
                left: `${(g.lx / 820) * 100}%`,
                top: `${(g.ly / 640) * 100}%`,
                transform: `translate(${g.ltx},-50%)`,
                textAlign: g.lalign,
                "--i": g.i,
              } as CSSProperties}
              aria-pressed={false}
              aria-label={`${g.s.num} ${g.s.label}: ${g.s.desc}`}
              onMouseEnter={() => onEnter(g.i)}
              onMouseLeave={onLeave}
              onFocus={() => onEnter(g.i)}
              onBlur={onLeave}
              onClick={() => onToggle(g.i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(g.i);
                }
              }}
            >
              <span className="cf-label-num">{g.s.num}</span>
              {g.s.label}
            </button>
          ))}
        </div>
      </div>

      {ctaLabel ? (
        <div className="cf-cta">
          <a href={ctaHref}>{ctaLabel}</a>
        </div>
      ) : null}
    </div>
  );
}

const CF_CSS = `
.cf-root{--cf-paper:#f1ebde;--cf-ink:#1a1410;--cf-yel:#f5b81f;--cf-blue:#2e90c3;position:relative;}
.cf-wheelw{position:relative;width:100%;max-width:760px;margin:0 auto;}
.cf-stage{position:relative;width:100%;aspect-ratio:820/640;margin:0 auto;}
.cf-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
.cf-shadow{fill:rgba(26,20,16,.12);}
.cf-ring{fill:none;stroke:var(--cf-ink);stroke-width:2;opacity:.45;stroke-dasharray:1;stroke-dashoffset:1;}
.cf-wheelw.cf-inview .cf-ring{animation:cfRingIn 1.1s cubic-bezier(.65,0,.35,1) .1s both;}
.cf-rotor{opacity:0;transform:rotate(-9deg) scale(.93);transform-box:view-box;transform-origin:410px 310px;}
.cf-wheelw.cf-inview .cf-rotor{animation:cfRotorIn .9s cubic-bezier(.16,1,.3,1) both;}
.cf-seg{transform-box:view-box;transform-origin:410px 310px;cursor:pointer;}
.cf-seg-fill{stroke:var(--cf-paper);stroke-width:4;stroke-linejoin:round;opacity:0;transition:filter .25s ease;}
.cf-wheelw.cf-inview .cf-seg-fill{animation:cfFadeIn .55s ease both;animation-delay:calc(var(--i) * .09s + .2s);}
.cf-seg.cf-hover .cf-seg-fill{filter:brightness(1.07);}
.cf-seg-mark{transform-box:fill-box;transform-origin:center;opacity:0;transform:scale(0);}
.cf-wheelw.cf-inview .cf-seg-mark{animation:cfPopIn .5s cubic-bezier(.34,1.56,.64,1) both;animation-delay:calc(var(--i) * .09s + .5s);}
.cf-badge{stroke:rgba(26,20,16,.12);stroke-width:1;filter:drop-shadow(0 3px 8px rgba(26,20,16,.2));}
.cf-label{position:absolute;font-family:var(--font-grot),"Archivo",sans-serif;font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--cf-ink);white-space:nowrap;line-height:1.18;opacity:0;transition:color .2s ease;cursor:pointer;background:none;border:0;padding:0;margin:0;}
.cf-wheelw.cf-inview .cf-label{animation:cfFadeIn .5s ease both;animation-delay:calc(var(--i) * .09s + .45s);}
.cf-label.cf-hover{color:var(--cf-blue);}
.cf-label:focus-visible{outline:2px solid var(--cf-blue);outline-offset:4px;border-radius:2px;}
.cf-label-num{display:block;font-family:var(--font-mono),"JetBrains Mono",monospace;font-size:10px;letter-spacing:.1em;color:var(--cf-blue);margin-bottom:3px;opacity:.9;}
.cf-hub{position:absolute;left:50%;top:48.44%;transform:translate(-50%,-50%) scale(.9);width:24.4%;height:31.25%;border-radius:50%;background:var(--cf-ink);border:3px solid var(--cf-yel);box-shadow:0 16px 52px -8px rgba(26,20,16,.55),0 0 0 9px rgba(26,20,16,.06);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:7%;opacity:0;z-index:2;}
.cf-wheelw.cf-inview .cf-hub{animation:cfHubIn .7s cubic-bezier(.16,1,.3,1) .15s both;}
.cf-hub-pulse{position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--cf-blue);opacity:0;pointer-events:none;}
.cf-wheelw.cf-inview .cf-hub-pulse{animation:cfHubPulse 3s ease-out 1.1s infinite;}
.cf-hub-eyebrow{font-family:var(--font-mono),"JetBrains Mono",monospace;font-size:clamp(7px,1.05vw,9.5px);letter-spacing:.2em;text-transform:uppercase;color:var(--cf-blue);padding-bottom:7px;margin-bottom:7px;border-bottom:1px solid rgba(46,144,195,.32);width:80%;}
.cf-hub-title{font-family:var(--font-serif),"Newsreader",Georgia,serif;font-weight:700;font-style:italic;font-size:clamp(12px,2.1vw,22px);line-height:1.05;letter-spacing:-.02em;color:var(--cf-paper);}
.cf-hub-sub{font-family:var(--font-mono),"JetBrains Mono",monospace;font-size:clamp(6px,1vw,9px);color:rgba(241,235,222,.5);margin-top:7px;line-height:1.3;max-width:88%;letter-spacing:.04em;text-transform:uppercase;}
.cf-hub-default{display:flex;flex-direction:column;align-items:center;width:100%;transition:opacity .22s ease,transform .22s ease;}
.cf-hub-detail{position:absolute;inset:0;padding:9%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;opacity:0;transform:scale(.93);transition:opacity .22s ease,transform .22s ease;}
.cf-hub.cf-active .cf-hub-default{opacity:0;transform:scale(.93);}
.cf-hub.cf-active .cf-hub-detail{opacity:1;transform:scale(1);}
.cf-hub-det-num{font-family:var(--font-mono),"JetBrains Mono",monospace;font-size:clamp(6px,.9vw,10px);letter-spacing:.2em;text-transform:uppercase;color:var(--cf-blue);margin-bottom:4px;}
.cf-hub-det-name{font-family:var(--font-serif),"Newsreader",Georgia,serif;font-weight:700;font-style:italic;font-size:clamp(10px,1.7vw,18px);line-height:1.05;letter-spacing:-.02em;color:var(--cf-paper);margin-bottom:7px;}
.cf-hub-det-desc{font-family:var(--font-mono),"JetBrains Mono",monospace;font-size:clamp(7.5px,1vw,10px);color:rgba(241,235,222,.72);line-height:1.45;letter-spacing:.03em;}
.cf-cta{text-align:center;margin-top:28px;}
.cf-cta a{font-family:var(--font-grot),"Archivo",sans-serif;font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--cf-ink);text-decoration:none;border-bottom:2px solid var(--cf-blue);padding-bottom:2px;transition:color .15s;}
.cf-cta a:hover{color:var(--cf-blue);}
.cf-wheelw.cf-settled .cf-ring,.cf-wheelw.cf-noanim .cf-ring{animation:none;stroke-dashoffset:0;}
.cf-wheelw.cf-settled .cf-rotor,.cf-wheelw.cf-noanim .cf-rotor{animation:none;opacity:1;transform:none;}
.cf-wheelw.cf-settled .cf-seg-fill,.cf-wheelw.cf-noanim .cf-seg-fill{animation:none;opacity:1;}
.cf-wheelw.cf-settled .cf-seg-mark,.cf-wheelw.cf-noanim .cf-seg-mark{animation:none;opacity:1;transform:scale(1);}
.cf-wheelw.cf-settled .cf-label,.cf-wheelw.cf-noanim .cf-label{animation:none;opacity:1;}
.cf-wheelw.cf-settled .cf-hub,.cf-wheelw.cf-noanim .cf-hub{animation:none;opacity:1;transform:translate(-50%,-50%);}
.cf-wheelw.cf-noanim .cf-hub-pulse{animation:none;}
@media(prefers-reduced-motion:reduce){.cf-hub-pulse{animation:none!important;}}
@keyframes cfRotorIn{from{opacity:0;transform:rotate(-9deg) scale(.93);}to{opacity:1;transform:none;}}
@keyframes cfFadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes cfPopIn{from{opacity:0;transform:scale(0);}to{opacity:1;transform:scale(1);}}
@keyframes cfHubIn{from{opacity:0;transform:translate(-50%,-50%) scale(.9);}to{opacity:1;transform:translate(-50%,-50%) scale(1);}}
@keyframes cfRingIn{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}
@keyframes cfHubPulse{0%{transform:scale(1);opacity:.55;}70%{transform:scale(1.1);opacity:0;}100%{opacity:0;}}
@media(max-width:640px){
  .cf-label{font-size:10px;letter-spacing:.1em;}
  /* The hub circle is too small on phones to hold a full benefit sentence, so when a
     segment is active expand the centre into a rounded card that contains the text. */
  .cf-hub.cf-active{width:64%;height:auto;min-height:31.25%;border-radius:16px;padding:14px 15px;z-index:5;}
  .cf-hub.cf-active .cf-hub-default{display:none;}
  .cf-hub.cf-active .cf-hub-detail{position:relative;inset:auto;padding:0;}
  .cf-hub-det-desc{font-size:10px;line-height:1.42;}
}
`;

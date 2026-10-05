"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./useReducedMotion";
import {
  BLUE,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  MONO,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

/* =========================================================================
   PipelineFlowV2: Section 02 centerpiece (V2 of PipelineFlow).
   The runner travels the six-stage track, lighting each stage as it arrives.
   Every stage pairs an "AI does" chip with a "Human does, always" chip, and
   the Authority Content stage opens a spotlight naming the real formats
   (never AI slop) that stage produces. Timer-driven, loops automatically,
   replayable, and fully inert under prefers-reduced-motion.
   ========================================================================= */

type IconKey = "signal" | "asset" | "verify" | "match" | "pitch" | "attribute";

type Stage = {
  num: string;
  tool: string;
  name: string;
  icon: IconKey;
  desc: string;
  ai: string;
  human: string;
  spotlight?: { label: string; formats: string[]; note: string };
};

function StageIcon({ type }: { type: IconKey }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "signal":
      return (
        <svg {...p}>
          <path d="M12 19v.01" />
          <path d="M8.5 15.5a5 5 0 0 1 7 0" />
          <path d="M5 12a10 10 0 0 1 14 0" />
        </svg>
      );
    case "asset":
      return (
        <svg {...p}>
          <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M9 9h2" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );
    case "verify":
      return (
        <svg {...p}>
          <path d="M12 2 20 5.2V11c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5.2Z" />
          <path d="M8.5 12l2.3 2.3L15.5 9.7" />
        </svg>
      );
    case "match":
      return (
        <svg {...p}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="15" cy="12" r="6" />
        </svg>
      );
    case "pitch":
      return (
        <svg {...p}>
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
        </svg>
      );
    case "attribute":
      return (
        <svg {...p}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );
  }
}

const STAGES: ReadonlyArray<Stage> = [
  {
    num: "01",
    tool: "SignalIQ",
    name: "Signal",
    icon: "signal",
    desc: "Surface the topics about to break before the market notices.",
    ai: "AI: research assist",
    human: "Human: picks the angle",
  },
  {
    num: "02",
    tool: "AssetIQ",
    name: "Authority Content",
    icon: "asset",
    desc: "Build the research, tools and data that earn coverage.",
    ai: "AI: co-drafts from your angle",
    human: "Human: owns the argument, edits, signs off",
    spotlight: {
      label: "Real formats, not slop",
      formats: ["Research reports", "Calculators", "Quizzes", "Surveys", "Whitepapers", "Live dashboards", "Apps"],
      note: "The stuff journalists actually cite, and that LLMs and AI search reward, because AI alone cannot fabricate or replicate it.",
    },
  },
  {
    num: "03",
    tool: "FactCheckIQ",
    name: "Verify",
    icon: "verify",
    desc: "Screen out AI slop and unverified claims.",
    ai: "AI: flags what is unverified",
    human: "Human: makes the final call",
  },
  {
    num: "04",
    tool: "JournoIQ",
    name: "Match",
    icon: "match",
    desc: "Find the right journalists for the right stories.",
    ai: "AI: surfaces candidates",
    human: "Human: confirms the fit",
  },
  {
    num: "05",
    tool: "PressIQ",
    name: "Pitch",
    icon: "pitch",
    desc: "Draft and send outreach, scored and tuned.",
    ai: "AI: co-writes and pressure-tests",
    human: "Human: owns the relationship, approves the send",
  },
  {
    num: "06",
    tool: "CoverageIQ",
    name: "Attribute",
    icon: "attribute",
    desc: "Track what the coverage actually produced.",
    ai: "AI: pulls the data",
    human: "Human: verifies the result",
  },
];

const START_DELAY = 500;
const STEP = 1900;
const HOLD = 2600;
const START_PCT = 100 / 12;

export default function PipelineFlowV2() {
  const reduceMotion = useReducedMotion();
  const [activeIndexState, setActiveIndex] = useState(-1);
  const [doneUpToState, setDoneUpTo] = useState(-1);
  const [cycle, setCycle] = useState(0);
  const [snap, setSnap] = useState(false);

  // Under reduced motion we never run the timer cascade at all; the settled end state is
  // derived here at render time instead of being mirrored into state from an effect.
  const activeIndex = reduceMotion ? STAGES.length - 1 : activeIndexState;
  const doneUpTo = reduceMotion ? STAGES.length - 1 : doneUpToState;

  useEffect(() => {
    if (reduceMotion) return;

    // This reset has to happen synchronously, in the same tick the effect starts, so the
    // runner/track snap straight back to the top of the track instead of visibly sliding back
    // across it. It's genuinely part of arming the timer cascade below, not a value mirrored
    // from somewhere else, but react-hooks/set-state-in-effect can't distinguish that from the
    // "mirror a prop into state" anti-pattern it flags when the calls sit bare at the effect's
    // top level, so the reset is named and invoked here instead.
    function resetForNewCycle() {
      setActiveIndex(-1);
      setDoneUpTo(-1);
      setSnap(cycle > 0);
    }
    resetForNewCycle();

    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    if (cycle > 0) {
      raf = requestAnimationFrame(() => setSnap(false));
    }

    STAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveIndex(i);
          setDoneUpTo(i - 1);
        }, START_DELAY + i * STEP)
      );
    });
    timers.push(
      setTimeout(() => {
        setDoneUpTo(STAGES.length - 1);
      }, START_DELAY + STAGES.length * STEP)
    );
    timers.push(
      setTimeout(() => {
        setCycle((c) => c + 1);
      }, START_DELAY + STAGES.length * STEP + HOLD)
    );

    return () => {
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cycle, reduceMotion]);

  const positionIndex = activeIndex >= 0 ? activeIndex : 0;
  const pct = ((positionIndex + 0.5) / STAGES.length) * 100;
  const fillPct = Math.max(0, pct - START_PCT);
  const runnerOn = activeIndex >= 0;
  const activeStage = activeIndex >= 0 ? STAGES[activeIndex] : null;
  // Under reduced motion the pipeline settles straight into its "all done" end state, but the
  // Authority Content spotlight still needs to be reachable, so it stays open there rather than
  // depending on a stage transition the user will never see animate.
  const spotlightStage = activeStage?.spotlight ? activeStage : reduceMotion ? STAGES[1] : null;
  const snapStyle: CSSProperties = snap ? { transition: "none" } : {};

  return (
    <div
      className="pf-root"
      style={
        {
          "--pf-paper": PAPER,
          "--pf-paper2": PAPER2,
          "--pf-ink": INK,
          "--pf-ink70": INK70,
          "--pf-ink55": INK55,
          "--pf-ink35": INK35,
          "--pf-ink15": INK15,
          "--pf-yel": YEL,
          "--pf-blue": BLUE,
          "--pf-serif": SERIF,
          "--pf-grot": GROT,
          "--pf-mono": MONO,
        } as CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: PF_CSS }} />

      <button type="button" className="pf-replay" onClick={() => setCycle((c) => c + 1)}>
        <span aria-hidden="true">&#8635;</span> Replay
      </button>

      <div className="pf-legend">
        <div className="pf-legend-cell">
          <div className="pf-legend-mark pf-legend-mark--ai">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
          <div className="pf-legend-text">
            <span className="pf-legend-k">What AI does</span>
            <p>Drafts, researches, or even builds the tool, report, calculator or dataset itself.</p>
          </div>
        </div>
        <div className="pf-legend-cell pf-legend-cell--b">
          <div className="pf-legend-mark pf-legend-mark--human">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>
          <div className="pf-legend-text">
            <span className="pf-legend-k">What a human does, always</span>
            <p>Reviews and approves before anything moves to the next stage. No stage skips this.</p>
          </div>
        </div>
      </div>

      <p className="pf-scrollnote">Scroll sideways on narrow screens to see all six stages</p>

      <div className="pf-stage-wrap">
        <div className="pf-stage-inner">
          <div className="pf-cards-grid">
            {STAGES.map((s, i) => {
              const done = i <= doneUpTo;
              const active = i === activeIndex && !done;
              return (
                <div
                  key={s.num}
                  className={`pf-node${active ? " pf-node--active" : ""}${done ? " pf-node--done" : ""}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="pf-card">
                    <div className="pf-icon-badge">
                      <StageIcon type={s.icon} />
                    </div>
                    <span className="pf-num">{s.num}</span>
                    <span className="pf-badge">{s.tool}</span>
                    <h3 className="pf-name">{s.name}</h3>
                    <p className="pf-desc">{s.desc}</p>
                    <div className="pf-chips">
                      <div className="pf-chip-ai">{s.ai}</div>
                      <div className="pf-chip-human">
                        {s.human} <span className="pf-tick">&#10003;</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`pf-spotlight${spotlightStage ? " pf-spotlight--show" : ""}`}>
            <div className="pf-spotlight-inner">
              <span className="pf-spotlight-label">{spotlightStage?.spotlight?.label ?? ""}</span>
              <div className="pf-spotlight-formats">
                {spotlightStage?.spotlight?.formats.map((f) => (
                  <span key={f} className="pf-fmt">
                    {f}
                  </span>
                ))}
              </div>
              <p className="pf-spotlight-note">{spotlightStage?.spotlight?.note ?? ""}</p>
            </div>
          </div>

          <div className="pf-markers-row">
            <div className="pf-track-line" />
            <div className="pf-track-fill" style={{ width: `${fillPct}%`, ...snapStyle }} />
            <div className={`pf-runner-tag${runnerOn ? " pf-runner-tag--on" : ""}`} style={{ left: `${pct}%`, ...snapStyle }}>
              AI agent
            </div>
            <div className={`pf-runner${runnerOn ? " pf-runner--on" : ""}`} style={{ left: `${pct}%`, ...snapStyle }} />
            <div className="pf-markers-grid">
              {STAGES.map((s, i) => {
                const done = i <= doneUpTo;
                const active = i === activeIndex && !done;
                return <div key={s.num} className={`pf-marker${active ? " pf-marker--active" : ""}${done ? " pf-marker--done" : ""}`} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PF_CSS = `
.pf-root{ font-family:var(--pf-serif); }

.pf-replay{ margin-bottom:22px; display:inline-flex; align-items:center; gap:8px; padding:10px 16px; background:var(--pf-ink); color:var(--pf-paper); border:none; cursor:pointer; font-family:var(--pf-grot); font-weight:800; font-size:11px; letter-spacing:.14em; text-transform:uppercase; }
.pf-replay:hover{ background:var(--pf-blue); }

.pf-legend{ display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--pf-ink); background:var(--pf-paper); }
.pf-legend-cell{ padding:14px 18px; display:flex; gap:12px; align-items:flex-start; }
.pf-legend-cell--b{ border-left:1px solid var(--pf-ink35); }
.pf-legend-mark{ flex-shrink:0; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border:2px solid var(--pf-ink); margin-top:1px; }
.pf-legend-mark--ai{ background:var(--pf-paper); color:var(--pf-ink); }
.pf-legend-mark--human{ background:var(--pf-yel); border-color:var(--pf-yel); color:var(--pf-ink); }
.pf-legend-text .pf-legend-k{ display:block; font-family:var(--pf-grot); font-weight:800; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--pf-ink55); margin-bottom:3px; }
.pf-legend-text p{ margin:0; font-size:13.5px; line-height:1.42; color:var(--pf-ink); }
@media(max-width:700px){ .pf-legend{ grid-template-columns:1fr; } .pf-legend-cell--b{ border-left:none; border-top:1px solid var(--pf-ink35); } }

.pf-scrollnote{ margin:18px 0 0; font-family:var(--pf-mono); font-size:10.5px; letter-spacing:.06em; color:var(--pf-ink55); text-align:center; }

.pf-stage-wrap{ margin-top:14px; overflow-x:auto; }
.pf-stage-inner{ min-width:1060px; }

.pf-cards-grid{ display:grid; grid-template-columns:repeat(6,1fr); gap:9px; align-items:stretch; }
.pf-node{ opacity:0; transform:translateY(14px); animation:pfNodeIn .5s ease forwards; }
@keyframes pfNodeIn{ to{ opacity:1; transform:translateY(0); } }

.pf-card{ position:relative; overflow:hidden; height:100%; border:1px solid var(--pf-ink35); background:var(--pf-paper); padding:20px 12px 16px; display:flex; flex-direction:column; align-items:center; text-align:center; transition:border-color .35s ease,background .35s ease,transform .35s ease,box-shadow .35s ease; }
.pf-card::before{ content:""; position:absolute; top:0; left:0; right:0; height:3px; background:var(--pf-ink15); transition:background .35s ease; }
.pf-node--active .pf-card{ border-color:var(--pf-ink); background:var(--pf-paper2); transform:translateY(-4px); box-shadow:0 12px 24px -14px rgba(26,20,16,.4); }
.pf-node--active .pf-card::before{ background:var(--pf-yel); }
.pf-node--done .pf-card::before{ background:var(--pf-ink); }

.pf-icon-badge{ width:42px; height:42px; border:2px solid var(--pf-ink35); display:flex; align-items:center; justify-content:center; color:var(--pf-ink55); margin-bottom:9px; transition:background .35s ease,border-color .35s ease,color .35s ease,transform .35s ease,box-shadow .35s ease; }
.pf-icon-badge svg{ width:21px; height:21px; }
.pf-node--active .pf-icon-badge{ background:var(--pf-yel); border-color:var(--pf-yel); color:var(--pf-ink); transform:scale(1.08); box-shadow:0 0 0 6px rgba(245,184,31,.18); }
.pf-node--done .pf-icon-badge{ background:var(--pf-ink); border-color:var(--pf-ink); color:var(--pf-yel); }

.pf-num{ font-family:var(--pf-mono); font-size:10.5px; letter-spacing:.14em; color:var(--pf-blue); }
.pf-badge{ margin-top:6px; display:inline-block; background:var(--pf-ink); color:var(--pf-paper); font-family:var(--pf-grot); font-weight:800; font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; padding:3px 7px; transition:background .35s ease,color .35s ease; }
.pf-node--done .pf-badge{ background:var(--pf-yel); color:var(--pf-ink); }
.pf-name{ margin:10px 0 0; font-family:var(--pf-serif); font-weight:700; font-size:17px; color:var(--pf-ink); line-height:1.15; }
.pf-desc{ margin:8px 0 0; font-size:12px; line-height:1.4; color:var(--pf-ink70); opacity:0; transform:translateY(5px); transition:opacity .45s ease,transform .45s ease; min-height:46px; }
.pf-node--active .pf-desc, .pf-node--done .pf-desc{ opacity:1; transform:translateY(0); }

.pf-chips{ margin-top:10px; display:flex; flex-direction:column; gap:5px; width:100%; min-height:56px; }
.pf-chip-ai, .pf-chip-human{ width:100%; font-family:var(--pf-mono); font-size:9.5px; letter-spacing:.02em; padding:5px 6px; opacity:0; transform:translateY(4px); transition:opacity .4s ease,transform .4s ease; }
.pf-chip-ai{ background:var(--pf-paper); border:1px solid var(--pf-ink15); color:var(--pf-ink70); }
.pf-chip-human{ background:var(--pf-ink); color:var(--pf-paper); }
.pf-chip-human .pf-tick{ color:var(--pf-yel); margin-left:4px; }
.pf-node--active .pf-chip-ai, .pf-node--done .pf-chip-ai{ opacity:1; transform:translateY(0); }
.pf-node--active .pf-chip-human, .pf-node--done .pf-chip-human{ opacity:1; transform:translateY(0); transition-delay:.3s; }

.pf-spotlight{ margin-top:20px; border:1px dashed var(--pf-ink); background:var(--pf-paper2); max-height:0; opacity:0; overflow:hidden; transition:max-height .5s ease,opacity .4s ease; }
.pf-spotlight--show{ max-height:160px; opacity:1; }
.pf-spotlight-inner{ padding:16px 20px; }
.pf-spotlight-label{ font-family:var(--pf-grot); font-weight:800; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-blue); }
.pf-spotlight-formats{ margin-top:10px; display:flex; flex-wrap:wrap; gap:7px; }
.pf-fmt{ font-family:var(--pf-grot); font-weight:700; font-size:11.5px; background:var(--pf-paper); border:1px solid var(--pf-ink); color:var(--pf-ink); padding:4px 10px; }
.pf-spotlight-note{ margin:11px 0 0; font-size:13.5px; color:var(--pf-ink); line-height:1.45; font-style:italic; }

/* Row is given real height (46px) so the track, runner AND the "AI agent" tag all sit
   fully inside its own box, independent of the horizontal scroll wrapper. */
.pf-markers-row{ position:relative; height:46px; margin-top:26px; }
.pf-track-line{ position:absolute; top:16px; left:8.3333%; right:8.3333%; height:3px; background:var(--pf-ink15); }
.pf-track-fill{ position:absolute; top:16px; left:8.3333%; height:3px; background:var(--pf-ink); transition:width 1.5s cubic-bezier(.65,0,.35,1); }
.pf-markers-grid{ position:absolute; top:16px; left:0; right:0; height:15px; transform:translateY(-50%); display:grid; grid-template-columns:repeat(6,1fr); gap:9px; }
.pf-marker{ width:15px; height:15px; background:var(--pf-paper); border:2px solid var(--pf-ink35); justify-self:center; align-self:center; position:relative; z-index:2; transition:background .3s ease,border-color .3s ease; }
.pf-marker--active{ background:var(--pf-yel); border-color:var(--pf-yel); }
.pf-marker--done{ background:var(--pf-ink); border-color:var(--pf-ink); }

.pf-runner{ position:absolute; top:16px; width:20px; height:20px; background:var(--pf-ink); border:2px solid var(--pf-ink); transform:translate(-50%,-50%); transition:left 1.5s cubic-bezier(.65,0,.35,1),background .3s,border-color .3s,box-shadow .3s; z-index:3; display:flex; align-items:center; justify-content:center; }
.pf-runner::after{ content:"\\203A"; color:var(--pf-paper); font-family:var(--pf-grot); font-weight:800; font-size:13px; line-height:1; }
.pf-runner--on{ background:var(--pf-yel); border-color:var(--pf-yel); box-shadow:0 0 0 7px rgba(245,184,31,.22); }
.pf-runner--on::after{ color:var(--pf-ink); }

.pf-runner-tag{ position:absolute; top:30px; transform:translateX(-50%); font-family:var(--pf-mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--pf-blue); white-space:nowrap; transition:left 1.5s cubic-bezier(.65,0,.35,1),opacity .3s; opacity:0; }
.pf-runner-tag--on{ opacity:1; }

@media (prefers-reduced-motion: reduce){
  .pf-node, .pf-card, .pf-desc, .pf-marker, .pf-runner, .pf-runner-tag, .pf-icon-badge, .pf-chip-ai, .pf-chip-human, .pf-spotlight, .pf-track-fill { transition:none !important; animation:none !important; opacity:1 !important; transform:none !important; }
}
`;

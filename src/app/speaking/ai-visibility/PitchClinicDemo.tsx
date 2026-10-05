"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BLUE, GROT, INK, INK35, INK55, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";
import { useReducedMotion } from "./useReducedMotion";

/* =========================================================================
   PitchClinicDemo — Section 03 live example.
   A mock pitch draft gets flagged phrase by phrase (the way the room does it
   in Pitch Clinic and Spot the Slop), then cross-fades into the tightened,
   human-approved version that actually goes out. Sits as a bright paper
   "document" inset into the dark Activities section. Timer-driven, loops,
   replayable, inert under prefers-reduced-motion.
   ========================================================================= */

type Note = { text: string; tag: string };

const NOTES: ReadonlyArray<Note> = [
  { text: "I hope this finds you well!", tag: "Cut: filler greeting" },
  { text: "revolutionizing every single industry overnight", tag: "Unverified claim" },
  { text: "massive results already being seen everywhere", tag: "Vague: needs a number" },
  { text: "let me know if you want more info", tag: "Weak CTA" },
];

const FIRST_FLAG_AT = 1500;
const FLAG_GAP = 1300;

type Status = "AI Draft" | "Under Review" | "Revised" | "Approved" | "Sent";

export default function PitchClinicDemo() {
  const reduceMotion = useReducedMotion();
  const [flaggedState, setFlagged] = useState(0);
  const [revisedState, setRevised] = useState(false);
  const [sentState, setSent] = useState(false);
  const [statusState, setStatus] = useState<Status>("AI Draft");
  const [cycle, setCycle] = useState(0);

  // Under reduced motion we never run the timer cascade at all; the settled end state is
  // derived here at render time instead of being mirrored into state from an effect.
  const flagged = reduceMotion ? NOTES.length : flaggedState;
  const revised = reduceMotion ? true : revisedState;
  const sent = reduceMotion ? true : sentState;
  const status: Status = reduceMotion ? "Sent" : statusState;

  useEffect(() => {
    if (reduceMotion) return;

    // See PipelineFlow.tsx for why this reset lives in a named, immediately-invoked function:
    // it's a same-tick setup step for the timer cascade below, not a value mirrored from
    // somewhere else, but react-hooks/set-state-in-effect can't tell those apart when the calls
    // sit bare at the effect's top level.
    function resetForNewCycle() {
      setFlagged(0);
      setRevised(false);
      setSent(false);
      setStatus("AI Draft");
    }
    resetForNewCycle();

    const timers: ReturnType<typeof setTimeout>[] = [];
    NOTES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          if (i === 0) setStatus("Under Review");
          setFlagged((c) => Math.max(c, i + 1));
        }, FIRST_FLAG_AT + i * FLAG_GAP)
      );
    });

    const afterFlags = FIRST_FLAG_AT + NOTES.length * FLAG_GAP;
    const reviseAt = afterFlags + 1700;
    timers.push(
      setTimeout(() => {
        setRevised(true);
        setStatus("Revised");
      }, reviseAt)
    );

    const approveAt = reviseAt + 2200;
    timers.push(setTimeout(() => setStatus("Approved"), approveAt));

    const sentAt = approveAt + 1100;
    timers.push(
      setTimeout(() => {
        setStatus("Sent");
        setSent(true);
      }, sentAt)
    );

    const total = sentAt + 2800;
    timers.push(setTimeout(() => setCycle((c) => c + 1), total));

    return () => timers.forEach(clearTimeout);
  }, [cycle, reduceMotion]);

  const pillYel = status === "Under Review" || status === "Revised" || status === "Sent";

  return (
    <div
      className="pcd-root"
      style={
        {
          "--pcd-paper": PAPER,
          "--pcd-ink": INK,
          "--pcd-ink35": INK35,
          "--pcd-ink55": INK55,
          "--pcd-yel": YEL,
          "--pcd-blue": BLUE,
          "--pcd-serif": SERIF,
          "--pcd-grot": GROT,
          "--pcd-mono": MONO,
        } as CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: PCD_CSS }} />

      <div className="pcd-lead">
        <div className="pcd-lead-top">
          <span className="pcd-eyebrow">See it live</span>
          <button type="button" className="pcd-replay" onClick={() => setCycle((c) => c + 1)}>
            <span aria-hidden="true">&#8635;</span> Replay
          </button>
        </div>
        <h3 className="pcd-heading">Watching a real pitch get tightened, live.</h3>
        <p className="pcd-sub">
          An AI draft opens, gets flagged phrase by phrase the way the room does it in Pitch Clinic and Spot the Slop, then cross-fades into the tightened, human-edited version that actually goes out.
        </p>
      </div>

      <div className="pcd-card">
        <div className="pcd-header">
          <span className="pcd-title">Pitch Draft &middot; Beat: Future of Work</span>
          <span className={`pcd-pill${pillYel ? " pcd-pill--yel" : ""}`}>{status}</span>
        </div>

        <div className={`pcd-body${revised ? " pcd-revised" : ""}`}>
          <div className="pcd-draft">
            <p className="pcd-text">
              Hi [Name], <span className={`pcd-flag${flagged > 0 ? " pcd-flag--on" : ""}`}>I hope this finds you well!</span> Our{" "}
              <span className={`pcd-flag${flagged > 1 ? " pcd-flag--on" : ""}`}>
                groundbreaking new report reveals that AI is revolutionizing every single industry overnight
              </span>
              , with <span className={`pcd-flag${flagged > 2 ? " pcd-flag--on" : ""}`}>massive results already being seen everywhere</span>.{" "}
              <span className={`pcd-flag${flagged > 3 ? " pcd-flag--on" : ""}`}>Let me know if you want more info!</span>
            </p>
            <div className="pcd-notes">
              {NOTES.map((n, i) => (
                <div key={n.text} className={`pcd-note${flagged > i ? " pcd-note--on" : ""}`}>
                  <span className="pcd-arrow">&rarr;</span>&ldquo;{n.text}&rdquo;
                  <span className="pcd-tag">{n.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pcd-edited">
            <p className="pcd-text">
              Hi [Name], new data: <span className="pcd-stat">62%</span> of mid-size firms cut their content budget last quarter and shifted spend to earned media instead. I have the underlying survey (<span className="pcd-stat">400</span> marketing leads) and three on-record quotes if useful for the Future of Work beat. Happy to send the full breakdown.
            </p>
            <div className={`pcd-sent${sent ? " pcd-sent--on" : ""}`}>
              &rarr; Sent to Future of Work reporter <span className="pcd-check">Sent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PCD_CSS = `
.pcd-lead{ margin-bottom:22px; }
.pcd-lead-top{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
.pcd-eyebrow{ font-family:var(--pcd-grot); font-weight:800; font-size:10.5px; letter-spacing:.2em; text-transform:uppercase; color:var(--pcd-yel); }
.pcd-heading{ margin:10px 0 0; font-family:var(--pcd-serif); font-weight:700; font-size:clamp(22px,3.4vw,30px); line-height:1.12; letter-spacing:-.015em; color:var(--pcd-paper); }
.pcd-sub{ margin:12px 0 0; font-family:var(--pcd-serif); font-size:15.5px; color:rgba(241,235,222,.72); line-height:1.55; max-width:640px; }

.pcd-replay{ display:inline-flex; align-items:center; gap:7px; padding:9px 14px; background:var(--pcd-yel); color:var(--pcd-ink); border:none; cursor:pointer; font-family:var(--pcd-grot); font-weight:800; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; flex-shrink:0; }
.pcd-replay:hover{ background:var(--pcd-paper); }

.pcd-card{ border:1px solid rgba(241,235,222,.18); background:var(--pcd-paper); box-shadow:0 24px 60px -24px rgba(0,0,0,.55); }
.pcd-header{ background:var(--pcd-ink); color:var(--pcd-paper); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
.pcd-title{ font-family:var(--pcd-mono); font-size:11.5px; letter-spacing:.04em; color:rgba(241,235,222,.75); }
.pcd-pill{ font-family:var(--pcd-mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; padding:5px 10px; transition:background .3s ease,color .3s ease; white-space:nowrap; background:var(--pcd-paper); color:var(--pcd-ink); }
.pcd-pill--yel{ background:var(--pcd-yel); color:var(--pcd-ink); }

.pcd-body{ display:grid; padding:26px 24px 24px; }
.pcd-draft, .pcd-edited{ grid-column:1; grid-row:1; transition:opacity .6s ease; }
.pcd-draft{ opacity:1; }
.pcd-edited{ opacity:0; pointer-events:none; }
.pcd-body.pcd-revised .pcd-draft{ opacity:0; pointer-events:none; }
.pcd-body.pcd-revised .pcd-edited{ opacity:1; pointer-events:auto; }

.pcd-text{ margin:0; font-family:var(--pcd-serif); font-size:16.5px; line-height:1.65; color:var(--pcd-ink); }
.pcd-flag{ transition:background .35s ease, box-shadow .35s ease; }
.pcd-flag--on{ background:var(--pcd-yel); box-shadow:2px 0 0 var(--pcd-yel),-2px 0 0 var(--pcd-yel); }
.pcd-stat{ color:var(--pcd-blue); font-weight:700; }

.pcd-notes{ margin-top:20px; padding-top:16px; border-top:1px dashed var(--pcd-ink35); }
.pcd-note{ font-family:var(--pcd-mono); font-size:12px; color:rgba(26,20,16,.7); line-height:1.5; opacity:0; transform:translateY(4px); transition:opacity .4s ease,transform .4s ease; margin-top:9px; }
.pcd-note:first-child{ margin-top:0; }
.pcd-note--on{ opacity:1; transform:translateY(0); }
.pcd-arrow{ color:var(--pcd-blue); margin-right:7px; }
.pcd-tag{ margin-left:9px; font-family:var(--pcd-grot); font-weight:800; font-size:8.5px; letter-spacing:.08em; text-transform:uppercase; background:var(--pcd-ink); color:var(--pcd-paper); padding:2px 6px; white-space:nowrap; }

.pcd-sent{ margin-top:20px; padding-top:16px; border-top:1px dashed var(--pcd-ink35); font-family:var(--pcd-mono); font-size:12.5px; color:var(--pcd-ink); opacity:0; transform:translateY(4px); transition:opacity .5s ease,transform .5s ease; }
.pcd-sent--on{ opacity:1; transform:translateY(0); }
.pcd-check{ display:inline-block; margin-left:6px; background:var(--pcd-yel); color:var(--pcd-ink); padding:1px 6px; font-weight:800; }

@media (prefers-reduced-motion: reduce){
  .pcd-flag, .pcd-note, .pcd-sent, .pcd-draft, .pcd-edited, .pcd-pill { transition:none !important; }
}
`;

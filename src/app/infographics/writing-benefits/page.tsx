"use client";

import React, { useState, useEffect } from "react";
import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import { HRule, SCaps, SectionMast } from "@/components/bureau/primitives";
import {
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

// =========================================================================
// DATA
// =========================================================================
const CATS: Record<string, { label: string; color: string }> = {
  cog:    { label: "Cognitive",   color: "#1a1410" },
  emo:    { label: "Emotional",   color: "#a4441a" },
  body:   { label: "Physical",    color: "#1f5b3a" },
  doing:  { label: "Productive",  color: "#244a8c" },
  legacy: { label: "Legacy",      color: "#6e3c8a" },
};

interface Benefit {
  n: string;
  cat: string;
  title: string;
  one: string;
  stat: string;
  statLabel: string;
  study: string;
  journal: string;
  finding: string;
  do: string;
  brain: string[];
}

const BENEFITS: Benefit[] = [
  {
    n: "01", cat: "cog",
    title: "Strengthens working memory",
    one: "Expressive writing frees up cognitive bandwidth that worry was eating.",
    stat: "Sig.", statLabel: "working-memory gains at 5–7 weeks post-writing",
    study: "Klein & Boals · 2001",
    journal: "Journal of Experimental Psychology: General",
    finding: "Two semester-long experiments. In Study 1, 35 freshmen who wrote about their thoughts and feelings on coming to college showed significantly larger working-memory gains seven weeks later than 36 freshmen assigned to a trivial topic. In Study 2, students who wrote about a negative personal experience showed greater WM improvements and fewer intrusive thoughts than those who wrote about a positive or trivial topic. The paper reports the effect as statistically significant; it does not publish a clean percentage gain.",
    do: "Three sessions of twenty minutes about whatever is presently occupying your head. Not advice; ventilation.",
    brain: ["prefrontal", "hippocampus"],
  },
  {
    n: "02", cat: "cog",
    title: "Sharpens communication",
    one: "The brain organises what the hand commits.",
    stat: "Sig.", statLabel: "verbal-articulation gains in writing-to-learn meta-analysis",
    study: "Bangert-Drowns, Hurley & Wilkinson · 2004",
    journal: "Review of Educational Research",
    finding: "A meta-analysis of 48 school-based writing-to-learn studies (K-12 and college) found a small but reliable positive effect of writing interventions on academic achievement, with a mean weighted effect size of d = 0.17. Effects were larger when writing tasks included meta-cognitive prompts. Writing forces a serial ordering of thought that speech does not require, and that effect transfers into spoken explanation.",
    do: "Before a hard conversation, write the case for the other side first. Then your own.",
    brain: ["broca", "wernicke", "prefrontal"],
  },
  {
    n: "03", cat: "emo",
    title: "Reduces stress & anxiety",
    one: "Naming a worry on paper is the first move toward retiring it.",
    stat: "Sig.", statLabel: "mental distress + anxiety, randomised online trial",
    study: "Smyth, Johnson, Auer, et al. · 2018",
    journal: "JMIR Mental Health",
    finding: "A randomised trial of online positive-affect journaling with 70 adults reporting elevated anxiety. The intervention group wrote for fifteen minutes a day, three days a week, for twelve weeks. Compared with usual care, the journaling group showed significantly reduced mental distress, fewer depressive symptoms, decreased anxiety after one month, and increased resilience after the first month. The paper reports significance values rather than a clean percentage drop.",
    do: "Fifteen minutes, three mornings a week. No prompts. Begin \"Right now I am thinking about…\"",
    brain: ["amygdala", "prefrontal"],
  },
  {
    n: "04", cat: "emo",
    title: "Heals emotional pain",
    one: "Writing about hard things, four days running, leaves a measurable trace.",
    stat: "Sig.", statLabel: "fewer health-center visits over the following months",
    study: "Pennebaker & Beall · 1986",
    journal: "Journal of Abnormal Psychology",
    finding: "The foundational expressive-writing study. Forty-six undergraduates wrote for fifteen minutes a day for four consecutive days about either the most traumatic event of their lives (combining facts and feelings) or a superficial topic. The \"trauma-combination\" group reported worse mood and higher blood pressure that week — and significantly fewer visits to the campus health center in the six months that followed. Effect sizes for healthcare utilization have varied across follow-up replications; the qualitative result is robust.",
    do: "Four days. Same hour each day. Write about the same thing each time, in greater depth.",
    brain: ["amygdala", "hippocampus"],
  },
  {
    n: "05", cat: "body",
    title: "Strengthens immune response",
    one: "Expressive writing shows up in the bloodwork.",
    stat: "Sig.", statLabel: "higher hep-B antibody levels at 4 and 6 months",
    study: "Petrie, Booth, Pennebaker, Davison & Thomas · 1995",
    journal: "Journal of Consulting & Clinical Psychology",
    finding: "Forty medical students were randomly assigned to write either about traumatic events or about trivial topics for four days, immediately before receiving a course of three hepatitis-B vaccinations. Blood draws at four and six months after the first vaccination showed significantly higher antibody levels in the emotional-disclosure group. A separate Pennebaker, Kiecolt-Glaser & Glaser study (1988) had shown improved T-helper lymphocyte response in students writing about traumatic experiences.",
    do: "Pair a hard week of writing with a real-world stressor. The body files the work as repair.",
    brain: ["hippocampus", "motor"],
  },
  {
    n: "06", cat: "body",
    title: "Improves sleep",
    one: "Writing tomorrow's list tonight, not in your head at 3 a.m.",
    stat: "≈9 min", statLabel: "faster sleep onset vs. completed-tasks list",
    study: "Scullin, Krueger, Ballard, Pruett & Bliwise · 2018",
    journal: "Journal of Experimental Psychology: General",
    finding: "Fifty-seven healthy adults (ages 18–30) spent five minutes before bed writing either a to-do list for the next few days or a completed-tasks list, then underwent overnight polysomnography. The to-do-list group fell asleep significantly faster — the press release and several secondary sources put the gap at roughly nine minutes. The more specific and detailed the to-do list, the larger the effect; the opposite was true for the completed list.",
    do: "Five minutes before lights out. Tomorrow's open loops, on paper, not in the skull.",
    brain: ["prefrontal"],
  },
  {
    n: "07", cat: "cog",
    title: "Sparks creativity",
    one: "Daily pages route around the critic and find the strange ideas underneath.",
    stat: "Field", statLabel: "practitioner discipline, partial research support",
    study: "Cameron · 1992; cf. Stuckey & Nobel · 2010",
    journal: "The Artist's Way; American Journal of Public Health (review)",
    finding: "The \"morning pages\" prescription — three longhand pages, first thing, no editing — is a thirty-year practitioner discipline rather than a controlled study. The 2010 Stuckey & Nobel review of creative-arts therapies in the American Journal of Public Health concludes that expressive and artistic writing is associated with measurable improvements in psychological and physical health, including markers tied to creative engagement. The cleanest honest claim is field-tested + research-adjacent.",
    do: "Three pages, longhand, before email. They are not for publishing. They are for noticing.",
    brain: ["prefrontal", "temporal", "motor"],
  },
  {
    n: "08", cat: "doing",
    title: "Goals you write down get done",
    one: "Writing a goal — and reporting on it — substantially raises completion.",
    stat: "76% vs 43%", statLabel: "achievement rate, written + reported vs. unwritten",
    study: "Dr. Gail Matthews · Dominican Univ. · 2015",
    journal: "Dominican University of California (research summary)",
    finding: "Among 267 participants (149 completed), five groups: think-only, write-only, write + action commitments, write + share with a friend, and write + share + weekly progress reports. At four weeks, 43% of the think-only group had accomplished their goals or were past halfway. The fully-written-and-accountable group reached 76% — and the popular shorthand \"42% more likely\" comes from comparing the means (4.28 for unwritten vs higher scores for written groups).",
    do: "Write the goal on Monday. Write a one-paragraph review on Friday. Send it to one person.",
    brain: ["prefrontal"],
  },
  {
    n: "09", cat: "emo",
    title: "Cultivates gratitude",
    one: "A gratitude habit lifts mood and physical activity over weeks.",
    stat: "Sig.", statLabel: "higher well-being, more optimism, more exercise",
    study: "Emmons & McCullough · 2003",
    journal: "Journal of Personality & Social Psychology",
    finding: "Three groups kept journals over nine to ten weeks: gratitude items, hassles, or neutral events. The gratitude group reported significantly higher subjective well-being and life satisfaction, more optimism about the upcoming week, fewer physical complaints, and more time exercising. The paper reports effect sizes (eta-squared ≈ 0.05–0.10 across measures) rather than a single headline percentage.",
    do: "Sunday night, write five specific things, none of them generic. \"My back\" beats \"my health.\"",
    brain: ["prefrontal", "temporal"],
  },
  {
    n: "10", cat: "cog",
    title: "Sharpens learning & recall",
    one: "Writing-to-learn improves how well material is understood and retained.",
    stat: "d = 0.17", statLabel: "meta-analysis effect size on academic achievement",
    study: "Bangert-Drowns, Hurley & Wilkinson · 2004",
    journal: "Review of Educational Research",
    finding: "Meta-analysis of 48 school-based writing-to-learn interventions. The mean weighted effect size on academic achievement is small but reliable (d ≈ 0.17), with larger effects in studies that paired writing with meta-cognitive prompts. The earlier \"writing → IQ\" framing in popular infographics overstates the evidence; the defensible claim is that writing measurably improves how well material is learned and retained.",
    do: "A journal entry on Sunday — three paragraphs about the week. Compounds over years.",
    brain: ["prefrontal", "broca", "wernicke"],
  },
  {
    n: "11", cat: "legacy",
    title: "Outlives you",
    one: "A sentence on paper outlasts the room it was thought in.",
    stat: "∞", statLabel: "half-life of an idea in print",
    study: "Franklin · 1738; observed everywhere since",
    journal: "Poor Richard's Almanack",
    finding: "\"If you would not be forgotten as soon as you are dead, either write things worth reading or do things worth the writing.\" The reach of a written idea extends across generations and rooms its author will never enter. Every essay on this site is a small bet on that principle.",
    do: "Pick one idea you want to outlive you. Write it down this week, properly, on a URL you own.",
    brain: ["temporal", "prefrontal"],
  },
];

interface BrainRegion {
  label: string;
  note: string;
  cx: number;
  cy: number;
}

const BRAIN_REGIONS: Record<string, BrainRegion> = {
  prefrontal:  { label: "Prefrontal cortex",  note: "planning, judgement, focus",          cx: 78,  cy: 105 },
  motor:       { label: "Motor cortex",       note: "the hand encoding the thought",       cx: 130, cy: 70  },
  broca:       { label: "Broca's area",       note: "language production",                 cx: 88,  cy: 135 },
  wernicke:    { label: "Wernicke's area",    note: "language comprehension",              cx: 175, cy: 145 },
  temporal:    { label: "Temporal lobe",      note: "memory, association",                 cx: 165, cy: 175 },
  hippocampus: { label: "Hippocampus",        note: "episodic memory consolidation",       cx: 138, cy: 165 },
  amygdala:    { label: "Amygdala",           note: "emotional weighting",                 cx: 120, cy: 180 },
};

// =========================================================================
// LOCAL PRIMITIVES
// =========================================================================
const Tag = ({ catKey }: { catKey: string }) => {
  const c = CATS[catKey];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: GROT, fontSize: 10, fontWeight: 800,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: c.color,
    }}>
      <span style={{ width: 8, height: 8, background: c.color, display: "inline-block" }} />
      {c.label}
    </span>
  );
};

const StatBlock = ({ stat, label, dark }: { stat: string; label: string; dark?: boolean }) => {
  const len = String(stat).length;
  const fs  = len > 10 ? 32 : len > 6 ? 40 : 52;
  return (
    <div style={{
      borderTop: `1px solid ${dark ? "rgba(241,235,222,.5)" : INK}`,
      borderBottom: `1px solid ${dark ? "rgba(241,235,222,.5)" : INK}`,
      padding: "14px 0",
    }}>
      <div style={{
        fontFamily: SERIF, fontWeight: 700, fontSize: fs,
        color: dark ? YEL : INK, lineHeight: 0.95, letterSpacing: "-0.02em",
      }}>{stat}</div>
      <div style={{
        marginTop: 6,
        fontFamily: GROT, fontSize: 10.5, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: dark ? "rgba(241,235,222,.7)" : INK70,
        lineHeight: 1.35,
      }}>{label}</div>
    </div>
  );
};

// =========================================================================
// HERO
// =========================================================================
const Hero = () => (
  <section style={{ background: PAPER, padding: "40px 56px 32px" }}>
    <div style={{ textAlign: "center" }}>
      <SCaps size={11.5} ls="0.32em" color={INK70}>
        The Infographics Desk &nbsp;·&nbsp; Filed 11 Oct 2019 · Revised May 2026 &nbsp;·&nbsp; Interactive edition
      </SCaps>
    </div>

    <div style={{
      marginTop: 28,
      display: "grid", gridTemplateColumns: "64px 1fr 64px",
      alignItems: "end", gap: 24,
    }}>
      <div style={{
        fontFamily: SERIF, fontWeight: 700, fontSize: 240,
        color: INK, lineHeight: 0.85, textAlign: "right",
        letterSpacing: "-0.04em",
      }}>&ldquo;</div>

      <h1 style={{
        margin: 0, textAlign: "center",
        fontFamily: SERIF, fontWeight: 700, fontSize: 108,
        lineHeight: 0.94, letterSpacing: "-0.03em", color: INK,
      }}>
        Eleven scientific<br />
        benefits of <span style={{ fontStyle: "italic" }}>writing</span>,
        <br />
        <span style={{ fontStyle: "italic", color: INK70, fontSize: 72 }}>
          mapped, cited, and prescribed.
        </span>
      </h1>

      <div style={{
        fontFamily: SERIF, fontWeight: 700, fontSize: 240,
        color: INK, lineHeight: 0.85, textAlign: "left",
        letterSpacing: "-0.04em",
      }}>&rdquo;</div>
    </div>

    <div style={{ maxWidth: 760, margin: "28px auto 0", textAlign: "center" }}>
      <p style={{
        margin: 0, fontFamily: SERIF, fontSize: 21, color: INK70,
        lineHeight: 1.5, fontStyle: "italic",
      }}>
        Writing relieves stress, sharpens cognition, lifts mood, improves
        sleep, and — there is some good evidence — gets your goals done.
        Below: the eleven findings, each with its study, each with a
        prescription you can follow this week. Click any number to read the
        receipts.
      </p>
    </div>

    <div style={{
      marginTop: 40,
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 0, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`,
    }}>
      {([
        ["11",     "Findings"],
        ["10",     "Peer-reviewed sources"],
        ["1986",   "First Pennebaker paper"],
        ["20 min", "The Pennebaker dose"],
      ] as [string, string][]).map(([k, v], i) => (
        <div key={i} style={{
          padding: "22px 20px",
          borderLeft: i ? `1px solid ${INK35}` : "none",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: 42,
            color: INK, lineHeight: 1, letterSpacing: "-0.02em",
          }}>{k}</div>
          <div style={{ marginTop: 6 }}>
            <SCaps size={10.5} ls="0.18em" color={INK70}>{v}</SCaps>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// =========================================================================
// FILTER BAR
// =========================================================================
const chipStyle = (on: boolean, color: string): React.CSSProperties => ({
  padding: "8px 14px", cursor: "pointer",
  background: on ? color : "transparent",
  color: on ? PAPER : INK,
  border: `1px solid ${color}`,
  fontFamily: GROT, fontWeight: 700, fontSize: 10.5,
  letterSpacing: "0.18em", textTransform: "uppercase",
});

const FilterBar = ({
  activeCats,
  setActiveCats,
  openCount,
  totalCount,
}: {
  activeCats: Set<string>;
  setActiveCats: React.Dispatch<React.SetStateAction<Set<string>>>;
  openCount: number;
  totalCount: number;
}) => {
  const toggle = (k: string) => {
    setActiveCats(prev => {
      const s = new Set(prev);
      if (s.has(k)) s.delete(k); else s.add(k);
      return s;
    });
  };
  const all = activeCats.size === 0 || activeCats.size === Object.keys(CATS).length;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 24, padding: "18px 0", flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <SCaps size={11} ls="0.20em">Filter by category</SCaps>
        <button onClick={() => setActiveCats(new Set())} style={chipStyle(all, INK)}>
          All eleven
        </button>
        {Object.entries(CATS).map(([k, c]) => {
          const on = !all && activeCats.has(k);
          return (
            <button key={k} onClick={() => toggle(k)} style={chipStyle(on, c.color)}>
              <span style={{
                display: "inline-block", width: 8, height: 8,
                background: c.color, marginRight: 8, verticalAlign: "middle",
                border: on ? `1px solid ${PAPER}` : `1px solid ${c.color}`,
              }} />
              {c.label}
            </button>
          );
        })}
      </div>
      <SCaps size={11} ls="0.18em" color={INK55}>
        Showing {openCount} of {totalCount} findings
      </SCaps>
    </div>
  );
};

// =========================================================================
// BENEFIT CARD
// =========================================================================
const BenefitCard = ({
  b,
  open,
  onToggle,
  dim,
  onHover,
  onLeave,
  focused,
}: {
  b: Benefit;
  open: boolean;
  onToggle: () => void;
  dim: boolean;
  onHover: () => void;
  onLeave: () => void;
  focused: boolean;
}) => {
  const c = CATS[b.cat];
  return (
    <article
      onClick={onToggle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: "relative", cursor: "pointer",
        background: open ? INK : PAPER,
        color: open ? PAPER : INK,
        border: `1px solid ${INK}`,
        gridColumn: open ? "span 3" : "span 1",
        gridRow: open ? "span 2" : "span 1",
        padding: open ? "28px 30px 30px" : "20px 20px 22px",
        opacity: dim ? 0.32 : 1,
        outline: focused ? `2px solid ${YEL}` : "none",
        outlineOffset: focused ? -3 : 0,
        transition: "background .25s, color .25s, opacity .25s, outline .15s",
        display: "flex", flexDirection: "column",
        gap: open ? 18 : 10,
      }}
    >
      {/* Top row: number + cat tag */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          fontFamily: SERIF, fontWeight: 700, fontSize: open ? 64 : 48,
          color: open ? YEL : INK,
          lineHeight: 0.9, letterSpacing: "-0.03em",
        }}>
          Nº {b.n}
        </div>
        {!open && (
          <div style={{
            width: 22, height: 22,
            border: `1px solid ${INK}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: GROT, fontWeight: 800, fontSize: 14, color: INK,
          }}>+</div>
        )}
        {open && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: GROT, fontSize: 10.5, fontWeight: 800,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: YEL,
            }}>
              <span style={{ width: 8, height: 8, background: YEL, display: "inline-block" }} />
              {c.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              style={{
                width: 26, height: 26, background: "transparent",
                border: `1px solid ${PAPER}`, color: PAPER,
                fontFamily: GROT, fontWeight: 800, fontSize: 14, cursor: "pointer",
              }}
            >×</button>
          </div>
        )}
      </div>

      {!open && <Tag catKey={b.cat} />}

      <h3 style={{
        margin: 0, fontFamily: SERIF, fontWeight: 700,
        fontSize: open ? 38 : 21,
        lineHeight: open ? 1.08 : 1.12, letterSpacing: "-0.015em",
        color: open ? PAPER : INK,
      }}>
        {b.title}
      </h3>

      {!open && (
        <p style={{
          margin: 0, fontFamily: SERIF, fontStyle: "italic",
          fontSize: 14.5, color: INK70, lineHeight: 1.45,
        }}>
          {b.one}
        </p>
      )}

      {open && (
        <div style={{
          display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28,
          marginTop: 4,
        }}>
          {/* Left column: finding + prescription */}
          <div>
            <p style={{
              margin: 0, fontFamily: SERIF, fontSize: 17.5,
              lineHeight: 1.5, color: "rgba(241,235,222,.85)",
            }}>
              {b.finding}
            </p>
            <div style={{ marginTop: 22 }}>
              <SCaps size={10.5} ls="0.22em" color={YEL}>The prescription</SCaps>
              <p style={{
                margin: "8px 0 0", fontFamily: SERIF,
                fontSize: 18.5, fontStyle: "italic",
                lineHeight: 1.45, color: PAPER,
              }}>
                &ldquo;{b.do}&rdquo;
              </p>
            </div>
          </div>

          {/* Right column: stat + citation */}
          <div>
            <StatBlock stat={b.stat} label={b.statLabel} dark />
            <div style={{ marginTop: 18 }}>
              <SCaps size={10.5} ls="0.22em" color="rgba(241,235,222,.55)">
                Source · the receipts
              </SCaps>
              <div style={{
                marginTop: 8, fontFamily: SERIF, fontWeight: 600, fontSize: 16,
                color: PAPER, lineHeight: 1.35,
              }}>
                {b.study}
              </div>
              <div style={{
                marginTop: 4, fontFamily: SERIF, fontStyle: "italic",
                fontSize: 14.5, color: "rgba(241,235,222,.7)", lineHeight: 1.4,
              }}>
                {b.journal}
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <SCaps size={10.5} ls="0.22em" color="rgba(241,235,222,.55)">
                Active brain regions
              </SCaps>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {b.brain.map(r => (
                  <span key={r} style={{
                    padding: "5px 9px",
                    border: "1px solid rgba(241,235,222,.45)",
                    fontFamily: MONO, fontSize: 11, color: PAPER,
                    letterSpacing: "0.04em",
                  }}>
                    {BRAIN_REGIONS[r]?.label || r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

// =========================================================================
// BRAIN PANEL
// =========================================================================
const BrainPanel = ({
  activeRegions,
  hoveredBenefit,
}: {
  activeRegions: string[];
  hoveredBenefit: Benefit | null;
}) => {
  const active = new Set(activeRegions);
  return (
    <aside style={{
      position: "sticky", top: 16,
      background: PAPER, border: `1px solid ${INK}`,
      padding: 22,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <SCaps size={11} ls="0.22em">Atlas</SCaps>
        <SCaps size={10.5} ls="0.16em" color={INK55}>Fig. I — your brain on writing</SCaps>
      </div>
      <HRule style={{ margin: "10px 0 14px" }} />

      <svg viewBox="0 0 240 280" width="100%" style={{ display: "block", background: PAPER2 }}>
        <g fill="none" stroke={INK} strokeWidth="1.2">
          <path d="M40,140 C40,80 80,40 130,40 C190,40 210,90 210,135 C210,180 180,225 130,225 C100,225 80,215 70,200 C55,180 50,165 40,140 Z" />
          <path d="M120,225 Q115,250 130,260 Q150,250 145,225" />
          <path d="M70,100 Q100,90 130,105" opacity="0.4" />
          <path d="M85,135 Q120,120 165,138" opacity="0.4" />
          <path d="M75,170 Q120,160 175,180" opacity="0.4" />
          <path d="M105,75 Q140,80 175,95" opacity="0.4" />
        </g>

        {Object.entries(BRAIN_REGIONS).map(([key, r]) => {
          const on = active.has(key);
          return (
            <g key={key}>
              {on && (
                <circle cx={r.cx} cy={r.cy} r="16"
                  fill={YEL} opacity="0.45" />
              )}
              <circle cx={r.cx} cy={r.cy} r="5"
                fill={on ? INK : PAPER} stroke={INK} strokeWidth="1.2" />
              {on && (
                <circle cx={r.cx} cy={r.cy} r="2" fill={YEL} />
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(BRAIN_REGIONS).map(([key, r]) => {
          const on = active.has(key);
          return (
            <div key={key} style={{
              display: "flex", alignItems: "baseline", gap: 10,
              opacity: on ? 1 : 0.45,
              transition: "opacity .25s",
            }}>
              <span style={{
                width: 10, height: 10, marginTop: 4,
                background: on ? YEL : "transparent",
                border: `1px solid ${INK}`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: GROT, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.10em", textTransform: "uppercase", color: INK,
                }}>{r.label}</div>
                <div style={{
                  fontFamily: SERIF, fontStyle: "italic",
                  fontSize: 13, color: INK70, lineHeight: 1.3,
                }}>{r.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {hoveredBenefit && (
        <div style={{
          marginTop: 18, padding: 14,
          background: INK, color: PAPER,
        }}>
          <SCaps size={10} ls="0.20em" color={YEL}>Now hovering</SCaps>
          <div style={{
            marginTop: 6, fontFamily: SERIF, fontSize: 17,
            fontWeight: 600, lineHeight: 1.25,
          }}>
            Nº {hoveredBenefit.n} · {hoveredBenefit.title}
          </div>
        </div>
      )}
    </aside>
  );
};

// =========================================================================
// FINDINGS SECTION
// =========================================================================
const Findings = () => {
  const [openId,  setOpenId]  = useState<string | null>("01");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [cats,    setCats]    = useState<Set<string>>(new Set());

  const allCats = cats.size === 0 || cats.size === Object.keys(CATS).length;
  const visible = BENEFITS.filter(b => allCats || cats.has(b.cat));

  useEffect(() => {
    if (visible.length === 0) { setOpenId(null); return; }
    const openStillVisible = visible.some(b => b.n === openId);
    if (!openStillVisible) setOpenId(visible[0].n);
  }, [cats]); // eslint-disable-line react-hooks/exhaustive-deps

  const inFilter     = (n: string | null) => n ? (allCats || (BENEFITS.find(b => b.n === n) ? cats.has(BENEFITS.find(b => b.n === n)!.cat) : false)) : false;
  const openBenefit  = openId  && inFilter(openId)  ? BENEFITS.find(b => b.n === openId)  ?? null : null;
  const hoverBenefit = hoverId && inFilter(hoverId) ? BENEFITS.find(b => b.n === hoverId) ?? null : null;
  const sourceForBrain = hoverBenefit || openBenefit;
  const activeRegions  = sourceForBrain ? sourceForBrain.brain : [];

  return (
    <section style={{ background: PAPER, padding: "0 56px 64px" }}>
      <SectionMast n="02" label="The Findings · Eleven, click to expand" />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 320px",
        gap: 36, alignItems: "flex-start",
      }}>
        <div>
          <FilterBar
            activeCats={cats}
            setActiveCats={setCats}
            openCount={visible.length}
            totalCount={BENEFITS.length}
          />

          <div style={{
            marginTop: 14,
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14, gridAutoFlow: "dense",
          }}>
            {BENEFITS.map(b => {
              const inF = allCats || cats.has(b.cat);
              const open = b.n === openId && inF;
              return (
                <BenefitCard
                  key={b.n}
                  b={b}
                  open={open}
                  dim={!inF}
                  onToggle={() => {
                    if (!inF) return;
                    setOpenId(prev => prev === b.n ? null : b.n);
                  }}
                  onHover={() => inF && setHoverId(b.n)}
                  onLeave={() => setHoverId(null)}
                  focused={hoverId === b.n && !open}
                />
              );
            })}
          </div>
        </div>

        <BrainPanel activeRegions={activeRegions} hoveredBenefit={hoverBenefit ?? null} />
      </div>
    </section>
  );
};

// =========================================================================
// DOSE CALCULATOR
// =========================================================================
interface Protocol {
  label: string;
  min: string;
  finding: string;
  color: string;
  test: (ctx: { mins: number; days: number }) => boolean;
}

const PROTOCOLS: Protocol[] = [
  {
    label:   "Pennebaker · expressive writing",
    min:     "At least 15 min × 4 consecutive days",
    finding: "Health-center visits ↓ over the months after",
    color:   CATS.emo.color,
    test:    ({ mins, days }) => mins >= 15 && days >= 4,
  },
  {
    label:   "Smyth · positive-affect journal",
    min:     "At least 15 min × 3 days/week",
    finding: "Mental distress + anxiety ↓ over 12 weeks",
    color:   CATS.emo.color,
    test:    ({ mins, days }) => mins >= 15 && days >= 3,
  },
  {
    label:   "Klein & Boals · working memory",
    min:     "At least 20 min × 3 days",
    finding: "Working-memory gains at 5–7 weeks",
    color:   CATS.cog.color,
    test:    ({ mins, days }) => mins >= 20 && days >= 3,
  },
  {
    label:   "Scullin · bedtime to-do list",
    min:     "5 min, specific, before sleep",
    finding: "≈9 min faster sleep onset (vs completed-tasks list)",
    color:   CATS.body.color,
    test:    ({ mins }) => mins >= 5,
  },
  {
    label:   "Petrie · pre-vaccine writing",
    min:     "20 min × 4 days before vaccination",
    finding: "Higher hep-B antibody at 4 and 6 months",
    color:   CATS.body.color,
    test:    ({ mins, days }) => mins >= 20 && days >= 4,
  },
  {
    label:   "Matthews · written + reviewed goals",
    min:     "Write goals + send weekly update to a friend",
    finding: "76% achievement (vs 43% unwritten)",
    color:   CATS.doing.color,
    test:    ({ days }) => days >= 1,
  },
  {
    label:   "Emmons & McCullough · gratitude",
    min:     "Weekly gratitude entries for ten weeks",
    finding: "Higher well-being, optimism, exercise",
    color:   CATS.emo.color,
    test:    ({ days }) => days >= 1,
  },
];

const Dose = () => {
  const [mins, setMins] = useState(20);
  const [days, setDays] = useState(4);

  const ctx = { mins, days };
  const met = PROTOCOLS.filter(p => p.test(ctx)).length;
  const total = mins * days;

  return (
    <section style={{ background: PAPER, padding: "0 56px 80px" }}>
      <SectionMast n="03" label="Dose · The minimum effective amount" />

      <div style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56,
        alignItems: "flex-start",
      }}>
        <div>
          <h2 style={{
            margin: 0, fontFamily: SERIF, fontWeight: 700,
            fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.02em", color: INK,
          }}>
            How much<br />
            <span style={{ fontStyle: "italic" }}>writing</span>, exactly?
          </h2>
          <p style={{
            marginTop: 18, fontFamily: SERIF, fontSize: 18,
            color: INK70, lineHeight: 1.55, maxWidth: 520,
          }}>
            Pull the sliders. The list on the right checks your dose against
            the actual protocol each study used — minutes per session, days
            per week, duration of practice. A ticked box means your dose
            meets that study&rsquo;s minimum; it is not a guarantee of the same
            outcome in your particular brain.
          </p>

          <div style={{ marginTop: 32 }}>
            <SCaps size={11} ls="0.20em">Minutes per session</SCaps>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 18 }}>
              <input
                type="range" min="5" max="45" step="5"
                value={mins} onChange={(e) => setMins(+e.target.value)}
                style={{ flex: 1, accentColor: INK }}
              />
              <span style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: INK,
                minWidth: 80, textAlign: "right",
              }}>{mins} min</span>
            </div>

            <div style={{ marginTop: 22 }}>
              <SCaps size={11} ls="0.20em">Days per week</SCaps>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 18 }}>
                <input
                  type="range" min="1" max="7" step="1"
                  value={days} onChange={(e) => setDays(+e.target.value)}
                  style={{ flex: 1, accentColor: INK }}
                />
                <span style={{
                  fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: INK,
                  minWidth: 80, textAlign: "right",
                }}>{days} / 7</span>
              </div>
            </div>

            <div style={{
              marginTop: 28, padding: "16px 18px",
              border: `1px solid ${INK}`, background: PAPER2,
            }}>
              <SCaps size={10.5} ls="0.20em">Your weekly dose</SCaps>
              <div style={{
                marginTop: 6, fontFamily: SERIF, fontWeight: 700, fontSize: 30,
                letterSpacing: "-0.015em", color: INK,
              }}>
                {total} minutes &nbsp;
                <span style={{ fontStyle: "italic", color: INK55, fontSize: 22 }}>
                  · {(total / 60).toFixed(1)} hours
                </span>
              </div>
              <p style={{
                margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic",
                fontSize: 15, color: INK70, lineHeight: 1.45,
              }}>
                {met === 0 && "Your dose currently meets none of the published protocols. The sliders are mostly to the left."}
                {met >= 1 && met <= 2 && `Your dose meets ${met} of the published protocols. A modest start.`}
                {met >= 3 && met <= 4 && `Your dose meets ${met} of the published protocols. You are inside the literature.`}
                {met >= 5 && `Your dose meets ${met} of the published protocols. You are now a writer — by output, not by self-description.`}
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <SCaps size={11} ls="0.22em">Protocols your dose meets</SCaps>
            <span style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: INK,
              letterSpacing: "-0.015em", lineHeight: 1,
            }}>
              {met} <span style={{ color: INK55, fontSize: 16, fontStyle: "italic" }}>/ {PROTOCOLS.length}</span>
            </span>
          </div>
          <HRule style={{ margin: "10px 0 4px" }} />
          {PROTOCOLS.map((p, i) => {
            const ok = p.test(ctx);
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "28px 1fr auto",
                gap: 14, alignItems: "flex-start",
                padding: "12px 0", borderBottom: `1px solid ${INK15}`,
                opacity: ok ? 1 : 0.55,
              }}>
                <div style={{
                  width: 22, height: 22, marginTop: 2,
                  background: ok ? p.color : "transparent",
                  border: `1px solid ${ok ? p.color : INK}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 13,
                  lineHeight: 1,
                }}>
                  {ok ? "✓" : " "}
                </div>
                <div>
                  <div style={{
                    fontFamily: GROT, fontSize: 11, fontWeight: 800,
                    letterSpacing: "0.14em", textTransform: "uppercase", color: INK,
                  }}>{p.label}</div>
                  <div style={{
                    marginTop: 3, fontFamily: SERIF, fontSize: 14.5,
                    color: INK70, lineHeight: 1.4,
                  }}>
                    {p.min}
                    {ok && <span style={{ color: INK, fontStyle: "italic" }}> → {p.finding}</span>}
                  </div>
                </div>
                <div style={{
                  fontFamily: MONO, fontSize: 10.5, color: ok ? INK : INK35,
                  letterSpacing: "0.06em", whiteSpace: "nowrap", marginTop: 4,
                }}>
                  {ok ? "meets" : "below"}
                </div>
              </div>
            );
          })}
          <div style={{
            marginTop: 14,
            fontFamily: MONO, fontSize: 10.5, color: INK55, lineHeight: 1.55,
          }}>
            // each row is the protocol the cited study actually ran<br />
            // meeting the protocol ≠ guaranteed effect in any individual<br />
            // see &ldquo;Receipts&rdquo; below for full citations
          </div>
        </div>
      </div>
    </section>
  );
};

// =========================================================================
// RECEIPTS
// =========================================================================
const Receipts = () => {
  const cites: [string, string, string, string][] = [
    ["Klein & Boals",                              "2001", "JEP: General",                           "Expressive writing and working-memory capacity. 2 semester-long experiments."],
    ["Bangert-Drowns, Hurley & Wilkinson",         "2004", "Review of Educational Research",         "Meta-analysis of 48 writing-to-learn studies. d ≈ 0.17."],
    ["Smyth, Johnson, Auer, et al.",               "2018", "JMIR Mental Health",                     "Online positive-affect journaling, RCT, 70 adults, 12 weeks."],
    ["Pennebaker & Beall",                         "1986", "J. Abnormal Psychology",                 "The foundational expressive-writing paper. 4 days × 15 min."],
    ["Petrie, Booth, Pennebaker, Davison & Thomas","1995", "J. Consulting & Clinical Psych.",        "Expressive writing before hep-B vaccine. Higher antibody at 4 and 6 months."],
    ["Pennebaker, Kiecolt-Glaser & Glaser",        "1988", "J. Consulting & Clinical Psych.",        "Improved T-helper lymphocyte response post-writing."],
    ["Scullin, Krueger, Ballard, Pruett & Bliwise","2018", "JEP: General",                           "Bedtime to-do list vs. completed list. Polysomnography, 57 adults."],
    ["Dr. Gail Matthews",                          "2015", "Dominican University of California",     "Written + reviewed goals. 76% vs 43% achievement."],
    ["Emmons & McCullough",                        "2003", "J. Personality & Social Psychology",     "Gratitude journals, 9–10 weeks. Counting Blessings vs Burdens."],
    ["Stuckey & Nobel",                            "2010", "American J. of Public Health (review)",  "Connection between art and health, incl. expressive writing."],
    ["Cameron",                                    "1992", "The Artist's Way",                       "Morning pages — practitioner discipline, not a controlled study."],
  ];
  return (
    <section style={{ background: INK, color: PAPER, padding: "70px 56px" }}>
      <SectionMast n="04" label="Receipts · The studies, in order" dark />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
        borderTop: "1px solid rgba(241,235,222,.4)",
      }}>
        {cites.map(([who, yr, jrnl, note], i) => (
          <div key={i} style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(241,235,222,.25)",
            borderRight: (i % 3) !== 2 ? "1px solid rgba(241,235,222,.25)" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{
                fontFamily: GROT, fontWeight: 800, fontSize: 11,
                letterSpacing: "0.16em", color: YEL,
              }}>{yr}</span>
              <span style={{
                fontFamily: MONO, fontSize: 10, color: "rgba(241,235,222,.45)",
              }}>Nº {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div style={{
              marginTop: 8, fontFamily: SERIF, fontWeight: 700, fontSize: 20,
              color: PAPER, lineHeight: 1.2,
            }}>{who}</div>
            <div style={{
              marginTop: 4, fontFamily: SERIF, fontStyle: "italic",
              fontSize: 14, color: "rgba(241,235,222,.7)",
            }}>{jrnl}</div>
            <div style={{
              marginTop: 10, fontFamily: SERIF, fontSize: 14.5,
              color: "rgba(241,235,222,.85)", lineHeight: 1.45,
            }}>{note}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// =========================================================================
// EDITOR'S NOTE
// =========================================================================
const EditorsNote = () => (
  <section style={{ background: PAPER, padding: "70px 56px 40px" }}>
    <SectionMast n="05" label="Editor's note · A working filter" />
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56,
      alignItems: "flex-start",
    }}>
      <div>
        <SCaps size={11} ls="0.22em" color={INK55}>From the desk of</SCaps>
        <div style={{
          marginTop: 6, fontFamily: SERIF, fontWeight: 700, fontSize: 30,
          letterSpacing: "-0.01em", lineHeight: 1.1,
        }}>
          Syed Irfan Ajmal
        </div>
        <div style={{
          marginTop: 4, fontFamily: SERIF, fontStyle: "italic",
          fontSize: 16, color: INK70,
        }}>
          Peshawar · Founded the bureau 2010
        </div>
      </div>
      <div>
        <p style={{
          margin: 0, fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: INK,
        }}>
          The original infographic landed in 2017 and ran the rounds — a few
          dozen blogs republished it, and the email kept coming. The science
          has held up well. The honest caveat is that effect sizes vary by
          person, prompt, and persistence. None of this works if you write
          twice and quit.
        </p>
        <p style={{
          marginTop: 14, fontFamily: SERIF, fontSize: 18, fontStyle: "italic",
          color: INK70, lineHeight: 1.55,
        }}>
          The version above is the same eleven findings, opened up, made
          interactive, cited, and prescribed. If you read it and write
          nothing this week, the infographic failed. Pick one.
        </p>
        <p style={{
          marginTop: 22, padding: "14px 16px",
          background: PAPER2, border: `1px solid ${INK35}`,
          fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55,
        }}>
          <strong style={{
            color: INK, fontFamily: GROT, fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            Note on the numbers
          </strong>
          <br />
          Each stat above is what the original paper actually reports.
          Where a study gives a clean percentage (Matthews&rsquo;s 76% vs 43%,
          Scullin&rsquo;s ≈9 min, Bangert-Drowns&rsquo;s d = 0.17), it is shown.
          Where the published paper reports significance without a
          headline percentage (Klein &amp; Boals, Smyth, Emmons &amp; McCullough),
          the stat reads &ldquo;Sig.&rdquo; and the finding paragraph explains what
          the paper actually measured. The dose calculator no longer
          predicts effect sizes — it checks whether your dose meets each
          study&rsquo;s protocol.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/infographics" style={{
            padding: "12px 18px", background: INK, color: PAPER,
            textDecoration: "none",
            fontFamily: GROT, fontWeight: 700, fontSize: 11.5,
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}>← All Infographics</a>
          <a href="/insights/writing-tips" style={{
            padding: "12px 18px", background: "transparent", color: INK,
            border: `1px solid ${INK}`, textDecoration: "none",
            fontFamily: GROT, fontWeight: 700, fontSize: 11.5,
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}>Read · 100+ Writing Tips →</a>
        </div>
      </div>
    </div>
  </section>
);

// =========================================================================
// PAGE
// =========================================================================
export default function InfographicsPage() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <Mast active="Writing" />
      <Hero />
      <Findings />
      <Dose />
      <Receipts />
      <EditorsNote />
      <Subscriptions sectionNumber="06" />
      <Colophon />
    </div>
  );
}

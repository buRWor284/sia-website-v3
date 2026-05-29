"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  Mark,
  SCaps,
  SectionMast,
  SiaLogo,
} from "@/components/bureau/primitives";
import {
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// =========================================================================
// CONSTANTS
// =========================================================================
const EMOS_URL  = "https://dmr.agency/earnedmediaos/";
const STORE_KEY = "sia.reactivepr.checklist.v1";

const PLATFORMS = ["HARO", "Qwoted", "Source of Sources", "Featured", "Help a B2B Writer"];

// Editorial spot-ink palette — one per step
const STEP_COLORS = [
  "#c14a32", // 01 · brick red
  "#d99211", // 02 · ochre
  "#2f6f68", // 03 · teal
  "#2d5393", // 04 · ink blue
  "#834063", // 05 · plum
  "#3e6b45", // 06 · forest
  "#c5662a", // 07 · burnt orange
];

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const stepColor = (no: string) =>
  STEP_COLORS[(parseInt(no, 10) - 1) % STEP_COLORS.length];

// =========================================================================
// DATA
// =========================================================================
interface Snippet {
  label: string;
  text: string;
}
interface AfterBlock {
  label: string;
  items: string[];
}
interface Step {
  no: string;
  title: string;
  lead: string;
  items: string[];
  snippet?: Snippet;
  after?: AfterBlock;
}

const STEPS: Step[] = [
  {
    no: "01",
    title: "Research",
    lead: "Before a single word of the pitch, study the reporter who filed the query.",
    items: [
      "Read previous articles, then the profile of the journalist or blogger whose query you came across.",
      "Pin down their writing style, beat, and focus from what they have published.",
      "Find one of their older — and still relevant — articles to reference inside your pitch.",
    ],
  },
  {
    no: "02",
    title: "Email Subject Line",
    lead: "Tie it to the query title, then make it impossible to scroll past.",
    items: [
      "Anchor the subject line to the query title itself.",
      "Add a modifier: [Screenshots Included], [With Statistics], Insider Tips, Lesser-Known Ways, Myths, X Shocking Facts, Y Secrets.",
      "Pressure-test it with a free subject-line tester (e.g. CoSchedule) before you send.",
      "Tack [Facts + Figures] or [Stats + Examples] onto the end so it reads as substantive.",
      "An emoji is allowed — but only on the less formal platforms.",
    ],
    snippet: {
      label: "Subject-line formula",
      text: "Re: [Query Title] — Insider Tips + [Stats + Examples]",
    },
  },
  {
    no: "03",
    title: "Intro + Bio",
    lead: "Open like a human, then earn the right to be quoted in two or three lines.",
    items: [
      "Greet the reporter by first name.",
      "Keep the bio to two or three sentences — no résumé.",
      "Relate the intro to the topic: fold in credibility, social proof, expertise, and lived experience.",
    ],
  },
  {
    no: "04",
    title: "Answering the Query",
    lead: "The part editors actually paste in. Answer the exact question, nothing adjacent.",
    items: [
      "Answer the precise question(s) asked — directly.",
      "Hold it between 70 and 250 words.",
      "Include at least one statistic, with its source.",
      "Add one screenshot or one animated GIF, with its source.",
      "Make it skimmable: bullet points, short lists, the occasional CAPITALIZED phrase.",
      "Share a personal, first-hand example.",
      "Suggest a relevant tool, app, or book they can point readers to.",
    ],
  },
  {
    no: "05",
    title: "The Ending",
    lead: "Close on a question that opens a door for a reply.",
    items: [
      "End with a question rather than a sign-off.",
      "Offer to send more — make it effortless for them to say yes.",
    ],
    snippet: {
      label: "Closing lines",
      text: "Is this all that you needed?\nDoes this answer your question?\nHope this answers your question — happy to send more.",
    },
  },
  {
    no: "06",
    title: "Signature",
    lead: "Everything a journalist needs to credit and verify you, in one block.",
    items: [
      "Full name",
      "Designation / title",
      "Company name",
      "Company website URL",
      "Email",
      "Twitter / X",
      "LinkedIn",
      "Headshot URL",
    ],
    snippet: {
      label: "Signature template",
      text: "Full Name — Designation\nCompany Name · company.com\nEmail · @twitter · linkedin.com/in/you\nHeadshot: link-to-headshot.jpg",
    },
  },
  {
    no: "07",
    title: "More Hacks",
    lead: "The marginal gains — and the work that happens after you hit send.",
    items: [
      "Use branded short URLs (e.g. a bit.ly link like bit.ly/human-attention-span).",
      "Read the entire pitch again, then run it through Grammarly.",
      "Cut anything that isn't absolutely necessary — shorten the pitch.",
      "Switch on a read-receipt (e.g. Boomerang) before sending each pitch.",
    ],
    after: {
      label: "After sending",
      items: [
        "Retweet the reporter's last tweet and follow them across social.",
        "Log the pitch details in your outreach tracker / pitch sheet.",
      ],
    },
  },
];

// Derive all checkable IDs and total count
const stepIds = (s: Step) => {
  const out = s.items.map((_, i) => `${s.no}-${i}`);
  if (s.after) s.after.items.forEach((_, i) => out.push(`${s.no}-a-${i}`));
  return out;
};
const ALL_IDS = STEPS.flatMap(stepIds);
const TOTAL = ALL_IDS.length;

// =========================================================================
// ATOMS
// =========================================================================
const CopyChip = ({ label, text, accent = YEL }: { label: string; text: string; accent?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(t); done();
    }
  };
  return (
    <div style={{ marginTop: 16, background: PAPER2, border: `1px solid ${INK}`, position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px 8px 12px", borderBottom: `1px solid ${INK}`,
        background: PAPER, borderLeft: `4px solid ${accent}`,
      }}>
        <SCaps size={10} ls="0.20em" color={accent}>Clip &amp; paste · {label}</SCaps>
        <button onClick={copy} className="no-print" style={{
          cursor: "pointer", border: `1px solid ${INK}`,
          background: copied ? INK : accent, color: PAPER,
          padding: "5px 11px", fontFamily: GROT, fontWeight: 800,
          fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          transition: "background .15s",
        }}>{copied ? "Copied ✓" : "Copy"}</button>
      </div>
      <pre style={{
        margin: 0, padding: "14px 14px", fontFamily: GROT, fontWeight: 500,
        fontSize: 13.5, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap",
      }}>{text}</pre>
    </div>
  );
};

const Box = ({ on, print, onToggle, accent = INK }: {
  on: boolean; print: boolean; onToggle: () => void; accent?: string;
}) => {
  if (print) {
    return (
      <span style={{
        flex: "0 0 auto", width: 18, height: 18, marginTop: 3,
        border: `1.5px solid ${INK}`, display: "inline-block",
      }} />
    );
  }
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        flex: "0 0 auto", width: 22, height: 22, marginTop: 2, padding: 0,
        cursor: "pointer", border: `1.5px solid ${on ? accent : INK}`,
        background: on ? accent : PAPER, color: PAPER,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .12s, border-color .12s",
      }}
    >
      {on && (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M2 7.5 L5.5 11 L12 3" stroke={PAPER} strokeWidth="2.2"
                strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      )}
    </button>
  );
};

const Line = ({ id, text, on, print, onToggle, accent = INK }: {
  id: string; text: string; on: boolean; print: boolean;
  onToggle: () => void; accent?: string;
}) => (
  <li style={{ listStyle: "none", margin: 0 }}>
    <label
      onClick={print ? undefined : onToggle}
      style={{
        display: "flex", gap: 16, alignItems: "flex-start",
        padding: "13px 0", borderTop: `1px solid ${INK15}`,
        cursor: print ? "default" : "pointer",
      }}
    >
      <Box on={on} print={print} accent={accent}
           onToggle={() => { onToggle(); }} />
      <span style={{
        fontFamily: SERIF, fontSize: 17, lineHeight: 1.5,
        color: on && !print ? INK55 : INK,
        textDecoration: on && !print ? "line-through" : "none",
        textDecorationColor: INK35, textDecorationThickness: "1px",
      }}>{text}</span>
    </label>
  </li>
);

// =========================================================================
// STEP (accordion)
// =========================================================================
const StepCard = ({ s, idx, checked, open, print, onToggleItem, onToggleOpen }: {
  s: Step; idx: number; checked: Record<string, boolean>;
  open: boolean; print: boolean;
  onToggleItem: (id: string) => void;
  onToggleOpen: () => void;
}) => {
  const ids = stepIds(s);
  const done = ids.filter(id => checked[id]).length;
  const complete = done === ids.length;
  const isOpen = print || open;
  const accent = stepColor(s.no);

  return (
    <article style={{
      borderLeft: `1px solid ${INK}`, borderRight: `1px solid ${INK}`,
      borderBottom: `1px solid ${INK}`,
      borderTop: idx === 0 ? `1px solid ${INK}` : "none",
      background: PAPER, position: "relative",
    }}>
      {/* colored spot-ink spine */}
      <div aria-hidden style={{
        position: "absolute", left: 0, top: idx === 0 ? -1 : 0, bottom: -1,
        width: 5, background: accent,
      }} />

      {/* Header row */}
      <div
        onClick={print ? undefined : onToggleOpen}
        style={{
          display: "grid", gridTemplateColumns: "108px 1fr auto",
          alignItems: "center", gap: 24, padding: "22px 26px",
          cursor: print ? "default" : "pointer",
          background: complete && !print ? hexA(accent, 0.10) : "transparent",
        }}
      >
        {/* Number tile */}
        <div style={{
          width: 92, height: 92, display: "flex", alignItems: "center",
          justifyContent: "center", background: accent, border: `1.5px solid ${INK}`,
        }}>
          <span style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: PAPER,
            lineHeight: 1, letterSpacing: "-0.03em",
          }}>{s.no}</span>
        </div>

        {/* Title + lead */}
        <div>
          <h3 style={{
            margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 34,
            color: INK, lineHeight: 1.02, letterSpacing: "-0.02em",
          }}>
            {complete
              ? <span style={{
                  background: accent, color: PAPER,
                  padding: "0 0.12em", boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}>{s.title}</span>
              : s.title}
          </h3>
          <p style={{
            margin: "7px 0 0", fontFamily: SERIF, fontStyle: "italic",
            fontSize: 16, color: INK70, lineHeight: 1.4, maxWidth: 640,
          }}>{s.lead}</p>
        </div>

        {/* Right meta */}
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <SCaps size={10.5} ls="0.16em" color={complete ? accent : INK55}>
            {complete ? "Filed ✓" : `${done} / ${ids.length} logged`}
          </SCaps>
          {!print && (
            <span aria-hidden style={{
              fontFamily: SERIF, fontSize: 22, color: INK,
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform .2s", lineHeight: 1, display: "block",
            }}>⌄</span>
          )}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{ padding: "4px 26px 26px", borderTop: `1px solid ${INK}` }}>
          <ul style={{ margin: 0, padding: 0 }}>
            {s.items.map((text, i) => {
              const id = `${s.no}-${i}`;
              return (
                <Line key={id} id={id} text={text} on={!!checked[id]}
                      print={print} accent={accent}
                      onToggle={() => onToggleItem(id)} />
              );
            })}
          </ul>

          {s.snippet && (
            <CopyChip label={s.snippet.label} text={s.snippet.text} accent={accent} />
          )}

          {s.after && (
            <div style={{ marginTop: 22 }}>
              <DoubleRule style={{ marginBottom: 12 }} />
              <SCaps size={11} ls="0.20em" color={accent}>{s.after.label}</SCaps>
              <ul style={{ margin: "6px 0 0", padding: 0 }}>
                {s.after.items.map((text, i) => {
                  const id = `${s.no}-a-${i}`;
                  return (
                    <Line key={id} id={id} text={text} on={!!checked[id]}
                          print={print} accent={accent}
                          onToggle={() => onToggleItem(id)} />
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

// =========================================================================
// CONTROLS BAR
// =========================================================================
const Controls = ({ count, mode, setMode, onReset }: {
  count: number;
  mode: string;
  setMode: (m: string) => void;
  onReset: () => void;
}) => {
  const pct = Math.round((count / TOTAL) * 100);
  const gradientBg = pct === 100 ? INK
    : `linear-gradient(90deg, ${STEP_COLORS.join(", ")})`;
  const gradientSize = pct === 100 ? "auto"
    : `${pct > 0 ? (100 / pct) * 100 : 100}% 100%`;

  return (
    <div className="no-print" style={{
      position: "sticky", top: 0, zIndex: 20,
      background: PAPER, borderTop: `1px solid ${INK}`, borderBottom: `3px solid ${INK}`,
      padding: "16px 56px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        {/* Progress meter */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <SCaps size={11} ls="0.18em" color={INK}>Pitch readiness</SCaps>
            <SCaps size={11} ls="0.14em" color={INK55}>
              <span style={{ color: INK, fontSize: 14 }}>{count}</span> / {TOTAL} steps logged · {pct}%
            </SCaps>
          </div>
          <div style={{ height: 12, border: `1px solid ${INK}`, background: PAPER, position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0, width: `${pct}%`,
              background: gradientBg,
              backgroundSize: gradientSize,
              transition: "width .3s ease",
            }} />
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", border: `1px solid ${INK}` }}>
          {(["interactive", "print"] as const).map((val, i) => (
            <button key={val} onClick={() => setMode(val)} style={{
              cursor: "pointer", border: "none", padding: "11px 18px",
              borderLeft: i ? `1px solid ${INK}` : "none",
              background: mode === val ? INK : PAPER,
              color: mode === val ? PAPER : INK,
              fontFamily: GROT, fontWeight: 800, fontSize: 10.5,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              {val === "interactive" ? "Interactive" : "Print / Static"}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button onClick={onReset} style={{
          cursor: "pointer", border: `1px solid ${INK}`, background: PAPER, color: INK,
          padding: "11px 18px", fontFamily: GROT, fontWeight: 800, fontSize: 10.5,
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>Reset checklist</button>
      </div>
    </div>
  );
};

// =========================================================================
// HERO
// =========================================================================
const Hero = () => (
  <section style={{ background: PAPER, padding: "52px 56px 28px" }}>
    <div style={{ textAlign: "center", marginBottom: 18 }}>
      <SCaps color={INK70} size={12} ls="0.30em">A field guide · Journalist outreach · 2026</SCaps>
    </div>
    <h1 style={{
      margin: 0, textAlign: "center", fontFamily: SERIF, fontWeight: 700,
      color: INK, lineHeight: 0.95, letterSpacing: "-0.03em", fontSize: 96,
    }}>
      The <span style={{ fontStyle: "italic" }}><Mark>Journo Outreach</Mark></span> Checklist
    </h1>
    <p style={{
      margin: "22px auto 0", maxWidth: 760, textAlign: "center",
      fontFamily: SERIF, fontStyle: "italic", fontSize: 23, color: INK70, lineHeight: 1.4,
    }}>
      Journalist-outreach platforms are the fastest, most repeatable lane of
      reactive PR. Seven steps to a pitch reporters actually paste in — the SIA
      system for working any source-request platform.
    </p>

    {/* Results proof block */}
    <div style={{
      margin: "30px auto 0", maxWidth: 560, display: "flex", alignItems: "stretch",
      border: `1.5px solid ${INK}`, background: PAPER,
    }}>
      <div style={{
        background: YEL, color: INK, padding: "16px 26px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        borderRight: `1.5px solid ${INK}`, textAlign: "center",
      }}>
        <div style={{
          fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1,
          letterSpacing: "-0.03em",
        }}>47.06%</div>
      </div>
      <div style={{ padding: "12px 22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <SCaps size={10.5} ls="0.16em" color={INK}>0% → 47.06% HARO conversion</SCaps>
        <p style={{
          margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic",
          fontSize: 15.5, color: INK70, lineHeight: 1.4,
        }}>What this exact checklist did for our own pitches — in a matter of weeks.</p>
      </div>
    </div>

    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
      {PLATFORMS.map((p, i) => (
        <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: INK35 }}>·</span>}
          <SCaps size={11} ls="0.14em" color={INK}>{p}</SCaps>
        </span>
      ))}
    </div>
    <DoubleRule style={{ margin: "34px 0 0" }} />
  </section>
);

// =========================================================================
// PUB WALL
// =========================================================================
const PubWall = ({ n, label, kicker, lead, names, tail }: {
  n: string; label: string; kicker: string;
  lead: React.ReactNode; names: string[]; tail: string;
}) => (
  <section style={{ background: PAPER, padding: "76px 56px 64px" }}>
    <SectionMast n={n} label={label} />
    <SCaps size={11.5} ls="0.20em" color={INK70}>{kicker}</SCaps>
    <p style={{
      margin: "16px 0 0", maxWidth: 900, fontFamily: SERIF, fontSize: 28,
      lineHeight: 1.34, letterSpacing: "-0.01em", color: INK,
    }}>{lead}</p>
    <div style={{
      marginTop: 38, display: "flex", flexWrap: "wrap", alignItems: "center",
      columnGap: 22, rowGap: 12,
    }}>
      {names.map((nm, i) => (
        <React.Fragment key={nm}>
          {i > 0 && (
            <span aria-hidden style={{
              color: YEL, fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1,
            }}>·</span>
          )}
          <span style={{
            fontFamily: SERIF, fontWeight: 700, letterSpacing: "-0.02em",
            lineHeight: 1.04, color: INK, fontSize: "clamp(28px, 4vw, 50px)",
          }}>{nm}</span>
        </React.Fragment>
      ))}
    </div>
    <p style={{
      margin: "22px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: INK55,
    }}>{tail}</p>
  </section>
);

// =========================================================================
// EMOS CTA
// =========================================================================
const EmosCTA = ({
  n = "09",
  label = "Where this comes from · The Earned Media OS",
  kicker = "Own authority instead of renting it",
  heading,
  body,
  pad = "64px 56px 80px",
}: {
  n?: string;
  label?: string;
  kicker?: string;
  heading?: React.ReactNode;
  body?: React.ReactNode;
  pad?: string;
}) => (
  <section style={{ background: PAPER, padding: pad }}>
    <SectionMast n={n} label={label} />
    <div style={{
      background: INK, color: PAPER, padding: "56px 56px",
      display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 64, alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden style={{ position: "absolute", top: -40, right: -50, opacity: 0.06, pointerEvents: "none" }}>
        <SiaLogo height={300} />
      </div>
      <div style={{ position: "relative" }}>
        <SCaps size={11} ls="0.20em" color={YEL}>{kicker}</SCaps>
        <h2 style={{
          margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 54,
          color: PAPER, lineHeight: 1.0, letterSpacing: "-0.022em",
        }}>
          {heading ?? (
            <>This checklist is one page of<br />
            <span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> — the Earned Media OS.</>
          )}
        </h2>
        <p style={{
          marginTop: 22, fontFamily: SERIF, fontSize: 18, color: "rgba(241,235,222,.72)",
          lineHeight: 1.55, maxWidth: 540,
        }}>
          {body ?? (
            <>Journalist outreach is the fastest lane of reactive PR — but reactive PR is
            just one play in a bigger system. EMOS is the operating system that helps
            in-house teams build earned-media authority on their own terms — playbooks,
            cohorts, and the journalist contact book that turns a checklist into a pipeline.</>
          )}
        </p>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
        <a href={EMOS_URL} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 26px", background: YEL, color: INK, textDecoration: "none",
          fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.10em", textTransform: "uppercase",
        }}>
          <span>Explore EMOS</span>
          <span style={{ fontFamily: SERIF, fontSize: 20 }}>↗</span>
        </a>
        <SCaps size={10.5} ls="0.16em" color="rgba(241,235,222,.55)">
          dmr.agency/earnedmediaos/
        </SCaps>
      </div>
    </div>
  </section>
);

// =========================================================================
// RELATED LISTENING
// =========================================================================
const RELATED = [
  {
    slug: "haro-outreach-vs-conventional-outreach",
    code: "S03E04",
    title: "HARO Outreach vs Conventional Outreach",
    dur: "~21 min",
    note: "Why the two channels reward different pitches — and how to split your time.",
  },
  {
    slug: "collab-link-building-s02e06",
    code: "S02E06",
    title: "Collab Link Building",
    dur: "~22 min",
    note: "Earning coverage and links through people you already know.",
  },
  {
    slug: "digital-pr-vs-seo-key-s02e05",
    code: "S02E05",
    title: "Digital PR vs SEO · Similarities & Differences",
    dur: "~25 min",
    note: "Where the two disciplines overlap, where they diverge, and how to staff both.",
  },
];

const RelatedListening = () => (
  <section style={{ background: PAPER, padding: "64px 56px 8px" }}>
    <SectionMast n="10" label="Related listening · The SIA Business Podcast" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: `1px solid ${INK}` }}>
      {RELATED.map((ep, i) => {
        const accent = stepColor(String(i + 1));
        return (
          <a key={ep.slug} href={`/podcast/${ep.slug}`}
            style={{
              position: "relative", display: "flex", flexDirection: "column",
              padding: "24px 24px 22px", textDecoration: "none", color: INK,
              borderLeft: i ? `1px solid ${INK}` : "none", background: PAPER,
            }}
          >
            <div aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: accent }} />
            <span style={{
              alignSelf: "flex-start", background: accent, color: PAPER,
              padding: "4px 9px 5px", fontFamily: GROT, fontWeight: 800,
              fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase",
            }}>{ep.code}</span>
            <h3 style={{
              margin: "16px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 25,
              lineHeight: 1.08, letterSpacing: "-0.015em",
            }}>{ep.title}</h3>
            <p style={{
              margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic",
              fontSize: 15.5, color: INK70, lineHeight: 1.45, flex: 1,
            }}>{ep.note}</p>
            <div style={{
              marginTop: 18, display: "flex", alignItems: "center",
              justifyContent: "space-between", borderTop: `1px solid ${INK15}`, paddingTop: 12,
            }}>
              <SCaps size={10} ls="0.16em" color={INK55}>{ep.dur}</SCaps>
              <SCaps size={10} ls="0.16em" color={accent}>Listen ↗</SCaps>
            </div>
          </a>
        );
      })}
    </div>
  </section>
);

// =========================================================================
// PAGE ROOT
// =========================================================================
export default function JournoOutreachChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({ "01": true });
  const [mode, setMode] = useState<"interactive" | "print">("interactive");
  const print = mode === "print";

  // Persist to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.checked) setChecked(data.checked);
        if (data.open) setOpen(data.open);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ checked, open }));
    } catch (_) {}
  }, [checked, open]);

  const count = ALL_IDS.filter(id => checked[id]).length;

  const toggleItem = useCallback((id: string) =>
    setChecked(c => ({ ...c, [id]: !c[id] })), []);
  const toggleOpen = useCallback((no: string) =>
    setOpen(o => ({ ...o, [no]: !o[no] })), []);
  const reset = useCallback(() => {
    setChecked({});
    setOpen({ "01": true });
  }, []);

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ background: PAPER, minHeight: "100vh" }}>
        <Mast active="Writing" />
        <Hero />

        <Controls count={count} mode={mode} setMode={m => setMode(m as "interactive" | "print")} onReset={reset} />

        {/* Checklist body */}
        <section style={{ background: PAPER, padding: print ? "34px 56px 60px" : "40px 56px 70px" }}>
          {print && (
            <div style={{ marginBottom: 26 }}>
              <SCaps size={11} ls="0.18em" color={INK70}>
                Static edition · Print or save as PDF · {TOTAL} checkpoints across 7 steps
              </SCaps>
            </div>
          )}
          <div>
            {STEPS.map((s, i) => (
              <StepCard
                key={s.no} s={s} idx={i}
                checked={checked} open={!!open[s.no]} print={print}
                onToggleItem={toggleItem}
                onToggleOpen={() => toggleOpen(s.no)}
              />
            ))}
          </div>
          <div style={{
            marginTop: 28, display: "flex", justifyContent: "space-between",
            alignItems: "baseline", flexWrap: "wrap", gap: 12,
          }}>
            <SCaps size={10.5} ls="0.16em" color={INK55}>
              Produced by SIA Media · The Sunday Bureau
            </SCaps>
            <SCaps size={10.5} ls="0.16em" color={INK55}>
              Works for HARO · Qwoted · Source of Sources · Featured · Help a B2B Writer
            </SCaps>
          </div>
        </section>

        <PubWall
          n="08"
          label="Earned-media track record · For clients"
          kicker="Working HARO & platforms like it since 2018"
          lead={<>We&rsquo;ve run this exact system since 2018 — and earned our clients brand mentions and editorial backlinks from the likes of:</>}
          names={["Business Insider", "Forbes", "MSN", "BankRate", "Apartment Therapy", "HR.com", "Recruiting.com"]}
          tail="…and several others."
        />

        <EmosCTA />

        <RelatedListening />

        <PubWall
          n="11"
          label="The author's own record · Syed Irfan Ajmal"
          kicker="Earned via HARO & similar journalist-outreach platforms"
          lead={<>And it&rsquo;s the same system Syed Irfan Ajmal has used to personally earn backlinks and brand mentions from the likes of:</>}
          names={["Forbes", "The Next Web", "SEMrush", "Search Engine Journal", "SERPed", "Reader's Digest"]}
          tail="…and several others."
        />

        <EmosCTA
          n="12"
          label="Build the same engine · The Earned Media OS"
          kicker="From one-off wins to a standing pipeline"
          heading={<>Want coverage like this,<br /><span style={{ fontStyle: "italic", color: YEL }}>on repeat?</span></>}
          body={<>Every mention above started with a single pitch like the one this checklist builds. EMOS is how you make it repeatable — the playbooks, cohorts, and journalist contact book that turn scattered wins into a standing earned-media pipeline.</>}
          pad="64px 56px 96px"
        />

        <Subscriptions sectionNumber="13" />
        <Colophon />
      </div>
    </>
  );
}

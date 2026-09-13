"use client";

/**
 * PressIQ research ticker (2026-09-11). One research fact at a time, each
 * linking to its primary source. Used on three surfaces, all reading the same
 * list (researchFacts() over EVIDENCE in lib/pitch/config.ts):
 *   - the public intro panel (/tools/pressiq)
 *   - the scoring wait screen (LoadingPanel in cards.tsx, both surfaces)
 *   - the dashboard pitch form (compact strip, via the core's preFormSlot)
 *
 * Behaviour: ~5s per fact, soft fade, pauses while hovered or focused, and
 * becomes a static list under prefers-reduced-motion. The visible fact sits in
 * an aria-live="polite" region so screen readers hear one fact at a time and
 * are never interrupted mid-sentence.
 */

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EMAIL_STUDY_LABEL, researchFacts, type ResearchFact } from "@/lib/pitch/config";
import { INK, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";

const FACTS = researchFacts();
const FADE_MS = 450;

const ra = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

// Hover/focus states need real CSS. Plain string, no backticks inside.
const RT_CSS =
  ".rt-link{color:inherit;text-decoration:none;display:block}" +
  ".rt-link:hover .rt-src,.rt-link:focus-visible .rt-src{text-decoration:underline;text-underline-offset:2px}" +
  ".rt-link:focus-visible{outline:2px solid " + INK + ";outline-offset:3px}";

const CHIP: React.CSSProperties = {
  display: "inline-block", flexShrink: 0, background: YEL, color: INK,
  fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".16em",
  textTransform: "uppercase", padding: "3px 7px", lineHeight: 1.3,
};

const SRC: React.CSSProperties = {
  fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em",
  textTransform: "uppercase", color: ra(INK, 0.62), lineHeight: 1.5,
};

const EMAIL_TAG: React.CSSProperties = {
  display: "inline-block", marginTop: 6, fontFamily: MONO, fontWeight: 700,
  fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase",
  color: ra(INK, 0.62), border: `1px solid ${ra(INK, 0.3)}`, padding: "2px 6px",
};

// prefers-reduced-motion as an external store: correct on the first client
// render, updates live if the setting changes, and false on the server.
const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia?.(RM_QUERY);
  mq?.addEventListener?.("change", cb);
  return () => mq?.removeEventListener?.("change", cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeRM,
    () => !!window.matchMedia?.(RM_QUERY).matches,
    () => false,
  );
}

/** One fact. `compact` is a single row for the dashboard pitch form. */
function Fact({ f, compact }: { f: ResearchFact; compact: boolean }) {
  return (
    <a href={f.url} target="_blank" rel="noopener noreferrer" className="rt-link">
      <span style={compact
        ? { display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }
        : { display: "block" }}>
        <span style={{
          display: "block", fontFamily: SERIF, fontWeight: 700, color: INK, letterSpacing: "-.02em", lineHeight: 1,
          fontSize: compact ? 24 : 36, marginBottom: compact ? 0 : 8, flexShrink: 0,
        }}>
          {f.stat}
        </span>
        <span style={{ display: "block", flex: compact ? "1 1 260px" : undefined, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: SERIF, fontSize: compact ? 14 : 15.5, color: ra(INK, 0.78), lineHeight: 1.45, marginBottom: 4 }}>
            {f.line}
          </span>
          <span className="rt-src" style={SRC}>{f.sourceShort} ↗</span>
          {f.emailStudy && (compact
            ? <span style={{ ...EMAIL_TAG, marginTop: 0, marginLeft: 8, verticalAlign: "1px" }}>{EMAIL_STUDY_LABEL}</span>
            : <><br /><span style={EMAIL_TAG}>{EMAIL_STUDY_LABEL}</span></>)}
        </span>
      </span>
    </a>
  );
}

export default function ResearchTicker({
  compact = false, intervalMs = 5000, style,
}: {
  /** Single-row strip (dashboard pitch form) instead of the display card. */
  compact?: boolean;
  intervalMs?: number;
  style?: React.CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(true);
  const [paused, setPaused] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced || paused || FACTS.length < 2) return;
    const id = setInterval(() => {
      setShown(false);
      fadeTimer.current = setTimeout(() => {
        setIdx((i) => (i + 1) % FACTS.length);
        setShown(true);
      }, FADE_MS);
    }, intervalMs);
    return () => {
      clearInterval(id);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      setShown(true); // never leave a fact stuck mid-fade when pausing
    };
  }, [reduced, paused, intervalMs]);

  if (FACTS.length === 0) return null;

  const frame: React.CSSProperties = {
    background: PAPER, border: `1px solid ${INK}`,
    padding: compact ? "12px 16px" : "18px 20px 20px",
    ...style,
  };

  const head = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: compact ? 8 : 14 }}>
      <span style={CHIP}>Research</span>
      {!reduced && FACTS.length > 1 && (
        <span aria-hidden="true" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", color: ra(INK, 0.5) }}>
          {String(idx + 1).padStart(2, "0")} / {String(FACTS.length).padStart(2, "0")}{paused ? " · paused" : ""}
        </span>
      )}
    </div>
  );

  // Reduced motion: every fact, static, no rotation and no fade. The compact
  // strip sits above the dashboard pitch form, so there the list folds behind
  // a <details> after the first fact rather than pushing the form down.
  if (reduced) {
    const list = (items: ResearchFact[], offset: number) => (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((f, i) => (
          <li key={f.key} style={{ padding: "10px 0", borderTop: i + offset ? `1px solid ${ra(INK, 0.12)}` : "none" }}>
            <Fact f={f} compact />
          </li>
        ))}
      </ul>
    );
    return (
      <section aria-label="What the research says" style={frame}>
        <style>{RT_CSS}</style>
        {head}
        {compact ? (
          <>
            {list(FACTS.slice(0, 1), 0)}
            <details>
              <summary style={{ ...SRC, cursor: "pointer", paddingTop: 6 }}>All {FACTS.length} research facts</summary>
              {list(FACTS.slice(1), 1)}
            </details>
          </>
        ) : list(FACTS, 0)}
      </section>
    );
  }

  const f = FACTS[idx];
  return (
    <section
      aria-label="What the research says"
      style={frame}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false); }}
    >
      <style>{RT_CSS}</style>
      {head}
      {/* Every fact is stacked invisibly in the same grid cell so the card is
          always as tall as the longest one: no layout jump on rotation. */}
      <div style={{ display: "grid" }}>
        {FACTS.map((g) => (
          <div key={g.key} aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>
            <Fact f={g} compact={compact} />
          </div>
        ))}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{ gridArea: "1 / 1", opacity: shown ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
        >
          <Fact key={f.key} f={f} compact={compact} />
        </div>
      </div>
    </section>
  );
}

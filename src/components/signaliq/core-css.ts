/**
 * SignalIQ — shared scoped CSS for the tool core (Phase P6).
 *
 * Moved verbatim from app/tools/signaliq/page.tsx PAGE_CSS so both surfaces
 * (public tool page + EMOS dashboard) style the same components identically.
 * Includes the landing-only rules too (hero grid, ticker, proof strip) — a few
 * unused rules on the dashboard are cheaper than a fragile split.
 *
 * IMPORTANT: the core component does NOT render this itself. Each wrapper must
 * render `<style>{SIQ_CSS}</style>` exactly once (the public page needs these
 * rules on the landing screen, where the core isn't mounted yet).
 */
import {
  DARK,
  DARK_BD,
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

// ── spot colours (shared by cards / pack / css) ───────────────────────────────
export const GREEN = "#3e6b45";
export const AMBER = "#d99211";
export const RED = "#c14a32";
export const BLUE = "#2d5393";

export const SIQ_CSS = `
  /* layout */
  .siq-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .siq-detail-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* step bar */
  .siq-step-bar {
    display: flex;
    background: ${PAPER};
    border-bottom: 1px solid ${INK15};
    position: sticky;
    top: 52px;
    z-index: 50;
  }
  .siq-step {
    flex: 1;
    padding: 12px 22px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 9.5px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: rgba(26,20,16,.3);
    cursor: default;
    transition: color 0.12s ease, border-color 0.12s ease;
  }
  .siq-step.active {
    color: ${INK};
    border-bottom-color: ${INK};
  }
  .siq-step.past {
    color: ${INK55};
    cursor: pointer;
  }
  .siq-step.past:hover { color: ${INK}; }
  .siq-step-no {
    font-family: ${SERIF};
    font-style: italic;
    opacity: 0.6;
  }

  /* hero headline */
  .siq-h1 {
    margin: 0;
    font-family: ${SERIF};
    font-weight: 700;
    font-size: clamp(28px,4.5vw,54px);
    line-height: 0.96;
    letter-spacing: -0.03em;
    color: ${INK};
  }

  /* beat tabs — 2-row grid (3 per row) */
  .siq-beat-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid ${INK15};
  }
  .siq-tab {
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-right: 1px solid ${INK15};
    border-bottom: 1px solid ${INK15};
    font-family: ${GROT};
    font-weight: 700;
    font-size: 10px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(26,20,16,.45);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    white-space: nowrap;
  }
  .siq-tab:nth-child(3n)       { border-right: none; }
  /* 7 beats in a 3-col grid: the 7th (Agency) spans the full last row so there's
     no dangling half-row. Bottom border only comes off the very last tab. */
  .siq-tab:nth-child(7)        { grid-column: 1 / -1; border-right: none; }
  .siq-tab:last-child          { border-bottom: none; }
  .siq-tab.active { background: ${INK}; color: ${PAPER}; }
  .siq-tab-no {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 10px;
    opacity: 0.6;
    margin-right: 4px;
  }

  /* multi-beat: secondary / tertiary controls (progressive disclosure) */
  .siq-multibeat {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    margin-top: 14px;
  }
  .siq-addbeat {
    background: transparent;
    border: 1px dashed ${INK15};
    padding: 7px 12px;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 10px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: ${INK55};
    cursor: pointer;
    transition: color 0.12s ease, border-color 0.12s ease;
  }
  .siq-addbeat:hover { color: ${INK}; border-color: ${INK}; }
  .siq-addbeat-opt { opacity: 0.6; font-weight: 600; }
  .siq-beatrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid ${INK15};
    padding: 5px 6px 5px 10px;
  }
  .siq-beatrow-lbl {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8.5px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK55};
  }
  .siq-beatsel {
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    color: ${INK};
    background: ${PAPER};
    border: 1px solid ${INK15};
    padding: 5px 8px;
    cursor: pointer;
    outline: none;
  }
  .siq-beatx {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    font-size: 16px;
    line-height: 1;
    color: ${INK55};
    cursor: pointer;
    transition: color 0.12s ease;
  }
  .siq-beatx:hover { color: ${RED}; }

  /* scan button */
  .siq-scan-btn {
    padding: 14px 28px;
    border: none;
    background: ${INK};
    color: ${PAPER};
    font-family: ${GROT};
    font-weight: 800;
    font-size: 14px;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.12s ease;
  }
  .siq-scan-btn:hover:not(:disabled) { opacity: 0.85; }
  .siq-scan-btn:disabled {
    background: rgba(26,20,16,.15);
    color: ${INK55};
    cursor: wait;
  }

  /* opportunity card */
  .siq-card {
    border: 1px solid ${INK15};
    display: flex;
    flex-direction: column;
  }
  .siq-card-click { cursor: pointer; transition: border-color .12s ease, transform .12s ease, box-shadow .12s ease; }
  .siq-card-click:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(26,20,16,.08); }

  /* wizard footer buttons */
  .siq-wiz-ghost {
    background: transparent; border: 1px solid rgba(241,235,222,.3); color: rgba(241,235,222,.9);
    font-family: ${GROT}; font-weight: 700; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    padding: 10px 20px; cursor: pointer; transition: opacity .12s ease;
  }
  .siq-wiz-ghost:hover:not(:disabled) { opacity: .8; }
  .siq-wiz-ghost:disabled { opacity: .3; cursor: default; }
  .siq-wiz-link {
    background: transparent; border: none; color: rgba(241,235,222,.55);
    font-family: ${GROT}; font-weight: 700; font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    padding: 10px 12px; cursor: pointer; text-decoration: underline;
  }
  .siq-wiz-link:hover { color: rgba(241,235,222,.85); }
  .siq-wiz-next {
    background: ${YEL}; border: none; color: ${INK};
    font-family: ${GROT}; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    padding: 11px 26px; cursor: pointer; transition: opacity .12s ease;
  }
  .siq-wiz-next:hover:not(:disabled) { opacity: .85; }
  .siq-wiz-next:disabled { opacity: .4; cursor: default; }
  @media (max-width: 560px) { .siq-wiz-label { display: none; } }
  .siq-card-head {
    background: ${INK};
    padding: 12px 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .siq-card-body {
    background: ${PAPER2};
    padding: 14px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .siq-gen-btn {
    margin: 0 16px 16px;
    padding: 11px 14px;
    border: none;
    background: ${INK};
    color: ${PAPER};
    font-family: ${GROT};
    font-weight: 800;
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.12s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .siq-gen-sub {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(241,235,222,.55);
  }
  .siq-gen-btn:hover { opacity: 0.85; }

  /* save-to-EMOS button (dashboard wrapper; a11y: ink on amber) */
  .siq-save-btn {
    margin: -6px 16px 16px;
    padding: 11px 14px;
    border: none;
    background: ${YEL};
    color: ${INK};
    font-family: ${GROT};
    font-weight: 800;
    font-size: 10px;
    letter-spacing: .10em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.12s ease;
  }
  .siq-save-btn:hover:not(:disabled) { opacity: 0.85; }
  .siq-save-btn:disabled {
    background: ${PAPER2};
    color: ${INK55};
    cursor: default;
  }

  /* source chips */
  .siq-chip {
    font-family: ${GROT};
    font-weight: 700;
    font-size: 9.5px;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: ${INK55};
    text-decoration: none;
    border: 1px solid ${INK15};
    padding: 3px 7px;
    background: ${PAPER};
    transition: border-color 0.12s ease, color 0.12s ease;
  }
  .siq-chip:hover { border-color: ${INK35}; color: ${INK}; }

  /* back / copy button */
  .siq-back {
    background: none;
    border: none;
    cursor: pointer;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: ${INK};
    transition: opacity 0.12s ease;
    padding: 0;
  }
  .siq-back:hover { opacity: 0.65; }

  /* cross-tool link */
  .siq-cross-link {
    display: inline-block;
    margin-top: 12px;
    font-family: ${GROT};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: ${INK};
    text-decoration: underline;
    text-decoration-color: ${INK35};
  }

  /* email input */
  .siq-input {
    background: ${PAPER};
    border: 1px solid ${INK};
    color: ${INK};
    font-family: ${SERIF};
    font-size: 15px;
    padding: 11px 13px;
    outline: none;
  }
  .siq-input:focus { border-color: ${YEL}; box-shadow: 0 0 0 2px rgba(245,184,31,.25); }

  /* hero 2-col grid */
  .siq-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(28px,4vw,56px);
    margin-top: 16px;
    align-items: start;
  }
  .siq-hero-panel {
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 20px 22px;
    position: relative;
  }

  /* responsive */
  @media (max-width: 860px) {
    .siq-hero-grid { grid-template-columns: 1fr; }
    .siq-hero-panel { display: none; }
  }
  @media (max-width: 720px) {
    .siq-detail-cols { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .siq-beat-tabs { grid-template-columns: repeat(2, 1fr); }
    /* 2-col recompute (bottom borders already correct from the desktop rules:
       only the last tab drops its bottom). The 7th tab stays full-width. */
    .siq-tab:nth-child(3n)        { border-right: 1px solid ${INK15}; }
    .siq-tab:nth-child(2n)        { border-right: none; }
    .siq-cards { grid-template-columns: 1fr; }
    .siq-step { padding: 10px 12px; font-size: 8.5px; }
  }

  /* ── wire-feed ticker ───────────────────────────────────────────── */
  .siq-ticker-wrap {
    display: flex;
    align-items: stretch;
    background: ${DARK};
    border-bottom: 1px solid ${DARK_BD};
    overflow: hidden;
    height: 42px;
  }
  .siq-ticker-label {
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-right: 1px solid rgba(241,235,222,.08);
    flex-shrink: 0;
    background: rgba(241,235,222,.03);
  }
  .siq-ticker-overflow {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }
  @keyframes siq-crawl {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .siq-ticker-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: siq-crawl 110s linear infinite;
    white-space: nowrap;
  }
  .siq-ticker-track:hover { animation-play-state: paused; }
  .siq-ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 6px;
  }
  .siq-ticker-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${YEL};
    flex-shrink: 0;
    animation: siq-pulse 2s ease-in-out infinite;
  }
  .siq-ticker-sep {
    font-family: ${MONO};
    font-size: 8px;
    color: rgba(241,235,222,.15);
    letter-spacing: .18em;
    padding: 0 4px;
  }

  /* ── sources sidebar ────────────────────────────────────────────── */
  .siq-results-wrap {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    max-width: 1400px;
    margin: 0 auto;
  }
  .siq-cards-col {
    flex: 1;
    min-width: 0;
  }
  .siq-sources-sidebar {
    width: 220px;
    flex-shrink: 0;
    position: sticky;
    top: 108px;
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 16px 14px;
  }
  .siq-source-card {
    padding-bottom: 16px;
    border-bottom: 1px solid ${INK15};
  }
  .siq-source-card:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  @keyframes siq-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .45; transform: scale(.75); }
  }
  .siq-pulse {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${GREEN};
    flex-shrink: 0;
    animation: siq-pulse 2.2s ease-in-out infinite;
  }
  @media (max-width: 1100px) {
    .siq-sources-sidebar { display: none; }
  }

  /* tooltip popup — hard-reset inherited uppercase from tab buttons */
  .siq-tooltip-popup,
  .siq-tooltip-popup * {
    text-transform: none !important;
    letter-spacing: normal !important;
    font-family: ${SERIF} !important;
    font-style: italic !important;
    font-size: 8px !important;
    line-height: 1.6 !important;
    color: ${INK55} !important;
  }

  /* ── scan loader (rotating stats while scanning) ─────────────────── */
  .siq-loader {
    max-width: 640px;
    margin: 6px auto 0;
    border: 1px solid ${INK15};
    background: ${PAPER2};
    padding: 20px 22px;
  }
  .siq-loader-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .siq-loader-bar {
    position: relative;
    flex: 1;
    height: 2px;
    background: ${INK15};
    overflow: hidden;
  }
  .siq-loader-bar > span {
    position: absolute;
    top: 0;
    left: -35%;
    height: 100%;
    width: 35%;
    background: ${YEL};
    animation: siq-scan-bar 1.25s ease-in-out infinite;
  }
  @keyframes siq-scan-bar {
    0%   { left: -35%; }
    100% { left: 100%; }
  }
  .siq-loader-feeds {
    display: flex;
    flex-wrap: wrap;
    gap: 9px 16px;
    margin: 16px 0 18px;
  }
  .siq-loader-feed {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: ${MONO};
    font-weight: 700;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: ${INK55};
    animation: siq-feed-in .5s ease both;
    animation-delay: var(--d);
  }
  .siq-loader-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${GREEN};
    animation: siq-pulse 1.4s ease-in-out infinite;
    animation-delay: var(--d);
  }
  @keyframes siq-feed-in {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: none; }
  }
  .siq-loader-stat {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 86px;
    animation: siq-stat-in .5s ease both;
  }
  @keyframes siq-stat-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  .siq-loader-stat-big {
    font-family: ${SERIF};
    font-weight: 700;
    font-size: 30px;
    line-height: 1;
    color: ${INK};
    letter-spacing: -0.02em;
  }
  .siq-loader-stat-text {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 14px;
    color: ${INK70};
    line-height: 1.45;
    max-width: 520px;
  }
  .siq-loader-stat-src {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK35};
  }
  @media (prefers-reduced-motion: reduce) {
    .siq-loader-bar > span { animation: none; left: 0; width: 100%; opacity: .5; }
    .siq-loader-feed, .siq-loader-stat { animation: none; }
    .siq-loader-dot { animation: none; }
  }

  /* ── proof strip (headline stats on landing) ─────────────────────── */
  .siq-proof {
    padding: 6px clamp(22px,5vw,56px) 2px;
  }
  .siq-proof-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid ${INK15};
    background: ${PAPER2};
  }
  .siq-proof-cell {
    padding: 20px 18px;
    border-right: 1px solid ${INK15};
  }
  .siq-proof-cell:last-child { border-right: none; }
  .siq-proof-num {
    display: block;
    font-family: ${SERIF};
    font-weight: 700;
    font-size: clamp(26px,3.4vw,38px);
    line-height: 1;
    color: ${INK};
    letter-spacing: -0.02em;
  }
  .siq-proof-label {
    margin: 8px 0 8px;
    font-family: ${SERIF};
    font-style: italic;
    font-size: 12.5px;
    color: ${INK55};
    line-height: 1.4;
  }
  .siq-proof-src {
    font-family: ${MONO};
    font-weight: 700;
    font-size: 8px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${INK35};
  }
  .siq-proof-foot {
    max-width: 1100px;
    margin: 10px auto 0;
    text-align: center;
    font-family: ${SERIF};
    font-style: italic;
    font-size: 12px;
    color: ${INK55};
  }
  @media (max-width: 760px) {
    .siq-proof-inner { grid-template-columns: repeat(2, 1fr); }
    .siq-proof-cell:nth-child(2) { border-right: none; }
    .siq-proof-cell:nth-child(1),
    .siq-proof-cell:nth-child(2) { border-bottom: 1px solid ${INK15}; }
  }

  /* ecosystem grid CSS moved to ToolPipelineFooter shared component */
`;

/**
 * Bureau design tokens — mirror of design_handoff/bureau-shared.jsx 8–19.
 * Used inline in component styles so the .tsx ports stay line-for-line
 * faithful to the prototype `style={{}}` measurements.
 *
 * PAPER updated to warm-cream spec (#f1ebde) — matches PressIQ handoff.
 */

// ── Light surface ─────────────────────────────────────────────────────────────
export const PAPER   = "#f1ebde";   // warm cream (primary surface)
export const PAPER2  = "#e8e0cc";   // warm cream 2 (secondary surface / hover)

// ── Ink ───────────────────────────────────────────────────────────────────────
export const INK     = "#1a1410";
export const INK70   = "rgba(26,20,16,.70)";
export const INK55   = "rgba(26,20,16,.55)";
export const INK35   = "rgba(26,20,16,.32)";
export const INK15   = "rgba(26,20,16,.15)";

// ── Accent ────────────────────────────────────────────────────────────────────
export const YEL     = "#f5b81f";
export const YEL2    = "#ffc83a";

// ── Tool-shell dark surfaces (shared across all tool headers/shells) ───────────
export const DARK    = "#0e0d0a";   // tool header / dark shell background
export const DARK2   = "#181510";   // left panel in split-pane tools
export const DARK_BD = "#2a2318";   // dark border

// ── Typography ────────────────────────────────────────────────────────────────
export const SERIF = 'var(--font-serif)';
export const GROT  = 'var(--font-grot)';
export const MONO  = 'var(--font-mono)';

/** @deprecated use CAL_LINK + Cal.com popup. Kept for any remaining Calendly fallbacks. */
export const CALENDLY = "https://calendly.com/sia_dmr_agency/emos";

/** Cal.com event path — used with data-cal-link for popup and inline embeds. */
export const CAL_LINK = "syed-irfan-ajmal-cjjebv/30min";

/** Full Cal.com booking URL — used as href fallback when JS is unavailable. */
export const CAL_URL  = "https://cal.com/syed-irfan-ajmal-cjjebv/30min";

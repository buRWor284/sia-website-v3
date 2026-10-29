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
// 2026-10-14 site-health baseline #1: INK55/INK35 are used as READABLE text (eyebrows,
// "On this page", step and section numbers, Format/Author/Type labels) and measured
// 3.85:1 and 2.03:1 on PAPER. Raised to .72 (≈4.6:1) and .62 (≈4.5:1+) so every
// dim label clears WCAG AA. Names kept so no importer changes.
export const INK55   = "rgba(26,20,16,.72)";
export const INK35   = "rgba(26,20,16,.62)";
export const INK15   = "rgba(26,20,16,.15)";

// ── Accent ────────────────────────────────────────────────────────────────────
export const YEL     = "#f5b81f";
export const YEL2    = "#ffc83a";
export const BLUE    = "#2e90c3";
export const BLUE_AA = "#17628a";   // same blue, darkened for small text on cream (5.0:1 on PAPER2, AA)   // editorial blue accent (flywheel numbers, eyebrow, CTA underline)

// ── Tool-shell dark surfaces (shared across all tool headers/shells) ───────────
export const DARK    = "#0e0d0a";   // tool header / dark shell background
export const DARK2   = "#181510";   // left panel in split-pane tools
export const DARK_BD = "#2a2318";   // dark border

// ── Typography ────────────────────────────────────────────────────────────────
export const SERIF = 'var(--font-serif)';
export const GROT  = 'var(--font-grot)';
export const MONO  = 'var(--font-mono)';

/** All legacy booking CTAs point to the dedicated strategy-call page. */
export const CALENDLY = "/strategy-call";

/** Cal.com event path — used with data-cal-link for popup and inline embeds. */
export const CAL_LINK = "syed-irfan-ajmal-cjjebv/30min";

/** Full Cal.com booking URL — used as href fallback when JS is unavailable. */
export const CAL_URL  = "https://cal.com/syed-irfan-ajmal-cjjebv/30min";

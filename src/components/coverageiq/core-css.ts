// ─────────────────────────────────────────────────────────────────────────────
// CoverageIQ — shared CSS (tab hover + mobile horizontal-scroll hint)
// Rendered by each shell via <style dangerouslySetInnerHTML={{ __html: CIQ_CSS }} />.
// The four data tables scroll horizontally on narrow screens; .ciq-scroll-hint
// shows a "swipe for more" cue above them under 700px only (desktop never needs
// it). NEVER put a backtick inside this literal.
// ─────────────────────────────────────────────────────────────────────────────

export const CIQ_CSS = `
  .ciq-tab { transition: all 0.12s ease; }
  .ciq-tab:hover { opacity: 0.8; }
  .ciq-scroll-hint { display: none; }
  @media (max-width: 700px) {
    .ciq-scroll-hint {
      display: flex; align-items: center; gap: 6px;
      font-family: var(--font-grot), sans-serif; font-weight: 700; font-size: 9px;
      letter-spacing: 0.14em; text-transform: uppercase; color: rgba(26,20,16,.5);
      padding: 6px 2px;
    }
  }
`;

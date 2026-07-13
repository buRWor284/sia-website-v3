/**
 * PressIQ — shared tool-core CSS (Phase P6, Unified-Gate-Freemium RFP v1.1).
 *
 * The single `.piq-*` stylesheet for BOTH surfaces. Moved verbatim from the old
 * public page's PAGE_CSS. Wrappers render `<style>{PIQ_CSS}</style>` (the core
 * does not) — the public page for its landing + tool, the dashboard scoped
 * inside its container. Wrapper-only rules (`.piq-page/.piq-col/.piq-step-bar`)
 * live here too and are simply unused by the dashboard; keeping one string
 * avoids drift.
 *
 * NEVER put a backtick inside this template literal (it broke prod twice on
 * SignalIQ, 2026-07-12).
 */
import { DARK, DARK2, DARK_BD, GROT, INK, MONO, PAPER, YEL } from "@/lib/tokens";

const ra = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

export const PIQ_CSS = `
  .piq-page{background:${PAPER};min-height:100dvh;display:flex;flex-direction:column}
  .piq-step-bar{display:flex;align-items:center;justify-content:center;gap:0;background:${PAPER};border-bottom:1px solid ${ra(INK,0.1)};padding:12px 20px;flex-wrap:wrap}
  .piq-step{display:flex;align-items:center;gap:8px;padding:4px 16px;font-family:${GROT};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${ra(INK,0.35)};white-space:nowrap}
  .piq-step.past{cursor:pointer;color:${ra(INK,0.55)}}
  .piq-step.active{color:${INK}}
  .piq-step-no{width:18px;height:18px;border-radius:50%;border:1.5px solid ${ra(INK,0.25)};display:flex;align-items:center;justify-content:center;font-size:9px}
  .piq-step.active .piq-step-no{background:${YEL};border-color:${YEL};color:${INK}}
  .piq-step.past .piq-step-no{background:${INK};border-color:${INK};color:${YEL}}
  .piq-step-connector{width:28px;height:1px;background:${ra(INK,0.12)}}
  .piq-col{max-width:860px;width:100%;margin:0 auto;padding:32px 20px 64px;display:flex;flex-direction:column;gap:28px;flex:1}
  .piq-form-card{background:${DARK2};border:1px solid ${DARK_BD};border-radius:6px;overflow:hidden}
  .piq-form-card ::selection{background:${YEL};color:${DARK}}
  .piq-field:focus{border-color:${ra(YEL,0.5)} !important;outline:none}
  .piq-field::placeholder{color:${ra(PAPER,0.22)}}
  .piq-ghost{background:none;border:none;cursor:pointer;font-family:${MONO};font-size:9px;color:${ra(PAPER,0.72)};padding:0;transition:color .1s}
  .piq-ghost:hover{color:${YEL}}
  .piq-tabs{display:flex;align-items:stretch;border-bottom:2px solid ${ra(INK,0.12)};background:${PAPER};position:sticky;top:0;z-index:5;padding:0 4px}
  .piq-tab{padding:14px 16px;font-family:${GROT};font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:${ra(INK,0.38)};transition:all .15s}
  .piq-tab:hover{color:${INK};background:${ra(INK,0.04)}}
  .piq-tab-active{color:${INK} !important;border-bottom-color:${INK} !important;background:${ra(INK,0.05)}}
  .piq-foot-ghost{background:none;border:1px solid ${ra(INK,0.2)};cursor:pointer;font-family:${GROT};font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${ra(INK,0.5)};padding:6px 12px;transition:all .1s}
  .piq-foot-ghost:hover{border-color:${INK};color:${INK}}
  .piq-foot-next{background:${INK};border:none;cursor:pointer;font-family:${GROT};font-weight:800;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${PAPER};padding:8px 16px;transition:opacity .1s}
  .piq-foot-next:hover{opacity:.85}
  @keyframes piq-pulse{0%,80%,100%{opacity:.15}40%{opacity:1}}
  .piq-dot{display:inline-block;width:8px;height:8px;background:${YEL};animation:piq-pulse 1.2s infinite ease-in-out}
  .piq-field:focus-visible{outline:2px solid ${YEL};outline-offset:1px}
  .piq-tab:focus-visible,.piq-ghost:focus-visible{outline:2px solid ${INK};outline-offset:2px}
  @media (max-width:768px){
    .piq-col{padding:20px 14px 48px;gap:20px}
    .piq-step-bar{padding:10px 12px}
    .piq-step{padding:4px 10px;font-size:9px}
  }
  @media (prefers-reduced-motion:reduce){
    .piq-dot{animation:none;opacity:.6}
    *{transition:none !important;scroll-behavior:auto !important}
  }
`;

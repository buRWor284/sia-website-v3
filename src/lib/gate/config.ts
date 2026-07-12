/**
 * Unified public-tool gate — shared config (Phase P1, Unified-Gate-Freemium-RFP §7).
 * One place to tune the identity/verification knobs. Quota *numbers* still live in
 * each tool's own config (lib/pitch/config.ts, lib/signaliq/config.ts) until P2.
 */

/** Name of the signed, domain-wide subscriber "wristband" cookie. */
export const SUB_COOKIE = "sia_sub";

/** Legacy PressIQ email-tier cookie — still READ during the P1 grace period. */
export const LEGACY_TIER_COOKIE = "pp_tier";

/** Wristband lifetime — one year, matching the legacy pp_tier cookie. */
export const SUB_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** 6-digit verification code lifetime. */
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Max verify attempts before the pending code is burned. */
export const MAX_CODE_ATTEMPTS = 5;

/** Minimum gap between code sends to the same email (anti-bomb). */
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60s

/** Per-IP cap on request-code calls (abuse brake; reuses the shared rate_limits table). */
export const REQUEST_CODE_IP_LIMIT = 8;
export const REQUEST_CODE_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

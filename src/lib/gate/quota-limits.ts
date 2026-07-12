/**
 * Unified public-tool quota limits — the single source of truth (Phase P2).
 *
 * Pure constants only: NO server imports (no Supabase, no next/server), so this
 * module is safe to import from client components (tool pages read these numbers
 * for their UI copy) AND from the server-side quota service (lib/gate/quota.ts).
 *
 * Every metered public-tool limit lives here. The old per-tool constants
 * (lib/signaliq/config.ts FREE_SCANS/…, lib/pitch/config.ts FREE_LIMIT/…) now
 * re-export from this file so the numbers can never drift apart again.
 *
 * Window is a rolling 30 days (unchanged from the pre-P2 limiters). Downloads
 * (PDF/CSV) are NOT metered here — they're a binary email-tier gate (0 for
 * anonymous, unlimited for subscribers), enforced by getPublicTier().
 */

export type QuotaTool = "signaliq-scan" | "signaliq-pack" | "pressiq-score";

export interface QuotaTier {
  /** Anonymous (no verified email) allowance per rolling 30 days. */
  anonymous: number;
  /** Verified-subscriber (sia_sub wristband) allowance per rolling 30 days. */
  email: number;
}

/** Every metered public-tool limit, per rolling 30-day window. */
export const QUOTA_LIMITS: Record<QuotaTool, QuotaTier> = {
  "signaliq-scan": { anonymous: 3, email: 10 },
  "signaliq-pack": { anonymous: 1, email: 5 },
  "pressiq-score": { anonymous: 3, email: 10 },
};

/** Rolling quota window, in milliseconds (30 days). */
export const QUOTA_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

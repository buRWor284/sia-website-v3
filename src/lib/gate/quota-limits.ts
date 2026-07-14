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

export type QuotaTool =
  | "signaliq-scan"
  | "signaliq-pack"
  | "pressiq-score"
  | "pciq-preview"
  | "jciq-preview";

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
  // P3 (RFP §5): PCIQ/JCIQ preview-search runs. Anonymous gets 3 free searches
  // per rolling 30 days; a verified subscriber gets 30. The per-run visibility
  // cap (anonymous sees the top 3 of 8 results, subscriber sees all) is enforced
  // separately in the routes via getPublicTier — it is NOT metered here.
  "pciq-preview": { anonymous: 3, email: 30 },
  "jciq-preview": { anonymous: 3, email: 30 },
};

/**
 * How many result rows a caller may see per preview search, by tier (P3).
 * Anonymous callers get a genuine taste (the top slice); the rest are withheld
 * server-side and revealed once they verify an email. `Infinity` = no cap.
 */
export const PREVIEW_REVEAL: Record<"pciq-preview" | "jciq-preview", QuotaTier> = {
  "pciq-preview": { anonymous: 3, email: Infinity },
  "jciq-preview": { anonymous: 3, email: Infinity },
};

/** Rolling quota window, in milliseconds (30 days). */
export const QUOTA_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * EMOS platform (paid) tier — P4 decision record (2026-07-14, Irfan):
 * ONE plan, $50/month, UNMETERED tool usage. Platform routes are therefore not
 * in QUOTA_LIMITS at all; their only limiter is the per-user 30/hr abuse brake
 * in requireEmosAccess() (src/lib/emos-guard.ts). If a metered entry-level plan
 * is ever added (§8.4 option B, deliberately NOT chosen at launch), its caps
 * belong here as a third tier so all limits stay in one file.
 */

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
  // per rolling 30 days; a verified subscriber gets 7 (was 30 until 2026-09-10,
  // which matched the paid platform's 30 journalist searches a month. Irfan's
  // rule since then: a free limit is at most a quarter of the paid one). The per-run visibility
  // cap (anonymous sees the top 3 of 8 results, subscriber sees all) is enforced
  // separately in the routes via getPublicTier — it is NOT metered here.
  "pciq-preview": { anonymous: 3, email: 7 },
  "jciq-preview": { anonymous: 3, email: 7 },
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
 * EMOS platform (paid) tier.
 *
 * P4 decision record (2026-07-14, Irfan): ONE plan, $149/month, UNMETERED.
 * SUPERSEDED 2026-09-10 (Irfan): still one $149 plan, now with a monthly
 * allowance per workspace so the worst case stays profitable. The numbers were
 * checked against real per-call costs from ai_usage on 2026-09-10 (every
 * allowance used in full, at the most expensive call seen for each action,
 * comes to about $25 of AI spend against $149). Scores are the biggest line.
 *
 * Counted per org (workspace), per calendar month in UTC; resets on the 1st.
 * Enforced in src/lib/usage-limits.ts (reserve before the AI call, hand back on
 * failure). Admin logins are counted but never blocked. The 30/hr abuse brake in
 * requireEmosAccess() still applies on top.
 */
export type PlatformAction =
  | "scan"
  | "pack"
  | "asset-plan"
  | "journalist-search"
  | "pitch-angle"
  | "draft"
  | "score"
  | "company-research";

export interface PlatformAllowance {
  /** Units per calendar month. */
  limit: number;
  /** Singular / plural, for the meter and error copy: "journalist search(es)". */
  one: string;
  many: string;
  /** Which tool it belongs to, for the meter. */
  tool: string;
}

export const PLATFORM_MONTHLY_LIMITS: Record<PlatformAction, PlatformAllowance> = {
  "scan":              { limit: 60,  one: "signal scan",            many: "signal scans",            tool: "SignalIQ" },
  "pack":              { limit: 60,  one: "signal pack",            many: "signal packs",            tool: "SignalIQ" },
  "asset-plan":        { limit: 30,  one: "asset plan",             many: "asset plans",             tool: "AssetIQ" },
  "journalist-search": { limit: 30,  one: "journalist search",      many: "journalist searches",     tool: "JournoCollabIQ" },
  "pitch-angle":       { limit: 60,  one: "pitch angle or media brief", many: "pitch angles and media briefs", tool: "JournoCollabIQ" },
  "draft":             { limit: 200, one: "pitch draft",            many: "pitch drafts",            tool: "PressIQ" },
  "score":             { limit: 200, one: "pitch score",            many: "pitch scores",            tool: "PressIQ" },
  "company-research":  { limit: 10,  one: "company brief build",    many: "company brief builds",    tool: "Company brief" },
};

/** Display order for the meter. */
export const PLATFORM_ACTION_ORDER: PlatformAction[] = [
  "scan", "pack", "asset-plan", "journalist-search", "pitch-angle", "draft", "score", "company-research",
];

/** 'YYYY-MM' in UTC: the counter bucket for a date. */
export function usagePeriod(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** The first day of next month (UTC), e.g. "1 October". */
export function usageResetLabel(d: Date = new Date()): string {
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return `1 ${next.toLocaleString("en-GB", { month: "long", timeZone: "UTC" })}`;
}

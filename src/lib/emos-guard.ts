/**
 * Shared access guard for the paid EMOS platform (C2/H3/H6, 2026-07-02 review).
 *
 * Every /api/emos-platform/* handler must call requireEmosAccess() — middleware's
 * page matcher ("/emos-platform(.*)") does NOT cover /api/emos-platform/*, so before
 * this guard existed any signed-in Clerk account (including client-workspace
 * users) could script unlimited Opus calls.
 *
 * Checks, in order:
 *   1. Clerk session            → 401
 *   2. emos_access metadata     → 403  (JWT fast path, live Clerk fallback, fail closed)
 *   3. Subscription status      → 402  (row in stripe_subscriptions must be
 *      'active' if one exists; no row = admin-invited beta user, allowed;
 *      admin emails bypass — same policy as the dashboard gate)
 *   4. Per-user rate limit      → 429  (DB-backed, generous; abuse brake, not a quota)
 */
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { normalizeEmail } from "@/lib/emos-billing";
import { EMOS_ADMIN_EMAILS } from "@/lib/emos-admins";

// Moved to src/lib/emos-admins.ts (D4, 2026-07-30) so emos-billing can read it
// without importing this file, which imports emos-billing. Re-exported here so
// every existing caller keeps working unchanged.
export { EMOS_ADMIN_EMAILS };

const HOUR_MS = 60 * 60 * 1000;

export type EmosGuardResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; res: NextResponse };

function deny(status: number, error: string): EmosGuardResult {
  return { ok: false, res: NextResponse.json({ error }, { status }) };
}

/**
 * Subscription status for a person. Returns:
 *  - "active"  → paying (or recovered) subscriber
 *  - "none"    → no subscription row (admin-invited beta user) — ALLOWED
 *  - anything else ("canceled", "past_due", …) → blocked
 *
 * ★ "none" means ALLOWED and must stay that way. Admin-invited beta accounts
 *   and the admin logins have no Stripe row at all; treating a missing row as
 *   "hasn't paid" would lock every one of them out the moment it deployed.
 *
 * D4 (2026-07-30): resolves by `clerk_user_id` FIRST, then by the normalised
 * email. The email alone was never a reliable key — the row stores the address
 * Stripe reported, which for a Link / Google Pay / work-card payment is not the
 * address the person signs in with. It also compared raw case against Clerk's
 * lowercased address, so a mixed-case payment email silently missed.
 *
 * Where the two sources disagree, "active" wins. Being generous here is the
 * same fail-open posture as the error branches below: the authoritative gate is
 * the emos_access flag in Clerk, which the webhook revokes on cancellation.
 */
export async function getSubscriptionStatus(
  email: string,
  clerkUserId?: string | null,
): Promise<string> {
  const db = createSupabaseServiceClient();
  const normalized = normalizeEmail(email);
  let linked: string | null = null;

  if (clerkUserId) {
    // Not unique: one account can accumulate rows across re-subscribes.
    const { data, error } = await db
      .from("stripe_subscriptions")
      .select("status, updated_at")
      .eq("clerk_user_id", clerkUserId)
      .order("updated_at", { ascending: false });
    if (error) {
      console.warn("[emos-guard] subscription lookup by user failed:", error.message);
      return "none";
    }
    const rows = (data ?? []) as Array<{ status: string }>;
    if (rows.some((r) => r.status === "active")) return "active";
    linked = rows[0]?.status ?? null;
  }

  if (!normalized) return linked ?? "none";

  const { data, error } = await db
    .from("stripe_subscriptions")
    .select("status")
    .eq("email", normalized)
    .maybeSingle();
  if (error) {
    // Fail open on DB outage — the emos_access flag is the primary gate and
    // is revoked on cancellation by the Stripe webhook.
    console.warn("[emos-guard] subscription lookup failed:", error.message);
    return linked ?? "none";
  }

  const byEmail = (data?.status as string | undefined) ?? null;
  if (byEmail === "active") return "active";
  return linked ?? byEmail ?? "none";
}

export async function requireEmosAccess(opts?: {
  /** Route name for the rate-limit key, e.g. "pitch-score". Omit to skip rate limiting. */
  rateLimitKey?: string;
  /** Requests per window per user. Default 30. */
  limit?: number;
  /** Window in ms. Default 1 hour. */
  windowMs?: number;
}): Promise<EmosGuardResult> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return deny(401, "Unauthorized.");

  // ── emos_access ────────────────────────────────────────────────────────────
  const jwtMeta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  let hasAccess = jwtMeta.emos_access === true;
  let email = "";

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      "";
    // Live metadata is authoritative: covers both fresh grants (JWT stale after
    // invite) and fresh REVOCATIONS (JWT stale after cancellation).
    hasAccess = user.publicMetadata?.emos_access === true;
  } catch (e) {
    // Clerk API unreachable — fail closed unless the JWT already carried access.
    console.error("[emos-guard] Clerk user lookup failed:", e);
    if (!hasAccess) return deny(403, "Could not verify platform access. Please retry.");
  }

  if (!hasAccess) {
    return deny(403, "EMOS platform access required. This account has not been invited.");
  }

  // ── Subscription ───────────────────────────────────────────────────────────
  if (email && !EMOS_ADMIN_EMAILS.includes(email)) {
    const status = await getSubscriptionStatus(email, userId);
    if (status !== "active" && status !== "none") {
      return deny(402, "Your EMOS subscription is not active. Renew it to keep using the platform.");
    }
  }

  // ── Rate limit ─────────────────────────────────────────────────────────────
  if (opts?.rateLimitKey) {
    const rl = await rateLimitDb(`emostool:${opts.rateLimitKey}:${userId}`, {
      limit: opts.limit ?? 30,
      windowMs: opts.windowMs ?? HOUR_MS,
    });
    if (!rl.ok) {
      return deny(429, "Too many requests. Please wait a bit and try again.");
    }
  }

  return { ok: true, userId, email };
}

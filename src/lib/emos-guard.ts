/**
 * Shared access guard for the paid EMOS platform (C2/H3/H6, 2026-07-02 review).
 *
 * Every /api/emostool/* handler must call requireEmosAccess() — middleware's
 * page matcher ("/emos-platform(.*)") does NOT cover /api/emostool/*, so before
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

export const EMOS_ADMIN_EMAILS = ["syedirfanajmal@gmail.com", "sia@syedirfanajmal.com"];

const HOUR_MS = 60 * 60 * 1000;

export type EmosGuardResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; res: NextResponse };

function deny(status: number, error: string): EmosGuardResult {
  return { ok: false, res: NextResponse.json({ error }, { status }) };
}

/**
 * Subscription status for an email. Returns:
 *  - "active"  → paying (or recovered) subscriber
 *  - "none"    → no subscription row (admin-invited beta user)
 *  - anything else ("canceled", "past_due", …) → blocked
 */
export async function getSubscriptionStatus(email: string): Promise<string> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db
    .from("stripe_subscriptions")
    .select("status")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    // Fail open on DB outage — the emos_access flag is the primary gate and
    // is revoked on cancellation by the Stripe webhook.
    console.warn("[emos-guard] subscription lookup failed:", error.message);
    return "none";
  }
  return data?.status ?? "none";
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
    const status = await getSubscriptionStatus(email);
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

/**
 * Stripe customer portal ("Manage billing") for EMOS Platform subscribers.
 *
 * D2, 2026-09-10. /emos-platform, /emos-platform/subscribe and /refund-policy
 * all promise "cancel any time" and "you keep access until the end of the
 * billing period you have already paid for". Until this file existed nothing in
 * src opened Stripe's portal, so the only self-serve route was the no-code
 * login link in Stripe's emails, and that login only works with the address the
 * customer PAID with (often not their login: Link, Google Pay, a work card).
 *
 * Stripe side, set by Irfan in LIVE mode on 10 Sep: portal active, cancel at
 * END of period, payment methods ON, invoice history ON, switch plan and update
 * quantities OFF, default redirect = /emos-platform/dashboard. The config id
 * below pins exactly that configuration, so a later edit to Stripe's default
 * portal cannot silently change what EMOS customers see.
 *
 * Talks to Stripe with fetch, like /api/emos-checkout: the repo has no Stripe SDK.
 */
import { clerkClient } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/emos-billing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.syedirfanajmal.com";

/** Live-mode portal configuration (10 Sep). Env override exists for test-mode keys only. */
const PORTAL_CONFIGURATION =
  process.env.STRIPE_PORTAL_CONFIGURATION_ID ?? "bpc_1UEAaWIHgIqSVJKJMV4MvliK";

/** Where Stripe sends the customer back to. Also where the route redirects on failure. */
export const BILLING_RETURN_PATH = "/emos-platform/dashboard/settings";

export type BillingCustomerLookup =
  | { kind: "found"; customerId: string }
  | { kind: "none" }
  | { kind: "error" };

type Row = {
  stripe_customer_id: string | null;
  status: string | null;
  updated_at: string | null;
  clerk_user_id: string | null;
};

// A live subscription beats a lapsed one: someone who cancelled once and paid
// again must land on the customer that holds the subscription they can manage.
// past_due ranks next because updating the card is exactly what that customer needs.
const STATUS_RANK: Record<string, number> = { active: 0, past_due: 1 };
const rank = (r: Row) => STATUS_RANK[r.status ?? ""] ?? 2;

function best(rows: Row[]): Row | null {
  const usable = rows.filter((r) => r.stripe_customer_id);
  usable.sort(
    (a, b) => rank(a) - rank(b) || (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
  );
  return usable[0] ?? null;
}

const COLUMNS = "stripe_customer_id, status, updated_at, clerk_user_id";

/**
 * The Stripe customer this signed-in account may manage, or "none".
 *
 * Same identity order as D4 (src/lib/emos-billing.ts, emos-guard.ts):
 *   1. rows bound to this Clerk account by `clerk_user_id` (real evidence:
 *      checkout metadata or the one-time success-page claim);
 *   2. rows keyed on an email this account has VERIFIED.
 * "active" wins across both sets, the same rule getSubscriptionStatus uses.
 *
 * Two guards, both load-bearing, because a portal session exposes the card's
 * last four digits, the billing address on every invoice, and a Cancel button:
 *   - only VERIFIED addresses count. email_addresses can hold an address the
 *     user typed but never confirmed; matching on it would hand a stranger's
 *     billing to whoever added their address.
 *   - an email-matched row already bound to a DIFFERENT account is skipped.
 *     The binding is the stronger evidence of ownership, so it wins.
 *
 * Admin accounts get no special case: they have no Stripe row, so they fall
 * through to "none" and see the "no paid subscription" line.
 */
export async function findBillingCustomer(clerkUserId: string): Promise<BillingCustomerLookup> {
  const db = createSupabaseServiceClient();

  const byId = await db
    .from("stripe_subscriptions")
    .select(COLUMNS)
    .eq("clerk_user_id", clerkUserId);
  if (byId.error) {
    console.error("[billing-portal] lookup by account failed:", byId.error.message);
    return { kind: "error" };
  }
  const linked = best((byId.data ?? []) as Row[]);
  // Only an ACTIVE linked row short-circuits. A past_due or lapsed one still
  // goes through the email pass, so an active subscription there can win.
  if (linked && rank(linked) === 0) {
    return { kind: "found", customerId: linked.stripe_customer_id! };
  }

  let emails: string[] = [];
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    emails = user.emailAddresses
      .filter((e) => e.verification?.status === "verified")
      .map((e) => normalizeEmail(e.emailAddress))
      .filter(Boolean);
  } catch (e) {
    console.error("[billing-portal] Clerk user lookup failed:", e);
    // A lapsed linked customer is still a real answer; only error if we have nothing.
    return linked ? { kind: "found", customerId: linked.stripe_customer_id! } : { kind: "error" };
  }

  let emailRows: Row[] = [];
  if (emails.length > 0) {
    const byEmail = await db.from("stripe_subscriptions").select(COLUMNS).in("email", emails);
    if (byEmail.error) {
      console.error("[billing-portal] lookup by email failed:", byEmail.error.message);
      return linked ? { kind: "found", customerId: linked.stripe_customer_id! } : { kind: "error" };
    }
    emailRows = ((byEmail.data ?? []) as Row[]).filter(
      (r) => !r.clerk_user_id || r.clerk_user_id === clerkUserId,
    );
  }

  // Linked rows first so they win a tie on status; best() is a stable sort.
  const pick = best([...(linked ? [linked] : []), ...emailRows]);
  return pick ? { kind: "found", customerId: pick.stripe_customer_id! } : { kind: "none" };
}

/** Create a one-time portal session. The URL is short-lived and single-use. */
export async function createBillingPortalSession(
  customerId: string,
): Promise<{ url: string } | { error: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[billing-portal] STRIPE_SECRET_KEY not set");
    return { error: "not_configured" };
  }

  const params = new URLSearchParams();
  params.append("customer", customerId);
  params.append("configuration", PORTAL_CONFIGURATION);
  params.append("return_url", `${BASE_URL}${BILLING_RETURN_PATH}`);

  try {
    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as
      | { url?: string; error?: { message?: string } }
      | null;
    if (!res.ok || !body?.url) {
      console.error("[billing-portal] Stripe error:", res.status, body?.error?.message ?? body);
      return { error: "stripe" };
    }
    return { url: body.url };
  } catch (e) {
    console.error("[billing-portal] Stripe request failed:", e);
    return { error: "stripe" };
  }
}

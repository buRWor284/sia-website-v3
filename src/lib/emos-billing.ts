/**
 * Shared EMOS billing reconciliation (2026-07-26).
 *
 * Extracted from /api/webhooks/stripe so the SAME grant logic can run from two
 * places, because the webhook is not a reliable single point of truth:
 *
 *   1. the Stripe webhook (primary, asynchronous), and
 *   2. /emos-platform/subscribe/success (fallback, runs in the buyer's own
 *      request right after checkout).
 *
 * Why the fallback exists — three ways the old single-path flow took a payment
 * and left the customer with no way in, all of them silent:
 *   - setClerkAccess() returned "error" (Clerk API blip, missing key): the old
 *     code logged and returned WITHOUT ever attempting an invitation.
 *   - Clerk rejected the invitation because one was already pending for that
 *     email (a routine 400): inviteUrl came back null, so the welcome email was
 *     skipped entirely and nothing was ever re-sent.
 *   - the webhook never arrived at all (endpoint down, or the signature check's
 *     300s freshness window lost to clock skew / a slow retry).
 *
 * Clerk is in RESTRICTED sign-up mode (verified in the dashboard 2026-07-26),
 * so the invitation email is the ONLY way a paying customer can ever create an
 * account. Every one of the failures above is therefore a hard lockout, not an
 * inconvenience. Everything here is idempotent and safe to run repeatedly.
 *
 * ── D4 finished 2026-07-30 ──────────────────────────────────────────────────
 * Until now access was resolved against the PAYMENT email. That address is not
 * an identity: Stripe Link, Google Pay and work cards all routinely report one
 * the buyer never signs in with. Three things changed here.
 *
 *   - `clerk_user_id` on stripe_subscriptions is now the authoritative link
 *     between a payment and an account, written from checkout metadata or
 *     claimed once from the buyer's live session on the success page.
 *   - Emails are normalised on every read and write (normalizeEmail), and the
 *     row is keyed on the Stripe CUSTOMER id in preference to the email.
 *   - grantOrInvite reports which account it landed on, so callers can bind it.
 *
 * ★ What did NOT change, deliberately: a missing subscription row still means
 *   ALLOWED (see emos-guard). Every admin-invited beta account and Irfan's own
 *   admin login depends on that. D4 was an identity bug, not a policy bug —
 *   flipping "no row" to "hasn't paid" would lock all of them out on deploy.
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import { isEmosAdminEmail } from "@/lib/emos-admins";

const CLERK_API  = "https://api.clerk.com/v1";
const STRIPE_API = "https://api.stripe.com/v1";
const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "EMOS Platform <sia@syedirfanajmal.com>";
const BASE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.syedirfanajmal.com";

/**
 * The single spelling of an email address used for every comparison and every
 * write (D4, 2026-07-30).
 *
 * Stripe reports the address exactly as the buyer typed it; Clerk lowercases.
 * The read side in emos-guard compares with .eq(), which is case SENSITIVE, so
 * "Irfan@Dmr.agency" written by the webhook never matched "irfan@dmr.agency"
 * read back from Clerk. That degraded to "no row" — harmless while "no row"
 * means allowed, but it also meant a re-subscribe under different casing tried
 * to INSERT a second row and died on the UNIQUE(stripe_customer_id) constraint,
 * silently leaving a stale `canceled` row in place. Normalise once, here.
 */
export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

// ─── Clerk: users ─────────────────────────────────────────────────────────────

/**
 * Find the Clerk user id for an email.
 *
 * `errored` distinguishes "Clerk says no such user" from "we could not ask".
 * The difference matters: on a genuine miss the caller should go on to create an
 * invitation, but on an API blip it must NOT conclude the account is absent —
 * that is precisely how a paying customer used to end up with neither a grant
 * nor an invite.
 */
export async function resolveClerkUserIdByEmail(
  email: string,
): Promise<{ id: string | null; errored: boolean }> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[emos-billing] CLERK_SECRET_KEY not set — cannot look up user");
    return { id: null, errored: true };
  }

  try {
    const lookup = await fetch(
      `${CLERK_API}/users?email_address=${encodeURIComponent(normalizeEmail(email))}&limit=1`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!lookup.ok) {
      console.error("[emos-billing] Clerk user lookup failed:", lookup.status, await lookup.text());
      return { id: null, errored: true };
    }
    const users = (await lookup.json()) as Array<{ id: string }>;
    return { id: users?.[0]?.id ?? null, errored: false };
  } catch (err) {
    console.error("[emos-billing] resolveClerkUserIdByEmail error:", err);
    return { id: null, errored: true };
  }
}

/**
 * Every email address on a Clerk account, lowercased.
 *
 * Needed because one account can hold several addresses, and the subscription
 * table is keyed on whichever one Stripe happened to report. Used to answer
 * "is THIS PERSON still paying?" across all their rows, however those rows
 * happen to be keyed.
 */
export async function resolveClerkEmailsById(
  clerkUserId: string,
): Promise<{ emails: string[]; errored: boolean }> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return { emails: [], errored: true };

  try {
    const res = await fetch(`${CLERK_API}/users/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) {
      console.error("[emos-billing] Clerk user fetch failed:", res.status, await res.text());
      return { emails: [], errored: true };
    }
    const user = (await res.json()) as {
      email_addresses?: Array<{ email_address?: string }>;
    };
    const emails = (user.email_addresses ?? [])
      .map((e) => normalizeEmail(e.email_address))
      .filter(Boolean);
    return { emails, errored: false };
  } catch (err) {
    console.error("[emos-billing] resolveClerkEmailsById error:", err);
    return { emails: [], errored: true };
  }
}

// setClerkAccess(email, access) used to live here. Removed 2026-07-30: every
// caller now resolves the account id explicitly (resolveClerkUserIdByEmail +
// setClerkAccessById) because D4 needs to KNOW which account it touched — to
// record it, and on revocation to check whether that account is still paying
// before switching anything off. A helper that hid the id behind an email was
// exactly the abstraction that let the payment address stand in for identity.

/**
 * Set emos_access directly on a known Clerk user id. Preferred over the
 * email lookup when the buyer was signed in at checkout: /api/emos-checkout
 * stamps metadata[clerk_user_id] on the session, so the grant lands on the
 * account the person is actually using even if they pay with a different
 * email (Link, Google Pay, a work card on a personal address).
 *
 * PATCH /users/{id}/metadata does a shallow MERGE (unlike PATCH /users/{id},
 * which replaces) — so client_slug and other metadata keys survive.
 */
export async function setClerkAccessById(clerkUserId: string, access: boolean): Promise<boolean> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return false;

  try {
    const res = await fetch(`${CLERK_API}/users/${clerkUserId}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_metadata: { emos_access: access } }),
    });
    if (!res.ok) {
      console.error("[emos-billing] emos_access update failed:", res.status, await res.text());
      return false;
    }
    console.log(`[emos-billing] emos_access=${access} set for ${clerkUserId}`);
    return true;
  } catch (err) {
    console.error("[emos-billing] setClerkAccessById error:", err);
    return false;
  }
}

// ─── Clerk: invitations ───────────────────────────────────────────────────────

/**
 * Find an outstanding (pending) invitation for this email and return its live
 * accept URL. This is the piece the old code was missing: Clerk refuses to
 * create a second invitation while one is pending, so a retry used to end with
 * inviteUrl = null and no email sent at all.
 */
export async function findPendingInvitation(
  email: string,
): Promise<{ id: string; url: string } | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  try {
    const res = await fetch(`${CLERK_API}/invitations?status=pending&limit=100`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) {
      console.error("[emos-billing] invitation lookup failed:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    const list = (Array.isArray(json) ? json : json?.data ?? []) as Array<{
      id: string;
      email_address: string;
      url?: string;
    }>;
    const target = email.trim().toLowerCase();
    const match = list.find((i) => (i.email_address ?? "").toLowerCase() === target);
    return match?.url ? { id: match.id, url: match.url } : null;
  } catch (err) {
    console.error("[emos-billing] findPendingInvitation error:", err);
    return null;
  }
}

/** Create a Clerk invitation carrying emos_access. Returns its accept URL. */
export async function createClerkInvitation(email: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[emos-billing] CLERK_SECRET_KEY not set");
    return null;
  }

  const res = await fetch(`${CLERK_API}/invitations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address:   email,
      public_metadata: { emos_access: true },
      redirect_url:    `${BASE_URL}/emos-platform/signup`,
    }),
  });

  if (!res.ok) {
    console.error("[emos-billing] Clerk invite failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return (data.url as string) ?? null;
}

/**
 * Revoke any PENDING invitation for this email. On cancellation the user's
 * access is flipped off, but a still-pending invitation carries
 * public_metadata.emos_access: true and would grant access if accepted later.
 */
export async function revokeClerkInvitations(email: string): Promise<"revoked" | "none" | "error"> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[emos-billing] CLERK_SECRET_KEY not set - cannot revoke invitations");
    return "error";
  }
  try {
    const res = await fetch(`${CLERK_API}/invitations?status=pending&limit=100`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) {
      console.error("[emos-billing] invitation lookup failed:", res.status, await res.text());
      return "error";
    }
    const json = await res.json();
    const list = (Array.isArray(json) ? json : json?.data ?? []) as Array<{
      id: string;
      email_address: string;
    }>;
    const target = email.trim().toLowerCase();
    const matches = list.filter((i) => (i.email_address ?? "").toLowerCase() === target);
    if (matches.length === 0) return "none";
    let revoked = 0;
    for (const inv of matches) {
      const rev = await fetch(`${CLERK_API}/invitations/${inv.id}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      });
      if (rev.ok) revoked++;
      else console.error("[emos-billing] invitation revoke failed:", inv.id, rev.status, await rev.text());
    }
    console.log(`[emos-billing] revoked ${revoked}/${matches.length} pending invite(s) for ${email}`);
    return revoked > 0 ? "revoked" : "error";
  } catch (err) {
    console.error("[emos-billing] revokeClerkInvitations error:", err);
    return "error";
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export function buildWelcomeEmail(inviteUrl: string): string {
  const tools: Array<[string, string, string]> = [
    ["◎", "SignalIQ", "spot breaking signals, pitch at the right moment."],
    ["◈", "AssetIQ", "build the assets journalists actually cite."],
    ["◇", "JournoCollabIQ", "find journalists, personalise outreach."],
    ["◆", "PressIQ", "score your pitch before you send it."],
    ["▣", "CoverageIQ", "track pitches, turn coverage into AI citations."],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to EMOS</title>
</head>
<body style="margin:0;padding:0;background:#f1ebde;font-family:Georgia,serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your EMOS subscription is active. One step to get inside the platform.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1ebde;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#f5b81f;width:30px;height:30px;text-align:center;vertical-align:middle;font-family:Georgia,serif;font-weight:700;font-size:15px;color:#1a1410;line-height:30px;">E</td>
            <td style="padding-left:11px;font-family:Arial,sans-serif;font-weight:900;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1a1410;">EMOS Platform</td>
          </tr></table>
        </td></tr>

        <tr><td style="background:#1a1410;padding:44px 44px 40px;">
          <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#f5b81f;margin:0 0 18px;">Payment confirmed</p>
          <h1 style="font-family:Georgia,serif;font-weight:700;font-size:34px;line-height:1.12;letter-spacing:-0.02em;color:#f1ebde;margin:0 0 16px;">
            You're in.
          </h1>
          <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.6;color:rgba(241,235,222,0.9);margin:0 0 28px;">
            Your EMOS subscription is active. One quick step and the whole platform is yours.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;background:#f5b81f;color:#1a1410;font-family:Arial,sans-serif;font-weight:900;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:16px 34px;">
            Create your account &rarr;
          </a>
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.03em;color:rgba(241,235,222,0.78);margin:20px 0 0;line-height:1.5;">
            This secure invite link expires in 30 days.
          </p>
        </td></tr>

        <tr><td style="background:#f1ebde;padding:32px 44px 8px;border-left:1px solid rgba(26,20,16,.12);border-right:1px solid rgba(26,20,16,.12);">
          <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(26,20,16,.7);margin:0 0 18px;">What happens next</p>
          ${[
            "Click <strong style=\"color:#1a1410;\">Create your account</strong> above.",
            "Set your password. Takes about a minute.",
            "Land in your dashboard and start the pipeline.",
          ].map((step, i) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
            <td width="30" valign="top" style="font-family:Georgia,serif;font-weight:700;font-size:18px;color:#1a1410;">${i + 1}</td>
            <td style="font-family:Georgia,serif;font-size:15px;color:rgba(26,20,16,.82);line-height:1.55;">${step}</td>
          </tr></table>`).join("")}
        </td></tr>

        <tr><td style="background:#fff8ee;padding:28px 44px 30px;border-left:1px solid rgba(26,20,16,.12);border-right:1px solid rgba(26,20,16,.12);border-bottom:1px solid rgba(26,20,16,.12);">
          <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(26,20,16,.7);margin:0 0 16px;">What's inside</p>
          ${tools.map(([icon, name, desc]) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:11px;">
            <tr>
              <td width="26" valign="top" style="font-family:Georgia,serif;font-size:15px;color:#1a1410;padding-top:1px;">${icon}</td>
              <td><strong style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.05em;">${name}</strong>
              <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.75);">: ${desc}</span></td>
            </tr>
          </table>`).join("")}
        </td></tr>

        <tr><td style="padding:26px 4px 0;">
          <p style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.75);margin:0 0 18px;line-height:1.55;">
            Questions, or the button won't open? Reply to this email or write to
            <a href="mailto:sia@syedirfanajmal.com" style="color:#1a1410;font-weight:700;text-decoration:underline;">sia@syedirfanajmal.com</a> and we'll sort it out.
          </p>
          <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(26,20,16,.62);letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px;">EMOS Platform · syedirfanajmal.com</p>
          <p style="font-family:Georgia,serif;font-size:12px;color:rgba(26,20,16,.72);margin:0;line-height:1.5;">
            If the button doesn't work, copy and paste this link:<br/>
            <span style="color:rgba(26,20,16,.9);word-break:break-all;">${inviteUrl}</span>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, inviteUrl: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[emos-billing] RESEND_API_KEY not set — skipping welcome email");
    return false;
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      [email],
      subject: "Payment confirmed. Set up your EMOS account",
      html:    buildWelcomeEmail(inviteUrl),
    }),
  });

  if (!res.ok) {
    console.error("[emos-billing] Resend error:", res.status, await res.text());
    return false;
  }
  return true;
}

// ─── Subscription record ──────────────────────────────────────────────────────

/**
 * Write the stripe_subscriptions row for this customer.
 *
 * Rewritten for D4 (2026-07-30). The old version was a single
 * `upsert(..., { onConflict: "email" })` with the email in whatever case Stripe
 * supplied, which broke in two ways:
 *
 *   1. `stripe_customer_id` is ALSO UNIQUE. A returning customer who
 *      re-subscribed under a different address (Link, a work card, or just a
 *      different capitalisation) did not match on email, so the upsert tried to
 *      INSERT — and died on the customer-id constraint. The error was logged and
 *      swallowed, leaving the previous `canceled` row untouched. That is a
 *      lockout that fails CLOSED: they had just paid, and the guard read
 *      "canceled" and blocked them.
 *   2. The row was the only link between a payment and an account, and it was
 *      keyed on an address that may be nobody's login.
 *
 * So: prefer the Stripe customer id as the conflict target (it is the stable
 * identity of the payer across email changes) and fall back to email only when
 * there is no customer id or no row for it yet. `clerk_user_id` is written
 * whenever we know it and never cleared — see linkSubscriptionToClerkUser.
 */
export async function recordSubscription(args: {
  email: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  status: string;
  clerkUserId?: string | null;
}): Promise<void> {
  const db = createSupabaseServiceClient();

  // Null customer/subscription ids are omitted rather than written: blanking an
  // id we already hold would break the next lookup that depends on it.
  const row: Record<string, string> = {
    email:      normalizeEmail(args.email),
    status:     args.status,
    updated_at: new Date().toISOString(),
  };
  if (args.customerId)     row.stripe_customer_id     = args.customerId;
  if (args.subscriptionId) row.stripe_subscription_id = args.subscriptionId;
  if (args.clerkUserId)    row.clerk_user_id          = args.clerkUserId;

  if (args.customerId) {
    const { data, error } = await db
      .from("stripe_subscriptions")
      .update(row)
      .eq("stripe_customer_id", args.customerId)
      .select("id");
    // Do NOT return on error: falling through to the upsert is the whole point
    // of having two paths. An early return here would re-create the very bug
    // this function was rewritten to kill — a paid customer whose `active`
    // write is dropped while a stale `canceled` row keeps them blocked.
    if (error) console.error("[emos-billing] update by customer failed, trying upsert:", error);
    else if (data && data.length > 0) return;
  }

  const { error } = await db
    .from("stripe_subscriptions")
    .upsert(row, { onConflict: "email" });
  if (error) console.error("[emos-billing] Supabase upsert failed:", error);
}

/**
 * Does this account still have a paid subscription other than the one being
 * cancelled?
 *
 * Guards every revocation. One account can hold more than one row — someone who
 * bought once signed out and again signed in has two Stripe customers and two
 * rows — and cancelling either one used to strip emos_access outright, locking
 * out a customer who was still paying on the other.
 */
export async function hasActiveSubscription(clerkUserId: string): Promise<boolean> {
  const db = createSupabaseServiceClient();

  // 1. Rows explicitly bound to this account.
  const byId = await db
    .from("stripe_subscriptions")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .eq("status", "active")
    .limit(1);
  if (byId.error) {
    // Fail SAFE for the customer: if we cannot tell, do not revoke. A missed
    // revocation costs a subscription; a wrong one locks out someone who is
    // paying, which is the failure a launch cannot afford.
    console.error("[emos-billing] active-subscription check failed:", byId.error);
    return true;
  }
  if ((byId.data?.length ?? 0) > 0) return true;

  // 2. Rows keyed on any address this account owns. This second pass is what
  //    actually protects people: most rows carry NO clerk_user_id (a signed-out
  //    buyer invited by email is never bound to an account), so an id-only
  //    check would report "not paying" for almost every real subscriber and
  //    revoke them the moment somebody else's payment address happened to
  //    resolve to their account.
  const { emails, errored } = await resolveClerkEmailsById(clerkUserId);
  if (errored) return true; // same fail-safe direction
  if (emails.length === 0) return false;

  const byEmail = await db
    .from("stripe_subscriptions")
    .select("id")
    .in("email", emails)
    .eq("status", "active")
    .limit(1);
  if (byEmail.error) {
    console.error("[emos-billing] active-subscription check by email failed:", byEmail.error);
    return true;
  }
  return (byEmail.data?.length ?? 0) > 0;
}

/**
 * Turn off emos_access for one account unless it still holds another live
 * subscription. Returns what happened, for the log.
 */
export async function revokeAccessUnlessStillPaying(
  clerkUserId: string,
): Promise<"revoked" | "kept" | "error"> {
  if (await hasActiveSubscription(clerkUserId)) return "kept";
  return (await setClerkAccessById(clerkUserId, false)) ? "revoked" : "error";
}

/**
 * Attach a Clerk account to a subscription row, but only if it is unclaimed.
 *
 * This is the sticky half of the D4 fix. The first load of the success page
 * after checkout is the buyer's own browser, so a Clerk session there is strong
 * evidence of which account the access belongs on. A checkout session id is NOT
 * a secret, though — it sits in the URL, in browser history, in any screenshot —
 * so the claim has to be one-time. Once a row carries a clerk_user_id, a later
 * visitor holding the same link cannot move it.
 *
 * Returns the account the row is bound to after the call.
 */
export async function linkSubscriptionToClerkUser(args: {
  email: string;
  customerId?: string | null;
  clerkUserId: string;
}): Promise<string | null> {
  const db = createSupabaseServiceClient();

  let query = db
    .from("stripe_subscriptions")
    .update({ clerk_user_id: args.clerkUserId, updated_at: new Date().toISOString() })
    .is("clerk_user_id", null);

  query = args.customerId
    ? query.eq("stripe_customer_id", args.customerId)
    : query.eq("email", normalizeEmail(args.email));

  const { data, error } = await query.select("clerk_user_id");
  if (error) {
    console.error("[emos-billing] clerk_user_id link failed:", error);
    return null;
  }
  if (data && data.length > 0) return args.clerkUserId;

  // Nothing updated: either there is no row yet, or it is already claimed.
  // Read back so the caller can tell the difference.
  const existing = args.customerId
    ? await db.from("stripe_subscriptions").select("clerk_user_id").eq("stripe_customer_id", args.customerId).maybeSingle()
    : await db.from("stripe_subscriptions").select("clerk_user_id").eq("email", normalizeEmail(args.email)).maybeSingle();

  return (existing.data?.clerk_user_id as string | null) ?? null;
}

// ─── The grant ────────────────────────────────────────────────────────────────

export type GrantOutcome =
  /** existing Clerk account — emos_access switched on, they can just sign in */
  | "granted"
  /** brand new customer — invitation created and welcome email sent */
  | "invited"
  /** an invitation was already outstanding and we did NOT re-send the email */
  | "invite_pending"
  /** an invitation was already outstanding and we re-sent it on request */
  | "invite_resent"
  /** could not grant and could not invite — needs a human */
  | "failed";

export interface GrantResult {
  outcome: GrantOutcome;
  email: string;
  /** Present whenever an invitation exists, so a caller can surface it. */
  inviteUrl?: string;
  /**
   * The Clerk account the grant actually landed on, when one was resolved.
   * Callers persist this so enforcement and REVOCATION can follow the account
   * rather than the payment email (D4).
   */
  clerkUserId?: string | null;
}

/**
 * Give this customer a way in, whatever state they are in. Idempotent.
 *
 * Order:
 *   1. known Clerk user id (buyer was signed in at checkout, or claimed the
 *      purchase from a live session on the success page) → grant directly
 *   2. Clerk user with this email → grant
 *   3. pending invitation for this email → reuse it (re-send only if asked)
 *   4. otherwise → create an invitation and send the welcome email
 *
 * Note step 3/4 now also run when the lookup in step 2 ERRORED, not only when
 * it returned not_found. The old code returned early on error, which is how a
 * paid customer could end up with no account and no email.
 */
export async function grantOrInvite(args: {
  email: string;
  clerkUserId?: string | null;
  /** Re-send the welcome email even if an invitation is already pending. */
  resend?: boolean;
}): Promise<GrantResult> {
  const email = normalizeEmail(args.email);
  const { clerkUserId, resend } = args;

  // 1. Direct grant against a known account.
  if (clerkUserId) {
    if (await setClerkAccessById(clerkUserId, true)) {
      return { outcome: "granted", email, clerkUserId };
    }
    console.error("[emos-billing] direct grant failed for", clerkUserId, "— falling back to email path");
  }

  // 2. Existing account with this email (re-subscriber, or an admin-invited
  //    beta user who has now paid). Resolve the id first rather than calling
  //    setClerkAccess blind, so a successful grant can be reported back with
  //    the account it landed on.
  const byEmail = await resolveClerkUserIdByEmail(email);
  if (byEmail.id && (await setClerkAccessById(byEmail.id, true))) {
    return { outcome: "granted", email, clerkUserId: byEmail.id };
  }

  // 3. Invitation already outstanding — reuse rather than fail.
  const pending = await findPendingInvitation(email);
  if (pending) {
    if (resend) {
      const sent = await sendWelcomeEmail(email, pending.url);
      return { outcome: sent ? "invite_resent" : "failed", email, inviteUrl: pending.url };
    }
    return { outcome: "invite_pending", email, inviteUrl: pending.url };
  }

  // 4. New customer.
  const inviteUrl = await createClerkInvitation(email);
  if (!inviteUrl) {
    // Creating the invitation can fail for two RECOVERABLE reasons, and simply
    // reporting "failed" (the previous behaviour) was wrong for both:
    //
    //   a) Lost race. The webhook and a success-page load run the same grant
    //      concurrently. Clerk refuses a second invitation while one is
    //      pending, so whichever call arrives second used to report failure
    //      even though the customer had a perfectly good invite waiting.
    //   b) The account already exists, so Clerk refuses to invite it at all.
    //      This is the tail of a step-2 lookup that returned "error" instead
    //      of "updated" (a Clerk API blip): the user was there the whole time.
    //
    // Re-read before giving up: first for an invitation someone else created,
    // then for the account itself.
    const raced = await findPendingInvitation(email);
    if (raced) {
      if (resend) {
        const resent = await sendWelcomeEmail(email, raced.url);
        return { outcome: resent ? "invite_resent" : "failed", email, inviteUrl: raced.url };
      }
      return { outcome: "invite_pending", email, inviteUrl: raced.url };
    }

    const retry = await resolveClerkUserIdByEmail(email);
    if (retry.id && (await setClerkAccessById(retry.id, true))) {
      console.log("[emos-billing] invite refused but account exists — granted directly:", email);
      return { outcome: "granted", email, clerkUserId: retry.id };
    }

    console.error("[emos-billing] could not grant OR invite", email, "— subscription recorded, access NOT provisioned");
    return { outcome: "failed", email };
  }
  const sent = await sendWelcomeEmail(email, inviteUrl);
  return { outcome: sent ? "invited" : "failed", email, inviteUrl };
}

// ─── Stripe session reconciliation (the success-page fallback) ────────────────

export interface ReconcileResult extends GrantResult {
  /** false when the session id was unusable / unpaid — caller shows generic copy. */
  verified: boolean;
  /**
   * True when a live session tried to claim this subscription but the claim
   * window had closed. The success page uses it to stop offering the
   * sign-in-and-attach link, which would otherwise send the one customer this
   * feature exists for through sign-in and back to a page that quietly does
   * nothing.
   */
  claimExpired?: boolean;
}

/**
 * Verify a Checkout Session directly with Stripe and, if it is genuinely paid,
 * run the same record + grant the webhook would have run. Safe to call on every
 * page load: every step is idempotent, and the welcome email is only re-sent
 * when `resend` is set.
 *
 * Trust model matches the webhook's: we act only on a session Stripe itself
 * reports as paid. A session id is a 66-character unguessable token, so this is
 * no weaker than the signed webhook it backs up.
 *
 * ── D4, 2026-07-30 ──────────────────────────────────────────────────────────
 * `sessionClerkUserId` is the buyer's LIVE Clerk session on the success page,
 * and it is what closes the original D4 hole. A signed-out buyer paying with
 * Stripe Link, Google Pay, or a work card gives us a payment email that may be
 * nobody's login; granting against it hands access to the wrong account (or
 * invites an address they never read) while the account they actually sign in
 * with stays locked out. But the success page loads in THEIR browser seconds
 * later, so a session cookie there is a far better answer to "whose access is
 * this?" than the payment email is.
 *
 * Three rules keep that from becoming a way in for other people:
 *   - metadata[clerk_user_id] from checkout still wins when present; it is
 *     bound to the purchase itself.
 *   - the claim is sticky: linkSubscriptionToClerkUser only ever fills a NULL,
 *     so a second visitor cannot move a subscription that has an owner.
 *   - ★ and it EXPIRES. Stickiness alone was not enough, because on the most
 *     common path — signed-out buyer, no Clerk account yet, invited by email —
 *     nothing ever fills that NULL, so the row would stay claimable forever.
 *     Anyone who later opened the URL while signed in (a support person
 *     included) would take the subscription and, on the eventual cancellation,
 *     have their OWN access revoked. So a session-based claim is only accepted
 *     inside CLAIM_WINDOW_MS of the checkout, which is when the actual buyer is
 *     standing here. Checkout metadata is not time-limited: it is evidence from
 *     the purchase itself, not from whoever is holding the link.
 */

/**
 * How long after checkout a live session may claim the subscription. Long
 * enough to sign in and come back (the escape hatch on the success page),
 * short enough that a session id resurfacing from history is worthless.
 */
const CLAIM_WINDOW_MS = 60 * 60_000;
export async function reconcileCheckoutSession(
  sessionId: string,
  opts?: { resend?: boolean; sessionClerkUserId?: string | null },
): Promise<ReconcileResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const notVerified: ReconcileResult = { verified: false, outcome: "failed", email: "" };
  if (!secretKey || !sessionId) return notVerified;

  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[emos-billing] session retrieve failed:", res.status);
      return notVerified;
    }

    const session = await res.json();
    if (session?.mode !== "subscription" || session?.payment_status !== "paid") {
      return notVerified;
    }

    const email = normalizeEmail(session.customer_details?.email ?? session.customer_email);
    if (!email) return notVerified;

    const customerId     = typeof session.customer === "string" ? session.customer : null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    const checkoutUserId = (session.metadata?.clerk_user_id as string | undefined) ?? null;

    // Record first, unconditionally: the money has moved, and the row must
    // exist even if every Clerk call below fails.
    await recordSubscription({
      email,
      customerId,
      subscriptionId,
      status:      "active",
      clerkUserId: checkoutUserId,
    });

    // Who is this purchase for? Checkout metadata beats a live session; a live
    // session beats the payment email.
    let targetUserId = checkoutUserId;
    let claimExpired = false;

    if (!targetUserId && opts?.sessionClerkUserId) {
      const createdMs = typeof session.created === "number" ? session.created * 1000 : 0;
      const ageMs     = createdMs > 0 ? Date.now() - createdMs : Number.MAX_SAFE_INTEGER;
      const fresh     = ageMs >= 0 && ageMs < CLAIM_WINDOW_MS;

      // ★ Never let an owner/admin account claim a customer's subscription.
      // Support opening a buyer's success URL while signed in is a completely
      // ordinary thing to do, it lands well inside the claim window, and the
      // consequence is severe and delayed: the row binds to the admin account,
      // and the eventual cancellation revokes emos_access from the admin — who
      // is then locked out of /emos-platform by middleware, which has no admin
      // bypass. No legitimate flow needs this, so refuse it outright.
      // On a Clerk error we cannot tell whether this is an admin, so refuse.
      // The cost of refusing is nil — the buyer falls back to the email path
      // and can retry by reloading — while wrongly allowing it is the lockout
      // described above.
      const claimant = await resolveClerkEmailsById(opts.sessionClerkUserId);
      const isAdmin  = claimant.errored || claimant.emails.some((e) => isEmosAdminEmail(e));

      if (isAdmin) {
        console.warn("[emos-billing] claim refused — admin account, or claimant identity could not be verified");
      } else if (!fresh) {
        claimExpired = true;
        console.warn("[emos-billing] session too old to claim — ignoring the live session for", sessionId);
      } else {
        const owner = await linkSubscriptionToClerkUser({
          email,
          customerId,
          clerkUserId: opts.sessionClerkUserId,
        });
        if (owner && owner !== opts.sessionClerkUserId) {
          // Someone else already owns this subscription. Grant to THEM — the
          // rightful owner may be here repairing their own access — and never
          // to the account presenting the link.
          console.warn("[emos-billing] subscription already claimed by another account; granting the owner, not the presenter");
        }
        targetUserId = owner;
      }
    }

    const grant = await grantOrInvite({
      email,
      clerkUserId: targetUserId,
      resend:      opts?.resend,
    });

    // NOTE: deliberately NOT linking the row to an account that grantOrInvite
    // merely resolved from the payment email. That is a guess, not evidence,
    // and writing it would consume the one-time claim — freezing the buyer out
    // of the sign-in-and-attach path for exactly the mismatch D4 exists to fix.
    // Revocation for an email-resolved grant already works through the email,
    // since the account was found by that email in the first place.

    return { verified: true, claimExpired, ...grant };
  } catch (err) {
    console.error("[emos-billing] reconcileCheckoutSession error:", err);
    return notVerified;
  }
}

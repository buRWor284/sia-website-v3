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
 */

import { createSupabaseServiceClient } from "@/lib/supabase";

const CLERK_API  = "https://api.clerk.com/v1";
const STRIPE_API = "https://api.stripe.com/v1";
const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "EMOS Platform <sia@syedirfanajmal.com>";
const BASE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.syedirfanajmal.com";

// ─── Clerk: users ─────────────────────────────────────────────────────────────

/**
 * Set emos_access on the Clerk user with this email.
 * Returns "updated" | "not_found" | "error".
 * Used on checkout for RE-subscribers (whose Clerk account already exists, so a
 * fresh invitation would fail) and on cancellation to revoke.
 */
export async function setClerkAccess(
  email: string,
  access: boolean,
): Promise<"updated" | "not_found" | "error"> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[emos-billing] CLERK_SECRET_KEY not set — cannot update emos_access");
    return "error";
  }

  try {
    const lookup = await fetch(
      `${CLERK_API}/users?email_address=${encodeURIComponent(email)}&limit=1`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!lookup.ok) {
      console.error("[emos-billing] Clerk user lookup failed:", lookup.status, await lookup.text());
      return "error";
    }
    const users = (await lookup.json()) as Array<{ id: string }>;
    const clerkUserId = users?.[0]?.id;
    if (!clerkUserId) return "not_found";

    return (await setClerkAccessById(clerkUserId, access)) ? "updated" : "error";
  } catch (err) {
    console.error("[emos-billing] setClerkAccess error:", err);
    return "error";
  }
}

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
 * Upsert the stripe_subscriptions row. Email casing is written exactly as
 * Stripe supplies it — the table's conflict target is `email`, and rewriting
 * the case here would create a SECOND row alongside any existing mixed-case
 * one rather than updating it. (The read side in emos-guard is fail-open on a
 * miss, so a case mismatch degrades to "none" = allowed, never a lockout.)
 */
export async function recordSubscription(args: {
  email: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  status: string;
}): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from("stripe_subscriptions").upsert(
    {
      email:                  args.email,
      stripe_customer_id:     args.customerId ?? null,
      stripe_subscription_id: args.subscriptionId ?? null,
      status:                 args.status,
      updated_at:             new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (error) console.error("[emos-billing] Supabase upsert failed:", error);
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
}

/**
 * Give this customer a way in, whatever state they are in. Idempotent.
 *
 * Order:
 *   1. known Clerk user id (buyer was signed in at checkout) → grant directly
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
  const { email, clerkUserId, resend } = args;

  // 1. Direct grant against a known account.
  if (clerkUserId) {
    if (await setClerkAccessById(clerkUserId, true)) {
      return { outcome: "granted", email };
    }
    console.error("[emos-billing] direct grant failed for", clerkUserId, "— falling back to email path");
  }

  // 2. Existing account with this email (re-subscriber, or an admin-invited
  //    beta user who has now paid).
  const byEmail = await setClerkAccess(email, true);
  if (byEmail === "updated") return { outcome: "granted", email };

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
 */
export async function reconcileCheckoutSession(
  sessionId: string,
  opts?: { resend?: boolean },
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

    const email = (session.customer_details?.email ?? session.customer_email ?? "").trim();
    if (!email) return notVerified;

    await recordSubscription({
      email,
      customerId:     typeof session.customer === "string" ? session.customer : null,
      subscriptionId: typeof session.subscription === "string" ? session.subscription : null,
      status:         "active",
    });

    const grant = await grantOrInvite({
      email,
      clerkUserId: session.metadata?.clerk_user_id ?? null,
      resend:      opts?.resend,
    });

    return { verified: true, ...grant };
  } catch (err) {
    console.error("[emos-billing] reconcileCheckoutSession error:", err);
    return notVerified;
  }
}

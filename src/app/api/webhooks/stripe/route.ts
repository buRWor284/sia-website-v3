/**
 * /api/webhooks/stripe
 *
 * Handles Stripe webhook events for EMOS Platform billing.
 *
 * checkout.session.completed
 *   → upsert stripe_subscriptions row with status='active'
 *   → send Clerk invitation + branded welcome email via Resend
 *
 * customer.subscription.deleted
 *   → update status to 'canceled'
 *
 * invoice.payment_failed
 *   → update status to 'past_due'
 *
 * invoice.payment_succeeded  (recovers past_due back to active)
 *   → update status to 'active'
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY          — Stripe API key
 *   STRIPE_WEBHOOK_SECRET      — whsec_... from Stripe Dashboard → Webhooks
 *   CLERK_SECRET_KEY           — already set
 *   RESEND_API_KEY             — already set
 *   SUPABASE_SERVICE_ROLE_KEY  — already set
 *   NEXT_PUBLIC_SITE_URL       — already set
 *
 * To register the webhook:
 *   Stripe Dashboard → Developers → Webhooks → Add endpoint
 *   URL: https://www.syedirfanajmal.com/api/webhooks/stripe
 *   Events: checkout.session.completed, customer.subscription.deleted,
 *            invoice.payment_failed, invoice.payment_succeeded
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase";

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "EMOS Platform <contact@syedirfanajmal.com>";
const BASE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.syedirfanajmal.com";

// ─── Stripe webhook signature verification ────────────────────────────────────
// Implements https://stripe.com/docs/webhooks/signatures without the Stripe SDK.

function verifyStripeWebhook(
  rawBody: string,
  sigHeader: string,
  secret: string
): boolean {
  const parts = sigHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const eqIdx = part.indexOf("=");
    const key   = part.slice(0, eqIdx);
    const val   = part.slice(eqIdx + 1);
    if (!acc[key]) acc[key] = [];
    acc[key].push(val);
    return acc;
  }, {});

  const timestamp = parts["t"]?.[0];
  const v1Sigs    = parts["v1"] ?? [];
  if (!timestamp || v1Sigs.length === 0) return false;

  // Reject payloads older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (age > 300) {
    console.error("[stripe-webhook] Timestamp too old:", age, "seconds");
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedHex   = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  const expectedBuf   = Buffer.from(expectedHex, "hex");

  return v1Sigs.some((sig) => {
    const sigBuf = Buffer.from(sig, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(sigBuf, expectedBuf);
  });
}

// ─── Clerk access revocation (H3, 2026-07-02 review) ─────────────────────────
// Cancelled subscribers previously kept emos_access forever: the webhook only
// flipped the DB status, but middleware gates on the Clerk flag. Revoke it here
// so cancellation locks the platform everywhere, immediately.

/**
 * Set emos_access on the Clerk user with this email.
 * Returns "updated" | "not_found" | "error".
 * Also used on checkout for RE-subscribers (whose Clerk account already
 * exists, so a fresh invitation would fail) to restore access.
 */
async function setClerkAccess(email: string, access: boolean): Promise<"updated" | "not_found" | "error"> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[stripe-webhook] CLERK_SECRET_KEY not set — cannot update emos_access");
    return "error";
  }

  try {
    const lookup = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!lookup.ok) {
      console.error("[stripe-webhook] Clerk user lookup failed:", lookup.status, await lookup.text());
      return "error";
    }
    const users = (await lookup.json()) as Array<{ id: string }>;
    const clerkUserId = users?.[0]?.id;
    if (!clerkUserId) return "not_found";

    // PATCH /users/{id}/metadata does a shallow MERGE (unlike PATCH /users/{id},
    // which replaces) — so client_slug or other metadata keys survive.
    const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_metadata: { emos_access: access } }),
    });

    if (!res.ok) {
      console.error("[stripe-webhook] emos_access update failed:", res.status, await res.text());
      return "error";
    }
    console.log(`[stripe-webhook] emos_access=${access} set for ${email} (${clerkUserId})`);
    return "updated";
  } catch (err) {
    console.error("[stripe-webhook] setClerkAccess error:", err);
    return "error";
  }
}

// ─── Clerk invite ─────────────────────────────────────────────────────────────

async function sendClerkInvite(email: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[stripe-webhook] CLERK_SECRET_KEY not set");
    return null;
  }

  const res = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address:   email,
      public_metadata: { emos_access: true },
      redirect_url:    `${BASE_URL}/sign-up`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[stripe-webhook] Clerk invite failed:", res.status, err);
    return null;
  }

  const data = await res.json();
  return (data.url as string) ?? null;
}

// ─── Welcome email ────────────────────────────────────────────────────────────

function buildWelcomeEmail(inviteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to EMOS</title>
</head>
<body style="margin:0;padding:0;background:#f1ebde;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1ebde;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="padding-bottom:32px;">
          <span style="font-family:Arial,sans-serif;font-weight:900;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#f5b81f;">EMOS PLATFORM</span>
        </td></tr>

        <tr><td style="background:#1a1410;padding:40px 40px 36px;">
          <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#f5b81f;margin:0 0 20px;">Payment confirmed — $50/month</p>
          <h1 style="font-family:Georgia,serif;font-weight:700;font-size:28px;line-height:1.2;letter-spacing:-0.02em;color:#f1ebde;margin:0 0 16px;">
            You're in.<br/>Set up your account.
          </h1>
          <p style="font-family:Georgia,serif;font-style:italic;font-size:15px;line-height:1.6;color:rgba(241,235,222,0.65);margin:0;">
            Your EMOS subscription is active. Click below to create your account and access the full platform.
          </p>
        </td></tr>

        <tr><td style="background:#fff8ee;padding:28px 40px;border-left:1px solid rgba(26,20,16,.1);border-right:1px solid rgba(26,20,16,.1);">
          <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(26,20,16,.45);margin:0 0 16px;">What's waiting for you</p>
          ${[
            ["◎", "SignalIQ", "Spot breaking signals. Pitch at the right moment."],
            ["◈", "AssetIQ", "Build the assets journalists actually cite."],
            ["◇", "JournoCollabIQ", "Find journalists. Personalise outreach."],
            ["◆", "PressIQ", "Score your pitch before you send it."],
            ["▣", "CoverageIQ", "Track pitches. Turn coverage into AI citations."],
          ].map(([icon, name, desc]) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tr>
              <td width="28" valign="top" style="font-family:Georgia,serif;font-size:16px;color:#f5b81f;padding-top:2px;">${icon}</td>
              <td><strong style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">${name}</strong>
              <span style="font-family:Georgia,serif;font-size:12px;color:rgba(26,20,16,.55);"> — ${desc}</span></td>
            </tr>
          </table>`).join("")}
        </td></tr>

        <tr><td style="background:#1a1410;padding:32px 40px 36px;text-align:center;">
          <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(241,235,222,0.55);margin:0 0 24px;line-height:1.5;">
            This invite link expires in 30 days.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;background:#f5b81f;color:#1a1410;font-family:Arial,sans-serif;font-weight:900;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
            Create Your Account →
          </a>
        </td></tr>

        <tr><td style="padding:24px 0 0;">
          <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(26,20,16,.35);letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px;">EMOS Platform · syedirfanajmal.com</p>
          <p style="font-family:Georgia,serif;font-size:12px;color:rgba(26,20,16,.35);margin:0;line-height:1.5;">
            If the button doesn't work, copy and paste this link:<br/>
            <span style="color:rgba(26,20,16,.5);">${inviteUrl}</span>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendWelcomeEmail(email: string, inviteUrl: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[stripe-webhook] RESEND_API_KEY not set — skipping welcome email");
    return;
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
      subject: "Payment confirmed — set up your EMOS account",
      html:    buildWelcomeEmail(inviteUrl),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("[stripe-webhook] Resend error:", err);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature") ?? "";

  if (!verifyStripeWebhook(rawBody, sigHeader, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = JSON.parse(rawBody) as { type: string; data: { object: any } };
  const db = createSupabaseServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email   = session.customer_details?.email ?? session.customer_email;
      if (!email) {
        console.error("[stripe-webhook] checkout.session.completed — no email found");
        break;
      }

      const customerId     = session.customer as string;
      const subscriptionId = session.subscription as string;

      const { error: upsertErr } = await db.from("stripe_subscriptions").upsert(
        {
          email,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          status:     "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

      if (upsertErr) {
        console.error("[stripe-webhook] Supabase upsert failed:", upsertErr);
      }

      // Existing Clerk account (re-subscriber or invited beta user who now
      // pays): a fresh invitation would fail — restore access directly instead.
      const restored = await setClerkAccess(email, true);
      if (restored === "not_found") {
        // New customer — send Clerk invite + welcome email as before.
        const inviteUrl = await sendClerkInvite(email);
        if (inviteUrl) {
          await sendWelcomeEmail(email, inviteUrl);
        } else {
          console.error("[stripe-webhook] Clerk invite failed for", email, "— subscription recorded but invite NOT sent");
        }
      } else if (restored === "error") {
        console.error("[stripe-webhook] could not verify/restore Clerk access for", email);
      }

      console.log("[stripe-webhook] checkout.session.completed processed for", email);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { data: rows, error } = await db
        .from("stripe_subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id as string)
        .select("email");

      if (error) {
        console.error("[stripe-webhook] cancel update failed:", error);
      } else {
        console.log("[stripe-webhook] subscription canceled:", sub.id);
        // H3: revoke platform access in Clerk, not just the DB flag.
        const email = rows?.[0]?.email as string | undefined;
        if (email) await setClerkAccess(email, false);
        else console.warn("[stripe-webhook] canceled sub had no matching DB row — no Clerk revocation");
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId   = invoice.subscription as string;
      if (subId) {
        const { error } = await db
          .from("stripe_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);

        if (error) console.error("[stripe-webhook] past_due update failed:", error);
        else       console.log("[stripe-webhook] marked past_due:", subId);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const subId   = invoice.subscription as string;
      // Restore active if it was past_due
      if (subId) {
        await db
          .from("stripe_subscriptions")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId)
          .eq("status", "past_due"); // only update if currently past_due
      }
      break;
    }

    default:
      // Ignore unhandled events
      break;
  }

  return NextResponse.json({ received: true });
}

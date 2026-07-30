/**
 * /api/webhooks/stripe
 *
 * Handles Stripe webhook events for EMOS Platform billing.
 *
 * checkout.session.completed
 *   → upsert stripe_subscriptions row with status='active'
 *   → grant emos_access, or send a Clerk invitation + branded welcome email
 *
 * customer.subscription.deleted
 *   → update status to 'canceled', revoke Clerk access + any pending invite
 *
 * invoice.payment_failed
 *   → update status to 'past_due'
 *
 * invoice.payment_succeeded  (recovers past_due back to active)
 *   → update status to 'active'
 *
 * 2026-07-26: the grant/invite logic moved to src/lib/emos-billing.ts so the
 * success page can run the identical reconciliation as a fallback. This route
 * is now just signature verification + event dispatch. See that file for why
 * the fallback exists (short version: this webhook is not a reliable single
 * point of truth, and under Clerk's restricted sign-up mode a missed invitation
 * is a hard lockout for someone who has already paid).
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
import {
  grantOrInvite,
  normalizeEmail,
  recordSubscription,
  resolveClerkUserIdByEmail,
  revokeAccessUnlessStillPaying,
  revokeClerkInvitations,
} from "@/lib/emos-billing";

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
      const email   = normalizeEmail(session.customer_details?.email ?? session.customer_email);
      if (!email) {
        console.error("[stripe-webhook] checkout.session.completed — no email found");
        break;
      }

      const customerId   = (session.customer as string | null) ?? null;
      const checkoutUser = (session.metadata?.clerk_user_id as string | undefined) ?? null;

      await recordSubscription({
        email,
        customerId,
        subscriptionId: session.subscription as string,
        status:         "active",
        clerkUserId:    checkoutUser,
      });

      // grantOrInvite covers every state: signed-in buyer (clerk_user_id stamped
      // on the session), existing account, already-pending invitation, brand new
      // customer. Critically it still attempts an invitation when the Clerk
      // lookup ERRORS — the old code returned early there, which took the money
      // and left the customer with no account and no email.
      const grant = await grantOrInvite({ email, clerkUserId: checkoutUser });

      // D4: the row is bound to an account ONLY from checkout metadata (done in
      // recordSubscription above) or from a live session on the success page.
      // It is deliberately NOT bound to an account grantOrInvite resolved from
      // the payment email: that is a guess, and since the webhook usually wins
      // the race against the success page, writing it would burn the one-time
      // claim before the buyer ever got to use the sign-in-and-attach path.
      if (grant.outcome === "failed") {
        console.error("[stripe-webhook] PROVISIONING FAILED for", email, "— paid but no access; success page will retry");
      }

      console.log("[stripe-webhook] checkout.session.completed processed for", email, "→", grant.outcome);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { data: rows, error } = await db
        .from("stripe_subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id as string)
        .select("email, clerk_user_id");

      if (error) {
        console.error("[stripe-webhook] cancel update failed:", error);
      } else {
        console.log("[stripe-webhook] subscription canceled:", sub.id);
        // H3: revoke platform access in Clerk, not just the DB flag.
        //
        // D4 (2026-07-30): this used to revoke by the row's EMAIL only, which
        // was the exact mirror of the grant bug and strictly worse. Once
        // checkout began stamping clerk_user_id, a signed-in buyer whose
        // payment email differed got access on account A and, on cancellation,
        // a revoke aimed at whatever account matched the payment email — so
        // account A kept full access for free, silently and indefinitely.
        //
        // Now: revoke every account this subscription could have provisioned —
        // the linked one AND the one behind the payment email — because either
        // may hold access granted off this single payment. Two guards keep that
        // from hurting anyone:
        //
        //   - revokeAccessUnlessStillPaying skips any account that holds
        //     ANOTHER active subscription. One person can easily own two rows
        //     (bought once signed out, once signed in); a blind revoke on
        //     either cancellation would lock out someone who is still paying.
        //   - the row is only ever linked from real evidence (checkout
        //     metadata or a live post-checkout session), never from an
        //     email guess, so `linkedId` is not itself a guess.
        //
        // The residual risk is the reverse of a money leak and much cheaper: if
        // a buyer paid with an address belonging to a colleague who has EMOS on
        // a comped (no-Stripe-row) account, that colleague loses access and has
        // to ask for it back. Preferred over an ex-customer keeping the product
        // for free indefinitely.
        const row      = rows?.[0] as { email?: string; clerk_user_id?: string | null } | undefined;
        const email    = row?.email ? normalizeEmail(row.email) : "";
        const linkedId = row?.clerk_user_id ?? null;

        if (!row) {
          console.warn("[stripe-webhook] canceled sub had no matching DB row — no Clerk revocation");
        } else {
          const targets = new Set<string>();
          if (linkedId) targets.add(linkedId);
          if (email) {
            const byEmail = await resolveClerkUserIdByEmail(email);
            if (byEmail.id) targets.add(byEmail.id);
            // A Clerk blip here looks exactly like "no such account" if you
            // only read .id — and the two need very different follow-up. This
            // one means a cancelled customer may still hold access.
            else if (byEmail.errored) {
              console.error("[stripe-webhook] REVOCATION INCOMPLETE: Clerk lookup errored for", email, "— access may still be live for sub", sub.id);
            }
          }

          for (const id of targets) {
            const result = await revokeAccessUnlessStillPaying(id);
            console.log("[stripe-webhook] revoke", id, "→", result);
          }
          if (targets.size === 0) {
            console.warn("[stripe-webhook] cancellation resolved no Clerk account for", email || "(no email)");
          }

          // A cancelled sub must not leave a live invitation behind: accepting
          // it later would carry emos_access straight back in.
          if (email) await revokeClerkInvitations(email);
        }
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

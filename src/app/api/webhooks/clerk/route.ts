/**
 * /api/webhooks/clerk
 *
 * Listens for Clerk webhook events.
 *
 * SECURITY (C1, 2026-07-02 review): this webhook previously granted
 * public_metadata.emos_access to EVERY user.created event, which made the
 * invite gate decorative — anyone who reached /sign-up got platform access.
 * It no longer grants anything. Both legitimate invite paths
 * (/api/emos-send-invite and the Stripe checkout webhook) set
 * emos_access: true on the Clerk INVITATION itself, and Clerk copies that to
 * the user's public_metadata at sign-up — so an invited user already arrives
 * with the flag. Non-invited sign-ups get no access.
 *
 * On user.created for an invited (emos_access) user, we provision the
 * Supabase organizations + users rows (M4) so the dashboard and saves work
 * from the first session.
 *
 * NOTE: also set Clerk Dashboard → Restrictions → Sign-up mode to
 * "Restricted" so non-invited accounts can't be created at all. That setting
 * lives in the dashboard and cannot be enforced from this repo.
 *
 * Required env vars:
 *   CLERK_WEBHOOK_SIGNING_SECRET  — from Clerk Dashboard → Webhooks → signing secret
 *   CLERK_SECRET_KEY              — already set for auth
 */

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { ensureOrgProvisioned } from "@/lib/emos-provision";

export async function POST(req: NextRequest) {
  // Verify signature — throws if invalid
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const userId = evt.data.id;
    const meta = (evt.data.public_metadata ?? {}) as Record<string, unknown>;

    // Client workspace users are provisioned with client_slug already set —
    // they're not EMOS users; leave them alone.
    if (meta.client_slug) {
      console.log(`[clerk-webhook] client user ${userId} (client_slug: ${meta.client_slug}) — no EMOS provisioning`);
      return NextResponse.json({ received: true });
    }

    // Invite gate: only users whose sign-up carried emos_access (copied from
    // an invitation created by /api/emos-send-invite or the Stripe webhook)
    // are EMOS users. Everyone else gets NOTHING granted here.
    if (meta.emos_access !== true) {
      console.log(`[clerk-webhook] user ${userId} signed up without an EMOS invitation — no access granted`);
      return NextResponse.json({ received: true });
    }

    // Invited user → provision Supabase org + user rows (M4).
    const email =
      evt.data.email_addresses?.find(
        (e) => e.id === evt.data.primary_email_address_id,
      )?.email_address ??
      evt.data.email_addresses?.[0]?.email_address ??
      "";
    const fullName = [evt.data.first_name, evt.data.last_name]
      .filter(Boolean)
      .join(" ");

    if (!email) {
      console.error(`[clerk-webhook] invited user ${userId} has no email address — cannot provision org`);
      return NextResponse.json({ received: true });
    }

    const result = await ensureOrgProvisioned(userId, email, fullName || null);
    if (!result.ok) {
      // Non-fatal for Clerk (return 200 so it doesn't retry forever), but logged.
      // The dashboard's lazy provisioning fallback will retry on first load.
      console.error(`[clerk-webhook] provisioning failed for ${userId}:`, result.error);
    }
  }

  return NextResponse.json({ received: true });
}

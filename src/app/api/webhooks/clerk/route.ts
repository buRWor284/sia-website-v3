/**
 * /api/webhooks/clerk
 *
 * Listens for Clerk webhook events.
 * On user.created: automatically grants emos_access via Clerk Backend API
 * so invited users land on the dashboard without any manual metadata step.
 *
 * Required env vars:
 *   CLERK_WEBHOOK_SIGNING_SECRET  — from Clerk Dashboard → Webhooks → signing secret
 *   CLERK_SECRET_KEY              — already set for auth
 */

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

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

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error("CLERK_SECRET_KEY is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: { emos_access: true },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to set emos_access for ${userId}:`, res.status, err);
        return NextResponse.json({ error: "Failed to update user metadata" }, { status: 502 });
      }

      console.log(`emos_access granted to user ${userId}`);
    } catch (err) {
      console.error("Clerk API fetch error:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

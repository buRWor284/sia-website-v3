/**
 * /api/emos-checkout
 *
 * Creates a Stripe Checkout Session for the EMOS Platform $50/month subscription.
 * Returns { url } which the client immediately redirects to.
 *
 * Public route — no Clerk auth required (user hasn't signed up yet).
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY   — from Stripe Dashboard → Developers → API keys
 *   STRIPE_PRICE_ID     — the recurring price ID (price_xxx) for $50/month
 *   NEXT_PUBLIC_SITE_URL — https://www.syedirfanajmal.com (already set)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySubscriber } from "@/lib/gate/subscriber-cookie";
import { SUB_COOKIE } from "@/lib/gate/config";
import { createSupabaseServiceClient } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.syedirfanajmal.com";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId   = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    console.error("[emos-checkout] Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID");
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body.email === "string" ? body.email : undefined;
  } catch {
    // email is optional — Stripe collects it at checkout
  }

  // P4: recognize the public-tools subscriber wristband (sia_sub). A verified
  // free-tier subscriber lands on Stripe with their email prefilled, and the
  // session carries their subscriber id so the conversion from the free email
  // rung to the paid rung is attributable. Failure here must never block checkout.
  const subscriberId = verifySubscriber(req.cookies.get(SUB_COOKIE)?.value);
  if (subscriberId && !email) {
    try {
      const db = createSupabaseServiceClient();
      const { data } = await db
        .from("tool_subscribers")
        .select("email")
        .eq("id", subscriberId)
        .maybeSingle();
      if (typeof data?.email === "string") email = data.email;
    } catch (e) {
      console.warn("[emos-checkout] wristband email lookup failed:", e);
    }
  }

  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("payment_method_types[]", "card");
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append(
    "success_url",
    `${BASE_URL}/emos/subscribe/success?session_id={CHECKOUT_SESSION_ID}`
  );
  params.append("cancel_url", `${BASE_URL}/emos/subscribe`);
  params.append("metadata[source]", "emos_platform");
  if (subscriberId) params.append("metadata[subscriber_id]", subscriberId);
  if (email) params.append("customer_email", email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("[emos-checkout] Stripe error:", err);
    return NextResponse.json(
      { error: err?.error?.message ?? "Failed to create payment session" },
      { status: 502 }
    );
  }

  const session = await res.json();
  return NextResponse.json({ url: session.url });
}

/**
 * POST /api/emos-platform/billing-portal
 *
 * "Manage billing" (D2, 2026-09-10). Opens Stripe's customer portal for the
 * signed-in subscriber: cancel (at the END of the paid period), update the
 * card, download invoices. Called by a plain HTML form on
 * /emos-platform/dashboard/settings, so every outcome is a browser redirect,
 * never JSON: a JSON error here would render as a raw error page.
 *
 *   paying customer            → 303 to the one-time Stripe portal URL
 *   no Stripe customer (admin,
 *   invited beta user)         → 303 back to settings?billing=none
 *   Stripe or DB failure,
 *   rate limit, lost access    → 303 back to settings?billing=unavailable
 *                                (the dashboard layout then sends anyone whose
 *                                subscription is not active on to /subscribe)
 *
 * POST only: a GET would let link prefetchers mint portal sessions.
 * Customer lookup lives in src/lib/emos-billing-portal.ts.
 */
import { NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import {
  BILLING_RETURN_PATH,
  createBillingPortalSession,
  findBillingCustomer,
} from "@/lib/emos-billing-portal";

export const dynamic = "force-dynamic";

function backToSettings(req: Request, state: "none" | "unavailable") {
  const url = new URL(BILLING_RETURN_PATH, req.url);
  url.searchParams.set("billing", state);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  // Generous: a real customer clicking twice must never be refused. The cap
  // only stops a script minting portal sessions in a loop.
  const guard = await requireEmosAccess({ rateLimitKey: "billing-portal", limit: 20 });
  if (!guard.ok) {
    if (guard.res.status === 401) {
      return NextResponse.redirect(new URL("/emos-platform/signin", req.url), 303);
    }
    return backToSettings(req, "unavailable");
  }

  const lookup = await findBillingCustomer(guard.userId);
  if (lookup.kind === "none") return backToSettings(req, "none");
  if (lookup.kind === "error") return backToSettings(req, "unavailable");

  const session = await createBillingPortalSession(lookup.customerId);
  if ("error" in session) return backToSettings(req, "unavailable");

  return NextResponse.redirect(session.url, 303);
}

/**
 * Single seam for public-tool routes to read the caller's tier (Phase P1).
 * Replaces per-route verifyTier(pp_tier). Returns "email" if EITHER the new
 * signed subscriber wristband (sia_sub) verifies OR the legacy pp_tier cookie
 * verifies (grace period, RFP §9) — so existing PressIQ subscribers are never
 * re-asked. Quota *counting* is unchanged in P1; this only sets the tier.
 */
import type { NextRequest } from "next/server";
import { verifySubscriber } from "./subscriber-cookie";
import { verifyTier } from "@/lib/pitch/tier-cookie";
import { SUB_COOKIE, LEGACY_TIER_COOKIE } from "./config";

export type PublicTier = "email" | "anonymous";

export function getPublicTier(req: NextRequest): PublicTier {
  if (verifySubscriber(req.cookies.get(SUB_COOKIE)?.value)) return "email";
  if (verifyTier(req.cookies.get(LEGACY_TIER_COOKIE)?.value) === "email") return "email";
  return "anonymous";
}

/** The verified subscriber id from the wristband, or null (foundation for P2 counting). */
export function getSubscriberId(req: NextRequest): string | null {
  return verifySubscriber(req.cookies.get(SUB_COOKIE)?.value);
}

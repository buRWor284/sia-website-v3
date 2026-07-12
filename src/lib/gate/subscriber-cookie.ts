/**
 * Signed value for the domain-wide subscriber "wristband" cookie (`sia_sub`).
 *
 * Generalizes the PressIQ `pp_tier` pattern (lib/pitch/tier-cookie.ts): the cookie
 * carries the tool_subscribers.id (a uuid), HMAC-signed server-side so a client
 * can't forge it to fake a verified identity. httpOnly — JS never reads it; the
 * gate routes verify it server-side. One verified email = one wristband, honored
 * across every public tool because the cookie is scoped to the whole domain.
 *
 * Requires SUBSCRIBER_COOKIE_SECRET (falls back to PITCH_TIER_SECRET so nothing
 * breaks before the new secret is set). If neither is set, signing is disabled and
 * verify() returns null (fail closed — the caller is treated as anonymous).
 */
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { SUB_COOKIE, SUB_COOKIE_MAX_AGE } from "./config";

const SECRET = process.env.SUBSCRIBER_COOKIE_SECRET || process.env.PITCH_TIER_SECRET;

function hmac(value: string): string {
  return createHmac("sha256", SECRET as string).update(value).digest("base64url");
}

/** Signed cookie value for a verified subscriber id. Returns null if no secret set. */
export function signSubscriber(id: string): string | null {
  if (!SECRET) return null;
  return `${id}.${hmac(id)}`;
}

/** Returns the subscriber id if the cookie holds a valid signed value, else null. */
export function verifySubscriber(cookieValue: string | undefined | null): string | null {
  if (!SECRET || !cookieValue) return null;
  // The id (a uuid) contains no dots, so split on the LAST dot: id + "." + sig.
  const idx = cookieValue.lastIndexOf(".");
  if (idx <= 0) return null;
  const id = cookieValue.slice(0, idx);
  const sig = cookieValue.slice(idx + 1);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(hmac(id));
    return a.length === b.length && timingSafeEqual(a, b) ? id : null;
  } catch {
    return null;
  }
}

/** Set the signed wristband cookie on a response (no-op if signing is disabled). */
export function setSubscriberCookie(res: NextResponse, id: string): void {
  const value = signSubscriber(id);
  if (!value) return;
  res.cookies.set(SUB_COOKIE, value, {
    path: "/",
    maxAge: SUB_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

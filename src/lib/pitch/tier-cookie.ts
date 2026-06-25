/**
 * Signed value for the email-tier cookie (`pp_tier`).
 *
 * Stops the monthly cap from being lifted by a hand-set `pp_tier=email` cookie:
 * the value is HMAC-signed server-side, so a client can't forge it.
 *
 * Requires PITCH_TIER_SECRET. If it's unset, this falls back to the legacy plain
 * "email" value (a graceful no-op) so nothing breaks before the secret is set in
 * the environment. Once the secret is set, only signed values are accepted.
 */
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.PITCH_TIER_SECRET;
const TIER = "email";

function hmac(value: string): string {
  return createHmac("sha256", SECRET as string).update(value).digest("base64url");
}

/** Cookie value to set for the email tier — signed when a secret is configured. */
export function signTier(): string {
  if (!SECRET) return TIER; // legacy plain value (dev / pre-config)
  return `${TIER}.${hmac(TIER)}`;
}

/** Returns "email" if the cookie holds a valid email-tier value, else null. */
export function verifyTier(cookieValue: string | undefined | null): "email" | null {
  if (!cookieValue) return null;
  if (!SECRET) return cookieValue === TIER ? TIER : null; // legacy acceptance
  const [tier, sig] = cookieValue.split(".");
  if (tier !== TIER || !sig) return null;
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(hmac(TIER));
    return a.length === b.length && timingSafeEqual(a, b) ? TIER : null;
  } catch {
    return null;
  }
}

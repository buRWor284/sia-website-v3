/**
 * 6-digit email verification codes for the public-tool gate (Phase P1).
 *
 * Codes are never stored in plaintext: we persist an HMAC of the code (keyed by
 * SUBSCRIBER_COOKIE_SECRET / PITCH_TIER_SECRET) in subscriber_verifications.code_hash
 * and compare in constant time.
 */
import { createHmac, timingSafeEqual, randomInt } from "crypto";

const SECRET =
  process.env.SUBSCRIBER_COOKIE_SECRET || process.env.PITCH_TIER_SECRET || "dev-insecure-secret";

/** A cryptographically-random, zero-padded 6-digit code, e.g. "042317". */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHmac("sha256", SECRET).update(code).digest("base64url");
}

/** Constant-time compare of a candidate code against a stored hash. */
export function codeMatches(code: string, hash: string): boolean {
  try {
    const a = Buffer.from(hashCode(code));
    const b = Buffer.from(hash);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

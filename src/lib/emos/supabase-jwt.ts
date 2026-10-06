import "server-only";
import { createPrivateKey, sign, type KeyObject } from "node:crypto";

/**
 * Mint a short-lived Supabase JWT for one actor (EMOS MCP Stage 4, Session 2).
 *
 * WHY. Clerk's OAuth access tokens are opaque (spec v1.3 decision 3), so they
 * cannot be handed to Supabase as a Bearer the way the dashboard hands over
 * its Clerk session JWT. Instead the MCP door signs its own five-minute token
 * with the project's ES256 signing key (Supabase → Project Settings → JWT
 * Signing Keys; the private JWK is on Vercel as SUPABASE_JWT_PRIVATE_KEY).
 * PostgREST verifies it against the project's published keys, and RLS reads
 * `org_id` / `sub` from it through get_current_org_id(), exactly as it does
 * for the dashboard. The service role is never involved.
 *
 * Node's own crypto, no library: `jose` is in node_modules only as somebody
 * else's dependency, and a transitive import can vanish on any install.
 */

const TTL_SECONDS = 5 * 60;

let cached: { key: KeyObject; kid: string } | null = null;

function loadKey(): { key: KeyObject; kid: string } {
  if (cached) return cached;
  let text = (process.env.SUPABASE_JWT_PRIVATE_KEY ?? "").trim();
  if (!text) throw new Error("SUPABASE_JWT_PRIVATE_KEY is not set on the server.");
  // Tolerate a value pasted with wrapping quotes, or base64-encoded.
  if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"') && !text.startsWith('{"'))) {
    text = text.slice(1, -1).trim();
  }
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const decoded = Buffer.from(text, "base64").toString("utf8").trim();
    if (decoded.startsWith("{") || decoded.startsWith("[")) text = decoded;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("SUPABASE_JWT_PRIVATE_KEY is not valid JSON (expected the private JWK).");
  }
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as { keys?: unknown[] }).keys)) {
    parsed = (parsed as { keys: unknown[] }).keys[0];
  }
  const jwk = (parsed ?? {}) as { kty?: string; crv?: string; d?: string; kid?: string };
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d) {
    throw new Error("SUPABASE_JWT_PRIVATE_KEY must be an ES256 (EC P-256) private JWK.");
  }
  if (!jwk.kid) throw new Error("SUPABASE_JWT_PRIVATE_KEY has no `kid`; Supabase cannot match it to a signing key.");
  const key = createPrivateKey({ key: jwk as Record<string, unknown>, format: "jwk" } as Parameters<typeof createPrivateKey>[0]);
  cached = { key, kid: jwk.kid };
  return cached;
}

const b64url = (v: string | Buffer): string => Buffer.from(v).toString("base64url");

/** A signed token PostgREST accepts as the `authenticated` role for this org. */
export function mintSupabaseJwt(claims: { clerkUserId: string; orgId: string }): { token: string; expiresAt: number } {
  const { key, kid } = loadKey();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TTL_SECONDS;
  const header = { alg: "ES256", typ: "JWT", kid };
  const payload = {
    iss: `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/auth/v1`,
    aud: "authenticated",
    role: "authenticated",
    sub: claims.clerkUserId,
    org_id: claims.orgId,
    iat: now,
    exp,
  };
  const input = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  // JWS wants the raw r||s signature, not DER.
  const signature = sign("sha256", Buffer.from(input), { key, dsaEncoding: "ieee-p1363" });
  return { token: `${input}.${b64url(signature)}`, expiresAt: exp * 1000 };
}

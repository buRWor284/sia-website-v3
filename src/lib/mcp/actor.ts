/**
 * EMOS MCP — who is calling, and are they allowed in.
 *
 * Spec v1.3 §2.2 "Per-call guard", in this order, every step fail-closed:
 *   1. Clerk OAuth token  → userId, clientId, scopes. Must carry an emos:* scope.
 *   2. Clerk user record  → publicMetadata.emos_access === true, primary email.
 *   3. subscriptionAccess → the same rule the dashboard uses (emos-guard.ts).
 *   4. users.org_id       → no row means 403, never a null org (review S3).
 *   5. Rate limit per actor and tier (rate_limits table, shared limiter).
 *
 * This is deliberately a separate function from requireEmosAccess(): that one
 * reads a browser session and fails open on a DB outage, which is the right
 * posture for a person in a tab and the wrong one for a machine door.
 *
 * Tokens are opaque (Clerk dashboard → Access token format), so every call is
 * verified with Clerk and a revoked grant is refused on the very next call.
 */
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { subscriptionAccess } from "@/lib/emos-guard";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import { MCP_ALL_SCOPES, MCP_RESOURCE_METADATA_URL, type McpScope } from "@/lib/mcp/config";

export type McpTier = "read" | "run" | "write";

export interface McpActor {
  orgId: string;
  userId: string; // Clerk user id
  email: string;
  isAdmin: boolean;
  scopes: McpScope[];
  clientId: string; // OAuth client (CIMD URL or DCR id), logged for audit
  via: "mcp_oauth";
}

export type McpAuthFailure = {
  ok: false;
  status: 401 | 402 | 403 | 429;
  error: string;
  /** Extra headers, e.g. WWW-Authenticate on 401/403. */
  headers?: Record<string, string>;
};
export type McpAuthResult = { ok: true; actor: McpActor } | McpAuthFailure;

/** RFC 9728 §5.1 challenge Claude needs to start (or restart) sign-in. */
export function bearerChallenge(extra?: { error?: string; scope?: string; description?: string }): string {
  const parts = [`resource_metadata="${MCP_RESOURCE_METADATA_URL}"`];
  if (extra?.error) parts.push(`error="${extra.error}"`);
  if (extra?.scope) parts.push(`scope="${extra.scope}"`);
  if (extra?.description) parts.push(`error_description="${extra.description.replace(/"/g, "'")}"`);
  return `Bearer ${parts.join(", ")}`;
}

function unauthorized(error: string): McpAuthFailure {
  return { ok: false, status: 401, error, headers: { "WWW-Authenticate": bearerChallenge() } };
}

const TIER_LIMITS: Record<McpTier, { limit: number; windowMs: number }> = {
  read: { limit: 60, windowMs: 60_000 },
  run: { limit: 10, windowMs: 60_000 },
  write: { limit: 120, windowMs: 60 * 60_000 }, // commits only; previews are not counted
};

/**
 * Resolve the caller. `tier` is the tier of the tool about to run, for the
 * rate-limit bucket; pass "read" for protocol-level calls (initialize,
 * tools/list) which are cheap.
 */
export async function resolveMcpActor(tier: McpTier): Promise<McpAuthResult> {
  // 1. Token --------------------------------------------------------------
  type OAuthTokenAuth = {
    isAuthenticated: boolean;
    tokenType: string | null;
    userId: string | null;
    clientId?: string | null;
    scopes?: string[] | null;
  };
  let tok: OAuthTokenAuth;
  try {
    tok = (await auth({ acceptsToken: "oauth_token" })) as unknown as OAuthTokenAuth;
  } catch (e) {
    console.warn("[mcp] token verification threw:", e);
    return unauthorized("Could not verify the access token.");
  }
  if (!tok.isAuthenticated || tok.tokenType !== "oauth_token" || !tok.userId) {
    return unauthorized("Sign in to EMOS to use this connector.");
  }
  const scopes = (tok.scopes ?? []).filter((s): s is McpScope => (MCP_ALL_SCOPES as string[]).includes(s));
  if (scopes.length === 0) {
    // A valid Clerk token minted for some other OAuth app on this instance
    // (review S2): refuse, and tell the client which scopes this server wants.
    return {
      ok: false,
      status: 403,
      error: "This token carries no EMOS scopes. Reconnect the EMOS connector.",
      headers: { "WWW-Authenticate": bearerChallenge({ error: "insufficient_scope", scope: MCP_ALL_SCOPES.join(" ") }) },
    };
  }

  // 2. Clerk user: emos_access flag + email ---------------------------------
  let email = "";
  let hasAccess = false;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(tok.userId);
    email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
    hasAccess = user.publicMetadata?.emos_access === true;
  } catch (e) {
    console.error("[mcp] Clerk user lookup failed:", e);
    return { ok: false, status: 403, error: "Could not verify EMOS platform access. Please retry." };
  }
  if (!hasAccess) {
    return { ok: false, status: 403, error: "This account does not have EMOS platform access." };
  }

  // 3. Subscription ---------------------------------------------------------
  const sub = await subscriptionAccess(email, tok.userId);
  if (!sub.allowed) {
    return { ok: false, status: 402, error: "Your EMOS subscription is not active. Renew it to use the connector." };
  }

  // 4. Organisation (no row = refuse; never a null org on this door) ---------
  let orgId: string | null = null;
  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db.from("users").select("org_id").eq("clerk_user_id", tok.userId).maybeSingle();
    if (error) throw new Error(error.message);
    orgId = (data?.org_id as string | undefined) ?? null;
  } catch (e) {
    console.error("[mcp] org lookup failed:", e);
    return { ok: false, status: 403, error: "Could not resolve your EMOS organisation. Please retry." };
  }
  if (!orgId) {
    return {
      ok: false,
      status: 403,
      error: "Your account has no EMOS organisation yet. Open the EMOS dashboard once, then reconnect.",
    };
  }

  // 5. Rate limit -----------------------------------------------------------
  const rl = TIER_LIMITS[tier];
  const limited = await rateLimitDb(`mcp:${tier}:${orgId}:${tok.userId}`, rl);
  if (!limited.ok) {
    return { ok: false, status: 429, error: `Too many ${tier} calls. Please wait a minute and try again.` };
  }

  return {
    ok: true,
    actor: {
      orgId,
      userId: tok.userId,
      email,
      isAdmin: isEmosAdminEmail(email),
      scopes,
      clientId: tok.clientId ?? "unknown",
      via: "mcp_oauth",
    },
  };
}

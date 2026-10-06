import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mintSupabaseJwt } from "@/lib/emos/supabase-jwt";

/**
 * Actor: who is acting, on which organisation, through which door
 * (spec v1.3 §2.3). Every function in src/lib/emos takes one.
 *
 * `db()` is ALWAYS a row-level-security client for this actor's org. It is
 * never the service role. Each query in src/lib/emos still says
 * `.eq("org_id", actor.orgId)` out loud, but the database is what enforces it.
 */
export interface Actor {
  orgId: string;
  /** Clerk user id. */
  userId: string;
  email: string;
  isAdmin: boolean;
  via: "dashboard" | "mcp_oauth";
  /** OAuth client, for logs and the audit trail. */
  clientId?: string;
  db(): SupabaseClient;
}

/** What every src/lib/emos function returns; the MCP layer passes it through. */
export interface EmosResult {
  /** One or two plain lines the AI can quote. */
  text: string;
  data?: unknown;
  isError?: boolean;
}

/** Re-mint when the token has less than this left (background work outlives a request). */
const REFRESH_MARGIN_MS = 2 * 60_000;

/**
 * An RLS client factory for one actor on the MCP door. The token is minted on
 * first use and re-minted when it nears expiry, so a scan that keeps running
 * after the response can still save its results.
 */
export function mcpDbFactory(who: { orgId: string; userId: string }): () => SupabaseClient {
  let current: { client: SupabaseClient; expiresAt: number } | null = null;
  return () => {
    if (current && current.expiresAt - Date.now() > REFRESH_MARGIN_MS) return current.client;
    const { token, expiresAt } = mintSupabaseJwt({ clerkUserId: who.userId, orgId: who.orgId });
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    current = { client, expiresAt };
    return client;
  };
}

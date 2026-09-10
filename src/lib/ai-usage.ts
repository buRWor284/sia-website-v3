import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { createSupabaseServiceClient } from "@/lib/supabase";

/**
 * AI usage + cost log — stage 3 of the EMOS Platform roadmap, "the money
 * questions" (2026-09-10).
 *
 * One row in `ai_usage` per billed Anthropic call, on BOTH surfaces: the
 * dashboard and the public /tools/* lead magnets share the same cores, so one
 * change covers both and also shows what the free tools cost.
 *
 * HOW ATTRIBUTION WORKS. The shared cores do not know who is asking, and they
 * should not have to: each ROUTE wraps its core call in withAiUsage({ surface,
 * clerkUserId }), and recordAiUsage() reads that from AsyncLocalStorage (the
 * same mechanism Next.js uses for headers() and cookies()). A call made outside
 * any wrapper is still logged, with surface "unattributed", so the money is
 * never lost from the data, only the attribution, and it shows up plainly in a
 * query instead of hiding.
 *
 * RULES, each one learned the hard way elsewhere in this repo:
 *  - Record BEFORE any stop_reason / parse check. A truncated answer is still
 *    billed, and the truncation guards return early.
 *  - AWAITED, never fire-and-forget: Vercel freezes the function at response
 *    flush and a void write is silently dropped (the July logPitch bug).
 *  - Never throws. Logging a cost must never cost the customer their result.
 *  - An unknown model gets cost_usd NULL, never 0. A parser default that turns
 *    missing data into a confident number is the exact bug fixed in 97d91e6.
 *
 * Deliberately NOT here: any test / internal flag. That is being designed in a
 * separate session (10 Sep); org_id is the join key it can hang off.
 */

export type AiSurface = "platform" | "public";

export interface AiUsageContext {
  surface: AiSurface;
  /** Clerk user id when signed in. Resolved to org_id at write time. */
  clerkUserId?: string | null;
}

/** Which tool made the call. One value per call site. */
export type AiTool =
  | "pressiq-score"
  | "pitch-draft"
  | "signaliq-pack"
  | "signaliq-profile"
  | "journo-ai"
  | "collab-ai"
  | "asset-brief";

const context = new AsyncLocalStorage<AiUsageContext>();

/** Run `fn` with this surface/user attached to every AI call it makes. */
export function withAiUsage<T>(ctx: AiUsageContext, fn: () => Promise<T>): Promise<T> {
  return context.run(ctx, fn);
}

// ─── Prices ────────────────────────────────────────────────────────────────
// USD per million tokens. Source: https://platform.claude.com/docs/en/about-claude/pricing
// read 2026-09-10. Bump PRICE_VERSION whenever a number here changes; every row
// is stamped with it, so history is never silently repriced.
export const PRICE_VERSION = "2026-09-10";

interface ModelPrice {
  input: number;
  output: number;
  /** 5-minute cache write (the default TTL). */
  cacheWrite: number;
  cacheRead: number;
}

const PRICES: Record<string, ModelPrice> = {
  "claude-opus-5":     { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-8":   { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-7":   { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-6":   { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-5":   { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-sonnet-5":   { input: 2, output: 10, cacheWrite: 2.5,  cacheRead: 0.2 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-sonnet-4-5": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5":  { input: 1, output: 5,  cacheWrite: 1.25, cacheRead: 0.1 },
};

/** $10 per 1,000 web searches (same page). No EMOS call uses it today. */
const WEB_SEARCH_USD = 10 / 1000;

/** Exact id, or the id plus an 8-digit date snapshot suffix. Nothing looser:
 * a prefix match would price a future "-5-1" model at today's "-5" rate. */
export function priceFor(model: string): ModelPrice | null {
  for (const [id, price] of Object.entries(PRICES)) {
    if (model === id || new RegExp(`^${id}-\\d{8}$`).test(model)) return price;
  }
  return null;
}

/** The usage block the Messages API returns on every successful response. */
export interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null } | null;
}

/** USD for one call, or null when the model has no known price. */
export function costUsd(model: string, u: AnthropicUsage): number | null {
  const p = priceFor(model);
  if (!p) return null;
  const tokens =
    (u.input_tokens ?? 0) * p.input +
    (u.output_tokens ?? 0) * p.output +
    (u.cache_creation_input_tokens ?? 0) * p.cacheWrite +
    (u.cache_read_input_tokens ?? 0) * p.cacheRead;
  return tokens / 1_000_000 + (u.server_tool_use?.web_search_requests ?? 0) * WEB_SEARCH_USD;
}

/**
 * Write one ai_usage row for a successful Anthropic response. Call it right
 * after `await res.json()`, before any early return. Never throws.
 */
export async function recordAiUsage(
  tool: AiTool,
  model: string,
  /** The parsed response body. Typed loosely on purpose: every call site casts
   * it to its own narrow shape, and usage / stop_reason are read defensively. */
  json: unknown,
  /** For routes that make the call inline and already know who is asking.
   * Shared cores leave this out and inherit the route's withAiUsage context. */
  explicit?: AiUsageContext,
): Promise<void> {
  try {
    const body = (json ?? {}) as { usage?: AnthropicUsage | null; stop_reason?: string | null };
    const u = body.usage;
    if (!u) {
      console.warn(`[ai-usage] ${tool}: response carried no usage block, nothing recorded`);
      return;
    }
    const ctx = explicit ?? context.getStore();
    const db = createSupabaseServiceClient();

    let orgId: string | null = null;
    if (ctx?.clerkUserId) {
      const { data } = await db
        .from("users")
        .select("org_id")
        .eq("clerk_user_id", ctx.clerkUserId)
        .maybeSingle();
      orgId = (data?.org_id as string | undefined) ?? null;
    }

    const cost = costUsd(model, u);
    if (cost === null) console.warn(`[ai-usage] no price for model "${model}", cost left NULL`);

    const { error } = await db.from("ai_usage").insert({
      org_id: orgId,
      clerk_user_id: ctx?.clerkUserId ?? null,
      surface: ctx?.surface ?? "unattributed",
      tool,
      model,
      input_tokens: u.input_tokens ?? 0,
      output_tokens: u.output_tokens ?? 0,
      cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
      web_search_requests: u.server_tool_use?.web_search_requests ?? 0,
      cost_usd: cost,
      price_version: PRICE_VERSION,
      stop_reason: body.stop_reason ?? null,
    });
    if (error) console.warn(`[ai-usage] ${tool}: insert failed:`, error.message);
  } catch (e) {
    console.warn(`[ai-usage] ${tool}: record failed (non-fatal):`, e);
  }
}

/**
 * /api/mcp/mcp — the EMOS MCP server (Stage 4, Session 1, 2026-10-06).
 *
 * Streamable HTTP, stateless. One POST per JSON-RPC message, one JSON reply.
 * Authentication is Clerk OAuth (see src/lib/mcp/actor.ts); unauthenticated
 * requests get 401 + WWW-Authenticate so Claude can start sign-in
 * (Anthropic: "A 401 is required to start sign-in").
 *
 * [transport] exists so /api/mcp/sse can answer with a clear "not supported"
 * instead of a confusing 404 (the current libraries dropped SSE; so do we).
 *
 * Middleware: proxy.ts does not gate /api/mcp (only /api/emos-platform), so
 * clerkMiddleware runs but lets the request through; auth() inside is what
 * verifies the bearer token. Nothing to add there.
 *
 * maxDuration 300: every tool call is one request under this cap, and Tier A
 * tools (Session 2) run up to ~120 s inline. Pro plan already allows 300 on
 * the factcheck routes.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveMcpActor, bearerChallenge, type McpTier } from "@/lib/mcp/actor";
import { dispatch, parseJsonRpc, rpcError, RPC, type JsonRpcResponse } from "@/lib/mcp/protocol";
import { SESSION1_TOOLS } from "@/lib/mcp/tools/read";
import { MCP_DEFAULT_PROTOCOL_VERSION } from "@/lib/mcp/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TOOLS = SESSION1_TOOLS;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "WWW-Authenticate, MCP-Protocol-Version",
} as const;

function baseHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...CORS, "Cache-Control": "no-store", "MCP-Protocol-Version": MCP_DEFAULT_PROTOCOL_VERSION, ...(extra ?? {}) };
}

function httpError(status: number, error: string, extra?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers: baseHeaders(extra) });
}

function isMcpTransport(req: NextRequest): boolean {
  // /api/mcp/<transport>: only "mcp" is served.
  const seg = req.nextUrl.pathname.split("/").filter(Boolean).pop();
  return seg === "mcp";
}

function notSupportedTransport() {
  return httpError(404, "Only the Streamable HTTP transport is served, at /api/mcp/mcp.");
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: baseHeaders() });
}

/** No server-initiated stream in stateless mode. Unauthenticated callers still get the challenge. */
export async function GET(req: NextRequest) {
  if (!isMcpTransport(req)) return notSupportedTransport();
  if (!req.headers.get("authorization")) {
    return httpError(401, "Sign in to EMOS to use this connector.", { "WWW-Authenticate": bearerChallenge() });
  }
  return httpError(405, "This server is stateless: send JSON-RPC messages with POST.", { Allow: "POST, OPTIONS" });
}

export async function DELETE(req: NextRequest) {
  if (!isMcpTransport(req)) return notSupportedTransport();
  // Session termination is a no-op without sessions.
  return new NextResponse(null, { status: 204, headers: baseHeaders() });
}

export async function POST(req: NextRequest) {
  if (!isMcpTransport(req)) return notSupportedTransport();

  // Fast 401 before parsing anything: this is the handshake Claude expects.
  const authz = req.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+/i.test(authz)) {
    return httpError(401, "Sign in to EMOS to use this connector.", { "WWW-Authenticate": bearerChallenge() });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, RPC.PARSE_ERROR, "Body is not valid JSON."), { status: 400, headers: baseHeaders() });
  }
  const messages = parseJsonRpc(raw);
  if (!messages) {
    return NextResponse.json(rpcError(null, RPC.INVALID_REQUEST, "Not a JSON-RPC 2.0 message."), { status: 400, headers: baseHeaders() });
  }

  // One Clerk round-trip per request, whatever the batch size: cache by tier.
  const cache = new Map<McpTier, Awaited<ReturnType<typeof resolveMcpActor>>>();
  const authenticate = async (tier: McpTier) => {
    const hit = cache.get(tier);
    if (hit) return hit;
    const r = await resolveMcpActor(tier);
    cache.set(tier, r);
    return r;
  };

  const outcomes = await Promise.all(messages.map((m) => dispatch(m, { tools: TOOLS, authenticate })));

  // A single message is the normal case; answer it directly.
  if (outcomes.length === 1) {
    const o = outcomes[0];
    if (o.kind === "accepted") return new NextResponse(null, { status: 202, headers: baseHeaders() });
    if (o.kind === "http_error") return httpError(o.status, o.error, o.headers);
    return NextResponse.json(o.body, { status: o.status, headers: baseHeaders(o.headers) });
  }

  // Batch: if any message failed at the HTTP layer (auth), the whole batch does.
  const failed = outcomes.find((o) => o.kind === "http_error");
  if (failed && failed.kind === "http_error") return httpError(failed.status, failed.error, failed.headers);
  const bodies: JsonRpcResponse[] = outcomes.flatMap((o) => (o.kind === "json" ? [o.body] : []));
  if (bodies.length === 0) return new NextResponse(null, { status: 202, headers: baseHeaders() });
  return NextResponse.json(bodies, { status: 200, headers: baseHeaders() });
}

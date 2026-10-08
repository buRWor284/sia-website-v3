/**
 * EMOS MCP — a small, dependency-free MCP server core.
 *
 * Why not mcp-handler / the SDK: at Session 1 the current mcp-handler (2.x)
 * needs MCP SDK v2 while @clerk/mcp-tools still imports SDK v1 types, and the
 * package registry is not reachable from the build sandbox (spec v1.3 §2.1,
 * review B2). The protocol we need is JSON-RPC 2.0 over a single POST
 * endpoint (Streamable HTTP, stateless): initialize, ping, tools/list,
 * tools/call, and acknowledging notifications. That is this file. If the
 * surface grows (prompts, resources, streaming), swap in the SDK then.
 *
 * Streamable HTTP, stateless mode:
 *   - POST with one JSON-RPC message → one JSON response (application/json).
 *   - POST with a notification (no id) → 202 Accepted, empty body.
 *   - GET → 405 (no server-initiated stream in stateless mode).
 *   - No sessions: every request is authenticated on its own.
 */
import { getPrompt, promptListing } from "@/lib/mcp/prompts";
import {
  MCP_DEFAULT_PROTOCOL_VERSION,
  MCP_INSTRUCTIONS,
  MCP_PROTOCOL_VERSIONS,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from "@/lib/mcp/config";
import type { McpActor, McpTier } from "@/lib/mcp/actor";

// ─── JSON-RPC shapes ─────────────────────────────────────────────────────────

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export const RPC = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
} as const;

export function rpcError(id: JsonRpcId, code: number, message: string, data?: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: data === undefined ? { code, message } : { code, message, data } };
}
export function rpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

// ─── Tool registry types ─────────────────────────────────────────────────────

/** A JSON Schema object for a tool's input. Kept loose on purpose. */
export type JsonSchema = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolResult {
  /** One line of plain text the AI can quote. */
  text: string;
  /** The JSON payload (returned as structuredContent AND as a JSON text block). */
  data?: unknown;
  isError?: boolean;
}

export interface McpTool {
  name: string;
  description: string;
  tier: McpTier;
  inputSchema: JsonSchema;
  annotations?: ToolAnnotations;
  handler: (actor: McpActor, args: Record<string, unknown>) => Promise<ToolResult>;
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export interface DispatchContext {
  tools: McpTool[];
  /** Resolve the caller for a given tier. Called once per request. */
  authenticate: (tier: McpTier) => Promise<
    { ok: true; actor: McpActor } | { ok: false; status: number; error: string; headers?: Record<string, string> }
  >;
}

export type DispatchOutcome =
  | { kind: "json"; status: number; body: JsonRpcResponse; headers?: Record<string, string> }
  | { kind: "accepted" }
  | { kind: "http_error"; status: number; error: string; headers?: Record<string, string> };

/** Accepts a single message or a batch; batches are rare and we answer them one by one. */
export function parseJsonRpc(raw: unknown): JsonRpcRequest[] | null {
  const one = (m: unknown): JsonRpcRequest | null => {
    if (!m || typeof m !== "object") return null;
    const r = m as Record<string, unknown>;
    if (r.jsonrpc !== "2.0" || typeof r.method !== "string") return null;
    return r as unknown as JsonRpcRequest;
  };
  if (Array.isArray(raw)) {
    const out = raw.map(one);
    return out.every(Boolean) && out.length > 0 ? (out as JsonRpcRequest[]) : null;
  }
  const m = one(raw);
  return m ? [m] : null;
}

function negotiateVersion(requested: unknown): string {
  if (typeof requested === "string" && (MCP_PROTOCOL_VERSIONS as readonly string[]).includes(requested)) {
    return requested;
  }
  return MCP_DEFAULT_PROTOCOL_VERSION;
}

function toolListing(tools: McpTool[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    ...(t.annotations ? { annotations: t.annotations } : {}),
  }));
}

function tierScope(tier: McpTier): string {
  return `emos:${tier}`;
}

/**
 * Handle one JSON-RPC message. Authentication happens inside, because the
 * tier (and so the rate-limit bucket and the required scope) depends on the
 * method and, for tools/call, on the tool.
 */
export async function dispatch(msg: JsonRpcRequest, ctx: DispatchContext): Promise<DispatchOutcome> {
  const id: JsonRpcId = msg.id ?? null;
  const isNotification = msg.id === undefined;

  // Notifications need no reply. We still require auth so an unauthenticated
  // probe cannot tell notifications from anything else.
  if (isNotification) {
    const a = await ctx.authenticate("read");
    if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
    return { kind: "accepted" };
  }

  switch (msg.method) {
    case "initialize": {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      const version = negotiateVersion(msg.params?.protocolVersion);
      return {
        kind: "json",
        status: 200,
        body: rpcResult(id, {
          protocolVersion: version,
          capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
          serverInfo: { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION, title: "EMOS Platform" },
          instructions: MCP_INSTRUCTIONS,
        }),
      };
    }

    case "ping": {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      return { kind: "json", status: 200, body: rpcResult(id, {}) };
    }

    case "tools/list": {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      // Only advertise tools this token's scopes can actually call.
      const visible = ctx.tools.filter((t) => a.actor.scopes.includes(tierScope(t.tier) as McpActor["scopes"][number]));
      return { kind: "json", status: 200, body: rpcResult(id, { tools: toolListing(visible) }) };
    }

    case "prompts/list": {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      return { kind: "json", status: 200, body: rpcResult(id, { prompts: promptListing() }) };
    }

    case "prompts/get": {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      const got = getPrompt(msg.params?.name, msg.params?.arguments);
      if (!got.ok) return { kind: "json", status: 200, body: rpcError(id, RPC.INVALID_PARAMS, got.error) };
      return {
        kind: "json",
        status: 200,
        body: rpcResult(id, { description: got.description, messages: [{ role: "user", content: { type: "text", text: got.text } }] }),
      };
    }

    case "tools/call": {
      const name = msg.params?.name;
      const tool = typeof name === "string" ? ctx.tools.find((t) => t.name === name) : undefined;
      if (!tool) {
        // Authenticate anyway so the error does not leak the tool list to strangers.
        const a = await ctx.authenticate("read");
        if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
        return { kind: "json", status: 200, body: rpcError(id, RPC.INVALID_PARAMS, `Unknown tool: ${String(name)}`) };
      }
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      // Rate-limit bucket. Write tools run twice: a preview, then a commit that
      // carries the confirmation token. Only commits count against the write
      // limit (spec §2.2: 120 commits an hour, previews are not counted), so a
      // preview is metered as a read. The scope check below still asks for
      // emos:write on both halves.
      const isCommit = typeof args.confirmation_token === "string" && args.confirmation_token !== "";
      const bucket: McpTier = tool.tier === "write" && !isCommit ? "read" : tool.tier;
      const a = await ctx.authenticate(bucket);
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      const needed = tierScope(tool.tier);
      if (!a.actor.scopes.includes(needed as McpActor["scopes"][number])) {
        return {
          kind: "http_error",
          status: 403,
          error: `This connector was not granted the ${needed} scope. Reconnect EMOS to grant it.`,
          headers: { "WWW-Authenticate": `Bearer error="insufficient_scope", scope="${needed}"` },
        };
      }
      try {
        const r = await tool.handler(a.actor, args);
        const content: Array<{ type: "text"; text: string }> = [{ type: "text", text: r.text }];
        if (r.data !== undefined) content.push({ type: "text", text: JSON.stringify(r.data) });
        return {
          kind: "json",
          status: 200,
          body: rpcResult(id, {
            content,
            ...(r.data !== undefined && typeof r.data === "object" && r.data !== null ? { structuredContent: r.data } : {}),
            isError: r.isError === true,
          }),
        };
      } catch (e) {
        // Tool failures are results, not protocol errors (MCP spec): the AI
        // should see the message and decide, not lose the connection.
        const message = e instanceof Error ? e.message : "Tool failed.";
        console.error(`[mcp] tool ${tool.name} threw:`, e);
        return {
          kind: "json",
          status: 200,
          body: rpcResult(id, { content: [{ type: "text", text: `Error: ${message}` }], isError: true }),
        };
      }
    }

    default: {
      const a = await ctx.authenticate("read");
      if (!a.ok) return { kind: "http_error", status: a.status, error: a.error, headers: a.headers };
      return { kind: "json", status: 200, body: rpcError(id, RPC.METHOD_NOT_FOUND, `Method not supported: ${msg.method}`) };
    }
  }
}

/**
 * RFC 9728 Protected Resource Metadata for the EMOS MCP server.
 *
 * Claude reads this (from the 401's resource_metadata pointer, or by probing
 * this exact path) to learn which authorization server to use. Two things
 * matter and both are pinned in src/lib/mcp/config.ts:
 *   - `resource` must equal the connector URL the user typed, path included.
 *   - `authorization_servers[0]` is the only entry Claude uses.
 *
 * Public by design: proxy.ts does not gate /.well-known/*.
 */
import { NextResponse } from "next/server";
import { MCP_ALL_SCOPES, MCP_RESOURCE_URL } from "@/lib/mcp/config";
import { clerkIssuerUrl, METADATA_CORS_HEADERS } from "@/lib/mcp/clerk-issuer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const issuer = clerkIssuerUrl();
  const body = {
    resource: MCP_RESOURCE_URL,
    authorization_servers: [issuer],
    scopes_supported: MCP_ALL_SCOPES,
    bearer_methods_supported: ["header"],
    resource_name: "EMOS Platform",
    resource_documentation: "https://www.syedirfanajmal.com/emos-platform",
    // Mirrors what @clerk/mcp-tools publishes so Clerk-aware clients keep working.
    token_types_supported: ["urn:ietf:params:oauth:token-type:access_token"],
    token_introspection_endpoint: `${issuer}/oauth/token_info`,
    token_introspection_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
    jwks_uri: `${issuer}/.well-known/jwks.json`,
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=3600", ...METADATA_CORS_HEADERS },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: METADATA_CORS_HEADERS });
}

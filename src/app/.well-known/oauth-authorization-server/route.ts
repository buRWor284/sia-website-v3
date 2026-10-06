/**
 * RFC 8414 Authorization Server Metadata, served on the app host as a
 * fallback. Claude normally discovers Clerk directly from the issuer named in
 * the protected-resource document, so this is only reached by clients that
 * probe the MCP server's own origin. It proxies Clerk's live document rather
 * than copying it, so a Clerk dashboard change (scopes, CIMD, DCR) shows up
 * here without a deploy.
 */
import { NextResponse } from "next/server";
import { clerkIssuerUrl, METADATA_CORS_HEADERS } from "@/lib/mcp/clerk-issuer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const issuer = clerkIssuerUrl();
  try {
    const res = await fetch(`${issuer}/.well-known/oauth-authorization-server`, {
      headers: { Accept: "application/json" },
      // Anthropic gives discovery 10 s end to end; never let an upstream stall eat it.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "authorization_server_unavailable", issuer },
        { status: 502, headers: METADATA_CORS_HEADERS },
      );
    }
    const json = await res.json();
    return NextResponse.json(json, {
      headers: { "Cache-Control": "public, max-age=3600", ...METADATA_CORS_HEADERS },
    });
  } catch (e) {
    console.error("[mcp] authorization-server metadata fetch failed:", e);
    return NextResponse.json(
      { error: "authorization_server_unavailable", issuer },
      { status: 502, headers: METADATA_CORS_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: METADATA_CORS_HEADERS });
}

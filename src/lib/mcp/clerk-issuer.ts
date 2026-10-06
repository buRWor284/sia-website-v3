/**
 * Clerk's OAuth issuer (the Frontend API host) for this instance.
 *
 * Derived from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exactly the way
 * @clerk/mcp-tools does it (base64 of the FAPI host after the pk_ prefix),
 * with an explicit env override and a hard fallback to the production host,
 * so a missing key at build time can never publish a wrong issuer.
 */

const FALLBACK_ISSUER = "https://clerk.syedirfanajmal.com";

export function clerkIssuerUrl(): string {
  const override = process.env.CLERK_OAUTH_ISSUER;
  if (override) return override.replace(/\/$/, "");

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) return FALLBACK_ISSUER;
  try {
    const key = pk.replace(/^pk_(test|live)_/, "");
    const normalized = key.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const host = decoded.replace(/\$$/, "");
    return host ? `https://${host}` : FALLBACK_ISSUER;
  } catch {
    return FALLBACK_ISSUER;
  }
}

/** CORS headers for the two public discovery documents (browser MCP clients). */
export const METADATA_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
} as const;

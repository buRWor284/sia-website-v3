/**
 * Shared abuse-protection helpers for the PUBLIC (lead-magnet) AI tool routes
 * (H1, 2026-07-02 review). Extracted from the /api/pitch-score reference
 * implementation so collab-ai / journo-ai use the identical pattern instead
 * of shipping with none.
 */
import type { NextRequest } from "next/server";

/**
 * Spoof-resistant client IP. On Vercel, x-real-ip is set by the platform and
 * cannot be forged by the caller. Fall back to the LAST x-forwarded-for hop
 * (appended by the platform), never the client-controllable first entry.
 */
export function clientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

const MAX_FIELD_CHARS = 600;
const MAX_ARRAY_ITEMS = 20;

/**
 * Per-field char caps for user-supplied tool inputs that get interpolated
 * into LLM prompts. Truncates every string to MAX_FIELD_CHARS, arrays to
 * MAX_ARRAY_ITEMS (strings inside them capped too), and drops nested objects
 * beyond one level. Numbers/booleans pass through.
 */
export function capToolInput(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") {
      out[k] = v.slice(0, MAX_FIELD_CHARS);
    } else if (typeof v === "number" || typeof v === "boolean" || v == null) {
      out[k] = v;
    } else if (Array.isArray(v)) {
      out[k] = v
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => (typeof item === "string" ? item.slice(0, 200) : item));
    }
    // nested objects dropped — no prompt builder needs them
  }
  return out;
}

/**
 * POST /api/gate/verify-code   { email, code, tool? }
 *
 * Step 2 of the unified email gate (Phase P1). Verifies the 6-digit code; on success
 * issues the signed, domain-wide subscriber wristband cookie, couples the newsletter
 * signup (§8.2), and returns { verified: true }.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyCodeAndPromote } from "@/lib/gate/subscribers";
import { setSubscriberCookie } from "@/lib/gate/subscriber-cookie";
import { subscribeNewsletter } from "@/lib/gate/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES: Record<string, string> = {
  expired: "That code expired. Request a new one.",
  attempts: "Too many wrong attempts. Request a new code.",
  mismatch: "That code isn't right. Check and try again.",
  none: "No pending code for this email. Request one.",
  error: "Verification failed. Please try again.",
};

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string; tool?: string };
  try {
    body = (await req.json()) as { email?: string; code?: string; tool?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || "").trim();
  const tool = typeof body.tool === "string" ? body.tool.slice(0, 40) : "unknown";
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  const result = await verifyCodeAndPromote(email, code, tool);
  if (!result.ok) {
    const status = result.reason === "error" ? 500 : 400;
    return NextResponse.json({ error: MESSAGES[result.reason] }, { status });
  }

  const res = NextResponse.json({ verified: true });
  setSubscriberCookie(res, result.id);
  void subscribeNewsletter(email); // §8.2 coupling — unchanged default tag
  return res;
}

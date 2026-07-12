/**
 * POST /api/gate/request-code   { email, tool? }
 *
 * Step 1 of the unified email gate (Phase P1). If the email is ALREADY verified we
 * trust it (Irfan's "trust known emails" decision) — issue the signed wristband
 * immediately and return { verified: true } so the client skips the code step.
 * Otherwise we email a fresh 6-digit code (via Resend) and return { sent: true }.
 *
 * Abuse protection: per-IP rate limit (shared rate_limits table) + per-email resend
 * cooldown. No Turnstile here — the modal has no token and email sends are throttled.
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { clientIp } from "@/lib/public-tool-guard";
import { findVerified, storePendingCode, cooldownRemainingMs } from "@/lib/gate/subscribers";
import { setSubscriberCookie } from "@/lib/gate/subscriber-cookie";
import { generateCode } from "@/lib/gate/codes";
import { subscribeNewsletter } from "@/lib/gate/newsletter";
import { sendCodeEmail } from "@/lib/gate/email";
import { REQUEST_CODE_IP_LIMIT, REQUEST_CODE_IP_WINDOW_MS } from "@/lib/gate/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; tool?: string };
  try {
    body = (await req.json()) as { email?: string; tool?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  // Abuse brake: per-IP cap on code requests (email sends are not free).
  const ip = clientIp(req);
  const rl = await rateLimitDb(`gate-req:${ip}`, { limit: REQUEST_CODE_IP_LIMIT, windowMs: REQUEST_CODE_IP_WINDOW_MS });
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  // Trust known emails (Irfan's decision): issue the wristband now, skip the code.
  const known = await findVerified(email);
  if (known) {
    const res = NextResponse.json({ verified: true });
    setSubscriberCookie(res, known.id);
    void subscribeNewsletter(email); // §8.2 coupling — unchanged default tag
    return res;
  }

  // Per-email resend cooldown (anti-bomb).
  const wait = await cooldownRemainingMs(email);
  if (wait > 0) {
    return NextResponse.json(
      { error: `Please wait ${Math.ceil(wait / 1000)}s before requesting another code.` },
      { status: 429 },
    );
  }

  const code = generateCode();
  if (!(await storePendingCode(email, code))) {
    return NextResponse.json({ error: "Could not start verification. Please try again." }, { status: 500 });
  }
  try {
    await sendCodeEmail(email, code);
  } catch (e) {
    console.error("[gate/request-code] email send failed:", e);
    return NextResponse.json({ error: "Could not send the code email. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ sent: true });
}

/**
 * /api/emos-access-request
 *
 * Receives an EMOS access request (name + email + optional note)
 * and emails it to Syed via Resend.
 *
 * ORPHANED 2026-07-26: /emos-platform/not-invited became a redirect stub and
 * NotInvitedForm.tsx — its only caller — is no longer rendered anywhere. The
 * route was deliberately left in place in case a request-access flow is wanted
 * again, which left a live, unauthenticated, SIA-branded email sender with no
 * caller at all (M1 + M2, 2026-07-02 review).
 *
 * Hardened 2026-07-26: the form was only ever shown to a SIGNED-IN user who had
 * landed without emos_access, so requiring a Clerk session costs the real flow
 * nothing and removes anonymous abuse entirely. Cross-instance rate limit and
 * HTML escaping added alongside, so re-linking it later is safe.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { clientIp } from "@/lib/public-tool-guard";
import { escapeHtml } from "@/lib/escape-html";

const RESEND_API  = "https://api.resend.com/emails";
const TO_EMAILS   = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const FROM_EMAIL  = "EMOS Platform <contact@syedirfanajmal.com>";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Signed-in only: the sole legitimate caller is a logged-in user who reached
  // the platform without access. Anonymous callers get nothing.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to request access." }, { status: 401 });
  }

  const ip = clientIp(req);

  // Keyed on the Clerk user as well as the IP — the account is the thing we can
  // actually trust here, and the DB limiter survives instance recycling.
  const { ok: withinLimit } = await rateLimitDb(`emos-access-request:${userId}:${ip}`, {
    limit: 3,
    windowMs: 60 * 60_000,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. We already have yours." },
      { status: 429 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const { name, email, note } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // Used as Resend's `reply_to` — validate before it reaches the API or the body.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  // M2: user-supplied fields, escaped at every interpolation point.
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; color: #1a1410;">
      <h2 style="margin-bottom: 4px;">New EMOS Access Request</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Submitted from the not-invited page</p>
      <hr style="border: none; border-top: 2px solid #f5b81f; margin: 24px 0;" />
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; width: 80px; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Name</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Email</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>
        ${note ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Note</td><td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;">${escapeHtml(note)}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px; font-size: 13px; color: #888;">Reply directly to reach them at ${escapeHtml(email)}.</p>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAILS,
        reply_to: email,
        subject: `EMOS Access Request: ${name}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      return NextResponse.json({ error: "Failed to send request." }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Resend fetch error:", err);
    return NextResponse.json({ error: "Failed to send request." }, { status: 500 });
  }
}

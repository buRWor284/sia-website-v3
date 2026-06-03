/**
 * /api/emos-apply
 *
 * Receives EMOS application form data and emails it to Syed via Resend.
 * Requires RESEND_API_KEY in environment variables.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const RESEND_API = "https://api.resend.com/emails";
const TO_EMAILS = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const FROM_EMAIL = "EMOS Applications <contact@syedirfanajmal.com>";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // ── Rate limiting ──────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { ok: withinLimit } = rateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Honeypot check ─────────────────────────────────────────
  if (body.website) {
    // Bot filled the hidden field — silently accept to not tip them off
    return NextResponse.json({ success: true, id: "ok" });
  }

  // ── Turnstile verification ─────────────────────────────────
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot verification failed. Please refresh and try again." },
      { status: 403 }
    );
  }

  const { first_name, last_name, email, company, tier, arr_range,
          timeline_to_raise, current_press, what_tried, why_now, message } = body;

  if (!first_name || !last_name || !email || !tier) {
    return NextResponse.json(
      { error: "Missing required fields: first_name, last_name, email, tier" },
      { status: 400 }
    );
  }

  const tierLabel = tier === "accelerate" ? "Accelerate – $3,500" : "Foundation – $2,000";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 640px; color: #1a1410;">
      <h2 style="margin-bottom: 4px;">New EMOS Application</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Received from syedirfanajmal.com/emos/apply</p>
      <hr style="border: none; border-top: 2px solid #f5b81f; margin: 24px 0;" />
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; width: 180px; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Name</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${first_name} ${last_name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Email</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${company ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Company</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${company}</td></tr>` : ""}
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Tier</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${tierLabel}</td>
        </tr>
        ${arr_range ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">ARR Range</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${arr_range}</td></tr>` : ""}
        ${timeline_to_raise ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Timeline to Raise</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${timeline_to_raise}</td></tr>` : ""}
        ${current_press ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Current Press</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${current_press}</td></tr>` : ""}
        ${what_tried ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">What They've Tried</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${what_tried}</td></tr>` : ""}
        ${why_now ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Why Now</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${why_now}</td></tr>` : ""}
        ${message ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #e8e0cc;">Message</td><td style="padding: 10px 12px; border-bottom: 1px solid #e8e0cc;">${message}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px; font-size: 13px; color: #888;">Reply directly to reach the applicant at ${email}.</p>
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
        subject: `EMOS Application: ${first_name} ${last_name} — ${tierLabel}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to send application" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Resend fetch error:", err);
    return NextResponse.json(
      { error: "Failed to send application" },
      { status: 500 }
    );
  }
}

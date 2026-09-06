/**
 * /api/emos-apply
 *
 * Receives EMOS application form data and emails it to Syed via Resend.
 * Requires RESEND_API_KEY in environment variables.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { escapeHtml } from "@/lib/escape-html";

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
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip, req.headers.get("x-turnstile-bypass"));
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot verification failed. Please refresh and try again." },
      { status: 403 }
    );
  }

  const { first_name, last_name, email, company, tier, arr_range,
          timeline_to_raise, current_press, what_tried, why_now, message,
          referral_source, utm_source, utm_medium, utm_campaign, ref, referrer } = body;

  if (!first_name || !last_name || !email || !tier) {
    return NextResponse.json(
      { error: "Missing required fields: first_name, last_name, email, tier" },
      { status: 400 }
    );
  }

  // M2 (2026-07-02 review): the address is used as Resend's `reply_to`, so an
  // unvalidated value both fails the send and lands unchecked in the mail body.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const tierLabel = tier === "accelerate" ? "Accelerate: $3,500" : "Foundation: $2,000";

  // Human-readable labels for the raw <select> values (email readability).
  const ARR_LABELS: Record<string, string> = {
    "pre-revenue": "Pre-revenue",
    "0-500k": "$0 - $500K",
    "500k-1m": "$500K - $1M",
    "1m-3m": "$1M - $3M",
    "3m-10m": "$3M - $10M",
    "10m+": "$10M+",
  };
  const TIMELINE_LABELS: Record<string, string> = {
    "3-months": "Within 3 months",
    "3-6-months": "3 - 6 months",
    "6-12-months": "6 - 12 months",
    "12-plus": "12+ months",
    "not-raising": "Not raising / bootstrapped",
  };
  const arrLabel = arr_range ? (ARR_LABELS[arr_range] || arr_range) : "";
  const timelineLabel = timeline_to_raise ? (TIMELINE_LABELS[timeline_to_raise] || timeline_to_raise) : "";

  // Attribution line for the notification email (e.g. utm_source=yc from the
  // Awan post). Values are attacker-controlled like everything else — escaped
  // at the interpolation point below.
  const attribution = [
    referral_source && `Heard via: ${referral_source}`,
    utm_source && `utm_source=${utm_source}`,
    utm_medium && `utm_medium=${utm_medium}`,
    utm_campaign && `utm_campaign=${utm_campaign}`,
    ref && `ref=${ref}`,
    referrer && `referrer: ${referrer}`,
  ].filter(Boolean).join(" · ");

  // M2: every value below is attacker-controlled (public form) and this mail
  // arrives from Irfan's own domain — escape at each interpolation point.
  const html = `
    <div style="font-family: Georgia, serif; max-width: 640px; color: #1a1410;">
      <h2 style="margin-bottom: 4px;">New EMOS Application</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Received from syedirfanajmal.com/emos-academy/apply</p>
      <hr style="border: none; border-top: 2px solid #f5b81f; margin: 24px 0;" />
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; width: 180px; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Name</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(first_name)} ${escapeHtml(last_name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Email</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>
        ${company ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Company</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(company)}</td></tr>` : ""}
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Tier</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${tierLabel}</td>
        </tr>
        ${arrLabel ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">ARR Range</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(arrLabel)}</td></tr>` : ""}
        ${timelineLabel ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Timeline to Raise</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(timelineLabel)}</td></tr>` : ""}
        ${current_press ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Current Press</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(current_press)}</td></tr>` : ""}
        ${what_tried ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">What They've Tried</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(what_tried)}</td></tr>` : ""}
        ${why_now ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Why Now</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(why_now)}</td></tr>` : ""}
        ${message ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Message</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(message)}</td></tr>` : ""}
        ${attribution ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #F0F0EE;">Attribution</td><td style="padding: 10px 12px; border-bottom: 1px solid #F0F0EE;">${escapeHtml(attribution)}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px; font-size: 13px; color: #888;">Reply directly to reach the applicant at ${escapeHtml(email)}.</p>
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
        subject: `EMOS Application: ${first_name} ${last_name} · ${tierLabel}`,
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

    // Acknowledgment email to the applicant. Best-effort: a failure here must
    // never fail the application itself (awaited, errors swallowed — do NOT
    // fire-and-forget on serverless, the runtime may freeze before it sends).
    try {
      const ackHtml = `
        <div style="font-family: Georgia, serif; max-width: 560px; color: #1a1410; line-height: 1.6;">
          <h2 style="margin-bottom: 4px;">Application received</h2>
          <p>Hi ${escapeHtml(first_name)},</p>
          <p>Thanks for applying to EMOS Academy (${tierLabel}). I read every application personally and will get back to you within 48 hours. If it looks like a fit, my reply will include a Calendly link for a 15-minute call.</p>
          <p>No payment is due at this stage. If anything changes on your side in the meantime, just reply to this email.</p>
          <p style="margin-top: 20px;">Syed Irfan Ajmal<br /><span style="color: #888; font-size: 14px;">EMOS Academy · syedirfanajmal.com/emos-academy</span></p>
        </div>
      `;
      const ackRes = await fetch(RESEND_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Syed Irfan Ajmal <contact@syedirfanajmal.com>",
          to: [email],
          reply_to: "sia@syedirfanajmal.com",
          subject: "Your EMOS Academy application is in. Reply within 48 hours.",
          html: ackHtml,
        }),
      });
      if (!ackRes.ok) {
        console.error("Ack email failed:", ackRes.status, await ackRes.text());
      }
    } catch (ackErr) {
      console.error("Ack email error:", ackErr);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Resend fetch error:", err);
    return NextResponse.json(
      { error: "Failed to send application" },
      { status: 500 }
    );
  }
}

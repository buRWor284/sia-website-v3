/**
 * /api/emos-access-request
 *
 * Receives an EMOS access request (name + email + optional note)
 * and emails it to Syed via Resend.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const RESEND_API  = "https://api.resend.com/emails";
const TO_EMAILS   = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const FROM_EMAIL  = "EMOS Platform <contact@syedirfanajmal.com>";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

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

  // Honeypot
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const { name, email, note } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; color: #1a1410;">
      <h2 style="margin-bottom: 4px;">New EMOS Access Request</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Submitted from the not-invited page</p>
      <hr style="border: none; border-top: 2px solid #f5b81f; margin: 24px 0;" />
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; width: 80px; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Name</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Email</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${note ? `<tr><td style="padding: 10px 12px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f0f0ee;">Note</td><td style="padding: 10px 12px; border-bottom: 1px solid #f0f0ee;">${note}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px; font-size: 13px; color: #888;">Reply directly to reach them at ${email}.</p>
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

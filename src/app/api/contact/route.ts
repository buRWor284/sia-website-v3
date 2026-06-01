/**
 * /api/contact
 *
 * Receives contact-form submissions and sends them to SIA via Resend.
 * Also sends a brief auto-reply to the person who wrote in.
 *
 * Requires RESEND_API_KEY in .env.local (and in Vercel for production).
 */

import { NextRequest, NextResponse } from "next/server";

const RESEND_API = "https://api.resend.com/emails";
const TO_EMAIL = "sia@syedirfanajmal.com";

const FROM_EMAIL = "Syed Irfan Ajmal <contact@syedirfanajmal.com>";

// ─── Validation ──────────────────────────────────────────────

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
  interests: string[];
}

function validate(body: unknown): ContactPayload | string {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const b = body as Record<string, unknown>;

  const name = (b.name as string || "").trim();
  const email = (b.email as string || "").trim();
  const company = (b.company as string || "").trim();
  const message = (b.message as string || "").trim();
  const interests = Array.isArray(b.interests)
    ? (b.interests as string[]).map(s => String(s).trim()).filter(Boolean)
    : [];

  if (!name) return "Name is required.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "A valid email address is required.";
  if (!message) return "Message is required.";

  return { name, email, company, message, interests };
}

// ─── Email HTML builders ─────────────────────────────────────

function buildNotificationHtml(d: ContactPayload): string {
  const interestLine = d.interests.length
    ? `<p><strong>Interested in:</strong> ${d.interests.join(", ")}</p>`
    : "";
  const companyLine = d.company
    ? `<p><strong>Company:</strong> ${d.company}</p>`
    : "";

  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1410;">
  <h2 style="border-bottom: 2px solid #f5b81f; padding-bottom: 12px;">
    New message from syedirfanajmal.com
  </h2>
  <p><strong>From:</strong> ${d.name} &lt;${d.email}&gt;</p>
  ${companyLine}
  ${interestLine}
  <hr style="border: none; border-top: 1px solid #e8e0cc; margin: 20px 0;" />
  <div style="white-space: pre-wrap; line-height: 1.6;">${d.message}</div>
  <hr style="border: none; border-top: 1px solid #e8e0cc; margin: 20px 0;" />
  <p style="font-size: 13px; color: #888;">
    Reply directly to this email to respond to ${d.name}.
  </p>
</div>`;
}

function buildAutoReplyHtml(name: string): string {
  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1410;">
  <h2 style="border-bottom: 2px solid #f5b81f; padding-bottom: 12px;">
    Thanks for reaching out, ${name}.
  </h2>
  <p style="line-height: 1.6;">
    I've received your message and will get back to you within 1–2 business days.
  </p>
  <p style="line-height: 1.6;">
    If it's urgent, feel free to
    <a href="https://calendly.com/sia_dmr_agency/emos" style="color: #1a1410; font-weight: bold;">
      book a discovery call directly</a>.
  </p>
  <p style="margin-top: 24px; line-height: 1.6;">
    — Irfan<br/>
    <span style="font-size: 13px; color: #888;">
      Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist
    </span>
  </p>
</div>`;
}

// ─── Send via Resend ─────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string;
    reply_to?: string;
    subject: string;
    html: string;
  }
) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(err.message || `Resend API error ${res.status}`);
  }

  return res.json();
}

// ─── Handler ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = validate(body);
  if (typeof result === "string") {
    return NextResponse.json({ error: result }, { status: 400 });
  }

  const data = result;

  try {
    // 1. Send notification to SIA
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: TO_EMAIL,
      reply_to: data.email,
      subject: `[syedirfanajmal.com] ${data.name} — ${data.interests[0] || "General inquiry"}`,
      html: buildNotificationHtml(data),
    });

    // 2. Send auto-reply to the visitor
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: data.email,
      subject: "Thanks for reaching out — Syed Irfan Ajmal",
      html: buildAutoReplyHtml(data.name),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact form error:", e);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email directly." },
      { status: 500 }
    );
  }
}

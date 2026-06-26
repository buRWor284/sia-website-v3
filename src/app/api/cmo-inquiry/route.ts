/**
 * /api/cmo-inquiry
 *
 * Receives Fractional CMO inquiry form submissions and sends them to SIA via Resend.
 * Also sends a brief auto-reply to the person who wrote in.
 *
 * Requires RESEND_API_KEY in .env.local (and in Vercel for production).
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const RESEND_API = "https://api.resend.com/emails";
const TO_EMAILS = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const FROM_EMAIL = "Syed Irfan Ajmal <contact@syedirfanajmal.com>";

// ─── Validation ──────────────────────────────────────────────

interface InquiryPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

function validate(body: unknown): InquiryPayload | string {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const b = body as Record<string, unknown>;

  const name    = (b.name    as string || "").trim();
  const email   = (b.email   as string || "").trim();
  const company = (b.company as string || "").trim();
  const message = (b.message as string || "").trim();

  if (!name)    return "Name is required.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "A valid email address is required.";
  if (!message) return "Message is required.";

  return { name, email, company, message };
}

// ─── Email HTML builders ─────────────────────────────────────

function buildNotificationHtml(d: InquiryPayload): string {
  const companyLine = d.company
    ? `<p><strong>Company:</strong> ${d.company}</p>`
    : "";

  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1410;">
  <h2 style="border-bottom: 2px solid #f5b81f; padding-bottom: 12px;">
    New Fractional CMO inquiry — syedirfanajmal.com
  </h2>
  <p><strong>From:</strong> ${d.name} &lt;${d.email}&gt;</p>
  ${companyLine}
  <hr style="border: none; border-top: 1px solid #F0F0EE; margin: 20px 0;" />
  <div style="white-space: pre-wrap; line-height: 1.6;">${d.message}</div>
  <hr style="border: none; border-top: 1px solid #F0F0EE; margin: 20px 0;" />
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
    I've received your message and will get back to you within one working day.
  </p>
  <p style="line-height: 1.6;">
    If you'd rather skip the wait and pick a time directly, you can
    <a href="https://www.syedirfanajmal.com/strategy-call" style="color: #1a1410; font-weight: bold;">
      book a strategy call here</a>.
  </p>
  <p style="margin-top: 24px; line-height: 1.6;">
    — Irfan<br/>
    <span style="font-size: 13px; color: #888;">
      Syed Irfan Ajmal · Fractional CMO &amp; Earned Media Strategist
    </span>
  </p>
</div>`;
}

// ─── Send via Resend ─────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string | string[];
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
    const err = (await res.json().catch(() => ({}))) as { message?: string };
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

  // ── Rate limiting ──────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { ok: withinLimit } = rateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // ── Honeypot check ─────────────────────────────────────────
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true });
  }

  const result = validate(body);
  if (typeof result === "string") {
    return NextResponse.json({ error: result }, { status: 400 });
  }

  const data = result;

  try {
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: TO_EMAILS,
      reply_to: data.email,
      subject: `[Fractional CMO inquiry] ${data.name}${data.company ? ` · ${data.company}` : ""}`,
      html: buildNotificationHtml(data),
    });

    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: data.email,
      subject: "Thanks for reaching out — Syed Irfan Ajmal",
      html: buildAutoReplyHtml(data.name),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CMO inquiry error:", e);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

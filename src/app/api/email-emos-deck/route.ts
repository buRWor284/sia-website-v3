/**
 * /api/email-emos-deck
 *
 * Emails the EMOS Private Founder's Intensive deck summary to a
 * specified recipient. Triggered from the "Email PDF" button in EmosDeck.tsx.
 *
 * Requires RESEND_API_KEY in .env.local (and in Vercel for production).
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { clientIp } from "@/lib/public-tool-guard";

const RESEND_API   = "https://api.resend.com/emails";
const FROM_EMAIL   = "Syed Irfan Ajmal <contact@syedirfanajmal.com>";
const CC_EMAILS    = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const DECK_URL     = "https://www.syedirfanajmal.com/clients/resourcex/emos-deck";

// Generous enough for the real flow (a client emailing themselves the deck,
// mistyping once, retrying) and far below anything useful as a spam relay.
const IP_LIMIT            = 5;
const IP_WINDOW_MS        = 10 * 60_000;   // 5 sends per 10 minutes per IP
const RECIPIENT_LIMIT     = 3;
const RECIPIENT_WINDOW_MS = 60 * 60_000;   // 3 sends per hour per address

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailHtml(): string {
  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1712; background: #ECE8DA;">

  <!-- Masthead -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 3px solid #1a1712; margin-bottom: 0;">
    <tr style="background: #1a1712;">
      <td style="padding: 20px 28px; display: flex; align-items: center; gap: 12px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background: #f5c518; padding: 8px 14px; font-family: Arial,sans-serif; font-weight: 900; font-size: 14px; color: #1a1712; letter-spacing: 0.08em;">EMOS</td>
          <td style="width: 12px;"></td>
          <td style="font-family: Arial,sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(236,232,218,.5);">SIA ENTERPRISES</td>
        </tr></table>
      </td>
    </tr>
  </table>

  <!-- Hero -->
  <div style="background: #1a1712; padding: 36px 28px;">
    <div style="font-family: Arial,sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(236,232,218,.45); margin-bottom: 14px;">
      EARNED MEDIA OPERATING SYSTEM · SIA ENTERPRISES
    </div>
    <h1 style="font-family: Georgia,serif; font-size: 40px; font-weight: 700; line-height: 1.0; letter-spacing: -0.03em; color: #ECE8DA; margin: 0 0 16px;">
      The Private Founder's<br /><em>Intensive</em>
    </h1>
    <div style="font-family: Arial,sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(236,232,218,.45);">
      Prepared for Sajid Shah &nbsp;&middot;&nbsp; ResourceX.io &nbsp;&middot;&nbsp; June 2026
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 28px 28px 0; background: #ECE8DA;">
    <p style="font-size: 16px; line-height: 1.65; margin: 0 0 24px; color: #1a1712;">
      The interactive slide deck for your Private Founder's Intensive — covering the full 8-week program scope,
      curriculum, JournoCollabIQ tool demo, illustrative results, and investment structure — is linked below.
    </p>

    <!-- Summary table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1.5px solid #1a1712; margin-bottom: 24px;">
      <tr style="background: #E4DDC7; border-bottom: 1px solid rgba(26,23,18,.18);">
        <td colspan="2" style="padding: 10px 16px; font-family: Arial,sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(26,23,18,.55);">AT A GLANCE</td>
      </tr>
      ${[
        ["PROGRAM",      "The Private Founder's Intensive — 8-week done-with-you"],
        ["MODULE 01",    "Founder Authority Foundation · 6 weeks · starts now"],
        ["MODULE 02",    "The Announcement Sprint · 2 weeks · on your confirmed date"],
        ["INCLUDED",     "Journo Outreach Checklist, PressIQ [beta], JournoCollabIQ [beta]"],
        ["INVESTMENT",   "$6,000 both phases · or $4,000 now + $2,000 when Sprint fires"],
      ].map(([label, val], i) => `
      <tr style="border-bottom: 1px solid rgba(26,23,18,.12); background: ${i % 2 === 0 ? "#ECE8DA" : "#f4f0e6"};">
        <td style="padding: 10px 16px; font-family: Arial,sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(26,23,18,.55); width: 34%; vertical-align: top;">${label}</td>
        <td style="padding: 10px 16px; font-family: Georgia,serif; font-size: 14px; color: #1a1712;">${val}</td>
      </tr>`).join("")}
    </table>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${DECK_URL}" style="display: inline-block; font-family: Arial,sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; background: #1a1712; color: #ECE8DA; text-decoration: none; padding: 15px 32px;">
        OPEN THE INTERACTIVE DECK →
      </a>
    </div>

    <p style="font-size: 13px; color: rgba(26,23,18,.55); font-style: italic; line-height: 1.5; margin-bottom: 28px;">
      To save as PDF: open the link above and use your browser's print function (Cmd+P or Ctrl+P) → Save as PDF.
    </p>
  </div>

  <!-- Footer -->
  <div style="background: #E4DDC7; border-top: 1.5px solid rgba(26,23,18,.18); padding: 16px 28px;">
    <p style="font-family: Arial,sans-serif; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(26,23,18,.55); margin: 0 0 4px;">
      Syed Irfan Ajmal &nbsp;·&nbsp; sia@syedirfanajmal.com &nbsp;·&nbsp; www.syedirfanajmal.com
    </p>
    <p style="font-family: Georgia,serif; font-style: italic; font-size: 12px; color: rgba(26,23,18,.55); margin: 0;">
      Confidential · Prepared exclusively for Sajid Shah / ResourceX.io · Please do not circulate.
    </p>
  </div>

</div>`;
}

async function sendEmail(apiKey: string, payload: { from: string; to: string | string[]; cc?: string[]; subject: string; html: string }) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || `Resend API error ${res.status}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Server configuration error." }, { status: 500 });

  // ── Rate limiting (M1, 2026-07-02 review) ─────────────────────────────────
  // Unauthenticated route that sends SIA-branded mail to any address the caller
  // supplies, CC'd to Irfan. Old guard: first x-forwarded-for hop (spoofable) +
  // the per-instance in-memory limiter. Now: spoof-resistant IP + cross-instance
  // DB limiter, plus a per-recipient limit so rotating IPs can't email-bomb one
  // victim. Same pattern as /api/email-cmo-pdf.
  const ip = clientIp(request);
  const { ok: withinLimit } = await rateLimitDb(`email-emos-deck:ip:${ip}`, {
    limit: IP_LIMIT,
    windowMs: IP_WINDOW_MS,
  });
  if (!withinLimit) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const to = ((body as Record<string, unknown>)?.to as string || "").trim();
  if (!to || !isValidEmail(to)) return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });

  const { ok: recipientOk } = await rateLimitDb(`email-emos-deck:to:${to.toLowerCase()}`, {
    limit: RECIPIENT_LIMIT,
    windowMs: RECIPIENT_WINDOW_MS,
  });
  // Same message as the IP limit on purpose — never confirm to a stranger that
  // this address has already been mailed.
  if (!recipientOk) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });

  try {
    await sendEmail(apiKey, {
      from: FROM_EMAIL, to, cc: CC_EMAILS,
      subject: "EMOS Private Founder's Intensive · Slide Deck — Syed Irfan Ajmal",
      html: buildEmailHtml(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("email-emos-deck error:", e);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}

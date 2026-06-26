/**
 * /api/email-cmo-pdf
 *
 * Emails the Resourcex × happy.co Fractional CMO Pilot proposal to a
 * specified recipient. Triggered from the "Email as PDF" action bar button
 * on /clients/resourcex/cmo-pilot.
 *
 * Requires RESEND_API_KEY in .env.local (and in Vercel for production).
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const RESEND_API  = "https://api.resend.com/emails";
const FROM_EMAIL  = "Syed Irfan Ajmal <contact@syedirfanajmal.com>";
const CC_EMAILS   = ["sia@syedirfanajmal.com", "syedirfanajmal@gmail.com"];
const PROPOSAL_URL = "https://www.syedirfanajmal.com/clients/resourcex/cmo-pilot";

// ─── Validation ──────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Email HTML ──────────────────────────────────────────────

function buildEmailHtml(): string {
  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1410; background: #FAFAFA;">

  <!-- Masthead -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 3px solid #1a1410; margin-bottom: 0;">
    <tr>
      <td style="padding: 18px 28px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: #f5b81f; padding: 6px 10px; font-family: Arial, sans-serif; font-weight: 900; font-size: 12px; color: #1a1410; letter-spacing: 0.1em;">SIA</td>
            <td style="width: 12px;"></td>
            <td style="font-family: Arial, sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #888;">Syed Irfan Ajmal</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Hero -->
  <div style="background: #1a1410; padding: 32px 28px;">
    <div style="font-family: Arial, sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(250,250,250,.60); margin-bottom: 12px;">
      PILOT PROPOSAL &nbsp;·&nbsp; FRACTIONAL CMO
    </div>
    <h1 style="font-family: Georgia, serif; font-size: 36px; font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; color: #FAFAFA; margin: 0 0 16px;">
      Fractional CMO<br /><em>Pilot</em>
    </h1>
    <div style="font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(250,250,250,.50);">
      Resourcex &times; happy.co &nbsp;&middot;&nbsp; June 2026
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 28px 28px 0;">
    <p style="font-size: 16px; line-height: 1.65; margin: 0 0 20px; color: #1a1410;">
      The one-page engagement outline for the Resourcex &times; happy.co account — covering scope, commitment, retainer, success-fee structure, and pilot terms — is linked below.
    </p>

    <!-- Proposal details summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #1a1410; margin-bottom: 24px;">
      <tr style="background: #F0F0EE; border-bottom: 1px solid #1a1410;">
        <td colspan="2" style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #888;">
          AT A GLANCE
        </td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(26,20,16,.12);">
        <td style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888; width: 40%;">CLIENT</td>
        <td style="padding: 10px 16px; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">Resourcex.io · The happy.co Account</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(26,20,16,.12);">
        <td style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888;">TERM</td>
        <td style="padding: 10px 16px; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">3-month pilot (extendable to 6 months)</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(26,20,16,.12);">
        <td style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888;">COMMITMENT</td>
        <td style="padding: 10px 16px; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">10 hrs / week dedicated to this account</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(26,20,16,.12);">
        <td style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888;">BASE RETAINER</td>
        <td style="padding: 10px 16px; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">USD 3,500 / month</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; font-family: Arial, sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888;">SUCCESS FEE</td>
        <td style="padding: 10px 16px; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">10% of new project revenue (first 12 months)</td>
      </tr>
    </table>

    <!-- CTA button -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${PROPOSAL_URL}"
         style="display: inline-block; font-family: Arial, sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; background: #1a1410; color: #FAFAFA; text-decoration: none; padding: 14px 28px;">
        VIEW THE FULL PROPOSAL →
      </a>
    </div>

    <!-- Print tip -->
    <p style="font-size: 13px; color: #888; font-style: italic; line-height: 1.5; margin-bottom: 28px;">
      To save a PDF copy: open the link above, then use your browser's print function (Cmd+P or Ctrl+P) and choose &ldquo;Save as PDF&rdquo;.
    </p>
  </div>

  <!-- Footer -->
  <div style="background: #F0F0EE; border-top: 1px solid rgba(26,20,16,.15); padding: 16px 28px;">
    <p style="font-family: Arial, sans-serif; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin: 0 0 4px;">
      Syed Irfan Ajmal &nbsp;·&nbsp; sia@syedirfanajmal.com &nbsp;·&nbsp; www.syedirfanajmal.com
    </p>
    <p style="font-family: Georgia, serif; font-style: italic; font-size: 12px; color: #888; margin: 0;">
      This document is confidential. Prepared exclusively for Sajid Shah / Resourcex.io.
    </p>
  </div>

</div>`;
}

// ─── Send via Resend ─────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string | string[];
    cc?: string[];
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

  // ── Rate limiting ─────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { ok: withinLimit } = rateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const to = ((body as Record<string, unknown>)?.to as string || "").trim();
  if (!to || !isValidEmail(to)) {
    return NextResponse.json(
      { error: "A valid recipient email is required." },
      { status: 400 }
    );
  }

  try {
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to,
      cc: CC_EMAILS,
      subject: "Fractional CMO Pilot Offer · Resourcex × happy.co — Syed Irfan Ajmal",
      html: buildEmailHtml(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("email-cmo-pdf error:", e);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}

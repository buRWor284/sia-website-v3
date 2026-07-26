/**
 * /api/emos-send-invite
 *
 * Creates a Clerk invitation with emos_access: true pre-set in public_metadata,
 * then sends a branded invite email via Resend (bypassing Clerk's default email).
 *
 * Requires "Delivered by Clerk" to be DISABLED in Clerk Dashboard →
 * Configure → Emails → Invitation, so Clerk doesn't send a duplicate.
 *
 * Protected: only callable when signed in as admin (Irfan).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["syedirfanajmal@gmail.com", "sia@syedirfanajmal.com"];
const RESEND_API   = "https://api.resend.com/emails";
const FROM_EMAIL   = "EMOS Platform <contact@syedirfanajmal.com>";

function buildInviteEmail(inviteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to EMOS</title>
</head>
<body style="margin:0;padding:0;background:#f1ebde;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1ebde;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-family:Arial,sans-serif;font-weight:900;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#f5b81f;">
                EMOS PLATFORM
              </span>
            </td>
          </tr>

          <!-- Hero block -->
          <tr>
            <td style="background:#1a1410;padding:40px 40px 36px;">
              <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#f5b81f;margin:0 0 20px;">
                Your access is ready
              </p>
              <h1 style="font-family:Georgia,serif;font-weight:700;font-size:28px;line-height:1.2;letter-spacing:-0.02em;color:#f1ebde;margin:0 0 16px;">
                You're in.<br/>Welcome to EMOS.
              </h1>
              <p style="font-family:Georgia,serif;font-style:italic;font-size:15px;line-height:1.6;color:rgba(241,235,222,0.65);margin:0;">
                You've been granted access to the EMOS Tools Suite — the system serious founders use to earn media coverage, build authority, and get cited by AI.
              </p>
            </td>
          </tr>

          <!-- What you get -->
          <tr>
            <td style="background:#fff8ee;padding:36px 40px 28px;border-left:1px solid rgba(26,20,16,.10);border-right:1px solid rgba(26,20,16,.10);">
              <p style="font-family:Arial,sans-serif;font-weight:900;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(26,20,16,.45);margin:0 0 20px;">
                What's inside
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia,serif;font-size:18px;color:#f5b81f;padding-top:1px;">◎</td>
                  <td>
                    <strong style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">SignalIQ</strong><br/>
                    <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.6);line-height:1.5;">Spots breaking news and trending topics where your expert POV fits — so you pitch at the right moment, not after the story's dead.</span>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia,serif;font-size:18px;color:#f5b81f;padding-top:1px;">◆</td>
                  <td>
                    <strong style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">PressIQ</strong><br/>
                    <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.6);line-height:1.5;">Scores your pitch before you send it — flags weak angles, missing proof, and editor red flags. Know it'll land before it leaves your inbox.</span>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia,serif;font-size:18px;color:#f5b81f;padding-top:1px;">◈</td>
                  <td>
                    <strong style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">AssetIQ</strong><br/>
                    <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.6);line-height:1.5;">Builds the linkable assets — data reports, original research, expert frameworks — that journalists actually want to cite and editors trust.</span>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia,serif;font-size:18px;color:#f5b81f;padding-top:1px;">◇</td>
                  <td>
                    <strong style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">JournoCollabIQ</strong><br/>
                    <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.6);line-height:1.5;">Finds journalists covering your beat and generates personalised outreach — built around their stories, not your press release.</span>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
                <tr>
                  <td width="32" valign="top" style="font-family:Georgia,serif;font-size:18px;color:#f5b81f;padding-top:1px;">▣</td>
                  <td>
                    <strong style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#1a1410;text-transform:uppercase;letter-spacing:0.06em;">CoverageIQ</strong><br/>
                    <span style="font-family:Georgia,serif;font-size:13px;color:rgba(26,20,16,.6);line-height:1.5;">Tracks your pitches, follows up at the right time, and turns coverage into AI citations — so your name shows up when people search your category.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#1a1410;padding:32px 40px 36px;text-align:center;">
              <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(241,235,222,0.55);margin:0 0 24px;line-height:1.5;">
                This invitation expires in 30 days. Create your account now and start building your earned media system.
              </p>
              <a href="${inviteUrl}" style="display:inline-block;background:#f5b81f;color:#1a1410;font-family:Arial,sans-serif;font-weight:900;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
                Accept Invitation →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;">
              <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(26,20,16,.35);letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px;">
                EMOS Platform · syedirfanajmal.com
              </p>
              <p style="font-family:Georgia,serif;font-size:12px;color:rgba(26,20,16,.35);margin:0;line-height:1.5;">
                If the button above doesn't work, copy and paste this link into your browser:<br/>
                <span style="color:rgba(26,20,16,.5);">${inviteUrl}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Must be signed in
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secretKey   = process.env.CLERK_SECRET_KEY;
  const resendKey   = process.env.RESEND_API_KEY;
  if (!secretKey || !resendKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Verify caller is admin
  const userRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Could not verify identity" }, { status: 500 });
  }
  const userData    = await userRes.json();
  const callerEmail = userData.email_addresses?.[0]?.email_address;
  if (!ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Create Clerk invitation — emos_access copied to publicMetadata at sign-up
  const inviteRes = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      public_metadata: { emos_access: true },
      redirect_url: "https://www.syedirfanajmal.com/emos-platform/signup",
    }),
  });

  if (!inviteRes.ok) {
    const err     = await inviteRes.json();
    const message = err?.errors?.[0]?.long_message ?? "Failed to create invitation";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const inviteData = await inviteRes.json();
  const inviteUrl  = inviteData?.url as string | undefined;

  if (!inviteUrl) {
    return NextResponse.json({ error: "Clerk did not return an invitation URL" }, { status: 502 });
  }

  // Send branded email via Resend
  const emailRes = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      [email],
      subject: "You're invited to EMOS — accept within 30 days",
      html:    buildInviteEmail(inviteUrl),
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.json();
    console.error("Resend error:", err);
    // Invitation was created successfully; email failure is non-fatal but worth logging
    return NextResponse.json({ success: true, warning: "Invitation created but email failed to send." });
  }

  return NextResponse.json({ success: true });
}

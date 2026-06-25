/**
 * /api/emos-send-invite
 *
 * Creates a Clerk invitation with emos_access: true pre-set in public_metadata.
 * Clerk automatically copies invitation metadata to the user's profile at
 * sign-up time — synchronously, before any redirect — eliminating the race
 * condition where the webhook fires too late.
 *
 * Protected: only callable when signed in as admin (Irfan).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ADMIN_EMAIL = "syedirfanajmal@gmail.com";

export async function POST(req: NextRequest) {
  // Must be signed in
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Must be the admin
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Verify caller is admin by fetching their email from Clerk
  const userRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Could not verify identity" }, { status: 500 });
  }
  const userData = await userRes.json();
  const callerEmail = userData.email_addresses?.[0]?.email_address;
  if (callerEmail !== ADMIN_EMAIL) {
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

  // Create invitation with emos_access pre-set — Clerk copies this to
  // publicMetadata automatically when the user completes sign-up
  const inviteRes = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      public_metadata: { emos_access: true },
      redirect_url: `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up"}`,
    }),
  });

  if (!inviteRes.ok) {
    const err = await inviteRes.json();
    const message = err?.errors?.[0]?.long_message ?? "Failed to send invitation";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

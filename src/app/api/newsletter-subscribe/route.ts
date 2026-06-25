/**
 * /api/newsletter-subscribe
 *
 * Adds a subscriber to the SIA Wire Mailchimp list and tags them with "collabiq".
 * Requires MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID in .env.local
 *
 * POST body: { "email": "user@example.com" }
 * Response:  { "success": true } | { "error": "message" }
 */

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.MAILCHIMP_API_KEY || "";
const LIST_ID = process.env.MAILCHIMP_LIST_ID || "";

// Mailchimp API server is derived from the last portion of the API key (e.g. us21)
function getServer(apiKey: string): string {
  return apiKey.split("-").pop() || "us1";
}

export async function POST(req: NextRequest) {
  try {
    const { email, tag } = await req.json() as { email?: string; tag?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Optional segmentation tag from the caller; defaults to the original CollabIQ tag.
    const tags = tag && /^[a-z0-9_-]+$/i.test(tag) ? [tag] : ["collabiq"];

    // If Mailchimp is not configured, succeed silently (dev / missing env)
    if (!API_KEY || !LIST_ID) {
      console.warn("[newsletter-subscribe] MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID not set — skipping.");
      return NextResponse.json({ success: true });
    }

    const server = getServer(API_KEY);
    const url    = `https://${server}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

    const body = JSON.stringify({
      email_address: email,
      status:        "subscribed",
      tags,
    });

    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
      },
      body,
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }

    const data = await res.json() as { title?: string; detail?: string };

    // 400 "Member Exists" is fine — they're already subscribed
    if (res.status === 400 && data.title === "Member Exists") {
      return NextResponse.json({ success: true });
    }

    console.error("[newsletter-subscribe] Mailchimp error:", data);
    return NextResponse.json({ error: data.detail || "Subscription failed." }, { status: 500 });

  } catch (err) {
    console.error("[newsletter-subscribe] Unexpected error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

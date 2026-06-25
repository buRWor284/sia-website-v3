/**
 * /api/pitch-tier
 *
 * Sets the email-tier cookie (`pp_tier`) after the PressIQ email gate is submitted.
 * The value is signed (see lib/pitch/tier-cookie.ts) so it can't be hand-forged to
 * lift the monthly cap. httpOnly — the client never needs to read it; the score
 * route reads + verifies it server-side.
 */
import { NextResponse } from "next/server";
import { signTier } from "@/lib/pitch/tier-cookie";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pp_tier", signTier(), {
    path: "/",
    maxAge: ONE_YEAR,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

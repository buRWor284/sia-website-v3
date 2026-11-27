// /go — click tracking for links in Irfan's own emails (SIA Read Receipts extension).
//
// The extension rewrites each link in a tracked email to
//   https://www.syedirfanajmal.com/go?e=<emailId>&u=<original url>&s=<signature>
// This route checks the signature (so nobody can use /go to send people to
// arbitrary sites), records the click in the "SIA Read Receipts" Apps Script,
// and sends the reader on to the original URL with a 302.
//
// Env vars (Vercel → Project → Settings → Environment Variables, Production):
//   READ_RECEIPT_KEY         the same password word as EXTENSION_KEY in the Apps Script
//   READ_RECEIPT_SCRIPT_URL  the Apps Script web app link ending in /exec

import { NextRequest, NextResponse, after } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOME = "https://www.syedirfanajmal.com/";
const EMAIL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Link checkers and crawlers: still redirected, but not counted as a click.
const BOT_UA = /bot|crawl|spider|slurp|preview|scanner|python|curl|wget|headless|facebookexternalhit|linkedinbot|whatsapp|skypeuripreview|proofpoint|mimecast|barracuda/i;

// Must match SIA_HMAC.sign() in the extension's sha256.js.
function signLink(key: string, emailId: string, url: string): string {
  return createHmac("sha256", key).update(`${emailId}|${url}`).digest("base64url").slice(0, 22);
}

function validSignature(key: string, emailId: string, url: string, sig: string): boolean {
  const expected = Buffer.from(signLink(key, emailId, url));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function resolve(req: NextRequest): { dest: string; original: string; emailId: string } | null {
  const p = req.nextUrl.searchParams; // already decoded by Next; do not decode again
  const emailId = p.get("e") ?? "";
  const url = p.get("u") ?? "";
  const sig = p.get("s") ?? "";
  const key = process.env.READ_RECEIPT_KEY;
  if (!key || !EMAIL_ID.test(emailId) || !sig) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (!validSignature(key, emailId, url, sig)) return null;
  // parsed.href is the web-safe (percent-encoded, punycode) form, so non-English links
  // (e.g. Arabic) are valid in the Location header. The signature is checked on `url` as sent.
  return { dest: parsed.href, original: url, emailId };
}

export async function GET(req: NextRequest) {
  const hit = resolve(req);
  if (!hit) return noStore(NextResponse.redirect(HOME, 302));

  const script = process.env.READ_RECEIPT_SCRIPT_URL;
  const key = process.env.READ_RECEIPT_KEY;
  const ua = req.headers.get("user-agent") ?? "";
  if (script && key && !BOT_UA.test(ua)) {
    const logUrl = `${script}?${new URLSearchParams({ action: "click", key, id: hit.emailId, u: hit.original })}`;
    // after(): runs once the redirect has been sent, so the reader never waits,
    // and Vercel keeps the function alive until the log call finishes.
    after(async () => {
      try {
        await fetch(logUrl, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      } catch (err) {
        console.error("[go] click log failed", err);
      }
    });
  }

  return noStore(NextResponse.redirect(hit.dest, 302));
}

// Link checkers often send HEAD first: redirect, but never count it.
export async function HEAD(req: NextRequest) {
  const hit = resolve(req);
  return noStore(NextResponse.redirect(hit ? hit.dest : HOME, 302));
}

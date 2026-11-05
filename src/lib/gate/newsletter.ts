/**
 * Adds an email to the SIA Wire Mailchimp list (Phase P1 gate coupling).
 * Mirrors /api/newsletter-subscribe, kept as a lib so the gate routes can couple
 * newsletter signup to verification without an internal HTTP hop. Never throws;
 * silently no-ops if Mailchimp env is absent (dev). §8.2 decision: newsletter stays
 * coupled to unlocking.
 *
 * Callers MUST await it (2026-11-05): a fire-and-forget call is dropped when Vercel
 * freezes the function after the response is sent, so gate signups never reached
 * Mailchimp. Each call is capped at 4s so a slow Mailchimp can't stall the unlock.
 */
import { createHash } from "crypto";

/** Gate tool id → readable Mailchimp tag, so each subscriber shows which tool they came from. */
const TOOL_TAGS: Record<string, string> = {
  pciq: "partnercollabiq",
  jciq: "journocollabiq",
  signaliq: "signaliq",
  pressiq: "pressiq",
};

export function toolTag(tool?: string): string | undefined {
  return tool ? TOOL_TAGS[tool] : undefined;
}

const TIMEOUT_MS = 4000;

const API_KEY = process.env.MAILCHIMP_API_KEY || "";
const LIST_ID = process.env.MAILCHIMP_LIST_ID || "";

function server(apiKey: string): string {
  return apiKey.split("-").pop() || "us1";
}

export async function subscribeNewsletter(email: string, tag?: string): Promise<void> {
  if (!API_KEY || !LIST_ID) {
    console.warn("[gate/newsletter] Mailchimp not configured — skipping.");
    return;
  }
  const tags = tag && /^[a-z0-9_-]+$/i.test(tag) ? [tag] : ["collabiq"];
  const base = `https://${server(API_KEY)}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
  };
  try {
    const res = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, status: "subscribed", tags }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { title?: string };
      if (res.status === 400 && data.title === "Member Exists") {
        // Already on the list: just add this tool's tag. Status is left alone,
        // so someone who unsubscribed stays unsubscribed.
        const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
        const t = await fetch(`${base}/${hash}/tags`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tags: tags.map(name => ({ name, status: "active" })) }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!t.ok) console.error("[gate/newsletter] Mailchimp tag error:", await t.json().catch(() => ({})));
      } else {
        console.error("[gate/newsletter] Mailchimp error:", data);
      }
    }
  } catch (e) {
    console.error("[gate/newsletter] unexpected:", e);
  }
}

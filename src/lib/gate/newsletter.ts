/**
 * Adds an email to the SIA Wire Mailchimp list (Phase P1 gate coupling).
 * Mirrors /api/newsletter-subscribe, kept as a lib so the gate routes can couple
 * newsletter signup to verification without an internal HTTP hop. Fire-and-forget;
 * silently no-ops if Mailchimp env is absent (dev). §8.2 decision: newsletter stays
 * coupled to unlocking.
 */
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
  try {
    const res = await fetch(`https://${server(API_KEY)}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({ email_address: email, status: "subscribed", tags }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { title?: string };
      // "Member Exists" is fine — already subscribed.
      if (!(res.status === 400 && data.title === "Member Exists")) {
        console.error("[gate/newsletter] Mailchimp error:", data);
      }
    }
  } catch (e) {
    console.error("[gate/newsletter] unexpected:", e);
  }
}

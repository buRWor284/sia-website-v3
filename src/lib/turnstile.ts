/**
 * Server-side Cloudflare Turnstile token verification.
 *
 * Requires TURNSTILE_SECRET_KEY in environment variables.
 * Returns true if valid, false if invalid or if the key isn't set
 * (so forms still work in dev without Turnstile configured — just
 * logs a warning).
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      "TURNSTILE_SECRET_KEY not set — skipping Turnstile verification. " +
        "Set it in .env.local and Vercel to enable bot protection."
    );
    return true; // allow in dev
  }

  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}

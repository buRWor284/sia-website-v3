/**
 * Server-side Cloudflare Turnstile token verification.
 *
 * Requires TURNSTILE_SECRET_KEY in environment variables.
 * Returns true if valid, false if invalid or if the key isn't set
 * (so forms still work in dev without Turnstile configured — just
 * logs a warning).
 *
 * Testing bypass: if TURNSTILE_TEST_BYPASS_SECRET is set in the
 * environment, a request that sends a matching value in the
 * `x-turnstile-bypass` header skips the real Cloudflare check entirely.
 * This is for Irfan (and Claude, doing automated/scripted testing on
 * his behalf) to test forms and API routes without needing a real
 * browser-issued Turnstile token. Nobody without the secret can use
 * this — every other request still goes through full verification.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null,
  bypassHeader?: string | null
): Promise<boolean> {
  const bypassSecret = process.env.TURNSTILE_TEST_BYPASS_SECRET;
  if (bypassSecret && bypassHeader && bypassHeader === bypassSecret) {
    console.warn("Turnstile verification bypassed via x-turnstile-bypass secret.");
    return true;
  }

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

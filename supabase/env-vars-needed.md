# New env var needed in Vercel

Add this to your Vercel project → Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → **service_role** key (the long one, NOT the anon key) |

**Important:** This is a secret key. Never expose it in browser code. It's only used server-side (API routes and Server Actions) to bypass RLS when saving PressIQ scores and SignalIQ signals.

Once added, redeploy for it to take effect.


---

## Unified Gate (P1) — added 2026-07-11

Run the migration `src/lib/gate/gate.sql` once in the Supabase SQL editor, then add:

| Variable | Where to get it |
|---|---|
| `SUBSCRIBER_COOKIE_SECRET` | Generate a long random string (e.g. `openssl rand -base64 32`). Signs the domain-wide subscriber "wristband" cookie. Falls back to `PITCH_TIER_SECRET` if unset, but set a dedicated one in prod. |

Already required and reused by the gate (no action if they're already set): `RESEND_API_KEY` (sends the 6-digit code email), `MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID` (newsletter coupling), `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`.

Redeploy after adding.

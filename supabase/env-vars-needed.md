# New env var needed in Vercel

Add this to your Vercel project → Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → **service_role** key (the long one, NOT the anon key) |

**Important:** This is a secret key. Never expose it in browser code. It's only used server-side (API routes and Server Actions) to bypass RLS when saving PressIQ scores and SignalIQ signals.

Once added, redeploy for it to take effect.

# FactcheckIQ always-on worker (Fix B)

A plain Node process that processes FULL audits start to finish with no time
limit. Runs 24/7 on Railway; the website stays on Vercel. See
FactcheckIQ-FixB-Spec.md for the full design.

## Run locally (safe while FACTCHECK_ENGINE is unset)

    npm run worker

Reads the same env names as the Vercel app. Without FACTCHECK_ENGINE=worker on
this host it idles and processes nothing.

## Railway service settings

- Deploy from GitHub repo buRWor284/sia-website-v3
- Build command: npm install
- Start command: npm run worker
- Watch paths (optional): worker/** and src/lib/factcheck/**
- Restart policy: always

## Required variables (Railway dashboard, Variables tab)

- ANTHROPIC_API_KEY (use the dedicated FactcheckIQ workspace key)
- NEXT_PUBLIC_SUPABASE_URL (same value as Vercel)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (same value as Vercel; fallback only)
- SUPABASE_SERVICE_ROLE_KEY (same value as Vercel)
- FACTCHECK_PER_CLAIM_TIMEOUT_MS = 240000 (worker host only; never on Vercel)
- FACTCHECK_ENGINE = worker (set at cutover, phase B2, not before)
- FACTCHECK_MONTHLY_CLAIM_ALLOWANCE (only if it is also set on Vercel; keep equal)

## Cutover and rollback

Cutover (B2): set FACTCHECK_ENGINE=worker on BOTH Railway and Vercel (Vercel
needs a redeploy). Rollback: remove it on both (Vercel first). Both engines
claim runs through the same atomic lease, so a brief mixed state cannot
double-process a run.

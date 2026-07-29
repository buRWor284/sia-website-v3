<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: syedirfanajmal.com + EMOS Platform

**Repo:** github.com/buRWor284/sia-website-v3
**Live site:** www.syedirfanajmal.com (Next.js App Router, React, Tailwind v4, Vercel)
**Full spec:** `EMOS-Platform-RFP.md` (workspace root — read this first)

---

## Two parallel tracks

### Track 1 — Public marketing site
Largely complete. Remaining: ~39 podcast episodes to publish, Resources section content pages.

### Track 2 — EMOS Platform
Multi-tenant SaaS at `/emostool/*`. Authenticated via Clerk. Data in Supabase.

---

## EMOS workflow (5-stage, updated June 2026)

```
SignalIQ → AssetIQ → JournoCollabIQ → PressIQ → CoverageIQ
```

1. **SignalIQ** — detect newsworthy story gaps from open data
2. **AssetIQ** — build a linkable asset (report, calculator, quiz, mini-SaaS) around the signal
3. **JournoCollabIQ** — research journalists who'd care about this asset
4. **PressIQ** — score and craft the pitch, informed by asset + journalist context
5. **CoverageIQ** — track pitches from drafted → amplified, log placements

**Two-track model:** Public tools at `/tools/*` are free lead magnets (rate-limited, no persistence). Platform tools at `/emostool/dashboard/*` are authenticated clones with full persistence, cross-tool data flow, and no rate limits.

**Soft progression:** All tools always accessible. Stage bar on dashboard shows progress and recommended next steps. No hard gating.

---

## What's built (as of June 2026)

### Auth + DB (Phase 1 ✅)
- Clerk auth protecting `/emostool/*`
- Supabase with full schema, RLS, `get_current_org_id()` with Clerk sub fallback
- SIA org + Irfan's user seeded
- `SUPABASE_SERVICE_ROLE_KEY` env var required in Vercel for server-side writes

### Platform tools (Phases 2–8 ✅)
Pipeline order: SignalIQ → AssetIQ → JournoCollabIQ → PressIQ → CoverageIQ

- `/emostool/dashboard` — unified pipeline view: one card per tool in order, live data counts, "you are here" banner
- `/emostool/dashboard/signaliq` — full scan, startup context re-ranking, "Save to EMOS →", "Build asset →" → AssetIQ
- `/emostool/dashboard/assetiq` — linkable asset tracker: create from signal, type/status/keyword, "Find journalists →" → JournoCollabIQ; AI-assisted brief drafting via `asset-brief` API
- `/emostool/dashboard/journocollabiq` — journalist CRM: table with DR/pitches/placements, add/edit/delete, "Score a pitch →" → PressIQ (passes assetTitle/assetType/assetIdea)
- `/emostool/dashboard/pressiq` — full scorer, reads ?beat= + ?assetTitle/Type/Idea from URL, asset context banner, "Track this pitch →" → CoverageIQ (passes ?pitch= query)
- `/emostool/dashboard/coverageiq` — full pipeline (pitches, contacts, coverage log, PESO, alerts); PipelineNav at bottom; auto-opens New Pitch modal with prefilled subject when arriving from PressIQ
- All tools have PipelineNav footer showing position + "Next step" CTA with full context handoff

### Cross-tool context handoffs (Phase 7 ✅)
- SignalIQ → AssetIQ: signal data passed via URL
- AssetIQ → JournoCollabIQ: asset context passed
- JournoCollabIQ → PressIQ: ?assetTitle/Type/Idea in URL; PressIQ shows amber asset context banner
- PressIQ → CoverageIQ: ?pitch= (top scored pitch query, truncated to 200 chars); CoverageIQ auto-opens New Pitch modal prefilled

### SignalIQ coverage refresh (cron)
- **Vercel Cron:** `/api/signaliq/refresh-coverage` fires daily at 02:00 UTC (`vercel.json`)
- **GitHub Actions:** `.github/workflows/signaliq-coverage-refresh.yml` fires every 30 minutes as a supplement; hits the same endpoint with `CRON_SECRET`
- Rotates through 120 preset seeds (6 beats × 20), batch size 2, GDELT rate-limited at 5.2s between calls
- Cursor persists in Supabase; full cycle completes in ~12 hours (Vercel) or ~6 hours (GHA)
- **Testing:** trigger manually from GitHub Actions → workflow_dispatch, or hit the endpoint directly with `Authorization: Bearer <CRON_SECRET>`

### Server actions
- `src/app/emostool/actions/coverageiq.ts` — createPitch, updatePitchStage, createJournalist, updateJournalist, deleteJournalist, getAlerts, updateAlertStatus
- `src/app/emostool/actions/signaliq.ts` — saveSignalFromOpportunity, saveSignalFromScan, getSignals, updateSignalStatus
- `src/app/emostool/actions/stage.ts` — recordStageEvent, getOrgStage (async functions only — no object exports)
- `src/lib/emos-stage-config.ts` — STAGE_META, STAGE_ORDER, EmosStage type (plain file, safe to import anywhere)

### Authenticated API routes (platform-only, no rate limit)
- `src/app/api/emos-platform/signaliq/scan/route.ts` — Clerk auth, no Turnstile, same scanBeat() as public
- `src/app/api/emos-platform/pitch-score/route.ts` — Clerk auth, no rate limit, always stores, same scoring logic as public
- `src/app/api/emos-platform/asset-brief/route.ts` — Clerk auth, generates AI asset brief from signal context

### Key files
- `src/lib/supabase.ts` — createSupabaseServerClient (Clerk JWT), createSupabaseServiceClient (service role)
- `src/lib/pitch/log.ts` — saves PressIQ scores to Supabase on every analysis
- `src/components/emos-platform/` — platform client components (SignalIQPlatformClient, PressIQPlatformClient, JournoCollabIQClient)
- `supabase/fix-rls-function.sql` — run this in Supabase if RLS isn't resolving
- `supabase/seed-coverageiq.sql` — seed data for SIA org

---

## What's next (Phase 9+)

### Phase 9 — Billing (Stripe, D-9)
- Not started. Requires a conversation before work begins.

### AssetIQ AI-assisted creation (sub-task of Phase 6, partially done)
- `asset-brief` API route exists; UI flow for drafting survey questions / report outlines / calculator specs from a signal is pending

---

## Git workflow
- Single maintainer. Commit directly to main.
- Sandbox environment cannot push (proxy restriction) — always provide exact git commands for user to run locally.
- Stale `.git/index.lock` / `.git/HEAD.lock` files appear frequently — user deletes manually with `rm`.

## FactcheckIQ (as of 29 Jul 2026)

Authenticated EMOS tool. Engine lives in `src/lib/factcheck/`, routes under `src/app/api/emos-platform/factcheck/`, client is `src/components/emos-platform/FactcheckIQClient.tsx`. Supabase tables `fact_check_runs` / `fact_check_claims`.

**Two engines, selected by the `FACTCHECK_ENGINE` env var.**
- Unset or `vercel` (CURRENT, and the deliberate fail-safe default): full audits run on Vercel in 300-second windows, checkpointing to Supabase and resuming via the status-route poll and an every-minute cron. Bounded by `MAX_CONTINUATIONS` (6) and `RUN_ABSOLUTE_MAX_MS` (45 min).
- `worker`: full audits queue for an always-on Railway worker (`worker/index.ts`) that processes each run start to finish with no time limit. **The code is deployed and live but DORMANT.** Nothing runs it until the flag is set on both Vercel and Railway. Turning it on costs about $5/month of hosting and is deferred until FactcheckIQ has paying users.

**`MAX_CLAIMS_PER_RUN` is 20, and that number is load-bearing.** It is sized to what the Vercel engine can finish, not what it can start: measured wall clock is roughly 30 to 60 seconds per claim, so 20 claims is about 17 minutes against a 45-minute backstop. Do not raise it without either moving to the worker engine or re-measuring. Claims beyond the cap are reported as unchecked, never silently dropped.

**Hard guardrails. Do not touch these while reliability work is in flight:**
- `grade.ts` (especially `clampVerdict`), `prompts.ts`, and `verify.ts` are off limits. They encode verdict calibration and the fabrication guards, which are the product. Reliability and infra changes must not alter what a verdict means.
- Verify calls cost real money (Anthropic, roughly $0.12 per claim on the current Opus grader). Never double-drive a run: both engines claim work through the same `lease_until` compare-and-swap, and that invariant must hold.

**Known open items:** the finalize write in `run.ts` drops `progress.attempts`, so completed runs cannot be traced back to how many windows they took (correctness is fine, forensics are not). Five of nine claims in the 29 Jul canary rendered "No evidence summary returned by the grader." in the report table, including the fabricated one. Both are logged and deliberately deferred, since fixing the second means touching guardrailed files.

## Critical rules
- `"use server"` files may ONLY export async functions. No object exports, no type re-exports. Types live in `src/lib/emos-stage-config.ts`.
- Always fetch `org_id` from the `organizations` table before any INSERT — never rely on RLS to inject it.
- Use `createSupabaseServiceClient()` in API routes and background jobs. Use `createSupabaseServerClient(token)` in Server Actions with Clerk JWT.
- Do NOT make unsolicited UI/UX changes to public tools at `/tools/*`. They are lead magnets and should stay as-is.

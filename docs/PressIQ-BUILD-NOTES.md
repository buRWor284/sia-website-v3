# PressIQ — MVP build notes

Status: **MVP built and typechecked.** Deterministic core unit-tested. AI path wired to the repo's existing Anthropic pattern (needs `ANTHROPIC_API_KEY` to run live). Full spec: `docs/PressIQ-RFP.md`.

## What shipped

| File | Purpose |
|---|---|
| `src/lib/pitch/types.ts` | Shared types (PitchInput, metrics, AI shape, ScoreResponse). |
| `src/lib/pitch/config.ts` | **Single source of truth** — weights, Layer-1 bands, 34-pt checklist, tiers, platforms, EVIDENCE map. Tune scoring here. |
| `src/lib/pitch/metrics.ts` | Layer 1 (deterministic, no AI): word count, Flesch–Kincaid, subject length, question count, subjectivity proxy. Pure functions; run client + server. |
| `src/lib/pitch/scorePrompt.ts` | LLM system+user prompt and the **tool-use JSON schema** for Layers 2–3 + Relevance; strict parser. |
| `src/lib/pitch/composite.ts` | Weighted roll-up → 0–100 score + tier; no-query weight redistribution; ranks the 3 highest-leverage fixes. |
| `src/lib/pitch/feedback.ts` | The EMOS-teaching copy engine — templated mechanism frames (narrative transportation, oxytocin, System 1, E-E-A-T…) + essay deep-links. |
| `src/lib/pitch/log.ts` | Pitch logging for the outcome flywheel (console stub; TODO: Postgres). |
| `src/app/api/pitch-score/route.ts` | API route — clones `api/collab-ai` (direct fetch, no SDK). Gating + Turnstile + Layer-1 recompute + one AI call + compose + log. |
| `src/app/tools/pressiq/page.tsx` | UI (Bureau light theme). Inputs + **live Layer-1 meters** + Analyze + results (composite meter, tier, breakdown, top fixes, EMOS CTA, email unlock, share). |

## Run it

```bash
npm run dev          # then open http://localhost:3000/tools/pressiq
```

Live mechanics meters work with **no** key. The "Analyze pitch" button needs `ANTHROPIC_API_KEY` in `.env.local` (same key `api/collab-ai` already uses).

### Env vars

| Var | Required | Default / note |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes (for Analyze) | already in use by `api/collab-ai` |
| `PITCH_SCORE_MODEL` | no | `claude-sonnet-4-6` (D-9) |
| `TURNSTILE_SECRET_KEY` | no | bot protection; dev allows without it |
| `MAILCHIMP_API_KEY` / `MAILCHIMP_LIST_ID` | no | email unlock reuses `api/newsletter-subscribe` |

## Verified

- `tsc --noEmit`: **clean for all pitch files** (the only tsc errors are pre-existing stale `.next/dev/types/validator.ts` entries for removed routes — they regenerate on next build, unrelated to this work).
- Unit test (sandbox): good pitch → Layer-1 **87**, composite **75 (Competitive)**; hype/thin pitch → **29** with subjectivity correctly maxed; no-query path correctly drops Relevance and redistributes weight (**75 → 72**); top-fix ranking and EMOS mechanisms attach correctly.

## TODO before production

- **Rate limiting**: currently the repo's in-memory `rateLimit()` (per serverless instance). Swap to Vercel KV / Upstash for a global monthly cap (already flagged in `src/lib/rate-limit.ts`).
- **Flywheel**: wire `logPitch()` to Supabase / Vercel Postgres (schema in `log.ts`).
- **Turnstile widget**: server verification is wired; add the client widget to the page for live bot protection.
- **Email tier**: page sets a `pp_tier=email` cookie after subscribe; for stronger gating, set it server-side from the subscribe route.
- **Share OG image** for the score card; **one-click AI rewrite** (D-11, deferred).
- Add `/tools/pressiq` to any tools index/nav and set page metadata/OG tags.

## Commit (run locally — sandbox can't push)

```bash
cd "sia-website-github"   # the repo root
git add src/lib/pitch src/app/api/pitch-score src/app/tools/pressiq docs/PressIQ-RFP.md docs/PressIQ-BUILD-NOTES.md
git commit -m "feat(tools): add PressIQ journalist pitch-scoring tool (MVP) + RFP"
git push origin main
```

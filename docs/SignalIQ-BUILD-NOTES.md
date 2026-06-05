# SignalIQ — Build Notes (MVP)

**SignalIQ** — proactive-PR / newsjacking radar. Built as an **integrated Next.js tool** (like PressIQ) — no separate service or database; the always-on engine + Postgres in `SignalIQ-RFP.md` is the later scale-up. (To rename later: change `PRODUCT` in `src/lib/signaliq/config.ts`, the route folder, and the `ToolHeader`.)

## What shipped

```
src/lib/signaliq/
  types.ts            shared types
  config.ts           beats, weights, bands, gating limits, sensitive-term guardrail
  score.ts            opportunity scoring (pure, unit-tested: 10/10 fixtures pass)
  scan.ts             per-beat orchestrator (parallel, fail-soft)
  assetPrompt.ts      LLM tool-use schema + prompt + deterministic chart/sources
  log.ts              flywheel logging stub (console; swap for Postgres later)
  sources/
    http.ts           fetch helper (User-Agent + 9s timeout)
    gdelt.ts          coverage denominator (news volume + trend)
    hackernews.ts     HN Algolia (attention surges)
    sec.ts            EDGAR full-text search (filing surges)
    wikipedia.ts      pageview spikes
    arxiv.ts          preprint surges
    index.ts          registry (SIGNAL_SOURCES + gdeltCoverage)
src/app/api/signaliq/
  scan/route.ts       POST {beat} → ranked opportunities (free, no LLM)
  pack/route.ts       POST {opportunity} → asset pack (one Anthropic tool-use call)
src/app/tools/signaliq/page.tsx   the radar UI (light theme, matches PressIQ/CollabIQ)
```

## How it works

- **Scan** (`/api/signaliq/scan`) hits free, no-key sources for each of the beat's seeds, measures press coverage via **GDELT** (the denominator), and scores each topic: `magnitude + velocity + coverageGap + fit + credibility + corroboration bonus`. No LLM — cheap. Returns ranked `Opportunity[]`.
- **Pack** (`/api/signaliq/pack`) sends one opportunity to Anthropic via a single structured tool-use call (clones the `collab-ai` / `pitch-score` pattern) → brief, pitch angle, subject line, linkable-asset idea, journalist desks, cautions. Chart + source list are built deterministically.
- The opportunity score is a **lead/whitespace** measure, never a prediction — stated on the page, in the prompt, and in the cautions.

## Environment variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes (for packs) | — | already set for `collab-ai` / `pitch-score` |
| `SIGNALIQ_MODEL` | no | `claude-sonnet-4-6` | model for asset packs |
| `TURNSTILE_SECRET_KEY` | no | — | if set, scan/pack verify a token (no-op if unset, like PressIQ) |
| `SIGNALIQ_LOG` | no | on | set to `off` to silence flywheel logs |

Gating reuses the shared `pp_tier=email` cookie (set by the email unlock). Limits in `config.ts`: `FREE_SCANS=3`, `EMAIL_SCANS=10`, `FREE_PACKS=1`, `EMAIL_PACKS=5`.

## Run locally

```
npm run dev
# open http://localhost:3000/tools/signaliq
```

## ⚠️ Live-data test checklist (do this first)

The build sandbox blocks outbound calls to these APIs, so the **source adapters were written to each API's documented contract but NOT verified against live responses.** Vercel/local have no such block. Before launch, run a scan per beat and confirm:

1. **GDELT** `timelinevol` JSON shape matches `gdelt.ts`; tune `VOLUME_CAP` (0.5) so coverageGap isn't always ~1.0.
2. **SEC EDGAR** FTS returns `hits.total.value`; the descriptive User-Agent is sent (required); watch rate limits.
3. **Wikipedia** title-search resolves seeds to articles; pageviews return ≥14 days.
4. **arXiv** Atom XML parses (regex); `https://export.arxiv.org` reachable.
5. **Hacker News** Algolia over **https**.
6. Tune the `*_CAP` constants in each adapter and `WEIGHTS` / `BANDS` in `config.ts` once you see real numbers. Scoring math is already unit-tested; only the source normalisation needs real-world calibration.

`maxDuration = 30` is set on both routes — a scan fans out to ~5 sources × seeds in parallel with 9s timeouts. On a Vercel plan capped at 10s, trim seeds per beat (`config.ts`) or reduce sources.

## One wiring step left

I did **not** touch shared nav/listing files. Add a link to `/tools/signaliq` wherever `/tools/collabiq` and `/tools/pressiq` are listed (tools index / footer / EMOS page tool mentions).

## Honesty & ethics (built in — keep it)

- No prediction language anywhere; score = lead/whitespace.
- **Tasteful-newsjacking guardrail:** `SENSITIVE_TERMS` in `config.ts` flags human-tragedy topics; they're demoted below all non-sensitive opportunities and shown with a "handle with care" note, never as an "opportunity."
- The pack prompt forbids fabricated stats and fabricated journalist names (it returns outlet + desk, with a CollabIQ handoff to find the real person).

## Deferred to v2 (per RFP)

Separate always-on engine + Postgres + historical baselines · Pro custom beats/keywords · email/Telegram alerts · mapographic auto-generation · interactive linkable-asset generation (calculators/quizzes as HTML) · outcome flywheel + attribution UI · more sources (CFPB, Federal Register, CourtListener, Reddit, Google Trends).

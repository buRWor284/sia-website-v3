/**
 * /api/signaliq/refresh-coverage
 *
 * Background worker — triggered by Vercel Cron (daily, Hobby-plan limit) +
 * GitHub Actions (scheduled ~every 30 min; GitHub may throttle to ~1-2/hour).
 * Fetches GDELT coverage for the next seeds in a rotating cursor over the
 * 120 preset seeds, saves results to Supabase, then advances the cursor.
 *
 * This is the ONLY place that calls GDELT. By serialising all GDELT calls here
 * (1 call / 5.2s), we fully own the pace and never trip the rate limit.
 *
 * Batching is TIME-BUDGETED, not fixed-size: we keep pulling seeds until
 * ~40s have elapsed (maxDuration is 60s; the tail is headroom for a slow
 * fetch + Supabase writes). Failures are cheap (~0.3s connection resets), so
 * a run full of failures still attempts many seeds.
 *
 * RETRIES: GDELT aggressively rate-limits shared datacenter IPs (Vercel's
 * egress), so "fetch failed" connection errors are common and transient.
 * Each seed gets up to MAX_ATTEMPTS tries (still 5.2s apart) before we give
 * up on it for this run.
 *
 * CURSOR RULES (subtle — do not "simplify"):
 *  - ok/empty seeds advance the cursor.
 *  - throttled seeds (429 / rate-limit text) do NOT advance — retried next run.
 *  - seeds that still error after retries DO advance (recorded as failed, not
 *    "successful") — they get fresh attempts on the next cursor cycle. Holding
 *    the cursor for them would stall the whole rotation behind one bad seed.
 *
 * Auth: Vercel automatically sends Authorization: Bearer <CRON_SECRET>.
 * Set CRON_SECRET in the Vercel project environment to lock this endpoint down.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BEATS } from "@/lib/signaliq/config";
import { parseTimeline } from "@/lib/signaliq/sources/gdelt";
import { getText } from "@/lib/signaliq/sources/http";
import { getCursor, setCursor, setStoredCoverage } from "@/lib/signaliq/coverage-store";

export const maxDuration = 60; // seconds

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const TIME_BUDGET_MS = 40_000; // stop starting new work after this much elapsed
const MAX_SEEDS_PER_RUN = 12; // hard cap so a burst of instant failures can't sweep the whole list
const MAX_ATTEMPTS = 3; // per-seed tries within one run (connection failures are transient)
const DELAY_MS = 5200; // just over 5s — respects GDELT's ~1 req/5s limit
const FETCH_TIMEOUT_MS = 12_000; // per-request cap; keeps worst case inside the budget

/** All 120 preset seeds in a stable flat order (6 beats × 20 seeds). */
const ALL_SEEDS: string[] = BEATS.flatMap((b) => b.seeds);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isThrottle(text: string): boolean {
  return /limit requests|too many requests/i.test(text);
}

type SeedOutcome = "ok" | "empty" | "throttled" | "failed";

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const elapsed = () => Date.now() - started;

  const cursor = await getCursor();

  const results: string[] = [];
  const counts: Record<SeedOutcome, number> = { ok: 0, empty: 0, throttled: 0, failed: 0 };
  let advance = 0; // how many seeds the cursor moves past (ok + empty + failed; NOT throttled)
  let processed = 0;
  let firstCall = true;

  for (let s = 0; s < MAX_SEEDS_PER_RUN; s++) {
    const idx = cursor + s;
    if (idx >= ALL_SEEDS.length) break; // end of list — wrap happens via modulo below on next run
    if (elapsed() > TIME_BUDGET_MS) break;

    const topic = ALL_SEEDS[idx];
    processed++;
    let outcome: SeedOutcome = "failed";
    let lastError = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Uniform spacing between ALL GDELT calls (retries included), except the very first.
      if (!firstCall) await sleep(DELAY_MS);
      firstCall = false;
      // Don't start an attempt we may not have time to finish.
      if (elapsed() > TIME_BUDGET_MS) break;

      try {
        const url =
          `${GDELT_BASE}?query=${encodeURIComponent(`"${topic}"`)}&mode=timelinevol&format=json&timespan=2m`;
        const text = await getText(url, FETCH_TIMEOUT_MS);
        if (isThrottle(text)) {
          outcome = "throttled";
          continue; // retry after the standard delay
        }
        const cov = parseTimeline(topic, text);
        if (cov) {
          await setStoredCoverage(cov);
          outcome = "ok";
        } else {
          outcome = "empty";
        }
        break; // got a definitive answer — stop retrying this seed
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        // GDELT returns 429 when rate-limited — treat as throttled, not a hard error.
        outcome = msg.includes("429") ? "throttled" : "failed";
        // loop → retry (both throttled and failed are worth another try this run)
      }
    }

    counts[outcome]++;
    if (outcome === "ok" || outcome === "empty") {
      results.push(`${outcome}:${topic}`);
      advance++;
    } else if (outcome === "throttled") {
      // Do NOT advance — cursor stays here, seed is retried next run.
      results.push(`throttled:${topic}`);
      break; // we're rate-limited: stop hammering GDELT for the rest of this run
    } else {
      // Persistent non-throttle failure: advance past it (fresh chance next cycle),
      // but record it honestly — this is NOT a success.
      results.push(`failed:${topic}:${lastError}`);
      advance++;
    }
  }

  const nextCursor = (cursor + advance) % ALL_SEEDS.length;

  let cursorError: string | null = null;
  try {
    if (advance > 0) await setCursor(nextCursor);
  } catch (err) {
    cursorError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    processed,
    ok: counts.ok,
    empty: counts.empty,
    failed: counts.failed,
    throttled: counts.throttled,
    cursor,
    nextCursor,
    totalSeeds: ALL_SEEDS.length,
    elapsedMs: elapsed(),
    results,
    cursorError,
  });
}

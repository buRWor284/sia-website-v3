/**
 * /api/signaliq/refresh-coverage
 *
 * Background worker — triggered by Vercel Cron daily + GitHub Actions every 30 min.
 * Fetches GDELT coverage for the next ~5 seeds in a rotating cursor over the
 * 120 preset seeds, saves results to Supabase, then advances the cursor.
 *
 * This is the ONLY place that calls GDELT. By serialising all GDELT calls here
 * (1 call / 5.2s), we fully own the pace and never trip the rate limit.
 * 5 topics × (5.2s delay + ≤7s fetch) ≈ 56s worst case — under Vercel's 60s limit.
 * 24 cron runs cover all 120 seeds in ~12 hours, then the cycle repeats.
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
const BATCH_SIZE = 2;
const DELAY_MS = 5200; // just over 5s — respects GDELT's ~1 req/5s limit

/** All 120 preset seeds in a stable flat order (6 beats × 20 seeds). */
const ALL_SEEDS: string[] = BEATS.flatMap((b) => b.seeds);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isThrottle(text: string): boolean {
  return /limit requests|too many requests/i.test(text);
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = await getCursor();
  const batch = ALL_SEEDS.slice(cursor, cursor + BATCH_SIZE);
  // Wrap around so the cursor cycles endlessly through all seeds.
  const nextCursor = (cursor + BATCH_SIZE) % ALL_SEEDS.length;

  const results: string[] = [];

  for (let i = 0; i < batch.length; i++) {
    const topic = batch[i];
    // Delay between every call (not before the first one).
    if (i > 0) await sleep(DELAY_MS);
    try {
      const url =
        `${GDELT_BASE}?query=${encodeURIComponent(`"${topic}"`)}&mode=timelinevol&format=json&timespan=2m`;
      const text = await getText(url, 20_000);
      if (isThrottle(text)) {
        results.push(`throttled:${topic}`);
        continue;
      }
      const cov = parseTimeline(topic, text);
      if (cov) {
        await setStoredCoverage(cov);
        results.push(`ok:${topic}`);
      } else {
        results.push(`empty:${topic}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push(`error:${topic}:${msg}`);
    }
  }

  await setCursor(nextCursor);

  return NextResponse.json({
    processed: batch.length,
    cursor,
    nextCursor,
    totalSeeds: ALL_SEEDS.length,
    results,
  });
}

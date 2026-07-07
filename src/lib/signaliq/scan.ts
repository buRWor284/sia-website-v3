/**
 * SignalIQ — scan orchestrator. For a beat: gather numerator signals across all
 * sources for each seed, measure coverage (GDELT), score, and rank. Stateless
 * and serverless-friendly — runs at request time with bounded parallelism and
 * per-source timeouts, so one slow/failed feed degrades the scan to `partial`
 * rather than breaking it.
 *
 * When a company description is supplied we first expand it (profile.ts) into
 * startup-specific seeds + a relevance lexicon, scan those tailored seeds (plus
 * a few beat seeds for breadth), and score every opportunity by relevance to
 * THAT company — so results are genuinely personalised, not just re-ordered.
 */
import type { BeatId, Opportunity, ProfileExpansion, Signal } from "./types";
import { MAX_OPPORTUNITIES, beatById } from "./config";
import { SIGNAL_SOURCES } from "./sources";
import { getStoredCoverage } from "./coverage-store";
import { expandCompanyProfile } from "./profile";
import { rankOpportunities, scoreOpportunity } from "./score";

export interface ScanResult {
  opportunities: Opportunity[];
  partial: boolean;
  notes: string[];
  /** Surfaced so the UI/library can show what the scan was tuned to. */
  expansion?: ProfileExpansion | null;
}

export interface ScanOptions {
  /** Founder's company description — tailors seeds + relevance scoring. */
  companyContext?: string;
}

/** Max distinct seeds scanned per run (keeps external fan-out bounded). */
const MAX_SEEDS = 18;

export async function scanBeat(beat: BeatId, opts: ScanOptions = {}): Promise<ScanResult> {
  const beatSeeds = beatById(beat).seeds;
  const ctx = (opts.companyContext ?? "").trim();

  // 1) Expand the company profile into tailored seeds + relevance lexicon.
  let expansion: ProfileExpansion | null = null;
  if (ctx) expansion = await expandCompanyProfile(ctx, beat);

  // 2) Build the seed list: tailored first (flagged), then beat seeds for breadth.
  const seen = new Set<string>();
  const seedList: { seed: string; tailored: boolean }[] = [];
  for (const s of expansion?.seeds ?? []) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    seedList.push({ seed: s, tailored: true });
    if (seedList.length >= MAX_SEEDS) break;
  }
  for (const s of beatSeeds) {
    if (seedList.length >= MAX_SEEDS) break;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    seedList.push({ seed: s, tailored: false });
  }

  let failures = 0;

  // Phase 1 — gather numerator signals for every seed (these feeds tolerate
  // concurrency). Coverage (GDELT) is deliberately NOT fetched here: GDELT
  // enforces ~1 req/5s, so fanning it out across all ~18 seeds got throttled
  // and coverage collapsed to neutral on nearly every topic.
  const seedsWithSignals = (
    await Promise.all(
      seedList.map(async ({ seed, tailored }) => {
        const signalResults = await Promise.allSettled(SIGNAL_SOURCES.map((fn) => fn(seed)));

        const signals: Signal[] = [];
        for (const r of signalResults) {
          if (r.status === "fulfilled") {
            if (r.value) signals.push(r.value);
          } else {
            failures++;
          }
        }

        if (signals.length === 0) return null; // nothing to surface for this seed
        // Drop ultra-weak lone signals (e.g. a single 1-paper arXiv hit) — noise.
        const maxMag = Math.max(...signals.map((s) => s.magnitude));
        if (signals.length === 1 && maxMag < 0.12) return null;
        return { seed, tailored, signals };
      }),
    )
  ).filter((x): x is { seed: string; tailored: boolean; signals: Signal[] } => x !== null);

  // Phase 2 — read pre-fetched coverage from the Supabase store (instant lookup).
  // Coverage is refreshed in the background by the /api/signaliq/refresh-coverage
  // cron job (every 5 min, ~1h full cycle), so scans never call GDELT directly.
  // If a topic isn't in the store yet (e.g. first hour after deploy), coverage
  // comes back null and the scorer treats the gap as neutral — no crash, no wait.
  const perSeed = await Promise.all(
    seedsWithSignals.map(async ({ seed, tailored, signals }) => {
      const coverage = await getStoredCoverage(seed);
      return scoreOpportunity({ topic: seed, beat, signals, coverage, expansion, tailored });
    }),
  );

  let ranked = rankOpportunities(perSeed);

  // With a company profile, drop clearly off-topic items (non-tailored, ~zero
  // relevance — the loud industry noise like "drug pricing") as long as enough
  // relevant ones remain, so the radar stays focused without going empty.
  if (expansion) {
    // Drop low-fit (off-topic / tangential) items; keep high + medium fit.
    const relevant = ranked.filter((o) => o.fit !== "low");
    if (relevant.length >= 5) ranked = relevant;
  }

  const opportunities = ranked.slice(0, MAX_OPPORTUNITIES);

  const notes: string[] = [];
  const partial = failures > 0;
  if (expansion) {
    const n = seedList.filter((s) => s.tailored).length;
    notes.push(`Personalised to your company — scored ${opportunities.length} relevant ${opportunities.length === 1 ? "topic" : "topics"} from ${n} tailored to you.`);
  } else if (ctx) {
    notes.push("Couldn't tailor topics this time — showing the standard beat. Try again in a moment.");
  }
  if (partial) notes.push("Some sources were unavailable; this scan may be incomplete.");
  if (opportunities.length === 0) {
    notes.push("No live signals cleared the bar for this beat right now — try again later.");
  }
  // Thin-results caution: if a company profile is present but this beat only
  // cleared a handful of matches, the beat choice itself may be the limiter
  // (boundary-vertical companies can get starved under the "wrong" beat).
  if (expansion && opportunities.length > 0 && opportunities.length < 5) {
    notes.push(
      `Only ${opportunities.length} strong ${opportunities.length === 1 ? "match" : "matches"} under ${beatById(beat).label} — if your company sits between categories, a different beat may surface more.`,
    );
  }

  return { opportunities, partial, notes, expansion };
}

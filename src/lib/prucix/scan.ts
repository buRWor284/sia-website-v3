/**
 * Prucix — scan orchestrator. For a beat: gather numerator signals across all
 * sources for each seed, measure coverage (GDELT), score, and rank. Stateless
 * and serverless-friendly — runs at request time with bounded parallelism and
 * per-source timeouts, so one slow/failed feed degrades the scan to `partial`
 * rather than breaking it.
 */
import type { BeatId, Opportunity, Signal } from "./types";
import { MAX_OPPORTUNITIES, beatById } from "./config";
import { SIGNAL_SOURCES, gdeltCoverage } from "./sources";
import { rankOpportunities, scoreOpportunity } from "./score";

export interface ScanResult {
  opportunities: Opportunity[];
  partial: boolean;
  notes: string[];
}

export async function scanBeat(beat: BeatId): Promise<ScanResult> {
  const seeds = beatById(beat).seeds;
  let failures = 0;

  const perSeed = await Promise.all(
    seeds.map(async (seed) => {
      const [signalResults, coverage] = await Promise.all([
        Promise.allSettled(SIGNAL_SOURCES.map((fn) => fn(seed))),
        gdeltCoverage(seed),
      ]);

      const signals: Signal[] = [];
      for (const r of signalResults) {
        if (r.status === "fulfilled") {
          if (r.value) signals.push(r.value);
        } else {
          failures++;
        }
      }
      if (!coverage) failures++;

      if (signals.length === 0) return null; // nothing to surface for this seed
      return scoreOpportunity({ topic: seed, beat, signals, coverage });
    }),
  );

  const opportunities = rankOpportunities(
    perSeed.filter((o): o is Opportunity => o !== null),
  ).slice(0, MAX_OPPORTUNITIES);

  const notes: string[] = [];
  const partial = failures > 0;
  if (partial) notes.push("Some sources were unavailable; this scan may be incomplete.");
  if (opportunities.length === 0) {
    notes.push("No live signals cleared the bar for this beat right now — try again later.");
  }

  return { opportunities, partial, notes };
}

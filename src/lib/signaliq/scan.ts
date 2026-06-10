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
import { SIGNAL_SOURCES, gdeltCoverage } from "./sources";
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

  const perSeed = await Promise.all(
    seedList.map(async ({ seed, tailored }) => {
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
      // Drop ultra-weak lone signals (e.g. a single 1-paper arXiv hit) — noise.
      const maxMag = Math.max(...signals.map((s) => s.magnitude));
      if (signals.length === 1 && maxMag < 0.12) return null;
      return scoreOpportunity({ topic: seed, beat, signals, coverage, expansion, tailored });
    }),
  );

  let ranked = rankOpportunities(perSeed.filter((o): o is Opportunity => o !== null));

  // With a company profile, drop clearly off-topic items (non-tailored, ~zero
  // relevance — the loud industry noise like "drug pricing") as long as enough
  // relevant ones remain, so the radar stays focused without going empty.
  if (expansion) {
    // Drop low-fit (off-topic) items; keep tailored + medium/high fit.
    const relevant = ranked.filter((o) => o.tailored || (o.components.relevance ?? 0) >= 0.4);
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

  return { opportunities, partial, notes, expansion };
}

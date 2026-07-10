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
import { BEAT_SLOTS, MAX_OPPORTUNITIES, beatById } from "./config";
import { SIGNAL_SOURCES } from "./sources";
import { getStoredCoverage } from "./coverage-store";
import { expandCompanyProfile } from "./profile";
import { rankOpportunities, scoreOpportunity } from "./score";

export interface ScanResult {
  opportunities: Opportunity[];
  partial: boolean;
  notes: string[];
  /** Normalised beat selection actually scanned (primary first, deduped, ≤3). */
  beats: BeatId[];
  /** Surfaced so the UI/library can show what the scan was tuned to. */
  expansion?: ProfileExpansion | null;
}

/** A single seed to scan, tagged with the beat it came from (for card badges). */
interface SeedEntry {
  seed: string;
  tailored: boolean;
  beat: BeatId;
}

/**
 * Normalise a beat selection: dedup (order-preserving), drop unknowns, cap at 3,
 * and guarantee at least one beat (falls back to "saas", the default primary).
 */
function normalizeBeats(beats: BeatId[]): BeatId[] {
  const seen = new Set<string>();
  const out: BeatId[] = [];
  for (const b of beats ?? []) {
    if (!b || seen.has(b)) continue;
    if (!beatById(b) || beatById(b).id !== b) continue; // guard against unknown ids
    seen.add(b);
    out.push(b);
    if (out.length >= 3) break;
  }
  return out.length ? out : ["saas"];
}

export interface ScanOptions {
  /** Founder's company description — tailors seeds + relevance scoring. */
  companyContext?: string;
}

/** Max distinct seeds scanned per run (keeps external fan-out bounded). */
const MAX_SEEDS = 18;

export async function scanBeat(beats: BeatId[], opts: ScanOptions = {}): Promise<ScanResult> {
  const beatList = normalizeBeats(beats);
  const primary = beatList[0];
  const ctx = (opts.companyContext ?? "").trim();

  // Lowercased seed → source beat, built across ALL selected beats in user order
  // (first beat wins on an overlapping seed). Used to badge tailored cards with
  // the beat the model selected them from; invented extraTopics fall back to primary.
  const seedBeatOf = new Map<string, BeatId>();
  for (const b of beatList) {
    for (const s of beatById(b).seeds) {
      const k = s.toLowerCase();
      if (!seedBeatOf.has(k)) seedBeatOf.set(k, b);
    }
  }

  // 1) Expand the company profile into tailored seeds + relevance lexicon, using
  //    the union of all selected beats' candidate seeds (grouped per beat inside).
  let expansion: ProfileExpansion | null = null;
  if (ctx) expansion = await expandCompanyProfile(ctx, beatList);

  // 2) Build the seed list: tailored first (flagged), then generic beat seeds for
  //    breadth — weighted per BEAT_SLOTS so the primary beat keeps most of the
  //    budget. Total is always capped at MAX_SEEDS, so N beats cost the same as 1.
  const slots = BEAT_SLOTS[beatList.length] ?? BEAT_SLOTS[3];
  const seen = new Set<string>();
  const seedList: SeedEntry[] = [];

  // Tailored (company-specific) seeds fill first, cap 16 (matches the profile
  // parser's own cap). Tag each with its origin beat, defaulting to primary.
  for (const s of expansion?.seeds ?? []) {
    if (seedList.length >= 16) break;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    seedList.push({ seed: s, tailored: true, beat: seedBeatOf.get(k) ?? primary });
  }

  // Generic backfill, primary beat first, each beat limited to its slot quota.
  beatList.forEach((b, i) => {
    const quota = slots[i] ?? 0;
    let taken = 0;
    for (const s of beatById(b).seeds) {
      if (seedList.length >= MAX_SEEDS || taken >= quota) break;
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      seedList.push({ seed: s, tailored: false, beat: b });
      taken++;
    }
  });

  let failures = 0;

  // Phase 1 — gather numerator signals for every seed (these feeds tolerate
  // concurrency). Coverage (GDELT) is deliberately NOT fetched here: GDELT
  // enforces ~1 req/5s, so fanning it out across all ~18 seeds got throttled
  // and coverage collapsed to neutral on nearly every topic.
  const seedsWithSignals = (
    await Promise.all(
      seedList.map(async ({ seed, tailored, beat }) => {
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
        return { seed, tailored, beat, signals };
      }),
    )
  ).filter((x): x is { seed: string; tailored: boolean; beat: BeatId; signals: Signal[] } => x !== null);

  // Phase 2 — read pre-fetched coverage from the Supabase store (instant lookup).
  // Coverage is refreshed in the background by the /api/signaliq/refresh-coverage
  // cron job (every 5 min, ~1h full cycle), so scans never call GDELT directly.
  // If a topic isn't in the store yet (e.g. first hour after deploy), coverage
  // comes back null and the scorer treats the gap as neutral — no crash, no wait.
  const perSeed = await Promise.all(
    seedsWithSignals.map(async ({ seed, tailored, beat, signals }) => {
      const coverage = await getStoredCoverage(seed);
      // `beat` here is the seed's OWN source beat (per-seed), so mixed-beat
      // radars carry the correct badge and beat-fit on every card.
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
  const beatLabels = beatList.map((b) => beatById(b).label).join(" + ");
  if (opportunities.length === 0) {
    notes.push(
      `No live signals cleared the bar for ${beatList.length > 1 ? "these beats" : "this beat"} right now — try again later.`,
    );
  }
  // Thin-results caution: if a company profile is present but the selection only
  // cleared a handful of matches, adding a beat can widen the radar — boundary-
  // vertical companies get starved under a single "wrong" beat. Multi-beat is the
  // fix, so the copy now nudges toward ADDING a beat (still one scan) rather than
  // swapping to a different one.
  if (expansion && opportunities.length > 0 && opportunities.length < 5) {
    if (beatList.length < 3) {
      notes.push(
        `Only ${opportunities.length} strong ${opportunities.length === 1 ? "match" : "matches"} under ${beatLabels} — if your company straddles categories, add ${beatList.length === 1 ? "a secondary" : "a third"} beat to widen the radar (still one scan).`,
      );
    } else {
      notes.push(
        `Only ${opportunities.length} strong ${opportunities.length === 1 ? "match" : "matches"} across ${beatLabels} right now — try broadening your company description or check back later.`,
      );
    }
  }

  return { opportunities, partial, notes, beats: beatList, expansion };
}

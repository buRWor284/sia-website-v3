/**
 * PressIQ — pitch logging for the outcome flywheel (RFP §8.4, D-10).
 *
 * MVP: console/no-op adapter. The only public dataset that maps pitch text -> placement
 * outcome does not exist; logging here (with a later opt-in "did it get a reply?" callback)
 * is how SIA builds that proprietary dataset over time.
 *
 * TODO(prod): swap `logPitch` to insert into Supabase / Vercel Postgres. Suggested columns:
 *   id, created_at, platform, has_query, composite, relevance, checklist,
 *   storytelling, neuromarketing, personal_brand, word_count, fk_grade,
 *   pitch_hash, pitch_text (nullable; only if store=true), outcome (nullable).
 */

import { createHash } from "crypto";
import type { PitchInput, ScoreResponse } from "./types";

export async function logPitch(input: PitchInput, result: ScoreResponse): Promise<void> {
  try {
    const pitchHash = createHash("sha256").update(input.pitch).digest("hex").slice(0, 16);
    const record = {
      ts: new Date().toISOString(),
      platform: input.platform,
      hasQuery: Boolean(input.query?.trim()),
      composite: result.composite,
      relevance: result.areas.relevance?.score ?? null,
      checklist: result.areas.checklist.score,
      storytelling: result.areas.emos.storytelling.score,
      neuromarketing: result.areas.emos.neuromarketing.score,
      personalBrand: result.areas.emos.personalBrand.score,
      wordCount: result.metrics.wordCount,
      fkGrade: result.metrics.fkGrade,
      pitchHash,
      // D-13: only retain the raw pitch when the user did not opt out.
      pitchText: input.store === false ? null : input.pitch,
    };
    // MVP sink. Replace with a DB insert in production.
    console.log("[pitch-score] logged", JSON.stringify({ ...record, pitchText: record.pitchText ? `[${input.pitch.length} chars]` : null }));
  } catch (err) {
    console.error("[pitch-score] logPitch failed (non-fatal):", err);
  }
}

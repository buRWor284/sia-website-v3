/**
 * beatToTags — turn a journalist's free-text beat into filterable tags.
 * 2026-09-13 (item 3, "beats as tags").
 *
 * `journalists.beat` is a sentence the model or the user wrote:
 *   "Saudi retail, e-commerce, consumer spending, payments and the Vision 2030 economy"
 *   "SEO / Link Building"
 * That is searchable but not filterable. This splits it on the separators
 * people actually use (comma, slash, semicolon, ampersand, " and ") into
 * lowercase, deduped tags:
 *   ["saudi retail", "e-commerce", "consumer spending", "payments", "vision 2030 economy"]
 *
 * Deliberately simple and deterministic — no synonyms, no stemming — so a
 * tag always reads exactly as the beat did. The same rules are mirrored in
 * the one-off SQL backfill in supabase/journalist-beat-tags.sql; keep them
 * in step if this changes.
 */

const SPLIT = /\s*(?:,|\/|;|&|\band\b)\s*/i;
const MAX_TAGS = 8;
const MAX_LEN = 40;

export function beatToTags(beat: string | null | undefined): string[] {
  if (!beat) return [];
  const out: string[] = [];
  for (const raw of beat.split(SPLIT)) {
    let t = raw.trim().toLowerCase().replace(/^the\s+/, "").replace(/\.+$/, "");
    if (!t) continue;
    if (t.length > MAX_LEN) t = t.slice(0, MAX_LEN).trim();
    if (!out.includes(t)) out.push(t);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

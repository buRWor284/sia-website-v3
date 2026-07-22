/**
 * Topic label formatting — shared by /founder-movers and /radar.
 *
 * Canonical topics in signaliq_daily_counts / signaliq_coverage_cache are stored
 * lowercased ("ai regulation", "seo", "tech ipo", "cross-border payments"). This
 * turns them into clean display labels: known acronyms uppercased, every other
 * word capitalized, hyphen-aware. Pure and client-safe (no server imports).
 */

const ACRONYMS = new Set([
  "ai", "seo", "geo", "pr", "aeo", "llm", "ipo", "cmo", "kyc", "api", "ctv",
  "b2b", "ev", "saas", "gpu", "esg", "cms", "ugc", "bnpl", "cbdc", "rag",
  "glp", "soc", "it", "iot", "sim", "ss7", "mvno",
]);

function cap(w: string): string {
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

function formatWord(w: string): string {
  const lower = w.toLowerCase();
  if (ACRONYMS.has(lower)) return w.toUpperCase();
  if (w.includes("-")) {
    return w
      .split("-")
      .map((p) => (ACRONYMS.has(p.toLowerCase()) ? p.toUpperCase() : cap(p)))
      .join("-");
  }
  return cap(w);
}

/** Format a lowercase canonical topic into a display label. */
export function displayTopic(topic: string): string {
  return topic.trim().split(/\s+/).filter(Boolean).map(formatWord).join(" ");
}

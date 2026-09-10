/**
 * Plain-text helpers for AI text carried between tools (2026-09-10).
 *
 * Signal packs come back as light Markdown. Where that text lands in a one-line
 * slot (a title input, a banner, a prefilled story) the raw "**" and "##" showed
 * on screen, and the AssetIQ title was a hard 80-character cut of the whole idea
 * ("**"The Executive's SIM Swap Exposure Scorecard"** — An interactive self-as").
 */

/** Drop Markdown markers, keep the words. */
export function stripMd(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")         // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")              // bold
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[\s(])\*(\S[^*]*?)\*(?=[\s).,;:!?]|$)/g, "$1$2") // italic *x*
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")                 // bullets
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * A short working title from an asset idea: the quoted name if the idea opens
 * with one ("The Executive's SIM Swap Exposure Scorecard"), else the part before
 * the first dash or colon, else the first dozen words.
 */
export function titleFromIdea(idea: string, max = 90): string {
  const plain = stripMd(idea);
  const quoted = /^\s*["“]([^"”]{4,120})["”]/.exec(plain);
  if (quoted) return quoted[1].trim().slice(0, max);
  const head = plain.split(/\s[—–-]\s|:\s/)[0].trim();
  const words = (head.length >= 8 ? head : plain).split(/\s+/);
  const short = words.slice(0, 12).join(" ");
  return (words.length > 12 ? short + "…" : short).slice(0, max);
}

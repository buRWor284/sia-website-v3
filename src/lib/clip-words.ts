/**
 * Cut text to at most `max` characters at a word boundary, adding "…" when cut.
 * Used for text carried between tools in a URL, so a prefilled story never ends
 * mid-word ("is it on by default, p").
 */
export function clipWords(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-]+$/, "") + "…";
}

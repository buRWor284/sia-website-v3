/**
 * HTML escaping for user-supplied values that get interpolated into the
 * notification / auto-reply emails we send through Resend.
 *
 * M2 (2026-07-02 security review): `contact`, `cmo-inquiry`, `emos-apply` and
 * `emos-access-request` dropped raw form fields straight into an HTML email
 * body. Anyone submitting a public form could therefore render arbitrary markup
 * — most usefully a spoofed link — inside a mail that arrives in Irfan's inbox
 * from his own trusted domain. Escaping at the interpolation point kills that:
 * the field is displayed as literal text, whatever it contains.
 *
 * Escape at the point of interpolation, not at parse time — the same values are
 * also used in plain-text contexts (Resend `subject`, `reply_to`) where entity
 * encoding would be wrong.
 */

/** Escape the five characters that can break out of HTML text or an attribute. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a value that is going into an `href`/`src` attribute. Blocks the
 * javascript:/data: schemes outright rather than trusting entity encoding.
 * Returns "#" for anything that is not a plain http(s) or mailto URL.
 */
export function escapeUrl(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^(https?:|mailto:)/i.test(raw)) return "#";
  return escapeHtml(raw);
}

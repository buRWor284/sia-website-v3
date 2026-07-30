/**
 * The EMOS owner/admin addresses, in their own module.
 *
 * Extracted from emos-guard.ts on 2026-07-30 (D4) so that emos-billing.ts can
 * read the list without importing emos-guard — which imports emos-billing, and
 * would make the cycle real. Nothing else lives here on purpose: this file must
 * stay importable from anywhere on the server.
 *
 * Two different things key off this list, and they are NOT the same check:
 *   - emos-guard skips the SUBSCRIPTION lookup for these addresses (an admin
 *     has no Stripe row and must not be read as "hasn't paid"), and
 *   - emos-billing refuses to let these accounts CLAIM a customer's
 *     subscription from the success page. Support opening a buyer's success
 *     URL while signed in would otherwise bind that subscription to the owner's
 *     account, and the eventual cancellation would strip the owner's own
 *     emos_access — a lockout from his own platform, since the metadata gate in
 *     middleware.ts has no admin bypass.
 */
export const EMOS_ADMIN_EMAILS = ["syedirfanajmal@gmail.com", "sia@syedirfanajmal.com"];

export function isEmosAdminEmail(email: string | null | undefined): boolean {
  const normalized = (email ?? "").trim().toLowerCase();
  return normalized !== "" && EMOS_ADMIN_EMAILS.includes(normalized);
}

/**
 * JournoCollabIQ journalist verification: types and pure helpers shared by the
 * server (lib/journo/verify.ts, route-core) and the dashboard card
 * (JournoCollabIQClient). No server imports here, so the client can use it.
 *
 * Decision record: project doc claude/JournoCollabIQ-Verification-Decision-2026-09-25.md
 * (bug P1-01). A name is shown as a person only when a byline by them at the
 * outlet, dated within the last 12 months, was found in live search results.
 */

/** How long a stored check counts as current. Decided at read time. */
export const VERIFY_TTL_DAYS = 30;
/** A byline older than this does not verify anyone. */
export const BYLINE_MAX_AGE_DAYS = 365;

export interface JournalistVerification {
  /** "verified" = byline found; "unverified" = looked, none found;
   *  "check_failed" = the check could not run (API error / timeout), not cached;
   *  "pending" = not finished inside the search route, the card fills it in;
   *  "stale" = seen on the outlet's pages more than 30 days ago ("last seen,
   *  may have moved"): shown as a lead, never as verified. */
  status: "verified" | "unverified" | "check_failed" | "pending" | "stale";
  name: string;
  /** The outlet domain the candidate list gave (may be wrong). */
  outlet: string;
  /** Real domain, derived from byline_url. Null when no byline. */
  bylineDomain: string | null;
  bylineUrl: string | null;
  bylineTitle: string | null;
  /** YYYY-MM-DD */
  bylineDate: string | null;
  roleAsOf: string | null;
  note: string | null;
  /** ISO timestamp of the check. */
  checkedAt: string | null;
  /** True when served from the 30-day cache (no search spent). */
  cached: boolean;
  searchesUsed: number;
}

/** "https://www.Arabianbusiness.com/industries/..." -> "arabianbusiness.com" */
export function normaliseDomain(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\d?\./, "")
    .split(/[/?#:\s]/)[0]
    .replace(/\.$/, "");
}

/** "  Iain  Akerman " / "Iáin Akerman" -> "iain akerman" */
export function nameKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "ac", "edu"]);

/** The name part of a domain: "communicateonline.me" -> "communicateonline",
 *  "thenational.ae" -> "thenational", "bbc.co.uk" -> "bbc". */
export function domainCore(domain: string): string {
  const labels = normaliseDomain(domain).split(".").filter(Boolean);
  if (labels.length <= 1) return labels[0] ?? "";
  let i = labels.length - 2;
  if (i > 0 && SECOND_LEVEL.has(labels[i]) && labels[labels.length - 1].length === 2) i -= 1;
  return labels[i].replace(/-/g, "");
}

/**
 * Is the byline's real domain the outlet the list named? Exact or subdomain
 * match always counts. A different domain counts only when the verifier also
 * said it is the same publication AND the domain names share a clear stem
 * ("communicate.ae" vs "communicateonline.me"), so a byline at an unrelated
 * site can never verify someone for the stated outlet.
 */
export function outletMatches(stated: string, found: string, verifierSaysSame: boolean): boolean {
  const a = normaliseDomain(stated);
  const b = normaliseDomain(found);
  if (!a || !b) return false;
  if (a === b || a.endsWith("." + b) || b.endsWith("." + a)) return true;
  if (!verifierSaysSame) return false;
  const ca = domainCore(a);
  const cb = domainCore(b);
  if (ca.length < 4 || cb.length < 4) return false;
  return ca.startsWith(cb) || cb.startsWith(ca) || (ca.length >= 6 && cb.length >= 6 && ca.slice(0, 6) === cb.slice(0, 6));
}

/** "2026-03-04" -> "4 Mar 2026". Unparseable input comes back unchanged. */
export function formatBylineDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** The fields of a journalist suggestion this layer reads or rewrites. */
export interface VerifiableCandidate {
  name: string;
  /** Outlet domain. Replaced by the byline's real domain once verified. */
  url: string;
  why: string;
  linkPage: string;
  tier: string;
  /** The tier the AI gave, kept so a later verification can restore it. */
  aiTier?: string;
  /** The outlet domain the AI gave, when the byline showed a different one. */
  statedOutlet?: string;
  verification?: JournalistVerification;
}

/**
 * Fold a verification into a suggestion. Same function on the server (search
 * route) and in the card (pending fill-in, Re-verify), so both agree.
 *  - verified: the AI tier stands; "Recent coverage" becomes the real byline;
 *    the outlet becomes the byline's real domain.
 *  - unverified: no tier, and the AI's "why they fit / recent coverage" text
 *    and link are dropped (they are invented when no byline exists).
 *  - pending / check_failed: kept as they are; the card shows no tier and
 *    hides the AI text until a check lands.
 */
export function applyVerification<T extends VerifiableCandidate>(c: T, v: JournalistVerification): T {
  const aiTier = c.aiTier ?? (c.tier === "unverified" ? undefined : c.tier);
  const statedOutlet = c.statedOutlet ?? c.url;
  if (v.status === "verified") {
    const real = v.bylineDomain || c.url;
    return {
      ...c,
      verification: v,
      aiTier,
      tier: aiTier ?? "C",
      url: real,
      statedOutlet: normaliseDomain(real) === normaliseDomain(statedOutlet) ? undefined : statedOutlet,
      linkPage: v.bylineUrl ?? "",
    };
  }
  if (v.status === "stale") {
    // Keep the last article as the link; no tier (a tier needs a current byline).
    return { ...c, verification: v, aiTier, tier: "stale", linkPage: v.bylineUrl ?? c.linkPage };
  }
  if (v.status === "unverified") {
    return { ...c, verification: v, aiTier, tier: "unverified", url: statedOutlet, statedOutlet: undefined, why: "", linkPage: "" };
  }
  return { ...c, verification: v, aiTier };
}

/** Display order: verified A, B, C, then still-checking, then not confirmed. */
export function verificationRank(c: VerifiableCandidate): number {
  const s = c.verification?.status;
  if (!s || s === "verified") return ({ A: 0, B: 1, C: 2 } as Record<string, number>)[c.tier] ?? 3;
  if (s === "stale") return 4;
  if (s === "pending" || s === "check_failed") return 5;
  return 6;
}

/** A placeholder verification for a candidate whose check is still running. */
export function pendingVerification(name: string, outlet: string): JournalistVerification {
  return {
    status: "pending", name, outlet, bylineDomain: null, bylineUrl: null, bylineTitle: null,
    bylineDate: null, roleAsOf: null, note: null, checkedAt: null, cached: false, searchesUsed: 0,
  };
}

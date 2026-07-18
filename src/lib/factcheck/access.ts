// src/lib/factcheck/access.ts
// FactcheckIQ | private-testing allowlist (18 Jul 2026).
//
// While FactcheckIQ is in private testing, the dashboard page and both API
// routes are gated to an explicit list of organization ids, independent of the
// Clerk session and subscription gates (which any EMOS subscriber passes).
//
// FACTCHECKIQ_ALLOWED_ORG_IDS: comma-separated organization UUIDs.
// - Set (non-empty): only those orgs can open the tool or call its API.
//   Everyone else sees the in-testing screen / a 403.
// - Unset or empty: the gate is OFF and the tool is open to every EMOS
//   subscriber. This is the launch switch: when testing is done, delete the
//   env var (or leave it and add customer org ids as they onboard).

/** The allowlist, or null when the gate is disabled (env unset/empty). */
export function factcheckAllowedOrgIds(): string[] | null {
  const raw = process.env.FACTCHECKIQ_ALLOWED_ORG_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : null;
}

export function isFactcheckOrgAllowed(orgId: string): boolean {
  const ids = factcheckAllowedOrgIds();
  return ids === null || ids.includes(orgId);
}

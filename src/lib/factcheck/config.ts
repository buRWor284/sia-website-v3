// src/lib/factcheck/config.ts
// FactcheckIQ | model + tier + cap config, per FactcheckIQ-Build-Plan-v2.md §4, §8, §9, Appendix A

/** Cheap model for mechanical claim extraction. Env var added in Vercel per Phase 0. */
export const FACTCHECK_EXTRACT_MODEL =
  process.env.FACTCHECK_EXTRACT_MODEL ?? "claude-sonnet-4-6";

/** Judgment model for verification + verdicts. Env var added in Vercel per Phase 0. */
export const FACTCHECK_GRADE_MODEL =
  process.env.FACTCHECK_GRADE_MODEL ?? "claude-opus-4-8";

/**
 * Web search / web fetch tool versions and beta header.
 *
 * Phase 0 finding (4 Jul 2026): the plan's original assumption (web_fetch_20250910,
 * beta header "web-fetch-2025-09-10") was superseded by the _20260209 tools with a
 * "code-execution-web-tools-2026-02-09" beta header.
 *
 * Phase 3 re-verification (14 Jul 2026, against
 * https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
 * and .../web-fetch-tool): both tools advanced again and are now GA. The current
 * latest is web_search_20260318 / web_fetch_20260318 (adds response-inclusion
 * control on top of the _20260209 dynamic filtering), and the docs no longer
 * require any beta header for either tool. WEB_TOOLS_BETA_HEADER is therefore null;
 * verify.ts only sends an anthropic-beta header when this is non-null, so a future
 * reintroduction is a one-line change. Re-verify against the docs above if this
 * file is touched more than a few weeks after this note.
 */
export const WEB_SEARCH_TOOL_VERSION = "web_search_20260318";
export const WEB_FETCH_TOOL_VERSION = "web_fetch_20260318";
export const WEB_TOOLS_BETA_HEADER: string | null = null;

/** Claims beyond this cap are stored with status "skipped" and reported, never silently dropped. */
export const MAX_CLAIMS_PER_RUN = 40;

/** Per-claim search budget inside the verify+grade step. */
export const MAX_SEARCHES_PER_CLAIM = 3;

/** Concurrency cap for parallel per-claim verify+grade calls in full-audit mode. */
export const VERIFY_CONCURRENCY = 4;

/**
 * Source tiers, used for source_tier / sources[].tier.
 * Lower number = higher trust. Referenced by grade.ts's clampVerdict().
 */
export const SOURCE_TIERS = {
  PRIMARY_ACADEMIC: 1, // peer-reviewed journals, Crossref/OpenAlex-indexed papers
  GOVERNMENT_OR_STANDARDS_BODY: 1,
  REPUTABLE_NEWS_OR_INDUSTRY: 2,
  VENDOR_OR_COMPANY_BLOG: 3,
  UNVERIFIED_OR_LOW_TRUST: 4,
} as const;

/**
 * Vercel fluid-compute duration (Phase 0 finding, 4 Jul 2026):
 * default maxDuration across plans is now 300s; Pro/Enterprise fluid compute
 * supports up to 800s generally available (30 min extended max is beta-only).
 * A typical full audit (~1-4 min per plan §2) fits well inside the 300s default;
 * set an explicit maxDuration on the process route regardless, per Vercel docs
 * (https://vercel.com/docs/functions/configuring-functions/duration).
 */
export const PROCESS_ROUTE_MAX_DURATION_SECONDS = 300;

export const CITATION_APIS = {
  CROSSREF: "https://api.crossref.org",
  OPENALEX: "https://api.openalex.org",
  DOAJ: "https://doaj.org/api",
  // Retraction Watch data is served via Crossref's Retraction Watch integration.
} as const;

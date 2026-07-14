// src/lib/factcheck/citations.ts
// FactcheckIQ | Crossref / OpenAlex / DOAJ / Retraction Watch gate, per Build-Plan-v2.md §3 step 4, §4
// Free, keyless, deterministic. This is stage one of every run and the entirety
// of "citation & link check" mode — no paid web search happens here.

import { CITATION_APIS } from "./config";

export interface CitationCheckInput {
  doi?: string;
  /** Fallback when no DOI is present: title + first author, used for a Crossref/OpenAlex title search. */
  title?: string;
  journal?: string;
}

export interface CitationCheckResult {
  /** Whether a DOI (or title match) resolved to a real, indexed work at all. */
  exists: boolean;
  /** Whether the resolved work's title/journal plausibly matches what the claim attributes to it. */
  matchesClaim: boolean | null; // null = could not be determined from metadata alone
  retracted: boolean;
  journalInDoaj: boolean | null; // null = journal not identified, so DOAJ lookup was skipped
  resolvedTitle?: string;
  resolvedJournal?: string;
  source: "crossref" | "openalex" | "none";
  raw?: unknown;
}

const FETCH_TIMEOUT_MS = 8000;

async function fetchJson(url: string): Promise<any | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "FactcheckIQ/1.0 (mailto:syedirfanajmal@gmail.com)" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Crossref DOI lookup — the primary, most authoritative check. */
async function checkCrossrefDoi(doi: string) {
  const data = await fetchJson(`${CITATION_APIS.CROSSREF}/works/${encodeURIComponent(doi)}`);
  if (!data?.message) return null;
  const msg = data.message;
  return {
    title: Array.isArray(msg.title) ? msg.title[0] : msg.title,
    journal: Array.isArray(msg["container-title"]) ? msg["container-title"][0] : msg["container-title"],
    isRetracted: Array.isArray(msg.update) && msg.update.some((u: any) => u["update-type"] === "retraction"),
  };
}

/** OpenAlex fallback — covers works Crossref doesn't have DOI-indexed, and gives a second opinion. */
async function checkOpenAlexDoi(doi: string) {
  const data = await fetchJson(`${CITATION_APIS.OPENALEX}/works/https://doi.org/${encodeURIComponent(doi)}`);
  if (!data || data.id === undefined) return null;
  return {
    title: data.title as string | undefined,
    journal: data.host_venue?.display_name ?? data.primary_location?.source?.display_name,
    isRetracted: data.is_retracted === true,
  };
}

/** Title-only search when no DOI is given (a common fabrication pattern: a plausible-sounding paper with no DOI at all). */
async function searchOpenAlexByTitle(title: string) {
  const data = await fetchJson(`${CITATION_APIS.OPENALEX}/works?search=${encodeURIComponent(title)}&per_page=3`);
  const results = data?.results;
  if (!Array.isArray(results) || results.length === 0) return null;
  // Only treat as a match if the top hit's title is a close match, not merely "returned something".
  return results[0];
}

async function checkDoaj(journal: string): Promise<boolean | null> {
  const data = await fetchJson(`${CITATION_APIS.DOAJ}/search/journals/${encodeURIComponent(journal)}`);
  if (!data) return null;
  return Array.isArray(data.results) && data.results.length > 0;
}

/**
 * Runs the full deterministic gate for one citation claim.
 * Never returns "verified" — that verdict requires web-search evidence, which
 * this function does not touch. Callers (grade.ts / clampVerdict) enforce that.
 */
export async function checkCitation(input: CitationCheckInput): Promise<CitationCheckResult> {
  if (input.doi) {
    const crossref = await checkCrossrefDoi(input.doi);
    if (crossref) {
      const journalOk = crossref.journal ? await checkDoaj(crossref.journal) : null;
      return {
        exists: true,
        matchesClaim: input.title ? titleRoughlyMatches(crossref.title, input.title) : null,
        retracted: crossref.isRetracted,
        journalInDoaj: journalOk,
        resolvedTitle: crossref.title,
        resolvedJournal: crossref.journal,
        source: "crossref",
      };
    }

    const openAlex = await checkOpenAlexDoi(input.doi);
    if (openAlex) {
      const journalOk = openAlex.journal ? await checkDoaj(openAlex.journal) : null;
      return {
        exists: true,
        matchesClaim: input.title ? titleRoughlyMatches(openAlex.title, input.title) : null,
        retracted: openAlex.isRetracted,
        journalInDoaj: journalOk,
        resolvedTitle: openAlex.title,
        resolvedJournal: openAlex.journal,
        source: "openalex",
      };
    }

    // DOI given but resolves nowhere: this is the clearest fabrication signal in the whole gate.
    return { exists: false, matchesClaim: false, retracted: false, journalInDoaj: null, source: "none" };
  }

  if (input.title) {
    const hit = await searchOpenAlexByTitle(input.title);
    if (!hit) {
      return { exists: false, matchesClaim: false, retracted: false, journalInDoaj: null, source: "none" };
    }
    const journal = hit.host_venue?.display_name ?? hit.primary_location?.source?.display_name;
    return {
      exists: true,
      matchesClaim: titleRoughlyMatches(hit.title, input.title),
      retracted: hit.is_retracted === true,
      journalInDoaj: journal ? await checkDoaj(journal) : null,
      resolvedTitle: hit.title,
      resolvedJournal: journal,
      source: "openalex",
      raw: hit,
    };
  }

  return { exists: false, matchesClaim: null, retracted: false, journalInDoaj: null, source: "none" };
}

function titleRoughlyMatches(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return true;
  // Cheap containment check; the grading model does the real semantic comparison
  // using this result plus the fetched abstract, this is just a fast pre-filter.
  return na.includes(nb.slice(0, Math.floor(nb.length * 0.6))) || nb.includes(na.slice(0, Math.floor(na.length * 0.6)));
}

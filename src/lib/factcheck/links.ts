// src/lib/factcheck/links.ts
// FactcheckIQ | URL resolver, TS port of the fact-check skill's scripts/check_links.py
// Per Build-Plan-v2.md §3 step 4 (citation & link gate) and §6 file map.

export interface LinkCheckResult {
  url: string;
  resolved: boolean;
  statusCode: number | null;
  finalUrl: string | null; // after redirects
  error: string | null;
}

const FETCH_TIMEOUT_MS = 10000;

/**
 * HEAD-first, GET-fallback link check. Some servers (notably many publisher/
 * DOI redirectors) reject HEAD with 405; falling back to a ranged GET avoids
 * false "dead link" verdicts on sites that are actually fine.
 */
export async function checkLink(url: string): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "FactcheckIQ/1.0 (mailto:syedirfanajmal@gmail.com)" },
    });

    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "FactcheckIQ/1.0 (mailto:syedirfanajmal@gmail.com)",
          Range: "bytes=0-2047",
        },
      });
    }

    return {
      url,
      resolved: res.ok || (res.status >= 200 && res.status < 400),
      statusCode: res.status,
      finalUrl: res.url !== url ? res.url : null,
      error: null,
    };
  } catch (err) {
    return {
      url,
      resolved: false,
      statusCode: null,
      finalUrl: null,
      error: err instanceof Error ? err.message : "unknown fetch error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkLinks(urls: string[]): Promise<LinkCheckResult[]> {
  // Small, bounded concurrency; link checks are not the expensive part of a run,
  // but running 40 of them fully serially would be needlessly slow.
  const concurrency = 6;
  const results: LinkCheckResult[] = new Array(urls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      results[i] = await checkLink(urls[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

/** DOI extraction, tolerant of doi.org URLs, bare DOIs, and DOI: prefixes. */
export function extractDoi(text: string): string | null {
  const match = text.match(/(?:doi\.org\/|doi:\s*)?(10\.\d{4,9}\/[^\s"'<>)]+)/i);
  return match ? match[1].replace(/[.,;]+$/, "") : null;
}

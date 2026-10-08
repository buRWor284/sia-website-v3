import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { domainFromInput } from "@/lib/ahrefs-dr";
import { sameSite } from "@/lib/emos/write-core";

/**
 * EMOS — is this URL really a placement for this pitch? (spec v1.3 §3,
 * record_placement). Session 3, 2026-10-07.
 *
 * The rule: the server fetches the page, and a placement is accepted only when
 *   (a) the page links to the company's own domain, or
 *   (b) the page is on the outlet the pitched journalist writes for.
 * Anything else is refused, so an AI cannot log an unrelated page as coverage.
 *
 * The URL comes from a model or an inbox, so the fetch is defensive: http(s)
 * only, standard ports, no IP literals, every host resolved and refused if it
 * points at a private or local address, redirects followed by hand (each hop
 * re-checked), a time limit and a size limit.
 */

const TIMEOUT_MS = 12_000;
const MAX_BYTES = 1_500_000;
const MAX_HOPS = 4;

export interface PlacementCheck {
  ok: boolean;
  /** One plain sentence: why it was accepted or refused. */
  reason: string;
  placementDomain: string | null;
  outletMatches: boolean;
  /** true / false when the page was read; null when it could not be fetched. */
  linksToCompany: boolean | null;
  fetched: boolean;
  httpStatus: number | null;
}

function privateV4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function privateAddress(ip: string): boolean {
  if (isIP(ip) === 4) return privateV4(ip);
  const v6 = ip.toLowerCase();
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v6);
  if (mapped) return privateV4(mapped[1]);
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") || v6.startsWith("ff");
}

/** Null when the URL is safe to fetch; otherwise why it is not. */
async function unsafeReason(url: URL): Promise<string | null> {
  if (url.protocol !== "https:" && url.protocol !== "http:") return "only http and https links can be checked";
  if (url.username || url.password) return "links with a username or password in them are not checked";
  if (url.port && url.port !== "80" && url.port !== "443") return "only standard web ports are checked";
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return "a placement must be on a named website, not an IP address";
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") return "that is not a public website address";
  try {
    const addrs = await lookup(host, { all: true });
    if (addrs.length === 0 || addrs.some((a) => privateAddress(a.address))) return "that address does not point at a public website";
  } catch {
    return "that website address could not be found";
  }
  return null;
}

export async function fetchPage(start: URL): Promise<{ html: string | null; status: number | null; finalUrl: URL; problem: string | null }> {
  let url = start;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    const unsafe = await unsafeReason(url);
    if (unsafe) return { html: null, status: null, finalUrl: url, problem: unsafe };
    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EMOS-PlacementCheck/1.0; +https://www.syedirfanajmal.com/emos-platform)",
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        },
      });
    } catch {
      return { html: null, status: null, finalUrl: url, problem: "the page did not answer in time" };
    }
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return { html: null, status: res.status, finalUrl: url, problem: "the page redirects nowhere" };
      try {
        url = new URL(next, url);
      } catch {
        return { html: null, status: res.status, finalUrl: url, problem: "the page redirects to a broken address" };
      }
      continue;
    }
    if (!res.ok) return { html: null, status: res.status, finalUrl: url, problem: `the page answered with HTTP ${res.status}` };
    const type = res.headers.get("content-type") ?? "";
    if (type && !/html|xml|text/i.test(type)) return { html: null, status: res.status, finalUrl: url, problem: "the link is not a web page" };

    // Read up to the size limit, then stop.
    const reader = res.body?.getReader();
    if (!reader) return { html: await res.text().then((t) => t.slice(0, MAX_BYTES)), status: res.status, finalUrl: url, problem: null };
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read().catch(() => ({ done: true, value: undefined as Uint8Array | undefined }));
      if (done || !value) break;
      chunks.push(value);
      size += value.byteLength;
    }
    void reader.cancel().catch(() => undefined);
    return { html: Buffer.concat(chunks).toString("utf8"), status: res.status, finalUrl: url, problem: null };
  }
  return { html: null, status: null, finalUrl: url, problem: "the page redirects too many times" };
}

/** Does any link on the page go to this site? Looks at href values only, not plain mentions. */
export function pageLinksTo(html: string, site: string, base: URL): boolean {
  const re = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("javascript:")) continue;
    try {
      const host = new URL(raw.replace(/&amp;/g, "&"), base).hostname;
      if (sameSite(host, site)) return true;
    } catch {
      // not a URL; skip
    }
  }
  return false;
}

export async function checkPlacementUrl(
  rawUrl: string,
  opts: { companyDomain: string | null; outletDomain: string | null; companyName: string; journalistName: string | null },
): Promise<PlacementCheck> {
  const base: PlacementCheck = { ok: false, reason: "", placementDomain: null, outletMatches: false, linksToCompany: null, fetched: false, httpStatus: null };
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ...base, reason: "That is not a full web address (it should start with https://)." };
  }
  const placementDomain = domainFromInput(url.hostname);
  if (!placementDomain) return { ...base, reason: "That is not a public website address." };
  if (opts.companyDomain && sameSite(placementDomain, opts.companyDomain)) {
    return { ...base, placementDomain, reason: `That page is on ${opts.companyName}'s own site. A placement is coverage on someone else's site.` };
  }
  if (!opts.companyDomain && !opts.outletDomain) {
    return {
      ...base,
      placementDomain,
      reason:
        `There is nothing to check this page against: ${opts.companyName} has no website saved and the pitch has no journalist with a known outlet. ` +
        "Add the company website (or attach the journalist) in the dashboard, then record the placement again.",
    };
  }

  const outletMatches = sameSite(placementDomain, opts.outletDomain);
  const page = await fetchPage(url);
  const fetched = page.html !== null;
  const linksToCompany = fetched && opts.companyDomain ? pageLinksTo(page.html!, opts.companyDomain, page.finalUrl) : fetched ? false : null;
  const facts = { placementDomain, outletMatches, linksToCompany, fetched, httpStatus: page.status };

  if (linksToCompany) return { ...facts, ok: true, reason: `The page links to ${opts.companyDomain}.` };
  if (outletMatches) {
    return {
      ...facts,
      ok: true,
      reason: fetched
        ? `The page is on ${opts.outletDomain}, the outlet ${opts.journalistName ?? "the journalist"} writes for. It has no link to ${opts.companyDomain ?? "the company site"}, so treat it as a mention, not a link.`
        : `The page is on ${opts.outletDomain}, the outlet ${opts.journalistName ?? "the journalist"} writes for. It could not be read (${page.problem}), so whether it links to the company is unknown.`,
    };
  }
  if (!fetched) {
    return {
      ...facts,
      ok: false,
      reason: `The page could not be read (${page.problem}), and ${placementDomain} is not the outlet this pitch went to${opts.outletDomain ? ` (${opts.outletDomain})` : ""}. Nothing was recorded. If it is real coverage, log it in the dashboard.`,
    };
  }
  return {
    ...facts,
    ok: false,
    reason:
      `That page does not link to ${opts.companyDomain ?? "the company's site"}, and ${placementDomain} is not the outlet this pitch went to${opts.outletDomain ? ` (${opts.outletDomain})` : ""}. ` +
      "Nothing was recorded. If it is real coverage, log it in the dashboard.",
  };
}

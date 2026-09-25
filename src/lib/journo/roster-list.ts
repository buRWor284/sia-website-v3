import "server-only";
/**
 * Roster-first journalist list (JournoCollabIQ, 25 Sep 2026).
 *
 * When the story is in a market we keep hand-picked outlets for (KSA first),
 * the candidates come from the stored outlet rosters: people SEEN writing on
 * those outlets' own pages. The model only ranks them and writes the fit
 * note; it picks by index from the list it is given, so it cannot add a name.
 * Returns null when there is no roster for this story, so the route falls
 * back to the search-first and memory lists.
 */

import { recordAiUsage } from "@/lib/ai-usage";
import { briefPromptBlock } from "@/lib/company-brief-prompt";
import { listsFor, type Outlet } from "@/lib/journo/outlets";
import { readRoster, type RosterPerson } from "@/lib/journo/roster";
import type { JournalistVerification } from "@/lib/journo/verification-shared";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const RANK_MODEL = process.env.JOURNO_RANK_MODEL ?? "claude-sonnet-4-6";
const MAX_PEOPLE_IN_PROMPT = 40;

const MARKET_WORDS: Array<[string, RegExp]> = [
  ["ksa", /\b(saudi|ksa|riyadh|jeddah|dammam|khobar|neom|mecca|makkah|medina|madinah|alula)\b/i],
  // USA (25 Sep): "US"/"USA" only in capitals, so the word "us" never matches.
  ["usa", /\b(US|USA|U\.S\.(A\.)?)(?![A-Za-z])/],
  ["usa", /\b(united states|(?<!(latin|south|central) )american?|new york|california|texas|florida|chicago|san francisco|los angeles|silicon valley)\b/i],
];

export function marketFor(d: Record<string, unknown>): string | null {
  const text = [d.geo, d.industry, d.audDesc, d.desc].filter((x) => typeof x === "string").join(" ");
  for (const [m, re] of MARKET_WORDS) if (re.test(text)) return m;
  return null;
}

interface Ranked { i?: unknown; why?: unknown; beat?: unknown; tier?: unknown }

export async function buildRosterList(
  data: Record<string, unknown>,
  companyBrief?: string | null,
): Promise<{ candidates: Array<Record<string, unknown>>; market: string; people: number } | null> {
  const market = marketFor(data);
  if (!market) return null;
  const typed = `${data.industry ?? ""} ${data.audDesc ?? ""}`;
  const lists = listsFor(market, typed);
  if (!lists.length) return null;
  const outlets = new Map<string, Outlet>();
  for (const l of lists) for (const o of l.outlets) if (o.status === "active") outlets.set(o.domain, o);

  // Only the listing pages of the matched beat lists: a site in several lists
  // (arabnews.com) must not pour every section's writers into every beat.
  const pages = lists.flatMap((l) => l.outlets.filter((o) => o.status === "active").map((o) => o.pages[0]).filter(Boolean));
  const people = await readRoster({ domains: [...outlets.keys()], pages });
  if (people.length === 0) return null;
  const pool = people.slice(0, MAX_PEOPLE_IN_PROMPT);

  // Rank by index. A failed ranking still returns the newest people.
  let ranked: Array<{ p: RosterPerson; why: string; beat: string; tier: string }> = [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const lines = pool.map((p, i) =>
      `${i}. ${p.name} | ${p.outletDomain} | latest: "${p.articleTitle ?? "untitled"}" (${p.articleDate}) | ${p.articles} article(s) seen${p.role ? ` | role: ${p.role}` : ""}${p.current ? "" : " | LAST SEEN, may have moved"}`,
    );
    let prompt = `You are a media-relations strategist. Pick up to 8 journalists from the numbered list who best fit this story, best first.

STORY:
- Business: ${data.biz || "Not provided"}
- Beat / topic: ${data.industry || "Not provided"}
- The story: ${data.audDesc || "Not provided"}
- Geography: ${data.geo || "Not provided"}

JOURNALISTS (seen writing on these outlets' own pages):
${lines.join("\n")}

Rules: choose ONLY by number from the list. Base "why" only on the article titles shown (1-2 sentences, no invented facts). Prefer people not marked LAST SEEN. No em or en dashes.
Return ONLY a JSON array: [{"i": 0, "why": "", "beat": "their beat in a few words", "tier": "A, B or C"}]`;
    if (companyBrief) prompt += `\n${briefPromptBlock(companyBrief)}\nThe output format above still applies exactly.`;
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: RANK_MODEL, max_tokens: 1500, temperature: 0, messages: [{ role: "user", content: prompt }] }),
        signal: AbortSignal.timeout(25_000),
      });
      const json = (await res.json().catch(() => ({}))) as { content?: Array<{ type: string; text?: string }> };
      if (res.ok) {
        await recordAiUsage("journo-ai", RANK_MODEL, json);
        const text = (json.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
        const a = text.indexOf("["), z = text.lastIndexOf("]");
        const arr = a >= 0 && z > a ? (JSON.parse(text.slice(a, z + 1)) as Ranked[]) : [];
        const used = new Set<number>();
        for (const r of arr) {
          const i = typeof r.i === "number" ? r.i : Number(r.i);
          if (!Number.isInteger(i) || i < 0 || i >= pool.length || used.has(i)) continue;
          used.add(i);
          ranked.push({
            p: pool[i],
            why: typeof r.why === "string" ? r.why : "",
            beat: typeof r.beat === "string" ? r.beat : "",
            tier: ["A", "B", "C"].includes(String(r.tier)) ? String(r.tier) : "C",
          });
          if (ranked.length >= 8) break;
        }
      } else {
        console.warn(`[journo-roster-list] rank call HTTP ${res.status}`);
      }
    } catch (e) {
      console.warn("[journo-roster-list] rank failed, using newest:", e);
      ranked = [];
    }
  }
  if (!ranked.length) {
    ranked = pool.slice(0, 8).map((p) => ({ p, why: "", beat: "", tier: "B" }));
  }

  const candidates: Array<Record<string, unknown>> = ranked.map(({ p, why, beat, tier }) => {
    const outlet = outlets.get(p.outletDomain);
    const v: JournalistVerification = {
      status: p.current ? "verified" : "stale",
      name: p.name,
      outlet: p.outletDomain,
      bylineDomain: p.outletDomain,
      bylineUrl: p.articleUrl,
      bylineTitle: p.articleTitle,
      bylineDate: p.articleDate,
      roleAsOf: beat || null,
      note: p.current ? "Seen on the outlet's own pages." : "Last seen on the outlet's own pages; may have moved since.",
      checkedAt: p.readAt,
      cached: true,
      searchesUsed: 0,
    };
    return {
      name: p.name,
      url: p.outletDomain,
      why: why || `Writes for ${outlet?.name ?? p.outletDomain}; latest article: "${p.articleTitle ?? "untitled"}".`,
      beat,
      linkPage: p.articleUrl,
      contact: `Via ${p.outletDomain} (no verified handle)`,
      contactLinkedIn: "",
      seoNote: outlet?.name ?? p.outletDomain,
      tier,
      aiTier: tier,
      verification: v,
    };
  });

  // Room left: name the outlets with no named reporter as newsrooms, so the
  // user still gets the "find the reporter on the outlet's site" route.
  const named = new Set(ranked.map((r) => r.p.outletDomain));
  for (const o of outlets.values()) {
    if (candidates.length >= 8) break;
    if (named.has(o.domain) || o.blocksReading) continue;
    candidates.push({
      name: `${o.name} newsroom`, url: o.domain, why: "", beat: "", linkPage: "",
      contact: `Via ${o.domain}`, contactLinkedIn: "", seoNote: o.name, tier: "C",
    });
  }
  return { candidates, market, people: people.length };
}

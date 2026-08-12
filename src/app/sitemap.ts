import type { MetadataRoute } from "next";
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { getAllEpisodes } from "@/lib/podcast";

const BASE = "https://www.syedirfanajmal.com";

// Fallback used when a real date can't be determined (e.g. git history
// unavailable in the build environment). Keep this reasonably current.
const FALLBACK = new Date("2026-06-24T00:00:00Z");

const APP_DIR = path.join(process.cwd(), "src/app");

// Resolve the page source file for a route so we can read its last-edited date.
function pageFileFor(route: string): string | null {
  const dir = path.join(APP_DIR, route);
  for (const ext of ["tsx", "ts", "jsx", "js", "mdx"]) {
    const file = path.join(dir, `page.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

// Last commit date for a file. Honest per-page signal that survives fresh
// clones (unlike filesystem mtime). Falls back gracefully if git is absent.
function lastModFor(route: string): Date {
  const file = pageFileFor(route);
  if (!file) return FALLBACK;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? new Date(out) : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Primary pages. `route` is the path under src/app used to find the source
  // file; "" is the homepage. The leading-slash URL is derived from it.
  const pages = [
    { route: "",                                changeFrequency: "weekly"  as const, priority: 1.0 },
    { route: "about",                           changeFrequency: "monthly" as const, priority: 0.8 },
    { route: "speaking",                        changeFrequency: "monthly" as const, priority: 0.8 },
    { route: "emos-academy",                            changeFrequency: "weekly"  as const, priority: 0.9 },
    { route: "emos-academy/apply",                      changeFrequency: "monthly" as const, priority: 0.8 },
    { route: "fractional-cmo",                  changeFrequency: "monthly" as const, priority: 0.9 },
    { route: "resources",                       changeFrequency: "weekly"  as const, priority: 0.8 },
    { route: "contact",                         changeFrequency: "yearly"  as const, priority: 0.6 },
    { route: "strategy-call",                   changeFrequency: "monthly" as const, priority: 0.8 },
    { route: "podcast",                         changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "clients",                         changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "gallery",                         changeFrequency: "monthly" as const, priority: 0.5 },
    { route: "ventures",                        changeFrequency: "monthly" as const, priority: 0.5 },
    { route: "newsletter",                      changeFrequency: "yearly"  as const, priority: 0.5 },
    { route: "privacy",                         changeFrequency: "yearly"  as const, priority: 0.3 },
    { route: "terms",                           changeFrequency: "yearly"  as const, priority: 0.3 },
    { route: "refund-policy",                   changeFrequency: "yearly"  as const, priority: 0.3 },
    // Resource playbooks
    { route: "resources/personal-branding",     changeFrequency: "yearly"  as const, priority: 0.7 },
    { route: "resources/storytelling",          changeFrequency: "yearly"  as const, priority: 0.7 },
    { route: "resources/neuromarketing",        changeFrequency: "yearly"  as const, priority: 0.7 },
    { route: "resources/writing-tips",          changeFrequency: "yearly"  as const, priority: 0.7 },
    { route: "resources/authority-flywheel",    changeFrequency: "yearly"  as const, priority: 0.7 },
    // Infographics
    { route: "infographics",                    changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "infographics/writing-benefits",   changeFrequency: "yearly"  as const, priority: 0.6 },
    { route: "infographics/journo-outreach-checklist", changeFrequency: "yearly" as const, priority: 0.6 },
    { route: "infographics/bing-seo",           changeFrequency: "yearly"  as const, priority: 0.6 },
    // Tools (canonical public lead-magnet tools only — redirected /tools/collabiq removed)
    { route: "tools/signaliq",                  changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "tools/pressiq",                   changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "tools/partnercollabiq",           changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "tools/coverageiq",                changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "tools/authority-calculator",      changeFrequency: "yearly"  as const, priority: 0.5 },
    { route: "tools/journocollabiq",            changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "tools/signaliq/about",            changeFrequency: "yearly"  as const, priority: 0.4 },
    // Platform teaser pages (marketing explainers for EMOS-Platform-only tools)
    { route: "tools/assetiq",                   changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "tools/factcheckiq",               changeFrequency: "monthly" as const, priority: 0.6 },
    // Earned-media data pages (live SignalIQ coverage; refreshed daily)
    { route: "earned-media-radar",              changeFrequency: "daily"   as const, priority: 0.8 },
    { route: "founder-movers",                  changeFrequency: "daily"   as const, priority: 0.8 },
    { route: "ksa-tourism-radar",               changeFrequency: "daily"   as const, priority: 0.8 },
    { route: "ksa-retail-radar",                changeFrequency: "daily"   as const, priority: 0.8 },
  ];

  const staticEntries = pages.map(({ route, changeFrequency, priority }) => ({
    url: `${BASE}/${route}`,
    lastModified: lastModFor(route),
    changeFrequency,
    priority,
  }));

  // Podcast episode pages — use the real publication date per episode.
  const episodes = getAllEpisodes().map((ep) => ({
    url: `${BASE}/podcast/${ep.slug}`,
    lastModified: ep.publication_date ? new Date(ep.publication_date) : FALLBACK,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...episodes];
}

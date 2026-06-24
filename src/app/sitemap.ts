import type { MetadataRoute } from "next";
import { getAllEpisodes } from "@/lib/podcast";

const BASE = "https://www.syedirfanajmal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Primary pages
  const pages = [
    { url: "/",               changeFrequency: "weekly"  as const, priority: 1.0 },
    { url: "/about",          changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/speaking",       changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/emos",           changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: "/emos/apply",     changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/fractional-cmo", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "/resources",      changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: "/contact",        changeFrequency: "yearly"  as const, priority: 0.6 },
    { url: "/strategy-call",  changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/podcast",        changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/clients",        changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/gallery",        changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/ventures",       changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/newsletter",     changeFrequency: "yearly"  as const, priority: 0.5 },
    { url: "/privacy",        changeFrequency: "yearly"  as const, priority: 0.3 },
    { url: "/terms",          changeFrequency: "yearly"  as const, priority: 0.3 },
    { url: "/refund-policy",  changeFrequency: "yearly"  as const, priority: 0.3 },
    // Resource playbooks
    { url: "/resources/personal-branding", changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/storytelling",      changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/neuromarketing",    changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/writing-tips",      changeFrequency: "yearly" as const, priority: 0.7 },
    // Infographics
    { url: "/infographics",                          changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/infographics/writing-benefits",         changeFrequency: "yearly"  as const, priority: 0.6 },
    { url: "/infographics/journo-outreach-checklist", changeFrequency: "yearly" as const, priority: 0.6 },
    // Tools (canonical public lead-magnet tools only — redirected /tools/collabiq removed)
    { url: "/tools/signaliq",              changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/pressiq",               changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/partnercollabiq",       changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/coverageiq",            changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/authority-calculator",   changeFrequency: "yearly"  as const, priority: 0.5 },
    { url: "/tools/journocollabiq",         changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/signaliq/about",          changeFrequency: "yearly"  as const, priority: 0.4 },
  ];

  const staticEntries = pages.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Podcast episode pages
  const episodes = getAllEpisodes().map((ep) => ({
    url: `${BASE}/podcast/${ep.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...episodes];
}

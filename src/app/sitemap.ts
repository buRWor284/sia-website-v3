import type { MetadataRoute } from "next";

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
    { url: "/podcast",        changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/clients",        changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/gallery",        changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/ventures",       changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/newsletter",     changeFrequency: "yearly"  as const, priority: 0.5 },
    // Resource playbooks
    { url: "/resources/personal-branding", changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/storytelling",      changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/neuromarketing",    changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "/resources/writing-tips",      changeFrequency: "yearly" as const, priority: 0.7 },
    // Infographics
    { url: "/infographics",                          changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/infographics/writing-benefits",         changeFrequency: "yearly"  as const, priority: 0.6 },
    { url: "/infographics/journo-outreach-checklist", changeFrequency: "yearly" as const, priority: 0.6 },
    // Tools
    { url: "/tools/collabiq",              changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "/tools/authority-calculator",   changeFrequency: "yearly"  as const, priority: 0.5 },
  ];

  return pages.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}

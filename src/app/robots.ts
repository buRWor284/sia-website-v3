import type { MetadataRoute } from "next";

// Public pages are open to all crawlers; the API, the authenticated EMOS platform,
// and the academy pay page stay disallowed for everyone.
const DISALLOW = ["/api/", "/emos-platform/", "/emos-academy/pay"];

// AI / LLM crawlers we explicitly allow on public pages (locked policy: AI crawlers
// may READ public content, they still cannot RUN the JS + Turnstile gated tools).
// They are listed by name (not just left to inherit "*") so any future change that
// blocks them shows up as a diff. IMPORTANT: a named user-agent group ignores the
// "*" group entirely, so this group MUST repeat DISALLOW, or the platform and API
// would be silently exposed to these crawlers.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://www.syedirfanajmal.com/sitemap.xml",
  };
}

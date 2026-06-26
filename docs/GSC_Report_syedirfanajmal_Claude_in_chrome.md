# Google Search Console Detailed Report — syedirfanajmal.com
*Data period: Last 3 months (approx. 27 May – 24 Jun 2026)*

---

## 📊 1. OVERALL PERFORMANCE SUMMARY

| Metric | Value |
|---|---|
| Total Clicks (3 months) | **7** |
| Total Impressions (3 months) | **3,360** |
| Average CTR | **0.2%** |
| Average Position | **27.9** |

**Verdict: Critical underperformance.** The site is getting decent visibility (3,360 impressions) but almost nobody is clicking through. A 0.2% CTR is extremely low — the industry average for position 27 is roughly 1–2%, meaning you're converting impressions to clicks at about 1/10th the expected rate. Traffic has also been declining sharply since early June 2026.

---

## ✅ 2. WHAT IS WORKING

**Impression Volume is Solid**
The site generated 3,360 impressions over 3 months from 199 unique queries and 83 pages. Google is discovering and showing your content — the foundation is there.

**Top Performing Pages (Getting Clicks)**
These 7 pages are generating the only actual clicks:

| Page | Clicks | Impressions |
|---|---|---|
| /podcast/jason-forrest/ | 1 | 72 |
| /podcast/elvin-zhang-startups-sia-s01e04/ | 1 | 71 |
| /podcast/faisal-khan-interview/ | 1 | 43 |
| /website-guide-101-all-about-hosting-.../ | 1 | 36 |
| /testimonials/ | 1 | 18 |
| /podcast/news... (truncated) | 1 | 2 |
| /author/joceylnbrown/ | 1 | 1 |

Podcast episode pages are your best traffic drivers relative to their impressions.

**HTTPS Security: Clean**
0 Non-HTTPS URLs — the entire site is served securely over HTTPS. No critical security issues.

**No Manual Actions or Security Penalties**
No Google penalties detected. The site is in good standing with Google's manual review team.

**No Removals**
No pages have been temporarily removed from Google Search.

**Sitemaps Mostly Functional**
Two active sitemaps (submitted June 2026) are returning "Success" status and Google has discovered 66+ pages from each.

**Breadcrumbs: Clean**
1 valid breadcrumb, 0 invalid — structured data for breadcrumbs is working correctly.

**Internal Linking is Strong**
454 internal links across the site — solid internal link architecture.

**Geographic Reach**
Clicks are coming from Pakistan (43%), United States (29%), India (14%), and Singapore (14%) — showing international reach.

---

## ❌ 3. WHAT IS NOT WORKING

### 🔴 CRITICAL ISSUE #1: Massive Indexing Gap
**296 pages are NOT indexed vs. only 57 indexed (84% of your site is invisible to Google)**

The breakdown of why pages aren't indexed:

| Reason | Pages Affected |
|---|---|
| Discovered – currently not indexed | **97** |
| Page with redirect | **58** |
| Excluded by 'noindex' tag | **57** |
| Crawled – currently not indexed | **48** |
| Duplicate without user-selected canonical | **22** |
| Not found (404) | **13** |
| Redirect error | **1** |
| Duplicate, Google chose different canonical | **0** |

**What this means:**
- **97 pages are "Discovered but not indexed"** — Google knows about them but doesn't think they're worth indexing. This usually signals thin content, low quality, or insufficient authority.
- **48 pages are "Crawled but not indexed"** — Google crawled them but chose not to index. Again, likely thin or duplicate content.
- **57 pages have noindex tags** — intentionally excluded. This may be correct (tags, categories, author pages) but should be reviewed to ensure valuable content isn't accidentally blocked.
- **22 pages have duplicate content without canonical tags** — Google can't tell which version is the "official" one, so it may index none or the wrong one.
- **13 pages return 404 errors** — broken pages that should either be restored or redirected.
- **58 pages with redirects** — a high redirect count that may indicate URL migration issues.

### 🔴 CRITICAL ISSUE #2: Near-Zero Click-Through Rate on High-Impression Keywords

Your top query by impressions is getting zero clicks:

| Query | Clicks | Impressions | CTR |
|---|---|---|---|
| seo for bing | 0 | 460 | 0% |
| bing seo guide | 0 | 334 | 0% |
| bing seo optimization | 0 | 194 | 0% |
| bing seo guidelines | 0 | 167 | 0% |
| bing seo tips | 0 | 119 | 0% |
| seo bing | 0 | 119 | 0% |
| seo on bing | 0 | 100 | 0% |
| neuromarketing | 0 | 85 | 0% |
| bing seo | 0 | 73 | 0% |

The page `/the-ultimate-bing-seo-guide/` alone has **1,982 impressions and 0 clicks** — this is your single biggest missed opportunity. Your title/meta description is not compelling enough to earn a click even when Google shows it to users.

### 🔴 CRITICAL ISSUE #3: Very Low Average Position (27.9)
Average position 27.9 means you're ranking on roughly page 3 of Google results. Users rarely scroll to page 3. Almost all the pages ranking are doing so at positions too low to receive organic traffic.

### 🟡 SIGNIFICANT ISSUE #4: Traffic Drop in Late June
The chart clearly shows impressions peaked around June 6, 2026 (reaching ~240/day) and have since dropped sharply to near zero. GSC itself flagged this with a recommendation: "A page recently got fewer impressions than usual" — noting a **75% drop** in impressions for one key page (`syedirfanajmal.com/the...`).

### 🟡 SIGNIFICANT ISSUE #5: Broken Old Sitemap
The sitemap index from December 2019 (`sitemap_index.xml`) shows **"Couldn't fetch"** status. This old, unfetchable sitemap index (which reported 138 pages) should be removed or updated to avoid confusion.

### 🟡 SIGNIFICANT ISSUE #6: Extremely Low Backlink Profile
Total external links: only **13 from ~5 domains** (inform.click: 2, linkedin.com: 2, competethemes.com: 1, entrepreneur.com: 1, huffpost.com: 1). This is very thin. Google uses backlinks as a major authority signal — without them, rankings stay low regardless of content quality.

### 🟡 SIGNIFICANT ISSUE #7: No Core Web Vitals Data
GSC reports "Not enough usage data in the last 90 days" for both Mobile and Desktop Core Web Vitals. This is a consequence of too-low traffic volume — Google's Chrome UX Report (CrUX) requires a minimum traffic threshold. This makes it impossible to benchmark page experience.

### 🟡 SIGNIFICANT ISSUE #8: Desktop Traffic Dominates, Mobile CTR is Very Low
Desktop: 5 clicks / 2,246 impressions = 0.22% CTR
Mobile: 2 clicks / 1,081 impressions = 0.18% CTR
Tablet: 0 clicks / 28 impressions = 0%

Mobile users convert at an even lower rate — potential mobile usability issue or mobile SERP snippet problem.

---

## 🔧 4. PRIORITY ACTION PLAN

**Priority 1 — Fix the Bing SEO Guide page CTR (Biggest quick win)**
Rewrite the title tag and meta description for `/the-ultimate-bing-seo-guide/` immediately. With 1,982 impressions and 0 clicks, even a 2% CTR improvement would generate ~40 clicks from this one page alone. The snippet is clearly not enticing enough.

**Priority 2 — Audit and fix the 13 broken 404 pages**
These are live pages in Google's index returning errors. Find them, either restore the content or implement 301 redirects to relevant pages.

**Priority 3 — Resolve the 22 duplicate pages without canonicals**
Add proper `rel="canonical"` tags to these pages so Google knows which URL to index and rank.

**Priority 4 — Review the 57 "noindex" pages**
Audit every page tagged noindex. If any contain valuable content, remove the noindex tag and let Google index them.

**Priority 5 — Improve content quality for the 97 "discovered but not indexed" pages**
Google is choosing not to index 97 pages. These likely need significant content improvements, more depth, or better internal linking to signal their value.

**Priority 6 — Remove or fix the old 2019 sitemap**
Delete `sitemap_index.xml` from GSC (it was submitted in 2019 and can no longer be fetched) to keep your sitemap configuration clean.

**Priority 7 — Build backlinks aggressively**
13 external links is very low. Focus on getting featured in industry publications, guest posts, podcast directories, and resource pages. Backlinks are the #1 driver of ranking improvements at this stage.

**Priority 8 — Improve title tags and meta descriptions site-wide**
The overall 0.2% CTR across all queries suggests that snippets across the board are weak. Audit all top-impression pages and rewrite their titles and descriptions to be more compelling and action-oriented.

---

## 📋 5. SUMMARY TABLE

| Area | Status | Severity |
|---|---|---|
| Total Clicks | 7 in 3 months | 🔴 Critical |
| CTR | 0.2% | 🔴 Critical |
| Average Position | 27.9 | 🔴 Critical |
| Indexing (296 not indexed) | 84% not indexed | 🔴 Critical |
| 404 Errors | 13 pages | 🔴 Critical |
| Bing SEO Guide (1,982 impr, 0 clicks) | Wasted opportunity | 🔴 Critical |
| Backlinks | Only 13 external | 🟡 High |
| Traffic trend (declining) | Down ~75% | 🟡 High |
| Old sitemap "Couldn't fetch" | Stale sitemap | 🟡 Medium |
| Duplicate pages (22, no canonical) | Confused indexing | 🟡 Medium |
| Core Web Vitals | Insufficient data | 🟡 Medium |
| HTTPS | 0 issues | ✅ Good |
| Manual Actions | None | ✅ Good |
| Breadcrumbs | Valid | ✅ Good |
| Internal Links | 454 | ✅ Good |
| Sitemaps (active) | Success | ✅ Good |

The site has a solid technical foundation but is being severely held back by indexing issues, near-zero CTR on its best content, and a very thin backlink profile. Addressing the Bing SEO Guide CTR and the indexing/404 problems would be the fastest path to measurable improvement.

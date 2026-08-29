/* Evidence and logic behind the AI Visibility Checker, shown on /ai-visibility.
   Single source for the page: the site-score parts, the ten page-grade checks
   with the study behind each, what the tool refuses to score, the comparison
   with other tools, and the numbered sources. Keep the figures in sync with
   AEO-Module-Spec-v1.md and js/aeo-score.js in the extension. */

export type Source = { id: number; who: string; what: string; url: string };

export const SOURCES: Source[] = [
  { id: 1, who: "Ahrefs, 2026", what: "Schema markup and AI citations: 1,885 pages that added JSON-LD vs 4,000 matched controls, Aug 2025 to Mar 2026", url: "https://ahrefs.com/blog/schema-ai-citations/" },
  { id: 2, who: "SE Ranking, 2026", what: "How to optimize for ChatGPT: 129,000 domains, 216,524 pages, 20 niches", url: "https://seranking.com/blog/how-to-optimize-for-chatgpt/" },
  { id: 3, who: "Search Engine Journal, 2026", what: "Google drops FAQ rich results from Search (7 May 2026)", url: "https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/" },
  { id: 4, who: "Google Search Central", what: "AI features and your website: no special structured data or AI files required", url: "https://developers.google.com/search/docs/appearance/ai-features" },
  { id: 5, who: "SE Ranking, 2026", what: "How to optimize for AI Mode: 2.33M pages, 295K domains, 500K prompts", url: "https://seranking.com/blog/how-to-optimize-for-ai-mode/" },
  { id: 6, who: "Kevin Indig via Search Engine Land, 2025", what: "ChatGPT citation study: 18,012 sentence-verified citations from 3M responses", url: "https://searchengineland.com/chatgpt-citations-content-study-469483" },
  { id: 7, who: "Shashko, 2026", what: "Grounding-citation analysis: 42,971 citations on six AI platforms, 11,672 exact cited sentences", url: "https://hackmd.io/@A09fyOMpSD2VYIJodmXHqQ/r1eJyqthdbe" },
  { id: 8, who: "Semrush, 2025", what: "Content optimization for AI search: 304,805 cited URLs vs 921,614 ranking URLs, 13 text parameters", url: "https://semrush.com/blog/content-optimization-ai-search-study" },
  { id: 9, who: "Ahrefs, 2026", what: "Do AI assistants prefer fresh content: 17M citations across 7 platforms", url: "https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content" },
  { id: 10, who: "Ahrefs, 2025", what: "Brand web mentions vs AI Overview visibility: 75,000 brands", url: "https://ahrefs.com/blog/ai-overview-brand-correlation/" },
  { id: 11, who: "Surfer, 2025", what: "AI Overviews study: 405,576 AI Overviews", url: "https://surferseo.com/blog/ai-overviews-study/" },
  { id: 12, who: "Ahrefs, 2026", what: "llms.txt study: 137,000 domains with server logs", url: "https://ahrefs.com/blog/llmstxt-study/" },
  { id: 13, who: "Ahrefs, 2025", what: "Short vs long content in AI Overviews: 174K cited pages", url: "https://ahrefs.com/blog/short-vs-long-content-in-ai-overviews/" },
  { id: 14, who: "Otterly, 2026", what: "URL structure and AI citations: 1.03M URLs", url: "https://otterly.ai/blog/url-ai-citations-study/" },
  { id: 15, who: "Google Search Central", what: "Structured data general policies: markup must match visible content", url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies" },
  { id: 16, who: "OpenAI", what: "Overview of OpenAI crawlers: OAI-SearchBot, ChatGPT-User, GPTBot", url: "https://developers.openai.com/api/docs/bots" },
  { id: 17, who: "Search Engine Journal, 2026", what: "Anthropic's Claude bots: ClaudeBot, Claude-User, Claude-SearchBot", url: "https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/" },
  { id: 18, who: "Aggarwal et al., KDD 2024", what: "GEO: Generative Engine Optimization (lab benchmark; later replication found most methods ineffective)", url: "https://arxiv.org/pdf/2311.09735" },
];

export type SitePart = { k: string; pts: number; scope: string; d: string; why: string; src: number[] };

export const SITE_PARTS: SitePart[] = [
  { k: "Crawler access", pts: 40, scope: "site-wide", d: "Does robots.txt let the 16 AI crawlers in, or tell them to stay out? Search and user-triggered bots weigh more than training bots, because blocking those is what removes you from answers.", why: "OpenAI and Anthropic each document which of their bots feed search answers and which only train models; the split is theirs, not ours.", src: [16, 17] },
  { k: "JavaScript visibility", pts: 30, scope: "this page", d: "AI crawlers read the raw HTML, before scripts run. We compare the raw copy of the open page with the finished page and report what share of its words is invisible ink. Measured per page: a script-heavy product page and a static article on the same site score differently.", why: "Google's own guidance: if a page cannot be indexed with a snippet, it cannot appear in AI features.", src: [4] },
  { k: "llms.txt", pts: 5, scope: "site-wide", d: "A menu card for AI and agent readers. Checked for presence and format.", why: "Deliberately only 5 points. Across 137,000 domains, 97% of llms.txt files were never requested by any bot, and no study has found a citation correlation. Kept because OpenAI and Anthropic recommend it for agent workflows.", src: [12] },
  { k: "Metadata and sitemap", pts: 25, scope: "15 this page, 10 site-wide", d: "Title, description, canonical, Open Graph and structured data are read from the open page (15 points). The sitemap is one file for the whole site (10 points).", why: "Indexability basics. Structured data is counted here as a filing aid, not as an AI-citation lever (see what we refuse to score).", src: [4] },
];

export type Check = { code: string; label: string; pts: number; looks: string; finding: string; src: number[]; tag: "evidence" | "consensus" };

export const CHECKS: Check[] = [
  { code: "af", label: "A short, direct answer near the top of each section", pts: 15, looks: "One plain sentence of 6 to 20 words among the first two of each section, not a filler opener like 'In this article we will explore'.", finding: "44% of ChatGPT citations come from the first 30% of a page. The exact sentences AI quotes average 9.8 words and never exceed 17.", src: [6, 7], tag: "evidence" },
  { code: "as", label: "Sections of 80 to 250 words", pts: 10, looks: "Word count between one heading and the next. Stubs under 50 words and walls over 250 both lose points.", finding: "Sections of 120 to 180 words average 4.6 citations; sections under 50 words average 2.7.", src: [2, 5], tag: "evidence" },
  { code: "al", label: "Sentences of 20 words or fewer", pts: 8, looks: "Share of sentences at or under 20 words. The report quotes your longest sentence.", finding: "No cited sentence in 42,971 citations was longer than 17 words; 92% were under 20.", src: [7], tag: "evidence" },
  { code: "ax", label: "Lists, tables and definition sentences", pts: 12, looks: "Lists, tables and 'X is a...' sentences, about one per 400 words.", finding: "Pages with lists, tables or headings were matched to AI answers 91% of the time; prose-only pages 39%.", src: [7, 11], tag: "evidence" },
  { code: "an", label: "Specific numbers and statistics", pts: 12, looks: "Data points inside real sentences, per 1,000 words. Label numbers in graphics do not count.", finding: "Pages with 19 or more data points average 5.4 citations; pages with few average 2.8.", src: [2], tag: "evidence" },
  { code: "aq", label: "Quotes attributed to a named person", pts: 8, looks: "Quoted spans of four words or more with a name and a cue such as 'said' or a job title nearby.", finding: "Pages with expert quotes average 4.1 citations; pages without, 2.4.", src: [2], tag: "evidence" },
  { code: "ad", label: "A visible, recent updated date", pts: 10, looks: "The newest date on the page or in its schema; full marks within 3 months. A date that lives only in the schema, invisible to readers, earns at most 6 of 10. A schema date newer than the visible date, or one that equals the scan date, is flagged.", finding: "Content updated within three months averages 6.0 citations vs 3.6. AI-cited content is 25.7% fresher than organic results, except on Google AI Overviews, where freshness is neutral.", src: [2, 9], tag: "evidence" },
  { code: "au", label: "A named author readers can see", pts: 12, looks: "A visible byline, plus a credential line and a profile link. An author only in schema gets a quarter of the points.", finding: "Visible expertise and authorship signals were 30.6% more common on cited pages than on uncited ones, the second-largest text difference in the study.", src: [8], tag: "evidence" },
  { code: "ae", label: "Named people, companies, products and places", pts: 8, looks: "Share of capitalised names among all words.", finding: "Cited passages run about 20% proper nouns; ordinary text runs 5 to 8%.", src: [6], tag: "evidence" },
  { code: "ah", label: "No sales language", pts: 5, looks: "Share of sentences with promotional phrases ('game-changing', 'unlock', 'cutting-edge') or exclamation marks.", finding: "Promotional tone was the only text parameter negatively associated with being cited: 26% less common on cited pages.", src: [8], tag: "evidence" },
];

export type Refusal = { what: string; why: string; src: number[] };

export const REFUSALS: Refusal[] = [
  { what: "Schema markup (FAQPage, HowTo, Article) as a citation lever", why: "In the closest thing to a controlled test, 1,885 pages that added JSON-LD were compared with 4,000 matched controls for seven months: AI Overview citations fell 4.6% and ChatGPT and AI Mode did not move. Google removed FAQ rich results in May 2026 and says no special structured data is needed for AI features, so we list your schema, warn when it does not match the visible page, and give it no points.", src: [1, 2, 3, 4, 15] },
  { what: "Question-shaped headings", why: "Pages with question headings averaged 3.4 ChatGPT citations vs 4.3 for plain headings. What gets quoted is the direct answer under the heading, whatever its grammar, so we count them and say 'fine either way'.", src: [2, 5] },
  { what: "Word count", why: "Across 174,000 cited pages, length correlates with AI Overview citation at 0.04, and more than half of cited pages are under 1,000 words. We show the count and score nothing.", src: [13] },
  { what: "Links to other websites", why: "Whether a page links to domains of trust 70 or 100, the measured influence on being cited was almost zero. Nice for readers; not a lever.", src: [2] },
  { what: "Keyword-rich URLs and titles", why: "Across 1.03M URLs, path depth, length and 'how-to' or 'best' patterns showed no relationship with citations, and heavily keyword-matched titles were cited less. Not checked at all.", src: [14] },
  { what: "Reading grade level", why: "Citations are bimodal: very easy and very dense pages are both cited more than the middle. Sentence length is the usable signal, so that is what we score.", src: [7] },
];

export type CompareRow = { check: string; adobe: string; typical: string; ours: string; note?: string };

/* Adobe and the typical-extension columns describe public store listings and
   vendor documentation as of 28 August 2026, not hands-on tests. "Typical"
   means the four largest AEO/GEO audit extensions found on the Chrome Web
   Store that month, each with fewer than 1,000 users. */
export const COMPARE: CompareRow[] = [
  { check: "Which AI crawlers robots.txt blocks, with the exact line", adobe: "No", typical: "Partly", ours: "Yes, 16 bots" },
  { check: "Text hidden behind JavaScript", adobe: "Yes, its whole product", typical: "Some", ours: "Yes, 30 of 100 points" },
  { check: "A grade for the page's shape as an answer, with the sentence behind each verdict", adobe: "No", typical: "A number only", ours: "Yes, ten checks" },
  { check: "The study and figure behind each rule, on screen", adobe: "No", typical: "No", ours: "Yes" },
  { check: "Says what it refuses to score, and why", adobe: "No", typical: "No, most still reward schema", ours: "Yes" },
  { check: "Warns when FAQ schema or a schema date does not match the visible page", adobe: "No", typical: "No", ours: "Yes" },
  { check: "Knows a homepage is not an article (shows n/a instead of a bad grade)", adobe: "No", typical: "No", ours: "Yes" },
  { check: "Paints facts, filler and long sentences on the live page", adobe: "Highlights hidden blocks", typical: "One tool, per sentence", ours: "Yes, per sentence" },
  { check: "Corrected robots.txt, starter llms.txt, client report, share card, compare view", adobe: "No", typical: "Schema generators", ours: "Yes" },
  { check: "Tracks whether AI actually mentions your brand", adobe: "In its paid parent product", typical: "Some, with your own API key", ours: "No, on purpose: that is EMOS", note: "The biggest factor in every study, and unmeasurable from one page." },
];

/* The four largest AEO/GEO audit extensions on the Chrome Web Store on 28 Aug 2026,
   with their listed user counts that day. "Typical" in the table means these four. */
export const TYPICAL_SET = "SAGE (828 users), RankSEO (688), SellOnLLM (619) and Zicy (456), per their Chrome Web Store listings on 28 August 2026; Adobe's AI Content Visibility Checker listed 10,000+ users the same day. Columns describe public listings and documentation, not hands-on tests.";

export type Example = { where: string; line: string; instead: string };

export const EXAMPLES: Example[] = [
  { where: "Answer-first check on an article", line: "Under \"Bring this to your stage or team\": first sentence runs 27 words (\"I give talks and workshops on earned media and the Authority Flywheel, including...\"). Fix: open each section with one plain sentence of 6 to 20 words.", instead: "answer density: 72" },
  { where: "Sentence-length check on a news story", line: "Longest: 44 words: \"It's resulted in a public that's a little more on edge and panic about what's going on...\". No cited sentence in 42,971 was over 17.", instead: "readability: 58" },
  { where: "Honesty check on a page with hidden FAQ markup", line: "FAQPage schema lists 2 questions but 2 are not in the visible text (e.g. \"How much does the widget cost?\"). Google's policy: markup must match what people see.", instead: "FAQ schema: present (+10)" },
  { where: "Honesty check on a page with a bumped date", line: "The date robots see (2026-08-20) is newer than the date people see (2023-02-01). Keep them honest.", instead: "freshness: good" },
];

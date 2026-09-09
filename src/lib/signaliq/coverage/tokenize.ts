/**
 * SignalIQ — topic tokenizer for the GDELT Web News NGrams 3.0 BigQuery matcher.
 *
 * The webngrams dataset stores one row per WORD occurrence: `ngram` is the focal
 * word, `pre` is the snippet of text immediately before it, `post` the snippet
 * immediately after. To match a multi-word seed phrase we anchor on one word and
 * verify its neighbours in `pre` / `post`. Matching rules (build plan §5.1/§5.2,
 * derived from the webngrams docs):
 *
 *   1 word   →  ngram = word
 *   2 words  →  ngram = word1  AND  post STARTS WITH word2
 *   3+ words →  ngram = word2 (the anchor)  AND  pre ENDS WITH word1
 *                                           AND  post STARTS WITH (words 3..n)
 *
 * Tokenisation splits on whitespace ONLY, so hyphens and digits stay inside a
 * single token: "glp-1 drugs" → ["glp-1","drugs"] (2 words), "product-led growth"
 * → ["product-led","growth"] (2), "SOC 2 compliance" → ["soc","2","compliance"]
 * (3), "central bank digital currency" → 4 words. Punctuation is retained in the
 * ngrams themselves, so the raw token is the right thing to match on.
 *
 * The struct field names/order here MUST match the SELECT list and JOIN in
 * bigquery.ts (they are passed as a typed ARRAY<STRUCT> query parameter).
 *
 * LANGUAGE (2026-09-08). Until now the scan hard-coded `AND n.lang = 'en'` in
 * bigquery.ts, so every non-English seed matched NOTHING - which is the real
 * reason the six Arabic KSA probe seeds have read 0 since 2026-07-24. It was
 * never a tokenizer bug (this file is script-agnostic: lowercasing is a no-op on
 * Arabic and the split is whitespace-only).
 *
 * The fix is a per-seed language, not the removal of the filter. Removing it
 * outright would let an English phrase match inside a foreign-language article
 * and would silently change the history of every existing topic. Instead a seed
 * may carry a language prefix - "ar:<phrase>", "es:<phrase>" - which becomes
 * part of its canonical topic key, so a non-English topic can never collide with
 * an English homograph and every existing English row stays byte-identical.
 *
 * Cost: ZERO. BigQuery bills columns x partitions scanned, not rows returned,
 * and `lang` is already read by the query.
 */

/**
 * Seed language prefixes -> the literal stored in the webngrams `lang` column.
 *
 * ★ VERIFY BEFORE TRUSTING ANY NON-ENGLISH COUNT. GDELT's own writeup of the
 * ngram datasets describes LANG as full uppercase names ("ENGLISH", "ARABIC"),
 * but this pipeline has matched millions of articles with the literal 'en'
 * since 2026-07-20, so the BigQuery table clearly uses lowercase ISO-639-1
 * codes. English is therefore PROVEN; the others are inferred from it. Run the
 * one-day probe in the runbook (SELECT lang, COUNT(*) ... GROUP BY lang) and, if
 * the values turn out to be full names, change ONLY the right-hand side here.
 *
 * Chinese is deliberately absent: webngrams anchors on whitespace-delimited
 * words and Chinese does not separate words with spaces, so the pre/post
 * matching cannot be assumed to work. Probe it separately before adding it.
 */
export const LANGS: Record<string, string> = {
  en: "en",
  ar: "ar",
  es: "es",
  fr: "fr",
  id: "id", // ★ also the right code for MALAY: `ms` does not appear in the data.
  zh: "zh", // Simplified Chinese — 2nd largest language in webngrams.
  "zh-tw": "zh-TW", // Traditional Chinese, a separate value in the column.
  ja: "ja",
  th: "th",
};

/**
 * Languages that do NOT separate words with spaces, so a seed is tokenised into
 * CHARACTERS rather than whitespace words and re-joined with no separator.
 *
 * Verified against a real 2026-09-07 `zh` sample: webngrams stores one row per
 * CHARACTER for these languages (ngram = a single character, `pre`/`post` = the
 * raw character stream either side, no spaces). That means the existing 3+ token
 * matcher shape already works unchanged — anchor on the 2nd character, require
 * `pre` to end with the 1st and `post` to start with the rest. Worked example:
 * seed 拼多多 -> ngram=多, pre ENDS WITH 拼, post STARTS WITH 多, which matches the
 * sampled row (…一方面，拼 | 多 | 多长期坚持的…). Korean is deliberately NOT here:
 * it spaces its words.
 */
const CHAR_TOKENISED = new Set(["zh", "zh-tw", "ja", "th"]);

/** Minimum characters for a seed in a character-tokenised language. A 1- or
 *  2-character Chinese seed matches far too much ordinary prose to be usable —
 *  the CJK equivalent of seeding the English word "noon". */
export const MIN_CJK_CHARS = 3;

/** Default language for a seed with no prefix. */
export const DEFAULT_LANG = "en";

// No `s` flag: the repo targets pre-ES2018, and a seed never spans lines.
const LANG_PREFIX = /^([a-z]{2}(?:-[a-z]{2})?):([\s\S]+)$/;

/**
 * Split "ar:<phrase>" into its language code and phrase. An unknown or absent
 * prefix is NOT treated as a language - the whole string stays the phrase, so an
 * ordinary seed that happens to contain a colon is unaffected.
 */
export function splitSeedLang(seed: string): { lang: string; phrase: string } {
  const m = LANG_PREFIX.exec(seed.trim());
  if (m && Object.prototype.hasOwnProperty.call(LANGS, m[1])) {
    return { lang: m[1], phrase: m[2] };
  }
  return { lang: DEFAULT_LANG, phrase: seed };
}

/** Strip the language prefix for display. "ar:\u0646\u064a\u0648\u0645" -> "\u0646\u064a\u0648\u0645". */
export function displayTopic(topic: string): string {
  return splitSeedLang(topic).phrase;
}

export interface TopicMatcher {
  /** Canonical lowercased, single-spaced phrase — the join key into
   *  signaliq_daily_counts / signaliq_coverage_cache. */
  topic: string;
  /** Token count. */
  nwords: number;
  /** 1-word: the word. 2-word: the anchor (first word). Unused for 3+. */
  w1: string;
  /** 2-word: the suffix word (checked against `post`). 3+-word: the anchor. */
  w2: string;
  /** 3+-word only: the word that must END the ngram's `pre` snippet. */
  pre_w: string;
  /** 3+-word only: the text that must START the ngram's `post` snippet. */
  post_rest: string;
  /** The literal to match against webngrams `lang` (see LANGS). Default "en". */
  lang: string;
}

/**
 * Split a seed phrase into lowercased whitespace tokens, keeping hyphens, digits
 * and apostrophes inside a token. Collapses runs of whitespace and trims.
 */
export function tokenizeWords(phrase: string, langCode: string = DEFAULT_LANG): string[] {
  const lowered = phrase.toLowerCase().trim();
  if (CHAR_TOKENISED.has(langCode)) {
    // One token per character, whitespace dropped: webngrams indexes these
    // languages character by character. [...str] splits by code point, so
    // surrogate pairs are not torn in half.
    return [...lowered].filter((c) => !/\s/.test(c));
  }
  return lowered.split(/\s+/).filter(Boolean);
}

/** How tokens are re-joined into a canonical phrase: no separator for the
 *  character-tokenised languages, a single space everywhere else. */
function joiner(langCode: string): string {
  return CHAR_TOKENISED.has(langCode) ? "" : " ";
}

/**
 * Canonical form of a seed (lowercased, single-spaced) — the DB key. Non-English
 * seeds keep their language prefix ("ar:\u0646\u064a\u0648\u0645") so they can never collide with an
 * English homograph; English keys are unchanged, so existing rows still match.
 */
export function canonicalTopic(seed: string): string {
  const { lang, phrase } = splitSeedLang(seed);
  const body = tokenizeWords(phrase, lang).join(joiner(lang));
  return lang === DEFAULT_LANG ? body : `${lang}:${body}`;
}

/** Turn one seed phrase into its webngrams matcher struct. */
export function tokenizeTopic(seed: string): TopicMatcher {
  const { lang: code, phrase } = splitSeedLang(seed);
  const lang = LANGS[code] ?? LANGS[DEFAULT_LANG];
  const words = tokenizeWords(phrase, code);
  const sep = joiner(code);
  const body = words.join(sep);
  const topic = code === DEFAULT_LANG ? body : `${code}:${body}`;
  const nwords = words.length;

  if (nwords <= 1) {
    return { topic, nwords: Math.max(nwords, 1), w1: words[0] ?? "", w2: "", pre_w: "", post_rest: "", lang };
  }
  if (nwords === 2) {
    return { topic, nwords: 2, w1: words[0], w2: words[1], pre_w: "", post_rest: "", lang };
  }
  // 3+ words: anchor on the SECOND word; the word before it must end `pre`, and
  // the remaining tail (words 3..n) must start `post`.
  return {
    topic,
    nwords,
    w1: words[0],
    w2: words[1],
    pre_w: words[0],
    post_rest: words.slice(2).join(sep),
    lang,
  };
}

/**
 * Build the de-duped matcher list for a set of raw seeds. A seed that appears in
 * more than one beat is scanned once (dedupe on the canonical phrase). Empty /
 * unusable seeds are dropped.
 */
export function buildTopicMatchers(seeds: string[]): TopicMatcher[] {
  const byTopic = new Map<string, TopicMatcher>();
  for (const s of seeds) {
    const m = tokenizeTopic(s);
    if (!m.topic || !m.w1) continue;
    // A too-short seed in a character-tokenised language would match constantly.
    const { lang: code } = splitSeedLang(s);
    if (CHAR_TOKENISED.has(code) && m.nwords < MIN_CJK_CHARS) continue;
    if (!byTopic.has(m.topic)) byTopic.set(m.topic, m);
  }
  return [...byTopic.values()];
}

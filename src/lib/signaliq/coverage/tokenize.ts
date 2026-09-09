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
  ms: "ms",
  id: "id",
};

/** Default language for a seed with no prefix. */
export const DEFAULT_LANG = "en";

// No `s` flag: the repo targets pre-ES2018, and a seed never spans lines.
const LANG_PREFIX = /^([a-z]{2}):([\s\S]+)$/;

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
export function tokenizeWords(phrase: string): string[] {
  return phrase.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/**
 * Canonical form of a seed (lowercased, single-spaced) — the DB key. Non-English
 * seeds keep their language prefix ("ar:\u0646\u064a\u0648\u0645") so they can never collide with an
 * English homograph; English keys are unchanged, so existing rows still match.
 */
export function canonicalTopic(seed: string): string {
  const { lang, phrase } = splitSeedLang(seed);
  const body = tokenizeWords(phrase).join(" ");
  return lang === DEFAULT_LANG ? body : `${lang}:${body}`;
}

/** Turn one seed phrase into its webngrams matcher struct. */
export function tokenizeTopic(seed: string): TopicMatcher {
  const { lang: code, phrase } = splitSeedLang(seed);
  const lang = LANGS[code] ?? LANGS[DEFAULT_LANG];
  const words = tokenizeWords(phrase);
  const topic = code === DEFAULT_LANG ? words.join(" ") : `${code}:${words.join(" ")}`;
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
    post_rest: words.slice(2).join(" "),
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
    if (!byTopic.has(m.topic)) byTopic.set(m.topic, m);
  }
  return [...byTopic.values()];
}

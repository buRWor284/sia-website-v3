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
 */

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
}

/**
 * Split a seed phrase into lowercased whitespace tokens, keeping hyphens, digits
 * and apostrophes inside a token. Collapses runs of whitespace and trims.
 */
export function tokenizeWords(phrase: string): string[] {
  return phrase.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/** Canonical form of a seed (lowercased, single-spaced) — the DB key. */
export function canonicalTopic(phrase: string): string {
  return tokenizeWords(phrase).join(" ");
}

/** Turn one seed phrase into its webngrams matcher struct. */
export function tokenizeTopic(phrase: string): TopicMatcher {
  const words = tokenizeWords(phrase);
  const topic = words.join(" ");
  const nwords = words.length;

  if (nwords <= 1) {
    return { topic, nwords: Math.max(nwords, 1), w1: words[0] ?? "", w2: "", pre_w: "", post_rest: "" };
  }
  if (nwords === 2) {
    return { topic, nwords: 2, w1: words[0], w2: words[1], pre_w: "", post_rest: "" };
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

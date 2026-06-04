/**
 * PressIQ — Layer 1 deterministic metrics (no AI).
 * Pure functions; run identically in the browser (live meters) and the API route
 * (trusted recompute). Self-contained — no external NLP dependency.
 */

import { L1_BANDS } from "./config";
import type { BandResult, Layer1Metrics, Layer1Scored } from "./types";

// ── Tokenisation ──────────────────────────────────────────────────────────────

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/gi) ?? []) as string[];
}

/** Visual (whitespace-delimited) words containing a letter/digit — used for subject length. */
export function visualWordCount(text: string): number {
  return text.trim().split(/\s+/).filter((t) => /[a-z0-9]/i.test(t)).length;
}

export function sentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Heuristic syllable count (the standard vowel-group method with silent-e handling). */
export function syllablesIn(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  w = w.replace(/^y/, "");
  const groups = w.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

// ── Subjectivity proxy ──────────────────────────────────────────────────────────
// Lightweight lexical proxy: density of opinion/intensifier words. The nuanced
// "grounded vs ungrounded" judgement is made by the LLM (see scorePrompt.ts).
const SUBJECTIVE_LEXICON = new Set([
  "amazing", "awesome", "incredible", "revolutionary", "game-changing", "gamechanging",
  "best", "greatest", "world-class", "worldclass", "cutting-edge", "cuttingedge",
  "innovative", "leading", "premier", "stunning", "beautiful", "perfect", "ultimate",
  "unbelievable", "extraordinary", "phenomenal", "groundbreaking", "disruptive",
  "seamless", "powerful", "robust", "exciting", "thrilled", "passionate", "love",
  "hate", "terrible", "awful", "horrible", "fantastic", "remarkable", "exceptional",
  "very", "really", "extremely", "incredibly", "absolutely", "truly", "highly",
  "super", "massively", "hugely", "obviously", "clearly", "undoubtedly",
]);

export function subjectivityProxy(text: string): number {
  const ws = words(text);
  if (ws.length === 0) return 0;
  let hits = 0;
  for (const w of ws) if (SUBJECTIVE_LEXICON.has(w)) hits += 1;
  // Normalise: ~8%+ opinion-word density reads as highly subjective.
  return Math.min(1, hits / ws.length / 0.08);
}

// ── Subject line ────────────────────────────────────────────────────────────────

/** Use the explicit subject if provided, else parse the first non-empty line (D-8). */
export function resolveSubject(pitch: string, subject?: string): string {
  if (subject && subject.trim()) return subject.trim();
  const firstLine = pitch.split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? "";
  // Strip a leading "Subject:" label if the user pasted one.
  return firstLine.replace(/^subject\s*:\s*/i, "").trim();
}

// ── Core metrics ────────────────────────────────────────────────────────────────

export function computeMetrics(pitch: string, subject?: string): Layer1Metrics {
  const ws = words(pitch);
  const ss = sentences(pitch);
  const wordCount = ws.length;
  const sentenceCount = Math.max(1, ss.length);
  const syllableCount = ws.reduce((n, w) => n + syllablesIn(w), 0);

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

  const fkGrade = wordCount > 0
    ? 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
    : 0;
  const fkReadingEase = wordCount > 0
    ? 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    : 0;

  const questionCount = (pitch.match(/\?/g) ?? []).length;
  const subj = resolveSubject(pitch, subject);
  const subjectWordCount = visualWordCount(subj);

  // A closing question = a "?" in the last ~20% of the pitch.
  const tail = pitch.slice(Math.floor(pitch.length * 0.8));
  const hasClosingQuestion = tail.includes("?");

  // A statistic = a percent or a multi-digit number (cheap heuristic).
  const hasStatistic = /\d+(\.\d+)?\s?%/.test(pitch) || /\b\d{2,}\b/.test(pitch);

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    fkGrade: round1(fkGrade),
    fkReadingEase: round1(fkReadingEase),
    questionCount,
    subjectWordCount,
    subjectivity: round2(subjectivityProxy(pitch)),
    hasStatistic,
    hasClosingQuestion,
  };
}

// ── Band scoring ────────────────────────────────────────────────────────────────

/** Smooth 0..1 score: 1 inside `ideal`, tapering to 0 at the edges of `ok` (and beyond). */
function bandScore(v: number, ideal: [number, number], ok: [number, number]): number {
  if (v >= ideal[0] && v <= ideal[1]) return 1;
  if (v < ideal[0]) {
    if (v <= ok[0]) return clamp01((v - (ok[0] - (ideal[0] - ok[0]))) / Math.max(1, ideal[0] - ok[0]) * 0.5);
    return 0.5 + 0.5 * ((v - ok[0]) / Math.max(1, ideal[0] - ok[0]));
  }
  // v > ideal[1]
  if (v >= ok[1]) return clamp01(0.5 - 0.5 * ((v - ok[1]) / Math.max(1, ok[1] - ideal[1])));
  return 0.5 + 0.5 * ((ok[1] - v) / Math.max(1, ok[1] - ideal[1]));
}

function status(score: number): BandResult["status"] {
  if (score >= 0.85) return "ideal";
  if (score >= 0.5) return "ok";
  return "off";
}

export function scoreLayer1(m: Layer1Metrics): Layer1Scored {
  // Word count
  const wc = clamp01(
    m.wordCount > L1_BANDS.wordCount.hardMax
      ? Math.max(0, 0.4 - (m.wordCount - L1_BANDS.wordCount.hardMax) / 300)
      : m.wordCount < L1_BANDS.wordCount.warnMin
        ? Math.max(0, (m.wordCount / L1_BANDS.wordCount.warnMin) * 0.5)
        : bandScore(m.wordCount, L1_BANDS.wordCount.ideal, L1_BANDS.wordCount.ok),
  );

  // Subject length
  const sw = m.subjectWordCount === 0
    ? 0
    : bandScore(m.subjectWordCount, L1_BANDS.subjectWords.ideal, L1_BANDS.subjectWords.ok);

  // Reading grade — lower is better; only an upper bound matters.
  const rg = m.fkGrade <= L1_BANDS.readingGrade.ideal[1]
    ? 1
    : m.fkGrade >= L1_BANDS.readingGrade.penaltyAbove
      ? clamp01(0.3 - (m.fkGrade - L1_BANDS.readingGrade.penaltyAbove) / 12)
      : 1 - 0.7 * ((m.fkGrade - L1_BANDS.readingGrade.ideal[1]) / (L1_BANDS.readingGrade.penaltyAbove - L1_BANDS.readingGrade.ideal[1]));

  // Questions — 1 ideal; 2-3 fine; 0 weak; >3 penalised.
  const q = m.questionCount === L1_BANDS.questions.ideal
    ? 1
    : m.questionCount >= L1_BANDS.questions.ok[0] && m.questionCount <= L1_BANDS.questions.ok[1]
      ? 0.8
      : m.questionCount === 0
        ? 0.3
        : 0.4;

  // Subjectivity — moderate is fine; very high is the red flag.
  const subj = m.subjectivity <= 0.4 ? 1 : m.subjectivity >= 0.9 ? 0.3 : 1 - 0.7 * ((m.subjectivity - 0.4) / 0.5);

  const bands = {
    wordCount: band(m.wordCount, wc, `${m.wordCount} words · aim 100–150`),
    subjectWords: band(m.subjectWordCount, sw, `${m.subjectWordCount}-word subject · aim 6–9`),
    readingGrade: band(m.fkGrade, clamp01(rg), `Grade ${m.fkGrade} · aim ≤ 7`),
    questions: band(m.questionCount, q, `${m.questionCount} question${m.questionCount === 1 ? "" : "s"} · aim 1`),
    subjectivity: band(round2(m.subjectivity), subj, m.subjectivity > 0.6 ? "Opinion-heavy — back claims with data" : "Tone is grounded"),
  };

  const avg = (wc + sw + clamp01(rg) + q + subj) / 5;
  return { metrics: m, bands, score: Math.round(avg * 100) };
}

function band(value: number, score: number, hint: string): BandResult {
  return { value, status: status(score), score: round2(score), hint };
}

// ── helpers ────────────────────────────────────────────────────────────────────
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

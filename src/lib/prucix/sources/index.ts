/**
 * Prucix source registry. GDELT is the coverage denominator; the rest are
 * numerator signals. All adapters are no-key and fail soft (return null/[]),
 * so a flaky feed degrades a scan to `partial` rather than breaking it.
 */
export { gdeltCoverage } from "./gdelt";
export { hnSignal } from "./hackernews";
export { secSignal } from "./sec";
export { wikipediaSignal } from "./wikipedia";
export { arxivSignal } from "./arxiv";

import type { Signal } from "../types";
import { hnSignal } from "./hackernews";
import { secSignal } from "./sec";
import { wikipediaSignal } from "./wikipedia";
import { arxivSignal } from "./arxiv";

/** All numerator (signal) sources, in priority order. */
export const SIGNAL_SOURCES: ((seed: string) => Promise<Signal | null>)[] = [
  secSignal,
  hnSignal,
  wikipediaSignal,
  arxivSignal,
];

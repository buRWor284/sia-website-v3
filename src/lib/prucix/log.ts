/**
 * Prucix — flywheel logging stub (mirrors src/lib/pitch/log.ts).
 * MVP logs to the server console; swap for Postgres to accrue the
 * opportunity → pack → outcome dataset that becomes the real moat (RFP §14.3).
 * Set PRUCIX_LOG=off to silence.
 */
import type { Opportunity } from "./types";

export function logScan(beat: string, count: number): void {
  if (process.env.PRUCIX_LOG === "off") return;
  try {
    console.log(`[prucix] scan beat=${beat} opportunities=${count}`);
  } catch {
    /* noop */
  }
}

export function logPack(opp: Opportunity): void {
  if (process.env.PRUCIX_LOG === "off") return;
  try {
    console.log(`[prucix] pack opp=${opp.id} score=${opp.score} beat=${opp.beat}`);
  } catch {
    /* noop */
  }
}

/**
 * SignalIQ — flywheel logging stub (mirrors src/lib/pitch/log.ts).
 * MVP logs to the server console; swap for Postgres to accrue the
 * opportunity → pack → outcome dataset that becomes the real moat (RFP §14.3).
 * Set SIGNALIQ_LOG=off to silence.
 */
import type { Opportunity } from "./types";

export function logScan(beat: string, count: number): void {
  if (process.env.SIGNALIQ_LOG === "off") return;
  try {
    console.log(`[signaliq] scan beat=${beat} opportunities=${count}`);
  } catch {
    /* noop */
  }
}

export function logPack(opp: Opportunity): void {
  if (process.env.SIGNALIQ_LOG === "off") return;
  try {
    console.log(`[signaliq] pack opp=${opp.id} score=${opp.score} beat=${opp.beat}`);
  } catch {
    /* noop */
  }
}

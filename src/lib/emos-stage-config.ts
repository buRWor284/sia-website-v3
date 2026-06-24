/**
 * EMOS stage types and UI metadata.
 * Plain constants — no "use server", safe to import anywhere.
 *
 * Pipeline order: SignalIQ → AssetIQ → JournoCollabIQ → PressIQ → CoverageIQ
 */

export type EmosStage = "signal" | "asset" | "collab" | "press" | "coverage" | "full";

export type StageEventType =
  | "signal_saved"
  | "pack_generated"
  | "asset_created"
  | "journalist_saved"
  | "pitch_scored"
  | "pitch_logged"
  | "placement_confirmed";

export const STAGE_ORDER: EmosStage[] = ["signal", "asset", "collab", "press", "coverage", "full"];

/**
 * Numeric thresholds for stage progression.
 * Reaching the threshold for a stage unlocks the NEXT stage.
 * e.g. saving 3 signals (signal threshold) unlocks "asset" stage.
 */
export const STAGE_THRESHOLDS: Record<EmosStage, number> = {
  signal:   3,   // 3 signals saved    → unlocks AssetIQ
  asset:    1,   // 1 asset created    → unlocks JournoCollabIQ
  collab:   3,   // 3 journalists saved → unlocks PressIQ
  press:    5,   // 5 pitches scored   → unlocks CoverageIQ
  coverage: 10,  // 10 pitches tracked → unlocks Full EMOS
  full:     0,   // already at the top
};

/**
 * Compute the highest stage a user has EARNED based on activity counts.
 * Returns the stage they should currently be at (may be higher than DB value).
 */
export function computeEarnedStage(counts: {
  signals: number;
  assets: number;
  journalists: number;
  pitchesScored: number;
  pitchesTracked: number;
}): EmosStage {
  const { signals, assets, journalists, pitchesScored, pitchesTracked } = counts;
  if (pitchesTracked >= STAGE_THRESHOLDS.coverage) return "full";
  if (pitchesScored  >= STAGE_THRESHOLDS.press)    return "coverage";
  if (journalists    >= STAGE_THRESHOLDS.collab)   return "press";
  if (assets         >= STAGE_THRESHOLDS.asset)    return "collab";
  if (signals        >= STAGE_THRESHOLDS.signal)   return "asset";
  return "signal";
}

export const STAGE_META: Record<EmosStage, {
  label: string;
  tool: string;
  path: string;
  description: string;
  threshold: string;
  nextLabel: string;
}> = {
  signal:   {
    label:       "SignalIQ",
    tool:        "Story Detection",
    path:        "/emostool/dashboard/signaliq",
    description: "Scan open data for newsworthy signals. Save top opportunities.",
    threshold:   "Save 3 signals to advance to AssetIQ",
    nextLabel:   "AssetIQ",
  },
  asset:    {
    label:       "AssetIQ",
    tool:        "Linkable Asset Builder",
    path:        "/emostool/dashboard/assetiq",
    description: "Turn a signal into a linkable asset — report, calculator, quiz.",
    threshold:   "Create 1 asset to advance to JournoCollabIQ",
    nextLabel:   "JournoCollabIQ",
  },
  collab:   {
    label:       "JournoCollabIQ",
    tool:        "Journalist CRM",
    path:        "/emostool/dashboard/journocollabiq",
    description: "Build and manage journalist relationships. Track every touchpoint.",
    threshold:   "Save 3 journalists to advance to PressIQ",
    nextLabel:   "PressIQ",
  },
  press:    {
    label:       "PressIQ",
    tool:        "Pitch Scoring",
    path:        "/emostool/dashboard/pressiq",
    description: "Score and refine your pitches against 32-point journalist criteria.",
    threshold:   "Score 5 pitches to advance to CoverageIQ",
    nextLabel:   "CoverageIQ",
  },
  coverage: {
    label:       "CoverageIQ",
    tool:        "Pitch Tracking",
    path:        "/emostool/dashboard/coverageiq",
    description: "Track your full pitch pipeline from drafted to amplified.",
    threshold:   "Log 10 pitches to reach Full EMOS",
    nextLabel:   "Full EMOS",
  },
  full:     {
    label:       "EMOS Full",
    tool:        "Full Platform",
    path:        "/emostool/dashboard",
    description: "Complete earned media operating system unlocked.",
    threshold:   "All stages complete",
    nextLabel:   "",
  },
};

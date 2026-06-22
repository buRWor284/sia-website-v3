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

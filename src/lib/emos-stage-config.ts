/**
 * EMOS stage types and UI metadata.
 * Plain constants — no "use server", safe to import anywhere.
 */

export type EmosStage = "signal" | "press" | "collab" | "coverage" | "full";

export type StageEventType =
  | "signal_saved"
  | "pack_generated"
  | "pitch_scored"
  | "journalist_saved"
  | "pitch_logged"
  | "placement_confirmed";

export const STAGE_ORDER: EmosStage[] = ["signal", "press", "collab", "coverage", "full"];

export const STAGE_META: Record<EmosStage, {
  label: string;
  tool: string;
  description: string;
  threshold: string;
}> = {
  signal:   { label: "SignalIQ",       tool: "Signal Detection",   description: "Spot story opportunities before the news cycle.",  threshold: "Save 3 signals to unlock PressIQ" },
  press:    { label: "PressIQ",        tool: "Pitch Scoring",      description: "Score and refine your pitches with AI.",           threshold: "Score 5 pitches to unlock JournoCollabIQ" },
  collab:   { label: "JournoCollabIQ", tool: "Journalist CRM",     description: "Build and manage journalist relationships.",       threshold: "Save 5 journalists to unlock CoverageIQ" },
  coverage: { label: "CoverageIQ",     tool: "Pitch Tracking",     description: "Track your full pitch pipeline and placements.",   threshold: "Log 10 pitches to reach Full EMOS" },
  full:     { label: "EMOS Full",      tool: "Full Platform",      description: "Complete earned media operating system unlocked.", threshold: "All stages complete" },
};

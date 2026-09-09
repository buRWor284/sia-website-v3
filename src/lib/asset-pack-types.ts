/**
 * Saved SignalIQ asset pack — the shape read back out of signaliq_asset_packs.
 *
 * Kept out of the actions file because a `"use server"` file may only export
 * async functions (AGENTS.md critical rules).
 */

import type { ChartSpec, JournalistLead } from "@/lib/signaliq/types";

export interface DbAssetPack {
  id: string;
  company_id: string | null;
  company_name: string | null;   // resolved from companies at read time
  signal_id: string | null;
  headline: string | null;
  beat_label: string | null;
  pitch_angle: string | null;
  story_brief: string | null;
  subject_line: string | null;
  linkable_asset_idea: string | null;
  journalist_recs: JournalistLead[] | null;
  cautions: string[] | null;
  sources: { label: string; url: string }[] | null;
  chart_data: ChartSpec | null;
  created_at: string;
}

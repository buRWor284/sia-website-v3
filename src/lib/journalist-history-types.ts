/**
 * Prior-contact history for a journalist — the data behind the duplicate-pitch
 * warning (2026-09-09).
 *
 * Why this lives in EMOS and not in an outreach tool: Mailshake dedupes within
 * one campaign list. It cannot know that Reem was pitched for the retail radar
 * under one company in September and so should not receive the tourism radar
 * from the same sender in October. Only the layer holding company + asset +
 * angle can answer that. See EMOS-Architecture-Decisions-2026-09-09.md.
 */

export interface JournalistHistory {
  journalistId: string;
  /** Most recent time this journalist was pitched or scored against. */
  lastPitchedAt: string | null;
  /** The company that last pitch was for, when it is known. */
  lastCompanyId: string | null;
  lastCompanyName: string | null;
  /** Total scored pitches recorded against this journalist. */
  pitchCount: number;
}

/** Days below which a repeat approach to the SAME company is worth warning about. */
export const REPEAT_WARN_DAYS = 30;

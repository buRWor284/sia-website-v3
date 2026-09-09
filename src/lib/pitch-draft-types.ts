/**
 * Saved pitch drafts (2026-09-09).
 *
 * Drafts are persisted because regenerating produces A draft, not THAT draft —
 * cost and equivalence are different things, and the pitch the user liked is
 * otherwise unreproducible. Sending also happens later and elsewhere, so the
 * draft has to survive the gap.
 */

export interface DbPitchDraft {
  id: string;
  journalist_id: string | null;
  journalist_name: string | null;
  company_id: string | null;
  asset_id: string | null;
  subject: string;
  body: string;
  angle: string | null;
  status: "draft" | "sent" | "discarded";
  created_at: string;
  updated_at: string;
}

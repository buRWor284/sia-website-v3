-- ============================================================================
-- SignalIQ — Signal Library attribution
-- Run once in the Supabase SQL editor (or psql) against the EMOS database.
--
-- Adds the company/startup a saved signal was scanned for, the founder's
-- description at scan time, and the scan category (beat label) — so saved
-- signals are findable by what they were for.
--
-- Delete is already permitted by the existing `org_isolation` policy
-- (FOR ALL USING org_id = get_current_org_id()), so no RLS change is needed.
-- ============================================================================

ALTER TABLE signaliq_signals
  ADD COLUMN IF NOT EXISTS company_name    TEXT,
  ADD COLUMN IF NOT EXISTS company_context TEXT,
  ADD COLUMN IF NOT EXISTS scan_category   TEXT;

-- Backfill the category for existing rows from the linked beat name, if present.
UPDATE signaliq_signals s
SET scan_category = b.name
FROM signaliq_beats b
WHERE s.beat_id = b.id
  AND s.scan_category IS NULL;

-- Speed up "show me everything I scanned for company X".
CREATE INDEX IF NOT EXISTS idx_signaliq_signals_company
  ON signaliq_signals (org_id, company_name);

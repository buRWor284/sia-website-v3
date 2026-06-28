-- ============================================================================
-- AssetIQ — proper signal_id FK on linkable_assets
-- Run once in the Supabase SQL editor against the EMOS database.
--
-- Replaces the "signal:<id>:<headline>\n" description-prefix hack with
-- a proper signal_id foreign key + signal_headline text column.
-- Safe to re-run: uses IF NOT EXISTS / idempotent UPDATE WHERE.
-- ============================================================================

ALTER TABLE linkable_assets
  ADD COLUMN IF NOT EXISTS signal_id       UUID REFERENCES signaliq_signals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS signal_headline TEXT;

-- Backfill from existing "signal:<id>:<headline>\n<rest>" description prefixes.
-- Format: signal:{uuid}:{headline up to 100 chars}\n{optional real description}
UPDATE linkable_assets
SET
  signal_id       = (substring(description FROM '^signal:([^:]+):'))::uuid,
  signal_headline = substring(description FROM '^signal:[^:]+:([^\n]*)'),
  description     = CASE
    WHEN description SIMILAR TO 'signal:[^\n]+\n%'
      THEN substring(description FROM position(E'\n' IN description) + 1)
    ELSE
      NULL  -- prefix-only row had no real description
    END
WHERE description LIKE 'signal:%'
  AND signal_id IS NULL;  -- skip rows already backfilled if re-run

-- Speed up "show me assets linked to signal X"
CREATE INDEX IF NOT EXISTS idx_linkable_assets_signal_id
  ON linkable_assets (signal_id)
  WHERE signal_id IS NOT NULL;

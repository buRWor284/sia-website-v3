-- ============================================================================
-- SignalIQ — add fit column to saved signals
-- Run once in the Supabase SQL editor against the EMOS database.
--
-- Adds the company-fit rating (high / medium / low) that the LLM assigns to
-- each scanned topic, so saved signals show their fit badge in the Library.
-- ============================================================================

ALTER TABLE signaliq_signals
  ADD COLUMN IF NOT EXISTS fit TEXT CHECK (fit IN ('high', 'medium', 'low'));

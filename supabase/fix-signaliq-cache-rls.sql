-- ============================================================================
-- FIX: enable RLS on signaliq_coverage_cache / signaliq_cron_meta
--
-- Confirmed via live Supabase Advisor query (08 Jul 2026, project
-- emos-platform / edwdiajpwesvhunalpos) that these two tables have RLS fully
-- disabled. Unlike academy_courses/academy_modules (see fix-academy-rls.sql),
-- these tables were never in a tracked SQL file at all — they must have been
-- created directly in the Supabase SQL editor or dashboard and never
-- committed to the repo. This file both fixes the RLS gap and gives them a
-- permanent record in git.
--
-- signaliq_coverage_cache: shared news-coverage stats keyed by topic, no
--   org_id — same data for every org, populated by a server-side cron job.
-- signaliq_cron_meta: internal cron bookkeeping (e.g. last-run timestamp),
--   no org_id.
--
-- Verified in src/lib/signaliq/coverage-store.ts: EVERY read and write to
-- both tables already goes through createSupabaseServiceClient() (the
-- service-role key, which bypasses RLS regardless of policies). Nothing in
-- the app touches these tables with the anon/authenticated key. So both are
-- locked down completely, matching the existing rate_limits /
-- stripe_subscriptions pattern (RLS on, zero policies) — zero functional
-- impact on the app, since service_role always bypasses RLS.
--
-- Run once in Supabase -> SQL Editor -> New query, then click Run.
-- ============================================================================

ALTER TABLE signaliq_coverage_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE signaliq_cron_meta      ENABLE ROW LEVEL SECURITY;

-- No policies on either table -> RLS on + zero policies blocks anon and
-- authenticated entirely; only service_role (used by coverage-store.ts) can
-- read or write. Confirmed safe: nothing else in the codebase queries these
-- tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC: confirm after running.
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname IN ('signaliq_coverage_cache','signaliq_cron_meta');
--
-- After applying: re-check the Radar/coverage-scoring flow and the cron
-- refresher (/api/signaliq/refresh-coverage) both still work — they should,
-- since both go through the service-role client, which bypasses RLS.

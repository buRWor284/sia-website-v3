-- ============================================================================
-- FIX: enable RLS on academy_courses / academy_modules
--
-- Supabase Advisor flagged "Table publicly accessible" (rls_disabled_in_public)
-- on the emos-platform project (06 Jul 2026). Root cause: these two tables were
-- deliberately designed as global/non-org-scoped content (see
-- EMOS-Database-Schema.sql §7, "Global content — not org-scoped"), so they were
-- left out of the §8 RLS block along with every other table. That was correct
-- in intent (course catalog should be publicly readable) but wrong in
-- execution — with RLS fully OFF, the anon/public API key can also INSERT,
-- UPDATE, and DELETE rows, not just SELECT them.
--
-- This turns RLS on and adds a read-only public policy so the catalog stays
-- readable but is no longer publicly writable. Only the service role (used by
-- trusted backend code) can write.
--
-- Run once in Supabase → SQL Editor → New query, then click Run.
-- Safe to re-run (CREATE POLICY IF NOT EXISTS pattern via DROP+CREATE).
-- ============================================================================

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_courses" ON academy_courses;
CREATE POLICY "public_read_published_courses" ON academy_courses
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "public_read_modules_of_published_courses" ON academy_modules;
CREATE POLICY "public_read_modules_of_published_courses" ON academy_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academy_courses c
      WHERE c.id = academy_modules.course_id
        AND c.is_published = true
    )
  );

-- No INSERT/UPDATE/DELETE policies are added on purpose — with RLS on and no
-- write policy, the anon/authenticated roles are blocked from writing. Only
-- the service_role key (server-side only, bypasses RLS) can write, which
-- matches how the academy_courses/academy_modules content is actually managed.

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC: confirm after running the fix above.
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Confirm RLS is now on for both tables:
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('academy_courses','academy_modules');
--
-- 2. Confirm published courses/modules are still readable with the anon key
--    (run from the app or Supabase API docs "Run" panel, not the SQL editor,
--    since SQL editor runs as an elevated role and bypasses RLS either way).

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: get_current_org_id() — add sub-based fallback
--
-- The original function only reads org_id from JWT claims, which Clerk's
-- default session token does NOT include. This version falls back to looking
-- up the user's org by their Clerk user ID (the `sub` claim), which IS always
-- present in a Clerk JWT.
--
-- Run this in Supabase → SQL Editor → New query, then click Run.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    -- 1. Try the org_id claim directly (present when using a Clerk org-scoped token)
    (current_setting('request.jwt.claims', true)::jsonb->>'org_id')::UUID,
    -- 2. Fall back: look up the user's org by their Clerk user ID (sub claim)
    (
      SELECT org_id
      FROM   users
      WHERE  clerk_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
      LIMIT  1
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC: run these SELECT statements after applying the fix above to
-- confirm your seed data is present and RLS is resolving correctly.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Confirm your org exists
SELECT id, name, slug, emos_stage FROM organizations;

-- 2. Confirm journalists were inserted
SELECT id, name, outlet FROM journalists LIMIT 5;

-- 3. Confirm pitches were inserted
SELECT id, subject, stage FROM coverageiq_pitches LIMIT 5;

-- 4. Confirm alerts were inserted
SELECT id, title, status FROM coverageiq_alerts;

-- ============================================================================
-- SignalIQ — BigQuery coverage migration, Phase 2 schema (build plan §4).
--
-- APPLIED to emos-platform (edwdiajpwesvhunalpos) on 2026-07-20 via the Supabase
-- MCP as migration `signaliq_bigquery_coverage_phase2`. This file is the git
-- record; running it again is safe (idempotent).
--
-- Replaces the starved GDELT DOC-API coverage pipeline with GDELT Web News
-- NGrams 3.0 queried in BigQuery. ONE scan covers every topic per day, so the
-- pipeline accumulates raw daily counts here and derives volume/trend from its
-- own history.
--
-- Security posture matches signaliq_coverage_cache / signaliq_cron_meta:
-- RLS ON + zero policies -> only the service-role cron client can read or write
-- (service_role bypasses RLS). Verified: has_table_privilege('service_role', …,
-- 'INSERT') = true on both new tables.
-- ============================================================================

-- One row per (topic, day): raw BigQuery webngrams counts. Idempotent day-scans
-- (re-running a day overwrites the same rows via the composite PK).
create table if not exists signaliq_daily_counts (
  topic         text        not null,   -- canonical seed phrase, lowercased
  day           date        not null,
  article_count integer     not null default 0,  -- COUNT(1) occurrences per Phase 0
  matcher       text        not null default 'webngrams_v1', -- provenance; never mix matchers in one window
  scanned_at    timestamptz not null default now(),
  primary key (topic, day)
);
create index if not exists idx_sdc_day on signaliq_daily_counts (day);

-- Bookkeeping: which days have been scanned (drives the day-cursor) + cost watch.
create table if not exists signaliq_scan_log (
  day            date primary key,
  topics_matched integer,
  bytes_billed   bigint,          -- from BigQuery job metadata; watch this trend
  duration_ms    integer,
  created_at     timestamptz not null default now()
);

-- Version flag on the existing coverage cache. Existing DOC-API rows become v1;
-- the BigQuery pipeline writes v2. The scorer reads only the ACTIVE version
-- (ACTIVE_COVERAGE_VERSION in coverage-store.ts). Bump the active version at
-- cutover (after the parity week + scoring re-baseline) so old (0..1 normalised)
-- and new (raw-count) coverage semantics can never be compared by scoring.
alter table signaliq_coverage_cache
  add column if not exists coverage_version smallint not null default 1;

alter table signaliq_daily_counts enable row level security;
alter table signaliq_scan_log     enable row level security;

grant all on table signaliq_daily_counts to service_role;
grant all on table signaliq_scan_log     to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC (run after applying):
--   select has_table_privilege('service_role','public.signaliq_daily_counts','INSERT');
--   select column_name from information_schema.columns
--     where table_name='signaliq_coverage_cache' and column_name='coverage_version';
-- ─────────────────────────────────────────────────────────────────────────────

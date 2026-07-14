-- supabase/factcheck-schema.sql
-- FactcheckIQ | Phase 1 schema (per FactcheckIQ-Build-Plan-v2.md §5)

create table fact_check_runs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id),
  user_id         text not null,                  -- Clerk sub
  title           text,
  mode            text not null check (mode in ('citation','full')),
  input_type      text not null check (input_type in ('paste','markdown','url')),
  input_excerpt   text,
  source_url      text,                           -- when input_type = 'url'
  status          text not null default 'queued'
                    check (status in ('queued','running','done','error')),
  progress        jsonb,                          -- {phase, claimsDone, claimsTotal}
  verdict_counts  jsonb,
  readiness       text,
  flags           jsonb,                          -- injection attempts, skipped claims, fetch failures
  report_md       text,
  cost_cents      integer,
  searches_used   integer,                        -- metered spend, logged per run
  error           text,
  created_at      timestamptz default now(),
  completed_at    timestamptz
);

create table fact_check_claims (
  id           uuid primary key default gen_random_uuid(),
  run_id       uuid not null references fact_check_runs(id) on delete cascade,
  org_id       uuid not null references organizations(id),
  claim_text   text not null,
  claim_type   text check (claim_type in ('statistic','citation','quote','fact','logic')),
  section      text,
  risk         text check (risk in ('low','medium','high')),
  status       text not null default 'checked'
                 check (status in ('checked','skipped')),   -- over-cap honesty
  verdict      text check (verdict in
                 ('verified','partly_accurate','misleading',
                  'unverifiable','inaccurate','fabricated')),
  sources      jsonb,        -- [{url, tier, quote, publisher, as_of}]  <- corroboration lives here
                             -- quote is REQUIRED: the exact matched sentence/cell from the source,
                             -- not a pass/fail assertion; as_of pins live data (StatCounter etc.)
  source_url   text,         -- primary link for the table view (first of sources)
  source_tier  smallint,
  evidence     text,
  note         text,
  created_at   timestamptz default now()
);

-- Indexes
create index fact_check_runs_org_created_idx on fact_check_runs (org_id, created_at desc);
create index fact_check_claims_run_idx on fact_check_claims (run_id);

-- RLS
alter table fact_check_runs enable row level security;
alter table fact_check_claims enable row level security;

create policy fact_check_runs_org_isolation on fact_check_runs
  using (org_id = get_current_org_id());

create policy fact_check_claims_org_isolation on fact_check_claims
  using (org_id = get_current_org_id());

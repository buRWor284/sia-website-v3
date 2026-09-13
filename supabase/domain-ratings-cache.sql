-- 2026-09-13: cache for Ahrefs Domain Rating (free DR endpoint). Applied live
-- via Supabase MCP apply_migration as `domain_ratings_cache`. Not tenant
-- data: a domain's DR is the same for every org, so one row per domain, no
-- org_id. Written only by the service client from lib/ahrefs-dr.ts; RLS on
-- with no policies so the anon/authenticated roles cannot read or write it.
-- Attribution "Domain Rating by Ahrefs" is required wherever dr is shown.
create table if not exists public.domain_ratings (
  domain      text primary key,
  dr          integer check (dr between 0 and 100),
  fetched_at  timestamptz not null default now(),
  error       text
);
alter table public.domain_ratings enable row level security;
grant select, insert, update, delete on public.domain_ratings to service_role;

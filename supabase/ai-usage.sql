-- ai_usage — the stage 3 cost log (2026-09-10).
-- APPLIED to production (edwdiajpwesvhunalpos) as migration `ai_usage_cost_log`
-- on 2026-09-10. Kept here as the record, and for the reporting queries below.
-- Written by src/lib/ai-usage.ts (one row per billed Anthropic call).

create table if not exists public.ai_usage (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  org_id                      uuid references public.organizations(id) on delete set null,  -- NULL = anonymous public run
  clerk_user_id               text,
  surface                     text not null check (surface in ('platform', 'public', 'unattributed')),
  tool                        text not null,
  model                       text not null,
  input_tokens                integer not null default 0,
  output_tokens               integer not null default 0,
  cache_creation_input_tokens integer not null default 0,
  cache_read_input_tokens     integer not null default 0,
  web_search_requests         integer not null default 0,
  cost_usd                    numeric(12, 6),          -- NULL = no known price, never read as free
  price_version               text not null,
  stop_reason                 text
);
create index if not exists ai_usage_org_created_idx  on public.ai_usage(org_id, created_at desc);
create index if not exists ai_usage_tool_created_idx on public.ai_usage(tool, created_at desc);
alter table public.ai_usage enable row level security;
drop policy if exists org_isolation on public.ai_usage;
create policy org_isolation on public.ai_usage for all using (org_id = get_current_org_id());
grant select on public.ai_usage to authenticated;
grant select, insert, update, delete on public.ai_usage to service_role;

-- ── Reporting ──────────────────────────────────────────────────────────────

-- 1. What one run of each tool costs (the per-run question).
select tool, surface, model,
       count(*)                                   as runs,
       round(avg(cost_usd), 4)                    as avg_usd_per_run,
       round(percentile_cont(0.9) within group (order by cost_usd)::numeric, 4) as p90_usd,
       round(avg(input_tokens))                   as avg_in,
       round(avg(output_tokens))                  as avg_out,
       count(*) filter (where cost_usd is null)   as unpriced_runs
from public.ai_usage
where created_at > now() - interval '30 days'
group by 1, 2, 3
order by 1, 2;

-- 2. What each organisation cost in the last 30 days (the per-subscriber question).
select o.name, u.org_id, count(*) as calls, round(sum(u.cost_usd), 2) as usd_30d
from public.ai_usage u
left join public.organizations o on o.id = u.org_id
where u.created_at > now() - interval '30 days' and u.surface = 'platform'
group by 1, 2
order by usd_30d desc nulls last;

-- 3. What the free public tools cost (lead-magnet spend).
select tool, count(*) as runs, round(sum(cost_usd), 2) as usd_30d
from public.ai_usage
where surface = 'public' and created_at > now() - interval '30 days'
group by 1 order by usd_30d desc nulls last;

-- 4. Anything logged outside a route wrapper (should stay empty).
select tool, count(*) from public.ai_usage where surface = 'unattributed' group by 1;

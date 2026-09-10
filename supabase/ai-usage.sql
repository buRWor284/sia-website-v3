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

-- ── Admin report functions ────────────────────────────────────────────────
-- Used by /emos-platform/admin/costs. SERVICE ROLE ONLY (they read every org).
-- v1 applied 2026-09-10 as `admin_ai_usage_reports`; replaced the same day by
-- `admin_ai_usage_reports_test_filter` (below), which adds p_include_test
-- (default false = hide organizations.is_test accounts), owner emails for
-- labelling, and the recent-calls function. The one-argument versions were
-- DROPPED so a call naming only p_since is not ambiguous.

drop function if exists public.admin_ai_usage_by_tool(timestamptz);
drop function if exists public.admin_ai_usage_by_org(timestamptz);

create or replace function public.admin_ai_usage_by_tool(p_since timestamptz, p_include_test boolean default false)
returns table (tool text, surface text, model text, runs bigint, total_usd numeric, avg_usd numeric,
               p90_usd numeric, avg_in numeric, avg_out numeric, unpriced bigint)
language sql stable security invoker set search_path = public as $$
  select a.tool, a.surface, a.model, count(*), coalesce(sum(a.cost_usd), 0), avg(a.cost_usd),
         (percentile_cont(0.9) within group (order by a.cost_usd))::numeric,
         avg(a.input_tokens), avg(a.output_tokens), count(*) filter (where a.cost_usd is null)
  from public.ai_usage a left join public.organizations o on o.id = a.org_id
  where a.created_at >= p_since and (p_include_test or coalesce(o.is_test, false) = false)
  group by a.tool, a.surface, a.model order by coalesce(sum(a.cost_usd), 0) desc
$$;

create or replace function public.admin_ai_usage_by_org(p_since timestamptz, p_include_test boolean default false)
returns table (org_id uuid, org_name text, is_test boolean, owner_email text,
               calls bigint, total_usd numeric, first_call timestamptz, last_call timestamptz)
language sql stable security invoker set search_path = public as $$
  select a.org_id, o.name, coalesce(o.is_test, false),
         (select string_agg(u.email, ', ' order by u.created_at) from public.users u where u.org_id = a.org_id),
         count(*), coalesce(sum(a.cost_usd), 0), min(a.created_at), max(a.created_at)
  from public.ai_usage a left join public.organizations o on o.id = a.org_id
  where a.created_at >= p_since and a.org_id is not null
    and (p_include_test or coalesce(o.is_test, false) = false)
  group by a.org_id, o.name, o.is_test order by coalesce(sum(a.cost_usd), 0) desc
$$;

create or replace function public.admin_ai_usage_recent(p_since timestamptz, p_include_test boolean default false, p_limit integer default 25)
returns table (created_at timestamptz, org_id uuid, org_name text, is_test boolean, owner_email text,
               surface text, tool text, model text, input_tokens integer, output_tokens integer,
               cost_usd numeric, stop_reason text)
language sql stable security invoker set search_path = public as $$
  select a.created_at, a.org_id, o.name, coalesce(o.is_test, false),
         (select string_agg(u.email, ', ' order by u.created_at) from public.users u where u.org_id = a.org_id),
         a.surface, a.tool, a.model, a.input_tokens, a.output_tokens, a.cost_usd, a.stop_reason
  from public.ai_usage a left join public.organizations o on o.id = a.org_id
  where a.created_at >= p_since and (p_include_test or coalesce(o.is_test, false) = false)
  order by a.created_at desc limit least(greatest(p_limit, 1), 200)
$$;

revoke all on function public.admin_ai_usage_by_tool(timestamptz, boolean)         from public, anon, authenticated;
revoke all on function public.admin_ai_usage_by_org(timestamptz, boolean)          from public, anon, authenticated;
revoke all on function public.admin_ai_usage_recent(timestamptz, boolean, integer) from public, anon, authenticated;
grant execute on function public.admin_ai_usage_by_tool(timestamptz, boolean)         to service_role;
grant execute on function public.admin_ai_usage_by_org(timestamptz, boolean)          to service_role;
grant execute on function public.admin_ai_usage_recent(timestamptz, boolean, integer) to service_role;

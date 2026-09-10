-- Monthly usage allowances (2026-09-10). APPLIED to production as migration
-- "usage_counters". One row per org, per calendar month (UTC, 'YYYY-MM'), per
-- metered action. The app reserves a unit BEFORE the AI call (atomic check and
-- increment, so two tabs cannot both spend the last unit) and hands it back if
-- the call fails. Limits live in src/lib/gate/quota-limits.ts, not here.
create table if not exists public.usage_counters (
  org_id     uuid not null references public.organizations(id) on delete cascade,
  period     text not null check (period ~ '^\d{4}-\d{2}$'),
  action     text not null,
  count      integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (org_id, period, action)
);

alter table public.usage_counters enable row level security;

-- Members can READ their own org's meter. Writes go only through the functions
-- below, called with the service role.
drop policy if exists org_isolation on public.usage_counters;
create policy org_isolation on public.usage_counters
  for select using (org_id = get_current_org_id());

grant select on public.usage_counters to authenticated;
grant select, insert, update, delete on public.usage_counters to service_role;

-- Reserve p_n units. Returns the new count, or -1 when that would pass p_limit
-- (nothing is written in that case). p_limit null = no cap (admins): still counted.
create or replace function public.reserve_usage(
  p_org uuid, p_period text, p_action text, p_n integer, p_limit integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_n is null or p_n < 1 then
    raise exception 'p_n must be >= 1';
  end if;
  if p_limit is not null and p_n > p_limit then
    return -1;                      -- asks for more than the whole allowance
  end if;

  insert into public.usage_counters as u (org_id, period, action, count, updated_at)
  values (p_org, p_period, p_action, p_n, now())
  on conflict (org_id, period, action) do update
    set count = u.count + excluded.count, updated_at = now()
    where p_limit is null or u.count + excluded.count <= p_limit
  returning u.count into v_count;

  if v_count is null then
    return -1;                      -- existing row, would pass the limit
  end if;
  return v_count;
end;
$$;

-- Hand back p_n units after a failed call. Never goes below zero.
create or replace function public.release_usage(
  p_org uuid, p_period text, p_action text, p_n integer
) returns void
language sql
security definer
set search_path = public
as $$
  update public.usage_counters
     set count = greatest(count - greatest(p_n, 0), 0), updated_at = now()
   where org_id = p_org and period = p_period and action = p_action;
$$;

revoke all on function public.reserve_usage(uuid, text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.release_usage(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.reserve_usage(uuid, text, text, integer, integer) to service_role;
grant execute on function public.release_usage(uuid, text, text, integer) to service_role;

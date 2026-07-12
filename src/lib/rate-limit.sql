-- PressIQ / EMOS public tools — shared cross-instance rate limiter.
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query → Run).
-- Powers src/lib/rate-limit-db.ts. The service-role key bypasses RLS; no anon policies.

create table if not exists public.rate_limits (
  key       text primary key,
  count     integer     not null default 0,
  reset_at  timestamptz not null
);

alter table public.rate_limits enable row level security;
-- Intentionally NO public/anon policies: only the service-role client may read/write.

-- Service-role needs explicit TABLE privileges too. check_rate_limit() is NOT
-- SECURITY DEFINER, so it runs as the caller (service_role), and Supabase's
-- default-privilege grants don't reliably cover tables created via the SQL editor.
-- Without this, the function fails at runtime with "permission denied for table
-- rate_limits" and callers silently fail (rateLimitDb → in-memory; quota.ts →
-- fail-open). Same fix pattern as gate.sql. (Added 2026-07-12 after the P2 smoke test.)
grant select, insert, update, delete on public.rate_limits to service_role;

-- Atomic check-and-increment. Returns whether this request is allowed and how many
-- remain in the current window. Resets the counter once the window has elapsed.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table(allowed boolean, remaining integer)
language plpgsql
as $$
declare
  v_now   timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits as r (key, count, reset_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count    = case when r.reset_at < v_now then 1 else r.count + 1 end,
        reset_at = case when r.reset_at < v_now then v_now + make_interval(secs => p_window_seconds) else r.reset_at end
  returning r.count into v_count;

  return query select (v_count <= p_limit), greatest(0, p_limit - v_count);
end;
$$;

grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- 2026-09-25: JournoCollabIQ journalist verification cache (bug P1-01, pass 3).
-- Applied live via Supabase MCP apply_migration as `journalist_verifications`.
--
-- Not tenant data: whether a named person has a recent byline at an outlet is
-- the same answer for every org, so there is no org_id. Append-only: a fresh
-- check (including a free Re-verify) INSERTS a new row, rows are never updated
-- or deleted. The 30-day validity is decided at READ time
-- (checked_at > now() - interval '30 days', newest row wins), so an expired
-- check stays as history.
--
-- Cache key = name_key (normalised name) + outlet_domain (normalised domain the
-- candidate list gave). byline_domain is derived in code from byline_url and
-- is the real outlet domain; the model's stated domain is never trusted
-- (communicate.ae / communicate-online.com were both invented; the real site
-- is communicateonline.me).
--
-- Technical failures (API error, timeout) are NOT written, so a flaky search
-- never caches a false "not confirmed" for 30 days.
--
-- Written only by the service client (src/lib/journo/verify.ts). Grants for
-- service_role AND authenticated (engineering rule: new tables get neither by
-- default); authenticated may only read.
create table if not exists public.journalist_verifications (
  id             bigint generated always as identity primary key,
  name           text        not null,
  name_key       text        not null,
  outlet         text        not null,
  outlet_domain  text        not null,
  byline_domain  text,
  verified       boolean     not null,
  byline_url     text,
  byline_title   text,
  byline_date    date,
  role_as_of     text,
  note           text,
  checked_at     timestamptz not null default now(),
  searches_used  integer     not null default 0,
  model          text        not null
);

create index if not exists journalist_verifications_lookup
  on public.journalist_verifications (name_key, outlet_domain, checked_at desc);

alter table public.journalist_verifications enable row level security;

drop policy if exists "journalist_verifications read" on public.journalist_verifications;
create policy "journalist_verifications read"
  on public.journalist_verifications for select
  to authenticated
  using (true);

grant select, insert, update, delete on public.journalist_verifications to service_role;
grant select on public.journalist_verifications to authenticated;
grant usage on sequence public.journalist_verifications_id_seq to service_role;

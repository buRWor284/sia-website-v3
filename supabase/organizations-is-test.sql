-- ============================================================================
-- organizations.is_test — separate test data from real data
-- APPLIED 2026-09-10 to project edwdiajpwesvhunalpos (Supabase migration
-- `organizations_is_test`, then `internal_test_accounts` for section 4). Kept
-- here as the record and the how-to. Safe to re-run: every statement is
-- idempotent.
--
-- WHY: pressiq_scores is meant to become original research one day ("we scored
-- N pitches, here is what separates the ones that land"), and signals,
-- journalists, asset packs and drafts have the same problem. Once test rows mix
-- with real ones nobody can tell them apart months later.
--
-- DESIGN (decided 2026-09-10, do not redesign): the ORGANISATION is the flag,
-- not the row and not a per-user toggle. Testing happens on one dedicated
-- account, whose personal org is marked is_test = true. Every org-scoped table
-- inherits the flag through org_id, so NO other table gets an is_test column.
-- A join covers them all, and flagging an org later retroactively covers every
-- row it ever wrote.
-- ============================================================================

-- 1. The column --------------------------------------------------------------
alter table public.organizations
  add column if not exists is_test boolean not null default false;

comment on column public.organizations.is_test is
  'true = internal test org; its rows are excluded from research and cost/usage analysis. Read real-only data with: join organizations o on o.id = t.org_id where o.is_test = false. Null-org rows (anonymous public /tools/* runs) are neither. Flip only from the SQL editor or service role; see supabase/organizations-is-test.sql.';

-- 2. Guard: only an operator can flip it ------------------------------------
-- Signed-in users have UPDATE on their own org row (org_isolation is FOR ALL),
-- so without this a customer could flip their own flag with a direct PostgREST
-- call. postgres (SQL editor, MCP) and service_role are unaffected. Verified
-- 2026-09-10 by impersonating the emos03 user: flip refused, a non-flag update
-- on the same row still succeeds, and the user can still READ its own flag
-- (which is what the dashboard badge does).
create or replace function public.organizations_guard_is_test()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.is_test is distinct from old.is_test
     and current_user in ('anon', 'authenticated') then
    raise exception 'organizations.is_test can only be changed by an operator (SQL editor or service role)';
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_guard_is_test on public.organizations;
create trigger organizations_guard_is_test
  before update of is_test on public.organizations
  for each row execute function public.organizations_guard_is_test();

-- 3. The two existing test orgs (one-off, already applied) -------------------
--   0b9a5094-a3b9-4f0f-817f-63711d36a558  syedirfanajmal+p5test  (16 Jul)
--   d424157d-cc50-40ea-a915-52c8ce0877a0  syedirfanajmal+emos03  (8 Sep gate test)
-- 7f8c189b-1a5a-4d03-a84b-51715fa6f28f (SIA, Irfan's real org) stays false.
update public.organizations set is_test = true
where id in ('0b9a5094-a3b9-4f0f-817f-63711d36a558',
             'd424157d-cc50-40ea-a915-52c8ce0877a0');

-- ============================================================================
-- 4. Test accounts are flagged AUTOMATICALLY (migration internal_test_accounts)
-- ============================================================================
-- Decided by Irfan 2026-09-10: no "test mode" button in the product (it would
-- confuse real customers) and no SQL for him to run. Instead the database
-- itself holds the list of his test sign-in emails. When one of them is
-- provisioned (emos-provision.ts inserts the users row), a trigger flags that
-- user's org is_test = true. Real customers never see or touch any of this.
--
-- The designated test account is irfan@dmr.agency. It had not signed in when
-- it was added, so its org will be flagged at the moment it is created.

create table if not exists public.internal_test_accounts (
  email    text primary key check (email = lower(email)),
  note     text,
  added_at timestamptz not null default now()
);

comment on table public.internal_test_accounts is
  'Sign-in emails that are internal test accounts. A users row with one of these emails flags its org organizations.is_test = true on insert (trigger users_flag_test_org). Service role / SQL editor only.';

-- Service-only: RLS on, no policies, no grants to anon/authenticated.
alter table public.internal_test_accounts enable row level security;
revoke all on public.internal_test_accounts from anon, authenticated;

-- SECURITY DEFINER so the org update runs as the owner (the is_test guard in
-- section 2 only refuses anon/authenticated). Returns trigger, so it cannot be
-- called over /rest/v1/rpc.
create or replace function public.users_flag_test_org()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if exists (select 1 from public.internal_test_accounts t
             where t.email = lower(trim(new.email))) then
    update public.organizations set is_test = true
    where id = new.org_id and is_test = false;
  end if;
  return new;
end;
$$;

revoke all on function public.users_flag_test_org() from public, anon, authenticated;

drop trigger if exists users_flag_test_org on public.users;
create trigger users_flag_test_org
  after insert or update of email, org_id on public.users
  for each row execute function public.users_flag_test_org();

-- The list as seeded 2026-09-10 (one-off, already applied):
insert into public.internal_test_accounts (email, note) values
  ('irfan@dmr.agency', 'Irfan''s dedicated EMOS test account (chosen 10 Sep 2026). Not yet signed in when added.'),
  ('syedirfanajmal+p5test@gmail.com', 'p5test, 16 Jul 2026. Org already flagged by hand.'),
  ('syedirfanajmal+emos03@gmail.com', 'emos03, 8 Sep 2026 gate test. Org already flagged by hand.')
on conflict (email) do nothing;

-- Verified 2026-09-10 in a rolled-back transaction, as service_role (the role
-- ensureOrgProvisioned uses): provisioning 'Irfan@DMR.agency' produced an org
-- with is_test = true; provisioning founder@example.com produced false.
--
-- ADDING ANOTHER TEST ACCOUNT LATER: one row in internal_test_accounts (ask a
-- Claude session to do it). If that account has ALREADY signed in, also flip
-- its existing org, because the trigger only fires on a users insert/update:
--
--   update public.organizations set is_test = true
--   where id = (select org_id from public.users where email = '<email>');
--
-- The dashboard shows a red TEST ORG chip in the "Working for" bar for a
-- flagged org, so the test account always shows which mode it is in.

-- ============================================================================
-- HOW TO: read real data only
-- ============================================================================
-- Platform data (every org-scoped table works the same way):
--
--   select s.*
--   from pressiq_scores s
--   join organizations o on o.id = s.org_id
--   where o.is_test = false;
--
-- Swap pressiq_scores for pitch_drafts, signaliq_signals, journalists,
-- linkable_assets, signaliq_asset_packs, companies, ai_usage, etc.
--
-- ★ NULL org_id rows. pressiq_scores and ai_usage allow org_id to be null:
-- anonymous PUBLIC-tool scores (/tools/pressiq, no sign-in) are stored that
-- way on purpose (the 2026-07-13 outcome flywheel, see src/lib/pitch/log.ts).
-- The inner join above DROPS them. To include anonymous public scores as real:
--
--   select s.*
--   from pressiq_scores s
--   left join organizations o on o.id = s.org_id
--   where coalesce(o.is_test, false) = false;
--
-- Because an anonymous row has no org, it can never be flagged. So during a
-- test pass, use the public /tools/* pages SIGNED IN as the test account:
-- logPitch resolves the Clerk user to their org, and the row is covered.
--
-- Quick sanity check of the split:
--
--   select o.name, o.is_test, count(s.id) as scores
--   from organizations o left join pressiq_scores s on s.org_id = o.id
--   group by 1, 2 order by 2, 1;

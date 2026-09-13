-- 2026-09-13: company scoping for CoverageIQ (1b) and AssetIQ (1c).
-- Applied live via Supabase MCP apply_migration as `company_scoping_pitches_assets`.
-- Both tables were org-scoped only, so an agency working for several clients
-- saw every client's pitches and assets on one screen. pressiq_scores,
-- pitch_drafts, journalist_context and signaliq_asset_packs already carry
-- company_id; this brings the last two tables in line.
-- Nullable on purpose: rows that predate company tagging stay readable under
-- an "Unassigned" filter rather than being hidden or force-assigned.

alter table public.coverageiq_pitches
  add column if not exists company_id uuid references public.companies(id) on delete set null;
create index if not exists idx_coverageiq_pitches_company on public.coverageiq_pitches(company_id);

alter table public.linkable_assets
  add column if not exists company_id uuid references public.companies(id) on delete set null;
create index if not exists idx_linkable_assets_company on public.linkable_assets(company_id);

-- Backfill pitches, strongest signal first.
-- 1. Free-text client matches a company name in the same org.
update public.coverageiq_pitches p
   set company_id = c.id
  from public.companies c
 where p.company_id is null
   and p.client is not null
   and c.org_id = p.org_id
   and lower(c.name) = lower(trim(p.client));

-- 2. The PressIQ score the pitch came from carries the company.
update public.coverageiq_pitches p
   set company_id = s.company_id
  from public.pressiq_scores s
 where p.company_id is null
   and p.pressiq_score_id = s.id
   and s.company_id is not null;

-- 3. The journalist was saved for exactly one company (journalist_context).
update public.coverageiq_pitches p
   set company_id = jc.company_id
  from (
    select journalist_id, min(company_id::text)::uuid as company_id
      from public.journalist_context
     where company_id is not null
     group by journalist_id
    having count(distinct company_id) = 1
  ) jc
 where p.company_id is null
   and p.journalist_id = jc.journalist_id;

-- Backfill assets.
-- 1. A PressIQ score was run about this asset for a company (newest wins).
update public.linkable_assets a
   set company_id = s.company_id
  from (
    select distinct on (asset_id) asset_id, company_id
      from public.pressiq_scores
     where asset_id is not null and company_id is not null
     order by asset_id, scored_at desc
  ) s
 where a.company_id is null
   and a.id = s.asset_id;

-- 2. A journalist was saved about this asset for a company (newest wins).
update public.linkable_assets a
   set company_id = jc.company_id
  from (
    select distinct on (asset_id) asset_id, company_id
      from public.journalist_context
     where asset_id is not null and company_id is not null
     order by asset_id, created_at desc
  ) jc
 where a.company_id is null
   and a.id = jc.asset_id;

-- 3. The signal it was built from was scanned for a named company.
update public.linkable_assets a
   set company_id = c.id
  from public.signaliq_signals s
  join public.companies c on c.org_id = s.org_id and lower(c.name) = lower(s.company_name)
 where a.company_id is null
   and a.signal_id = s.id
   and s.company_name is not null;

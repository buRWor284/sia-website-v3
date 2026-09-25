-- 2026-09-25: JournoCollabIQ outlet rosters. Applied live via Supabase MCP
-- apply_migration as `outlet_rosters`.
--
-- outlet_bylines: one row per (named author, article) the roster reader saw
-- on an outlet's own pages. Append-only, never deleted. "Current" = read
-- within 30 days; older rows stay as "last seen at <outlet>, <month>".
-- outlet_reads: one row per attempt to read an outlet, so an outlet that
-- keeps failing or stops publishing can be flagged "maybe closed" instead of
-- silently vanishing.
--
-- Not tenant data (who writes for an outlet is the same for every org). RLS
-- on; authenticated may read; only the service client writes.
create table if not exists public.outlet_bylines (
  id            bigint generated always as identity primary key,
  outlet_domain text        not null,
  page_url      text,
  author_name   text        not null,
  author_key    text        not null,
  article_url   text        not null,
  article_title text,
  article_date  date,
  read_at       timestamptz not null default now(),
  model         text        not null
);
create index if not exists outlet_bylines_outlet_idx on public.outlet_bylines (outlet_domain, read_at desc);
create index if not exists outlet_bylines_author_idx on public.outlet_bylines (author_key, outlet_domain, read_at desc);

create table if not exists public.outlet_reads (
  id             bigint generated always as identity primary key,
  outlet_domain  text        not null,
  market         text,
  beat           text,
  ok             boolean     not null,
  bylines_found  integer     not null default 0,
  newest_article date,
  note           text,
  read_at        timestamptz not null default now()
);
create index if not exists outlet_reads_outlet_idx on public.outlet_reads (outlet_domain, read_at desc);

alter table public.outlet_bylines enable row level security;
alter table public.outlet_reads  enable row level security;
drop policy if exists "outlet_bylines read" on public.outlet_bylines;
create policy "outlet_bylines read" on public.outlet_bylines for select to authenticated using (true);
drop policy if exists "outlet_reads read" on public.outlet_reads;
create policy "outlet_reads read" on public.outlet_reads for select to authenticated using (true);
grant select, insert, update, delete on public.outlet_bylines, public.outlet_reads to service_role;
grant select on public.outlet_bylines, public.outlet_reads to authenticated;
grant usage on sequence public.outlet_bylines_id_seq, public.outlet_reads_id_seq to service_role;

-- 2026-09-25 (commit 10): what kind of piece, and the role printed with the
-- byline, so op-eds by company executives and sponsored posts can be dropped.
-- Applied live as migration outlet_bylines_kind_role.
alter table public.outlet_bylines add column if not exists kind text, add column if not exists author_role text;
create index if not exists outlet_bylines_page_model_idx on public.outlet_bylines (page_url, model);

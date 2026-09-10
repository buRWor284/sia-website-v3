-- Company Brief (2026-09-10). APPLIED to production as migration "company_briefs".
-- One Markdown brief per company. Tools read it only when status = 'approved';
-- a company without one works exactly as before.
create table if not exists public.company_briefs (
  company_id    uuid primary key references public.companies(id) on delete cascade,
  org_id        uuid not null references public.organizations(id) on delete cascade,
  content       text not null default '' check (char_length(content) <= 12000),
  status        text not null default 'draft' check (status in ('draft', 'approved')),
  source        text not null default 'manual' check (source in ('research', 'upload', 'manual')),
  sources       jsonb not null default '[]'::jsonb,
  researched_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists company_briefs_org_idx on public.company_briefs (org_id);

alter table public.company_briefs enable row level security;

drop policy if exists org_isolation on public.company_briefs;
create policy org_isolation on public.company_briefs
  for all using (org_id = get_current_org_id());

-- Added the same day (migration "company_briefs_locked_sections"):
alter table public.company_briefs
  add column if not exists locked_sections text[] not null default '{}';

-- Added the same day (migration "company_briefs_grants"). New tables in this
-- project get no default grant for `authenticated`; without this the
-- dashboard read/save failed with "permission denied for table".
grant select, insert, update, delete on public.company_briefs to authenticated;

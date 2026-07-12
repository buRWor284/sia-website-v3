-- Unified public-tool gate — identity tables (Phase P1, Unified-Gate-Freemium-RFP §7).
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query → Run).
-- Powers src/lib/gate/*. The service-role key bypasses RLS; there are intentionally
-- NO anon/public policies (mirrors src/lib/rate-limit.sql).

create extension if not exists "pgcrypto";

-- One row per verified email = one identity across every public tool.
create table if not exists public.tool_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  source_tool       text,
  upgraded_clerk_id text
);

-- Pending 6-digit verification codes (hashed). One in-flight code per email.
create table if not exists public.subscriber_verifications (
  email        text primary key,
  code_hash    text        not null,
  expires_at   timestamptz not null,
  attempts     integer     not null default 0,
  last_sent_at timestamptz not null default now()
);

alter table public.tool_subscribers        enable row level security;
alter table public.subscriber_verifications enable row level security;
-- Intentionally NO anon/public policies: only the service-role client may read/write.

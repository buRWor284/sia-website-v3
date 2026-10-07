-- EMOS MCP Stage 4, Session 3 (write tier). Applied 7 Oct 2026 as migration
-- `mcp_stage4_session3`. All additive. Spec v1.3 section 4.
--
-- What is here:
--   1. organizations.ai_writes_enabled   the org switch for AI writes (off by default)
--   2. mcp_audit_log                     one row per previewed / committed / undone write
--   3. mcp_idempotency                   one row per (org, tool, key) already written
--   4. sync_journalist_stats()           last_contact now follows the date of the event
--   5. Functions: preview, commit, undo, and the dashboard's direct write
--
-- HOW TENANCY IS ENFORCED. Business tables (journalists, journalist_context,
-- journalist_interactions, coverageiq_pitches) are only ever written by
-- emos_apply_plan() and emos_undo_changes(), which are SECURITY INVOKER: they
-- run as the caller, so row-level security decides what the caller can touch.
-- The audit and idempotency tables are read-only to callers; the small
-- SECURITY DEFINER helpers below are the only writers, and each one pins the
-- org and the user from the caller's own token.

-- ─── 1. The switch ───────────────────────────────────────────────────────────

alter table public.organizations
  add column if not exists ai_writes_enabled boolean not null default false;

comment on column public.organizations.ai_writes_enabled is
  'EMOS MCP: may the user''s AI record outcomes (write tier)? Off by default. Checked live on every preview and commit.';

-- ─── 2. Audit log ────────────────────────────────────────────────────────────

create table if not exists public.mcp_audit_log (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  actor_user_id    text not null,                       -- Clerk user id
  client_id        text,                                -- OAuth client, for the trail
  via              text not null default 'mcp_oauth' check (via in ('mcp_oauth', 'dashboard')),
  tool             text not null,
  args             jsonb not null default '{}'::jsonb,  -- what the caller asked for
  plan             jsonb not null default '[]'::jsonb,  -- the exact row operations committed
  preview          text,                                -- the sentence shown before commit
  result           jsonb,                               -- what the commit returns (and a repeat returns again)
  changes          jsonb not null default '[]'::jsonb,  -- one entry per row touched: table, id, op, before, after
  state            text not null default 'previewed' check (state in ('previewed', 'committed', 'undone', 'expired')),
  idempotency_keys text[] not null default '{}',
  secret_hash      text,                                -- sha256 of the confirmation token's secret half
  undo_of          uuid references public.mcp_audit_log(id) on delete set null,
  previewed_at     timestamptz not null default now(),
  committed_at     timestamptz,
  undone_at        timestamptz
);

create index if not exists mcp_audit_log_org_committed_idx on public.mcp_audit_log (org_id, committed_at desc);
create index if not exists mcp_audit_log_actor_idx on public.mcp_audit_log (org_id, actor_user_id, state, committed_at desc);

alter table public.mcp_audit_log enable row level security;
drop policy if exists org_read on public.mcp_audit_log;
create policy org_read on public.mcp_audit_log for select to authenticated using (org_id = public.get_current_org_id());

revoke all on public.mcp_audit_log from anon, authenticated;
grant select on public.mcp_audit_log to authenticated;
grant all on public.mcp_audit_log to service_role;

-- ─── 3. Idempotency keys ─────────────────────────────────────────────────────

create table if not exists public.mcp_idempotency (
  org_id     uuid not null references public.organizations(id) on delete cascade,
  tool       text not null,
  key        text not null,
  audit_id   uuid not null references public.mcp_audit_log(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (org_id, tool, key)
);

alter table public.mcp_idempotency enable row level security;
drop policy if exists org_read on public.mcp_idempotency;
create policy org_read on public.mcp_idempotency for select to authenticated using (org_id = public.get_current_org_id());

revoke all on public.mcp_idempotency from anon, authenticated;
grant select on public.mcp_idempotency to authenticated;
grant all on public.mcp_idempotency to service_role;

-- ─── 4. Journalist counters follow the date of the event ─────────────────────
-- Before today nothing wrote journalist_interactions, so this trigger had never
-- fired. Changes: a pitch now counts as contact; last_contact takes the date
-- the thing happened (occurred_at), never moves backwards, and "no response"
-- is not contact.

create or replace function public.sync_journalist_stats()
returns trigger
language plpgsql
as $function$
declare
  d date := coalesce(NEW.occurred_at, now())::date;
begin
  if NEW.interaction_type = 'pitched' then
    update journalists
       set pitches_sent = pitches_sent + 1,
           last_contact = greatest(coalesce(last_contact, d), d),
           updated_at   = clock_timestamp()
     where id = NEW.journalist_id;
  elsif NEW.interaction_type = 'placed' then
    update journalists
       set placements   = placements + 1,
           last_contact = greatest(coalesce(last_contact, d), d),
           updated_at   = clock_timestamp()
     where id = NEW.journalist_id;
  elsif NEW.interaction_type in ('replied', 'rejected') then
    update journalists
       set last_contact = greatest(coalesce(last_contact, d), d),
           updated_at   = clock_timestamp()
     where id = NEW.journalist_id;
  end if;
  return NEW;
end;
$function$;

-- ─── 5. Functions ────────────────────────────────────────────────────────────

create or replace function public.mcp_jwt_sub()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '');
$$;

-- 5a. Apply a plan of row operations as the caller (row-level security on).
-- A plan is a JSON array of { op: insert | update | watch, table, id, values?, expect_updated_at? }.
-- "watch" writes nothing: it snapshots a row a trigger will change (the
-- journalist's counters) so that undo can put it back.
create or replace function public.emos_apply_plan(p_plan jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org    uuid := public.get_current_org_id();
  op       jsonb;
  t        text;
  kind     text;
  rid      uuid;
  vals     jsonb;
  cols     text;
  n        bigint;
  cur      jsonb;
  k        text;
  ref      record;
  befores  jsonb := '{}'::jsonb;
  kinds    jsonb := '{}'::jsonb;
  ord      text[] := '{}';
  changes  jsonb := '[]'::jsonb;
begin
  if v_org is null then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;
  if p_plan is null or jsonb_typeof(p_plan) <> 'array' or jsonb_array_length(p_plan) = 0 then
    raise exception 'emos_write: empty_plan';
  end if;
  if jsonb_array_length(p_plan) > 300 then
    raise exception 'emos_write: plan_too_large';
  end if;

  -- Pass 1: validate, and snapshot every existing row before anything changes.
  for op in select value from jsonb_array_elements(p_plan) loop
    t := op ->> 'table';
    kind := op ->> 'op';
    if kind is null or kind not in ('insert', 'update', 'watch') then
      raise exception 'emos_write: op_not_allowed';
    end if;
    if t is null or t not in ('journalists', 'journalist_context', 'journalist_interactions', 'coverageiq_pitches', 'linkable_assets') then
      raise exception 'emos_write: table_not_allowed';
    end if;
    if t = 'linkable_assets' and kind <> 'watch' then
      raise exception 'emos_write: table_not_allowed';
    end if;
    if (op ->> 'id') is null then
      raise exception 'emos_write: bad_plan';
    end if;
    rid := (op ->> 'id')::uuid;
    k := t || ':' || rid::text;

    if kind = 'insert' then
      if kinds ? k then
        raise exception 'emos_write: bad_plan';
      end if;
      kinds := kinds || jsonb_build_object(k, 'insert');
      ord := ord || k;
    elsif not (kinds ? k) then
      execute format('select to_jsonb(x) from public.%I x where x.id = $1 and x.org_id = $2', t) into cur using rid, v_org;
      if cur is null then
        raise exception 'emos_write: row_not_found';
      end if;
      if kind = 'update'
         and (op ->> 'expect_updated_at') is not null
         and (cur ->> 'updated_at')::timestamptz is distinct from (op ->> 'expect_updated_at')::timestamptz then
        raise exception 'emos_write: changed_since_preview';
      end if;
      befores := befores || jsonb_build_object(k, cur);
      kinds := kinds || jsonb_build_object(k, 'update');
      ord := ord || k;
    end if;
  end loop;

  -- Pass 2: apply, in order.
  for op in select value from jsonb_array_elements(p_plan) loop
    t := op ->> 'table';
    kind := op ->> 'op';
    rid := (op ->> 'id')::uuid;
    if kind = 'watch' then
      continue;
    end if;
    vals := coalesce(op -> 'values', '{}'::jsonb);
    if jsonb_typeof(vals) <> 'object' then
      raise exception 'emos_write: bad_plan';
    end if;

    -- Foreign keys are checked by Postgres without row-level security, so a
    -- row could point at another organisation's company or journalist. Every
    -- reference must be a row this caller can see.
    for ref in
      select * from (values
        ('company_id', 'companies'),
        ('journalist_id', 'journalists'),
        ('pitch_id', 'coverageiq_pitches'),
        ('asset_id', 'linkable_assets'),
        ('signal_id', 'signaliq_signals')
      ) as m(col, tbl)
    loop
      if vals ? ref.col and jsonb_typeof(vals -> ref.col) = 'string' then
        execute format('select count(*) from public.%I x where x.id = $1 and x.org_id = $2', ref.tbl)
          into n using (vals ->> ref.col)::uuid, v_org;
        if n <> 1 then
          raise exception 'emos_write: reference_not_found';
        end if;
      end if;
    end loop;

    if kind = 'insert' then
      vals := vals || jsonb_build_object('id', rid, 'org_id', v_org);
      select string_agg(quote_ident(key), ', ' order by key) into cols from jsonb_object_keys(vals) as key;
      execute format(
        'insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1)', t, cols, cols, t
      ) using vals;
    else
      vals := vals - 'id' - 'org_id' - 'created_at';
      if t in ('journalists', 'coverageiq_pitches') then
        vals := vals || jsonb_build_object('updated_at', clock_timestamp());
      end if;
      if vals = '{}'::jsonb then
        continue;
      end if;
      select string_agg(quote_ident(key), ', ' order by key) into cols from jsonb_object_keys(vals) as key;
      execute format(
        'update public.%I x set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where x.id = $2 and x.org_id = $3',
        t, cols, cols, t
      ) using vals, rid, v_org;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'emos_write: row_not_found';
      end if;
    end if;
  end loop;

  -- Pass 3: snapshot every touched row after all writes and triggers.
  foreach k in array ord loop
    t := split_part(k, ':', 1);
    rid := split_part(k, ':', 2)::uuid;
    execute format('select to_jsonb(x) from public.%I x where x.id = $1 and x.org_id = $2', t) into cur using rid, v_org;
    changes := changes || jsonb_build_array(jsonb_build_object(
      'table', t, 'id', rid, 'op', kinds ->> k, 'before', befores -> k, 'after', cur
    ));
  end loop;

  return changes;
end;
$$;

-- 5b. Reverse a committed write, as the caller. Refuses (and changes nothing)
-- when any touched row was changed again since the write.
create or replace function public.emos_undo_changes(p_changes jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  c     jsonb;
  t     text;
  rid   uuid;
  cur   jsonb;
  cols  text;
  n     bigint;
  i     int;
begin
  if v_org is null then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) = 0 then
    raise exception 'emos_write: nothing_to_undo';
  end if;

  -- Check everything first.
  for i in reverse (jsonb_array_length(p_changes) - 1) .. 0 loop
    c := p_changes -> i;
    t := c ->> 'table';
    rid := (c ->> 'id')::uuid;
    if t is null or t not in ('journalists', 'journalist_context', 'journalist_interactions', 'coverageiq_pitches', 'linkable_assets') then
      raise exception 'emos_write: table_not_allowed';
    end if;
    execute format('select to_jsonb(x) from public.%I x where x.id = $1 and x.org_id = $2', t) into cur using rid, v_org;
    if cur is null then
      raise exception 'emos_write: changed_since_write';
    end if;
    if (c -> 'after') ? 'updated_at'
       and (cur ->> 'updated_at')::timestamptz is distinct from (c -> 'after' ->> 'updated_at')::timestamptz then
      raise exception 'emos_write: changed_since_write';
    end if;
  end loop;

  -- Then reverse, newest first.
  for i in reverse (jsonb_array_length(p_changes) - 1) .. 0 loop
    c := p_changes -> i;
    t := c ->> 'table';
    rid := (c ->> 'id')::uuid;
    if c ->> 'op' = 'insert' then
      execute format('delete from public.%I x where x.id = $1 and x.org_id = $2', t) using rid, v_org;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'emos_write: changed_since_write';
      end if;
    else
      select string_agg(quote_ident(key), ', ' order by key) into cols
        from jsonb_object_keys(c -> 'before') as key
       where key not in ('id', 'org_id');
      execute format(
        'update public.%I x set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where x.id = $2 and x.org_id = $3',
        t, cols, cols, t
      ) using c -> 'before', rid, v_org;
      get diagnostics n = row_count;
      if n <> 1 then
        raise exception 'emos_write: changed_since_write';
      end if;
    end if;
  end loop;
end;
$$;

-- 5c. Preview: store the planned write and hand back its id. Writes nothing
-- to any business table.
create or replace function public.mcp_write_preview(
  p_tool text, p_args jsonb, p_plan jsonb, p_preview text, p_result jsonb,
  p_keys text[], p_secret_hash text, p_client_id text, p_undo_of uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  v_sub text := public.mcp_jwt_sub();
  v_id  uuid;
begin
  if v_org is null or v_sub is null
     or not exists (select 1 from users u where u.clerk_user_id = v_sub and u.org_id = v_org) then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;
  if not coalesce((select o.ai_writes_enabled from organizations o where o.id = v_org), false) then
    raise exception 'emos_write: ai_writes_off';
  end if;
  if p_tool is null or p_secret_hash is null or length(p_secret_hash) < 32 then
    raise exception 'emos_write: bad_plan';
  end if;

  update mcp_audit_log
     set state = 'expired'
   where org_id = v_org and state = 'previewed' and previewed_at < now() - interval '10 minutes';

  insert into mcp_audit_log (org_id, actor_user_id, client_id, via, tool, args, plan, preview, result, idempotency_keys, secret_hash, undo_of)
  values (v_org, v_sub, p_client_id, 'mcp_oauth', p_tool, coalesce(p_args, '{}'::jsonb), coalesce(p_plan, '[]'::jsonb),
          p_preview, p_result, coalesce(p_keys, '{}'), p_secret_hash, p_undo_of)
  returning id into v_id;
  return v_id;
end;
$$;

-- 5d. Claim a previewed row for commit. The single UPDATE with
-- `state = 'previewed'` is what makes a token single-use: of two commits
-- racing on one token, exactly one finds the row.
create or replace function public.mcp_audit_claim(p_id uuid, p_secret_hash text, p_tool text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  v_sub text := public.mcp_jwt_sub();
  r     mcp_audit_log;
  k     text;
begin
  if v_org is null or v_sub is null then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;
  if not coalesce((select o.ai_writes_enabled from organizations o where o.id = v_org), false) then
    raise exception 'emos_write: ai_writes_off';
  end if;

  update mcp_audit_log
     set state = 'committed', committed_at = clock_timestamp()
   where id = p_id and org_id = v_org and actor_user_id = v_sub and via = 'mcp_oauth'
     and secret_hash = p_secret_hash and tool = p_tool
     and state = 'previewed' and previewed_at > now() - interval '10 minutes'
  returning * into r;

  if not found then
    select * into r from mcp_audit_log
     where id = p_id and org_id = v_org and actor_user_id = v_sub and secret_hash = p_secret_hash;
    if not found then
      raise exception 'emos_write: token_unknown';
    elsif r.tool <> p_tool then
      raise exception 'emos_write: token_wrong_tool';
    elsif r.state in ('committed', 'undone') then
      raise exception 'emos_write: token_used';
    else
      raise exception 'emos_write: token_expired';
    end if;
  end if;

  foreach k in array r.idempotency_keys loop
    begin
      insert into mcp_idempotency (org_id, tool, key, audit_id) values (v_org, r.tool, k, r.id);
    exception when unique_violation then
      raise exception 'emos_write: duplicate_key';
    end;
  end loop;

  return to_jsonb(r);
end;
$$;

-- 5e. Claim the write an undo reverses: this actor's own, made through the AI
-- door, still the most recent one, committed within 7 days.
create or replace function public.mcp_audit_claim_undo(p_target uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  v_sub text := public.mcp_jwt_sub();
  r     mcp_audit_log;
begin
  if v_org is null or v_sub is null then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;

  update mcp_audit_log a
     set state = 'undone', undone_at = clock_timestamp()
   where a.id = p_target and a.org_id = v_org and a.actor_user_id = v_sub and a.via = 'mcp_oauth'
     and a.tool <> 'undo_last_write' and a.state = 'committed'
     and a.committed_at > now() - interval '7 days'
     and not exists (
       select 1 from mcp_audit_log n
        where n.org_id = v_org and n.actor_user_id = v_sub and n.via = 'mcp_oauth'
          and n.tool <> 'undo_last_write' and n.state in ('committed', 'undone')
          and n.committed_at > a.committed_at
     )
  returning * into r;

  if not found then
    raise exception 'emos_write: undo_target_gone';
  end if;

  delete from mcp_idempotency where audit_id = r.id;
  return to_jsonb(r);
end;
$$;

create or replace function public.mcp_audit_finish(p_id uuid, p_changes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  v_sub text := public.mcp_jwt_sub();
begin
  update mcp_audit_log
     set changes = coalesce(p_changes, '[]'::jsonb)
   where id = p_id and org_id = v_org and actor_user_id = v_sub
     and state = 'committed' and changes = '[]'::jsonb;
end;
$$;

-- 5f. Commit: one call, one transaction. Any failure rolls the claim back, so
-- the token is still good until it expires.
create or replace function public.mcp_write_commit(p_id uuid, p_secret_hash text, p_tool text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row     jsonb;
  v_target  jsonb;
  v_changes jsonb;
begin
  v_row := public.mcp_audit_claim(p_id, p_secret_hash, p_tool);

  if v_row ->> 'tool' = 'undo_last_write' then
    v_target := public.mcp_audit_claim_undo((v_row ->> 'undo_of')::uuid);
    perform public.emos_undo_changes(v_target -> 'changes');
    v_changes := jsonb_build_array(jsonb_build_object('undone', v_target ->> 'id', 'tool', v_target ->> 'tool'));
  else
    v_changes := public.emos_apply_plan(v_row -> 'plan');
  end if;

  perform public.mcp_audit_finish(p_id, v_changes);
  return jsonb_build_object('id', p_id, 'tool', v_row ->> 'tool', 'result', v_row -> 'result', 'changes', v_changes);
end;
$$;

-- 5g. The dashboard's write: a person clicked, so there is no preview and no
-- switch. Same plan runner, same audit table (via = 'dashboard').
create or replace function public.mcp_audit_record(p_tool text, p_args jsonb, p_plan jsonb, p_changes jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.get_current_org_id();
  v_sub text := public.mcp_jwt_sub();
  v_id  uuid;
begin
  if v_org is null or v_sub is null then
    raise exception 'emos_write: no_org' using errcode = '42501';
  end if;
  insert into mcp_audit_log (org_id, actor_user_id, via, tool, args, plan, changes, state, committed_at)
  values (v_org, v_sub, 'dashboard', p_tool, coalesce(p_args, '{}'::jsonb), coalesce(p_plan, '[]'::jsonb),
          coalesce(p_changes, '[]'::jsonb), 'committed', clock_timestamp())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.emos_dashboard_write(p_tool text, p_args jsonb, p_plan jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_changes jsonb;
  v_id      uuid;
begin
  v_changes := public.emos_apply_plan(p_plan);
  v_id := public.mcp_audit_record(p_tool, p_args, p_plan, v_changes);
  return jsonb_build_object('id', v_id, 'changes', v_changes);
end;
$$;

-- Who may call what. Nothing here is open to anon.
revoke all on function public.mcp_jwt_sub() from public, anon;
revoke all on function public.emos_apply_plan(jsonb) from public, anon;
revoke all on function public.emos_undo_changes(jsonb) from public, anon;
revoke all on function public.mcp_write_preview(text, jsonb, jsonb, text, jsonb, text[], text, text, uuid) from public, anon;
revoke all on function public.mcp_audit_claim(uuid, text, text) from public, anon;
revoke all on function public.mcp_audit_claim_undo(uuid) from public, anon;
revoke all on function public.mcp_audit_finish(uuid, jsonb) from public, anon;
revoke all on function public.mcp_write_commit(uuid, text, text) from public, anon;
revoke all on function public.mcp_audit_record(text, jsonb, jsonb, jsonb) from public, anon;
revoke all on function public.emos_dashboard_write(text, jsonb, jsonb) from public, anon;

grant execute on function public.mcp_jwt_sub() to authenticated, service_role;
grant execute on function public.emos_apply_plan(jsonb) to authenticated, service_role;
grant execute on function public.emos_undo_changes(jsonb) to authenticated, service_role;
grant execute on function public.mcp_write_preview(text, jsonb, jsonb, text, jsonb, text[], text, text, uuid) to authenticated, service_role;
grant execute on function public.mcp_audit_claim(uuid, text, text) to authenticated, service_role;
grant execute on function public.mcp_audit_claim_undo(uuid) to authenticated, service_role;
grant execute on function public.mcp_audit_finish(uuid, jsonb) to authenticated, service_role;
grant execute on function public.mcp_write_commit(uuid, text, text) to authenticated, service_role;
grant execute on function public.mcp_audit_record(text, jsonb, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.emos_dashboard_write(text, jsonb, jsonb) to authenticated, service_role;

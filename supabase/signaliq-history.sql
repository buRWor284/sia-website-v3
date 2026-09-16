-- ============================================================================
-- SignalIQ — HISTORY LAYER (seasonality plan, step 1). 2026-09-15.
--
-- Applied to emos-platform (edwdiajpwesvhunalpos) via the Supabase MCP as
-- migration `signaliq_history_layer`. This file is the git record; re-running
-- it is safe (idempotent).
--
-- WHY. signaliq_daily_counts now holds 1,101 unbroken days (2023-09-09 →) for
-- ~2,180 topics in 13 languages, but every surface still derives a trailing
-- 60-day window. Three years of history buys two things a card can say:
--   "is this normal for this topic?"  → norm_ratio, yoy_ratio
--   "when does this topic usually peak?" → peak_weeks / next_peak_week
-- Nothing here changes scoring. It is a read-only companion computed once a
-- night by signaliq_refresh_history(), called from the refresh-coverage route
-- after the day scan, so every card (SignalIQ opp cards, both KSA radars, the
-- global radar) reads ONE row per topic and never touches the 2.4M-row table.
--
-- Security posture = signaliq_daily_counts: RLS ON + zero policies → only the
-- service-role client reads/writes (it bypasses RLS).
-- ============================================================================

-- ── 1. Weekly rollup: one row per (topic, ISO week). ~157 weeks × 2,180 topics
--       ≈ 340k rows. Rebuilt nightly (fast: one GROUP BY over daily counts).
create table if not exists signaliq_weekly_counts (
  topic         text    not null,
  week_start    date    not null,           -- Monday (date_trunc('week'))
  article_count integer not null default 0, -- SUM of the daily counts
  days          smallint not null default 0, -- scanned days feeding the week (7 = complete)
  primary key (topic, week_start)
);
create index if not exists idx_swc_week on signaliq_weekly_counts (week_start);

-- ── 2. Per-topic history profile: ONE row per topic, everything a card needs.
create table if not exists signaliq_topic_history (
  topic             text primary key,
  -- windows (sums of daily counts; days are calendar-relative to the newest scanned day)
  last_60d          integer not null default 0,  -- newest 60 scanned days
  prior_year_60d    integer not null default 0,  -- the same 60-day window 364 days earlier (weekday-aligned)
  two_years_60d     integer not null default 0,  -- … 728 days earlier
  yoy_ratio         numeric(8,3),                -- last_60d / prior_year_60d (null when prior is 0)
  -- "normal" for this topic
  weekly_median_3y  numeric(10,2) not null default 0, -- median complete-week count over all history
  last_week         integer not null default 0,      -- most recent COMPLETE week
  norm_ratio        numeric(8,3),                    -- last_week / weekly_median_3y (null when median is 0)
  -- seasonality
  peak_weeks        smallint[] not null default '{}', -- top-3 ISO week numbers by multi-year average, only when ≥1.3× median
  peak_ratio        numeric(8,3),                     -- strongest peak week avg / weekly median
  next_peak_week    smallint,                          -- first of peak_weeks on/after the current ISO week (wraps)
  -- sparkline: the last 156 complete weeks, oldest → newest (shorter when fewer complete weeks exist)
  series_156        integer[] not null default '{}',
  weeks_available   smallint not null default 0,
  first_day         date,
  last_day          date,
  updated_at        timestamptz not null default now()
);

alter table signaliq_weekly_counts  enable row level security;
alter table signaliq_topic_history  enable row level security;
grant all on table signaliq_weekly_counts to service_role;
grant all on table signaliq_topic_history to service_role;

-- ── 3. The nightly rebuild. Idempotent; ~5-15 s on the current table.
create or replace function signaliq_refresh_history()
returns table (topics integer, weeks integer, last_day date, ms integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  t0        timestamptz := clock_timestamp();
  v_last    date;
  v_topics  integer;
  v_weeks   integer;
  cur_week  smallint := extract(week from current_date)::smallint;
begin
  select max(day) into v_last from signaliq_daily_counts;
  if v_last is null then
    return query select 0, 0, null::date, 0; return;
  end if;

  -- 3a. weekly rollup
  truncate signaliq_weekly_counts;
  insert into signaliq_weekly_counts (topic, week_start, article_count, days)
  select topic,
         date_trunc('week', day)::date,
         sum(article_count)::integer,
         count(*)::smallint
  from signaliq_daily_counts
  group by 1, 2;
  get diagnostics v_weeks = row_count;

  -- 3b. per-topic profile
  truncate signaliq_topic_history;
  insert into signaliq_topic_history (
    topic, last_60d, prior_year_60d, two_years_60d, yoy_ratio,
    weekly_median_3y, last_week, norm_ratio,
    peak_weeks, peak_ratio, next_peak_week,
    series_156, weeks_available, first_day, last_day, updated_at)
  with
  win as (
    select topic,
      sum(article_count) filter (where day >  v_last - 60)                          as last_60d,
      sum(article_count) filter (where day >  v_last - 60 - 364 and day <= v_last - 364) as prior_year_60d,
      sum(article_count) filter (where day >  v_last - 60 - 728 and day <= v_last - 728) as two_years_60d,
      min(day) as first_day, max(day) as last_day
    from signaliq_daily_counts
    group by topic
  ),
  complete_weeks as (              -- only weeks with all 7 days scanned
    select topic, week_start, article_count
    from signaliq_weekly_counts
    where days = 7
  ),
  med as (
    select topic,
      (percentile_cont(0.5) within group (order by article_count))::numeric as weekly_median,
      count(*) as weeks_available
    from complete_weeks group by topic
  ),
  lastwk as (
    select distinct on (topic) topic, article_count as last_week
    from complete_weeks order by topic, week_start desc
  ),
  woy as (                         -- multi-year average per ISO week-of-year
    select topic, extract(week from week_start)::smallint as wk, avg(article_count) as avg_count
    from complete_weeks group by 1, 2
  ),
  peaks as (
    select w.topic,
      array_agg(w.wk order by w.avg_count desc) filter (where w.avg_count >= 1.3 * m.weekly_median and m.weekly_median > 0) as all_peaks,
      max(w.avg_count) as top_avg
    from woy w join med m using (topic)
    group by w.topic
  ),
  series as (
    select topic,
      array_agg(article_count order by week_start) as arr
    from (
      select topic, week_start, article_count,
             row_number() over (partition by topic order by week_start desc) as rn
      from complete_weeks
    ) s
    where rn <= 156
    group by topic
  )
  select
    w.topic,
    coalesce(w.last_60d, 0), coalesce(w.prior_year_60d, 0), coalesce(w.two_years_60d, 0),
    case when coalesce(w.prior_year_60d, 0) > 0 then round(w.last_60d::numeric / w.prior_year_60d, 3) end,
    round(coalesce(m.weekly_median, 0)::numeric, 2),
    coalesce(l.last_week, 0),
    case when coalesce(m.weekly_median, 0) > 0 then round(l.last_week::numeric / m.weekly_median, 3) end,
    coalesce((p.all_peaks)[1:3], '{}'),
    case when coalesce(m.weekly_median, 0) > 0 then round((p.top_avg / m.weekly_median)::numeric, 3) end,
    (select x from unnest(coalesce((p.all_peaks)[1:3], '{}')) as x order by (x >= cur_week) desc, x limit 1),
    coalesce(s.arr, '{}'),
    coalesce(m.weeks_available, 0)::smallint,
    w.first_day, w.last_day, now()
  from win w
  left join med m    using (topic)
  left join lastwk l using (topic)
  left join peaks p  using (topic)
  left join series s using (topic);
  get diagnostics v_topics = row_count;

  return query select v_topics, v_weeks, v_last,
    (extract(epoch from clock_timestamp() - t0) * 1000)::integer;
end;
$$;

revoke all on function signaliq_refresh_history() from public;
grant execute on function signaliq_refresh_history() to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC (run after applying):
--   select * from signaliq_refresh_history();
--   select topic, last_60d, prior_year_60d, yoy_ratio, norm_ratio, peak_weeks, next_peak_week, weeks_available
--     from signaliq_topic_history where topic in ('hajj','ramadan','black friday','ar:الحج') ;
-- ─────────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- STEP 2 ADDITION (2026-09-15): per-LANGUAGE weekly volume.
-- Applied via the Supabase MCP as migration `signaliq_lang_history`.
--
-- WHY. Two things a card cannot know from one topic's row:
--   1. Corpus gaps. GDELT returned no rows for 2025-06-15 → 2025-07-01 (17 days,
--      every topic in every language reads 0). A week where the whole language
--      collapses is "no data", not "no articles".
--   2. Drift. The 15 Sep check of "norm_ratio reads 0.5-0.7": tracked English
--      volume's last week was 0.911 of its 3-year median, Arabic 0.894,
--      Indonesian 0.570. Across ALL topics the median norm_ratio was 0.85 (en)
--      and 0.80 (ar), so the corpus explains roughly 10-15 points and the KSA
--      topics' own post-season lull explains the rest. Cards therefore divide
--      any "quiet vs usual" ratio by the same ratio for the whole language
--      (seasonality.ts) before calling a topic unusually quiet.
-- Called from refreshTopicHistory() right after signaliq_refresh_history(),
-- because it reads the weekly rollup that function just rebuilt. ~1 s.
-- ============================================================================
create table if not exists signaliq_lang_history (
  lang              text primary key,
  topics            integer  not null default 0,
  weekly_median_3y  numeric(12,2) not null default 0,
  last_week         integer  not null default 0,
  norm_ratio        numeric(8,3),
  series_156        integer[] not null default '{}',
  weeks_available   smallint not null default 0,
  last_week_start   date,
  updated_at        timestamptz not null default now()
);
alter table signaliq_lang_history enable row level security;
grant all on table signaliq_lang_history to service_role;

create or replace function signaliq_refresh_lang_history()
returns table (langs integer, ms integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  t0 timestamptz := clock_timestamp();
  v_langs integer;
begin
  truncate signaliq_lang_history;
  insert into signaliq_lang_history (lang, topics, weekly_median_3y, last_week, norm_ratio, series_156, weeks_available, last_week_start, updated_at)
  with lw as (
    select case when topic ~ '^[a-z]{2}:' then split_part(topic, ':', 1) else 'en' end as lang,
           week_start,
           sum(article_count)::integer as total,
           count(*) as topics
    from signaliq_weekly_counts
    where days = 7
    group by 1, 2
  ),
  ranked as (
    select lang, week_start, total, topics,
           row_number() over (partition by lang order by week_start desc) as rn
    from lw
  ),
  agg as (
    select lang,
      (percentile_cont(0.5) within group (order by total))::numeric as med,
      count(*) as weeks,
      array_agg(total order by week_start) filter (where rn <= 156) as arr,
      max(week_start) as last_start
    from ranked group by lang
  ),
  latest as (select lang, total as last_total, topics from ranked where rn = 1)
  select a.lang, l.topics, round(a.med, 2), l.last_total,
         case when a.med > 0 then round(l.last_total / a.med, 3) end,
         coalesce(a.arr, '{}'), least(a.weeks, 32767)::smallint, a.last_start, now()
  from agg a join latest l using (lang);
  get diagnostics v_langs = row_count;
  return query select v_langs, (extract(epoch from clock_timestamp() - t0) * 1000)::integer;
end;
$$;
revoke all on function signaliq_refresh_lang_history() from public;
grant execute on function signaliq_refresh_lang_history() to service_role;

-- DIAGNOSTIC:
--   select * from signaliq_refresh_lang_history();
--   select lang, topics, last_week, weekly_median_3y, norm_ratio, last_week_start from signaliq_lang_history order by lang;

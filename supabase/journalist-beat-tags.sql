-- 2026-09-13 (item 3, beats as tags): one-off backfill of journalists.tags
-- from the free-text beat, using the same split rules as
-- src/lib/journo/beat-tags.ts (comma, slash, semicolon, ampersand, " and ").
-- Only touches rows whose tags are still empty. Applied live via Supabase
-- MCP apply_migration as `journalist_beat_tags_backfill`.
update public.journalists j
   set tags = sub.tags
  from (
    select id,
           (select array_agg(t order by ord)
              from (
                select distinct on (t) t, ord
                  from (
                    select regexp_replace(regexp_replace(trim(part), '^the\s+', ''), '\.+$', '') as t, ord
                      from regexp_split_to_table(lower(beat), '\s*(,|/|;|&|\yand\y)\s*') with ordinality as p(part, ord)
                  ) x
                 where t <> ''
                 order by t, ord
              ) d
           ) as tags
      from public.journalists
     where beat is not null and coalesce(array_length(tags, 1), 0) = 0
  ) sub
 where j.id = sub.id
   and sub.tags is not null;

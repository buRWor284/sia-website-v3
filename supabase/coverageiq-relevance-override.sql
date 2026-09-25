-- 2026-09-25 Placement value (Points P2): manual relevance override per placement.
-- Applied live via Supabase MCP as migration coverageiq_relevance_override. Mirror only.
-- 1 = off-topic, 2 = adjacent, 3 = squarely on-topic. NULL = use the tag-overlap estimate.
alter table coverageiq_pitches
  add column if not exists relevance_override smallint
  check (relevance_override is null or relevance_override between 1 and 3);
comment on column coverageiq_pitches.relevance_override is
  'Placement value relevance override (1-3). NULL = computed from journalist beat tags vs company context. See src/lib/coverageiq/placement-value.ts';
comment on column coverageiq_pitches.points is
  'LEGACY hand-seeded score, no longer displayed anywhere since 2026-09-25. Placement value is computed at render (placement-value.ts), never stored.';

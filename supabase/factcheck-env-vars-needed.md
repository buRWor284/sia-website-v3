# New env vars needed in Vercel — FactcheckIQ

Add these to the `sia-website-v3` Vercel project → Settings → Environment Variables:

| Variable | Value | Notes |
|---|---|---|
| `FACTCHECK_EXTRACT_MODEL` | `claude-sonnet-4-6` | Cheap model for claim extraction (mechanical work) |
| `FACTCHECK_GRADE_MODEL` | `claude-opus-4-8` | Judgment model for verification + verdicts |

`ANTHROPIC_API_KEY` already exists in the project (used by other EMOS tools) — no change needed there.

Once added, redeploy for them to take effect.

## Phase 0 findings (4 July 2026)

**Web fetch/search tool versions and beta header changed since the plan was written.** The build plan's original assumption (`web_fetch_20250910`, beta header `web-fetch-2025-09-10`) is superseded. Since the Claude 4.6 launch (Feb 2026), Anthropic ships `web_search_20260209` / `web_fetch_20260209` with dynamic filtering (Claude runs code to strip irrelevant content before it hits context: ~11% accuracy improvement on BrowseComp/DeepsearchQA, ~24% fewer input tokens, no extra charge beyond standard token cost). Beta header is now `code-execution-web-tools-2026-02-09`. This is captured in `src/lib/factcheck/config.ts` (`WEB_SEARCH_TOOL_VERSION`, `WEB_FETCH_TOOL_VERSION`, `WEB_TOOLS_BETA_HEADER`) — re-verify against https://docs.claude.com/en/api/beta-headers before Phase 3 if it's been more than a few weeks.

**Vercel fluid-compute duration:** default `maxDuration` across all plans is now 300s (up from a lower historical default); Pro/Enterprise fluid compute supports up to 800s generally available (a 30-min extended max exists but is beta-only, and Secure Compute doesn't support durations above 800s). A typical full audit (~1-4 min per the build plan) fits comfortably inside the 300s default. Set an explicit `export const maxDuration = 300` on `src/app/api/emostool/factcheck/process/route.ts` regardless of the project default, per [Vercel's duration docs](https://vercel.com/docs/functions/configuring-functions/duration).

## Blocker: GitHub connector has no write access to sia-website-v3

Pushing these files directly to the repo failed with `403 Resource not accessible by integration` on both `push_files` and `create_or_update_file`, for both the tree-create and contents-write endpoints. Read access works fine (used to verify `get_current_org_id()` and the `organizations` table match this schema). This means the GitHub App installation backing this connector currently has read-only (or missing contents:write) permission on this repo — that needs to be fixed in GitHub App settings before any future session can commit code here. Until then, these four files are delivered locally; apply them by hand:

1. `factcheck-schema.sql` → `supabase/factcheck-schema.sql`, then run it in Supabase SQL Editor.
2. `factcheck-types.ts` → `src/lib/factcheck/types.ts`.
3. `factcheck-config.ts` → `src/lib/factcheck/config.ts`.
4. Add the two env vars above in Vercel, redeploy.

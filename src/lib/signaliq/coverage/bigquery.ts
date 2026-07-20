/**
 * SignalIQ — GDELT Web News NGrams 3.0 coverage via BigQuery.
 *
 * One batched query scans a single day of webngrams for EVERY topic at once
 * (build plan §5.2). This replaces the per-topic GDELT DOC-API calls that got
 * IP-blocked on Vercel egress.
 *
 * Cost guardrails (all mandatory — a careless GDELT/BigQuery query has produced
 * real >$500 bills by scanning an unpartitioned multi-TB table):
 *   - `maximumBytesBilled` = 100 GB on every query → an over-cap query FAILS
 *     instead of billing. (Real usage ≈ 15 GB/day.)
 *   - The partition date is injected as a validated DATE LITERAL, never a bind
 *     parameter — BigQuery only prunes to the single daily partition when the
 *     predicate is a constant literal (Phase 0 GATE C2). `day` comes from the
 *     code-controlled day cursor and is regex-validated, so there is no injection
 *     surface. Topics ARE a bound ARRAY<STRUCT> parameter (keeps a clean,
 *     injection-free path for customer-defined topics in the SaaS version).
 *   - `location: 'US'` is required — webngrams lives in the US multi-region, and
 *     the job errors "dataset not found in location" without it.
 *   - `COUNT(1)` occurrences (not COUNT(DISTINCT url)): Phase 0 showed occurrences
 *     ≈ articles and dropping the url column halves the bytes scanned.
 *   - English only (`lang = 'en'`).
 *
 * Auth: JSON.parse(process.env.GCP_SA_KEY) — the raw service-account JSON stored
 * in Vercel env (Phase 1). The SA has roles/bigquery.jobUser only.
 */
import { BigQuery } from "@google-cloud/bigquery";
import type { TopicMatcher } from "./tokenize";

const WEBNGRAMS = "`gdelt-bq.gdeltv2.webngrams`";
const LOCATION = "US"; // webngrams is US multi-region — mandatory
const MAX_BYTES_BILLED = "100000000000"; // 100 GB hard cap per query
const JOB_TIMEOUT_MS = 45_000; // stay inside the route's 60s maxDuration
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

interface SaKey {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

let _bq: BigQuery | null = null;
function client(): BigQuery {
  if (_bq) return _bq;
  const raw = process.env.GCP_SA_KEY;
  if (!raw) throw new Error("GCP_SA_KEY is not set");
  let credentials: SaKey;
  try {
    credentials = JSON.parse(raw) as SaKey;
  } catch {
    throw new Error("GCP_SA_KEY is not valid JSON");
  }
  _bq = new BigQuery({ credentials, projectId: credentials.project_id });
  return _bq;
}

/** The batched matcher query. `@topics` = ARRAY<STRUCT<...>>; the day is a literal. */
function buildSql(day: string): string {
  return `
    WITH topics AS (SELECT * FROM UNNEST(@topics))
    SELECT t.topic AS topic, COUNT(1) AS article_count
    FROM ${WEBNGRAMS} n
    JOIN topics t ON (
         (t.nwords = 1 AND LOWER(n.ngram) = t.w1)
      OR (t.nwords = 2 AND LOWER(n.ngram) = t.w1 AND STARTS_WITH(LOWER(n.post), t.w2))
      OR (t.nwords >= 3 AND LOWER(n.ngram) = t.w2
            AND ENDS_WITH(RTRIM(LOWER(n.pre)), t.pre_w)
            AND STARTS_WITH(LOWER(n.post), t.post_rest))
    )
    WHERE DATE(n.date) = DATE '${day}'
      AND n.lang = 'en'
    GROUP BY t.topic`;
}

export interface DayScanResult {
  /** canonical topic → occurrence count for this day (matched topics only). */
  counts: Map<string, number>;
  /** number of topics with at least one match. */
  topicsMatched: number;
  /** bytes billed by BigQuery for this query (watch this trend). */
  bytesBilled: number;
  /** wall-clock duration of the query, ms. */
  durationMs: number;
}

/** Scan ONE day of webngrams for every topic in a single query. */
export async function scanDay(day: string, topics: TopicMatcher[]): Promise<DayScanResult> {
  if (!ISO_DAY.test(day)) throw new Error(`scanDay: invalid day '${day}' (want YYYY-MM-DD)`);
  if (topics.length === 0) throw new Error("scanDay: no topics");

  const started = Date.now();
  // Built as a named object (not an inline literal) so TypeScript does a
  // structural assignability check against the client's Query type instead of an
  // excess-property check — keeps jobTimeoutMs even on a @google-cloud/bigquery
  // version whose types omit it (the field is still honoured at runtime).
  const jobOptions = {
    query: buildSql(day),
    location: LOCATION,
    params: { topics },
    types: {
      topics: [
        {
          topic: "STRING",
          nwords: "INT64",
          w1: "STRING",
          w2: "STRING",
          pre_w: "STRING",
          post_rest: "STRING",
        },
      ],
    },
    maximumBytesBilled: MAX_BYTES_BILLED,
    jobTimeoutMs: JOB_TIMEOUT_MS,
  };
  const [job] = await client().createQueryJob(jobOptions);

  const [rows] = await job.getQueryResults();
  const durationMs = Date.now() - started;

  const counts = new Map<string, number>();
  for (const r of rows as Array<{ topic: string; article_count: number | string }>) {
    counts.set(String(r.topic), Number(r.article_count) || 0);
  }

  let bytesBilled = 0;
  try {
    const [meta] = await job.getMetadata();
    const raw = meta?.statistics?.query?.totalBytesBilled;
    bytesBilled = Number(raw ?? 0) || 0;
  } catch {
    bytesBilled = 0; // metadata is best-effort; never fail a scan over it
  }

  return { counts, topicsMatched: counts.size, bytesBilled, durationMs };
}

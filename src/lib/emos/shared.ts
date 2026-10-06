import "server-only";
import type { Actor, EmosResult } from "@/lib/emos/actor";
import { BRIEF_PROMPT_MAX } from "@/lib/company-brief-types";
import { fitBrief } from "@/lib/company-brief-prompt";

/**
 * Small helpers shared by the read and run functions in src/lib/emos.
 * Nothing here talks to the service role.
 */

export type Row = Record<string, unknown>;
export type Args = Record<string, unknown>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

export const str = (v: unknown, max = 500): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export const bool = (v: unknown): boolean => v === true || v === "true";

export const cut = (v: unknown, max: number): string | null => {
  if (typeof v !== "string" || !v) return null;
  return v.length > max ? `${v.slice(0, max)}…` : v;
};

export const fail = (text: string, data?: unknown): EmosResult => ({ text, data, isError: true });

/** One wording for every "not yours or not there" case, so the answer never
 * tells a caller whether an id exists in somebody else's account. */
export const notFound = (what: string): EmosResult => fail(`No ${what} with that id in this account.`);

// ─── Paging: limit (25, max 100), keyset cursor on (time column, id), since ──

export interface Page {
  limit: number;
  cursor: { ts: string; id: string } | null;
  since: string | null;
}

const ISO_TS = /^\d{4}-\d{2}-\d{2}[T ][\d:.]+(Z|[+-]\d{2}(:?\d{2})?)?$/;

export function readPage(args: Args): Page | EmosResult {
  const n = Number(args.limit);
  const limit = Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), 100) : 25;

  let cursor: Page["cursor"] = null;
  if (typeof args.cursor === "string" && args.cursor) {
    try {
      const [ts, id] = Buffer.from(args.cursor, "base64url").toString("utf8").split("|");
      if (!ISO_TS.test(ts) || !isUuid(id)) throw new Error("bad cursor");
      cursor = { ts, id };
    } catch {
      return fail("That cursor is not valid. Use the next_cursor value from the previous page unchanged.");
    }
  }

  let since: string | null = null;
  if (typeof args.since === "string" && args.since) {
    const d = new Date(args.since);
    if (Number.isNaN(d.getTime())) return fail("`since` must be a date, for example 2026-10-01.");
    since = d.toISOString();
  }
  return { limit, cursor, since };
}

export const isResult = (v: unknown): v is EmosResult =>
  !!v && typeof v === "object" && typeof (v as EmosResult).text === "string" && "isError" in (v as object);

/** The PostgREST `or` filter that continues after a cursor on (col desc, id desc). */
export function afterCursor(col: string, c: { ts: string; id: string }): string {
  return `${col}.lt."${c.ts}",and(${col}.eq."${c.ts}",id.lt.${c.id})`;
}

/** Trim to the page and build the next cursor from the last row kept. */
export function closePage<T extends Row>(rows: T[], limit: number, col: string): { rows: T[]; next_cursor: string | null } {
  if (rows.length <= limit) return { rows, next_cursor: null };
  const kept = rows.slice(0, limit);
  const last = kept[kept.length - 1];
  const ts = last[col];
  return {
    rows: kept,
    next_cursor: typeof ts === "string" ? Buffer.from(`${ts}|${String(last.id)}`).toString("base64url") : null,
  };
}

// ─── Company (every tool takes an explicit company_id) ───────────────────────

export interface CompanyRow {
  id: string;
  name: string;
  context: string;
  website: string | null;
  spokesperson_name: string | null;
  spokesperson_title: string | null;
  spokesperson_email: string | null;
  spokesperson_linkedin: string | null;
}

const COMPANY_COLS =
  "id, name, context, website, spokesperson_name, spokesperson_title, spokesperson_email, spokesperson_linkedin";

/** The company, if it belongs to this actor's org. Null otherwise (not yours and not there look the same). */
export async function loadCompany(actor: Actor, companyId: unknown): Promise<CompanyRow | null> {
  if (!isUuid(companyId)) return null;
  const { data, error } = await actor
    .db()
    .from("companies")
    .select(COMPANY_COLS)
    .eq("org_id", actor.orgId)
    .eq("id", companyId)
    .maybeSingle();
  if (error) throw new Error(`Could not read the company: ${error.message}`);
  return (data as unknown as CompanyRow | null) ?? null;
}

/** The approved Company Brief, sized for a prompt. Null when there is none. Never throws. */
export async function approvedBrief(actor: Actor, companyId: string): Promise<string | null> {
  try {
    const { data } = await actor
      .db()
      .from("company_briefs")
      .select("content, status")
      .eq("org_id", actor.orgId)
      .eq("company_id", companyId)
      .maybeSingle();
    if (!data || data.status !== "approved") return null;
    const text = String(data.content ?? "").trim();
    return text ? fitBrief(text, BRIEF_PROMPT_MAX) : null;
  } catch (e) {
    console.error("[emos] approvedBrief failed:", e);
    return null;
  }
}

/** A row by id in this org, or null. For checking ids a caller passes in. */
export async function ownedRow(actor: Actor, table: string, id: unknown, columns = "id"): Promise<Row | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await actor.db().from(table).select(columns).eq("org_id", actor.orgId).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not read ${table}: ${error.message}`);
  return (data as unknown as Row | null) ?? null;
}

import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Actor, EmosResult } from "@/lib/emos/actor";
import { fail, isUuid, str, type Args, type Row } from "@/lib/emos/shared";

/**
 * EMOS — the write engine behind Tier W (spec v1.3 §4). Session 3, 2026-10-07.
 *
 * Every write, from either door, is a PLAN: an ordered list of row operations
 * on a short list of tables. A planner (src/lib/emos/journalists.ts,
 * src/lib/emos/ledger.ts) reads through the actor's row-level-security client
 * and builds the plan. Nothing in this folder writes a business table itself.
 *
 *   AI door (MCP):  preview  -> the plan is stored in mcp_audit_log, a token comes back
 *                   commit   -> { confirmation_token } only; Postgres applies the STORED plan
 *   Dashboard:      a person clicked, so the plan is applied at once (emos_dashboard_write)
 *
 * Both doors end in the same Postgres function, emos_apply_plan(), which runs
 * as the caller (row-level security on) in one transaction and records a
 * before/after snapshot of every row it touched. See supabase/mcp-stage4-session3.sql.
 *
 * Because the commit carries nothing but the token, it cannot be paired with
 * different arguments than the preview showed, and the single
 * `UPDATE … WHERE state = 'previewed'` in mcp_audit_claim() makes it single-use.
 */

export type LedgerTable =
  | "journalists"
  | "journalist_context"
  | "journalist_interactions"
  | "coverageiq_pitches"
  | "linkable_assets";

export interface PlanOp {
  /** `watch` writes nothing: it snapshots a row a trigger will change, so undo can restore it. */
  op: "insert" | "update" | "watch";
  table: LedgerTable;
  id: string;
  values?: Row;
  /** The row's updated_at when the preview was built. A different value at commit refuses the write. */
  expect_updated_at?: string | null;
}

export interface PlannedWrite {
  /** The cleaned-up arguments, kept on the audit row. */
  args: Row;
  plan: PlanOp[];
  /** What will happen, in plain words. Shown before anything is recorded. */
  preview: string;
  /** What the commit answers (and what a repeat with the same idempotency key answers again). */
  result: { text: string; data: Row };
  /** Idempotency keys this write will claim, e.g. Gmail message ids. */
  keys: string[];
  warnings: string[];
  /** Result fields whose text came from an inbox, an article or free typing. */
  untrusted?: string[];
  /** Set by undo_last_write: the audit row to reverse. */
  undoOf?: string;
}

/** A planner either has a write to preview, or an answer to give straight away
 * (a refusal, "already recorded", "nothing to change"). */
export type PlanOutcome = { kind: "plan"; write: PlannedWrite } | { kind: "result"; result: EmosResult };

export const planned = (write: PlannedWrite): PlanOutcome => ({ kind: "plan", write });
export const answer = (result: EmosResult): PlanOutcome => ({ kind: "result", result });
export const refuse = (text: string, data?: unknown): PlanOutcome => answer(fail(text, data));

export const newId = (): string => randomUUID();

/** Free text that arrives through a write tool is capped (spec §4.7). */
export const NOTE_MAX = 500;

const TOKEN_TTL_SECONDS = 10 * 60;
const sha256 = (v: string): string => createHash("sha256").update(v).digest("hex");

// ─── The switch ──────────────────────────────────────────────────────────────

/** organizations.ai_writes_enabled, read live through row-level security. Anything but a clear yes is a no. */
export async function aiWritesEnabled(actor: Actor): Promise<boolean> {
  try {
    const { data, error } = await actor.db().from("organizations").select("ai_writes_enabled").eq("id", actor.orgId).maybeSingle();
    if (error) {
      console.error("[emos] ai_writes_enabled read failed:", error.message);
      return false;
    }
    return data?.ai_writes_enabled === true;
  } catch (e) {
    console.error("[emos] ai_writes_enabled read threw:", e);
    return false;
  }
}

const WRITES_OFF =
  "AI writes are off for this organisation, so nothing was recorded. The switch is `ai_writes_enabled` on the organisation " +
  "(get_usage shows it). Only the account owner can turn it on; until then, record this with the buttons in the EMOS dashboard.";

// ─── Errors from the database, in plain words ────────────────────────────────

const WRITE_ERRORS: Record<string, string> = {
  ai_writes_off: WRITES_OFF,
  no_org: "This sign-in has no EMOS organisation. Nothing was recorded.",
  token_unknown: "That confirmation_token is not valid for this account. Nothing was recorded. Run the preview again.",
  token_wrong_tool: "That confirmation_token came from a different tool's preview. Commit with the tool that produced it. Nothing was recorded.",
  token_expired: "That preview is more than 10 minutes old. Nothing was recorded. Run the preview again and show it to the user.",
  duplicate_key: "That idempotency_key was recorded by another commit a moment ago. Nothing was written twice.",
  changed_since_preview: "A row changed after the preview was made. Nothing was recorded. Run the preview again.",
  row_not_found: "A row in this write is no longer in this account. Nothing was recorded. Run the preview again.",
  reference_not_found: "This write points at a company, journalist or pitch that is not in this account. Nothing was recorded.",
  undo_target_gone: "There is no write to undo any more: it was already undone, or a newer write was made since the preview. Nothing was changed.",
  changed_since_write: "Undo refused: a row from that write has been edited since, so reversing it could wipe newer work. Nothing was changed. Fix it by hand in the dashboard.",
  nothing_to_undo: "That write changed no rows, so there is nothing to undo.",
};

function writeErrorCode(message: string | undefined): string | null {
  const m = /emos_write:\s*([a-z_]+)/.exec(message ?? "");
  return m ? m[1] : null;
}

// ─── Idempotency ─────────────────────────────────────────────────────────────

export const cleanKey = (v: unknown): string | null => str(v, 200);

/** Which of these keys already have a committed write for this tool, with what that write answered. */
export async function alreadyRecorded(
  actor: Actor,
  tool: string,
  keys: string[],
): Promise<Map<string, { auditId: string; committedAt: string | null; result: { text?: string; data?: Row } | null }>> {
  const out = new Map<string, { auditId: string; committedAt: string | null; result: { text?: string; data?: Row } | null }>();
  const wanted = Array.from(new Set(keys.filter(Boolean)));
  if (wanted.length === 0) return out;
  const db = actor.db();
  const { data: hits, error } = await db.from("mcp_idempotency").select("key, audit_id").eq("org_id", actor.orgId).eq("tool", tool).in("key", wanted);
  if (error) throw new Error(`Could not check idempotency keys: ${error.message}`);
  const rows = (hits ?? []) as unknown as Row[];
  if (rows.length === 0) return out;
  const { data: audits } = await db
    .from("mcp_audit_log")
    .select("id, result, committed_at")
    .eq("org_id", actor.orgId)
    .in("id", Array.from(new Set(rows.map((r) => String(r.audit_id)))));
  const byId = new Map(((audits ?? []) as unknown as Row[]).map((a) => [String(a.id), a]));
  for (const r of rows) {
    const a = byId.get(String(r.audit_id));
    out.set(String(r.key), {
      auditId: String(r.audit_id),
      committedAt: (a?.committed_at as string | null) ?? null,
      result: (a?.result as { text?: string; data?: Row } | null) ?? null,
    });
  }
  return out;
}

// ─── Preview and commit (the AI door) ────────────────────────────────────────

async function previewWrite(actor: Actor, tool: string, write: PlannedWrite): Promise<EmosResult> {
  const secret = randomBytes(24).toString("base64url");
  const { data, error } = await actor.db().rpc("mcp_write_preview", {
    p_tool: tool,
    p_args: write.args,
    p_plan: write.plan,
    p_preview: write.preview,
    p_result: write.result,
    p_keys: write.keys,
    p_secret_hash: sha256(secret),
    p_client_id: actor.clientId ?? null,
    p_undo_of: write.undoOf ?? null,
  });
  if (error || !isUuid(data)) {
    const code = writeErrorCode(error?.message);
    if (code && WRITE_ERRORS[code]) return fail(WRITE_ERRORS[code], code === "ai_writes_off" ? { ai_writes_enabled: false } : undefined);
    console.error(`[emos] ${tool} preview failed:`, error?.message);
    throw new Error("Could not prepare the preview. Nothing was recorded. Please try again.");
  }
  const warn = write.warnings.length ? ` Check first: ${write.warnings.join(" ")}` : "";
  return {
    text:
      `PREVIEW ONLY, nothing is recorded yet. ${write.preview}${warn} ` +
      `Show this to the user. To record it, call ${tool} again with the confirmation_token and nothing else (valid for 10 minutes).`,
    data: {
      status: "preview",
      confirmation_token: `${String(data)}.${secret}`,
      expires_in_seconds: TOKEN_TTL_SECONDS,
      preview: write.preview,
      warnings: write.warnings,
      planned: write.result.data,
      rows_to_write: write.plan.filter((p) => p.op !== "watch").length,
      ...(write.untrusted?.length ? { _untrusted: write.untrusted.map((f) => `planned.${f}`) } : {}),
    },
  };
}

interface Committed {
  auditId: string;
  result: { text: string; data: Row };
  rowsChanged: number;
}

async function commitWrite(actor: Actor, tool: string, token: unknown): Promise<EmosResult | Committed> {
  const [id, secret] = typeof token === "string" ? token.trim().split(".") : [];
  if (!isUuid(id) || !secret) return fail(WRITE_ERRORS.token_unknown);

  const db = actor.db();
  const { data, error } = await db.rpc("mcp_write_commit", { p_id: id, p_secret_hash: sha256(secret), p_tool: tool });
  if (error) {
    const code = writeErrorCode(error.message);
    if (code === "token_used") {
      // A second commit of the same token: say what the first one did, write nothing.
      const { data: row } = await db.from("mcp_audit_log").select("result, state, committed_at").eq("org_id", actor.orgId).eq("id", id).maybeSingle();
      const first = (row?.result ?? null) as { text?: string; data?: Row } | null;
      return {
        text: `Already recorded${row?.committed_at ? ` at ${String(row.committed_at)}` : ""}${row?.state === "undone" ? " and since undone" : ""}; nothing new was written. ${first?.text ?? ""}`.trim(),
        data: { status: row?.state === "undone" ? "undone" : "already_committed", audit_id: id, ...(first?.data ?? {}) },
      };
    }
    if (code && WRITE_ERRORS[code]) return fail(WRITE_ERRORS[code], code === "ai_writes_off" ? { ai_writes_enabled: false } : undefined);
    console.error(`[emos] ${tool} commit failed:`, error.message);
    throw new Error("Could not record the write. Nothing was changed. Please run the preview again.");
  }
  const body = (data ?? {}) as { result?: { text?: string; data?: Row }; changes?: unknown[] };
  return {
    auditId: id,
    result: { text: body.result?.text ?? "Recorded.", data: body.result?.data ?? {} },
    rowsChanged: Array.isArray(body.changes) ? body.changes.length : 0,
  };
}

const isCommitted = (v: EmosResult | Committed): v is Committed => "auditId" in v;

/**
 * One write tool, both halves. Without a confirmation_token it plans and
 * previews; with one it commits the stored plan. The organisation's switch is
 * checked on both halves (and again inside the database).
 */
export async function runWriteTool(
  actor: Actor,
  tool: string,
  args: Args,
  planner: (actor: Actor, args: Args) => Promise<PlanOutcome>,
  /** Runs after a successful commit (stage events and the like). Must not throw; it is awaited. */
  afterCommit?: (actor: Actor, data: Row) => Promise<void>,
): Promise<EmosResult> {
  if (!(await aiWritesEnabled(actor))) return fail(WRITES_OFF, { ai_writes_enabled: false });

  const token = args.confirmation_token;
  if (token !== undefined && token !== null && token !== "") {
    const extra = Object.keys(args).filter((k) => k !== "confirmation_token" && args[k] !== undefined && args[k] !== null);
    if (extra.length) {
      return fail(
        `A commit takes the confirmation_token and nothing else (also sent: ${extra.join(", ")}). ` +
          "The server records exactly what the preview showed. To change something, run a new preview. Nothing was recorded.",
      );
    }
    const done = await commitWrite(actor, tool, token);
    if (!isCommitted(done)) return done;
    if (afterCommit) {
      try {
        await afterCommit(actor, done.result.data);
      } catch (e) {
        console.error(`[emos] ${tool} afterCommit failed (the write itself is saved):`, e);
      }
    }
    return {
      text:
        tool === "undo_last_write"
          ? done.result.text
          : `Recorded. ${done.result.text} It can be reversed with undo_last_write for 7 days, until another write is made.`,
      data: { status: "committed", audit_id: done.auditId, rows_changed: done.rowsChanged, ...done.result.data },
    };
  }

  const outcome = await planner(actor, args);
  if (outcome.kind === "result") return outcome.result;
  return previewWrite(actor, tool, outcome.write);
}

// ─── The dashboard door ──────────────────────────────────────────────────────

/**
 * Apply a plan at once for a signed-in person in the dashboard. Same plan
 * runner, same audit table (via = "dashboard"); no preview and no switch,
 * because a person pressed the button.
 */
export async function applyDashboardWrite(
  actor: Actor,
  tool: string,
  write: PlannedWrite,
): Promise<{ ok: true; auditId: string | null } | { ok: false; error: string }> {
  const { data, error } = await actor.db().rpc("emos_dashboard_write", { p_tool: tool, p_args: write.args, p_plan: write.plan });
  if (error) return { ok: false, error: error.message };
  return { ok: true, auditId: ((data as { id?: string } | null)?.id as string | undefined) ?? null };
}

// ─── Small shared pieces for planners ────────────────────────────────────────

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Today as YYYY-MM-DD (UTC). */
export const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * A calendar day from a caller: "2026-10-07" or any timestamp. Null when it is
 * not a date, in the future (one day of slack for time zones) or before 2015.
 * `undefined` in means "today".
 */
export function readDay(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return today();
  if (typeof v !== "string") return null;
  const s = v.trim();
  const d = new Date(DAY.test(s) ? `${s}T12:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() > Date.now() + 36 * 3_600_000) return null;
  if (d.getUTCFullYear() < 2015) return null;
  return DAY.test(s) ? s : d.toISOString().slice(0, 10);
}

/** Noon UTC on that day: an interaction on "7 Oct" stays on 7 Oct in every time zone the dashboard is read in. */
export const dayAtNoon = (day: string): string => `${day}T12:00:00Z`;

/** "arabnews.com" and "www.arabnews.com" and "ar.arabnews.com" are one site. */
export function sameSite(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const x = a.toLowerCase().replace(/^www\./, "");
  const y = b.toLowerCase().replace(/^www\./, "");
  return x === y || x.endsWith(`.${y}`) || y.endsWith(`.${x}`);
}

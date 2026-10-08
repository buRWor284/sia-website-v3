"use server";

/**
 * "What your AI did" (2026-10-08): the audit trail of writes made through the
 * EMOS connector (and the dashboard's own stage buttons), plus one Undo for
 * the most recent AI write. Spec v1.3 §7 Session 3, "plain audit table with
 * Undo".
 *
 * The Undo here runs the very same undo_last_write path the AI uses (preview,
 * then commit with the one-time token), so the same rules apply: one step,
 * 7 days, refused if a touched row was edited since, and only while the
 * organisation's AI writes switch is on. The audit row it creates carries
 * client_id "dashboard" so the log shows a person pressed the button.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Actor } from "@/lib/emos/actor";
import { runWriteTool } from "@/lib/emos/write-core";
import { LEDGER_TOOLS, planUndo } from "@/lib/emos/ledger";

interface AiActivityRow {
  id: string;
  tool: string;
  via: string;
  client_id: string | null;
  state: string;
  summary: string;
  rows: number;
  committed_at: string | null;
  undone_at: string | null;
}

async function dashboardActor(): Promise<Actor | null> {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");
  const { data: org } = await db.from("organizations").select("id").single();
  if (!org) return null;
  return { orgId: org.id as string, userId, email: "", isAdmin: false, via: "dashboard", clientId: "dashboard", db: () => db };
}

const UNDO_DAYS = 7;

export async function listAiActivity(): Promise<{ rows: AiActivityRow[]; writesOn: boolean; undoableId: string | null }> {
  const actor = await dashboardActor();
  if (!actor) return { rows: [], writesOn: false, undoableId: null };
  const db = actor.db();
  const [{ data, error }, { data: org }] = await Promise.all([
    db
      .from("mcp_audit_log")
      .select("id, tool, via, client_id, state, preview, result, changes, committed_at, undone_at")
      .eq("org_id", actor.orgId)
      .in("state", ["committed", "undone"])
      .order("committed_at", { ascending: false })
      .limit(60),
    db.from("organizations").select("ai_writes_enabled").eq("id", actor.orgId).maybeSingle(),
  ]);
  if (error) console.error("listAiActivity error:", error.message);
  const rows = ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const result = (r.result ?? {}) as { text?: string };
    const changes = Array.isArray(r.changes) ? r.changes : [];
    return {
      id: String(r.id),
      tool: String(r.tool),
      via: String(r.via),
      client_id: (r.client_id as string | null) ?? null,
      state: String(r.state),
      summary: String(result.text ?? r.preview ?? "").slice(0, 400),
      rows: changes.length,
      committed_at: (r.committed_at as string | null) ?? null,
      undone_at: (r.undone_at as string | null) ?? null,
    };
  });
  const writesOn = org?.ai_writes_enabled === true;
  // The one row Undo can reach: the newest AI-door write that is not itself an
  // undo, still committed, within the window, and only while writes are on.
  const last = rows.find((r) => r.via === "mcp_oauth" && r.tool !== "undo_last_write");
  const undoableId =
    writesOn && last && last.state === "committed" && last.committed_at &&
    Date.now() - new Date(last.committed_at).getTime() < UNDO_DAYS * 86_400_000
      ? last.id
      : null;
  return { rows, writesOn, undoableId };
}

/** Undo the most recent AI-door write. Returns one plain sentence either way. */
export async function undoLastAiWrite(): Promise<{ ok: boolean; message: string }> {
  const actor = await dashboardActor();
  if (!actor) return { ok: false, message: "Could not find your EMOS organisation." };
  try {
    const preview = await runWriteTool(actor, LEDGER_TOOLS.undo, {}, (a) => planUndo(a));
    const pdata = (preview.data ?? {}) as { status?: string; confirmation_token?: string };
    if (preview.isError || pdata.status !== "preview" || !pdata.confirmation_token) {
      return { ok: false, message: preview.text };
    }
    const done = await runWriteTool(actor, LEDGER_TOOLS.undo, { confirmation_token: pdata.confirmation_token }, (a) => planUndo(a));
    revalidatePath("/emos-platform/dashboard/ai-activity");
    revalidatePath("/emos-platform/dashboard/coverageiq");
    return { ok: !done.isError, message: done.text };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The undo could not run. Nothing was changed." };
  }
}

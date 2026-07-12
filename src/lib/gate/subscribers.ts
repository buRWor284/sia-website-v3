/**
 * Supabase helpers for the public-tool subscriber identity (Phase P1).
 * Service-role only (bypasses RLS); call exclusively from server routes.
 * Tables: tool_subscribers, subscriber_verifications (see gate.sql).
 */
import { createSupabaseServiceClient } from "@/lib/supabase";
import { hashCode, codeMatches } from "./codes";
import { CODE_TTL_MS, MAX_CODE_ATTEMPTS, RESEND_COOLDOWN_MS } from "./config";

function norm(email: string): string {
  return email.trim().toLowerCase();
}

/** A verified subscriber row, or null. */
export async function findVerified(email: string): Promise<{ id: string } | null> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db
    .from("tool_subscribers")
    .select("id, verified_at")
    .eq("email", norm(email))
    .maybeSingle();
  if (error) {
    console.warn("[gate] findVerified failed:", error.message);
    return null;
  }
  if (!data || !data.verified_at) return null;
  return { id: data.id as string };
}

/** Ms remaining on the resend cooldown for an email (0 = clear to send). */
export async function cooldownRemainingMs(email: string): Promise<number> {
  const db = createSupabaseServiceClient();
  const { data } = await db
    .from("subscriber_verifications")
    .select("last_sent_at")
    .eq("email", norm(email))
    .maybeSingle();
  if (!data?.last_sent_at) return 0;
  const elapsed = Date.now() - new Date(data.last_sent_at as string).getTime();
  return Math.max(0, RESEND_COOLDOWN_MS - elapsed);
}

/** Store a fresh pending code (hashed), resetting attempts + cooldown. */
export async function storePendingCode(email: string, code: string): Promise<boolean> {
  const db = createSupabaseServiceClient();
  const now = Date.now();
  const { error } = await db.from("subscriber_verifications").upsert({
    email: norm(email),
    code_hash: hashCode(code),
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
    attempts: 0,
    last_sent_at: new Date(now).toISOString(),
  });
  if (error) {
    console.error("[gate] storePendingCode failed:", error.message);
    return false;
  }
  return true;
}

export type VerifyResult =
  | { ok: true; id: string }
  | { ok: false; reason: "expired" | "attempts" | "mismatch" | "none" | "error" };

/** Verify a code; on success (idempotently) promote the email to a verified subscriber. */
export async function verifyCodeAndPromote(
  email: string,
  code: string,
  tool: string,
): Promise<VerifyResult> {
  const db = createSupabaseServiceClient();
  const e = norm(email);

  const { data, error } = await db
    .from("subscriber_verifications")
    .select("code_hash, expires_at, attempts")
    .eq("email", e)
    .maybeSingle();
  if (error) {
    console.error("[gate] verify lookup failed:", error.message);
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "none" };
  if ((data.attempts as number) >= MAX_CODE_ATTEMPTS) return { ok: false, reason: "attempts" };
  if (new Date(data.expires_at as string).getTime() < Date.now()) return { ok: false, reason: "expired" };

  if (!codeMatches(code, data.code_hash as string)) {
    await db
      .from("subscriber_verifications")
      .update({ attempts: (data.attempts as number) + 1 })
      .eq("email", e);
    return { ok: false, reason: "mismatch" };
  }

  // Success — promote (idempotent upsert on the unique email), then clear the code.
  const { data: sub, error: upErr } = await db
    .from("tool_subscribers")
    .upsert(
      { email: e, verified_at: new Date().toISOString(), source_tool: tool },
      { onConflict: "email" },
    )
    .select("id")
    .maybeSingle();
  if (upErr || !sub) {
    console.error("[gate] promote failed:", upErr?.message);
    return { ok: false, reason: "error" };
  }
  await db.from("subscriber_verifications").delete().eq("email", e);
  return { ok: true, id: sub.id as string };
}

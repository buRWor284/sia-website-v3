/**
 * Supabase org + user provisioning for EMOS platform users.
 *
 * Until now nothing ever INSERTed into `organizations`/`users` — every select
 * (dashboard, actions, logPitch) assumed the rows existed, so real new users hit
 * an empty dashboard and failing saves (M4 in the 2026-07-02 security review).
 *
 * Called from:
 *   - /api/webhooks/clerk on user.created (invited users)
 *   - the dashboard page as a lazy fallback for users created before this shipped
 *
 * Idempotent: returns early if the users row already exists.
 */
import { createSupabaseServiceClient } from "@/lib/supabase";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";
}

export async function ensureOrgProvisioned(
  clerkUserId: string,
  email: string,
  fullName?: string | null,
): Promise<{ ok: boolean; created: boolean; error?: string }> {
  try {
    const db = createSupabaseServiceClient();

    // Already provisioned?
    const { data: existing } = await db
      .from("users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    if (existing) return { ok: true, created: false };

    const displayName = fullName?.trim() || email.split("@")[0] || "New user";
    // Unique, deterministic slug: name + tail of the Clerk user ID.
    const slug = `${slugify(displayName)}-${clerkUserId.slice(-8).toLowerCase()}`;

    const { data: org, error: orgErr } = await db
      .from("organizations")
      .insert({
        // No Clerk Organizations yet — one personal org per user; the prefixed
        // user ID keeps the UNIQUE NOT NULL constraint satisfied and traceable.
        clerk_org_id: `personal_${clerkUserId}`,
        name: displayName,
        slug,
        plan: "emos",
      })
      .select("id")
      .single();

    if (orgErr || !org) {
      console.error("[emos-provision] org insert failed:", orgErr?.message);
      return { ok: false, created: false, error: orgErr?.message };
    }

    const { error: userErr } = await db.from("users").insert({
      clerk_user_id: clerkUserId,
      org_id: org.id,
      email,
      full_name: fullName?.trim() || null,
      role: "owner",
    });

    if (userErr) {
      console.error("[emos-provision] user insert failed:", userErr.message);
      // Clean up the orphaned org so a retry can succeed cleanly.
      await db.from("organizations").delete().eq("id", org.id);
      return { ok: false, created: false, error: userErr.message };
    }

    console.log(`[emos-provision] provisioned org ${org.id} for ${clerkUserId} (${email})`);
    return { ok: true, created: true };
  } catch (e) {
    console.error("[emos-provision] error:", e);
    return { ok: false, created: false, error: String(e) };
  }
}

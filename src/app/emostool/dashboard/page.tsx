import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

export default async function EmosDashboardPage() {
  const { userId, getToken } = await auth();

  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  // Fetch org from Supabase using Clerk JWT
  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  const { data: org, error } = await db
    .from("organizations")
    .select("id, name, slug, emos_stage, plan")
    .single();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>EMOS Dashboard</h1>
      <p>Welcome, Irfan.</p>
      <hr style={{ margin: "1.5rem 0" }} />

      {error || !org ? (
        <p style={{ color: "red" }}>
          Could not load org: {error?.message ?? "No org found"}
        </p>
      ) : (
        <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 6 }}>
          <p><strong>Org:</strong> {org.name}</p>
          <p><strong>Slug:</strong> {org.slug}</p>
          <p><strong>Plan:</strong> {org.plan}</p>
          <p><strong>EMOS Stage:</strong> {org.emos_stage}</p>
          <p><strong>Org ID:</strong> <code style={{ fontSize: 12 }}>{org.id}</code></p>
        </div>
      )}

      <hr style={{ margin: "1.5rem 0" }} />
      <p>Phase 1 complete. CoverageIQ coming next.</p>
    </main>
  );
}

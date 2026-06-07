import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function EmosDashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId) redirect("/sign-in");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>EMOS Dashboard</h1>
      <p>Welcome. You are logged in.</p>
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        User ID: {userId}<br />
        Org ID: {orgId ?? "No org yet"}
      </p>
      <hr style={{ margin: "2rem 0" }} />
      <p>Phase 1 complete — auth is wired. Tools coming next.</p>
    </main>
  );
}

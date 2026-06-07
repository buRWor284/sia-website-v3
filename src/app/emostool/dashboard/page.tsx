import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Only this user ID can access the dashboard during development.
const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

export default async function EmosDashboardPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>EMOS Dashboard</h1>
      <p>Welcome, Irfan. You are logged in.</p>
      <hr style={{ margin: "2rem 0" }} />
      <p>Phase 1 complete — auth is wired. Tools coming next.</p>
    </main>
  );
}

// src/app/emos-platform/dashboard/factcheckiq/page.tsx
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FactcheckIQClient from "@/components/emos-platform/FactcheckIQClient";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { isFactcheckOrgAllowed } from "@/lib/factcheck/access";

export const metadata: Metadata = {
  title: "FactcheckIQ",
  description: "AI-assisted fact-checking for earned-media content. Review before publishing.",
  robots: { index: false, follow: false },
};

// Session guard + private-testing allowlist. The subscription gate lives in the
// shared dashboard/layout.tsx (mirrors every other EMOS dashboard tool). While
// FACTCHECKIQ_ALLOWED_ORG_IDS is set, only allowlisted orgs see the tool;
// everyone else gets the in-testing screen below (the API routes enforce the
// same gate server-side, so this screen is honesty, not security).
export default async function FactcheckIQDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/emos-platform/signin");

  const db = createSupabaseServiceClient();
  const { data } = await db.from("users").select("org_id").eq("clerk_user_id", userId).single();
  const orgId = (data?.org_id as string | undefined) ?? null;

  if (!orgId || !isFactcheckOrgAllowed(orgId)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#e8e0cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            background: "#f1ebde",
            border: "1px solid rgba(26,20,16,.15)",
            padding: "36px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-grot)",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              background: "#1a1410",
              color: "#f5b81f",
              display: "inline-block",
              padding: "4px 10px",
              marginBottom: 16,
            }}
          >
            In testing
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, margin: "0 0 10px", color: "#1a1410" }}>
            FactcheckIQ is almost ready
          </h1>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.55, color: "rgba(26,20,16,.7)", margin: 0 }}>
            We are testing FactcheckIQ privately before opening it up. It will appear in your dashboard as soon as it
            passes. Until then, the rest of your EMOS tools are unaffected.
          </p>
          <a
            href="/emos-platform/dashboard"
            style={{
              display: "inline-block",
              marginTop: 22,
              padding: "10px 22px",
              background: "#f5b81f",
              color: "#1a1410",
              fontFamily: "var(--font-grot)",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return <FactcheckIQClient />;
}

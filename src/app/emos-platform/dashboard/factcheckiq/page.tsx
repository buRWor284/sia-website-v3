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

// Session guard + allowlist. The subscription gate lives in the shared
// dashboard/layout.tsx (mirrors every other EMOS dashboard tool). While
// FACTCHECKIQ_ALLOWED_ORG_IDS is set, only allowlisted orgs see the tool;
// everyone else gets the coming-soon screen below (the API routes enforce the
// same gate server-side, so this screen is honesty, not security).
//
// 30 Jul 2026: FactcheckIQ was pulled out of the EMOS launch. This screen used
// to say "In testing / almost ready", which promises a member it lands in their
// dashboard shortly. It doesn't — it ships later, separately. A paying member
// finding an unfulfilled promise inside the product they just bought is the
// most expensive place to overpromise, so this copy commits to nothing.
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
            Coming soon
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, margin: "0 0 10px", color: "#1a1410" }}>
            FactcheckIQ isn&rsquo;t part of EMOS yet
          </h1>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.55, color: "rgba(26,20,16,.7)", margin: 0 }}>
            It&rsquo;s still being built, and it isn&rsquo;t included in your subscription — so nothing you&rsquo;re
            paying for is missing. Your five EMOS tools are unaffected. We&rsquo;ll tell you here, and by email, when
            FactcheckIQ is ready and what it costs.
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

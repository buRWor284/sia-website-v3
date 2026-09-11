import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { subscriptionAccess } from "@/lib/emos-guard";
import CompanyProvider from "@/components/emos-platform/CompanyProvider";
import { listCompanies, getActiveCompanyId } from "@/app/emos-platform/actions/companies";
import type { Company } from "@/lib/company-types";

/**
 * Subscription gate for the PAID area only (dashboard + all tool pages + settings).
 *
 * Relocated here from the shared /emos-platform layout (2026-07-16). It used to
 * live on the shared layout (H3, 2026-07-02) to cover all five tool pages, but
 * that layout also wrapped /emos-platform/subscribe, so a signed-in cancelled
 * user was redirected /subscribe -> /subscribe forever (307 loop). Keeping the
 * gate here preserves platform-wide coverage while leaving the public
 * subscribe/auth pages ungated. Policy unchanged: status not "active" AND not
 * "none" blocks; "none" (admin-invited beta, no Stripe row) allowed; admins bypass.
 */
export default async function EmosDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let pastDue = false;
  if (userId) {
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "";

    // D4: pass the Clerk user id so a subscription bought under a different
    // payment address still resolves to this account.
    const access = await subscriptionAccess(email, userId);
    if (!access.allowed) {
      redirect("/emos-platform/subscribe");
    }
    // Grace period (2026-09-11): a failed card keeps access while Stripe
    // retries, but the customer must be told, or they only find out when
    // Stripe gives up and access disappears.
    pastDue = access.pastDue;
  }

  // The floating account chip (EmosUserButton) is fixed at bottom-right, and
  // bottom-right is where this design system puts primary actions: the wizard
  // footer's Next/Scan button (fixed, in SignalIQ / JournoCollabIQ / CollabIQ)
  // and ToolPipelineFooter's "Go to <next tool>" CTA (in-page, at the very end).
  // Raising the chip to bottom:76 cleared the fixed bars but then landed it on
  // the in-page CTA. Reserving space here is what actually fixes it: dashboard
  // content now always ends above the chip, so nothing can sit under it.
  // Found 2026-09-08 in the gate-03 run. Do not remove without moving the chip.
  // Company profiles (state layer phase 1, 2026-09-09). Fetched here rather
  // than in each tool so every dashboard page shares one list and renders with
  // the right company on first paint. Only for a signed-in user: listCompanies
  // redirects to signin otherwise, and this layout deliberately lets the
  // unauthenticated case fall through to middleware.
  let companies: Company[] = [];
  let activeCompanyId: string | null = null;
  if (userId) {
    [companies, activeCompanyId] = await Promise.all([listCompanies(), getActiveCompanyId()]);
  }

  return (
    <CompanyProvider initialCompanies={companies} initialActiveCompanyId={activeCompanyId}>
      {pastDue && <PastDueBar />}
      <div style={{ paddingBottom: 140 }}>{children}</div>
    </CompanyProvider>
  );
}

/** Shown on every dashboard page while the subscription is past_due. */
function PastDueBar() {
  return (
    <div
      role="alert"
      style={{
        background: "#f5b81f",
        color: "#1a1410",
        borderBottom: "1px solid #1a1410",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ flex: "1 1 320px", lineHeight: 1.4 }}>
        <strong>Your last payment didn&apos;t go through.</strong> Stripe will try your card again, but please update it so you don&apos;t lose access.
      </span>
      <form action="/api/emos-platform/billing-portal" method="POST" style={{ margin: 0 }}>
        <button
          type="submit"
          style={{
            background: "#1a1410",
            color: "#f1ebde",
            fontFamily: "Arial, 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            border: "none",
            padding: "9px 16px",
            cursor: "pointer",
          }}
        >
          Update card
        </button>
      </form>
    </div>
  );
}

/**
 * /emos-platform/dashboard/settings - account & profile management.
 * Renders Clerk <UserProfile /> (name, email addresses, password, connected
 * accounts, active sessions). Catch-all route so Clerk can path-route its own
 * sub-screens. Gated by dashboard/layout.tsx (active subscribers + admins only).
 *
 * D2 (2026-09-10): a "Manage billing" box sits above the profile. It is a plain
 * form POST to /api/emos-platform/billing-portal, which opens Stripe's customer
 * portal. This page became a server component so it can check, before showing
 * the button, whether the account has a Stripe customer at all: admins and
 * invited beta users do not, and they get one plain line instead of a button
 * that leads nowhere. <UserProfile /> is a client component and renders fine here.
 */

import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { findBillingCustomer } from "@/lib/emos-billing-portal";

const INK = "#1a1410";
const PAPER = "#f1ebde";
const YEL = "#f5b81f";
const GROT = "Arial, 'Helvetica Neue', sans-serif";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string | string[] }>;
}) {
  const { userId } = await auth();
  const { billing } = await searchParams;

  // On a lookup error, still show the button: the route repeats the lookup and
  // lands back here with ?billing=unavailable if it fails again.
  const lookup = userId ? await findBillingCustomer(userId) : { kind: "none" as const };
  const hasCustomer = lookup.kind !== "none";
  const unavailable = billing === "unavailable";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 880 }}>
        <a
          href="/emos-platform/dashboard"
          style={{
            display: "inline-block",
            marginBottom: 24,
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "rgba(26,20,16,.55)",
            textDecoration: "none",
          }}
        >
          &larr; Back to dashboard
        </a>

        <section
          aria-label="Billing"
          style={{
            border: `1px solid ${INK}`,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 9,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: INK,
              background: YEL,
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            Billing
          </span>

          {hasCustomer ? (
            <>
              <form action="/api/emos-platform/billing-portal" method="POST" style={{ margin: 0 }}>
                <button
                  type="submit"
                  style={{
                    background: INK,
                    color: PAPER,
                    fontFamily: GROT,
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    border: "none",
                    padding: "11px 18px",
                    cursor: "pointer",
                  }}
                >
                  Manage billing &middot; cancel, card, invoices
                </button>
              </form>
              <p style={{ fontFamily: GROT, fontSize: 12, lineHeight: 1.5, color: "rgba(26,20,16,.7)", margin: 0, flex: "1 1 260px" }}>
                Opens Stripe&apos;s secure billing page. If you cancel, you keep access until the end of the month you paid for.
              </p>
            </>
          ) : (
            <p style={{ fontFamily: GROT, fontSize: 13, color: INK, margin: 0 }}>
              This account has no paid subscription.
            </p>
          )}

          {unavailable && hasCustomer && (
            <p role="status" style={{ fontFamily: GROT, fontSize: 12, color: "#9a3412", margin: 0, flexBasis: "100%" }}>
              Billing could not be opened just now. Please try again in a minute, or email sia@syedirfanajmal.com.
            </p>
          )}
        </section>

        <UserProfile path="/emos-platform/dashboard/settings" routing="path" />
      </div>
    </div>
  );
}

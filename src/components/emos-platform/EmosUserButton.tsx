"use client";

/**
 * EmosUserButton: floating Clerk account button for all EMOS platform pages.
 * Near-black chip with the signed-in user's name/email beside the avatar and a
 * dropdown caret, so it clearly reads as a clickable account menu. "Manage
 * account" opens in-place (modal), so ANY signed-in user (including a lapsed
 * subscriber who no longer has dashboard access) can still manage their
 * profile / password / sign out. Renders nothing when signed out.
 */

import { UserButton } from "@clerk/nextjs";

export function EmosUserButton() {
  return (
    <div
      style={{
        position: "fixed",
        // 76, not 24: SignalIQ / JournoCollabIQ / CollabIQ each render a wizard
        // footer fixed at bottom:0 (~60px tall) whose Next/Scan button sits at
        // the RIGHT edge - exactly under this chip, which wins on z-index and
        // swallowed the primary action on every step of every wizard. Found
        // 2026-09-08 in the gate-03 run, on a new customer's very first action.
        // Never hit on /tools/* because the chip only renders inside
        // /emos-platform, so the public tools are clean and this stayed
        // invisible to the only account that had ever used the dashboard.
        bottom: 76,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#0f0b07",
        boxShadow: "0 6px 22px rgba(0,0,0,.45)",
        padding: "8px 12px",
      }}
    >
      <UserButton
        showName
        appearance={{
          elements: {
            userButtonBox: { backgroundColor: "transparent" },
            userButtonTrigger: { backgroundColor: "transparent" },
            userButtonOuterIdentifier: {
              color: "#f1ebde",
              fontFamily: "Arial, 'Helvetica Neue', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: ".02em",
            },
            avatarBox: {
              width: 34,
              height: 34,
              border: "2px solid rgba(241,235,222,.3)",
            },
          },
        }}
      >
        {/* D2 (2026-09-10): a link, not a direct POST to the portal route.
            This chip also renders on /emos-platform/subscribe for lapsed
            accounts, and /api/emos-platform/* answers them with raw JSON from
            proxy.ts. The settings page holds the real button and the dashboard
            layout redirects anyone without access, so this path never shows
            an error page. */}
        <UserButton.MenuItems>
          <UserButton.Action label="manageAccount" />
          <UserButton.Link
            label="Manage billing"
            labelIcon={<CardIcon />}
            href="/emos-platform/dashboard/settings"
          />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
      <span
        aria-hidden={true}
        style={{ color: "rgba(241,235,222,.7)", fontSize: 12, lineHeight: 1, pointerEvents: "none" }}
      >
        &#9662;
      </span>
    </div>
  );
}

function CardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" />
      <path d="M1.5 6.5h13" stroke="currentColor" />
    </svg>
  );
}

"use client";

/**
 * EmosUserButton: floating Clerk account button for all EMOS platform pages.
 * Shows the signed-in user's name beside the avatar (showName) inside a small
 * paper chip, so it reads clearly as "your account" instead of a bare circle.
 * Renders nothing when signed out. Includes sign-out + account management;
 * "Manage account" navigates to /emos-platform/dashboard/settings.
 */

import { UserButton } from "@clerk/nextjs";

export function EmosUserButton() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        background: "rgba(241,235,222,.94)",
        border: "1px solid rgba(26,20,16,.14)",
        boxShadow: "0 2px 12px rgba(26,20,16,.14)",
        padding: "7px 12px",
      }}
    >
      <UserButton
        showName
        userProfileMode="navigation"
        userProfileUrl="/emos-platform/dashboard/settings"
        appearance={{
          elements: {
            userButtonOuterIdentifier: {
              color: "#1a1410",
              fontFamily: "Arial, 'Helvetica Neue', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: ".02em",
            },
            avatarBox: {
              width: 34,
              height: 34,
              border: "2px solid rgba(26,20,16,.2)",
            },
          },
        }}
      />
    </div>
  );
}

"use client";

/**
 * EmosUserButton: floating Clerk account button for all EMOS platform pages.
 * Dark ink chip with the signed-in user's name/email beside the avatar, so it
 * reads clearly as "your account" and its edges stay visible on the paper page.
 * Renders nothing when signed out. "Manage account" -> /emos-platform/dashboard/settings.
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
        background: "#1a1410",
        boxShadow: "0 4px 20px rgba(26,20,16,.35)",
        padding: "7px 10px 7px 14px",
      }}
    >
      <UserButton
        showName
        userProfileMode="navigation"
        userProfileUrl="/emos-platform/dashboard/settings"
        appearance={{
          elements: {
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
              border: "2px solid rgba(241,235,222,.25)",
            },
          },
        }}
      />
    </div>
  );
}

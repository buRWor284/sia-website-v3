"use client";

/**
 * EmosUserButton: floating Clerk account button for all EMOS platform pages.
 * Near-black chip with the signed-in user's name/email beside the avatar and a
 * dropdown caret, so it clearly reads as a clickable account menu (Manage
 * account / Sign out). Renders nothing when signed out.
 * "Manage account" -> /emos-platform/dashboard/settings.
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
        gap: 6,
        background: "#0f0b07",
        boxShadow: "0 6px 22px rgba(0,0,0,.45)",
        padding: "8px 12px",
      }}
    >
      <UserButton
        showName
        userProfileMode="navigation"
        userProfileUrl="/emos-platform/dashboard/settings"
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
      />
      <span
        aria-hidden={true}
        style={{ color: "rgba(241,235,222,.7)", fontSize: 12, lineHeight: 1, pointerEvents: "none" }}
      >
        &#9662;
      </span>
    </div>
  );
}

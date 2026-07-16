"use client";

/**
 * EmosUserButton — floating Clerk UserButton for all EMOS platform pages.
 * Renders in the bottom-right corner so it doesn't conflict with any tool chrome.
 * Includes sign-out, profile, and account management.
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
      }}
    >
      <UserButton
        appearance={{
          elements: {
            avatarBox: {
              width: 36,
              height: 36,
              border: "2px solid rgba(26,20,16,.2)",
            },
          },
        }}
      />
    </div>
  );
}

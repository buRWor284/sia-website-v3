"use client";

/**
 * /emos-platform/dashboard/settings - account & profile management.
 * Renders Clerk <UserProfile /> (name, email addresses, password, connected
 * accounts, active sessions). Catch-all route so Clerk can path-route its own
 * sub-screens. Gated by dashboard/layout.tsx (active subscribers + admins only).
 */

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1ebde",
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
            fontFamily: "Arial, 'Helvetica Neue', sans-serif",
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
        <UserProfile path="/emos-platform/dashboard/settings" routing="path" />
      </div>
    </div>
  );
}

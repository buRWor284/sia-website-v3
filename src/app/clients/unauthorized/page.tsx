import { GROT, INK, INK55, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SignOutButton } from "@clerk/nextjs";

export const metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export default function ClientUnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: INK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 24,
      }}
    >
      {/* Badge */}
      <span
        style={{
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 8,
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
          color: INK,
          background: YEL,
          padding: "4px 8px",
        }}
      >
        Access Denied
      </span>

      {/* Heading */}
      <h1
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: "clamp(28px, 5vw, 48px)",
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          color: PAPER,
          margin: 0,
          textAlign: "center",
        }}
      >
        Wrong workspace.
      </h1>

      {/* Body */}
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.55,
          color: INK55,
          margin: 0,
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        Your account is not authorised for this client workspace. If you believe
        this is an error, contact your account manager.
      </p>

      {/* Sign out */}
      <SignOutButton redirectUrl="/">
        <button
          style={{
            marginTop: 8,
            padding: "11px 20px",
            background: "transparent",
            border: `1px solid rgba(250,250,250,.25)`,
            color: PAPER,
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            cursor: "pointer",
          }}
        >
          Sign out →
        </button>
      </SignOutButton>
    </div>
  );
}

import { SignOutButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Access Required — EMOS Platform",
};

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const INK35 = "rgba(26,20,16,.32)";
const YEL   = "#f5b81f";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

export default function NotInvitedPage() {
  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 16 }}>
          EMOS Platform
        </div>

        <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 28, letterSpacing: "-.01em", color: INK, margin: "0 0 16px" }}>
          Access by invitation only
        </h1>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.6, margin: "0 0 32px" }}>
          The EMOS Platform is currently in private beta. This account hasn&apos;t been granted access yet.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <a
            href="/emos"
            style={{ display: "inline-block", padding: "12px 28px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Learn about EMOS →
          </a>

          <SignOutButton redirectUrl="/sign-in">
            <button style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(26,20,16,.2)", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer" }}>
              Sign out and try a different account
            </button>
          </SignOutButton>
        </div>

        <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK35, marginTop: 40 }}>
          To request access, contact Irfan directly.
        </p>

      </div>
    </div>
  );
}

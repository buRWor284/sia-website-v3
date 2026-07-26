import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — EMOS Platform",
  robots: { index: false, follow: false },
};

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const GROT  = "var(--font-grot)";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      {/* EMOS brand mark */}
      <div style={{ marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 20, letterSpacing: ".18em", textTransform: "uppercase", color: INK }}>
          EMOS
        </div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>
          Earned Media Operating System
        </div>
      </div>

      {/* 2026-07-26: the "Private beta — access by invitation only" note that
          used to sit here is gone. Two reasons. It is factually wrong now that
          EMOS is sold self-serve at $50/month, and it sat OUTSIDE the <SignIn>
          widget: on submit Clerk unmounts the box while the redirect resolves,
          leaving this line alone on screen. A customer who had just paid and
          signed in watched the page tell them they were not invited. */}

      <SignIn
        fallbackRedirectUrl="/emos-platform/dashboard"
        appearance={{
          variables: {
            colorPrimary: INK,
            colorBackground: PAPER,
            fontFamily: "var(--font-newsreader), serif",
          },
          elements: {
            card: { boxShadow: "none", border: "1px solid rgba(26,20,16,.15)", borderRadius: 0 },
            headerTitle: { fontFamily: GROT, letterSpacing: ".08em", textTransform: "uppercase" },
            headerSubtitle: { display: "none" },
            formButtonPrimary: { background: INK, borderRadius: 0, fontFamily: GROT, letterSpacing: ".10em" },
            footer: { display: "none" },
            socialButtonsBlock: { display: "none" },
            socialButtonsBlockButton: { display: "none" },
            socialButtonsIconButton: { display: "none" },
            dividerRow: { display: "none" },
            dividerLine: { display: "none" },
            dividerText: { display: "none" },
          },
        }}
      />
    </div>
  );
}

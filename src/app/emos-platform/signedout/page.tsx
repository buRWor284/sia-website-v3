import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signed Out — EMOS Platform",
  robots: { index: false, follow: false },
};

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

const OPTIONS = [
  { href: "/",          label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/tools",     label: "Free tools" },
];

export default function SignedOutPage() {
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

      <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 22, letterSpacing: ".04em", textTransform: "uppercase", color: INK, margin: "24px 0 0", textAlign: "center" }}>
        You&apos;re signed out
      </h1>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, margin: "10px 0 28px", textAlign: "center", maxWidth: 360, lineHeight: 1.5 }}>
        Your EMOS session has ended. Where would you like to go next?
      </p>

      {/* Primary: back into the platform */}
      <Link href="/emos-platform/signin" style={{ display: "inline-block", padding: "14px 34px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}>
        Sign back in
      </Link>

      {/* Secondary: public destinations */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 18, maxWidth: 420 }}>
        {OPTIONS.map(({ href, label }) => (
          <Link key={href} href={href} style={{ display: "inline-block", padding: "12px 22px", background: "transparent", color: INK, border: "1px solid rgba(26,20,16,.15)", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

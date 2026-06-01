import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { DoubleRule, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section
        className="sx"
        style={{ background: PAPER, minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}
      >
        <Pill size={11} ls="0.22em">Coming Soon</Pill>
        <h1 style={{ marginTop: 24, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Privacy Policy
        </h1>
        <p style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, maxWidth: 480, lineHeight: 1.55 }}>
          Our privacy policy is being prepared and will be published shortly.
        </p>
        <DoubleRule style={{ marginTop: 40, maxWidth: 320 }} />
        <p style={{ marginTop: 20, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>
          Questions? &nbsp;
          <a href="/contact" style={{ color: INK, textDecoration: "underline" }}>Get in touch</a>
        </p>
      </section>
      <Subscriptions />
      <Colophon />
      <ScrollButtons />
    </>
  );
}

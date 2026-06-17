import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { DoubleRule, Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Real case studies. Unfiltered lessons. Two emails a month from a fractional CMO with 20+ years in the trenches.",
  openGraph: {
    title: "Newsletter · Earned Media Lessons Twice a Month",
    description:
      "Real case studies and unfiltered lessons. Two emails a month from a fractional CMO with 20+ years in the trenches.",
  },
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <>
      <section
        className="sx"
        style={{ background: PAPER, textAlign: "center", paddingTop: 60, paddingBottom: 20 }}
      >
        <Pill size={11} ls="0.22em">Newsletter</Pill>
        <h1 style={{ marginTop: 24, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Two emails a month.
        </h1>
        <p style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, maxWidth: 520, lineHeight: 1.55, margin: "16px auto 0" }}>
          Real case studies, unfiltered lessons, and the occasional behind-the-scenes
          dispatch from a fractional CMO with 20+ years in the trenches.
        </p>
        <SCaps size={10} ls="0.18em" color={INK55} style={{ marginTop: 24, display: "block" }}>
          Join below.
        </SCaps>
      </section>
      <Subscriptions sectionNumber="01" />
      <Colophon />
      <ScrollButtons />
    </>
  );
}

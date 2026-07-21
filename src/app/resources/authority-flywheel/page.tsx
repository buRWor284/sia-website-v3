import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Earned Media Authority Flywheel",
  description:
    "An interactive model of how earned media compounds: reputation, visibility, conversions, brand equity, magnetism, and liberty, each turn making the next easier.",
  openGraph: {
    title: "The Authority Flywheel: Six Compounding Returns of Earned Media",
    description:
      "An interactive model of how earned media compounds, and why each turn of the wheel makes the next one easier.",
  },
};

import CoverageFlywheel from "@/components/bureau/CoverageFlywheel";
import { Colophon, Subscriptions } from "@/components/bureau";
import { HRule, Mark, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
import { BLUE, GROT, INK, INK15, INK35, INK55, INK70, MONO, PAPER, SERIF } from "@/lib/tokens";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const RETURNS = [
  { num: "01", name: "Reputation", desc: "Media mentions signal authority to prospects, partners, and search engines at the same time." },
  { num: "02", name: "Visibility", desc: "Editorial coverage reaches audiences that no paid budget can reliably touch." },
  { num: "03", name: "Conversions", desc: "Third-party validation turns interest into intent, faster than any owned content can." },
  { num: "04", name: "Brand Equity", desc: "Consistent coverage compounds into a brand that commands premium positioning over time." },
  { num: "05", name: "Magnetism", desc: "Press begets press. Journalists cite sources other journalists have already cited." },
  { num: "06", name: "Liberty", desc: "A media-backed brand earns pricing power, category leadership, and optionality." },
];

const P: React.CSSProperties = { margin: "0 0 20px", fontFamily: SERIF, fontSize: 18, lineHeight: 1.75, color: INK70, maxWidth: 680 };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthorityFlywheelPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 48px" }}>
        <SectionMast n="00" label="Resource · Interactive Infographic" />
        <Pill size={10.5} ls="0.18em">Earned Media</Pill>
        <h1 style={{ margin: "16px 0 24px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(44px, 7vw, 72px)", lineHeight: 0.96, letterSpacing: "-0.03em", maxWidth: 900 }}>
          The Authority{" "}
          <span style={{ fontStyle: "italic" }}>
            <Mark>Flywheel</Mark>
          </span>
        </h1>
        <p style={{ ...P, fontSize: 20, lineHeight: 1.6 }}>
          Most marketing spend rents attention. The moment you stop paying, the attention stops. Earned media works differently: a credible mention in a publication your buyers already trust keeps working long after it goes live, and it makes the next mention easier to get.
        </p>
        <p style={P}>
          I call this the Authority Flywheel. Six returns, each one feeding the next. Spin it long enough and the wheel starts turning on its own, because journalists cite sources other journalists have already cited.
        </p>
        <div style={{ display: "flex", gap: 32, marginTop: 40, paddingTop: 24, borderTop: `1px solid ${INK15}`, flexWrap: "wrap" }}>
          {[
            { label: "Author", value: "Syed Irfan Ajmal" },
            { label: "Published", value: "July 2026" },
            { label: "Format", value: "Interactive · 3 minute read" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wheel ──────────────────────────────────────────────── */}
      <section style={{ padding: "8px 24px 24px" }}>
        <CoverageFlywheel
          hubEyebrow="Earned Media"
          hubTitle="Authority Flywheel"
          hubSub="Six compounding returns"
          ctaHref="/speaking"
          ctaLabel="Hear this model as a talk →"
        />
        <p style={{ margin: "18px 0 0", textAlign: "center", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: INK55 }}>
          Hover or tap a segment to see each return&apos;s description
        </p>
      </section>

      {/* ── The six returns ────────────────────────────────────── */}
      <section style={{ padding: "48px 56px 24px" }}>
        <SectionMast n="01" label="The Six Returns" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0 40px", borderTop: `1px solid ${INK15}`, maxWidth: 980 }}>
          {RETURNS.map(({ num, name, desc }) => (
            <div key={num} style={{ borderBottom: `1px solid ${INK15}`, padding: "18px 0 20px" }}>
              <SCaps size={11} ls="0.14em" color={BLUE}>{num}</SCaps>
              <h2 style={{ margin: "4px 0 8px", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: INK }}>
                {name}
              </h2>
              <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: INK70 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why it compounds ───────────────────────────────────── */}
      <section style={{ padding: "32px 56px 64px" }}>
        <SectionMast n="02" label="Why It Compounds" />
        <p style={P}>
          None of these six is exotic on its own. The interesting part is the sequence: reputation buys visibility, visibility feeds conversions, and by the fourth or fifth turn the press is coming to you instead of the other way around. That sequence, and how a small team starts the wheel without a big budget or an agency, is what I unpack when I speak on earned media.
        </p>
        <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 20, maxWidth: 680, marginTop: 36 }}>
          <h3 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>Bring this to your stage or team</h3>
          <HRule />
          <p style={{ margin: "14px 0 20px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK70 }}>
            I give talks and workshops on earned media and the Authority Flywheel, including sessions for the World Bank, SEMrush, and Ahrefs.
          </p>
          <a
            href="/speaking"
            style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none" }}
          >
            About my speaking →
          </a>
        </div>
      </section>

      <Subscriptions sectionNumber="03" />
      <Colophon />
    </div>
  );
}

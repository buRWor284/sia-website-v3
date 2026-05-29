import { DoubleRule, Mark, Pill, SCaps } from "@/components/bureau/primitives";
import {
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

const HP_KITS = [
  {
    no: "01", badge: "Interactive Kit",
    title: "Top 11 Scientific Benefits of Writing",
    sub: "Eleven findings. Each with a prescription.",
    blurb: "Research-backed case for writing as a daily practice — anxiety, memory, cognition. Each finding comes with a study citation and a prescription you can act on this week.",
    href: "/infographics/writing-benefits",
    year: "2019 · Updated 2026",
  },
  {
    no: "02", badge: "Interactive Kit",
    title: "The Journo Outreach Checklist",
    sub: "Seven steps to a pitch reporters actually paste in.",
    blurb: "Copy-clip snippets, an interactive progress meter, and a print mode. The SIA system for HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer.",
    href: "/infographics/journo-outreach-checklist",
    year: "2026",
  },
];

export function KitsFeature() {
  return (
    <section
      className="sx"
      style={{
        background: PAPER2,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `3px solid ${YEL}`,
      }}
    >
      {/* Custom header */}
      <div style={{ marginBottom: 32 }}>
        <DoubleRule />
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "10px 0 6px" }}>
          <Pill size={11} ls="0.18em">Free to use</Pill>
          <SCaps size={11.5} ls="0.22em" color={INK}>Kits · Interactive tools &amp; checklists</SCaps>
          <div style={{ flex: 1, height: 1, background: INK35 }} />
          <a
            href="/resources#res-kits"
            style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 11,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK, textDecoration: "none",
            }}
          >
            All resources →
          </a>
        </div>
        <div style={{ marginTop: -1, borderTop: `1px solid ${INK}` }} />
      </div>

      <div className="grid-intro" style={{ marginBottom: 48 }}>
        <h2
          className="h2-xl"
          style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
        >
          Open them.<br />
          <span style={{ fontStyle: "italic" }}><Mark>Use them today.</Mark></span>
        </h2>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
          Two free interactive tools — not just content to read. Progress trackers,
          copy-clip snippets, print modes. Open one when you have a job to do.
        </p>
      </div>

      <div className="grid-cards-2" style={{ border: `1px solid ${INK}` }}>
        {HP_KITS.map((kit, i) => (
          <a
            key={kit.title}
            href={kit.href}
            className="card-border-2"
            style={{
              padding: "32px 28px 26px",
              background: i === 1 ? PAPER : PAPER2,
              textDecoration: "none", color: INK,
              display: "flex", flexDirection: "column", minHeight: 320,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
              <Pill size={10.5} ls="0.18em">{kit.badge}</Pill>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
                Nº {kit.no}
              </div>
            </div>

            <div
              aria-hidden
              style={{
                height: 56, marginBottom: 20,
                background: `repeating-linear-gradient(135deg, ${YEL} 0 7px, transparent 7px 14px)`,
                border: `1px solid ${INK}`,
              }}
            />

            <h3 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
              {kit.title}
            </h3>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: INK70, lineHeight: 1.35, marginBottom: 14 }}>
              {kit.sub}
            </div>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.55, flex: 1 }}>
              {kit.blurb}
            </p>
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <SCaps size={10} ls="0.12em" color={INK55}>{kit.year}</SCaps>
              <SCaps size={10.5} ls="0.16em" color={INK}>Open the Kit ↗</SCaps>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

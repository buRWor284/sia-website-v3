import { SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF } from "@/lib/tokens";

// ─── Stages row + press row ───────────────────────────────────────────────────
// Two rows that do work prose cannot. Labelling here is deliberate and load
// bearing, so read this before changing any string below.
//
//   • The events row is labelled "Stages", never "clients". These are rooms that
//     hosted a talk. Several are not commercial relationships at all.
//   • The press row is labelled "Where my work has been covered or published",
//     never "clients" and never "featured in" on its own, because "featured in"
//     collapses the distinction between being quoted and carrying a byline.
//     The microcopy under the row keeps that distinction explicit, and it is the
//     reason the row can stay strong without overclaiming.
//   • There is deliberately NO client logo wall on these pages. Building a
//     lookalike out of weaker logos would invite exactly the comparison it loses.
//
// Ordering: Gulf first, then international institutions, then Pakistan. A Riyadh
// or Dubai organiser scans the first row and stops.
//
// Years: all confirmed against the Past Stages inventory on /speaking. G-Day X is
// 2014 and IYDC is 2015, both settled by Irfan 2026-07-30 (the /speaking table
// previously said IYDC 2013, which contradicted Maryam Arshad Mahmood's
// recommendation naming IYDC2015; the table was corrected, not her words).
// Startup Grind carries no year because none is verified. Do not guess one.
//
// These are typeset wordmarks rather than image files: the press-kit logo folder
// covers only some of these names, and a row that mixes real logos with text
// stand-ins looks worse than a row that is consistently typeset.

const STAGES_ROW: ReadonlyArray<[string, string]> = [
  ["Arabian Travel Market", "Dubai · 2018"],
  ["M Powered Summit", "Dubai · 2016"],
  ["AstroLabs", "Dubai · 2016"],
  ["IN5 Innovation Hub", "Dubai · 2018"],
  ["IK Institute of Business", "Dubai · 2016"],
  ["DMSS Conference", "Bali · 2017"],
  ["MaGIC", "Cyberjaya · 2016"],
  ["National Incubation Center", "Islamabad · 2017"],
  ["Startup Grind", "Peshawar"],
  ["IYDC", "Peshawar · 2015"],
  ["G-Day X", "Peshawar · 2014"],
  ["University of Peshawar", "Peshawar · 2014"],
];

const PRESS_ROW: ReadonlyArray<string> = [
  "Harvard Business Review",
  "Forbes",
  "Forbes Middle East",
  "World Bank",
  "HuffPost",
  "SEMrush",
  "SERPed",
];

export default function CredentialRows() {
  return (
    <section
      className="sx"
      style={{ background: PAPER2, paddingTop: 72, paddingBottom: 76, borderTop: `1px solid ${INK}` }}
    >
      {/* ── Stages ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <SCaps size={11} ls="0.20em" color={INK}>Stages · Where I have spoken</SCaps>
        <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {STAGES_ROW.map(([name, where]) => (
          <div
            key={name}
            style={{
              border: `1px solid ${INK35}`,
              background: PAPER,
              padding: "12px 16px 13px",
              flex: "1 1 200px",
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 16,
                color: INK,
                lineHeight: 1.2,
                letterSpacing: "-0.012em",
              }}
            >
              {name}
            </div>
            <div style={{ marginTop: 5 }}>
              <SCaps size={9} ls="0.14em" color={INK55}>{where}</SCaps>
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          margin: "14px 0 0",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: INK70,
          lineHeight: 1.5,
        }}
      >
        Four countries on stage. Live audiences up to ~500.
      </p>

      {/* ── Press ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginTop: 44 }}>
        <SCaps size={11} ls="0.20em" color={INK}>
          Where my work has been covered or published
        </SCaps>
        <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0,
          borderTop: `1px solid ${INK15}`,
          borderBottom: `1px solid ${INK15}`,
        }}
      >
        {PRESS_ROW.map((p, i) => (
          <div key={p} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 ? (
              <div style={{ width: 3, height: 3, background: INK35, marginLeft: 18, marginRight: 18 }} />
            ) : null}
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: "clamp(15px, 2vw, 20px)",
                color: INK,
                lineHeight: 1.2,
                letterSpacing: "-0.015em",
                padding: "16px 0",
              }}
            >
              {p}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          margin: "14px 0 0",
          fontFamily: GROT,
          fontSize: 12.5,
          color: INK70,
          lineHeight: 1.6,
          letterSpacing: "0.01em",
        }}
      >
        Quoted in Harvard Business Review and Forbes USA. Bylines in Forbes Middle East, World Bank
        publications, HuffPost, SEMrush and SERPed.
      </p>
    </section>
  );
}

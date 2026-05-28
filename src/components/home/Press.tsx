import { GROT, INK, PAPER, SERIF } from "@/lib/tokens";
import { DoubleRule, HRule, Pill } from "@/components/bureau/primitives";

type Mark = {
  name: string;
  weight: number;
  size: number;
  serif?: boolean;
  italic?: boolean;
  ls?: string;
};

const MARKS: ReadonlyArray<Mark> = [
  { name: "Forbes",                  weight: 700, size: 26, serif: true },
  { name: "Harvard Business Review", weight: 600, size: 15, serif: true, ls: "0.04em" },
  { name: "HuffPost",                weight: 800, size: 20 },
  { name: "Entrepreneur",            weight: 600, size: 22, serif: true, italic: true },
  { name: "The Next Web",            weight: 800, size: 18 },
  { name: "Search Engine Journal",   weight: 700, size: 15 },
  { name: "SEMrush",                 weight: 700, size: 20, italic: true },
  { name: "SERPed",                  weight: 800, size: 18 },
  { name: "Business.com",            weight: 700, size: 18 },
  { name: "The World Bank",          weight: 500, size: 14, serif: true, ls: "0.06em" },
  { name: "Virgin",                  weight: 800, size: 22, italic: true },
];

export const Press = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 8, paddingBottom: 36 }}>
    <DoubleRule />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "22px 0",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Pill size={11} ls="0.22em">Bylines &amp; Citations →</Pill>
      </div>
      <div className="press-logos">
        {MARKS.map((l) => (
          <div
            key={l.name}
            style={{
              fontFamily: l.serif ? SERIF : GROT,
              fontWeight: l.weight,
              fontSize: l.size,
              fontStyle: l.italic ? "italic" : "normal",
              letterSpacing: l.ls || "-0.005em",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {l.name}
          </div>
        ))}
      </div>
    </div>
    <HRule />
  </section>
);

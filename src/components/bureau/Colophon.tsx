import { INK, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { DoubleRule, Pill, SCaps, SiaLogo } from "./primitives";

type LinkList = readonly [head: string, items: readonly string[]];

const LISTS: ReadonlyArray<LinkList> = [
  ["Departments", ["Digital PR", "EMOS", "Fractional CMO", "Speaking", "Podcast"]],
  ["The Paper",   ["Home", "About", "Letters", "The Wire", "Subscriptions"]],
  ["Elsewhere",   ["Twitter / X", "LinkedIn", "YouTube", "Apple Podcasts", "Spotify"]],
];

export const Colophon = () => (
  <footer style={{ background: PAPER, padding: "60px 56px 36px" }}>
    <DoubleRule style={{ marginBottom: 36 }} />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
        gap: 40,
        paddingBottom: 36,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: INK, padding: "8px 14px" }}>
            <SiaLogo height={26} />
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 42,
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            The <span style={{ fontStyle: "italic" }}>Bureau</span>
          </div>
        </div>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontFamily: SERIF,
            fontSize: 15.5,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 360,
            fontStyle: "italic",
          }}
        >
          Syed Irfan Ajmal: marketing consultant, author, speaker, and CEO of
          DMR.agency. Masters from Mälardalen University, Sweden (2007); work
          at Marcus Evans (Sweden) and InfoShare (Denmark); co-founder of Silk
          Route Interactive, a spatial intelligence company. Published from
          Peshawar since 2010. As reported in Forbes, HBR, HuffPost, TNW and
          others.
        </p>
      </div>

      {LISTS.map(([head, items]) => (
        <div key={head}>
          <Pill size={11} ls="0.22em">{head}</Pill>
          <ul
            style={{
              listStyle: "none",
              margin: "14px 0 0",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {items.map((i) => (
              <li key={i}>
                <a
                  href="#"
                  style={{
                    fontFamily: SERIF,
                    fontSize: 16,
                    color: INK,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {i}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <DoubleRule />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 18,
        flexWrap: "wrap",
        gap: 24,
      }}
    >
      <SCaps size={10.5} ls="0.16em" color={INK70}>
        © MMXXVI · Syed Irfan Ajmal · SIA Enterprises Inc · Wyoming C-Corp
      </SCaps>
      <SCaps size={10.5} ls="0.16em" color={INK70}>
        sia[@]syedirfanajmal[dot]com &nbsp;·&nbsp;
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: 999,
            background: YEL,
            marginRight: 6,
            verticalAlign: "middle",
            border: `1px solid ${INK}`,
          }}
        />
        Open for projects
      </SCaps>
    </div>
  </footer>
);

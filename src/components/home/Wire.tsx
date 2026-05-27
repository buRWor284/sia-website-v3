import { INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";
import { Pill, SCaps, SectionMast } from "@/components/bureau/primitives";

type Card = {
  title: string;
  n: string;
  sub: string;
  foot: string;
  href: string;
};

const CARDS: ReadonlyArray<Card> = [
  { title: "Podcast",      n: "29",  sub: "episodes · 3 seasons", foot: "The SIA Business Podcast",                          href: "/podcast" },
  { title: "Articles",     n: "40",  sub: "long-form essays",     foot: "Personal Branding · Neuromarketing · Storytelling", href: "/writing" },
  { title: "Press",        n: "13",  sub: "outlets",              foot: "Forbes · HBR · HuffPost · TNW · WB",                href: "/about" },
  { title: "Infographics", n: "05",  sub: "visuals",              foot: "Writing Benefits · HubStaff · Bing SEO",            href: "/writing/scientific-benefits" },
  { title: "Videos",       n: "9+",  sub: "on YouTube",           foot: "Talks · workshops · interviews",                    href: "/gallery" },
];

export const Wire = () => (
  <section style={{ background: PAPER, padding: "90px 56px" }}>
    <SectionMast n="05" label="The Wire · Latest dispatches" />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 60,
        marginBottom: 48,
        alignItems: "baseline",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 72,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Latest content,
        <br />
        <span style={{ fontStyle: "italic" }}>filed continuously.</span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Podcasts, essays, infographics, talks. What the bureau has shipped
        over the last twenty-two years, with the latest at the top.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        border: `1px solid ${INK}`,
      }}
    >
      {CARDS.map((c, i) => (
        <a
          key={c.title}
          href={c.href}
          style={{
            padding: "24px 22px 22px",
            borderRight: i < 4 ? `1px solid ${INK}` : "none",
            background: PAPER,
            textDecoration: "none",
            color: INK,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 280,
            position: "relative",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">
              Desk Nº {String(i + 1).padStart(2, "0")}
            </Pill>
            <div
              style={{
                marginTop: 14,
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 88,
                color: INK,
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
              }}
            >
              {c.n}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 24,
                color: INK,
                letterSpacing: "-0.01em",
              }}
            >
              {c.title}
            </div>
            <div style={{ marginTop: 4 }}>
              <SCaps size={10.5} ls="0.12em" color={INK55}>{c.sub}</SCaps>
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13.5,
                color: INK70,
                lineHeight: 1.4,
              }}
            >
              {c.foot}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 22,
              fontFamily: SERIF,
              fontSize: 18,
              color: INK,
            }}
          >
            →
          </div>
        </a>
      ))}
    </div>
  </section>
);

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
  { title: "Podcast",      n: "39",  sub: "episodes · 3 seasons", foot: "The SIA Business Podcast",                          href: "/podcast" },
  { title: "Articles",     n: "40",  sub: "long-form essays",     foot: "Personal Branding · Neuromarketing · Storytelling", href: "/resources" },
  { title: "Press",        n: "13",  sub: "outlets",              foot: "Forbes · HBR · HuffPost · TNW · WB",                href: "/about" },
  { title: "Infographics", n: "04",  sub: "visuals",              foot: "Writing Benefits · HubStaff · Writing Habits",      href: "/infographics" },
  { title: "Videos",       n: "64+", sub: "on YouTube",           foot: "Talks · workshops · interviews",                    href: "/gallery" },
];

export const Wire = () => (
  <section id="wire" className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="05" label="The Wire · Latest dispatches" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
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
        }}
      >
        Podcasts, essays, infographics, talks. What the bureau has shipped
        over the last twenty-two years, with the latest at the top.
      </p>
    </div>

    <div
      className="grid-wire"
      style={{ border: `1px solid ${INK}` }}
    >
      {CARDS.map((c, i) => (
        <a
          key={c.title}
          href={c.href}
          className="wire-card"
          style={{
            padding: "22px 18px 20px",
            background: PAPER,
            textDecoration: "none",
            color: INK,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 220,
            position: "relative",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">
              Desk Nº {String(i + 1).padStart(2, "0")}
            </Pill>
            <div className="wire-number" style={{ marginTop: 12, color: INK }}>
              {c.n}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: "clamp(18px, 2.5vw, 24px)",
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
                marginTop: 8,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13,
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
              top: 20,
              right: 18,
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

import { GROT, INK, INK35, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";
import { DoubleRule, HRule, Pill, SCaps } from "@/components/bureau/primitives";

type ReadingCard = {
  tag: string;
  title: string;
  blurb: string;
  href: string;
  cta?: string;
};

const CARDS: ReadonlyArray<ReadingCard> = [
  {
    tag: "Guide",
    title: "Personal Branding 101: How to Brand Yourself for Success",
    blurb:
      "How to build a personal brand that opens doors — covering positioning, " +
      "storytelling, visibility, and why most people get it backwards.",
    href: "/writing/personal-branding",
    cta: "Read the guide →",
  },
  {
    tag: "Mega-guide",
    title: "Storytelling 101: Elevate Your Brand",
    blurb:
      "The most effective storytelling tactics in one place — with case studies " +
      "from Nike, Google, and Airbnb. How narrative turns browsers into believers.",
    href: "/writing/storytelling",
    cta: "Read the guide →",
  },
  {
    tag: "Infographic",
    title: "Top 11 Scientific Benefits of Writing",
    blurb:
      "Reduced anxiety, stronger memory, sharper thinking — the research-backed " +
      "case for writing as a daily practice. An interactive infographic.",
    href: "/infographics/writing-benefits",
    cta: "View the infographic →",
  },
];

const ReadingCard = ({ card }: { card: ReadingCard }) => (
  <article
    style={{
      border: `1px solid ${INK}`,
      display: "flex",
      flexDirection: "column",
      background: PAPER,
    }}
  >
    {/* Tag bar */}
    <div
      style={{
        padding: "10px 20px",
        borderBottom: `1px solid ${INK35}`,
        background: PAPER2,
      }}
    >
      <span
        style={{
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color: INK,
        }}
      >
        {card.tag}
      </span>
    </div>

    {/* Body */}
    <div
      style={{
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {card.title}
      </h3>
      <p
        style={{
          marginTop: 10,
          marginBottom: 0,
          fontFamily: SERIF,
          fontSize: 15,
          fontStyle: "italic",
          color: INK55,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {card.blurb}
      </p>
      <div style={{ marginTop: 18, borderTop: `1px solid ${INK35}`, paddingTop: 14 }}>
        <a
          href={card.href}
          {...(card.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: INK,
            textDecoration: "none",
          }}
        >
          {card.cta ?? "Read →"}
        </a>
      </div>
    </div>
  </article>
);

export const ReadingRoom = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 24, paddingBottom: 48 }}>
    <DoubleRule />
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "18px 0 20px",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Pill size={11} ls="0.22em">Reading Room →</Pill>
        <SCaps size={11} ls="0.22em" color={INK70}>
          Guides · Infographics · Resources
        </SCaps>
      </div>
      <a
        href="/blog"
        style={{
          fontFamily: GROT,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: INK,
          textDecoration: "none",
          borderBottom: `1px solid ${INK}`,
          paddingBottom: 2,
          whiteSpace: "nowrap",
        }}
      >
        Full archive →
      </a>
    </div>

    <div className="grid-reading-room">
      {CARDS.map((card) => (
        <ReadingCard key={card.href} card={card} />
      ))}
    </div>
    <HRule style={{ marginTop: 32 }} />
  </section>
);

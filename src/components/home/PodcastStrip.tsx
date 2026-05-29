import { GROT, INK, INK35, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { DoubleRule, HRule, Pill, SCaps } from "@/components/bureau/primitives";

type PodcastEp = {
  code: string;
  title: string;
  slug: string;
  guest?: string;
  blurb: string;
  /** Accent colour for the artwork block */
  accent?: string;
};

const FEATURED_EPISODES: ReadonlyArray<PodcastEp> = [
  {
    code: "S02E09",
    title: "Finding Your Unfair Advantage",
    slug: "ash-ali-hasan-kubba",
    guest: "Ash Ali & Hasan Kubba",
    blurb:
      "The authors of the 150k-copy bestseller break down what an unfair " +
      "advantage really is — and how anyone can find and use theirs.",
    accent: YEL,
  },
  {
    code: "S02E05",
    title: "Digital PR vs SEO: Key Similarities & Differences",
    slug: "digital-pr-vs-seo-key-s02e05",
    blurb:
      "Why treating PR and SEO as separate disciplines is costing you reach — " +
      "and the framework for running them as one compounding machine.",
  },
  {
    code: "S03E09",
    title: "HARO Outreach, SEO Agency Business & Backlinks",
    slug: "greg-heilers-interview",
    guest: "Greg Heilers",
    blurb:
      "One of the top HARO practitioners breaks down what makes a pitch " +
      "land in 2024, how to run an SEO agency, and how to build real links at scale.",
  },
];

const EpisodeCard = ({ ep }: { ep: PodcastEp }) => (
  <article
    style={{
      border: `1px solid ${INK}`,
      display: "flex",
      flexDirection: "column",
      background: PAPER,
    }}
  >
    {/* Artwork block — typographic, editorial */}
    <div
      style={{
        background: INK,
        padding: "28px 24px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        minHeight: 140,
      }}
    >
      {/* Episode code badge */}
      <div style={{ alignSelf: "flex-start" }}>
        <span
          style={{
            background: ep.accent ?? "rgba(241,235,222,.15)",
            padding: "4px 10px",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: ep.accent ? INK : YEL,
          }}
        >
          {ep.code}
        </span>
      </div>
      {/* Title in artwork */}
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: "clamp(17px, 2.5vw, 21px)",
          color: "rgba(241,235,222,0.92)",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
        }}
      >
        {ep.title}
      </div>
      {ep.guest && (
        <div>
          <SCaps size={9.5} ls="0.16em" color="rgba(241,235,222,.5)">
            w/ {ep.guest}
          </SCaps>
        </div>
      )}
      {/* Decorative rule */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: ep.accent ?? `rgba(241,235,222,.12)`,
        }}
      />
    </div>

    {/* Body */}
    <div
      style={{
        padding: "16px 20px 20px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 15,
          fontStyle: "italic",
          color: INK55,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {ep.blurb}
      </p>
      <div style={{ marginTop: 16, borderTop: `1px solid ${INK35}`, paddingTop: 14 }}>
        <a
          href={`https://syedirfanajmal.com/podcast/${ep.slug}`}
          target="_blank"
          rel="noopener noreferrer"
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
          Listen →
        </a>
      </div>
    </div>
  </article>
);

export const PodcastStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 24, paddingBottom: 40 }}>
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
        <Pill size={11} ls="0.22em">From the Podcast →</Pill>
        <SCaps size={11} ls="0.22em" color={INK70}>
          The SIA Wire · Selected episodes
        </SCaps>
      </div>
      <a
        href="https://syedirfanajmal.com/podcast/"
        target="_blank"
        rel="noopener noreferrer"
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
        All episodes →
      </a>
    </div>

    <div className="grid-podcast-cards">
      {FEATURED_EPISODES.map((ep) => (
        <EpisodeCard key={ep.slug} ep={ep} />
      ))}
    </div>
    <HRule style={{ marginTop: 32 }} />
  </section>
);

import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";
import { DoubleRule, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";

type PodcastEp = { code: string; title: string; slug: string; guest?: string };

const FEATURED_EPISODES: ReadonlyArray<PodcastEp> = [
  {
    code: "S02E09",
    title: "Finding Your Unfair Advantage",
    slug: "ash-ali-hasan-kubba",
    guest: "Ash Ali & Hasan Kubba",
  },
  {
    code: "S02E05",
    title: "Digital PR vs SEO: Key Similarities & Differences",
    slug: "digital-pr-vs-seo-key-s02e05",
  },
  {
    code: "S03E09",
    title: "HARO Outreach, SEO Agency Business & Backlinks",
    slug: "greg-heilers-interview",
    guest: "Greg Heilers",
  },
];

export const PodcastStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 24, paddingBottom: 40 }}>
    <DoubleRule />
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "18px 0 12px",
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
        href="/podcast"
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

    <div style={{ border: `1px solid ${INK}` }}>
      {FEATURED_EPISODES.map((ep, idx) => (
        <a
          key={ep.slug}
          href={`/podcast/${ep.slug}`}
          style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr auto",
            alignItems: "center",
            gap: "0 24px",
            padding: "18px 20px",
            borderBottom: idx < FEATURED_EPISODES.length - 1 ? `1px solid ${INK35}` : "none",
            textDecoration: "none",
            color: "inherit",
            background: "transparent",
            transition: "background 0.15s",
          }}
        >
          <div
            style={{
              background: INK,
              padding: "6px 0",
              textAlign: "center",
            }}
          >
            <SCaps size={9.5} ls="0.14em" color={YEL}>{ep.code}</SCaps>
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                fontStyle: "italic",
                color: INK,
                lineHeight: 1.35,
              }}
            >
              {ep.title}
            </div>
            {ep.guest && (
              <div style={{ marginTop: 4 }}>
                <SCaps size={10} ls="0.14em" color={INK55}>w/ {ep.guest}</SCaps>
              </div>
            )}
          </div>
          <SCaps size={10.5} ls="0.14em" color={INK55} style={{ whiteSpace: "nowrap" }}>
            Listen →
          </SCaps>
        </a>
      ))}
    </div>
  </section>
);

import { notFound } from "next/navigation"
import { ScrollButtons } from "@/components/ScrollButtons";
import { Colophon } from "@/components/bureau"
import {
  DoubleRule,
  HRule,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives"
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
} from "@/lib/tokens"
import {
  generateEpisodeStaticParams,
  getAdjacentEpisodes,
  getEpisodeBySlug,
} from "@/lib/podcast"

export async function generateStaticParams() {
  return generateEpisodeStaticParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ep = getEpisodeBySlug(slug)
  if (!ep) return {}
  return {
    title: `${ep.title} | The SIA Business Podcast`,
    description: ep.summary,
    openGraph: {
      title: ep.hero_text_extracted || ep.title,
      description: ep.summary,
      images: ep.featured_image_url ? [{ url: ep.featured_image_url }] : [],
    },
  }
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ep = getEpisodeBySlug(slug)
  if (!ep) notFound()

  const { prev, next } = getAdjacentEpisodes(slug)
  const heroText = ep.hero_text_extracted || ep.title

  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          background: ep.featured_image_url ? INK : PAPER2,
          color: ep.featured_image_url ? PAPER : INK,
          padding: "80px 56px 72px",
          position: "relative",
          overflow: "hidden",
          ...(ep.featured_image_url
            ? {
                backgroundImage: `linear-gradient(rgba(20,16,12,.82), rgba(20,16,12,.82)), url(${ep.featured_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <SCaps
            size={11}
            ls="0.20em"
            color={ep.featured_image_url ? YEL : YEL}
          >
            {ep.episode_code}
          </SCaps>
          <SCaps
            size={10.5}
            ls="0.16em"
            color={
              ep.featured_image_url
                ? "rgba(241,235,222,.6)"
                : INK55
            }
          >
            Season {ep.season} · {ep.season_year}
          </SCaps>
          <SCaps
            size={10.5}
            ls="0.14em"
            color={
              ep.featured_image_url
                ? "rgba(241,235,222,.5)"
                : INK35
            }
          >
            {new Date(ep.publication_date).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })}
          </SCaps>
        </div>

        <h1
          style={{
            margin: "0 0 24px",
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            maxWidth: 900,
            color: ep.featured_image_url ? PAPER : INK,
          }}
        >
          {heroText}
        </h1>

        {ep.hero_text_extracted && ep.hero_text_extracted !== ep.title && (
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 20,
              lineHeight: 1.45,
              fontStyle: "italic",
              color: ep.featured_image_url
                ? "rgba(241,235,222,.75)"
                : INK70,
              maxWidth: 700,
            }}
          >
            {ep.title}
          </p>
        )}

        {ep.guest && (
          <div style={{ marginTop: 16 }}>
            <SCaps
              size={11}
              ls="0.18em"
              color={ep.featured_image_url ? "rgba(241,235,222,.7)" : INK55}
            >
              Guest · {ep.guest}
              {ep.guest_role ? ` — ${ep.guest_role}` : ""}
            </SCaps>
          </div>
        )}

        {ep.is_featured && (
          <div
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "6px 14px",
              background: YEL,
              color: INK,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Most-played episode
          </div>
        )}
      </section>

      {/* ── Listen / Watch ───────────────────────────────────── */}
      <section style={{ padding: "72px 56px 60px" }}>
        <SectionMast n="01" label="Listen · Watch · Subscribe" />

        {/* YouTube embed */}
        {ep.embeds.youtube_id && (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              marginBottom: 40,
              border: `1px solid ${INK15}`,
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${ep.embeds.youtube_id}`}
              title={ep.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        )}

        {/* Anchor.fm embed */}
        {ep.embeds.anchor_embed_url && (
          <div style={{ marginBottom: 40 }}>
            <iframe
              src={ep.embeds.anchor_embed_url}
              height="102"
              width="100%"
              style={{ border: 0 }}
              title={`${ep.title} — audio player`}
            />
          </div>
        )}

        {/* Platform links */}
        {(ep.embeds.spotify_url || ep.embeds.apple_podcasts_url) && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {ep.embeds.spotify_url && (
              <a
                href={ep.embeds.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 20px",
                  background: INK,
                  color: PAPER,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Listen on Spotify →
              </a>
            )}
            {ep.embeds.apple_podcasts_url && (
              <a
                href={ep.embeds.apple_podcasts_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 20px",
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Listen on Apple Podcasts →
              </a>
            )}
          </div>
        )}
      </section>

      <HRule />

      {/* ── Episode summary ──────────────────────────────────── */}
      <section style={{ padding: "72px 56px 60px" }}>
        <SectionMast n="02" label="About this episode" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.65,
              color: INK,
              maxWidth: 700,
            }}
          >
            {ep.summary}
          </p>
          <aside
            style={{
              background: PAPER2,
              border: `1px solid ${INK15}`,
              padding: "24px 28px",
            }}
          >
            <Pill size={10.5} ls="0.18em">
              Episode details
            </Pill>
            <div style={{ marginTop: 18 }}>
              {(
                [
                  ["Code", ep.episode_code],
                  ["Season", `Season ${ep.season}`],
                  ["Year", ep.season_year],
                  ...(ep.guest ? [["Guest", ep.guest]] : []),
                  ...(ep.guest_role ? [["Role", ep.guest_role]] : []),
                  ["Type", ep.is_solo ? "Solo" : "Guest interview"],
                ] as [string, string][]
              ).map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: `1px solid ${INK15}`,
                      alignItems: "baseline",
                    }}
                  >
                    <SCaps size={10} ls="0.14em" color={INK55}>
                      {label}
                    </SCaps>
                    <div style={{ fontSize: 14.5, color: INK, lineHeight: 1.4 }}>
                      {value}
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ── Show notes ───────────────────────────────────────── */}
      {ep.show_notes_text && (
        <>
          <HRule />
          <section style={{ padding: "72px 56px 60px" }}>
            <SectionMast n="03" label="Show notes" />
            <article
              style={{
                maxWidth: 720,
                fontSize: 17,
                lineHeight: 1.7,
                color: INK,
                whiteSpace: "pre-line",
              }}
            >
              {ep.show_notes_text}
            </article>
          </section>
        </>
      )}

      {/* ── Transcript (collapsible) ─────────────────────────── */}
      {ep.transcript_text && (
        <>
          <HRule />
          <section style={{ padding: "72px 56px 60px" }}>
            <SectionMast
              n={ep.show_notes_text ? "04" : "03"}
              label="Full transcript"
            />
            <details
              style={{ maxWidth: 720 }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 20px",
                  background: PAPER2,
                  border: `1px solid ${INK15}`,
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: INK,
                  userSelect: "none",
                }}
              >
                Read Full Transcript ▼
              </summary>
              <div
                style={{
                  marginTop: 8,
                  padding: "28px 24px",
                  border: `1px solid ${INK15}`,
                  maxHeight: 600,
                  overflowY: "auto",
                  fontSize: 15.5,
                  lineHeight: 1.7,
                  color: INK70,
                  whiteSpace: "pre-line",
                }}
              >
                {ep.transcript_text}
              </div>
            </details>
          </section>
        </>
      )}

      <HRule />

      {/* ── Prev / Next navigation ───────────────────────────── */}
      <section style={{ padding: "56px 56px", background: PAPER2 }}>
        <DoubleRule style={{ marginBottom: 32 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          {prev ? (
            <a
              href={`/podcast/${prev.slug}`}
              style={{
                display: "block",
                padding: "24px 28px",
                border: `1px solid ${INK15}`,
                background: PAPER,
                textDecoration: "none",
                color: INK,
              }}
            >
              <SCaps size={10} ls="0.16em" color={INK35}>
                ← Previous episode
              </SCaps>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: INK,
                }}
              >
                {prev.title}
              </div>
              <SCaps size={10} ls="0.14em" color={INK55} style={{ marginTop: 6 }}>
                {prev.episode_code}
              </SCaps>
            </a>
          ) : (
            <div />
          )}

          {next ? (
            <a
              href={`/podcast/${next.slug}`}
              style={{
                display: "block",
                padding: "24px 28px",
                border: `1px solid ${INK15}`,
                background: PAPER,
                textDecoration: "none",
                color: INK,
                textAlign: "right",
              }}
            >
              <SCaps size={10} ls="0.16em" color={INK35}>
                Next episode →
              </SCaps>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: INK,
                }}
              >
                {next.title}
              </div>
              <SCaps size={10} ls="0.14em" color={INK55} style={{ marginTop: 6 }}>
                {next.episode_code}
              </SCaps>
            </a>
          ) : (
            <div />
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a
            href="/podcast"
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: INK,
              textDecoration: "none",
            }}
          >
            ← Back to all episodes
          </a>
        </div>
      </section>

      <Colophon />
      <ScrollButtons />
    </div>
  )
}

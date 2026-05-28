import fs from "fs"
import path from "path"

export type PodcastEmbed = {
  youtube_id: string | null
  anchor_embed_url: string | null
  spotify_url: string | null
  apple_podcasts_url: string | null
}

export type Episode = {
  episode_number: number
  episode_code: string
  season: number
  season_year: string
  title: string
  slug: string
  publication_date: string
  guest: string | null
  guest_role: string | null
  is_solo: boolean
  is_featured: boolean
  summary: string
  show_notes_text: string
  transcript_text: string
  full_content_text: string
  featured_image_url: string | null
  hero_text_extracted: string | null
  embeds: PodcastEmbed
  source_url: string
}

export type EpisodeIndexItem = Pick<
  Episode,
  | "episode_number"
  | "episode_code"
  | "season"
  | "season_year"
  | "title"
  | "slug"
  | "publication_date"
  | "guest"
  | "is_solo"
  | "is_featured"
  | "summary"
  | "featured_image_url"
  | "hero_text_extracted"
  | "embeds"
>

const dataDir = path.join(process.cwd(), "src/data/podcast")

export function getAllEpisodes(): Episode[] {
  const raw = fs.readFileSync(path.join(dataDir, "episodes_full.json"), "utf-8")
  return JSON.parse(raw) as Episode[]
}

export function getEpisodeIndex(): EpisodeIndexItem[] {
  const raw = fs.readFileSync(path.join(dataDir, "index.json"), "utf-8")
  return JSON.parse(raw) as EpisodeIndexItem[]
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return getAllEpisodes().find((ep) => ep.slug === slug)
}

export function generateEpisodeStaticParams() {
  return getAllEpisodes().map((ep) => ({ slug: ep.slug }))
}

export function getAdjacentEpisodes(slug: string): {
  prev: EpisodeIndexItem | null
  next: EpisodeIndexItem | null
} {
  const index = getEpisodeIndex()
  const i = index.findIndex((ep) => ep.slug === slug)
  return {
    prev: i > 0 ? index[i - 1] : null,
    next: i < index.length - 1 ? index[i + 1] : null,
  }
}

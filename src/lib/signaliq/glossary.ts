/**
 * SignalIQ plain-English definitions (16 Sep 2026, Irfan asked for "road" style
 * explanations). ONE source for the (i) tooltips on the cards and score breakdown
 * AND the rows on /tools/signaliq/about, so the two can never drift apart.
 * Keep each entry short, concrete and free of internal jargon.
 */
export type GlossaryKey =
  | "volume"
  | "velocity"
  | "coverageGap"
  | "startupFit"
  | "beatFit"
  | "corroboration"
  | "credibility";

export const GLOSSARY: Record<GlossaryKey, { label: string; plain: string }> = {
  volume: {
    label: "Volume",
    plain:
      "How much is happening right now: SEC filings, research papers, Wikipedia views. Think of how many cars are on a road. Marked down when the topic is below its own usual level, so a big but shrinking topic never scores like a surge. (SEC and arXiv are compared with their own past; Wikipedia already is; Hacker News has no usual level to compare with.)",
  },
  velocity: {
    label: "Velocity",
    plain:
      "Whether that activity is growing compared with its own past. Think of whether traffic is heavier than usual today. A busy road that is quieter than normal has high volume and low velocity.",
  },
  coverageGap: {
    label: "Coverage gap",
    plain:
      "How much the press has already written about it, counted from news articles worldwide. This is about journalists, not about the activity itself. Wide: few articles yet, room for you. Medium: some. Narrow: reporters are already on it. Cooling: press coverage is falling and nothing is rising, so the moment has likely passed.",
  },
  startupFit: {
    label: "Startup fit",
    plain:
      "How closely the topic matches what your company does. High: a journalist would see you as an obvious person to quote. Medium: related. Low: a stretch, so the score is capped at 59.",
  },
  beatFit: {
    label: "Beat fit",
    plain: "How well the topic matches the beat (the news area) you picked.",
  },
  corroboration: {
    label: "Corroboration",
    plain: "How many separate sources show the same thing. One source is a hint; three is a story.",
  },
  credibility: {
    label: "Source credibility",
    plain: "How trustworthy the strongest source is. An SEC filing counts for more than a forum thread.",
  },
};

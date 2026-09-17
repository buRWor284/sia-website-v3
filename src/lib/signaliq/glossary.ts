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

/**
 * Three groups, so a reader can tell WHO each measure is about (Irfan, 16 Sep 2026:
 * "make a distinction between actions of companies vs journalists").
 */
export type GlossaryGroup = "activity" | "press" | "you";
export const GLOSSARY_GROUPS: Record<GlossaryGroup, { label: string; plain: string }> = {
  activity: { label: "What is happening", plain: "Companies filing, researchers publishing, people reading" },
  press: { label: "What journalists have written", plain: "News articles already out there" },
  you: { label: "How it fits you", plain: "Your company, your beat, how solid the evidence is" },
};

export const GLOSSARY: Record<GlossaryKey, { label: string; plain: string; group: GlossaryGroup }> = {
  volume: {
    group: "activity",
    label: "Volume",
    plain:
      "About companies, researchers and readers, not journalists. How much is happening right now: SEC filings, research papers, Wikipedia views. Think of how many cars are on a road. Marked down when the topic is below its own usual level, so a big but shrinking topic never scores like a surge. (SEC and arXiv are compared with their own past; Wikipedia already is; Hacker News has no usual level to compare with.)",
  },
  velocity: {
    group: "activity",
    label: "Velocity",
    plain:
      "About companies, researchers and readers, not journalists. Whether that activity is growing compared with its own past. Think of whether traffic is heavier than usual today. A busy road that is quieter than normal has high volume and low velocity.",
  },
  coverageGap: {
    group: "press",
    label: "Coverage gap",
    plain:
      "About journalists, not companies. How much the press has already written about it, counted from news articles worldwide. Wide: few articles yet, room for you. Medium: some. Narrow: reporters are already on it. Cooling: press coverage is falling and nothing is rising, so the moment has likely passed.",
  },
  startupFit: {
    group: "you",
    label: "Startup fit",
    plain:
      "How closely the topic matches what your company does. High: a journalist would see you as an obvious person to quote. Medium: related. Low: a stretch, so the score is capped at 59.",
  },
  beatFit: {
    group: "you",
    label: "Beat fit",
    plain: "How well the topic matches the beat (the news area) you picked.",
  },
  corroboration: {
    group: "you",
    label: "Corroboration",
    plain: "How many separate sources show the same thing. One source is a hint; three is a story.",
  },
  credibility: {
    group: "you",
    label: "Source credibility",
    plain: "How trustworthy the strongest source is. An SEC filing counts for more than a forum thread.",
  },
};

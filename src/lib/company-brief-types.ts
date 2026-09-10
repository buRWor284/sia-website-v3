/**
 * Company Brief: shared constants and types (client-safe, no server imports).
 *
 * One Markdown document per company that tells every EMOS tool what only the
 * company knows: goals, challenges, customer truth, proof points, assets it
 * already has, what counts as a good or bad result, and what is off limits.
 * Filled by "Research this company" (reads the website), by an uploaded .md,
 * or by hand. Tools use it only once the user approves it.
 *
 * Spec: EMOS-Client-File-Spec-2026-09-10.md (v1 = one document, not items).
 */

/** Hard cap on a saved brief (matches the DB check constraint). */
export const BRIEF_MAX = 12000;

/** What the tools receive. A brief longer than this is cut at a heading so
 * one runaway paste cannot multiply the cost of every later call. */
export const BRIEF_PROMPT_MAX = 8000;

/** Largest upload / paste accepted for the AI condense step. */
export const BRIEF_UPLOAD_MAX = 100_000;

export type BriefStatus = "draft" | "approved";
export type BriefSource = "research" | "upload" | "manual";

export interface CompanyBrief {
  company_id: string;
  content: string;
  status: BriefStatus;
  source: BriefSource;
  sources: string[];
  researched_at: string | null;
  updated_at: string;
}

/** The fixed headings. Research, condense and the blank template all use
 * them, so every tool knows where to look. */
export const BRIEF_SECTIONS = [
  "Snapshot",
  "Goals",
  "Challenges",
  "Customer truth",
  "Proof points and numbers",
  "Founder and spokesperson stories",
  "Assets they already have",
  "Past press and podcasts",
  "Voice and style",
  "Off limits and policies",
  "What counts as a good or bad result",
  "Competitors",
  "Gaps and open questions",
] as const;

export const BRIEF_SECTION_HINTS: Record<(typeof BRIEF_SECTIONS)[number], string> = {
  "Snapshot": "What the company does, for whom, where, since when, pricing.",
  "Goals": "What they want from press: sales, trust, hiring, investors, search visibility.",
  "Challenges": "What is hard for them right now.",
  "Customer truth": "What customers actually say and experience, in their words. Note for each whether it can be used publicly, anonymised only, or internal only.",
  "Proof points and numbers": "One per line: the claim, the source, and whether it is self-reported or independently verified.",
  "Founder and spokesperson stories": "True stories only the people involved can tell.",
  "Assets they already have": "Reports, stats pages, rankings, calculators, guides: type, title, URL, date. Tools will not suggest these again.",
  "Past press and podcasts": "Outlet, date, angle. Journalists they know, and any not to contact.",
  "Voice and style": "Tone, words to use and avoid, spelling, who signs pitches.",
  "Off limits and policies": "Topics, partners or competitors not to criticise, legal or regulatory limits.",
  "What counts as a good or bad result": "Which outlets, topics and links count as a win, and which do not.",
  "Competitors": "Who they are and what they publish.",
  "Gaps and open questions": "What is still unknown.",
};

/** Blank brief for "write it myself". */
export function blankBrief(companyName: string): string {
  return [
    `# Company Brief: ${companyName || "Company"}`,
    "",
    ...BRIEF_SECTIONS.flatMap(s => [`## ${s}`, `- ${BRIEF_SECTION_HINTS[s]}`, ""]),
  ].join("\n").trim() + "\n";
}

/** Paste-ready prompt a client can give their own AI to write the brief. */
export function selfServePrompt(companyName: string): string {
  return `You know ${companyName || "my company"} well. Write a Markdown document for a PR tool. Use exactly these headings, in this order: ${BRIEF_SECTIONS.map(s => `"${s}"`).join(", ")}. Under each heading, one fact per line. After each fact, give its source in brackets (a URL, a document name, or "from memory"). For customer quotes, say whether we may use them publicly, anonymised only, or internal only. Never guess: if you don't know, write "unknown". Leave out passwords, customers' personal data and anything under NDA.`;
}

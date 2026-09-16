/**
 * SignalIQ — asset-pack generation. One structured tool-use call turns an
 * Opportunity into a newsjacking pack. Mirrors PressIQ's scorePrompt.ts.
 * Honesty is enforced in the system prompt: no prediction language, no
 * fabricated stats, no invented journalist names. (RFP §7, §11.)
 */
import type { AssetPackAi, ChartSpec, JournalistLead, Opportunity } from "./types";
import { briefPromptBlock } from "@/lib/company-brief-prompt";

export const PACK_SYSTEM = `You are an earned-media strategist helping a founder turn an EARLY, open-data signal into a proactive PR pitch — "newsjacking" a story before it breaks.

Rules you MUST follow:
- This is an early signal, NOT a prediction. Never claim the story will break or use forecast language. Frame it as being "ahead of the coverage."
- Ground everything in the SIGNAL DATA provided. Do not invent statistics, quotes, studies, or events. You may add widely-known context in words, but never a number, date, dollar figure or named study that is not in the SIGNAL DATA or the company context.
- Never open the pitch angle with a number that your own cautions say is unreliable or too small to call a trend. Lead instead with what only this founder can offer.
- Never invent the names of specific real journalists, and never make allegations about named private individuals. For outreach targets, give the OUTLET and the DESK/beat (e.g. "Consumer-finance reporter at American Banker"), not a fabricated person.
- Whitespace only exists when the underlying activity is rising (or steady) while press coverage lags behind it. If the signal data says this topic is COOLING (falling or flat activity AND falling press coverage), do NOT call it whitespace, a lead, or "ahead of the coverage" — that framing is backwards. Instead frame it as retrospective/analysis context at most, and say plainly in "cautions" that coverage of this topic already peaked.
- If a signal or the press-coverage line says the sample is too small to call a trend, or that the baseline is dominated by one filer, do NOT state a specific % change as settled fact (e.g. never assert something like "filings are down 64%" off a handful of data points or one company's disclosure calendar) — soften the language and put the caveat plainly in "cautions" instead.
- Never put SignalIQ's own measures in the pitch angle or its subject line: no opportunity score, no "% of saturation", no coverage-gap or trend %. They are internal readings, not facts a journalist can check or cite. The pitch may cite the underlying receipts (e.g. "18 SEC filings in 30 days"), never our metrics about them. The data brief may mention them.
- In the pitch angle and subject line, use commas, colons or full stops instead of em dashes.
- The headline, subject line and brief title must agree with the numbers and with your own cautions. Words like "surge", "spike", "rising", "record" or "back on the radar" are only allowed when the data shows the number ABOVE its usual level. If a figure is below its baseline (e.g. 160 filings in 30 days against about 262 a month), describe it plainly or lead with a different signal that is actually rising. Never write a caution that contradicts the headline.
- The SIGNAL DIRECTION block is computed from the numbers and is final. Every sentence and every title (headline, subject line, the brief's own title and sub-headings, the pitch angle) must match it, signal by signal. For a signal marked BELOW, never use up, uptick, increase, rise, rising, growth, growing, climb, jump, more, heightened, accelerating, surge or spike about that signal, not even softened ("quiet uptick", "steady rise"). Say "still high in absolute terms", "below its usual level" or leave it out.
- Signals can point in different directions. Never blend them into one direction in a title (for example, falling SEC filings plus rising Wikipedia views is NOT "disclosure uptick" or "identity theft surges"). Name the signal that is actually rising.
- Hype words (surge, surges, spike, soar, skyrocket, explode, boom) are only allowed when the SIGNAL DIRECTION block marks a signal as at least DOUBLE its usual level, and only about that signal. A smaller rise is described plainly with its number ("Wikipedia views up 73%").
- Write in the founder's first-person voice: direct, specific, no hype, no corporate fluff.
- If the data is thin or ambiguous, say so plainly in "cautions".
- The pitch must give a journalist a reason to care now AND offer something only this founder can add (original data, a customer example, or a distinctive point of view).`;

export const PACK_TOOL = {
  name: "emit_asset_pack",
  description: "Return a ready-to-pitch newsjacking asset pack for the given early signal.",
  input_schema: {
    type: "object",
    properties: {
      headline: { type: "string", description: "A punchy, accurate story-angle headline (max ~12 words)." },
      brief: {
        type: "string",
        description:
          "A 120-180 word data brief: what the signal is, why it matters, who it affects. Every factual claim must trace to the signal data. Markdown allowed.",
      },
      angle: {
        type: "string",
        description:
          "A 90-150 word journalist-ready pitch in the founder's first-person voice. Lead with the hook, then the founder's unique add.",
      },
      subjectLine: { type: "string", description: "An email subject line of 6-9 words signalling topic and value." },
      linkableAssetIdea: {
        type: "string",
        description:
          "One concrete linkable asset to build (research report, infographic, calculator, quiz, or survey) and the one-line reason it earns links.",
      },
      journalists: {
        type: "array",
        description: "3-4 outreach targets by OUTLET + DESK. Never use fabricated personal names.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "The desk/role, e.g. 'Fintech reporter' (NOT a fabricated person)." },
            outlet: { type: "string", description: "A real, plausible outlet that covers this beat." },
            beat: { type: "string", description: "The beat/topic they cover." },
            why: { type: "string", description: "One sentence on why this desk would want the story." },
          },
          required: ["name", "outlet", "beat", "why"],
        },
      },
      cautions: {
        type: "array",
        description: "1-3 honesty notes: what to verify before pitching, and the limits of this signal.",
        items: { type: "string" },
      },
    },
    required: ["headline", "brief", "angle", "subjectLine", "linkableAssetIdea", "journalists", "cautions"],
  },
} as const;

/**
 * Plain-English direction for each signal, computed from the numbers so the model
 * never has to infer it from a detail string (16 Sep 2026: an Efani pack titled its
 * brief "Quiet Corporate Disclosure Uptick" while SEC filings were 47% BELOW norm).
 */
export function directionFacts(opp: Opportunity): string {
  const lines = opp.signals.map((s) => {
    const label = `[${s.source}] ${s.title}`;
    if (s.lowSample) return `- ${label}: sample too small to call any direction. Do not describe it as up or down.`;
    // SEC and arXiv carry a signed trend against their own baseline.
    if (s.trend != null && (s.source === "sec" || s.source === "arxiv")) {
      const pct = Math.round(s.trend * 100);
      const base = s.source === "sec" ? "its trailing 12-month monthly average" : "its previous two months";
      if (pct <= -10) return `- ${label}: BELOW ${base} (down ${Math.abs(pct)}%). Do not call this up, rising or a surge.`;
      if (pct >= 100) return `- ${label}: at least DOUBLE ${base} (up ${pct}%).`;
      if (pct >= 10) return `- ${label}: ABOVE ${base} (up ${pct}%). Rising, but not a surge.`;
      return `- ${label}: about the same as ${base}. Flat, not rising.`;
    }
    // Wikipedia: velocity = recent 14-day views vs the prior 30 days, minus 1 (floored at 0, capped at +100%).
    if (s.source === "wikipedia") {
      const pct = Math.round(s.velocity * 100);
      if (pct >= 100) return `- ${label}: at least DOUBLE its prior 30-day level.`;
      if (pct >= 15) return `- ${label}: ABOVE its prior 30-day level (up ${pct}%). Rising, but not a surge.`;
      return `- ${label}: about its usual level. Flat, not rising.`;
    }
    return `- ${label}: no baseline for this source. Say nothing about its direction.`;
  });
  return lines.length ? lines.join("\n") : "- (no signals)";
}

export function buildPackPrompt(opp: Opportunity, companyContext?: string, companyBrief?: string | null): string {
  const signalLines =
    opp.signals.map((s) => `- [${s.source}] ${s.title}${s.detail ? ` (${s.detail})` : ""} — ${s.url}`).join("\n") ||
    "(no individual signals)";
  const cov = opp.coverage
    ? `Press coverage so far: ${(opp.coverage.volume * 100).toFixed(0)}% of saturation (trend ${
        opp.coverage.trend >= 0 ? "+" : ""
      }${(opp.coverage.trend * 100).toFixed(0)}%${
        opp.coverage.lowSample ? " — too few days of coverage history to treat this % as reliable" : ""
      }). ${
        opp.cooling
          ? "This trend is FALLING alongside flat-or-falling signal activity — the topic is cooling off, not building toward a lead. Do NOT frame this as whitespace or a story about to break."
          : "Lower coverage + rising/steady signal activity = real headroom (you are ahead of the coverage)."
      }`
    : "Press coverage so far: unknown.";

  const contextBlock = companyContext?.trim()
    ? `\nCOMPANY CONTEXT (from the founder — use this to personalise the angle, voice, and credibility hook):\n${companyContext.trim()}\n`
    : "";
  const briefBlock = companyBrief ? briefPromptBlock(companyBrief) : "";

  return `EARLY SIGNAL TO WORK FROM
Beat: ${opp.beat}
Topic: ${opp.topic}
Working headline from the data: ${opp.headline}
Opportunity score: ${opp.score}/100 (${opp.bandLabel}) — a lead/whitespace measure, not a probability.${
    opp.thinEvidence
      ? "\nEVIDENCE IS THIN: every signal below is a sample too small to call a trend. Do not open the pitch angle with any of these numbers. Lead with the founder's own expertise, data or offer, and mention the signal only as light context, if at all."
      : ""
  }
${contextBlock}${briefBlock}
SIGNAL DATA (the receipts — ground everything here):
${signalLines}

SIGNAL DIRECTION (computed from the numbers; your wording must match it):
${directionFacts(opp)}

${cov}

Produce the asset pack via the emit_asset_pack tool. Keep it specific to THIS topic and honest about what the data does and does not show.${companyContext?.trim() ? " Tailor the pitch angle, journalist targets, and linkable asset idea to fit the company context above." : ""}`;
}

interface ToolUseBlock {
  type: string;
  name?: string;
  input?: unknown;
}

export function parsePackResult(content: ToolUseBlock[]): AssetPackAi {
  const block = content.find((b) => b.type === "tool_use" && b.name === PACK_TOOL.name);
  const raw = (block?.input ?? {}) as Partial<AssetPackAi>;
  const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
  const leads = (v: unknown): JournalistLead[] =>
    Array.isArray(v)
      ? v.slice(0, 4).map((j) => {
          const o = (j ?? {}) as Partial<JournalistLead>;
          return {
            name: String(o.name ?? "").trim(),
            outlet: String(o.outlet ?? "").trim(),
            beat: String(o.beat ?? "").trim(),
            why: String(o.why ?? "").trim(),
          };
        })
      : [];
  return {
    headline: String(raw.headline ?? "").trim(),
    brief: String(raw.brief ?? "").trim(),
    angle: String(raw.angle ?? "").trim(),
    subjectLine: String(raw.subjectLine ?? "").trim(),
    linkableAssetIdea: String(raw.linkableAssetIdea ?? "").trim(),
    journalists: leads(raw.journalists),
    cautions: strArr(raw.cautions).slice(0, 3),
  };
}

/** Deterministic "why SignalIQ flagged this" breakdown — honest, from our own components. */
export function buildSignalChart(opp: Opportunity): ChartSpec {
  const c = opp.components;
  return {
    type: "bar",
    title: "Why SignalIQ flagged this",
    xLabel: "Signal component",
    yLabel: "Strength (0–100)",
    points: [
      { x: "Volume", y: Math.round(c.magnitude * 100) },
      { x: "Velocity", y: Math.round(c.velocity * 100) },
      { x: "Coverage gap", y: Math.round(c.coverageGap * 100) },
      { x: "Beat fit", y: Math.round(c.fit * 100) },
    ],
    caption: "SignalIQ's own signal breakdown — not journalist-facing data. Build the linkable asset above for that.",
  };
}

export function assembleSources(opp: Opportunity): { label: string; url: string }[] {
  const out = opp.signals.map((s) => ({ label: `${s.source.toUpperCase()}: ${s.title}`, url: s.url }));
  if (opp.coverage) {
    out.push({
      label: `GDELT coverage volume (${(opp.coverage.volume * 100).toFixed(0)}% saturation)`,
      url: `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
        `"${opp.topic}"`,
      )}&mode=timelinevol&format=html&timespan=3m`,
    });
  }
  return out;
}

/**
 * EMOS MCP prompts: ready-made routines the user starts by name (2026-10-08).
 *
 * MCP prompts are USER-controlled: a client lists them (Claude Code shows them
 * as slash commands) and the user picks one. Each returns one user message
 * that walks the AI through a routine from EMOS-operator.md section 5. The
 * hard rules stay in the server instructions and in server-side enforcement;
 * these only save the user from typing the routine every morning.
 *
 * Static text, no database access, no allowance used.
 */

export interface McpPromptArg {
  name: string;
  description: string;
  required?: boolean;
}

export interface McpPrompt {
  name: string;
  title: string;
  description: string;
  arguments: McpPromptArg[];
  build: (args: Record<string, string>) => string;
}

const clip = (v: string | undefined, max = 300): string => (v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

const COMPANY_ARG: McpPromptArg = {
  name: "company",
  description: "Which company or campaign (a name from list_companies). Leave empty to be asked.",
};

const companyLine = (c: string): string =>
  c
    ? `The company is "${c}". Find its id with list_companies; if no company matches, show me the list and ask.`
    : "First call list_companies and ask me which company (campaign) this is for. Do not pick for me.";

export const MCP_PROMPTS: McpPrompt[] = [
  {
    name: "morning_run",
    title: "EMOS morning run",
    description: "Find a story, find journalists, save them, draft and score a pitch, and put it in your mailbox as a draft. Nothing is sent.",
    arguments: [COMPANY_ARG, { name: "story", description: "The story or angle, if you already know it. Leave empty to choose from saved signals." }],
    build: (a) =>
      [
        "Run my EMOS morning, step by step, and stop for me at each choice.",
        companyLine(clip(a.company)),
        clip(a.story)
          ? `The story: "${clip(a.story, 600)}". Check list_signals and list_assets for that company for anything that supports it.`
          : "Then show me the company's saved signals (list_signals) and assets (list_assets) and ask which story to pitch. If nothing fits, offer one scan_signals run and poll get_run.",
        "Ask me for my own take on the story, in a sentence or two. My words win over any suggested angle.",
        "Run find_journalists for the story. Show verified and unverified names apart, with each one's latest byline, and let me pick.",
        "Save my picks with add_journalist: show me the preview, then commit with the token only. Add an email only if I give it or you can cite the public page it is on; never build one from a pattern.",
        "Draft with draft_pitch, then reshape it with my take and score it with score_pitch. Show the score and the top fixes, revise once, and show me the final text.",
        "When I approve, create a draft in my mailbox addressed to the journalist. Do not send. Tell me it is waiting for me.",
      ].join("\n"),
  },
  {
    name: "log_sent",
    title: "EMOS log what I sent",
    description: "Find pitches you sent from your mailbox and record them in EMOS.",
    arguments: [COMPANY_ARG, { name: "journalist", description: "A journalist's name, to check just that one. Leave empty to check all recent drafts." }],
    build: (a) =>
      [
        "Record the pitches I have sent.",
        companyLine(clip(a.company)),
        clip(a.journalist)
          ? `Check only "${clip(a.journalist)}": find them with list_journalists.`
          : "Use list_pitch_drafts and list_journalists for that company to see who I meant to pitch in the last few days.",
        "For each journalist with an email, search my Sent mail for messages to that address in the last 3 days.",
        "For each sent email you find: call log_pitch_sent with the matching pitch (or journalist, company and subject), sent_date from the email, and idempotency_key set to that email's message id. Show me the preview, then commit with the token only.",
        "If I say I sent something you cannot find, ask before logging it on my word. Never reply to a journalist.",
      ].join("\n"),
  },
  {
    name: "reply_sweep",
    title: "EMOS reply sweep",
    description: "Check your inbox for journalist replies to recent pitches and record them in EMOS in one go.",
    arguments: [COMPANY_ARG],
    build: (a) =>
      [
        "Do my EMOS reply sweep. Read and log only, never reply.",
        companyLine(clip(a.company)),
        "Call list_pitches for that company with stage sent, for the last 14 days.",
        "For each pitch whose journalist has an email, search my inbox for mail from that address since the sent date.",
        "Build one log_reply call with every outcome in items: replied (or rejected, if they said no) with a short note in your own words, and no_response for pitches silent for 14 days or more. Give each item its own idempotency_key: the reply's message id, or for no_response the pitch id followed by :no_response, so silence is logged once.",
        "Show me the one preview, then commit with the token only. Then list who replied and suggest follow-ups as new drafts for me to send.",
      ].join("\n"),
  },
  {
    name: "log_placement",
    title: "EMOS log a placement",
    description: "Record a published article that came from a pitch.",
    arguments: [
      { name: "url", description: "The full address of the published article.", required: true },
      COMPANY_ARG,
    ],
    build: (a) =>
      [
        `Record this placement: ${clip(a.url, 500)}`,
        companyLine(clip(a.company)),
        "Find the pitch it came from with list_pitches (match the outlet and journalist). If more than one could match, ask me.",
        "Call record_placement with that pitch and the URL. Fill link_type only if you checked the link's rel attribute yourself. Show me the preview, then commit with the token only.",
        "If EMOS refuses the URL, tell me why in plain words. Do not try a different URL without asking.",
      ].join("\n"),
  },
];

/** prompts/list entries. */
export function promptListing(): Array<{ name: string; title: string; description: string; arguments: McpPromptArg[] }> {
  return MCP_PROMPTS.map(({ name, title, description, arguments: args }) => ({ name, title, description, arguments: args }));
}

/** prompts/get: the routine as one user message, or null for an unknown name / missing required argument. */
export function getPrompt(
  name: unknown,
  rawArgs: unknown,
): { ok: true; description: string; text: string } | { ok: false; error: string } {
  const p = MCP_PROMPTS.find((x) => x.name === name);
  if (!p) return { ok: false, error: `Unknown prompt: ${String(name)}` };
  const args: Record<string, string> = {};
  if (rawArgs && typeof rawArgs === "object") {
    for (const [k, v] of Object.entries(rawArgs as Record<string, unknown>)) {
      if (typeof v === "string") args[k] = v;
    }
  }
  const missing = p.arguments.filter((a) => a.required && !clip(args[a.name])).map((a) => a.name);
  if (missing.length) return { ok: false, error: `Missing argument: ${missing.join(", ")}` };
  return { ok: true, description: p.description, text: p.build(args) };
}

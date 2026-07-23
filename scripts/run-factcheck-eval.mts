/**
 * Standalone LOCAL eval runner for the FactcheckIQ full-audit path.
 *
 * Runs each fixture in eval/golden-set.json through the same logic as run.ts's
 * full-audit path (the free citation/link gate first, then verify.ts for anything
 * the gate did not already prove fabricated) and prints expected-vs-actual verdicts.
 *
 * It does NOT touch Supabase or the deployed API, and it does NOT modify the
 * pipeline: it imports the library exactly as production does. The grade model is
 * whatever FACTCHECK_GRADE_MODEL is set to for the process (default claude-opus-4-8),
 * read once at config.ts load, exactly like the deployed tool.
 *
 * ---------------------------------------------------------------------------
 * TWO-MODEL COMPARISON (--compare)
 * ---------------------------------------------------------------------------
 * `--compare` runs the SAME claim set through TWO grade models and prints a
 * side-by-side of golden vs model A vs model B with per-claim match flags, plus
 * per-model totals: accuracy % vs golden, web searches, and estimated $ cost. It
 * writes the full result to eval/factcheck-model-comparison-<timestamp>.{json,md}.
 *
 * Because FACTCHECK_GRADE_MODEL is read once at module load (config.ts), one
 * process can only ever use one grade model. So --compare runs each model in its
 * OWN child process (this same file, re-invoked with --worker and the model set in
 * the environment) and aggregates the two JSON results. Nothing in the pipeline is
 * changed; this is a measurement wrapper only. The two models run sequentially to
 * keep peak spend and web-search rate-limit pressure bounded.
 *
 * Cost is metered by a measurement-only shim on globalThis.fetch that reads the
 * `usage` block of every /v1/messages response (it clones the response, so the SDK
 * still sees an untouched body). No pipeline file is edited to get token counts.
 *
 * Usage (from the repo root, where ANTHROPIC_API_KEY lives; this spends real budget):
 *
 *   # $0 smoke test of the harness plumbing (planted-01 is a fake DOI caught by the
 *   # free gate, so NO model is called and nothing is billed):
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-factcheck-eval.mts --compare --only=planted-01
 *
 *   # the real comparison on the 5-claim default set (paid: a few $ of grade tokens):
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-factcheck-eval.mts --compare
 *
 *   # the full 24 (more real money) -- only after the 5-claim set looks good:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-factcheck-eval.mts --compare --all
 *
 *   # single-model run (original behavior; grade model = FACTCHECK_GRADE_MODEL):
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-factcheck-eval.mts
 *
 * Flags: --compare          run BOTH grade models and print a side-by-side + write a file
 *        --models=a,b       override the two model ids (default claude-opus-4-8,claude-sonnet-5)
 *        --gap=SECONDS      wait between the two models (default 60) so the second model does
 *                           not trip the per-minute API rate limit the first one just used
 *        --no-think         run the CANDIDATE model (B) with extended thinking disabled
 *                           (thinking:{type:"disabled"} injected in-flight; verify.ts untouched) --
 *                           use to test Sonnet 5 without its default thinking overhead
 *        --out=path/prefix  override the results file prefix (default eval/factcheck-model-comparison-<ts>)
 *        --only=id1,id2     run just those fixture ids
 *        --all              run the full 24 (default is the 5-claim watchable set)
 *        --limit=N          run the first N of the (filtered) set
 *        --worker           INTERNAL: run one model and emit JSON (used by --compare)
 *
 * Note: fixtures carry only the claim text, not the full source document, so the
 * per-claim `documentText` here is the claim itself (plus its same-source siblings
 * as a mini "document"). Doc-level reference-frame and consistency signals are
 * therefore weaker than a real run; per-claim verdicts are still representative.
 * Treat this as a verdict-accuracy check, not a full-doc audit.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ClaimType, Risk, Source, Verdict } from "../src/lib/factcheck/types";

// ---------------------------------------------------------------------------
// Fixtures + selection
// ---------------------------------------------------------------------------

interface Fixture {
  id: string;
  source?: string;
  claimText: string;
  claimType: ClaimType;
  expectedVerdict: Verdict;
  note?: string;
}

// Default small, representative set so a run is cheap and watchable. Covers: the
// free gate (planted-01), the source-recording fix (wb-01), the doc-context /
// self-contradiction fix (wb-08), a single-source verified stat (seo-10), and an
// honest unverifiable (seo-01). Pass --all for the full 24, or --only=ids.
const SMALL_SET = ["planted-01", "wb-01", "wb-08", "seo-10", "seo-01"];

const evalPath = path.join(process.cwd(), "eval", "golden-set.json");

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
const runAll = args.includes("--all");
const isWorker = args.includes("--worker");
const isCompare = args.includes("--compare");
const modelsArg = args.find((a) => a.startsWith("--models="))?.split("=")[1];
const outArg = args.find((a) => a.startsWith("--out="))?.split("=")[1];
const gapArg = args.find((a) => a.startsWith("--gap="))?.split("=")[1];
const noThink = args.includes("--no-think");

const DEFAULT_MODEL = "claude-opus-4-8";
const DEFAULT_MODELS: [string, string] = ["claude-opus-4-8", "claude-sonnet-5"];

function loadFixtures(): Fixture[] {
  if (!fs.existsSync(evalPath)) {
    console.error(`Could not find ${evalPath}. Run this from the repo root.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(evalPath, "utf8")) as Fixture[];
}

function selectFixtures(fixtures: Fixture[]): Fixture[] {
  // Default = the small watchable set. --only=ids overrides it; --all runs everything.
  const only = onlyArg ? new Set(onlyArg.split(",")) : runAll ? null : new Set(SMALL_SET);
  let selected = fixtures.filter((f) => !only || only.has(f.id));
  if (limitArg) selected = selected.slice(0, Number(limitArg));
  return selected;
}

// ---------------------------------------------------------------------------
// Pricing (measurement only). Confirmed 20 Jul 2026 against
//   https://platform.claude.com/docs/en/about-claude/models/overview
//   https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
//   https://platform.claude.com/docs/en/build-with-claude/prompt-caching
// Sonnet 5 shows introductory pricing ($2/$10) in effect through 2026-08-31; the
// standard rate afterward is $3/$15. Opus 4.8 is $5/$25.
// ---------------------------------------------------------------------------

interface ModelPrice {
  label: string;
  inPerM: number; // $ per 1M UNCACHED input tokens
  outPerM: number; // $ per 1M output tokens
  note?: string;
}

// Prompt-caching multipliers (docs): cache read = 0.1x input, 5-minute cache write
// = 1.25x input. verify.ts caches the system+tools prefix with the default
// (5-minute) ephemeral breakpoint, so cache writes are priced at 1.25x here.
const CACHE_READ_MULT = 0.1;
const CACHE_WRITE_MULT = 1.25;
// $10 per 1,000 web_search requests; errored searches are not billed.
const WEB_SEARCH_COST = 0.01;

const PRICES: Record<string, ModelPrice> = {
  "claude-opus-4-8": { label: "Opus 4.8", inPerM: 5, outPerM: 25 },
  "claude-sonnet-5": {
    label: "Sonnet 5",
    inPerM: 2,
    outPerM: 10,
    note: "intro pricing thru 2026-08-31; standard $3/$15 after",
  },
  "claude-haiku-4-5": { label: "Haiku 4.5", inPerM: 1, outPerM: 5 },
  "claude-haiku-4-5-20251001": { label: "Haiku 4.5", inPerM: 1, outPerM: 5 },
  "claude-fable-5": { label: "Fable 5", inPerM: 10, outPerM: 50, note: "never use for grading" },
};

function priceFor(model: string): ModelPrice | null {
  return PRICES[model] ?? null;
}

function labelFor(model: string): string {
  return priceFor(model)?.label ?? model;
}

interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheCreation: number;
  webSearchRequests: number;
  capturedResponses: number;
}

export function emptyUsage(): Usage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheRead: 0,
    cacheCreation: 0,
    webSearchRequests: 0,
    capturedResponses: 0,
  };
}

interface CostBreakdown {
  total: number;
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
  webSearch: number;
}

export function estimateCost(model: string, u: Usage): CostBreakdown | null {
  const p = priceFor(model);
  if (!p) return null;
  const input = (u.inputTokens / 1e6) * p.inPerM;
  const cacheRead = (u.cacheRead / 1e6) * p.inPerM * CACHE_READ_MULT;
  const cacheWrite = (u.cacheCreation / 1e6) * p.inPerM * CACHE_WRITE_MULT;
  const output = (u.outputTokens / 1e6) * p.outPerM;
  const webSearch = u.webSearchRequests * WEB_SEARCH_COST;
  return { total: input + cacheRead + cacheWrite + output + webSearch, input, cacheRead, cacheWrite, output, webSearch };
}

// ---------------------------------------------------------------------------
// Usage meter: a measurement-only shim on globalThis.fetch that tallies token
// usage from every /v1/messages response WITHOUT touching pipeline code. It
// clones each response (leaving the body intact for the SDK) and reads `usage`.
// Must be installed BEFORE the pipeline (and thus the SDK) is imported, which is
// why the pipeline is loaded via dynamic import after this runs.
// ---------------------------------------------------------------------------

interface UsageMeter {
  usage: Usage;
  flush: () => Promise<void>;
  thinkingInjected: () => number;
}

export function installUsageMeter(disableThinking = false): UsageMeter {
  const usage = emptyUsage();
  const pending: Promise<void>[] = [];
  let thinkingInjected = 0;
  const orig = globalThis.fetch;

  const urlOf = (input: Parameters<typeof fetch>[0]): string =>
    typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;

  if (typeof orig === "function") {
    const wrapped: typeof fetch = async (input, init) => {
      let reqInput = input;
      let reqInit = init;

      // Measurement-only request rewrite: strip extended thinking from outgoing
      // /v1/messages calls so we can test the model with thinking OFF without
      // editing verify.ts. Sonnet 5 has adaptive thinking ON by default; the
      // documented off switch is thinking:{type:"disabled"} (confirmed 22 Jul 2026
      // against platform.claude.com whats-new-sonnet-5). If the body cannot be
      // rewritten, the original request is sent unchanged rather than broken.
      if (disableThinking) {
        try {
          const url = urlOf(input);
          if (url.includes("/v1/messages") && init && typeof init.body === "string") {
            const body = JSON.parse(init.body) as Record<string, unknown>;
            body.thinking = { type: "disabled" };
            const headers = new Headers(init.headers ?? {});
            headers.delete("content-length");
            reqInit = { ...init, body: JSON.stringify(body), headers };
            thinkingInjected++;
          } else if (url.includes("/v1/messages") && input instanceof Request) {
            const original = input;
            const body = JSON.parse(await original.clone().text()) as Record<string, unknown>;
            body.thinking = { type: "disabled" };
            const headers = new Headers(original.headers);
            headers.delete("content-length");
            reqInput = new Request(original, { body: JSON.stringify(body), headers });
            thinkingInjected++;
          }
        } catch {
          /* leave the request unchanged if we cannot parse/rewrite it */
        }
      }

      const res = await orig(reqInput, reqInit);
      try {
        const url =
          typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
        if (url && url.includes("/v1/messages") && res.ok) {
          const clone = res.clone();
          pending.push(
            clone
              .json()
              .then((body: unknown) => {
                const u = (body as { usage?: Record<string, unknown> } | null)?.usage;
                if (u) {
                  const num = (v: unknown): number => (typeof v === "number" ? v : 0);
                  const serverTool = u["server_tool_use"] as { web_search_requests?: unknown } | undefined;
                  usage.capturedResponses++;
                  usage.inputTokens += num(u["input_tokens"]);
                  usage.outputTokens += num(u["output_tokens"]);
                  usage.cacheRead += num(u["cache_read_input_tokens"]);
                  usage.cacheCreation += num(u["cache_creation_input_tokens"]);
                  usage.webSearchRequests += num(serverTool?.web_search_requests);
                }
              })
              .catch(() => {
                /* a body we cannot parse is simply not metered */
              }),
          );
        }
      } catch {
        /* metering must never break a real request */
      }
      return res;
    };
    globalThis.fetch = wrapped;
  }

  return {
    usage,
    flush: async () => {
      await Promise.all(pending);
    },
    thinkingInjected: () => thinkingInjected,
  };
}

// ---------------------------------------------------------------------------
// Pipeline (dynamically imported so the fetch meter is in place first)
// ---------------------------------------------------------------------------

async function loadPipeline() {
  const [verify, grade, citations, links] = await Promise.all([
    import("../src/lib/factcheck/verify"),
    import("../src/lib/factcheck/grade"),
    import("../src/lib/factcheck/citations"),
    import("../src/lib/factcheck/links"),
  ]);
  return {
    verifyClaim: verify.verifyClaim,
    clampVerdict: grade.clampVerdict,
    checkCitation: citations.checkCitation,
    checkLinks: links.checkLinks,
    extractDoi: links.extractDoi,
  };
}

type Pipeline = Awaited<ReturnType<typeof loadPipeline>>;

// ---------------------------------------------------------------------------
// Eval core (identical verdict logic to the original single-model harness)
// ---------------------------------------------------------------------------

// risk is assigned by the extractor in a real run; here we approximate it from
// claim type (citations/quotes/statistics are the high-risk kinds per prompts.ts).
function riskFor(t: ClaimType): Risk {
  return t === "citation" || t === "quote" || t === "statistic" ? "high" : "medium";
}

// Faithful mirror of run.ts's runCitationGate, full-audit mode, gate only.
async function gate(
  pipeline: Pipeline,
  claimText: string,
  risk: Risk,
  runDate: Date,
): Promise<{ verdict: Verdict; evidence: string; sources: Source[] }> {
  const doi = pipeline.extractDoi(claimText);
  const urlMatch = claimText.match(/https?:\/\/[^\s"'<>)]+/);
  let proposed: Verdict = "unverifiable";
  let evidence = "No DOI or link found to check deterministically.";
  const sources: Source[] = [];

  if (doi) {
    const r = await pipeline.checkCitation({ doi });
    if (!r.exists) {
      proposed = "fabricated";
      evidence = `DOI ${doi} does not resolve in Crossref or OpenAlex.`;
    } else if (r.retracted) {
      proposed = "fabricated";
      evidence = `DOI ${doi} resolves to a retracted paper.`;
    } else if (r.matchesClaim === false) {
      proposed = "fabricated";
      evidence = `DOI ${doi} resolves to "${r.resolvedTitle}", not what the claim attributes to it.`;
    } else {
      proposed = "unverifiable";
      evidence = `DOI ${doi} resolves to "${r.resolvedTitle}" (${r.source}).`;
    }
    if (r.resolvedTitle) {
      sources.push({ url: `https://doi.org/${doi}`, tier: 1, quote: r.resolvedTitle, as_of: runDate.toISOString().slice(0, 10) });
    }
  } else if (urlMatch) {
    const [lr] = await pipeline.checkLinks([urlMatch[0]]);
    if (!lr.resolved) {
      proposed = "inaccurate";
      evidence = `Link ${urlMatch[0]} did not resolve (${lr.statusCode ?? lr.error}).`;
    } else {
      evidence = `Link ${urlMatch[0]} resolves (HTTP ${lr.statusCode}).`;
    }
  }

  const clamp = pipeline.clampVerdict({ proposedVerdict: proposed, sources, mode: "full", loadBearing: risk === "high" });
  return { verdict: clamp.verdict, evidence, sources };
}

interface Row {
  id: string;
  expected: Verdict;
  actual: Verdict | "check_failed" | null;
  match: boolean;
  /** false when the claim could not be assessed (check_failed) -- excluded from the score. */
  scored: boolean;
  via: "gate" | "verify" | "incomplete" | "error";
  searches: number;
  note: string;
}

async function runOne(pipeline: Pipeline, f: Fixture, runDate: Date, docFor: (f: Fixture) => string): Promise<Row> {
  const risk = riskFor(f.claimType);
  try {
    const g = await gate(pipeline, f.claimText, risk, runDate);
    if (g.verdict === "fabricated") {
      return { id: f.id, expected: f.expectedVerdict, actual: "fabricated", match: f.expectedVerdict === "fabricated", scored: true, via: "gate", searches: 0, note: g.evidence };
    }
    const v = await pipeline.verifyClaim(
      { claimText: f.claimText, claimType: f.claimType, section: null, risk, citationEvidence: g.evidence },
      { documentText: docFor(f), runDate },
    );
    // check_failed = the tool could not run (rate limit / timeout). Not a verdict,
    // so it does not count for or against accuracy.
    if (v.claim.status === "check_failed") {
      return { id: f.id, expected: f.expectedVerdict, actual: "check_failed", match: false, scored: false, via: "incomplete", searches: v.searchesUsed, note: (v.claim.evidence ?? "").slice(0, 160) };
    }
    return {
      id: f.id,
      expected: f.expectedVerdict,
      actual: v.claim.verdict,
      match: v.claim.verdict === f.expectedVerdict,
      scored: true,
      via: "verify",
      searches: v.searchesUsed,
      note: (v.claim.evidence ?? "").slice(0, 160),
    };
  } catch (err) {
    return { id: f.id, expected: f.expectedVerdict, actual: null, match: false, scored: false, via: "error", searches: 0, note: err instanceof Error ? err.message : String(err) };
  }
}

interface EvalOutput {
  rows: Row[];
  usage: Usage;
  totalSearches: number;
}

async function runEvalCore(
  pipeline: Pipeline,
  fixtures: Fixture[],
  selected: Fixture[],
  meter: UsageMeter,
  onRow: (row: Row) => void,
): Promise<EvalOutput> {
  const runDate = new Date();

  // Give the grader document context: every claim from the same source, joined, acts
  // as a mini "document under audit" so cross-claim signals work (e.g. wb-08's 20-min
  // header vs the 15-min body row). Falls back to the claim alone if it has no source.
  const docBySource = new Map<string, string>();
  for (const f of fixtures) {
    if (!f.source) continue;
    const prev = docBySource.get(f.source);
    docBySource.set(f.source, prev ? `${prev}\n\n${f.claimText}` : f.claimText);
  }
  const docFor = (f: Fixture): string => (f.source && docBySource.get(f.source)) || f.claimText;

  const rows: Row[] = [];
  let totalSearches = 0;
  for (const f of selected) {
    const row = await runOne(pipeline, f, runDate, docFor);
    rows.push(row);
    totalSearches += row.searches;
    onRow(row);
  }
  await meter.flush();
  return { rows, usage: meter.usage, totalSearches };
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function pad(s: string, n: number): string {
  return s.length >= n ? `${s} ` : s.padEnd(n);
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

function pct(part: number, whole: number): string {
  return whole === 0 ? "n/a" : `${Math.round((part / whole) * 100)}%`;
}

function rowMark(row: Row): string {
  if (!row.scored) return "SKIP";
  return row.actual === row.expected ? "ok" : "MISS";
}

interface ModelTotals {
  model: string;
  label: string;
  scored: number;
  passed: number;
  incomplete: number;
  searches: number;
  cost: CostBreakdown | null;
  usage: Usage;
}

function totalsFor(model: string, rows: Row[], usage: Usage, totalSearches: number): ModelTotals {
  const scoredRows = rows.filter((r) => r.scored);
  return {
    model,
    label: labelFor(model),
    scored: scoredRows.length,
    passed: scoredRows.filter((r) => r.match).length,
    incomplete: rows.filter((r) => !r.scored).length,
    searches: totalSearches,
    cost: estimateCost(model, usage),
    usage,
  };
}

function costLine(t: ModelTotals): string {
  if (!t.cost) return "est. cost n/a (unknown model price)";
  if (t.usage.capturedResponses === 0) {
    return "est. cost n/a (token usage not captured on this run; showing searches only)";
  }
  return `est. cost ${fmtUsd(t.cost.total)}`;
}

// ---------------------------------------------------------------------------
// Result-file (JSON + Markdown) writer
// ---------------------------------------------------------------------------

function stampNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

interface WorkerPayload {
  model: string;
  rows: Row[];
  usage: Usage;
  totalSearches: number;
  ids: string[];
  thinkingDisabled?: boolean;
}

function buildComparison(a: WorkerPayload, b: WorkerPayload) {
  const byA = new Map(a.rows.map((r) => [r.id, r]));
  const byB = new Map(b.rows.map((r) => [r.id, r]));
  const ids = a.ids.length ? a.ids : b.ids;
  const perClaim = ids.map((id) => {
    const ra = byA.get(id);
    const rb = byB.get(id);
    return {
      id,
      golden: ra?.expected ?? rb?.expected ?? null,
      a: ra ? { verdict: ra.actual, match: ra.scored && ra.match, scored: ra.scored, via: ra.via } : null,
      b: rb ? { verdict: rb.actual, match: rb.scored && rb.match, scored: rb.scored, via: rb.via } : null,
      diverged: (ra?.actual ?? null) !== (rb?.actual ?? null),
    };
  });
  const diverged = perClaim.filter((c) => c.diverged).map((c) => c.id);
  return { ids, perClaim, diverged };
}

function writeResultFiles(a: WorkerPayload, b: WorkerPayload): { json: string; md: string } {
  const ta = totalsFor(a.model, a.rows, a.usage, a.totalSearches);
  const tb = totalsFor(b.model, b.rows, b.usage, b.totalSearches);
  const cmp = buildComparison(a, b);
  const generatedAt = new Date().toISOString();

  const jsonBody = {
    generatedAt,
    note: "FactcheckIQ two-model grade-model comparison. Measurement only; pipeline and clampVerdict unchanged. Cost reflects the verify/grade step (the ~95% cost driver); the free citation/link gate and extract step are not billed here.",
    models: { a: a.model, b: b.model },
    thinkingDisabledOnB: b.thinkingDisabled ?? false,
    selection: cmp.ids,
    totals: {
      a: { ...ta, cost: ta.cost },
      b: { ...tb, cost: tb.cost },
    },
    perClaim: cmp.perClaim,
    diverged: cmp.diverged,
  };

  const prefix = outArg ?? path.join("eval", `factcheck-model-comparison-${stampNow()}`);
  const jsonPath = `${prefix}.json`;
  const mdPath = `${prefix}.md`;
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(jsonBody, null, 2));

  // Markdown summary
  const la = ta.label;
  const lb = tb.label;
  const lines: string[] = [];
  lines.push(`# FactcheckIQ grade-model comparison`);
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push(`- Model A: \`${a.model}\` (${la})`);
  lines.push(`- Model B: \`${b.model}\` (${lb})${b.thinkingDisabled ? " — extended thinking DISABLED" : ""}`);
  lines.push(`- Claim set: ${cmp.ids.length} claim(s): ${cmp.ids.join(", ")}`);
  lines.push("");
  lines.push(`Measurement only. Pipeline behavior and clampVerdict are unchanged. Cost reflects the per-claim verify/grade step (the dominant cost driver); the free citation/link gate and the extract step are not billed here.`);
  lines.push("");
  lines.push(`## Per-claim verdicts`);
  lines.push("");
  lines.push(`| Claim | Golden | ${la} | match | ${lb} | match |`);
  lines.push(`| --- | --- | --- | --- | --- | --- |`);
  for (const c of cmp.perClaim) {
    const av = c.a?.verdict ?? "ERROR";
    const bv = c.b?.verdict ?? "ERROR";
    const am = c.a && !c.a.scored ? "skip" : c.a?.match ? "ok" : "MISS";
    const bm = c.b && !c.b.scored ? "skip" : c.b?.match ? "ok" : "MISS";
    const flag = c.diverged ? " *" : "";
    lines.push(`| ${c.id}${flag} | ${c.golden ?? "?"} | ${av} | ${am} | ${bv} | ${bm} |`);
  }
  lines.push("");
  lines.push(`\`*\` marks claims where the two models disagree with each other.`);
  lines.push("");
  lines.push(`## Totals`);
  lines.push("");
  lines.push(`| Model | Accuracy vs golden | Web searches | Est. cost |`);
  lines.push(`| --- | --- | --- | --- |`);
  lines.push(`| ${la} (\`${a.model}\`) | ${ta.passed}/${ta.scored} (${pct(ta.passed, ta.scored)}) | ${ta.searches} | ${ta.cost && ta.usage.capturedResponses ? fmtUsd(ta.cost.total) : "n/a"} |`);
  lines.push(`| ${lb} (\`${b.model}\`) | ${tb.passed}/${tb.scored} (${pct(tb.passed, tb.scored)}) | ${tb.searches} | ${tb.cost && tb.usage.capturedResponses ? fmtUsd(tb.cost.total) : "n/a"} |`);
  lines.push("");
  if (ta.incomplete || tb.incomplete) {
    lines.push(`Incomplete (check_failed, excluded from accuracy): ${la} ${ta.incomplete}, ${lb} ${tb.incomplete}.`);
    lines.push("");
  }
  lines.push(`## Token usage`);
  lines.push("");
  lines.push(`| Model | Input | Cache read | Cache write | Output | Web searches |`);
  lines.push(`| --- | --- | --- | --- | --- | --- |`);
  lines.push(`| ${la} | ${ta.usage.inputTokens} | ${ta.usage.cacheRead} | ${ta.usage.cacheCreation} | ${ta.usage.outputTokens} | ${ta.usage.webSearchRequests} |`);
  lines.push(`| ${lb} | ${tb.usage.inputTokens} | ${tb.usage.cacheRead} | ${tb.usage.cacheCreation} | ${tb.usage.outputTokens} | ${tb.usage.webSearchRequests} |`);
  lines.push("");
  const pa = priceFor(a.model);
  const pb = priceFor(b.model);
  if (pa) lines.push(`- ${la} price: $${pa.inPerM}/$${pa.outPerM} per MTok${pa.note ? ` (${pa.note})` : ""}`);
  if (pb) lines.push(`- ${lb} price: $${pb.inPerM}/$${pb.outPerM} per MTok${pb.note ? ` (${pb.note})` : ""}`);
  lines.push("");
  fs.writeFileSync(mdPath, lines.join("\n"));

  return { json: jsonPath, md: mdPath };
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

const RESULT_BEGIN = "<<<FCIQ_RESULT_BEGIN>>>";
const RESULT_END = "<<<FCIQ_RESULT_END>>>";

function requireKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }
}

/** Worker: run ONE grade model over the selected fixtures, emit JSON on stdout. */
async function runWorkerMode(): Promise<void> {
  requireKey();
  const fixtures = loadFixtures();
  const selected = selectFixtures(fixtures);
  const model = process.env.FACTCHECK_GRADE_MODEL ?? DEFAULT_MODEL;

  // stderr is inherited by the parent, so progress shows live; stdout carries only
  // the sentinel-wrapped JSON result the parent parses.
  console.error(`[worker ${model}] verifying ${selected.length} claim(s): ${selected.map((f) => f.id).join(", ")}`);

  const meter = installUsageMeter(noThink);
  const pipeline = await loadPipeline();
  const { rows, usage, totalSearches } = await runEvalCore(pipeline, fixtures, selected, meter, (row) => {
    console.error(`[worker ${model}] ${rowMark(row).padEnd(4)} ${row.id.padEnd(12)} -> ${row.actual ?? "ERROR"} (via ${row.via}, searches ${row.searches})`);
  });

  if (noThink) console.error(`[worker ${model}] extended thinking DISABLED; injected into ${meter.thinkingInjected()} model request(s)`);
  const payload: WorkerPayload = { model, rows, usage, totalSearches, ids: selected.map((f) => f.id), thinkingDisabled: noThink };
  process.stdout.write(`${RESULT_BEGIN}${JSON.stringify(payload)}${RESULT_END}\n`);
}

/** Spawn one worker child for a model and collect its parsed JSON payload. */
function runWorker(model: string, forwarded: string[], tag: string): Promise<WorkerPayload> {
  const self = fileURLToPath(import.meta.url);
  return new Promise<WorkerPayload>((resolve, reject) => {
    console.log(`\n=== ${tag}: ${labelFor(model)} (${model}) ===`);
    const child = spawn("npx", ["tsx", self, "--worker", ...forwarded], {
      env: { ...process.env, FACTCHECK_GRADE_MODEL: model },
      stdio: ["ignore", "pipe", "inherit"],
    });
    if (!child.stdout) {
      reject(new Error(`worker for ${model} exposed no stdout pipe`));
      return;
    }
    let out = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (d: string) => {
      out += d;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`worker for ${model} exited with code ${code}`));
        return;
      }
      const begin = out.indexOf(RESULT_BEGIN);
      const end = out.indexOf(RESULT_END);
      if (begin === -1 || end === -1) {
        reject(new Error(`worker for ${model} produced no parseable result on stdout`));
        return;
      }
      try {
        resolve(JSON.parse(out.slice(begin + RESULT_BEGIN.length, end)) as WorkerPayload);
      } catch (e) {
        reject(new Error(`could not parse worker result for ${model}: ${e instanceof Error ? e.message : String(e)}`));
      }
    });
  });
}

/** Compare: run BOTH models (each in its own process), print side-by-side, write files. */
async function runCompareMode(): Promise<void> {
  requireKey();
  loadFixtures(); // validate the golden set exists before spending anything

  const models = modelsArg ? (modelsArg.split(",").map((s) => s.trim()).filter(Boolean) as string[]) : DEFAULT_MODELS;
  if (models.length !== 2) {
    console.error(`--models expects exactly two ids, e.g. --models=claude-opus-4-8,claude-sonnet-5`);
    process.exit(1);
  }
  const [modelA, modelB] = models;
  const scope = onlyArg ? `--only=${onlyArg}` : runAll ? "ALL 24 (paid)" : "default 5-claim set";
  const forwarded = args.filter((a) => a === "--all" || a.startsWith("--only=") || a.startsWith("--limit="));
  // --no-think disables extended thinking on the CANDIDATE (model B) only, so the
  // comparison is Opus-as-is vs Sonnet-with-thinking-off (today's prod vs proposed).
  const forwardedB = noThink ? [...forwarded, "--no-think"] : forwarded;

  console.log(`FactcheckIQ two-model grade comparison`);
  console.log(`Set: ${scope}`);
  console.log(`A = ${modelA} (${labelFor(modelA)})   B = ${modelB} (${labelFor(modelB)})${noThink ? " [thinking OFF]" : ""}`);
  console.log(`Each model runs in its own process (sequential, to bound spend + rate limits). Measurement only; pipeline unchanged.`);

  const a = await runWorker(modelA, forwarded, "Model A");

  // Cool down between models. Running the second model immediately after the first
  // can trip the account's per-minute API rate limit (observed 21 Jul 2026: Sonnet
  // came back check_failed on every claim right after an Opus run, but ran clean on
  // its own). A ~60s gap lets the per-minute limits reset. Override with --gap=SECONDS
  // (use --gap=0 to disable, e.g. when the two models are on separate rate-limit tiers).
  const gapSeconds = gapArg !== undefined ? Math.max(0, Number(gapArg)) : 60;
  if (gapSeconds > 0) {
    console.log(`\nCooling down ${gapSeconds}s before ${labelFor(modelB)} so the per-minute rate limit resets...`);
    await new Promise<void>((resolve) => setTimeout(resolve, gapSeconds * 1000));
  }

  const b = await runWorker(modelB, forwardedB, noThink ? "Model B (thinking OFF)" : "Model B");

  const ta = totalsFor(modelA, a.rows, a.usage, a.totalSearches);
  const tb = totalsFor(modelB, b.rows, b.usage, b.totalSearches);
  const cmp = buildComparison(a, b);
  const la = ta.label;
  const lb = tb.label;

  console.log(`\n----------------------------------------------------------------`);
  console.log(`PER-CLAIM  (golden | ${la} | ${lb})`);
  console.log(`----------------------------------------------------------------`);
  console.log(pad("claim", 14) + pad("golden", 16) + pad(la, 24) + pad(lb, 24));
  for (const c of cmp.perClaim) {
    const byA = a.rows.find((r) => r.id === c.id);
    const byB = b.rows.find((r) => r.id === c.id);
    const cellA = `${byA?.actual ?? "ERROR"} ${byA ? rowMark(byA) : ""}`.trim();
    const cellB = `${byB?.actual ?? "ERROR"} ${byB ? rowMark(byB) : ""}`.trim();
    const flag = c.diverged ? "*" : " ";
    console.log(`${flag} ` + pad(c.id, 12) + pad(String(c.golden ?? "?"), 16) + pad(cellA, 24) + pad(cellB, 24));
  }
  console.log(`\n( * = the two models disagree with each other )`);

  console.log(`\n----------------------------------------------------------------`);
  console.log(`TOTALS`);
  console.log(`----------------------------------------------------------------`);
  console.log(`${la.padEnd(12)} accuracy ${ta.passed}/${ta.scored} (${pct(ta.passed, ta.scored)})   web searches ${ta.searches}   ${costLine(ta)}`);
  console.log(`${lb.padEnd(12)} accuracy ${tb.passed}/${tb.scored} (${pct(tb.passed, tb.scored)})   web searches ${tb.searches}   ${costLine(tb)}`);
  if (ta.incomplete || tb.incomplete) {
    console.log(`incomplete (check_failed, not scored): ${la} ${ta.incomplete}, ${lb} ${tb.incomplete}`);
  }

  // Neutral summary; the switch decision is the user's.
  const agree = cmp.ids.length - cmp.diverged.length;
  console.log(`\nSUMMARY`);
  console.log(`- ${la} matched golden on ${ta.passed}/${ta.scored}; ${lb} matched golden on ${tb.passed}/${tb.scored}.`);
  console.log(`- The two models agreed with each other on ${agree}/${cmp.ids.length} claim(s)${cmp.diverged.length ? `; diverged on: ${cmp.diverged.join(", ")}` : ""}.`);
  if (ta.cost && tb.cost && ta.usage.capturedResponses && tb.usage.capturedResponses) {
    const cheaper = tb.cost.total <= ta.cost.total ? lb : la;
    const hi = Math.max(ta.cost.total, tb.cost.total);
    const lo = Math.min(ta.cost.total, tb.cost.total);
    const savePct = hi > 0 ? Math.round((1 - lo / hi) * 100) : 0;
    console.log(`- Estimated cost on this set: ${la} ${fmtUsd(ta.cost.total)} vs ${lb} ${fmtUsd(tb.cost.total)} (${cheaper} ~${savePct}% cheaper).`);
  } else {
    console.log(`- Token usage was not captured on this run, so no dollar figure. (Searches: ${la} ${ta.searches}, ${lb} ${tb.searches}.)`);
  }

  if (b.thinkingDisabled) {
    console.log(`- NOTE: ${lb} ran with extended thinking DISABLED (candidate config); ${la} ran normally.`);
  }

  const written = writeResultFiles(a, b);
  console.log(`\nWrote:\n  ${written.json}\n  ${written.md}`);
}

/** Single-model interactive run (original behavior, plus a cost line). */
async function runSingleMode(): Promise<void> {
  requireKey();
  const fixtures = loadFixtures();
  const selected = selectFixtures(fixtures);
  const model = process.env.FACTCHECK_GRADE_MODEL ?? DEFAULT_MODEL;
  const scope = onlyArg ? "--only" : runAll ? "ALL 24 (paid)" : "default small set";
  console.log(`Running ${selected.length} fixture(s) [${scope}] through ${model} sequentially...`);
  console.log(`Ids: ${selected.map((f) => f.id).join(", ")}\n`);

  const meter = installUsageMeter(noThink);
  const pipeline = await loadPipeline();
  const { rows, usage, totalSearches } = await runEvalCore(pipeline, fixtures, selected, meter, (row) => {
    const mark = !row.scored ? "SKIP" : row.match ? "PASS" : "FAIL";
    console.log(`${mark}  ${row.id.padEnd(12)} expected=${row.expected.padEnd(16)} actual=${(row.actual ?? "ERROR").padEnd(16)} via=${row.via} searches=${row.searches}`);
    if (!row.match) console.log(`        note: ${row.note}`);
  });

  const t = totalsFor(model, rows, usage, totalSearches);
  console.log(`\n${t.passed}/${t.scored} matched the golden set (of claims that were actually assessed). Web searches used: ${totalSearches}.`);
  console.log(`Grade model: ${model}. ${costLine(t)}.`);
  if (t.incomplete) {
    const incompleteIds = rows.filter((r) => !r.scored).map((r) => r.id);
    console.log(`${t.incomplete} claim(s) could not be checked (system busy / error) and are excluded from the score: ${incompleteIds.join(", ")}.`);
  }
  const misses = rows.filter((r) => r.scored && !r.match);
  if (misses.length) {
    console.log(`\nMismatches to review (some are defensible judgment calls -- see FactcheckIQ-Phase3-Eval-Trace.md):`);
    for (const m of misses) console.log(`  - ${m.id}: expected ${m.expected}, got ${m.actual ?? "ERROR"} (${m.via})`);
  }
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (isWorker) return runWorkerMode();
  if (isCompare) return runCompareMode();
  return runSingleMode();
}

/** True only when this file is the process entry point (run directly or spawned as
 * a worker), false when it is imported by a test. Keeps `main()` from auto-running
 * on import so the pure helpers above can be unit-tested. */
function invokedAsMain(): boolean {
  const entry = process.argv[1];
  if (!entry) return true;
  try {
    return pathToFileURL(fs.realpathSync(entry)).href === pathToFileURL(fs.realpathSync(fileURLToPath(import.meta.url))).href;
  } catch {
    return true;
  }
}

if (invokedAsMain()) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : String(err));
    process.exit(1);
  });
}

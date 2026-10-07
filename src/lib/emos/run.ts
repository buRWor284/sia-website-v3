import "server-only";
import { waitUntil } from "@vercel/functions";
import type { Actor, EmosResult } from "@/lib/emos/actor";
import {
  approvedBrief, bool, cut, fail, isUuid, loadCompany, notFound, ownedRow, str,
  type Args, type CompanyRow, type Row,
} from "@/lib/emos/shared";
import { newAiTally, withAiUsage, type AiTally, type AiUsageContext } from "@/lib/ai-usage";
import { scrubAiError } from "@/lib/ai-errors";
import { reserveUsageForActor, releaseUsageForOrg, type SeatUsage } from "@/lib/usage-limits";
import { COMPANY_CONTEXT_MAX } from "@/lib/company-types";
import { coerceOpportunity, parseBeats, runPackRequest, runScanRequest } from "@/lib/signaliq/route-core";
import { beatById, visibleBeats } from "@/lib/signaliq/config";
import { saveAssetPackForUser } from "@/lib/signaliq/save-pack";
import type { AssetPack, BeatId, Opportunity } from "@/lib/signaliq/types";
import { parseCandidateArray, runJournoAI, verifyCandidates } from "@/lib/journo/route-core";
import { discoverJournalists } from "@/lib/journo/discover";
import { buildRosterList } from "@/lib/journo/roster-list";
import { parsePitchInput, runScoreRequest } from "@/lib/pitch/route-core";
import { logPitch } from "@/lib/pitch/log";
import { draftPitches, MAX_DRAFT_BATCH, type DraftBrief, type DraftTarget } from "@/lib/pitch/draft";

/**
 * EMOS — Tier A: run the AI tools (spec v1.3 §3). Session 2, 2026-10-06.
 *
 * Each function takes (actor, args), calls the SAME shared core the dashboard
 * route calls (signaliq/route-core, journo/route-core, pitch/route-core,
 * pitch/draft), spends the SAME monthly allowance, logs cost to ai_usage with
 * surface "mcp", and saves into the SAME tables through actor.db() (row-level
 * security). Two doors, one filing cabinet.
 *
 * No preview step (decision 2): a run happens on the first call and its result
 * ends with a cost line. The one brake is reserveUsageForActor's quarter rule.
 */

/** One cost context per run: every AI call it makes is logged with surface "mcp" and added up in `tally`. */
const usageCtx = (actor: Actor): AiUsageContext & { tally: AiTally } => ({
  surface: "mcp", clerkUserId: actor.userId, orgId: actor.orgId, tally: newAiTally(),
});

/**
 * The cost of a run as data (2026-10-07). Results used to carry only
 * `remaining`, which is null on an admin account, so nothing in the data said
 * what a run had cost. `cost` now always has the allowance numbers. The dollar
 * figure is what EMOS paid its AI provider for this call: an internal number,
 * so it is shown to admin accounts only (like placement value).
 */
function costData(actor: Actor, usage: SeatUsage, tally?: AiTally | null, unitsHandedBack = 0): Row {
  const used = Math.max(usage.units_used - unitsHandedBack, 0);
  return {
    ...usage,
    units_used: used,
    used_this_month: Math.max(usage.used_this_month - unitsHandedBack, 0),
    remaining: usage.remaining === null ? null : usage.remaining + unitsHandedBack,
    ...(actor.isAdmin && tally
      ? { ai_cost_usd: Math.round(tally.usd * 10_000) / 10_000, ai_calls: tally.calls, ...(tally.unpriced ? { ai_calls_without_a_price: tally.unpriced } : {}) }
      : {}),
  };
}
const costText = (actor: Actor, costLine: string, tally?: AiTally | null): string =>
  actor.isAdmin && tally && tally.calls > 0 ? `${costLine} AI cost of this call: $${tally.usd.toFixed(3)}.` : costLine;
const companyContext = (c: CompanyRow): string | undefined => (c.context ? c.context.slice(0, COMPANY_CONTEXT_MAX) : undefined);
const refusal = (seat: { error: string; confirmLargeRun?: boolean; remaining?: number }): EmosResult =>
  fail(seat.error, { ...(seat.confirmLargeRun ? { confirm_large_run: true } : {}), remaining: seat.remaining ?? null });

// ─── scan_signals (start) + get_run (poll) ───────────────────────────────────

/** A run still "running" after this long died with its function. */
const RUN_STALE_MS = 6 * 60_000;

export async function startScan(actor: Actor, args: Args): Promise<EmosResult> {
  const company = await loadCompany(actor, args.company_id);
  if (!company) return notFound("company");
  const beats = parseBeats({ beats: Array.isArray(args.beats) ? args.beats : args.beat !== undefined ? [args.beat] : [] });
  if (beats.length === 0) {
    return fail("Pick 1 to 3 beats by id (primary first).", { beats: visibleBeats().map((b) => ({ id: b.id, label: b.label })) });
  }

  const seat = await reserveUsageForActor(actor, "scan", 1, { confirmLarge: bool(args.confirm_large_run) });
  if (!seat.ok) return refusal(seat);

  const { data: run, error } = await actor
    .db()
    .from("mcp_runs")
    .insert({ org_id: actor.orgId, actor_user_id: actor.userId, client_id: actor.clientId ?? null, tool: "scan_signals", args: { company_id: company.id, beats } })
    .select("id")
    .single();
  if (error || !run) {
    await seat.release();
    throw new Error(`Could not start the scan: ${error?.message ?? "no run row"}`);
  }
  const runId = String(run.id);

  // The scan takes 40 to 90 seconds. It keeps running after this response
  // (waitUntil, under the route's 300 s cap) inside its own cost context.
  waitUntil(
    finishScan(actor, runId, company, beats, seat).catch(async (e) => {
      console.error(`[emos] scan run ${runId} failed:`, e);
      await seat.release();
      await actor
        .db()
        .from("mcp_runs")
        .update({ status: "failed", error: "The scan failed. It was not counted against the allowance.", finished_at: new Date().toISOString() })
        .eq("org_id", actor.orgId)
        .eq("id", runId)
        .eq("status", "running");
    }),
  );

  return {
    text: `Scan started for ${company.name} (${beats.map((b) => beatById(b).label).join(", ")}). It takes 40 to 90 seconds: call get_run with this run_id until status is "done". ${seat.costLine}`,
    data: { run_id: runId, status: "running", company_id: company.id, beats, remaining: seat.remaining, cost: costData(actor, seat.usage) },
  };
}

async function finishScan(
  actor: Actor,
  runId: string,
  company: CompanyRow,
  beats: BeatId[],
  seat: { usage: SeatUsage; release: (n?: number) => Promise<void> },
): Promise<void> {
  const brief = await approvedBrief(actor, company.id);
  const ctx = usageCtx(actor);
  const core = await withAiUsage(ctx, () => runScanRequest(beats, companyContext(company), brief));
  const saved = await saveScanSignals(actor, company, core.opportunities);

  // 2026-10-07: a scan asked for a company and the tailoring step failed. The
  // standard-beat signals are still saved (they are real signals), but the
  // scan is NOT what was asked for, so it is handed back and the result says
  // so plainly. It used to count as one scan and say "try again in a moment".
  const untailored = core.tailoring.status === "failed";
  if (untailored) await seat.release();

  const { error } = await actor
    .db()
    .from("mcp_runs")
    .update({
      status: "done",
      finished_at: new Date().toISOString(),
      result: {
        company_id: company.id, beats: core.beats, generated_at: core.generatedAt, partial: core.partial, notes: core.notes, signals: saved,
        tailored: core.tailoring.status === "tailored",
        ...(core.tailoring.status === "failed" ? { tailoring_problem: core.tailoring.message, counted: false } : { counted: true }),
        cost: costData(actor, seat.usage, ctx.tally, untailored ? 1 : 0),
      },
    })
    .eq("org_id", actor.orgId)
    .eq("id", runId);
  if (error) throw new Error(`could not store the scan result: ${error.message}`);
}

/** Save every opportunity as a signal (status "new") with the full scan data
 * kept on the row, so build_asset_pack can work from the signal id alone. A
 * headline already saved for this company in the last 7 days is reused. */
async function saveScanSignals(actor: Actor, company: CompanyRow, opps: Opportunity[]): Promise<Row[]> {
  const db = actor.db();
  const out: Row[] = [];
  const beatIds = new Map<string, string | null>();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  for (const opp of opps) {
    const label = beatById(opp.beat).label;
    const summaryOf = {
      topic: opp.topic, headline: opp.headline, score: opp.score, band: opp.bandLabel, fit: opp.fit ?? null,
      coverage_gap: opp.components?.coverageGap ?? null, cooling: opp.cooling === true, thin_evidence: opp.thinEvidence === true,
      beat: label, sources: Array.from(new Set(opp.signals.map((s) => s.source))),
    };

    const { data: existing } = await db
      .from("signaliq_signals")
      .select("id")
      .eq("org_id", actor.orgId)
      .eq("company_id", company.id)
      .eq("headline", opp.headline)
      .gte("detected_at", weekAgo)
      .order("detected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing?.id) {
      await db.from("signaliq_signals").update({ opportunity: opp, signal_score: opp.score ?? null }).eq("org_id", actor.orgId).eq("id", existing.id);
      out.push({ signal_id: existing.id, already_saved: true, ...summaryOf });
      continue;
    }

    if (!beatIds.has(label)) {
      const { data: beat } = await db.from("signaliq_beats").select("id").eq("org_id", actor.orgId).eq("name", label).limit(1).maybeSingle();
      let id = (beat?.id as string | undefined) ?? null;
      if (!id) {
        const { data: made } = await db.from("signaliq_beats").insert({ org_id: actor.orgId, name: label, keywords: [] }).select("id").maybeSingle();
        id = (made?.id as string | undefined) ?? null;
      }
      beatIds.set(label, id);
    }

    const primary = opp.signals[0];
    const { data: row, error } = await db
      .from("signaliq_signals")
      .insert({
        org_id: actor.orgId,
        beat_id: beatIds.get(label) ?? null,
        headline: opp.headline,
        summary: opp.signals.map((s) => s.title).join(" · ").substring(0, 500),
        source: primary?.source ?? "manual",
        source_url: primary?.url ?? null,
        signal_score: opp.score ?? null,
        coverage_gap: opp.components?.coverageGap ?? null,
        status: "new",
        company_id: company.id,
        company_name: company.name,
        company_context: company.context?.slice(0, 600) || null,
        scan_category: label,
        fit: opp.fit ?? null,
        opportunity: opp,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[emos] scan signal insert failed:", error.message);
      out.push({ signal_id: null, save_error: true, ...summaryOf });
    } else {
      out.push({ signal_id: row.id, already_saved: false, ...summaryOf });
    }
  }
  return out;
}

export async function getRun(actor: Actor, args: Args): Promise<EmosResult> {
  if (!isUuid(args.run_id)) return notFound("run");
  const db = actor.db();
  const { data: run, error } = await db
    .from("mcp_runs")
    .select("id, tool, status, args, result, error, created_at, finished_at")
    .eq("org_id", actor.orgId)
    .eq("id", args.run_id)
    .maybeSingle();
  if (error) throw new Error(`Could not read the run: ${error.message}`);
  if (!run) return notFound("run");

  let status = String(run.status);
  let message = (run.error as string | null) ?? null;
  if (status === "running" && Date.now() - new Date(String(run.created_at)).getTime() > RUN_STALE_MS) {
    // The function that owned this run is gone. Close it once (the status
    // guard makes this single-shot) and hand the allowance unit back.
    const { data: closed } = await db
      .from("mcp_runs")
      .update({ status: "failed", error: "The run timed out. It was not counted against the allowance.", finished_at: new Date().toISOString() })
      .eq("org_id", actor.orgId)
      .eq("id", run.id)
      .eq("status", "running")
      .select("id");
    if (closed?.length && run.tool === "scan_signals") await releaseUsageForOrg(actor.orgId, "scan", 1);
    status = "failed";
    message = "The run timed out. It was not counted against the allowance.";
  }

  if (status === "running") {
    const secs = Math.round((Date.now() - new Date(String(run.created_at)).getTime()) / 1000);
    return { text: `Still running (${secs}s so far). Check again in about 15 seconds.`, data: { run_id: run.id, tool: run.tool, status } };
  }
  if (status === "failed") return fail(message ?? "The run failed.", { run_id: run.id, tool: run.tool, status });

  const result = (run.result ?? {}) as { signals?: Row[]; partial?: boolean; notes?: string[]; tailored?: boolean; tailoring_problem?: string; cost?: Row };
  const signals = result.signals ?? [];
  const top = signals.slice(0, 3).map((s) => `${String(s.headline)} (${String(s.score)})`).join("; ");
  const n = `${signals.length} signal${signals.length === 1 ? "" : "s"}`;
  const head = result.tailoring_problem
    ? `Scan done, but NOT tailored to the company. ${result.tailoring_problem} ${n} from the standard beat ${signals.length === 1 ? "was" : "were"} saved to SignalIQ. ` +
      "This scan was not counted against the allowance; run it again for a tailored one (signals already saved are reused, not duplicated)."
    : `Scan done: ${n} saved to SignalIQ${result.partial ? " (one or more sources failed, so this is partial)" : ""}.`;
  const dollars = typeof result.cost?.ai_cost_usd === "number" ? ` AI cost of this scan: $${(result.cost.ai_cost_usd as number).toFixed(3)}.` : "";
  return {
    text:
      head +
      (top ? ` Top: ${top}.` : "") +
      " A signal is a lead on thin coverage, not a prediction that a story will break." +
      dollars,
    data: { run_id: run.id, tool: run.tool, status, started_at: run.created_at, finished_at: run.finished_at, ...result, _untrusted: ["signals[].headline", "signals[].topic", "notes"] },
  };
}

// ─── build_asset_pack ────────────────────────────────────────────────────────

export async function buildAssetPack(actor: Actor, args: Args): Promise<EmosResult> {
  const company = await loadCompany(actor, args.company_id);
  if (!company) return notFound("company");
  const signal = await ownedRow(actor, "signaliq_signals", args.signal_id, "id, headline, scan_category, opportunity");
  if (!signal) return notFound("signal");
  const opp = coerceOpportunity(signal.opportunity);
  if (!opp) {
    return fail(
      "This signal was saved without its scan data (saved before 6 Oct 2026), so a pack cannot be built from it. Run scan_signals again and use a signal from that run.",
    );
  }

  const seat = await reserveUsageForActor(actor, "pack", 1, { confirmLarge: bool(args.confirm_large_run) });
  if (!seat.ok) return refusal(seat);

  const brief = await approvedBrief(actor, company.id);
  const ctx = usageCtx(actor);
  const result = await withAiUsage(ctx, () => runPackRequest(opp, companyContext(company), brief));
  if (!result.ok) {
    await seat.release();
    return fail(`${scrubAiError(result.error)} It was not counted against the allowance.`);
  }
  const pack: AssetPack = { ...result.pack, usage: { remaining: seat.remaining ?? 999, tier: "email" } };

  // Same saver as the dashboard route, on this actor's RLS client.
  const savedId = await saveAssetPackForUser(actor.userId, pack, opp, {
    companyId: company.id,
    beatLabel: (signal.scan_category as string | null) ?? null,
    signalId: String(signal.id),
    db: actor.db(),
  });

  return {
    text:
      `Pack built for "${cut(pack.headline ?? opp.headline, 120)}"${savedId ? " and saved to SignalIQ" : " (but it could NOT be saved; copy it now)"}. ` +
      `Journalist names in a pack are leads to verify, not confirmed contacts. Anything it says about the sender must match the saved company context; check before using it. ${costText(actor, seat.costLine, ctx.tally)}`,
    data: {
      pack_id: savedId,
      signal_id: signal.id,
      company_id: company.id,
      headline: pack.headline ?? null,
      pitch_angle: pack.angle ?? null,
      subject_line: pack.subjectLine ?? null,
      story_brief: pack.brief ?? null,
      linkable_asset_idea: pack.linkableAssetIdea ?? null,
      journalist_leads: pack.journalists ?? [],
      cautions: pack.cautions ?? [],
      sources: pack.sources ?? [],
      remaining: seat.remaining,
      cost: costData(actor, seat.usage, ctx.tally),
      _untrusted: ["sources", "journalist_leads"],
    },
  };
}

// ─── find_journalists ────────────────────────────────────────────────────────

/** How long to wait for byline checks before returning the rest as "pending". */
const VERIFY_WAIT_MS = 100_000;

function candidateOut(c: Row): Row {
  const v = (c.verification ?? null) as Row | null;
  return {
    name: c.name ?? null,
    outlet_domain: c.url ?? null,
    stated_outlet: c.statedOutlet ?? null,
    beat: c.beat ?? null,
    why: c.why ?? null,
    recent_article: c.linkPage || null,
    public_contact: c.contact ?? null,
    profile_url: c.contactLinkedIn || null,
    tier: c.tier ?? null,
    verification: v
      ? { status: v.status, byline_url: v.bylineUrl ?? null, byline_title: v.bylineTitle ?? null, byline_date: v.bylineDate ?? null, note: v.note ?? null, checked_at: v.checkedAt ?? null }
      : { status: "pending" },
  };
}

export async function findJournalists(actor: Actor, args: Args): Promise<EmosResult> {
  const startedAt = Date.now();
  const company = await loadCompany(actor, args.company_id);
  if (!company) return notFound("company");

  let signal: Row | null = null;
  if (args.signal_id !== undefined && args.signal_id !== null && args.signal_id !== "") {
    signal = await ownedRow(actor, "signaliq_signals", args.signal_id, "id, headline, summary, scan_category, topic:opportunity->>topic");
    if (!signal) return notFound("signal");
  }
  const beat = str(args.beat, 200) ?? (signal ? str(signal.topic, 200) ?? str(signal.scan_category, 200) : null);
  const story = str(args.story, 500) ?? (signal ? str(signal.headline, 500) : null);
  if (!beat) return fail("Give a `signal_id`, or a `beat` (the topic the journalists should cover).");

  // Leave out people already saved (and, on "more", the ones already shown).
  const { data: savedRows } = await actor.db().from("journalists").select("name").eq("org_id", actor.orgId).limit(500);
  const shown = Array.isArray(args.exclude_names) ? (args.exclude_names as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const exclude = [...((savedRows ?? []) as unknown as Row[]).map((r) => String(r.name)), ...shown].slice(0, 500);

  const data: Record<string, unknown> = {
    biz: company.name,
    domain: company.website ?? "",
    desc: company.context ?? "",
    industry: beat,
    audDesc: story ?? "",
    audType: str(args.tier, 60) ?? "",
    geo: str(args.geography, 200) ?? "",
    strategy: str(args.offering, 60) ?? "",
    signalContext: signal ? `${String(signal.headline)}. ${String(signal.summary ?? "")}`.slice(0, 700) : undefined,
    companyContext: company.context ?? undefined,
    exclude,
  };
  const brief = await approvedBrief(actor, company.id);
  const ctx = usageCtx(actor);
  const deadlineMs = startedAt + VERIFY_WAIT_MS;

  const finish = (checked: NonNullable<Awaited<ReturnType<typeof verifyCandidates>>>, extra: Row, costLine: string): EmosResult => {
    waitUntil(checked.inFlight); // late checks still reach the shared cache
    const list = (parseCandidateArray(checked.result) ?? []).filter((x): x is Row => !!x && typeof x === "object").map(candidateOut);
    const s = checked.stats;
    return {
      text:
        `${list.length} candidate${list.length === 1 ? "" : "s"}: ${s.verified} with a verified recent byline, ${s.unverified} not confirmed, ${s.pending + s.stale} still to check. ` +
        `Nothing is saved yet (add_journalist saves the ones worth keeping), and only "verified" names may be presented as people who cover this beat. No email addresses are returned; EMOS never guesses one. ${costLine}`,
      data: { company_id: company.id, signal_id: signal?.id ?? null, beat, candidates: list, verify_stats: s, ...extra, ms: Date.now() - startedAt, _untrusted: ["candidates[].why", "candidates[].verification.byline_title", "candidates[].verification.note"] },
    };
  };

  // "More": the next people from the stored outlet rosters. Free, as in the dashboard.
  if (bool(args.more)) {
    const roster = await withAiUsage(ctx, () => buildRosterList(data, brief, { exclude, more: true })).catch(() => null);
    if (!roster || roster.candidates.length === 0) {
      return { text: "No more names are available from the outlet rosters for this market. Cost: nothing used.", data: { candidates: [], more_available: 0 } };
    }
    const checked = await withAiUsage(ctx, () => verifyCandidates(JSON.stringify(roster.candidates), { deadlineMs, beat }));
    if (!checked) return fail("Could not load more names. Please retry.");
    return finish(checked, { list_source: `roster:${roster.market}`, more_available: roster.remaining, skipped_already_saved: roster.skipped }, "Cost: nothing used (more names from the roster are free).");
  }

  const seat = await reserveUsageForActor(actor, "journalist-search", 1, { confirmLarge: bool(args.confirm_large_run) });
  if (!seat.ok) return refusal(seat);

  // Same order as the dashboard route: outlet roster, then live search, then the model's list.
  let listSource = "memory";
  let listJson: string | null = null;
  let moreAvailable = 0;
  let skipped = 0;

  const roster = await withAiUsage(ctx, () => buildRosterList(data, brief, { exclude })).catch((e) => {
    console.warn("[emos] roster list failed:", e);
    return null;
  });
  if (roster && roster.candidates.length > 0) {
    listJson = JSON.stringify(roster.candidates);
    listSource = `roster:${roster.market}`;
    moreAvailable = roster.remaining;
    skipped = roster.skipped;
  }

  if (!listJson && process.env.JOURNO_DISCOVERY !== "off") {
    const found = await withAiUsage(ctx, () => discoverJournalists(data, brief));
    if (found.ok && found.candidates.length > 0) {
      listJson = JSON.stringify(found.candidates);
      listSource = "search";
    } else if (Date.now() - startedAt > 60_000) {
      await seat.release();
      return fail("The live journalist search took too long. This search was not counted; please retry.");
    } else {
      console.warn(`[emos] discovery failed (${found.error}); falling back to the memory list`);
    }
  }

  if (!listJson) {
    const run = await withAiUsage(ctx, () => runJournoAI("partner-suggestions", data, brief));
    if (!run.ok) {
      await seat.release();
      return fail(`${scrubAiError(run.error)} This search was not counted.`);
    }
    listJson = run.result;
  }

  const checked = await withAiUsage(ctx, () => verifyCandidates(listJson!, { deadlineMs, beat }));
  if (!checked) {
    await seat.release();
    return fail("The journalist list came back unreadable. This search was not counted; please retry.");
  }
  return finish(
    checked,
    {
      list_source: listSource, more_available: moreAvailable, skipped_already_saved: skipped, remaining: seat.remaining,
      // Byline checks still running when this returns are not in the dollar figure yet.
      cost: costData(actor, seat.usage, ctx.tally),
    },
    costText(actor, seat.costLine, ctx.tally),
  );
}

// ─── score_pitch ─────────────────────────────────────────────────────────────

export async function scorePitch(actor: Actor, args: Args): Promise<EmosResult> {
  const company = await loadCompany(actor, args.company_id);
  if (!company) return notFound("company");

  // Ids are checked up front: a wrong one is an error here, never a silent drop.
  let journalistId: string | null = null;
  if (args.journalist_id !== undefined && args.journalist_id !== null && args.journalist_id !== "") {
    const j = await ownedRow(actor, "journalists", args.journalist_id);
    if (!j) return notFound("journalist");
    journalistId = String(j.id);
  }
  let assetId: string | null = null;
  if (args.asset_id !== undefined && args.asset_id !== null && args.asset_id !== "") {
    const a = await ownedRow(actor, "linkable_assets", args.asset_id);
    if (!a) return notFound("asset");
    assetId = String(a.id);
  }

  const query = typeof args.journalist_query === "string" && args.journalist_query.trim() ? args.journalist_query : undefined;
  const parsed = parsePitchInput(
    {
      pitch: args.pitch,
      subject: args.subject,
      query,
      platform: typeof args.platform === "string" ? args.platform : "direct",
      pitchMode: query ? "query" : "standalone",
      brandSignals: args.brand_signals,
    },
    { forceStore: true },
  );
  if (!parsed.ok) return fail(parsed.error);

  const seat = await reserveUsageForActor(actor, "score", 1, { confirmLarge: bool(args.confirm_large_run) });
  if (!seat.ok) return refusal(seat);

  const ctx = usageCtx(actor);
  const run = await withAiUsage(ctx, () => runScoreRequest(parsed.input, { remaining: seat.remaining ?? 999, tier: "email" }));
  if (!run.ok) {
    await seat.release();
    return fail(`${scrubAiError(run.error)} It was not counted against the allowance.`);
  }
  const r = run.result;

  // Same writer as the dashboard route (Score History reads this row), on the RLS client.
  const scoreId = await logPitch(parsed.input, r, actor.userId, { journalistId, assetId, companyId: company.id }, { db: actor.db() });

  return {
    text:
      `PressIQ score ${r.composite}/100 (${r.tier.label})${scoreId ? ", saved to Score History" : " (but it could NOT be saved)"}. ` +
      (r.topFixes?.length ? `Top fix: ${cut(r.topFixes[0].text, 200)} ` : "") +
      costText(actor, seat.costLine, ctx.tally),
    data: {
      score_id: scoreId,
      company_id: company.id,
      journalist_id: journalistId,
      asset_id: assetId,
      composite: r.composite,
      tier: r.tier,
      relevance_assessed: r.relevanceAssessed,
      radar: r.radar,
      top_fixes: r.topFixes,
      strongest_line: r.strongestLine ?? null,
      authenticity_risk: r.authenticityRisk ?? null,
      areas: r.areas,
      remaining: seat.remaining,
      cost: costData(actor, seat.usage, ctx.tally),
    },
  };
}

// ─── draft_pitch ─────────────────────────────────────────────────────────────

export async function draftPitch(actor: Actor, args: Args): Promise<EmosResult> {
  const company = await loadCompany(actor, args.company_id);
  if (!company) return notFound("company");

  const ids = (Array.isArray(args.journalist_ids) ? args.journalist_ids : args.journalist_id !== undefined ? [args.journalist_id] : [])
    .filter(isUuid)
    .slice(0, MAX_DRAFT_BATCH);
  if (ids.length === 0) return fail(`Give 1 to ${MAX_DRAFT_BATCH} saved journalist ids in \`journalist_ids\`.`);

  const db = actor.db();
  const { data: jRows, error: jErr } = await db
    .from("journalists")
    .select("id, name, outlet, beat, notes, recent_work")
    .eq("org_id", actor.orgId)
    .in("id", ids);
  if (jErr) throw new Error(`Could not read journalists: ${jErr.message}`);
  const byId = new Map(((jRows ?? []) as unknown as Row[]).map((r) => [String(r.id), r]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) return fail(`${missing.length} of those journalist ids ${missing.length === 1 ? "is" : "are"} not in this account. Nothing was drafted.`, { not_found: missing });

  let asset: Row | null = null;
  if (args.asset_id !== undefined && args.asset_id !== null && args.asset_id !== "") {
    asset = await ownedRow(actor, "linkable_assets", args.asset_id, "id, title, description, published_url");
    if (!asset) return notFound("asset");
  }
  let angle = typeof args.angle === "string" && args.angle.trim() ? args.angle.trim().slice(0, 2000) : null;
  // Where the angle came from. The caller's `angle` is the user's own words. A
  // pack's angle was written by an AI: the drafter is told to take the story
  // from it and nothing about the sender (2026-10-07; a pack once carried an
  // invented credential straight into a draft).
  let angleSource: "caller" | "pack" | null = angle ? "caller" : null;
  if (args.pack_id !== undefined && args.pack_id !== null && args.pack_id !== "") {
    const pack = await ownedRow(actor, "signaliq_asset_packs", args.pack_id, "id, pitch_angle, headline");
    if (!pack) return notFound("pack");
    if (!angle) {
      angle = [pack.headline, pack.pitch_angle].filter(Boolean).join("\n").slice(0, 2000) || null;
      if (angle) angleSource = "pack";
    }
  }

  // The signature is built from the company's saved sender. A missing name or
  // title becomes a visible [placeholder] in the draft, so say so up front.
  const missingSender = [
    company.spokesperson_name?.trim() ? null : "sender name",
    company.spokesperson_title?.trim() ? null : "sender title",
  ].filter((x): x is string => !!x);

  const brief: DraftBrief = {
    companyName: company.name,
    companyContext: company.context || "",
    companyWebsite: company.website,
    senderName: company.spokesperson_name,
    senderTitle: company.spokesperson_title,
    senderEmail: company.spokesperson_email,
    senderLinkedIn: company.spokesperson_linkedin,
    assetTitle: (asset?.title as string | null) ?? null,
    assetDescription: (asset?.description as string | null) ?? null,
    assetUrl: (asset?.published_url as string | null) ?? null,
    angle,
    angleIsAiSuggested: angleSource === "pack",
    companyBrief: await approvedBrief(actor, company.id),
  };
  const targets: DraftTarget[] = ids.map((id) => {
    const r = byId.get(id)!;
    return {
      id,
      name: String(r.name),
      outlet: (r.outlet as string | null) ?? null,
      beat: (r.beat as string | null) ?? null,
      fitNote: (r.notes as string | null) ?? null,
      recentWork: (r.recent_work as string | null) ?? null,
    };
  });

  // One unit per journalist, reserved up front; failed drafts are handed back.
  const seat = await reserveUsageForActor(actor, "draft", targets.length, { confirmLarge: bool(args.confirm_large_run) });
  if (!seat.ok) return refusal(seat);

  const ctx = usageCtx(actor);
  const drafts = await withAiUsage(ctx, () => draftPitches(brief, targets));
  const good = drafts.filter((d) => !d.error && d.subject && d.body);
  const failed = drafts.length - good.length;
  if (failed > 0) await seat.release(failed);

  let saved: Row[] = [];
  if (good.length > 0) {
    const { data, error } = await db
      .from("pitch_drafts")
      .insert(
        good.map((d) => ({
          org_id: actor.orgId,
          journalist_id: d.journalistId,
          journalist_name: d.journalistName,
          company_id: company.id,
          asset_id: (asset?.id as string | undefined) ?? null,
          subject: d.subject,
          body: d.body,
          angle,
          status: "draft" as const,
        })),
      )
      .select("id, journalist_id");
    if (error) console.error("[emos] draft save failed:", error.message);
    else saved = (data ?? []) as unknown as Row[];
  }
  const draftIdFor = new Map(saved.map((r) => [String(r.journalist_id), String(r.id)]));

  const unit = good.length === 1 ? "draft" : "drafts";
  const line = costText(actor, seat.costLine, ctx.tally);
  const cost = failed > 0 ? `${line} ${failed} failed and ${failed === 1 ? "was" : "were"} handed back.` : line;
  const signatureNote = missingSender.length
    ? ` The signature has a [placeholder] for the ${missingSender.join(" and ")}: ${company.name} has none saved. Add it to the company in the EMOS dashboard, or fill it in before sending.`
    : "";
  const angleNote = angleSource === "pack" ? " The angle came from an AI-written pack: check every claim about the sender against the company context before sending." : "";
  return {
    text:
      `${good.length} ${unit} written${saved.length === good.length ? " and saved to PressIQ Drafts" : " (some could NOT be saved; copy them now)"}. ` +
      `Nothing was sent: the user sends from their own inbox.${signatureNote}${angleNote} ${cost}`,
    data: {
      company_id: company.id,
      angle_source: angleSource,
      signature_complete: missingSender.length === 0,
      missing_sender_fields: missingSender,
      drafts: drafts.map((d) => ({
        draft_id: draftIdFor.get(d.journalistId) ?? null,
        journalist_id: d.journalistId,
        journalist_name: d.journalistName,
        subject: d.subject || null,
        body: d.body || null,
        error: d.error ?? null,
      })),
      remaining: seat.remaining,
      cost: costData(actor, seat.usage, ctx.tally, failed),
    },
  };
}

import "server-only";
import type { Actor } from "@/lib/emos/actor";
import { cut, isUuid, loadCompany, ownedRow, str, type Args, type Row } from "@/lib/emos/shared";
import {
  alreadyRecorded, answer, applyDashboardWrite, cleanKey, dayAtNoon, newId, NOTE_MAX, planned, readDay, refuse,
  type PlanOp, type PlanOutcome,
} from "@/lib/emos/write-core";
import { domainFromInput, getDomainRating } from "@/lib/ahrefs-dr";
import { checkPlacementUrl } from "@/lib/emos/placement-check";
import { recordStageEventFor } from "@/lib/emos-stage-events";
import type { ContentType, LinkType, Stage } from "@/lib/coverageiq/types";

/**
 * EMOS — the outcome ledger (spec v1.3 §3, Tier W). Session 3, 2026-10-07.
 *
 * What happened to a pitch: it was SENT, the journalist REPLIED (or did not),
 * it was PLACED. Before this file nothing in the codebase wrote
 * `sent_date`, `placed_date` or a row in `journalist_interactions`; the
 * dashboard's stage buttons changed `stage` and nothing else.
 *
 * ONE SET OF FUNCTIONS FOR BOTH DOORS. Each plan* function reads through the
 * actor's row-level-security client and returns a plan of row operations:
 *
 *   AI door     runWriteTool() previews it, then commits it with a token
 *   dashboard   movePitchStage() applies it at once (a person pressed a button)
 *
 * Either way the rows are written by the same Postgres function, so a pitch
 * marked sent by the AI and one marked sent by a click are the same rows in
 * the same shape. Two doors, one filing cabinet.
 *
 * What each outcome writes:
 *   sent       pitch: stage "sent" + sent_date · interaction "pitched" (journalist: pitches_sent +1, last_contact)
 *   replied    pitch: stage "replied"         · interaction "replied" or "rejected" (journalist: last_contact)
 *   no reply   pitch: unchanged               · interaction "no_response"
 *   placed     pitch: stage "placed" + placed_date + URL, DR, link and content type · interaction "placed" (journalist: placements +1)
 * The journalist counters are moved by the sync_journalist_stats trigger; each
 * plan "watches" the journalist row so that undo can put it back.
 */

export const LEDGER_TOOLS = {
  sent: "log_pitch_sent",
  reply: "log_reply",
  placement: "record_placement",
  undo: "undo_last_write",
} as const;

export interface LedgerOpts {
  door: "mcp" | "dashboard";
  /** Dashboard only: a person picked this stage, so set it even when that moves the pitch backwards. */
  forceStage?: boolean;
}

const AI: LedgerOpts = { door: "mcp" };

const STAGES: Stage[] = ["drafted", "sent", "opened", "replied", "placed", "amplified"];
const rank = (s: unknown): number => STAGES.indexOf(s as Stage);
const has = (v: unknown): boolean => v !== undefined && v !== null && v !== "";

const PITCH_COLS = "id, subject, stage, sent_date, placed_date, placement_url, journalist_id, company_id, updated_at";
const JOURNALIST_COLS = "id, name, outlet, email";
const FREE_MAIL = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "protonmail.com", "me.com", "live.com", "aol.com"]);

const subjectOf = (p: Row): string => `"${cut(p.subject, 80) ?? "untitled pitch"}"`;
const who = (j: Row | null): string => (j ? ` to ${String(j.name)}${j.outlet ? ` (${String(j.outlet)})` : ""}` : "");

/** The journalist's outlet site: the outlet field when it is a domain, else a work email's domain. */
function outletDomainOf(j: Row | null): string | null {
  if (!j) return null;
  const fromOutlet = domainFromInput(j.outlet as string | null);
  if (fromOutlet) return fromOutlet;
  const email = typeof j.email === "string" ? j.email : "";
  const domain = email.includes("@") ? email.slice(email.lastIndexOf("@") + 1).toLowerCase() : "";
  return domain && !FREE_MAIL.has(domain) ? domainFromInput(domain) : null;
}

async function hasInteraction(actor: Actor, pitchId: string, type: string): Promise<boolean> {
  const { data, error } = await actor
    .db()
    .from("journalist_interactions")
    .select("id")
    .eq("org_id", actor.orgId)
    .eq("pitch_id", pitchId)
    .eq("interaction_type", type)
    .limit(1);
  if (error) throw new Error(`Could not read the interaction log: ${error.message}`);
  return (data ?? []).length > 0;
}

function repeatAnswer(hit: { auditId: string; committedAt: string | null; result: { text?: string; data?: Row } | null }): PlanOutcome {
  return answer({
    text: `Already recorded${hit.committedAt ? ` on ${hit.committedAt.slice(0, 10)}` : ""} under this idempotency_key; nothing new was written. ${hit.result?.text ?? ""}`.trim(),
    data: { status: "already_recorded", audit_id: hit.auditId, ...(hit.result?.data ?? {}) },
  });
}

// ─── SENT ────────────────────────────────────────────────────────────────────

export async function planPitchSent(actor: Actor, args: Args, opts: LedgerOpts = AI): Promise<PlanOutcome> {
  const givenDate = has(args.sent_date);
  const day = readDay(args.sent_date);
  if (!day) return refuse("`sent_date` must be a real date that is not in the future, for example 2026-10-07. Nothing was recorded.");
  const note = str(args.note, NOTE_MAX);
  const key = cleanKey(args.idempotency_key);
  if (key) {
    const hit = (await alreadyRecorded(actor, LEDGER_TOOLS.sent, [key])).get(key);
    if (hit) return repeatAnswer(hit);
  }

  let pitch: Row | null = null;
  if (has(args.pitch_id)) {
    pitch = await ownedRow(actor, "coverageiq_pitches", args.pitch_id, PITCH_COLS);
    if (!pitch) return refuse("No pitch with that id in this account.");
  }

  let journalist: Row | null = null;
  if (has(args.journalist_id)) {
    journalist = await ownedRow(actor, "journalists", args.journalist_id, JOURNALIST_COLS);
    if (!journalist) return refuse("No journalist with that id in this account.");
    if (pitch?.journalist_id && pitch.journalist_id !== journalist.id) {
      return refuse("That pitch is already linked to a different journalist. Nothing was recorded.");
    }
  } else if (pitch?.journalist_id) {
    journalist = await ownedRow(actor, "journalists", pitch.journalist_id, JOURNALIST_COLS);
  }

  let company: Row | null = null;
  let matched = false;
  if (!pitch) {
    // A pitch drafted outside EMOS: the caller says who, for which company, and the subject.
    const co = await loadCompany(actor, args.company_id);
    const subject = str(args.subject, 300);
    if (!journalist || !co || !subject) {
      if (has(args.company_id) && !co) return refuse("No company with that id in this account.");
      return refuse(
        "Give a pitch_id (from list_pitches), or journalist_id + company_id + subject to add a pitch that was written outside EMOS. Nothing was recorded.",
      );
    }
    company = co as unknown as Row;
    // If that pitch is already tracked for this journalist and company, mark that row instead of adding a twin.
    const { data: twins } = await actor
      .db()
      .from("coverageiq_pitches")
      .select(PITCH_COLS)
      .eq("org_id", actor.orgId)
      .eq("journalist_id", journalist.id)
      .eq("company_id", co.id)
      .order("created_at", { ascending: false })
      .limit(50);
    const norm = (v: unknown): string => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    const twin = ((twins ?? []) as unknown as Row[]).find((t) => norm(t.subject) === norm(subject));
    if (twin) {
      pitch = twin;
      matched = true;
    } else {
      const pitchId = newId();
      const plan: PlanOp[] = [
        {
          op: "insert",
          table: "coverageiq_pitches",
          id: pitchId,
          values: {
            subject,
            journalist_id: journalist.id,
            company_id: co.id,
            client: co.name,
            stage: "sent",
            sent_date: day,
            peso_type: "Earned",
            data_source: opts.door === "mcp" ? "mcp" : "manual",
            body: typeof args.body === "string" && args.body.trim() ? args.body.trim().slice(0, 8000) : null,
          },
        },
        { op: "watch", table: "journalists", id: String(journalist.id) },
        {
          op: "insert",
          table: "journalist_interactions",
          id: newId(),
          values: { journalist_id: journalist.id, pitch_id: pitchId, interaction_type: "pitched", notes: note, occurred_at: dayAtNoon(day) },
        },
      ];
      const warnings = await recentPitchWarnings(actor, journalist, company, null, day);
      return planned({
        args: { journalist_id: journalist.id, company_id: co.id, subject, sent_date: day, note, idempotency_key: key },
        plan,
        preview: `Will add a new pitch "${cut(subject, 80)}"${who(journalist)} for ${co.name} to the ledger, marked SENT on ${day}.`,
        result: {
          text: `Pitch "${cut(subject, 80)}"${who(journalist)} added to the ledger and marked sent on ${day}.`,
          data: { pitch_id: pitchId, journalist_id: journalist.id, company_id: co.id, stage: "sent", sent_date: day, created: true },
        },
        keys: key ? [key] : [],
        warnings: key || opts.door !== "mcp" ? warnings : [...warnings, NO_KEY],
        untrusted: [],
      });
    }
  }

  // An existing pitch.
  if (!company && pitch.company_id) company = await ownedRow(actor, "companies", pitch.company_id, "id, name");
  const values: Row = {};
  const warnings: string[] = [];
  if (opts.forceStage ? pitch.stage !== "sent" : rank(pitch.stage) < rank("sent")) values.stage = "sent";
  if (!pitch.sent_date) values.sent_date = day;
  else if (givenDate && pitch.sent_date !== day) warnings.push(`This pitch already has a sent date (${String(pitch.sent_date)}); it was kept.`);
  if (journalist && !pitch.journalist_id) values.journalist_id = journalist.id;
  const sentOn = String(pitch.sent_date ?? day);

  const plan: PlanOp[] = [];
  if (Object.keys(values).length) {
    plan.push({ op: "update", table: "coverageiq_pitches", id: String(pitch.id), values, expect_updated_at: (pitch.updated_at as string | null) ?? null });
  }
  if (journalist && !(await hasInteraction(actor, String(pitch.id), "pitched"))) {
    plan.push({ op: "watch", table: "journalists", id: String(journalist.id) });
    plan.push({
      op: "insert",
      table: "journalist_interactions",
      id: newId(),
      values: { journalist_id: journalist.id, pitch_id: pitch.id, interaction_type: "pitched", notes: note, occurred_at: dayAtNoon(sentOn) },
    });
  }
  const stageAfter = (values.stage as string | undefined) ?? String(pitch.stage);
  const data: Row = {
    pitch_id: pitch.id, journalist_id: journalist?.id ?? null, company_id: pitch.company_id ?? null,
    stage: stageAfter, sent_date: sentOn, created: false,
  };
  if (plan.length === 0) {
    return answer({ text: `${subjectOf(pitch)}${who(journalist)} is already marked sent on ${sentOn}. Nothing to change.`, data: { status: "nothing_to_do", ...data } });
  }
  if (company && journalist) warnings.push(...(await recentPitchWarnings(actor, journalist, company, String(pitch.id), sentOn)));
  if (!journalist) warnings.push("This pitch has no journalist attached, so only the pitch row changes; no contact is logged against anyone.");
  if (!key && opts.door === "mcp") warnings.push(NO_KEY);

  return planned({
    args: { pitch_id: pitch.id, journalist_id: journalist?.id ?? null, sent_date: sentOn, note, idempotency_key: key },
    plan,
    preview:
      `Will mark pitch ${subjectOf(pitch)}${who(journalist)} as SENT on ${sentOn}. Currently: ${String(pitch.stage)}${pitch.sent_date ? `, sent ${String(pitch.sent_date)}` : ""}.` +
      (matched ? " (This is the pitch already tracked with that subject for this journalist and company.)" : ""),
    result: { text: `Pitch ${subjectOf(pitch)}${who(journalist)} is marked sent on ${sentOn}.`, data },
    keys: key ? [key] : [],
    warnings,
  });
}

const NO_KEY =
  "No idempotency_key was given, so running this again would record it twice. Pass the email's message id as idempotency_key when you have one.";

/** The duplicate-pitch warning (spec §3): the same journalist pitched for the same company in the 30 days before. */
async function recentPitchWarnings(actor: Actor, journalist: Row, company: Row, exceptPitchId: string | null, day: string): Promise<string[]> {
  const since = new Date(new Date(`${day}T00:00:00Z`).getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  let q = actor
    .db()
    .from("coverageiq_pitches")
    .select("id, subject, sent_date")
    .eq("org_id", actor.orgId)
    .eq("journalist_id", journalist.id)
    .eq("company_id", company.id)
    .gte("sent_date", since)
    .order("sent_date", { ascending: false })
    .limit(3);
  if (exceptPitchId) q = q.neq("id", exceptPitchId);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Row[];
  if (rows.length === 0) return [];
  const last = rows[0];
  return [
    `${String(journalist.name)} was already pitched for ${String(company.name)} on ${String(last.sent_date)} (${subjectOf(last)})` +
      `${rows.length > 1 ? `, and ${rows.length - 1} more time${rows.length > 2 ? "s" : ""} in the last 30 days` : ""}. Make sure this is not a duplicate.`,
  ];
}

export async function afterPitchSent(actor: Actor, data: Row): Promise<void> {
  if (data.created === true) await recordStageEventFor(actor.userId, "pitch_logged");
}

// ─── REPLIED / NO RESPONSE ───────────────────────────────────────────────────

const OUTCOMES = ["replied", "rejected", "no_response"] as const;
type Outcome = (typeof OUTCOMES)[number];
const OUTCOME_WORDS: Record<Outcome, string> = { replied: "REPLIED", rejected: "REPLIED (declined)", no_response: "NO RESPONSE" };
const MAX_REPLY_ITEMS = 50;

export async function planReplies(actor: Actor, args: Args, opts: LedgerOpts = AI): Promise<PlanOutcome> {
  const raw: unknown[] = Array.isArray(args.items) ? args.items : has(args.pitch_id) ? [args] : [];
  if (raw.length === 0) {
    return refuse("Give `items` (1 to 50), each with a pitch_id and an outcome: replied, rejected or no_response. Nothing was recorded.");
  }
  if (raw.length > MAX_REPLY_ITEMS) return refuse(`That is ${raw.length} items; the limit is ${MAX_REPLY_ITEMS} per call. Nothing was recorded.`);

  const items: { pitchId: string; outcome: Outcome; note: string | null; day: string; key: string | null }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const it = (raw[i] && typeof raw[i] === "object" ? raw[i] : {}) as Row;
    if (!isUuid(it.pitch_id)) return refuse(`items[${i}] has no valid pitch_id. Nothing was recorded.`);
    const outcome = (str(it.outcome, 20) ?? "replied").toLowerCase() as Outcome;
    if (!OUTCOMES.includes(outcome)) return refuse(`items[${i}].outcome must be replied, rejected or no_response. Nothing was recorded.`);
    const day = readDay(it.date ?? it.replied_at);
    if (!day) return refuse(`items[${i}].date must be a real date that is not in the future. Nothing was recorded.`);
    const key = cleanKey(it.idempotency_key);
    if (key && items.some((x) => x.key === key)) return refuse(`The idempotency_key "${cut(key, 40)}" appears twice in this call. Nothing was recorded.`);
    items.push({ pitchId: it.pitch_id, outcome, note: str(it.note, NOTE_MAX), day, key });
  }

  const seen = await alreadyRecorded(actor, LEDGER_TOOLS.reply, items.map((x) => x.key).filter((k): k is string => !!k));

  const db = actor.db();
  const pitchIds = Array.from(new Set(items.map((x) => x.pitchId)));
  const { data: pitchRows, error } = await db.from("coverageiq_pitches").select(PITCH_COLS).eq("org_id", actor.orgId).in("id", pitchIds);
  if (error) throw new Error(`Could not read pitches: ${error.message}`);
  const pitches = new Map(((pitchRows ?? []) as unknown as Row[]).map((p) => [String(p.id), p]));
  const missing = pitchIds.filter((id) => !pitches.has(id));
  if (missing.length) {
    return refuse(`${missing.length} of those pitch ids ${missing.length === 1 ? "is" : "are"} not in this account. Nothing was recorded.`, { not_found: missing });
  }
  const journalistIds = Array.from(new Set([...pitches.values()].map((p) => p.journalist_id).filter(Boolean).map(String)));
  const journalists = new Map<string, Row>();
  if (journalistIds.length) {
    const { data: jRows } = await db.from("journalists").select(JOURNALIST_COLS).eq("org_id", actor.orgId).in("id", journalistIds);
    for (const j of (jRows ?? []) as unknown as Row[]) journalists.set(String(j.id), j);
  }

  const plan: PlanOp[] = [];
  const lines: string[] = [];
  const out: Row[] = [];
  const keys: string[] = [];
  const stageNow = new Map<string, string>([...pitches].map(([id, p]) => [id, String(p.stage)]));
  const stageTouched = new Set<string>();
  let missingKeys = 0;

  for (const it of items) {
    const pitch = pitches.get(it.pitchId)!;
    const j = pitch.journalist_id ? journalists.get(String(pitch.journalist_id)) ?? null : null;
    const row: Row = { pitch_id: it.pitchId, subject: cut(pitch.subject, 120), journalist: j?.name ?? null, outcome: it.outcome, date: it.day, note: it.note };

    if (it.key && seen.has(it.key)) {
      out.push({ ...row, status: "skipped", reason: "already logged under this idempotency_key" });
      continue;
    }

    let wrote = false;
    let stageChange = "";
    if (it.outcome !== "no_response") {
      const cur = stageNow.get(it.pitchId)!;
      if (opts.forceStage ? cur !== "replied" : rank(cur) < rank("replied")) {
        plan.push({
          op: "update",
          table: "coverageiq_pitches",
          id: it.pitchId,
          values: { stage: "replied" },
          ...(stageTouched.has(it.pitchId) ? {} : { expect_updated_at: (pitch.updated_at as string | null) ?? null }),
        });
        stageTouched.add(it.pitchId);
        stageNow.set(it.pitchId, "replied");
        stageChange = `, stage ${cur} to replied`;
        wrote = true;
      }
    }
    // The dashboard button has no message id to dedupe on, so it logs one reply per pitch.
    const logIt = j && !(opts.door === "dashboard" && (await hasInteraction(actor, it.pitchId, it.outcome)));
    if (logIt) {
      plan.push({ op: "watch", table: "journalists", id: String(j.id) });
      plan.push({
        op: "insert",
        table: "journalist_interactions",
        id: newId(),
        values: { journalist_id: j.id, pitch_id: it.pitchId, interaction_type: it.outcome, notes: it.note, occurred_at: dayAtNoon(it.day) },
      });
      wrote = true;
    }
    if (!wrote) {
      out.push({ ...row, status: "skipped", reason: j ? "nothing to change" : "this pitch has no journalist attached, so there is no one to log it against" });
      continue;
    }
    if (it.key) keys.push(it.key);
    else missingKeys++;
    out.push({ ...row, status: "will_log", stage_after: stageNow.get(it.pitchId) });
    lines.push(`${subjectOf(pitch)}${j ? ` from ${String(j.name)}` : ""}: ${OUTCOME_WORDS[it.outcome]} on ${it.day}${stageChange}`);
  }

  const logged = out.filter((o) => o.status === "will_log").length;
  const skipped = out.length - logged;
  const data: Row = { items: out, logged, skipped };
  if (plan.length === 0) {
    return answer({
      text: `Nothing to record: ${skipped === 1 ? "that item was" : `all ${skipped} items were`} already logged or changed nothing.`,
      data: { status: "nothing_to_do", ...data, _untrusted: ["items[].note", "items[].subject"] },
    });
  }
  const shown = lines.slice(0, 12).join("; ");
  const warnings: string[] = [];
  if (missingKeys && opts.door === "mcp") warnings.push(missingKeys === lines.length ? NO_KEY : `${missingKeys} of these have no idempotency_key; running the sweep again would log those twice.`);

  return planned({
    args: { items: items.map((x) => ({ pitch_id: x.pitchId, outcome: x.outcome, date: x.day, note: x.note, idempotency_key: x.key })) },
    plan,
    preview:
      `Will log ${logged} ${logged === 1 ? "outcome" : "outcomes"}: ${shown}${lines.length > 12 ? `; and ${lines.length - 12} more (all listed in planned.items)` : ""}.` +
      (skipped ? ` ${skipped} skipped (already logged, or nothing to change).` : ""),
    result: {
      text: `${logged} ${logged === 1 ? "outcome" : "outcomes"} logged in the ledger${skipped ? `, ${skipped} skipped` : ""}.`,
      data: { ...data, items: out.map((o) => (o.status === "will_log" ? { ...o, status: "logged" } : o)) },
    },
    keys,
    warnings,
    untrusted: ["items[].note", "items[].subject"],
  });
}

// ─── PLACED ──────────────────────────────────────────────────────────────────

const LINK_TYPES: LinkType[] = ["Do Follow", "No Follow", "N/A"];
const CONTENT_TYPES: ContentType[] = ["Original", "Republished"];

export async function planPlacement(actor: Actor, args: Args, opts: LedgerOpts = AI): Promise<PlanOutcome> {
  const pitch = await ownedRow(actor, "coverageiq_pitches", args.pitch_id, PITCH_COLS);
  if (!pitch) return refuse("No pitch with that id in this account.");
  const givenDate = has(args.placed_date);
  const day = readDay(args.placed_date);
  if (!day) return refuse("`placed_date` must be a real date that is not in the future, for example 2026-10-07. Nothing was recorded.");
  const key = cleanKey(args.idempotency_key);
  if (key) {
    const hit = (await alreadyRecorded(actor, LEDGER_TOOLS.placement, [key])).get(key);
    if (hit) return repeatAnswer(hit);
  }

  const journalist = pitch.journalist_id ? await ownedRow(actor, "journalists", pitch.journalist_id, JOURNALIST_COLS) : null;
  const company = pitch.company_id ? await ownedRow(actor, "companies", pitch.company_id, "id, name, website") : null;

  const values: Row = {};
  const warnings: string[] = [];
  let check: Awaited<ReturnType<typeof checkPlacementUrl>> | null = null;
  let url: string | null = null;

  if (opts.door === "mcp") {
    // The AI door must bring the page, and the server checks it (spec §3).
    url = str(args.placement_url, 600);
    if (!url) return refuse("Give the placement_url: the full address of the published page. Nothing was recorded.");
    if (!company) {
      return refuse("This pitch is not linked to a company, so the page cannot be checked against anything. Set the company on the pitch in the dashboard, then record the placement again.");
    }
    check = await checkPlacementUrl(url, {
      companyDomain: domainFromInput(company.website as string | null),
      outletDomain: outletDomainOf(journalist),
      companyName: String(company.name),
      journalistName: journalist ? String(journalist.name) : null,
    });
    const facts = { placement_domain: check.placementDomain, on_journalists_outlet: check.outletMatches, links_to_company: check.linksToCompany, page_read: check.fetched, http_status: check.httpStatus };
    if (!check.ok) return refuse(`Placement refused. ${check.reason}`, { placement_check: facts });

    if (has(args.link_type)) {
      const lt = LINK_TYPES.find((x) => x.toLowerCase() === String(args.link_type).trim().toLowerCase());
      if (!lt) return refuse("`link_type` must be Do Follow, No Follow or N/A. Nothing was recorded.");
      if (lt !== "N/A" && check.linksToCompany === false) warnings.push(`You said the link is "${lt}", but no link to the company was found on the page. Check before relying on it.`);
      values.link_type = lt;
    } else if (check.linksToCompany === false) {
      values.link_type = "N/A";
    }
    if (has(args.content_type)) {
      const ct = CONTENT_TYPES.find((x) => x.toLowerCase() === String(args.content_type).trim().toLowerCase());
      if (!ct) return refuse("`content_type` must be Original or Republished. Nothing was recorded.");
      values.content_type = ct;
    }
    const anchor = str(args.anchor_text, 200);
    if (anchor) values.anchor_text = anchor;
    if (pitch.placement_url && String(pitch.placement_url) !== url) {
      warnings.push(`This pitch already has a placement URL (${cut(pitch.placement_url, 120)}); it will be replaced.`);
    }
    if (String(pitch.placement_url ?? "") !== url) values.placement_url = url;
    // The placement's own Domain Rating, for that one domain (cached; null when Ahrefs has nothing).
    const dr = await getDomainRating(url).catch(() => null);
    if (dr != null) values.domain_rating = dr;
  }

  const newlyPlaced = opts.forceStage ? pitch.stage !== "placed" : rank(pitch.stage) < rank("placed");
  if (newlyPlaced) values.stage = "placed";
  if (!pitch.placed_date || (givenDate && pitch.placed_date !== day)) values.placed_date = day;
  const placedOn = String(values.placed_date ?? pitch.placed_date ?? day);

  const plan: PlanOp[] = [];
  const changed = Object.keys(values).filter((k) => values[k] !== (pitch as Row)[k]);
  if (changed.length) {
    plan.push({ op: "update", table: "coverageiq_pitches", id: String(pitch.id), values, expect_updated_at: (pitch.updated_at as string | null) ?? null });
  }
  if (journalist && !(await hasInteraction(actor, String(pitch.id), "placed"))) {
    plan.push({ op: "watch", table: "journalists", id: String(journalist.id) });
    plan.push({
      op: "insert",
      table: "journalist_interactions",
      id: newId(),
      values: { journalist_id: journalist.id, pitch_id: pitch.id, interaction_type: "placed", notes: url, occurred_at: dayAtNoon(placedOn) },
    });
  }
  if (newlyPlaced && plan.length) {
    // Moving to "placed" bumps links_earned on any linked asset (a trigger). Watch them so undo restores the count.
    const { data: links } = await actor.db().from("pitch_assets").select("asset_id").eq("org_id", actor.orgId).eq("pitch_id", pitch.id).limit(20);
    for (const l of (links ?? []) as unknown as Row[]) if (isUuid(l.asset_id)) plan.unshift({ op: "watch", table: "linkable_assets", id: l.asset_id });
  }

  const stageAfter = (values.stage as string | undefined) ?? String(pitch.stage);
  const finalUrl = url ?? ((pitch.placement_url as string | null) ?? null);
  const data: Row = {
    pitch_id: pitch.id, journalist_id: journalist?.id ?? null, company_id: pitch.company_id ?? null,
    stage: stageAfter, placement_url: finalUrl, placed_date: placedOn,
    domain_rating: (values.domain_rating as number | undefined) ?? null,
    link_type: (values.link_type as string | undefined) ?? null,
    content_type: (values.content_type as string | undefined) ?? null,
    newly_placed: newlyPlaced,
    ...(check ? { placement_check: { on_journalists_outlet: check.outletMatches, links_to_company: check.linksToCompany, page_read: check.fetched } } : {}),
  };
  if (plan.length === 0) {
    return answer({ text: `${subjectOf(pitch)} is already recorded as placed on ${placedOn}${finalUrl ? ` at ${finalUrl}` : ""}. Nothing to change.`, data: { status: "nothing_to_do", ...data } });
  }
  if (!journalist) warnings.push("This pitch has no journalist attached, so no placement is counted against anyone.");
  if (!key && opts.door === "mcp") warnings.push(NO_KEY);

  return planned({
    args: { pitch_id: pitch.id, placement_url: url, placed_date: placedOn, link_type: values.link_type ?? null, content_type: values.content_type ?? null, idempotency_key: key },
    plan,
    preview:
      `Will record a PLACEMENT for pitch ${subjectOf(pitch)}${who(journalist)}: ${finalUrl ?? "no URL"}, placed on ${placedOn}` +
      `${values.domain_rating != null ? `, Domain Rating ${String(values.domain_rating)}` : ""}. Currently: ${String(pitch.stage)}.` +
      (check ? ` Check: ${check.reason}` : ""),
    result: {
      text: `Placement recorded for ${subjectOf(pitch)}${finalUrl ? `: ${finalUrl}` : ""}, placed on ${placedOn}.${check ? ` ${check.reason}` : ""}`,
      data,
    },
    keys: key ? [key] : [],
    warnings,
    untrusted: [],
  });
}

export async function afterPlacement(actor: Actor, data: Row): Promise<void> {
  if (data.newly_placed === true) await recordStageEventFor(actor.userId, "placement_confirmed");
}

// ─── UNDO ────────────────────────────────────────────────────────────────────

const UNDO_DAYS = 7;

/** Reverse this actor's most recent write made through the AI door. One step, within 7 days. */
export async function planUndo(actor: Actor): Promise<PlanOutcome> {
  const { data, error } = await actor
    .db()
    .from("mcp_audit_log")
    .select("id, tool, state, result, committed_at")
    .eq("org_id", actor.orgId)
    .eq("actor_user_id", actor.userId)
    .eq("via", "mcp_oauth")
    .neq("tool", LEDGER_TOOLS.undo)
    .in("state", ["committed", "undone"])
    .order("committed_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`Could not read the write log: ${error.message}`);
  const last = ((data ?? []) as unknown as Row[])[0];
  if (!last) return refuse("There is nothing to undo: no write has been recorded through the AI door on this account.");
  const what = ((last.result ?? {}) as { text?: string }).text ?? `${String(last.tool)} write`;
  const when = String(last.committed_at ?? "");
  if (last.state === "undone") {
    return refuse(`The most recent write (${String(last.tool)}, ${when.slice(0, 16).replace("T", " ")} UTC) has already been undone. Undo goes back one step only.`);
  }
  if (Date.now() - new Date(when).getTime() > UNDO_DAYS * 86_400_000) {
    return refuse(`The most recent write (${String(last.tool)}, ${when.slice(0, 10)}) is more than ${UNDO_DAYS} days old and can no longer be undone here. Change it in the dashboard.`);
  }
  return planned({
    args: { undo_of: last.id, tool: last.tool },
    plan: [],
    preview:
      `Will UNDO the most recent write (${String(last.tool)}, ${when.slice(0, 16).replace("T", " ")} UTC): "${cut(what, 240)}". ` +
      "Rows it created are removed and rows it changed go back to how they were. If any of those rows has been edited since, the undo is refused.",
    result: { text: `Undone: ${cut(what, 240)}`, data: { undone_audit_id: last.id, undone_tool: last.tool } },
    keys: [],
    warnings: [],
    undoOf: String(last.id),
  });
}

// ─── The dashboard's stage buttons ───────────────────────────────────────────

export interface StageMove {
  ok: boolean;
  /** True when the ledger functions could not run and the caller should fall back to a plain stage update. */
  fallback?: boolean;
  error?: string;
  newlyPlaced?: boolean;
}

/**
 * A person pressed a stage button on a pitch in CoverageIQ. Sent, Replied and
 * Placed go through the same plan functions as the AI door, so the click now
 * also fills sent_date / placed_date and logs the contact against the
 * journalist. The other stages (drafted, opened, amplified) are a plain stage
 * change, recorded in the same audit table.
 */
export async function movePitchStage(actor: Actor, pitchId: string, stage: Stage): Promise<StageMove> {
  if (!isUuid(pitchId) || rank(stage) < 0) return { ok: false, error: "Not a valid pitch or stage." };
  const opts: LedgerOpts = { door: "dashboard", forceStage: true };

  let tool: string;
  let outcome: PlanOutcome;
  if (stage === "sent") {
    tool = LEDGER_TOOLS.sent;
    outcome = await planPitchSent(actor, { pitch_id: pitchId }, opts);
  } else if (stage === "replied") {
    tool = LEDGER_TOOLS.reply;
    outcome = await planReplies(actor, { items: [{ pitch_id: pitchId, outcome: "replied" }] }, opts);
  } else if (stage === "placed") {
    tool = LEDGER_TOOLS.placement;
    outcome = await planPlacement(actor, { pitch_id: pitchId }, opts);
  } else {
    tool = "set_stage";
    const pitch = await ownedRow(actor, "coverageiq_pitches", pitchId, PITCH_COLS);
    if (!pitch) return { ok: false, error: "No pitch with that id in this account." };
    if (pitch.stage === stage) return { ok: true };
    outcome = planned({
      args: { pitch_id: pitchId, stage },
      plan: [{ op: "update", table: "coverageiq_pitches", id: pitchId, values: { stage }, expect_updated_at: (pitch.updated_at as string | null) ?? null }],
      preview: "",
      result: { text: "", data: {} },
      keys: [],
      warnings: [],
    });
  }

  if (outcome.kind === "result") {
    // "Nothing to change" is fine; a refusal is not.
    return outcome.result.isError ? { ok: false, error: outcome.result.text } : { ok: true };
  }
  const applied = await applyDashboardWrite(actor, tool, outcome.write);
  if (!applied.ok) {
    console.error(`[emos] dashboard ${tool} failed for pitch ${pitchId}:`, applied.error);
    return { ok: false, fallback: true, error: applied.error };
  }
  return { ok: true, newlyPlaced: outcome.write.result.data.newly_placed === true };
}

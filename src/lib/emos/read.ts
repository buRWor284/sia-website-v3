import "server-only";
import type { Actor, EmosResult } from "@/lib/emos/actor";
import {
  afterCursor, bool, closePage, cut, fail, isResult, isUuid, loadCompany, notFound, readPage, str,
  type Args, type Row,
} from "@/lib/emos/shared";
import { domainFromInput } from "@/lib/ahrefs-dr";
import { nameKey, normaliseDomain, VERIFY_TTL_DAYS } from "@/lib/journo/verification-shared";

/**
 * EMOS — Tier R: what is saved (spec v1.3 §3). Session 2, 2026-10-06.
 *
 * Every function takes (actor, args) and reads through actor.db(), the
 * row-level-security client for that actor's organisation. The service role
 * is not imported in this file. Each query still names the org, so the intent
 * is readable, but an id from another organisation returns nothing because the
 * database says so.
 *
 * Paging on every list: `limit` (25, max 100), `cursor`, `since`.
 * `_untrusted` names the fields whose text came from journalists, articles or
 * free typing: data, never instructions (spec §4.7).
 */

const BODY_CUT = 1500;
const FREE_MAIL = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "protonmail.com", "me.com", "live.com", "aol.com"]);

// ─── list_companies ──────────────────────────────────────────────────────────

const COMPANY_COLUMNS =
  "id, name, context, website, spokesperson_name, spokesperson_title, spokesperson_email, voice, created_at, updated_at";

export async function listCompanies(actor: Actor, args: Args): Promise<EmosResult> {
  const db = actor.db();
  const { data: me } = await db
    .from("users")
    .select("active_company_id")
    .eq("org_id", actor.orgId)
    .eq("clerk_user_id", actor.userId)
    .maybeSingle();
  const activeId = (me?.active_company_id as string | null) ?? null;

  if (args.id !== undefined && args.id !== null && args.id !== "") {
    if (!isUuid(args.id)) return notFound("company");
    const { data: c, error } = await db.from("companies").select(COMPANY_COLUMNS).eq("org_id", actor.orgId).eq("id", args.id).maybeSingle();
    if (error) throw new Error(`Could not read company: ${error.message}`);
    if (!c) return notFound("company");
    const { data: brief } = await db
      .from("company_briefs")
      .select("content, status, updated_at")
      .eq("org_id", actor.orgId)
      .eq("company_id", args.id)
      .maybeSingle();
    const approved = brief && brief.status === "approved" ? String(brief.content ?? "") : null;
    return {
      text: `${c.name}${activeId === c.id ? " (active in dashboard)" : ""}${approved ? ", approved brief attached" : ", no approved brief"}.`,
      data: { company: { ...c, active: activeId === c.id }, brief: approved, brief_status: brief?.status ?? null, _untrusted: ["company.context", "brief"] },
    };
  }

  const { data, error } = await db.from("companies").select(COMPANY_COLUMNS).eq("org_id", actor.orgId).order("name", { ascending: true });
  if (error) throw new Error(`Could not list companies: ${error.message}`);
  const companies = ((data ?? []) as unknown as Row[]).map((c) => ({ ...c, active: c.id === activeId }));
  const names = companies.map((c) => `${String((c as Row).name)}${c.active ? " (active)" : ""}`).join(", ");
  return {
    text: companies.length
      ? `${companies.length} compan${companies.length === 1 ? "y" : "ies"}: ${names}.`
      : "No companies yet. Add one in the EMOS dashboard first.",
    data: { companies, _untrusted: ["companies[].context"] },
  };
}

// ─── list_journalists ────────────────────────────────────────────────────────

const JOURNALIST_COLUMNS =
  "id, name, outlet, beat, email, twitter_handle, linkedin_url, domain_rating, notes, tags, last_contact, pitches_sent, placements, data_source, recent_work, contact_hint, created_at";

/** Best available outlet domain: the outlet field when it is a domain, else a
 * work email's domain. Null rather than a guess. */
function outletDomainOf(j: Row): string | null {
  const fromOutlet = domainFromInput(j.outlet as string | null);
  if (fromOutlet && fromOutlet.includes(".")) return fromOutlet;
  const email = typeof j.email === "string" ? j.email : "";
  const at = email.lastIndexOf("@");
  if (at > 0) {
    const d = normaliseDomain(email.slice(at + 1));
    if (d && !FREE_MAIL.has(d)) return d;
  }
  return null;
}

export async function listJournalists(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  const db = actor.db();

  // company_id: journalists saved FOR that company (journalist_context).
  let onlyIds: string[] | null = null;
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    const { data: ctx, error } = await db
      .from("journalist_context")
      .select("journalist_id")
      .eq("org_id", actor.orgId)
      .eq("company_id", company.id)
      .limit(2000);
    if (error) throw new Error(`Could not read journalist context: ${error.message}`);
    onlyIds = Array.from(new Set(((ctx ?? []) as unknown as Row[]).map((r) => String(r.journalist_id))));
    if (onlyIds.length === 0) {
      return { text: `No journalists saved for ${company.name} yet.`, data: { journalists: [], next_cursor: null } };
    }
  }

  let q = db.from("journalists").select(JOURNALIST_COLUMNS).eq("org_id", actor.orgId);
  if (args.id !== undefined && args.id !== null && args.id !== "") {
    if (!isUuid(args.id)) return notFound("journalist");
    q = q.eq("id", args.id);
  }
  if (onlyIds) q = q.in("id", onlyIds);
  const name = str(args.q, 80);
  if (name) q = q.ilike("name", `%${name.replace(/[%_\\,()]/g, " ")}%`);
  if (bool(args.has_email)) q = q.not("email", "is", null).neq("email", "");
  if (page.since) q = q.gte("created_at", page.since);
  if (page.cursor) q = q.or(afterCursor("created_at", page.cursor));

  const { data, error } = await q
    .order("created_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(page.limit + 1);
  if (error) throw new Error(`Could not list journalists: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "created_at");
  if (args.id && rows.length === 0) return notFound("journalist");
  if (rows.length === 0) return { text: "No journalists match.", data: { journalists: [], next_cursor: null } };

  const ids = rows.map((r) => String(r.id));

  // WHY each one was saved: newest context row per journalist.
  const { data: ctxRows } = await db
    .from("journalist_context")
    .select("journalist_id, company_id, asset_id, angle, strategy, fit_note, geography, created_at")
    .eq("org_id", actor.orgId)
    .in("journalist_id", ids)
    .order("created_at", { ascending: false });
  const latestCtx = new Map<string, Row>();
  for (const c of (ctxRows ?? []) as unknown as Row[]) {
    const jid = String(c.journalist_id);
    if (!latestCtx.has(jid)) latestCtx.set(jid, c);
  }

  // Byline checks. journalist_verifications is a shared cache of public facts
  // (name + outlet + a public article URL), not tenant data; it has no org_id.
  const keys = Array.from(new Set(rows.map((r) => nameKey(String(r.name ?? ""))).filter(Boolean)));
  const checks = new Map<string, Row>();
  if (keys.length) {
    const { data: vRows } = await db
      .from("journalist_verifications")
      .select("name_key, outlet_domain, byline_domain, verified, byline_url, byline_title, byline_date, checked_at")
      .in("name_key", keys)
      .order("checked_at", { ascending: false })
      .limit(1000);
    for (const v of (vRows ?? []) as unknown as Row[]) {
      const k = `${String(v.name_key)}|${String(v.outlet_domain)}`;
      if (!checks.has(k)) checks.set(k, v);
      const anyKey = `${String(v.name_key)}|*`;
      if (!checks.has(anyKey)) checks.set(anyKey, v);
    }
  }
  const staleBefore = Date.now() - VERIFY_TTL_DAYS * 86_400_000;

  const journalists = rows.map((j) => {
    const domain = outletDomainOf(j);
    const key = nameKey(String(j.name ?? ""));
    // With a known outlet domain only a check AT that outlet counts. Without
    // one, the newest check for the name is shown and says which outlet it was for.
    const v = domain ? checks.get(`${key}|${domain}`) : checks.get(`${key}|*`);
    const c = latestCtx.get(String(j.id));
    return {
      id: j.id,
      name: j.name,
      outlet: j.outlet ?? null,
      outlet_domain: domain ?? (v ? (v.byline_domain as string | null) ?? (v.outlet_domain as string | null) : null),
      email: j.email || null,
      beat: j.beat ?? null,
      domain_rating: j.domain_rating ?? null,
      verification: v
        ? {
            status: v.verified ? "verified" : "unverified",
            checked_outlet: v.outlet_domain,
            byline_url: v.byline_url ?? null,
            byline_title: v.byline_title ?? null,
            byline_date: v.byline_date ?? null,
            checked_at: v.checked_at,
            stale: new Date(String(v.checked_at)).getTime() < staleBefore,
          }
        : { status: "not_checked" },
      last_contact: j.last_contact ?? null,
      pitches_sent: j.pitches_sent ?? 0,
      placements: j.placements ?? 0,
      twitter_handle: j.twitter_handle ?? null,
      linkedin_url: j.linkedin_url ?? null,
      // 2026-10-08: where to look for an email, from the contact-page check at save.
      contact_hint: j.email ? null : (j.contact_hint ?? null),
      tags: j.tags ?? [],
      saved_for: c
        ? { company_id: c.company_id ?? null, asset_id: c.asset_id ?? null, angle: cut(c.angle, 600), strategy: c.strategy ?? null, geography: c.geography ?? null, fit_note: cut(c.fit_note, 600) }
        : null,
      notes: cut(j.notes, 600),
      recent_work: cut(j.recent_work, 800),
      data_source: j.data_source ?? null,
      created_at: j.created_at ?? null,
    };
  });

  const withEmail = journalists.filter((j) => j.email).length;
  const verified = journalists.filter((j) => j.verification.status === "verified").length;
  return {
    text:
      `${journalists.length} journalist${journalists.length === 1 ? "" : "s"}${next_cursor ? " on this page (more available)" : ""}: ` +
      `${withEmail} with an email saved, ${verified} with a verified byline. ` +
      (withEmail < journalists.length ? "An empty email means none is saved in EMOS; never guess one." : ""),
    data: {
      journalists,
      next_cursor,
      _untrusted: ["journalists[].notes", "journalists[].recent_work", "journalists[].saved_for.fit_note", "journalists[].saved_for.angle", "journalists[].verification.byline_title"],
    },
  };
}

// ─── list_signals ────────────────────────────────────────────────────────────

const SIGNAL_COLUMNS =
  "id, headline, summary, source, source_url, signal_score, coverage_gap, status, detected_at, company_id, company_name, scan_category, fit, opportunity_id:opportunity->>id, topic:opportunity->>topic, band:opportunity->>bandLabel";
const PACK_COLUMNS =
  "id, signal_id, company_id, headline, beat_label, pitch_angle, story_brief, subject_line, linkable_asset_idea, journalist_recs, cautions, sources, created_at";

export async function listSignals(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  const db = actor.db();

  let q = db.from("signaliq_signals").select(SIGNAL_COLUMNS).eq("org_id", actor.orgId);
  if (args.id !== undefined && args.id !== null && args.id !== "") {
    if (!isUuid(args.id)) return notFound("signal");
    q = q.eq("id", args.id);
  }
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    // Signals saved before 6 Oct 2026 carry the company by NAME only.
    const quoted = `"${company.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    q = q.or(`company_id.eq.${company.id},and(company_id.is.null,company_name.eq.${quoted})`);
  }
  const status = str(args.status, 20);
  if (status) {
    if (!["new", "saved", "pitched", "archived"].includes(status)) return fail("`status` must be one of: new, saved, pitched, archived.");
    q = q.eq("status", status);
  }
  if (page.since) q = q.gte("detected_at", page.since);
  if (page.cursor) q = q.or(afterCursor("detected_at", page.cursor));

  const { data, error } = await q.order("detected_at", { ascending: false }).order("id", { ascending: false }).limit(page.limit + 1);
  if (error) throw new Error(`Could not list signals: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "detected_at");
  if (args.id && rows.length === 0) return notFound("signal");

  const packs = new Map<string, Row>();
  if (bool(args.include_pack) && rows.length) {
    const { data: packRows } = await db
      .from("signaliq_asset_packs")
      .select(PACK_COLUMNS)
      .eq("org_id", actor.orgId)
      .in("signal_id", rows.map((r) => String(r.id)))
      .order("created_at", { ascending: false });
    for (const p of (packRows ?? []) as unknown as Row[]) {
      const sid = String(p.signal_id);
      if (!packs.has(sid)) packs.set(sid, p);
    }
  }

  const signals = rows.map((s) => {
    const { opportunity_id, ...rest } = s;
    return {
      ...rest,
      // A pack can be built only when the full scan data was kept with the signal.
      can_build_pack: !!opportunity_id,
      ...(bool(args.include_pack) ? { latest_pack: packs.get(String(s.id)) ?? null } : {}),
    };
  });
  return {
    text: signals.length
      ? `${signals.length} signal${signals.length === 1 ? "" : "s"}${next_cursor ? " on this page (more available)" : ""}. A signal is a lead on thin coverage, not a prediction that a story will break.`
      : "No saved signals match.",
    data: { signals, next_cursor, _untrusted: ["signals[].headline", "signals[].summary", "signals[].latest_pack"] },
  };
}

// ─── list_assets ─────────────────────────────────────────────────────────────

const ASSET_COLUMNS =
  "id, asset_type, title, description, target_keyword, status, published_url, links_earned, signal_id, signal_headline, company_id, ai_brief, ai_brief_generated_at, created_at, updated_at";

export async function listAssets(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  let q = actor.db().from("linkable_assets").select(ASSET_COLUMNS).eq("org_id", actor.orgId);
  const one = args.id !== undefined && args.id !== null && args.id !== "";
  if (one) {
    if (!isUuid(args.id)) return notFound("asset");
    q = q.eq("id", args.id);
  }
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    q = q.eq("company_id", company.id);
  }
  const status = str(args.status, 20);
  if (status) q = q.eq("status", status);
  if (page.since) q = q.gte("created_at", page.since);
  if (page.cursor) q = q.or(afterCursor("created_at", page.cursor));

  const { data, error } = await q.order("created_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false }).limit(page.limit + 1);
  if (error) throw new Error(`Could not list assets: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "created_at");
  if (one && rows.length === 0) return notFound("asset");
  const assets = rows.map((a) => ({ ...a, ai_brief: one || bool(args.full) ? a.ai_brief ?? null : cut(a.ai_brief, BODY_CUT) }));
  return {
    text: assets.length ? `${assets.length} linkable asset${assets.length === 1 ? "" : "s"}${next_cursor ? " on this page (more available)" : ""}.` : "No linkable assets match.",
    data: { assets, next_cursor, _untrusted: ["assets[].description", "assets[].ai_brief"] },
  };
}

// ─── list_scores ─────────────────────────────────────────────────────────────

const SCORE_LIST_COLUMNS =
  "id, composite_score, tier, layer1_score, layer2_score, layer3_score, authenticity_risk, platform, outcome, scored_at, journalist_id, asset_id, company_id, subject:input_snapshot->>subject, pitch_text, radar_axes, top_fixes";
const SCORE_ONE_COLUMNS = `${SCORE_LIST_COLUMNS}, journalist_query, dimension_breakdown`;

export async function listScores(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  const one = args.id !== undefined && args.id !== null && args.id !== "";
  let q = actor.db().from("pressiq_scores").select(one ? SCORE_ONE_COLUMNS : SCORE_LIST_COLUMNS).eq("org_id", actor.orgId);
  if (one) {
    if (!isUuid(args.id)) return notFound("score");
    q = q.eq("id", args.id);
  }
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    q = q.eq("company_id", company.id);
  }
  if (args.journalist_id !== undefined && args.journalist_id !== null && args.journalist_id !== "") {
    if (!isUuid(args.journalist_id)) return notFound("journalist");
    q = q.eq("journalist_id", args.journalist_id);
  }
  if (page.since) q = q.gte("scored_at", page.since);
  if (page.cursor) q = q.or(afterCursor("scored_at", page.cursor));

  const { data, error } = await q.order("scored_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false }).limit(page.limit + 1);
  if (error) throw new Error(`Could not list scores: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "scored_at");
  if (one && rows.length === 0) return notFound("score");

  const scores = rows.map((s) => {
    const { pitch_text, ...rest } = s;
    return one
      ? { ...rest, pitch_text: pitch_text ?? null }
      : { ...rest, pitch_excerpt: cut(pitch_text, 300) };
  });
  return {
    text: scores.length
      ? `${scores.length} PressIQ score${scores.length === 1 ? "" : "s"}${next_cursor ? " on this page (more available)" : ""}. Pass \`id\` for one score with its full rubric.`
      : "No PressIQ scores match.",
    data: { scores, next_cursor, _untrusted: ["scores[].pitch_text", "scores[].pitch_excerpt", "scores[].journalist_query", "scores[].subject"] },
  };
}

// ─── list_pitch_drafts ───────────────────────────────────────────────────────

const DRAFT_COLUMNS =
  "id, journalist_id, journalist_name, company_id, asset_id, subject, body, angle, status, created_at, updated_at";

export async function listPitchDrafts(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  const one = args.id !== undefined && args.id !== null && args.id !== "";
  let q = actor.db().from("pitch_drafts").select(DRAFT_COLUMNS).eq("org_id", actor.orgId);
  if (one) {
    if (!isUuid(args.id)) return notFound("draft");
    q = q.eq("id", args.id);
  }
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    q = q.eq("company_id", company.id);
  }
  if (args.journalist_id !== undefined && args.journalist_id !== null && args.journalist_id !== "") {
    if (!isUuid(args.journalist_id)) return notFound("journalist");
    q = q.eq("journalist_id", args.journalist_id);
  }
  const status = str(args.status, 20);
  if (status) {
    if (!["draft", "sent", "discarded"].includes(status)) return fail("`status` must be one of: draft, sent, discarded.");
    q = q.eq("status", status);
  } else if (!one) {
    q = q.neq("status", "discarded");
  }
  if (page.since) q = q.gte("created_at", page.since);
  if (page.cursor) q = q.or(afterCursor("created_at", page.cursor));

  const { data, error } = await q.order("created_at", { ascending: false }).order("id", { ascending: false }).limit(page.limit + 1);
  if (error) throw new Error(`Could not list drafts: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "created_at");
  if (one && rows.length === 0) return notFound("draft");
  const full = one || bool(args.full);
  const drafts = rows.map((d) => {
    const body = typeof d.body === "string" ? d.body : "";
    return { ...d, body: full ? body : cut(body, BODY_CUT), body_truncated: !full && body.length > BODY_CUT };
  });
  return {
    text: drafts.length
      ? `${drafts.length} pitch draft${drafts.length === 1 ? "" : "s"}${next_cursor ? " on this page (more available)" : ""}. Drafts are never sent by EMOS.`
      : "No pitch drafts match.",
    data: { drafts, next_cursor, _untrusted: ["drafts[].angle"] },
  };
}

// ─── list_pitches (CoverageIQ ledger) ────────────────────────────────────────

const PITCH_COLUMNS = `
  id, subject, client, company_id, stage, peso_type, data_source, notes, body,
  sent_date, placed_date, follow_up_due, placement_url, anchor_text, domain_rating,
  link_type, content_type, journalist_id, signal_id, pressiq_score_id, est_monthly_traffic, created_at, updated_at,
  journalists ( name, outlet, email, domain_rating ),
  companies ( name )`;

export async function listPitches(actor: Actor, args: Args): Promise<EmosResult> {
  const page = readPage(args);
  if (isResult(page)) return page;
  const one = args.id !== undefined && args.id !== null && args.id !== "";
  let q = actor.db().from("coverageiq_pitches").select(PITCH_COLUMNS).eq("org_id", actor.orgId);
  if (one) {
    if (!isUuid(args.id)) return notFound("pitch");
    q = q.eq("id", args.id);
  }
  if (args.company_id !== undefined && args.company_id !== null && args.company_id !== "") {
    const company = await loadCompany(actor, args.company_id);
    if (!company) return notFound("company");
    q = q.eq("company_id", company.id);
  }
  if (args.journalist_id !== undefined && args.journalist_id !== null && args.journalist_id !== "") {
    if (!isUuid(args.journalist_id)) return notFound("journalist");
    q = q.eq("journalist_id", args.journalist_id);
  }
  const stage = str(args.stage, 20);
  if (stage) {
    if (!["drafted", "sent", "opened", "replied", "placed", "amplified"].includes(stage)) {
      return fail("`stage` must be one of: drafted, sent, opened, replied, placed, amplified.");
    }
    q = q.eq("stage", stage);
  }
  if (page.since) q = q.gte("created_at", page.since);
  if (page.cursor) q = q.or(afterCursor("created_at", page.cursor));

  const { data, error } = await q.order("created_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false }).limit(page.limit + 1);
  if (error) throw new Error(`Could not list pitches: ${error.message}`);
  const { rows, next_cursor } = closePage((data ?? []) as unknown as Row[], page.limit, "created_at");
  if (one && rows.length === 0) return notFound("pitch");

  const full = one || bool(args.full);
  const pitches = rows.map((p) => {
    const { journalists, companies, body, notes, ...rest } = p;
    const j = (Array.isArray(journalists) ? journalists[0] : journalists) as Row | null | undefined;
    const c = (Array.isArray(companies) ? companies[0] : companies) as Row | null | undefined;
    const text = typeof body === "string" ? body : "";
    return {
      ...rest,
      company_name: c?.name ?? null,
      journalist_name: j?.name ?? null,
      journalist_outlet: j?.outlet ?? null,
      journalist_outlet_domain: j ? outletDomainOf(j) : null,
      journalist_email: j?.email || null,
      journalist_domain_rating: j?.domain_rating ?? null,
      notes: cut(notes, 600),
      body: full ? text || null : cut(text, BODY_CUT),
      body_truncated: !full && text.length > BODY_CUT,
    };
  });
  const byStage = new Map<string, number>();
  for (const p of pitches) byStage.set(String((p as Row).stage), (byStage.get(String((p as Row).stage)) ?? 0) + 1);
  return {
    text: pitches.length
      ? `${pitches.length} pitch${pitches.length === 1 ? "" : "es"} in the ledger${next_cursor ? " on this page (more available)" : ""}: ${[...byStage].map(([s, n]) => `${n} ${s}`).join(", ")}.`
      : "No pitches in the ledger match.",
    data: { pitches, next_cursor, _untrusted: ["pitches[].notes", "pitches[].body", "pitches[].anchor_text"] },
  };
}

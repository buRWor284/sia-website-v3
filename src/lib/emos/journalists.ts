import "server-only";
import type { Actor } from "@/lib/emos/actor";
import { isUuid, loadCompany, ownedRow, str, type Args, type Row } from "@/lib/emos/shared";
import {
  answer, newId, NOTE_MAX, planned, refuse, sameSite,
  type PlanOp, type PlanOutcome,
} from "@/lib/emos/write-core";
import { domainFromInput, getDomainRatings } from "@/lib/ahrefs-dr";
import { beatToTags } from "@/lib/journo/beat-tags";
import { recordStageEventFor } from "@/lib/emos-stage-events";
import { checkContactPages, contactHintText, type ContactHint } from "@/lib/emos/contact-check";

/**
 * EMOS — add_journalist (spec v1.3 §3, Tier W). Session 3, 2026-10-07.
 *
 * Saves journalists into the same `journalists` table the dashboard's
 * JournoCollabIQ "Save" button writes, plus the same `journalist_context` row
 * that records WHY each one was saved (company, angle, fit note).
 *
 * The input is what find_journalists returns for a candidate (name,
 * outlet_domain, beat, why, recent_article, verification), plus the one thing
 * that tool never returns: an email. EMOS never guesses an email. One is saved
 * only when the caller passes it, and `email_source` says where it came from.
 *
 * Create only (edits happen in the dashboard), with one exception that the
 * reply sweep depends on: a journalist who is already saved WITHOUT an email
 * gets the email filled in. An email already on file is never overwritten.
 */

const MAX_BATCH = 10;
const EMAIL = /^[^\s@<>(),;:"]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const FREE_MAIL = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "protonmail.com", "me.com", "live.com", "aol.com"]);

const normName = (v: string): string => v.trim().toLowerCase().replace(/\s+/g, " ");

interface Candidate {
  name: string;
  outlet: string | null;
  outletDomain: string | null;
  beat: string | null;
  why: string | null;
  recentArticle: string | null;
  email: string | null;
  emailSource: string | null;
  linkedin: string | null;
  twitter: string | null;
  verification: { status: string | null; bylineUrl: string | null; bylineTitle: string | null; bylineDate: string | null; note: string | null };
}

function readCandidate(raw: unknown, i: number): Candidate | string {
  if (!raw || typeof raw !== "object") return `journalists[${i}] is not an object.`;
  const r = raw as Row;
  const name = str(r.name, 120);
  if (!name) return `journalists[${i}] has no name.`;

  const outlet = str(r.outlet_domain, 200) ?? str(r.stated_outlet, 200) ?? str(r.outlet, 200);
  const outletDomain = domainFromInput(str(r.outlet_domain, 200)) ?? domainFromInput(outlet);

  let email: string | null = null;
  if (r.email !== undefined && r.email !== null && r.email !== "") {
    const e = typeof r.email === "string" ? r.email.trim().toLowerCase() : "";
    if (!EMAIL.test(e) || e.length > 200) return `The email for ${name} ("${String(r.email).slice(0, 80)}") is not a valid address. Nothing was saved.`;
    email = e;
  }

  const profile = str(r.profile_url, 300) ?? str(r.linkedin_url, 300);
  const contact = str(r.public_contact, 120) ?? str(r.twitter_handle, 120);
  const v = (r.verification && typeof r.verification === "object" ? r.verification : {}) as Row;
  return {
    name,
    outlet,
    outletDomain,
    beat: str(r.beat, 300),
    why: str(r.why, NOTE_MAX),
    recentArticle: str(r.recent_article, 500),
    email,
    emailSource: str(r.email_source, 300),
    linkedin: profile && /linkedin\.com\//i.test(profile) ? profile : null,
    twitter: contact && contact.startsWith("@") ? contact.slice(0, 40) : null,
    verification: {
      status: str(v.status, 20),
      bylineUrl: str(v.byline_url, 500),
      bylineTitle: str(v.byline_title, 300),
      bylineDate: str(v.byline_date, 20),
      note: str(v.note, 300),
    },
  };
}

/** The notes line the dashboard's Save button writes, plus where the email came from. */
function notesFor(c: Candidate): string | null {
  const v = c.verification;
  const lines: string[] = [];
  if (c.why) lines.push(c.why);
  if (v.status === "verified") {
    if (v.bylineUrl) lines.push(`Byline: ${v.bylineUrl}${v.bylineDate ? ` (${v.bylineDate})` : ""}`);
  } else if (v.status === "stale") {
    lines.push(`Last seen writing for ${c.outlet ?? "this outlet"}${v.bylineDate ? ` on ${v.bylineDate}` : ""}${v.bylineUrl ? ` (${v.bylineUrl})` : ""}. May have moved; confirm before pitching.`);
  } else {
    lines.push(`Unverified: no recent byline confirmed under this name at ${c.outlet ?? "the outlet given"}${v.note ? ` (${v.note})` : ""}. Confirm on the outlet's site before pitching.`);
  }
  if (c.recentArticle && c.recentArticle !== v.bylineUrl) lines.push(`Recent article: ${c.recentArticle}`);
  if (c.email) lines.push(`Email source: ${c.emailSource ?? "given by the user"}`);
  return lines.join("\n\n").slice(0, 2000) || null;
}

function emailWarnings(c: Candidate): string[] {
  if (!c.email) return [];
  const domain = c.email.slice(c.email.lastIndexOf("@") + 1);
  if (FREE_MAIL.has(domain)) return [`${c.name}'s email is a personal address (${domain}); confirm it is the one they take pitches on.`];
  if (c.outletDomain && !sameSite(domain, c.outletDomain)) {
    return [`${c.name}'s email domain (${domain}) does not match the outlet (${c.outletDomain}); confirm it is theirs.`];
  }
  return [];
}

export async function planAddJournalists(actor: Actor, args: Args): Promise<PlanOutcome> {
  const company = await loadCompany(actor, args.company_id);
  if (!company) return refuse("No company with that id in this account.");

  const list = Array.isArray(args.journalists) ? args.journalists : [];
  if (list.length === 0) return refuse("Give 1 to 10 journalists in `journalists`, each with at least a name. Pass the candidates from find_journalists as they came back, adding `email` where you have one.");
  if (list.length > MAX_BATCH) return refuse(`That is ${list.length} journalists; the limit is ${MAX_BATCH} per call. Nothing was saved.`);

  const candidates: Candidate[] = [];
  for (let i = 0; i < list.length; i++) {
    const c = readCandidate(list[i], i);
    if (typeof c === "string") return refuse(c);
    if (candidates.some((x) => normName(x.name) === normName(c.name))) return refuse(`${c.name} appears twice in this call. Nothing was saved.`);
    candidates.push(c);
  }

  // The story these journalists are being saved for.
  let angle = str(args.angle, NOTE_MAX);
  if (args.signal_id !== undefined && args.signal_id !== null && args.signal_id !== "") {
    if (!isUuid(args.signal_id)) return refuse("No signal with that id in this account.");
    const signal = await ownedRow(actor, "signaliq_signals", args.signal_id, "id, headline");
    if (!signal) return refuse("No signal with that id in this account.");
    if (!angle) angle = str(signal.headline, NOTE_MAX);
  }
  const beatQuery = str(args.beat, 300);
  const geography = str(args.geography, 200);

  const db = actor.db();
  const { data: savedRows, error } = await db
    .from("journalists")
    .select("id, name, outlet, email, updated_at")
    .eq("org_id", actor.orgId)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(`Could not read saved journalists: ${error.message}`);
  const saved = (savedRows ?? []) as unknown as Row[];

  const ratings = await getDomainRatings(candidates.map((c) => c.outletDomain)).catch(() => new Map<string, number | null>());

  // 2026-10-08: for a new journalist with no email, look at the outlet's
  // contact pages once, in parallel, and keep what was seen as a hint.
  const isNew = (c: Candidate): boolean =>
    !saved.some((s) => normName(String(s.name ?? "")) === normName(c.name));
  const hints = new Map<string, ContactHint>();
  await Promise.all(
    candidates
      .filter((c) => !c.email && c.outletDomain && isNew(c))
      .map(async (c) => {
        const h = await checkContactPages(c.outletDomain!, c.name, c.verification.bylineUrl ?? c.recentArticle).catch(() => null);
        if (h) hints.set(normName(c.name), h);
      }),
  );

  const plan: PlanOp[] = [];
  const outcome: Row[] = [];
  const warnings: string[] = [];

  for (const c of candidates) {
    // Same person = same name and, when both sides have one, the same outlet site.
    const existing = saved.find((s) => {
      if (normName(String(s.name ?? "")) !== normName(c.name)) return false;
      const theirs = domainFromInput(s.outlet as string | null);
      return !theirs || !c.outletDomain || sameSite(theirs, c.outletDomain);
    });

    if (existing) {
      const id = String(existing.id);
      const hasEmail = typeof existing.email === "string" && existing.email.trim() !== "";
      if (c.email && !hasEmail) {
        plan.push({ op: "update", table: "journalists", id, values: { email: c.email }, expect_updated_at: (existing.updated_at as string | null) ?? null });
        outcome.push({ journalist_id: id, name: existing.name, outlet: existing.outlet ?? null, email: c.email, action: "email_added" });
        warnings.push(...emailWarnings(c));
      } else {
        if (c.email && hasEmail && String(existing.email).trim().toLowerCase() !== c.email) {
          warnings.push(`${c.name} already has a different email saved (${String(existing.email)}); it was left as it is. Change it in the dashboard if the new one is right.`);
        }
        outcome.push({ journalist_id: id, name: existing.name, outlet: existing.outlet ?? null, email: hasEmail ? existing.email : null, action: "already_saved" });
      }
      continue;
    }

    const id = newId();
    const dr = c.outletDomain ? ratings.get(c.outletDomain) ?? null : null;
    const v = c.verification;
    plan.push({
      op: "insert",
      table: "journalists",
      id,
      values: {
        name: c.name,
        outlet: c.outlet,
        beat: c.beat,
        email: c.email,
        twitter_handle: c.twitter,
        linkedin_url: c.linkedin,
        domain_rating: dr,
        notes: notesFor(c),
        tags: beatToTags(c.beat),
        // A verified byline title is "what they have been writing lately": draft_pitch bridges from it.
        recent_work: v.status === "verified" && v.bylineTitle ? `${v.bylineTitle}${v.bylineDate ? ` (${v.bylineDate})` : ""}`.slice(0, 600) : null,
        contact_hint: hints.get(normName(c.name)) ?? null,
        data_source: "mcp",
      },
    });
    plan.push({
      op: "insert",
      table: "journalist_context",
      id: newId(),
      values: { journalist_id: id, company_id: company.id, angle, beat_query: beatQuery ?? c.beat, geography, strategy: null, fit_note: c.why },
    });
    const hint = hints.get(normName(c.name)) ?? null;
    outcome.push({ journalist_id: id, name: c.name, outlet: c.outlet, email: c.email, domain_rating: dr, verification: v.status ?? "not_checked", action: "created", ...(hint ? { contact_hint: hint } : {}) });
    warnings.push(...emailWarnings(c));
    if (hint) warnings.push(`Where to find the email: ${contactHintText(c.name, hint)}${hint.status === "email_found" ? " Ask the user before saving it." : ""}`);
    if (v.status !== "verified") warnings.push(`${c.name} has no verified recent byline at ${c.outlet ?? "the outlet given"}; saved as unverified.`);
  }

  const created = outcome.filter((o) => o.action === "created");
  const emailed = outcome.filter((o) => o.action === "email_added");
  const skipped = outcome.filter((o) => o.action === "already_saved");
  const data: Row = { company_id: company.id, journalists: outcome, created: created.length, emails_added: emailed.length, already_saved: skipped.length };

  if (plan.length === 0) {
    return answer({
      text: `Nothing to save: ${skipped.length === 1 ? `${String(skipped[0].name)} is` : `all ${skipped.length} are`} already in the journalist list. Their ids are in the result, ready for draft_pitch.${warnings.length ? ` ${warnings.join(" ")}` : ""}`,
      data: { status: "nothing_to_do", ...data, _untrusted: ["journalists[].name", "journalists[].outlet"] },
    });
  }

  const describe = (o: Row): string => `${String(o.name)}${o.outlet ? ` (${String(o.outlet)})` : ""}${o.email ? `, ${String(o.email)}` : ", no email"}`;
  const parts: string[] = [];
  if (created.length) parts.push(`save ${created.length} new journalist${created.length === 1 ? "" : "s"} for ${company.name}: ${created.map(describe).join("; ")}`);
  if (emailed.length) parts.push(`add the email to ${emailed.length} already saved: ${emailed.map(describe).join("; ")}`);
  const preview = `Will ${parts.join(". Will ")}.${skipped.length ? ` ${skipped.length} already saved and left as ${skipped.length === 1 ? "it is" : "they are"}.` : ""}`;

  const done: string[] = [];
  if (created.length) done.push(`${created.length} journalist${created.length === 1 ? "" : "s"} saved for ${company.name}`);
  if (emailed.length) done.push(`${emailed.length} email${emailed.length === 1 ? "" : "s"} added`);

  return planned({
    args: { company_id: company.id, names: candidates.map((c) => c.name), angle, with_email: candidates.filter((c) => c.email).length },
    plan,
    preview,
    result: { text: `${done.join(", ")}. Use the journalist_id values with draft_pitch.`, data },
    keys: [],
    warnings: Array.from(new Set(warnings)),
    untrusted: ["journalists[].name", "journalists[].outlet"],
  });
}

/** After a commit: the same stage event the dashboard's Save button records, once per new journalist. */
export async function afterAddJournalists(actor: Actor, data: Row): Promise<void> {
  const n = Math.min(Number(data.created) || 0, MAX_BATCH);
  for (let i = 0; i < n; i++) await recordStageEventFor(actor.userId, "journalist_saved");
}

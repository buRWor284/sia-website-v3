import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import { PRICE_VERSION } from "@/lib/ai-usage";

/**
 * Admin-only AI costs page (stage 3, 2026-09-10).
 *
 * Answers the stage 3 "done when": what does one run of each tool cost, and
 * what does one subscriber cost a month, from our own data (the ai_usage table,
 * written by src/lib/ai-usage.ts).
 *
 * ACCESS: middleware already requires a signed-in account with emos_access for
 * everything under /emos-platform. On top of that this page 404s for anyone
 * whose email is not on EMOS_ADMIN_EMAILS, because it reads EVERY org's rows
 * through the service client (and the three report functions are service-role
 * only). A 404 rather than a redirect, so the page's existence isn't advertised.
 *
 * TEST ACCOUNTS are hidden by default (?test=show brings them back), so the
 * numbers answer "what do CUSTOMERS cost me". The flag itself is
 * organizations.is_test, owned by the test-separation work
 * (supabase/organizations-is-test.sql) — this page only reads it. Anonymous
 * public-tool runs have no org, so they are never treated as test.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "AI costs (admin)",
};

const PAPER = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const INK35 = "rgba(26,20,16,.32)";
const INK15 = "rgba(26,20,16,.15)";
const YEL = "#f5b81f";
const GROT = "var(--font-grot)";
const SERIF = "var(--font-serif)";
const MONO = "var(--font-mono)";

const PERIODS = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

const TOOL_LABELS: Record<string, string> = {
  "pressiq-score": "PressIQ · score",
  "pitch-draft": "PressIQ · drafts",
  "signaliq-pack": "SignalIQ · asset pack",
  "signaliq-profile": "SignalIQ · company profile",
  "journo-ai": "JournoCollabIQ",
  "collab-ai": "PartnerCollabIQ",
  "asset-brief": "AssetIQ · brief",
  "company-brief": "Company brief · research / condense",
};

interface ToolRow {
  tool: string; surface: string; model: string;
  runs: number; total_usd: number; avg_usd: number | null; p90_usd: number | null;
  avg_in: number | null; avg_out: number | null; unpriced: number;
}
interface OrgRow {
  org_id: string; org_name: string | null; is_test: boolean; owner_email: string | null;
  calls: number; total_usd: number; first_call: string; last_call: string;
}
interface RecentRow {
  created_at: string; org_id: string | null; org_name: string | null; is_test: boolean;
  owner_email: string | null; surface: string; tool: string; model: string;
  input_tokens: number; output_tokens: number; cost_usd: number | null; stop_reason: string | null;
}

/** How an account is named on this page. A test account shows as
 * "TEST (its sign-in email)" so it can't be mistaken for a customer; an account
 * belonging to an admin is marked "(you)". */
function accountLabel(name: string | null, isTest: boolean, ownerEmail: string | null): string {
  const firstEmail = (ownerEmail ?? "").split(",")[0].trim();
  if (isTest) return `TEST (${firstEmail || name || "unknown"})`;
  const base = name || firstEmail || "Unnamed account";
  return firstEmail && isEmosAdminEmail(firstEmail) ? `${base} (you)` : base;
}

/** Money: cents for anything a dollar or more, four places below that, so a
 * $0.0042 run doesn't round to a misleading $0.00. */
function usd(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n === 0) return "$0";
  return Math.abs(n) >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`;
}
const int = (n: number | null | undefined) => (n === null || n === undefined ? "—" : Math.round(n).toLocaleString("en-US"));
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Server component, rendered once per request (force-dynamic), so reading the
 * clock is correct here. Kept out of the component body for react-hooks/purity. */
function requestTime(): number {
  return Date.now();
}

/** Full-width black section bar with a § number and a right-aligned tag. */
function Bar({ n, title, tag }: { n: string; title: string; tag: string }) {
  return (
    <div style={{ background: INK, color: PAPER, padding: "9px 14px", display: "flex", alignItems: "center", gap: 12, marginTop: 36 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: YEL }}>§{n}</span>
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{title}</span>
      <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>{tag}</span>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "14px 16px", minWidth: 0 }}>
      <div style={{ display: "inline-block", fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", background: YEL, color: INK, padding: "2px 6px", marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>{value}</div>
      {note && <div style={{ fontFamily: GROT, fontSize: 11, color: INK55, marginTop: 6, lineHeight: 1.4 }}>{note}</div>}
    </div>
  );
}


export default async function AdminCostsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; test?: string }>;
}) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  if (!isEmosAdminEmail(email)) notFound();

  const { days: daysParam, test: testParam } = await searchParams;
  const includeTest = testParam === "show";
  const now = requestTime();
  const period = PERIODS.find((p) => p.key === daysParam) ?? PERIODS[1];
  const since = period.days
    ? new Date(now - period.days * 86_400_000).toISOString()
    : "2000-01-01T00:00:00Z";

  const db = createSupabaseServiceClient();
  const [toolRes, orgRes, recentRes, allToolRes] = await Promise.all([
    db.rpc("admin_ai_usage_by_tool", { p_since: since, p_include_test: includeTest }),
    db.rpc("admin_ai_usage_by_org", { p_since: since, p_include_test: includeTest }),
    db.rpc("admin_ai_usage_recent", { p_since: since, p_include_test: includeTest, p_limit: 25 }),
    // Only to say what the filter is hiding. Skipped when nothing is hidden.
    includeTest ? Promise.resolve({ data: null, error: null }) : db.rpc("admin_ai_usage_by_tool", { p_since: since, p_include_test: true }),
  ]);
  const loadError = toolRes.error ?? orgRes.error ?? recentRes.error ?? allToolRes.error;

  const tools: ToolRow[] = ((toolRes.data ?? []) as Record<string, unknown>[]).map((r) => ({
    tool: String(r.tool), surface: String(r.surface), model: String(r.model),
    runs: Number(r.runs), total_usd: Number(r.total_usd), avg_usd: num(r.avg_usd), p90_usd: num(r.p90_usd),
    avg_in: num(r.avg_in), avg_out: num(r.avg_out), unpriced: Number(r.unpriced),
  }));
  const orgs: OrgRow[] = ((orgRes.data ?? []) as Record<string, unknown>[]).map((r) => ({
    org_id: String(r.org_id), org_name: (r.org_name as string | null) ?? null,
    is_test: r.is_test === true, owner_email: (r.owner_email as string | null) ?? null,
    calls: Number(r.calls), total_usd: Number(r.total_usd),
    first_call: String(r.first_call), last_call: String(r.last_call),
  }));
  const recent: RecentRow[] = ((recentRes.data ?? []) as Record<string, unknown>[]).map((r) => ({
    created_at: String(r.created_at), org_id: (r.org_id as string | null) ?? null,
    org_name: (r.org_name as string | null) ?? null, is_test: r.is_test === true,
    owner_email: (r.owner_email as string | null) ?? null,
    surface: String(r.surface), tool: String(r.tool), model: String(r.model),
    input_tokens: Number(r.input_tokens), output_tokens: Number(r.output_tokens),
    cost_usd: num(r.cost_usd), stop_reason: (r.stop_reason as string | null) ?? null,
  }));

  // What the default view is hiding: everything minus the customers-only view.
  const allTools = ((allToolRes.data ?? []) as Record<string, unknown>[]);
  const hiddenCalls = includeTest ? 0 : allTools.reduce((a, r) => a + Number(r.runs), 0) - tools.reduce((a, r) => a + r.runs, 0);
  const hiddenUsd = includeTest ? 0 : allTools.reduce((a, r) => a + Number(r.total_usd), 0) - tools.reduce((a, r) => a + r.total_usd, 0);
  const qs = (days: string, test: boolean) => `/emos-platform/admin/costs?days=${days}${test ? "&test=show" : ""}`;

  // ── Headline numbers ─────────────────────────────────────────────────────
  const sum = (rows: ToolRow[]) => rows.reduce((a, r) => a + r.total_usd, 0);
  const calls = tools.reduce((a, r) => a + r.runs, 0);
  const total = sum(tools);
  const platformTotal = sum(tools.filter((r) => r.surface === "platform"));
  const publicTotal = sum(tools.filter((r) => r.surface === "public"));
  const unattributed = tools.filter((r) => r.surface === "unattributed").reduce((a, r) => a + r.runs, 0);
  const unpriced = tools.reduce((a, r) => a + r.unpriced, 0);

  // Scale any window to "per 30 days" so the per-account figure always reads as
  // a monthly cost. For "All time" the window starts at the account's first call.
  const perMonth = (o: OrgRow) => {
    const windowDays = period.days
      ?? Math.max(1, (now - new Date(o.first_call).getTime()) / 86_400_000);
    return (o.total_usd * 30) / windowDays;
  };
  const avgPerAccountMonth = orgs.length ? orgs.reduce((a, o) => a + perMonth(o), 0) / orgs.length : null;

  const th: React.CSSProperties = { fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, textAlign: "left", padding: "10px 12px", borderBottom: `1px solid ${INK}`, whiteSpace: "nowrap" };
  const td: React.CSSProperties = { fontFamily: MONO, fontSize: 12, color: INK, padding: "9px 12px", borderBottom: `1px solid ${INK15}`, whiteSpace: "nowrap" };
  const tdR: React.CSSProperties = { ...td, textAlign: "right" };
  const thR: React.CSSProperties = { ...th, textAlign: "right" };

  return (
    <div style={{ minHeight: "100vh", background: PAPER }}>
      {/* Compact masthead */}
      <section style={{ background: INK, padding: "16px clamp(20px,4vw,48px) 14px", borderBottom: "1px solid rgba(250,250,250,.10)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, padding: "4px 8px", flexShrink: 0 }}>
          ADMIN ONLY
        </span>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em", color: PAPER, margin: 0 }}>
          AI costs &amp; <em>what each run spends</em>
        </h1>
        <Link href="/emos-platform/dashboard" style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,250,.55)", border: "1px solid rgba(250,250,250,.2)", padding: "4px 9px", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </section>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "28px clamp(16px,4vw,48px) 140px" }}>
        {/* Period switcher + test-account filter */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap", border: `1px solid ${INK}`, width: "fit-content", maxWidth: "100%" }}>
          {PERIODS.map((p, i) => {
            const on = p.key === period.key;
            return (
              <Link key={p.key} href={qs(p.key, includeTest)}
                style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 14px", textDecoration: "none", background: on ? INK : PAPER, color: on ? PAPER : INK, borderRight: i < PERIODS.length - 1 ? `1px solid ${INK}` : "none" }}>
                {p.label}
              </Link>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap", border: `1px solid ${INK}`, width: "fit-content", maxWidth: "100%" }}>
          {[
            { on: !includeTest, label: "Customers only", href: qs(period.key, false) },
            { on: includeTest, label: "Include test accounts", href: qs(period.key, true) },
          ].map((o, i) => (
            <Link key={o.label} href={o.href}
              style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 14px", textDecoration: "none", background: o.on ? INK : PAPER, color: o.on ? PAPER : INK, borderRight: i === 0 ? `1px solid ${INK}` : "none" }}>
              {o.label}
            </Link>
          ))}
        </div>
        </div>

        {loadError && (
          <div style={{ marginTop: 20, border: `1px solid ${INK}`, background: PAPER2, padding: "12px 16px", fontFamily: GROT, fontSize: 13, color: INK }}>
            Could not load the cost data: {loadError.message}
          </div>
        )}

        {/* §1 Headline */}
        <Bar n="1" title="The headline" tag={`${period.label} · ${includeTest ? "including test accounts" : "customers only"}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginTop: 10 }}>
          <Stat label="Total AI spend" value={usd(total)} note={`${int(calls)} calls`} />
          <Stat label="Dashboard (paid)" value={usd(platformTotal)} note="Runs inside /emos-platform" />
          <Stat label="Free public tools" value={usd(publicTotal)} note="What the lead magnets cost you" />
          <Stat label="Avg per account / month" value={usd(avgPerAccountMonth)} note={orgs.length ? `Across ${orgs.length} account${orgs.length === 1 ? "" : "s"} with activity` : "No account activity yet"} />
        </div>

        {!includeTest && hiddenCalls > 0 && (
          <div style={{ marginTop: 12, border: `1px solid ${INK}`, background: PAPER2, padding: "10px 14px", fontFamily: GROT, fontSize: 12, color: INK, lineHeight: 1.5 }}>
            <strong>Hidden: {int(hiddenCalls)} call{hiddenCalls === 1 ? "" : "s"} ({usd(hiddenUsd)}) from test accounts.</strong>{" "}
            <Link href={qs(period.key, true)} style={{ color: INK }}>Show them</Link>
          </div>
        )}

        {(unattributed > 0 || unpriced > 0) && (
          <div style={{ marginTop: 12, border: `1px solid ${INK}`, background: YEL, padding: "10px 14px", fontFamily: GROT, fontSize: 12, color: INK, lineHeight: 1.5 }}>
            {unattributed > 0 && <div><strong>{unattributed} call{unattributed === 1 ? "" : "s"} with no surface.</strong> A route called an AI tool without wrapping it in withAiUsage. The cost is counted; who made it is not.</div>}
            {unpriced > 0 && <div><strong>{unpriced} call{unpriced === 1 ? "" : "s"} with no price.</strong> The model is missing from the price table in src/lib/ai-usage.ts, so these are left out of every total rather than counted as free.</div>}
          </div>
        )}

        {calls === 0 && !loadError && (
          <div style={{ marginTop: 12, border: `1px solid ${INK}`, padding: "18px 20px", fontFamily: SERIF, fontSize: 16, color: INK, lineHeight: 1.5 }}>
            {includeTest ? "No AI calls in this window yet." : "No customer AI calls in this window yet."} Run any tool once and it shows up here.
          </div>
        )}

        {/* §2 Per tool */}
        <Bar n="2" title="Cost per run, by tool" tag="The per-run answer" />
        <div style={{ overflowX: "auto", border: `1px solid ${INK}`, borderTop: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: PAPER }}>
            <thead>
              <tr>
                <th style={th}>Tool</th><th style={th}>Where</th><th style={th}>Model</th>
                <th style={thR}>Runs</th><th style={thR}>Avg / run</th><th style={thR}>90% under</th>
                <th style={thR}>Avg tokens in / out</th><th style={thR}>Total</th>
              </tr>
            </thead>
            <tbody>
              {tools.length === 0 && (
                <tr><td style={{ ...td, fontFamily: GROT, color: INK35 }} colSpan={8}>Nothing yet.</td></tr>
              )}
              {tools.map((r) => (
                <tr key={`${r.tool}|${r.surface}|${r.model}`}>
                  <td style={{ ...td, fontFamily: GROT, fontWeight: 700 }}>{TOOL_LABELS[r.tool] ?? r.tool}</td>
                  <td style={td}>{r.surface === "platform" ? "Dashboard" : r.surface === "public" ? "Public" : "Unknown"}</td>
                  <td style={td}>{r.model}</td>
                  <td style={tdR}>{int(r.runs)}</td>
                  <td style={{ ...tdR, fontWeight: 700 }}>{usd(r.avg_usd)}</td>
                  <td style={tdR}>{usd(r.p90_usd)}</td>
                  <td style={tdR}>{int(r.avg_in)} / {int(r.avg_out)}</td>
                  <td style={tdR}>{usd(r.total_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* §3 Per account */}
        <Bar n="3" title="Cost per account" tag="The per-subscriber answer" />
        <div style={{ overflowX: "auto", border: `1px solid ${INK}`, borderTop: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: PAPER }}>
            <thead>
              <tr>
                <th style={th}>Account</th><th style={thR}>Calls</th><th style={thR}>Spent in window</th>
                <th style={thR}>≈ per month</th><th style={th}>Last call</th>
              </tr>
            </thead>
            <tbody>
              {orgs.length === 0 && (
                <tr><td style={{ ...td, fontFamily: GROT, color: INK35 }} colSpan={5}>No signed-in usage yet.</td></tr>
              )}
              {orgs.map((o) => (
                <tr key={o.org_id}>
                  <td style={{ ...td, fontFamily: GROT, fontWeight: 700 }}>{accountLabel(o.org_name, o.is_test, o.owner_email)}</td>
                  <td style={tdR}>{int(o.calls)}</td>
                  <td style={tdR}>{usd(o.total_usd)}</td>
                  <td style={{ ...tdR, fontWeight: 700 }}>{usd(perMonth(o))}</td>
                  <td style={td}>{new Date(o.last_call).toISOString().slice(0, 16).replace("T", " ")} UTC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* §4 Recent */}
        <Bar n="4" title="Latest 25 calls" tag="The raw log" />
        <div style={{ overflowX: "auto", border: `1px solid ${INK}`, borderTop: "none" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: PAPER }}>
            <thead>
              <tr>
                <th style={th}>When (UTC)</th><th style={th}>Account</th><th style={th}>Tool</th><th style={th}>Model</th>
                <th style={thR}>Tokens in / out</th><th style={thR}>Cost</th><th style={th}>Ended</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td style={{ ...td, fontFamily: GROT, color: INK35 }} colSpan={7}>Nothing yet.</td></tr>
              )}
              {recent.map((r, i) => (
                <tr key={`${r.created_at}-${i}`}>
                  <td style={td}>{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td style={{ ...td, fontFamily: GROT }}>
                    {r.org_id ? accountLabel(r.org_name, r.is_test, r.owner_email) : r.surface === "public" ? "Anonymous visitor" : "Unknown"}
                  </td>
                  <td style={{ ...td, fontFamily: GROT }}>{TOOL_LABELS[r.tool] ?? r.tool}</td>
                  <td style={td}>{r.model}</td>
                  <td style={tdR}>{int(r.input_tokens)} / {int(r.output_tokens)}</td>
                  <td style={{ ...tdR, fontWeight: 700 }}>{usd(r.cost_usd)}</td>
                  <td style={td}>{r.stop_reason === "max_tokens" ? "cut short" : (r.stop_reason ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontFamily: GROT, fontSize: 11, color: INK55, marginTop: 20, lineHeight: 1.6 }}>
          AI calls only (Anthropic). Hosting, database, BigQuery and Stripe fees are not included. Prices from
          Anthropic&apos;s published per-token rates, version {PRICE_VERSION}. &ldquo;Cut short&rdquo; calls are billed even though
          the tool rejects the answer. &ldquo;≈ per month&rdquo; scales the selected window to 30 days.
          &ldquo;Customers only&rdquo; hides accounts flagged as test (organizations.is_test); anonymous public-tool visitors always count.
        </p>
      </div>
    </div>
  );
}

import "server-only";
import { fetchPage } from "@/lib/emos/placement-check";

/**
 * Where to find a journalist's email (2026-10-08).
 *
 * EMOS never guesses an email. When a journalist is saved without one, this
 * opens a few likely pages on the outlet's site (contact, team, about) and
 * records what it saw, so the dashboard and the AI can tell the user exactly
 * where to look:
 *
 *   email_found  an address on the page whose name part matches the journalist
 *                (a SUGGESTION: it is shown, never saved without the user)
 *   hidden       the page uses an email-hiding service (Cloudflare and the
 *                like): addresses show in a normal browser, not to a tool.
 *                EMOS does not try to decode them; the site hides them on
 *                purpose.
 *   listed       the page names the journalist but prints no matching email
 *   no_page      none of the pages answered; point at the latest article
 *
 * Same defensive fetch as the placement check (public hosts only, size and
 * time limits). Best effort: any failure is a "no_page" hint, never an error.
 */

export type ContactHintStatus = "email_found" | "hidden" | "listed" | "no_page";

export interface ContactHint {
  status: ContactHintStatus;
  /** The page to open (or the latest article when no page was found). */
  url: string | null;
  /** Only for email_found: the address seen on that page. */
  email?: string;
  checked_at: string;
}

const PATHS = ["/contact-us", "/contact", "/en/contact-us", "/about-us", "/about", "/team", "/masthead"];
const DEADLINE_MS = 9_000;
const EMAIL_RX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const HIDDEN_RX = /data-cfemail|\/cdn-cgi\/l\/email-protection|\[email&#160;protected\]|\[email protected\]/i;
const ASSET_RX = /\.(png|jpe?g|gif|svg|webp|css|js)$/i;

const ascii = (v: string): string => v.normalize("NFKD").replace(/[^\x00-\x7f]/g, "").toLowerCase();

function nameParts(name: string): string[] {
  return ascii(name).split(/[^a-z]+/).filter((p) => p.length >= 3);
}

function textOf(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
}

interface PageRead {
  url: string;
  mentions: boolean;
  hidden: boolean;
  email: string | null;
}

function readPage(url: string, html: string, name: string): PageRead {
  const parts = nameParts(name);
  const text = ascii(textOf(html));
  const full = ascii(name).trim();
  const mentions = (full.length >= 3 && text.includes(full)) || (parts.length >= 2 && parts.every((p) => text.includes(p)));
  const hidden = HIDDEN_RX.test(html);
  let email: string | null = null;
  const seen = new Set<string>();
  for (const m of html.matchAll(EMAIL_RX)) {
    const e = m[0].toLowerCase();
    if (seen.has(e) || ASSET_RX.test(e)) continue;
    seen.add(e);
    const local = e.slice(0, e.indexOf("@")).replace(/[^a-z]/g, "");
    if (parts.length && parts.some((p) => local.includes(p))) {
      email = e;
      break;
    }
  }
  return { url, mentions, hidden, email };
}

/** Never throws. `fallbackUrl` (the latest article) is used when no page is found. */
export async function checkContactPages(outletDomain: string, name: string, fallbackUrl: string | null): Promise<ContactHint> {
  const checked_at = new Date().toISOString();
  const host = outletDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const reads: PageRead[] = [];

  const jobs = PATHS.map(async (path) => {
    try {
      const page = await fetchPage(new URL(`https://${host}${path}`));
      if (page.html) reads.push(readPage(page.finalUrl.toString(), page.html, name));
    } catch {
      /* best effort */
    }
  });
  await Promise.race([Promise.allSettled(jobs), new Promise((r) => setTimeout(r, DEADLINE_MS))]);

  const found = reads.find((r) => r.email);
  if (found) return { status: "email_found", url: found.url, email: found.email!, checked_at };
  const hidden = reads.find((r) => r.hidden && r.mentions) ?? reads.find((r) => r.hidden);
  if (hidden) return { status: "hidden", url: hidden.url, checked_at };
  const listed = reads.find((r) => r.mentions);
  if (listed) return { status: "listed", url: listed.url, checked_at };
  return { status: "no_page", url: fallbackUrl, checked_at };
}

/** One plain sentence for a person or an AI. */
export function contactHintText(name: string, h: ContactHint): string {
  switch (h.status) {
    case "email_found":
      return `${name}: a matching email (${h.email}) is printed on ${h.url}. Check it is theirs, then add it with that page as the source.`;
    case "hidden":
      return `${name}: ${h.url} lists the team, but its emails are hidden from tools (the site uses an email-hiding service). Open that page in your own browser to read the address.`;
    case "listed":
      return `${name}: ${h.url} names them but shows no email. Try their author page or the outlet's newsroom address.`;
    default:
      return `${name}: no contact page found on the outlet's site.${h.url ? ` Start from their latest article: ${h.url}` : ""}`;
  }
}

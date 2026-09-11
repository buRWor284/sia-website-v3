/**
 * Copy for the /emos-platform sales page (rebuild, 2026-09-11).
 *
 * Source of truth for the words: EMOS-Platform-Page-Rebuild-Brief-2026-09-10.md
 * §3 (copy deck, locked). Source of truth for every NUMBER: the quota modules.
 * Nothing below types an allowance by hand. If a limit changes in
 * quota-limits.ts, the comparison table, the price box, the FAQ and the FAQPage
 * JSON-LD all change with it on the next build.
 *
 * Plain data, no JSX, no server imports beyond the onboarding URL constant, so
 * page.tsx can build the JSON-LD from exactly the FAQ the reader sees.
 */

import {
  PLATFORM_MONTHLY_LIMITS as PAID,
  QUOTA_LIMITS as FREE,
  type PlatformAction,
} from "@/lib/gate/quota-limits";
import { EMOS_PLATFORM_ONBOARDING_URL } from "@/lib/emos-billing";

/**
 * Buyer-facing names for each metered action. Typed against PlatformAction, so
 * a new action added to quota-limits.ts fails the build here until it has a
 * name on this page. (The meter's own labels in quota-limits.ts say "signal
 * scans"; the page says "story scans", per the copy deck.)
 */
const PAID_LABEL: Record<PlatformAction, string> = {
  "scan": "story scans",
  "pack": "signal packs",
  "asset-plan": "asset plans",
  "journalist-search": "journalist searches",
  "pitch-angle": "pitch angles or media briefs",
  "draft": "pitch drafts",
  "score": "pitch scores",
  "company-research": "company brief builds",
};

const n = (a: PlatformAction) => `${PAID[a].limit} ${PAID_LABEL[a]}`;

/** Price box line: the four headline allowances. */
export const PRICE_BOX_ALLOWANCES = `Every month: ${n("scan")}, ${n("journalist-search")}, ${n("draft")}, ${n("score")}, and more (full list in the FAQ). Resets on the 1st.`;

/** FAQ answer: every allowance. Scans and packs read as one pair, per the deck. */
const ALL_ALLOWANCES = [
  `${n("scan")} and ${n("pack")}`,
  n("asset-plan"),
  n("journalist-search"),
  n("pitch-angle"),
  n("draft"),
  n("score"),
];
const INCLUDED_ANSWER = `${ALL_ALLOWANCES.join(", ")} and ${n("company-research")}. Your dashboard shows what is left, and everything resets on the 1st of the month. If you run out and need more, email me.`;

const freeLine = (tool: "signaliq-scan" | "jciq-preview" | "pressiq-score") =>
  `${FREE[tool].anonymous} a month, ${FREE[tool].email} with a verified email`;

/** § 2 comparison table. The first three rows are metered; the rest are features. */
export const COMPARISON: Array<{ label: string; free: string; paid: string }> = [
  { label: "Story scans",           free: freeLine("signaliq-scan"),                         paid: `${PAID.scan.limit} a month` },
  { label: "Journalist searches",   free: `${freeLine("jciq-preview")}, top results only`,  paid: `${PAID["journalist-search"].limit} a month, full results` },
  { label: "Pitch scores",          free: freeLine("pressiq-score"),                         paid: `${PAID.score.limit} a month` },
  { label: "Company brief",         free: "Retyped in every tool",                           paid: "Written once, read by every tool" },
  { label: "Asset packs",           free: "Not saved",                                       paid: "Kept in your pack library" },
  { label: "Journalist list",       free: "Not saved",                                       paid: "Saved, with why each one is on it" },
  { label: "Pitch drafts",          free: "Not available",                                   paid: `${PAID.draft.limit} a month, drafted in batches, saved, editable` },
  { label: "Repeat-pitch warning",  free: "No",                                              paid: "Warns before you pitch someone twice" },
  { label: "Score history",         free: "No",                                              paid: "Every score reopens exactly as it came back" },
  { label: "More than one company", free: "No",                                              paid: "Switch companies inside one account" },
];

export interface FaqItem {
  q: string;
  a: string;
  /** Optional: one substring of `a` to render as a link. */
  link?: { text: string; href: string; external?: boolean };
}

/** § 6 FAQ, in page order. The JSON-LD in page.tsx is built from this array. */
export const FAQ: FaqItem[] = [
  {
    q: "Do I need PR experience?",
    a: "No. Each step tells you what to do next, and PressIQ tells you what is wrong with a pitch before you send it. If you would rather learn it live with me, that is EMOS Academy.",
    link: { text: "EMOS Academy", href: "/emos-academy" },
  },
  {
    q: "Does EMOS send the emails?",
    a: "No. You send from your own inbox, which is where journalists reply. EMOS helps you pick the story, the journalist and the words, and keeps track of who you have pitched.",
  },
  {
    q: "Is this a media database?",
    a: "No. JournoCollabIQ finds journalists who cover your beat for the story you are pitching. It builds a shortlist with reasons, not a directory.",
  },
  {
    q: "Will I get coverage?",
    a: "No software can promise that, and I will not pretend it can. The Platform removes the usual reasons pitches fail: the wrong story, the wrong journalist, a weak pitch. If you want a guarantee, EMOS Academy has one.",
    link: { text: "EMOS Academy", href: "/emos-academy" },
  },
  {
    q: "What happens after I pay?",
    a: "We email you an invite to set your password, and that becomes your login. The welcome email also has a link to book your onboarding call with me. If you paid with a work card or a different email, the invite goes to the email on the payment.",
    link: { text: "book your onboarding call", href: EMOS_PLATFORM_ONBOARDING_URL, external: true },
  },
  {
    q: "What is included each month?",
    a: INCLUDED_ANSWER,
  },
  {
    q: "How do I cancel?",
    a: "From Manage billing in your dashboard settings, or the link in your Stripe receipt. You keep access until the end of the month you paid for.",
  },
  {
    q: "Is my data private?",
    // Second sentence checked 2026-09-11: every model call in src/ goes to the
    // Anthropic API, and Anthropic's commercial terms say API inputs and
    // outputs are not used for training by default. Revisit if another model
    // provider is ever added.
    a: "Yes. Every account's data is walled off at the database level, so no other customer can see your company, your journalist list or your pitches. We do not use your data to train AI models.",
  },
];

export { EMOS_PLATFORM_ONBOARDING_URL };

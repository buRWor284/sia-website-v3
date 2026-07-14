// src/lib/factcheck/intake.ts
// FactcheckIQ | paste / markdown passthrough + URL fetch-to-text, per Build-Plan-v2.md §3 step 1, §6

import type { InputType } from "./types";

export interface IntakeResult {
  text: string;
  title: string | null;
  sourceUrl: string | null;
}

const MAX_INPUT_CHARS = 200_000; // guardrail; a genuinely longer draft should be split, not silently truncated without notice

export async function normalizeInput(inputType: InputType, payload: { text?: string; url?: string }): Promise<IntakeResult> {
  if (inputType === "url") {
    if (!payload.url) throw new Error("input_type is 'url' but no url was provided");
    return fetchUrlToText(payload.url);
  }

  if (!payload.text) throw new Error(`input_type is '${inputType}' but no text was provided`);
  const text = payload.text.slice(0, MAX_INPUT_CHARS);
  return { text, title: extractMarkdownTitle(text), sourceUrl: null };
}

/**
 * Fetches a URL via the Anthropic web_fetch tool at the call site (run.ts), not
 * here directly — intake.ts stays a plain async function so it can be unit
 * tested without live network access. This function is the text-normalization
 * step for content that has already been fetched.
 */
export async function fetchUrlToText(url: string): Promise<IntakeResult> {
  // Basic same-content fetch for page text; the richer citation-mode/full-audit
  // fetch (with Claude's web_fetch tool, which enforces "URL must already be in
  // context") happens per-claim in verify.ts. This top-level intake fetch is a
  // direct HTTP GET used only to pull the draft's own text into context.
  const res = await fetch(url, {
    headers: { "User-Agent": "FactcheckIQ/1.0 (mailto:syedirfanajmal@gmail.com)" },
  });
  if (!res.ok) {
    throw new Error(`Could not fetch ${url}: HTTP ${res.status}`);
  }
  const html = await res.text();
  const text = stripHtml(html);
  return { text: text.slice(0, MAX_INPUT_CHARS), title: extractHtmlTitle(html), sourceUrl: url };
}

function extractMarkdownTitle(text: string): string | null {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractHtmlTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

/** Deliberately simple: strips tags and collapses whitespace. Not a full readability parser by design (v1 scope). */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

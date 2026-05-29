/**
 * /api/collab-ai
 *
 * Calls the Anthropic Messages API directly via fetch — no SDK required.
 * Requires ANTHROPIC_API_KEY in .env.local
 *
 * POST body: { type: "partner-suggestions" | "email-writer" | "campaign-brief", data: {...} }
 */

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";

// ─────────────────────────────────────────────────────────────
// Prompt builders
// ─────────────────────────────────────────────────────────────

function buildPartnerPrompt(d: Record<string, unknown>): string {
  const stratLabel: Record<string, string> = {
    discount: "Discount Partnership (offer a discount to a partner's customers; they link to you from their partner/deals page)",
    institution: "Institution Rebate (offer a discount specifically to universities/associations/.edu/.gov bodies; they list you on their rebate page)",
    badge: "Expert Roundup + Badge (create a guide featuring experts/coaches; award a badge with embedded backlink code)",
  };
  return `You are an expert link building strategist specialising in collab (partnership) link building.

A user has provided the following business details:
- Business name: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Industry: ${d.industry || "Not provided"}
- Audience type: ${d.audType || "Not provided"}
- Audience description: ${d.audDesc || "Not provided"}
- Geography: ${d.geo || "Not provided"}
- Chosen strategy: ${stratLabel[d.strategy as string] || String(d.strategy)}

Your task: Generate 8–12 highly specific collab link building partner suggestions tailored to this exact business.

For each suggestion provide:
1. Company name or specific type (name real companies where appropriate)
2. Why they're a perfect fit (1–2 sentences — shared audience, logical link placement)
3. The page where a link would naturally live (e.g. "partner deals page", "student discounts page")
4. Who to contact at the company (job title to search on LinkedIn)
5. Why this matters for SEO (type of link, authority potential)

Format each suggestion clearly, numbered 1–12. Be specific and actionable. Tailor every suggestion to the geography and strategy chosen.`;
}

function buildEmailPrompt(d: Record<string, unknown>): string {
  const stratContext: Record<string, string> = {
    discount: "Discount Partnership — offer a discount to the partner's customers in exchange for a link from their partner/deals page.",
    institution: "Institution Rebate — offer a discount for their students or members in exchange for a listing on their rebate/resources page.",
    badge: "Expert Roundup + Badge — invite them to be featured in an expert guide; award them a badge with embedded backlink code.",
  };
  return `You are an expert B2B copywriter specialising in partnership outreach emails.

Write a fully personalised, ready-to-send collab link building outreach email using these details:

SENDER:
- Business: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Industry: ${d.industry || "Not provided"}
- Audience: ${d.audType || ""} — ${d.audDesc || "Not provided"}
- Geography: ${d.geo || "Not provided"}

TARGET PARTNER:
- Company: ${d.partner || "the target company"}
- Category: ${d.partnerCat || "a complementary business"}
- Qualification score: ${(d.scorePct as number) > 0 ? `${d.scorePct}% fit` : "not yet scored"}

STRATEGY:
${stratContext[d.strategy as string] || String(d.strategy)}

Write a concise, high-converting outreach email that:
- Has a compelling, specific subject line (no generic "Partnership opportunity" lines)
- Opens by referencing something specific about the recipient's business
- Clearly explains the three-way value: sender gets link/referrals, partner gives their audience a perk, audience saves money or gains value
- Has a single, low-friction call to action (e.g. "15 minutes to explore this?")
- Sounds like a real person wrote it — warm, direct, not salesy
- Is under 200 words in the body (subject line excluded)

Format:
Subject: [subject line]

[email body]

Sign-off with placeholder: [Your Name] | [Role] · [Brand] · [Website]`;
}

function buildBriefPrompt(d: Record<string, unknown>): string {
  const niches = Array.isArray(d.selNiches) ? (d.selNiches as string[]).join(", ") : "Not yet selected";
  return `You are a senior SEO strategist writing a collab link building campaign brief for a client.

Write a polished, professional campaign strategy brief using these inputs:

BUSINESS:
- Name: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- Description: ${d.desc || "Not provided"}
- Industry: ${d.industry || "Not provided"}
- Audience: ${d.audType || ""} — ${d.audDesc || "Not provided"}
- Geography: ${d.geo || "Not provided"}

CAMPAIGN:
- Strategy: ${d.stratLabel || d.strategy}
- Target partner categories: ${niches}
- First scored partner: ${d.partner || "Not yet scored"} (${d.partnerCat || ""})${(d.scorePct as number) > 0 ? ` — ${d.scorePct}% fit score` : ""}
- Score verdict: ${d.verdictText || "Not yet assessed"}

Write a clear, executive-ready campaign brief structured as:

## Campaign Overview
2–3 sentences on why this strategy makes sense for this specific business.

## Strategic Rationale
Why collab link building (specifically the chosen model) is the right approach.

## Priority Partner Categories
Expand on the selected categories with specific reasoning for each.

## 90-Day Execution Plan
Phased plan: weeks 1–4 (research & prep), weeks 5–8 (outreach), weeks 9–12 (follow-up & scale).

## Success Metrics
3–5 specific KPIs to track.

## Risk & Mitigation
2–3 common pitfalls for this strategy and how to avoid them.

Write in plain, direct prose — no fluff. Tone: expert consultant. Length: 400–600 words.`;
}

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment." }, { status: 500 });
  }

  let body: { type?: string; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data) {
    return NextResponse.json({ error: "Missing type or data." }, { status: 400 });
  }

  let prompt: string;
  switch (type) {
    case "partner-suggestions": prompt = buildPartnerPrompt(data); break;
    case "email-writer":        prompt = buildEmailPrompt(data);   break;
    case "campaign-brief":      prompt = buildBriefPrompt(data);   break;
    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
      const msg = err?.error?.message || `Anthropic API error ${res.status}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const json = await res.json() as { content?: Array<{ type: string; text: string }> };
    const result = (json.content ?? [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return NextResponse.json({ result });
  } catch (e) {
    console.error("collab-ai route error:", e);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

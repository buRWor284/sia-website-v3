/**
 * /api/emostool/asset-brief
 *
 * Generates a detailed linkable asset creation plan using the signal data,
 * asset pack idea, and asset type. Clerk auth only.
 *
 * POST body: { assetType, title, signalHeadline?, assetIdea?, dataBrief?, pitchAngle?, keyword? }
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";
const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const ASSET_TYPE_LABELS: Record<string, string> = {
  research_report: "Research Report (original data study or survey)",
  calculator:      "Interactive Calculator (personalised results)",
  quiz:            "Diagnostic Quiz (audience segmentation)",
  infographic:     "Infographic (visual data story)",
  data_study:      "Data Study (analysis of datasets)",
};

function buildBriefPrompt(d: Record<string, unknown>): string {
  return `You are a senior content strategist and digital-PR expert. Your job is to write a detailed CREATION PLAN for a linkable asset that a founder/marketer will actually build and pitch to journalists.

ASSET CONTEXT:
- Asset type: ${ASSET_TYPE_LABELS[d.assetType as string] || String(d.assetType)}
- Working title: ${d.title || "Not yet set"}
- Target keyword: ${d.keyword || "Not specified"}
- Signal / news hook: ${d.signalHeadline || "Not provided"}
- Asset idea from signal pack: ${d.assetIdea || "Not provided"}
- Data brief from signal: ${d.dataBrief || "Not provided"}
- Pitch angle: ${d.pitchAngle || "Not provided"}

Write a practical creation plan with these sections:

## Why This Asset Will Earn Links
2–3 sentences on why journalists will want to link to this. What makes it genuinely newsworthy and reference-worthy.

## The Core Angle
The single most compelling thing this asset reveals or enables. One tight paragraph.

## Content Outline
A structured outline of the asset's sections or components. For a report: 5–7 sections with a one-line description each. For a calculator/quiz: the key inputs, logic, and output. For an infographic: the visual story arc. Be specific — a builder should be able to hand this to a designer/developer.

## Data You Need to Gather
A numbered list of 5–8 specific data points, datasets, or research sources needed. Include where to find each one (public data sources, surveys, your own product data, etc.).

## Key Questions This Asset Answers
3–5 specific questions your target reader / journalist has that this asset answers uniquely well.

## Methodology Note (for credibility)
A short note on how to present the data methodology so journalists trust it and can cite it.

## Pitch Hook (1-liner for journalist outreach)
A single sentence a journalist could use as the lede for their story about this asset.

## Distribution Angles
3 specific journalist beats or outlet types that would genuinely want to cover this asset and why.

Write in direct, practical prose. No fluff. Length: 500–700 words total.`;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (userId !== ALLOWED_USER_ID) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set." }, { status: 500 });

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!data.assetType || !data.title) {
    return NextResponse.json({ error: "assetType and title are required." }, { status: 400 });
  }

  const prompt = buildBriefPrompt(data);

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
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
      return NextResponse.json({ error: err?.error?.message || `Anthropic API error ${res.status}` }, { status: res.status });
    }

    const json = await res.json() as { content?: Array<{ type: string; text: string }> };
    const result = (json.content ?? [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return NextResponse.json({ brief: result });
  } catch (e) {
    console.error("asset-brief route error:", e);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

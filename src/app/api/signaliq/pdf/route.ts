/**
 * DEAD CODE — not called from anywhere in the app. Left over from the first
 * SignalIQ PDF implementation (pdfkit, plain Helvetica). The PDF report is
 * now built entirely client-side via src/lib/pdf/signaliq-report.ts +
 * src/lib/pdf/house-style.ts (buildSignalIqReport, called from the
 * `downloadPDF` handler in src/app/tools/signaliq/page.tsx). Sandbox tooling
 * couldn't delete this file outright — safe to `git rm` this route in your
 * next commit (2026-07-07 SignalIQ gate/PDF fix).
 *
 * POST /api/signaliq/pdf
 *
 * Generates a branded PDF report covering all three SignalIQ steps:
 *   1. Beat + company context
 *   2. All scanned opportunities (with scores)
 *   3. The selected opportunity's full asset pack
 *
 * Email-gated: requires pp_tier=email cookie (set on newsletter subscribe).
 * Returns application/pdf for direct browser download.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyTier } from "@/lib/pitch/tier-cookie";
// pdfkit ships as CJS; use require so it works in both edge-compat and Node runtimes
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

export const runtime = "nodejs"; // pdfkit requires Node runtime (not edge)

// ── helpers ──────────────────────────────────────────────────────────────────

function rule(doc: InstanceType<typeof PDFDocument>, y?: number) {
  const yPos = y ?? doc.y;
  doc.moveTo(doc.page.margins.left, yPos)
    .lineTo(doc.page.width - doc.page.margins.right, yPos)
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .stroke();
}

function sectionLabel(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.moveDown(0.6);
  doc.fontSize(7).font("Helvetica-Bold")
    .fillColor("#888888")
    .text(text.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.25);
  doc.fillColor("#1a1410");
}

function h2(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fontSize(15).font("Helvetica-Bold").fillColor("#1a1410").text(text);
  doc.moveDown(0.3);
}

function body(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fontSize(11).font("Helvetica").fillColor("#333333").text(text, { lineGap: 3 });
  doc.moveDown(0.4);
}

// ── route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── email gate ──────────────────────────────────────────────────────────────
  // H7 (2026-07-02 review): verify the HMAC-signed cookie (same helper as
  // PressIQ) instead of comparing the raw value, which anyone could hand-set.
  const tier = verifyTier(req.cookies.get("pp_tier")?.value);
  if (tier !== "email") {
    return NextResponse.json(
      { error: "A newsletter subscription is required to download the PDF report." },
      { status: 401 }
    );
  }

  // ── parse body ──────────────────────────────────────────────────────────────
  let body_data: Record<string, unknown>;
  try {
    body_data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    beat,
    companyContext,
    opportunities,
    opportunity,
    pack,
  } = body_data as {
    beat?: string;
    companyContext?: string;
    opportunities?: Array<{ headline: string; score: number; bandLabel: string }>;
    opportunity?: { headline: string; score: number; bandLabel: string; beat: string };
    pack?: {
      headline: string;
      brief: string;
      angle: string;
      subjectLine: string;
      linkableAssetIdea: string;
      journalists?: Array<{ name: string; outlet: string; beat: string; why: string }>;
      cautions?: string[];
      sources?: Array<{ label: string; url: string }>;
    };
  };

  // ── build PDF ───────────────────────────────────────────────────────────────
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: "SignalIQ Asset Pack Report",
      Author: "SignalIQ by Syed Irfan Ajmal",
      Subject: opportunity?.headline ?? "PR opportunity report",
    },
  });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // ── Cover ───────────────────────────────────────────────────────────────────
  // Yellow accent bar at top
  doc.rect(0, 0, doc.page.width, 8).fill("#f5b81f");

  doc.moveDown(1.5);
  doc.fontSize(9).font("Helvetica-Bold")
    .fillColor("#888888")
    .text("SIGNALIQ · PROACTIVE-PR RADAR · SYEDIRFANAJMAL.COM", { characterSpacing: 1.2 });
  doc.moveDown(0.5);

  doc.fontSize(26).font("Helvetica-Bold").fillColor("#1a1410")
    .text("Asset Pack Report");
  doc.moveDown(0.3);
  doc.fontSize(13).font("Helvetica-Oblique").fillColor("#555555")
    .text(opportunity?.headline ?? "SignalIQ opportunity");
  doc.moveDown(1);
  rule(doc);
  doc.moveDown(0.8);

  // Meta row
  doc.fontSize(10).font("Helvetica").fillColor("#333333");
  if (beat) doc.text(`Beat: ${beat}`);
  if (companyContext) doc.text(`Company context: ${companyContext}`, { lineGap: 2 });
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  doc.moveDown(0.5);

  // ── § 01 — All opportunities from the scan ──────────────────────────────────
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 8).fill("#f5b81f");
  doc.moveDown(1.5);

  sectionLabel(doc, "§ 01 — Radar results");
  h2(doc, "All opportunities from this scan");
  body(doc, "Ranked by signal-vs-coverage gap. Scores are lead/whitespace measures — not predictions.");
  doc.moveDown(0.4);

  if (opportunities && opportunities.length > 0) {
    opportunities.forEach((opp, i) => {
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1410")
        .text(`${i + 1}. ${opp.headline}`);
      doc.fontSize(9).font("Helvetica").fillColor("#888888")
        .text(`${opp.bandLabel} · ${opp.score}/100`);
      doc.moveDown(0.5);
    });
  } else {
    body(doc, "No scan results included.");
  }

  // ── § 02 — Selected opportunity ─────────────────────────────────────────────
  if (opportunity) {
    doc.addPage();
    doc.rect(0, 0, doc.page.width, 8).fill("#f5b81f");
    doc.moveDown(1.5);

    sectionLabel(doc, "§ 02 — Selected opportunity");
    h2(doc, opportunity.headline);
    doc.fontSize(10).font("Helvetica").fillColor("#888888")
      .text(`${opportunity.bandLabel} · ${opportunity.score}/100 · ${opportunity.beat ?? beat ?? ""}`);
    doc.moveDown(0.6);
  }

  // ── § 03 — Asset pack ───────────────────────────────────────────────────────
  if (pack) {
    doc.addPage();
    doc.rect(0, 0, doc.page.width, 8).fill("#f5b81f");
    doc.moveDown(1.5);

    sectionLabel(doc, "§ 03 — Your asset pack");
    h2(doc, pack.headline);
    doc.moveDown(0.3);

    // Data brief
    sectionLabel(doc, "Data brief");
    const briefParas = pack.brief.split(/\n{2,}/).filter(Boolean);
    briefParas.forEach((p) => body(doc, p));

    // Pitch angle
    sectionLabel(doc, "Pitch angle");
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
      .text(`Subject line: ${pack.subjectLine}`);
    doc.moveDown(0.3);
    body(doc, pack.angle);

    // Linkable asset
    sectionLabel(doc, "Linkable asset to build");
    body(doc, pack.linkableAssetIdea);

    // Journalists
    if (pack.journalists && pack.journalists.length > 0) {
      sectionLabel(doc, "Who to pitch");
      pack.journalists.forEach((j) => {
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1410").text(j.name);
        doc.fontSize(9).font("Helvetica").fillColor("#888888").text(`${j.outlet} · ${j.beat}`);
        doc.fontSize(10).font("Helvetica").fillColor("#333333").text(j.why, { lineGap: 2 });
        doc.moveDown(0.5);
      });
    }

    // Cautions
    if (pack.cautions && pack.cautions.length > 0) {
      sectionLabel(doc, "Before you pitch — verify");
      pack.cautions.forEach((c) => {
        doc.fontSize(10).font("Helvetica").fillColor("#333333").text(`• ${c}`, { lineGap: 2 });
      });
      doc.moveDown(0.4);
    }

    // Sources
    if (pack.sources && pack.sources.length > 0) {
      sectionLabel(doc, "Sources — live primary data");
      pack.sources.forEach((s) => {
        doc.fontSize(9).font("Helvetica").fillColor("#2d5393").text(s.label, { link: s.url, underline: true });
      });
      doc.moveDown(0.4);
    }
  }

  // ── Footer on every page ─────────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.fontSize(7).font("Helvetica").fillColor("#aaaaaa")
      .text(
        `SignalIQ · syedirfanajmal.com · Page ${i + 1} of ${range.count} · Not a prediction — scores are signal/coverage gap measures only.`,
        doc.page.margins.left,
        doc.page.height - 38,
        { align: "center", width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
      );
  }

  doc.end();
  await new Promise<void>((resolve) => doc.on("end", resolve));

  const pdfBuffer = Buffer.concat(chunks);
  const filename = `signaliq-report-${Date.now()}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}

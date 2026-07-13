/**
 * PressIQ — shared jsPDF report builder (Phase P6).
 *
 * ONE report drawer for BOTH surfaces: the public tool (email-gated) and the
 * dashboard (ungated parity). Wrappers construct the jsPDF `doc`, call this to
 * draw all pages, then `doc.save(...)`. Moved verbatim from the public page's
 * old inline generatePDF.
 */
import { installSanitizer, plainText } from "./house-style";
import { AMBER, DIMS, GREEN, RED } from "@/components/pressiq/cards";
import type { ScoreResponse } from "@/lib/pitch/types";

export interface PressIqReportInput {
  result: ScoreResponse;
  pitch: string;
  subject: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildPressIqReport(doc: any, { result, pitch, subject }: PressIqReportInput): void {
  installSanitizer(doc); // strip em/en dashes, arrows, smart quotes, non-Latin1 glyphs
  const W = 210, H = 297;
  const ML = 22, MR = 22;
  const CW = W - ML - MR;
  const iINK:   [number,number,number] = [26, 20, 16];
  const iGOLD:  [number,number,number] = [245, 184, 31];
  const iCREAM: [number,number,number] = [241, 235, 222];
  const iCREAM2:[number,number,number] = [232, 224, 204];
  const iMID:   [number,number,number] = [130, 120, 108];
  const iDIM:   [number,number,number] = [80, 72, 62];
  const iDARK:  [number,number,number] = [14, 13, 10];
  const iDARKBD:[number,number,number] = [42, 35, 24];

  const tierRGB = (color: string): [number,number,number] => {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [tR,tG,tB] = tierRGB(result.tier.color);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const pitchSubject = (subject || "Pitch Review").substring(0, 72);

  function pgFooter(page: number, dark = false) {
    const FOOT_H = 14, footY = H - 5;
    if (dark) {
      doc.setFillColor(...iDARK); doc.rect(0, H - FOOT_H, W, FOOT_H, "F");
      doc.setDrawColor(...iDARKBD); doc.setLineWidth(0.4); doc.line(0, H - FOOT_H, W, H - FOOT_H);
      doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iGOLD);
      doc.text("PRESSIQ", ML, footY);
      doc.setFont("helvetica","normal"); doc.setTextColor(70, 62, 50);
      doc.text("  ·  EMOS TOOL SUITE  ·  SYEDIRFANAJMAL.COM", ML + 13, footY);
    } else {
      doc.setFillColor(...iCREAM2); doc.rect(0, H - FOOT_H, W, FOOT_H, "F");
      doc.setDrawColor(210, 204, 190); doc.setLineWidth(0.4); doc.line(0, H - FOOT_H, W, H - FOOT_H);
      doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iINK);
      doc.text("PRESSIQ", ML, footY);
      doc.setFont("helvetica","normal"); doc.setTextColor(...iMID);
      doc.text("  ·  EMOS TOOL SUITE  ·  SYEDIRFANAJMAL.COM", ML + 13, footY);
    }
    doc.setFont("helvetica","normal"); doc.setFontSize(5.5);
    doc.setTextColor(dark ? 70 : 130, dark ? 62 : 120, dark ? 50 : 108);
    doc.text(`${page}`, W - MR, footY, { align: "right" });
  }

  function innerPageSetup(sectionLabel: string) {
    doc.setFillColor(...iCREAM); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 3, "F");
    const hY = 13;
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...iINK);
    doc.text("Press", ML, hY);
    const pw = doc.getTextWidth("Press");
    doc.setTextColor(...iGOLD); doc.text("IQ", ML + pw, hY);
    doc.setFont("helvetica","normal"); doc.setFontSize(5.5); doc.setTextColor(...iMID);
    doc.text(sectionLabel.toUpperCase(), W - MR, hY, { align: "right" });
    doc.setDrawColor(...iINK); doc.setLineWidth(0.6); doc.line(0, 16, W, 16);
    return 24;
  }

  // ── PAGE 1: DARK COVER ────────────────────────────────────────────────────
  doc.setFillColor(...iDARK); doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 5, "F");
  doc.setFillColor(...iGOLD); doc.rect(0, H - 5, W, 5, "F");
  doc.setFillColor(40, 32, 20); doc.rect(0, 5, 4, H - 10, "F");

  doc.setFillColor(...iGOLD); doc.rect(ML, 14, 14, 14, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...iINK);
  doc.text("SIA", ML + 7, 23, { align: "center" });
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(100, 90, 72);
  doc.text("Syed Irfan Ajmal  ·  syedirfanajmal.com", ML + 18, 21);

  let y = 72;
  doc.setFillColor(...iGOLD); doc.rect(ML, y, 18, 1.2, "F");
  doc.setFillColor(38, 30, 20); doc.rect(ML + 20, y, CW - 20, 1.2, "F");
  y += 7;
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); doc.setTextColor(...iGOLD);
  doc.text("JOURNALIST PITCH SCORE REPORT", ML, y);

  y += 14;
  doc.setFont("helvetica","bold"); doc.setFontSize(52); doc.setTextColor(...iCREAM);
  doc.text("Press", ML, y);
  const pressW = doc.getTextWidth("Press");
  doc.setTextColor(...iGOLD); doc.text("IQ", ML + pressW, y);

  y += 9;
  doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.setTextColor(150, 138, 118);
  doc.text("Your personalised pitch analysis", ML, y);

  y += 20;
  const scoreX = ML + 2;
  doc.setFont("helvetica","bold"); doc.setFontSize(72); doc.setTextColor(...iGOLD);
  doc.text(String(result.composite), scoreX, y + 22);
  const scoreNumW = doc.getTextWidth(String(result.composite));
  doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(80, 72, 58);
  doc.text("/ 100", scoreX + scoreNumW + 2, y + 18);
  doc.setFillColor(tR, tG, tB); doc.rect(scoreX, y + 26, 38, 7, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(255, 255, 255);
  doc.text(result.tier.label.toUpperCase(), scoreX + 19, y + 31, { align: "center" });

  const vX = scoreX + 56;
  const vW = W - MR - vX;
  doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...iCREAM);
  const headText = result.composite >= 85 ? "Placement-grade." : result.composite >= 65 ? "Competitive: tighten it." : result.composite >= 40 ? "Real material, missing the system." : "This will get ignored.";
  const headLines = doc.splitTextToSize(headText, vW) as string[];
  headLines.forEach((l, i) => doc.text(l, vX, y + 6 + i * 8));

  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(100, 90, 72);
  const subjLines = doc.splitTextToSize(pitchSubject, vW) as string[];
  let subjY = y + 6 + headLines.length * 8 + 5;
  subjLines.slice(0, 3).forEach((l: string) => { doc.text(l, vX, subjY); subjY += 5.5; });

  y += 40;
  doc.setDrawColor(38, 30, 20); doc.setLineWidth(0.4); doc.line(ML, y, W - MR, y);

  y += 5;
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(70, 62, 50);
  doc.text(date, W - MR, y, { align: "right" });

  pgFooter(1, true);

  // ── PAGE 2: SCORE SUMMARY ─────────────────────────────────────────────────
  doc.addPage(); y = innerPageSetup("Score Summary");

  if (pitch && pitch.trim()) {
    doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iMID);
    doc.text("YOUR PITCH", ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...iDIM);
    const pLines = doc.splitTextToSize(pitch.trim(), CW - 8) as string[];
    const shown = pLines.slice(0, 10);
    const boxH = shown.length * 4 + 6;
    doc.setFillColor(236, 229, 213); doc.rect(ML, y, CW, boxH, "F");
    doc.setFillColor(...iGOLD); doc.rect(ML, y, 2.5, boxH, "F");
    shown.forEach((l: string, i: number) => doc.text(l, ML + 5, y + i * 4 + 5));
    y += boxH;
    if (pLines.length > 10) { doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(...iMID); doc.text("... full pitch continues in the app", ML + 5, y + 4); y += 5; }
    y += 8;
  }

  const dimOrder = (result.relevanceAssessed ? DIMS : DIMS.filter(d => d.key !== "relevance")) as typeof DIMS[number][];
  const scoreMap2: Record<string, number> = {};
  if (result.areas.relevance) scoreMap2.relevance = result.areas.relevance.score;
  scoreMap2.objective = result.areas.objective.score;
  scoreMap2.checklist = result.areas.checklist.score;
  scoreMap2.newsroomReady = result.areas.newsroomReady.score;
  scoreMap2.storytelling = result.areas.emos.storytelling.score;
  scoreMap2.neuromarketing = result.areas.emos.neuromarketing.score;
  scoreMap2.personalBrand = result.areas.emos.personalBrand.score;

  doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
  doc.text("Score by Dimension", ML, y); y += 4;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
  doc.text("How your pitch performs across each scoring area.", ML, y); y += 10;

  const BAR_X = ML + 90, BAR_W = CW - 90, ROW_H = 14;
  dimOrder.forEach((d, i) => {
    const s = scoreMap2[d.key] ?? 0;
    const [dr,dg,db] = tierRGB(s >= 75 ? GREEN : s >= 45 ? AMBER : RED);
    const rowY = y + i * ROW_H;
    if (i % 2 === 0) { doc.setFillColor(236, 229, 213); doc.rect(ML - 2, rowY - 4, CW + 4, ROW_H, "F"); }
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...iINK);
    doc.text(d.name, ML, rowY + 4);
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(dr,dg,db);
    doc.text(String(s), BAR_X - 6, rowY + 4, { align: "right" });
    doc.setFillColor(210, 204, 190); doc.rect(BAR_X, rowY, BAR_W, 5, "F");
    doc.setFillColor(dr,dg,db); doc.rect(BAR_X, rowY, BAR_W * s / 100, 5, "F");
  });
  y += dimOrder.length * ROW_H + 10;

  doc.setFillColor(...iINK); doc.rect(ML, y, CW, 18, "F");
  doc.setFillColor(...iGOLD); doc.rect(ML, y, 3, 18, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...iGOLD);
  doc.text(String(result.composite), ML + 10, y + 13);
  const compNumW = doc.getTextWidth(String(result.composite));
  doc.setFontSize(7); doc.setTextColor(100, 90, 72);
  doc.text("/ 100", ML + 11 + compNumW, y + 10);
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...iCREAM);
  doc.text("COMPOSITE SCORE", ML + 50, y + 7);
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(160, 148, 130);
  doc.text(result.tier.label, ML + 50, y + 14);
  y += 26;

  if (result.strongestLine) {
    doc.setFillColor(...iCREAM2); doc.rect(ML, y, CW, 18, "F");
    doc.setFillColor(...iGOLD); doc.rect(ML, y, 3, 18, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...iMID);
    doc.text("YOUR STRONGEST LINE", ML + 7, y + 5);
    doc.setFont("helvetica","italic"); doc.setFontSize(8.5); doc.setTextColor(...iDIM);
    const sLine = doc.splitTextToSize(`"${plainText(result.strongestLine)}"`, CW - 10) as string[];
    doc.text(sLine[0] || "", ML + 7, y + 13);
  }

  pgFooter(2);

  // ── PAGE 3: TOP FIXES ─────────────────────────────────────────────────────
  doc.addPage(); y = innerPageSetup("Top 3 Fixes");

  doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
  doc.text("The 3 Fixes That Move Your Score Most", ML, y); y += 4;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
  doc.text("Address these in order: each one compounds the next.", ML, y); y += 12;

  result.topFixes.slice(0, 3).forEach((f, i) => {
    doc.setFillColor(...iINK); doc.rect(ML, y, CW, 12, "F");
    doc.setFillColor(...iGOLD); doc.rect(ML, y, 12, 12, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...iINK);
    doc.text(String(i + 1), ML + 6, y + 8.5, { align: "center" });
    doc.setFontSize(9.5); doc.setTextColor(...iCREAM);
    doc.text(f.area, ML + 16, y + 8.5);
    if (f.mechanism) {
      doc.setFont("helvetica","normal"); doc.setFontSize(5.5); doc.setTextColor(100, 90, 72);
      doc.text(f.mechanism.toUpperCase(), ML + CW, y + 8.5, { align: "right" });
    }
    y += 12;
    doc.setFillColor(...iCREAM2); doc.rect(ML, y, CW, 0.4, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...iDIM);
    const fLines = doc.splitTextToSize(plainText(f.text), CW - 6) as string[];
    const fH = fLines.length * 5.2 + 10;
    doc.setFillColor(236, 229, 213); doc.rect(ML, y, CW, fH, "F");
    doc.text(fLines, ML + 4, y + 6);
    y += fH + 8;
  });

  pgFooter(3);

  // ── PAGE 4: FULL BREAKDOWN ────────────────────────────────────────────────
  doc.addPage(); y = innerPageSetup("Full Breakdown");
  let breakdownPage = 4;

  doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...iINK);
  doc.text("Dimension-by-Dimension Analysis", ML, y); y += 4;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...iMID);
  doc.text("Every scoring dimension explained, with AI-generated improvement guidance.", ML, y); y += 12;

  for (const d of dimOrder) {
    const area = (() => {
      if (d.key === "relevance")      return result.areas.relevance ?? { score: 0, analysis: "" };
      if (d.key === "objective")      return result.areas.objective;
      if (d.key === "checklist")      return result.areas.checklist;
      if (d.key === "newsroomReady")  return result.areas.newsroomReady;
      if (d.key === "storytelling")   return result.areas.emos.storytelling;
      if (d.key === "neuromarketing") return result.areas.emos.neuromarketing;
      return result.areas.emos.personalBrand;
    })();
    const s = area.score;
    const [dr,dg,db] = tierRGB(s >= 75 ? GREEN : s >= 45 ? AMBER : RED);
    const aLines = ("analysis" in area && area.analysis) ? doc.splitTextToSize(plainText(area.analysis), CW - 4) as string[] : [];
    const blockH = 8 + 5 + (aLines.length > 0 ? aLines.slice(0,4).length * 4.8 + 4 : 0) + 4;

    if (y + blockH > H - 24) {
      pgFooter(breakdownPage); doc.addPage(); breakdownPage++;
      y = innerPageSetup("Full Breakdown (cont.)");
    }

    doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...iINK);
    doc.text(d.name, ML, y);
    doc.setTextColor(dr,dg,db); doc.text(String(s), ML + CW, y, { align: "right" }); y += 4;
    doc.setFillColor(210, 204, 190); doc.rect(ML, y, CW, 4, "F");
    doc.setFillColor(dr,dg,db); doc.rect(ML, y, CW * s / 100, 4, "F"); y += 7;
    if (aLines.length > 0) {
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...iDIM);
      aLines.slice(0, 4).forEach((l: string) => { doc.text(l, ML, y); y += 4.8; });
    }
    doc.setDrawColor(210, 204, 190); doc.setLineWidth(0.2); doc.line(ML, y + 2, ML + CW, y + 2);
    y += 8;
  }
  pgFooter(breakdownPage);

  // ── PAGE 5: EMOS CTA (DARK) ───────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(...iDARK); doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...iGOLD); doc.rect(0, 0, W, 5, "F");
  doc.setFillColor(...iGOLD); doc.rect(0, H - 5, W, 5, "F");
  doc.setFillColor(22, 18, 12); doc.rect(0, 5, 4, H - 10, "F");

  y = 60;
  doc.setFillColor(...iGOLD); doc.rect(W / 2 - 18, y, 36, 36, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.setTextColor(...iINK);
  doc.text("SIA", W / 2, y + 22, { align: "center" }); y += 48;

  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); doc.setTextColor(...iGOLD);
  doc.text("WANT RESULTS LIKE THESE AT SCALE?", W / 2, y, { align: "center" }); y += 5;
  doc.setFillColor(...iGOLD); doc.rect(W / 2 - 20, y, 40, 0.8, "F"); y += 10;

  doc.setFont("helvetica","bold"); doc.setFontSize(28); doc.setTextColor(...iCREAM);
  doc.text("Earned Media", W / 2, y, { align: "center" }); y += 9;
  doc.setTextColor(...iGOLD); doc.text("Operating System", W / 2, y, { align: "center" }); y += 14;

  doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(140, 128, 110);
  const ctaBody = doc.splitTextToSize(
    "The step-by-step system for founders who want press, partnerships, and authority before their Series A.",
    110
  ) as string[];
  ctaBody.forEach((l: string) => { doc.text(l, W / 2, y, { align: "center" }); y += 6; });
  y += 8;

  doc.setFillColor(...iGOLD); doc.rect(W / 2 - 56, y, 112, 14, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...iINK);
  doc.text("syedirfanajmal.com/emos", W / 2, y + 9.5, { align: "center" });

  doc.setFont("helvetica","normal"); doc.setFontSize(6); doc.setTextColor(60, 52, 40);
  doc.text(`Generated via PressIQ  ·  ${date}`, W / 2, H - 12, { align: "center" });
}

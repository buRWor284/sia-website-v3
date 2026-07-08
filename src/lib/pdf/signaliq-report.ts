/**
 * SignalIQ PDF report — composed from the shared house-style primitives.
 * Client-side jsPDF (the tool already holds the scan, selected opportunity,
 * and generated asset pack in state). No markdown leaks: prose fields run
 * through renderRich; lists are drawn structurally.
 */

import type { AssetPack, Opportunity } from "@/lib/signaliq/types";
import {
  PAGE, C, fitLine, coverPage, runningHeader, sectionMast, badge, renderRich, stampFooters, installSanitizer,
  type PdfDoc, type RGB, type HeaderOpts,
} from "./house-style";

const BRAND = "SignalIQ";
const META = "syedirfanajmal.com/tools/signaliq · Syed Irfan Ajmal";

export interface SignalIqReportData {
  beatLabel: string;
  companyContext: string;
  opportunities: Opportunity[];
  selected: Opportunity;
  pack: AssetPack;
  generatedAt: string;
}

function bandColor(band: string): RGB {
  return band === "hot" ? C.GREEN : band === "look" ? C.BLUE : band === "early" ? C.AMBER : C.GREY;
}
function gap(v: number): { label: string; color: RGB } {
  return v >= 0.7 ? { label: "Wide", color: C.GREEN }
       : v >= 0.4 ? { label: "Medium", color: C.AMBER }
       : { label: "Narrow", color: C.RED };
}

export function buildSignalIqReport(doc: PdfDoc, d: SignalIqReportData): void {
  installSanitizer(doc);
  const { W, H, M } = PAGE;
  const date = new Date(d.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // ── PAGE 1: dark cover ────────────────────────────────────────────────────
  coverPage(doc, {
    eyebrow: "Proactive-PR Radar",
    wordMain: "Signal", wordAccent: "IQ",
    subtitle: ["Your personalised", "story-radar brief."],
    meta: [
      ["Beat", d.beatLabel, true],
      ["Generated", date, false],
      ["Opportunities", `${d.opportunities.length} scanned`, false],
      ["Top score", `${d.selected.score}/100 · ${d.selected.bandLabel}`, true],
      ["Selected", d.selected.headline, false],
      ["Personalised", d.companyContext ? "Yes" : "No", false],
    ],
    pillsLabel: "Signals",
    pills: d.opportunities.slice(0, 8).map((o) => o.topic).filter(Boolean),
    date,
  });

  // ── PAGE 2+: §01 radar results (cards) ────────────────────────────────────
  doc.addPage();
  runningHeader(doc, { wordMain: "Signal", wordAccent: "IQ", context: d.beatLabel, rightLabel: "Story Radar" });
  let y = sectionMast(doc, "01", `${d.opportunities.length} Opportunities Ranked`, 28);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.GREY);
  doc.text("Ranked by signal-vs-coverage gap. Scores are lead / whitespace measures - not predictions.", M, y);
  y += 8;

  // Your startup context — the input the scan was personalised against.
  if (d.companyContext) {
    const ctxLines = (doc.splitTextToSize(d.companyContext, W - M * 2 - 14) as string[]).slice(0, 6);
    const boxH = ctxLines.length * 4.6 + 12;
    doc.setDrawColor(210, 205, 195); doc.setFillColor(245, 243, 238); doc.setLineWidth(0.3);
    doc.rect(M, y, W - M * 2, boxH, "FD");
    doc.setFillColor(...C.GOLD); doc.rect(M, y, 2.5, boxH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C.GREY);
    doc.text("YOUR STARTUP CONTEXT", M + 8, y + 6);
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...C.DGREY);
    ctxLines.forEach((l, i) => doc.text(l, M + 8, y + 11 + i * 4.6));
    y += boxH + 8;
  }

  const cW = (W - M * 2 - 8) / 2, cH = 30;
  d.opportunities.forEach((o, i) => {
    if (i > 0 && i % 2 === 0) y += cH + 4;
    if (y + cH > H - 22) {
      doc.addPage();
      runningHeader(doc, { wordMain: "Signal", wordAccent: "IQ", context: d.beatLabel, rightLabel: "Story Radar" });
      y = 28;
    }
    const cx = M + (i % 2) * (cW + 8), cy = y;
    doc.setDrawColor(210, 205, 195); doc.setFillColor(255, 255, 255); doc.setLineWidth(0.4);
    doc.rect(cx, cy, cW, cH);
    // rank + band + score row
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C.INK);
    doc.text(`${i + 1}.`, cx + 5, cy + 9);
    const bw = badge(doc, cx + cW - 26, cy + 4, o.bandLabel.toUpperCase(), bandColor(o.band));
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...C.INK);
    doc.text(`${o.score}`, cx + cW - 30 - bw, cy + 9, { align: "right" });
    // headline (up to 2 lines)
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C.INK);
    const hl = (doc.splitTextToSize(o.headline, cW - 14) as string[]).slice(0, 2);
    doc.text(hl, cx + 11, cy + 9 + 6);
    // coverage gap
    const g = gap(o.components.coverageGap);
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...g.color);
    doc.text(`COVERAGE GAP: ${g.label.toUpperCase()}`, cx + 5, cy + cH - 4);
    if (o.fit) {
      const fc = o.fit === "high" ? C.GREEN : o.fit === "medium" ? C.AMBER : C.RED;
      doc.setTextColor(...fc);
      doc.text(`FIT: ${o.fit.toUpperCase()}`, cx + cW - 5, cy + cH - 4, { align: "right" });
    }
  });
  y += cH + 10;

  // ── §02 selected opportunity ──────────────────────────────────────────────
  if (y + 70 > H - 22) {
    doc.addPage();
    runningHeader(doc, { wordMain: "Signal", wordAccent: "IQ", context: d.beatLabel, rightLabel: "Story Radar" });
    y = 28;
  }
  const sel = d.selected;
  y = sectionMast(doc, "02", "Selected Opportunity", y);
  badge(doc, M, y - 4, sel.bandLabel.toUpperCase(), bandColor(sel.band));
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...C.INK);
  doc.text(`${sel.score}/100`, W - M, y + 1, { align: "right" });
  y += 10;
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...C.INK);
  const selHl = doc.splitTextToSize(sel.headline, W - M * 2) as string[];
  doc.text(selHl, M, y); y += selHl.length * 7 + 4;

  // score breakdown bars
  const comps: [string, number][] = [
    ["Coverage gap", sel.components.coverageGap],
    ["Magnitude", sel.components.magnitude],
    ["Velocity", sel.components.velocity],
    ["Credibility", sel.components.credibility],
    ["Corroboration", sel.components.corroboration],
  ];
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.GREY);
  doc.text("HOW THIS SCORE IS BUILT", M, y); y += 6;
  const barW = W - M * 2 - 40;
  comps.forEach(([label, v]) => {
    const pct = Math.round(v * 100);
    const col: RGB = v >= 0.7 ? C.GREEN : v >= 0.4 ? C.AMBER : C.RED;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...C.DGREY);
    doc.text(label, M, y + 2.5);
    doc.setDrawColor(220, 215, 205); doc.setFillColor(245, 243, 238); doc.setLineWidth(0.2);
    doc.rect(M + 34, y, barW, 3.4, "F");
    doc.setFillColor(...col); doc.rect(M + 34, y, barW * v, 3.4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...col);
    doc.text(`${pct}`, W - M, y + 2.8, { align: "right" });
    y += 6.5;
  });
  y += 6;

  // ── §03 asset pack ────────────────────────────────────────────────────────
  const packHeader: HeaderOpts = { wordMain: "Signal", wordAccent: "IQ", context: d.beatLabel, rightLabel: "Asset Pack" };
  const ensure = (need: number) => {
    if (y + need > H - 22) { doc.addPage(); runningHeader(doc, packHeader); y = 28; }
  };
  ensure(30);
  y = sectionMast(doc, "03", "Your Asset Pack", y);
  const pack = d.pack;

  // headline
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...C.INK);
  const phl = doc.splitTextToSize(pack.headline, W - M * 2) as string[];
  doc.text(phl, M, y); y += phl.length * 6.5 + 5;

  const label = (t: string) => {
    ensure(12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.GOLD);
    doc.text(t.toUpperCase(), M, y); y += 6;
  };

  // subject line
  label("Subject line");
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...C.INK);
  const subj = doc.splitTextToSize(pack.subjectLine, W - M * 2) as string[];
  doc.text(subj, M, y); y += subj.length * 5.5 + 6;

  // pitch angle
  label("Pitch angle");
  y = renderRich(doc, pack.angle, { x: M, y, maxW: W - M * 2, header: packHeader }); y += 4;

  // data brief
  label("Data brief");
  y = renderRich(doc, pack.brief, { x: M, y, maxW: W - M * 2, header: packHeader }); y += 4;

  // linkable asset
  label("Linkable asset to build");
  y = renderRich(doc, pack.linkableAssetIdea, { x: M, y, maxW: W - M * 2, header: packHeader }); y += 4;

  // who to pitch
  label("Who to pitch");
  pack.journalists.forEach((j) => {
    ensure(16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C.INK);
    doc.text(fitLine(doc, j.name, W - M * 2, 9), M, y); y += 4.5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C.AMBER);
    doc.text(fitLine(doc, `${j.outlet} · ${j.beat}`, W - M * 2, 7), M, y); y += 4.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...C.DGREY);
    const why = doc.splitTextToSize(j.why, W - M * 2) as string[];
    doc.text(why, M, y); y += why.length * 4 + 4;
  });

  // cautions
  if (pack.cautions?.length) {
    label("Before you pitch — verify");
    pack.cautions.forEach((c) => {
      ensure(10);
      doc.setFillColor(...C.AMBER); doc.circle(M + 1.2, y - 1.2, 0.7, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...C.DGREY);
      const cl = doc.splitTextToSize(c, W - M * 2 - 5) as string[];
      doc.text(cl, M + 5, y); y += cl.length * 4 + 3;
    });
    y += 2;
  }

  // sources
  if (pack.sources?.length) {
    label("Sources — live primary data");
    pack.sources.forEach((s) => {
      ensure(6);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.INK);
      const lw = doc.getTextWidth(s.label + "  ");
      doc.text(s.label, M, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...C.BLUE);
      const urlText = fitLine(doc, s.url, W - M * 2 - lw, 7.5);
      if (typeof doc.textWithLink === "function") doc.textWithLink(urlText, M + lw, y, { url: s.url });
      else doc.text(urlText, M + lw, y);
      y += 5.5;
    });
  }

  // footers (correct totals; page 1 dark)
  stampFooters(doc, { brand: BRAND, meta: META, darkPages: [1] });
}

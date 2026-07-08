/**
 * Shared PDF "house style" — the EMOS / SIA report design system.
 *
 * Extracted and generalised from the PartnerCollabIQ (CollabIQ) generator so
 * every tool produces a consistent, branded report: dark cover, running
 * header + footer, numbered section mastheads, bordered cards, status badges,
 * and a NO-MARKDOWN rich-text renderer (bold / headings / bullets / links /
 * tables are converted to styled PDF elements — raw markdown symbols never
 * appear in the output).
 *
 * jsPDF is loaded at runtime via the UMD <script> (window.jspdf), so callers
 * pass in a jsPDF `doc` instance; this module never imports jsPDF directly.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PdfDoc = any;
export type RGB = [number, number, number];

// ── page + palette ────────────────────────────────────────────────────────────
export const PAGE = { W: 210, H: 297, M: 28 } as const;

export const C = {
  INK:   [26, 20, 16]   as RGB,
  GOLD:  [245, 184, 31] as RGB,
  CREAM: [250, 250, 250] as RGB,
  GREY:  [153, 153, 153] as RGB,
  DGREY: [80, 80, 80]   as RGB,
  MUTE:  [180, 165, 145] as RGB, // muted cream-on-dark
  DIM:   [40, 32, 24]   as RGB,  // subtle panel on dark
  // status
  GREEN: [62, 107, 69]  as RGB,
  AMBER: [196, 144, 10] as RGB,
  RED:   [193, 74, 50]  as RGB,
  BLUE:  [58, 123, 213] as RGB,
} as const;

// ── low-level helpers ──────────────────────────────────────────────────────────

/** Get the jsPDF constructor from the UMD global, or null if not yet loaded. */
export function getJsPDF(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).jspdf?.jsPDF ?? null;
}

/** Convert typographic / unicode characters that jsPDF's core fonts render as
 *  garbage (and that we don't want in reports) into safe ASCII. Removes em/en
 *  dashes, smart quotes, arrows, bullets, and any remaining non-Latin1 glyph. */
export function sanitizeText(s: string): string {
  return String(s)
    .replace(/—/g, " - ")                     // em dash — → spaced hyphen
    .replace(/[–‐‑−]/g, "-")   // en dash / hyphen variants / minus
    .replace(/[‘’‚‛]/g, "'")   // curly single quotes → '
    .replace(/[“”„‟]/g, '"')   // curly double quotes → "
    .replace(/…/g, "...")                      // ellipsis → ...
    .replace(/[→⟶➔➙➜➙›➙]/g, "->") // right arrows / ›
    .replace(/[←⟵‹]/g, "<-")        // left arrows / ‹
    .replace(/[•‣◦⁃·]/g, "-") // bullets / middot
    .replace(/ /g, " ")                        // nbsp → space
    .replace(/­/g, "")                         // soft hyphen → drop
    .replace(/[^\x00-\xFF]/g, "")                   // drop anything else non-Latin1
    .replace(/ {2,}/g, " ");                        // collapse double spaces
}

/** Strip markdown to plain prose AND sanitize unicode — for tools that draw
 *  AI-generated text directly (no rich renderer). Removes #, **bold**, *italic*,
 *  [text](url), `code`, list markers, and stray table pipes. */
export function plainText(s: string): string {
  const md = String(s)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/\s*\|\s*/g, "  ");
  return sanitizeText(md);
}

/** Patch a jsPDF doc so every text draw is sanitized. Call once, right after
 *  creating the doc, before drawing anything. */
export function installSanitizer(doc: PdfDoc): void {
  const orig = doc.text.bind(doc);
  doc.text = (t: unknown, ...rest: unknown[]) =>
    orig(
      typeof t === "string" ? sanitizeText(t)
        : Array.isArray(t) ? t.map((x) => (typeof x === "string" ? sanitizeText(x) : x))
        : t,
      ...rest,
    );
}

/** Truncate a single line to maxW (mm), appending an ellipsis. */
export function fitLine(doc: PdfDoc, text: string, maxW: number, fs: number): string {
  doc.setFontSize(fs);
  if (doc.getTextWidth(text) <= maxW) return text;
  let out = text;
  while (out.length > 1 && doc.getTextWidth(out + "…") > maxW) out = out.slice(0, -1);
  return out + "…";
}

// ── running header / footer ─────────────────────────────────────────────────────

export interface FooterOpts {
  page: number;
  totalPages: number;
  brand: string;          // e.g. "SignalIQ"
  meta: string;           // e.g. "syedirfanajmal.com/tools/signaliq · Syed Irfan Ajmal"
  dark?: boolean;
}

/** Draws the bottom brand + page bar. Assumes current page background is set. */
export function pageFooter(doc: PdfDoc, o: FooterOpts): void {
  const { W, H, M } = PAGE;
  const footY = H - 8;
  if (o.dark) {
    doc.setFillColor(...C.INK); doc.rect(0, H - 16, W, 16, "F");
    doc.setDrawColor(50, 42, 32); doc.setLineWidth(0.3); doc.line(0, H - 16, W, H - 16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C.CREAM);
    doc.text(o.brand, M, footY);
    doc.setFont("helvetica", "normal"); doc.setTextColor(80, 70, 60);
    doc.text("  ·  " + o.meta, M + doc.getTextWidth(o.brand) + 2, footY);
    doc.setTextColor(80, 70, 60);
  } else {
    doc.setFillColor(...C.CREAM); doc.rect(0, H - 16, W, 16, "F");
    doc.setDrawColor(220, 215, 205); doc.setLineWidth(0.3); doc.line(0, H - 16, W, H - 16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C.INK);
    doc.text(o.brand, M, footY);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.GREY);
    doc.text("  ·  " + o.meta, M + doc.getTextWidth(o.brand) + 2, footY);
    doc.setTextColor(...C.GREY);
  }
  doc.setFont("helvetica", "normal"); doc.setFontSize(6);
  doc.text(`Page ${o.page} of ${o.totalPages}`, W - M, footY, { align: "right" });
}

export interface HeaderOpts {
  wordMain: string;    // e.g. "Signal"
  wordAccent: string;  // e.g. "IQ"
  context?: string;    // small grey label after the wordmark
  rightLabel: string;  // e.g. "STORY RADAR"
}

/** Paints a light page background + the running header rule + wordmark. */
export function runningHeader(doc: PdfDoc, o: HeaderOpts): void {
  const { W, M } = PAGE;
  doc.setFillColor(...C.CREAM); doc.rect(0, 0, W, PAGE.H, "F");
  doc.setFillColor(...C.GOLD); doc.rect(0, 0, W, 3, "F");
  doc.setDrawColor(...C.INK); doc.setLineWidth(1.5); doc.line(0, 15, W, 15);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...C.INK);
  doc.text(o.wordMain, M, 12);
  const cw = doc.getTextWidth(o.wordMain);
  doc.setTextColor(...C.GOLD); doc.text(o.wordAccent, M + cw, 12);
  if (o.context) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...C.GREY);
    doc.text("  ·  " + o.context.substring(0, 34), M + cw + doc.getTextWidth(o.wordAccent) + 4, 12);
  }
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C.GREY);
  doc.text(o.rightLabel.toUpperCase(), W - M, 12, { align: "right" });
}

/** Numbered section masthead (dark chip + title). Returns the new y. */
export function sectionMast(doc: PdfDoc, num: string, title: string, y: number): number {
  const { M } = PAGE;
  doc.setFillColor(...C.INK); doc.rect(M, y - 5, 13, 11, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.GOLD);
  doc.text(num, M + 6.5, y + 2, { align: "center" });
  doc.setFontSize(17); doc.setTextColor(...C.INK);
  doc.text(title, M + 18, y + 2);
  return y + 16;
}

// ── cover page ──────────────────────────────────────────────────────────────────

export interface CoverOpts {
  eyebrow: string;                 // e.g. "PROACTIVE-PR RADAR"
  wordMain: string;                // "Signal"
  wordAccent: string;              // "IQ"
  subtitle: string[];              // 1-2 lines
  meta: [label: string, value: string, accent: boolean][]; // 2-col grid (even count)
  pillsLabel?: string;
  pills?: string[];
  date: string;
}

export function coverPage(doc: PdfDoc, o: CoverOpts): void {
  const { W, H, M } = PAGE;
  doc.setFillColor(...C.INK); doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...C.GOLD); doc.rect(0, 0, W, 6, "F");
  // SIA chip
  doc.setFillColor(...C.DIM); doc.rect(M, 15, 12, 12, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.INK);
  doc.text("SIA", M + 6, 22.5, { align: "center" });
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.CREAM);
  doc.text("Syed Irfan Ajmal  ·  syedirfanajmal.com", M + 16, 22);
  doc.setTextColor(70, 60, 50); doc.setFontSize(7);
  doc.text("EMOS Tool Suite", W - M, 22, { align: "right" });

  let y = 68;
  doc.setFillColor(...C.GOLD); doc.rect(M, y, 22, 1.5, "F");
  doc.setFillColor(...C.DIM); doc.rect(M + 24, y, W - M * 2 - 24, 1.5, "F");
  y += 9;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.GOLD);
  doc.text(o.eyebrow.toUpperCase(), M, y); y += 20;
  doc.setFont("helvetica", "bold"); doc.setFontSize(50); doc.setTextColor(...C.CREAM);
  doc.text(o.wordMain, M, y);
  doc.setTextColor(...C.GOLD); doc.text(o.wordAccent, M + doc.getTextWidth(o.wordMain), y);
  y += 13;
  doc.setFont("helvetica", "normal"); doc.setFontSize(17); doc.setTextColor(...C.MUTE);
  o.subtitle.forEach((line) => { doc.text(line, M, y); y += 7; });
  y += 9;
  doc.setFillColor(...C.GOLD); doc.rect(M, y, 46, 1.5, "F");
  doc.setFillColor(...C.DIM); doc.rect(M + 48, y, W - M * 2 - 48, 1.5, "F"); y += 14;

  // metadata grid (2 cols)
  const cW = (W - M * 2) / 2;
  o.meta.forEach(([label, val, accent], i) => {
    const cx = M + (i % 2) * cW, cy = y + Math.floor(i / 2) * 22;
    doc.setDrawColor(50, 42, 32); doc.setLineWidth(0.3); doc.rect(cx, cy - 5, cW, 22);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(120, 105, 85);
    doc.text(label.toUpperCase(), cx + 7, cy);
    doc.setFont("helvetica", accent ? "bold" : "normal"); doc.setFontSize(12);
    doc.setTextColor(...(accent ? C.GOLD : C.MUTE));
    doc.text(fitLine(doc, val, cW - 16, 12), cx + 7, cy + 9);
  });
  y += Math.ceil(o.meta.length / 2) * 22 + 10;

  // pills
  if (o.pills && o.pills.length) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 88, 70);
    doc.text((o.pillsLabel || "HIGHLIGHTS").toUpperCase(), M, y); y += 6;
    let chipX = M;
    o.pills.slice(0, 10).forEach((name) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      const chipW = doc.getTextWidth(name) + 8;
      if (chipX + chipW > W - M) { chipX = M; y += 9; }
      doc.setDrawColor(70, 58, 42); doc.setLineWidth(0.3); doc.rect(chipX, y - 5, chipW, 8);
      doc.setTextColor(170, 155, 130); doc.text(name, chipX + 4, y);
      chipX += chipW + 4;
    });
    y += 10;
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(70, 60, 50);
  doc.text(o.date, W - M, y, { align: "right" });
}

/** Stamp brand + page footers on every page, once total count is known.
 *  Pass the 1-based indices of dark-background pages (cover, CTA). */
export function stampFooters(
  doc: PdfDoc,
  o: { brand: string; meta: string; darkPages?: number[] },
): void {
  const total = doc.getNumberOfPages();
  const dark = new Set(o.darkPages ?? []);
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    pageFooter(doc, { page: p, totalPages: total, brand: o.brand, meta: o.meta, dark: dark.has(p) });
  }
}

// ── badge ────────────────────────────────────────────────────────────────────────

/** Small outlined status badge (e.g. tier / band). Returns its width. */
export function badge(doc: PdfDoc, x: number, y: number, text: string, color: RGB): number {
  doc.setFont("helvetica", "bold"); doc.setFontSize(6);
  const w = doc.getTextWidth(text) + 8;
  doc.setDrawColor(...color); doc.setLineWidth(0.5); doc.rect(x, y, w, 7);
  doc.setTextColor(...color); doc.text(text, x + w / 2, y + 5, { align: "center" });
  return w;
}

// ── no-markdown rich-text renderer ──────────────────────────────────────────────
// Converts markdown to styled PDF output. Handles: # / ## / ### headings,
// - / * bullets, 1. ordered items, **bold** inline, [text](url) links,
// `code`, | pipe | tables, and --- rules. Raw markdown symbols never print.

const stripInline = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")            // images -> drop
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")        // [text](url) -> text
    .replace(/`([^`]+)`/g, "$1")                       // `code` -> code
    .replace(/\(\s*\)/g, "")                           // empty parens left by link strip
    .replace(/\s{2,}/g, " ")
    .trim();

export interface RichOpts {
  x: number;
  y: number;
  maxW: number;
  header: HeaderOpts;   // redrawn when the text overflows onto a new page
  bodyColor?: RGB;
}

/** Renders a markdown string as clean styled text with automatic pagination
 *  (footers are stamped separately via stampFooters). Returns the final y. */
export function renderRich(doc: PdfDoc, md: string, o: RichOpts): number {
  const { H } = PAGE;
  const body = o.bodyColor ?? C.DGREY;
  let y = o.y;

  const newPage = () => {
    doc.addPage();
    runningHeader(doc, o.header);
    y = 28;
  };
  const ensure = (need: number) => { if (y + need > H - 22) newPage(); };

  // inline renderer with **bold** + word-wrap; returns end y
  const inline = (text: string, lx: number, maxW: number, fs: number, color: RGB): number => {
    const clean = stripInline(text);
    const LH = fs * 0.42;
    const parts = clean.split("**");
    let cx = lx, cy = y;
    doc.setFontSize(fs); doc.setTextColor(...color);
    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi];
      if (!part) continue;
      doc.setFont("helvetica", pi % 2 === 1 ? "bold" : "normal");
      for (const w of part.split(/(\s+)/)) {
        if (!w) continue;
        const isWs = /^\s+$/.test(w);
        const wW = doc.getTextWidth(isWs ? " " : w);
        if (!isWs && cx + wW > lx + maxW && cx > lx) { cx = lx; cy += LH; if (cy > H - 22) { y = cy; newPage(); cy = y; } }
        if (isWs && cx === lx) continue;
        doc.text(isWs ? " " : w, cx, cy);
        cx += wW;
      }
    }
    return cy;
  };

  const lines = md.replace(/\r/g, "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/,"");

    // table block: consecutive | ... | lines
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) rows.push(cells); // skip separator
        i++;
      }
      i--;
      if (rows.length) {
        const cols = Math.max(...rows.map((r) => r.length));
        const colW = o.maxW / cols;
        ensure(rows.length * 7 + 4);
        rows.forEach((r, ri) => {
          const isHead = ri === 0;
          r.forEach((cell, ci) => {
            doc.setFont("helvetica", isHead ? "bold" : "normal"); doc.setFontSize(7.5);
            doc.setTextColor(...(isHead ? C.INK : body));
            doc.text(fitLine(doc, stripInline(cell), colW - 4, 7.5), o.x + ci * colW + 2, y + 3);
          });
          y += 6;
          if (isHead) { doc.setDrawColor(210, 205, 195); doc.setLineWidth(0.3); doc.line(o.x, y - 2, o.x + o.maxW, y - 2); }
        });
        y += 4;
      }
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = (line.match(/^#+/) as RegExpMatchArray)[0].length;
      const text = stripInline(line.replace(/^#{1,6}\s+/, ""));
      const fs = level <= 1 ? 13 : level === 2 ? 10.5 : 9;
      ensure(fs * 0.7 + 4);
      doc.setFont("helvetica", "bold"); doc.setFontSize(fs); doc.setTextColor(...C.INK);
      const hl = doc.splitTextToSize(text, o.maxW) as string[];
      doc.text(hl, o.x, y); y += hl.length * (fs * 0.5) + 3;
    } else if (/^\s*[-*]\s+/.test(line)) {
      ensure(8);
      doc.setFillColor(...C.GOLD); doc.circle(o.x + 1.2, y - 1.2, 0.7, "F");
      y = inline(line.replace(/^\s*[-*]\s+/, ""), o.x + 5, o.maxW - 5, 8, body) + 5;
    } else if (/^\s*\d+\.\s+/.test(line)) {
      const numLabel = (line.match(/^\s*(\d+)\./) as RegExpMatchArray)[1] + ".";
      ensure(8);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.INK);
      doc.text(numLabel, o.x, y);
      y = inline(line.replace(/^\s*\d+\.\s+/, ""), o.x + 6, o.maxW - 6, 8, body) + 5;
    } else if (/^\s*>\s?/.test(line)) {
      ensure(8);
      doc.setDrawColor(...C.GOLD); doc.setLineWidth(1); doc.line(o.x, y - 3, o.x, y + 2);
      y = inline(line.replace(/^\s*>\s?/, ""), o.x + 5, o.maxW - 5, 8, C.GREY) + 5;
    } else if (/^\s*-{3,}\s*$/.test(line)) {
      ensure(4);
      doc.setDrawColor(220, 215, 205); doc.setLineWidth(0.3); doc.line(o.x, y, o.x + o.maxW, y); y += 5;
    } else if (line.trim()) {
      ensure(8);
      y = inline(line.trim(), o.x, o.maxW, 8, body) + 5;
    } else {
      y += 4;
    }
  }
  return y;
}

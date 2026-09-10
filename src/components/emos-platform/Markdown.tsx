/**
 * ── Minimal Markdown renderer for AI panels ──────────────────────────────────
 *
 * Moved out of AssetIQClient (2026-09-10) so the JournoCollabIQ media brief can
 * use it too: that brief was dropped into a pre-wrap div and a customer read
 * literal "##", "**" and "| --- |" table rows on screen (full-pass test run).
 *
 * The project carries no Markdown dependency and adding one for a few panels is
 * not worth the install, so this handles exactly what the models emit:
 * headings, bold, italic, ordered and unordered lists, simple pipe tables,
 * horizontal rules and paragraphs. Anything it does not recognise falls through
 * as a paragraph, so text is never silently dropped.
 */
import React from "react";

const INK   = "#1a1410";
const INK70 = "rgba(26,20,16,.70)";
const INK15 = "rgba(26,20,16,.15)";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

export function mdInline(text: string, key: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).flatMap((part, i) => {
    if (i % 2 === 1) return [<strong key={`${key}-s${i}`}>{part}</strong>];
    // *italic* inside the plain runs (never a lone "*" such as a footnote mark).
    return part.split(/(?<![\w*])\*(\S[^*]*?)\*(?![\w*])/g).map((seg, j) =>
      j % 2 === 1
        ? <em key={`${key}-e${i}-${j}`}>{seg}</em>
        : <React.Fragment key={`${key}-t${i}-${j}`}>{seg}</React.Fragment>,
    );
  });
}

const isTableRow = (l: string) => /^\|.*\|$/.test(l);
const isTableRule = (l: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(l);
const cells = (l: string) => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());

export default function Markdown({ text, size = 13.5 }: { text: string; size?: number }) {
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let items: string[] = [];
  let ordered = false;
  let table: string[][] = [];

  const flushPara = () => {
    if (!para.length) return;
    const k = `p${out.length}`;
    out.push(
      <p key={k} style={{ margin: "0 0 10px", fontSize: size, lineHeight: 1.7, color: INK70 }}>
        {mdInline(para.join(" "), k)}
      </p>,
    );
    para = [];
  };

  const flushList = () => {
    if (!items.length) return;
    const k = `l${out.length}`;
    const body = items.map((it, i) => (
      <li key={i} style={{ marginBottom: 5, lineHeight: 1.6 }}>{mdInline(it, `${k}-${i}`)}</li>
    ));
    const listStyle: React.CSSProperties = { margin: "0 0 12px", paddingLeft: 20, fontSize: size, color: INK70 };
    out.push(ordered
      ? <ol key={k} style={listStyle}>{body}</ol>
      : <ul key={k} style={listStyle}>{body}</ul>);
    items = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const k = `t${out.length}`;
    const [head, ...rows] = table;
    const cell: React.CSSProperties = { padding: "6px 10px", borderBottom: `1px solid ${INK15}`, textAlign: "left", verticalAlign: "top" };
    out.push(
      <div key={k} style={{ overflowX: "auto", margin: "0 0 14px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: size - 1, color: INK70, lineHeight: 1.5 }}>
          <thead>
            <tr>{head.map((h, i) => (
              <th key={i} style={{ ...cell, fontFamily: GROT, fontWeight: 800, fontSize: size - 4, letterSpacing: ".1em", textTransform: "uppercase", color: INK, borderBottom: `1px solid ${INK}` }}>
                {mdInline(h, `${k}-h${i}`)}
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>{r.map((c, ci) => <td key={ci} style={cell}>{mdInline(c, `${k}-${ri}-${ci}`)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  const flushAll = () => { flushPara(); flushList(); flushTable(); };

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) { flushAll(); continue; }

    if (isTableRow(line)) {
      flushPara(); flushList();
      if (!isTableRule(line)) table.push(cells(line));
      continue;
    }
    flushTable();

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushAll();
      out.push(<hr key={`r${out.length}`} style={{ border: 0, borderTop: `1px solid ${INK15}`, margin: "14px 0" }} />);
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const k = `h${out.length}`;
      const hStyle: React.CSSProperties = {
        fontFamily: level <= 2 ? SERIF : GROT,
        fontWeight: level <= 2 ? 700 : 800,
        fontSize: level <= 1 ? size + 5 : level === 2 ? size + 2 : size - 3.5,
        letterSpacing: level >= 3 ? ".12em" : "-.01em",
        textTransform: level >= 3 ? "uppercase" : "none",
        color: INK,
        margin: out.length ? "18px 0 8px" : "0 0 8px",
      };
      out.push(<div key={k} style={hStyle}>{mdInline(heading[2], k)}</div>);
      continue;
    }

    const ol = /^(\d+)[.)]\s+(.*)$/.exec(line);
    if (ol) { flushPara(); if (!ordered) flushList(); ordered = true; items.push(ol[2]); continue; }

    const ul = /^[-*•]\s+(.*)$/.exec(line);
    if (ul) { flushPara(); if (ordered) flushList(); ordered = false; items.push(ul[1]); continue; }

    flushList();
    para.push(line);
  }
  flushAll();

  return <div style={{ fontFamily: SERIF, color: INK }}>{out}</div>;
}

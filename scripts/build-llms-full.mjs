#!/usr/bin/env node
// Rebuilds public/llms-full.txt from the LIVE site.
//
// llms-full.txt is the full-text companion to llms.txt: the readable text of the
// main public pages in one file, so AI systems can read them without crawling.
// Until 7 Oct 2026 it was a hand-captured snapshot (28 Aug) and went stale every
// time page copy changed. This script regenerates it.
//
// Run AFTER a deploy is live (it reads production, not your working tree):
//   node scripts/build-llms-full.mjs
// Preview without writing the file:
//   node scripts/build-llms-full.mjs --dry
// Read a local server instead:
//   node scripts/build-llms-full.mjs --base=http://localhost:3000
//
// It refuses to write if any page fails to load or comes back near-empty.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE = "https://www.syedirfanajmal.com";
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const BASE = (args.find((a) => a.startsWith("--base=")) || `--base=${SITE}`).slice(7).replace(/\/$/, "");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "llms-full.txt");

// The pages included, in order. Add a path here to include a new page.
const PAGES = [
  "/",
  "/about",
  "/fractional-cmo",
  "/speaking",
  "/speaking/ai-visibility",
  "/speaking/ai-visibility/travel",
  "/emos-academy",
  "/emos-platform",
  "/ventures",
  "/clients",
  "/podcast",
  "/resources",
  "/resources/personal-branding",
  "/resources/storytelling",
  "/resources/neuromarketing",
  "/resources/writing-tips",
  "/resources/authority-flywheel",
  "/infographics/bing-seo",
  "/infographics/writing-benefits",
  "/infographics/journo-outreach-checklist",
];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", rarr: "→", larr: "←", uarr: "↑", darr: "↓", mdash: "—", ndash: "–", hellip: "…", copy: "©", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", times: "×", bull: "•" };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n] ?? m);

// Removes every <tag ...>...</tag> block whose opening tag matches `open`.
const dropBlocks = (html, tag, open = new RegExp(`<${tag}\\b[^>]*>`, "i")) => {
  let out = html;
  for (;;) {
    const m = out.match(open);
    if (!m) return out;
    const end = out.indexOf(`</${tag}>`, m.index);
    if (end === -1) return out;
    out = out.slice(0, m.index) + "\n" + out.slice(end + tag.length + 3);
  }
};

export function extract(html) {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]).trim();
  const description = decode((html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ""])[1]).trim();
  let body = html.slice(Math.max(0, html.search(/<body\b/i)));
  for (const t of ["script", "style", "noscript", "svg", "template", "iframe"]) body = dropBlocks(body, t);
  // Site chrome: the first <header> is the site header (page heroes use <header class="hero">,
  // which is kept), plus the mobile menu and the footer.
  body = dropBlocks(body, "header", /<header(?![^>]*class="hero)[^>]*>/i);
  body = dropBlocks(body, "nav", /<nav\b[^>]*site-header__mobile-menu[^>]*>/i);
  body = dropBlocks(body, "footer", /<footer\b[^>]*colophon-footer[^>]*>/i);
  const text = decode(
    body
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|aside|header|footer|nav|main|li|ul|ol|h[1-6]|tr|td|th|table|blockquote|figure|figcaption|button|a|label|summary|details|dt|dd|pre|form)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  );
  const lines = text
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean);
  // Collapse runs of identical lines (marquees and tickers render their copy twice).
  const deduped = lines.filter((l, i) => l !== lines[i - 1]);
  return { title, description, text: deduped.join("\n") };
}

async function main() {
  const sections = [];
  const problems = [];
  let siteDescription = "";
  for (const path of PAGES) {
    let res;
    try {
      res = await fetch(BASE + path, { headers: { "user-agent": "sia-llms-full-builder" }, redirect: "follow" });
    } catch (e) {
      problems.push(`${path}: ${e.message}`);
      continue;
    }
    if (!res.ok) {
      problems.push(`${path}: HTTP ${res.status}`);
      continue;
    }
    const { title, description, text } = extract(await res.text());
    if (text.length < 400) problems.push(`${path}: only ${text.length} characters of text`);
    if (path === "/") siteDescription = description;
    sections.push(`## ${title || path}\n\nURL: ${SITE}${path === "/" ? "/" : path}\n\n${text}\n`);
    console.log(`${String(text.split("\n").length).padStart(5)} lines  ${path}`);
  }
  if (problems.length) {
    console.error("\nNot written. Problems:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const head =
    `# Syed Irfan Ajmal\n\n> ${siteDescription}\n\n` +
    `This is the full-content companion to ${SITE}/llms.txt. It contains the complete text of the main public pages on syedirfanajmal.com in one file, so AI systems can read and cite them without crawling each page. Repeated site navigation and footer text has been removed. Content captured ${today}.\n\n\n`;
  const out = head + sections.join("\n\n");
  if (DRY) {
    console.log(`\nDry run: ${out.length} characters, ${PAGES.length} pages. Nothing written.`);
    return;
  }
  writeFileSync(OUT, out);
  console.log(`\nWrote ${OUT} (${out.length} characters, ${PAGES.length} pages).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

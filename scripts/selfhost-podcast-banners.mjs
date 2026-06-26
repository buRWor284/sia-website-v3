#!/usr/bin/env node
/**
 * Self-host the remaining Wayback-hosted podcast banners.
 *
 * For every episode JSON whose `featured_image_url` points at web.archive.org:
 *   1. download the image into public/podcast/<slug>.jpg
 *   2. repoint `featured_image_url` to the local /podcast/<slug>.jpg
 * Also updates src/data/podcast/episodes_full.json to match.
 *
 * Run from the repo root:  node scripts/selfhost-podcast-banners.mjs
 * Requires Node 18+ (uses global fetch).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EP_DIR = path.join(ROOT, "src/data/podcast/episodes");
const OUT_DIR = path.join(ROOT, "public/podcast");
const AGG = path.join(ROOT, "src/data/podcast/episodes_full.json");

fs.mkdirSync(OUT_DIR, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const files = fs.readdirSync(EP_DIR).filter((f) => f.endsWith(".json"));
const repointed = {};
let ok = 0, fail = 0;

for (const f of files) {
  const p = path.join(EP_DIR, f);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  const url = d.featured_image_url || "";
  if (!url.includes("web.archive.org")) continue;
  const slug = d.slug;
  const localRel = `/podcast/${slug}.jpg`;
  const dest = path.join(OUT_DIR, `${slug}.jpg`);
  try {
    const bytes = await download(url, dest);
    d.featured_image_url = localRel;
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
    repointed[slug] = localRel;
    ok++;
    console.log(`✓ ${slug}  (${(bytes / 1024).toFixed(0)} KB)`);
  } catch (e) {
    fail++;
    console.warn(`✗ ${slug}  — ${e.message}\n    URL: ${url}`);
  }
}

// Update the aggregate file
if (fs.existsSync(AGG) && Object.keys(repointed).length) {
  const data = JSON.parse(fs.readFileSync(AGG, "utf8"));
  const eps = Array.isArray(data) ? data : data.episodes || [];
  for (const e of eps) {
    if (e && repointed[e.slug]) e.featured_image_url = repointed[e.slug];
  }
  fs.writeFileSync(AGG, JSON.stringify(data, null, 2) + "\n");
  console.log("• episodes_full.json updated");
}

console.log(`\nDone. ${ok} downloaded, ${fail} failed.`);
if (fail) process.exitCode = 1;

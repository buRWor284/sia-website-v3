/**
 * render-framework.mjs
 * Generic Playwright renderer for the EMOS "why it works" framework bundles.
 *
 * Unlike the old SignalIQ/PressIQ explainer renderers (fixed 1920x1080 stage,
 * deterministic requestAnimationFrame stepping), these framework HTMLs are:
 *   - long scrolling pages (hero -> acts -> legend -> footer)
 *   - driven by real-time setInterval loops (auto-play pipeline/marker), not rAF
 *
 * So this script does NOT patch requestAnimationFrame or step frames manually.
 * It lets the page run in real wall-clock time, smooth-scrolls the full page
 * height over DURATION seconds, and captures the viewport at FPS, piping
 * screenshots straight into ffmpeg.
 *
 * Usage:
 *   node render-framework.mjs "<html file>" "<output name>" [duration] [aspect]
 *
 *   duration : seconds, default 75
 *   aspect   : "16:9" (1920x1080, default) or "1:1" (1080x1080)
 *
 * Example:
 *   node render-framework.mjs "SignalIQ Framework v6 - standalone.html" "SignalIQ" 75 16:9
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , HTML_FILE, OUT_NAME, DURATION_ARG, ASPECT_ARG] = process.argv;

if (!HTML_FILE || !OUT_NAME) {
  console.error('Usage: node render-framework.mjs "<html file>" "<output name>" [duration] [aspect]');
  process.exit(1);
}

const FPS = 30;
const DURATION = Number(DURATION_ARG) || 75; // seconds — full-scroll pages need longer than a single loop
const TOTAL_FRAMES = Math.round(FPS * DURATION);
const ASPECT = (ASPECT_ARG || '16:9').trim();

// Capture viewport is always 1920x1080 (matches the design's desktop breakpoint).
// For the 1:1 cut we crop the capture to a centered square instead of re-rendering
// at a different width, so the page layout never reflows differently between cuts.
const CAP_WIDTH = 1920;
const CAP_HEIGHT = 1080;
const OUT_WIDTH = ASPECT === '1:1' ? 1080 : 1920;
const OUT_HEIGHT = ASPECT === '1:1' ? 1080 : 1080;

const OUTPUT_FILE = join(__dirname, `${OUT_NAME}-${ASPECT.replace(':', 'x')}.mp4`);
const SERVER_PORT = 3900 + Math.floor(Math.random() * 500); // avoid clashing if run back-to-back

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.jsx': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      let pathname = req.url.split('?')[0];
      if (pathname === '/') pathname = `/${HTML_FILE}`;
      const filePath = join(__dirname, decodeURIComponent(pathname));
      try {
        const data = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('Not found');
      }
    });
    server.listen(SERVER_PORT, '127.0.0.1', () => {
      console.log(`  ✓ Server: http://127.0.0.1:${SERVER_PORT}/`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

function startFfmpeg() {
  const candidates = ['ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg', '/usr/bin/ffmpeg'];
  const ffmpegBin = candidates.find(p => p === 'ffmpeg' || existsSync(p)) || 'ffmpeg';

  // crop filter for the 1:1 cut takes the centered CAP_WIDTHxCAP_HEIGHT square region;
  // for 16:9 it's a no-op scale/pad (capture already matches output size).
  const vf = ASPECT === '1:1'
    ? `crop=${CAP_HEIGHT}:${CAP_HEIGHT}:(${CAP_WIDTH}-${CAP_HEIGHT})/2:0,scale=${OUT_WIDTH}:${OUT_HEIGHT}`
    : `scale=${OUT_WIDTH}:${OUT_HEIGHT}:force_original_aspect_ratio=decrease,pad=${OUT_WIDTH}:${OUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black`;

  const proc = spawn(ffmpegBin, [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
    '-vf', vf,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    OUTPUT_FILE,
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  proc.stderr.on('data', d => {
    const line = d.toString().trim();
    if (line.includes('frame=') || /error/i.test(line)) process.stdout.write(`  [ffmpeg] ${line}\n`);
  });
  proc.on('error', err => {
    console.error(`\n  ✗ ffmpeg error: ${err.message}`);
    console.error('  Make sure ffmpeg is installed: brew install ffmpeg');
    process.exit(1);
  });
  return proc;
}

async function render() {
  console.log('\n─'.repeat(60));
  console.log(`  ${OUT_NAME} — Framework Renderer (${ASPECT})`);
  console.log(`  ${TOTAL_FRAMES} frames · ${FPS}fps · ${fmt(DURATION)} total`);
  console.log('─'.repeat(60) + '\n');

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: CAP_WIDTH, height: CAP_HEIGHT }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  console.log('  Loading page...');
  await page.goto(`http://127.0.0.1:${SERVER_PORT}/`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800))); // let mount + first paint settle

  const scrollHeight = await page.evaluate(() => Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight
  ));
  const maxScroll = Math.max(0, scrollHeight - CAP_HEIGHT);
  console.log(`  Page height: ${scrollHeight}px · max scroll: ${maxScroll}px`);

  const ffmpeg = startFfmpeg();
  console.log(`  ✓ ffmpeg: writing to ${OUTPUT_FILE.split('/').pop()}`);
  console.log('\n  Capturing in real time (this takes as long as the video length)...\n');

  const startMs = Date.now();
  let lastReport = 0;

  // Hold on the hero for the first ~8% of the video, scroll steadily through
  // the middle ~84%, then hold on the footer for the last ~8% — so the
  // opening/closing frames aren't mid-scroll blur.
  const holdFrames = Math.round(TOTAL_FRAMES * 0.08);

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    let progress;
    if (frame < holdFrames) progress = 0;
    else if (frame > TOTAL_FRAMES - holdFrames) progress = 1;
    else progress = (frame - holdFrames) / (TOTAL_FRAMES - 2 * holdFrames);

    const scrollY = Math.round(progress * maxScroll);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);

    const screenshot = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: CAP_WIDTH, height: CAP_HEIGHT } });
    await new Promise((resolve, reject) => {
      ffmpeg.stdin.write(screenshot, (err) => { if (err) reject(err); else resolve(); });
    });

    // pace to real time so the page's own setInterval animation plays naturally
    const targetMs = (frame + 1) * (1000 / FPS);
    const elapsedMs = Date.now() - startMs;
    const waitMs = targetMs - elapsedMs;
    if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));

    const pct = Math.floor((frame / TOTAL_FRAMES) * 100);
    if (pct >= lastReport + 5) {
      lastReport = pct;
      const elapsed = (Date.now() - startMs) / 1000;
      const eta = (elapsed / (frame + 1)) * (TOTAL_FRAMES - frame - 1);
      console.log(`  ${pct.toString().padStart(3)}%  frame ${(frame+1).toString().padStart(5)}/${TOTAL_FRAMES}  elapsed ${fmt(elapsed)}  ETA ${fmt(eta)}`);
    }
  }

  console.log('\n  ✓ All frames sent — waiting for ffmpeg to finish encoding...\n');
  await new Promise((resolve, reject) => {
    ffmpeg.stdin.end();
    ffmpeg.on('close', code => { if (code === 0) resolve(); else reject(new Error(`ffmpeg exited with code ${code}`)); });
  });

  const totalSec = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log('─'.repeat(60));
  console.log(`  ✓ Done in ${totalSec}s`);
  console.log(`  ✓ Output: ${OUTPUT_FILE}`);
  console.log('─'.repeat(60) + '\n');

  await browser.close();
  server.close();
}

render().catch(err => {
  console.error('\n  ✗ Render failed:', err.message);
  process.exit(1);
});

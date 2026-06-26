/**
 * render-pressiq.mjs
 * Playwright-based deterministic renderer for PressIQ Explainer.dc.html
 *
 * How it works:
 *   1. Starts a local HTTP server to serve the animation files
 *   2. Patches window.requestAnimationFrame before any scripts load so the
 *      animation loop never runs on its own clock
 *   3. Advances the timeline frame-by-frame at exactly 1/FPS seconds per step,
 *      calling __rafTick(timestamp) to drive the rAF queue deterministically
 *   4. Pipes each PNG screenshot directly into ffmpeg's stdin — no temp frames on disk
 *   5. Produces PressIQ-Explainer.mp4 in this folder
 *
 * Requirements (first-time only — run once):
 *   node --version   → must be v18 or higher
 *   which ffmpeg     → must be installed (brew install ffmpeg)
 *   npm install      → installs playwright + http-server
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const HTML_FILE   = 'PressIQ Explainer.dc.html';
const OUTPUT_FILE = join(__dirname, 'PressIQ-Explainer.mp4');
const FPS         = 30;
const DURATION    = 275;          // seconds — matches README (4:35)
const TOTAL_FRAMES = FPS * DURATION; // 8,250 frames
const WIDTH       = 1280;
const HEIGHT      = 720;          // crop to 720p — removes playback bar
const STAGE_HEIGHT = 764;         // actual stage height in the HTML
const SERVER_PORT  = 3847;

// ── MIME types for local server ───────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.jsx':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
}

// ── 1. Local HTTP server ──────────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      let pathname = req.url.split('?')[0];
      if (pathname === '/') pathname = `/${HTML_FILE}`;
      const filePath = join(__dirname, decodeURIComponent(pathname));
      try {
        const data = readFileSync(filePath);
        const ext  = extname(filePath).toLowerCase();
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

// ── 2. rAF patch — injected before any page scripts run ──────────────────────
const RAF_PATCH = `
(function () {
  var _queue = new Map();
  var _nextId = 1;

  window.requestAnimationFrame = function (cb) {
    var id = _nextId++;
    _queue.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = function (id) {
    _queue.delete(id);
  };

  // Called by render script to fire all pending rAF callbacks with a given timestamp
  window.__rafTick = function (timestamp) {
    var pending = Array.from(_queue.entries());
    _queue.clear();
    for (var i = 0; i < pending.length; i++) {
      try { pending[i][1](timestamp); } catch(e) {}
    }
  };

  // Signal render mode to the page (hides playback bar if the page checks for it)
  window.__RENDER_MODE = true;
})();
`;

// ── 3. ffmpeg process ─────────────────────────────────────────────────────────
function startFfmpeg() {
  // Try common ffmpeg locations on macOS
  const candidates = [
    'ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
    '/usr/bin/ffmpeg',
  ];
  const ffmpegBin = candidates.find(p => {
    try {
      if (p === 'ffmpeg') return true; // trust PATH
      return existsSync(p);
    } catch { return false; }
  }) || 'ffmpeg';

  const proc = spawn(ffmpegBin, [
    '-y',                          // overwrite output
    '-f', 'image2pipe',            // input from pipe
    '-framerate', String(FPS),     // input frame rate
    '-i', 'pipe:0',                // stdin
    '-vf', `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',                  // high quality
    '-pix_fmt', 'yuv420p',         // broad compatibility
    '-movflags', '+faststart',     // web-ready (moov atom first)
    OUTPUT_FILE,
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  proc.stderr.on('data', d => {
    const line = d.toString().trim();
    if (line.includes('frame=') || line.includes('error') || line.includes('Error')) {
      process.stdout.write(`  [ffmpeg] ${line}\n`);
    }
  });

  proc.on('error', err => {
    console.error(`\n  ✗ ffmpeg error: ${err.message}`);
    console.error('  Make sure ffmpeg is installed: brew install ffmpeg');
    process.exit(1);
  });

  return proc;
}

// ── 4. Main render loop ───────────────────────────────────────────────────────
async function render() {
  console.log('\n─────────────────────────────────────────────────────');
  console.log('  PressIQ Explainer — Playwright Renderer');
  console.log(`  ${TOTAL_FRAMES} frames · ${FPS}fps · ${fmt(DURATION)} total`);
  console.log('─────────────────────────────────────────────────────\n');

  // 1. Start local server
  const server = await startServer();

  // 2. Launch Chromium (headless)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: STAGE_HEIGHT + 80 }, // extra room for bar
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 3. Inject rAF patch before any page scripts
  await page.addInitScript(RAF_PATCH);

  // 4. Load the animation
  console.log('  Loading animation...');
  await page.goto(`http://127.0.0.1:${SERVER_PORT}/`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // 5. Wait for the Stage to mount (poll for the rAF queue to be non-empty,
  //    which means the animation tried to start its first rAF)
  console.log('  Waiting for Stage to mount...');
  await page.waitForFunction(() => typeof window.__rafTick === 'function', { timeout: 10000 });

  // Give React a moment to fully mount and queue the first rAF
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

  // 6. Start ffmpeg
  const ffmpeg = startFfmpeg();
  console.log(`  ✓ ffmpeg: writing to ${OUTPUT_FILE.split('/').pop()}`);
  console.log('\n  Rendering frames...\n');

  const startMs = Date.now();
  let lastReport = 0;

  // 7. Frame loop
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const timestamp = (frame / FPS) * 1000; // ms, passed to rAF callbacks

    // Advance the animation clock by one frame
    await page.evaluate((ts) => {
      window.__rafTick(ts);
      // Let React process the state update (MessageChannel flush via setTimeout)
      return new Promise(r => setTimeout(r, 0));
    }, timestamp);

    // Capture just the stage (crop out the playback bar at bottom)
    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    // Pipe PNG to ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg.stdin.write(screenshot, (err) => {
        if (err) reject(err); else resolve();
      });
    });

    // Progress report every 5%
    const pct = Math.floor((frame / TOTAL_FRAMES) * 100);
    if (pct >= lastReport + 5) {
      lastReport = pct;
      const elapsed = (Date.now() - startMs) / 1000;
      const eta = (elapsed / (frame + 1)) * (TOTAL_FRAMES - frame - 1);
      console.log(`  ${pct.toString().padStart(3)}%  frame ${(frame+1).toString().padStart(5)}/${TOTAL_FRAMES}  elapsed ${fmt(elapsed)}  ETA ${fmt(eta)}`);
    }
  }

  console.log('\n  ✓ All frames sent — waiting for ffmpeg to finish encoding...\n');

  // 8. Close ffmpeg stdin and wait for it to finish
  await new Promise((resolve, reject) => {
    ffmpeg.stdin.end();
    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  const totalSec = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log('─────────────────────────────────────────────────────');
  console.log(`  ✓ Done in ${totalSec}s`);
  console.log(`  ✓ Output: ${OUTPUT_FILE}`);
  console.log('─────────────────────────────────────────────────────\n');

  await browser.close();
  server.close();
}

render().catch(err => {
  console.error('\n  ✗ Render failed:', err.message);
  process.exit(1);
});

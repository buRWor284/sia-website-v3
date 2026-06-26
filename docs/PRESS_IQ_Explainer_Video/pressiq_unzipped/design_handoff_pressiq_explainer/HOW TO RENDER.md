# How to Render PressIQ-Explainer.mp4

**Output:** `PressIQ-Explainer.mp4` — 1280×720, H.264, 30fps, ~4:35 runtime  
**Method:** Playwright drives the animation deterministically frame-by-frame; ffmpeg encodes.  
**Est. render time:** 8–15 minutes on an M1/M2 Mac

---

## Option A — Double-click launcher (recommended)

1. In Finder, navigate to this folder
2. Double-click **`render-pressiq.command`**
3. macOS will ask if you trust it — click **Open** (first time only)
4. Terminal opens and runs everything automatically
5. `PressIQ-Explainer.mp4` appears in this folder when done

---

## Option B — Terminal

```bash
cd "/path/to/design_handoff_pressiq_explainer"

# First time only:
npm install
npx playwright install chromium

# Render:
node render-pressiq.mjs
```

---

## Prerequisites

Both options need these installed first. If you did the Sajid deck renders, you already have them.

| Requirement | Check | Install |
|---|---|---|
| **Node.js v18+** | `node --version` | [nodejs.org](https://nodejs.org) or `brew install node` |
| **ffmpeg** | `which ffmpeg` | `brew install ffmpeg` |
| **Homebrew** | `which brew` | [brew.sh](https://brew.sh) |

Playwright (~200 MB Chromium download) installs automatically on first run.

---

## What the renderer does

1. Starts a local HTTP server to serve the animation files
2. Launches headless Chromium via Playwright
3. **Patches `window.requestAnimationFrame` before any scripts load** — the animation never runs on its own clock
4. Advances the timeline deterministically: one `__rafTick(timestamp)` call per frame at exactly 1/30th of a second
5. Screenshots the 1280×720 stage area after each tick
6. Pipes every PNG frame directly into `ffmpeg` (no temp files on disk)
7. ffmpeg encodes H.264, `crf 18`, faststart (web-ready)

This produces a pixel-accurate render of the animation — identical to what you'd see playing in Chrome, but without recording in real-time.

---

## Troubleshooting

**"render-pressiq.command can't be opened"**  
Right-click → Open → Open (bypasses Gatekeeper for unsigned scripts)

**"ffmpeg not found"**  
Run `brew install ffmpeg`, then retry

**"Node not found"**  
Install from [nodejs.org](https://nodejs.org) LTS or `brew install node`

**Animation appears frozen / all frames identical**  
The rAF patch failed to inject. Make sure you're running from the folder that contains `support.js` and `animations.jsx` alongside the HTML.

**Video is shorter than 4:35**  
The DURATION constant in `render-pressiq.mjs` is set to 275 seconds. Verify the animation's total duration matches by opening `PressIQ Explainer.dc.html` in Chrome and checking the playback bar.

---

## Output specs

| Property | Value |
|---|---|
| Container | MP4 (H.264 + no audio) |
| Resolution | 1280 × 720 (720p) |
| Frame rate | 30 fps |
| Quality | CRF 18 (near-lossless) |
| File size | ~80–150 MB est. |
| Web-ready | Yes (`+faststart`) |

To add audio (VO or music), use DaVinci Resolve, Premiere, or:
```bash
ffmpeg -i PressIQ-Explainer.mp4 -i your-audio.m4a -c:v copy -c:a aac -shortest PressIQ-Explainer-WithAudio.mp4
```

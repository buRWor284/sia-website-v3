#!/bin/bash
# render-pressiq.command — double-click this to render PressIQ-Explainer.mp4
# Runs in Terminal automatically when double-clicked in Finder.

set -e

# Resolve the script's directory so it works from any location
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PressIQ Explainer — Render to MP4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Add common Node/Homebrew paths ────────────────────────────────────────────
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# ── Check Node ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "  ✗ Node.js not found."
  echo "  Install it from https://nodejs.org (LTS) or: brew install node"
  echo ""
  read -p "  Press Enter to close..."
  exit 1
fi
NODE_VER=$(node --version)
echo "  ✓ Node: $NODE_VER"

# ── Check ffmpeg ──────────────────────────────────────────────────────────────
if ! command -v ffmpeg &>/dev/null; then
  echo "  ✗ ffmpeg not found."
  echo "  Install it with: brew install ffmpeg"
  echo ""
  read -p "  Press Enter to close..."
  exit 1
fi
echo "  ✓ ffmpeg: $(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')"

# ── Install dependencies if needed ───────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo ""
  echo "  First run — installing Playwright (~200 MB, takes ~2 min)..."
  npm install
  npx playwright install chromium
  echo ""
fi

# ── Run renderer ─────────────────────────────────────────────────────────────
echo ""
node render-pressiq.mjs

echo ""
echo "  MP4 saved to this folder: PressIQ-Explainer.mp4"
echo ""
read -p "  Press Enter to close..."

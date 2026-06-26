#!/usr/bin/env bash
# download-wp-images.sh
# Downloads all WordPress images (via Wayback Machine) that were previously
# referenced as external URLs in the resources pages.
# Run this once from the repo root: bash scripts/download-wp-images.sh

set -e
REPO="$(cd "$(dirname "$0")/.." && pwd)"
echo "Repo root: $REPO"

WB16="https://web.archive.org/web/20260315103746im_/https://syedirfanajmal.com/wp-content/uploads/2016/06"
WB18="https://web.archive.org/web/20260315103746im_/https://syedirfanajmal.com/wp-content/uploads/2018/09"
WM="https://web.archive.org/web/20251205001052im_/https://syedirfanajmal.com/wp-content/uploads/2020/04"
NEURO_TS="https://web.archive.org/web/20260120020120im_/https://syedirfanajmal.com/wp-content/uploads/2017/10"

dl() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -f "$dest" ]; then
    echo "  SKIP (exists): $(basename "$dest")"
    return
  fi
  if curl -sfL "$url" -o "$dest"; then
    echo "  OK: $(basename "$dest") ($(du -h "$dest" | cut -f1))"
  else
    echo "  FAIL: $url"
    rm -f "$dest"
  fi
}

echo ""
echo "=== personal-branding (21 images) ==="
PB="$REPO/public/articles/personal-branding"
dl "$WB16/Personalbranding101.jpg"                        "$PB/Personalbranding101.jpg"
dl "$WB18/Jeff_Bezos_cc_caricature_small.jpg"             "$PB/Jeff_Bezos_cc_caricature_small.jpg"
dl "$WB18/Rob-Asghar.jpeg"                                "$PB/Rob-Asghar.jpeg"
dl "$WB16/Bill-Gates.png"                                 "$PB/Bill-Gates.png"
dl "$WB16/Richard-Branson.png"                            "$PB/Richard-Branson.png"
dl "$WB18/Steve_Jobs_iPhone_4_presentation.jpg"           "$PB/Steve_Jobs_iPhone_4_presentation.jpg"
dl "$WB18/The-Boring-Company.jpg"                         "$PB/The-Boring-Company.jpg"
dl "$WB18/Content-trends-1-report-06.png"                 "$PB/Content-trends-1-report-06.png"
dl "$WB16/Syed-Irfan-Ajmal.png"                          "$PB/Syed-Irfan-Ajmal.png"
dl "$WB16/empower-pakistan.jpg"                           "$PB/empower-pakistan.jpg"
dl "$WB16/Dubai-With-Audience2.jpg"                       "$PB/Dubai-With-Audience2.jpg"
dl "$WB16/Dubai-Talk.jpg"                                 "$PB/Dubai-Talk.jpg"
dl "$WB18/Chimamanda-Ngozi-Adichie-2.jpg"                 "$PB/Chimamanda-Ngozi-Adichie-2.jpg"
dl "$WB18/tw-aw-mackey-1_400x400.jpg"                     "$PB/tw-aw-mackey-1_400x400.jpg"
dl "$WB18/Tim-Ferriss-cc-Photo-by-Sean-OShaughnessy.jpg"  "$PB/Tim-Ferriss-cc-Photo-by-Sean-OShaughnessy.jpg"
dl "$WB16/Lewis-Howes.jpg"                                "$PB/Lewis-Howes.jpg"
dl "$WB16/Dan-Brown.jpg"                                  "$PB/Dan-Brown.jpg"
dl "$WB16/Tim-Feriss.jpg"                                 "$PB/Tim-Feriss.jpg"
dl "$WB16/Chris-Ducker.jpg"                               "$PB/Chris-Ducker.jpg"
dl "$WB16/Marie-Forleo.jpg"                               "$PB/Marie-Forleo.jpg"
dl "$WB16/Syed-Irfan-Ajmal.jpg"                          "$PB/Syed-Irfan-Ajmal.jpg"

echo ""
echo "=== storytelling (26 images) ==="
# NOTE: Numbered images may not be in the Wayback Machine.
# The hero image (books) IS archived.
ST="$REPO/public/articles/storytelling"
dl "$WM/books-3071110_1280.jpg" "$ST/books-3071110_1280.jpg"
for n in 2 3 4 5 6 7 8 9 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27; do
  dl "$WM/${n}.png" "$ST/${n}.png"
done

echo ""
echo "=== neuromarketing (1 image) ==="
NM="$REPO/public/articles/neuromarketing"
dl "$NEURO_TS/Phineas-gage-1024x356.jpg" "$NM/Phineas-gage-1024x356.jpg"

echo ""
echo "=== Done. Add all new images to git ==="
echo "Run: git add public/articles && git commit -m 'feat: add self-hosted wp-content images' && git push origin main"

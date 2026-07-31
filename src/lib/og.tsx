import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared Open Graph / Twitter card generator. Implements the two approved
// "design_handoff_og_social_cards" directions:
//   • variant "white" — Direction C: stark white, gold left stripe, split columns,
//     author block. Preferred; used for tool / product / business pages.
//   • variant "dark"  — Direction A: dark editorial with a circular headshot.
//     Used for personal / content pages.
// One generator drives every page; only the text changes.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const W = 1200;
const H = 630;
const SAFE = 64;

// ── Tokens (from the handoff) ────────────────────────────────────────────────
const GOLD = "#F5C518";
const INK = "#0A0A09";
const SUB = "#3A3530";
const RULE = "#E8E3DB";
// dark
const D_BG = "#0E0D0A";
const D_STRIP = "#121110";
const D_WHITE = "#FFFFFF";
const D_MUTED = "#9A9690";
const D_FAINT = "#5E5B57";
const D_BORDER = "#1E1C18";
const D_DIVIDER = "#282420";

// Press wordmarks. satori has no system fonts, so we approximate the handoff's
// Georgia/Arial-Narrow with our loaded serif (Newsreader) and sans (Archivo).
const PUBS: {
  label: string;
  family: "Newsreader" | "Archivo";
  size: number;
  weight: 400 | 700 | 900;
  italic?: boolean;
  ls?: number;
}[] = [
  { label: "Forbes", family: "Newsreader", size: 22, weight: 700, italic: true },
  { label: "HBR", family: "Archivo", size: 17, weight: 900, ls: 2 },
  { label: "SEMrush", family: "Archivo", size: 15, weight: 700 },
  { label: "World Bank", family: "Newsreader", size: 16, weight: 700, ls: 1 },
];

// ── Fonts: load TTF from Google at render (satori can't read the repo's woff2).
// Old UA forces TTF; cached at module scope; fails soft so a hiccup degrades to
// satori's default font rather than erroring. ──────────────────────────────────
const FONTS: { family: string; weight: 400 | 600 | 700 | 900; italic?: boolean }[] = [
  { family: "Archivo", weight: 900 },
  { family: "Archivo", weight: 700 },
  { family: "Archivo", weight: 600 },
  { family: "Newsreader", weight: 700 },
  { family: "Newsreader", weight: 400, italic: true },
];

// satori can only parse TTF / OTF / TTC / WOFF — never WOFF2 or an HTML error body.
// Validate the signature so a bad response degrades to satori's default font
// instead of throwing "Offset is outside the bounds of the DataView" at build.
function isParseableFont(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 4) return false;
  const b = new Uint8Array(buf, 0, 4);
  const sig = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  return (
    sig === 0x00010000 || // TrueType
    sig === 0x4f54544f || // 'OTTO' (OpenType/CFF)
    sig === 0x74727565 || // 'true'
    sig === 0x74746366 || // 'ttcf'
    sig === 0x774f4646 //    'wOFF' (woff)
  );
}

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();
function loadFont(family: string, weight: number, italic: boolean): Promise<ArrayBuffer | null> {
  const key = `${family}@${weight}${italic ? "i" : ""}`;
  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      (async () => {
        try {
          const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
          // No &text= subset: the old User-Agent makes Google return a full TTF
          // (subsetting would force woff2, which satori cannot read).
          const css = await fetch(
            `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axis}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30",
              },
            }
          ).then((r) => r.text());
          const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
          if (!url) return null;
          const res = await fetch(url);
          if (!res.ok) return null;
          const buf = await res.arrayBuffer();
          return isParseableFont(buf) ? buf : null;
        } catch {
          return null;
        }
      })()
    );
  }
  return fontCache.get(key)!;
}

async function loadFonts() {
  const loaded = await Promise.all(
    FONTS.map(async (f) => {
      const data = await loadFont(f.family, f.weight, !!f.italic);
      return data
        ? {
            name: f.family,
            data,
            weight: f.weight as 400 | 600 | 700 | 900,
            style: (f.italic ? "italic" : "normal") as "italic" | "normal",
          }
        : null;
    })
  );
  return loaded.filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 600 | 700 | 900;
    style: "italic" | "normal";
  }[];
}

// Read the headshot from the local /public folder (always present at build time)
// and inline it as a data URI — no network, so it works during static prerender
// and never returns a 404 HTML body that would crash satori.
let headshotCache: Promise<string | null> | undefined;
function loadHeadshot(): Promise<string | null> {
  if (!headshotCache) {
    headshotCache = (async () => {
      try {
        const buf = await readFile(join(process.cwd(), "public", "og", "headshot-card.jpg"));
        return `data:image/jpeg;base64,${buf.toString("base64")}`;
      } catch {
        return null;
      }
    })();
  }
  return headshotCache;
}

function PubStrip({ dark }: { dark: boolean }) {
  const ink = dark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.52)";
  const dot = dark ? D_DIVIDER : "rgba(255,255,255,0.18)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1, minWidth: 0 }}>
      {PUBS.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {i > 0 ? (
            <div style={{ display: "flex", width: 3, height: 3, borderRadius: 3, background: dot }} />
          ) : null}
          <div
            style={{
              display: "flex",
              fontFamily: p.family,
              fontSize: p.size,
              fontWeight: p.weight,
              fontStyle: p.italic ? "italic" : "normal",
              letterSpacing: p.ls ? p.ls : 0,
              color: ink,
            }}
          >
            {p.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Headline({ lines, size, color }: { lines: string[]; size: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {lines.map((ln, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: size,
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: -size * 0.022,
            color,
          }}
        >
          {ln}
        </div>
      ))}
    </div>
  );
}

// Largest font (capped at the handoff's per-line-count size) that still fits the
// column width, so longer real titles never overflow.
function fit(lines: string[], base: number, colW: number) {
  const maxChars = Math.max(1, ...lines.map((l) => l.length));
  return Math.max(34, Math.min(base, Math.floor(colW / (maxChars * 0.55))));
}

export async function ogCard({
  eyebrow,
  title,
  subtitle,
  variant = "white",
  role = "FOUNDER · DMR.AGENCY",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  variant?: "white" | "dark";
  role?: string;
}) {
  const fonts = await loadFonts();
  const lines = title.split("\n");
  const opts = { ...OG_SIZE, fonts: fonts.length ? fonts : undefined };

  // ── Direction A — dark with circular headshot ──────────────────────────────
  if (variant === "dark") {
    const STRIP = 102;
    const hs = await loadHeadshot();
    const size = fit(lines, lines.length >= 3 ? 68 : lines.length === 2 ? 75 : 84, 800);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: W,
            height: H,
            background: D_BG,
            position: "relative",
            fontFamily: "Archivo",
          }}
        >
          {/* gold top accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(to right, rgba(245,197,24,1) 0%, rgba(245,197,24,0.6) 20%, rgba(245,197,24,0) 58%)`,
            }}
          />
          {/* gold left vertical rule */}
          <div style={{ position: "absolute", left: SAFE, top: SAFE, bottom: STRIP + 18, width: 3, background: GOLD }} />

          {/* text column */}
          <div
            style={{
              position: "absolute",
              left: SAFE + 24,
              right: 200,
              top: 0,
              bottom: STRIP,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                color: GOLD,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2.4,
                marginBottom: 24,
              }}
            >
              {eyebrow}
            </div>
            <Headline lines={lines} size={size} color={D_WHITE} />
            {subtitle ? (
              <div
                style={{
                  display: "flex",
                  color: D_MUTED,
                  fontSize: 26,
                  fontFamily: "Newsreader",
                  fontStyle: "italic",
                  lineHeight: 1.45,
                  marginTop: 22,
                  maxWidth: 660,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          {/* small, subtle circular headshot, tucked top-right (omitted if the
              image can't be fetched) */}
          {hs ? (
            <div
              style={{
                position: "absolute",
                right: SAFE,
                top: SAFE + 4,
                width: 104,
                height: 104,
                display: "flex",
                borderRadius: 52,
                overflow: "hidden",
                border: "2px solid rgba(232,226,214,0.45)",
              }}
            >
              <img src={hs} width={100} height={100} alt="Syed Irfan Ajmal headshot" style={{ objectFit: "cover" }} />
            </div>
          ) : null}

          {/* bottom strip */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: STRIP,
              background: D_STRIP,
              borderTop: `1px solid ${D_BORDER}`,
              display: "flex",
              alignItems: "center",
              paddingLeft: SAFE + 24,
              paddingRight: SAFE,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", color: D_FAINT, fontSize: 10, fontWeight: 700, letterSpacing: 2.2 }}>
                AS SEEN IN
              </div>
              <div style={{ display: "flex", width: 1, height: 20, background: D_DIVIDER }} />
              <PubStrip dark />
            </div>
            <div style={{ display: "flex", color: GOLD, fontSize: 14, fontWeight: 600 }}>@syedirfanajmal</div>
          </div>
        </div>
      ),
      opts
    );
  }

  // ── Direction C — stark white, split columns ───────────────────────────────
  const STRIPE = 12;
  const FOOTER = 96;
  const size = fit(lines, lines.length >= 3 ? 64 : lines.length === 2 ? 74 : 86, 540);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: W, height: H, background: "#FFFFFF", position: "relative", fontFamily: "Archivo" }}>
        {/* gold left stripe */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: STRIPE, background: GOLD }} />
        {/* fine top rule */}
        <div style={{ position: "absolute", top: 0, left: STRIPE, right: 0, height: 1, background: RULE }} />

        {/* split layout */}
        <div
          style={{
            position: "absolute",
            left: STRIPE + SAFE,
            right: SAFE,
            top: 0,
            bottom: FOOTER,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* left: eyebrow + headline */}
          <div
            style={{
              width: 600,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingTop: 4,
              paddingRight: 56,
            }}
          >
            <div style={{ display: "flex", color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 2.6, marginBottom: 28 }}>
              {eyebrow}
            </div>
            <div style={{ display: "flex", width: 40, height: 2, background: INK, marginBottom: 28 }} />
            <Headline lines={lines} size={size} color={INK} />
          </div>

          {/* vertical rule */}
          <div style={{ display: "flex", width: 1, background: RULE, marginTop: 56, marginBottom: 56 }} />

          {/* right: subtitle + author */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingLeft: 60,
            }}
          >
            {subtitle ? (
              <div
                style={{
                  display: "flex",
                  color: SUB,
                  fontSize: 26,
                  fontFamily: "Newsreader",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  marginBottom: 28,
                }}
              >
                {subtitle}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", color: INK, fontSize: 16, fontWeight: 700 }}>Syed Irfan Ajmal</div>
              <div style={{ display: "flex", color: GOLD, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.8, marginTop: 5 }}>
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* footer ink bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: FOOTER,
            background: INK,
            display: "flex",
            alignItems: "center",
            paddingLeft: STRIPE + SAFE,
            paddingRight: SAFE,
          }}
        >
          <div style={{ display: "flex", color: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 700, letterSpacing: 2.2 }}>
            AS SEEN IN
          </div>
          <div style={{ display: "flex", width: 1, height: 18, background: "rgba(255,255,255,0.12)", marginLeft: 18, marginRight: 18 }} />
          <PubStrip dark={false} />
          <div style={{ display: "flex", color: GOLD, fontSize: 14, fontWeight: 600 }}>@syedirfanajmal</div>
        </div>
      </div>
    ),
    opts
  );
}

// ── Direction P — photo card ─────────────────────────────────────────────────
// A photograph of a real room, with the text in a solid ink band beneath it.
// Used by the session pages, where a text-only preview is the weakest possible
// thing to put in front of an organiser who will never open the page.
//
// The photo sits ABOVE the band rather than behind the text on purpose: no scrim
// to tune, nothing sitting on a face, and legibility that cannot regress when the
// photo is swapped. Same figure-over-caption shape the pages themselves use.
//
// `photo` is a filename inside /public/og, cropped to 1200x390 ahead of time.
// A missing or unreadable file degrades to the plain ink card rather than
// throwing, so a bad asset can never fail the build.

const PHOTO_H = 390;

const photoCache = new Map<string, Promise<string | null>>();
function loadOgPhoto(file: string): Promise<string | null> {
  if (!photoCache.has(file)) {
    photoCache.set(
      file,
      (async () => {
        try {
          const buf = await readFile(join(process.cwd(), "public", "og", file));
          return `data:image/jpeg;base64,${buf.toString("base64")}`;
        } catch {
          return null;
        }
      })()
    );
  }
  return photoCache.get(file)!;
}

export async function ogPhotoCard({
  eyebrow,
  title,
  credit,
  photo,
}: {
  eyebrow: string;
  title: string;
  /** What the photograph shows. Held to the same accuracy rules as an on-page caption. */
  credit: string;
  photo: string;
}) {
  const fonts = await loadFonts();
  const opts = { ...OG_SIZE, fonts: fonts.length ? fonts : undefined };
  const img = await loadOgPhoto(photo);
  const lines = title.split("\n");
  const bandH = img ? H - PHOTO_H : H;
  const size = fit(lines, lines.length >= 3 ? 46 : lines.length === 2 ? 54 : 64, 1000);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: W,
          height: H,
          background: D_BG,
          fontFamily: "Archivo",
        }}
      >
        {img ? (
          <div style={{ display: "flex", width: W, height: PHOTO_H, overflow: "hidden" }}>
            <img src={img} width={W} height={PHOTO_H} alt="" style={{ objectFit: "cover" }} />
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: W,
            height: bandH,
            background: D_BG,
            borderTop: `3px solid ${GOLD}`,
            paddingLeft: SAFE,
            paddingRight: SAFE,
          }}
        >
          <div
            style={{
              display: "flex",
              color: GOLD,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2.4,
              marginBottom: 14,
            }}
          >
            {eyebrow}
          </div>
          <Headline lines={lines} size={size} color={D_WHITE} />
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                color: D_MUTED,
                fontSize: 19,
                fontFamily: "Newsreader",
                fontStyle: "italic",
              }}
            >
              {credit}
            </div>
            <div
              style={{ display: "flex", width: 1, height: 15, background: D_DIVIDER, marginLeft: 16, marginRight: 16 }}
            />
            <div style={{ display: "flex", color: D_FAINT, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
              SYEDIRFANAJMAL.COM
            </div>
          </div>
        </div>
      </div>
    ),
    opts
  );
}

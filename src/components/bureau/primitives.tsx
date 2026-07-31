import type { CSSProperties, ReactNode } from "react";
import { GROT, INK, INK35, INK55, INK70, PAPER, YEL } from "@/lib/tokens";

/* ---------- SCaps ----------------------------------------------------- */
type SCapsProps = {
  children: ReactNode;
  color?: string;
  size?: number;
  ls?: string;
  weight?: number;
  style?: CSSProperties;
};
export const SCaps = ({
  children,
  color,
  size = 11,
  ls = "0.16em",
  weight = 700,
  style,
}: SCapsProps) => (
  <span
    style={{
      fontFamily: GROT,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: ls,
      textTransform: "uppercase",
      color: color || INK70,
      ...style,
    }}
  >
    {children}
  </span>
);

/* ---------- Mark ------------------------------------------------------- */
export const Mark = ({ children }: { children: ReactNode; dark?: boolean }) => (
  <span
    style={{
      background: YEL,
      color: INK,
      padding: "0 0.12em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
      fontWeight: "inherit",
      fontStyle: "inherit",
    }}
  >
    {children}
  </span>
);

/* ---------- Pill ------------------------------------------------------- */
export const Pill = ({
  children,
  size = 10.5,
  ls = "0.16em",
}: {
  children: ReactNode;
  size?: number;
  ls?: string;
}) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 9px 5px",
      background: YEL,
      color: INK,
      fontFamily: GROT,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: ls,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

/* ---------- HRule ------------------------------------------------------ */
export const HRule = ({
  color,
  thick,
  style,
}: {
  color?: string;
  thick?: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={{ height: thick ? 2 : 1, background: color || INK, ...style }}
  />
);

/* ---------- DoubleRule ------------------------------------------------- */
export const DoubleRule = ({
  style,
  dark,
}: {
  style?: CSSProperties;
  dark?: boolean;
}) => (
  <div style={{ borderTop: `1px solid ${dark ? PAPER : INK}`, ...style }}>
    <div style={{ marginTop: 3, borderTop: `3px solid ${dark ? PAPER : INK}` }} />
  </div>
);

/* ---------- SectionMast ------------------------------------------------ */
export const SectionMast = ({
  n,
  label,
  dark = false,
  noVol = false,
}: {
  n: string;
  label: string;
  dark?: boolean;
  noVol?: boolean;
}) => {
  const c = dark ? PAPER : INK;
  return (
    <div style={{ marginBottom: 32 }}>
      <DoubleRule dark={dark} />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          padding: "10px 0 6px",
        }}
      >
        <Pill size={11} ls="0.18em">§ {n}</Pill>
        <SCaps color={c} size={11.5} ls="0.22em">{label}</SCaps>
        <div
          style={{
            flex: 1,
            height: 1,
            background: dark ? "rgba(250,250,250,.4)" : INK35,
          }}
        />
        {!noVol && (
          <SCaps
            color={dark ? "rgba(250,250,250,.5)" : INK55}
            size={11}
            ls="0.18em"
          >
            Vol. XV · № {n}
          </SCaps>
        )}
      </div>
      <div
        style={{
          marginTop: -1,
          borderTop: `1px solid ${dark ? "rgba(250,250,250,.6)" : INK}`,
        }}
      />
    </div>
  );
};

/* ---------- SiaLogo --------------------------------------------------- */
/* eslint-disable-next-line @next/next/no-img-element */
export const SiaLogo = ({
  height = 28,
  style,
}: {
  height?: number;
  style?: CSSProperties;
}) => (
  // Plain <img> rather than next/image: this is a tiny inline brand mark
  // used at many fixed sizes; next/image's responsive logic doesn't help here.
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/assets/sia-logo-white.png"
    alt="SIA"
    style={{ height, width: "auto", display: "block", ...style }}
  />
);

/* ---------- Flag ------------------------------------------------------ */
type FlagCode = "SE" | "DK" | "US" | "PK" | "EU" | "GB" | "AE" | "ID" | "MY";
export const Flag = ({ c, w = 24 }: { c: FlagCode; w?: number }) => {
  const h = Math.round(w * 0.625);
  const wrap: CSSProperties = {
    display: "inline-block",
    verticalAlign: "-2px",
    border: `1px solid ${INK}`,
    marginRight: 8,
  };
  if (c === "SE")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#006AA7" />
        <rect x="5" width="2" height="10" fill="#FECC00" />
        <rect y="4" width="16" height="2" fill="#FECC00" />
      </svg>
    );
  if (c === "DK")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#C8102E" />
        <rect x="5" width="2" height="10" fill="#FFFFFF" />
        <rect y="4" width="16" height="2" fill="#FFFFFF" />
      </svg>
    );
  if (c === "US")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#fff" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            y={i * (10 / 7) + (10 / 7) * 0.5 - 0.4}
            width="16"
            height="0.8"
            fill="#B22234"
          />
        ))}
        <rect width="7" height="5.5" fill="#3C3B6E" />
      </svg>
    );
  if (c === "PK")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#01411C" />
        <rect width="4" height="10" fill="#fff" />
        <circle cx="10.5" cy="5" r="2.2" fill="#fff" />
        <circle cx="11.2" cy="4.6" r="1.8" fill="#01411C" />
      </svg>
    );
  // Union Jack, simplified to the same weight as the other flags here: the
  // white and red saltires are drawn as plain diagonals rather than properly
  // counterchanged, which reads correctly at the 22px this renders at.
  if (c === "GB")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#012169" />
        <path d="M0 0 L16 10 M16 0 L0 10" stroke="#FFFFFF" strokeWidth="2.2" />
        <path d="M0 0 L16 10 M16 0 L0 10" stroke="#C8102E" strokeWidth="1.1" />
        <rect x="6" width="4" height="10" fill="#FFFFFF" />
        <rect y="3" width="16" height="4" fill="#FFFFFF" />
        <rect x="6.8" width="2.4" height="10" fill="#C8102E" />
        <rect y="3.8" width="16" height="2.4" fill="#C8102E" />
      </svg>
    );
  if (c === "AE")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect x="4" width="12" height="3.34" fill="#00732F" />
        <rect x="4" y="3.33" width="12" height="3.34" fill="#FFFFFF" />
        <rect x="4" y="6.66" width="12" height="3.34" fill="#000000" />
        <rect width="4" height="10" fill="#FF0000" />
      </svg>
    );
  if (c === "ID")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="5" fill="#CE1126" />
        <rect y="5" width="16" height="5" fill="#FFFFFF" />
      </svg>
    );
  // Malaysia, simplified like PK above: 14 stripes are kept because the count is
  // the point, but the 14-point star is a plain disc at this size.
  if (c === "MY")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#FFFFFF" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={(i * 10) / 14} width="16" height={10 / 14} fill="#CC0001" />
        ))}
        <rect width="8" height="5" fill="#010066" />
        <circle cx="3.2" cy="2.5" r="1.5" fill="#FFCC00" />
        <circle cx="3.9" cy="2.5" r="1.25" fill="#010066" />
        <circle cx="5.7" cy="2.5" r="0.85" fill="#FFCC00" />
      </svg>
    );
  if (c === "EU")
    return (
      <svg viewBox="0 0 16 10" width={w} height={h} style={wrap}>
        <rect width="16" height="10" fill="#003399" />
        <circle
          cx="8"
          cy="5"
          r="2"
          fill="none"
          stroke="#FFCC00"
          strokeWidth="0.4"
          strokeDasharray="0.6 0.65"
        />
      </svg>
    );
  return null;
};

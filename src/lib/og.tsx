import { ImageResponse } from "next/og";

// Shared Open Graph / Twitter card generator. One brand design, reused by the
// site-wide default card and every per-page card so they stay consistent.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function ogCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  // Scale the headline down for long titles so they always fit.
  const titleSize = title.length > 70 ? 60 : title.length > 45 ? 74 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0d0a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 72, height: 8, background: "#f5c518" }} />
          <div
            style={{
              marginLeft: 22,
              color: "#f5c518",
              fontSize: 24,
              letterSpacing: 5,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.04,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 36,
                marginTop: 26,
                maxWidth: 980,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#ffffff", fontSize: 30 }}>syedirfanajmal.com</div>
          <div style={{ color: "#f5c518", fontSize: 30 }}>@syedirfanajmal</div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

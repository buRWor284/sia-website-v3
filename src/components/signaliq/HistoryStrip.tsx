/**
 * HistoryStrip — three years of weekly press volume in one line (seasonality
 * plan step 2; 2026-09-15). Built once, rendered on SignalIQ opportunity cards
 * and on both KSA radars.
 *
 * Presentational only: no hooks, no fetching, so it renders on the server or
 * inside a client component alike. It takes a HistorySummary computed on the
 * server (history.ts → seasonality.ts) and prints only copy DERIVED from it.
 * Colours follow `currentColor`, so the parent's ink decides the tone.
 */
import { historyCopy, sparkSegments, type HistoryLocale, type HistorySummary } from "@/lib/signaliq/seasonality";

const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)';
const SERIF = 'var(--font-serif, Georgia, serif)';
const YEL = "var(--color-yellow, #f5b81f)";

const W = 168;
const H = 28;

export default function HistoryStrip({
  h,
  locale = "en",
  label,
  className,
}: {
  h: HistorySummary | null | undefined;
  locale?: HistoryLocale;
  /** Optional mono label before the sparkline (defaults to the span, e.g. "3 YR"). */
  label?: string;
  className?: string;
}) {
  if (!h) return null;
  const c = historyCopy(h, locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  if (c.fresh) {
    return (
      <div className={className} dir={dir} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>
        {c.fresh}
      </div>
    );
  }

  const segs = sparkSegments(h.spark, W, H);
  const n = h.spark.length;
  const lastVal = h.spark[n - 1];
  const vals = h.spark.filter((x): x is number => x !== null);
  const mx = Math.max(...vals, 1);
  const yearTicks = [52, 104].filter((k) => n - 1 - k > 0).map((k) => ((n - 1 - k) / (n - 1)) * W);

  return (
    <div className={className} dir={dir} style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            flexShrink: 0,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            border: "1px solid currentColor",
            padding: "2px 5px",
            opacity: 0.75,
          }}
        >
          {label ?? c.span}
        </span>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={c.aria}
          // Not mirrored on Arabic pages: time runs left to right, the same house rule
          // as the Arabic radar's scatter plot (a chart is not a text direction).
          style={{ flexShrink: 0, overflow: "visible" }}
        >
          <line x1={0} y1={H - 0.5} x2={W} y2={H - 0.5} stroke="currentColor" strokeOpacity={0.18} strokeWidth={1} />
          {yearTicks.map((x) => (
            <line key={x} x1={x} y1={2} x2={x} y2={H} stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} strokeDasharray="2 2" />
          ))}
          {segs.map((pts, i) => (
            <polyline key={i} points={pts} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {lastVal !== null && lastVal !== undefined && (
            <circle cx={W} cy={H - 2 - (lastVal / mx) * (H - 4)} r={2.6} fill={YEL} stroke="currentColor" strokeWidth={0.8} />
          )}
        </svg>
      </div>
      <span style={{ display: "flex", flexDirection: "column", gap: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, lineHeight: 1.4 }}>
        {c.yoy && <span style={{ opacity: 0.85 }}>{c.yoy}</span>}
        {c.season && <span style={{ opacity: 0.85 }}>{c.season}</span>}
        {!c.yoy && !c.season && <span style={{ opacity: 0.6 }}>{locale === "ar" ? "لا يوجد موسم متكرر" : "No repeating season"}</span>}
      </span>
    </div>
  );
}

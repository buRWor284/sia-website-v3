/**
 * SeasonCalendar — "what usually peaks in the next 8 weeks" (seasonality plan
 * step 3; 2026-09-15). Replaces the hand-curated catalyst calendar that was
 * deferred on the KSA radars: every entry here comes from a signal's own three
 * years of weekly press counts (SeasonPeak in seasonality.ts), so nothing is
 * typed in and nothing goes stale.
 *
 * Presentational, no hooks: works inside the client radar modules and on the
 * server-rendered Arabic pages. Self-contained styles under `.hs-cal`.
 */
import { ltr, monthPhrase, shortDate, type HistoryLocale, type SeasonPeak } from "@/lib/signaliq/seasonality";

export interface SeasonItem {
  id: string;
  name: string;
  peak: SeasonPeak;
}

const CSS = `
.hs-cal{border:1px solid currentColor;display:grid;grid-template-columns:repeat(var(--hs-cols),minmax(0,1fr));}
.hs-cal-col{border-inline-start:1px solid color-mix(in srgb,currentColor 18%,transparent);min-height:92px;display:flex;flex-direction:column;}
.hs-cal-col:first-child{border-inline-start:0;}
.hs-cal-col[data-now="true"]{background:color-mix(in srgb,var(--color-yellow,#f5b81f) 16%,transparent);}
.hs-cal-head{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:6px 6px 5px;border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent);opacity:.8;white-space:nowrap;}
.hs-cal-body{display:flex;flex-direction:column;gap:4px;padding:6px;}
.hs-cal-chip{all:unset;box-sizing:border-box;display:block;cursor:default;font-family:var(--font-grot,Archivo,sans-serif);font-size:10.5px;font-weight:600;line-height:1.2;padding:3px 5px;border:1px solid currentColor;background:var(--hs-paper,transparent);}
button.hs-cal-chip{cursor:pointer;}
button.hs-cal-chip:hover,button.hs-cal-chip:focus-visible{background:var(--color-yellow,#f5b81f);}
.hs-cal-chip small{display:block;font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:8px;font-weight:600;letter-spacing:.06em;opacity:.7;margin-top:1px;}
.hs-cal-foot{font-family:var(--font-serif,Georgia,serif);font-style:italic;font-size:11.5px;opacity:.75;margin-top:8px;line-height:1.45;}
@media (max-width:720px){
  .hs-cal{grid-template-columns:1fr;}
  .hs-cal-col{border-inline-start:0;border-top:1px solid color-mix(in srgb,currentColor 18%,transparent);min-height:0;flex-direction:row;align-items:flex-start;}
  .hs-cal-col:first-child{border-top:0;}
  .hs-cal-col[data-empty="true"]{display:none;}
  .hs-cal-head{border-bottom:0;width:92px;flex-shrink:0;padding-top:9px;}
  .hs-cal-body{flex:1;flex-direction:row;flex-wrap:wrap;}
}
`;

const T = {
  en: {
    thisWeek: "This week",
    inSeason: "in season",
    none: (weeks: number) => `No tracked signal has its usual peak in the next ${weeks} weeks.`,
    later: (name: string, when: string, wks: number) => `Next after that: ${name}, about ${when} (in ${wks} wks).`,
    lunar: "moves earlier each year",
    ratio: (r: number) => `${r.toFixed(1)}× usual`,
  },
  ar: {
    thisWeek: "هذا الأسبوع",
    inSeason: "في موسمه",
    none: (weeks: number) => `لا توجد إشارة متتبعة تبلغ ذروتها المعتادة خلال ${weeks} أسابيع القادمة.`,
    later: (name: string, when: string, wks: number) => `التالي بعد ذلك: ${name}، قرابة ${when} (بعد ${wks} أسبوعًا).`,
    lunar: "يتقدم كل عام",
    ratio: (r: number) => `${ltr(`${r.toFixed(1)}×`)} المعتاد`,
  },
};

export default function SeasonCalendar({
  items,
  thisMonday,
  weeks = 8,
  locale = "en",
  onSelect,
  selectedId,
}: {
  items: SeasonItem[];
  /** Monday (YYYY-MM-DD) of the current week, computed on the server. */
  thisMonday: string;
  weeks?: number;
  locale?: HistoryLocale;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const t = T[locale];
  const cols = Array.from({ length: weeks + 1 }, (_, i) => {
    const d = new Date(thisMonday + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 7 * i);
    return d.toISOString().slice(0, 10);
  });
  // In season now (peaked within 2 weeks) sits in "this week"; the rest by weeksUntil.
  const colOf = (p: SeasonPeak): number | null =>
    p.weeksSinceLast <= 2 ? 0 : p.weeksUntil <= weeks ? p.weeksUntil : null;
  const placed = cols.map(() => [] as SeasonItem[]);
  const later: SeasonItem[] = [];
  for (const it of items) {
    const c = colOf(it.peak);
    if (c === null) later.push(it);
    else placed[c].push(it);
  }
  placed.forEach((arr) => arr.sort((a, b) => b.peak.ratio - a.peak.ratio));
  later.sort((a, b) => a.peak.weeksUntil - b.peak.weeksUntil);
  const any = placed.some((a) => a.length > 0);

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <style>{CSS}</style>
      {any ? (
        <div className="hs-cal" style={{ ["--hs-cols" as string]: cols.length } as React.CSSProperties}>
          {cols.map((mon, i) => (
            <div className="hs-cal-col" key={mon} data-now={i === 0} data-empty={placed[i].length === 0}>
              <div className="hs-cal-head">{i === 0 ? t.thisWeek : shortDate(mon, locale).replace(/ \d{4}$/, "")}</div>
              <div className="hs-cal-body">
                {placed[i].map((it) => {
                  const sub = i === 0 && it.peak.weeksSinceLast <= 2 ? t.inSeason : t.ratio(it.peak.ratio);
                  const title = `${it.name} · ${monthPhrase(it.peak.nextWeekStart, locale)}${it.peak.lunar ? ` · ${t.lunar}` : ""}`;
                  const inner = (
                    <>
                      {it.name}
                      <small>{sub}</small>
                    </>
                  );
                  return onSelect ? (
                    <button
                      type="button"
                      key={it.id}
                      className="hs-cal-chip"
                      title={title}
                      aria-pressed={selectedId === it.id}
                      onClick={() => onSelect(it.id)}
                    >
                      {inner}
                    </button>
                  ) : (
                    <span key={it.id} className="hs-cal-chip" title={title}>
                      {inner}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="hs-cal-foot">{t.none(weeks)}</p>
      )}
      {later[0] && (
        <p className="hs-cal-foot">
          {t.later(later[0].name, monthPhrase(later[0].peak.nextWeekStart, locale), later[0].peak.weeksUntil)}
        </p>
      )}
    </div>
  );
}

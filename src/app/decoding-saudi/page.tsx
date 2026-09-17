import type { Metadata } from "next";
import { Colophon } from "@/components/bureau";
import "./decoding-saudi.css";

// Hidden 2026-09-17: not in nav, not on home page, not in sitemap.ts. Same
// "hidden data cut" convention as the ksa-culture beat it reads from
// (src/lib/signaliq/config.ts) and as ksa-tourism-radar/ksa-retail-radar
// used before they went public. Direct-URL only, for Megha S Anthony
// (Content Head, Athar Festival) to support a moderator-seat ask on a
// "Decoding Saudi" conference stream.
export const metadata: Metadata = {
  title: "Decoding Saudi: Sport & Entertainment Press Signal",
  description:
    "A live read of English and Arabic press volume on Saudi sport and entertainment topics, via SignalIQ. Real volume concentrates in sport and entertainment; the wider culture category mostly has no English press.",
  robots: { index: false, follow: false },
};

// Snapshot data, not live-wired. These are real counts from a BigQuery test
// scan of the ksa-culture beat (src/lib/signaliq/config.ts) on 2026-09-17,
// the same day the beat itself went live, and there is no backfill history yet
// for a live query to show anything meaningful, so this page states the
// known numbers directly rather than pretending to be a live feed.
type Row = {
  topic: string;
  count: number;
  lang: "EN" | "AR";
  window: "14d" | "60d";
  weak?: boolean;
};

const ROWS: Row[] = [
  { topic: "Saudi Pro League", count: 385, lang: "EN", window: "14d" },
  { topic: "Esports World Cup", count: 44, lang: "EN", window: "14d" },
  { topic: "Saudi football", count: 34, lang: "EN", window: "14d" },
  { topic: "Saudi National Day", count: 23, lang: "EN", window: "14d" },
  { topic: "Riyadh Season", count: 23, lang: "EN", window: "14d" },
  { topic: "Saudi Grand Prix", count: 4, lang: "EN", window: "14d" },
  { topic: "Saudi Grand Prix", count: 15, lang: "AR", window: "60d" },
  { topic: "Saudi film industry", count: 2, lang: "EN", window: "14d" },
  { topic: "Saudi film industry", count: 13, lang: "AR", window: "60d" },
  { topic: "Saudi esports", count: 3, lang: "EN", window: "14d", weak: true },
  { topic: "Saudi motorsport", count: 1, lang: "EN", window: "14d", weak: true },
  { topic: "Saudi cinema", count: 2, lang: "EN", window: "14d", weak: true },
];

export default function DecodingSaudiPage() {
  return (
    <>
      <main className="dsg-wrap">
        <div className="dsg-scaps">SignalIQ · Press signal cut</div>
        <h1 className="dsg-h1">Decoding Saudi: Sport &amp; Entertainment Press Signal</h1>
        <p className="dsg-body-lg">
          A live read of English (and, where noted, Arabic) press volume on Saudi sport and entertainment topics,
          pulled via SignalIQ (GDELT-based monitoring). Counts below cover the last 14 days, or the last 60 days
          where marked.
        </p>

        <section className="dsg-section">
          <h2 className="dsg-h2">Where the volume is</h2>
          <div className="dsg-table-wrap">
            <table className="dsg-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Articles</th>
                  <th>Language</th>
                  <th>Window</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr key={`${r.topic}-${r.lang}-${i}`}>
                    <td className="dsg-topic">
                      {r.topic}
                      {r.weak ? <span className="dsg-lang"> · low priority</span> : null}
                    </td>
                    <td className="dsg-count">{r.count}</td>
                    <td className="dsg-lang">{r.lang}</td>
                    <td className="dsg-window">{r.window}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dsg-body" style={{ marginTop: 14 }}>
            Saudi Pro League carries the most English press volume by a wide margin. Saudi Grand Prix and Saudi film
            industry show only a handful of English articles in 14 days, but a meaningfully larger Arabic-language
            count over 60 days: Arabic press notably outweighs English on both of those topics. Saudi esports,
            Saudi motorsport and Saudi cinema are kept here as low-priority context: real, but weak.
          </p>
        </section>

        <div className="dsg-note">
          <p className="dsg-body">
            Broader &quot;Saudi culture&quot; topics (film festivals, streaming, youth culture, and similar) were
            tested and did not show meaningful English press volume in this window. This cut only shows where real
            signal exists, not where we expected it to.
          </p>
        </div>

        <p className="dsg-micro">Data as of 17 Sep 2026, via SignalIQ.</p>
      </main>

      <Colophon />
    </>
  );
}

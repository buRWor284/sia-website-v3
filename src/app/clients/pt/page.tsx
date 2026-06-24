import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physicians Thrive · Client Workspace",
  description: "Private workspace for Physicians Thrive.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/pt" },
};

const NAVY = "#0a3454";
const BLUE = "#0c6cb4";
const GOLD = "#f0c000";
const INK = "#243240";
const GRAY = "#6c6c6c";
const LINE = "#dbe6f1";
const BG = "#f3f7fb";

type Asset = { href: string; title: string; desc: string; tag: string; cta: string };

const ASSETS: Asset[] = [
  {
    href: "/clients/pt/leverage-score.html",
    title: "Negotiation Leverage Score",
    desc: "Interactive engine: pick a specialty, region, and state to see a 0-100 bargaining-power score, the levers most worth pushing, and a tailored readout. Every figure cites a report page.",
    tag: "Interactive demo",
    cta: "Open the tool →",
  },
  {
    href: "/clients/pt/salary-estimator.html",
    title: "Physician Salary Estimator",
    desc: "Salary range, median, and total-compensation breakdown by specialty and region, with provenance chips marking every number as reported, derived, estimated, or not reported.",
    tag: "Interactive demo",
    cta: "Open the tool →",
  },
  {
    href: "/clients/pt/report-2020.pdf",
    title: "2020 Physician Compensation Report",
    desc: "The source report behind both tools (Physicians Thrive, 2020). Provided for reference.",
    tag: "PDF · reference",
    cta: "Open the PDF →",
  },
];

export default function PtClientWorkspace() {
  return (
    <main
      style={{
        background: BG,
        minHeight: "100vh",
        color: INK,
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
      }}
    >
      <section style={{ background: `linear-gradient(155deg, ${BLUE} 0%, ${NAVY} 120%)`, color: "#fff", padding: "48px 0 64px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: ".4px", marginBottom: 16 }}>
            Private workspace · Physicians Thrive
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, maxWidth: 720 }}>
            Physicians Thrive: client workspace
          </h1>
          <p style={{ marginTop: 12, maxWidth: 640, opacity: 0.92, fontSize: 16 }}>
            Working assets prepared by Syed Irfan Ajmal. These are shared privately for review and are not published publicly.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gap: 16, marginTop: -36 }}>
          {ASSETS.map((a) => (
            <a key={a.href} href={a.href} style={{ display: "block", textDecoration: "none", color: INK, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, boxShadow: "0 18px 44px -32px rgba(10,52,84,.5)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <h2 style={{ fontSize: 19, color: NAVY, fontWeight: 800 }}>{a.title}</h2>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: BLUE, background: "rgba(12,108,180,.1)", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{a.tag}</span>
              </div>
              <p style={{ marginTop: 8, fontSize: 14, color: GRAY, lineHeight: 1.55 }}>{a.desc}</p>
              <span style={{ marginTop: 14, display: "inline-block", background: GOLD, color: "#2a2200", fontWeight: 700, fontSize: 13, padding: "9px 16px", borderRadius: 7 }}>{a.cta}</span>
            </a>
          ))}
        </div>

        <p style={{ margin: "26px 0 60px", fontSize: 12, color: GRAY, lineHeight: 1.6 }}>
          Source for both tools: Physicians Thrive 2020 Physician Compensation Report. Figures are tagged reported / derived; scores are derived. Data gaps are shown as “not separately reported.”
        </p>
      </section>
    </main>
  );
}

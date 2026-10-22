import type { Metadata } from "next";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { CALENDLY } from "@/lib/tokens";
import "./residency.css";

// EMOS Residency: Irfan embeds inside one company for a set period and builds
// its earned media system from the inside, the way a forward deployed
// engineer works (see memory: areas/emos-residency). Built 2026-10-22 as a
// "simple quick page". Deliberately carries NO price, duration or guarantee:
// none has been decided yet, so the page sends people to a call instead.
// Hidden for now (noindex, not in nav or sitemap.ts), same convention as
// /decoding-saudi. To make it public: drop `robots`, add it to sitemap.ts.
export const metadata: Metadata = {
  title: "EMOS Residency · Earned Media, Built From Inside Your Company",
  description:
    "Syed Irfan Ajmal joins your team for a set period, runs EMOS on your real stories and journalists, and hands over an earned media system your team keeps.",
  alternates: { canonical: "/emos-residency" },
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    n: "01",
    t: "Embed",
    d: "I join your team: your Slack, your standups, your founders and your customers. I learn the product and find the stories only your company can tell.",
  },
  {
    n: "02",
    t: "Build",
    d: "We run EMOS together every day on real work: story signals, journalist lists, scored pitches, follow-ups, and every reply and placement logged.",
  },
  {
    n: "03",
    t: "Hand over",
    d: "The person who worked beside me runs it on their own. The playbook, the journalist relationships and the records stay with you.",
  },
];

const COMPARE: { row: string; academy: string; residency: string; agency: string }[] = [
  {
    row: "Who does the work",
    academy: "Your team, coached by me on live weekly calls",
    residency: "Me and your team, side by side",
    agency: "The agency",
  },
  {
    row: "Where",
    academy: "Cohort calls, remote",
    residency: "Inside your company",
    agency: "Outside your company",
  },
  {
    row: "What you keep",
    academy: "The system and the skills",
    residency: "The system, a trained operator, and the journalist relationships",
    agency: "Little once the retainer stops",
  },
  {
    row: "Best for",
    academy: "Founders with time to learn it themselves",
    residency: "Teams that want it built and running fast",
    agency: "Teams that want to rent output",
  },
];

function Bar({ n, t, tag }: { n: string; t: string; tag: string }) {
  return (
    <div className="res-bar">
      <span className="res-bar-n">§ {n}</span>
      <span className="res-bar-t">{t}</span>
      <span className="res-bar-tag">{tag}</span>
    </div>
  );
}

export default function EmosResidencyPage() {
  return (
    <>
      <main className="res-wrap">
        {/* HERO */}
        <section className="res-hero">
          <span className="res-chip">EMOS Residency</span>
          <h1 className="res-h1">I move into your company and build your earned media engine from the inside.</h1>
          <p className="res-lede">
            Like a forward deployed engineer, but for earned media. I work inside your team for a set period, run{" "}
            <Link href="/emos-platform" className="res-mark" style={{ color: "inherit" }}>EMOS</Link> on your real stories and
            journalists, and leave behind <span className="res-mark">a system your own people run</span> without me.
          </p>
          <div className="res-hero-cta">
            <Link href={CALENDLY} className="res-btn">Book a 30-minute call →</Link>
            <a href="mailto:sia@syedirfanajmal.com?subject=EMOS%20Residency" className="res-link">or email me</a>
          </div>
        </section>

        {/* § 01 HOW IT WORKS */}
        <section className="res-sec">
          <Bar n="01" t="How it works" tag="Embed · Build · Hand over" />
          <div className="res-grid3" style={{ borderTop: 0 }}>
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="res-step-n">Step {s.n}</div>
                <h3 className="res-h3">{s.t}</h3>
                <p className="res-small">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* § 02 COMPARE */}
        <section className="res-sec">
          <Bar n="02" t="Residency, Academy or agency" tag="Pick the right fit" />
          <div className="res-table-wrap" style={{ borderTop: 0 }}>
            <table className="res-table">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Compare</span></th>
                  <th scope="col"><Link href="/emos-academy" style={{ color: "inherit" }}>EMOS Academy</Link></th>
                  <th scope="col" className="res-col-hi">EMOS Residency</th>
                  <th scope="col">PR agency</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.row}>
                    <th scope="row">{r.row}</th>
                    <td>{r.academy}</td>
                    <td className="res-col-hi">{r.residency}</td>
                    <td>{r.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* § 03 FIT */}
        <section className="res-sec">
          <Bar n="03" t="Who it fits" tag="Honest filter" />
          <div className="res-box">
            <div className="res-fit">
              <div>
                <span className="res-chip">A good fit</span>
                <ul>
                  <li>You have customers, results or a strong point of view worth covering.</li>
                  <li>One person on your team can take the system over when I leave.</li>
                  <li>Your founders can give time for interviews and quotes.</li>
                </ul>
              </div>
              <div>
                <span className="res-chip" style={{ background: "var(--color-paper-2)" }}>Not a fit</span>
                <ul>
                  <li>You want paid or guaranteed placements bought for you.</li>
                  <li>You want an outside team to do it forever with nobody inside learning it.</li>
                  <li>There is nothing new to say yet.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* § 04 WHO */}
        <section className="res-sec">
          <Bar n="04" t="Who you get" tag="Syed Irfan Ajmal" />
          <div className="res-box">
            <p className="res-p">
              I have spent 22 years in business, tech and marketing, the last 13 running{" "}
              <a href="https://dmr.agency" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>DMR.agency</a>.
              I have written for Forbes Middle East, HuffPost and TNW, and was{" "}
              <a href="https://hbr.org/2019/12/how-to-motivate-your-team-during-crunch-time" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                featured as a case study in HBR
              </a>
              . EMOS is the system I built from that work, and the Residency is me running it with you.
            </p>
            <div className="res-stats">
              <div><div className="res-stat-v">300+</div><div className="res-stat-l">clients across the US, EU and Gulf</div></div>
              <div><div className="res-stat-v">$160K → $1.2M</div><div className="res-stat-l">monthly organic revenue, National Tyres and Autocare</div></div>
              <div><div className="res-stat-v">0 → 1.5M</div><div className="res-stat-l">monthly organic visits, Ridester</div></div>
              <div><div className="res-stat-v">50+</div><div className="res-stat-l">international speaking engagements</div></div>
            </div>
          </div>
        </section>

        {/* CLOSE */}
        <section className="res-close">
          <span className="res-chip">One company at a time</span>
          <h2 className="res-h2">Length and scope are set per company, after one call.</h2>
          <p>
            Tell me what you sell and where you want to be covered. If a Residency is the right fit, I will say so. If the
            Academy or the EMOS Platform on its own would serve you better, I will say that instead.
          </p>
          <div className="res-hero-cta">
            <Link href={CALENDLY} className="res-btn">Book a 30-minute call →</Link>
            <a href="mailto:sia@syedirfanajmal.com?subject=EMOS%20Residency" className="res-link">sia@syedirfanajmal.com</a>
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}

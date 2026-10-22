/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { CALENDLY } from "@/lib/tokens";
import { EARNED_MEDIA_STATS } from "@/components/emos-platform/landing/content";
import "./residency.css";

// EMOS Residency: Irfan embeds inside one company for a set period and builds
// its earned media system from the inside, the way a forward deployed
// engineer works (see memory: areas/emos-residency).
// v1 2026-10-22: "simple quick page". v2 same day (Irfan: "too thin", "make
// the hero more persuasive"): two-column hero with a real EMOS screen
// (PressIQ unscored -> 73, the same crossfade as /emos-platform) and Irfan's
// portrait pinned over it; "what you keep" strip; sourced earned-media stats
// (EARNED_MEDIA_STATS, shared with /emos-platform so they never drift);
// outlet marquee + testimonials + fit + built-by reused from /emos-academy;
// tool chain with /emos-platform screenshots.
// Deliberately carries NO price, duration, location or guarantee: none has
// been decided, so the page sends people to a call instead.
// Hidden (noindex, not in nav or sitemap.ts), same convention as
// /decoding-saudi. emoshq.com/residency redirects here (next.config.ts).
export const metadata: Metadata = {
  title: "EMOS Residency · Earned Media, Built From Inside Your Company",
  description:
    "Syed Irfan Ajmal joins your team for a set period, runs EMOS on your real stories and journalists, and hands over an earned media system your team keeps.",
  alternates: { canonical: "/emos-residency" },
  robots: { index: false, follow: false },
};

const SHOTS = "/assets/emos-platform";
const HBR_CASE_STUDY = "https://hbr.org/2019/12/how-to-motivate-your-team-during-crunch-time";
const FORBES_AUTHOR_PAGE = "https://www.forbesmiddleeast.com/author/syed-irfan-ajmal";

const LEAVE_BEHIND = [
  { h: "A trained operator", d: "Someone on your team who has run it with me, daily" },
  { h: "A journalist list", d: "Saved, with why each person is on it" },
  { h: "A pitch library", d: "Every draft and score, ready to reuse" },
  { h: "A placement log", d: "Pitches, replies and coverage in one record" },
];

const STEPS = [
  { n: "01", t: "Embed", d: "I join your team: your Slack, your standups, your founders and your customers. I learn the product and find the stories only your company can tell." },
  { n: "02", t: "Build", d: "We run EMOS together every day on real work: story signals, journalist lists, scored pitches, follow-ups, and every reply and placement logged." },
  { n: "03", t: "Hand over", d: "The person who worked beside me runs it on their own. The playbook, the journalist relationships and the records stay with you." },
];

const TOOLS = [
  { n: "00", tool: "Company Brief", promise: "Your story, written once and used by every tool.", img: "S2c-brief-approved.webp", alt: "An approved company brief in EMOS" },
  { n: "01", tool: "SignalIQ", promise: "Find what editors are already covering in your beat.", img: "S3a-radar-results.webp", alt: "SignalIQ showing ranked story opportunities" },
  { n: "02", tool: "AssetIQ", promise: "Build the report or tool a journalist will cite.", img: "S3b-asset-pack.webp", alt: "A SignalIQ asset pack used by AssetIQ" },
  { n: "03", tool: "JournoCollabIQ", promise: "Pitch the people who actually cover your story.", img: "S4-journalist-list-blurred.webp", alt: "A saved journalist list, names blurred" },
  { n: "04", tool: "PressIQ", promise: "Draft and score every pitch before it goes out.", img: "S1c-score-73-strongest-line.webp", alt: "A pitch scored 73 out of 100 in PressIQ" },
  { n: "05", tool: "CoverageIQ", promise: "Show the board what the work produced.", img: "S6-coverageiq-pipeline.webp", alt: "CoverageIQ pipeline with logged pitches" },
];

const COMPARE: { row: string; academy: string; residency: string; agency: string }[] = [
  { row: "Who does the work", academy: "Your team, coached by me on live weekly calls", residency: "Me and your team, side by side", agency: "The agency" },
  { row: "Where", academy: "Cohort calls, remote", residency: "Inside your company", agency: "Outside your company" },
  { row: "What you keep", academy: "The system and the skills", residency: "The system, a trained operator, and the journalist relationships", agency: "Little once the retainer stops" },
  { row: "Best for", academy: "Founders with time to learn it themselves", residency: "Teams that want it built and running fast", agency: "Teams that want to rent output" },
];

const OUTLETS_A = ["Forbes", "Yahoo", "Business Insider", "MSN", "AOL", "Reader's Digest", "Apartment Therapy", "Healthline"];
const OUTLETS_B = ["MarketWatch", "Bankrate", "Mashable", "Entrepreneur", "The Mirror", "The Next Web", "GoBankingRates", "Consumer Health Digest"];

const PROOF = [
  { stat: "0 → 1.5M", label: "Monthly visitors · Ridester", q: "“Syed and the team's expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success.”", who: "Brett Helling, Ridester", photo: "/assets/testimonials/brett-helling.jpeg", href: "https://www.dmr.agency/case-studies/ridester-seo/" },
  { stat: "+120%", label: "Organic traffic · Centriq", q: "“Our organic traffic increased by 120%. Our public database clicks grew by 515%. We saw a 6x increase in average daily signups.”", who: "Imani Lea Brown, Centriq", photo: "/assets/testimonials/imani-lea-brown.jpg", href: "https://www.dmr.agency/case-studies/centriq-digital-pr-growth/" },
  { stat: "+140%", label: "Traffic in 3 months · Dinar Standard", q: "“They earned high-authority backlinks from Reader's Digest and MSN. Traffic increased by 140% in 3 months against a 25%/9-month goal.”", who: "Reem El Shafaki, Dinar Standard", photo: "/assets/testimonials/reem-el-shafaki.jpg", href: "https://www.dmr.agency/case-studies/government-portal-seo/" },
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

function CTAs({ email = "or email me" }: { email?: string }) {
  return (
    <div className="res-hero-cta">
      <Link href={CALENDLY} className="res-btn">Book a 30-minute call →</Link>
      <a href="mailto:sia@syedirfanajmal.com?subject=EMOS%20Residency" className="res-link">{email}</a>
    </div>
  );
}

export default function EmosResidencyPage() {
  return (
    <>
      <main className="res-wrap">
        {/* HERO: copy left, "me + the system" visual right */}
        <section className="res-hero2">
          <div className="res-hero-copy">
            <span className="res-chip">EMOS Residency · One company at a time</span>
            <h1 className="res-h1">I move into your company and build your earned media engine from the inside.</h1>
            <p className="res-lede">
              Agencies rent you coverage and leave with the know-how. A Residency works like a forward deployed engineer:
              I sit inside your team, run <Link href="/emos-platform" style={{ color: "inherit" }}>EMOS</Link> on your real
              stories and journalists, and leave behind <span className="res-mark">a system your own people run</span>.
            </p>
            <CTAs />
            <div className="res-proofline" aria-label="Credentials">
              <span>Case study in HBR</span>
              <span>Quoted in Forbes (USA)</span>
              <span>300+ clients since 2013</span>
            </div>
          </div>
          <div className="res-hero-vis">
            <div className="res-shot">
              <div className="res-shot-bar"><i>EMOS · PressIQ · your pitch</i><span>Live</span></div>
              <div className="res-xf">
                <img className="res-xf-a" src={`${SHOTS}/S1a-pitch-before-score.webp`} alt="A pitch drafted in PressIQ, before scoring" width={1389} height={868} loading="eager" decoding="async" />
                <img className="res-xf-b" src={`${SHOTS}/S1c-score-73-strongest-line.webp`} alt="The same pitch scored 73 out of 100, with its strongest line quoted" width={1312} height={924} loading="eager" decoding="async" />
              </div>
            </div>
            <div className="res-badge">
              <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" width={54} height={54} />
              <div>
                <div className="res-badge-name">Syed Irfan Ajmal</div>
                <div className="res-badge-role">Embedded in your team</div>
                <div className="res-badge-cred">13 years running DMR.agency</div>
              </div>
            </div>
            <p className="res-vis-cap">Every pitch is drafted for one journalist and scored before it is sent. That habit is what your team keeps.</p>
          </div>
        </section>
        <div className="res-leave" aria-label="What you keep when the Residency ends">
          <div className="res-leave-h">What you keep</div>
          {LEAVE_BEHIND.map((x) => (
            <div key={x.h}><b>{x.h}</b>{x.d}</div>
          ))}
        </div>

        {/* WHY EARNED MEDIA (sourced, shared with /emos-platform) */}
        <section className="res-sec">
          <Bar n="01" t="Why earned media, why now" tag="Every number sourced" />
          <div className="res-why">
            {EARNED_MEDIA_STATS.map((s) => (
              <div key={s.text}>
                <p>{s.text}</p>
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.src}</a>
              </div>
            ))}
          </div>
          <div className="res-marquee emos-marquee-section" style={{ padding: "16px 0 6px" }}>
            <p className="emos-marquee-label" style={{ marginBottom: 10 }}>Where we&apos;ve placed clients</p>
            <div className="emos-marquee-track">{[...OUTLETS_A, ...OUTLETS_A].map((n, i) => <span key={i}>{n}</span>)}</div>
            <div className="emos-marquee-track emos-marquee-track-rev">{[...OUTLETS_B, ...OUTLETS_B].map((n, i) => <span key={i}>{n}</span>)}</div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="res-sec">
          <Bar n="02" t="How a Residency works" tag="Embed · Build · Hand over" />
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

        {/* TOOL CHAIN */}
        <section className="res-sec">
          <Bar n="03" t="What we run together" tag="The EMOS chain, on your company" />
          <div className="res-tools">
            {TOOLS.map((t) => (
              <div key={t.n}>
                <div className="res-tool-img"><img src={`${SHOTS}/${t.img}`} alt={t.alt} loading="lazy" decoding="async" /></div>
                <div className="res-tool-txt">
                  <div className="res-tool-n">Step {t.n}</div>
                  <div className="res-tool-name">{t.tool}</div>
                  <p className="res-small">{t.promise}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARE */}
        <section className="res-sec">
          <Bar n="04" t="Residency, Academy or agency" tag="Pick the right fit" />
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

        {/* PROOF */}
        <section className="res-sec">
          <Bar n="05" t="Proof" tag="Same system · their results" />
          <div className="res-proof">
            {PROOF.map((p) => (
              <div key={p.who}>
                <div className="res-proof-stat">{p.stat}</div>
                <div className="res-step-n">{p.label}</div>
                <p className="res-proof-q">{p.q}</p>
                <div className="res-proof-who">
                  <img src={p.photo} alt={p.who} loading="lazy" />
                  <div>{p.who}<br /><a href={p.href} target="_blank" rel="noopener noreferrer">Case study →</a></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FIT */}
        <section className="res-sec">
          <Bar n="06" t="Who it fits" tag="Honest filter" />
          <div className="res-fit2">
            <div className="bad">
              <span className="res-chip" style={{ background: "var(--color-paper-2)" }}>Not a fit</span>
              <ul>
                <li>You want paid or guaranteed placements bought for you.</li>
                <li>You want an outside team to do it forever, with nobody inside learning it.</li>
                <li>Your founders are not ready to be quoted by name.</li>
                <li>There is nothing new to say yet.</li>
              </ul>
            </div>
            <div className="good">
              <span className="res-chip">A good fit</span>
              <ul>
                <li>You have customers, results or a strong point of view worth covering.</li>
                <li>One person on your team can take the system over when I leave.</li>
                <li>Your founders can give time for interviews and quotes.</li>
                <li>You want this running in weeks, not learned over a year.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* BUILT BY */}
        <section className="res-sec">
          <Bar n="07" t="Who moves in" tag="Syed Irfan Ajmal" />
          <div className="res-built">
            <div>
              <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" loading="lazy" />
              <div className="res-cred"><span>Written and cited in</span><a href={FORBES_AUTHOR_PAGE} target="_blank" rel="noopener noreferrer">Forbes Middle East</a>, HuffPost, TNW, <a href={HBR_CASE_STUDY} target="_blank" rel="noopener noreferrer">HBR (case study)</a></div>
              <div className="res-cred"><span>Speaker</span>50+ international talks</div>
            </div>
            <div>
              <h2 className="res-h3" style={{ fontSize: 30, marginTop: 0 }}>Someone who has been on both sides of the journalist&apos;s inbox.</h2>
              <p className="res-quote">EMOS is what I learned sending pitches as an agency operator and reading them as a columnist. The Residency is me running it inside your company until your team can run it without me.</p>
              <p className="res-p">
                22 years in business, tech and marketing, the last 13 running{" "}
                <a href="https://www.dmr.agency/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>DMR.agency</a>.
                Before that I co-founded an award-winning geo-spatial startup and ran marketing at two self-funded, profitable ventures.
              </p>
              <div className="res-stats">
                <div><div className="res-stat-v">300+</div><div className="res-stat-l">clients across the US, EU and Gulf</div></div>
                <div><div className="res-stat-v">$160K → $1.2M</div><div className="res-stat-l">monthly organic revenue, National Tyres and Autocare</div></div>
                <div><div className="res-stat-v">0 → 1.5M</div><div className="res-stat-l">monthly organic visits, Ridester</div></div>
                <div><div className="res-stat-v">100+</div><div className="res-stat-l">publications with my byline or name</div></div>
              </div>
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
          <CTAs email="sia@syedirfanajmal.com" />
        </section>
      </main>
      <Colophon />
    </>
  );
}

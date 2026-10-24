/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { CALENDLY } from "@/lib/tokens";
import { EARNED_MEDIA_STATS } from "@/components/emos-platform/landing/content";
import "../emos-residency/residency.css";
import "./emoshq.css";

// EMOS hub (/emoshq): the one page every emoshq.com visitor lands on.
// v1 2026-10-24. Until then the bare domain 307'd to /emos-platform, so a
// visitor from a card or slide saw $149 software with no sign that the
// Academy or the Residency exist. This page is the ladder: Platform (run it
// yourself) · Academy (learn it with a cohort, highlighted) · Residency (have
// it built inside your company). It sells the METHOD once and sends people to
// the three offer pages, which do their own selling.
//
// Portable on purpose: its own slim EMOS masthead and footer (the global
// SiteHeader is hidden for this route in SiteHeaderConditional), so the file
// can move to the real emoshq.com site unchanged. Every shared fact comes from
// the same sources the offer pages use (EARNED_MEDIA_STATS, the residency
// TOOLS/PROOF copy, the Academy price strings), never retyped from memory.
// emoshq.com/* fallback redirects here (next.config.ts).
export const metadata: Metadata = {
  title: "EMOS · Earned Media Operating System · Platform, Academy, Residency",
  description:
    "One earned media method, used on 300+ client accounts since 2013, available three ways: run it yourself on the EMOS Platform, learn it in the EMOS Academy, or have it built inside your company in an EMOS Residency.",
  alternates: { canonical: "/emoshq" },
  openGraph: {
    title: "EMOS · Earned Media Operating System",
    description: "Find the story. Pitch the right journalist. Keep the proof. Three ways to run it: Platform, Academy, Residency.",
    url: "https://www.syedirfanajmal.com/emoshq",
    type: "website",
  },
};

const SHOTS = "/assets/emos-platform";
const HBR_CASE_STUDY = "https://hbr.org/2019/12/how-to-motivate-your-team-during-crunch-time";
const FORBES_AUTHOR_PAGE = "https://www.forbesmiddleeast.com/author/syed-irfan-ajmal";

// The six-tool chain, same copy and screenshots as /emos-residency § 03.
const TOOLS = [
  { n: "00", tool: "Company Brief", promise: "Your story, written once and used by every tool.", img: "S2c-brief-approved.webp", alt: "An approved company brief in EMOS" },
  { n: "01", tool: "SignalIQ", promise: "Find what editors are already covering in your beat.", img: "S3a-radar-results.webp", alt: "SignalIQ showing ranked story opportunities" },
  { n: "02", tool: "AssetIQ", promise: "Build the report or tool a journalist will cite.", img: "S3b-asset-pack.webp", alt: "A SignalIQ asset pack used by AssetIQ" },
  { n: "03", tool: "JournoCollabIQ", promise: "Pitch the people who actually cover your story.", img: "S4-journalist-list-blurred.webp", alt: "A saved journalist list, names blurred" },
  { n: "04", tool: "PressIQ", promise: "Draft and score every pitch before it goes out.", img: "S1c-score-73-strongest-line.webp", alt: "A pitch scored 73 out of 100 in PressIQ" },
  { n: "05", tool: "CoverageIQ", promise: "Show the board what the work produced.", img: "S6-coverageiq-pipeline.webp", alt: "CoverageIQ pipeline with logged pitches" },
];

// The three ways to run EMOS. Prices and durations are the ones on the offer
// pages today: Platform $149/month early adopter; Academy Foundation $2,000 /
// 4 weeks and Accelerate $3,500 / 8 weeks; Residency has no public price.
type Offer = {
  key: "platform" | "academy" | "residency";
  n: string;
  name: string;
  how: string;
  price: string;
  priceNote: string;
  time: string;
  who: string;
  you: string;
  keep: string;
  href: string;
  cta: string;
  alt: { href: string; label: string };
  hi?: boolean;
};

const OFFERS: Offer[] = [
  {
    key: "platform", n: "01", name: "EMOS Platform", how: "Run it yourself",
    price: "$149", priceNote: "per month · early adopter · cancel any time",
    time: "Start today",
    who: "Founders and small teams who will send their own pitches and want a repeatable process, not a retainer.",
    you: "Six connected tools on one login: brief, story signals, asset briefs, journalist shortlists, scored pitch drafts and a placement log. A 1:1 onboarding call is included.",
    keep: "Your saved journalists, every pitch and score, and the record of what landed.",
    href: "/emos-platform", cta: "See the Platform →",
    alt: { href: "/tools", label: "or try the free tools first" },
  },
  {
    key: "academy", n: "02", name: "EMOS Academy", how: "Learn it with a cohort", hi: true,
    price: "from $2,000", priceNote: "one-time · Foundation 4 weeks · Accelerate $3,500, 8 weeks",
    time: "4 to 8 weeks",
    who: "Founders 3 to 12 months from a raise, with customers, results or a point of view, who will do the work or have someone on the team do it.",
    you: "Five founders per cohort, one live call a week, real pitches to real journalists from week two, the EMOS tools included, and a placements-or-refund guarantee.",
    keep: "The system, the skills, and the first placements on the record.",
    href: "/emos-academy", cta: "See the Academy →",
    alt: { href: "/emos-academy/apply", label: "or apply now" },
  },
  {
    key: "residency", n: "03", name: "EMOS Residency", how: "Have it built inside your company",
    price: "Set per company", priceNote: "scope and length agreed after one call",
    time: "Weeks, not a year",
    who: "Teams that want it built and running fast, with one person on staff who can take it over.",
    you: "Irfan joins your team for a set period, runs EMOS every day on your real stories and journalists beside one of your people, then hands over.",
    keep: "A trained operator, a journalist list, a pitch library and a placement log.",
    href: "/emos-residency", cta: "See the Residency →",
    alt: { href: CALENDLY, label: "or book a 30-minute call" },
  },
];

const COMPARE: { row: string; platform: string; academy: string; residency: string }[] = [
  { row: "Who does the work", platform: "You, with the software", academy: "Your team, coached by Irfan on live weekly calls", residency: "Irfan and your team, side by side" },
  { row: "Format", platform: "Self-serve, online", academy: "Remote cohort, five founders", residency: "Inside your company" },
  { row: "Price", platform: "$149 per month", academy: "$2,000 or $3,500 one-time", residency: "Set per company" },
  { row: "Time to first pitch", platform: "Today", academy: "Week 2", residency: "Week 1" },
  { row: "Guarantee", platform: "Cancel any time", academy: "Placements or a full refund", residency: "Agreed per company" },
  { row: "Best for", platform: "Teams that already pitch and want the system", academy: "Founders with time to learn it properly", residency: "Teams that want it built and running fast" },
];

const PROOF = [
  { stat: "0 → 1.5M", label: "Monthly visitors · Ridester", q: "“Syed and the team's expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success.”", who: "Brett Helling, Ridester", photo: "/assets/testimonials/brett-helling.jpeg", href: "https://www.dmr.agency/case-studies/ridester-seo/" },
  { stat: "+120%", label: "Organic traffic · Centriq", q: "“Our organic traffic increased by 120%. Our public database clicks grew by 515%. We saw a 6x increase in average daily signups.”", who: "Imani Lea Brown, Centriq", photo: "/assets/testimonials/imani-lea-brown.jpg", href: "https://www.dmr.agency/case-studies/centriq-digital-pr-growth/" },
  { stat: "+140%", label: "Traffic in 3 months · Dinar Standard", q: "“They earned high-authority backlinks from Reader's Digest and MSN. Traffic increased by 140% in 3 months against a 25%/9-month goal.”", who: "Reem El Shafaki, Dinar Standard", photo: "/assets/testimonials/reem-el-shafaki.jpg", href: "https://www.dmr.agency/case-studies/government-portal-seo/" },
];

const OUTLETS_A = ["Forbes", "Yahoo", "Business Insider", "MSN", "AOL", "Reader's Digest", "Apartment Therapy", "Healthline"];
const OUTLETS_B = ["MarketWatch", "Bankrate", "Mashable", "Entrepreneur", "The Mirror", "The Next Web", "GoBankingRates", "Consumer Health Digest"];

const WHICH: { q: string; a: string; href: string; label: string }[] = [
  { q: "We already send pitches. We want the tooling and the record.", a: "Platform", href: "/emos-platform", label: "EMOS Platform →" },
  { q: "I want to learn the method properly, with other founders, and I want a guarantee.", a: "Academy", href: "/emos-academy", label: "EMOS Academy →" },
  { q: "We have the budget and a person for it, but no time to learn it from scratch.", a: "Residency", href: "/emos-residency", label: "EMOS Residency →" },
  { q: "I want someone else to do all of it, forever.", a: "None of these", href: "https://www.dmr.agency/", label: "That is an agency. DMR.agency ↗" },
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

function Masthead() {
  return (
    <header className="hq-mast">
      <Link href="/emoshq" className="hq-mark" aria-label="EMOS home">
        <span className="hq-mark-box">EMOS</span>
        <span className="hq-mark-sub">Earned Media Operating System</span>
      </Link>
      <nav className="hq-nav" aria-label="EMOS">
        <Link href="/emos-platform">Platform</Link>
        <Link href="/emos-academy">Academy</Link>
        <Link href="/emos-residency">Residency</Link>
        <Link href="/tools">Free tools</Link>
        <Link href="/emos-platform/signin" className="hq-nav-signin">Sign in</Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="hq-foot">
      <div className="hq-foot-l">
        <span className="hq-mark-box">EMOS</span>
        <span>
          Built and run by{" "}
          <a href="https://www.syedirfanajmal.com/" target="_blank" rel="noopener noreferrer">Syed Irfan Ajmal ↗</a>
          {" "}· Why pay for attention when you can earn it?
        </span>
      </div>
      <nav className="hq-foot-r" aria-label="Legal">
        <Link href="/contact">Contact</Link>
        <Link href="/refund-policy">Refund policy</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}

export default function EmosHubPage() {
  return (
    <>
      <Masthead />
      <main className="res-wrap hq-wrap">
        {/* HERO */}
        <section className="res-hero2">
          <div className="res-hero-copy">
            <span className="res-chip">One method · Three ways to run it</span>
            <h1 className="res-h1">Earn the coverage investors and AI check. Then keep the system.</h1>
            <p className="res-lede">
              EMOS is the earned media method used on 300+ client accounts since 2013, built into connected tools.
              Run it yourself, learn it with a cohort, or have it built{" "}
              <span className="res-mark">inside your own company</span>. Either way, the journalists, the pitches and the proof stay with you.
            </p>
            <div className="res-hero-cta">
              <a href="#ways" className="res-btn">Pick your path ↓</a>
              <Link href="/tools" className="res-link">Try the free tools</Link>
            </div>
            <div className="res-proofline" aria-label="Credentials">
              <span>Case study in HBR</span>
              <span>Quoted in Forbes (USA)</span>
              <span>300+ clients since 2013</span>
            </div>
          </div>
          <div className="res-hero-vis">
            <div className="res-shot">
              <div className="res-shot-bar"><i>EMOS · PressIQ · a pitch, scored</i><span>Live</span></div>
              <div className="res-xf">
                <img className="res-xf-a" src={`${SHOTS}/S1a-pitch-before-score.webp`} alt="A pitch drafted in PressIQ, before scoring" width={1389} height={868} loading="eager" decoding="async" />
                <img className="res-xf-b" src={`${SHOTS}/S1c-score-73-strongest-line.webp`} alt="The same pitch scored 73 out of 100, with its strongest line quoted" width={1312} height={924} loading="eager" decoding="async" />
              </div>
            </div>
            <p className="res-vis-cap">Every pitch is written for one journalist and scored before it is sent. That habit is the product, whichever way you buy it.</p>
          </div>
        </section>

        {/* THREE WAYS: the quick ladder strip under the hero */}
        <div className="hq-ladder" aria-label="The three ways to run EMOS">
          <div className="hq-ladder-h">Three ways</div>
          {OFFERS.map((o) => (
            <a key={o.key} href={`#${o.key}`} className={o.hi ? "hi" : undefined}>
              <b>{o.name}</b>{o.how} · {o.price}
            </a>
          ))}
        </div>

        {/* WHY EARNED MEDIA (shared constant) */}
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

        {/* THE METHOD */}
        <section className="res-sec">
          <Bar n="02" t="The method" tag="Six tools · one chain · every step reads the last" />
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

        {/* THREE WAYS TO RUN EMOS: the heart of the page */}
        <section className="res-sec" id="ways">
          <Bar n="03" t="Three ways to run EMOS" tag="Same method · pick how much of it you do yourself" />
          <div className="hq-offers">
            {OFFERS.map((o) => (
              <article key={o.key} id={o.key} className={`hq-offer${o.hi ? " hq-offer-hi" : ""}`}>
                {o.hi && <div className="hq-offer-flag">Most chosen</div>}
                <div className="res-step-n">Way {o.n}</div>
                <h2 className="hq-offer-name">{o.name}</h2>
                <div className="hq-offer-how">{o.how}</div>
                <div className="hq-offer-price">
                  <span className="hq-offer-amount">{o.price}</span>
                  <span className="hq-offer-note">{o.priceNote}</span>
                </div>
                <dl className="hq-offer-dl">
                  <dt>Time</dt><dd>{o.time}</dd>
                  <dt>For</dt><dd>{o.who}</dd>
                  <dt>You get</dt><dd>{o.you}</dd>
                  <dt>You keep</dt><dd>{o.keep}</dd>
                </dl>
                <div className="hq-offer-cta">
                  <Link href={o.href} className="res-btn">{o.cta}</Link>
                  <Link href={o.alt.href} className="res-link">{o.alt.label}</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="res-table-wrap" style={{ borderTop: 0 }}>
            <table className="res-table">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Compare</span></th>
                  <th scope="col"><Link href="/emos-platform" style={{ color: "inherit" }}>Platform</Link></th>
                  <th scope="col" className="res-col-hi"><Link href="/emos-academy" style={{ color: "inherit" }}>Academy</Link></th>
                  <th scope="col"><Link href="/emos-residency" style={{ color: "inherit" }}>Residency</Link></th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.row}>
                    <th scope="row">{r.row}</th>
                    <td>{r.platform}</td>
                    <td className="res-col-hi">{r.academy}</td>
                    <td>{r.residency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PROOF */}
        <section className="res-sec">
          <Bar n="04" t="Proof" tag="Same method · client results via DMR.agency" />
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

        {/* WHO BUILT IT */}
        <section className="res-sec">
          <Bar n="05" t="Who built it" tag="Syed Irfan Ajmal" />
          <div className="res-built">
            <div>
              <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" loading="lazy" />
              <div className="res-cred"><span>Written and cited in</span><a href={FORBES_AUTHOR_PAGE} target="_blank" rel="noopener noreferrer">Forbes Middle East</a>, HuffPost, TNW, <a href={HBR_CASE_STUDY} target="_blank" rel="noopener noreferrer">HBR (case study)</a></div>
              <div className="res-cred"><span>Speaker</span>50+ international talks</div>
            </div>
            <div>
              <h2 className="res-h3" style={{ fontSize: 30, marginTop: 0 }}>Someone who has been on both sides of the journalist&apos;s inbox.</h2>
              <p className="res-quote">EMOS is what I learned sending pitches as an agency operator and reading them as a columnist. The software, the Academy and the Residency are the same method at three distances from me.</p>
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

        {/* WHICH ONE */}
        <section className="res-sec">
          <Bar n="06" t="Which one is for me" tag="Honest filter" />
          <div className="hq-which">
            {WHICH.map((w) => (
              <div key={w.q}>
                <p className="hq-which-q">“{w.q}”</p>
                <div className="hq-which-a">
                  <span className="res-chip" style={w.a === "None of these" ? { background: "var(--color-paper-2)" } : undefined}>{w.a}</span>
                  <Link href={w.href} className="res-link" {...(w.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{w.label}</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CLOSE */}
        <section className="res-close">
          <span className="res-chip">Not sure which?</span>
          <h2 className="res-h2">One call, and I will tell you which of the three fits, or that none does.</h2>
          <p>
            Tell me what you sell and where you want to be covered. If the Platform on its own will do, I will say so.
            If you need the Academy or a Residency, I will say that instead.
          </p>
          <div className="res-hero-cta">
            <Link href={CALENDLY} className="res-btn">Book a 30-minute call →</Link>
            <a href="mailto:sia@syedirfanajmal.com?subject=EMOS" className="res-link">sia@syedirfanajmal.com</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

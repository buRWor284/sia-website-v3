/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Colophon } from "@/components/bureau";
import "./writer.css";

// /writer: writing-services page for editors and commissioning desks, and the
// URL Sales Navigator reads to describe the writing service. Built 2026-10-22.
// /writing was not available: next.config.ts redirects /writing and /writing/*
// to /resources (old-site slug change), so Irfan chose /writer.
//
// Hidden like /emos-residency and /decoding-saudi: noindex, nofollow, not in
// sitemap.ts, the main nav or llms.txt. No prices. No em or en dashes in copy,
// and no "Why pay for attention" brand line on this page.
//
// Bylined vs quoted are deliberately two separate groups (see CredentialRows):
// HBR is a named case study and Forbes (USA) is a quote, never a byline.
// Every link below is a URL already verified in writing-archive/capture-manifest
// (2026-08-04 capture run). TNW's original 404s, so it links the Wayback copy.
// SEMrush has no verified byline URL yet, so it carries no link. Do not invent one.

const TITLE = "Syed Irfan Ajmal | Business and Marketing Writer";
const DESC =
  "Syed Irfan Ajmal writes commissioned features, opinion and analysis for business, startup and marketing desks: earned media, digital PR, AI search visibility, SEO, startups and Gulf and Pakistan business.";
const EMAIL = "sia@syedirfanajmal.com";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Commission: ")}`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: "/writer" },
  robots: { index: false, follow: false },
  openGraph: {
    type: "profile",
    siteName: "Syed Irfan Ajmal",
    url: "https://www.syedirfanajmal.com/writer",
    title: TITLE,
    description: DESC,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

type Pub = { name: string; what: string; href?: string; label?: string };

const BYLINES: Pub[] = [
  { name: "Forbes Middle East", what: "Bylined pieces on Gulf business and startups.", href: "https://www.forbesmiddleeast.com/author/syed-irfan-ajmal", label: "Author page" },
  { name: "HuffPost", what: "Contributor columns on entrepreneurship and the rideshare economy.", href: "https://www.huffpost.com/author/syed-irfan-ajmal", label: "Author page" },
  { name: "TNW", what: "“14 Pro Tips To Do PR For Your Startup Differently”", href: "https://web.archive.org/web/20210128063147/https://thenextweb.com/guests/14-pro-tips-to-do-pr-for-your-startup-differently/", label: "Read (archived copy)" },
  { name: "World Bank", what: "“Why an introvert like me looks forward to attending the Digital Youth Summit”", href: "https://blogs.worldbank.org/en/endpovertyinsouthasia/why-introvert-me-looks-forward-attending-digital-youth-summit", label: "Read on the World Bank blog" },
  { name: "SEMrush", what: "Contributed writing on search and content marketing." },
  { name: "SERPed", what: "“26 Experts On How AI Will Change The Way We Do SEO”", href: "https://www.serped.com/experts-on-how-ai-will-change-seo", label: "Read on SERPed" },
];

const FEATURED: Pub[] = [
  { name: "Harvard Business Review", what: "Featured as a named case study, with the article’s pull quote, in Rebecca Knight’s “How to Motivate Your Team During Crunch Time” (December 2019).", href: "https://hbr.org/2019/12/how-to-motivate-your-team-during-crunch-time", label: "Read on HBR" },
  { name: "Forbes (USA)", what: "Quoted in “5 Successful Entrepreneurs Share Their Self Confidence Secrets” by Kate Harrison (March 2019).", href: "https://www.forbes.com/sites/kateharrison/2019/03/26/5-successful-entrepreneurs-share-their-self-confidence-secrets/", label: "Read on Forbes" },
];

const TOPICS = [
  { t: "Earned media and digital PR", d: "How companies win coverage and links they do not pay for: newsjacking, data stories, journalist outreach, and what editors actually reply to." },
  { t: "AI search visibility", d: "How ChatGPT, Perplexity and Google AI Overviews choose which brands to cite, and what that means for PR and content budgets." },
  { t: "SEO", d: "Technical, content and link strategy, written from client campaigns rather than vendor talking points." },
  { t: "Startups and founder growth", d: "Bootstrapping, early marketing, hiring and building a founder’s profile before a raise." },
  { t: "Gulf and Pakistan business", d: "Saudi, UAE and Pakistani markets: startups, tourism, retail and the people building them." },
];

const FORMATS = [
  { t: "Reported features", d: "Interviews, sources and original reporting on a business or marketing story." },
  { t: "Opinion columns", d: "A clear argument from someone who runs campaigns, with the evidence behind it." },
  { t: "Explainers", d: "How a market, tactic or technology works, written for a general business reader." },
  { t: "Data-led analysis", d: "Original numbers from coverage, search and news datasets, with the method shown." },
];

function Bar({ n, t, tag }: { n: string; t: string; tag: string }) {
  return (
    <div className="wr-bar">
      <span className="wr-bar-n">§ {n}</span>
      <h2 className="wr-bar-t">{t}</h2>
      <span className="wr-bar-tag">{tag}</span>
    </div>
  );
}

function PubCell({ p }: { p: Pub }) {
  return (
    <div>
      <div className="wr-pub-name">{p.name}</div>
      <p className="wr-pub-what">{p.what}</p>
      {p.href ? (
        <a className="wr-pub-link" href={p.href} target="_blank" rel="noopener noreferrer">
          {p.label} ↗
        </a>
      ) : null}
    </div>
  );
}

export default function WriterPage() {
  return (
    <>
      <main className="wr-wrap">
        {/* § 00 HERO */}
        <section className="wr-hero">
          <div className="wr-hero-copy">
            <span className="wr-chip">Writing · Commissions open</span>
            <h1 className="wr-h1">Business and marketing writing, from someone who does the work.</h1>
            <p className="wr-lede">
              Commissioned features, opinion and analysis for business, startup and marketing desks.
            </p>
            <p className="wr-plain">
              I am Syed Irfan Ajmal, a business and marketing writer and the founder of DMR.agency. I write about{" "}
              <span className="wr-mark">earned media, AI search visibility, SEO, startups and Gulf and Pakistan business</span>,
              for editors at business, tech and marketing publications.
            </p>
            <div className="wr-cta">
              <a className="wr-btn" href={MAILTO}>Commission a piece</a>
              <a className="wr-email" href={MAILTO}>{EMAIL}</a>
            </div>
          </div>
          <div className="wr-hero-side">
            <img src="/assets/headshot.jpg" alt="Syed Irfan Ajmal" width={232} height={232} />
            <div>
              <div className="wr-side-name">Syed Irfan Ajmal</div>
              <div className="wr-side-role">Business and marketing writer</div>
              <div className="wr-side-role">Founder, DMR.agency</div>
            </div>
          </div>
        </section>

        {/* § 01 BYLINES */}
        <section className="wr-sec" aria-labelledby="wr-bylines">
          <Bar n="01" t="Bylines" tag="Bylined, then featured" />
          <div className="wr-group-h" id="wr-bylines">
            Bylined in <span>my name on the piece</span>
          </div>
          <div className="wr-pubs">
            {BYLINES.map((p) => <PubCell key={p.name} p={p} />)}
          </div>
          <p className="wr-note">Plus bylines in 100+ other publications.</p>

          <div className="wr-gap" />
          <div className="wr-group-h" style={{ borderTop: "1px solid var(--color-ink)" }}>
            Featured and quoted in <span>someone else’s byline</span>
          </div>
          <div className="wr-pubs wr-pubs-2">
            {FEATURED.map((p) => <PubCell key={p.name} p={p} />)}
          </div>
        </section>

        {/* § 02 TOPICS */}
        <section className="wr-sec">
          <Bar n="02" t="What I write about" tag="Five beats" />
          <div className="wr-topics">
            {TOPICS.map((x, i) => (
              <div key={x.t}>
                <span className="wr-topic-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="wr-topic-t">{x.t}</h3>
                <p className="wr-topic-d">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* § 03 FORMATS */}
        <section className="wr-sec">
          <Bar n="03" t="Formats" tag="What I file" />
          <div className="wr-formats">
            {FORMATS.map((f, i) => (
              <div key={f.t}>
                <div className="wr-fmt-n">Format {String(i + 1).padStart(2, "0")}</div>
                <h3 className="wr-h3">{f.t}</h3>
                <p className="wr-small">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* § 04 WHY EDITORS */}
        <section className="wr-sec">
          <Bar n="04" t="Why editors work with me" tag="Sourced, tested, practical" />
          <div className="wr-stats">
            <div>
              <div className="wr-stat-v">0 to 1.5M</div>
              <div className="wr-stat-l">
                monthly organic visits,{" "}
                <a href="https://www.dmr.agency/case-studies/ridester-seo/" target="_blank" rel="noopener noreferrer">Ridester</a>
              </div>
            </div>
            <div>
              <div className="wr-stat-v">$160K to $1.2M</div>
              <div className="wr-stat-l">
                monthly organic revenue,{" "}
                <a href="https://www.dmr.agency/case-studies/auto-retailer-seo/" target="_blank" rel="noopener noreferrer">National Tyres and Autocare</a>
              </div>
            </div>
            <div>
              <div className="wr-stat-v">22 years</div>
              <div className="wr-stat-l">in business, tech and marketing, since 2004</div>
            </div>
            <div>
              <div className="wr-stat-v">13 years</div>
              <div className="wr-stat-l">running DMR.agency</div>
            </div>
          </div>
          <div className="wr-why">
            <div>
              <h3 className="wr-h3">Primary-sourced data</h3>
              <p className="wr-small">
                Every number traces to the study, filing or dataset it came from, not a press release quoting it. I
                build my own datasets from news coverage and search data, so a piece can carry figures nobody else has.
              </p>
            </div>
            <div>
              <h3 className="wr-h3">Real client results</h3>
              <p className="wr-small">
                I write from the campaigns my agency runs for 300+ clients across the US, Europe and the Gulf. The
                examples are ones I can name, and the results are ones I can show.
              </p>
            </div>
          </div>
        </section>

        {/* § 05 COMMISSION */}
        <section className="wr-close" aria-labelledby="wr-commission">
          <span className="wr-chip">§ 05 · Get in touch</span>
          <h2 className="wr-h2" id="wr-commission">Commission a piece</h2>
          <p>
            Email <a className="wr-email" href={MAILTO}>{EMAIL}</a>. Send the brief, the desk and the deadline.
          </p>
          <div className="wr-cta">
            <a className="wr-btn" href={MAILTO}>Email {EMAIL}</a>
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}

import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

const CHAPTERS: ReadonlyArray<{
  n: string;
  title: string;
  body: string;
  takeaway: string;
}> = [
  {
    n: "01",
    title: "What Personal Branding Actually Means",
    body: "Personal branding is not a personal PR campaign. It is the deliberate management of the associations people make when they hear your name. Your brand exists whether you manage it or not — the question is whether you're intentional about what it communicates. Every article you publish, every talk you give, every LinkedIn post you write either reinforces or dilutes your positioning.",
    takeaway: "Your brand is the sum of what people think and feel when they hear your name. Manage it or someone else will.",
  },
  {
    n: "02",
    title: "The Positioning Statement Formula",
    body: "Before you produce any content, you need a positioning statement: a clear, defensible answer to the question 'What do you do that no one else does as well as you?' The formula: [Who I help] achieve [specific outcome] by [my unique method or approach]. A positioning statement is not a job title. 'Marketing consultant' is not positioning. 'Fractional CMO for B2B SaaS founders who want authority through earned media' is positioning.",
    takeaway: "Write your positioning statement before you post anything. Without it, your content will be unfocused — and unfocused content builds no brand.",
  },
  {
    n: "03",
    title: "The Five Layers of a Personal Brand",
    body: "Think of your personal brand as a pyramid. At the base: your core expertise and positioning. On top of that: your content pillars (the 3–5 topics you consistently own). Then: your distribution channels (LinkedIn, podcast, newsletter). Then: your credibility assets (press, speaking, books, case studies). At the apex: your media presence and authority status. Each layer enables the next. You cannot skip layers.",
    takeaway: "Build from the base. Positioning first, then content, then distribution, then credibility assets, then media presence.",
  },
  {
    n: "04",
    title: "Choosing Your Content Pillars",
    body: "Content pillars are the three to five topics you will consistently own through content. They should sit at the intersection of three criteria: what you genuinely know well, what your target audience cares about, and what is underserved in your category. Most consultants try to write about everything. The ones with strong brands write about three things — obsessively, deeply, and better than anyone else.",
    takeaway: "Pick three pillars and defend them. Depth beats breadth in every category.",
  },
  {
    n: "05",
    title: "LinkedIn Authority: The 90-Day Blueprint",
    body: "LinkedIn is the most underrated personal brand asset for B2B professionals. The algorithm rewards consistency and dwell time — not follower count. Start with 3 posts per week: one educational (pillar content), one personal (story or opinion), one conversational (a question or observation). Engage meaningfully with 5–10 accounts in your space every day. Avoid 'like' farming. Add one long-form article per week. Measure profile views and connection request rate — these are your leading indicators.",
    takeaway: "Three posts a week for 90 days, plus daily meaningful engagement. That's the blueprint. Almost no one does it consistently.",
  },
  {
    n: "06",
    title: "Getting Your First Press Mention",
    body: "The fastest path to your first press mention is HARO (Help a Reporter Out). Sign up as a source. Check queries three times a day. When a journalist asks for expertise in your area, respond within two hours with a tight, quotable, specific answer. No pitch. No 'here's my background.' Just answer the question better than anyone else will. Your first mention leads to your second — journalists repeat their reliable sources.",
    takeaway: "Respond to HARO queries within two hours. Be specific, quotable, and self-contained. Pitch nothing.",
  },
  {
    n: "07",
    title: "Building Your Credibility Asset Library",
    body: "A credibility asset is any third-party proof of your expertise: a press mention, a speaking appearance, a testimonial, a case study result, a book review. Collect these systematically. Screenshot every mention. Create a Google Doc of your best quotes. Build a 'as seen in' strip for your website. Every new client who vets you will look for these. They are not vanity — they are conversion tools.",
    takeaway: "Start collecting now. Every testimonial, mention, and result goes into the library.",
  },
  {
    n: "08",
    title: "Speaking as a Brand Accelerator",
    body: "A keynote in front of your ideal audience does more for your brand in 45 minutes than six months of LinkedIn posts. Start local — local business events, industry meetups, university talks. Record every talk. Use clips on LinkedIn. Build a simple speaker page with your topics, bio, and past events. Reach out directly to event organisers with a specific topic and a short pitch. The first five talks are unpaid. The next five are negotiable.",
    takeaway: "Talk to any room that will have you. The recording is worth more than the speaking fee.",
  },
  {
    n: "09",
    title: "The Newsletter as a Brand Asset",
    body: "A newsletter is a direct line to your audience that no algorithm controls. Start with one email a month. Pick a format and stick to it: one idea, one case study, one recommendation. The goal of every issue is to make the reader feel that opening your email was worth their time. Growth comes from guest posts, speaking appearances, press mentions, and existing audience sharing — not from growth hacks.",
    takeaway: "Consistency over frequency. One excellent email a month beats four mediocre ones.",
  },
  {
    n: "10",
    title: "Pricing the Authority Premium",
    body: "Personal brand authority is the most reliable lever for pricing power. When you are the recognised expert in your category, you are no longer competing on price — you are competing on access. Clients pay the authority premium because they are not buying your time. They are buying a shortcut to a specific outcome that only you can credibly deliver. Raise your rates when your pipeline is full. That is the only reliable signal.",
    takeaway: "Authority converts at higher prices and shorter sales cycles. Track both — they are your brand's financial metrics.",
  },
  {
    n: "11",
    title: "Measuring Brand Momentum",
    body: "Brand momentum is hard to quantify and easy to observe. Leading indicators: inbound inquiry rate (are more people reaching out to you?), press mention rate (are journalists finding you?), speaking invitation rate (are event organisers approaching you?). Lagging indicator: revenue per client. If your brand is working, all four should be rising over a 12–18 month horizon. Track them quarterly, not monthly.",
    takeaway: "Inbound rate is your north star. A rising inbound rate means the brand is working.",
  },
  {
    n: "12",
    title: "The Long Game",
    body: "Personal branding is a five-year project, not a 90-day sprint. The compounding happens in years three and four, when you have enough content, enough press, enough speaking, and enough case studies that your name comes up in conversations you are not part of. Most people quit in year one. The ones who don't quit become the authorities in their category. The barrier is not talent — it is consistency at time horizons most people cannot sustain.",
    takeaway: "The people who win are the ones who are still publishing in year five. That's it.",
  },
];

export default function PersonalBrandingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide I · Personal Branding" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">The Complete Playbook</Pill>
            <h1
              style={{
                margin: "16px 0 24px",
                fontWeight: 700,
                fontSize: 80,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
              }}
            >
              Build a brand that{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>opens doors.</Mark>
              </span>
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.6,
                color: INK70,
                maxWidth: 580,
              }}
            >
              Twelve chapters on positioning, content, press, speaking, and
              pricing — built from fifteen years of building personal brands for
              founders, consultants, and executives.
            </p>
          </div>

          <div style={{ paddingTop: 8 }}>
            <Pill size={10.5} ls="0.18em">In This Guide</Pill>
            <div style={{ marginTop: 16 }}>
              {CHAPTERS.map(({ n, title }) => (
                <a
                  key={n}
                  href={`#chapter-${n}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: `1px solid ${INK15}`,
                    textDecoration: "none",
                    color: "inherit",
                    alignItems: "baseline",
                  }}
                >
                  <SCaps size={10} ls="0.12em" color={INK35}>{n}.</SCaps>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: INK70 }}>
                    {title}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${INK15}`,
          }}
        >
          {[
            { label: "Author", value: "Syed Irfan Ajmal" },
            { label: "Length", value: "12 chapters · 8,400 words" },
            { label: "Read time", value: "22 minutes" },
            { label: "Updated", value: "May 2026" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Chapters ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>
          {CHAPTERS.map(({ n, title, body, takeaway }, i) => (
            <article
              key={n}
              id={`chapter-${n}`}
              style={{
                paddingBottom: 56,
                marginBottom: 56,
                borderBottom:
                  i < CHAPTERS.length - 1 ? `1px solid ${INK15}` : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "baseline",
                  marginBottom: 16,
                }}
              >
                <Pill size={10} ls="0.16em">Ch. {n}</Pill>
                <SCaps size={10.5} ls="0.14em" color={INK55}>
                  Chapter {parseInt(n)} of {CHAPTERS.length}
                </SCaps>
              </div>
              <h2
                style={{
                  margin: "0 0 20px",
                  fontWeight: 700,
                  fontSize: 34,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 18.5,
                  lineHeight: 1.7,
                  color: INK70,
                }}
              >
                {body}
              </p>
              <div
                style={{
                  background: PAPER2,
                  padding: "18px 22px",
                  borderLeft: `3px solid ${YEL}`,
                }}
              >
                <SCaps size={10} ls="0.16em" color={YEL} style={{ display: "block", marginBottom: 8 }}>
                  Key takeaway
                </SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 16.5,
                    lineHeight: 1.5,
                    color: INK,
                  }}
                >
                  {takeaway}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Next steps ───────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="13" label="Next Steps · Apply What You've Learned" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {[
            {
              title: "Continue reading",
              body: "Explore the other three guides — Neuromarketing, Storytelling, and Writing Tips — to round out your marketing toolkit.",
              cta: "Back to Writing",
              href: "/writing",
            },
            {
              title: "Get press coverage",
              body: "The EMOS programme applies these personal branding principles to earned media — landing you in Forbes, HBR, and your category's key publications.",
              cta: "Learn about EMOS",
              href: "/emos",
            },
            {
              title: "Work with Syed",
              body: "For a fractional CMO arrangement or a done-for-you earned media programme, book a discovery call to discuss your situation.",
              cta: "Book a call",
              href: CALENDLY,
            },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </h3>
              <HRule />
              <p
                style={{
                  margin: "14px 0 20px",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: INK70,
                }}
              >
                {body}
              </p>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: INK,
                  textDecoration: "none",
                }}
              >
                {cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="14" />
      <Colophon />
    </div>
  );
}

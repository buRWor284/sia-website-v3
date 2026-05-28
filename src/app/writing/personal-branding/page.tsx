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
    title: "What is Personal Branding?",
    body: "NEWSFLASH: Whether you agree or not, you already have a personal brand. As Jeff Bezos famously put it: 'Your brand is what people say about you when you're not in the room.' Personal branding is self-packaging in a manner that the qualities you have and the values you offer are easily recognisable and believable. It helps you tell your story effectively, so you attract the right people — partners, employees, customers, investors — and the right opportunities: a new job, a new project, a speaking gig.",
    takeaway: "Your personal brand exists whether you manage it or not. Personal branding gives you the opportunity to win the trust of those whom you want to work with.",
  },
  {
    n: "02",
    title: "Examples of Successful Personal Brands",
    body: "The most iconic company brands are inseparable from the people behind them. Microsoft makes us think of Bill Gates; the Virgin Group immediately brings Richard Branson to mind — a man who built 8 billion-dollar companies in 8 different industries. Apple was associated with Steve Jobs so strongly that his personal brand drove queues outside stores at every product launch. Tesla operates with a '$0 marketing budget' largely because it functions as an extension of Elon Musk's personal brand as a visionary. This earned attention — not bought attention — is what a strong personal brand creates.",
    takeaway: "The strongest company brands in the world are extensions of the founder's personal brand. That dynamic works at every scale, not just for billionaires.",
  },
  {
    n: "03",
    title: "Top Personal Branding Facts & Statistics",
    body: "Research consistently shows that audiences trust people more than corporations. Leads generated via employee social marketing convert at least seven times more frequently than other leads. 53% of decision-makers have removed a vendor from consideration based on what they did or did not find about an employee online (Kredible). Only 33% of buyers trust a brand while 90% of customers trust product or service recommendations from people they know (Nielsen). 78.6% of sales professionals using social media outperformed those who were not (A Sales Guy Consulting).",
    takeaway: "Personal branding is not vanity — it is a measurable business asset that directly affects conversion, pricing power, and sales cycles.",
  },
  {
    n: "04",
    title: "Step 1 · Find Your SNN (Specific Narrow Niche)",
    body: "Since there is stiff competition in almost every domain, specialising in general areas like 'Marketing' or 'Business' will not be enough. Find a very specific and narrow niche. If you are a fitness coach, specialise in helping busy parents get fit despite hectic schedules. If you are a digital marketer, help non-profits get exposure and volunteers. At DMR.agency, Irfan focused exclusively on generating 6–7 figure revenue for startups through SEO, Content Marketing, and Digital PR. The more specialised you are, the more you will be regarded as an authority in that field.",
    takeaway: "The more specialised you are in a particular area, the more volume of trade you will attract. General positioning is invisible positioning.",
  },
  {
    n: "05",
    title: "Step 2 · Leverage Content to Build Authority",
    body: "Once you have figured out your area of expertise, start building a reputation around it. Creating a blog and publishing valuable information is the best path to becoming the go-to expert. Use tools like BuzzSumo and Ahrefs to find already-popular topics and approach them from a new angle. Also create different content types on the same topic — an article, a video, an infographic. Irfan wrote a case study for SEMrush showing how a client grew revenue from $160,000/month to $200,000/month with guest posting alone in six months.",
    takeaway: "Providing valuable information consistently will help you be recognised as the thought-leader and authority in your industry.",
  },
  {
    n: "06",
    title: "Step 3 · Spruce Up Your Social Media Profiles",
    body: "Apart from content marketing, you must also build your social media presence. Ensure your Facebook, Twitter, and LinkedIn profiles are in sync with your personal brand. Use professional cover photos featuring logos of large organisations you have worked with — your personal brand can leverage their brand equity. Post daily content — at least once per day for Facebook and LinkedIn, several times for Twitter. Follow the 80/20 rule: 80% informational posts that serve your audience, 20% promotional posts about your own work.",
    takeaway: "Your social media profiles are often the first thing a potential client or employer will see. They must tell a coherent, credible story.",
  },
  {
    n: "07",
    title: "Step 4 · Build Your Personal Brand on LinkedIn",
    body: "LinkedIn is the most powerful platform for B2B personal branding. Optimise your headline to include your target keywords — not just your job title. Publish long-form articles on LinkedIn Pulse to reach beyond your immediate network. Engage genuinely with posts by people in your target audience. Use LinkedIn's native video feature. Recommendations from clients and colleagues are the most credible social proof you can collect on the platform.",
    takeaway: "LinkedIn is where B2B buyers verify you before they contact you. Your profile is your digital credibility file.",
  },
  {
    n: "08",
    title: "Step 5 · Build Relationships & Network Strategically",
    body: "Networking is not about collecting contacts — it is about building genuine relationships with people who can mutually benefit from knowing you. Attend industry events, conferences, and meetups. Guest blog on sites your target audience reads. Do joint webinars with peers. Introduce people who should know each other. The most powerful personal brands are built on genuine relationships, not broadcasting. Be the person who gives value before asking for it.",
    takeaway: "Build relationships before you need them. The best networking investment is in people whose work you genuinely admire.",
  },
  {
    n: "09",
    title: "Step 6 · Get PR Coverage",
    body: "Being mentioned in publications your audience reads is the most credible form of third-party validation. HARO (Help a Reporter Out) is the most accessible starting point — sign up as a source, respond to relevant journalist queries quickly with specific, quotable answers. Guest blog on high-authority sites. Pitch your unique data, case studies, or perspectives as story angles. Irfan has been featured in Forbes, Harvard Business Review, HuffPost, The Next Web, and Entrepreneur.com — all built through earned media, not paid placement.",
    takeaway: "Press coverage compounds. One mention in a major publication often leads to invitations from other journalists who read it.",
  },
  {
    n: "10",
    title: "Step 7 · Become a Speaker",
    body: "Speaking to audiences that include your ideal clients or employers is one of the most powerful personal branding activities available. Irfan has spoken in Malaysia, Indonesia, UAE, and Pakistan, and conducted webinars for American and British audiences. Start local: local business events, industry meetups, university talks. Record every talk — the video asset is often more valuable than the speaking fee. Build a simple speaker page with your topics, bio, and past events.",
    takeaway: "The video of a well-delivered talk, shared consistently on LinkedIn, will generate more inbound than months of posts.",
  },
  {
    n: "11",
    title: "Step 8 · Keep Evolving and Improving",
    body: "Personal branding is not a one-time project — it is an ongoing commitment to your own growth and the consistent communication of that growth. Read voraciously in your field. Attend masterclasses and courses. Invest in coaches and mentors. Document your learning publicly through blog posts, podcasts, and social media. The experts who maintain authority are those who stay genuinely ahead of their audience — not those who simply repeat what made them known in the first place.",
    takeaway: "Your personal brand is a reflection of who you are. The best way to build it is to genuinely become better at what you do.",
  },
  {
    n: "12",
    title: "Irfan's Personal Branding Journey",
    body: "Syed Irfan Ajmal built his personal brand over a decade by doing exactly what this guide describes: specialising in SEO, content marketing, and digital PR; publishing long-form guides on personal branding, neuromarketing, and storytelling; pursuing press coverage systematically; speaking internationally; hosting a podcast; and consistently showing up for his audience. Today he is featured in Forbes, HBR, HuffPost, The Next Web, and Entrepreneur. His agency DMR.agency grew from zero to 45+ team members serving 100+ clients in 20+ countries.",
    takeaway: "Personal branding takes years, not weeks. The compounding — when your name starts coming up in conversations you are not part of — begins in year three.",
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
            { label: "Length", value: "12 chapters · ~5,500 words" },
            { label: "Read time", value: "22 minutes" },
            { label: "Published", value: "June 2016 · Revised Dec 2021" },
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

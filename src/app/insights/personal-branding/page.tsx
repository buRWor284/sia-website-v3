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

const TOC = [
  { n: "01", id: "what-is", title: "What is Personal Branding?" },
  { n: "02", id: "examples", title: "Examples of Successful Personal Brands" },
  { n: "03", id: "statistics", title: "Top 10 Personal Branding Facts & Statistics" },
  { n: "04", id: "how-to-build", title: "How to Build a Personal Brand (9 Steps)" },
  { n: "05", id: "notable-brands", title: "Some More Notable Personal Brands" },
  { n: "06", id: "irfans-story", title: "Irfan's Personal Branding Journey" },
];

const P: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 18,
  lineHeight: 1.75,
  color: INK70,
};

const H2: React.CSSProperties = {
  margin: "48px 0 20px",
  fontWeight: 700,
  fontSize: 34,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  color: INK,
  fontFamily: SERIF,
};

const H3: React.CSSProperties = {
  margin: "32px 0 14px",
  fontWeight: 700,
  fontSize: 22,
  lineHeight: 1.15,
  color: INK,
  fontFamily: SERIF,
};

const BLOCKQUOTE: React.CSSProperties = {
  margin: "28px 0",
  padding: "20px 24px",
  borderLeft: `4px solid ${YEL}`,
  background: PAPER2,
};

const UL: React.CSSProperties = {
  margin: "0 0 20px",
  paddingLeft: 24,
  fontSize: 18,
  lineHeight: 1.75,
  color: INK70,
};

export default function PersonalBrandingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ─────────────────────────────────────────────── */}
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
                fontSize: 72,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
              }}
            >
              Personal Branding 101:{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>Brand Yourself for Success</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              Whether you agree or not, you already have a personal brand. This guide covers everything you need to find, build, and grow yours — from finding your niche to getting press coverage and speaking on stages.
            </p>
          </div>

          <div style={{ paddingTop: 8 }}>
            <Pill size={10.5} ls="0.18em">In This Guide</Pill>
            <div style={{ marginTop: 16 }}>
              {TOC.map(({ n, id, title }) => (
                <a
                  key={n}
                  href={`#${id}`}
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
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: INK70 }}>{title}</div>
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
            { label: "Published", value: "June 2016 · Revised Dec 2021" },
            { label: "Read time", value: "~18 minutes" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Article Body ──────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>

          {/* Opening */}
          <div style={BLOCKQUOTE} id="intro">
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: INK, marginBottom: 10 }}>
              "Your brand is what people say about you when you're not in the room."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Jeff Bezos — Founder of Amazon</SCaps>
          </div>

          <p style={P}>
            Personal branding helps you tell your story in the most effective manner, so that you can attract all the right people — partners, employees, customers, investors — and opportunities: a new job, a new project, a speaking gig.
          </p>
          <p style={P}>
            Most important, it gives you the opportunity to win the trust of those whom you want to work with in any capacity.
          </p>

          {/* Section 01 */}
          <h2 style={H2} id="what-is">01 · What is Personal Branding?</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Personal branding is simply showing potential clients, employers and the world at large who you are and what values you stand for. It&apos;s a marketing strategy focused on showcasing to the world what you stand for.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, lineHeight: 1.6, color: INK70 }}>
              Personal branding is self-packaging in a manner that the qualities you have and the values you offer are easily recognizable and believable.
            </div>
          </div>
          <p style={P}>
            Developing a successful brand involves figuring out your skills, values, personality, passion, your audience, and your unique niche, and then communicating them to your target audience in a manner that they are correctly understood.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "Embrace your story. And make sure you&apos;re the primary force in telling that story to the rest of the world."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Rob Asghar — Management Consultant & Forbes Columnist</SCaps>
          </div>
          <p style={P}>
            Most often, well-known and well-defined company brands are closely tied to the people behind them and their personal brands.
          </p>

          {/* Section 02 */}
          <h2 style={H2} id="examples">02 · Examples of Successful Personal Brands</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            When we talk of Microsoft we think of <strong>Bill Gates</strong>. And whenever the Virgin Group is mentioned, we immediately think of <strong>Richard Branson</strong> — a man who has built 8 billion-dollar companies in 8 different industries.
          </p>
          <p style={P}>
            The same goes for Apple, which is associated with Steve Jobs. His personal brand was the driving force behind getting people super-excited about whatever new product Apple was launching — there were queues of people in front of Apple stores whenever a new iPad, iPhone, or MacBook was being released.
          </p>
          <p style={P}>
            Similarly, Tesla, as Referral Candy mentions, is notable for having a "$0 marketing budget," and is seen as an extension of <strong>Elon Musk&apos;s</strong> personal brand as a visionary, a genius, and a great entrepreneur. He does a lot of interviews and is quite active on social media, which makes him the driving force behind a huge fan base that is crazy about the "car of the future."
          </p>
          <p style={P}>
            This type of marketing is earned rather than bought, and Elon&apos;s personal brand is of significant importance in earning all this attention. A two-hour interview on Joe Rogan&apos;s podcast garnered over 14 million views on YouTube within weeks of being published.
          </p>
          <p style={P}>
            In today&apos;s era, where people and businesses have so many more options, it is vital to have a personal brand so that you can stand out from the crowd and boost your business or career.
          </p>

          {/* Section 03 */}
          <h2 style={H2} id="statistics">03 · Top 10 Personal Branding Facts & Statistics</h2>
          <HRule />
          <ol style={{ ...UL, listStyleType: "decimal", marginTop: 20 }}>
            <li style={{ marginBottom: 14 }}>The need for personal branding has become even more pronounced than ever because, as per research, <strong>audiences trust people more than corporations</strong>.</li>
            <li style={{ marginBottom: 14 }}>Leads generated via <strong>employee social marketing initiatives convert at least 7× more frequently</strong> than other leads.</li>
            <li style={{ marginBottom: 14 }}>Personal branding drives sales results, with decision-makers starting their buying process with a referral.</li>
            <li style={{ marginBottom: 14 }}><strong>36% of buyers don&apos;t contact sales representatives until they have put together a shortlist of preferred vendors</strong> — vendors who were shortlisted had a better personal brand.</li>
            <li style={{ marginBottom: 14 }}><strong>53% of decision-makers have removed a vendor from consideration</strong> based on what they did or did not find about an employee online. — Kredible</li>
            <li style={{ marginBottom: 14 }}>Sales professionals who used social media as part of their sales techniques outperformed those who were not: <strong>78.6% outperformed their peers</strong>. — A Sales Guy Consulting</li>
            <li style={{ marginBottom: 14 }}>An employee advocacy programme of 1,000 active participants can, on average, generate <strong>$1,900,000 in advertising value</strong>. — Kredible</li>
            <li style={{ marginBottom: 14 }}>Only <strong>33% of buyers trust the brand</strong> while <strong>90% of customers trust product or service recommendations from people they know</strong>. — Nielsen</li>
          </ol>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, lineHeight: 1.6, color: INK70 }}>
              Personal branding allows you to express your individuality, identity, and reputation while maintaining a personal level of trust and communication with your clients.
            </div>
          </div>

          {/* Section 04 */}
          <h2 style={H2} id="how-to-build">04 · How to Build a Personal Brand (9 Steps)</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>Step 1 · Find Your SNN (Specific Narrow Niche)</h3>
          <p style={P}>
            Since there is stiff competition in almost every domain, only specializing in general areas such as "Marketing" and "Business" won&apos;t be enough. You should instead focus on developing expertise in a very specific and narrow niche — one that is not so common.
          </p>
          <ul style={UL}>
            <li style={{ marginBottom: 10 }}>If you are a fitness coach, specialize in helping busy parents get fit despite their hectic schedules.</li>
            <li style={{ marginBottom: 10 }}>If you are a digital marketer, choose to specialize in helping non-profit organizations get the exposure, funding, and volunteers that they need.</li>
            <li style={{ marginBottom: 10 }}>If you are a business coach, specialize in either helping executives of Fortune 500 companies, or work with social startups that have raised series B funding.</li>
            <li style={{ marginBottom: 10 }}>At DMR.agency, we specialize in generating 6–7 figure revenue for startups through SEO, Content Marketing, and Digital PR. Despite being offered projects in other domains, this is what we are focused on.</li>
          </ul>
          <p style={P}>
            When you focus on a niche and provide readers with valid information about it, you will have more opportunities flowing in and will be regarded as an authority figure in that field. The more specialized you are in a particular area, the more volume of trade you will attract.
          </p>

          <h3 style={H3}>Step 2 · Leverage Content to Build Authority</h3>
          <p style={P}>
            Once you have figured out your area of expertise, start building a reputation around it. Through content creation and marketing, you can build a solid brand and reputation online so as to drive targeted quality organic traffic to your website.
          </p>
          <p style={P}>
            By providing valuable information to your audience you will be recognized as the go-to expert, thought-leader, authority, and influencer of your industry.
          </p>
          <p style={P}>
            The best way through which you can become an authority figure is by creating a blog and publishing valuable information on it. Use tools like BuzzSumo and Ahrefs Content Explorer to find topics that are already popular so you can write on them from a different perspective. You can also create different content types on the same topic — an article, a video, and an infographic.
          </p>
          <p style={P}>
            You should also consider guest blogging to further increase your brand value. I wrote a case study for SEMrush and conducted a webinar showing how we helped a client grow revenue from $160,000/month to $200,000/month with guest posting alone — in only 6 months with minimal resources.
          </p>
          <p style={P}>
            Work on creating case studies that show how you achieved excellent results for a client. Case studies are more appealing to people because they are true and have a recipe for success.
          </p>

          <h3 style={H3}>Step 3 · Spruce Up Your Social Media Profiles</h3>
          <p style={P}>
            Apart from using content to push brand awareness, you should also be sprucing up your social media presence. Make sure that your Facebook, Twitter, and LinkedIn profiles are in sync with your personal brand standards. Preferably use similar pictures on all these platforms.
          </p>
          <p style={P}>
            Use professional cover photos which show the logos of any large organizations you have worked for, so your personal brand can leverage the brand value that these large organizations carry.
          </p>
          <p style={P}>
            No one likes the person who is posting only to promote themselves. Make sure the stuff you are posting consists of <strong>80% informational posts, 10% semi-promotional posts, and 10% fully promotional posts</strong>.
          </p>
          <p style={P}>
            The interesting thing about this approach is that you are doing more to promote your personal brand by not promoting it too much — sharing informational posts makes people see you as an authority and as someone who can be trusted.
          </p>
          <p style={P}>
            Additionally, repurpose your existing blog content and share it with your social media followers. Find 5–10 quotes or key statements in one of your articles and convert them into social media banners. Visual content results in much more attention, conversions, and reach.
          </p>

          <h3 style={H3}>Step 4 · Speak at Relevant Industry Events</h3>
          <p style={P}>
            Look for speaking events whenever possible — it will propel you into the limelight and enable you to demonstrate your expertise more effectively. I spoke at a growth hacking workshop hosted at AstroLabs in Dubai and received, in one evening: two offers from startups who wanted me to do marketing for equity, an invite from Google Business Group to do a session for their audience, an increase in website traffic, a request for an interview from a public speaking organization, lots of new connections, and several leads.
          </p>
          <p style={P}>
            All these benefits were the result of only a single speaking event. Imagine the leads you can procure by speaking at several events.
          </p>
          <p style={P}>
            If you haven&apos;t spoken before, the easiest way to get your first gig is to contact your university or college and pitch them a topic. Show them how you made it big and that you want to teach their current students how they can do it too. You can also reach out to local chambers of commerce, Google Business Group chapters, co-working spaces, business incubators, and accelerators.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "I think you travel to search and you come back home to find yourself there."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Chimamanda Ngozi Adichie — Nigerian Author</SCaps>
          </div>

          <h3 style={H3}>Step 5 · Network As Much As You Can</h3>
          <p style={P}>
            The power of networking can&apos;t be over-emphasized. Networking matters both online via social media and email, and in the real world. If you want to grow your personal brand, you have to engage with key influencers, like-minded people, other experts in your niche, and the target audience whose problems you are trying to understand and solve.
          </p>
          <p style={P}>
            I prefer attending industry events over startup events. If you have a food app, go attend an event in the food industry. If you have a logistics app, attend an FMCG event. Meet authority figures while at these events and engage in community discussions.
          </p>
          <p style={P}>
            The more people you meet, the more opportunities you&apos;ll get — but don&apos;t try to meet only for the purpose of a handshake and exchanging business cards. It is better to meet fewer people and make a lasting impression than to have a lot of business cards but no real spark.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              My golden rule of networking is simple: Don&apos;t keep score.
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Harvey Mackey — Business Author & Speaker</SCaps>
          </div>
          <p style={P}>
            I met my former business partner Azzam Sheikh online around the start of 2014, and then in May 2015 we decided to merge our digital marketing agencies and create Digital Marketing ROI. At the time we had never met in person — he was based in the UK and I was in Pakistan. But the power of our brands brought us together and created the kind of trust necessary for strengthening a mutually beneficial relationship.
          </p>

          <h3 style={H3}>Step 6 · Associate With Stronger Brands</h3>
          <p style={P}>
            Your personal brand will be boosted and your influence will grow bigger only if you associate with other bigger brands. Start small by associating with your company, colleagues, and college mates, and join relevant groups which you think will boost your brand. Consider contributing a guest post to your company&apos;s blog.
          </p>

          <h3 style={H3}>Step 7 · Share Only Purposeful Stuff</h3>
          <p style={P}>
            Be aware that every piece of information you share on social media has an impact on your personal brand. Be consistent in updating your accounts — it is the combination of small actions taken daily that gives your personal brand power.
          </p>

          <h3 style={H3}>Step 8 · Appear on Podcasts, TV Shows and Radio Shows</h3>
          <p style={P}>
            Podcasts, TV shows, and radio shows are some of the best personal branding platforms available. Whether it&apos;s your own podcast or someone else&apos;s on which you appear as a guest, it&apos;ll give a huge boost to your personal brand.
          </p>
          <p style={P}>
            When I added Chuck Wang of the MVP Marketing Podcast on Facebook, I sent a highly personalized message that: mentioned something specific about his recent work, briefly mentioned my credentials ("award-winning serial entrepreneur, HuffPost columnist, HubSpot certified inbound marketer"), and ended with a specific question. He responded weeks later and asked if I would like to be on his show. He has an audience, and by having built a relationship with him — partly possible due to my personal brand — we are able to help each other.
          </p>

          <h3 style={H3}>Step 9 · Smart Outreach</h3>
          <p style={P}>
            Social media and podcasts are not the only way to improve your personal brand awareness. You can also find influencers in your niche and reach out to them via email. Email is still a widespread means of communication, especially in the professional world. Tools like Snov.io can help you find email addresses quickly when you can&apos;t write to someone directly on a social network.
          </p>
          <p style={P}>
            Whatever activity you do for strengthening your personal brand has a snowball effect. Every speaking event, article, podcast appearance, and relationship compounds into greater authority, inbound opportunities, and pricing power.
          </p>

          {/* Section 05 */}
          <h2 style={H2} id="notable-brands">05 · Some More Notable Personal Brands</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            We all know Guy Kawasaki, Seth Godin, and Gary Vaynerchuk. But here are a few other notable personalities who have made a name for themselves via personal branding.
          </p>

          <h3 style={H3}>Lewis Howes</h3>
          <p style={P}>
            Lewis Howes is a prime example of an individual with successful personal branding. He began by hosting LinkedIn events in several cities around the United States and very quickly became a LinkedIn expert. His brand evolved over several years, and now he is better known as a lifestyle entrepreneur "living the dream." His personal brand has been significantly boosted by his podcast, The School of Greatness, which is primarily focused on helping people start their own businesses and achieve greatness.
          </p>

          <h3 style={H3}>Dan Brown</h3>
          <p style={P}>
            Dan Brown is the author of several bestselling novels including The Da Vinci Code, which is to date one of the bestselling novels of all time. He was named by TIME Magazine as one of the 100 most influential people in the world. Brown&apos;s novels are treasure hunts set in a 24-hour period and feature recurring themes of cryptography, keys, symbols, codes, and conspiracy theories. He pulls crowds wherever he speaks — his appearance at the Web Summit in Dublin in 2015 was attended by over 40,000 people.
          </p>

          <h3 style={H3}>Tim Ferriss</h3>
          <p style={P}>
            Tim Ferriss is a startup angel investor (in Twitter, among others) and the author of the bestselling book <em>The 4-Hour Workweek</em>, which has been translated into 35 languages, sold 1.35 million copies worldwide, and topped the charts of the New York Times, BusinessWeek, and the Wall Street Journal — after being rejected by 26 out of 27 publishers.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK70, marginBottom: 8 }}>
              "Personal branding is about managing your name — even if you don&apos;t own a business — in a world of misinformation, disinformation, and semi-permanent Google records. Going on a date? Chances are your &apos;blind&apos; date has Googled your name. Going to a job interview? Ditto."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Tim Ferriss — Entrepreneur, Author</SCaps>
          </div>
          <p style={P}>
            When Tim saw his publishing company wasn&apos;t promoting The 4-Hour Workweek as well as he wanted, he took it upon himself to promote it by reaching out to bloggers and establishing himself as an authority in Lifestyle Design. He had a large group of people ready to buy before the book launched. His podcast, The Tim Ferriss Show, has been downloaded over 300 million times.
          </p>

          <h3 style={H3}>Chris Ducker</h3>
          <p style={P}>
            Chris has done a wonderful job promoting himself and his brand on different platforms online, manifested in his website, social media profiles, and business cards. One of the main reasons why Chris has a successful personal brand is his consistency — everything he does is consistent with his brand message. His podcast, The New Business Podcast, is well worth listening to.
          </p>

          <h3 style={H3}>Marie Forleo</h3>
          <p style={P}>
            Marie&apos;s strong personal brand has attracted over 100,000 followers and fans worldwide. Her award-winning web show MarieTV is 100% true to her vision, and her website nails everything related to her personal brand. Every element — tone, design, content — is consistent with who she is and who she serves.
          </p>

          {/* Section 06 */}
          <h2 style={H2} id="irfans-story">06 · Irfan&apos;s Personal Branding Journey</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            By writing for HuffPost, Business.com, SEMrush, and other large publications, I was able to associate my personal brand with these large brands. The same happened when I spoke in Dubai, at Google Business Groups sessions, and internationally. These activities built my reputation and credibility in a manner that I have been able to attract opportunities without spending almost anything on outbound marketing — getting offers, deals, speaking gigs, and more right in my inbox.
          </p>
          <p style={P}>
            I spoke for about 2.5 years before I got my first invite to an all-expense-paid trip to speak in Malaysia. I am not paid by HuffPost, Business.com, and most of the other publications I write for. But writing for them helped us win several projects, and I now also get paid by Aurora (Pakistan&apos;s largest marketing magazine) and Forbes ME.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK70, marginBottom: 8 }}>
              "If the first time someone asked me a question had resulted in me asking for a paycheck, I would have few clients and no friends. The aim should be to help others. If you are doing that, money will find its way to you sooner or later."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Syed Irfan Ajmal</SCaps>
          </div>
          <p style={P}>
            Whenever you are starting a new activity to support your brand — whether it&apos;s social media, writing, or speaking — the goal should be to strengthen your brand. Ask how it will impact your reputation, not your immediate ROI.
          </p>
          <p style={P}>
            Enjoy the experience. Build your profile and brand to the extent that when someone talks about your niche, listeners immediately think of you. This is how you make yourself an expert, an authority, and a thought leader.
          </p>
          <p style={P}>
            Of course, you also have to build actual expertise — otherwise your brand will be seen as a farce. But if you have the expertise as well as a great personal brand, you can expect to be highly rewarded for it in more ways than you can imagine.
          </p>

        </div>
      </section>

      <HRule />

      {/* ── Next Steps ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="07" label="Next Steps · Apply What You&apos;ve Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            {
              title: "Continue reading",
              body: "Explore the other guides — Neuromarketing, Storytelling, and Writing Tips — to build out your full marketing and content toolkit.",
              cta: "Back to Writing",
              href: "/writing",
            },
            {
              title: "Get press coverage",
              body: "The EMOS programme applies these personal branding principles to earned media — getting you featured in Forbes, HBR, and your category's key publications.",
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
              <h3 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontSize: 16, lineHeight: 1.6, color: INK70 }}>{body}</p>
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

      <Subscriptions sectionNumber="08" />
      <Colophon />
    </div>
  );
}

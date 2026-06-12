/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storytelling 101: Elevate Your Brand · Syed Irfan Ajmal",
  description: "Find out the most effective storytelling tactics and techniques in this mega-guide which can help you elevate your brand like never before!",
  openGraph: {
    title: "Storytelling 101: Elevate Your Brand",
    description: "Find out the most effective storytelling tactics and techniques in this mega-guide which can help you elevate your brand like never before!",
  },
};

import { Colophon, Subscriptions } from "@/components/bureau";
import { HRule, Mark, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
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

// ─── Wayback Machine image URLs ───────────────────────────────────────────────
const WM = "https://web.archive.org/web/20251205001052im_/https://syedirfanajmal.com/wp-content/uploads/2020/04/";
const IMG = {
  aesop:            `${WM}2.png`,
  qissaKhawani:     `${WM}3.png`,
  hubspotB2B:       `${WM}4.png`,
  fiveThings:       `${WM}5.png`,
  brandCanvas:      `${WM}6.png`,
  storytellingTable:`${WM}7.png`,
  mozStrategy:      `${WM}8.png`,
  asosEthical:      `${WM}9.png`,
  boschFuture:      `${WM}10.png`,
  targetAudience:   `${WM}11.png`,
  nikeJustDoIt:     `${WM}12.png`,
  dunkinDonuts:     `${WM}13.png`,
  paypal:           `${WM}15.png`,
  amazonAlexa:      `${WM}16.png`,
  storyCanvas:      `${WM}17.png`,
  constantContact:  `${WM}18.png`,
  productiveMuslim: `${WM}19.png`,
  platforms:        `${WM}20.png`,
  instagramBiz:     `${WM}21.png`,
  benefitsChart:    `${WM}22.png`,
  scienceBrain:     `${WM}23.png`,
  visualBrain:      `${WM}24.png`,
  airbnb:           `${WM}25.png`,
  googleAtap:       `${WM}26.png`,
  nikeEquality:     `${WM}27.png`,
  hero:             "https://web.archive.org/web/20251205001052im_/https://syedirfanajmal.com/wp-content/uploads/2020/04/books-3071110_1280.jpg",
};

// ─── Helper components ─────────────────────────────────────────────────────────

const ArticleImg = ({
  src,
  alt,
  caption,
  width = "100%",
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: string | number;
}) => (
  <figure style={{ margin: "28px 0", textAlign: "center" }}>
    <img
      src={src}
      alt={alt}
      style={{
        maxWidth: typeof width === "number" ? `${width}px` : width,
        width: "100%",
        height: "auto",
        display: "block",
        margin: "0 auto",
        border: `1px solid ${INK15}`,
      }}
    />
    {caption && (
      <figcaption
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 13,
          color: INK55,
          lineHeight: 1.5,
        }}
      >
        {caption}
      </figcaption>
    )}
  </figure>
);

// ─── TOC ──────────────────────────────────────────────────────────────────────

const TOC = [
  { n: "01", id: "introduction",       title: "Introduction" },
  { n: "02", id: "food-for-thought",   title: "Food for Thought" },
  { n: "03", id: "storytelling-marketing", title: "Storytelling & Brand Awareness" },
  { n: "04", id: "elevate-brand",      title: "Elevate Your Brand" },
  { n: "05", id: "five-things",        title: "5 Things to Plan Before Telling Stories" },
  { n: "06", id: "storytelling-brands","title": "Storytelling for Brands" },
  { n: "07", id: "brand-storytelling", title: "Defining Brand Storytelling: 8 Key Tips" },
  { n: "08", id: "benefits",           title: "Benefits of Brand Storytelling" },
  { n: "09", id: "science",            title: "The Science of Storytelling" },
  { n: "10", id: "neuroscience",       title: "Neuroscience of Storytelling" },
  { n: "11", id: "case-studies",       title: "Case Studies: Airbnb, Google, Nike" },
  { n: "12", id: "succeeding",         title: "Succeeding with Brand Storytelling" },
];

// ─── Style constants ───────────────────────────────────────────────────────────

const P: React.CSSProperties          = { margin: "0 0 20px", fontFamily: SERIF, fontSize: 18, lineHeight: 1.75, color: INK70 };
const H2: React.CSSProperties         = { margin: "2.4em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK };
const H3: React.CSSProperties         = { margin: "1.6em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: INK };
const BLOCKQUOTE: React.CSSProperties = { margin: "28px 0", padding: "20px 24px", borderLeft: `4px solid ${YEL}`, background: PAPER2 };
const HIGHLIGHT: React.CSSProperties  = { backgroundColor: "rgb(204, 83, 115)", color: "#fff", padding: "2px 8px", fontWeight: 700, fontSize: 20 };
const OL: React.CSSProperties         = { margin: "0 0 20px", paddingLeft: 24, fontSize: 18, lineHeight: 1.75, color: INK70 };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StorytellingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide III · Storytelling" />
        <div className="grid-dark-card" style={{ alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">For Business &amp; Brand</Pill>
            <h1 style={{ margin: "16px 0 24px", fontFamily: SERIF, fontWeight: 700, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
              Storytelling 101:{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>Elevate Your Brand</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              Have you ever wondered how Nike, Google, or Airbnb deliver results every time by crafting their own stories? This guide takes you through the power of storytelling — from the neuroscience behind it to real case studies — and shows you how to build your own brand narrative.
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
        <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${INK15}` }}>
          {[
            { label: "Author",    value: "Azza Shahid  ·  Edited by Syed Irfan Ajmal" },
            { label: "Published", value: "April 17, 2020  ·  Revised July 2021" },
            { label: "Read time", value: "~25 minutes" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hero image ──────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <img
          src={IMG.hero}
          alt="Brand Storytelling Guide"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      <HRule />

      {/* ── Article Body ──────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>

          {/* ── 01 Introduction ───────────────────────────────── */}
          <h2 style={H2} id="introduction">01 · Introduction</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            This innovative guide gives you an insight into the power of storytelling and how you can elevate your brand and engage your target audience by 10x.
          </p>
          <p style={P}>
            Let me take you through a journey that will inform, inspire and motivate you to create your own unique brand story. Have you ever wondered how Nike, Google or Airbnb deliver and gain results, every time, by crafting their own stories?
          </p>
          <p style={P}>
            Within this guide, you&apos;ll learn about actual case studies from all three of them that will inspire you. You&apos;ll also discover the best steps to pave your own way to storytelling success.
          </p>

          {/* ── 02 Food for Thought ───────────────────────────── */}
          <h2 style={H2} id="food-for-thought">02 · Food for Thought</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Stories are at the heart of the human experience.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              &ldquo;We are all storytellers. We all live in a network of stories. There isn&apos;t a stronger connection between people than storytelling.&rdquo;
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Jimmy Neil Smith — Director, International Storytelling Center</SCaps>
          </div>
          <p style={P}>
            Listening to or reading stories helps us put ourselves in someone else&apos;s shoes so we can see the world from their perspective, and in turn, empathize with them. Sharing our own tales of life&apos;s trials and tribulations is a therapeutic experience for the storyteller. Even sitting with elders — such as our grandparents — for a simple conversation can reveal a lot of beneficial stories from decades ago.
          </p>
          <p style={P}>
            From Aesop of Greece to Saadi Shirazi of Iran, from Molla Nasreddin of Turkey to William Shakespeare of the UK (the world&apos;s best-selling fiction writer of all time with an estimated 4 billion copies sold), it is a vast collection of stories that has mesmerized, entertained, and informed countless generations through the works of master storytellers.
          </p>

          <ArticleImg
            src={IMG.aesop}
            alt="Illustration of Aesop's fables"
            caption="Source: Melloo. The fables of Aesop of Greece — one of history's most celebrated storytellers."
            width={553}
          />

          <ArticleImg
            src={IMG.qissaKhawani}
            alt="The Storytellers' Market — Qissa Khawani Bazaar in Peshawar"
            caption="The Qissa Khawani Bazaar (Storytellers' Market) in Peshawar, where travellers from North Asia would rest and share their stories."
            width={553}
          />

          <p style={P}>
            For hundreds of years, travellers from North Asia would rest at a bazaar called the Qissa Khawani Bazaar (or the Storytellers&apos; Market) in Peshawar and tell their stories before travelling further into the Indian subcontinent.
          </p>

          {/* ── 03 Storytelling & Marketing ───────────────────── */}
          <h2 style={H2} id="storytelling-marketing">03 · So What Does Storytelling Have to Do with Marketing and Brand Awareness?</h2>
          <HRule />
          <div style={{ ...BLOCKQUOTE, marginTop: 20 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              &ldquo;A brand is the unique story that consumers recall when they think of you.&rdquo;
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Laura Busche</SCaps>
          </div>
          <p style={P}>
            Storytelling is an unprecedented medium in marketing that connects your brand with your target audience. From Spotify to Google, or from IBM to Zillow, several brands are implementing this technique in order to engage their audiences more effectively.
          </p>

          <ArticleImg
            src={IMG.hubspotB2B}
            alt="HubSpot B2B content storytelling infographic"
            caption="Source: HubSpot. B2B brands that use storytelling in their content marketing see dramatically higher engagement."
            width={553}
          />

          {/* ── 04 Elevate Your Brand ─────────────────────────── */}
          <h2 style={H2} id="elevate-brand">04 · Elevate Your Brand</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            In order to fully understand how storytelling can help you elevate your brand, we first need to gain clarity on the definition of storytelling: which is a process, whereby facts and narratives are used to communicate ideas, thoughts, emotions and messages.
          </p>
          <p style={P}>
            Once you understand the definition of storytelling you need to think about how you can use this strategy to benefit your organization.
          </p>

          {/* ── 05 Five Things to Plan ────────────────────────── */}
          <h2 style={H2} id="five-things">05 · Five Things to Plan Before Telling Stories of Impact for Your Organisation</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Rohan Potdar argues that there are five fundamental things to plan before telling stories of impact for your organization as outlined in the image below:
          </p>

          <ArticleImg
            src={IMG.fiveThings}
            alt="Rohan Potdar's five fundamentals for telling stories of impact"
            caption="Source: Rohan Potdar. The five fundamentals to plan before telling stories of impact for your organisation."
            width={553}
          />

          <p style={P}>
            Modern day storytellers are much more than just authors and journalists. Many times they are also the equivalent of content marketers, content writers, creatives and PR professionals.
          </p>
          <p style={P}>
            Stories, undoubtedly, evoke emotions and have the power to motivate, inspire and uplift people in order to facilitate communication between two parties.
          </p>

          {/* ── 06 Storytelling for Brands ────────────────────── */}
          <h2 style={H2} id="storytelling-brands">06 · Storytelling for Brands</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            In the case of brands, the two parties are the brand and the customer. The brand communicates a message through the story and the customer engages with the story being delivered to them and takes action accordingly.
          </p>

          <ArticleImg
            src={IMG.brandCanvas}
            alt="The brand canvas — creating and communicating a compelling brand"
            caption="Source: Ignition Framework. The brand canvas shows how brand identity, story, and audience connect."
            width={553}
          />

          <p style={P}>
            Knowing how to tell a story, and what the ingredients of a great story are, will enable your brand to gain more revenue and attain better brand visibility. Below is a comparison of what constitutes storytelling for brands and what storytelling should <em>not</em> be:
          </p>

          <ArticleImg
            src={IMG.storytellingTable}
            alt="Storytelling table comparing what brand storytelling is vs. what it should not be"
            caption="Storytelling table by Tasnim Nazeer — comparing effective brand storytelling with what to avoid."
            width={553}
          />

          <p style={P}>
            There are different types of stories including fiction, non-fiction, informative or educational and each one has their own core message to deliver. However, in branding, you will find that stories often reflect a deep-rooted message that either inspires, motivates or entices the reader to act on a call to action.
          </p>

          {/* ── 07 Defining Brand Storytelling: 8 Key Tips ───── */}
          <h2 style={H2} id="brand-storytelling">07 · Defining Brand Storytelling — 8 Key Tips for Master Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            These concepts will be discussed in more detail below, where we outline 8 key tips that will enable you to master the concept of storytelling in your marketing efforts and create lucrative value for scaling up your brand.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>1. Gaining Clarity for Your Brand Message</span></h3>
          <p style={P}>
            When storytelling is done correctly, it clearly defines your brand message and establishes what your brand is all about. It is paramount that your story expresses the core values of your brand, mission and purpose. In order to do this, you need to pinpoint exactly what aspect of your brand message you want to offer your audience.
          </p>

          <ArticleImg
            src={IMG.mozStrategy}
            alt="Moz content strategy template"
            caption="Source: Moz. A clear content strategy framework helps define what your brand message should convey."
            width={553}
          />

          <p style={P}>
            Let&apos;s say that you run an <strong>ethically based company</strong> and you want to craft a story that highlights the benefits of <strong>ethical trade</strong>.
          </p>

          <ArticleImg
            src={IMG.asosEthical}
            alt="ASOS ethical trade and corporate responsibility"
            caption="Source: ASOS. An example of a brand leading with its ethical values in storytelling."
            width={624}
          />

          <p style={P}>
            Alternatively, you might be a company leading in innovation and you want to express how artificial intelligence is being implemented through your services — focusing your story on your brand driving the future of innovation.
          </p>

          <ArticleImg
            src={IMG.boschFuture}
            alt="Bosch — driving the future of mobility"
            caption="Source: Bosch. An example of a technology brand using storytelling to communicate innovation leadership."
            width={625}
          />

          <p style={P}>
            No matter what the business or industry, there are countless angles you can draw upon to tell your story effectively. What&apos;s most important is that you and your content marketing team are clear on what message you want to convey and what you want to achieve from conveying that message to your audience.
          </p>
          <p style={P}>
            Focusing on what makes your brand <strong>unique</strong>, and gives you the <strong>edge</strong> over other brands, can really help showcase the <strong>benefits</strong> of your brand by subtly expressing them through the message of your story. Clarity also ensures that your whole team is consistent in weaving your brand ethos into your copy, done habitually throughout your marketing efforts.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>2. Know Your Audience</span></h3>
          <p style={P}>
            Every business has a <strong>target audience</strong> they want to sell to or persuade to take a specific action or set of actions. When using storytelling as part of your <strong>marketing campaign</strong>, you need to be aware of <strong>who</strong> you are trying to engage.
          </p>

          <ArticleImg
            src={IMG.targetAudience}
            alt="Target audience infographic"
            caption="Source: Vector / Artist: Robuart (royalty free). Understanding your target audience is fundamental to effective brand storytelling."
            width={625}
          />

          <p style={P}>
            Is the audience of your story a parent, a business owner or a healthcare professional? It is imperative that you make the audience (and their pain points) a significant part of your story. By doing so you can create a story that puts your audience in the picture.
          </p>
          <p style={P}>
            An effective way to do this is to include a relatable character that reflects your target market when telling your brand&apos;s story. You must be able to make the audience see themselves in your story in order for them to want to take action and purchase your product.
          </p>
          <p style={P}>
            It may benefit you considerably to conduct{" "}
            <a href="https://blog.hubspot.com/sales/target-market" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>target market research</a>{" "}
            which will help you pinpoint the needs of your audience and gather key information in creating your story. In addition, you can craft detailed{" "}
            <a href="https://blog.hubspot.com/marketing/buyer-persona-research" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>buyer personas</a>{" "}
            for your business to help create representations of your audience and aid in your overall marketing efforts and campaigns.
          </p>
          <p style={P}>
            The more research you conduct on your target market, the more likely you will be able to create a service that meets their needs and which will enable you to run a successful marketing campaign using storytelling as an innovative technique.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>3. Using Language Effectively</span></h3>
          <p style={P}>
            The language you choose to use in your story is critical to how well the story is received. You can evoke emotions, influence and inspire by choosing the right words to use. Some of the best brand storytellers rely upon short action verbs (such as act, move, play) to get the story moving.
          </p>

          <ArticleImg
            src={IMG.nikeJustDoIt}
            alt="Nike Just Do It campaign"
            caption="Source: Nike (Just Do It campaign video). Nike's language is direct, active, and emotionally charged."
            width={625}
          />

          <p style={P}>
            Ensure that the language used within your story is <strong>relatable</strong> to your audience and is not too formal. Some of the best stories are told as if you were having a conversation with another person, as it provides a form of informality to the audience.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              &ldquo;I write with my ears.&rdquo;
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Eugene Schwartz — Copywriter</SCaps>
          </div>
          <p style={P}>
            The science of storytelling uses language in such a way that it spurs the <strong>imagination</strong> of those who are reading about it, listening to it or even watching as your brand story evolves. <strong>Alliteration</strong>, or the use of memorable grammatical nuances, is a powerful way to make a brand statement that really stands out.
          </p>

          <ArticleImg
            src={IMG.dunkinDonuts}
            alt="Dunkin' Donuts — alliteration in branding"
            caption="Source: Dunkin' Donuts. Alliteration in brand names gives an indelible rhythm to your words."
            width={625}
          />

          <p style={P}>
            Using alliteration helps give an indelible <strong>rhythm</strong> to your words that can also be translated into names, products or services to make them unforgettable. Some successful examples of this include &lsquo;Dunkin&apos; Donuts&rsquo;, &lsquo;Best Buy&rsquo; and &lsquo;PayPal&rsquo;.
          </p>

          <ArticleImg
            src={IMG.paypal}
            alt="PayPal — alliterative brand name"
            caption="Source: PayPal. &apos;PayPal&apos; is a perfect example of alliteration making a brand name instantly memorable."
            width={625}
          />

          <p style={P}>
            Another key technique is to use conversational language in your stories to create a sense of comfort in engaging with your audience, which can make the story more <strong>believable</strong>. Take Amazon&apos;s Alexa, for example, which is known for its wildly popular wake word &ldquo;Alexa&rdquo;.
          </p>

          <ArticleImg
            src={IMG.amazonAlexa}
            alt="Amazon Alexa — conversational language in branding"
            caption="Source: Amazon. Alexa uses conversational language to make technology feel personal and approachable."
            width={625}
          />

          <p style={P}>
            Marketers have to think <strong>very carefully</strong> about the language they use to convey their brand message as it is a crucial component of a successful campaign.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>4. Crafting a Story</span></h3>
          <p style={P}>
            Crafting a story takes a special skill set and is often considered by industry leaders as a <strong>form of art</strong>. Apart from the relatively basic concepts of a beginning, a middle and an end, marketers also have to think about presenting both a <strong>problem and its solution</strong>.
          </p>
          <p style={P}>
            Justin Lokitz, author at <em>Designing Better Business</em>, highlights the importance of using a <strong>storytelling canvas</strong> to help craft your story. You might even benefit from using a canvas like the one below:
          </p>

          <ArticleImg
            src={IMG.storyCanvas}
            alt="Designing Better Business — storytelling canvas"
            caption="Source: Designing Better Business. A storytelling canvas helps you map characters, conflict, and resolution before writing a single word."
            width={625}
          />

          <p style={P}>
            Some of the most effective brand stories involve a <strong>conflict and resolution</strong> scenario, which is something that brands need to take into account when crafting their copy. <strong>Openers</strong> play a key role in brand stories and can help immediately draw the reader or listener right into it.
          </p>
          <p style={P}>
            An opener is literally <strong>the first sentence of your story</strong> — the way you begin it to gain your audience&apos;s attention within just a few seconds. Contemporary and effective openers should start with sentences that make you want to know more and ask questions such as <em>how?, what?,</em> and <em>why?</em>
          </p>
          <p style={P}>
            Once the opener is set, you can add depth to your story by narrating it through relatable characters. Depending on your core message, you could choose to add a level of entertainment by including witty lines that would make your story memorable. You may want to include new information into your copy, ensuring that the story not only informs but also educates your audience.
          </p>
          <p style={P}>
            It is important to remember that when brands express stories, <strong>&ldquo;less is more.&rdquo;</strong> There is no point in creating a long, exhaustive story which will cause the audience to lose interest — in comparison to a short and catchy story.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>5. 3 Key Factors a Brand Story Needs</span></h3>
          <div style={{ ...BLOCKQUOTE, background: "rgb(249, 238, 199)" }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17, color: INK, lineHeight: 1.7 }}>
              The three key factors of a successful brand story are:<br />
              <strong>1) An introduction to relatable characters.</strong><br />
              <strong>2) A problem that needs to be solved.</strong><br />
              <strong>3) A viable solution.</strong>
            </p>
          </div>
          <p style={P}>
            The process of first setting the scene — using characters your audience can relate to — immediately encourages engagement. Audiences can be easily distracted as they are constantly bombarded with information from various sources. In order to avoid the distraction, make sure the first few seconds of your introduction to the main character grip your audience and make them want to watch or read on further.
          </p>
          <p style={P}>
            You can do this by <strong>presenting a conflict</strong> that your character is undergoing. For example, if your brand wants to portray a message about education and sells <strong>educational apps</strong> that are affordable for all, then your story may want to start with a character who can&apos;t afford to go to school.
          </p>
          <p style={P}>
            The conflict of not being able to get educated and the solution that your service could bring would later be expressed within the story. A problem, or other interesting point, that is presented by a character within the opening sentences of a story is known as a <strong>hook</strong>.
          </p>
          <p style={P}>
            A relevant and real problem that your target market has needs to be identified and expressed within your story. This will create a conflict that will move your story on and make the audience want to know how it is resolved. The solution should be stated in the final part of your story to bring about a conclusion — enabling your audience to feel a sense of &lsquo;closure&rsquo; and satisfaction.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>6. Creating a Call to Action</span></h3>
          <p style={P}>
            The Call to Action (CTA) refers to the steps that your brand wants the audience to take after consuming the story you have presented to them. If you want your audience to subscribe to your newsletter, for example, your CTA may be &ldquo;subscribe here&rdquo; — or if you want them to purchase a product, your CTA may be &ldquo;purchase here&rdquo;.
          </p>
          <p style={P}>
            The CTA is normally adopted at the end of the story and is most often carried out in a manner that is non-intrusive, but direct. Many brands use this technique at the end of their social media videos, such as when the presenter or narrator says &ldquo;Subscribe down below&rdquo; or &ldquo;To keep updated click the link below&rdquo;.
          </p>

          <ArticleImg
            src={IMG.constantContact}
            alt="Constant Contact — CTA email marketing example"
            caption="Source: Constant Contact. A clear, non-intrusive call to action at the end of a story drives the audience toward the next step."
            width={625}
          />

          <ArticleImg
            src={IMG.productiveMuslim}
            alt="Productive Muslim — newsletter CTA example"
            caption="Source: Productive Muslim. A newsletter CTA embedded naturally at the end of content."
            width={625}
          />

          <p style={P}>
            It is important to consider the objectives of your brand story, as this will guide you in developing the action that you want to achieve through your marketing content. If the objective of your story is to foster communication pathways between your brand and the customer, you may want to include an action such as &ldquo;tap the button to share&rdquo;.
          </p>
          <p style={P}>
            The more people that share your brand story, the more brand awareness will rise. Eventually, you will see an increase in customer engagement.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>7. Identifying Storytelling Platforms</span></h3>
          <p style={P}>
            There are a variety of platforms that you can use to share your story. The main platforms are in either a digital text, video or audio format — where you can upload your story on your website or share it on social media channels. The image below shows a variety of innovative platforms that digital storytellers can use:
          </p>

          <ArticleImg
            src={IMG.platforms}
            alt="Digital storytelling platforms"
            caption="Source: Medium. The landscape of digital storytelling platforms spans text, audio, video, and interactive formats."
            width={625}
          />

          <p style={P}>
            The storytelling platform you choose should be appropriate for your brand and outreach. Many brands find that conveying stories through digital platforms is the best option in order to reach a wider audience, both locally and internationally.
          </p>
          <p style={P}>
            It is important to take into consideration the creative aspects of your story and whether you will be presenting your story through the eyes of a character or having a narrator tell the story while using visual representation. Written stories enable you to be descriptive and use words that leave room for the reader to imagine or interpret each of the scenes.
          </p>
          <p style={P}>
            Most importantly, you don&apos;t necessarily have to take a &ldquo;blank paper&rdquo; approach when creating your brand story. Take a look at the competition for inspiration — consider what other brands similar to yours have done to convey their brand stories, and whether they have used digital or written mediums.
          </p>
          <p style={P}>
            Whichever option you choose, make sure that you have researched the most effective format for your story so that you can reach more people and amplify your brand.
          </p>

          <h3 style={H3}><span style={HIGHLIGHT}>8. Sharing Your Story on Social Media</span></h3>
          <p style={P}>
            Social media is one of the most lucrative platforms to share your brand story through sites like Facebook, Twitter, Instagram and YouTube.
          </p>

          <ArticleImg
            src={IMG.instagramBiz}
            alt="Instagram Business — social media storytelling"
            caption="Source: Instagram Business. Instagram&apos;s visual-first platform is one of the most powerful channels for brand storytelling."
            width={625}
          />

          <p style={P}>
            There are a variety of different social media platforms that enable you to upload your video or written content to engage your audience. Speaking of videos, editing videos is easier than ever with tools like{" "}
            <a href="https://www.veed.io/" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>Veed</a>.
          </p>
          <p style={P}>
            According to the leading research company Statista, in 2019 there were an estimated{" "}
            <a href="https://www.statista.com/statistics/278414/number-of-worldwide-social-network-users/" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>2.77 billion</a>{" "}
            social network users around the globe, up from <strong>2.46 billion</strong> in 2017.
          </p>
          <p style={P}>
            As you can see, social media gives you an unprecedented platform to engage billions of people around the world and share your brand story across the continents. Social media users love visuals — compelling narratives, captivating visuals and relatable, emotive stories are the keys to engaging audiences on social media and a must-have for all brands who want to grow their business effectively.
          </p>

          {/* ── 08 Benefits ───────────────────────────────────── */}
          <h2 style={H2} id="benefits">08 · Benefits of Implementing Brand Storytelling Techniques</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            The benefits of implementing storytelling as a technique for marketers cannot be understated.
          </p>

          <ArticleImg
            src={IMG.benefitsChart}
            alt="Benefits of brand storytelling chart"
            caption="Source: Just Learn WP (credited to PR Mention). The measurable impact of brand storytelling on engagement, loyalty, and conversions."
            width={553}
          />

          <p style={P}>
            Storytelling is a fundamental driver of growth and understanding, especially when it comes to brands and the way they want to interact with their customers and followers. Some of the <strong>main benefits</strong> of storytelling is that it enables a brand to show some <strong>personality</strong> to convey the ethos of the company and what it stands for.
          </p>
          <p style={P}>
            Conventional copy on a business website does not enable a brand to get creative or convey their core values to their audience. Yet, storytelling does. In addition, using stories helps your brand take the lead and gives it an edge over competitor brands as you may be better able to inspire and motivate through the story that you tell.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK70, marginBottom: 8 }}>
              &ldquo;How did your brand or service help someone to overcome a challenge? How did your brand enable someone to identify and find a solution to a pressing problem that they may have been experiencing for a while?&rdquo;
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Tasnim Nazeer — Journalist</SCaps>
          </div>
          <p style={P}>
            These are key questions that your brand needs to address in order to establish itself as a leading part of the story and give prominence in taking your audience on a journey. The <strong>journey</strong> is conveyed through your story — you&apos;re creating a narrative which takes your audience through a process that leads to a problem being solved. The end result is that your brand comes out as the winner, since you&apos;ve proven how it can benefit the consumer.
          </p>

          {/* ── 09 Science ────────────────────────────────────── */}
          <h2 style={H2} id="science">09 · The Science of Storytelling</h2>
          <HRule />

          <ArticleImg
            src={IMG.scienceBrain}
            alt="How storytelling affects the brain — Fast Company"
            caption="Source: Fast Company. How storytelling affects the different regions of the brain — from emotional processing to motor cortex activation."
            width={553}
          />

          <p style={{ ...P, marginTop: 20 }}>
            The science of storytelling is an interesting concept to grasp and is one that brands should pay close attention to. Recent research reveals that <strong>100,500 digital words are consumed by the average US citizen on a daily basis</strong>. In addition, <strong>92% of consumers</strong> wanted brands to make ads that felt like a story.
          </p>
          <p style={P}>
            This shows that audiences are much more likely to engage with brands that have already implemented storytelling techniques, in comparison to those who haven&apos;t. Consumers want to engage and relate with the content that they are given. Thanks to the research behind the Science of Storytelling, brands are able to see just how important this technique is in creating interactions with their customers.
          </p>

          {/* ── 10 Neuroscience ───────────────────────────────── */}
          <h2 style={H2} id="neuroscience">10 · Neuroscience of Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            The brain plays a pivotal role in our absorption of information and how we process messages, news and information. It is a long-held theory that when we converse with one another our brain is more alert to the language and words that we use.
          </p>
          <p style={P}>
            The brain processes images <strong>60 times faster</strong> in comparison to words. This reiterates the fact that visuals play a significant role in our daily lives. In many cases, we associate certain visuals with an event or life experience.
          </p>

          <ArticleImg
            src={IMG.visualBrain}
            alt="Visual storytelling and the brain — Cushman Creative"
            caption="Source: Cushman Creative. Visuals are processed dramatically faster than text, making visual storytelling a powerful tool for brands."
            width={553}
          />

          <p style={P}>
            Interestingly, branding and stories that implement compelling visuals are more likely to be remembered than those that use no visuals. Storytelling directly affects the brain as it enables us to reflect on movement and the way we go from point A to point B.
          </p>
          <p style={P}>
            According to a report by{" "}
            <a href="https://marketingland.com/the-science-of-storytelling-245561" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>Marketing Land</a>,
            {" "}neurology plays a key role in our understanding of storytelling and the way we process images. Neuroeconomist{" "}
            <a href="https://marketingland.com/the-science-of-storytelling-245561" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>Paul J. Zak</a>{" "}
            carried out experiments that highlighted the role that the hormonal secretion oxytocin plays. Zak believed that neurotransmitters are transmitted from the brain in order for us to reciprocate an action.
          </p>
          <p style={P}>
            Based on the research that Zak conducted, he found that when participants experienced trust they reciprocated with prosocial behaviours. In addition, Zak learned that participants tended to focus on stories that were significant to them or that they felt they could understand. This shows a definitive link between neurology and the way our brains consume information and react upon stories that we are immersed in.
          </p>
          <p style={P}>
            Zak&apos;s experiments also lead to the conclusion that our brains are susceptible to responding to a story&apos;s movement from a problem to a solution.{" "}
            <a href="/resources/neuromarketing" style={{ color: INK }}>Neuroimaging</a>{" "}
            reveals that the human brain becomes more alert through the use of metaphors in stories, which cause the audience to react with empathy and emotion. The brain processes a metaphor as if it were imagery and enables us to form comparisons with the language we use and real life experiences.
          </p>

          {/* ── 11 Case Studies ───────────────────────────────── */}
          <h2 style={H2} id="case-studies">11 · Successful Implementation of Stories in Leading Brands</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            If you are looking for inspirational brands who have successfully implemented the technique of storytelling into their marketing efforts, then take a look at the examples below:
          </p>

          <h3 style={H3}>Airbnb</h3>

          <ArticleImg
            src={IMG.airbnb}
            alt="Airbnb brand storytelling — screenshot from Airbnb.com"
            caption="Source: Airbnb. The brand&apos;s homepage tells a story of belonging and exploration rather than simply listing properties."
            width={553}
          />

          <p style={P}>
            Airbnb uses compelling visuals and effective storytelling techniques that appeal to their audiences through brand stories which they create in video form. The company knows what their audiences want — to travel to new places and gain new experiences. They&apos;ve successfully tapped into their customer&apos;s desires and needs.
          </p>
          <p style={P}>
            On{" "}
            <a href="https://blog.globalwebindex.com/marketing/brand-storytelling/" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>New Year&apos;s Eve 2015</a>,
            {" "}the company created an animated video to announce that <strong>550,000 people rented properties around the world for that specific occasion</strong> — a staggering leap from only 2,000 rentals in the previous year.
          </p>
          <p style={P}>
            Airbnb&apos;s latest video tells a poignant story by immersing travel seekers with families from different homes to show how people are, essentially, making a home from home. The excellent use of compelling narratives and visual content makes Airbnb stand out from competitor brands. The success can also be attributed to their thorough research into their target market and the relevant aspirations that their clients were seeking to tap into.
          </p>

          <h3 style={H3}>Google</h3>

          <ArticleImg
            src={IMG.googleAtap}
            alt="Google ATAP — Google storytelling platform"
            caption="Source: Google ATAP. Google uses dedicated storytelling platforms and their annual Year in Search video to create emotional connections at scale."
            width={553}
          />

          <p style={P}>
            Google are pioneers in the development of their stories and the many subsidiaries of platforms they own. One such example is their dedicated{" "}
            <a href="https://atap.google.com/intl/en-GB/spotlight-stories/" target="_blank" rel="noopener noreferrer" style={{ color: INK }}>Google Spotlight Stories platform</a>{" "}
            for clients. Google also runs a &lsquo;Year in Search&rsquo; video which is released every year and is compiled by using Google data to showcase the terms that people search for the most.
          </p>
          <p style={P}>
            The Year in Search video has been successful in engaging audiences and staying relevant to what users want. One of the main reasons that Google often gets top engagement with their campaigns is the fact that they use a lot of data and research to reflect the needs of their users. The company also tends to use relevant events and visuals that are significant to their target audience to spur emotions and raise more engagement whilst staying current on trending stories.
          </p>
          <p style={P}>
            Google is known for its creativity, and on the home page itself you will see a new design of the Google logo on special occasions — known as a &ldquo;Google Doodle&rdquo;, it usually commemorates a historical figure, a holiday or other special occasion. Visuals play a significant role in Google&apos;s marketing, and there is consistency in branding throughout all of Google&apos;s services which provides continuity and makes the brand more memorable.
          </p>

          <h3 style={H3}>Nike</h3>

          <ArticleImg
            src={IMG.nikeEquality}
            alt="Nike Equality campaign"
            caption="Source: Nike (equality.nike.com). Nike&apos;s Equality campaign is a masterclass in storytelling that transcends product promotion."
            width={553}
          />

          <p style={P}>
            Nike have always been known for creating captivating visual campaigns and their marketing efforts have not gone unnoticed. Nike&apos;s Equality campaign, for example, drove unprecedented engagement through their brand story of being a force of positive social change and equality for all. This is a clear example of a brand that goes beyond their own product line and looks into the needs of its target audience and the issues affecting them.
          </p>
          <p style={P}>
            The brand cleverly creates a collective movement through the use of the equality campaign — so any customer who buys the trainers will also be proud to support the movement for equality. The shoes are simply seen on the feet of the protagonists in the video, but there is no selling involved whatsoever in the story. The selling is done through the message of the company&apos;s ethos and the associations that Nike has as being a positive trailblazer in creating strong and powerful movements.
          </p>
          <p style={P}>
            The company continues to use colourful visuals and video content to reach their customers around the world and scale up their brand both in the US and internationally.
          </p>

          {/* ── 12 Succeeding ─────────────────────────────────── */}
          <h2 style={H2} id="succeeding">12 · Succeeding with Brand Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            There are many ways to develop and craft a powerful brand story as discussed within this guide. You can also take inspiration from success stories of the aforementioned brands who are achieving significant results through their marketing efforts.
          </p>
          <p style={P}>
            Whether you are at the start of your brand journey or have already implemented a marketing strategy, you can accelerate your brand awareness, identity and profitability through storytelling. We have seen that some of the most successful brands — such as Nike, Google and Airbnb — have gone on to achieve and innovate in their respective industry sectors.
          </p>
          <p style={P}>
            This could not be achieved without effective marketing strategies being in place and the use of stories to get people to take action. Entrepreneurs or marketers who want to succeed in growing their business must remember that there needs to be a clear focus on what your product, service or company can offer and the value it could bring to your customer.
          </p>
          <div style={{ ...BLOCKQUOTE, background: PAPER, border: "none", padding: "0 0 20px 0" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.3, color: INK }}>
              How does your company solve your customer&apos;s problem?
            </div>
          </div>
          <p style={P}>
            This is one of the first things you need to consider before crafting your story, as getting the foundation right is key to creating a successful campaign. Often, entrepreneurs overlook the fact that many consumers are purchasing for a need to be met. The need could be a range of things such as wanting to beautify themselves, satisfy hunger or learn something new.
          </p>
          <p style={P}>
            Irrespective of the need, it is up to the company to show how best they can overcome the problem and take the customer through a journey which expresses it. This journey forms the major part of your brand story — whereby you are taking your customer from one place to another.
          </p>
          <p style={P}>
            Many times brands will use comparisons such as a <strong>&lsquo;before and after&rsquo;</strong> or a <strong>&lsquo;rags to riches&rsquo;</strong> story that shows a transition from one state to another and a noticeable movement. <strong>This movement needs to be expressed clearly within your brand story</strong> and it will help engage your customers and pave the way to achieve more brand engagement.
          </p>
          <p style={P}>
            Social media should also form part of a brand&apos;s marketing strategy, playing a significant role in sharing your brand story whether that be through audio, visual or written form.
          </p>
          <p style={P}>
            If you feel passionately about a cause and it correlates with the ethos of your company, you may want to consider openly supporting it just like Nike did with the Equality campaign. There are many brands who have found success in supporting the causes that relate to their target audience or which their brand demographic identifies with. However, the cause that you wish to champion should hold some relevance to your brand message, ethos and values.
          </p>
          <p style={P}>
            By understanding the fundamental links between neurological processes that enable people to consume stories and immerse themselves in them, you are one step closer to developing a brand story that would be evergreen and memorable. Once you identify the process that a person goes through when engaged in a story, you are more likely to be able to tap into what could potentially make a great story for your brand.
          </p>

          {/* ── Additional Sources ────────────────────────────── */}
          <h2 style={{ ...H2, fontSize: 24 }}>Additional Sources</h2>
          <HRule />
          <ol style={{ ...OL, marginTop: 16, listStyleType: "none", paddingLeft: 0 }}>
            {[
              "Best Website Design Company Blog. (2018). 21 Creative Tools List for Video Storytelling & Brand Marketing. fatbit.com",
              "Digital Marketing Institute. (2018). 6 Storytelling Trends Marketing Leaders Should Know About. digitalmarketinginstitute.com",
              "Craig, W. (2018). 5 Essential Elements Of Powerful Brand Storytelling. Forbes.",
              "JP Phillips, D. (2018). The Magical Science of Storytelling. TEDx Talk.",
              "Karia, A. (2013). Storytelling Techniques from TED Talks. akashkaria.com",
              "Vaughan, P. (2018). How to Create Detailed Buyer Personas for Your Business. HubSpot Blog.",
            ].map((src, i) => (
              <li key={i} style={{ borderBottom: `1px solid ${INK15}`, padding: "12px 0", fontSize: 16, color: INK70, lineHeight: 1.6 }}>
                {src}
              </li>
            ))}
          </ol>

          {/* ── References ────────────────────────────────────── */}
          <h2 style={{ ...H2, fontSize: 24 }}>References</h2>
          <HRule />
          <ol style={{ ...OL, marginTop: 16, listStyleType: "none", paddingLeft: 0 }}>
            {[
              "Ajmal, S. (2018). Neuromarketing 101: What Is Neuromarketing And How Does It Work? syedirfanajmal.com",
              "Gillett, R. (2018). Why Our Brains Crave Storytelling In Marketing. Fast Company.",
              "Griotdigital.com. (2018). Boosting Lead Generation 16X with Content Storytelling. griotdigital.com",
              "Higgins, S. (2018). The Straight-Forward Guide to Target Markets. HubSpot Blog.",
              "Keane, L. (2018). 10 Examples of Brand Storytelling (with Data) that Hit the Mark. Global Web Index Blog.",
              "Minnium, P. (2018). The science of storytelling. Marketing Land.",
              "Statista. (2018). Number of social media users worldwide 2010–2021. statista.com",
              "Vaughan, P. (2018). How to Create Detailed Buyer Personas for Your Business. HubSpot Blog.",
            ].map((ref, i) => (
              <li key={i} style={{ borderBottom: `1px solid ${INK15}`, padding: "12px 0", fontSize: 16, color: INK70, lineHeight: 1.6 }}>
                {ref}
              </li>
            ))}
          </ol>

        </div>
      </section>

      <HRule />

      {/* ── Next Steps ──────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="13" label="Next Steps · Apply What You&apos;ve Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            {
              title: "Continue reading",
              body: "Explore the other guides — Personal Branding, Neuromarketing, and Writing Tips — to round out your full marketing toolkit.",
              cta: "Back to Resources",
              href: "/resources",
            },
            {
              title: "Get press coverage",
              body: "The EMOS programme applies these storytelling principles to earned media — landing you in Forbes, HBR, and your category's key publications.",
              cta: "Learn about EMOS",
              href: "/emos",
            },
            {
              title: "Work with Syed",
              body: "For a fractional CMO arrangement or a done-for-you earned media programme, book a discovery call.",
              cta: "Book a call",
              href: CALENDLY,
            },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK70 }}>{body}</p>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none" }}
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

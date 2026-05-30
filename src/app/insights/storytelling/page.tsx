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

const TOC = [
  { n: "01", id: "food-for-thought", title: "Food for Thought" },
  { n: "02", id: "storytelling-marketing", title: "Storytelling & Brand Awareness" },
  { n: "03", id: "brand-storytelling", title: "Defining Brand Storytelling (8 Key Tips)" },
  { n: "04", id: "benefits", title: "Benefits of Brand Storytelling" },
  { n: "05", id: "science", title: "The Science of Storytelling" },
  { n: "06", id: "neuroscience", title: "Neuroscience of Storytelling" },
  { n: "07", id: "case-studies", title: "Case Studies: Airbnb, Google, Nike" },
  { n: "08", id: "succeeding", title: "Succeeding with Brand Storytelling" },
];

const P: React.CSSProperties = { margin: "0 0 20px", fontSize: 18, lineHeight: 1.75, color: INK70 };
const H2: React.CSSProperties = { margin: "48px 0 20px", fontWeight: 700, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, fontFamily: SERIF };
const H3: React.CSSProperties = { margin: "32px 0 14px", fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: INK, fontFamily: SERIF };
const H4: React.CSSProperties = { margin: "24px 0 10px", fontWeight: 700, fontSize: 18, lineHeight: 1.2, color: INK, fontFamily: SERIF };
const BLOCKQUOTE: React.CSSProperties = { margin: "28px 0", padding: "20px 24px", borderLeft: `4px solid ${YEL}`, background: PAPER2 };
const OL: React.CSSProperties = { margin: "0 0 20px", paddingLeft: 24, fontSize: 18, lineHeight: 1.75, color: INK70 };

export default function StorytellingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide III · Storytelling" />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">For Business & Brand</Pill>
            <h1 style={{ margin: "16px 0 24px", fontWeight: 700, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
              Storytelling 101:{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>Elevate Your Brand</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              Have you ever wondered how Nike, Google, or Airbnb deliver results every time by crafting their own stories? This guide takes you through the power of storytelling — from the neuroscience behind it to real case studies — and shows you how to build your own brand narrative.
            </p>
          </div>
          <div style={{ paddingTop: 8 }}>
            <Pill size={10.5} ls="0.18em">In This Guide</Pill>
            <div style={{ marginTop: 16 }}>
              {TOC.map(({ n, id, title }) => (
                <a key={n} href={`#${id}`} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, padding: "10px 0", borderBottom: `1px solid ${INK15}`, textDecoration: "none", color: "inherit", alignItems: "baseline" }}>
                  <SCaps size={10} ls="0.12em" color={INK35}>{n}.</SCaps>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: INK70 }}>{title}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${INK15}` }}>
          {[
            { label: "Author", value: "Syed Irfan Ajmal" },
            { label: "Published", value: "April 2020 · Revised July 2021" },
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

          <h2 style={H2} id="food-for-thought">01 · Food for Thought</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Stories are at the heart of the human experience.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "We are all storytellers. We all live in a network of stories. There isn&apos;t a stronger connection between people than storytelling."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Jimmy Neil Smith — Director, International Storytelling Center</SCaps>
          </div>
          <p style={P}>
            Listening to or reading stories helps us put ourselves in someone else&apos;s shoes so we can see the world from their perspective, and in turn, empathize with them. Sharing our own tales of life&apos;s trials and tribulations is a therapeutic experience for the storyteller.
          </p>
          <p style={P}>
            From Aesop of Greece to Saadi Shirazi of Iran, from Molla Nasreddin of Turkey to William Shakespeare of the UK — the world&apos;s best-selling fiction writer of all time with an estimated 4 billion copies sold — it is a vast collection of stories that has mesmerized, entertained, and informed countless generations.
          </p>
          <p style={P}>
            For hundreds of years, travellers from North Asia would rest at a bazaar called the Qissa Khawani Bazaar (the Storytellers&apos; Market) in Peshawar and tell their stories before travelling further into the Indian subcontinent.
          </p>

          <h2 style={H2} id="storytelling-marketing">02 · So What Does Storytelling Have to Do with Marketing and Brand Awareness?</h2>
          <HRule />
          <div style={{ ...BLOCKQUOTE, marginTop: 20 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "A brand is the unique story that consumers recall when they think of you."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Laura Busche</SCaps>
          </div>
          <p style={P}>
            Storytelling is an unprecedented medium in marketing that connects your brand with your target audience. From Spotify to Google, from IBM to Zillow, several brands are implementing this technique in order to engage their audiences more effectively.
          </p>
          <p style={P}>
            In order to fully understand how storytelling can help you elevate your brand, we first need to gain clarity on the definition of storytelling: a process whereby facts and narratives are used to communicate ideas, thoughts, emotions, and messages.
          </p>
          <p style={P}>
            Modern-day storytellers are much more than just authors and journalists. Many times they are also the equivalent of content marketers, content writers, creatives, and PR professionals. Stories, undoubtedly, evoke emotions and have the power to motivate, inspire, and uplift people.
          </p>
          <p style={P}>
            In the case of brands, the two parties are the brand and the customer. The brand communicates a message through the story and the customer engages with the story and takes action accordingly. Knowing how to tell a story — and what the ingredients of a great story are — will enable your brand to gain more revenue and attain better brand visibility.
          </p>

          <h2 style={H2} id="brand-storytelling">03 · Defining Brand Storytelling: 8 Key Tips</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>1. Gaining Clarity for Your Brand Message</h3>
          <p style={P}>
            When storytelling is done correctly, it clearly defines your brand message and establishes what your brand is all about. It is paramount that your story expresses the core values of your brand, mission, and purpose.
          </p>
          <p style={P}>
            Let&apos;s say that you run an ethically based company and you want to craft a story that highlights the benefits of ethical trade. Or you might be a company leading in innovation and you want to express how artificial intelligence is being implemented through your services. No matter what the business or industry, there are countless angles you can draw upon. What&apos;s most important: make sure you and your team are clear on what message you want to convey and what you want to achieve.
          </p>
          <p style={P}>
            Focusing on what makes your brand unique — and what gives you an edge over other brands — can showcase your benefits by subtly expressing them through the message of your story. Clarity also ensures your whole team is consistent in weaving your brand ethos into all copy, habitually, throughout your marketing efforts.
          </p>

          <h3 style={H3}>2. Know Your Audience</h3>
          <p style={P}>
            Every business has a target audience they want to sell to or persuade to take a specific action. When using storytelling as part of your marketing campaign, you need to be aware of who you are trying to engage. Is the audience of your story a parent, a business owner, or a healthcare professional?
          </p>
          <p style={P}>
            It is imperative that you make the audience and their pain points a significant part of your story. An effective way to do this is to include a relatable character that reflects your target market. You must be able to make the audience see themselves in your story for them to want to take action.
          </p>
          <p style={P}>
            Conduct target market research to pinpoint the needs of your audience and gather key information for creating your story. Craft detailed buyer personas to help create representations of your audience and aid your overall marketing campaigns. The more research you conduct on your target market, the more likely you will be to create a service that meets their needs.
          </p>

          <h3 style={H3}>3. Using Language Effectively</h3>
          <p style={P}>
            The language you choose to use in your story is critical to how well it is received. You can evoke emotions, influence, and inspire by choosing the right words. Some of the best brand storytellers rely upon short action verbs — such as act, move, play — to get the story moving.
          </p>
          <p style={P}>
            Ensure that the language used is relatable to your audience and is not too formal. Some of the best stories are told as if you were having a conversation with another person, providing a form of informality to the audience.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "I write with my ears."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Eugene Schwartz — Copywriter</SCaps>
          </div>
          <p style={P}>
            Using alliteration helps give an indelible rhythm to your words — think of "Dunkin&apos; Donuts," "Best Buy," and "PayPal." Another key technique is conversational language, which creates a sense of comfort and makes the story more believable.
          </p>

          <h3 style={H3}>4. Crafting a Story</h3>
          <p style={P}>
            Crafting a story takes a special skill set and is often considered a form of art. Apart from the relatively basic concepts of a beginning, a middle, and an end, marketers also have to think about presenting both a problem and its solution.
          </p>
          <p style={P}>
            Some of the most effective brand stories involve a conflict-and-resolution scenario. Openers play a key role and can immediately draw the reader right into the story. Contemporary, effective openers should start with sentences that make you want to know more and ask questions such as how?, what?, and why?
          </p>
          <p style={P}>
            Once the opener is set, add depth through relatable characters. You may want to include new information that not only informs but also educates your audience. Remember: when brands express stories, "less is more" — a short, catchy story outperforms a long, exhaustive one.
          </p>

          <h3 style={H3}>5. The 3 Key Factors a Brand Story Needs</h3>
          <ol style={{ ...OL, listStyleType: "decimal" }}>
            <li style={{ marginBottom: 14 }}><strong>An introduction to relatable characters.</strong> Setting the scene with characters your audience can relate to immediately encourages engagement.</li>
            <li style={{ marginBottom: 14 }}><strong>A problem that needs to be solved.</strong> A conflict or "hook" in the first few sentences grips your audience and makes them want to read on. A relevant and real problem that your target market has needs to be identified and expressed within your story.</li>
            <li style={{ marginBottom: 14 }}><strong>A viable solution.</strong> The solution should be stated in the final part of your story, enabling your audience to feel a sense of "closure" — knowing what needs to be done to overcome a challenge.</li>
          </ol>

          <h3 style={H3}>6. Creating a Call to Action</h3>
          <p style={P}>
            The Call to Action (CTA) refers to the steps your brand wants the audience to take after consuming the story. If you want your audience to subscribe to your newsletter, your CTA may be "subscribe here." If you want them to purchase a product, your CTA may be "purchase here."
          </p>
          <p style={P}>
            The CTA is normally adopted at the end of the story and is most often carried out in a manner that is non-intrusive, but direct. Consider the objectives of your brand story — this will guide you in developing the action you want to achieve.
          </p>

          <h3 style={H3}>7. Identifying Storytelling Platforms</h3>
          <p style={P}>
            There are a variety of platforms to share your story — digital text, video, or audio formats. The storytelling platform you choose should be appropriate for your brand and outreach. Many brands find that digital platforms are the best option to reach a wider audience, both locally and internationally.
          </p>
          <p style={P}>
            Written stories enable you to be descriptive and use words that leave room for the reader to imagine each of the scenes. Visual stories leverage the brain&apos;s ability to process images 60 times faster than words. Don&apos;t take a "blank paper" approach — look at what other brands similar to yours have done and whether they have used digital or written mediums to convey their stories.
          </p>

          <h3 style={H3}>8. Sharing Your Story on Social Media</h3>
          <p style={P}>
            Social media is one of the most lucrative platforms to share your brand story. According to Statista, in 2019 there were an estimated <strong>2.77 billion social network users</strong> around the globe, up from 2.46 billion in 2017. Social media gives you an unprecedented platform to engage billions of people and share your brand story across the continents.
          </p>
          <p style={P}>
            Social media users love visuals — compelling narratives, captivating visuals, and relatable, emotive stories are the keys to engaging audiences and a must-have for all brands who want to grow their business effectively.
          </p>

          <h2 style={H2} id="benefits">04 · Benefits of Implementing Brand Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            The benefits of implementing storytelling as a technique for marketers cannot be understated. Storytelling is a fundamental driver of growth and understanding, especially when it comes to brands and the way they want to interact with their customers.
          </p>
          <p style={P}>
            Some of the main benefits of storytelling is that it enables a brand to show personality and convey the ethos of the company. Conventional copy on a business website does not enable a brand to get creative or convey core values to an audience. Yet, storytelling does.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK70, marginBottom: 8 }}>
              "How did your brand or service help someone to overcome a challenge? How did your brand enable someone to identify and find a solution to a pressing problem that they may have been experiencing for a while?"
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Tasnim Nazeer — Journalist</SCaps>
          </div>
          <p style={P}>
            These are key questions your brand needs to address in order to establish itself as a leading part of the story. You&apos;re creating a narrative that takes your audience through a process leading to a problem being solved. The end result: your brand comes out as the winner, because you&apos;ve proven how it can benefit the consumer.
          </p>

          <h2 style={H2} id="science">05 · The Science of Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Recent research reveals that <strong>100,500 digital words are consumed by the average US citizen on a daily basis</strong>. In addition, <strong>92% of consumers wanted brands to make ads that felt like a story</strong>.
          </p>
          <p style={P}>
            This shows that audiences are much more likely to engage with brands that have already implemented storytelling techniques, in comparison to those who haven&apos;t. Consumers want to engage and relate with the content they are given.
          </p>

          <h2 style={H2} id="neuroscience">06 · Neuroscience of Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            The brain plays a pivotal role in our absorption of information and how we process messages. It is a long-held theory that when we converse with one another our brain is more alert to the language and words we use.
          </p>
          <p style={P}>
            The brain processes images <strong>60 times faster</strong> in comparison to words. Branding and stories that implement compelling visuals are more likely to be remembered than those that use no visuals. Storytelling directly affects the brain as it enables us to reflect on movement — from point A to point B, from beginning to middle to end.
          </p>
          <p style={P}>
            Neuroeconomist Paul J. Zak carried out experiments that highlighted the role that the hormonal secretion oxytocin plays. Zak found that when participants experienced trust they reciprocated with prosocial behaviours. Participants tended to focus on stories that were significant to them or that they felt they could understand.
          </p>
          <p style={P}>
            Zak&apos;s experiments lead to the conclusion that our brains are susceptible to responding to a story&apos;s movement from a problem to a solution. Neuroimaging reveals that the human brain becomes more alert through the use of metaphors in stories — metaphors cause the audience to react with empathy and emotion to a brand story that is significant to them.
          </p>

          <h2 style={H2} id="case-studies">07 · Successful Implementation of Stories in Leading Brands</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>Airbnb</h3>
          <p style={P}>
            Airbnb uses compelling visuals and effective storytelling techniques that appeal to their audiences through brand stories in video form. The company knows what their audiences want — to travel to new places and gain new experiences. They&apos;ve successfully tapped into their customers&apos; desires and needs.
          </p>
          <p style={P}>
            On New Year&apos;s Eve 2015, the company created an animated video to announce that <strong>550,000 people rented properties around the world for that specific occasion</strong> — a staggering leap from only 2,000 rentals the previous year. Their latest videos tell poignant stories by immersing travel seekers with families from different homes to show how people are, essentially, making a home from home.
          </p>
          <p style={P}>
            The excellent use of compelling narratives and visual content makes Airbnb stand out from competitor brands. Their success can also be attributed to thorough research into their target market and the relevant aspirations their clients seek.
          </p>

          <h3 style={H3}>Google</h3>
          <p style={P}>
            Google are pioneers in the development of their stories and the many platforms they own. One such example is their dedicated Google Spotlight Stories platform for clients. Google also runs a "Year in Search" video released every year, compiled using Google data to showcase the terms people search for the most.
          </p>
          <p style={P}>
            The Year in Search video has been successful in engaging audiences and staying relevant to what users want. One of the main reasons Google often gets top engagement is the fact that they use a lot of data and research to reflect the needs of their users. On the Google homepage itself, you will see a new design of the Google logo on special occasions — the "Google Doodle" — commemorating a historical figure, a holiday, or other special occasion.
          </p>
          <p style={P}>
            Visuals play a significant role in Google&apos;s marketing, and there is consistency in branding throughout all of Google&apos;s services which provides continuity and makes the brand more memorable.
          </p>

          <h3 style={H3}>Nike</h3>
          <p style={P}>
            Nike have always been known for creating captivating visual campaigns. Nike&apos;s Equality campaign drove unprecedented engagement through their brand story of being a force of positive social change and equality for all. This is a clear example of a brand that goes beyond their product line and looks into the needs of its target audience and the issues affecting them.
          </p>
          <p style={P}>
            The brand creates a collective movement — any customer who buys the trainers is also proud to support the movement for equality. The shoes are simply seen on the feet of the protagonists in the video, but there is no selling involved whatsoever. The selling is done through the message of the company&apos;s ethos.
          </p>
          <p style={P}>
            Nike continues to use colourful visuals and video content to reach their customers around the world and scale up their brand both in the US and internationally.
          </p>

          <h2 style={H2} id="succeeding">08 · Succeeding with Brand Storytelling</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Whether you are at the start of your brand journey or have already implemented a marketing strategy, you can accelerate your brand awareness, identity, and profitability through storytelling. There are many ways to develop and craft a powerful brand story, as discussed within this guide.
          </p>
          <p style={P}>
            Entrepreneurs or marketers who want to succeed in growing their business must remember that there needs to be a clear focus on what your product, service, or company can offer and the value it could bring to your customer. How does your company solve your customer&apos;s problem? This is one of the first things you need to consider before crafting your story.
          </p>
          <p style={P}>
            Often, entrepreneurs overlook the fact that many consumers are purchasing for a need to be met — the need could be a range of things such as wanting to beautify themselves, satisfy hunger, or learn something new. It is up to the company to show how best they can overcome the problem and take the customer through a journey which expresses it. This journey forms the major part of your brand story.
          </p>
          <p style={P}>
            Many brands use comparisons such as a "before and after" or a "rags to riches" story that shows a transition from one state to another. This movement needs to be expressed clearly within your brand story — and it will help engage your customers and pave the way to achieve more brand engagement.
          </p>
          <p style={P}>
            By understanding the fundamental links between neurological processes that enable people to consume stories and immerse themselves in them, you are one step closer to developing a brand story that would be evergreen and memorable. Once you identify the process a person goes through when engaged in a story, you are more likely to be able to tap into what could potentially make a great story for your brand.
          </p>

        </div>
      </section>

      <HRule />

      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="09" label="Next Steps · Apply What You&apos;ve Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            { title: "Continue reading", body: "Explore the other guides — Personal Branding, Neuromarketing, and Writing Tips — to round out your full marketing toolkit.", cta: "Back to Writing", href: "/writing" },
            { title: "Get press coverage", body: "The EMOS programme applies these storytelling principles to earned media — landing you in Forbes, HBR, and your category's key publications.", cta: "Learn about EMOS", href: "/emos" },
            { title: "Work with Syed", body: "For a fractional CMO arrangement or a done-for-you earned media programme, book a discovery call.", cta: "Book a call", href: CALENDLY },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontSize: 16, lineHeight: 1.6, color: INK70 }}>{body}</p>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none" }}>
                {cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="10" />
      <Colophon />
    </div>
  );
}

import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
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
  bias?: string;
  body: string;
  takeaway: string;
}> = [
  {
    n: "01",
    title: "What is Neuromarketing?",
    body: "Neuromarketing is a field that combines neuroscience and marketing to understand how the brain responds to marketing stimuli. It studies why people make the purchasing decisions they do by examining brain activity, eye movements, and subconscious reactions. Neuromarketing allows businesses to design more effective marketing campaigns, product packaging, and user experiences by tapping into how the brain truly works — rather than relying solely on what consumers say they want.",
    takeaway: "Neuromarketing bridges the gap between what consumers say they want and what actually drives their purchasing decisions.",
  },
  {
    n: "02",
    title: "How Does Neuromarketing Work?",
    body: "Neuromarketing uses scientific tools to measure brain and physiological responses: EEG (electroencephalography) measures electrical activity in the brain to gauge reactions to stimuli; fMRI (functional magnetic resonance imaging) shows which brain regions activate in response to marketing; eye-tracking monitors where and how long consumers look at visual elements; facial coding analyses micro-expressions for emotional responses; biometric data measures heart rate, skin conductance, and breathing patterns. These tools reveal what consumers feel rather than what they think they feel.",
    takeaway: "The tools of neuromarketing measure unconscious reactions — the reactions that actually drive purchasing behaviour.",
  },
  {
    n: "03",
    title: "Real-World Example: Red Bull",
    bias: "Case study",
    body: "Red Bull used EEG-based brain mapping with surfers to understand how they processed their brand. The research revealed that the brand's 'Red Bull Gives You Wings' messaging created specific neural patterns associated with confidence and performance. This insight allowed Red Bull to refine their sponsorship strategy, focusing on extreme sports where these neural associations would be strongest. The result: Red Bull became synonymous with a lifestyle, not just a beverage.",
    takeaway: "Neuromarketing research can reveal which brand associations are neurologically strongest — and which sponsorships or campaigns reinforce them.",
  },
  {
    n: "04",
    title: "Real-World Example: Porsche & the Face Effect",
    bias: "Case study",
    body: "In a Porsche neuromarketing study, participants' brains were scanned while viewing sports cars. The frontal lobe — the same brain area activated when recognising human faces — lit up while viewing the front of a sports car. This finding helped explain why car front-end design ('face') is so emotionally powerful and why certain car designs trigger stronger emotional responses. Porsche used these insights to double down on iconic front-end design that triggers the face-recognition response.",
    takeaway: "Human brains process certain products as if they were faces. Design that triggers this response creates stronger emotional connections.",
  },
  {
    n: "05",
    title: "Real-World Example: Coke vs Pepsi",
    bias: "Case study",
    body: "In a famous blind taste test, Pepsi won — but in branded tests, Coke won. Brain scans during the branded test showed stronger activation in the prefrontal cortex (associated with brand loyalty and emotional decision-making) when participants knew they were drinking Coke. This proved that brand perception can literally override taste preference in the brain. The lesson: what you sell is often less important than the story, identity, and associations surrounding what you sell.",
    takeaway: "Brand perception overrides product quality in the brain. Building a strong brand is not optional — it changes the physical experience of the product.",
  },
  {
    n: "06",
    title: "Neuromarketing Technique: Anchoring",
    bias: "Technique #1",
    body: "Anchoring is the tendency to rely heavily on the first piece of information encountered (the 'anchor') when making decisions. When pricing, always display the higher-priced option first — it sets the mental anchor. Everything else seems more reasonable by comparison. This is why restaurants list expensive items at the top of menus, and why pricing pages lead with the enterprise tier. In negotiations, whoever states the first number sets the anchor and wins the frame.",
    takeaway: "Always set the anchor first. The first number in any pricing or negotiation becomes the mental reference point for everything that follows.",
  },
  {
    n: "07",
    title: "Neuromarketing Technique: The Power of Free",
    bias: "Technique #2",
    body: "The word 'free' triggers a uniquely powerful neurological response — far stronger than any heavily discounted offer. Behavioural economists find that 'free' eliminates the perceived risk of a transaction entirely. In marketing, this is why free trials outperform discounted trials, free shipping outperforms discounted shipping, and free lead magnets outperform cheap e-books. The brain treats 'free' as a zero-risk proposition, which removes the loss aversion that blocks most purchase decisions.",
    takeaway: "'Free' removes loss aversion entirely. A free offer activates a different, more powerful part of the brain than even a heavily discounted one.",
  },
  {
    n: "08",
    title: "Neuromarketing Technique: Fear of Loss",
    bias: "Technique #3",
    body: "Kahneman and Tversky's landmark research established that people feel the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain. This asymmetry is called loss aversion, and it is one of the most powerful forces in consumer behaviour. Marketing that emphasises what someone stands to lose by not acting outperforms equivalent marketing about gains. 'Don't miss your chance' outperforms 'Take advantage of this opportunity.' Frame your offer around what the prospect loses by waiting.",
    takeaway: "Loss-framed messaging consistently outperforms gain-framed messaging. Show buyers what they lose by not acting, not just what they gain by acting.",
  },
  {
    n: "09",
    title: "Neuromarketing Technique: Social Proof",
    bias: "Technique #4",
    body: "Social proof is the neurological tendency to look at others' behaviour when uncertain about our own. It is hardwired into us as a survival mechanism — if others are doing something, it is probably safe. For marketers: testimonials, star ratings, 'X,000 customers,' client logos, press mentions, and 'bestseller' badges all activate social proof. The most powerful social proof is specific, named, and from a source the buyer respects. Generic testimonials produce weak social proof responses.",
    takeaway: "Specific, named, and verifiable social proof activates the strongest neurological trust response. 'Featured in Forbes' outperforms 'trusted by businesses worldwide.'",
  },
  {
    n: "10",
    title: "Neuromarketing Technique: The Decoy Effect",
    bias: "Technique #5",
    body: "The decoy effect occurs when adding a third, asymmetrically dominated option changes people's preferences between the original two. Classic example: a small coffee for $3, a large for $7. Most choose small. Add a medium for $6.50, and suddenly the large looks like great value — and most switch to it. The medium is the decoy: not meant to be chosen, but meant to make the large look rational. Apple, Netflix, and Amazon Prime all use this extensively in their pricing structures.",
    takeaway: "A well-designed pricing page uses the decoy effect to guide buyers toward the option you want them to choose — without pressure.",
  },
];

export default function NeuromarketingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide II · Neuromarketing" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">The Marketer&rsquo;s Field Guide</Pill>
            <h1
              style={{
                margin: "16px 0 24px",
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
              }}
            >
              Why people{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>actually</Mark>
              </span>{" "}
              buy.
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
              Ten chapters on the cognitive biases, psychological principles, and
              neurological mechanisms that drive purchase decisions — and how to
              apply them ethically in your marketing.
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
            { label: "Length", value: "10 chapters · ~4,500 words" },
            { label: "Read time", value: "18 minutes" },
            { label: "Published", value: "Nov 2017 · Revised Jul 2021" },
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
          {CHAPTERS.map(({ n, title, bias, body, takeaway }, i) => (
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
                  flexWrap: "wrap",
                }}
              >
                <Pill size={10} ls="0.16em">Ch. {n}</Pill>
                {bias && (
                  <SCaps size={10.5} ls="0.14em" color={YEL}>{bias}</SCaps>
                )}
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
                <SCaps
                  size={10}
                  ls="0.16em"
                  color={YEL}
                  style={{ display: "block", marginBottom: 8 }}
                >
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

      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="11" label="Next Steps · Apply What You've Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          {[
            { title: "Continue reading", body: "Explore Storytelling and Writing Tips — the other two guides in this series.", cta: "Back to Writing", href: "/writing" },
            { title: "Read: Storytelling", body: "Neuromarketing explains why stories work. The storytelling guide shows you how to write them.", cta: "Storytelling guide", href: "/writing/storytelling" },
            { title: "Work with Syed", body: "Apply these principles to your earned media strategy or fractional CMO engagement.", cta: "Book a call", href: CALENDLY },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontSize: 16, lineHeight: 1.6, color: INK70 }}>{body}</p>
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

      <Subscriptions sectionNumber="12" />
      <Colophon />
    </div>
  );
}

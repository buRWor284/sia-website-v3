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
    title: "What Neuromarketing Actually Is",
    body: "Neuromarketing is the application of neuroscience and behavioural psychology to marketing decisions. It answers the question: why do people actually buy — as opposed to why they say they buy? The gap between stated and actual purchase motivation is large. Decades of research show that most purchase decisions are post-hoc rationalisations of emotional reactions made in under a second. Your job as a marketer is to trigger the right emotional reaction, then give the buyer the rational justification they need to feel good about the decision.",
    takeaway: "Lead with emotion, follow with logic. This is the sequence of every effective purchase decision.",
  },
  {
    n: "02",
    title: "Social Proof",
    bias: "Cognitive bias #1",
    body: "Humans are fundamentally social creatures who use the behaviour of others as a proxy for correctness. When we don't know what to do, we look at what other people are doing. For marketers, this means: testimonials, case studies, client logos, user counts, and press mentions are not vanity — they are conversion infrastructure. The most effective social proof is specific ('we increased revenue by 34% in 90 days'), from a named, recognisable source, and placed at the point of decision.",
    takeaway: "Specific, named, and contextualised social proof converts at 2–3x the rate of generic testimonials.",
  },
  {
    n: "03",
    title: "Scarcity & Urgency",
    bias: "Cognitive bias #2",
    body: "Loss aversion is one of the most replicated findings in behavioural economics (Kahneman & Tversky, 1979): people feel the pain of losing something twice as intensely as the pleasure of gaining an equivalent thing. Scarcity (limited availability) and urgency (limited time) both trigger loss aversion. Used honestly, they are legitimate marketing tools. Used dishonestly, they destroy trust the moment the buyer realises the countdown timer resets. Honest scarcity: two fractional CMO slots open. Dishonest scarcity: 'only 3 left!' on a digital product.",
    takeaway: "Scarcity and urgency must be real. False scarcity is a short-term conversion tactic that destroys long-term trust.",
  },
  {
    n: "04",
    title: "Anchoring",
    bias: "Cognitive bias #3",
    body: "The first number a buyer sees becomes their reference point — their anchor — for all subsequent evaluations. Present a $5,000/month option before the $2,000/month option, and $2,000 feels reasonable. Present the $2,000 option first, and it feels expensive. Pricing pages should always lead with the highest tier. Proposals should always include a premium option that makes the target option look like good value. The anchor sets the frame; the sale happens inside the frame.",
    takeaway: "Lead with your most expensive option. It resets the buyer's internal price reference and makes your target price feel rational.",
  },
  {
    n: "05",
    title: "The Mere Exposure Effect",
    bias: "Cognitive bias #4",
    body: "People develop preferences for things simply because they have seen them before. Repeated exposure increases familiarity, and familiarity is processed by the brain as safety. This is the neurological foundation of content marketing. Every article you publish, every LinkedIn post you write, every podcast you appear on increases your mere exposure score with your target audience. The consultant who appears in your feed consistently is not more skilled — they are more familiar. Familiarity converts.",
    takeaway: "Consistency of presence compounds. Show up in the same spaces, for the same audience, with the same positioning — for years.",
  },
  {
    n: "06",
    title: "The IKEA Effect",
    bias: "Cognitive bias #5",
    body: "People place disproportionately high value on things they have invested effort in creating. The more a buyer participates in designing, configuring, or building their solution, the more they value it and the less likely they are to churn. For service businesses, this means: involve clients in the diagnostic process, let them name their goals, have them participate in strategy sessions. Clients who feel ownership of the strategy are better clients — they implement, they renew, and they refer.",
    takeaway: "Co-creation reduces churn. Build client involvement into your onboarding and strategy process.",
  },
  {
    n: "07",
    title: "Framing",
    bias: "Cognitive bias #6",
    body: "The same information presented in different frames produces different decisions. '20% failure rate' and '80% success rate' are identical facts that produce different emotional responses. 'This approach reduces your risk of public embarrassment' hits differently than 'This approach improves your brand perception.' Marketing is not about information transfer — it is about frame construction. Every piece of copy you write is a frame. Write it deliberately.",
    takeaway: "Every claim you make has a frame. Audit your copy for the frames you are accidentally setting.",
  },
  {
    n: "08",
    title: "Cognitive Load & Simplicity",
    bias: "Cognitive bias #7",
    body: "The brain has limited working memory. Complex, difficult-to-process information is associated with negative feelings — even when the content is identical to simpler versions. This is why clear writing converts better than dense writing, simple proposals close faster than comprehensive ones, and websites with fewer choices generate more leads than websites with more choices. Reduce cognitive load at every touchpoint. If the buyer has to work to understand your value proposition, they will leave.",
    takeaway: "Every word that makes the buyer think is a word that makes them hesitate. Edit for clarity, not completeness.",
  },
  {
    n: "09",
    title: "Storytelling & the Narrative Brain",
    bias: "Why stories bypass rational resistance",
    body: "When humans hear a story, their brains synchronise with the narrator's brain in a process called neural coupling (Hasson, 2010). Data is processed in the language areas; stories are processed across the entire brain — including the motor cortex, sensory cortex, and limbic system. This is why a well-told case study converts at 10x the rate of a statistical summary. The buyer doesn't read the story — they live it. Identify your buyer's hero journey and make them the protagonist of your case study.",
    takeaway: "Turn every case study into a three-act story. Problem → struggle → transformation. The buyer should see themselves as the hero.",
  },
  {
    n: "10",
    title: "Trust Signals & the Credibility Hierarchy",
    bias: "How buyers evaluate trustworthiness",
    body: "Trust signals exist in a hierarchy. At the bottom: self-claimed credentials ('I am an expert'). In the middle: third-party validation (client testimonials, press mentions). At the top: institutional endorsement (Forbes, Harvard Business Review, industry bodies). Most service businesses operate entirely at the bottom of the hierarchy and wonder why their conversion rate is low. Press mentions, speaking appearances, and case study results are not nice-to-haves — they are the trust infrastructure that makes everything else work.",
    takeaway: "Move up the trust hierarchy deliberately. Third-party validation converts at higher rates and shorter sales cycles than self-promotion.",
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
            { label: "Length", value: "10 chapters · 7,200 words" },
            { label: "Read time", value: "19 minutes" },
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

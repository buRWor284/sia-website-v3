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
  body: string;
  takeaway: string;
}> = [
  {
    n: "01",
    title: "Why Storytelling Works (The Neurological Basis)",
    body: "Stories work because of how the human brain is wired. When you listen to a presentation with facts and bullet points, certain language-processing parts of the brain activate. But when you hear a story with narrative, action, and emotion, the entire brain lights up — including the motor cortex and sensory areas. Stories trigger the release of oxytocin, a neurochemical that promotes empathy and connection. This is why a compelling brand story is not just nice to have — it is neurologically more persuasive than any list of features.",
    takeaway: "Facts inform. Stories transform. The brain is wired to respond to narrative — not data.",
  },
  {
    n: "02",
    title: "Elements of a Compelling Brand Story",
    body: "Every compelling brand story has five elements: a relatable protagonist (a person the audience identifies with), a goal or desire (what the protagonist wants), an obstacle (what stands in the way), a turning point (the moment everything changes), and a resolution (where the protagonist ends up). Without all five elements, you don't have a story — you have a summary. Most brands make the mistake of skipping straight to the resolution ('we help businesses grow') and wondering why nobody remembers them.",
    takeaway: "Check your brand story for all five elements. Missing even one makes the narrative collapse.",
  },
  {
    n: "03",
    title: "The Hero's Journey Applied to Brand Narrative",
    body: "Joseph Campbell's Hero's Journey — the monomyth — maps remarkably well onto brand storytelling. The key insight: your customer is the hero, not your brand. Your brand is the guide — Gandalf to their Frodo, Yoda to their Luke. When brands make themselves the hero ('we are the leading provider of...'), readers disengage. When brands make the customer the hero and position themselves as the guide that unlocks the hero's potential, they create stories that resonate deeply. Apple, Nike, and Airbnb all use this structure.",
    takeaway: "Your brand is the mentor. Your customer is the hero. This single reframe changes how every piece of content you create is written.",
  },
  {
    n: "04",
    title: "How to Identify Your Brand's Story",
    body: "Finding your brand's story starts with three questions: Why did you start? (The origin — what frustrated you, what you saw that others missed, what you decided to change.) Who do you serve, and what transformation do you create for them? (The mission — specific, concrete, human.) What do you believe about your industry that most people in it don't? (The conviction — your differentiating worldview.) The intersection of these three answers is the core of your brand's story. It should be specific enough to exclude some people. Vague stories serve nobody.",
    takeaway: "Your brand story lives at the intersection of your origin, your mission, and your conviction. Find the specific details that make each one real.",
  },
  {
    n: "05",
    title: "Examples from Successful Brands",
    body: "Dove's 'Real Beauty' campaign told the story of the gap between how women see themselves and how others see them — and positioned Dove as the brand that understood this truth. Airbnb's brand story is about belonging — not booking a room but feeling at home anywhere in the world. TOMS shoes built its entire brand on a one-for-one giving story. In each case, the brand's story is not about the product — it is about the meaning the product creates. Irfan's own brand story — from Peshawar to Forbes, building a global agency while sharing everything he learned — follows the same pattern.",
    takeaway: "Study the brand stories of companies you admire. In every case, the story is about meaning and transformation, not product features.",
  },
  {
    n: "06",
    title: "Weaving Storytelling into Content",
    body: "Content that gets shared is almost always story-driven. A data study becomes a story when you explain who discovered the data, what surprised them, and what it means for the reader. A how-to guide becomes a story when you open with the mistake that made the guide necessary. A product announcement becomes a story when it begins with the customer problem that inspired it. The technique is simple: before any piece of content, ask 'What is the conflict here?' Find the conflict, and you have found the story.",
    takeaway: "Every piece of content has a conflict buried in it. Find the conflict, and you have found the story that makes the content worth reading.",
  },
  {
    n: "07",
    title: "Storytelling in Pitch Decks",
    body: "The best pitch decks follow a narrative arc, not a data dump. Slide 1: the world as it is (the problem, vivid and specific). Slide 2: why now (what changed in the world that makes this the right moment). Slide 3: the protagonist (who you are and why you are the right person to solve this). Slide 4: the solution (the turning point — what you have built). Slides 5–8: the proof (traction, case studies, market size). Slide 9: the ask (what you need to write the next chapter). Each slide should answer the question the previous slide raised.",
    takeaway: "A pitch deck is a story with each slide being a chapter. Every slide should raise a question; the next slide should answer it.",
  },
  {
    n: "08",
    title: "Storytelling for Presentations & Keynotes",
    body: "The most memorable presentations open with a story, not a slide of agenda bullets. Nancy Duarte's research on great presentations found they all follow the same structure: move between 'what is' (the present reality) and 'what could be' (the possible future) throughout the talk, and close with the call to action that bridges the gap. Irfan opens his keynotes with a personal story that connects to the audience's experience — speaking in Bali, Dubai, and Peshawar — before transitioning to the framework or insight he is there to share.",
    takeaway: "Open with a two-minute story, not an agenda. The story earns the audience's attention for everything that follows.",
  },
  {
    n: "09",
    title: "Practical Storytelling Frameworks",
    body: "Three frameworks worth practising: (1) The ABT (And, But, Therefore) — 'Things were like this AND like this, BUT then this happened, THEREFORE this changed.' It is the most portable story structure in existence. (2) The SCQA (Situation, Complication, Question, Answer) — used by McKinsey for decades in client communications. (3) The Before/After/Bridge — 'Here is your world before. Here is your world after. Here is the bridge.' For social media, ABT. For presentations, SCQA. For landing pages, Before/After/Bridge.",
    takeaway: "Learn ABT first — it works everywhere. Once it becomes habit, you will notice every great piece of content uses it instinctively.",
  },
];

export default function StorytellingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide III · Storytelling" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">For Business &amp; Brand</Pill>
            <h1
              style={{
                margin: "16px 0 24px",
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
              }}
            >
              The story is{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>the strategy.</Mark>
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
              Nine chapters on the neurological basis of storytelling, practical
              structures for case studies and keynotes, and the craft of writing
              narratives that move people — and move product.
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
            { label: "Length", value: "9 chapters · ~6,500 words" },
            { label: "Read time", value: "17 minutes" },
            { label: "Published", value: "Apr 2020 · Revised Jul 2021" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
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
                borderBottom: i < CHAPTERS.length - 1 ? `1px solid ${INK15}` : undefined,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginBottom: 16 }}>
                <Pill size={10} ls="0.16em">Ch. {n}</Pill>
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
              <p style={{ margin: "0 0 24px", fontSize: 18.5, lineHeight: 1.7, color: INK70 }}>
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

      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="10" label="Next Steps · Apply What You've Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          {[
            { title: "Continue reading", body: "The Writing Tips guide covers the craft mechanics that make your stories clear and compelling.", cta: "Writing Tips guide", href: "/writing/writing-tips" },
            { title: "Read: Neuromarketing", body: "Understand the cognitive science behind why the story structures in this guide work.", cta: "Neuromarketing guide", href: "/writing/neuromarketing" },
            { title: "Work with Syed", body: "EMOS and fractional CMO engagements apply these storytelling principles to earned media and brand narrative.", cta: "Book a call", href: CALENDLY },
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

      <Subscriptions sectionNumber="11" />
      <Colophon />
    </div>
  );
}

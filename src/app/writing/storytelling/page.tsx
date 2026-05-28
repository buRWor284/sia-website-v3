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
    title: "Why the Brain Runs on Stories",
    body: "Stories are not decoration. They are the brain's default mode of processing and storing information. Neuroscientist Uri Hasson demonstrated that when someone listens to a story, their brain activity synchronises with the storyteller's — a phenomenon called neural coupling. Data triggers two language-processing areas. Stories trigger the motor cortex, sensory cortex, frontal cortex, and limbic system simultaneously. A good story doesn't just inform — it is experienced. This is why a single case study converts more reliably than a page of statistics.",
    takeaway: "Facts are processed. Stories are experienced. Always choose the story.",
  },
  {
    n: "02",
    title: "The Three-Act Structure for Business Narratives",
    body: "Act I: Establish the world before — who the protagonist is, what they want, and what stands in their way. Act II: Introduce the conflict — the obstacle, the failed attempts, the moment of maximum difficulty. Act III: The transformation — what changed, what the protagonist achieved, and what the world looks like now. Every compelling case study, keynote, pitch, and brand origin story follows this structure. The mistake most businesses make is to start with Act III: 'We increased revenue by 40%.' Start with Act I: 'Three years ago, they were losing clients they couldn't afford to lose.'",
    takeaway: "Start with the world before. Never lead with the result — lead with the problem.",
  },
  {
    n: "03",
    title: "The Hero's Journey for Brand Narratives",
    body: "Joseph Campbell's monomyth — the hero's journey — maps onto brand narratives with remarkable precision. Your client is the hero. Their problem is the call to adventure. Their failed attempts are the trials. Your service is the mentor, not the hero. This is the most common mistake in brand storytelling: the brand casts itself as the hero, when the buyer needs to see themselves as the hero. Apple's advertising never says 'Apple is amazing.' It says 'Look what you can do with Apple.' The brand is Gandalf. The customer is Frodo.",
    takeaway: "Your brand is the mentor. Your client is the hero. Make this shift in every piece of content you produce.",
  },
  {
    n: "04",
    title: "Writing Your Origin Story",
    body: "Every founder, every consultant, every personal brand needs an origin story — a narrative that explains why you do what you do in a way that makes the reader feel it, not just understand it. The origin story formula: the moment of frustration or realisation that started everything + what you tried that didn't work + what you discovered + why you turned it into your work. The best origin stories are honest, specific, and slightly uncomfortable to tell. That discomfort is where the authenticity lives.",
    takeaway: "Write the origin story you are slightly afraid to tell. That's the one people will remember.",
  },
  {
    n: "05",
    title: "Case Studies That Convert",
    body: "Most case studies are dead on arrival: they lead with results, skip the struggle, and read like a press release. A case study that converts has five elements. First, a specific protagonist (not 'a mid-market SaaS company' but 'the CEO of a 40-person logistics software firm'). Second, a vivid before-state that the reader recognises. Third, a real obstacle — the thing that almost stopped them. Fourth, a specific turning point — what changed and why. Fifth, the after-state with concrete results. The results are a chapter ending, not a chapter one.",
    takeaway: "The struggle is the story. The results are the punchline. Most case studies have only the punchline.",
  },
  {
    n: "06",
    title: "The Keynote Structure",
    body: "A keynote is a story about a journey from a problem to an insight. The structure that works: open with a provocation (a counter-intuitive claim, a striking statistic, or a two-sentence story). Establish the problem in full — make the audience feel the pain of not solving it. Introduce your framework or insight. Walk through the proof (three examples or case studies, each more compelling than the last). Close with a call to action that is a next step, not a purchase request. The opening and closing are the only parts the audience will remember two weeks later. Write them last.",
    takeaway: "Write your opening and closing last. They are load-bearing. The middle exists to make them credible.",
  },
  {
    n: "07",
    title: "Story Structures for LinkedIn",
    body: "LinkedIn's algorithm rewards posts that generate dwell time — the duration someone spends reading. Stories generate dwell time because the brain cannot resist a narrative in progress. The most effective LinkedIn story format: one-sentence hook (a statement that creates tension), five sentences of narrative (the before, the turn, the revelation), one-sentence moral or takeaway, and a soft prompt to engage. The hook must do two things: stop the scroll and promise a payoff. 'I lost my biggest client and it was the best thing that happened to my business.' That is a hook.",
    takeaway: "Every LinkedIn post should have a hook, a story arc, and a takeaway. The hook is the only part that competes for attention.",
  },
  {
    n: "08",
    title: "Data Storytelling",
    body: "Numbers without context are noise. Numbers inside a story are evidence. The three-step data storytelling framework: first, state the finding simply. Second, give it a frame — what does this number mean in human terms? Third, tell the story that explains why the number is what it is. '73% of B2B buyers complete their research before speaking to a sales rep' becomes: 'By the time a prospect calls you, they have already decided. They are calling to confirm what they have concluded. Your job is not to educate — it is to validate.' Same data. Completely different impact.",
    takeaway: "Every statistic needs a story. The story is what makes the number mean something.",
  },
  {
    n: "09",
    title: "Stories for the Sales Process",
    body: "The sales process is a story process. Every successful sales conversation follows a narrative arc: establish rapport through shared context (Act I), diagnose the problem with specific questions (Act II rising action), introduce your solution as the turning point (Act II climax), and close with a vision of the after-state (Act III). The most powerful selling technique is not a closing script — it is a well-told story of a client who was exactly where the prospect is now, and where they are today. That story should be specific, recent, and honest about what the process involved.",
    takeaway: "Keep three 'before and after' client stories in your head. Use them in every sales conversation at the diagnosis stage.",
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
            { label: "Length", value: "9 chapters · 6,800 words" },
            { label: "Read time", value: "17 minutes" },
            { label: "Updated", value: "May 2026" },
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

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
    title: "Part 1 · Writing Quality Content (Tips 1–20)",
    body: "Write crap — having the courage to write badly makes starting easier (the first draft is supposed to be bad). Writers write — call yourself a writer, then write daily until it is true. Build discipline by setting a daily writing quota. Read voraciously: Stephen King says, 'If you don't have time to read, you don't have the time or the tools to write.' Read what you want to write — imitation precedes voice. Don't edit while you write: as Hemingway said, 'Write drunk; edit sober.' Admit the first draft is rough — the shame is in not revising. Talk to 'you', not 'everyone' — the reader is one person at a time.",
    takeaway: "Writers write. Call yourself one, then write daily until it is true. The first draft is supposed to be bad — its only job is to exist.",
  },
  {
    n: "02",
    title: "Part 1 · Writing Quality Content (Tips 21–40)",
    body: "Avoid 'I' — readers want to know 'what's in it for me?' Write as you talk (Seth Godin's approach). Read your words aloud for a readability check — the ear catches what the eye misses. Add subheadings, bullet points, and bold text to help readers scan. Use the inverted pyramid — lead with the most important information. Write a strong opening that hooks the reader within three sentences. Vary sentence length deliberately: short for emphasis, long for complexity. Use specific details — vague writing is forgettable, specific writing is memorable. Avoid clichés. Say what you mean directly.",
    takeaway: "Read your work aloud. If you stumble, the reader will stumble. If you get bored, the reader left three paragraphs ago.",
  },
  {
    n: "03",
    title: "Part 1 · Writing Quality Content (Tips 41–85)",
    body: "Have a blog and start writing before you have a topic — the habit creates the material. Learn copywriting (the science of persuasion in writing). Use BuzzSumo to find topics that are already popular, then approach them from a fresh angle. Research your topic more deeply than you think you need to — the quality of your research determines the ceiling of your writing. Study great writers — Hemingway for brevity, Orwell for clarity, King for momentum. Write the headline last (or write ten headlines and pick the best). Use subheadings every 300–400 words for long-form content. A strong closing is as important as a strong opening.",
    takeaway: "The headline and the first sentence are the two most important things you will write. The rest exists to justify them.",
  },
  {
    n: "04",
    title: "Part 2 · On Environment (Tips 86–92)",
    body: "Your writing environment dramatically affects output quality and quantity. Write at the same time each day — consistency trains the brain to enter a writing state. Eliminate distractions during writing sessions: phone on silent, notifications off, browser tabs closed. Use tools like Freedom or ColdTurkey to block distracting sites. FocusWriter creates a distraction-free full-screen environment. A dedicated writing space — even a corner of a room — signals to the brain that it is time to write. Music helps some writers, silence helps others — experiment and commit to what works.",
    takeaway: "Set a writing time and protect it. The environment shapes the output. A distraction-free hour is worth three interrupted ones.",
  },
  {
    n: "05",
    title: "Part 3 · On Grammar (Tips 93–96)",
    body: "Good grammar is invisible — bad grammar is all the reader notices. The essentials: use active voice (passive voice hides agency and adds cognitive load). Avoid run-on sentences — a sentence that requires re-reading has failed. Keep subject and verb close together. Do not start sentences with 'There is' or 'There are' — they pad without adding meaning. Learn when a comma is needed and when it is not. The Oxford comma prevents genuine ambiguity — use it. When in doubt, use shorter sentences. Simplicity is not stupidity; complexity is not intelligence.",
    takeaway: "Good grammar is the absence of friction. If the reader notices your grammar, something went wrong.",
  },
  {
    n: "06",
    title: "Part 4 · Tools (Tips 97–100)",
    body: "Grammarly catches grammar, style, and tone issues — use the premium version for more detailed suggestions. The Hemingway Editor identifies passive voice, overly complex sentences, and excessive adverbs — aim for Grade 6–8 readability for blog content. CoSchedule's Headline Analyzer scores and helps optimise headlines — aim for 70+. Coach.me tracks writing streaks and habit consistency. Draft enables version-controlled collaborative writing. For deep work sessions, Freedom blocks distracting apps and websites across all devices. Stack two or three of these tools — they compound.",
    takeaway: "Tools do not replace the writing habit — they support it. Use Grammarly and Hemingway Editor as a minimum. Use Headline Analyzer for every post title.",
  },
];

export default function WritingTipsGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide IV · Writing Tips" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <Pill size={10.5} ls="0.18em">Craft &amp; Clarity</Pill>
            <h1
              style={{
                margin: "16px 0 24px",
                fontWeight: 700,
                fontSize: 80,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
              }}
            >
              Write{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>clearly.</Mark>
              </span>
              <br />
              Write well.
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
              Six chapters covering 100+ writing tips on quality content, environment, grammar, and tools — from
              research and headlines to editing and the writing habit. For content
              marketers, consultants, and anyone who communicates for a living.
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
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: INK70 }}>{title}</div>
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
            { label: "Length", value: "100+ tips · 4 categories" },
            { label: "Read time", value: "22 minutes" },
            { label: "Published", value: "Feb 2016 · Revised Aug 2022" },
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
        <SectionMast n="12" label="Next Steps · Apply What You've Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          {[
            { title: "All four guides", body: "Return to the Writing hub for Personal Branding, Neuromarketing, and Storytelling.", cta: "Writing hub", href: "/writing" },
            { title: "29 long-form articles", body: "Read the full archive of long-form articles covering earned media, SEO, personal branding, and more.", cta: "All articles", href: "/blog" },
            { title: "Work with Syed", body: "Need content strategy or earned media expertise applied to your business? Start with a discovery call.", cta: "Book a call", href: CALENDLY },
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

      <Subscriptions sectionNumber="13" />
      <Colophon />
    </div>
  );
}

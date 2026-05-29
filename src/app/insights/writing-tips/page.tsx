import { Colophon, Mast, Subscriptions } from "@/components/bureau";
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

const CATEGORIES = [
  { n: "01", id: "quality", title: "Writing Quality Content" },
  { n: "02", id: "prolific", title: "Being a Prolific Writer" },
  { n: "03", id: "environment", title: "On Environment" },
  { n: "04", id: "grammar", title: "On Grammar" },
  { n: "05", id: "tools", title: "A Few Tools" },
];

const P: React.CSSProperties = { margin: "0 0 20px", fontSize: 18, lineHeight: 1.75, color: INK70 };
const H2: React.CSSProperties = { margin: "48px 0 20px", fontWeight: 700, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, fontFamily: SERIF };
const BLOCKQUOTE: React.CSSProperties = { margin: "28px 0", padding: "20px 24px", borderLeft: `4px solid ${YEL}`, background: PAPER2 };

const TIP_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gap: 16,
  padding: "16px 0",
  borderBottom: `1px solid ${INK15}`,
  alignItems: "start",
};

const TIP_NUM: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: 13,
  color: YEL,
  letterSpacing: "0.04em",
  paddingTop: 2,
};

const TIP_TEXT: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 17,
  lineHeight: 1.65,
  color: INK70,
};

type Tip = { n: string; text: string };

const QUALITY_TIPS: Tip[] = [
  { n: "01", text: "Write \"crap\" — the courage to write badly or naively makes writing easier and tricks the brain into thinking you're making progress. So go ahead, write badly. This bad stuff will improve exponentially." },
  { n: "02", text: "Writers write — if you want to be a serious writer, the first step is that you call yourself a writer from day one, and write regularly, even if it is free writing done on a napkin while standing in a queue." },
  { n: "03", text: "Build discipline — set a daily writing quota. The blank page is a nightmare. That's where discipline comes in. Practical approach: sit back to write for 50 minutes today, then gradually increase the time." },
  { n: "04", text: "Read voraciously — Stephen King said it well: \"If you don't have time to read, you don't have the time — or the tools — to write. Simple as that.\" Read everything — from crap to hardly-understood stuff." },
  { n: "05", text: "Stay consistent — use an app like Coach.me to build the habit of writing. This habit will make sure you stay consistent with practicing your craft." },
  { n: "06", text: "Practice — though this tip is a cliché, it is still indispensable. Practice." },
  { n: "07", text: "Do keyword research — keyword research done correctly lets you dive into the minds of your audience. It teaches you the language your audience uses." },
  { n: "08", text: "You're responsible — how many professional writers have you heard say, \"My mom used to wake me up at 4 to write\"? None. Writing is your responsibility." },
  { n: "09", text: "Don't use jargon — it is silly to use complicated words the general population won't understand. A good writer is not silly enough to do that." },
  { n: "10", text: "Admit that the first draft is shit — \"The first draft of anything is shit,\" said Hemingway. You cannot expect your first draft to be even close to \"good enough,\" but it's better than no draft at all." },
  { n: "11", text: "Edit mercilessly — the more fluff, the blurry the value. The goal should not be pushing word count, but being concise." },
  { n: "12", text: "Don't edit while writing — \"Write drunk; edit sober,\" said Hemingway. He meant: while writing, just write whatever comes to mind. When finished, then edit." },
  { n: "13", text: "Formatting comes later — while getting words out of your head, don't work on the formatting. Doing so harms your natural creative flow, productivity, and zeal. Perfection comes later." },
  { n: "14", text: "Don't use bad language — substitute \"damn\" with \"very.\" There's no need to be overly transparent." },
  { n: "15", text: "Don't over-rely on tools — tools can be VERY useful, but they're nothing compared to your will to improve. If you've got what it takes, you could be the greatest of writers by writing on Notepad." },
  { n: "16", text: "Ask for feedback — wrote something? No matter how awful, send it to someone and ask for feedback." },
  { n: "17", text: "Write when you don't want to — being a regular writer is not always shiny. It can also be about forcing oneself to work." },
  { n: "18", text: "Use analogies — make use of analogies in your writing. They make your point of view more readable and are entertaining simultaneously." },
  { n: "19", text: "Use quotations — back up your points by embedding quotations from public figures and celebrities." },
  { n: "20", text: "Divide your piece into lots of paragraphs — don't scare readers by presenting the greatest food with no decoration. Split your article into more than a couple of paragraphs." },
  { n: "21", text: "Add a conclusion — chances are 2 out of 10 people who open your post will read from top to bottom. Make it easy for readers and summarize your article at the end with a Conclusion." },
  { n: "22", text: "Utilize TL;DR — \"Too long; didn't read.\" If you tend to write longer posts, add a TL;DR at the start or end and be REALLY concise with this." },
  { n: "23", text: "Proofread — proofreading is an indispensable part of any quality piece. Always proofread twice or thrice before declaring it error-free." },
  { n: "24", text: "Talk to \"you\" — while writing, you're addressing humans. While referring to readers, use \"you\" instead of generic terms like \"the reader\" or \"the audience.\"" },
  { n: "25", text: "Avoid \"I\" — readers don't care. They want an answer to \"What's in it for me?\" Use \"I\", but minimize its use." },
  { n: "26", text: "Get specific — people don't want to know how to wake up early. Instead, they want to know how to wake up at 6 AM. Give them specific, actionable information." },
  { n: "27", text: "Don't stop when you're done — good writers don't stop when their article or daily writing quota is done; they go beyond it." },
  { n: "28", text: "Write as you talk — think if you can stop talking. If you can't, then write the talk. Seth Godin does it." },
  { n: "29", text: "Have a mission statement — such a statement should reflect your values, beliefs, and goals as a writer. Some call it a personal mantra." },
  { n: "30", text: "Read your words aloud — how do you know if it's readable? Read your words aloud to yourself. It works." },
  { n: "31", text: "Subscribe to writing-focused blogs — Copyblogger, Goins Writer, Write to Done, Positive Writer. They do magic." },
  { n: "32", text: "Start with attention-grabbing sentences — your headline should get people to read the first paragraph, and the first paragraph's job is to get the reader to read the next. A writer with knowledge about human psychology has an advantage." },
  { n: "33", text: "Be transparent — transparency gives you lots to talk about, but sometimes this stuff can be too private. Be transparent with your beliefs but make sure you draw a line somewhere." },
  { n: "34", text: "Never take critics seriously — critics are like barking dogs, 90% of the time. Sure criticism helps you improve, but it's rare that criticism is truly helpful." },
  { n: "35", text: "Do the research — unless you're an expert in your niche, you'll have to do appropriate research. Many times it's not that you're not motivated to write, it's that you don't know enough about the topic." },
  { n: "36", text: "Add \"writer\" to your signature — unlike engineers who must graduate to add \"Eng.\" to their signature, you can add \"writer\" to yours right now." },
  { n: "37", text: "Write for readers, not bots — many bloggers SEO-optimize content but forget about their real audience — humans." },
  { n: "38", text: "Approach writing as \"an activity you love\" — mindset matters. Approach writing articles, ebooks, etc. not as something you \"have to do\" but as something you \"love to do.\" It makes a huge difference." },
  { n: "39", text: "Don't write to get published — while you're beginning, don't write to get published. Writing should be fun, not a quid pro quo game. Wait for publication to happen naturally." },
  { n: "40", text: "Have a blog — a blog about your journey to be a writer? About your favorite hobby? Random scribblings? Pick any topic and evolve on the go. A blog is an ideal place to practice public writing." },
  { n: "41", text: "The topic doesn't matter at first — a common misconception is that one should have a topic to be able to write. That's a lie. You don't need a topic; you need to get started." },
  { n: "42", text: "Expect less — \"The happiest authors are the ones that don't expect much,\" said Seth Godin. This is a journey that takes off only when you give more than you get." },
  { n: "43", text: "Learn copywriting — copywriting is the art of persuading the reader, subconsciously, to read the next sentence. And the next. It's about learning how the human brain works." },
  { n: "44", text: "Use bullet points — they convey the main points, help readability, and Google likes them. Who doesn't like to-the-point stuff?" },
  { n: "45", text: "Add subheadings — nobody likes to read something without knowing its clear point. Subheadings convey that point." },
  { n: "46", text: "Be courageous — a lot of wanna-be-writers don't become writers because they lack the courage to share their work publicly. Don't end up there." },
  { n: "47", text: "Be interested — \"If the author doesn't like people, people won't like his or her stories,\" said a leading editor. Take a genuine interest in your audience." },
  { n: "48", text: "Know headlines — 8 out of 10 people will read your headlines, but only 2 out of 10 will read the rest of the article. Magnetic headlines get more clicks." },
  { n: "49", text: "Keep your promises — magnetic headlines are magical. But if you promise sweet candies in headlines but deliver chewing gum, nobody will trust you again." },
  { n: "50", text: "Be resourceful — there are scores of people who know your topic more than you do. Link to relevant work often. Being selfish doesn't help." },
];

const QUALITY_TIPS_2: Tip[] = [
  { n: "51", text: "Be simple — don't use long, hard, lesser-known words when equivalent short words exist. Einstein said: \"Any fool can make things bigger, more complex, and more violent. It takes a touch of genius — and a lot of courage — to move in the opposite direction.\"" },
  { n: "52", text: "Write enthusiastically — every one of us is enthusiastic about something. To find that topic, ask: \"What is something that I talk incessantly about?\"" },
  { n: "53", text: "Know your reader — \"What's in it for me?\" is a question every reader asks. Answer this question well and you'll find readers coming in by themselves." },
  { n: "54", text: "Analyze — use BuzzSumo to analyze which posts from your targeted industry performed well. Analyze their formatting, number of comments, shares, post length, etc. Use it before you start writing to find in-demand ideas." },
  { n: "55", text: "Give away for free — your best stuff is something you're afraid to share for free. Do it anyway, give your best content away for free." },
  { n: "56", text: "Bold, italicize, underline — once you've written your post, bold, italicize, and underline where appropriate. They help readability." },
  { n: "57", text: "Insert images — a blog post without images is like a bird without feathers. Images are the soul of a post. They captivate attention and help retain it." },
  { n: "58", text: "Give examples — if you're teaching something or demonstrating benefits of a product, give examples." },
  { n: "59", text: "Use case studies — case studies go the extra mile by providing practical insights into how a particular methodology works in real life. They ignite authority." },
  { n: "60", text: "Personalize your writing — add a personal touch. Don't just write it, make sure it has something about you, mirroring you." },
  { n: "61", text: "Edit after publication — a published piece is not necessarily finished. It's often the case that our perspective differs from what we've written. Keep your posts up to date." },
  { n: "62", text: "Add a call to action — at the end of posts, ask your readers for something. Tell them exactly what to do next. This springs engagement on your blog." },
  { n: "63", text: "Optimize content for SEO — it pays to make small tweaks to your content for SEO purposes." },
  { n: "64", text: "Have a checklist — before you hit Publish, make sure you follow important points from a checklist: add an image, add bullet points, add a call to action, etc." },
  { n: "65", text: "Take part in writing contests — there are always writing contests taking place. Participate in them. Fellow-writing is a great way to improve." },
  { n: "66", text: "Have a dedicated writing space — wherever you're sitting right now, is that the same spot where you've been writing? If not, it's time you get a permanent place." },
  { n: "67", text: "Find your perfect writing time — find the time during the day when you're naturally in the zone: fewest distractions, freshest mind. For some it's early morning after coffee. For others it's late nights when the kids are asleep." },
  { n: "68", text: "Say \"no\" to non-essentials — to stay productive, learn to say \"no\" to Facebook, Twitter, or even Quora while writing." },
  { n: "69", text: "Kill excuses — your lizard brain wants to stay the same and is a PhD holder in excuse-making. If these excuses are not killed instantly, you cannot be anything." },
  { n: "70", text: "Outline posts — making a clear outline of your post before writing helps in preparation and is a major part of being productive." },
  { n: "71", text: "Come back later — first draft done? It needs redrafting, more ideation, and a couple of edits. Take a break and come back with fresh eyes." },
  { n: "72", text: "Use an editorial calendar — plan ahead of schedule. Knowing when to write what means ideas start flowing in. If you're a WordPress user, the Editorial Calendar plugin will help." },
  { n: "73", text: "Start writing early — it is more important to have time than to believe deceptively you have time. Writing early in the day will help you." },
  { n: "74", text: "Reward yourself — give yourself a cookie upon finishing a 30-minute writing session. You're psychologically tricking your brain into thinking writing is rewarding." },
  { n: "75", text: "Write lists — lists are easy to digest, mostly evergreen, and easy to create. Roughly 90% of list posts don't have what makes a list hit — the field is yours to win." },
  { n: "76", text: "Be concise — don't beat about the bush. Cut to the chase." },
  { n: "77", text: "Build a mini-habit — doing something \"stupid small\" habitually is known as a mini habit. Such a habit is very easy to stick to and harder not to do than to do." },
  { n: "78", text: "Learn keyboard shortcuts — a lot of time goes into spreading your hand to the mouse. If you take time to learn shortcut keys, you can save hours." },
  { n: "79", text: "Don't wait for inspiration — inspiration sucks. Why not just write instead of waiting for some miracle to happen and inspire you, which is very, very unlikely?" },
  { n: "80", text: "Keep a journal — jot down every idea you come across. Months from now it will serve as a gold mine for writing ideas, and you'll never know what a writer's block is." },
  { n: "81", text: "Take breaks — breaks make one productive, studies show. The Pomodoro technique is a great break-involving productivity method." },
  { n: "82", text: "Have daily rituals — these should include activities like writing for an hour every morning, reading for an hour, learning five new words, etc." },
  { n: "83", text: "Focus — turn off all gadgets, close social media, tell your family not to disturb you unless the house is on fire. If you feel the urge to Google a word, jot it down for later and keep writing." },
  { n: "84", text: "Test, test, optimize — being a prolific writer requires a workflow: a system that ensures progress and avoids burnout simultaneously. Requires lots of testing and tweaking." },
  { n: "85", text: "Use the Pomodoro technique — one Pomodoro = 25 minutes of focused work followed by a 5-minute break. It's one of the most proven productivity techniques in the world." },
];

const ENV_TIPS: Tip[] = [
  { n: "86", text: "Kill notifications — disable notifications from Gmail, Facebook, Twitter, etc. so you can concentrate on writing. Keep your mobile silent." },
  { n: "87", text: "Clear your desk — ask yourself: \"Do I really need that pile of papers, calendar, printer, etc. on the desk?\" If the answer is no or rarely, take it off." },
  { n: "88", text: "Turn off the light — if you're writing too early in the morning, turning off the light will maximize your focus on the screen." },
  { n: "89", text: "Disconnect — go offline. The Internet is amazing, but it can also be destructive if used unrestricted. Gretchen Rubin said it best: \"Technology is a good servant but a bad master.\"" },
  { n: "90", text: "Join or build a writing community — it takes perseverance to be a regular writer. You are very likely to get discouraged if you're surrounded by non-writers. Join or build a community of writers and increase your odds." },
  { n: "91", text: "Don't care about others — just do your thing. Pour your energy into stuff that you care about. It is part of your mental environment." },
  { n: "92", text: "Kill mental distractions — thousands of thoughts cross our minds daily. Open Notepad and start pouring every thought into it. You just killed mental distractions." },
];

const GRAMMAR_TIPS: Tip[] = [
  { n: "93", text: "Read the Guide to Grammar and Writing — grammarbook.com is a website dedicated to teaching the principles of English grammar and writing." },
  { n: "94", text: "Use Grammarly — a web application that helps \"perfect\" grammar. Install it in Chrome; wherever you write, your words are being checked for misspellings, punctuation mistakes, and grammar errors." },
  { n: "95", text: "Read English Grammar in Use — a good book about the basics of English grammar by Raymond Murphy. For intermediate stuff, try English for Undergraduates by D.H. Howe." },
  { n: "96", text: "Punctuation doesn't hurt — punctuation helps readability, so learn and practice it in your craft. The Punctuation Guide is a good resource on the subject." },
];

const TOOL_TIPS: Tip[] = [
  { n: "97", text: "Try Focus Writer — one of the best free apps for distraction-free writing. Works on Linux, Windows, and Mac. Perfect for getting words on screen without distractions." },
  { n: "98", text: "Write with Draft (draftin.com) — an application designed to help you write better by providing tools to analyze your writing, including a graph of word count vs. days and most productive time." },
  { n: "99", text: "Use Freedom (macfreedom.com) — often we do our best work under restrictions. Freedom blocks the Internet to make you productive. Available for Mac." },
  { n: "100", text: "Use ColdTurkey — blocks distracting websites for a given time. Best part? It doesn't leave a way to unblock them early. Available at getcoldturkey.com." },
];

function TipItem({ n, text }: Tip) {
  return (
    <div style={TIP_STYLE}>
      <div style={TIP_NUM}>{n}.</div>
      <div style={TIP_TEXT}>{text}</div>
    </div>
  );
}

export default function WritingTipsGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide IV · Writing Tips" />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">100+ Tips · Craft & Clarity</Pill>
            <h1 style={{ margin: "16px 0 24px", fontWeight: 700, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
              100+ Writing Tips to{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>Become a Great Writer</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              "Writing tips again?" There are a lot of writing tips available on the Internet, so why read this one? Because these come from someone who has been published in Forbes, Harvard Business Review, HuffPost, The Next Web, and Entrepreneur — and who knows which tips actually compound into results.
            </p>
          </div>
          <div style={{ paddingTop: 8 }}>
            <Pill size={10.5} ls="0.18em">Categories</Pill>
            <div style={{ marginTop: 16 }}>
              {CATEGORIES.map(({ n, id, title }) => (
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
            { label: "Published", value: "February 2016 · Updated August 2022" },
            { label: "Tips", value: "100+" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Intro ──────────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px 48px" }}>
        <div style={{ maxWidth: 760 }}>
          <p style={P}>
            I always wanted to be a writer but didn&apos;t have the courage to act on my desire. Several years later, I&apos;ve been published in the world&apos;s largest publications including The Huffington Post (358 million unique visitors per month), Business.com (read by 30 million Americans each month), Virgin Startup, and Aurora (Pakistan&apos;s largest marketing magazine).
          </p>
          <p style={P}>
            Writing has greatly improved my personal branding, and it has also been instrumental in winning bigger clients. In my humble opinion, the best writers are those who have an eternal will to improve — those who read tons, study the background of famous writers, and spend enormous amounts of time on improving themselves.
          </p>
          <p style={P}>
            Not all of these tips may work for you, but some will. Of all the tips, my favourite vote goes to the tip about courage — one must be courageous enough to share their writing publicly.
          </p>
        </div>
      </section>

      {/* ── Writing Quality Content ────────────────────────────── */}
      <section style={{ padding: "0 56px 72px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ ...H2, marginTop: 0 }} id="quality">01 · Writing Quality Content (Tips 1–50)</h2>
          <HRule />
          <div style={{ marginTop: 24 }}>
            {QUALITY_TIPS.map((tip) => (
              <TipItem key={tip.n} {...tip} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Being a Prolific Writer ────────────────────────────── */}
      <section style={{ padding: "0 56px 72px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ ...H2, marginTop: 0 }} id="prolific">02 · Being a Prolific Writer (Tips 51–85)</h2>
          <HRule />
          <div style={{ marginTop: 24 }}>
            {QUALITY_TIPS_2.map((tip) => (
              <TipItem key={tip.n} {...tip} />
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Environment ───────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ ...H2, marginTop: 0 }} id="environment">03 · On Environment (Tips 86–92)</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Any guide about writing tips can&apos;t be complete without talking about the environment you are in while writing.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK, marginBottom: 8 }}>
              "Turn off your email; turn off your phone; disconnect from the Internet; figure out a way to set limits so you can concentrate when you need to, and disengage when you need to. Technology is a good servant but a bad master."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Gretchen Rubin — Author, The Happiness Project</SCaps>
          </div>
          <div>
            {ENV_TIPS.map((tip) => (
              <TipItem key={tip.n} {...tip} />
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Grammar ───────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ ...H2, marginTop: 0 }} id="grammar">04 · On Grammar (Tips 93–96)</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            No writing tips can help you if your grammar isn&apos;t solid.
          </p>
          <div>
            {GRAMMAR_TIPS.map((tip) => (
              <TipItem key={tip.n} {...tip} />
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Tools ─────────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ ...H2, marginTop: 0 }} id="tools">05 · A Few Tools (Tips 97–100)</h2>
          <HRule />
          <div style={{ marginTop: 24 }}>
            {TOOL_TIPS.map((tip) => (
              <TipItem key={tip.n} {...tip} />
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Conclusion ────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="06" label="Conclusion" />
        <div style={{ maxWidth: 760, marginTop: 32 }}>
          <p style={P}>
            That&apos;s it, folks. Not all of these tips may work for you, but some of them will work for sure. Embrace them.
          </p>
          <p style={P}>
            Of all the tips, my favourite vote goes to the tip about courage — one must be courageous enough to share their writing publicly. Without sharing, you&apos;re not getting the critique you may need.
          </p>
          <p style={P}>
            Which tip is your favourite? Which tip do you disagree with?
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="07" label="Next Steps" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            { title: "Continue reading", body: "Explore the other guides — Personal Branding, Neuromarketing, and Storytelling — to build out your full marketing toolkit.", cta: "Back to Writing", href: "/writing" },
            { title: "Get press coverage", body: "The EMOS programme applies these content and writing skills to earned media — landing you in Forbes, HBR, and your category's key publications.", cta: "Learn about EMOS", href: "/emos" },
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

      <Subscriptions sectionNumber="08" />
      <Colophon />
    </div>
  );
}

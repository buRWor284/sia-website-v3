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

const TOC = [
  { n: "01", id: "intro", title: "Introduction: 35,000 Decisions a Day" },
  { n: "02", id: "phineas-gage", title: "The Curious Brain Impalement of Phineas Gage" },
  { n: "03", id: "what-is", title: "The 'Neuro' Behind 'Marketing'" },
  { n: "04", id: "techniques", title: "5 Neuromarketing Research Techniques" },
  { n: "05", id: "inputs", title: "5 Key Marketing Inputs" },
  { n: "06", id: "examples", title: "3 Powerful Examples in Action" },
  { n: "07", id: "final", title: "Final Thoughts" },
];

const P: React.CSSProperties = { margin: "0 0 20px", fontSize: 18, lineHeight: 1.75, color: INK70 };
const H2: React.CSSProperties = { margin: "48px 0 20px", fontWeight: 700, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, fontFamily: SERIF };
const H3: React.CSSProperties = { margin: "32px 0 14px", fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: INK, fontFamily: SERIF };
const BLOCKQUOTE: React.CSSProperties = { margin: "28px 0", padding: "20px 24px", borderLeft: `4px solid ${YEL}`, background: PAPER2 };
const UL: React.CSSProperties = { margin: "0 0 20px", paddingLeft: 24, fontSize: 18, lineHeight: 1.75, color: INK70 };

export default function NeuromarketingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Resources" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="Guide II · Neuromarketing" />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">The Marketer&apos;s Field Guide</Pill>
            <h1 style={{ margin: "16px 0 24px", fontWeight: 700, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
              Neuromarketing 101:{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>What It Is & How It Works</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              Humans make about 35,000 decisions every single day — most of them unconscious. Neuromarketing is the science of understanding why. This guide covers the research techniques, real-world examples, and practical applications every marketer should know.
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
            { label: "Published", value: "November 2017 · Revised July 2021" },
            { label: "Read time", value: "~20 minutes" },
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

          <h2 style={H2} id="intro">01 · Introduction: 35,000 Decisions a Day</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Humans make about <strong>35,000 decisions every single day</strong>. Many of these decisions revolve around automatic processes — non-conscious thinking.
          </p>
          <p style={P}>
            72% of people are likely to buy products they left in their cart if the same products are offered again at a discounted price. If you believe you bought those overpriced cult jeans because you thought they fit better, think again.
          </p>
          <p style={P}>
            The term <em>neuromarketing</em> was only introduced in 2002, published in an article by BrightHouse, a marketing firm based in Atlanta. Traditional marketing research generally ignores and inaccurately reports implicit cognition and emotional triggers. Since when asked, people may not tell you the whole or accurate story:
          </p>
          <ul style={UL}>
            <li style={{ marginBottom: 10 }}>"They don&apos;t think what they say they think."</li>
            <li style={{ marginBottom: 10 }}>"They don&apos;t tell you how they actually feel."</li>
            <li style={{ marginBottom: 10 }}>"They don&apos;t do what they say they do."</li>
          </ul>
          <p style={P}>
            Before we delve in and define neuromarketing, how it works and why you need to start applying the various techniques it brings to the table — let&apos;s look at one phenomenal incident that laid some of the groundwork for this field.
          </p>

          <h2 style={H2} id="phineas-gage">02 · The Curious Brain Impalement of Phineas Gage</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            A major discovery in neuroscience occurred in 1848, when 25-year-old <strong>Phineas Gage</strong> was impaled through the brain by a large iron rod while working on the railroad. Gage sustained severe damage to his frontal lobes when a metal tamping rod was blasted through his head after a freak accident.
          </p>
          <p style={P}>
            Surprisingly, Gage survived for 12 years after this accident even though much of the left frontal lobe of his brain was destroyed. People who knew him began calling him "no longer Gage" to describe the major change in his personality and behavior.
          </p>
          <p style={P}>
            Over the next 150 years, Phineas Gage&apos;s accident laid some of the groundwork for neuromarketing and several other surgical procedures including the frontal lobotomy. Researchers compared information about Gage&apos;s skull to MRI scans of the brains of 110 right-handed men and found: <em>"Specific portions of the brain control specific human functions and not all functions are necessary to live."</em>
          </p>

          <h2 style={H2} id="what-is">03 · The &apos;Neuro&apos; Behind &apos;Marketing&apos;</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Neuromarketing is a technology-based marketing research approach aimed at observing consumers&apos; reactions to areas of the brain which respond to auditory stimuli or visual cues.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: INK, marginBottom: 8 }}>
              "Neuromarketing is simply the application of neuroscience to marketing."
            </div>
            <SCaps size={10.5} ls="0.14em" color={YEL}>Roger Dooley — Author of Brainfluence</SCaps>
          </div>
          <p style={P}>
            The theories that underpin neuromarketing were first explored by marketing professor <strong>Gerald Zaltman</strong> and his associates in the 1990s when he was employed by organizations such as Coca-Cola to investigate brain scans and observe the neural activity of consumers.
          </p>
          <p style={P}>
            Consumers&apos; subconscious holds the key for companies to finding out what these consumers want, how much they will pay, and what promotional activities appeal to them. Markets are overcrowded by numerous similar products, so it has become a key discipline to constantly innovate and differentiate products.
          </p>
          <p style={P}>
            Studies confirm: <em>"The implementation of neuroscience techniques to marketing delivers enormous benefits compared to other traditional marketing approaches."</em> While traditional marketing research typically involves questionnaires, focus groups, or in-depth interviews, neuromarketing <strong>measures brain activity</strong> and helps scientists improve behavioral predictions — and possibly visualize the workings of the human brain in unprecedented detail.
          </p>

          <h2 style={H2} id="techniques">04 · 5 Neuromarketing Research Techniques Every Marketer Should Know</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>1. Functional Magnetic Resonance Imaging (fMRI)</h3>
          <p style={P}>
            fMRI measures brain activity by detecting changes associated with blood flow as you engage in different activities — from simple tasks like controlling your hand, to complex cognitive activities like learning a new language. The fMRI technique relies on cerebral blood flow and neuronal activation: "When one area of the brain is in use, blood flow to that region also increases."
          </p>
          <p style={P}>
            fMRI has come to dominate brain mapping research because it does not require people to undergo shots or surgery, ingest substances, or be exposed to ionizing radiation.
          </p>

          <h3 style={H3}>2. Electroencephalography (EEG)</h3>
          <p style={P}>
            EEG is a monitoring method that records the electrical activity of your brain. It uses a cap of electrodes attached to your scalp to measure electrical waves produced by the brain. These electrodes allow researchers to track instinctual emotions such as anger, excitement, sorrow, and lust through fluctuations of activity.
          </p>
          <p style={P}>
            German physiologist and psychiatrist Hans Berger recorded the first human EEG in 1924 — an invention described as <em>"one of the most surprising, remarkable, and momentous developments in the history of clinical neurology."</em>
          </p>

          <h3 style={H3}>3. Steady State Topography (SST)</h3>
          <p style={P}>
            SST is a method for observing and measuring human brain activity, first introduced by Richard Silberstein with co-workers at Swinburne University of Technology in 1990. SST is essentially a refinement of EEG. Today it is widely used in hospitals throughout the world and has been validated by research for over fifteen years.
          </p>

          <h3 style={H3}>4. Facial Coding</h3>
          <p style={P}>
            The idea of measuring facial expressions was first put forth by Charles Darwin in 1872 and later explored by Paul Ekman in the 1960s. Sensors attached to the face measure tiny movements of muscles — even subconscious ones. Facial coding can measure subtle, often unconscious reactions to stimuli that hold information about how we feel about something.
          </p>

          <h3 style={H3}>5. Eye Tracking</h3>
          <p style={P}>
            Research discovered that when a person in an ad looks <em>straight out of the page</em>, viewers focus on the person&apos;s face to the detriment of the ad content. However, if the person directs their gaze at the product or text, the viewer will focus on the advertising content.
          </p>
          <p style={P}>
            <strong>So while it&apos;s useful to include images of people in your copy, it is even better if the person is looking at what you want your readers to focus on.</strong>
          </p>

          <h2 style={H2} id="inputs">05 · 5 Key Marketing Inputs Influenced by Neuromarketing</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>1. Consumer Buying Behavior</h3>
          <p style={P}>
            Marketers can use neuromarketing to learn about the mental processes behind why consumers make certain purchasing decisions. 95% of our choices are made unconsciously — if you want to predict or influence buying behavior, you need to understand how the brain works.
          </p>

          <h3 style={H3}>2. Advertising</h3>
          <p style={P}>
            The way an advertisement is presented can have tremendous effects on the actual decision made by the consumer. Studies found that attractive advertisements activate the ventromedial prefrontal cortex and the ventral striatum — responsible for emotions in decision-making and the cognition of rewards. These brain regions were not activated when a less attractive advertisement was presented, indicating that neuromarketing can determine an ad&apos;s effectiveness.
          </p>

          <h3 style={H3}>3. Pricing</h3>
          <p style={P}>
            Consumers can often be misled by higher prices since they simply expect higher quality. Consumers are often not able to correctly understand the value of a product. Neuromarketing techniques can help determine consumers&apos; true willingness to pay — and help marketers adjust prices accordingly.
          </p>

          <h3 style={H3}>4. Branding, Product Design, and Packaging</h3>
          <p style={P}>
            Neuromarketing and branding are both fundamentally concerned with how ideas are established and linked to the human mind. The design of a product and its presentation in a store are the first images consumers see. Using fMRI, EEG, or other techniques can help marketers figure out which brain areas are activated when certain brands are presented.
          </p>

          <h3 style={H3}>5. Decision-Making</h3>
          <p style={P}>
            Psychologist Daniel Kahneman describes a bi-systemic approach to decision-making. <strong>System 1</strong> is based on automatic operations — fast, requiring little effort. <strong>System 2</strong> is based on controlled operations — slower, dependent on concentration and exhausting mental activities. Most purchasing decisions are System 1 decisions, made before the consumer consciously realizes it.
          </p>

          <h2 style={H2} id="examples">06 · 3 Powerful Examples of Neuromarketing in Action</h2>
          <HRule />

          <h3 style={{ ...H3, marginTop: 28 }}>1. Red Bull: Studying Surfers&apos; Brain Waves</h3>
          <p style={P}>
            When Red Bull flew a team of neuroscientists and elite surfers to a beach town in Mexico, they wanted to know what "stoke" looks like in the brain. When a surfer is stoked, that person is "in the zone" and performing at peak potential. If scientists can find the biomarkers of stoke, coaches could use that information to help surfers achieve that hallowed state of mind.
          </p>
          <p style={P}>
            Neuroscientist David Putrino developed a water-resistant EEG system that surfers could wear into the ocean to record their brain activity in real time while catching waves.
          </p>

          <h3 style={H3}>2. Porsche: EEG at the Racetrack</h3>
          <p style={P}>
            Porsche created an ad for their 911 GT3 in which a test subject was first strapped into a jet fighter, then a Porsche on a racetrack, while his brain activity was monitored in real time. The claim: brain activity in a Porsche is nearly as exciting as being in a jet doing aerobatics.
          </p>
          <p style={P}>
            While compelling to casual viewers, scientists questioned whether an EEG cap could measure brain activity accurately on the move, with a subject laughing, shouting, and undergoing facial contortions. It illustrates both the power and the controversy of neuromarketing.
          </p>

          <h3 style={H3}>3. The Coke vs. Pepsi Blind Taste Test</h3>
          <p style={P}>
            In 2004, neuroscientist Read Montague carried out a blind taste test of Coke vs. Pepsi at the Baylor College of Medicine. Over 70 subjects blindly drank either Coke or Pepsi and were then scanned by fMRI. The brain region associated with seeking rewards was highly active when people blindly drank Pepsi, not Coke. But when the research subjects tasted both drinks with <strong>visible labels</strong>, almost all of them suddenly preferred Coke.
          </p>
          <div style={BLOCKQUOTE}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: INK70 }}>
              Branding is mind over matter. Coke has positioned itself as the best in the minds of consumers, and that brand perception overrides actual taste preference — a brain scan proves it.
            </div>
          </div>

          <h2 style={H2} id="final">07 · Final Thoughts</h2>
          <HRule />
          <p style={{ ...P, marginTop: 20 }}>
            Using the combination of psychology, neuroscience, and economics, neuromarketing allows marketers to not only find a consumer&apos;s "buy button" but also learn how to activate it.
          </p>
          <p style={P}>
            Whether you applaud neuromarketing as it pushes the limits of science, or fear that it crosses moral boundaries — there&apos;s no doubt it is a topic of the twenty-first century, and we should all hold an educated opinion on it.
          </p>
          <p style={P}>
            What&apos;s your perception on neuromarketing? Are you already using some of its techniques in your work?
          </p>

        </div>
      </section>

      <HRule />

      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="08" label="Next Steps · Apply What You&apos;ve Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            { title: "Continue reading", body: "Explore the other guides — Personal Branding, Storytelling, and Writing Tips — to round out your marketing toolkit.", cta: "Back to Resources", href: "/resources" },
            { title: "Get press coverage", body: "The EMOS programme applies these principles to earned media — landing you in Forbes, HBR, and your category's key publications.", cta: "Learn about EMOS", href: "/emos" },
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

      <Subscriptions sectionNumber="09" />
      <Colophon />
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neuromarketing 101: What Is Neuromarketing And How Does It Work? · Syed Irfan Ajmal",
  description: "A research-backed guide to neuromarketing — covering the history, techniques (fMRI, EEG, eye tracking), real-world examples from Red Bull, Porsche, and Coke vs Pepsi, and how to apply it in your marketing.",
  openGraph: {
    title: "Neuromarketing 101: What Is Neuromarketing And How Does It Work?",
    description: "Research-backed guide covering fMRI, EEG, facial coding, eye tracking, and real-world neuromarketing examples from Red Bull, Porsche, and Coke vs Pepsi.",
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

// ─── Image map (local files in /public/articles/neuromarketing/) ───────────────
const IMG = {
  redBullEeg:      "/articles/neuromarketing/RedBull-EEG.jpeg",
  phineaSkull:     "/articles/neuromarketing/Phineas-gage-rod-skull-model-story.jpg",
  phineasPortrait: "/articles/neuromarketing/PhineasGage.jpg",
  // phineasBrain wide scan — not in local folder, using archive URL
  phineasBrain:    "https://web.archive.org/web/20260120020120im_/https://syedirfanajmal.com/wp-content/uploads/2017/10/Phineas-gage-1024x356.jpg",
  rotatingBrain:   "/articles/neuromarketing/Fig2_Rotating_brain_colored.gif",
  pepsiCoke:       "/articles/neuromarketing/neuromarketing-pepsi-cocacola.png",
  eegScanner:      "/articles/neuromarketing/EEG-Scanner.jpg",
  facialCoding:    "/articles/neuromarketing/Facial-coding.png",
  eyeTracking:     "/articles/neuromarketing/EyeTracking.jpg",
  babyOut:         "/articles/neuromarketing/baby-2.jpg",
  babySide:        "/articles/neuromarketing/baby-3.jpg",
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

const YouTubeEmbed = ({ id, title }: { id: string; title: string }) => (
  <div
    style={{
      margin: "28px 0",
      position: "relative",
      paddingBottom: "56.25%",
      height: 0,
      overflow: "hidden",
    }}
  >
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  </div>
);

// ─── TOC ──────────────────────────────────────────────────────────────────────

const TOC = [
  { n: "01", id: "intro",       title: "Introduction: 35,000 Decisions a Day" },
  { n: "02", id: "phineas-gage", title: "The Curious Brain Impalement of Phineas Gage" },
  { n: "03", id: "what-is",     title: "The 'Neuro' Behind 'Marketing'" },
  { n: "04", id: "techniques",  title: "5 Neuromarketing Research Techniques" },
  { n: "05", id: "inputs",      title: "5 Key Marketing Inputs" },
  { n: "06", id: "examples",    title: "3 Powerful Examples in Action" },
  { n: "07", id: "final",       title: "Final Thoughts" },
  { n: "08", id: "references",  title: "References" },
];

// ─── Style constants ───────────────────────────────────────────────────────────

const P: React.CSSProperties      = { margin: "0 0 20px", fontFamily: SERIF, fontSize: 18.5, lineHeight: 1.65, color: INK, textAlign: "justify" };
const H2: React.CSSProperties     = { margin: "2.4em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, borderTop: `1px solid ${INK}`, paddingTop: 22 };
const H3: React.CSSProperties     = { margin: "1.6em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 24, fontStyle: "italic", lineHeight: 1.2, letterSpacing: "-0.015em", color: INK };
const PULLQUOTE: React.CSSProperties = { margin: "2em 0", padding: "24px 32px 24px 28px", borderLeft: `4px solid ${YEL}`, background: PAPER2 };
const LI_WRAP: React.CSSProperties   = { margin: "0.4em 0 1.4em", padding: 0, listStyle: "none", borderTop: `1px solid ${INK15}` };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NeuromarketingGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 64px" }}>
        <SectionMast n="00" label="101 Series · No. 03 · Neuromarketing" />
        <div className="grid-dark-card" style={{ alignItems: "start" }}>
          <div>
            <Pill size={10.5} ls="0.18em">The Marketer&apos;s Field Guide</Pill>
            <h1 style={{ margin: "16px 0 24px", fontFamily: SERIF, fontWeight: 700, fontSize: 72, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
              Neuromarketing 101:{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>What Is It & How Does It Work?</Mark>
              </span>
            </h1>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 20, lineHeight: 1.6, color: INK70, maxWidth: 580 }}>
              Humans make about 35,000 decisions every single day — most of them unconscious. Neuromarketing is the science of understanding why, and how marketers can use that knowledge ethically and effectively.
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
            { label: "Author",    value: "Syed Irfan Ajmal" },
            { label: "Published", value: "First published November 11, 2017 · Revised July 2021" },
            { label: "Read time", value: "18 min read · ~4,500 words" },
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

          {/* ── 01 Introduction ───────────────────────────────── */}
          <h2 style={H2} id="intro">01 · Introduction: 35,000 Decisions a Day</h2>

          {/* Drop cap paragraph */}
          <p style={{ ...P, marginTop: 20 }}>
            <span style={{
              float: "left",
              fontFamily: SERIF,
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: 104,
              lineHeight: 0.78,
              marginRight: 12,
              marginTop: 8,
              color: INK,
              background: YEL,
              padding: "6px 10px 2px 10px",
            }}>B</span>
            efore I explain what neuromarketing is, consider this: humans make about <strong>thirty-five thousand decisions every single day</strong>. Many of these decisions revolve around automatic processes — non-conscious thinking.
          </p>

          <p style={P}>
            Apparently, 72% of people are likely to buy products they left in their cart if the same products are offered again at a discounted price. If you believe you bought those overpriced cult jeans because you thought they fit better, think again.
          </p>

          <p style={P}>
            The term <em>neuromarketing</em> was only introduced in 2002 — published in an article by <a href="http://www.thinkbrighthouse.com/" target="_blank" rel="noopener noreferrer" style={{ color: INK, textDecoration: "underline" }}>BrightHouse</a>, a marketing firm based in Atlanta.
          </p>

          <p style={P}>
            Traditional marketing research generally ignores and inaccurately reports implicit cognition and emotional triggers. Since, when asked, people may not tell you the whole or accurate story:
          </p>

          <ul style={LI_WRAP}>
            {[
              '"They don\'t think what they say they think."',
              '"They don\'t tell you how they actually feel."',
              '"They don\'t do what they say they do."',
            ].map((item, i) => (
              <li key={i} style={{ padding: "12px 0 12px 28px", borderBottom: `1px solid ${INK15}`, fontFamily: SERIF, fontSize: 17, color: INK, lineHeight: 1.5, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 18, width: 12, height: 12, background: YEL, border: `1.5px solid ${INK}` }} />
                {item}
              </li>
            ))}
          </ul>

          <p style={P}>
            Now: before we delve in and define neuromarketing, how it works and why you need to start applying the various techniques it brings to the table — let&apos;s take a look at one phenomenal incident that laid some of the groundwork for neuromarketing and the various surgical procedures available today.
          </p>

          {/* ── 02 Phineas Gage ───────────────────────────────── */}
          <h2 style={H2} id="phineas-gage">02 · The Curious Brain Impalement of Phineas Gage</h2>

          <p style={{ ...P, marginTop: 20 }}>
            A major discovery in the field of neuroscience occurred in 1848, when 25-year-old <strong>Phineas Gage</strong> was impaled through the brain by a large iron rod while working on the railroad.
          </p>

          <ArticleImg
            src={IMG.phineaSkull}
            alt="Phineas Gage skull model showing the path of the iron rod"
            caption="The iron tamping rod that passed through Phineas Gage's skull, now displayed at Harvard Medical School."
            width={480}
          />

          <p style={P}>
            Gage sustained severe damage to his frontal lobes when a metal tamping rod was blasted through his head after a freak accident. Surprisingly enough, Gage survived for 12 years after this accident even though much of the left frontal lobe of his brain was destroyed. People who knew him began calling him &quot;no longer Gage&quot; to describe the major change in his personality and behavior (Daskalos, 2012).
          </p>

          <ArticleImg
            src={IMG.phineasPortrait}
            alt="Portrait of Phineas Gage holding the iron rod"
            caption="Phineas Gage — the only known photograph, taken after his accident. He holds the iron rod that passed through his skull."
            width={360}
          />

          <p style={P}>
            Over the next 150 years, Phineas Gage&apos;s phenomenal accident laid some of the groundwork for neuromarketing and several other surgical procedures including the frontal lobotomy.
          </p>

          <p style={P}>
            Researchers compared information about Gage&apos;s skull to magnetic resonance imaging (MRI) scans of the brains of 110 right-handed men between ages 25 to 36 — the age range at which Gage lived with his injury — and found:
          </p>

          <figure style={PULLQUOTE}>
            <blockquote style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 26, lineHeight: 1.3, color: INK, letterSpacing: "-0.01em" }}>
              &ldquo;Specific portions of the brain control specific human functions and not all functions are necessary to live.&rdquo;
            </blockquote>
          </figure>

          <ArticleImg
            src={IMG.phineasBrain}
            alt="Brain scan showing the path of the rod through Phineas Gage's brain"
            caption="Modern reconstruction of the path the tamping iron rod took through Phineas Gage's brain, based on his skull and MRI data from 110 men of similar age."
          />

          <ArticleImg
            src={IMG.rotatingBrain}
            alt="Rotating 3D brain illustration showing key lobes"
            caption="A rotating view of the brain showing the major lobes. The frontal lobe — severely damaged in Gage — is associated with personality, decision-making, and social behavior."
          />

          <p style={P}>
            Moreover: &ldquo;If the rod had penetrated his brain at any other angle, even slightly different than the trajectory that it took, it might have pierced some major cerebrovasculature, and taken his life,&rdquo; says Jack Van Horn, assistant professor in the department of neurology at UCLA School of Medicine in Los Angeles.
          </p>

          {/* ── 03 What Is Neuromarketing ─────────────────────── */}
          <h2 style={H2} id="what-is">03 · The &apos;Neuro&apos; Behind &apos;Marketing&apos;</h2>

          <p style={{ ...P, marginTop: 20 }}>
            Neuromarketing is a technology-based marketing research approach aimed at observing consumers&apos; reaction to areas of the brain which respond to auditory stimuli or visual cues.
          </p>

          <figure style={PULLQUOTE}>
            <blockquote style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 26, lineHeight: 1.3, color: INK, letterSpacing: "-0.01em" }}>
              &ldquo;Neuromarketing is simply the application of neuroscience to marketing.&rdquo;
            </blockquote>
            <figcaption style={{ marginTop: 14, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: YEL }}>
              Roger Dooley — Author of <em style={{ color: INK55, fontStyle: "normal" }}>Brainfluence</em>
            </figcaption>
          </figure>

          <p style={P}>
            Now, although neuromarketing is a fairly new phenomenon, it has gained a lot of momentum in the past few years. The theories that underpin neuromarketing were first explored by marketing professor <strong>Gerald Zaltman</strong> and his associates in the 1990s when he was employed by organizations such as Coca-Cola to investigate the brain scans and observe neural activity of consumers.
          </p>

          <p style={P}>
            Fact: Consumers&apos; subconscious holds the key for companies to finding out what these consumers want, how much they will pay, and maybe even what promotional activities appeal to them (Glaenzer 2016).
          </p>

          <p style={P}>
            One of the keys to getting results and boosting the effectiveness of your marketing efforts is to understand how neuromarketing works (Mason, 2014). Furthermore, markets are overcrowded by numerous similar products. So, it has become a key discipline to constantly innovate and differentiate products so as to meet customer needs or wants.
          </p>

          <p style={P}>
            What&apos;s more: although doubts have been raised over whether neuromarketing techniques really do what they say they do — and if the techniques are being properly applied — studies confirm: <em>&ldquo;The implementation of neuroscience techniques to marketing delivers enormous benefits compared to other traditional marketing approaches.&rdquo;</em>
          </p>

          <p style={P}>
            Also, while traditional marketing research typically involves questionnaires, focus groups, or in-depth interviews, neuromarketing <strong>measures the brain activity</strong>, and helps scientists improve behavioral predictions, and possibly visualize the workings of the human brain in unprecedented detail and precision.
          </p>

          {/* Callout: Note */}
          <aside style={{ margin: "2em 0", padding: "24px 28px", background: INK, color: PAPER }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.20em", textTransform: "uppercase", color: YEL, marginBottom: 12 }}>
              Note
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 17.5, fontStyle: "italic", lineHeight: 1.5, color: PAPER }}>
              There is no doubt that consumer behavior can never be predicted with 100% precision. But there are still many things you can do.
            </div>
          </aside>

          {/* ── 04 Techniques ─────────────────────────────────── */}
          <h2 style={H2} id="techniques">04 · The Top 5 Neuromarketing Research Techniques Every Marketer Should Know About</h2>

          <h3 style={{ ...H3, marginTop: 28 }}>1 · Functional Magnetic Resonance Imaging (fMRI)</h3>
          <p style={P}>
            fMRI measures brain activity by detecting changes associated with blood flow as you engage in different activities — from simple tasks like controlling your hand or reaching out to pick up a glass of water, to complex cognitive activities like learning or understanding a new language.
          </p>
          <p style={P}>
            The fMRI technique relies on cerebral blood flow and neuronal activation. In other words: <em>&ldquo;When one area of the brain is in use, blood flow to that region also increases.&rdquo;</em>
          </p>
          <p style={P}>
            fMRI has come to dominate brain mapping research because it does not require people to undergo shots or surgery to ingest substances, or to be exposed to ionizing radiation.
          </p>

          <h3 style={H3}>2 · Electroencephalography (EEG)</h3>
          <p style={P}>
            EEG is a monitoring method that records the electrical activity of your brain (WebMD, 2015). It uses a cap of electrodes attached to your scalp to measure electrical waves produced by the brain. These electrodes allow researchers to track instinctual emotions such as anger, excitement, sorrow, and lust through fluctuations of activity.
          </p>
          <p style={P}>
            The EEG test can also be used to help diagnose conditions such as seizures, head injuries, dizziness, headaches, brain tumors and sleeping problems.
          </p>
          <p style={P}>
            German physiologist and psychiatrist <strong>Hans Berger</strong> recorded the first human EEG in 1924. Expanding on work previously conducted on animals by Richard Caton and others, Berger also invented the electroencephalogram — an invention described as <em>&ldquo;one of the most surprising, remarkable, and momentous developments in the history of clinical neurology.&rdquo;</em>
          </p>

          <ArticleImg
            src={IMG.eegScanner}
            alt="EEG electroencephalography headset used in neuromarketing research"
            caption="An EEG cap fitted with electrodes. The device records the brain's electrical activity in real time — allowing researchers to detect emotional responses to marketing stimuli."
          />

          <h3 style={H3}>3 · Steady State Topography (SST)</h3>
          <p style={P}>
            SST is a method for observing and measuring human brain activity that was first introduced by <strong>Richard Silberstein</strong> with his co-workers Geoffrey Nield and David Simpson at the Swinburne University of Technology in 1990.
          </p>
          <p style={P}>
            According to Richard Silberstein, SST is essentially a refinement of EEG. Today, Steady State Topography is widely used in hospitals throughout the world and has been validated by research and used in clinical applications for over fifteen years.
          </p>

          <h3 style={H3}>4 · Facial Coding — To Categorize The Physical Expression of Emotion</h3>
          <p style={P}>
            You don&apos;t have to peek into people&apos;s brain to measure what they truly feel. Science has shown us we can learn a lot from people&apos;s faces too.
          </p>
          <p style={P}>
            The idea of facial expressions was first put forth by <strong>Charles Darwin</strong> in 1872 and later explored thoroughly by numerous psychologists, with important contributions coming from <strong>Paul Ekman</strong> in the 1960s.
          </p>
          <p style={P}>
            But how do you use Facial Coding to your advantage? Just as there is equipment to measure the brain activity, there are also sensors that can be attached to the face and measure tiny movements of muscles. Even better: facial coding can help you measure subtle — oftentimes subconscious — reactions to stimuli that hold information about how we feel about something.
          </p>

          <ArticleImg
            src={IMG.facialCoding}
            alt="Facial coding technology tracking micro-expressions for neuromarketing"
            caption="Facial coding maps micro-expressions — involuntary muscle movements that reveal genuine emotional reactions, even when a consumer consciously tries to mask them."
          />

          <h3 style={H3}>5 · Eye Tracking — To Know Exactly Where Your Customers&apos; Eyes Are Focused</h3>
          <p style={P}>
            It is old news that ads that include people are much more effective than those that do not. Researchers discovered that when the person in the ad looks &ldquo;straight out of the page,&rdquo; viewers will be far more focused on the person&apos;s face to the detriment of focusing on the ad content.
          </p>
          <p style={P}>
            However, if the person is directing its gaze at the product or text then the viewer will, in fact, focus on the advertising content.
          </p>

          <ArticleImg
            src={IMG.eyeTracking}
            alt="Eye tracking heatmap showing where viewers look in an advertisement"
            caption="Eye tracking heatmaps reveal where viewers' attention actually lands — often very different from where marketers assume."
          />

          <p style={P}>
            The practical implication goes beyond gaze direction. Research has also shown that images of babies in ads are highly effective at capturing attention. Here&apos;s why:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "28px 0" }}>
            <ArticleImg
              src={IMG.babyOut}
              alt="Baby looking out of frame — viewer attention goes to baby's face"
              caption="When a baby looks straight out, viewer attention gravitates to the face — away from the ad copy."
            />
            <ArticleImg
              src={IMG.babySide}
              alt="Baby looking toward the product — viewer attention follows the gaze"
              caption="When the baby looks toward the copy or product, attention follows — boosting recall of the message."
            />
          </div>

          {/* Callout: Practical takeaway */}
          <aside style={{ margin: "2em 0", padding: "24px 28px", background: INK, color: PAPER }}>
            <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.20em", textTransform: "uppercase", color: YEL, marginBottom: 12 }}>
              Practical Takeaway
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 17.5, fontStyle: "italic", lineHeight: 1.5, color: PAPER }}>
              While it&apos;s useful to include images of people (especially babies) in your copy, it is even better if the person is looking at what you want your readers to look at.
            </div>
          </aside>

          {/* ── 05 Key Inputs ─────────────────────────────────── */}
          <h2 style={H2} id="inputs">05 · The 5 Key Marketing Inputs Influenced By Neuromarketing</h2>

          <h3 style={{ ...H3, marginTop: 28 }}>1 · Consumer Buying Behavior</h3>
          <p style={P}>
            Marketers can use neuromarketing to learn about the mental processes behind why consumers make certain purchasing decisions. 95% of our choices are made unconsciously, and thus: if you, as a marketer, want to predict or influence the buying behavior, you need to first understand how the brain works.
          </p>

          <h3 style={H3}>2 · Advertising</h3>
          <p style={P}>
            The way an advertisement is presented can have tremendous effects on the actual decision made by the consumer. Studies by Kenning and Linzmajer (2011) elaborated upon the attractiveness of an advertisement and its correlated activation of brain areas.
          </p>
          <p style={P}>
            By making use of neuromarketing tools, they figured out that attractive advertisements activate the <em>ventromedial prefrontal cortex</em> and the <em>ventral striatum</em>, which are responsible for emotions in the decision-making process and the cognition of rewards. These brain regions were not activated when a less attractive advertisement was presented.
          </p>
          <p style={P}>
            Therefore, this indicates that by making use of neuromarketing techniques it is possible to find out if an advertisement is perceived to be attractive or not, and therewith figure out its effectiveness. Plus, it may also be useful to test various attractive versions of an ad to find which one gets the best response.
          </p>

          <h3 style={H3}>3 · Pricing</h3>
          <p style={P}>
            Pricing is a key indicator with regards to the presentation of a product and its appearance to consumers (Zhang, 2015). For example, consumers can often be misled by higher prices since they simply expect higher quality — although this might not always be the case.
          </p>
          <p style={P}>
            It is well known that consumers are often unable to correctly understand the value of a product, and, hence, they may not be in a position to exactly determine how much they would be willing to pay for certain products.
          </p>
          <p style={P}>
            On basis of that, one can argue the application of neuromarketing techniques can be helpful in order to determine consumers&apos; willingness to pay — and marketers can consider adjusting prices accordingly.
          </p>

          <h3 style={H3}>4 · Branding, Product Design and Packaging</h3>
          <p style={P}>
            Neuromarketing and branding were made for each other. Both are fundamentally concerned with how ideas are established and linked to the human mind (Genco, 2015).
          </p>
          <p style={P}>
            The design of a product and its presentation in a store are the first images which consumers see. Moreover, according to a study done by Hindawi Computational Intelligence and Neuroscience: making use of fMRI, EEG or any other neuromarketing techniques can help marketers figure out which brain areas are being activated when certain brands are being presented.
          </p>

          <h3 style={H3}>5 · Decision-Making</h3>
          <p style={P}>
            So far, a number of fundamental theories and models have tried to explain the consumer&apos;s behavior. One of the most popular models was described by psychologist <strong>Daniel Kahneman</strong>.
          </p>
          <p style={P}>
            Kahneman emphasizes the idea of a bi-systemic approach for evaluative judgments and decision-making process. He believes there are two systems, <strong>System 1</strong> and <strong>System 2</strong>. System 1 is based on automatic operations, while System 2 is based on controlled operations. The first system is fast and requires little effort, while the second system is dependent on concentration and exhausting mental activities.
          </p>

          {/* ── 06 Examples ───────────────────────────────────── */}
          <h2 style={H2} id="examples">06 · 3 Powerful Examples of Neuromarketing In Action</h2>

          <p style={{ ...P, marginTop: 20 }}>
            Neuromarketing is changing the way companies position their products and services. Below are some of the most powerful examples in action.
          </p>

          <h3 style={H3}>1 · Red Bull: Studying Surfers&apos; Brain Waves</h3>
          <p style={P}>
            When the energy drink company Red Bull flew a team of neuroscientists and elite surfers to a beach town in Mexico, it was in hopes of answering a vexing question: how can you study the brain waves of surfers while they&apos;re actually riding the waves?
          </p>
          <p style={P}>
            The company wanted to know what &quot;stoke&quot; looks like in the brain, says Brandon Larson, a technologist on Red Bull&apos;s R&amp;D team. When a surfer is stoked, Larson says, that person is &quot;in the zone,&quot; and performing at peak potential. If scientists can find the biomarkers of &quot;stoke,&quot; maybe coaches can use the information to help surfers achieve that hallowed state of mind.
          </p>
          <p style={P}>
            David Putrino, one of the neuroscientists who went to Red Bull&apos;s surf camp in Salina Cruz, Mexico, developed a water-resistant EEG system that surfers could wear into the ocean to record their brain activity.
          </p>

          <ArticleImg
            src={IMG.redBullEeg}
            alt="Red Bull EEG study with surfers wearing brain monitoring equipment"
            caption="Red Bull's neuroscience team developed waterproof EEG headsets that surfers could wear into the ocean — capturing real-time brain activity data while catching waves."
          />

          <YouTubeEmbed
            id="LsfDj8gVNvs"
            title="Red Bull Surfer EEG Study — Neuromarketing in Action"
          />

          <h3 style={H3}>2 · Porsche: Taking EEG To The Next Level</h3>
          <p style={P}>
            Have you ever wondered if flying in a fighter jet is more stimulating than riding shotgun in a Porsche? Wonder no more.
          </p>
          <p style={P}>
            Porsche, a brand grounded in technology, created a witty (yet highly questionable) ad for their <strong>911 GT3</strong> sports car. The test subject is first strapped into a jet fighter, and then a Porsche on a race-track thereafter — while his brain activity is putatively monitored in real time by a scientist.
          </p>
          <p style={P}>
            The claim is that the brain activity in a Porsche is (nearly) as exciting as being in a jet fighter doing aerobatics. While it all seems logical and even believable to the casual viewer, numerous scientists questioned whether an EEG cap like the one shown in the ad could measure brain activity on the move or possibly be accurate with the subject laughing, shouting, and undergoing various facial contortions.
          </p>

          <YouTubeEmbed
            id="o1huW9RMgkM"
            title="Porsche 911 GT3 EEG Brain Activity Advertisement"
          />

          <h3 style={H3}>3 · The Coke vs. Pepsi Blind Taste Test</h3>
          <p style={P}>
            In 2004, neuroscientist <strong>Read Montague</strong> carried out a blind taste test of Coke vs. Pepsi at the Baylor College of Medicine in Houston. Over 70 subjects blindly drank either Coke or Pepsi and then they were scanned by functional magnetic resonance imaging (fMRI) to determine why and how consumers make decisions and choose one competitive product over the other.
          </p>

          <ArticleImg
            src={IMG.pepsiCoke}
            alt="Coke vs Pepsi neuromarketing blind taste test comparison"
            caption="The Coke vs. Pepsi fMRI experiment revealed that branding activates entirely different neural pathways than taste — overriding actual sensory preference."
          />

          <p style={P}>
            In this experiment, Read Montague and his team found that the brain region called the <em>ventral medial prefrontal</em> — associated with &quot;seeking rewards&quot; — was highly active when people blindly drank Pepsi, and not Coke.
          </p>
          <p style={P}>
            However, when the research subjects tasted both drinks with <strong>visible labels</strong> while they were not blindfolded, almost all of them suddenly preferred Coke and a different part of the brain was seen to be more active by the fMRI scans.
          </p>

          <figure style={PULLQUOTE}>
            <blockquote style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 26, lineHeight: 1.3, color: INK, letterSpacing: "-0.01em" }}>
              &ldquo;The reason? Branding is mind over matter. Coke has positioned itself to be the best in the minds of consumers.&rdquo;
            </blockquote>
          </figure>

          <YouTubeEmbed
            id="8oIGvgs9FnM"
            title="Coke vs Pepsi Blind Taste Test — The Science of Branding"
          />

          {/* ── 07 Final Thoughts ─────────────────────────────── */}
          <h2 style={H2} id="final">07 · Final Thoughts</h2>

          <p style={{ ...P, marginTop: 20 }}>
            Using the combination of psychology, neuroscience, and economics, neuromarketing allows marketers to not only find a consumer&apos;s &quot;buy button&quot; but also learn how to &quot;push it.&quot;
          </p>
          <p style={P}>
            Moreover: neuromarketing is a reasonably new field of inquiry. Whether you applaud it as it pushes the limits of science, or fear that it crosses moral boundaries and should be restricted — there&apos;s no doubt, neuromarketing is a topic of the twenty-first century, and we should all hold an educated opinion on it.
          </p>
          <p style={P}>
            Now over to you. What&apos;s your perception on neuromarketing? Are you using some of its techniques already?
          </p>

          {/* ── 08 References ─────────────────────────────────── */}
          <h2 style={H2} id="references">08 · References</h2>

          <ol style={{ margin: "20px 0 0", padding: 0, listStyle: "none", borderTop: `1px solid ${INK15}` }}>
            {[
              "Berger, H. (1929). Über das Elektrenkephalogramm des Menschen. Archiv für Psychiatrie und Nervenkrankheiten, 87(1), 527–570.",
              "Daskalos, C. (2012). The Story of Phineas Gage and What It Tells Us About the Brain. Psychology Today.",
              "Darwin, C. (1872). The Expression of the Emotions in Man and Animals. John Murray.",
              "Dooley, R. (2012). Brainfluence: 100 Ways to Persuade and Convince Consumers with Neuromarketing. Wiley.",
              "Ekman, P., & Friesen, W. V. (1969). The repertoire of nonverbal behavior: Categories, origins, usage, and coding. Semiotica, 1(1), 49–98.",
              "Genco, S. J., Pohlmann, A. P., & Steidl, P. (2015). Neuromarketing for Dummies. Wiley.",
              "Glaenzer, E. (2016). Neuromarketing — Understanding How and Why Consumers Make Decisions. Strategic Finance.",
              "Hindawi Publishing Corporation / Computational Intelligence and Neuroscience. (Various years). Studies on brand neural activation using fMRI and EEG.",
              "Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux.",
              "Kenning, P., & Linzmajer, M. (2011). Consumer neuroscience: an overview of an emerging discipline with implications for consumer policy. Journal für Verbraucherschutz und Lebensmittelsicherheit, 6(1), 111–125.",
              "Larson, B. (2014). What Does 'Stoke' Look Like in the Brain? Red Bull Media House.",
              "Mason, M. (2014). Neuromarketing and consumer neuroscience: contributions to neurology. BMC Neurology, 14, 151.",
              "Montague, P. R., McClure, S. M., Baldwin, P. R., Phillips, P. E., Bhatt, D. L., Platt, M. L., & Berns, G. S. (2004). Biases in brain blood oxygen-level-dependent signal calibration. Journal of Neurophysiology, 92(3), 1785–1794.",
              "Putrino, D. (2014). EEG in the Ocean: Real-Time Brain Monitoring for Red Bull Surf Research. Icahn School of Medicine at Mount Sinai.",
              "Silberstein, R. B., Nield, G. E., & Simpson, D. G. (1990). Steady-state visually evoked potential topography. International Journal of Neuroscience, 51(3–4), 209–214.",
              "Van Horn, J. D. (2012). Mapping connectivity damage in the case of Phineas Gage. PLOS ONE.",
              "WebMD. (2015). Electroencephalogram (EEG). WebMD Medical Reference.",
              "Zaltman, G. (2003). How Customers Think: Essential Insights into the Mind of the Market. Harvard Business School Press.",
              "Zhang, Y. (2015). The role of price in consumer decision-making: A neuromarketing perspective. Journal of Consumer Research.",
            ].map((ref, i) => (
              <li key={i} style={{ padding: "12px 0 12px 36px", borderBottom: `1px solid ${INK15}`, fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.6, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 15, fontFamily: GROT, fontWeight: 700, fontSize: 10, color: INK35, letterSpacing: "0.08em" }}>
                  [{i + 1}]
                </span>
                {ref}
              </li>
            ))}
          </ol>

        </div>
      </section>

      <HRule />

      {/* ── Next Steps ──────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="09" label="Next Steps · Apply What You&apos;ve Learned" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 40 }}>
          {[
            {
              title: "Continue reading",
              body:  "Explore the other guides — Personal Branding, Storytelling, and Writing Tips — to round out your marketing toolkit.",
              cta:   "Back to Resources",
              href:  "/resources",
            },
            {
              title: "Get press coverage",
              body:  "The EMOS programme applies these principles to earned media — landing you in Forbes, HBR, and your category&apos;s key publications.",
              cta:   "Learn about EMOS",
              href:  "/emos",
            },
            {
              title: "Work with Syed",
              body:  "For a fractional CMO arrangement or a done-for-you earned media programme, book a discovery call.",
              cta:   "Book a call",
              href:  CALENDLY,
            },
          ].map(({ title, body, cta, href }) => (
            <div key={title} style={{ borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</h3>
              <HRule />
              <p style={{ margin: "14px 0 20px", fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK70 }} dangerouslySetInnerHTML={{ __html: body }} />
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

      <Subscriptions sectionNumber="10" />
      <Colophon />
    </div>
  );
}

"use client";

import { useState, Fragment } from "react";
import Script from "next/script";
import { Colophon, Subscriptions, CTATicker } from "@/components/bureau";
import { ClientLogo } from "@/components/bureau/ClientLogo";
import {
  DoubleRule,
  Flag,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
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
import { CLIENTS_PRE, CLIENTS_TIER1 } from "@/data/clients";
import { ScrollButtons } from "@/components/ScrollButtons";

// ─── Data ────────────────────────────────────────────────────────────────────

const BOOKING_SPECS: ReadonlyArray<[string, string]> = [
  ["Format",    "Keynote · Workshop · Panel · Webinar"],
  ["Duration",  "20 min · 45 min · half-day · full-day"],
  ["Languages", "English (primary), Urdu, Pashto"],
  ["Travel",    "Asia, MENA, Europe, North America · virtual worldwide"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["04",  "countries hosted on stage"],
  ["06",  "speaker formats offered"],
  ["12+", "webinars & guest podcasts"],
  ["~500", "biggest live audience"],
];

type PrimaryTopic = {
  no: string;
  label: string;
  title: string;
  blurb: string;
  bullets: string[];
  casestudy: { v: string; l: string };
  moreHref?: string;
};

const PRIMARY_TOPICS: ReadonlyArray<PrimaryTopic> = [
  {
    no: "01",
    label: "Primary topic · flagship for 2026",
    title: "Earned Media in the Age of AI",
    blurb:
      "How AI is remaking earned media from both sides at once: agents that can now run a six stage PR pipeline, and the LLMs and AI search that decide which brands get seen. Built from real data inside the earned media OS I run, with three live activities the room works through together.",
    bullets: [
      "The six stage AI pipeline: Signal, Authority Content, Verify, Match, Pitch, Attribute",
      "Three live activities: an idea sprint, spot the slop, and a pitch clinic on real work",
      "Why LLMs and AI search now decide which brands get seen, and what they reward",
      "The Coverage Flywheel: how one placement compounds into six returns",
      "Honest failures: exactly where AI still cannot do the job of a PR team",
    ],
    casestudy: { v: "06", l: "stage AI pipeline · run live in the room" },
    moreHref: "/speaking/earned-media-ai",
  },
  {
    no: "02",
    label: "Primary topic · most-requested",
    title: "Digital PR for Publicity",
    blurb:
      "How to land bylines, quotes and features in publications your buyers actually read — without paying for a PR agency. HARO, journalist outreach, story design.",
    bullets: [
      "Why earned media outperforms paid in 2026",
      "The HARO playbook: pitch, follow-up, conversion",
      "Tactics for landing Forbes, HBR, HuffPost",
      "Building a journalist relationship that compounds",
      "Measuring earned media ROI (the right way)",
    ],
    casestudy: { v: "60+", l: "media placements · single campaign" },
  },
  {
    no: "03",
    label: "Primary topic · most-requested",
    title: "Boosting Organic Visibility Through SEO-PR",
    blurb:
      "The synthesis of SEO and digital PR. How to compound rankings and authority by earning links from publications, not buying them. Built on a hundred client campaigns.",
    bullets: [
      "The SEO-PR loop: content → outreach → authority → rankings",
      "Where in-house teams plateau, and how to break through",
      "Live case studies: Ridester (0 → 1.5M visitors)",
      "How Centriq saw 120% traffic and 6× signups",
      "A repeatable system for organic, durable growth",
    ],
    casestudy: { v: "6×", l: "daily signups · Centriq case" },
  },
];

type SupportingTopic = { title: string; blurb: string };
const SUPPORTING_TOPICS: ReadonlyArray<SupportingTopic> = [
  {
    title: "Writing Your Way to Success",
    blurb:
      "Content marketing that builds brand, authority, and pipeline — with three case studies (Buffer, River Pools, a client at $200K/mo).",
  },
  {
    title: "Brand Yourself for Success",
    blurb:
      "Personal branding for founders & operators. The five pillars: clarity, consistency, content, community, credibility.",
  },
  {
    title: "Media Hacks · Free Publicity",
    blurb:
      "A tactical, repeatable, no-budget playbook for getting featured in Forbes, HBR and HuffPost without an agency retainer.",
  },
];

type Reel = {
  id: string;
  title: string;
  venue: string;
  city: string;
  region: string;
  note: string;
  badge?: string;
  startAt?: number;
};

const REELS: ReadonlyArray<Reel> = [
  { id: "uSn4s5ZbJcQ", title: "Panel · Marketing to the Modern Muslim Traveller",
    venue: "Arabian Travel Market 2018", city: "Dubai",     region: "UAE",        note: "Onstage with industry leaders.", badge: "Featured", startAt: 743 },
  { id: "2mJ3o2LyWAc", title: "Media Hacks · Free Publicity Online",
    venue: "IN5 Innovation Hub",        city: "Dubai",     region: "UAE",        note: "Workshop · the earned-media playbook"                           },
  { id: "50SIoLI-TW4", title: "Digital Marketing Workshop at MaGIC",
    venue: "MaGIC",                     city: "Cyberjaya", region: "Malaysia",   note: "Workshop · marketing for entrepreneurs"                         },
  { id: "OwQpDj4c1LE", title: "DMSS Conference · Media Hacks",
    venue: "DMSS",                      city: "Bali",      region: "Indonesia",  note: "Workshop · ~200 attendees"                                      },
  { id: "rRUS5dlJdc4", title: "Personal Branding Workshop",
    venue: "Durshal",                   city: "Peshawar",  region: "Pakistan",   note: "Workshop · the five pillars"                                    },
  { id: "zBUeBo4srpA", title: "Writing Your Way to Success",
    venue: "Webinar",                   city: "Remote",    region: "US / UK",    note: "20 min · three case studies"                                    },
];

type Stage = {
  yr: string; evt: string; city: string; country: string;
  fmt: string; topic: string; flag?: "AE" | "GB" | "US" | "PK" | "ID" | "MY"; tag?: string;
};

const STAGES: ReadonlyArray<Stage> = [
  // ★ Durshal is DOCUMENTED, and precisely: Monday 6 August 2018, 5pm to 7pm, at
  // Durshal Peshawar. A 2 hour workshop on Personal Branding. Source is the
  // organiser's own announcement, posted by Durshal on Facebook on 2 August 2018,
  // archived at public/assets/speaking/Durshal 2018/. Durshal+ is a Community
  // Innovation Lab and a project of KPITB, the Khyber Pakhtunkhwa Information
  // Technology Board, Government of Khyber Pakhtunkhwa.
  //
  // ⚠ Irfan first recalled this as April 2018. The organiser card says 6 August.
  // The card wins. The same post carries a public attendee comment from Harroon
  // Rashid, "It was a wonderful session dear sir irfan", if a testimonial is ever
  // wanted.
  // ★ MaGIC is 2019. Confirmed by Irfan 2026-07-31, corroborated by MaGIC's own event
  // card in the SIA archive ("Magic_Changes.jpg"), which is MaGIC-branded and
  // reads "Empowering Data, Personal Branding, & Fintech Trends 2019 · 26
  // February 2019 · Coworking Space, MaGIC Cyberjaya", co-branded SIA Media,
  // ipay88 and WEBQLO. Every surrounding asset in that folder is dated Feb 2019.
  // The stale 2016 lived in THREE files: here, app/gallery/GalleryClient.tsx and
  // components/bureau/CredentialRows.tsx. Change them together or the site
  // contradicts itself.
  { yr: "2019",    evt: "MaGIC",                       city: "Cyberjaya", country: "Malaysia",  fmt: "Workshop",      topic: "Digital marketing for entrepreneurs",                            flag: "MY" },
  { yr: "2018",    evt: "IN5 Innovation Hub",          city: "Dubai",     country: "UAE",       fmt: "Workshop",      topic: "Media Hacks · Free Publicity",                                   flag: "AE" },
  { yr: "2018",    evt: "Durshal",                     city: "Peshawar",  country: "Pakistan",  fmt: "Workshop",      topic: "Personal Branding",                                              flag: "PK" },
  { yr: "2018",    evt: "Arabian Travel Market (ATM)", city: "Dubai",     country: "UAE",       fmt: "Panel",         topic: "Marketing to the Modern Muslim Traveller (~500 audience)",       flag: "AE", tag: "Biggest" },
  { yr: "2018",    evt: "IDM Pakistan",                city: "Online",    country: "Pakistan",  fmt: "Course",        topic: "Inbound Marketing Curriculum · 5 sessions · 10 hrs · In Urdu",   flag: "PK" },
  // ★ IMSciences 2018. The year is when Abdul Ghaffar posted his LinkedIn
  // testimonial, per Irfan 2026-07-31, not a record of the lecture date. His quote
  // opens "Recently, Irfan came and delivered a guest lecture on entrepreneurship to
  // my MBA students", so the two are close, but they are not the same thing. The
  // topic and audience come straight from that testimonial, which is published in
  // the What Hosts Say section of this very page: rare among these rows, the proof
  // sits on the same screen as the claim.
  { yr: "2018",    evt: "IMSciences",                  city: "Peshawar",  country: "Pakistan",  fmt: "Guest lecture", topic: "Entrepreneurship, for MBA students",                             flag: "PK" },
  { yr: "2017",    evt: "DMSS Conference",             city: "Bali",      country: "Indonesia", fmt: "Workshop",      topic: "Media Hacks (~200 audience)",                                    flag: "ID" },
  // ★ DYS 2017 is verified from the strongest possible source: the World Bank's own
  // site. Irfan's post "Why an introvert like me looks forward to attending the
  // digital youth summit?" ran on blogs.worldbank.org on 26 April 2017 and says he
  // was conducting a workshop on Personal Branding in a Digital Era at DYS 2017 in
  // Peshawar. Year, city, format and topic all come from that one primary source.
  // NOTE: the World Bank BACKED this summit. It did not host Irfan. Do not upgrade
  // this row, or any copy elsewhere, into a World Bank speaking credit.
  { yr: "2017",    evt: "Digital Youth Summit (DYS)",  city: "Peshawar",  country: "Pakistan",  fmt: "Workshop",      topic: "Personal Branding in a Digital Era",                             flag: "PK" },
  // Sourced from NIC Pakistan's own Facebook post about the session, which is
  // where both the topic and the format come from: "Content Marketing and PR
  // Consultant sharing his views on Inbound Marketing with the startups at NIC".
  { yr: "2017",    evt: "National Incubation Center",  city: "Islamabad", country: "Pakistan",  fmt: "Talk",          topic: "Inbound marketing, for startups at NIC",                         flag: "PK" },
  { yr: "2016",    evt: "MPS2016 · M Powered Summit",  city: "Dubai",     country: "UAE",       fmt: "Talk",          topic: "Digital marketing keynote",                                      flag: "AE" },
  // ★ Empower Pakistan 2016 and GBG Peshawar 2016, both added 2026-07-31 from Irfan.
  //
  // Empower Pakistan is the ONLY event behind every World Bank speaking claim this
  // site has ever made. The photo at /assets/gallery/empower-pakistan.jpg carries a
  // branded Empower Pakistan banner AND a World Bank Group watermark, which is why
  // the topic may say "World Bank Group backed". It does NOT mean the World Bank
  // hosted him. Four pages used to imply that and were corrected on 2026-07-31.
  // Leave the watermark on that photo; it is the organiser's credit, not ours.
  //
  // Empower Pakistan topic confirmed by Irfan 2026-07-31: youth entrepreneurship.
  // Worth remembering how this one went, because it is the pattern to repeat: the
  // first draft of this topic was INFERRED from the organiser mission statement on
  // the banner in the photo. That is a guess wearing a fact's clothing. It was
  // replaced with a placeholder until Irfan confirmed. Never infer a talk subject
  // from a venue, a sponsor, or an organiser's tagline.
  //
  // GBG was May 2016. The table only carries years, so the month lives here. Topic
  // is condensed from Irfan's original agenda: what growth hacking is, three company
  // case studies, how a strong personal brand attracts inbound opportunity, and his
  // five step process (social media, writing, TV and radio and podcast, video,
  // public speaking), plus an interactive activity and a 45 minute Q&A.
  { yr: "2016",    evt: "Empower Pakistan",            city: "Peshawar",  country: "Pakistan",  fmt: "Talk",          topic: "Youth entrepreneurship, at a World Bank Group backed programme", flag: "PK" },
  // ★ GBG year and topic are SOURCED, 2026-08-04, from Irfan's own outbound
  // email thread with the organiser (Maryam, the same Maryam Arshad Mahmood who
  // organised IYDC). 18 May 2016: he sends the workshop outline. 27 May 2016: he
  // sends the deck. A 3 hour GBG workshop on growth hacking, whose personal
  // branding section was a FIVE STEP PROCESS by channel (social media, writing,
  // TV/radio/podcast, video, public speaking). That is NOT the five pillars
  // framework he uses today (clarity, consistency, content, community,
  // credibility), and the old topic string here silently retro-fitted the modern
  // one onto a nine year old room. Do not undo this.
  { yr: "2016",    evt: "Google Business Group (GBG)", city: "Peshawar",  country: "Pakistan",  fmt: "Workshop",      topic: "Growth Hacking: a five step process for building a personal brand · 3 hrs",       flag: "PK" },
  { yr: "2016",    evt: "AstroLabs",                   city: "Dubai",     country: "UAE",       fmt: "Talk",          topic: "Growth Hacking Your Brand to Success",                           flag: "AE" },
  { yr: "2016",    evt: "IK Institute of Business",    city: "Dubai",     country: "UAE",       fmt: "Workshop",      topic: "Co-trainer with Irfan Khairi",                                   flag: "AE" },
  { yr: "2015",    evt: "IYDC",                        city: "Peshawar",  country: "Pakistan",  fmt: "Panel",         topic: "Social Media · panel discussion",                                flag: "PK" },
  { yr: "2014",    evt: "G-Day X",                     city: "Peshawar",  country: "Pakistan",  fmt: "Keynote",       topic: "Digital marketing & entrepreneurship",                           flag: "PK" },
  { yr: "2014",    evt: "University of Peshawar",      city: "Peshawar",  country: "Pakistan",  fmt: "Talk",          topic: "Student talk",                                                   flag: "PK" },
  // ★ NUST 2013: year and format are Irfan's, given 2026-07-31. The TOPIC is his
  // best recollection ("probably something around entrepreneurship"), not a record.
  // Low risk because the topic field is soft, but do not harden this into a talk
  // title or quote it back as though it were documented.
  { yr: "2013",    evt: "NUST Islamabad",              city: "Islamabad", country: "Pakistan",  fmt: "Guest lecture", topic: "Entrepreneurship",                                               flag: "PK" },
  { yr: "On call", evt: "Uhubs (SaaS)",                city: "Remote",    country: "UK",        fmt: "Workshop",      topic: "Internal SEO-PR training",                                       flag: "GB" },
  { yr: "On call", evt: "Ruth King's Business Radio",  city: "Atlanta",   country: "USA",       fmt: "Radio",         topic: "Guest interview",                                                flag: "US" },
];

type Format = { name: string; dur: string; note: string };
const FORMATS: ReadonlyArray<Format> = [
  { name: "Keynote",       dur: "20–45 min",   note: "Opening or closing keynote · single-track conferences, summits, internal kickoffs."                    },
  { name: "Workshop",      dur: "Half / full", note: "Hands-on training for marketing and growth teams. Cohorts of 8 to 50, with worksheets."               },
  { name: "Panel",         dur: "45–60 min",   note: "Moderated panel or co-panelist. Best paired with one of the signature topics."                        },
  { name: "Webinar",       dur: "45–60 min",   note: "Virtual delivery with live Q&A. Recording rights negotiable."                                         },
  { name: "Podcast guest", dur: "45–90 min",   note: "Long-form conversation. Bring research notes; the better the prep, the better the episode."          },
  { name: "Radio · video", dur: "On request",  note: "Business radio, video interviews, fireside chats. Examples: Ruth King's Business Radio Show."        },
];

type HostQuote = { quote: string; name: string; role: string; place: string; photo: string; stat?: string };
// ★ VERBATIM ONLY. Every quote below is reproduced word for word from the public
// LinkedIn recommendation it came from. An ellipsis marks a trim; nothing else is
// changed. Do not tidy the grammar, do not re-punctuate, do not condense two
// paragraphs into one sentence, and do not remove a dash to satisfy house style.
// House style governs our copy, never someone else's words.
//
// These four previously carried lightly rewritten versions of the same
// recommendations. Restored from the source screenshots 2026-07-30.
//
// `role` is the person's own LinkedIn headline, trimmed. Do NOT upgrade an
// attendee to an "Organizer": Brie Moreau writes "our conference", which
// establishes affiliation with DMSS but not the organiser title the previous
// copy asserted. Same for `place`, which is only set where the person states it.
const HOST_QUOTES: ReadonlyArray<HostQuote> = [
  {
    quote: "The audience enjoyed his super practical session and approach to helping them understand how to grow an audience online and traffic to websites using various smart methods and enjoyed his friendly and positive presentation style, clear slides and concise answers to many questions he received.",
    name: "Ash Ali",
    role: "Co-Founder, Uhubs · Author, The Unfair Advantage (150k+ copies)",
    place: "Uhubs workshop",
    photo: "/assets/testimonials/ash-ali.jpg",
  },
  {
    quote: "Being a great speaker takes one part art, one part science, a whole lot of experience, an understanding of how to lead a potential customer through storytelling, emotional intelligence, and personal clarity. Irfan delivers on all of this and more. … If you are looking for a dynamic global speaker, reach out to Irfan. He will turn possibilities into realities.",
    name: "Chuck Wang",
    role: "Strategic Operations & Governance Executive · Former Founder/CEO",
    place: "",
    photo: "/assets/testimonials/chuck-wang.jpg",
  },
  {
    quote: "Syed spoke at our conference www.dmss.io … He is an excellent public speaker … He comes highly recommended!!",
    name: "Brie Moreau",
    role: "AI SEO researcher",
    place: "DMSS, Bali",
    photo: "/assets/testimonials/brie-moreau.jpg",
  },
  {
    quote: "Syed Irfan spoke at our event the M Powered Summit in Dubai on Personal Branding. Based on the feedback we got from the audience, it was a highly informative talk and everyone benefitted from it. We are glad to have him as a speaker and we highly recommend him. …",
    name: "Abd Elmohaimen Mansi",
    role: "Co-founder · Travel & Mobility as a Service",
    place: "M Powered Summit, Dubai",
    photo: "/assets/testimonials/abd-elmohaimen-mansi.jpg",
  },
  {
    quote: "Irfan's talk on How to Get Published in Large Publications at Muslim Marketing Summit was insightful. It was based on the core idea of building authentic trustworthy relationship with media. I highly recommend Irfan for Media & PR related solutions.",
    name: "Shereen Pasha",
    role: "Launch Strategist · Course Launch & Business Management Expert",
    place: "Muslim Marketing Summit · online",
    photo: "/assets/testimonials/shereen-pasha.jpg",
  },
  {
    quote: "Recently, Irfan came and delivered a guest lecture on entrepreneurship to my MBA students at IMSciences (a prestigious business school, which ranks 4th in Pakistan at this time). Students' feedback for his lecture were, “Outstanding!”, “Highly recommended for future guest lectures!” and the likes.",
    name: "Abdul Ghaffar",
    role: "Lecturer · Entrepreneurship · Strategic Management · Economics",
    place: "IMSciences, Peshawar",
    photo: "/assets/testimonials/abdul-ghaffar.jpg",
  },
  {
    quote: "My first introduction to Syed was when I caught his talk on HOW TO GET PUBLISHED IN MAJOR PUBLICATIONS. In just 15 min, he gave practical, easy to follow advice that I will definitely be implementing!",
    name: "Zarinah El-Amin",
    role: "Founder, Legacy Storykeepers · Author · 2x TEDx Speaker · Knight Foundation Awardee",
    place: "Muslim Marketing Summit · online",
    photo: "/assets/testimonials/zarinah-el-amin.jpg",
  },
  {
    quote: "… it was a pleasure calling Irfan as a distinguished guest speaker for IYDC2015 (Iqra Youth Development Conference) which featured more than 40 international and local speakers in Peshawar. … His friendly nature and humble personality make attendees interact with him a lot more easily (in comparison to other speakers).",
    name: "Maryam Arshad Mahmood",
    role: "Growth and Market Strategy leader · Partnerships @ Google",
    place: "IYDC 2015, Peshawar",
    photo: "/assets/testimonials/maryam-arshad-mahmood.jpg",
  },
];

type Step = { no: string; t: string; d: string };
const STEPS: ReadonlyArray<Step> = [
  { no: "01", t: "Send the brief",            d: "Drop a note with the event, audience, date, and the metric you want moved. Anything you can share helps." },
  { no: "02", t: "I respond in 1 working day", d: "With topic options matched to your audience, dates that work, and terms. No pressure, no salesy follow-up." },
  { no: "03", t: "Pre-talk research call",    d: "30 minutes with you (and ideally a stakeholder) to make the talk specific to your room — not a generic deck." },
  { no: "04", t: "Deliver, on time",          d: "Show up early, run AV checks, deliver the talk, stay for Q&A, and follow up with a written recap if useful." },
];

const FEATURED_KEYS = ["nta", "ridester", "centriq", "curednation", "alrug"];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section style={{ background: PAPER }}>
    <div className="sx" style={{ background: PAPER }}>
      <div className="res-hero-grid">

        {/* Left: count */}
        <div className="res-hero-left">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
            04
          </div>
          <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
            Countries<br />on stage
          </div>
        </div>

        {/* Centre: headline */}
        <div className="res-hero-center">
          <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
            SPEAKING
          </div>
          <SCaps size={10} ls="0.24em" color={INK55}>
            Keynotes &nbsp;·&nbsp; Workshops &nbsp;·&nbsp; Panels &nbsp;·&nbsp; 2026 bookings open
          </SCaps>
          <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
            Talks that move<br />
            <em style={{ fontStyle: "italic", fontWeight: 600 }}>a metric.</em>
          </h1>
          <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
            Business-savvy, case-study-led, with the receipts. Available in person and virtually worldwide.
          </p>
        </div>

        {/* Right: topic index */}
        <div className="res-hero-right">
          {[
            { label: "Digital PR",        sub: "Most-requested topic" },
            { label: "Personal Branding", sub: "Authority & visibility" },
            { label: "SEO & GEO",         sub: "Organic growth systems" },
          ].map(t => (
            <div key={t.label}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>{t.label}</div>
              <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>{t.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  </section>
);

// ─── Speaking Lead + Booking (merged) ─────────────────────────────────────────

const SpeakingLead = () => (
  <section className="sx" style={{ paddingTop: 36, paddingBottom: 40 }}>
    <DoubleRule style={{ margin: "0 0 24px" }} />

    <div className="grid-hero-2col" style={{ alignItems: "stretch" }}>
      {/* Left — lead copy + inline stats */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: SERIF, fontSize: "clamp(20px, 2.5vw, 26px)", color: INK, lineHeight: 1.45 }}>
          <p style={{ margin: 0 }}>
            On stage since 2013, talking <strong>earned media</strong> and{" "}
            <strong>SEO-PR</strong>. Past stages include the Arabian Travel Market (Dubai),
            DMSS (Bali, ~200 audience), IN5, AstroLabs, and MaGIC (Malaysia) — plus
            webinar &amp; podcast circuits across North America and the UK.
          </p>
          <p style={{ marginTop: "0.6em", fontStyle: "italic", color: INK70 }}>
            Case-study-led, with the receipts. In person across Asia, MENA, Europe and
            North America; virtually worldwide. Booking open Q3–Q4 2026.
          </p>
        </div>

        {/* Compact stat row */}
        <div className="grid-stats" style={{ marginTop: 20, gap: 8, borderTop: `2px solid ${INK}`, paddingTop: 16 }}>
          {STATS.map(([n, l]) => (
            <div key={n} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 3vw, 36px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>{n}</div>
              <div style={{ marginTop: 5 }}><SCaps size={9.5} ls="0.12em" color={INK70}>{l}</SCaps></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — booking card */}
      <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Pill size={10} ls="0.18em">Booking Desk</Pill>
        </div>
        <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 20, lineHeight: 1.25, color: INK, fontWeight: 700 }}>Hire the speaker.</div>
        <div style={{ marginTop: 4, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, lineHeight: 1.45 }}>
          Send the event, audience, and the metric you want moved. Response within one working day.
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px" }}>
          {BOOKING_SPECS.map(([k, v]) => (
            <Fragment key={k}>
              <div><SCaps size={9.5} ls="0.14em" color={INK55}>{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.35 }}>{v}</div>
            </Fragment>
          ))}
        </div>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16, display: "block", textAlign: "center", padding: "12px 16px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Inquire about booking →</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ marginTop: 8, display: "block", textAlign: "center", padding: "12px 16px", background: YEL, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Speaker one-sheet ↓</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-Media-Kit-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ marginTop: 8, display: "block", textAlign: "center", padding: "12px 16px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Full media kit ↓</a>
        <a href="/press-kit" style={{ marginTop: 8, display: "block", textAlign: "center", padding: "12px 16px", background: YEL, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>View the full press kit →</a>
      </aside>
    </div>
  </section>
);

// ─── §01 · Watch the Work ─────────────────────────────────────────────────────

const WatchTheWork = () => {
  const [active, setActive] = useState(0);
  const v = REELS[active];
  return (
    <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 70, paddingBottom: 90, position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: -40, right: -60, opacity: 0.06, pointerEvents: "none" }}>
        <SiaLogo height={320} />
      </div>

      <SectionMast n="01" label="See how it actually sounds · Watch the work" dark />

      <div className="grid-watch">
        {/* Left — reel list */}
        <div>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 50px)", color: PAPER, lineHeight: 1.0, letterSpacing: "-0.025em" }}>
            Six reels<br />
            <span style={{ fontStyle: "italic", color: YEL }}>from the road.</span>
          </h2>
          <p style={{ marginTop: 16, fontFamily: SERIF, fontSize: 15.5, color: "rgba(250,250,250,.7)", lineHeight: 1.5, maxWidth: 360 }}>
            Click any reel to play. Four cities, three formats, one consistent point: earned media beats almost anything you can buy.
          </p>

          <div style={{ marginTop: 22, maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(250,250,250,.18)", padding: 10 }}>
            {REELS.map((r, i) => {
              const isActive = i === active;
              return (
                <button key={r.id} onClick={() => setActive(i)} style={{
                  display: "grid", gridTemplateColumns: "90px 1fr",
                  gap: 12, padding: 10, textAlign: "left",
                  background: isActive ? "rgba(245,184,31,.14)" : "transparent",
                  border: `1px solid ${isActive ? YEL : "rgba(250,250,250,.18)"}`,
                  cursor: "pointer", color: PAPER, font: "inherit",
                }}>
                  <div style={{ width: 90, height: 56, background: "#000", position: "relative", overflow: "hidden", border: "1px solid rgba(250,250,250,.22)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {isActive && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(245,184,31,.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 0, height: 0, borderLeft: `12px solid ${YEL}`, borderTop: "8px solid transparent", borderBottom: "8px solid transparent" }} />
                      </div>
                    )}
                    {r.badge && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: YEL, color: INK, padding: "2px 6px", fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {r.badge}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: PAPER }}>{r.title}</div>
                    <div style={{ marginTop: 5 }}><SCaps size={9.5} ls="0.16em" color={YEL}>{r.city}, {r.region}</SCaps></div>
                    <div style={{ marginTop: 2 }}><SCaps size={9} ls="0.10em" color="rgba(250,250,250,.55)">{r.venue}</SCaps></div>
                  </div>
                </button>
              );
            })}
          </div>

          <a href="/gallery" style={{
            marginTop: 18, display: "inline-flex", alignItems: "center", gap: 10,
            padding: "12px 18px", background: "transparent", color: PAPER,
            textDecoration: "none", fontFamily: GROT, fontWeight: 700,
            fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase",
            border: `1px solid ${PAPER}`,
          }}>Full gallery & playlist ↗</a>
        </div>

        {/* Right — main player */}
        <div>
          <div style={{ background: "#000", border: "1px solid rgba(250,250,250,.25)", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 4px 12px", borderBottom: "1px solid rgba(250,250,250,.25)", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: YEL }} />
                <SCaps size={10} ls="0.18em" color="rgba(250,250,250,.85)">
                  Now playing · Reel № {String(active + 1).padStart(2, "0")}
                </SCaps>
              </div>
              <SCaps size={10} ls="0.18em" color="rgba(250,250,250,.55)">{v.city}, {v.region}</SCaps>
            </div>
            <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(250,250,250,.25)", overflow: "hidden" }}>
              <iframe
                key={v.id}
                src={`https://www.youtube.com/embed/${v.id}?rel=0${v.startAt ? `&start=${v.startAt}` : ""}`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              />
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(250,250,250,.25)" }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 22px)", color: PAPER, lineHeight: 1.2 }}>{v.title}</div>
              <div style={{ marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(250,250,250,.75)", lineHeight: 1.4 }}>
                {v.venue} · {v.city}, {v.region} · {v.note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── §02 · Signature Topics ───────────────────────────────────────────────────

const Topics = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="02" label="Signature Topics · The six talks" />

    <div className="grid-intro">
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Three talks I can give<br />
        <span style={{ fontStyle: "italic" }}><Mark>in my sleep.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Twenty-two years of work has settled into three flagship talks and a handful of close cousins, each built around real case studies and a take-home playbook. The newest one is built from live data inside the earned media OS I run, and maps how AI is remaking earned media from both sides.
      </p>
    </div>

    {/* Primary topics — 2-col centered */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, maxWidth: 960, margin: "0 auto 24px" }} className="speaking-topics-2col">
      {PRIMARY_TOPICS.map((tp) => (
        <div key={tp.title} className="letter-card" style={{
          padding: "36px 28px 30px",
          background: PAPER2,
          borderTop: tp.moreHref ? `4px solid ${YEL}` : undefined,
          display: "flex", flexDirection: "column",
          gridColumn: tp.moreHref ? "1 / -1" : undefined,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <Pill size={10.5} ls="0.20em">Topic {tp.no}</Pill>
            <SCaps size={10.5} ls="0.18em" color={INK55}>{tp.label}</SCaps>
          </div>
          <h3 style={{ margin: "18px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 38px)", color: INK, lineHeight: 1.05, letterSpacing: "-0.018em" }}>{tp.title}</h3>
          <HRule style={{ margin: "18px 0" }} />
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17, color: INK, lineHeight: 1.55, textAlign: "justify" }}>{tp.blurb}</p>
          <div style={{ marginTop: 22 }}>
            <SCaps size={10.5} ls="0.18em" color={INK55}>What the audience leaves with</SCaps>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.5 }}>
              {tp.bullets.map((b, j) => (
                <li key={j} style={{ padding: "6px 0 6px 24px", position: "relative", borderBottom: j < tp.bullets.length - 1 ? `1px solid ${INK15}` : "none" }}>
                  <span style={{ position: "absolute", left: 0, top: 6, fontFamily: GROT, fontSize: 10, fontWeight: 800, color: INK, letterSpacing: "0.06em" }}>0{j + 1}.</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, borderTop: `2px solid ${INK}`, flexWrap: "wrap", gap: 12 }}>
            <div>
              <SCaps size={10} ls="0.14em" color={INK55}>Headline number</SCaps>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 4vw, 38px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 4 }}>{tp.casestudy.v}</div>
              <div style={{ marginTop: 4 }}><SCaps size={10} ls="0.12em" color={INK70}>{tp.casestudy.l}</SCaps></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {tp.moreHref && (
                <a href={tp.moreHref} style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `1px solid ${INK}`, paddingBottom: 2 }}>
                  See the full session →
                </a>
              )}
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK, textDecoration: "none", fontWeight: 600 }}>
                <Mark>Book this talk →</Mark>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Supporting topics */}
    <div style={{ marginTop: 36, marginBottom: 12 }}>
      <SCaps size={11} ls="0.20em" color={INK70}>And three more in regular rotation</SCaps>
    </div>
    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {SUPPORTING_TOPICS.map((s, i) => (
        <div key={s.title} className="card-border" style={{ padding: "26px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 200 }}>
          <SCaps size={10} ls="0.18em" color={INK55}>Topic 0{i + 4}</SCaps>
          <h4 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{s.title}</h4>
          <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{s.blurb}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── MPS Photo Strip ──────────────────────────────────────────────────────────

const MPSStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 70, paddingBottom: 30 }}>
    <figure style={{ margin: 0, padding: 12, background: "#0e0d0a", border: `1px solid ${INK}` }}>
      <div className="grid-mps-2">
        {/* Left: Irfan on stage — left half of banner */}
        <div
          style={{
            height: "clamp(240px, 38vw, 440px)",
            backgroundImage: "url('/assets/gallery/mps-banner.jpg')",
            backgroundSize: "200% auto",
            backgroundPosition: "left center",
            border: "1px solid rgba(250,250,250,.25)",
          }}
          role="img"
          aria-label="Syed Irfan Ajmal on stage at MPS2016, Dubai"
        />
        {/* Right: audience — standalone photo */}
        <div
          style={{
            height: "clamp(240px, 38vw, 440px)",
            backgroundImage: "url('/assets/gallery/mps-audience.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            border: "1px solid rgba(250,250,250,.25)",
          }}
          role="img"
          aria-label="MPS2016 audience, Dubai"
        />
      </div>
      <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#FAFAFA", lineHeight: 1.4 }}>
          MPS2016, Dubai · &ldquo;How Startup Founders Can Use Personal Branding to Attract the Right Opportunities.&rdquo;
        </div>
        <SCaps size={10} ls="0.16em" color="rgba(250,250,250,.55)">Photo by hafeezsaeed.com</SCaps>
      </figcaption>
    </figure>
  </section>
);

// ─── §03 · Past Stages ────────────────────────────────────────────────────────

const Stages = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="03" label="Past Stages · A partial inventory" />
    <div className="grid-intro">
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Where the talks<br /><span style={{ fontStyle: "italic" }}><Mark>have travelled.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Four countries on stage, more on the webinar and podcast circuit. Below is the inventory, by format, with a short note on the talk.
      </p>
    </div>
    <ol style={{ margin: 0, padding: 0, listStyle: "none", borderTop: `2px solid ${INK}` }}>
      {STAGES.map((s, i) => (
        <li key={i} className="stages-table-row">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 22px)", color: INK, lineHeight: 1, letterSpacing: "-0.01em" }}>{s.yr}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(14px, 2vw, 20px)", color: INK, lineHeight: 1.25 }}>
            {s.evt}
            {s.tag && <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}><Pill size={9} ls="0.14em">{s.tag}</Pill></span>}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }} className="stages-col-hide">{s.city}, {s.country}</div>
          <div className="stages-col-hide"><SCaps size={10} ls="0.14em" color={INK55}>{s.fmt}</SCaps></div>
          <div className="stages-col-hide" style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "baseline" }}>
            {s.flag && <Flag c={s.flag} w={22} />}
          </div>
          <div className="stages-topic" style={{ fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.4 }}>{s.topic}</div>
        </li>
      ))}
    </ol>
  </section>
);

// ─── The rooms · photo band under the stages table ────────────────────────────
// The stages table is the strongest content on this page and had no pictures at
// all. One frame per venue, so the inventory has evidence sitting under it.
//
// Caption rule: every venue below is corroborated by the STAGES inventory above
// and, for MPS and AstroLabs, by branding visible in the frames from the same
// shoot. The Startup Grind frame carries its own proof: the screen behind him
// reads "Startup Grind, Powered by Google for Entrepreneurs, PESHAWAR".
//
// ★ NIC Islamabad = the National Incubation Center, confirmed 2026-07-31. The
// frame itself carries no branding (the wall text is a generic quote), so the
// venue, the year and the session topic all come from NIC Pakistan's own
// Facebook post about the session rather than from the picture.
//
// ★ Do NOT date these files from their Facebook IDs. The source filenames are
// 466xxxxxxx_… exports, an ID range that corresponds to a late-2024 UPLOAD, and
// reading that as the event date puts the room seven years wrong. It is a 2017
// event re-uploaded later. Facebook IDs date the upload, never the photograph.
//
// Bali is deliberately absent: DMSSStrip already carries a DMSS photograph
// higher up this same page, and running it twice would read as padding.
//
// ★ MaGIC (Cyberjaya) added 2026-07-31. It is the first Malaysian room on the
// site; before this, Malaysia appeared in no photo strip anywhere. The frame
// carries its own proof: the roll-up banner beside him reads "MaGIC, Malaysian
// Global Innovation & Creativity Centre, Building Great Entrepreneurs,
// www.mymagic.my, #MAGICCYBERJAYA". That hashtag is the reason the caption is
// allowed to name Cyberjaya rather than just Malaysia.
//
// ★ MaGIC year RESOLVED 2026-07-31: it is 2019. Irfan confirmed, and it matches
// MaGIC's own event card dated 26 February 2019 at MaGIC Cyberjaya. The source
// video is titled "@ Malaysia [2018]", which is simply mislabelled. 2016, which
// this site carried for a long time, was impossible: the deck contains an Elon
// Musk tweet dated 6 February 2018.
//
// ★ Provenance: magic-malaysia-1 through -4 are frames pulled from the
// workshop video, not photographs shot in the room. They are unretouched and
// not upscaled: 1280x720 out of a 1280x720 source. Alternates -2, -3 and -4
// are in the gallery folder if this one ever needs swapping.
//
// ★ atm-dubai-crowd (2026-07-31) is a SECOND ATM image and does NOT replace
// atm-dubai-panel.jpg, which stays on the Panel card in FORMAT_PROOF. They do
// different jobs: the panel photo proves the format, this one proves the room.
// The year is on this caption because the frame earns it. The stage branding
// behind the panel reads "arabian travel market, DUBAI, Sun 22 to Wed 25 April
// 2018". Deliberately NO headcount: you cannot count a hall from one camera.
//
// ★ durshal-peshawar-1 (2026-07-31) closes the last gap in this band. The frame
// itself carries NO venue branding, and there is none anywhere in 78 minutes of
// footage. The caption can still name the venue AND the year, because the
// organiser documented the event: Durshal's own Facebook announcement, 6 August
// 2018 at Durshal Peshawar, archived under public/assets/speaking/Durshal 2018/.
// Evidence outside the frame counts, it just has to actually exist. Alternates
// -2, -3 and -4 are in the gallery folder; -4 shows him, not the audience.
const ROOMS: ReadonlyArray<{ src: string; alt: string; cap: string }> = [
  {
    src: "/assets/gallery/atm-dubai-crowd.jpg",
    alt: "A full audience seated in front of the main stage panel at Arabian Travel Market in Dubai, with the event branding on the screens behind the panellists",
    cap: "Arabian Travel Market, Dubai · 2018",
  },
  {
    src: "/assets/gallery/mps-emirati.jpg",
    alt: "Audience members raising hands to ask a question during Syed Irfan Ajmal's talk at MPS2016 in Dubai",
    cap: "MPS2016, Dubai",
  },
  {
    src: "/assets/gallery/astrolabs-3.jpg",
    alt: "A full room of attendees during a Syed Irfan Ajmal session at AstroLabs in Dubai",
    cap: "AstroLabs, Dubai",
  },
  {
    src: "/assets/gallery/in5-dubai.jpg",
    alt: "Syed Irfan Ajmal presenting to a seated audience at IN5 Innovation Hub in Dubai",
    cap: "IN5 Innovation Hub, Dubai",
  },
  {
    src: "/assets/gallery/magic-malaysia-1.jpg",
    alt: "Syed Irfan Ajmal speaking with a handheld microphone beside a MaGIC roll-up banner reading Building Great Entrepreneurs, at MaGIC in Cyberjaya",
    cap: "MaGIC, Cyberjaya · 2019",
  },
  {
    src: "/assets/speaking/startup-grind.jpg",
    alt: "Syed Irfan Ajmal in a fireside chat with a microphone, in front of a Startup Grind Powered by Google for Entrepreneurs screen in Peshawar",
    cap: "Startup Grind, Peshawar",
  },
  {
    src: "/assets/speaking/nic-islamabad.jpg",
    alt: "Syed Irfan Ajmal presenting with a microphone to attendees seated at tables at NIC Islamabad",
    cap: "NIC Islamabad · 2017",
  },
  {
    src: "/assets/gallery/durshal-peshawar-1.jpg",
    alt: "Attendees seated closely together and listening during a Syed Irfan Ajmal personal branding workshop at Durshal in Peshawar",
    cap: "Durshal, Peshawar · 2018",
  },
];

const RoomBand = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 84 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
      <SCaps size={11} ls="0.20em" color={INK55}>The rooms themselves</SCaps>
      <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
      <a href="/gallery" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "underline", textUnderlineOffset: 3 }}>
        See the full gallery &rarr;
      </a>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {ROOMS.map((r) => (
        <figure key={r.src} style={{ margin: 0, flex: "1 1 220px", minWidth: 200, background: INK, border: `1px solid ${INK}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.src}
            alt={r.alt}
            loading="lazy"
            style={{ width: "100%", aspectRatio: "4 / 3", display: "block", objectFit: "cover" }}
          />
          <figcaption style={{ padding: "9px 12px 11px" }}>
            <SCaps size={9.5} ls="0.14em" color="rgba(250,250,250,.62)">{r.cap}</SCaps>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);

// ─── Client Strip ─────────────────────────────────────────────────────────────

const ClientStripSpeaking = () => {
  const pre = CLIENTS_PRE;
  const featured = CLIENTS_TIER1.filter((c) => FEATURED_KEYS.includes(c.key));
  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 30, paddingBottom: 56 }}>
      <DoubleRule />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 0 10px", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <Pill size={11} ls="0.22em">From the consulting roster →</Pill>
          <SCaps size={11} ls="0.22em" color={INK70}>The same companies trust my work when they hire me as speaker</SCaps>
        </div>
        <a href="/clients" style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `1px solid ${INK}`, paddingBottom: 2 }}>
          The full roster →
        </a>
      </div>
      <div className="grid-clients" style={{ marginTop: 6 }}>
        {pre.map((c, i) => (
          <div key={c.key} className="client-cell" style={{ padding: "20px 16px", background: PAPER2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 100 }}>
            <ClientLogo client={c} height={48} maxWidth={180} />
            <div style={{ fontFamily: GROT, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>
              {c.countryLabel ? c.countryLabel.split("·")[0].trim() : ""}
            </div>
          </div>
        ))}
        <div className="client-divider" style={{ background: INK }} />
        {featured.map((c, i) => (
          <div key={c.key} className="client-cell" style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
            <ClientLogo client={c} height={42} maxWidth={140} />
          </div>
        ))}
      </div>
      <p style={{ margin: "14px auto 0", textAlign: "center", maxWidth: 760, fontFamily: "inherit", fontStyle: "italic", fontSize: 16, color: INK70, lineHeight: 1.5 }}>
        Booking a speaker is a low-stakes way to evaluate whether the bureau&rsquo;s approach fits your company.
      </p>
    </section>
  );
};

// ─── §04 · Available Formats ──────────────────────────────────────────────────

// Proof thumbnails, keyed by format name. Only the two formats where a
// photograph proves the exact claim get one: the Past Stages inventory records
// IK Institute of Business as a Workshop and Arabian Travel Market as a Panel,
// and both frames show that format actually running.
//
// The other four are left clean on purpose. There is no photograph of a webinar,
// a podcast recording or a radio spot in the library, and a decorative stand-in
// next to a format claim would prove nothing. Add one here the day a real frame
// exists, not before.
const FORMAT_PROOF: Record<string, { src: string; alt: string }> = {
  Workshop: {
    src: "/assets/gallery/ik-workshop.jpg",
    alt: "Workshop attendees seated at tables at IK Institute of Business in Dubai",
  },
  Panel: {
    src: "/assets/gallery/atm-dubai-panel.jpg",
    alt: "Syed Irfan Ajmal on a panel on the main stage at Arabian Travel Market in Dubai",
  },
};

const Formats = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
    <SectionMast n="04" label="Available Formats · Six ways to host" />
    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {FORMATS.map((f, i) => {
        const proof = FORMAT_PROOF[f.name];
        return (
        <div key={f.name} className="card-border" style={{ padding: "26px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 170 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              {proof ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proof.src}
                    alt={proof.alt}
                    loading="lazy"
                    style={{ width: 52, height: 52, objectFit: "cover", flexShrink: 0, border: `1px solid ${INK}` }}
                  />
                </>
              ) : null}
              <SCaps size={10} ls="0.18em" color={INK55}>0{i + 1}</SCaps>
            </div>
            <SCaps size={10} ls="0.14em" color={INK70}>{f.dur}</SCaps>
          </div>
          <h4 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 3vw, 26px)", color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>{f.name}</h4>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 14.5, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{f.note}</p>
        </div>
        );
      })}
    </div>
  </section>
);

// ─── On camera and online ─────────────────────────────────────────────────────
// Kept as its own strip rather than folded into the Available Formats cards
// above, and the labelling matters: these are on-camera and online work, NOT
// speaking credits. A webinar title card and a podcast frame do not prove a
// stage, and captioning them as though they did would be the exact overclaim the
// project rules exist to prevent. "On the SIA Business podcast" is true; anything
// implying a room is not.
//
// They also could not live in the 52px proof thumbnails on the format cards:
// a title card and a two-person video call are illegible at that size, so they
// get a real figure each instead.
const ON_CAMERA: ReadonlyArray<{ src: string; alt: string; title: string; cap: string; pos: string }> = [
  {
    src: "/assets/speaking/semrush-webinar.jpg",
    pos: "center center",
    alt: "Title slide of the SEMrush webinar hosted by Syed Irfan Ajmal on the guest blogging process",
    title: "Webinar",
    cap: "SEMrush webinar, co-hosted with SEMrush",
  },
  {
    src: "/assets/speaking/podcast-studio.jpg",
    pos: "center 25%",
    alt: "Syed Irfan Ajmal recording an episode at the microphone, wearing headphones in his studio",
    title: "Podcast",
    cap: "Recording the SIA Business podcast",
  },
  {
    src: "/assets/speaking/video-interview.jpg",
    pos: "center 50%",
    alt: "Syed Irfan Ajmal in a two way video interview, appearing as a guest on another host's show",
    title: "Video interview",
    cap: "As a guest, on camera",
  },
];

const OnCamera = () => (
  <section className="sx" style={{ background: PAPER, paddingBottom: 84 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
      <SCaps size={11} ls="0.20em" color={INK55}>On camera and online</SCaps>
      <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {ON_CAMERA.map((c) => (
        <figure key={c.src} style={{ margin: 0, flex: "1 1 280px", minWidth: 240, background: INK, border: `1px solid ${INK}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src}
            alt={c.alt}
            loading="lazy"
            style={{ width: "100%", aspectRatio: "2 / 1", display: "block", objectFit: "cover", objectPosition: c.pos }}
          />
          <figcaption style={{ padding: "18px 20px 20px" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(19px, 2.2vw, 23px)", color: PAPER, lineHeight: 1.2, letterSpacing: "-0.012em" }}>{c.title}</div>
            <div style={{ marginTop: 8 }}>
              <SCaps size={11} ls="0.14em" color="rgba(250,250,250,.68)">{c.cap}</SCaps>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
    <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70, lineHeight: 1.5 }}>
      Recorded work, not stage credits. The rooms are in the inventory above.
    </p>
  </section>
);

// ─── The course · a full curriculum, taught live ──────────────────────────────
// Why this exists as its own block rather than a line in the Past Stages table:
// the booking specs at the top of this page claim "Languages: English (primary),
// Urdu, Pashto". Until now that was an unsupported assertion. A 10 hour, five
// session curriculum delivered in Urdu, publicly viewable end to end, is the
// evidence for it — and in the Gulf, where the Urdu-speaking workforce is large,
// being able to run internal training in Urdu reaches rooms most international
// speakers cannot.
//
// Accuracy notes, all verified 2026-07-31:
//   • 2018 confirmed by Irfan. The row in STAGES above now carries the same year.
//   • 5 sessions / 10 hours / Urdu cross-checked against the public playlist,
//     which is on his own channel and holds five videos.
//   • Shoaib Ahmed Baig's quote is VERBATIM from his LinkedIn recommendation,
//     trimmed with an ellipsis only. He is the founder who HIRED him, which is
//     what makes it worth more here than an attendee compliment. His title is
//     his own LinkedIn headline.
//   • The language is stated plainly rather than buried. Framing it as a
//     limitation would be dishonest in the other direction: the curriculum is
//     the same either way, and the delivery language is a capability.
const CourseBlock = () => (
  <section className="sx" style={{ background: INK, color: PAPER, paddingTop: 76, paddingBottom: 80 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
      <SCaps size={11} ls="0.20em" color={YEL}>Training · A full curriculum, not a talk</SCaps>
      <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.2)", minWidth: 40 }} />
    </div>

    <div className="grid-intro">
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: PAPER, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Ten hours. Five sessions.<br />
        <span style={{ fontStyle: "italic", color: YEL }}>One curriculum.</span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: "rgba(241,235,222,.72)", lineHeight: 1.6, maxWidth: 560 }}>
        A keynote proves I can hold a stage for forty five minutes. A commissioned ten hour inbound marketing curriculum, taught live to a training company&rsquo;s paying students, proves something harder: that the material holds up over five sessions and that people came back for every one. The whole course is public.
      </p>
    </div>

    <div className="emai-split" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 16 }}>
      <div style={{ border: "1px solid rgba(241,235,222,.28)", background: "rgba(241,235,222,.04)", padding: "26px 24px" }}>
        <SCaps size={10} ls="0.16em" color="rgba(241,235,222,.55)">IDM Pakistan · 2018</SCaps>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "auto 1fr", gap: "9px 16px" }}>
          {([
            ["Format", "Live course, five sessions"],
            ["Length", "10 hours of instruction"],
            ["Audience", "Enrolled students of a training company"],
            ["Language", "Urdu"],
          ] as ReadonlyArray<[string, string]>).map(([k, v]) => (
            <Fragment key={k}>
              <div><SCaps size={9.5} ls="0.14em" color="rgba(241,235,222,.5)">{k}</SCaps></div>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: PAPER, lineHeight: 1.4 }}>{v}</div>
            </Fragment>
          ))}
        </div>
        <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: "rgba(241,235,222,.6)", lineHeight: 1.5 }}>
          Taught in Urdu. The curriculum is the same one I teach in English, and I deliver in either.
        </p>
        <a
          href="https://www.youtube.com/playlist?list=PLY3hQIOPokOPlMnsJ_GqCIsAlaipM5j7j"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 18, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, background: YEL, padding: "12px 18px", textDecoration: "none" }}
        >
          Watch the full course &rarr;
        </a>
      </div>

      <figure style={{ margin: 0, border: "1px solid rgba(241,235,222,.28)", borderLeft: `4px solid ${YEL}`, background: "rgba(241,235,222,.07)", padding: "30px 28px", display: "flex", flexDirection: "column" }}>
        <div aria-hidden style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 0.6, color: YEL, height: 26 }}>&ldquo;</div>
        <blockquote style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: "clamp(18px, 2.2vw, 23px)", color: PAPER, lineHeight: 1.5, flex: 1, fontStyle: "italic" }}>
          Irfan is an exceptional inbound marketer. I hired him as an inbound marketing trainer at IDMPakistan. He received phenomenal feedback from all of our trainees and provided practical knowledge which helped our students immensely. &hellip;
        </blockquote>
        <figcaption style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(241,235,222,.16)", display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/testimonials/shoaib-ahmed-baig.jpg"
            alt="Shoaib Ahmed Baig"
            width={44}
            height={44}
            loading="lazy"
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(241,235,222,.25)" }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: PAPER, lineHeight: 1.25 }}>Shoaib Ahmed Baig</div>
            <div style={{ marginTop: 3, fontFamily: SERIF, fontSize: 13.5, color: "rgba(241,235,222,.6)", lineHeight: 1.4 }}>Founder, Elyscents · IDMPakistan · Core47.ai</div>
            <div style={{ marginTop: 8 }}>
              <SCaps size={9} ls="0.14em" color="rgba(241,235,222,.45)">Hired him to teach the course</SCaps>
            </div>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
);

// ─── §05 · What Hosts Say ─────────────────────────────────────────────────────

const HostQuotes = () => {
  const gridQuotes = HOST_QUOTES.slice(0, -2);
  const barQuotes = HOST_QUOTES.slice(-2);
  return (
    <section className="sx" style={{ background: PAPER, paddingBottom: 90 }}>
      <SectionMast n="05" label="What Hosts Say · On the record" />
      <div className="grid-testimonials" style={{ border: `1px solid ${INK}` }}>
        {gridQuotes.map((tm, i) => (
          <article key={i} className="letter-card" style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <Pill size={10.5} ls="0.18em">№ {String(i + 1).padStart(2, "0")}</Pill>
              <SCaps size={10.5} ls="0.18em" color={INK55}>{tm.place}</SCaps>
            </div>
            <div aria-hidden style={{ marginTop: 18, alignSelf: "flex-start", fontFamily: SERIF, fontSize: 56, lineHeight: 0.62, height: 30, color: INK, fontStyle: "italic", background: YEL, padding: "0 7px" }}>&ldquo;</div>
            <blockquote style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: "clamp(15px, 3vw, 21px)", color: INK, lineHeight: 1.4, fontStyle: "italic" }}>
              {tm.quote}
            </blockquote>
            <HRule style={{ margin: "22px 0 14px", background: INK35 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tm.photo} alt={tm.name} width={44} height={44} style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${INK}`, objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK }}>{tm.name}</div>
                  <div style={{ marginTop: 4 }}><SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps></div>
                </div>
              </div>
              {tm.stat && (
                <div style={{ padding: "6px 10px", background: INK, color: YEL, fontFamily: GROT, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.10em" }}>{tm.stat}</div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Closing testimonials — full-width horizontal bars */}
      {barQuotes.map((bq) => (
        <article key={bq.name} style={{ marginTop: 20, border: `1px solid ${INK}`, padding: "28px 32px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", background: PAPER2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bq.photo} alt={bq.name} width={52} height={52} style={{ width: 52, height: 52, borderRadius: "50%", border: `1.5px solid ${INK}`, objectFit: "cover" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK }}>{bq.name}</div>
              <div style={{ marginTop: 3 }}><SCaps size={10} ls="0.14em" color={INK70}>{bq.role}</SCaps></div>
            </div>
          </div>
          <blockquote style={{ margin: 0, fontFamily: SERIF, fontSize: "clamp(15px, 2vw, 18px)", color: INK, lineHeight: 1.5, fontStyle: "italic", flex: 1, minWidth: 260 }}>
            &ldquo;{bq.quote}&rdquo;
          </blockquote>
          <SCaps size={10} ls="0.14em" color={INK55}>Room · {bq.place}</SCaps>
        </article>
      ))}
      {/* `role` above is each person's CURRENT LinkedIn headline, which in most cases
          postdates the room they are describing. Say so rather than implying they held
          that title at the time, and never invent an at-the-time title. */}
      <p style={{ margin: "16px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK55, lineHeight: 1.5 }}>
        Quoted verbatim from public LinkedIn recommendations. An ellipsis marks a trim, nothing else has been changed. Job titles are current and in most cases postdate the session being described.
      </p>
    </section>
  );
};

// ─── §06 · Booking Process ────────────────────────────────────────────────────

const BookingProcess = () => (
  <section
    className="sx"
    style={{ background: PAPER2, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}
  >
    <SectionMast n="06" label="The Booking Process · Four steps" />
    <div className="grid-intro">
      <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        How to put me<br /><span style={{ fontStyle: "italic" }}><Mark>on your stage.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        I keep the process small and unfussy. The whole thing usually takes a couple of email exchanges and a thirty-minute call.
      </p>
    </div>
    <div className="grid-steps-4" style={{ border: `1px solid ${INK}` }}>
      {STEPS.map((step, i) => (
        <div key={step.no} className="step-card" style={{ padding: "28px 22px 24px", background: PAPER, display: "flex", flexDirection: "column", minHeight: 220 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(40px, 8vw, 64px)", color: INK, lineHeight: 1, letterSpacing: "-0.03em" }}>{step.no}</div>
          <HRule style={{ margin: "14px 0" }} />
          <h4 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{step.t}</h4>
          <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.55, fontStyle: "italic", flex: 1 }}>{step.d}</p>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 44, textAlign: "center" }}>
      <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 32px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Start the booking conversation →
      </a>
    </div>
  </section>
);

// ─── DMSS Audience Strip ─────────────────────────────────────────────────────

const DMSSStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 30, paddingBottom: 20 }}>
    <figure style={{ margin: "0 auto", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}`, maxWidth: 900 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/speaking/dmss-irfan-large-audience.jpg"
        alt="Syed Irfan Ajmal speaking to a large audience at DMSS Conference, Bali"
        style={{ width: "100%", height: "auto", display: "block", border: "1px solid rgba(250,250,250,.25)", maxHeight: 360, objectFit: "cover", objectPosition: "center 30%" }}
      />
      <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#FAFAFA", lineHeight: 1.4 }}>
          DMSS Conference, Bali · Presenting &ldquo;Media Hacks&rdquo; to ~200 attendees.
        </div>
        <SCaps size={10} ls="0.16em" color="rgba(250,250,250,.55)">Photo by dmss.io</SCaps>
      </figcaption>
    </figure>
  </section>
);

// ─── Bottom Booking CTA ──────────────────────────────────────────────────────

const BottomBookingCTA = () => (
  <section className="sx" style={{ background: INK, paddingTop: 60, paddingBottom: 60 }}>
    <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={YEL}>Ready to book?</SCaps>
      <h2 style={{ margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 48px)", color: PAPER, lineHeight: 1.02, letterSpacing: "-0.025em" }}>
        Let&rsquo;s put a talk on your stage.
      </h2>
      <p style={{ margin: "14px auto 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: "rgba(250,250,250,.7)", lineHeight: 1.5, maxWidth: 520 }}>
        Send a brief, get a response inside a working day. No salesy follow-up.
      </p>
      <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ padding: "16px 28px", background: YEL, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>Inquire about booking →</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "16px 28px", background: "transparent", color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${PAPER}` }}>Speaker one-sheet ↓</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-Media-Kit-Jun-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "16px 28px", background: "transparent", color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${PAPER}` }}>Media kit ↓</a>
        <a href="/press-kit" style={{ padding: "16px 28px", background: "transparent", color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${PAPER}` }}>Press kit →</a>
      </div>
    </div>
  </section>
);

// ─── §07 · Calendly ───────────────────────────────────────────────────────────

const CalendlySection = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${INK}` }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK }}>
        Book a slot
      </p>
      <h2 style={{ margin: "0 0 36px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 48px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
        Pick a time that works for you.
      </h2>
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/sia_dmr_agency/emos?hide_event_type_details=1"
        style={{ minWidth: 320, height: 700 }}
      />
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const FeaturedTravelSession = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 8 }}>
    <a
      href="/speaking/earned-media-ai/travel"
      style={{
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        maxWidth: 1000, margin: "0 auto", padding: "24px 28px",
        background: INK, border: `2px solid ${INK}`, textDecoration: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/gallery/atm-dubai-panel.jpg"
        alt="Syed Irfan Ajmal on a panel on the main stage at Arabian Travel Market in Dubai"
        loading="lazy"
        style={{ width: 132, height: 88, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(250,250,250,.25)" }}
      />
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: YEL, color: INK, padding: "5px 9px", whiteSpace: "nowrap" }}>
        Saudi Tourism edition
      </span>
      <span style={{ flex: 1, minWidth: 260 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px, 3vw, 26px)", color: PAPER, lineHeight: 1.15, letterSpacing: "-0.015em" }}>
          When Travelers Ask ChatGPT Where to Go
        </span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, color: "rgba(250,250,250,.72)", lineHeight: 1.5, marginTop: 5 }}>
          The travel edition of my Earned Media in the Age of AI keynote, tuned for Saudi tourism and Vision 2030, for DMOs, tourism boards, hotels, airlines and travel marketers.
        </span>
      </span>
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: YEL, whiteSpace: "nowrap" }}>
        See the session →
      </span>
    </a>
  </section>
);

const FeaturedSession = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 8 }}>
    <a
      href="/speaking/earned-media-ai"
      style={{
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        maxWidth: 1000, margin: "0 auto", padding: "24px 28px",
        background: PAPER2, border: `2px solid ${INK}`, textDecoration: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/gallery/astrolabs-2.jpg"
        alt="Syed Irfan Ajmal mid gesture, presenting at a workshop at AstroLabs in Dubai"
        loading="lazy"
        style={{ width: 132, height: 88, objectFit: "cover", objectPosition: "center 30%", flexShrink: 0, border: `1px solid ${INK}` }}
      />
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: YEL, color: INK, padding: "5px 9px", whiteSpace: "nowrap" }}>
        New · Flagship
      </span>
      <span style={{ flex: 1, minWidth: 260 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px, 3vw, 26px)", color: INK, lineHeight: 1.15, letterSpacing: "-0.015em" }}>
          Earned Media in the Age of AI
        </span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.5, marginTop: 5 }}>
          My new interactive keynote and workshop on how AI is remaking earned media from both sides. Six stage AI pipeline, live activities, and the Coverage Flywheel.
        </span>
      </span>
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, whiteSpace: "nowrap" }}>
        See the session →
      </span>
    </a>
  </section>
);

export default function SpeakingPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <Hero />
      <FeaturedTravelSession />
      <FeaturedSession />
      <WatchTheWork />
      <SpeakingLead />
      <DMSSStrip />
      <Topics />
      <MPSStrip />
      <Stages />
      <RoomBand />
      <ClientStripSpeaking />
      <Formats />
      <OnCamera />
      <CourseBlock />
      <HostQuotes />
      <BookingProcess />
      <BottomBookingCTA />
      <CalendlySection />
      <CTATicker />
      <Subscriptions sectionNumber="08" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

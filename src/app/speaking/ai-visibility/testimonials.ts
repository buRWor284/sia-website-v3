import type { Testimonial } from "@/components/bureau/SpeakingTestimonials";

// ─── Speaking testimonials · source data ──────────────────────────────────────
// Every quote below is reproduced verbatim from a public LinkedIn recommendation
// on Syed Irfan Ajmal's profile. Rules for editing this file:
//
//   1. Never paraphrase, tidy the grammar, or re-punctuate a quote. If a
//      recommendation contains a dash, the dash stays, even though our own copy
//      on these pages carries none.
//   2. Trim with … only. Trim to avoid a sentence, never to change its meaning.
//   3. `role` describes the person's actual relationship to the room. Do not
//      promote an attendee to an organiser.
//   4. `event` is a chip, so keep it short, and only name an event the quote
//      itself names.
//   5. ★ `title` is the person's CURRENT LinkedIn headline, which in most cases
//      postdates the room they are describing. Brie Moreau became an AI SEO
//      researcher years after DMSS; Maryam Arshad Mahmood joined Google after
//      IYDC. That is fine, and it is why the block carries a standing note that
//      titles are current while the chip is the room. What is NOT fine is
//      writing a current title as though it were the role held at the event, or
//      inventing an at-the-time title nobody has confirmed. If Irfan supplies
//      the roles these people actually held then, use those and drop the note.
//
// Ranked, per the picture-first plan: organisers first, then quotes that name a
// specific room, then general speaking endorsements.
//
// ★ TWO DIFFERENT EVENTS BOTH ABBREVIATE TO "MPS". Keep them apart:
//   • "M Powered Summit" — Dubai, 2016, LIVE. Abd Elmohaimen Mansi's quote, the
//     mps-*.jpg gallery photographs, and the MPS2016 row in the STAGES inventory
//     on /speaking all belong to this one.
//   • "Muslim Marketing Summit" — ONLINE, late 2015, organised by someone else.
//     Shereen Pasha's quote and Zarinah El-Amin's belong to this one. There are
//     NO photographs of it, because there was no room.
// Confirmed by Irfan 2026-07-31. Conflating them would attach Dubai stage
// photographs to an online talk.
//
// ★ profileUrl must be the BARE profile URL. The links Irfan copied out of
// LinkedIn carried a `?lipi=urn:li:page:d_flagship3_profile_view_base_...`
// query string. That is a LinkedIn tracking token tied to HIS logged-in browsing
// session, not part of the address, and publishing it would put a fragment of
// his session state on a public page and pass it to LinkedIn on every click.
// Strip everything from the `?` onward. Always.

export const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    name: "Abd Elmohaimen Mansi",
    profileUrl: "https://www.linkedin.com/in/abdelmohaimenmansi/",
    title: "Co-founder · Travel & Mobility as a Service",
    photo: "/assets/testimonials/abd-elmohaimen-mansi.jpg",
    event: "M Powered Summit · Dubai",
    role: "Organiser",
    quote:
      "Syed Irfan spoke at our event the M Powered Summit in Dubai on Personal Branding. Based on the feedback we got from the audience, it was a highly informative talk and everyone benefitted from it. We are glad to have him as a speaker and we highly recommend him. …",
  },
  {
    name: "Ash Ali",
    profileUrl: "https://www.linkedin.com/in/ashali/",
    title: "Co-Founder, Uhubs · Author, The Unfair Advantage · Ex-Just Eat",
    photo: "/assets/testimonials/ash-ali.jpg",
    event: "Uhubs workshop",
    role: "Host",
    quote:
      "The audience enjoyed his super practical session and approach to helping them understand how to grow an audience online and traffic to websites using various smart methods and enjoyed his friendly and positive presentation style, clear slides and concise answers to many questions he received.",
  },
  {
    name: "Maryam Arshad Mahmood",
    profileUrl: "https://www.linkedin.com/in/maryamarshad/",
    title: "Growth and Market Strategy leader · Partnerships @ Google, Singapore",
    photo: "/assets/testimonials/maryam-arshad-mahmood.jpg",
    event: "IYDC 2015 · Peshawar",
    role: "Organiser",
    quote:
      "… it was a pleasure calling Irfan as a distinguished guest speaker for IYDC2015 (Iqra Youth Development Conference) which featured more than 40 international and local speakers in Peshawar. … His friendly nature and humble personality make attendees interact with him a lot more easily (in comparison to other speakers).",
  },
  {
    name: "Brie Moreau",
    profileUrl: "https://www.linkedin.com/in/briemoreau/",
    title: "AI SEO researcher",
    photo: "/assets/testimonials/brie-moreau.jpg",
    event: "DMSS · Bali",
    role: "Host",
    quote:
      "Syed spoke at our conference www.dmss.io … He is an excellent public speaker … He comes highly recommended!!",
  },
  {
    name: "Shereen Pasha",
    profileUrl: "https://www.linkedin.com/in/shereenpasha/",
    title: "Launch Strategist · Course Launch & Business Management Expert",
    photo: "/assets/testimonials/shereen-pasha.jpg",
    // ★ ONLINE, and the chip must say so. Confirmed by Irfan 2026-07-31: she and
    // Zarinah El-Amin attended the same online event. Presenting this as a live
    // room would be the exact overclaim the caption rules exist to stop.
    event: "Muslim Marketing Summit · online",
    role: "Attendee",
    quote:
      "Irfan's talk on How to Get Published in Large Publications at Muslim Marketing Summit was insightful. It was based on the core idea of building authentic trustworthy relationship with media. I highly recommend Irfan for Media & PR related solutions.",
  },
  {
    name: "Chuck Wang",
    profileUrl: "https://www.linkedin.com/in/thechuckwang/",
    title: "Strategic Operations & Governance Executive · Former Founder/CEO",
    photo: "/assets/testimonials/chuck-wang.jpg",
    role: "Peer",
    quote:
      "Being a great speaker takes one part art, one part science, a whole lot of experience, an understanding of how to lead a potential customer through storytelling, emotional intelligence, and personal clarity. Irfan delivers on all of this and more. … If you are looking for a dynamic global speaker, reach out to Irfan. He will turn possibilities into realities.",
  },
];

// The travel page carries three, not six, so a visitor who reads both pages does
// not meet the same wall twice. Picked for travel and Gulf relevance: a Dubai
// event organiser who works in travel, the Bali conference host, and the one
// quote that describes how the room actually behaved.
export const TESTIMONIALS_TRAVEL: ReadonlyArray<Testimonial> = [
  TESTIMONIALS[0],
  TESTIMONIALS[3],
  TESTIMONIALS[1],
];

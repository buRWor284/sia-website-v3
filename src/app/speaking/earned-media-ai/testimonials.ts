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
//
// Ranked, per the picture-first plan: organisers first, then quotes that name a
// specific room, then general speaking endorsements.

export const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    name: "Abd Elmohaimen Mansi",
    title: "Co-founder · Travel & Mobility as a Service",
    photo: "/assets/testimonials/abd-elmohaimen-mansi.jpg",
    event: "M Powered Summit · Dubai",
    role: "Organiser",
    quote:
      "Syed Irfan spoke at our event the M Powered Summit in Dubai on Personal Branding. Based on the feedback we got from the audience, it was a highly informative talk and everyone benefitted from it. We are glad to have him as a speaker and we highly recommend him. …",
  },
  {
    name: "Ash Ali",
    title: "Co-Founder, Uhubs · Author, The Unfair Advantage · Ex-Just Eat",
    photo: "/assets/testimonials/ash-ali.jpg",
    event: "Uhubs workshop",
    role: "Host",
    quote:
      "The audience enjoyed his super practical session and approach to helping them understand how to grow an audience online and traffic to websites using various smart methods and enjoyed his friendly and positive presentation style, clear slides and concise answers to many questions he received.",
  },
  {
    name: "Maryam Arshad Mahmood",
    title: "Growth and Market Strategy leader · Partnerships @ Google",
    photo: "/assets/testimonials/maryam-arshad-mahmood.jpg",
    event: "IYDC 2015 · Peshawar",
    role: "Organiser",
    quote:
      "… it was a pleasure calling Irfan as a distinguished guest speaker for IYDC2015 (Iqra Youth Development Conference) which featured more than 40 international and local speakers in Peshawar. … His friendly nature and humble personality make attendees interact with him a lot more easily (in comparison to other speakers).",
  },
  {
    name: "Brie Moreau",
    title: "AI SEO researcher",
    photo: "/assets/testimonials/brie-moreau.jpg",
    event: "DMSS · Bali",
    role: "Host",
    quote:
      "Syed spoke at our conference www.dmss.io … He is an excellent public speaker … He comes highly recommended!!",
  },
  {
    name: "Shereen Pasha",
    title: "Launch Strategist · Course Launch & Business Management Expert",
    photo: "/assets/testimonials/shereen-pasha.jpg",
    event: "Muslim Marketing Summit",
    role: "Attendee",
    quote:
      "Irfan's talk on How to Get Published in Large Publications at Muslim Marketing Summit was insightful. It was based on the core idea of building authentic trustworthy relationship with media. I highly recommend Irfan for Media & PR related solutions.",
  },
  {
    name: "Chuck Wang",
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

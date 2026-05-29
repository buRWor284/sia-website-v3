import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import { Mark, SCaps } from "@/components/bureau/primitives";
import {
  CALENDLY, GROT, INK, INK55, INK70, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";
import GalleryClient from "./GalleryClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_PHOTOS = 39; // update when photos are added
const TOTAL_VIDEOS = 6;

const NUM_WORDS: Record<number, string> = {
  1:"One",2:"Two",3:"Three",4:"Four",5:"Five",6:"Six",7:"Seven",8:"Eight",
  9:"Nine",10:"Ten",11:"Eleven",12:"Twelve",13:"Thirteen",14:"Fourteen",
  15:"Fifteen",16:"Sixteen",17:"Seventeen",18:"Eighteen",19:"Nineteen",
  20:"Twenty",21:"Twenty-one",22:"Twenty-two",23:"Twenty-three",24:"Twenty-four",
  25:"Twenty-five",26:"Twenty-six",27:"Twenty-seven",28:"Twenty-eight",
  29:"Twenty-nine",30:"Thirty",31:"Thirty-one",32:"Thirty-two",33:"Thirty-three",
  34:"Thirty-four",35:"Thirty-five",36:"Thirty-six",37:"Thirty-seven",
  38:"Thirty-eight",39:"Thirty-nine",40:"Forty",
};
const toWord = (n: number) => NUM_WORDS[n] ?? String(n);

// ─── Hero — 3-column editorial ────────────────────────────────────────────────

const Hero = () => (
  <section style={{ background: PAPER, borderBottom: `4px solid ${INK}` }}>
    <div className="gallery-hero-grid">

      {/* LEFT · count + watermark */}
      <div className="gallery-hero-left">
        <div className="gallery-hero-watermark">GALLERY</div>
        <div style={{
          fontFamily: GROT, fontWeight: 900, fontSize: "clamp(72px,9vw,104px)",
          color: INK, lineHeight: 1, letterSpacing: "-0.04em",
          position: "relative", zIndex: 1,
        }}>
          {TOTAL_PHOTOS + TOTAL_VIDEOS}
        </div>
        <SCaps size={9} ls="0.24em" color={INK55} style={{ marginTop: 5, position: "relative", zIndex: 1 }}>
          Items in archive
        </SCaps>
      </div>

      {/* CENTRE · headline */}
      <div style={{
        padding: "36px 44px 32px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <SCaps size={10} ls="0.26em" color={INK55} style={{ marginBottom: 16 }}>
          A visual record &nbsp;·&nbsp; On stage &amp; on the road
        </SCaps>
        <h1 style={{
          margin: 0,
          fontFamily: SERIF, fontWeight: 700,
          fontSize: "clamp(34px, 3.5vw, 52px)",
          color: INK, lineHeight: 1.08, letterSpacing: "-0.022em",
        }}>
          {toWord(TOTAL_PHOTOS)} photographs.<br />
          <span style={{ fontStyle: "italic", fontWeight: 600 }}>
            {toWord(TOTAL_VIDEOS)} reels. Three continents.
          </span>
        </h1>
        <p style={{
          marginTop: 16, margin: "16px 0 0",
          fontFamily: SERIF, fontStyle: "italic", fontSize: 16,
          color: INK70, lineHeight: 1.5, maxWidth: 520,
        }}>
          Speaking engagements, travel, and the people in between &mdash; 2014 to 2018.
        </p>
      </div>

      {/* RIGHT · key locations */}
      <div className="gallery-hero-right">
        {[
          { name: "Dubai",    meta: "UAE · 2016–2018"      },
          { name: "Bali",     meta: "Indonesia · 2017"     },
          { name: "Peshawar", meta: "Pakistan · 2014–2015" },
        ].map(loc => (
          <div key={loc.name}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1, letterSpacing: "-0.01em" }}>
              {loc.name}
            </div>
            <SCaps size={9} ls="0.18em" color={INK55} style={{ marginTop: 3 }}>
              {loc.meta}
            </SCaps>
          </div>
        ))}
      </div>

    </div>
  </section>
);

// ─── Book CTA ─────────────────────────────────────────────────────────────────

const BookCTA = () => (
  <section className="sx" style={{
    background: PAPER2, paddingTop: 70, paddingBottom: 70,
    borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`,
  }}>
    <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={INK70}>Like what you see?</SCaps>
      <h2 className="h2-sm" style={{
        margin: "14px 0 0", fontFamily: SERIF, fontWeight: 700,
        color: INK, lineHeight: 1.05, letterSpacing: "-0.02em",
      }}>
        If you would like a similar room of your own,<br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>the booking desk is open.</Mark>
        </span>
      </h2>
      <div style={{ marginTop: 28, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/speaking" style={{
          padding: "16px 26px", background: INK, color: PAPER,
          textDecoration: "none", fontFamily: GROT, fontWeight: 800,
          fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          See the speaker sheet →
        </a>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
          padding: "16px 26px", background: YEL, color: INK,
          textDecoration: "none", fontFamily: GROT, fontWeight: 800,
          fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          Book a call →
        </a>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Gallery" />
      <Hero />
      <GalleryClient />
      <BookCTA />
      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}

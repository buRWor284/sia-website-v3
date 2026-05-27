import { INK, INK35, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { HRule, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  place: string;
};

const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    quote:
      "Ranked a keyword to #4 on Google that gets over 160,000 searches a " +
      "month. Commercial intent. Can't thank Irfan and the team enough.",
    name: "Azzam Sheikh",
    role: "National Tyres & Autocare, UK",
    place: "Manchester",
  },
  {
    quote:
      "Highly knowledgeable about content marketing and SEO. Ideas and " +
      "execution both cutting-edge strategic, doesn't lose sight of what " +
      "matters.",
    name: "Lisa Zahran",
    role: "Copy & Coffee, Malaysia",
    place: "Kuala Lumpur",
  },
  {
    quote:
      "One of the good guys. Knows digital marketing inside out. His " +
      "expertise and growth in this area is exemplary.",
    name: "Sam Hurley",
    role: "OPTIM-EYEZ, UK",
    place: "London",
  },
  {
    quote:
      "Being a great speaker takes art and science, experience, and personal " +
      "clarity. Irfan delivers on all of it, and it is hard not to like the guy.",
    name: "Chuck Wang",
    role: "The MVP Marketing Podcast, USA",
    place: "San Francisco",
  },
];

export const Letters = () => (
  <section style={{ background: PAPER, padding: "40px 56px 90px" }}>
    <SectionMast n="03" label="What clients say · On the record" />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 0,
        border: `1px solid ${INK}`,
      }}
    >
      {TESTIMONIALS.map((tm, i) => {
        const isRight = i % 2 === 1;
        const isBottom = i >= 2;
        return (
          <article
            key={i}
            style={{
              padding: "36px 36px 30px",
              borderRight: !isRight ? `1px solid ${INK}` : "none",
              borderBottom: !isBottom ? `1px solid ${INK}` : "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Pill size={10.5} ls="0.18em">
                № {String(i + 1).padStart(2, "0")}
              </Pill>
              <SCaps size={10.5} ls="0.18em" color={INK55}>
                Filed from {tm.place}
              </SCaps>
            </div>
            <blockquote
              style={{
                margin: "20px 0 0",
                fontFamily: SERIF,
                fontSize: 23.5,
                color: INK,
                lineHeight: 1.4,
                letterSpacing: "-0.005em",
                fontStyle: "italic",
                position: "relative",
                paddingLeft: 32,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: -4,
                  top: -10,
                  fontFamily: SERIF,
                  fontSize: 96,
                  lineHeight: 1,
                  color: INK,
                  fontStyle: "italic",
                  background: YEL,
                  padding: "0 4px",
                }}
              >
                &ldquo;
              </span>
              {tm.quote}
            </blockquote>
            <HRule style={{ margin: "24px 0 14px", background: INK35 }} />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 17,
                    color: INK,
                  }}
                >
                  {tm.name}
                </div>
                <div style={{ marginTop: 4 }}>
                  <SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps>
                </div>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: INK55,
                }}
              >
                (reproduced with permission)
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

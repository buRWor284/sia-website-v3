import { INK, INK35, INK55, INK70, PAPER, SERIF, YEL, GROT } from "@/lib/tokens";
import { HRule, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  place: string;
  photo: string;
  stat?: string;
};

const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    quote:
      "Their biggest weapon has been doing outreach to earn high-quality " +
      "backlinks and mentions at scale from the likes of Forbes, Mashable, " +
      "Reader's Digest, and hundreds of other authority sites. The biggest " +
      "success story has been helping grow Ridester from zero to 1.5 million " +
      "monthly visitors.",
    name: "Brett Helling",
    role: "Enterprise SEO Lead, ClickUp",
    place: "Omaha, NE",
    photo: "/assets/testimonials/brett-helling.jpg",
    stat: "0 to 1.5M monthly visitors",
  },
  {
    quote:
      "Syed's team earned us high authority links from publications like MSN " +
      "and Yahoo. Our main site's organic traffic increased by 120%. Our " +
      "Public Database saw a 515% increase in clicks, and our average daily " +
      "signups grew 6x.",
    name: "Imani Lea Brown",
    role: "Content Architect and Systems Designer",
    place: "San Francisco",
    photo: "/assets/testimonials/imani-lea-brown.jpg",
    stat: "120% traffic, 6x signups",
  },
  {
    quote:
      "Irfan and his team earned high authority backlinks from publications " +
      "like Reader's Digest and MSN. The web portal's traffic increased by " +
      "140% in 3 months, greatly exceeding our goals.",
    name: "Reem El Shafaki",
    role: "Partner, DinarStandard",
    place: "Dubai",
    photo: "/assets/testimonials/reem-el-shafaki.jpg",
    stat: "140% traffic in 3 months",
  },
  {
    quote:
      "It was a pleasure collaborating with Syed for a Uhubs workshop on " +
      "'How We Grew from Zero to 1.5 Million Unique Monthly Visitors.' " +
      "The audience enjoyed his super practical session, clear slides, and " +
      "concise answers. He is a great speaker with hands-on, practical " +
      "advice and an amazing personal story.",
    name: "Ash Ali",
    role: "Co-Founder, Uhubs · Author, The Unfair Advantage (150k+ copies)",
    place: "London",
    photo: "/assets/testimonials/ash-ali.jpg",
  },
  {
    quote:
      "Syed spoke at our DMSS conference and is an excellent public speaker. " +
      "He gave me great, actionable tips to increase our media exposure. " +
      "He comes highly recommended.",
    name: "Brie Moreau",
    role: "Organizer, DMSS Conference (Bali)",
    place: "Bali",
    photo: "/assets/testimonials/brie-moreau.jpg",
  },
];

export const Letters = () => (
  <section id="letters" className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 90 }}>
    <SectionMast n="03" label="What clients say · On the record" />
    <div
      className="grid-testimonials"
      style={{ border: `1px solid ${INK}` }}
    >
      {TESTIMONIALS.map((tm, i) => {
        return (
          <article
            key={i}
            className="letter-card"
            style={{
              padding: "32px 28px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
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
                fontSize: "clamp(16px, 3vw, 21px)",
                color: INK,
                lineHeight: 1.4,
                letterSpacing: "-0.005em",
                fontStyle: "italic",
                position: "relative",
                paddingLeft: 32,
                flex: 1,
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
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tm.photo}
                  alt={tm.name}
                  width={44}
                  height={44}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: `1.5px solid ${INK}`,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
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
                  <div style={{ marginTop: 3 }}>
                    <SCaps size={10.5} ls="0.14em" color={INK70}>{tm.role}</SCaps>
                  </div>
                </div>
              </div>
              {tm.stat ? (
                <div
                  style={{
                    padding: "5px 10px",
                    background: INK,
                    color: YEL,
                    fontFamily: GROT,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tm.stat}
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 13,
                    color: INK55,
                  }}
                >
                  (reproduced with permission)
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

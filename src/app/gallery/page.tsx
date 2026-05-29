import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  Mark,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  CALENDLY,
  GROT,
  INK,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Data ─────────────────────────────────────────────────────────────────────

const GA = (f: string) => `/assets/gallery/${f}`;

type Photo = { src: string; cap: string; venue: string };

const PHOTOS: ReadonlyArray<Photo> = [
  { src: GA("mps-banner.jpg"),          cap: 'MPS2016 · "Personal Branding for Founders"',          venue: "Dubai · Oct 2016"       },
  { src: GA("mps-audience-wide.jpg"),   cap: "MPS2016 audience · wide hall, Dubai trade centre",    venue: "MPS Dubai · 2016"       },
  { src: GA("mps-emirati.jpg"),         cap: "Emirati attendees at MPS2016",                         venue: "MPS Dubai · 2016"       },
  { src: GA("mps-audience.jpg"),        cap: "Audience question · MPS2016",                          venue: "MPS Dubai · 2016"       },
  { src: GA("mps-zoom.jpg"),            cap: "Listening in · MPS2016",                               venue: "MPS Dubai · 2016"       },
  { src: GA("atm-dubai-panel.jpg"),     cap: "Panel · Marketing to the Modern Muslim Traveller",     venue: "ATM Dubai · Apr 2018"   },
  { src: GA("dmss-bali.jpg"),           cap: "Media Hacks workshop",                                 venue: "DMSS · Bali · Oct 2017" },
  { src: GA("in5-dubai.jpg"),           cap: "Media Hacks · Free Publicity Online",                  venue: "IN5 · Dubai · 2018"     },
  { src: GA("empower-pakistan.jpg"),    cap: "Empower Pakistan · World Bank Group",                  venue: "Pakistan"               },
  { src: GA("startup-grind.jpg"),       cap: "Startup Grind · Powered by Google",                   venue: "Peshawar"               },
  { src: GA("empower-pk-group.jpg"),    cap: "Empower Pakistan · group photograph",                  venue: "Pakistan"               },
  { src: GA("uop-talk.jpg"),            cap: "University of Peshawar talk",                          venue: "Peshawar"               },
  { src: GA("iydc-panel.jpg"),          cap: "Panel · Social Media @ IYDC",                          venue: "Peshawar · 2015"        },
  { src: GA("gdayx-1.jpg"),             cap: "Keynote at G-Day X",                                   venue: "Peshawar · 2014"        },
  { src: GA("gdayx-2.jpg"),             cap: "G-Day X audience",                                     venue: "Peshawar · 2014"        },
  { src: GA("gdayx-3.jpg"),             cap: "G-Day X room",                                         venue: "Peshawar · 2014"        },
  { src: GA("gdayx-img1816.jpg"),       cap: "Speaking at G-Day X",                                  venue: "Peshawar"               },
  { src: GA("astrolabs-1.jpg"),         cap: "Astrolabs · Growth Hacking Your Brand",                venue: "Dubai · Oct 2016"       },
  { src: GA("astrolabs-2.jpg"),         cap: "Astrolabs · Growth Hacking",                           venue: "Dubai · Oct 2016"       },
  { src: GA("astrolabs-3.jpg"),         cap: "Astrolabs · Growth Hacking",                           venue: "Dubai · Oct 2016"       },
  { src: GA("astrolabs-4.jpg"),         cap: "Astrolabs · Growth Hacking",                           venue: "Dubai · Oct 2016"       },
  { src: GA("ik-audience.jpg"),         cap: "Audience · IK Institute of Business",                  venue: "Dubai · Oct 2016"       },
  { src: GA("ik-workshop.jpg"),         cap: "IK Institute workshop audience",                        venue: "Dubai"                  },
  { src: GA("ik-cospeaker.jpg"),        cap: "Co-speaker · IK Institute workshop",                   venue: "Dubai"                  },
  { src: GA("ik-cotrainer.jpg"),        cap: "Co-trainer · IK Institute workshop",                   venue: "Dubai"                  },
  { src: GA("with-irfan-khairi.jpg"),   cap: "With Irfan Khairi · founder, IK Institute",            venue: "Dubai"                  },
];

// gridColumn / gridRow span for each photo in the mosaic
const PHOTO_SPANS: ReadonlyArray<[string, string]> = [
  ["span 7", "span 2"],  // 0  mps-banner big
  ["span 5", "span 1"],  // 1  mps-audience-wide
  ["span 5", "span 1"],  // 2  mps-emirati
  ["span 4", "span 1"],  // 3  mps-audience
  ["span 4", "span 1"],  // 4  mps-zoom
  ["span 8", "span 2"],  // 5  atm-dubai-panel big
  ["span 4", "span 1"],  // 6  dmss-bali
  ["span 4", "span 1"],  // 7  in5-dubai
  ["span 4", "span 1"],  // 8  empower-pakistan
  ["span 4", "span 1"],  // 9  startup-grind
  ["span 4", "span 1"],  // 10 empower-pk-group
  ["span 4", "span 1"],  // 11 uop-talk
  ["span 7", "span 2"],  // 12 iydc-panel big
  ["span 5", "span 1"],  // 13 gdayx-1
  ["span 5", "span 1"],  // 14 gdayx-2
  ["span 4", "span 1"],  // 15 gdayx-3
  ["span 8", "span 2"],  // 16 gdayx-img1816 big
  ["span 4", "span 1"],  // 17 astrolabs-1
  ["span 4", "span 1"],  // 18 astrolabs-2
  ["span 4", "span 1"],  // 19 astrolabs-3
  ["span 4", "span 1"],  // 20 astrolabs-4
  ["span 4", "span 1"],  // 21 ik-audience
  ["span 4", "span 1"],  // 22 ik-workshop
  ["span 4", "span 1"],  // 23 ik-cospeaker
  ["span 4", "span 1"],  // 24 ik-cotrainer
  ["span 4", "span 1"],  // 25 with-irfan-khairi
];

type Video = { id: string; title: string; where: string; venue: string; startAt?: number };
const VIDEOS: ReadonlyArray<Video> = [
  { id: "uSn4s5ZbJcQ", title: "Panel · Marketing to the Modern Muslim Traveller", where: "ATM Dubai, UAE · April 2018",         venue: "ATM Dubai",    startAt: 743 },
  { id: "2mJ3o2LyWAc", title: "Media Hacks · Free Publicity Online",              where: "IN5, Dubai, UAE · 2018",             venue: "IN5 Dubai"   },
  { id: "50SIoLI-TW4", title: "Digital Marketing Workshop @ MaGIC",               where: "Cyberjaya, Malaysia · 2016",         venue: "MaGIC · MY"  },
  { id: "OwQpDj4c1LE", title: "DMSS Conference · Media Hacks workshop",           where: "Bali, Indonesia · October 2017",     venue: "Bali · DMSS" },
  { id: "rRUS5dlJdc4", title: "Personal Branding Workshop",                       where: "Durshal, KP, Pakistan",              venue: "Durshal · PK"},
  { id: "zBUeBo4srpA", title: "Writing Your Way to Success",                      where: "20-min webinar · 3 case studies",    venue: "Webinar"     },
];

const PLAYLIST = "https://www.youtube.com/playlist?list=PLY3hQIOPokON_uNiEcWBJXBf43FSswXtY";

const BEHIND: ReadonlyArray<Photo> = [
  { src: "/assets/gallery/forbes-me-visit.jpg",        cap: "At Forbes Middle East · APH",               venue: "Dubai"          },
  { src: "/assets/gallery/dmss-group-pano.jpg",        cap: "DMSS Bali 2017 · group panorama",            venue: "Bali · Oct 2017"},
  { src: "/assets/gallery/dmss-speakers-grid.jpg",     cap: "Among the DMSS speaker roster",              venue: "DMSS Bali 2017" },
  { src: "/assets/gallery/dmss-speaking-at.jpg",       cap: '"I\'m speaking at DMSS" card',               venue: "Bali · 2017"    },
  { src: "/assets/gallery/dmss-media-hacks-slide.jpg", cap: "On the screen · Media Hacks title slide",    venue: "DMSS Bali"      },
  { src: "/assets/gallery/with-agnieszka-bali.jpg",    cap: 'With Agnieszka · "I am in Bali now"',        venue: "DMSS Bali 2017" },
  { src: "/assets/gallery/with-egor-borushko.jpg",     cap: "With Egor Borushko · Time Doctor",           venue: "DMSS Bali 2017" },
  { src: "/assets/gallery/dmss-venue.jpg",             cap: "The Trans Resort · DMSS venue",              venue: "Bali"           },
  { src: "/assets/gallery/bali-galleria.jpg",          cap: "Arriving at Mal Bali Galleria",              venue: "Bali · 2017"    },
  { src: "/assets/gallery/dubai-beach-2018.jpg",       cap: "Dubai beach · Burj Al Arab in the back",     venue: "Dubai · 2018"   },
  { src: "/assets/gallery/dubai-mall-2017.jpg",        cap: "Dubai Mall",                                 venue: "Dubai · 2017"   },
];

const BEHIND_SPANS: ReadonlyArray<[string, string]> = [
  ["span 5", "span 2"],  // 0  forbes big
  ["span 7", "span 2"],  // 1  dmss pano big
  ["span 4", "span 1"],  // 2
  ["span 4", "span 1"],  // 3
  ["span 4", "span 1"],  // 4
  ["span 4", "span 1"],  // 5
  ["span 4", "span 1"],  // 6
  ["span 4", "span 1"],  // 7
  ["span 4", "span 1"],  // 8
  ["span 4", "span 1"],  // 9
  ["span 4", "span 1"],  // 10
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 60 }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <SCaps color={INK70} size={12} ls="0.28em">
        Pictures &amp; videos from the road
      </SCaps>
    </div>
    <h1
      className="hero-h1"
      style={{ fontFamily: SERIF, fontWeight: 700, color: INK }}
    >
      <span style={{ display: "block" }}>The speaking</span>
      <span style={{ display: "block", fontStyle: "italic", fontWeight: 600 }}>
        <Mark>gallery.</Mark>
      </span>
    </h1>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <SCaps size={11.5} ls="0.22em" color={INK55}>
        Twenty-six photographs &nbsp;·&nbsp; six reels &nbsp;·&nbsp;
        <span style={{ color: INK }}>Dubai · Bali · Peshawar · 2014 to 2018</span>
      </SCaps>
    </div>
    <DoubleRule style={{ margin: "44px 0 0" }} />
  </section>
);

// ─── §01 · Photo Wall ────────────────────────────────────────────────────────

const PhotoWall = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 60, paddingBottom: 90 }}>
    <SectionMast n="01" label="From the road · Selected photographs" />

    <div className="gallery-mosaic">
      {PHOTOS.map((p, i) => {
        const [col, row] = PHOTO_SPANS[i] ?? ["span 4", "span 1"];
        const big = row === "span 2";
        return (
          <figure
            key={i}
            style={{
              margin: 0,
              gridColumn: col,
              gridRow: row,
              background: PAPER2,
              border: `1px solid ${INK}`,
              padding: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: big ? 360 : 180,
                border: `1px solid ${INK}`,
                overflow: "hidden",
                background: "#222",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.cap}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <figcaption
              style={{
                padding: "8px 4px 2px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13.5,
                  color: INK,
                  lineHeight: 1.35,
                }}
              >
                {p.cap}
              </div>
              <SCaps size={9.5} ls="0.14em" color={INK55}>
                {p.venue}
              </SCaps>
            </figcaption>
          </figure>
        );
      })}
    </div>
  </section>
);

// ─── §02 · Videos ────────────────────────────────────────────────────────────

type VideoCardProps = { v: Video; i: number };
const VideoCard = ({ v, i }: VideoCardProps) => (
  <div
    style={{
      background: INK,
      color: PAPER,
      padding: 16,
      border: `1px solid ${INK}`,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 4px 12px",
        borderBottom: "1px solid rgba(241,235,222,.25)",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            display: "inline-block",
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: YEL,
          }}
        />
        <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.85)">
          Reel № 0{i + 1}
        </SCaps>
      </div>
      <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.5)">
        YouTube
      </SCaps>
    </div>

    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        background: "#000",
        border: "1px solid rgba(241,235,222,.25)",
        overflow: "hidden",
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${v.id}?rel=0${v.startAt ? `&start=${v.startAt}` : ""}`}
        title={v.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </div>

    <div
      style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: "1px solid rgba(241,235,222,.25)",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 19,
          color: PAPER,
          lineHeight: 1.2,
        }}
      >
        {v.title}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 13.5,
          color: "rgba(241,235,222,.75)",
          lineHeight: 1.4,
        }}
      >
        {v.where}
      </div>
    </div>
  </div>
);

const VideoSection = () => (
  <section id="reels" className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}>
    <SectionMast n="02" label="Videos from the road · Six reels" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Six reels
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>from the road.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Recordings from the four major venues, plus a thematic webinar:
        the ATM Dubai travel panel, the IN5 earned-media workshop, the
        DMSS Bali workshop in Indonesia, the Durshal personal-branding
        session in Peshawar, and a twenty-minute webinar on content
        marketing. The full reel lives on the SIA YouTube channel.
      </p>
    </div>

    <div className="grid-videos-2">
      {VIDEOS.map((v, i) => (
        <VideoCard key={v.id} v={v} i={i} />
      ))}
    </div>

    {/* IDM Pakistan curriculum — full-width card, links to playlist */}
    <div
      style={{
        marginTop: 24,
        background: INK,
        color: PAPER,
        padding: 28,
        border: `1px solid ${INK}`,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(241,235,222,.25)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: YEL,
            }}
          />
          <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.85)">
            On-demand curriculum
          </SCaps>
          <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.5)" style={{ marginLeft: "auto" }}>
            YouTube · 5 parts · 10 hrs
          </SCaps>
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 22,
            color: PAPER,
            lineHeight: 1.2,
          }}
        >
          Inbound Marketing · Full Curriculum
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: "rgba(241,235,222,.75)",
            lineHeight: 1.5,
          }}
        >
          Delivered in partnership with IDM Pakistan · Five sessions · Ten hours of instruction · In Urdu
        </div>
      </div>
      <a
        href="https://www.youtube.com/playlist?list=PLY3hQIOPokOPlMnsJ_GqCIsAlaipM5j7j"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          background: PAPER,
          color: INK,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Watch the series ↗
      </a>
    </div>

    <div
      style={{
        marginTop: 36,
        display: "flex",
        justifyContent: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <a
        href={PLAYLIST}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 22px",
          background: INK,
          color: PAPER,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Open the full playlist on YouTube ↗
      </a>
    </div>
  </section>
);

// ─── §03 · Behind the Talks ───────────────────────────────────────────────────

const BehindTheTalks = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}>
    <SectionMast n="03" label="Behind the talks · The road around the work" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        The road,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>around the work.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Travel companions, conference corridors, the occasional visit to a
        Forbes Middle East office. The pictures that did not make the press
        kit but are still part of how the work travels.
      </p>
    </div>

    <div className="gallery-mosaic">
      {BEHIND.map((p, i) => {
        const [col, row] = BEHIND_SPANS[i] ?? ["span 4", "span 1"];
        const big = row === "span 2";
        return (
          <figure
            key={i}
            style={{
              margin: 0,
              gridColumn: col,
              gridRow: row,
              background: PAPER2,
              border: `1px solid ${INK}`,
              padding: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: big ? 340 : 180,
                border: `1px solid ${INK}`,
                overflow: "hidden",
                background: "#222",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.cap}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <figcaption
              style={{
                padding: "8px 4px 2px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13.5,
                  color: INK,
                  lineHeight: 1.35,
                }}
              >
                {p.cap}
              </div>
              <SCaps size={9.5} ls="0.14em" color={INK55}>
                {p.venue}
              </SCaps>
            </figcaption>
          </figure>
        );
      })}
    </div>
  </section>
);

// ─── Book CTA ─────────────────────────────────────────────────────────────────

const BookCTA = () => (
  <section
    className="sx"
    style={{
      background: PAPER2,
      paddingTop: 70,
      paddingBottom: 70,
      borderTop: `1px solid ${INK}`,
      borderBottom: `1px solid ${INK}`,
    }}
  >
    <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color={INK70}>
        Like what you see?
      </SCaps>
      <h2
        className="h2-sm"
        style={{
          margin: "14px 0 0",
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        If you would like a similar room of your own,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>the booking desk is open.</Mark>
        </span>
      </h2>
      <div
        style={{
          marginTop: 28,
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/speaking"
          style={{
            padding: "16px 26px",
            background: INK,
            color: PAPER,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          See the speaker sheet →
        </a>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "16px 26px",
            background: YEL,
            color: INK,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
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
      <PhotoWall />
      <VideoSection />
      <BehindTheTalks />
      <BookCTA />
      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}

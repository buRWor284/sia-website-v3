import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  HRule,
  Mark,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  INK,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
} from "@/lib/tokens";

const SPEAKING_PHOTOS: ReadonlyArray<{
  src: string;
  caption: string;
  event: string;
}> = [
  {
    src: "/assets/gallery/dmss-speaking-at.jpg",
    caption: "DMSS Bali",
    event: "Keynote on stage",
  },
  {
    src: "/assets/gallery/dmss-bali.jpg",
    caption: "DMSS, Bali",
    event: "Digital Marketing Summit",
  },
  {
    src: "/assets/gallery/dmss-group-pano.jpg",
    caption: "DMSS Group",
    event: "Panoramic group shot",
  },
  {
    src: "/assets/gallery/dmss-media-hacks-slide.jpg",
    caption: "Media Hacks",
    event: "DMSS slide presentation",
  },
  {
    src: "/assets/gallery/dmss-speakers-grid.jpg",
    caption: "DMSS Speakers",
    event: "Speaker lineup",
  },
  {
    src: "/assets/gallery/dmss-venue.jpg",
    caption: "DMSS Venue",
    event: "Bali conference venue",
  },
  {
    src: "/assets/gallery/mps-audience.jpg",
    caption: "MPS 2016, Dubai",
    event: "Audience view",
  },
  {
    src: "/assets/gallery/mps-audience-wide.jpg",
    caption: "MPS 2016 Wide",
    event: "Full hall panoramic",
  },
  {
    src: "/assets/gallery/mps-banner.jpg",
    caption: "MPS Banner",
    event: "Make Profits Summit",
  },
  {
    src: "/assets/gallery/mps-banner-elmanaas.jpg",
    caption: "MPS El Manaas",
    event: "Speaker banner",
  },
  {
    src: "/assets/gallery/mps-emirati.jpg",
    caption: "MPS Dubai",
    event: "With Emirati attendees",
  },
  {
    src: "/assets/gallery/mps-zoom.jpg",
    caption: "MPS Dubai",
    event: "Close view",
  },
  {
    src: "/assets/gallery/gdayx-1.jpg",
    caption: "G-Day X",
    event: "Peshawar, Pakistan",
  },
  {
    src: "/assets/gallery/gdayx-2.jpg",
    caption: "G-Day X",
    event: "Peshawar stage",
  },
  {
    src: "/assets/gallery/gdayx-3.jpg",
    caption: "G-Day X",
    event: "Peshawar audience",
  },
  {
    src: "/assets/gallery/gdayx-img1816.jpg",
    caption: "G-Day X",
    event: "Stage overview",
  },
  {
    src: "/assets/gallery/ik-audience.jpg",
    caption: "IK Event",
    event: "Malaysia audience",
  },
  {
    src: "/assets/gallery/ik-workshop.jpg",
    caption: "IK Workshop",
    event: "Kuala Lumpur, Malaysia",
  },
  {
    src: "/assets/gallery/ik-cospeaker.jpg",
    caption: "With co-speaker",
    event: "Malaysia event",
  },
  {
    src: "/assets/gallery/ik-cotrainer.jpg",
    caption: "Co-training session",
    event: "Malaysia workshop",
  },
  {
    src: "/assets/gallery/atm-dubai-panel.jpg",
    caption: "ATM Dubai",
    event: "Panel discussion",
  },
  {
    src: "/assets/gallery/in5-dubai.jpg",
    caption: "IN5 Hub, Dubai",
    event: "Tech hub event",
  },
  {
    src: "/assets/gallery/iydc-panel.jpg",
    caption: "IYDC Panel",
    event: "Youth discussion panel",
  },
  {
    src: "/assets/gallery/bali-galleria.jpg",
    caption: "Bali",
    event: "Event gallery",
  },
  {
    src: "/assets/gallery/astrolabs-1.jpg",
    caption: "Astrolabs",
    event: "Peshawar tech event",
  },
  {
    src: "/assets/gallery/astrolabs-2.jpg",
    caption: "Astrolabs",
    event: "Panel discussion",
  },
  {
    src: "/assets/gallery/astrolabs-3.jpg",
    caption: "Astrolabs",
    event: "Stage view",
  },
  {
    src: "/assets/gallery/astrolabs-4.jpg",
    caption: "Astrolabs",
    event: "Audience engagement",
  },
  {
    src: "/assets/gallery/empower-pakistan.jpg",
    caption: "Empower Pakistan",
    event: "National event",
  },
  {
    src: "/assets/gallery/empower-pk-group.jpg",
    caption: "Empower Pakistan",
    event: "Group photograph",
  },
  {
    src: "/assets/gallery/startup-grind.jpg",
    caption: "Startup Grind",
    event: "Peshawar chapter",
  },
  {
    src: "/assets/gallery/uop-talk.jpg",
    caption: "UOP Talk",
    event: "University of Peshawar",
  },
  {
    src: "/assets/gallery/forbes-me-visit.jpg",
    caption: "Forbes Middle East",
    event: "Office visit",
  },
  {
    src: "/assets/gallery/with-agnieszka-bali.jpg",
    caption: "With Agnieszka",
    event: "DMSS Bali",
  },
  {
    src: "/assets/gallery/with-egor-borushko.jpg",
    caption: "With Egor Borushko",
    event: "DMSS conference",
  },
  {
    src: "/assets/gallery/with-irfan-khairi.jpg",
    caption: "With Irfan Khairi",
    event: "Kuala Lumpur, Malaysia",
  },
  {
    src: "/assets/gallery/dubai-beach-2018.jpg",
    caption: "Dubai",
    event: "2018",
  },
  {
    src: "/assets/gallery/dubai-mall-2017.jpg",
    caption: "Dubai Mall",
    event: "2017",
  },
];

const PERSONAL_PHOTOS: ReadonlyArray<{ src: string; cap: string }> = [
  { src: "/assets/personal/climb-1.jpg", cap: "Climbing, Peshawar" },
  { src: "/assets/personal/climb-2.jpg", cap: "Climbing" },
  { src: "/assets/personal/climb-3.jpg", cap: "Rock face" },
  { src: "/assets/personal/climb-malaysia-1.jpg", cap: "Malaysia climb" },
  { src: "/assets/personal/climb-malaysia-2.jpg", cap: "Malaysia" },
  { src: "/assets/personal/climb-malaysia-3.jpg", cap: "Summit" },
  { src: "/assets/personal/sweden-audience.jpg", cap: "Sweden lecture" },
  { src: "/assets/personal/sweden-waterfront.jpg", cap: "Sweden waterfront" },
  { src: "/assets/personal/sweden-malardalen.jpg", cap: "Mälardalen University" },
  { src: "/assets/personal/sfo-2022.jpg", cap: "San Francisco, 2022" },
  { src: "/assets/personal/forbes-me-print.jpg", cap: "Forbes ME, in print" },
  { src: "/assets/personal/in-the-woods.jpg", cap: "In the woods" },
  { src: "/assets/personal/boat.jpg", cap: "On the water" },
  { src: "/assets/personal/yoga.jpg", cap: "Morning practice" },
  { src: "/assets/personal/books.jpg", cap: "The reading pile" },
];

export default function GalleryPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Gallery" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px 56px" }}>
        <SectionMast n="00" label="The Archive · Speaking Gallery" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "end",
            marginBottom: 56,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
            }}
          >
            On stage.
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>In the room.</Mark>
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: INK70 }}>
            {SPEAKING_PHOTOS.length} photographs from keynotes, panels, workshops,
            and events across four countries — Pakistan, Malaysia, Indonesia, and
            the UAE. From Peshawar to Bali, Dubai to Kuala Lumpur.
          </p>
        </div>
      </section>

      {/* ── Speaking photo grid ──────────────────────────────── */}
      <section style={{ padding: "0 56px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {SPEAKING_PHOTOS.map(({ src, caption, event }) => (
            <div key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={caption}
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block",
                  filter: "sepia(0.06) contrast(1.02)",
                  border: `1px solid ${INK35}`,
                }}
              />
              <div style={{ marginTop: 6 }}>
                <SCaps size={10} ls="0.12em" color={INK55}>
                  {caption}
                </SCaps>
                <div>
                  <SCaps size={9.5} ls="0.10em" color={INK35}>
                    {event}
                  </SCaps>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Personal archive ─────────────────────────────────── */}
      <section style={{ padding: "72px 56px 80px", background: PAPER2 }}>
        <SectionMast n="01" label="Personal Archive · Beyond the Bureau" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}
        >
          {PERSONAL_PHOTOS.map(({ src, cap }) => (
            <div key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={cap}
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block",
                  filter: "sepia(0.06)",
                  border: `1px solid ${INK35}`,
                }}
              />
              <div style={{ marginTop: 6 }}>
                <SCaps size={9.5} ls="0.10em" color={INK55}>
                  {cap}
                </SCaps>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="02" />
      <Colophon />
    </div>
  );
}

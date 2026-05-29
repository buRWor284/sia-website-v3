"use client";

import { useMemo, useState } from "react";
import { SCaps } from "@/components/bureau/primitives";
import {
  GROT, INK, INK15, INK55, INK70, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemType    = "speaking" | "travel" | "friends" | "hobbies";
type ItemFormat  = "photo" | "video";
type ItemBase    = { type: ItemType; country: string | null };
type PhotoItem   = ItemBase & { format: "photo"; src: string; cap: string; venue: string };
type VideoItem   = ItemBase & { format: "video"; id: string; title: string; where: string; startAt?: number };
type GalleryItem = PhotoItem | VideoItem;

// ─── Data ─────────────────────────────────────────────────────────────────────

const GA = (f: string) => `/assets/gallery/${f}`;

const ALL_ITEMS: ReadonlyArray<GalleryItem> = [

  // ── SPEAKING · UAE ────────────────────────────────────────────────────────
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-banner.jpg"),        cap:'MPS2016 · "Personal Branding for Founders"',       venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-audience-wide.jpg"), cap:"MPS2016 audience · wide hall, Dubai trade centre",  venue:"MPS Dubai · 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("atm-dubai-panel.jpg"),   cap:"Panel · Marketing to the Modern Muslim Traveller",  venue:"ATM Dubai · Apr 2018" },
  { format:"photo", type:"speaking", country:"UAE", src:GA("in5-dubai.jpg"),          cap:"Media Hacks · Free Publicity Online",               venue:"IN5 · Dubai · 2018"   },
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-emirati.jpg"),        cap:"Emirati attendees at MPS2016",                      venue:"MPS Dubai · 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-audience.jpg"),       cap:"Audience question · MPS2016",                       venue:"MPS Dubai · 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-zoom.jpg"),           cap:"Listening in · MPS2016",                            venue:"MPS Dubai · 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("astrolabs-1.jpg"),        cap:"Astrolabs · Growth Hacking Your Brand",             venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("astrolabs-2.jpg"),        cap:"Astrolabs · Growth Hacking",                        venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("astrolabs-3.jpg"),        cap:"Astrolabs · Growth Hacking",                        venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("astrolabs-4.jpg"),        cap:"Astrolabs · Growth Hacking",                        venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("ik-audience.jpg"),        cap:"Audience · IK Institute of Business",               venue:"Dubai · Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("ik-workshop.jpg"),        cap:"IK Institute workshop audience",                    venue:"Dubai"                },
  { format:"photo", type:"speaking", country:"UAE", src:GA("ik-cospeaker.jpg"),       cap:"Co-speaker · IK Institute workshop",                venue:"Dubai"                },
  { format:"photo", type:"speaking", country:"UAE", src:GA("ik-cotrainer.jpg"),       cap:"Co-trainer · IK Institute workshop",                venue:"Dubai"                },

  // ── SPEAKING · PAKISTAN ───────────────────────────────────────────────────
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("empower-pakistan.jpg"), cap:"Empower Pakistan · World Bank Group",       venue:"Pakistan"        },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("startup-grind.jpg"),    cap:"Startup Grind · Powered by Google",         venue:"Peshawar"        },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("empower-pk-group.jpg"), cap:"Empower Pakistan · group photograph",       venue:"Pakistan"        },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("uop-talk.jpg"),          cap:"University of Peshawar talk",               venue:"Peshawar"        },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("iydc-panel.jpg"),        cap:"Panel · Social Media @ IYDC",               venue:"Peshawar · 2015" },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("gdayx-1.jpg"),           cap:"Keynote at G-Day X",                        venue:"Peshawar · 2014" },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("gdayx-2.jpg"),           cap:"G-Day X audience",                          venue:"Peshawar · 2014" },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("gdayx-3.jpg"),           cap:"G-Day X room",                              venue:"Peshawar · 2014" },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("gdayx-img1816.jpg"),     cap:"Speaking at G-Day X",                       venue:"Peshawar"        },

  // ── SPEAKING · INDONESIA ──────────────────────────────────────────────────
  { format:"photo", type:"speaking", country:"Indonesia", src:GA("dmss-bali.jpg"),              cap:"Media Hacks workshop",                    venue:"DMSS · Bali · Oct 2017" },
  { format:"photo", type:"speaking", country:"Indonesia", src:GA("dmss-speakers-grid.jpg"),     cap:"Among the DMSS speaker roster",           venue:"DMSS Bali 2017"         },
  { format:"photo", type:"speaking", country:"Indonesia", src:GA("dmss-speaking-at.jpg"),       cap:'"I\'m speaking at DMSS" card',             venue:"Bali · 2017"            },
  { format:"photo", type:"speaking", country:"Indonesia", src:GA("dmss-media-hacks-slide.jpg"), cap:"On the screen · Media Hacks title slide", venue:"DMSS Bali"              },

  // ── FRIENDS ───────────────────────────────────────────────────────────────
  { format:"photo", type:"friends", country:"UAE",       src:GA("with-irfan-khairi.jpg"),   cap:"With Irfan Khairi · founder, IK Institute", venue:"Dubai"          },
  { format:"photo", type:"friends", country:"Indonesia", src:GA("with-agnieszka-bali.jpg"), cap:'With Agnieszka · "I am in Bali now"',        venue:"DMSS Bali 2017" },
  { format:"photo", type:"friends", country:"Indonesia", src:GA("with-egor-borushko.jpg"),  cap:"With Egor Borushko · Time Doctor",           venue:"DMSS Bali 2017" },

  // ── TRAVEL · UAE ──────────────────────────────────────────────────────────
  { format:"photo", type:"travel", country:"UAE", src:"/assets/gallery/forbes-me-visit.jpg",  cap:"At Forbes Middle East · APH",            venue:"Dubai"        },
  { format:"photo", type:"travel", country:"UAE", src:"/assets/gallery/dubai-beach-2018.jpg", cap:"Dubai beach · Burj Al Arab in the back", venue:"Dubai · 2018" },
  { format:"photo", type:"travel", country:"UAE", src:"/assets/gallery/dubai-mall-2017.jpg",  cap:"Dubai Mall",                             venue:"Dubai · 2017" },

  // ── TRAVEL · INDONESIA ────────────────────────────────────────────────────
  { format:"photo", type:"travel", country:"Indonesia", src:"/assets/gallery/dmss-group-pano.jpg", cap:"DMSS Bali 2017 · group panorama", venue:"Bali · Oct 2017" },
  { format:"photo", type:"travel", country:"Indonesia", src:"/assets/gallery/dmss-venue.jpg",       cap:"The Trans Resort · DMSS venue",   venue:"Bali"            },
  { format:"photo", type:"travel", country:"Indonesia", src:"/assets/gallery/bali-galleria.jpg",    cap:"Arriving at Mal Bali Galleria",   venue:"Bali · 2017"     },

  // ── HOBBIES · Wall Climbing ───────────────────────────────────────────────
  { format:"photo", type:"hobbies", country:"USA",    src:GA("wall-climbing-usa-1.jpg"),  cap:"Wall climbing · indoor route", venue:"USA"    },
  { format:"photo", type:"hobbies", country:"USA",    src:GA("wall-climbing-usa-2.jpg"),  cap:"Wall climbing · top rope",     venue:"USA"    },
  { format:"photo", type:"hobbies", country:"Sweden", src:GA("wall-climbing-sweden.jpg"), cap:"Wall climbing · bouldering",   venue:"Sweden" },

  // ── VIDEOS ────────────────────────────────────────────────────────────────
  { format:"video", type:"speaking", country:"UAE",       id:"uSn4s5ZbJcQ", title:"Panel · Marketing to the Modern Muslim Traveller", where:"ATM Dubai, UAE · April 2018",    startAt:743 },
  { format:"video", type:"speaking", country:"UAE",       id:"2mJ3o2LyWAc", title:"Media Hacks · Free Publicity Online",              where:"IN5, Dubai, UAE · 2018"          },
  { format:"video", type:"speaking", country:"Malaysia",  id:"50SIoLI-TW4", title:"Digital Marketing Workshop @ MaGIC",               where:"Cyberjaya, Malaysia · 2016"      },
  { format:"video", type:"speaking", country:"Indonesia", id:"OwQpDj4c1LE", title:"DMSS Conference · Media Hacks workshop",           where:"Bali, Indonesia · October 2017"  },
  { format:"video", type:"speaking", country:"Pakistan",  id:"rRUS5dlJdc4", title:"Personal Branding Workshop",                       where:"Durshal, KP, Pakistan"           },
  { format:"video", type:"speaking", country:null,        id:"zBUeBo4srpA", title:"Writing Your Way to Success",                      where:"20-min webinar · 3 case studies" },
];

const PLAYLIST = "https://www.youtube.com/playlist?list=PLY3hQIOPokON_uNiEcWBJXBf43FSswXtY";

const FILTER_TYPES     = ["Speaking", "Travel", "Hobbies", "Friends"] as const;
const FILTER_COUNTRIES = ["UAE", "Pakistan", "Indonesia", "Malaysia", "USA", "Turkey", "Denmark", "Sweden", "Germany"] as const;

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type FilterBarProps = {
  activeTypes:     string[];  setActiveTypes:     (v: string[]) => void;
  activeCountries: string[];  setActiveCountries: (v: string[]) => void;
  activeFormats:   string[];  setActiveFormats:   (v: string[]) => void;
  filteredCount:   number;
  totalCount:      number;
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

const FilterBar = ({
  activeTypes,     setActiveTypes,
  activeCountries, setActiveCountries,
  activeFormats,   setActiveFormats,
  filteredCount,   totalCount,
}: FilterBarProps) => {
  const hasFilters = activeTypes.length > 0 || activeCountries.length > 0 || activeFormats.length > 0;

  const chipSt = (active: boolean, dim: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    margin: "6px 3px",
    background: active ? PAPER : "transparent",
    color: active ? INK : dim ? "rgba(241,235,222,.22)" : "rgba(241,235,222,.72)",
    border: `1px solid ${active ? PAPER : "transparent"}`,
    cursor: dim ? "default" : "pointer",
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    transition: "background 0.12s, color 0.12s, border-color 0.12s",
    whiteSpace: "nowrap" as const,
    lineHeight: 1,
  });

  const divSt: React.CSSProperties = {
    borderRight: "1px solid rgba(241,235,222,.14)",
    paddingRight: 16,
    marginRight: 16,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const,
  };

  return (
    <div className="gallery-filter-bar">
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", flex: 1 }}>

        {/* Type */}
        <div style={divSt}>
          <SCaps size={9} ls="0.24em" color="rgba(241,235,222,.42)" style={{ marginRight: 10, whiteSpace: "nowrap" }}>
            Type
          </SCaps>
          {FILTER_TYPES.map(t => {
            const val  = t.toLowerCase() as ItemType;
            const active = activeTypes.includes(val);
            const dim    = !ALL_ITEMS.some(i => i.type === val);
            return (
              <button key={t} style={chipSt(active, dim)}
                onClick={() => !dim && setActiveTypes(toggle(activeTypes, val))}>
                {t}
              </button>
            );
          })}
        </div>

        {/* Country */}
        <div style={{ ...divSt, flexWrap: "wrap" }}>
          <SCaps size={9} ls="0.24em" color="rgba(241,235,222,.42)" style={{ marginRight: 10, whiteSpace: "nowrap" }}>
            Country
          </SCaps>
          {FILTER_COUNTRIES.map(c => {
            const active = activeCountries.includes(c);
            const dim    = !ALL_ITEMS.some(i => i.country === c);
            return (
              <button key={c} style={chipSt(active, dim)}
                onClick={() => !dim && setActiveCountries(toggle(activeCountries, c))}>
                {c}
              </button>
            );
          })}
        </div>

        {/* Format */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <SCaps size={9} ls="0.24em" color="rgba(241,235,222,.42)" style={{ marginRight: 10, whiteSpace: "nowrap" }}>
            Format
          </SCaps>
          {([ ["Photos", "photo"], ["Videos", "video"] ] as const).map(([label, val]) => {
            const active = activeFormats.includes(val);
            return (
              <button key={val} style={chipSt(active, false)}
                onClick={() => setActiveFormats(toggle(activeFormats, val))}>
                {label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Count + clear */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0, marginLeft: 20 }}>
        <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.42)">
          Showing{" "}
          <span style={{ color: PAPER, fontWeight: 900 }}>{filteredCount}</span>
          {" "}of{" "}
          <span style={{ color: PAPER, fontWeight: 900 }}>{totalCount}</span>
          {" "}items
        </SCaps>
        {hasFilters && (
          <button
            onClick={() => { setActiveTypes([]); setActiveCountries([]); setActiveFormats([]); }}
            style={{
              padding: "5px 13px",
              background: "transparent",
              color: "rgba(241,235,222,.5)",
              border: "1px solid rgba(241,235,222,.25)",
              cursor: "pointer",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Clear ×
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Video Card ───────────────────────────────────────────────────────────────

const VideoCard = ({ v, i }: { v: VideoItem; i: number }) => (
  <div style={{ background: INK, color: PAPER, padding: 16, border: `1px solid ${INK}` }}>
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      paddingBottom: 12, borderBottom: "1px solid rgba(241,235,222,.2)", marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: YEL }} />
        <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.8)">Reel № 0{i + 1}</SCaps>
      </div>
      <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.45)">YouTube</SCaps>
    </div>
    <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(241,235,222,.2)", overflow: "hidden" }}>
      <iframe
        src={`https://www.youtube.com/embed/${v.id}?rel=0${v.startAt ? `&start=${v.startAt}` : ""}`}
        title={v.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </div>
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(241,235,222,.2)" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: PAPER, lineHeight: 1.2 }}>{v.title}</div>
      <div style={{ marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: "rgba(241,235,222,.72)", lineHeight: 1.4 }}>{v.where}</div>
    </div>
  </div>
);

// ─── Photo Card ───────────────────────────────────────────────────────────────

const PhotoCard = ({ p }: { p: PhotoItem }) => (
  <figure style={{ margin: 0, background: PAPER2, border: `1px solid ${INK}`, padding: 10, display: "flex", flexDirection: "column" }}>
    <div style={{ aspectRatio: "4/3", overflow: "hidden", border: `1px solid ${INK}`, background: "#222" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={p.cap} loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
    <figcaption style={{ padding: "8px 4px 2px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK, lineHeight: 1.35 }}>{p.cap}</div>
      <SCaps size={9.5} ls="0.14em" color={INK55}>{p.venue}</SCaps>
    </figcaption>
  </figure>
);

// ─── Section label ────────────────────────────────────────────────────────────

const GalleryMast = ({ label, count }: { label: string; count: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
    <SCaps size={9.5} ls="0.22em" color={INK55}>
      {label} &nbsp;·&nbsp; {count} {count === 1 ? "item" : "items"}
    </SCaps>
    <div style={{ flex: 1, height: 1, background: INK15 }} />
  </div>
);

// ─── Gallery Body ─────────────────────────────────────────────────────────────

const GalleryBody = ({ videos, photos }: { videos: VideoItem[]; photos: PhotoItem[] }) => {
  if (videos.length === 0 && photos.length === 0) {
    return (
      <section className="sx" style={{ background: PAPER, paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
        <SCaps size={12} ls="0.22em" color={INK55}>No items match your filters</SCaps>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: INK70 }}>
          Try removing a filter or two.
        </p>
      </section>
    );
  }

  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 90 }}>

      {/* Videos first */}
      {videos.length > 0 && (
        <div style={{ marginBottom: photos.length > 0 ? 64 : 0 }}>
          <GalleryMast label="Reels" count={videos.length} />
          <div className="grid-videos-2">
            {videos.map((v, i) => <VideoCard key={v.id} v={v} i={i} />)}
          </div>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
            <a href={PLAYLIST} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "14px 22px", background: INK, color: PAPER,
              textDecoration: "none", fontFamily: GROT, fontWeight: 800,
              fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              Open full playlist on YouTube ↗
            </a>
          </div>
        </div>
      )}

      {/* Photos second */}
      {photos.length > 0 && (
        <div>
          <GalleryMast label="Photographs" count={photos.length} />
          <div className="gallery-grid-photos">
            {photos.map((p, i) => <PhotoCard key={i} p={p} />)}
          </div>
        </div>
      )}

    </section>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────

export default function GalleryClient() {
  const [activeTypes,     setActiveTypes]     = useState<string[]>([]);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [activeFormats,   setActiveFormats]   = useState<string[]>([]);

  const filtered = useMemo(() => ALL_ITEMS.filter(item => {
    const tMatch = activeTypes.length     === 0 || activeTypes.includes(item.type);
    const cMatch = activeCountries.length === 0 || activeCountries.includes(item.country ?? "");
    const fMatch = activeFormats.length   === 0 || activeFormats.includes(item.format);
    return tMatch && cMatch && fMatch;
  }), [activeTypes, activeCountries, activeFormats]);

  const photos = filtered.filter((i): i is PhotoItem => i.format === "photo");
  const videos = filtered.filter((i): i is VideoItem => i.format === "video");

  return (
    <>
      <FilterBar
        activeTypes={activeTypes}         setActiveTypes={setActiveTypes}
        activeCountries={activeCountries} setActiveCountries={setActiveCountries}
        activeFormats={activeFormats}     setActiveFormats={setActiveFormats}
        filteredCount={filtered.length}
        totalCount={ALL_ITEMS.length}
      />
      <GalleryBody videos={videos} photos={photos} />
    </>
  );
}

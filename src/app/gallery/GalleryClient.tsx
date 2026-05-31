"use client";

import { useMemo, useState } from "react";
import { Mark, SCaps } from "@/components/bureau/primitives";
import {
  CALENDLY, GROT, INK, INK15, INK55, INK70, PAPER, PAPER2, SERIF, YEL,
} from "@/lib/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemType   = "speaking" | "travel" | "friends" | "hobbies";
type PhotoItem  = { format: "photo";  type: ItemType; country: string | null; src: string; cap: string; venue: string; featured?: boolean };
type VideoItem  = { format: "video";  type: ItemType; country: string | null; id: string; title: string; where: string; startAt?: number };
type GalleryItem = PhotoItem | VideoItem;

// ─── Data ─────────────────────────────────────────────────────────────────────

const GA = (f: string) => `/assets/gallery/${f}`;

const ALL_ITEMS: ReadonlyArray<GalleryItem> = [

  // ── FEATURED ───────────────────────────────────────────────────────────────
  { format:"photo", type:"travel", country:"Indonesia", src:GA("bali-galleria.jpg"), cap:"Mal Bali Galleria. Last-minute visa, 24 hours of flights, straight into delivering a workshop at DMSS, then finally a moment to breathe. Two hours later I flew to Dubai for another one.", venue:"Bali, 2017", featured:true },

  // ── SPEAKING · UAE (3 curated) ────────────────────────────────────────────
  { format:"photo", type:"speaking", country:"UAE", src:GA("mps-banner.jpg"),      cap:'MPS2016, "Personal Branding for Founders"',       venue:"Dubai, Oct 2016"     },
  { format:"photo", type:"speaking", country:"UAE", src:GA("atm-dubai-panel.jpg"), cap:"Panel, Marketing to the Modern Muslim Traveller", venue:"ATM Dubai, Apr 2018" },
  { format:"photo", type:"speaking", country:"UAE", src:GA("astrolabs-1.jpg"),     cap:"Astrolabs, Growth Hacking Your Brand",            venue:"Dubai, Oct 2016"     },

  // ── SPEAKING · INDONESIA (1 curated) ──────────────────────────────────────
  { format:"photo", type:"speaking", country:"Indonesia", src:GA("dmss-bali.jpg"), cap:"Media Hacks workshop", venue:"DMSS, Bali, Oct 2017" },

  // ── TRAVEL (2 curated) ────────────────────────────────────────────────────
  { format:"photo", type:"travel", country:"UAE",       src:GA("forbes-me-visit.jpg"), cap:"At Forbes Middle East, APH",     venue:"Dubai"          },
  { format:"photo", type:"travel", country:"Indonesia", src:GA("dmss-group-pano.jpg"), cap:"DMSS Bali 2017, group panorama", venue:"Bali, Oct 2017" },

  // ── SPEAKING · PAKISTAN (2 curated, placed mid-gallery) ───────────────────
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("empower-pakistan.jpg"), cap:"Empower Pakistan, World Bank Group", venue:"Pakistan" },
  { format:"photo", type:"speaking", country:"Pakistan", src:GA("startup-grind.jpg"),    cap:"Startup Grind, Powered by Google",  venue:"Peshawar" },

  // ── FRIENDS (1 curated) ───────────────────────────────────────────────────
  { format:"photo", type:"friends", country:"UAE", src:GA("with-irfan-khairi.jpg"), cap:"With Irfan Khairi, founder of IK Institute", venue:"Dubai" },

  // ── HOBBIES (2 curated) ───────────────────────────────────────────────────
  { format:"photo", type:"hobbies", country:"Malaysia", src:GA("wall-climbing-malaysia-1.jpg"), cap:"Wall climbing, indoor route", venue:"Malaysia" },
  { format:"photo", type:"hobbies", country:"Malaysia", src:GA("wall-climbing-malaysia-2.jpg"), cap:"Wall climbing, top rope",     venue:"Malaysia" },

  // ── VIDEOS ────────────────────────────────────────────────────────────────
  { format:"video", type:"speaking", country:"UAE",       id:"uSn4s5ZbJcQ", title:"Panel · Marketing to the Modern Muslim Traveller", where:"ATM Dubai, UAE · April 2018",    startAt:743 },
  { format:"video", type:"speaking", country:"UAE",       id:"2mJ3o2LyWAc", title:"Media Hacks · Free Publicity Online",              where:"IN5, Dubai, UAE · 2018"          },
  { format:"video", type:"speaking", country:"Malaysia",  id:"50SIoLI-TW4", title:"Digital Marketing Workshop @ MaGIC",               where:"Cyberjaya, Malaysia · 2016"      },
  { format:"video", type:"speaking", country:"Indonesia", id:"OwQpDj4c1LE", title:"DMSS Conference · Media Hacks workshop",           where:"Bali, Indonesia · October 2017"  },
  { format:"video", type:"speaking", country:"Pakistan",  id:"rRUS5dlJdc4", title:"Personal Branding Workshop",                       where:"Durshal, KP, Pakistan"           },
  { format:"video", type:"speaking", country:null,        id:"zBUeBo4srpA", title:"Writing Your Way to Success",                      where:"20-min webinar · 3 case studies" },
];

const PLAYLIST    = "https://www.youtube.com/playlist?list=PLY3hQIOPokON_uNiEcWBJXBf43FSswXtY";
const TOTAL_PHOTOS = ALL_ITEMS.filter(i => i.format === "photo").length;
const TOTAL_VIDEOS = ALL_ITEMS.filter(i => i.format === "video").length;
const TOTAL_ITEMS  = ALL_ITEMS.length;

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

const FILTER_TYPES     = ["Speaking", "Travel", "Hobbies", "Friends"] as const;
const FILTER_COUNTRIES = ["UAE", "Pakistan", "Indonesia", "Malaysia", "USA", "Turkey", "Denmark", "Sweden", "Germany"] as const;

// ─── Hero ─────────────────────────────────────────────────────────────────────
// 5-col grid: auto | 1px rule | 1fr | 1px rule | auto
// Count and deck stats update live with filter state.

const Hero = () => {
  return (
    <div className="gallery-hero">
      {/* Ghost background word */}
      <div aria-hidden className="gallery-hero-bg" style={{ fontFamily: GROT }}>GALLERY</div>

      {/* Left · stats */}
      <div className="gallery-hero-left">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { num: "3", label: "Continents" },
            { num: "9", label: "Countries" },
            { num: String(TOTAL_PHOTOS + TOTAL_VIDEOS), label: "Moments captured" },
          ].map(s => (
            <div key={s.label}>
              <div style={{
                fontFamily: SERIF, fontWeight: 700,
                fontSize: "clamp(32px,4vw,52px)",
                color: INK, lineHeight: 0.95, letterSpacing: "-0.04em",
              }}>
                {s.num}
              </div>
              <SCaps size={8.5} ls="0.22em" color={INK55} style={{ marginTop: 4 }}>
                {s.label}
              </SCaps>
            </div>
          ))}
        </div>
      </div>

      {/* Rule */}
      <div className="gallery-hero-rule" />

      {/* Centre · headline */}
      <div className="gallery-hero-main">
        <SCaps size={9.5} ls="0.24em" color={INK55}>
          A visual record &nbsp;·&nbsp; On stage &amp; on the road
        </SCaps>
        <h1 style={{
          margin: 0,
          fontFamily: SERIF, fontWeight: 700,
          fontSize: "clamp(22px,3.2vw,40px)",
          color: INK, lineHeight: 1.02, letterSpacing: "-0.02em",
        }}>
          {toWord(TOTAL_PHOTOS)} photographs.<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>
            {toWord(TOTAL_VIDEOS)} reels. Three continents.
          </em>
        </h1>
        <p style={{
          margin: 0,
          fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5,
          color: INK70, lineHeight: 1.4,
        }}>
          Speaking engagements, travel, and the people in between. 2014 to 2018.
        </p>
      </div>

      {/* Rule */}
      <div className="gallery-hero-rule" />

      {/* Right · locations */}
      <div className="gallery-hero-right">
        {[
          { city: "Dubai",    sub: "UAE · 2016 to 2018"      },
          { city: "Bali",     sub: "Indonesia · 2017"      },
          { city: "Peshawar", sub: "Pakistan · 2014 to 2015" },
        ].map(loc => (
          <div key={loc.city} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1, letterSpacing: "-0.01em" }}>
              {loc.city}
            </span>
            <SCaps size={8.5} ls="0.18em" color={INK55}>{loc.sub}</SCaps>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
// Light (PAPER) background, ink-bordered chips, active = ink fill.

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
  activeTypes, setActiveTypes,
  activeCountries, setActiveCountries,
  activeFormats, setActiveFormats,
  filteredCount, totalCount,
}: FilterBarProps) => {
  const hasFilters = activeTypes.length > 0 || activeCountries.length > 0 || activeFormats.length > 0;

  const chipSt = (active: boolean, dim: boolean): React.CSSProperties => ({
    padding: "5px 12px",
    background: active ? INK : "transparent",
    color: active ? PAPER : INK,
    border: `1px solid ${INK}`,
    opacity: dim ? 0.38 : 1,
    cursor: dim ? "default" : "pointer",
    fontFamily: GROT, fontWeight: 700, fontSize: 10,
    letterSpacing: "0.12em", textTransform: "uppercase" as const,
    transition: "background 0.12s, color 0.12s",
    whiteSpace: "nowrap" as const,
  });

  const labelSt: React.CSSProperties = {
    fontFamily: GROT, fontWeight: 700, fontSize: 9,
    letterSpacing: "0.22em", textTransform: "uppercase" as const,
    color: INK55, whiteSpace: "nowrap" as const, minWidth: 52,
  };

  return (
    <div className="gallery-filter-bar">
      <div className="gallery-filter-groups">

        {/* Type */}
        <div className="gallery-filter-group">
          <span style={labelSt}>Type</span>
          {FILTER_TYPES.map(t => {
            const val    = t.toLowerCase() as ItemType;
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
        <div className="gallery-filter-group">
          <span style={labelSt}>Country</span>
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
        <div className="gallery-filter-group">
          <span style={labelSt}>Format</span>
          {([ ["Photos", "photo"], ["Videos", "video"] ] as const).map(([label, val]) => (
            <button key={val} style={chipSt(activeFormats.includes(val), false)}
              onClick={() => setActiveFormats(toggle(activeFormats, val))}>
              {label}
            </button>
          ))}
        </div>

      </div>

      {/* Footer: count + clear */}
      <div className="gallery-filter-footer">
        <SCaps size={10} ls="0.18em" color={INK55}>
          Showing{" "}
          <span style={{ color: INK }}>{filteredCount}</span>
          {" "}of{" "}
          <span style={{ color: INK }}>{totalCount}</span>
          {" "}items
        </SCaps>
        {hasFilters && (
          <button
            onClick={() => { setActiveTypes([]); setActiveCountries([]); setActiveFormats([]); }}
            style={{
              padding: "4px 12px", background: "transparent",
              color: INK55, border: `1px solid rgba(26,20,16,.3)`,
              cursor: "pointer", fontFamily: GROT, fontWeight: 700,
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            }}
          >
            Clear all ×
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Video Card ───────────────────────────────────────────────────────────────

// ─── Photo Card ───────────────────────────────────────────────────────────────

// Featured photo: side-by-side layout (image left, caption right)
const FeaturedPhotoCard = ({ p }: { p: PhotoItem }) => (
  <div style={{
    background: PAPER2, border: `1px solid ${INK}`, padding: 10,
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
  }}>
    <div style={{
      aspectRatio: "4/3",
      overflow: "hidden", border: `1px solid ${INK}`, background: "#222", position: "relative",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={p.cap} loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
    <div style={{
      padding: "24px 28px",
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 16,
      borderLeft: `1px solid ${INK}`,
    }}>
      <div style={{
        fontFamily: SERIF, fontStyle: "italic",
        fontSize: 19, color: INK, lineHeight: 1.45,
      }}>{p.cap}</div>
      <SCaps size={10} ls="0.18em" color={INK55}>{p.venue}</SCaps>
    </div>
  </div>
);

// Regular photo card
const PhotoCard = ({ p }: { p: PhotoItem }) => (
  <div style={{
    background: PAPER2, border: `1px solid ${INK}`, padding: 10,
    display: "flex", flexDirection: "column",
  }}>
    <div style={{
      aspectRatio: "4/3",
      overflow: "hidden", border: `1px solid ${INK}`, background: "#222", position: "relative",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={p.cap} loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
    <div style={{
      padding: "8px 4px 2px",
      display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12,
    }}>
      <div style={{
        fontFamily: SERIF, fontStyle: "italic", fontSize: 13,
        color: INK, lineHeight: 1.35,
      }}>{p.cap}</div>
      <SCaps size={9} ls="0.14em" color={INK55} style={{ whiteSpace: "nowrap" }}>{p.venue}</SCaps>
    </div>
  </div>
);

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ dotColor, label, count }: { dotColor: string; label: string; count: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
    fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.22em",
    textTransform: "uppercase", color: INK55,
  }}>
    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
    {label} &nbsp;·&nbsp; {count} selected
    <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,.2)", marginLeft: 8 }} />
  </div>
);

// ─── Video Reel Player (speaking-page style) ─────────────────────────────────

const VideoReelPlayer = ({ videos }: { videos: VideoItem[] }) => {
  const [active, setActive] = useState(0);
  const v = videos[active];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "340px 1fr", gap: 0,
      background: INK, border: `1px solid ${INK}`,
    }}>
      {/* Left: reel list */}
      <div style={{ borderRight: "1px solid rgba(241,235,222,.18)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(241,235,222,.18)" }}>
          <h3 style={{
            margin: 0, fontFamily: SERIF, fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 32px)", color: PAPER, lineHeight: 1.0, letterSpacing: "-0.02em",
          }}>
            Six reels<br />
            <span style={{ fontStyle: "italic", color: YEL }}>from the road.</span>
          </h3>
          <p style={{ marginTop: 10, fontFamily: SERIF, fontSize: 13.5, color: "rgba(241,235,222,.6)", lineHeight: 1.45 }}>
            Click any reel to play.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {videos.map((r, i) => {
            const isActive = i === active;
            return (
              <button key={r.id} onClick={() => setActive(i)} style={{
                display: "grid", gridTemplateColumns: "80px 1fr",
                gap: 10, padding: "10px 12px", textAlign: "left",
                background: isActive ? "rgba(245,184,31,.14)" : "transparent",
                borderBottom: "1px solid rgba(241,235,222,.12)",
                borderTop: "none", borderLeft: isActive ? `3px solid ${YEL}` : "3px solid transparent",
                borderRight: "none",
                cursor: "pointer", color: PAPER, font: "inherit",
                transition: "background 0.12s",
              }}>
                <div style={{ width: 80, height: 50, background: "#000", position: "relative", overflow: "hidden", border: "1px solid rgba(241,235,222,.22)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {isActive && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(245,184,31,.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 0, height: 0, borderLeft: `10px solid ${YEL}`, borderTop: "7px solid transparent", borderBottom: "7px solid transparent" }} />
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13, lineHeight: 1.25, color: PAPER, overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                  <div style={{ marginTop: 4 }}><SCaps size={8.5} ls="0.14em" color="rgba(241,235,222,.5)">{r.where}</SCaps></div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid rgba(241,235,222,.18)" }}>
          <a href={PLAYLIST} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 16px", background: "transparent", color: PAPER,
            textDecoration: "none", fontFamily: GROT, fontWeight: 700,
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            border: `1px solid rgba(241,235,222,.3)`,
          }}>
            Full playlist on YouTube ↗
          </a>
        </div>
      </div>

      {/* Right: main player */}
      <div style={{ padding: 14 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "4px 4px 12px", borderBottom: "1px solid rgba(241,235,222,.25)", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: YEL }} />
            <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.85)">
              Now playing · Reel № {String(active + 1).padStart(2, "0")}
            </SCaps>
          </div>
        </div>
        <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(241,235,222,.25)", overflow: "hidden" }}>
          <iframe
            key={v.id}
            src={`https://www.youtube.com/embed/${v.id}?rel=0${v.startAt ? `&start=${v.startAt}` : ""}`}
            title={v.title} loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(241,235,222,.25)" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 22px)", color: PAPER, lineHeight: 1.2 }}>{v.title}</div>
          <div style={{ marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(241,235,222,.75)", lineHeight: 1.4 }}>{v.where}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Gallery Body ─────────────────────────────────────────────────────────────

const GalleryBody = ({ videos, photos }: { videos: VideoItem[]; photos: PhotoItem[] }) => {
  if (videos.length === 0 && photos.length === 0) {
    return (
      <div style={{ padding: "80px 56px", textAlign: "center" }}>
        <SCaps size={12} ls="0.22em" color={INK55}>No items match your filters</SCaps>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: INK70 }}>
          Try removing a filter or two.
        </p>
      </div>
    );
  }

  // Featured is rendered above filter bar, only show non-featured here
  const regularPhotos = photos.filter(p => !p.featured);

  return (
    <div style={{ background: PAPER }}>

      {/* Video reel player */}
      {videos.length > 0 && (
        <div className="gallery-grid-section">
          <SectionLabel dotColor={YEL} label="Reels" count={videos.length} />
          <VideoReelPlayer videos={videos} />
        </div>
      )}

      {/* Photos in scrollable container */}
      {regularPhotos.length > 0 && (
        <div className="gallery-grid-section" style={{ paddingTop: videos.length > 0 ? 0 : undefined }}>
          <SectionLabel dotColor={INK} label="Photographs" count={regularPhotos.length} />
          <div style={{
            maxHeight: 720, overflowY: "auto",
            border: `1px solid ${INK}`, padding: 14, background: PAPER,
          }}>
            <div className="gallery-grid-photos">
              {regularPhotos.map((p, i) => <PhotoCard key={i} p={p} />)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

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
          padding: "16px 26px", background: INK, color: PAPER, textDecoration: "none",
          fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          See the speaker sheet →
        </a>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
          padding: "16px 26px", background: YEL, color: INK, textDecoration: "none",
          fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          Book a call →
        </a>
      </div>
    </div>
  </section>
);

// ─── Root ─────────────────────────────────────────────────────────────────────

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

  const photos     = filtered.filter((i): i is PhotoItem => i.format === "photo");
  const videos     = filtered.filter((i): i is VideoItem => i.format === "video");
  const hasFilters = activeTypes.length > 0 || activeCountries.length > 0 || activeFormats.length > 0;

  // Separate featured from filtered for layout ordering
  const featuredPhoto = photos.find(p => p.featured);

  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />

      {/* Featured photo above the filter bar */}
      {featuredPhoto && (
        <div className="gallery-grid-section" style={{ background: PAPER }}>
          <FeaturedPhotoCard p={featuredPhoto} />
        </div>
      )}

      <FilterBar
        activeTypes={activeTypes}         setActiveTypes={setActiveTypes}
        activeCountries={activeCountries} setActiveCountries={setActiveCountries}
        activeFormats={activeFormats}     setActiveFormats={setActiveFormats}
        filteredCount={filtered.length}
        totalCount={TOTAL_ITEMS}
      />
      <GalleryBody videos={videos} photos={photos} />
      <BookCTA />
    </div>
  );
}

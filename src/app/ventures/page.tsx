"use client";

import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
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

// ─── Types ───────────────────────────────────────────────────────────────────

type CurrentVenture = {
  tag: string;
  name: string;
  role: string;
  status: string;
  tagline: string;
  services: string[];
  description: string;
  cta: string;
  ctaUrl: string;
  events?: { name: string; loc: string }[];
};

type PastVenture = {
  tag: string;
  name: string;
  role: string;
  headline: string;
  description: string;
  milestones?: { label: string; detail: string }[];
  awards?: string[];
  clients?: string[];
  clientList?: { name: string; detail: string }[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

const CURRENT: ReadonlyArray<CurrentVenture> = [
  {
    tag: "Done-For-You Agency",
    name: "DMR.agency",
    role: "Founder & CEO",
    status: "Active",
    tagline: "Earn the attention you used to buy.",
    services: ["GEO — Generative Engine Optimisation", "SEO", "Content Marketing", "Digital PR & Earned Media"],
    description:
      "DMR.agency is a done-for-you digital marketing bureau specialising in earned media. We help B2B companies get found by AI, rank on search, and get covered by the press — without paying for every click. The playbook is built around the SIA paradigm: Spotlight, Influence, Authority.",
    cta: "Visit DMR.agency →",
    ctaUrl: "https://dmr.agency",
  },
  {
    tag: "Personal Brand + Speaking",
    name: "The SIA Bureau",
    role: "Editor-in-Chief",
    status: "Active",
    tagline: "Teaching earned media to founders who refuse to stay invisible.",
    services: ["Content Marketing", "Digital PR & Publicity", "SEO & GEO", "Keynotes & Workshops"],
    description:
      "The editorial home of the SIA paradigm. Through talks, workshops, and long-form writing, I teach founders and marketers how to own their authority rather than rent it from platforms. Speaking circuit across UAE, Malaysia, Indonesia, UK, Pakistan — and virtually, worldwide.",
    cta: "Speaking & Booking →",
    ctaUrl: "/speaking",
    events: [
      { name: "Arabian Travel Market", loc: "UAE" },
      { name: "DMSS", loc: "Indonesia" },
      { name: "MaGIC", loc: "Malaysia" },
      { name: "Astrolabs", loc: "UAE" },
      { name: "Empowered Summit", loc: "UAE" },
      { name: "Uhubs", loc: "UK" },
      { name: "IKSB", loc: "UAE" },
      { name: "World Bank", loc: "Pakistan" },
    ],
  },
  {
    tag: "Productised Framework",
    name: "EMOS",
    role: "Creator",
    status: "Active",
    tagline: "Own your authority. Stop renting it.",
    services: ["Earned Media Playbooks", "Digital PR Frameworks", "SEO-PR Integration", "Authority Acceleration"],
    description:
      "EMOS — the Earned Media Operating System — is the productised version of the methodology DMR.agency has refined over a decade. It gives marketing teams and solo operators the exact frameworks, templates, and workflows to build an earned media engine without starting from scratch.",
    cta: "Explore EMOS →",
    ctaUrl: "https://dmr.agency/earnedmediaos/",
  },
];

const PAST: ReadonlyArray<PastVenture> = [
  {
    tag: "Spatial Intelligence Startup",
    name: "Silk Route Interactive",
    role: "Co-founder & Chief Marketing Technology Officer",
    headline: "Award-winning startup that mapped crime — and won.",
    description:
      "A spatial intelligence company built on the conviction that data on a map could change how governments and citizens understood their world. The work proved that thesis in dramatic fashion.",
    milestones: [
      {
        label: "The Crime Mapper",
        detail:
          "Crime mapping & analysis solution. Pilot with Faisalabad Police: 34% reduction in crime rate within 3 months. Won Best Start-Up at P@SHA LaunchPad 2013.",
      },
      {
        label: "ElectoMap",
        detail:
          "Interactive geo-spatial elections coverage on a 55″ multi-touch HD screen. Used by ARY News during Pakistan General Elections 2013.",
      },
      {
        label: "JaagPakistan",
        detail:
          "Crowd-sourced anti-rigging platform. 20,000+ reports received on election day (11 May 2013) via SMS, Twitter, and email.",
      },
      {
        label: "MyVote",
        detail:
          "Map-based info portal where voters could find their NA/PA constituency number and location.",
      },
    ],
    awards: [
      "Best Start-Up · P@SHA LaunchPad 2013",
      "BlackBox.vc (Silicon Valley) Accelerator",
      "Finalist · i2i (Invest to Innovate)",
    ],
    clients: ["ARY News · Cable TV Channel", "City Police Faisalabad, Pakistan"],
  },
  {
    tag: "International Digital Media Company",
    name: "Ohyrus Inc.",
    role: "Chief Marketing Officer",
    headline: "Digital media for the world’s most growth-hungry SMEs.",
    description:
      "An international digital media company helping SMEs grow through Web 2.0, mobile, and internet marketing — serving over two dozen high-growth startups and SMEs across four continents.",
    clientList: [
      { name: "GIZ", detail: "German federal enterprise · 17,000+ staff · EUR 2B business volume" },
      { name: "Apartment List", detail: "World’s largest real estate search engine — San Francisco" },
      { name: "Zaarly", detail: "Proximity-based, real-time buyer-powered market platform" },
      { name: "YoorStore", detail: "Mobile-based C2C classifieds marketplace" },
      { name: "ITSdirect", detail: "Australia’s premiere computer e-commerce store" },
      { name: "UsedBook", detail: "C2C classifieds portal, Italy" },
      { name: "Austria Business Centre", detail: "Global network founded by the Kleindienst Group" },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="sx" style={{ background: PAPER }}>
      <div className="res-hero-grid">

        {/* Left: count */}
        <div className="res-hero-left">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
            3
          </div>
          <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
            Active<br />ventures
          </div>
        </div>

        {/* Centre: headline */}
        <div className="res-hero-center">
          <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
            VENTURES
          </div>
          <SCaps size={10} ls="0.24em" color={INK55}>
            Ventures &amp; Enterprises &nbsp;·&nbsp; Est. 2010
          </SCaps>
          <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
            The businesses<br />
            <em style={{ fontStyle: "italic", fontWeight: 600 }}>behind the bylines.</em>
          </h1>
          <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
            From DMR.agency to EMOS — the enterprises that power the bureau.
          </p>
        </div>

        {/* Right: topic index */}
        <div className="res-hero-right">
          {[
            { label: "DMR.agency",    sub: "Digital PR & SEO bureau" },
            { label: "The SIA Bureau", sub: "Speaking & publishing" },
            { label: "EMOS",          sub: "Earned media OS" },
          ].map(t => (
            <div key={t.label}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>{t.label}</div>
              <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>{t.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function VenturesLead() {
  const TICKER = [
    "Founder · DMR.agency",
    "The SIA Bureau",
    "Earned Media OS",
    "Digital PR",
    "GEO · SEO · Content Marketing",
    "International Speaker + Podcaster",
    "Spotlight · Influence · Authority",
    "Forbes · HBR · SEMrush · TNW · World Bank",
    "Authority Over Algorithms",
    "Content That Compounds",
  ];

  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 70 }}>
      <DoubleRule style={{ margin: "0 0 0" }} />

      {/* Ticker strip */}
      <div style={{ background: INK, padding: "11px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 56, whiteSpace: "nowrap", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.20em", textTransform: "uppercase", color: YEL }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 56 }}>
              {t}
              <span style={{ display: "inline-block", width: 4, height: 4, background: YEL, borderRadius: 999, flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      <DoubleRule style={{ marginBottom: 0 }} />

      {/* Lead + SIA aside */}
      <div style={{ display: "grid", gridTemplateColumns: "clamp(300px, 60%, 1fr) 1fr", gap: 64, alignItems: "start", marginTop: 40 }}>
        {/* Drop-cap lead */}
        <div style={{ columnCount: 2, columnGap: 28, fontFamily: SERIF, fontSize: 17.5, color: INK, lineHeight: 1.55, textAlign: "justify" }}>
          <p style={{ margin: 0 }}>
            <span style={{ float: "left", fontFamily: SERIF, fontWeight: 700, fontStyle: "italic", fontSize: 92, lineHeight: 0.78, marginRight: 10, marginTop: 6, color: INK, background: YEL, padding: "6px 8px 2px 8px" }}>
              E
            </span>
            very venture here is built on the same thesis: earned attention
            compounds. Paid reach rents your audience. Owned media, editorial
            credibility, and genuine authority — these are the assets that
            appreciate. DMR.agency executes it for clients. EMOS systemises it
            into a repeatable framework. The SIA Bureau teaches it to founders
            who want to own their distribution, not lease it.
          </p>
          <p style={{ marginTop: "0.7em" }}>
            The past ventures — Ohyrus and Silk Route Interactive — were built
            on the same instinct: use media, technology, and storytelling to
            give organisations leverage they otherwise couldn&rsquo;t afford.
            One won a national startup award and cut crime rates. The other
            served clients on four continents.
          </p>
          <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
            Different industries, same thread: build something worth covering,
            then make sure the world knows it exists.
          </p>
        </div>

        {/* SIA paradigm aside */}
        <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: 24 }}>
          <Pill size={11} ls="0.20em">The SIA Paradigm</Pill>
          <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 700 }}>
            Spotlight. Influence. Authority.
          </div>
          <div style={{ marginTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK70, lineHeight: 1.55 }}>
            Three forces that compound into earned credibility. And yes — the
            fact that the initials spell{" "}
            <strong style={{ fontStyle: "normal", color: INK }}>SIA</strong> is
            almost entirely a coincidence.{" "}
            <span style={{ fontStyle: "normal" }}>😉</span>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${INK15}`, display: "flex", flexDirection: "column", gap: 12 }}>
            {([
              ["S", "Spotlight", "Getting your story in front of the right journalists, editors, and outlets at exactly the right moment."],
              ["I", "Influence", "Building the credibility and reputation that makes your story worth covering in the first place."],
              ["A", "Authority", "Turning that coverage into compounding organic reach, domain authority, and lasting trust."],
            ] as [string, string, string][]).map(([k, title, desc]) => (
              <div key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, flexShrink: 0, background: INK, color: YEL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 14 }}>
                  {k}
                </div>
                <div>
                  <SCaps size={10} ls="0.14em" color={INK}>{title}</SCaps>
                  <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, lineHeight: 1.45, marginTop: 3 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function VentureCard({ v, n }: { v: CurrentVenture; n: string }) {
  return (
    <article
      style={{
        background: PAPER,
        border: `1px solid ${INK}`,
        padding: 32,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <Pill size={10.5} ls="0.18em">{v.tag}</Pill>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: YEL,
              border: `1px solid ${INK}`,
            }}
          />
          <SCaps size={10} ls="0.16em" color={INK70}>{v.status}</SCaps>
        </div>
      </div>

      <HRule color={INK15} style={{ marginBottom: 18 }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <SCaps size={10.5} ls="0.20em" color={INK55}>§ {n}</SCaps>
        <div
          style={{
            fontFamily: GROT,
            fontWeight: 900,
            fontSize: 36,
            color: INK,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {v.name}
        </div>
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 17,
          color: INK70,
          lineHeight: 1.35,
          marginBottom: 18,
        }}
      >
        {v.tagline}
      </div>

      <HRule color={INK15} style={{ marginBottom: 18 }} />

      <p
        style={{
          margin: "0 0 18px",
          fontFamily: SERIF,
          fontSize: 15.5,
          color: INK,
          lineHeight: 1.6,
        }}
      >
        {v.description}
      </p>

      {v.events && (
        <div style={{ marginBottom: 18 }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 8 }}>
            Key Events
          </SCaps>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {v.events.map((ev) => (
              <span
                key={ev.name}
                style={{
                  padding: "3px 9px 4px",
                  border: `1px solid ${INK}`,
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: INK,
                }}
              >
                {ev.name} · <span style={{ color: INK55 }}>{ev.loc}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 8 }}>
          What We Do
        </SCaps>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {v.services.map((s) => (
            <span
              key={s}
              style={{
                padding: "3px 9px 4px",
                background: PAPER2,
                border: `1px solid ${INK35}`,
                fontFamily: GROT,
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: INK70,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
        }}
      >
        <div>
          <SCaps size={10} ls="0.14em" color={INK55}>Role</SCaps>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: INK,
              marginTop: 2,
            }}
          >
            {v.role}
          </div>
        </div>
        <a
          href={v.ctaUrl}
          target={v.ctaUrl.startsWith("http") ? "_blank" : undefined}
          rel={v.ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          style={{
            padding: "11px 18px",
            background: INK,
            color: YEL,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {v.cta}
        </a>
      </div>
    </article>
  );
}

function CurrentVenturesSection() {
  return (
    <section style={{ background: PAPER2, padding: "80px 56px" }}>
      <SectionMast n="01" label="Current Ventures · Operating Now" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {CURRENT.map((v, i) => (
          <VentureCard
            key={v.name}
            v={v}
            n={String(i + 1).padStart(2, "0")}
          />
        ))}
      </div>
    </section>
  );
}

function PastVentureCard({ v, n }: { v: PastVenture; n: string }) {
  return (
    <article style={{ background: PAPER, border: `1px solid ${INK}`, padding: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <Pill size={10.5} ls="0.18em">{v.tag}</Pill>
        <SCaps size={10} ls="0.16em" color={INK55}>Past Venture</SCaps>
      </div>

      <HRule color={INK15} style={{ marginBottom: 18 }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <SCaps size={10.5} ls="0.20em" color={INK55}>§ {n}</SCaps>
        <div
          style={{
            fontFamily: GROT,
            fontWeight: 900,
            fontSize: 32,
            color: INK,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {v.name}
        </div>
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 17,
          color: INK70,
          lineHeight: 1.35,
          marginBottom: 18,
        }}
      >
        {v.headline}
      </div>

      <HRule color={INK15} style={{ marginBottom: 18 }} />

      <p
        style={{
          margin: "0 0 22px",
          fontFamily: SERIF,
          fontSize: 15.5,
          color: INK,
          lineHeight: 1.6,
        }}
      >
        {v.description}
      </p>

      {v.milestones && (
        <div style={{ marginBottom: 22 }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 12 }}>
            Products &amp; Milestones
          </SCaps>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {v.milestones.map((m) => (
              <div key={m.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: 4,
                    width: 7,
                    height: 7,
                    background: YEL,
                    border: `1px solid ${INK}`,
                  }}
                />
                <div>
                  <SCaps size={10} ls="0.14em" color={INK}>{m.label}</SCaps>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 13.5,
                      color: INK70,
                      lineHeight: 1.45,
                      marginTop: 2,
                    }}
                  >
                    {m.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {v.awards && (
        <div style={{ marginBottom: 22 }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 8 }}>
            Awards &amp; Recognition
          </SCaps>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {v.awards.map((a) => (
              <span
                key={a}
                style={{
                  padding: "3px 9px 4px",
                  background: INK,
                  color: YEL,
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {v.clients && (
        <div style={{ marginBottom: 22 }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 8 }}>
            Clients
          </SCaps>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {v.clients.map((c) => (
              <span
                key={c}
                style={{
                  padding: "3px 9px 4px",
                  border: `1px solid ${INK}`,
                  fontFamily: GROT,
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: INK,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {v.clientList && (
        <div style={{ marginBottom: 22 }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 12 }}>
            Select Clients
          </SCaps>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {v.clientList.map((c) => (
              <div key={c.name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: 4,
                    width: 7,
                    height: 7,
                    background: INK35,
                  }}
                />
                <div>
                  <SCaps size={10} ls="0.14em" color={INK}>{c.name}</SCaps>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 13.5,
                      color: INK70,
                      lineHeight: 1.4,
                      marginTop: 2,
                    }}
                  >
                    {c.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <HRule color={INK15} style={{ marginBottom: 14 }} />
      <div>
        <SCaps size={10} ls="0.14em" color={INK55}>Role</SCaps>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: INK,
            marginTop: 2,
          }}
        >
          {v.role}
        </div>
      </div>
    </article>
  );
}

function PastVenturesSection() {
  return (
    <section style={{ background: PAPER, padding: "80px 56px" }}>
      <SectionMast n="02" label="Past Ventures · Track Record" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {PAST.map((v, i) => (
          <PastVentureCard key={v.name} v={v} n={String(i + 1).padStart(2, "0")} />
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section
      style={{
        background: INK,
        padding: "80px 56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -60,
          right: -40,
          opacity: 0.06,
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: GROT,
          fontWeight: 900,
          fontSize: 260,
          color: YEL,
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
      >
        SIA
      </div>

      <SectionMast n="03" label="Working Together · Open for Projects, Q3 2026" dark />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(40px, 5vw, 68px)",
              color: PAPER,
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
            }}
          >
            Want the same
            <br />
            <span style={{ fontStyle: "italic", color: YEL }}>for your brand?</span>
          </h2>
          <p
            style={{
              marginTop: 22,
              fontFamily: SERIF,
              fontSize: 18,
              color: "rgba(241,235,222,.72)",
              lineHeight: 1.55,
              maxWidth: 480,
            }}
          >
            DMR.agency works with B2B companies who understand that earned media
            outlasts any ad campaign. If that sounds like your philosophy,
            let&rsquo;s talk.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Work With DMR.agency →", href: "https://dmr.agency", primary: true },
            { label: "Book a Speaking Slot →", href: "/speaking", primary: false },
            { label: "Explore EMOS →", href: "https://dmr.agency/earnedmediaos/", primary: false },
          ].map(({ label, href, primary }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                display: "block",
                padding: "18px 28px",
                background: primary ? YEL : "transparent",
                color: primary ? INK : PAPER,
                border: primary ? `1px solid ${YEL}` : "1px solid rgba(241,235,222,.35)",
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: primary ? 800 : 700,
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VenturesPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Hero />
      <VenturesLead />
      <CurrentVenturesSection />
      <PastVenturesSection />
      <ClosingCTA />
      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}

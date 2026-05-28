import {
  GROT,
  INK,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { HRule, Mark, SCaps, SectionMast } from "@/components/bureau/primitives";

type Service = {
  dept: string;
  t: string;
  body: string;
  foot: string;
  cta: string;
  href?: string;
  external?: boolean;
  feature?: boolean;
};

const SERVICES: ReadonlyArray<Service> = [
  {
    dept: "Department 01",
    t: "Earned Media Booster",
    body:
      "Done-for-you digital PR through my agency, DMR.agency. Strategy, " +
      "positioning, and journalist outreach handled end-to-end. Bylines " +
      "and quotes in Forbes, HBR, HuffPost and niche trade press your " +
      "buyers actually read.",
    foot: "Delivered via DMR.agency",
    cta: "Open on DMR.agency",
    href: "https://dmr.agency/earned-media-booster/",
    external: true,
  },
  {
    dept: "Department 02",
    t: "EMOS · Earned Media OS",
    body:
      "A productized system for landing editorial coverage in-house. " +
      "Trainings, templates, journalist playbooks, and a working OS for " +
      "repeatable press wins, without the agency retainer.",
    foot: "For in-house marketing teams",
    cta: "Tour EMOS",
    href: "/emos",
    feature: true,
  },
  {
    dept: "Department 03",
    t: "Fractional CMO",
    body:
      "For founders without a marketing leader. Weekly cadence, full " +
      "strategy ownership, agency-level execution through DMR.agency. " +
      "Six months minimum. Two seats open this quarter.",
    foot: "For Series A / B founders",
    cta: "Inquire",
    href: "/fractional-cmo",
  },
];

export const Departments = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 80, paddingBottom: 80 }}>
    <SectionMast n="01" label="Departments · Three ways to work" />

    <div className="grid-intro">
      <h2
        className="h2-xl"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Three ways to work,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>plainly stated.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 19,
          color: INK70,
          lineHeight: 1.55,
        }}
      >
        After twenty-two years and a hundred clients, the work has settled
        into three shapes. Each is a different commitment of time and money
        on your side. A different promise on mine.
      </p>
    </div>

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {SERVICES.map((s, i) => (
        <div
          key={s.t}
          className="card-border"
          style={{
            padding: "32px 28px 26px",
            background: s.feature ? PAPER2 : PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 360,
            position: "relative",
          }}
        >
          {s.feature && (
            <div
              style={{
                position: "absolute",
                top: -1,
                right: -1,
                padding: "7px 14px",
                background: YEL,
                color: INK,
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                border: `1px solid ${INK}`,
              }}
            >
              New · 2026
            </div>
          )}
          <SCaps size={10.5} ls="0.20em" color={INK70}>{s.dept}</SCaps>
          <h3
            style={{
              margin: "14px 0 0",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 34,
              color: INK,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              fontStyle: s.feature ? "italic" : "normal",
            }}
          >
            {s.t}
          </h3>
          <HRule style={{ margin: "18px 0" }} />
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 16.5,
              color: INK,
              lineHeight: 1.55,
              flex: 1,
              textAlign: "justify",
            }}
          >
            {s.body}
          </p>
          <div style={{ marginTop: 22 }}>
            <SCaps size={10.5} ls="0.16em" color={INK55}>{s.foot}</SCaps>
          </div>
          <a
            href={s.href || "#"}
            target={s.external ? "_blank" : undefined}
            rel={s.external ? "noopener noreferrer" : undefined}
            style={{
              marginTop: 14,
              alignSelf: "flex-start",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 17,
              color: INK,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <Mark>
              {s.cta} {s.external ? "↗" : "→"}
            </Mark>
          </a>
        </div>
      ))}
    </div>
  </section>
);

import type { ReactNode } from "react";
import { SCaps } from "@/components/bureau/primitives";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";

// ─── Speaking testimonials ────────────────────────────────────────────────────
// Third-party proof for the session pages. Every quote is reproduced verbatim
// from a public LinkedIn recommendation. Trims are marked with an ellipsis and
// nothing is paraphrased, tidied, or re-punctuated, so a dash inside a quote
// stays even though house style forbids dashes in our own copy.
//
// `profileUrl` is optional and renders a "View on LinkedIn" link when present.
// Add the URLs as they are collected; the block reads correctly without them.

export type Testimonial = {
  /** Person's name, as it appears on their profile. */
  name: string;
  /** Their own headline or title, trimmed to the part that carries weight. */
  title: string;
  /** Square avatar in /public/assets/testimonials. */
  photo: string;
  /** The room this speaks to. Omit when the quote names no event. */
  event?: string;
  /** "Organiser" or "Attendee". Never imply an endorsement the person did not give. */
  role: string;
  /** Verbatim. Use … to mark a trim. Never rewrite. */
  quote: string;
  profileUrl?: string;
};

const CSS = `
.emai-tst{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.emai-tst-card{border:1px solid rgba(241,235,222,.28);background:rgba(241,235,222,.04);padding:26px 24px;display:flex;flex-direction:column;}
@media(max-width:980px){.emai-tst{grid-template-columns:repeat(2,1fr);}}
@media(max-width:760px){.emai-tst{grid-template-columns:1fr;}}
`;

export default function SpeakingTestimonials({
  items,
  heading,
  standfirst,
}: {
  items: ReadonlyArray<Testimonial>;
  heading: ReactNode;
  standfirst: string;
}) {
  return (
    <section
      className="sx"
      style={{ background: INK, color: PAPER, paddingTop: 80, paddingBottom: 84 }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <SCaps size={11} ls="0.22em" color={YEL}>
          Testimonials · What people in the room said
        </SCaps>
        <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.2)", minWidth: 40 }} />
      </div>
      <div className="emai-intro">
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(28px, 4.6vw, 46px)",
            color: PAPER,
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 18,
            color: "rgba(241,235,222,.72)",
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          {standfirst}
        </p>
      </div>

      <div className="emai-tst">
        {items.map((t) => (
          <figure key={t.name} className="emai-tst-card" style={{ margin: 0 }}>
            <div
              aria-hidden
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 44,
                lineHeight: 0.6,
                color: YEL,
                height: 26,
              }}
            >
              &ldquo;
            </div>
            <blockquote
              style={{
                margin: "10px 0 0",
                fontFamily: SERIF,
                fontSize: 16.5,
                color: "rgba(241,235,222,.86)",
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {t.quote}
            </blockquote>

            <figcaption
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid rgba(241,235,222,.16)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.photo}
                alt={t.name}
                width={44}
                height={44}
                loading="lazy"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid rgba(241,235,222,.25)",
                  background: "rgba(241,235,222,.08)",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 16,
                    color: PAPER,
                    lineHeight: 1.25,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: SERIF,
                    fontSize: 13.5,
                    color: "rgba(241,235,222,.6)",
                    lineHeight: 1.4,
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {t.event ? (
                    <span
                      style={{
                        fontFamily: GROT,
                        fontWeight: 800,
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: INK,
                        background: YEL,
                        padding: "3px 7px",
                      }}
                    >
                      {t.event}
                    </span>
                  ) : null}
                  <SCaps size={9} ls="0.14em" color="rgba(241,235,222,.45)">
                    {t.role}
                  </SCaps>
                </div>
                {t.profileUrl ? (
                  <a
                    href={t.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      fontFamily: GROT,
                      fontWeight: 800,
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(241,235,222,.6)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    View on LinkedIn &rarr;
                  </a>
                ) : null}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <p
        style={{
          margin: "26px 0 0",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: "rgba(241,235,222,.5)",
          lineHeight: 1.5,
        }}
      >
        Quoted verbatim from public LinkedIn recommendations. An ellipsis marks a trim, nothing else
        has been changed.
      </p>
    </section>
  );
}

/**
 * Shared Arabic chrome for every page under /ar/.
 *
 * Self-contained on purpose: it imports colour tokens and nothing else from the
 * shared component library, so no English string can reach an Arabic page and
 * nothing here can affect the English site. The global English header is hidden
 * under /ar/ by SiteHeaderConditional.
 *
 * NOTE: /ar/speaking/earned-media-ai/travel still carries its own inline copies
 * of these three components from the first Arabic build. Fold it onto this file
 * in the same pass that applies the reviewer's edits, so there is one Arabic
 * header and one Arabic footer rather than two.
 */

import { INK, INK55, INK70, PAPER, YEL } from "@/lib/tokens";

export const AR_SERIF = "var(--font-ar-serif), 'Noto Naskh Arabic', Georgia, serif";
export const AR_GROT = "var(--font-ar-grot), system-ui, sans-serif";

/** Shown while an Arabic page is an unreviewed, noindex draft. Delete at go-live. */
export function DraftBanner({ text }: { text: string }) {
  return (
    <div
      style={{
        background: INK,
        color: YEL,
        fontFamily: AR_GROT,
        fontSize: 12.5,
        padding: "9px 20px",
        textAlign: "center",
        borderBottom: `1px solid ${YEL}`,
      }}
    >
      {text}
    </div>
  );
}

export function ArabicHeader({
  active,
  switchHref,
}: {
  /** Which nav item to mark current: "speaking" | "tourism" | "retail" */
  active?: "speaking" | "tourism" | "retail";
  /** The English equivalent of this page, for the language switch. */
  switchHref: string;
}) {
  const link = (href: string, label: string, key: string) => (
    <a
      href={href}
      aria-current={active === key ? "page" : undefined}
      style={{
        fontFamily: AR_GROT,
        fontSize: 13.5,
        color: active === key ? INK : INK70,
        textDecoration: "none",
        borderBottom: active === key ? `2px solid ${YEL}` : "2px solid transparent",
        paddingBottom: 2,
      }}
    >
      {label}
    </a>
  );

  return (
    <header style={{ background: PAPER, borderBottom: `1px solid ${INK}` }}>
      <div
        className="ar-shell"
        style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", paddingBlock: 16 }}
      >
        <div>
          <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: 21, color: INK, lineHeight: 1.2 }}>
            سيد عرفان أجمل
          </div>
          <span style={{ fontFamily: AR_GROT, fontSize: 10, letterSpacing: "0.1em", color: INK55 }}>
            استراتيجي الإعلام المكتسب · مؤسس EMOS
          </span>
        </div>
        <nav
          style={{ display: "flex", gap: 18, flexWrap: "wrap", marginInlineStart: "auto", alignItems: "center" }}
        >
          {link("/ar/ksa-tourism-radar", "رادار السياحة", "tourism")}
          {link("/ar/ksa-retail-radar", "رادار التجزئة", "retail")}
          {link("/ar/speaking/earned-media-ai/travel", "المحاضرات", "speaking")}
          <a
            href={switchHref}
            hrefLang="en"
            dir="ltr"
            style={{
              fontFamily: AR_GROT,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.1em",
              color: INK,
              textDecoration: "none",
              border: `1px solid ${INK}`,
              padding: "6px 12px",
            }}
          >
            English
          </a>
        </nav>
      </div>
    </header>
  );
}

export function ArabicFooter({ note, cta, href }: { note: string; cta: string; href: string }) {
  return (
    <footer style={{ background: INK, color: PAPER, paddingBlock: "52px 40px" }}>
      <div className="ar-shell">
        <div
          style={{
            fontFamily: AR_SERIF,
            fontWeight: 700,
            fontSize: "clamp(22px,3.4vw,32px)",
            color: YEL,
            lineHeight: 1.4,
            maxWidth: 640,
          }}
        >
          لماذا تدفع مقابل الانتباه بينما يمكنك أن تكسبه؟
        </div>
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(241,235,222,.2)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: 24,
          }}
        >
          <div>
            <span style={{ fontFamily: AR_GROT, fontSize: 10, letterSpacing: "0.16em", color: YEL }}>للتواصل</span>
            <div style={{ marginTop: 10, fontFamily: AR_GROT, fontSize: 14, lineHeight: 2 }}>
              <a href="mailto:sia@syedirfanajmal.com" dir="ltr" style={{ color: PAPER, textDecoration: "none", display: "block" }}>
                sia@syedirfanajmal.com
              </a>
              <span dir="ltr" style={{ display: "block", color: "rgba(241,235,222,.75)" }}>
                +92 333 901 7777
              </span>
            </div>
          </div>
          <div>
            <span style={{ fontFamily: AR_GROT, fontSize: 10, letterSpacing: "0.16em", color: YEL }}>English</span>
            <p style={{ margin: "10px 0 0", fontFamily: AR_GROT, fontSize: 13.5, color: "rgba(241,235,222,.75)", lineHeight: 1.8 }}>
              {note}
            </p>
            <a
              href={href}
              hrefLang="en"
              style={{
                marginTop: 10,
                display: "inline-block",
                fontFamily: AR_GROT,
                fontSize: 13,
                color: YEL,
                textDecoration: "none",
                borderBottom: `1px solid ${YEL}`,
              }}
            >
              {cta} ←
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

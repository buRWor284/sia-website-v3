import type { Metadata } from "next";
import Image from "next/image";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { INK, PAPER, YEL, SERIF, GROT, MONO, CAL_URL } from "@/lib/tokens";
import { COPY, EMAIL, SITE, currentEvent, whatsappUrl, type Lang } from "./content";
import { TrackedLink } from "./TrackedLink";

/**
 * /card — landing page for the QR codes on the printed business cards.
 * Spec: Business-Card-Spec-v2.md § 7. One job: turn a scan into a WhatsApp
 * message, a saved contact or a booked call. No site nav (hidden in
 * SiteHeaderConditional), no footer, not indexed, not in the sitemap.
 * Dark field so it looks like the card in the visitor's hand.
 * Edit the event and all copy in ./content.ts, not here.
 */

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-ar-grot",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
});
const AR = "var(--font-ar-grot), system-ui, sans-serif";

export const metadata: Metadata = {
  title: "Syed Irfan Ajmal · Contact",
  description: "WhatsApp, save contact, or book a call with Syed Irfan Ajmal.",
  robots: { index: false, follow: false },
};

// Reads ?s= and ?lang= and the event date window, so render per request.
export const dynamic = "force-dynamic";

const CREAM70 = "rgba(241,235,222,.72)";
const LINE = "rgba(241,235,222,.16)";

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string | string[]; lang?: string | string[] }>;
}) {
  const sp = await searchParams;
  const s = (Array.isArray(sp.s) ? sp.s[0] : sp.s)?.slice(0, 40) ?? "direct";
  const langParam = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const lang: Lang =
    langParam === "ar" || langParam === "en" ? langParam : s.startsWith("qr-ar") ? "ar" : "en";
  const t = COPY[lang];
  const isAr = lang === "ar";
  const event = currentEvent();

  const body = isAr ? AR : GROT;
  const head = isAr ? AR : SERIF;

  const switchQs = new URLSearchParams();
  if (s !== "direct") switchQs.set("s", s);
  switchQs.set("lang", isAr ? "en" : "ar");

  const label = (n: string, text: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "34px 0 14px",
        fontFamily: isAr ? AR : MONO,
        fontSize: isAr ? 13 : 11,
        letterSpacing: isAr ? 0 : "0.16em",
        textTransform: "uppercase",
        color: CREAM70,
      }}
    >
      <span style={{ color: YEL }}>§ {n}</span>
      <span>{text}</span>
      <span aria-hidden style={{ flex: 1, height: 1, background: LINE }} />
    </div>
  );

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    padding: "12px 18px",
    fontFamily: body,
    fontWeight: 700,
    fontSize: 16,
    textDecoration: "none",
    textAlign: "center",
  };
  const primary: React.CSSProperties = { ...btnBase, background: YEL, color: INK };
  const secondary: React.CSSProperties = {
    ...btnBase,
    background: "transparent",
    color: PAPER,
    border: `1px solid rgba(241,235,222,.45)`,
    fontWeight: 600,
  };

  return (
    <main
      dir={t.dir}
      lang={lang}
      className={plex.variable}
      style={{ background: INK, color: PAPER, minHeight: "100vh", fontFamily: body }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 18px 48px" }}>
        {/* Top bar: mark, est line, language switch */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${LINE}` }}>
          <span
            aria-hidden
            style={{
              background: YEL,
              color: INK,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.02em",
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            SIA
          </span>
          <span style={{ fontFamily: isAr ? AR : MONO, fontSize: isAr ? 13 : 11, letterSpacing: isAr ? 0 : "0.18em", color: CREAM70 }}>
            {t.est}
          </span>
          <a
            href={`/card?${switchQs.toString()}`}
            lang={isAr ? "en" : "ar"}
            style={{
              marginInlineStart: "auto",
              fontFamily: isAr ? GROT : AR,
              fontSize: 14,
              color: PAPER,
              border: `1px solid ${LINE}`,
              padding: "6px 12px",
              textDecoration: "none",
            }}
          >
            {t.switchLabel}
          </a>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
          <Image
            src="/headshot.jpg"
            alt=""
            width={76}
            height={76}
            sizes="76px"
            priority
            style={{ width: 76, height: 76, objectFit: "cover", objectPosition: "50% 18%", border: `1px solid ${LINE}`, flexShrink: 0 }}
          />
          <div>
            <h1 style={{ fontFamily: head, fontWeight: 700, fontSize: isAr ? 30 : 34, lineHeight: 1.1, letterSpacing: isAr ? 0 : "-0.02em", margin: 0 }}>
              {t.name}
            </h1>
            <div style={{ marginTop: 6, fontSize: 14, color: CREAM70, fontWeight: 600 }}>{t.role}</div>
          </div>
        </div>

        <p style={{ fontFamily: head, fontStyle: isAr ? "normal" : "italic", fontSize: 21, lineHeight: 1.35, margin: "22px 0 0" }}>
          {event ? t.greetEvent(event.name) : t.greet}
          {t.promise && (
            <>
              {" "}
              <span style={{ color: YEL }}>{t.promise}</span>
            </>
          )}
        </p>

        {/* § 01 Reach me */}
        {label(isAr ? "٠١" : "01", t.sec1)}
        <div style={{ display: "grid", gap: 10 }}>
          <TrackedLink href={whatsappUrl(lang, event)} track="whatsapp" source={s} style={primary} external>
            {t.whatsapp}
          </TrackedLink>
          <TrackedLink href="/card/vcard" track="vcard" source={s} style={secondary} download>
            {t.save}
          </TrackedLink>
          <TrackedLink href={CAL_URL} track="book_call" source={s} style={secondary} external>
            {t.book}
          </TrackedLink>
        </div>
        <dl style={{ margin: "16px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 14 }}>
          <dt style={{ color: CREAM70 }}>{t.email}</dt>
          <dd style={{ margin: 0 }} dir="ltr">
            <TrackedLink href={`mailto:${EMAIL}`} track="email" source={s} style={{ color: PAPER }}>
              {EMAIL}
            </TrackedLink>
          </dd>
          <dt style={{ color: CREAM70 }}>{t.site}</dt>
          <dd style={{ margin: 0 }} dir="ltr">
            <TrackedLink href={SITE} track="site" source={s} style={{ color: PAPER }}>
              syedirfanajmal.com
            </TrackedLink>
          </dd>
        </dl>

        {/* § 02 EMOS: mirrors the amber band on the card. Ink on amber only (a11y rule 1). */}
        {label(isAr ? "٠٢" : "02", t.sec2)}
        <div style={{ background: YEL, color: INK, padding: "20px 20px 22px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.18em" }} dir="ltr">
            {t.emosTag}
          </div>
          <div style={{ fontFamily: head, fontWeight: 700, fontSize: 24, lineHeight: 1.15, marginTop: 8 }}>{t.emosHead}</div>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: "10px 0 16px" }}>{t.emosBody}</p>
          <TrackedLink
            href="/emos-platform"
            track="emos_platform"
            source={s}
            style={{ display: "inline-block", background: INK, color: "#ffffff", padding: "11px 16px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
          >
            {t.emosCta} {isAr ? "←" : "→"}
          </TrackedLink>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: CREAM70, margin: "12px 0 0" }}>
          {t.academy}{" "}
          <TrackedLink href="/emos-academy" track="emos_academy" source={s} style={{ color: PAPER }}>
            {t.academyCta}
          </TrackedLink>
        </p>

        {/* § 03 Background */}
        {label(isAr ? "٠٣" : "03", t.sec3)}
        <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>{t.cred}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 9 }}>
          {t.proof.map(p => (
            <li key={p} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45, color: CREAM70 }}>
              <span aria-hidden style={{ width: 6, height: 6, background: YEL, marginTop: 8, flexShrink: 0 }} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

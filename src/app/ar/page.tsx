/**
 * /ar — the Arabic front door (added 2026-11-24).
 *
 * A short Arabic bio plus links to the Arabic pages that are live. Not a
 * translation of the English home page, so it carries no hreflang pair with "/".
 * Same AI-translation disclosure as the Arabic radars; swap the banner text when
 * the native review is done. Add new Arabic pages to PAGES as they go live.
 */

import type { Metadata } from "next";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { INK, INK70, PAPER, YEL } from "@/lib/tokens";
import { AR_GROT, AR_SERIF, ArabicFooter, ArabicHeader, DraftBanner } from "./_components/chrome";
import "./radar-ar.css";

const amiri = Amiri({ variable: "--font-ar-serif", subsets: ["arabic"], weight: ["400", "700"], display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ variable: "--font-ar-grot", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { absolute: "Syed Irfan Ajmal · سيد عرفان أجمل · الإعلام المكتسب ورادارات السوق السعودية" },
  description:
    "سيد عرفان أجمل، استراتيجي الإعلام المكتسب ومؤسس EMOS. رادارات السياحة والتجزئة في السعودية مع بيانات تغطية صحفية حية.",
  alternates: { canonical: "/ar" },
};

const NOTE =
  "تُرجمت هذه الصفحة من الإنجليزية بمساعدة الذكاء الاصطناعي، ومراجعتها من قِبل متحدث أصلي بالعربية جارية حالياً.";

const PAGES = [
  {
    href: "/ar/ksa-tourism-radar",
    title: "رادار السياحة والضيافة في السعودية",
    body: "28 إشارة موثقة حول السياحة السعودية: المشاريع الكبرى والفعاليات والضيافة والطيران وسياحة الحج والعمرة، مع بيانات تغطية صحفية حية.",
  },
  {
    href: "/ar/ksa-retail-radar",
    title: "رادار التجزئة والاستهلاك في السعودية",
    body: "25 إشارة موثقة حول الاقتصاد الاستهلاكي السعودي: التجارة الإلكترونية والتوصيل ومجموعات التجزئة والعلامات التجارية، مع بيانات تغطية صحفية حية.",
  },
];

export default function ArabicHome() {
  return (
    <div dir="rtl" lang="ar" className={`ar-radar ${amiri.variable} ${plex.variable}`}>
      <DraftBanner text={NOTE} />
      <ArabicHeader active="home" switchHref="/" />

      <main>
        <section className="ar-shell" style={{ paddingBlock: "52px 30px" }}>
          <div style={{ fontFamily: AR_GROT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: INK70 }}>
            نبذة
          </div>
          <h1 style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", lineHeight: 1.25, color: INK, margin: "10px 0 18px" }}>
            سيد عرفان أجمل
          </h1>
          <div dir="ltr" lang="en" style={{ fontFamily: AR_GROT, fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", color: INK70, margin: "-8px 0 18px", textAlign: "right" }}>
            Syed Irfan Ajmal
          </div>
          <div style={{ maxWidth: 760, fontFamily: AR_SERIF, fontSize: 19, lineHeight: 1.95, color: INK }}>
            <p style={{ margin: "0 0 14px" }}>
              يعمل سيد عرفان أجمل في مجالات الأعمال والتقنية والتسويق منذ عام <span dir="ltr">2004</span>، ويدير منذ عام{" "}
              <span dir="ltr">2013</span> وكالة <span dir="ltr">DMR.agency</span> المتخصصة في تحسين محركات البحث والتسويق بالمحتوى
              والإعلام المكتسب. عمل مع أكثر من <span dir="ltr">300</span> عميل في الولايات المتحدة وأوروبا والخليج.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              نُشرت له مقالات في <span dir="ltr">Forbes Middle East</span> و<span dir="ltr">HuffPost</span> و<span dir="ltr">TNW</span>{" "}
              وإصدارات البنك الدولي، وظهر كدراسة حالة في <span dir="ltr">Harvard Business Review</span>، واقتُبست آراؤه في{" "}
              <span dir="ltr">Forbes</span> الأمريكية. شارك في أكثر من <span dir="ltr">50</span> فعالية دولية متحدثاً.
            </p>
            <p style={{ margin: 0 }}>
              أسّس <span dir="ltr">EMOS</span>، وهو نظام لكسب التغطية الإعلامية والظهور في إجابات أدوات الذكاء الاصطناعي.
            </p>
          </div>
        </section>

        <section className="ar-shell" style={{ paddingBlock: "10px 64px" }}>
          <h2 style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: 26, color: INK, margin: "0 0 18px", borderTop: `1px solid ${INK}`, paddingTop: 22 }}>
            رادارات السوق السعودية
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {PAGES.map((p) => (
              <a
                key={p.href}
                href={p.href}
                style={{ display: "block", border: `1px solid ${INK}`, background: PAPER, padding: "20px 22px", textDecoration: "none", color: INK }}
              >
                <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: 21, lineHeight: 1.4 }}>{p.title}</div>
                <p style={{ margin: "10px 0 14px", fontFamily: AR_GROT, fontSize: 14.5, lineHeight: 1.9, color: INK70 }}>{p.body}</p>
                <span style={{ fontFamily: AR_GROT, fontSize: 13, fontWeight: 600, borderBottom: `2px solid ${YEL}` }}>افتح الرادار ←</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <ArabicFooter note="النسخة الإنجليزية من الموقع تضم المزيد من الموارد والأدوات." cta="الموقع بالإنجليزية" href="/" />
    </div>
  );
}

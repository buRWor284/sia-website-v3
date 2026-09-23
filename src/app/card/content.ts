/**
 * /card — the page the printed business-card QR codes open.
 *
 * Built 2026-09-23 from Business-Card-Spec-v2.md § 7. The paper card stays
 * generic; this file carries the per-event context, so a trip needs a page
 * edit, never a reprint.
 *
 * QR destinations printed on the cards (decoded from the Claude Design PDF):
 *   English front → /card?s=qr     (renders English)
 *   Arabic back   → /card?s=qr-ar  (renders Arabic, RTL)
 * GA4 already records page_location with the query string, so scans are
 * separable from direct visits. Button clicks also fire a `card_click` event.
 *
 * ★ BEFORE EACH EVENT: edit EVENTS below (name, dates). The event line and
 *   the WhatsApp prefill switch on automatically inside the date window and
 *   fall back to the generic line outside it.
 *
 * ★ ARABIC COPY: every string in the `ar` blocks needs a read by a Gulf
 *   marketer before the cards are handed out. "Earned media" is deliberately
 *   NOT translated as a phrase (الإعلام المكتسب is a calque); the EMOS line
 *   describes what the platform does in plain words instead.
 *
 * ★ CREDENTIALS: "22 years" is business, tech and marketing, never
 *   "22 years in earned media" or "in marketing". HBR = named case study;
 *   Forbes USA = quoted; Forbes Middle East = byline. Keep these distinctions.
 */

export type Lang = "en" | "ar";

export type CardEvent = {
  /** Shown in both languages; event names stay in Latin script. */
  name: string;
  /** Inclusive window, YYYY-MM-DD, during which the event line shows. */
  from: string;
  to: string;
};

export const EVENTS: CardEvent[] = [
  // Seamless Saudi Arabia, Riyadh Front, 17-18 Nov 2026 (the older 9-10 Nov
  // date in the card spec was wrong). Window runs about a week either side
  // so early meetings and slow follow-ups still see the right line.
  { name: "Seamless Saudi Arabia", from: "2026-11-10", to: "2026-12-01" },
];

/** The event whose window contains `now` (Asia/Riyadh date), if any. */
export function currentEvent(now: Date = new Date()): CardEvent | null {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // en-CA gives YYYY-MM-DD
  return EVENTS.find(e => today >= e.from && today <= e.to) ?? null;
}

export const PHONE_E164 = "+923339017777";
export const PHONE_DISPLAY = "+92 333 901 7777";
export const EMAIL = "sia@syedirfanajmal.com";
export const SITE = "https://www.syedirfanajmal.com";
export const LINKEDIN = "https://www.linkedin.com/in/syedirfanajmal";

export function whatsappUrl(lang: Lang, event: CardEvent | null): string {
  const text =
    lang === "ar"
      ? event
        ? `مرحباً عرفان، التقينا في ${event.name}.`
        : "مرحباً عرفان، معي بطاقتك."
      : event
        ? `Hi Irfan, we met at ${event.name}.`
        : "Hi Irfan, I have your card.";
  return `https://wa.me/${PHONE_E164.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

/** Years since 2004, computed so the page never goes stale (22 in 2026). */
const YEARS = new Date().getFullYear() - 2004;
const toArabicDigits = (n: number) => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export const COPY = {
  en: {
    dir: "ltr" as const,
    est: "EST. 2004 · GLOBAL",
    name: "Syed Irfan Ajmal",
    role: "CEO, DMR.agency",
    greetEvent: (n: string) => `Good to meet you at ${n}.`,
    greet: "Good to meet you.",
    promise: "Get covered. Get found. Get chosen.",
    sec1: "Reach me",
    whatsapp: "Message me on WhatsApp",
    save: "Save my contact",
    saveNote: "Adds me to your phone's contacts",
    book: "Book a 30-minute call",
    sec2: "What I'm building",
    emosTag: "EMOS PLATFORM",
    emosHead: "The Earned Media Operating System",
    emosBody:
      "Find the stories journalists are chasing, pitch them well, and turn the coverage into visibility in search and AI answers.",
    emosCta: "See the platform",
    academy: "Prefer to learn it yourself? EMOS Academy trains teams to run it.",
    academyCta: "EMOS Academy",
    sec3: "Background",
    cred: `${YEARS} years in business, tech and marketing. Running DMR.agency, an SEO and earned media agency, since 2013. 300+ clients across the US, Europe and the Gulf.`,
    proof: [
      "Featured as a case study in Harvard Business Review",
      "Quoted in Forbes (USA)",
      "Bylines in Forbes Middle East, HuffPost, TNW, World Bank publications and Semrush",
      "50+ international talks",
    ],
    email: "Email",
    site: "Website",
    switchLabel: "العربية",
  },
  ar: {
    dir: "rtl" as const,
    est: "منذ ٢٠٠٤ · عالمياً",
    name: "سيد عرفان أجمل",
    role: "الرئيس التنفيذي، DMR.agency",
    greetEvent: (n: string) => `سعدت بلقائك في ${n}.`,
    greet: "سعدت بلقائك.",
    promise: "",
    sec1: "للتواصل",
    whatsapp: "راسلني على واتساب",
    save: "احفظ جهة الاتصال",
    saveNote: "تُضاف بياناتي إلى جهات الاتصال في هاتفك",
    book: "احجز مكالمة مدتها ٣٠ دقيقة",
    sec2: "ما أعمل عليه",
    emosTag: "EMOS PLATFORM",
    emosHead: "منصة EMOS",
    emosBody:
      "اكتشف القصص التي يبحث عنها الصحفيون، وقدّم لهم عرضاً مقنعاً، ثم حوّل التغطية الإعلامية إلى ظهور في نتائج البحث وإجابات الذكاء الاصطناعي.",
    emosCta: "تعرّف على المنصة (بالإنجليزية)",
    academy: "تفضّل التعلّم بنفسك؟ أكاديمية EMOS تدرّب الفرق على تطبيق المنهجية.",
    academyCta: "أكاديمية EMOS",
    sec3: "نبذة",
    cred: `${toArabicDigits(YEARS)} عاماً في الأعمال والتقنية والتسويق. أدير DMR.agency، وهي وكالة متخصصة في تحسين محركات البحث والتغطية الإعلامية، منذ ٢٠١٣. أكثر من ٣٠٠ عميل في الولايات المتحدة وأوروبا والخليج.`,
    proof: [
      "دراسة حالة في Harvard Business Review",
      "اقتباس في Forbes (الولايات المتحدة)",
      "مقالات منشورة في Forbes الشرق الأوسط وHuffPost وTNW ومنشورات البنك الدولي وSemrush",
      "أكثر من ٥٠ محاضرة دولية",
    ],
    email: "البريد",
    site: "الموقع",
    switchLabel: "English",
  },
};

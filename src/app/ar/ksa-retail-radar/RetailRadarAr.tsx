"use client";
/** Arabic wrapper for the shared interactive radar. Words only; data and logic stay in RetailRadarModule. */
import RetailRadarModule from "../../ksa-retail-radar/RetailRadarModule";
import type { RetailRadarData } from "@/lib/ksa-retail/types";
import { makeArRadarText } from "@/lib/signaliq/radar-text";
import { SIGNAL_AR, UI } from "./content.ar";

const LENS_AR = {
  ecom: "التجارة الإلكترونية والتوصيل",
  brands: "مجموعات التجزئة والعلامات",
  lifestyle: "نمط الحياة والترفيه",
  macro: "الاقتصاد الاستهلاكي",
};

const AR_TEXT = makeArRadarText({
  lensAll: "كل العدسات",
  lensLabel: LENS_AR,
  quad: ["مجموعات التجزئة", "تجزئة نمط الحياة", "الاقتصاد الاستهلاكي", "التجارة الإلكترونية"],
  ringLabels: UI.ringLabels,
  canvasAria: "رادار يضم 25 إشارة في قطاع التجزئة والاستهلاك السعودي حسب العدسة والأفق الزمني. البيانات نفسها مدرجة في فهرس الإشارات أدناه.",
  help: (
    <>
      كل علامة تمثل إشارة واحدة في قطاع التجزئة والاستهلاك السعودي. <b>البعد عن المركز يمثل الزمن</b>: الحلقة الداخلية تعمل الآن، والوسطى قيد البناء، والخارجية أفق 2030 وما بعده. <b>حجم العلامة يعكس حجم الرهان.</b> انقر على أي علامة أو أي صف أدناه لفتح ملف الإشارة.
    </>
  ),
  statusLabels: UI.statusLabels,
  statusNotes: UI.statusNotes,
  verdicts: UI.verdicts,
  signalAr: SIGNAL_AR,
  unusuallyQuiet: UI.unusuallyQuiet,
  peakIn: UI.loudPeakIn,
  lowSample: UI.lowSample,
  wirePending: UI.wirePending,
});

export default function RetailRadarAr({ live }: { live: RetailRadarData }) {
  return <RetailRadarModule live={live} t={AR_TEXT} bands={false} />;
}

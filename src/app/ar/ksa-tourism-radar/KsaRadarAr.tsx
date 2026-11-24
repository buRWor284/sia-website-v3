"use client";
/** Arabic wrapper for the shared interactive radar. Words only; data and logic stay in KsaRadarModule. */
import KsaRadarModule from "../../ksa-tourism-radar/KsaRadarModule";
import type { KsaRadarData } from "@/lib/ksa-radar/types";
import { makeArRadarText } from "@/lib/signaliq/radar-text";
import { SIGNAL_AR, UI } from "./content.ar";

const LENS_AR = {
  giga: "المشاريع الكبرى",
  events: "الفعاليات الكبرى",
  hosp: "الضيافة والطيران",
  faith: "السياحة الدينية",
};

const AR_TEXT = makeArRadarText({
  lensAll: UI.lensAll,
  lensLabel: LENS_AR,
  quad: ["المشاريع الكبرى", "الفعاليات الكبرى", "الضيافة", "السياحة الدينية"],
  ringLabels: UI.ringLabels,
  canvasAria: "رادار يضم 28 إشارة في قطاع السياحة السعودي حسب العدسة والأفق الزمني. البيانات نفسها مدرجة في فهرس الإشارات أدناه.",
  help: (
    <>
      كل علامة تمثل إشارة واحدة في قطاع السياحة السعودي. <b>البعد عن المركز يمثل الزمن</b>: الحلقة الداخلية تعمل الآن، والوسطى قيد البناء، والخارجية أفق 2030 وما بعده. <b>حجم العلامة يعكس حجم الرهان.</b> انقر على أي علامة أو أي صف أدناه لفتح ملف الإشارة.
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

export default function KsaRadarAr({ live }: { live: KsaRadarData }) {
  return <KsaRadarModule live={live} t={AR_TEXT} bands={false} />;
}

/**
 * Language pack for the interactive KSA radar modules (RetailRadarModule,
 * KsaRadarModule). Added 2026-11-24 so the Arabic radar pages can run the SAME
 * animated radar as the English pages: structure, data and verdict logic stay in
 * one component; only the words come from here. English output is unchanged.
 */
import type { ReactNode } from "react";

export interface RadarSignalIn {
  id: string;
  name: string;
  ar: string;
  stat: string;
  sig: string;
  talk: string;
  demand?: string;
  catalyst?: string;
}

export interface RadarSignalText {
  name: string;
  /** The small line under the name: the Arabic name on EN pages, the English name on AR pages. */
  sub: string;
  stat: string;
  sig: string;
  talk: string;
  demand?: string;
  catalyst?: string;
}

export interface RadarText {
  locale: "en" | "ar";
  lensAll: string;
  /** Short labels for the filter tabs. */
  tabLabel: Record<string, string>;
  lensLabel: Record<string, string>;
  /** Canvas quadrant labels: top-right, bottom-right, bottom-left, top-left (accent). */
  quad: [string, string, string, string];
  ring: (i: number) => string;
  ringShort: (i: number) => string;
  statusLabel: (status: string, fallback: string) => string;
  statusNote: (status: string, fallback: string) => string;
  verdict: (v: string, fallback: { label: string; note: string }) => { label: string; note: string };
  text: (s: RadarSignalIn) => RadarSignalText;
  tracking: string;
  signalsWord: string;
  across4: string;
  articlesLast60: string;
  heatingWord: string;
  pendingReadout: string;
  articles60d: string;
  weekOverWeek: string;
  canvasAria: string;
  signalFile: string;
  latestSignal: string;
  press: string;
  reality: string;
  next: string;
  articlesWord: string;
  sampleSmall: string;
  rising: string;
  falling: string;
  flat: string;
  contextOnly: string;
  wirePending: string;
  noneOnFile: string;
  noneScheduled: string;
  unusuallyQuiet: string;
  peakIn: (weeks: number) => string;
  asOf: (d: string) => string;
  threeYears: string;
  talkAngle: string;
  help: ReactNode;
}

type Meta = Record<string, { label: string; note: string }>;

export function makeEnRadarText(o: {
  tabLabel: Record<string, string>;
  lensLabel: Record<string, string>;
  quad: [string, string, string, string];
  ringLabels: readonly string[];
  canvasAria: string;
  help: ReactNode;
}): RadarText {
  return {
    locale: "en",
    lensAll: "§ All",
    tabLabel: o.tabLabel,
    lensLabel: o.lensLabel,
    quad: o.quad,
    ring: (i) => o.ringLabels[i],
    ringShort: (i) => o.ringLabels[i].split(" ")[0],
    statusLabel: (_s, fb) => fb,
    statusNote: (_s, fb) => fb,
    verdict: (_v, fb) => fb,
    text: (s) => ({ name: s.name, sub: s.ar, stat: s.stat, sig: s.sig, talk: s.talk, demand: s.demand, catalyst: s.catalyst }),
    tracking: "Tracking",
    signalsWord: "signals",
    across4: "across 4 lenses",
    articlesLast60: "articles of press coverage over the last 60 days",
    heatingWord: "heating",
    pendingReadout: "curated layer live · SignalIQ wire pending first scan",
    articles60d: "articles / 60d",
    weekOverWeek: "week over week",
    canvasAria: o.canvasAria,
    signalFile: "Signal file",
    latestSignal: "Latest signal",
    press: "Press",
    reality: "Reality",
    next: "Next",
    articlesWord: "articles",
    sampleSmall: "sample too small for a trend",
    rising: "rising",
    falling: "falling",
    flat: "flat",
    contextOnly: "context only, untracked by design",
    wirePending: "wire pending",
    noneOnFile: "none on file",
    noneScheduled: "none scheduled",
    unusuallyQuiet: "unusually quiet for the time of year",
    peakIn: (w) => `usual peak in ${w} ${w === 1 ? "wk" : "wks"}`,
    asOf: (d) => `SignalIQ × GDELT, as of ${d}`,
    threeYears: "Three years of press",
    talkAngle: "Talk angle:",
    help: o.help,
  };
}

export function makeArRadarText(o: {
  lensLabel: Record<string, string>;
  quad: [string, string, string, string];
  ringLabels: readonly string[];
  canvasAria: string;
  help: ReactNode;
  statusLabels: Record<string, string>;
  statusNotes: Record<string, string>;
  verdicts: Meta;
  signalAr: Record<string, { demand?: string; catalyst?: string; stat?: string; sig?: string; talk?: string }>;
  unusuallyQuiet: string;
  peakIn: (weeks: number) => string;
  lowSample: string;
  wirePending: string;
  lensAll: string;
}): RadarText {
  return {
    locale: "ar",
    lensAll: o.lensAll,
    tabLabel: o.lensLabel,
    lensLabel: o.lensLabel,
    quad: o.quad,
    ring: (i) => o.ringLabels[i],
    ringShort: (i) => o.ringLabels[i],
    statusLabel: (s, fb) => o.statusLabels[s] ?? fb,
    statusNote: (s, fb) => o.statusNotes[s] ?? fb,
    verdict: (v, fb) => o.verdicts[v] ?? fb,
    text: (s) => {
      const a = o.signalAr[s.id];
      return {
        name: s.ar || s.name,
        sub: s.name,
        stat: a?.stat ?? s.stat,
        sig: a?.sig ?? s.sig,
        talk: a?.talk ?? s.talk,
        demand: a?.demand ?? s.demand,
        catalyst: a?.catalyst ?? s.catalyst,
      };
    },
    tracking: "نتابع",
    signalsWord: "إشارة",
    across4: "عبر 4 عدسات",
    articlesLast60: "مقالاً من التغطية الصحفية خلال آخر 60 يوماً",
    heatingWord: "في صعود",
    pendingReadout: o.wirePending,
    articles60d: "مقالاً / 60 يوماً",
    weekOverWeek: "أسبوعياً",
    canvasAria: o.canvasAria,
    signalFile: "ملف الإشارة",
    latestSignal: "أحدث إشارة",
    press: "الصحافة",
    reality: "الواقع",
    next: "التالي",
    articlesWord: "مقالاً",
    sampleSmall: o.lowSample,
    rising: "صاعدة",
    falling: "هابطة",
    flat: "ثابتة",
    contextOnly: "للسياق فقط، غير مُتابعة عمداً",
    wirePending: o.wirePending,
    noneOnFile: "لا شيء مسجّل",
    noneScheduled: "لا شيء مجدول",
    unusuallyQuiet: o.unusuallyQuiet,
    peakIn: o.peakIn,
    asOf: (d) => `SignalIQ × GDELT، حتى ${d}`,
    threeYears: "ثلاث سنوات من التغطية",
    talkAngle: "زاوية الحديث:",
    help: o.help,
  };
}

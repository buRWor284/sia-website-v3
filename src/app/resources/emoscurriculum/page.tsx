import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ResourcesClientShell } from "@/components/resources/ResourcesClientShell";
import { getAllEpisodes } from "@/lib/podcast";
import { ScrollButtons } from "@/components/ScrollButtons";
import { PAPER, SERIF, INK } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "EMOS Curriculum · The Earned-Media Pipeline",
  description:
    "The EMOS curriculum mapped tool by tool — Reactive and Proactive phases, Foundation playbooks, and the full earned-media pipeline.",
  alternates: { canonical: "/resources/emoscurriculum" },
};

export default function ResourcesEmosCurriculumPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <ResourcesClientShell defaultView="guided" episodeCount={getAllEpisodes().length} />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

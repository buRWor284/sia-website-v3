import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ResourcesClientShell } from "@/components/resources/ResourcesClientShell";
import { getAllEpisodes } from "@/lib/podcast";
import { ScrollButtons } from "@/components/ScrollButtons";
import { PAPER, SERIF, INK } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "All Resources · Playbooks, Guides & Tools",
  description:
    "Browse all free playbooks, tools, kits, and guides on earned media, PR, SEO, personal branding, and content marketing.",
  alternates: { canonical: "/resources/viewall" },
};

export default function ResourcesViewAllPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <ResourcesClientShell defaultView="browse" episodeCount={getAllEpisodes().length} />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}

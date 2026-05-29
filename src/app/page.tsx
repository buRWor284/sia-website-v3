import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import { CaseStudies } from "@/components/home/CaseStudies";
import { ClientStrip } from "@/components/home/ClientStrip";
import { Departments } from "@/components/home/Departments";
import { Hero } from "@/components/home/Hero";
import { KitsFeature } from "@/components/home/KitsFeature";
import { Letters } from "@/components/home/Letters";
import { PodcastStrip } from "@/components/home/PodcastStrip";
import { Press } from "@/components/home/Press";
import { ReadingRoom } from "@/components/home/ReadingRoom";
import { SpeakingBand } from "@/components/home/Speaking";
import { Wire } from "@/components/home/Wire";
import { INK, PAPER, SERIF } from "@/lib/tokens";

export default function HomePage() {
  return (
    <div
      style={{
        background: PAPER,
        fontFamily: SERIF,
        color: INK,
      }}
    >
      <Mast active="Home" />
      <Hero />
      <Press />
      <ClientStrip />
      <Departments />
      <CaseStudies />
      <Letters />
      <KitsFeature />
      <SpeakingBand />
      <PodcastStrip />
      <ReadingRoom />
      <Wire />
      <Subscriptions />
      <Colophon />
    </div>
  );
}

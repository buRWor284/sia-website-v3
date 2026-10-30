"use client";

// /emos-academy hero film (Lighthouse B6). Replaces the 2.1 MB self-unpacking
// HTML animation iframe with a 0.56 MB H.264 MP4 rendered from it (1280x720,
// 45 s, silent). preload="none" + a still poster means the video bytes never
// compete with first paint; playback starts only once the frame is on screen
// and pauses when it scrolls away. Reduced-motion visitors get the poster
// plus native controls instead of autoplay.

import { useEffect, useRef } from "react";

export function EmosHeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src="/assets/emos-hero.mp4"
      poster="/assets/emos-hero-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      width={1280}
      height={720}
      aria-label="EMOS | what investors find when they look you up (45-second film)"
    />
  );
}

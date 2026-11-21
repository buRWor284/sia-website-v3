"use client";

// /emos-academy hero film (Lighthouse B6). Replaces the 2.1 MB self-unpacking
// HTML animation iframe with a 0.56 MB H.264 MP4 rendered from it (1280x720,
// 45 s, silent). preload="none" + a still poster means the video bytes never
// compete with first paint; playback starts only once the frame is on screen
// and pauses when it scrolls away. Reduced-motion visitors get the poster
// plus native controls instead of autoplay.

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

export function EmosHeroFilm() {
  // The poster is the page's LCP element. It is rendered as a plain <img>
  // (not the video's poster attribute): browsers paint an <img> as soon as it
  // loads, while a video poster waited ~1.9 s for the player (PSI "element
  // render delay"). The video sits on top, invisible until it really plays.
  preload("/assets/emos-hero-poster.jpg", { as: "image", fetchPriority: "high" });
  const ref = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    const fallback = () => {
      // No autoplay (reduced motion or blocked): show the player with controls.
      v.poster = "/assets/emos-hero-poster.jpg";
      v.controls = true;
      setShowVideo(true);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fallback();
      return;
    }
    const onPlaying = () => setShowVideo(true);
    v.addEventListener("playing", onPlaying);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(fallback);
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/emos-hero-poster.jpg"
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
      />
      <video
        ref={ref}
        src="/assets/emos-hero.mp4"
        muted
        loop
        playsInline
        preload="none"
        width={1280}
        height={720}
        aria-label="EMOS | what investors find when they look you up (45-second film)"
        style={{ opacity: showVideo ? 1 : 0, transition: "opacity .3s ease" }}
      />
    </>
  );
}

"use client";

// Cal.com inline calendar that only loads when the visitor scrolls near it.
// The root layout defines the Cal() queue stub (lazyOnload); embed.js (~2 MB)
// is fetched on the first Cal(...) call, so nothing loads until this fires.
// Jump links (#id) also work: the jump is a scroll, so the observer fires.

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type CalFn = (...args: unknown[]) => void;

export function LazyCalInline({
  id,
  calLink = "syed-irfan-ajmal-cjjebv/30min",
  style,
  rootMargin = "800px 0px",
}: {
  id: string;
  calLink?: string;
  style?: CSSProperties;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const init = () => {
      const Cal = (window as unknown as { Cal?: CalFn }).Cal;
      if (typeof Cal !== "function") {
        timer = setTimeout(init, 200); // layout stub not defined yet
        return;
      }
      Cal("init", { origin: "https://cal.com" });
      Cal("inline", { elementOrSelector: `#${id}`, calLink, config: { layout: "month_view" } });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        init();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [id, calLink, rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      style={{ minWidth: 320, height: 700, overflow: "scroll", scrollMarginTop: 112, ...style }}
    />
  );
}

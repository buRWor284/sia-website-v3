"use client";

import { useEffect, useState } from "react";

/* Left table-of-contents rail with scroll-spy. Desktop-only (CSS hides < 1200px).
   IDs map to the section ids in src/app/emos/page.tsx. */
const ITEMS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "built-by", label: "§ 1 · Built By" },
  { id: "how-it-works", label: "§ 2 · The Real Problem" },
  { id: "investor-lens", label: "§ 3 · Investor Lens" },
  { id: "the-numbers", label: "§ 4 · The Numbers" },
  { id: "why-now", label: "§ 5 · Why Now" },
  { id: "how-it-works-detail", label: "§ 6 · What You'll Build" },
  { id: "tools", label: "§ 7 · Tools" },
  { id: "five-returns", label: "§ 8 · 5 Returns" },
  { id: "curriculum", label: "§ 9 · Curriculum" },
  { id: "proof", label: "§ 10 · Proof" },
  { id: "fit", label: "§ 11 · Fit Check" },
  { id: "calculator", label: "§ 12 · The Math" },
  { id: "pricing", label: "§ 13 · Investment" },
  { id: "guarantee", label: "§ 14 · Guarantee" },
  { id: "faq", label: "§ 15 · FAQ" },
];

export function EmosTOC() {
  const [active, setActive] = useState<string>(ITEMS[0].id);

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).id);
        });
      },
      { rootMargin: "-112px 0px -68% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <aside className="toc" id="toc">
      <div className="toc-h">On this page</div>
      {ITEMS.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          className={active === i.id ? "active" : undefined}
        >
          {i.label}
        </a>
      ))}
      <div className="toc-apply">
        <a href="#apply">Apply for Cohort 1 →</a>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";

/* Left table-of-contents rail with scroll-spy. Desktop-only (CSS hides < 1200px).
   IDs map to the section ids in src/app/emos/page.tsx. */
const ITEMS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "offer", label: "Offer & price" },
  { id: "built-by", label: "§ 1 · Built By" },
  { id: "how-it-works", label: "§ 2 · The Real Problem" },
  { id: "investor-lens", label: "§ 3 · Investor Lens" },
  { id: "why-now", label: "§ 4 · Why Now" },
  { id: "the-payoff", label: "§ 5 · The Payoff" },
  { id: "five-returns", label: "§ 6 · 5 Returns" },
  { id: "curriculum", label: "§ 7 · Curriculum" },
  { id: "tools", label: "§ 8 · Tools" },
  { id: "proof", label: "§ 9 · Proof" },
  { id: "fit", label: "§ 10 · Fit Check" },
  { id: "calculator", label: "§ 11 · The Math" },
  { id: "pricing", label: "§ 12 · Investment" },
  { id: "guarantee", label: "§ 13 · Guarantee" },
  { id: "faq", label: "§ 14 · FAQ" },
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

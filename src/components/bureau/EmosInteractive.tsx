"use client";

import { type ReactNode, useCallback } from "react";

/* ── Tier-1 Card Grid ─────────────────────────────────────────────────────── */
export function T1Grid({ className, children }: { className?: string; children: ReactNode }) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const grid = e.currentTarget;
    const card = (e.target as HTMLElement).closest<HTMLElement>(".emos-t1");
    if (!card) return;
    // Don't toggle if clicking a link inside an open card
    if ((e.target as HTMLElement).closest("a") && card.hasAttribute("data-open")) return;
    const isOpen = card.hasAttribute("data-open");
    grid.querySelectorAll<HTMLElement>(".emos-t1[data-open]").forEach(c => c.removeAttribute("data-open"));
    if (!isOpen) card.setAttribute("data-open", "");
  }, []);

  return (
    <div className={`emos-t1-grid ${className || ""}`} onClick={handleClick}>
      {children}
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
export function AccordionGroup({ children, className }: { children: ReactNode; className?: string }) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".emos-acc-q");
    if (!btn) return;
    const item = btn.closest<HTMLElement>(".emos-acc-item");
    if (!item) return;
    const isOpen = item.classList.contains("open");
    const parent = item.parentElement;
    if (parent) parent.querySelectorAll<HTMLElement>(".emos-acc-item.open").forEach(el => el.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  }, []);

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}

/* ── Section fade-in observer ─────────────────────────────────────────────── */
export function EmosPageWrapper({ children }: { children: ReactNode }) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    const sections = node.querySelectorAll<HTMLElement>("section");
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "none";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    sections.forEach((s, i) => {
      if (i === 0) {
        s.style.opacity = "1";
        s.style.transform = "none";
        return;
      }
      s.style.opacity = "0";
      s.style.transform = "translateY(12px)";
      s.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      obs.observe(s);
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}

/* ── Referral copy button ─────────────────────────────────────────────────── */
export function ReferralCopyButton() {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        (e.target as HTMLButtonElement).textContent = "Copied!";
        setTimeout(() => { (e.target as HTMLButtonElement).textContent = "Copy page link"; }, 2000);
      }).catch(() => {});
    }
  }, []);

  return (
    <button onClick={handleClick} style={{
      fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 10,
      letterSpacing: ".14em", textTransform: "uppercase", color: "#1a1410",
      background: "none", border: "none", borderBottom: "1px solid #1a1410",
      cursor: "pointer", padding: 0, marginLeft: 8,
    }}>
      Copy page link
    </button>
  );
}

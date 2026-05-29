"use client";

import { useEffect, useState } from "react";
import { GROT, INK, YEL } from "@/lib/tokens";

const TOC_ITEMS = [
  { id: "res-kits",          label: "Kits" },
  { id: "res-playbooks",     label: "Playbooks" },
  { id: "res-articles",      label: "Articles" },
  { id: "res-podcast",       label: "Podcast" },
  { id: "res-visual-essays", label: "Visual Essays" },
  { id: "res-press",         label: "Press" },
];

export function TocBar() {
  const [active, setActive] = useState("res-kits");

  useEffect(() => {
    const sections = TOC_ITEMS
      .map((t) => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-10% 0px -75% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: INK,
        borderBottom: `2px solid ${YEL}`,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch" as never,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          padding: "0 20px",
          minWidth: "max-content",
        }}
      >
        {/* "Resources" label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: 20,
            borderRight: "1px solid rgba(241,235,222,.15)",
            marginRight: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(241,235,222,.4)",
            }}
          >
            Resources
          </span>
        </div>

        {TOC_ITEMS.map((item, i) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "13px 14px",
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: isActive ? 800 : 600,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive ? YEL : "rgba(241,235,222,.55)",
                borderBottom: isActive ? `2px solid ${YEL}` : "2px solid transparent",
                marginBottom: -2,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: isActive ? YEL : "rgba(241,235,222,.3)",
                }}
              >
                §0{i + 1}
              </span>
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, YEL, SERIF } from "@/lib/tokens";

type Status = "live" | "platform";

export interface PipelineTool {
  step: string;
  name: string;
  role: string;
  blurb: string;
  href: string;
  howItWorksHref: string;
  status: Status;
}

export interface AdjacentTool {
  name: string;
  role: string;
  blurb: string;
  href: string;
}

type Tab = "all" | "emos" | "howitworks" | "other";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "emos", label: "EMOS Pipeline" },
  { key: "howitworks", label: "How It Works" },
  { key: "other", label: "Other Tools" },
];

function StatusTag({ status }: { status: Status }) {
  return (
    <span
      style={{
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 8.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "3px 7px",
        background: status === "live" ? "#3e6b45" : INK,
        color: status === "live" ? "#fff" : YEL,
      }}
    >
      {status === "live" ? "Live · Free" : "Teaser · Inside EMOS"}
    </span>
  );
}

export function ToolsClientShell({ pipeline, adjacent }: { pipeline: PipelineTool[]; adjacent: AdjacentTool[] }) {
  const [tab, setTab] = useState<Tab>("all");

  // Honour a shared #emos / #howitworks / #other / #all link on first load.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (hash === "emos" || hash === "howitworks" || hash === "other" || hash === "all") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from URL hash on first load
      setTab(hash as Tab);
    }
  }, []);

  const selectTab = (key: Tab) => {
    setTab(key);
    window.history.replaceState(null, "", key === "all" ? "#all" : `#${key}`);
  };

  const showPipeline = tab === "all" || tab === "emos" || tab === "howitworks";
  const showAdjacent = tab === "all" || tab === "other";
  const isHowItWorks = tab === "howitworks";

  return (
    <>
      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <section style={{ padding: "20px 56px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => selectTab(t.key)}
              style={{
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "8px 14px",
                border: `1px solid ${active ? INK : INK15}`,
                background: active ? INK : "transparent",
                color: active ? YEL : INK55,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </section>

      {/* ── Pipeline grid ────────────────────────────────────────────────── */}
      {showPipeline && (
        <section style={{ padding: "28px 56px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK }}>
              {isHowItWorks ? "How Each Tool Works" : "The Pipeline"}
            </span>
            <div style={{ flex: 1, height: 1, background: INK15 }} />
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>6 Steps</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: INK15, border: `1px solid ${INK15}` }}>
            {pipeline.map((tool, i) => (
              <a
                key={tool.name}
                href={isHowItWorks ? tool.howItWorksHref : tool.href}
                style={{ display: "block", background: PAPER, padding: "22px 22px 24px", textDecoration: "none", color: INK, position: "relative" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK35, letterSpacing: "-0.02em" }}>{tool.step}</span>
                  <StatusTag status={tool.status} />
                  {isHowItWorks && (
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>
                      How it works →
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK, marginBottom: 4 }}>{tool.name}</div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>{tool.role}</div>
                <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK70, margin: 0 }}>{tool.blurb}</p>
                {!isHowItWorks && i < pipeline.length - 1 && (
                  <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", fontFamily: SERIF, fontSize: 14, color: INK35, background: PAPER, border: `1px solid ${INK15}`, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    →
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Adjacent / other tools ───────────────────────────────────────── */}
      {showAdjacent && (
        <section style={{ padding: "20px 56px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>Other Tools · Outside The Pipeline</span>
            <div style={{ flex: 1, height: 1, background: INK15 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {adjacent.map((tool) => (
              <a key={tool.name} href={tool.href} style={{ display: "block", border: `1px solid ${INK15}`, background: PAPER2, padding: "18px 20px 20px", textDecoration: "none", color: INK }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17 }}>{tool.name}</div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, margin: "4px 0 8px" }}>{tool.role}</div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: INK70, margin: 0 }}>{tool.blurb}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

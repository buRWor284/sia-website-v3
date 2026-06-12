"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { SCaps, SectionMast } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

export type IndexEpisode = {
  code: string;
  title: string;
  guest: string;
  slug: string;
  featured: boolean;
  solo: boolean;
  date: string | null;
  summary: string | null;
  topics: string[];
};

export type IndexSeason = {
  label: string;
  year: string;
  episodes: IndexEpisode[];
};

const TYPE_FILTERS = [
  ["all", "All episodes"],
  ["guest", "Interviews"],
  ["solo", "Solo"],
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number][0];

export function EpisodeIndex({
  seasons,
  topics,
}: {
  seasons: IndexSeason[];
  topics: string[];
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [topic, setTopic] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      seasons
        .map((s) => ({
          ...s,
          episodes: s.episodes.filter(
            (ep) =>
              (type === "all" || (type === "solo" ? ep.solo : !ep.solo)) &&
              (!topic || ep.topics.includes(topic))
          ),
        }))
        .filter((s) => s.episodes.length > 0),
    [seasons, type, topic]
  );

  const total = seasons.reduce((n, s) => n + s.episodes.length, 0);
  const shown = filtered.reduce((n, s) => n + s.episodes.length, 0);
  const isFiltering = type !== "all" || topic !== null;

  const chipStyle = (active: boolean): CSSProperties => ({
    padding: "8px 14px",
    border: `1px solid ${INK}`,
    background: active ? INK : "transparent",
    color: active ? PAPER : INK,
    cursor: "pointer",
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 10.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  });

  return (
    <section style={{ background: PAPER, padding: "0 56px 90px" }}>
      <SectionMast n="03" label="All episodes · Chronological index" />

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {TYPE_FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            aria-pressed={type === key}
            style={chipStyle(type === key)}
          >
            {label}
          </button>
        ))}
        <span
          aria-hidden
          style={{
            margin: "0 6px",
            color: INK55,
            fontFamily: GROT,
            fontSize: 12,
          }}
        >
          /
        </span>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(topic === t ? null : t)}
            aria-pressed={topic === t}
            style={chipStyle(topic === t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div style={{ marginBottom: 40, minHeight: 18 }}>
        <SCaps size={10.5} ls="0.16em" color={INK55}>
          {isFiltering ? (
            <>
              Showing {shown} of {total} episodes ·{" "}
              <button
                type="button"
                onClick={() => {
                  setType("all");
                  setTopic(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: GROT,
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: INK,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>{total} episodes · 4 seasons</>
          )}
        </SCaps>
      </div>

      {filtered.length === 0 && (
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 17,
            color: INK70,
          }}
        >
          No episodes match this combination. Try clearing a filter.
        </p>
      )}

      {filtered.map((s, si) => (
        <div
          key={s.label}
          style={{ marginBottom: si < filtered.length - 1 ? 56 : 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              paddingBottom: 12,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 44,
                  color: INK,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.label}
              </h3>
              <SCaps size={11} ls="0.18em" color={INK70}>
                {s.year} &nbsp;·&nbsp; {s.episodes.length} episode
                {s.episodes.length === 1 ? "" : "s"}
              </SCaps>
            </div>
            <SCaps size={11} ls="0.18em" color={INK55}>
              Reverse chronological
            </SCaps>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {s.episodes.map((ep) => (
              <li
                key={ep.code}
                className="episode-row"
                style={{ borderBottom: `1px solid ${INK15}` }}
              >
                <div
                  style={{
                    fontFamily: GROT,
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: "0.06em",
                    color: INK,
                  }}
                >
                  {ep.code}
                </div>
                <div style={{ minWidth: 0 }}>
                  <a
                    href={`/podcast/${ep.slug}`}
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 600,
                      fontSize: 19,
                      color: INK,
                      textDecoration: "none",
                      lineHeight: 1.3,
                    }}
                  >
                    {ep.featured && (
                      <span
                        style={{
                          background: YEL,
                          padding: "0 6px",
                          marginRight: 8,
                        }}
                      >
                        Featured
                      </span>
                    )}
                    {ep.title}
                  </a>
                  {ep.summary && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontFamily: SERIF,
                        fontSize: 14.5,
                        fontStyle: "italic",
                        color: INK70,
                        lineHeight: 1.45,
                        maxWidth: 640,
                      }}
                    >
                      {ep.summary}
                    </p>
                  )}
                </div>
                <div className="episode-guest" style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 14.5,
                      color: INK70,
                    }}
                  >
                    {ep.guest}
                  </div>
                  {ep.date && (
                    <div style={{ marginTop: 4 }}>
                      <SCaps size={10} ls="0.14em" color={INK55}>
                        {ep.date}
                      </SCaps>
                    </div>
                  )}
                </div>
                <div className="episode-listen" style={{ textAlign: "right" }}>
                  <a
                    href={`/podcast/${ep.slug}`}
                    aria-label={`Listen: ${ep.title}`}
                    style={{
                      fontFamily: GROT,
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: INK55,
                      textDecoration: "none",
                    }}
                  >
                    Listen ↗
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

"use client";

/**
 * PriorContact — "you have pitched this person before" (2026-09-09).
 *
 * The check EMOS can make and an outreach tool cannot: it knows WHICH COMPANY
 * the previous pitch was for. Approaching the same journalist again for the
 * same company inside a month is the mistake worth stopping; approaching them
 * for a different client is normal work and is shown neutrally, never as a
 * warning. See EMOS-Architecture-Decisions-2026-09-09.md.
 */

import React from "react";
import { REPEAT_WARN_DAYS, type JournalistHistory } from "@/lib/journalist-history-types";

const INK55 = "rgba(26,20,16,.55)";
const AMBER = "#d99211";
const RED   = "#c14a32";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function priorContactNote(
  history: JournalistHistory | undefined,
  activeCompanyId: string | null,
): { text: string; level: "warn" | "info" } | null {
  if (!history?.lastPitchedAt) return null;
  const days = daysSince(history.lastPitchedAt);
  const when = days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  const sameCompany = !!activeCompanyId && history.lastCompanyId === activeCompanyId;
  // Say what actually happened. Before 2026-09-10 a PressIQ SCORE read as
  // "Already pitched today", which is false: nothing was sent.
  const verb = history.lastKind === "sent" ? "Pitched" : history.lastKind === "tracked" ? "Pitch tracked" : "Pitch scored";

  if (sameCompany && days <= REPEAT_WARN_DAYS) {
    return {
      text: history.lastKind === "sent"
        ? `Already pitched ${when} for this same company.`
        : `${verb} ${when} for this same company.`,
      level: "warn",
    };
  }
  if (sameCompany) {
    return { text: `${verb} ${when} for this company.`, level: "info" };
  }
  if (history.lastCompanyName) {
    return { text: `${verb} ${when} for ${history.lastCompanyName}.`, level: "info" };
  }
  return { text: `${verb} ${when}.`, level: "info" };
}

export default function PriorContact({
  history,
  activeCompanyId,
  compact,
}: {
  history: JournalistHistory | undefined;
  activeCompanyId: string | null;
  compact?: boolean;
}) {
  const note = priorContactNote(history, activeCompanyId);
  if (!note) return null;
  const color = note.level === "warn" ? RED : INK55;

  return (
    <span
      style={{
        fontFamily: note.level === "warn" ? GROT : SERIF,
        fontWeight: note.level === "warn" ? 700 : 400,
        fontStyle: note.level === "warn" ? "normal" : "italic",
        fontSize: compact ? 10 : 11.5,
        letterSpacing: note.level === "warn" ? ".04em" : 0,
        color,
        border: note.level === "warn" ? `1px solid ${color}` : "none",
        padding: note.level === "warn" ? "1px 6px" : 0,
        whiteSpace: "nowrap",
      }}
    >
      {note.level === "warn" ? "⚠ " : ""}{note.text}
    </span>
  );
}

export { AMBER };

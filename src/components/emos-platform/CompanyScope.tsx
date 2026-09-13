"use client";

/**
 * CompanyScope — "which company's rows am I looking at" for the list tools
 * (CoverageIQ pitches, AssetIQ assets). 2026-09-13, company scoping 1b/1c.
 *
 * The CompanyPicker says which company you are WORKING FOR; this says which
 * rows the table SHOWS. Three settings:
 *   active     — only rows tagged with the company in the picker (default;
 *                the client-facing setting, so a screen-share shows one client)
 *   all        — every row in the org, with the company shown per row
 *   unassigned — rows that predate company tagging (company_id is null)
 *
 * It lives in the picker's `extra` slot so the two controls read as one bar.
 * Pure UI: the caller filters with `matchesScope`.
 */

import React from "react";

export type CompanyScope = "active" | "all" | "unassigned";

export function matchesScope(
  scope: CompanyScope,
  activeCompanyId: string | null,
  rowCompanyId: string | null,
): boolean {
  if (scope === "all") return true;
  if (scope === "unassigned") return rowCompanyId === null;
  // No company selected yet: nothing to scope by, show everything rather
  // than an empty table with no explanation.
  if (!activeCompanyId) return true;
  return rowCompanyId === activeCompanyId;
}

const INK   = "#1a1410";
const INK15 = "rgba(26,20,16,.15)";
const INK55 = "rgba(26,20,16,.55)";
const PAPER = "#f1ebde";
const GROT  = "var(--font-grot)";

export function CompanyScopeSelect({
  scope, onChange, activeName, counts, noun,
}: {
  scope: CompanyScope;
  onChange: (s: CompanyScope) => void;
  activeName: string | null;
  counts: { active: number; all: number; unassigned: number };
  /** Plural noun for the counts, e.g. "pitches". */
  noun: string;
}) {
  return (
    <>
      <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>
        showing
      </span>
      <select
        value={scope}
        onChange={e => onChange(e.target.value as CompanyScope)}
        aria-label={`Which company's ${noun} to show`}
        style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px", outline: "none", cursor: "pointer", maxWidth: 260 }}
      >
        <option value="active">{activeName ?? "This company"} · {counts.active}</option>
        <option value="all">All companies · {counts.all}</option>
        {counts.unassigned > 0 && (
          <option value="unassigned">Unassigned · {counts.unassigned}</option>
        )}
      </select>
    </>
  );
}

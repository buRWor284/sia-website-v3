"use client";

/**
 * useCompanyName — the NAME of the currently selected company.
 *
 * Rewritten 2026-09-09 alongside useCompanyContext: the name now lives on the
 * selected `public.companies` row rather than in localStorage. Same signature
 * as before, so call sites are unchanged:
 *   const [companyName, setCompanyName] = useCompanyName();
 *
 * Typing a name here when the org has no company yet CREATES one once the
 * typing settles, which is what makes "enter it in SignalIQ and it carries
 * forward" true. Outside <CompanyProvider> it falls back to the old
 * localStorage behaviour.
 */

import { useState } from "react";
import { useCompanyOptional } from "@/components/emos-platform/CompanyProvider";
import { LEGACY_NAME_KEY } from "@/lib/company-types";

function readInitial(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(LEGACY_NAME_KEY) ?? ""; } catch { return ""; }
}

export function useCompanyName(): [string, (v: string) => void] {
  const ctx = useCompanyOptional();
  const [local, setLocalState] = useState<string>(readInitial);

  if (ctx) return [ctx.company?.name ?? "", ctx.setActiveName];

  function setLocalName(v: string) {
    setLocalState(v);
    try { localStorage.setItem(LEGACY_NAME_KEY, v); } catch { /* noop */ }
  }
  return [local, setLocalName];
}

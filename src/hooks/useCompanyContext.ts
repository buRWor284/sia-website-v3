"use client";

/**
 * useCompanyContext — the company DESCRIPTION for the currently selected
 * company, shared across the EMOS pipeline.
 *
 * Rewritten 2026-09-09 (state layer, phase 1). It used to be a single
 * localStorage string, which meant a new browser, a teammate, a server-side
 * run and a headless caller all saw nothing. It now reads and writes the
 * selected row in `public.companies` through <CompanyProvider>.
 *
 * The call signature is unchanged on purpose, so existing call sites keep
 * working:
 *   const [companyContext, setCompanyContext] = useCompanyContext();
 *
 * Writes are optimistic and persisted after typing settles. Outside the
 * provider (the public /tools/* pages), it falls back to the old per-visit
 * localStorage behaviour so nothing there changes.
 */

import { useState } from "react";
import { useCompanyOptional } from "@/components/emos-platform/CompanyProvider";
import { LEGACY_CONTEXT_KEY } from "@/lib/company-types";

function readInitial(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(LEGACY_CONTEXT_KEY) ?? ""; } catch { return ""; }
}

export function useCompanyContext(): [string, (v: string) => void] {
  const ctx = useCompanyOptional();

  // Fallback state — hooks must run unconditionally, so this is always here
  // and only used when no provider is mounted. Lazy initializer rather than an
  // effect, matching useCompanyName.
  const [local, setLocal] = useState<string>(readInitial);

  if (ctx) return [ctx.company?.context ?? "", ctx.setActiveContext];

  function setLocalContext(v: string) {
    setLocal(v);
    try { localStorage.setItem(LEGACY_CONTEXT_KEY, v); } catch { /* noop */ }
  }
  return [local, setLocalContext];
}

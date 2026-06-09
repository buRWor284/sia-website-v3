"use client";

/**
 * useCompanyName — persists the company/startup name across the EMOS pipeline.
 *
 * Stored in localStorage under "emos_company_name" so it survives page
 * navigation and is saved alongside each signal for attribution.
 *
 * Reads from localStorage via a lazy initializer (no effect), so it stays
 * lint-clean and avoids cascading renders.
 *
 * Usage:
 *   const [companyName, setCompanyName] = useCompanyName();
 */

import { useState } from "react";

const STORAGE_KEY = "emos_company_name";

function readInitial(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
}

export function useCompanyName(): [string, (v: string) => void] {
  const [name, setNameState] = useState<string>(readInitial);

  function setName(v: string) {
    setNameState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* noop */ }
  }

  return [name, setName];
}

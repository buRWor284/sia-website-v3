"use client";

/**
 * useCompanyContext — persists the user's startup context across the EMOS pipeline.
 *
 * Stored in localStorage under "emos_company_context" so it survives
 * page navigation without needing a DB round-trip.
 *
 * Usage:
 *   const [companyContext, setCompanyContext] = useCompanyContext();
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "emos_company_context";

export function useCompanyContext(): [string, (v: string) => void] {
  const [context, setContextState] = useState("");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setContextState(saved);
    } catch { /* storage unavailable */ }
  }, []);

  function setContext(v: string) {
    setContextState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* noop */ }
  }

  return [context, setContext];
}

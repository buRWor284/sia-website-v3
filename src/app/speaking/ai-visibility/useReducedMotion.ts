"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Tracks the user's prefers-reduced-motion setting as an external store instead of
 * mirroring it into state from inside an effect (which trips react-hooks/set-state-in-effect
 * and, per React's own guidance, is exactly the kind of read this hook exists for).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

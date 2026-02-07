"use client";

import { useState, useEffect } from "react";

/**
 * Hook that tracks whether a CSS media query matches.
 * Returns false during SSR and initial hydration to avoid mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Returns true when viewport is below md breakpoint (768px).
 * Always returns false during SSR (mobile layout is CSS-handled).
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Returns true when viewport is at or above lg breakpoint (1024px).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

"use client";

import { useEffect, useSyncExternalStore } from "react";

function createMediaQueryStore(query: string) {
  let mediaQuery: MediaQueryList | null = null;

  function getMediaQuery() {
    if (mediaQuery === null && typeof window !== "undefined") {
      mediaQuery = window.matchMedia(query);
    }
    return mediaQuery;
  }

  return {
    subscribe(listener: () => void) {
      const mq = getMediaQuery();
      mq?.addEventListener("change", listener);
      return () => mq?.removeEventListener("change", listener);
    },
    getSnapshot() {
      return getMediaQuery()?.matches ?? false;
    },
    getServerSnapshot() {
      return false;
    },
  };
}

export function useMediaQuery(query: string): boolean {
  const store = createMediaQueryStore(query);

  // Force re-subscribe when query changes
  useEffect(() => {
    // no-op, just dependency tracking
  }, [query]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}

/** Convenience presets */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

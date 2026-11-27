import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let sharedMediaQuery: MediaQueryList | null = null;
const listeners = new Set<() => void>();

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  if (!sharedMediaQuery) {
    sharedMediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    sharedMediaQuery.addEventListener('change', () => {
      listeners.forEach((listener) => listener());
    });
  }
  return sharedMediaQuery;
}

function subscribe(callback: () => void): () => void {
  getMediaQuery();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return getMediaQuery()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Shared singleton MediaQueryList subscription via useSyncExternalStore.
 * Prevents creating 30 redundant matchMedia listeners across Bento tiles.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

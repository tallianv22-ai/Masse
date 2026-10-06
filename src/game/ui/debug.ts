import { useSyncExternalStore } from "react";

/**
 * Development readout. Off unless `?debug=1` or the backtick key.
 * Not part of the game presentation.
 */
let enabled = false;
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const flag = new URLSearchParams(window.location.search).get("debug");
  enabled = flag === "1" || flag === "true";
}

function emit() {
  for (const listener of listeners) listener();
}

export function getDebugEnabled() {
  ensureHydrated();
  return enabled;
}

export function setDebugEnabled(next: boolean) {
  ensureHydrated();
  if (enabled === next) return;
  enabled = next;
  emit();
}

export function toggleDebugEnabled() {
  setDebugEnabled(!getDebugEnabled());
}

export function subscribeDebug(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDebugEnabled() {
  return useSyncExternalStore(subscribeDebug, getDebugEnabled, () => false);
}

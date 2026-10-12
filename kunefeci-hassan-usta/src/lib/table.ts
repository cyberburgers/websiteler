"use client";

import { useSyncExternalStore } from "react";

/**
 * Table number from the QR card on the table (…/?masa=7). It is kept for the visit
 * in sessionStorage and taken out of the address bar, so a shared link doesn't carry it.
 */
const KEY = "masa";
const EVENT = "masa:degisti";

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function capture() {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(KEY);
  if (value === null) return;
  url.searchParams.delete(KEY);
  window.history.replaceState(null, "", url);
  if (!/^\d{1,3}$/.test(value)) return;
  try {
    sessionStorage.setItem(KEY, value);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  capture();
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useTable(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

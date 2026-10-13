"use client";

import { useSyncExternalStore } from "react";

/**
 * Table number from the QR card on the table (…/?masa=7). It is kept for the visit in sessionStorage
 * and taken out of the address bar, so a shared link doesn't carry it. A visit ends after a few hours:
 * a tab reopened at home the next day must not still call the waiter to table 7.
 */
const KEY = "masa";
const EVENT = "masa:degisti";
const VISIT_MS = 4 * 60 * 60 * 1000;

function read(): string | null {
  try {
    const [table, at] = (sessionStorage.getItem(KEY) ?? "").split("@");
    return /^\d{1,3}$/.test(table) && Date.now() - Number(at) < VISIT_MS ? table : null;
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
    sessionStorage.setItem(KEY, `${value}@${Date.now()}`);
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

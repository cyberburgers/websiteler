"use client";

import { useSyncExternalStore } from "react";

/**
 * The open dish lives in the address bar (#fistikli-kunefe): the link can be shared, and Back closes
 * the sheet instead of leaving the page.
 */
const HASH_EVENT = "menu-urun:degisti";
// The address right after we opened a sheet; while it is still current, closing can simply go Back.
let pushedUrl: string | null = null;

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(HASH_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(HASH_EVENT, onChange);
  };
}

const read = () => decodeURIComponent(window.location.hash.slice(1));

export function useItemHash(): string {
  return useSyncExternalStore(subscribe, read, () => "");
}

export function openItem(id: string) {
  window.history.pushState(null, "", `#${id}`);
  pushedUrl = window.location.href;
  window.dispatchEvent(new Event(HASH_EVENT));
}

export function closeItem() {
  if (pushedUrl === window.location.href) {
    pushedUrl = null;
    window.history.back();
    return;
  }
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new Event(HASH_EVENT));
}

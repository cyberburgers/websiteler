"use client";

import { useSyncExternalStore } from "react";

/**
 * The open dish lives in the address bar (#fistikli-kunefe): the link can be shared, and Back closes
 * the sheet instead of leaving the page.
 */
const HASH_EVENT = "menu-urun:degisti";
// The address right after we opened a sheet; while it is still current, closing can simply go Back.
let pushedUrl: string | null = null;
// Back (or Forward) moved away from it: the next close mustn't go Back again, out of the page.
if (typeof window !== "undefined") window.addEventListener("popstate", () => (pushedUrl = null));

/** "%C3%A7ay" -> "çay"; a broken one (#50%) is taken as it is rather than throwing. */
export function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

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

const read = () => safeDecode(window.location.hash.slice(1));

export function useItemHash(): string {
  return useSyncExternalStore(subscribe, read, () => "");
}

/**
 * `replace`: another dish's sheet is open (a "Yanında iyi gider" link). The new dish takes its place in
 * the history, so closing it goes back to the menu rather than to the dish before.
 */
export function openItem(id: string, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, "", `#${id}`);
  else window.history.pushState(null, "", `#${id}`);
  if (!replace || pushedUrl) pushedUrl = window.location.href;
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

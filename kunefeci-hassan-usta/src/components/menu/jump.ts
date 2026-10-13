"use client";

import { openItem } from "./itemHash";

let timer = 0;

/**
 * Glides the menu to a category heading. On phones the header is tucked away for the trip, so the
 * heading lands just under the category bar whichever way the page moves (the sections carry a
 * matching scroll margin). Wide screens keep their header; the margin there allows for it.
 */
export function jumpTo(section: HTMLElement) {
  const root = document.documentElement;
  root.dataset.header = "hidden";
  root.dataset.jump = "";
  window.clearTimeout(timer);
  timer = window.setTimeout(() => delete root.dataset.jump, 1000);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** A link to a dish or category on the page already open: no navigation, just go there. */
export function goToHash(id: string) {
  const target = document.getElementById(id);
  if (id.startsWith("kategori-")) {
    if (target) jumpTo(target);
    return;
  }
  // From an open sheet the new dish takes its place in the history; otherwise it is a new step, so
  // closing it goes Back to where the guest was reading. (The address alone can't tell: #icerik, an old link.)
  const sheetOpen = document.querySelector("dialog.menu-sheet[open]") !== null;
  openItem(id, { replace: sheetOpen });
}

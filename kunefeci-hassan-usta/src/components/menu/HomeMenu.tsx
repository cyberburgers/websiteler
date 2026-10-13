"use client";

import { useEffect, useRef, useState } from "react";
import { ItemSheet, type SheetLabels, type WaiterLabels } from "./ItemSheet";
import { closeItem, openItem, safeDecode, useItemHash } from "./itemHash";
import { jumpTo } from "./jump";
import { MenuSections } from "./MenuSections";
import type { MenuViewCategory } from "./types";

type Labels = SheetLabels & { tabs: string; details: string };

type Props = {
  categories: MenuViewCategory[];
  /** The menu's own address (/tr): dishes suggested in a sheet link to /tr#their-id. */
  homeHref: string;
  labels: Labels;
  waiter: WaiterLabels;
};

/** The size of the star pattern's tile (pattern-star in globals.css). */
const PATTERN_TILE = 88;

/** The whole menu on the home page: category pills that follow the scroll, every dish, and its detail sheet. */
export function HomeMenu({ categories, homeHref, labels, waiter }: Props) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  const hash = useItemHash();
  const items = categories.flatMap((c) => c.items);
  const selected = items.find((i) => i.id === hash) ?? null;
  const pairing = (selected?.pairing ?? []).flatMap((id) => {
    const item = items.find((i) => i.id === id);
    return item ? [{ item, href: `${homeHref}#${id}` }] : [];
  });

  // Highlight the category whose heading has passed under the pill bar. It is worked out from where
  // every section is, not from which one just crossed a line, so jumping back up can't pick the wrong one.
  // Right after a pill is tapped the smooth scroll runs through other sections; wait for it to settle.
  const settleUntil = useRef(0);
  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`kategori-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    let timer = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      const wait = settleUntil.current - performance.now();
      if (wait > 0) {
        timer = window.setTimeout(update, wait);
        return;
      }
      frame = requestAnimationFrame(() => {
        let current = sections[0]?.id;
        for (const section of sections) if (section.getBoundingClientRect().top <= 170) current = section.id;
        if (current) setActive(current.replace("kategori-", ""));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [categories]);

  // Opened at a category (an old category address lands here as /tr#kategori-…): settle on its heading
  // the same way a pill does, so the header can't sit on top of it.
  // Waits a moment first: at a table the "+ Ekle" buttons appear right after load and lengthen the drinks.
  useEffect(() => {
    const id = safeDecode(window.location.hash.slice(1));
    const section = id.startsWith("kategori-") ? document.getElementById(id) : null;
    if (!section) return;
    const timer = window.setTimeout(() => jumpTo(section), 120);
    return () => window.clearTimeout(timer);
  }, []);

  // The star pattern behind the top of the page runs down to this bar's bottom line: the page's pattern
  // stops where the bar starts (--menu-bar-top), and the bar carries on with it, lined up with the tiles
  // above. The spot just above the bar keeps the bar's place in the page even while the bar is stuck.
  const navRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const spot = spotRef.current;
    if (!nav || !spot) return;
    const root = document.documentElement;
    const place = () => {
      const top = spot.getBoundingClientRect().top + window.scrollY;
      const left = nav.getBoundingClientRect().left + window.scrollX;
      root.style.setProperty("--menu-bar-top", `${top}px`);
      nav.style.backgroundPosition = `${-(left % PATTERN_TILE)}px ${-(top % PATTERN_TILE)}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--menu-bar-top");
    };
  }, []);

  // Keep the active pill in view inside the horizontally scrolling bar.
  useEffect(() => {
    const bar = barRef.current;
    const pill = bar?.querySelector<HTMLElement>(`[data-pill="${active}"]`);
    if (!bar || !pill) return;
    bar.scrollTo({ left: pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <span ref={spotRef} aria-hidden="true" className="block" />
      <nav
        ref={navRef}
        aria-label={labels.tabs}
        className="under-header pattern-star sticky top-16 z-30 -mx-4 border-b border-krem-50/[0.08] bg-zumrut-925/95 backdrop-blur-xl sm:-mx-6 md:top-20 lg:-mx-8"
      >
        <div ref={barRef} className="no-scrollbar relative flex h-[60px] items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {categories.map((c) => {
            const current = c.id === active;
            return (
              <a
                key={c.id}
                href={`#kategori-${c.id}`}
                data-pill={c.id}
                aria-current={current ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(c.id);
                  settleUntil.current = performance.now() + 900;
                  const section = document.getElementById(`kategori-${c.id}`);
                  if (section) {
                    jumpTo(section);
                    section.focus({ preventScroll: true });
                  }
                }}
                className={`flex h-[38px] shrink-0 items-center rounded-full px-[15px] text-[13.5px] transition-colors ${
                  current
                    ? "bg-fistik-300 font-extrabold text-zumrut-925"
                    : "bg-krem-100 font-bold text-zumrut-900 hover:bg-krem-50"
                }`}
              >
                {c.name}
              </a>
            );
          })}
        </div>
      </nav>

      <MenuSections categories={categories} labels={labels} onOpen={openItem} />

      <ItemSheet
        item={selected}
        pairing={pairing}
        labels={labels}
        waiter={waiter}
        onDismiss={closeItem}
      />
    </>
  );
}

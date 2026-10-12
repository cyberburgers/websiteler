"use client";

import { useEffect, useRef, useState } from "react";
import { fill } from "@/lib/format";
import { ItemSheet, type SheetLabels, type WaiterLabels } from "./ItemSheet";
import { closeItem, openItem, useItemHash } from "./itemHash";
import { ItemLine, lineClass } from "./parts";
import type { MenuViewCategory, MenuViewItem } from "./types";

type Labels = SheetLabels & { tabs: string; dishes: string; drinks: string; trayAsk: string };

type Props = {
  categories: MenuViewCategory[];
  pairing: { item: MenuViewItem; href: string }[];
  trayHref: string;
  labels: Labels;
  waiter: WaiterLabels;
};

/** The whole menu on the home page: category pills that follow the scroll, every dish, and its detail sheet. */
export function HomeMenu({ categories, pairing, trayHref, labels, waiter }: Props) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  const hash = useItemHash();
  const selected = categories.flatMap((c) => c.items).find((i) => i.id === hash) ?? null;
  const selectedLayout = categories.find((c) => c.id === selected?.categoryId)?.layout;

  // Highlight the category currently under the pill bar.
  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`kategori-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("kategori-", ""));
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  // Keep the active pill in view inside the horizontally scrolling bar.
  useEffect(() => {
    const bar = barRef.current;
    const pill = bar?.querySelector<HTMLElement>(`[data-pill="${active}"]`);
    if (!bar || !pill) return;
    bar.scrollTo({ left: pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <nav
        aria-label={labels.tabs}
        className="under-header sticky top-16 z-30 -mx-4 border-b border-krem-50/[0.08] bg-zumrut-925/95 backdrop-blur-xl sm:-mx-6 md:top-20 lg:-mx-8"
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
                  document.getElementById(`kategori-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex h-[38px] shrink-0 items-center rounded-full px-[15px] text-[13.5px] transition-colors ${
                  current
                    ? "bg-fistik-300 font-extrabold text-zumrut-925"
                    : "bg-krem-50/[0.08] font-bold text-krem-100/85 hover:bg-krem-50/15"
                }`}
              >
                {c.name}
              </a>
            );
          })}
        </div>
      </nav>

      {categories.map((category) => (
        <section
          key={category.id}
          id={`kategori-${category.id}`}
          aria-labelledby={`baslik-${category.id}`}
          className="pt-6 md:pt-9"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 id={`baslik-${category.id}`} className="font-display text-2xl font-semibold text-krem-50 md:text-3xl">
              {category.name}
            </h3>
            <span className="shrink-0 text-xs font-bold text-krem-100/50">
              {fill(category.layout === "cards" ? labels.dishes : labels.drinks, { n: category.items.length })}
            </span>
          </div>
          {category.description && <p className="mt-1 text-[13px] text-krem-100/60">{category.description}</p>}
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
            {category.items.map((item) => (
              <li key={item.id} id={item.id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => openItem(item.id)}
                  className={`${lineClass} ${category.layout === "list" ? "min-h-[68px] ps-4" : ""}`}
                >
                  <ItemLine item={item} thumb={category.layout === "cards"} size="lg" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <ItemSheet
        item={selected}
        pairing={selectedLayout === "cards" ? pairing : []}
        labels={labels}
        waiter={waiter}
        tray={{ href: trayHref, label: labels.trayAsk }}
        onDismiss={closeItem}
      />
    </>
  );
}

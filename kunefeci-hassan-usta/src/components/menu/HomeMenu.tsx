"use client";

import { useEffect, useRef, useState } from "react";
import { fill } from "@/lib/format";
import { CategoryBanner } from "./CategoryBanner";
import { ItemCard, type ItemCardLabels } from "./ItemCard";
import { ItemSheet, type SheetLabels, type WaiterLabels } from "./ItemSheet";
import { closeItem, openItem, useItemHash } from "./itemHash";
import { DrinkMenu } from "./parts";
import type { MenuViewCategory, MenuViewItem } from "./types";

type Labels = SheetLabels & ItemCardLabels & { tabs: string; dishes: string; drinks: string };

type Props = {
  categories: MenuViewCategory[];
  pairing: { item: MenuViewItem; href: string }[];
  labels: Labels;
  waiter: WaiterLabels;
};

/** The whole menu on the home page: category pills that follow the scroll, every dish, and its detail sheet. */
export function HomeMenu({ categories, pairing, labels, waiter }: Props) {
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

      {categories.map((category, ci) => (
        <section
          key={category.id}
          id={`kategori-${category.id}`}
          aria-labelledby={`baslik-${category.id}`}
          className="pt-8 md:pt-14"
        >
          <CategoryBanner
            id={category.id}
            index={ci}
            name={category.name}
            description={category.description}
            photo={category.photo}
            count={fill(category.layout === "cards" ? labels.dishes : labels.drinks, { n: category.items.length })}
          />
          {category.layout === "cards" ? (
            <ul className="mt-4 grid grid-cols-1 gap-5 md:mt-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, ii) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={ii}
                  onOpen={() => openItem(item.id)}
                  labels={labels}
                />
              ))}
            </ul>
          ) : (
            <div className="mt-4 md:mt-6">
              <DrinkMenu items={category.items} onOpen={openItem} />
            </div>
          )}
        </section>
      ))}

      <ItemSheet
        item={selected}
        pairing={selectedLayout === "cards" ? pairing : []}
        labels={labels}
        waiter={waiter}
        onDismiss={closeItem}
      />
    </>
  );
}

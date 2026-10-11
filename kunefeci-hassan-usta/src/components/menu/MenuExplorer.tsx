"use client";

import { Search, SearchX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/ui";
import { foldForSearch } from "@/lib/format";
import { TagBadge, allergenIcons } from "./icons";
import type { MenuLabels, MenuViewCategory, MenuViewItem } from "./types";

type Props = {
  categories: MenuViewCategory[];
  labels: MenuLabels;
};

function Prices({ item, size = "md" }: { item: MenuViewItem; size?: "md" | "lg" }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {item.prices.map((price) => (
        <span key={price.label ?? "single"} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          {price.label && <span className="text-xs font-medium text-lacivert-800/55">{price.label}</span>}
          <span className={`font-extrabold tabular-nums text-karamel-700 ${size === "lg" ? "text-xl" : "text-[17px]"}`}>
            {price.formatted}
          </span>
        </span>
      ))}
    </span>
  );
}

function AllergenDots({ item }: { item: MenuViewItem }) {
  if (item.allergens.length === 0) return null;
  return (
    <span className="flex items-center gap-1 text-lacivert-800/40">
      {item.allergens.map((a) => {
        const Icon = allergenIcons[a.id];
        return <Icon key={a.id} className="size-3.5" aria-label={a.label} role="img" />;
      })}
    </span>
  );
}

function ItemCard({ item, onOpen }: { item: MenuViewItem; onOpen: (item: MenuViewItem) => void }) {
  return (
    <li id={item.id} className="scroll-mt-40 md:scroll-mt-44">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group flex h-full w-full gap-4 rounded-[1.75rem] bg-krem-50 p-3 text-start shadow-[0_1px_0_rgba(35,38,74,.04),0_24px_48px_-36px_rgba(35,38,74,.55)] ring-1 ring-lacivert-800/[0.07] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(35,38,74,.04),0_30px_60px_-34px_rgba(35,38,74,.6)] hover:ring-karamel-300/60 md:flex-col print:break-inside-avoid print:p-0 print:shadow-none print:ring-0"
      >
        <span className="flex min-w-0 flex-1 flex-col ps-2 pt-1.5 md:order-2 md:px-3 md:pb-2 md:pt-1">
          {item.tags.length > 0 && (
            <span className="mb-2 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <TagBadge key={t.id} id={t.id} label={t.label} />
              ))}
            </span>
          )}
          <span className="font-display text-xl font-medium leading-snug text-lacivert-800 md:text-2xl">
            {item.name}
          </span>
          <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-lacivert-800/65 md:text-[15px] print:line-clamp-none">
            {item.description}
          </span>
          <span className="mt-auto flex items-end justify-between gap-3 pt-3">
            <Prices item={item} />
            <AllergenDots item={item} />
          </span>
        </span>
        <span className="relative size-28 shrink-0 overflow-hidden rounded-[1.25rem] bg-krem-200 sm:size-32 md:order-1 md:aspect-[4/3] md:size-auto md:w-full md:rounded-[1.4rem] print:hidden">
          <Photo
            photo={item.photo}
            alt={item.name}
            sizes="(min-width: 1024px) 26rem, (min-width: 768px) 45vw, 8rem"
            className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        </span>
      </button>
    </li>
  );
}

function ItemRow({ item, onOpen }: { item: MenuViewItem; onOpen: (item: MenuViewItem) => void }) {
  return (
    <li id={item.id} className="scroll-mt-40 md:scroll-mt-44">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group -mx-3 block w-[calc(100%+1.5rem)] rounded-2xl px-3 py-4 text-start transition hover:bg-krem-200/50 print:break-inside-avoid"
      >
        <span className="flex items-baseline">
          <span className="font-display text-xl font-medium text-lacivert-800 transition-colors group-hover:text-karamel-700">
            {item.name}
          </span>
          {item.tags.length > 0 && (
            <span className="ms-2 hidden gap-1 sm:inline-flex">
              {item.tags.map((t) => (
                <TagBadge key={t.id} id={t.id} label={t.label} />
              ))}
            </span>
          )}
          <span aria-hidden="true" className="leader" />
          <Prices item={item} />
        </span>
        <span className="mt-1 flex items-center gap-2 text-sm text-lacivert-800/60">
          <span>{item.description}</span>
          <AllergenDots item={item} />
        </span>
      </button>
    </li>
  );
}

export function MenuExplorer({ categories, labels }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [selected, setSelected] = useState<MenuViewItem | null>(null);
  // On phones the search field folds into an icon so the sticky bar stays one row tall.
  const [searchOpen, setSearchOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const chipBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const needle = foldForSearch(query.trim());
  const visible = useMemo(
    () =>
      needle
        ? categories
            .map((c) => ({ ...c, items: c.items.filter((i) => i.search.includes(needle)) }))
            .filter((c) => c.items.length > 0)
        : categories,
    [categories, needle],
  );
  const resultCount = visible.reduce((n, c) => n + c.items.length, 0);

  // Highlight the category currently under the sticky bar.
  useEffect(() => {
    const sections = visible
      .map((c) => document.getElementById(`kategori-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("kategori-", ""));
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [visible]);

  // Keep the active chip centred in the horizontally scrolling bar.
  useEffect(() => {
    const bar = chipBarRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    const barRect = bar.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta = chipRect.left + chipRect.width / 2 - (barRect.left + barRect.width / 2);
    bar.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    if (selected && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [selected]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // While typing deep in the page, bring the (now shorter) results back under the sticky bar.
  const search = (value: string) => {
    setQuery(value);
    const bar = toolbarRef.current;
    const root = bar?.parentElement;
    if (!bar || !root) return;
    const offset = root.getBoundingClientRect().top - parseFloat(getComputedStyle(bar).top);
    if (offset < 0) window.scrollBy({ top: offset, behavior: "instant" });
  };

  const jumpTo = (id: string) => {
    setActive(id);
    document.getElementById(`kategori-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grain bg-krem-100 pb-16 md:pb-24">
      <div
        ref={toolbarRef}
        className="print-hidden sticky top-16 z-30 border-b border-lacivert-800/10 bg-krem-100/90 backdrop-blur-xl md:top-20"
      >
        <div className="container-page flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-5">
          <label className={`relative md:block md:w-80 md:shrink-0 ${searchOpen || query ? "block" : "hidden"}`}>
            <span className="sr-only">{labels.search}</span>
            <Search
              className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-lacivert-800/45"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder={labels.searchPlaceholder}
              enterKeyHint="search"
              className="h-12 w-full rounded-full bg-krem-50 pe-11 ps-11 text-[15px] text-lacivert-800 shadow-[inset_0_0_0_1px_rgba(35,38,74,.1)] outline-none transition placeholder:text-lacivert-800/40 focus:shadow-[inset_0_0_0_2px_var(--color-karamel-400)] [&::-webkit-search-cancel-button]:hidden"
            />
            {(query || searchOpen) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                aria-label={labels.clear}
                className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-lacivert-800/60 hover:bg-lacivert-800/[0.06]"
              >
                <X className="size-4" />
              </button>
            )}
          </label>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {!searchOpen && !query && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={labels.search}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-krem-50 text-lacivert-800 ring-1 ring-lacivert-800/10 md:hidden"
              >
                <Search className="size-[18px]" />
              </button>
            )}
            <nav aria-label={labels.categories} className="relative min-w-0 flex-1">
              <div ref={chipBarRef} className="no-scrollbar -me-4 flex gap-2 overflow-x-auto pe-4 md:me-0 md:pe-0">
                {visible.map((c) => {
                  const isActive = c.id === active;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-chip={c.id}
                      onClick={() => jumpTo(c.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-lacivert-800 text-krem-50"
                          : "bg-krem-50 text-lacivert-800/75 ring-1 ring-lacivert-800/10 hover:text-lacivert-800"
                      }`}
                    >
                      {c.name}
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] tabular-nums ${
                          isActive ? "bg-sari-300 text-lacivert-900" : "bg-lacivert-800/[0.07]"
                        }`}
                      >
                        {c.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
          {needle && (
            <p className="hidden shrink-0 text-sm font-semibold text-lacivert-800/60 md:block" aria-live="polite">
              {resultCount} {labels.results}
            </p>
          )}
        </div>
      </div>

      <div className="container-page">
        {visible.length === 0 && (
          <div className="mx-auto max-w-md py-24 text-center" role="status">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-krem-200 text-karamel-600">
              <SearchX className="size-8" aria-hidden="true" />
            </span>
            <p className="font-display mt-6 text-2xl text-lacivert-800">{labels.noResults}</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-6 rounded-full bg-lacivert-800 px-6 py-3 text-sm font-bold text-krem-50"
            >
              {labels.clear}
            </button>
          </div>
        )}

        {visible.map((category, index) => (
          <section
            key={category.id}
            id={`kategori-${category.id}`}
            aria-labelledby={`baslik-${category.id}`}
            className="scroll-mt-36 border-t border-lacivert-800/10 pt-14 first:border-t-0 md:scroll-mt-40 md:pt-20 print:break-before-auto print:pt-6"
          >
            <header className="mb-8 flex items-end justify-between gap-6 md:mb-10">
              <div>
                <span className="font-brand text-2xl text-karamel-500">{String(index + 1).padStart(2, "0")}</span>
                <h2
                  id={`baslik-${category.id}`}
                  className="font-display mt-1 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-none tracking-[-0.015em] text-lacivert-800"
                >
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-3 max-w-xl text-[17px] text-lacivert-800/65">{category.description}</p>
                )}
              </div>
            </header>

            {category.layout === "cards" ? (
              <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {category.items.map((item) => (
                  <ItemCard key={item.id} item={item} onOpen={setSelected} />
                ))}
              </ul>
            ) : (
              <div className="relative rounded-[2rem] bg-krem-50 p-6 shadow-[0_24px_48px_-36px_rgba(35,38,74,.5)] ring-1 ring-lacivert-800/[0.07] md:p-10 print:p-0 print:shadow-none print:ring-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-dashed border-karamel-300/50 print:hidden"
                />
                <ul className="relative grid gap-x-14 md:grid-cols-2">
                  {category.items.map((item) => (
                    <ItemRow key={item.id} item={item} onOpen={setSelected} />
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          // A click on the dialog element itself (not its content) is a click on the backdrop.
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        aria-labelledby="urun-baslik"
        className="menu-sheet mb-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-[2rem] bg-krem-50 p-0 text-lacivert-800 md:my-auto md:max-w-xl md:rounded-[2rem]"
      >
        {selected && (
          <article>
            <div
              className={`relative overflow-hidden ${selected.photo ? "aspect-[16/10] bg-krem-200" : "h-16 border-b border-lacivert-800/10"}`}
            >
              {selected.photo && (
                <Photo photo={selected.photo} alt={selected.name} sizes="(min-width: 768px) 36rem, 100vw" />
              )}
              <span className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-lacivert-800/15 md:hidden" />
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={labels.close}
                className="absolute end-3 top-3 grid size-11 place-items-center rounded-full bg-krem-50/90 text-lacivert-900 shadow-lg backdrop-blur transition hover:bg-krem-50"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 pb-8 md:p-8">
              {selected.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {selected.tags.map((t) => (
                    <TagBadge key={t.id} id={t.id} label={t.label} />
                  ))}
                </div>
              )}
              <h2 id="urun-baslik" className="font-display text-3xl font-medium leading-tight">
                {selected.name}
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-lacivert-800/75">{selected.description}</p>

              <div className="mt-6 divide-y divide-lacivert-800/10 rounded-2xl bg-krem-100 px-5 ring-1 ring-lacivert-800/[0.06]">
                {selected.prices.map((p) => (
                  <div key={p.label ?? "single"} className="flex items-center justify-between py-3.5">
                    <span className="text-sm font-semibold text-lacivert-800/70">{p.label ?? labels.price}</span>
                    <span className="text-xl font-extrabold tabular-nums text-karamel-700">{p.formatted}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-lacivert-800/55">
                  {labels.contains}
                </h3>
                {selected.allergens.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {selected.allergens.map((a) => {
                      const Icon = allergenIcons[a.id];
                      return (
                        <li
                          key={a.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-karamel-500/10 px-3 py-1.5 text-sm font-semibold text-karamel-700"
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          {a.label}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-lacivert-800/65">{labels.noAllergens}</p>
                )}
              </div>
            </div>
          </article>
        )}
      </dialog>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Search, SearchX, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { fill } from "@/lib/format";
import { filterIcons } from "./icons";
import { ItemLine, lineClass, searchWords } from "./parts";
import { filterIds, type FilterId, type MenuViewCategory, type MenuViewItem } from "./types";

type Labels = {
  title: string;
  placeholder: string;
  clear: string;
  cancel: string;
  filters: string;
  results: string;
  inCategories: string;
  popular: string;
  noResults: string;
  filterNames: Record<FilterId, string>;
};

export type MenuSearchProps = {
  categories: MenuViewCategory[];
  /** Link for each item, keyed by item id. */
  hrefs: Record<string, string>;
  popular: MenuViewItem[];
  homeHref: string;
  labels: Labels;
};

export const isFilter = (v: string): v is FilterId => (filterIds as readonly string[]).includes(v);

/** Keeps the search in the address bar (/ara?q=fıstık&f=sicak), so Back from a dish lands on the same results. */
function remember(query: string, filters: FilterId[]) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filters.length) params.set("f", filters.join(","));
  const search = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
}

export function MenuSearch({
  categories,
  hrefs,
  popular,
  homeHref,
  labels,
  initialQuery = "",
  initialFilters = [],
}: MenuSearchProps & { initialQuery?: string; initialFilters?: FilterId[] }) {
  const [query, setQueryState] = useState(initialQuery);
  const [active, setActiveState] = useState<FilterId[]>(initialFilters);
  const inputRef = useRef<HTMLInputElement>(null);

  const setQuery = (value: string) => {
    setQueryState(value);
    remember(value, active);
  };
  const setActive = (filters: FilterId[]) => {
    setActiveState(filters);
    remember(query, filters);
  };

  const words = useMemo(() => searchWords(query), [query]);
  const searching = words.length > 0 || active.length > 0;
  const groups = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          items: c.items.filter(
            (i) => words.every((w) => i.search.includes(w)) && active.every((f) => i.filters.includes(f)),
          ),
        }))
        .filter((c) => c.items.length > 0),
    [categories, words, active],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const toggle = (id: FilterId) => setActive(active.includes(id) ? active.filter((f) => f !== id) : [...active, id]);

  const reset = () => {
    setQueryState("");
    setActiveState([]);
    remember("", []);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="under-header sticky top-16 z-30 -mx-4 bg-zumrut-925/95 px-4 pb-3 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6 md:top-20">
        <div className="flex items-center gap-2.5">
          <label className="relative flex h-[52px] min-w-0 flex-1 items-center gap-2.5 rounded-[26px] bg-krem-50/10 pe-2 ps-4 shadow-[inset_0_0_0_2px_var(--color-karamel-400)]">
            <Search className="size-[18px] shrink-0 text-fistik-300" aria-hidden="true" />
            <span className="sr-only">{labels.title}</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.placeholder}
              enterKeyHint="search"
              autoComplete="off"
              autoFocus={initialFilters.length === 0}
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-krem-50 outline-none placeholder:font-medium placeholder:text-krem-100/45 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label={labels.clear}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-krem-50/[0.12] text-krem-50"
              >
                <X className="size-3.5" strokeWidth={2.6} />
              </button>
            )}
          </label>
          <Link href={homeHref} className="px-1 py-3 text-sm font-bold text-krem-100/80 hover:text-krem-50">
            {labels.cancel}
          </Link>
        </div>

        <div
          role="group"
          aria-label={labels.filters}
          className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6"
        >
          {filterIds.map((id) => {
            const on = active.includes(id);
            const Icon = filterIcons[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(id)}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors ${
                  on
                    ? "bg-fistik-400 font-extrabold text-zumrut-925"
                    : "bg-krem-50/[0.08] font-bold text-krem-100/85 hover:bg-krem-50/[0.14]"
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {labels.filterNames[id]}
                {on && <X className="size-3" strokeWidth={3} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite">
        {!searching ? (
          <section className="mt-4">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-fistik-300">{labels.popular}</h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {popular.map((item) => (
                <li key={item.id}>
                  <Link href={hrefs[item.id]} className={lineClass}>
                    <ItemLine item={item} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : total === 0 ? (
          <div className="py-16 text-center" role="status">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-krem-50/[0.08] text-fistik-300">
              <SearchX className="size-7" aria-hidden="true" />
            </span>
            <p className="font-display mx-auto mt-5 max-w-xs text-xl text-krem-50">{labels.noResults}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-full bg-fistik-300 px-6 py-3 text-sm font-extrabold text-zumrut-925"
            >
              {labels.clear}
            </button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[13px] text-krem-100/60">
              <strong className="text-krem-50">{fill(labels.results, { n: total })}</strong> ·{" "}
              {fill(labels.inCategories, { n: groups.length })}
            </p>
            {groups.map((group) => (
              <section key={group.id}>
                <h2 className="mb-2 mt-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-fistik-300">
                  {group.name}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link href={hrefs[item.id]} className={lineClass}>
                        <ItemLine item={item} words={words} thumb={group.layout === "cards"} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

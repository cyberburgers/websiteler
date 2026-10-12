import type { ReactNode } from "react";
import { Photo } from "@/components/ui";
import { foldForSearch } from "@/lib/format";
import { allergenIcons } from "./icons";
import type { MenuViewItem } from "./types";

/** Splits a search into words; every word has to match. */
export function searchWords(query: string): string[] {
  return foldForSearch(query).split(/\s+/).filter(Boolean);
}

/** Marks every searched word inside `text`, matching "fistik" against "fıstık" too. */
export function highlight(text: string, words: string[]): ReactNode {
  if (words.length === 0) return text;
  let folded = "";
  const origin: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const ch of foldForSearch(text[i])) {
      folded += ch;
      origin.push(i);
    }
  }
  const marks: [number, number][] = [];
  for (const word of words) {
    for (let at = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + word.length)) {
      marks.push([origin[at], origin[at + word.length - 1] + 1]);
    }
  }
  if (marks.length === 0) return text;
  marks.sort((a, b) => a[0] - b[0]);
  const parts: ReactNode[] = [];
  let from = 0;
  for (const [start, end] of marks) {
    if (end <= from) continue;
    const s = Math.max(start, from);
    parts.push(text.slice(from, s), <mark key={s}>{text.slice(s, end)}</mark>);
    from = end;
  }
  parts.push(text.slice(from));
  return parts;
}

export function AllergenIcons({ item, className = "" }: { item: MenuViewItem; className?: string }) {
  if (item.allergens.length === 0) return null;
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {item.allergens.map((a) => {
        const Icon = allergenIcons[a.id];
        return <Icon key={a.id} className="size-[18px]" strokeWidth={1.8} aria-label={a.label} role="img" />;
      })}
    </span>
  );
}

/** "₺220" or, for items sold in several sizes, the smallest price. */
export function fromPrice(item: MenuViewItem): string {
  return item.prices[0].formatted;
}

/**
 * One compact line of the menu on the green background: thumbnail, name, a line of detail and the price.
 * Used by the search results and the list view of a category.
 */
export function ItemLine({
  item,
  words = [],
  thumb = true,
}: {
  item: MenuViewItem;
  words?: string[];
  thumb?: boolean;
}) {
  const detail =
    item.prices.length > 1
      ? item.prices.map((p) => `${p.label} ${p.formatted}`).join(" · ")
      : item.description;
  return (
    <>
      {thumb && (
        <span className="relative size-[62px] shrink-0 overflow-hidden rounded-[14px] bg-zumrut-800">
          <Photo photo={item.photo} alt="" sizes="62px" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="font-display block text-[17px] font-semibold leading-snug text-krem-50">
          {highlight(item.name, words)}
        </span>
        <span className="mt-0.5 line-clamp-1 text-[12.5px] text-krem-100/60">{highlight(detail, words)}</span>
      </span>
      <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-fistik-300">{fromPrice(item)}</span>
    </>
  );
}

export const lineClass =
  "flex w-full items-center gap-3 rounded-[20px] bg-krem-50/[0.06] p-2 pe-4 text-start transition-colors hover:bg-krem-50/[0.1] active:bg-krem-50/[0.12]";

/**
 * Drinks as one printed menu card: name, dotted leader and price on one line, what it is underneath.
 * Each line opens the dish sheet like a card does.
 */
export function DrinkMenu({ items, onOpen }: { items: MenuViewItem[]; onOpen: (id: string) => void }) {
  return (
    <div className="relative rounded-[30px] bg-krem-100 p-2 text-zumrut-800 shadow-[0_30px_60px_-36px_rgba(0,0,0,.95)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 rounded-[24px] border border-dashed border-karamel-400/40"
      />
      <ul className="relative divide-y divide-zumrut-800/[0.08] px-3 py-2 md:grid md:grid-cols-2 md:gap-x-10 md:divide-y-0">
        {items.map((item) => (
          <li key={item.id} id={item.id} className="md:border-b md:border-zumrut-800/[0.08]">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => onOpen(item.id)}
              className="group -mx-2 block w-[calc(100%+1rem)] rounded-2xl px-2 py-3.5 text-start transition-colors hover:bg-krem-200/60 active:bg-krem-200"
            >
              <span className="flex items-baseline">
                <span className="font-display text-[20px] font-semibold leading-snug text-zumrut-900 transition-colors group-hover:text-karamel-600">
                  {item.name}
                </span>
                {item.prices.length === 1 && (
                  <>
                    <span aria-hidden="true" className="leader" />
                    <span className="text-lg font-extrabold tabular-nums text-karamel-600">{item.prices[0].formatted}</span>
                  </>
                )}
              </span>
              {item.description && (
                <span className="mt-0.5 block text-sm leading-relaxed text-zumrut-800/65">{item.description}</span>
              )}
              {item.prices.length > 1 && (
                <span className="mt-1.5 block space-y-1">
                  {item.prices.map((p) => (
                    <span key={p.label} className="flex items-baseline text-sm">
                      <span className="font-semibold text-zumrut-800/75">{p.label}</span>
                      <span aria-hidden="true" className="leader" />
                      <span className="font-extrabold tabular-nums text-karamel-600">{p.formatted}</span>
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

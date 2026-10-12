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
 * One compact line of the menu on the navy background: thumbnail, name, a line of detail and the price.
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
        <span className="relative size-[62px] shrink-0 overflow-hidden rounded-[14px] bg-lacivert-800">
          <Photo photo={item.photo} alt="" sizes="62px" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="font-display block text-[17px] font-semibold leading-snug text-krem-50">
          {highlight(item.name, words)}
        </span>
        <span className="mt-0.5 line-clamp-1 text-[12.5px] text-krem-100/60">{highlight(detail, words)}</span>
      </span>
      <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-sari-300">{fromPrice(item)}</span>
    </>
  );
}

export const lineClass =
  "flex w-full items-center gap-3 rounded-[20px] bg-krem-50/[0.06] p-2 pe-4 text-start transition-colors hover:bg-krem-50/[0.1] active:bg-krem-50/[0.12]";

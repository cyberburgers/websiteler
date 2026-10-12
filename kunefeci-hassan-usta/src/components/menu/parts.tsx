import type { ReactNode } from "react";
import { AddControl } from "@/components/order/AddControl";
import { Photo } from "@/components/ui";
import { foldForSearch } from "@/lib/format";
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
  soldOutLabel,
  words = [],
  thumb = true,
}: {
  item: MenuViewItem;
  soldOutLabel: string;
  words?: string[];
  thumb?: boolean;
}) {
  const out = item.soldOut;
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
      {out ? (
        <SoldOutPill label={soldOutLabel} />
      ) : (
        <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-fistik-300">{fromPrice(item)}</span>
      )}
    </>
  );
}

export const lineClass =
  "flex w-full items-center gap-3 rounded-[20px] bg-krem-50/[0.06] p-2 pe-4 text-start transition-colors hover:bg-krem-50/[0.1] active:bg-krem-50/[0.12]";

/**
 * A drink on the menu: no photo, but the name and price large and what it is written in full underneath.
 * Several sizes are listed under it, each with its price. At a table, "+ Ekle" sits under the price.
 */
export function DrinkLine({
  item,
  onOpen,
  soldOutLabel,
}: {
  item: MenuViewItem;
  onOpen: () => void;
  soldOutLabel: string;
}) {
  const single = item.prices.length === 1;
  const out = item.soldOut;
  return (
    <div className="flex items-start gap-3 rounded-[22px] bg-krem-50/[0.07] px-5 py-4 ring-1 ring-inset ring-krem-50/[0.06] transition-colors hover:bg-krem-50/[0.11]">
      <button type="button" aria-haspopup="dialog" onClick={onOpen} className="block min-w-0 flex-1 text-start">
        <span className="font-display block text-[21px] font-semibold leading-snug text-krem-50">{item.name}</span>
        {item.description && (
          <span className="mt-1 block text-[14.5px] leading-relaxed text-krem-100/70">{item.description}</span>
        )}
        {!single && (
          <span className="mt-2 block space-y-1">
            {item.prices.map((p) => (
              <span key={p.label} className="flex items-baseline text-sm">
                <span className="font-semibold text-krem-100/75">{p.label}</span>
                <span aria-hidden="true" className="leader opacity-60" />
                <span className="font-extrabold tabular-nums text-fistik-300">{p.formatted}</span>
              </span>
            ))}
          </span>
        )}
      </button>
      <span className="flex shrink-0 flex-col items-end gap-2.5 pt-0.5">
        {out ? (
          <SoldOutPill label={soldOutLabel} />
        ) : (
          single && (
            <span className="text-lg font-extrabold tabular-nums text-fistik-300">{item.prices[0].formatted}</span>
          )
        )}
        <AddControl item={item} onChoose={onOpen} tone="dark" />
      </span>
    </div>
  );
}

/** "Bugün yok" in place of the price, on the green background. */
export function SoldOutPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-krem-50/[0.1] px-2.5 py-1 text-[12px] font-extrabold text-krem-50 ring-1 ring-inset ring-krem-50/15">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-karamel-400" />
      {label}
    </span>
  );
}

/** On a dish's photo, where its tags would be, when it has run out today. */
export function SoldOutBadge({ label }: { label: string }) {
  return (
    <span className="absolute start-3 top-3 inline-flex items-center gap-2 rounded-full bg-zumrut-950/85 px-3.5 py-1.5 text-sm font-extrabold text-krem-50 shadow-[0_8px_20px_-8px_rgba(0,0,0,.6)] backdrop-blur">
      <span aria-hidden="true" className="size-2 rounded-full bg-karamel-400" />
      {label}
    </span>
  );
}
